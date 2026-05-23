/**
 * KKuTu 단어 대량 임포트 스크립트
 * 
 * 소스: acidsound/korean_wordlist (국립국어원 표준국어대사전 기반)
 * 타겟: PostgreSQL kkutu_ko 테이블
 * 
 * kkutu_ko 스키마:
 *   _id  VARCHAR(256) NOT NULL (단어)
 *   type TEXT                   (품사 번호: '1'=명사 등, 'INJEONG'=어인정)
 *   mean TEXT NOT NULL          (뜻풀이)
 *   hit  INTEGER DEFAULT 0
 *   flag INTEGER                (KOR_FLAG: 1=외래어, 2=어인정, 4=띄어쓰기, 8=방언, 16=옛말, 32=문화어)
 *   theme TEXT                  (테마)
 */

const { Pool } = require('pg');
const https = require('https');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

// POS(품사) -> kkutu type 번호 매핑
// 끄투에서 사용하는 type은 국립국어원 품사 분류번호
// 0=대명사, 1=명사, 2=의존명사, 3=동사, 4=형용사, 5=관형사, 6=부사, 7=조사, 8=감탄사, 9=접사 등
// KOR_STRICT = /(^|,)(1|INJEONG)($|,)/ → 명사(1) 또는 INJEONG만 엄격모드에서 허용
const POS_MAP = {
    '명사': '1',
    '대명사': '0',
    '수사': '0',
    '의존명사': '2',
    '동사': '3',
    '형용사': '4',
    '관형사': '5',
    '부사': '6',
    '조사': '7',
    '감탄사': '8',
    '접사': '9',
    '어미': '9',
    '관형사': '5',
};

// 외래어/방언/옛말 키워드 -> flag 값
function detectFlag(rawText) {
    if (!rawText) return 0;
    let flag = 0;
    if (rawText.includes('외래어') || rawText.includes('외국어')) flag |= 1;   // LOANWORD
    if (rawText.includes('방언') || rawText.includes('사투리')) flag |= 8;     // SATURI
    if (rawText.includes('옛말') || rawText.includes('고어')) flag |= 16;      // OLD
    if (rawText.includes('문화어') || rawText.includes('북한어')) flag |= 32;   // MUNHWA
    return flag;
}

function fetchURL(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        }).on('error', reject);
    });
}

async function fetchWordsWithMeaning() {
    const words = new Map(); // word -> { type, mean, flag }

    console.log('[1/3] korean_dictionary1.json 다운로드 중...');
    const data1 = await fetchURL('https://raw.githubusercontent.com/acidsound/korean_wordlist/master/korean_dictionary1.json');
    let count1 = 0;
    for (const line of data1.split(/\r?\n/)) {
        if (!line.trim()) continue;
        const wMatch = line.match(/'word':\s*'([^']+)'/);
        const rMatch = line.match(/'raw':\s*'(.*)'[ \t]*\}/);
        if (!wMatch) continue;
        const word = wMatch[1].trim().replace(/^-+|-+$/g, '');
        if (word.length < 2 || !/^[가-힣]+$/.test(word)) continue;
        const rawText = rMatch ? rMatch[1] : '';
        
        // 품사 추출
        let type = '1'; // 기본 명사
        const posMatch = rawText.match(/\［([^］]+)］/g);
        if (posMatch) {
            for (const p of posMatch) {
                const pos = p.replace(/\[|］|\[/g, '').replace('［', '').replace('］', '');
                if (POS_MAP[pos] !== undefined) {
                    type = POS_MAP[pos];
                    break;
                }
            }
        }
        
        const flag = detectFlag(rawText);
        
        // 뜻풀이 정리 (HTML 태그 제거)
        let mean = rawText
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 200);
        if (!mean) mean = `${word}의 뜻`;
        
        if (!words.has(word)) {
            words.set(word, { type, mean, flag });
            count1++;
        }
    }
    console.log(`   → ${count1}개 추출`);

    console.log('[2/3] korean_dictionary2.json 다운로드 중...');
    const data2 = await fetchURL('https://raw.githubusercontent.com/acidsound/korean_wordlist/master/korean_dictionary2.json');
    let count2 = 0;
    for (const line of data2.split(/\r?\n/)) {
        if (!line.trim()) continue;
        const wMatch = line.match(/'word':\s*'([^']+)'/);
        const rMatch = line.match(/'raw':\s*'(.*)'[ \t]*\}/);
        if (!wMatch) continue;
        const word = wMatch[1].trim().replace(/^-+|-+$/g, '');
        if (word.length < 2 || !/^[가-힣]+$/.test(word)) continue;
        const rawText = rMatch ? rMatch[1] : '';
        
        let type = '1';
        const posMatch = rawText.match(/\［([^］]+)］/g);
        if (posMatch) {
            for (const p of posMatch) {
                const pos = p.replace(/\[|］|\[/g, '').replace('［', '').replace('］', '');
                if (POS_MAP[pos] !== undefined) {
                    type = POS_MAP[pos];
                    break;
                }
            }
        }
        
        const flag = detectFlag(rawText);
        
        let mean = rawText
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 200);
        if (!mean) mean = `${word}의 뜻`;
        
        if (!words.has(word)) {
            words.set(word, { type, mean, flag });
            count2++;
        }
    }
    console.log(`   → ${count2}개 추출`);

    return words;
}

async function main() {
    try {
        // 현재 DB 단어 목록 가져오기
        console.log('[3/3] DB 기존 단어 로드 중...');
        const dbRes = await pool.query('SELECT _id FROM kkutu_ko;');
        const dbWords = new Set(dbRes.rows.map(r => r._id));
        console.log(`   → 기존 ${dbWords.size}개`);

        // 소스에서 단어 가져오기
        const sourceWords = await fetchWordsWithMeaning();
        console.log(`\n소스 단어 총 ${sourceWords.size}개`);

        // 누락 단어 필터링
        const toInsert = [];
        for (const [word, info] of sourceWords) {
            if (!dbWords.has(word)) {
                toInsert.push({ word, ...info });
            }
        }
        console.log(`\n누락 단어: ${toInsert.length}개`);

        if (toInsert.length === 0) {
            console.log('추가할 단어가 없습니다!');
            return;
        }

        // 배치 INSERT (500개씩)
        const BATCH = 500;
        let inserted = 0;
        let errors = 0;
        
        console.log(`\n배치 임포트 시작 (배치 크기: ${BATCH})...`);
        
        for (let i = 0; i < toInsert.length; i += BATCH) {
            const batch = toInsert.slice(i, i + BATCH);
            
            // VALUES 절 생성
            const values = [];
            const params = [];
            let paramIdx = 1;
            
            for (const item of batch) {
                values.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, 0, $${paramIdx++}, NULL)`);
                params.push(item.word, item.type, item.mean, item.flag || 0);
            }
            
            const sql = `
                INSERT INTO kkutu_ko (_id, type, mean, hit, flag, theme)
                VALUES ${values.join(', ')}
                ON CONFLICT (_id) DO NOTHING;
            `;
            
            try {
                const result = await pool.query(sql, params);
                inserted += result.rowCount;
            } catch (err) {
                errors++;
                console.error(`배치 ${Math.floor(i/BATCH)+1} 오류:`, err.message.slice(0, 100));
            }
            
            // 진행률 표시
            const progress = Math.min(i + BATCH, toInsert.length);
            const pct = Math.floor(progress / toInsert.length * 100);
            process.stdout.write(`\r진행: ${progress}/${toInsert.length} (${pct}%) | 삽입됨: ${inserted} | 오류: ${errors}   `);
        }
        
        console.log('\n');
        console.log('='.repeat(50));
        console.log(`✅ 완료!`);
        console.log(`   총 시도: ${toInsert.length}개`);
        console.log(`   삽입 성공: ${inserted}개`);
        console.log(`   오류/중복: ${toInsert.length - inserted}개`);
        console.log(`   배치 오류: ${errors}개`);
        console.log('='.repeat(50));
        
        // 최종 카운트
        const finalRes = await pool.query('SELECT COUNT(*) FROM kkutu_ko;');
        console.log(`\n📊 최종 DB 단어 수: ${finalRes.rows[0].count}개`);

    } catch (err) {
        console.error('치명적 오류:', err);
    } finally {
        await pool.end();
    }
}

main();

/**
 * 나무위키 끄투 긴 단어 목록 크롤링 & 임포트
 * 
 * 끄투 긴 단어(9글자 이상)와 특화 단어들을 나무위키에서 파싱해서 가져옵니다.
 * 나무위키 raw 텍스트 API를 사용합니다.
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

function fetchURL(url, redirects = 0) {
    return new Promise((resolve, reject) => {
        if (redirects > 5) return reject(new Error('Too many redirects'));
        
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/plain, */*'
            }
        };
        
        https.get(url, options, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return resolve(fetchURL(res.headers.location, redirects + 1));
            }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        }).on('error', reject);
    });
}

// 나무위키 raw 페이지에서 단어 추출
async function fetchNamuWords(pageTitle) {
    const encoded = encodeURIComponent(pageTitle);
    const url = `https://namu.wiki/raw/${encoded}`;
    console.log(`  URL: ${url}`);
    
    try {
        const raw = await fetchURL(url);
        const words = new Set();
        
        // 나무위키 문법에서 단어 추출
        // || 단어 || 설명 || 형태의 테이블
        const tableRegex = /\|\|\s*([가-힣]+)\s*\|\|/g;
        let m;
        while ((m = tableRegex.exec(raw)) !== null) {
            const word = m[1].trim();
            if (word.length >= 2 && /^[가-힣]+$/.test(word)) {
                words.add(word);
            }
        }
        
        // * 단어 형태의 목록
        const listRegex = /^\s*\*+\s*([가-힣]{2,})/gm;
        while ((m = listRegex.exec(raw)) !== null) {
            const word = m[1].trim();
            if (word.length >= 2 && /^[가-힣]+$/.test(word)) {
                words.add(word);
            }
        }
        
        console.log(`  → ${words.size}개 단어 추출`);
        return Array.from(words);
    } catch (err) {
        console.error(`  ❌ 오류: ${err.message}`);
        return [];
    }
}

// 끄투 나무위키 관련 페이지들
const NAMU_PAGES = [
    '끄투/이전 버전/한국어/긴 단어',
    '끄투/이전 버전/한국어/공격 및 방어 단어',
    '끄투/이전 버전/한국어',
];

async function main() {
    try {
        // 현재 DB 단어 목록
        console.log('DB 기존 단어 로드 중...');
        const dbRes = await pool.query('SELECT _id FROM kkutu_ko;');
        const dbWords = new Set(dbRes.rows.map(r => r._id));
        console.log(`기존 DB: ${dbWords.size}개\n`);
        
        const allWords = new Set();
        
        for (const page of NAMU_PAGES) {
            console.log(`[나무위키] ${page}`);
            const words = await fetchNamuWords(page);
            words.forEach(w => allWords.add(w));
            // 요청 간격 두기
            await new Promise(r => setTimeout(r, 1000));
        }
        
        console.log(`\n총 수집 단어: ${allWords.size}개`);
        
        const toInsert = Array.from(allWords).filter(w => !dbWords.has(w));
        console.log(`누락 단어: ${toInsert.length}개`);
        
        if (toInsert.length === 0) {
            console.log('추가할 단어 없음');
            return;
        }
        
        console.log('예시:', toInsert.slice(0, 20).join(', '));
        
        // 배치 INSERT
        let inserted = 0;
        const BATCH = 100;
        for (let i = 0; i < toInsert.length; i += BATCH) {
            const batch = toInsert.slice(i, i + BATCH);
            const values = [];
            const params = [];
            let idx = 1;
            
            for (const word of batch) {
                values.push(`($${idx++}, $${idx++}, $${idx++}, 0, $${idx++}, NULL)`);
                params.push(word, '1', `${word}의 뜻`, 0);
            }
            
            const result = await pool.query(
                `INSERT INTO kkutu_ko (_id, type, mean, hit, flag, theme)
                 VALUES ${values.join(', ')}
                 ON CONFLICT (_id) DO NOTHING;`,
                params
            );
            inserted += result.rowCount;
        }
        
        const finalRes = await pool.query('SELECT COUNT(*) FROM kkutu_ko;');
        console.log(`\n✅ ${inserted}개 추가 완료`);
        console.log(`📊 최종 DB: ${finalRes.rows[0].count}개`);
        
    } catch (err) {
        console.error('오류:', err);
    } finally {
        await pool.end();
    }
}

main();

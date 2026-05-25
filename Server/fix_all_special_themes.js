const { Pool } = require('pg');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

const THEMATIC_DEFINITIONS = [
    {
        theme: 'RAG',
        desc: '대한민국의 인기 라면 및 과자 제품. 대중적으로 사랑받는 맛있는 제과/제면류 브랜드 상품입니다.'
    },
    {
        theme: 'POK',
        desc: '닌텐도 \'포켓몬스터\' 시리즈에 등장하는 포켓몬, 캐릭터 및 관련 인게임 세계관 요소.'
    },
    {
        theme: 'MAP',
        desc: '넥슨의 인기 RPG 게임 \'메이플스토리\'에 등장하는 몬스터, 지역, 장비 및 인게임 요소.'
    },
    {
        theme: 'OVW',
        desc: '블리자드의 FPS 게임 \'오버워치\'에 등장하는 영웅, 전장 및 관련 게임 용어.'
    },
    {
        theme: 'STA',
        desc: '블리자드의 전략 시뮬레이션 게임 \'스타크래프트\' 시리즈에 등장하는 유닛, 건물 및 관련 게임 용어.'
    },
    {
        theme: 'HSS',
        desc: '블리자드의 카드 게임 \'하스스톤\'에 등장하는 카드, 영웅 능력 및 인게임 요소.'
    },
    {
        theme: 'DGM',
        desc: '인기 프랜차이즈 \'디지몬\' 시리즈에 등장하는 디지털 몬스터(디지몬) 캐릭터.'
    },
    {
        theme: 'ZEL',
        desc: '닌텐도 \'젤다의 전설\' 시리즈에 등장하는 캐릭터, 아이템, 지역 및 인게임 요소.'
    },
    {
        theme: 'CYP',
        desc: '네오플의 액션 AOS 게임 \'사이퍼즈\'에 등장하는 캐릭터, 능력자 및 게임 관련 용어.'
    },
    {
        theme: 'NEX',
        desc: '국내외 인기 온라인 게임의 제목 또는 게임 관련 대중적인 전문 용어.'
    },
    {
        theme: 'WOW',
        desc: '블리자드의 MMORPG 게임 \'월드 오브 워크래프트\'에 등장하는 던전, 캐릭터 및 인게임 세계관 요소.'
    }
];

async function main() {
    try {
        console.log('대중적 게임/음식 11개 스페셜 테마 뜻풀이 대대적 최적화 시작...');
        let totalUpdated = 0;
        
        for (const tDef of THEMATIC_DEFINITIONS) {
            // Update words in kkutu_ko that have this theme AND currently have generic descriptions
            const result = await pool.query(
                `UPDATE kkutu_ko 
                 SET mean = $1 
                 WHERE theme LIKE $2 AND (
                     mean LIKE '[표준명사]%' OR 
                     mean LIKE '[명사]%' OR 
                     mean LIKE '[동사]%' OR 
                     mean = '＂1＂［1］（1）' OR 
                     mean = '＂1＂'
                 );`,
                [tDef.desc, `%${tDef.theme}%`]
            );
            totalUpdated += result.rowCount;
            console.log(`  ✅ 테마 '${tDef.theme}' 적용 완료 (${result.rowCount}개 단어 뜻풀이 변경)`);
        }
        
        console.log(`\n📊 스페셜 테마 뜻풀이 최적화 완료! 총 ${totalUpdated}개 단어의 뜻이 아름답게 변경되었습니다.`);
        
        // Final verification check for 열무비빔면 and 피카츄
        const verifyNoodle = await pool.query(`SELECT _id, mean FROM kkutu_ko WHERE _id = '열무비빔면';`);
        console.log('\n🔍 [검증] 열무비빔면:', verifyNoodle.rows[0]);
        
        const verifyPikachu = await pool.query(`SELECT _id, mean FROM kkutu_ko WHERE _id = '피카츄';`);
        console.log('🔍 [검증] 피카츄:', verifyPikachu.rows[0]);
        
    } catch (err) {
        console.error('❌ 업데이트 중 에러 발생:', err);
    } finally {
        await pool.end();
    }
}

main();

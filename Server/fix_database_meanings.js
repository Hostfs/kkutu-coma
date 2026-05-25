const { Pool } = require('pg');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

const CORRECTIONS = [
    {
        theme: '190',
        oldMean: '(교통 관련 어휘) 도로, 수송 수단, 대중교통 인프라 및 물류 운송 시스템과 연관된 전문 용어입니다.',
        newMean: '(동물 관련 어휘) 조류, 포유류, 곤충 및 해양 생물 등 동물계에 속하는 생명체를 나타내는 어휘입니다.'
    },
    {
        theme: '290',
        oldMean: '(교통 관련 어휘) 도로, 수송 수단, 대중교통 인프라 및 물류 운송 시스템과 연관된 전문 용어입니다.',
        newMean: '(약학 관련 어휘) 약물의 제조, 효능, 성분 분석 및 처방 등 보건 의약학적 전문 분야와 관련된 어휘입니다.'
    },
    {
        theme: '390',
        oldMean: '(교통 관련 어휘) 도로, 수송 수단, 대중교통 인프라 및 물류 운송 시스템과 연관된 전문 용어입니다.',
        newMean: '(전기 관련 어휘) 전류, 회로, 발전 및 전자기학 등 전기와 전자기적 에너지 공학 분야의 전문 어휘입니다.'
    },
    {
        theme: '490',
        oldMean: '(교통 관련 어휘) 도로, 수송 수단, 대중교통 인프라 및 물류 운송 시스템과 연관된 전문 용어입니다.',
        newMean: '(컴퓨터 관련 어휘) 하드웨어, 소프트웨어, 네트워크, 프로그래밍 언어 및 IT 정보 기술과 관련된 전문 어휘입니다.'
    },
    {
        theme: '180',
        oldMean: '(교육 관련 어휘) 학업, 가르침, 학교 시스템 및 아동/청소년 학습 이론 등 교육 분야의 어휘입니다.',
        newMean: '(민속 관련 어휘) 전통 풍속, 민간 신앙, 전통 축제 및 민속 예술 등 특정 겨레의 고유한 전통 문화 어휘입니다.'
    },
    {
        theme: '280',
        oldMean: '(교육 관련 어휘) 학업, 가르침, 학교 시스템 및 아동/청소년 학습 이론 등 교육 분야의 어휘입니다.',
        newMean: '(심리 관련 어휘) 인간의 마음, 행동 분석, 인지 과정 및 정신 건강 등 심리학적 연구와 관련된 어휘입니다.'
    },
    {
        theme: '380',
        oldMean: '(교육 관련 어휘) 학업, 가르침, 학교 시스템 및 아동/청소년 학습 이론 등 교육 분야의 어휘입니다.',
        newMean: '(인명 어휘) 실존 인물, 역사적 인물, 신화 속 인물 등의 이름이나 호칭을 나타내는 인명 어휘입니다.'
    },
    {
        theme: '480',
        oldMean: '(교육 관련 어휘) 학업, 가르침, 학교 시스템 및 아동/청소년 학습 이론 등 교육 분야 of 어휘입니다.',
        newMean: '(통신 관련 어휘) 정보의 송수신, 전파 공학, 유무선 네트워킹 및 미디어 매체와 관련된 기술 어휘입니다.'
    },
    {
        theme: '160',
        oldMean: '(공업 관련 어휘) 제조업, 생산 공정, 산업 기술 및 원자재 처리 공학 등 산업 기술 분야의 어휘입니다.',
        newMean: '(물리 관련 어휘) 물질, 에너지, 힘과 운동, 시공간의 법칙 등 물리학적 현상과 원리를 연구하는 학술 어휘입니다.'
    },
    {
        theme: '260',
        oldMean: '(공업 관련 어휘) 제조업, 생산 공정, 산업 기술 및 원자재 처리 공학 등 산업 기술 분야의 어휘입니다.',
        newMean: '(수공예 어휘) 도자기, 가구, 섬유 공예 등 수작업으로 물건을 정밀하게 제작하는 공예 기술 관련 어휘입니다.'
    },
    {
        theme: '360',
        oldMean: '(공업 관련 어휘) 제조업, 생산 공정, 산업 기술 및 원자재 처리 공학 등 산업 기술 분야의 어휘입니다.',
        newMean: '(음악 관련 어휘) 악기, 악곡, 작곡가, 음악 장르 및 연주 기법 등 음악 분야의 전문 어휘입니다.'
    },
    {
        theme: '460',
        oldMean: '(공업 관련 어휘) 제조업, 생산 공정, 산업 기술 및 원자재 처리 공학 등 산업 기술 분야의 어휘입니다.',
        newMean: '(철학 관련 어휘) 존재론, 인식론, 윤리학 및 역사적 사상 등 인간의 생각과 근원적 진리를 탐구하는 철학적 용어입니다.'
    }
];

const POPULAR_CHAMPS_KO = {
    '누누': '리그 오브 레전드(LoL)의 인기 챔피언. 설인 윌럼프와 함께 모험을 떠나는 소년으로, 거대한 눈구를 굴리며 아군을 지원하고 전장을 통제하는 탱커형 정글러 캐릭터입니다.',
    '가렌': '리그 오브 레전드(LoL)의 대표적인 전사 챔피언. 데마시아의 힘을 상징하며, 강력한 회전 공격과 단단한 방어력으로 적진을 무너뜨리는 초심자 친화형 캐릭터입니다.',
    '아리': '리그 오브 레전드(LoL)의 매혹적인 마법사 챔피언. 구미호를 모티브로 한 캐릭터로, 현혹 기술과 뛰어난 기동성(혼령 질주)을 바탕으로 적을 순식간에 제압하는 미드 라이너입니다.',
    '티모': '리그 오브 레전드(LoL)의 밴들 시티 출신 정찰병 챔피언. 은신 능력과 독침, 지도 곳곳에 설치해 둔 버섯 폭탄으로 적들에게 극심한 고통을 안기는 요들 캐릭터입니다.',
    '이즈리얼': '리그 오브 레전드(LoL)의 대표적인 원거리 딜러 챔피언. 고대 슈리마의 건틀릿 유물을 이용해 신비로운 비전 에너지를 쏘며 적을 처치하는 매력적인 탐험가 캐릭터입니다.',
    '야스오': '리그 오브 레전드(LoL)의 바람의 검술사 챔피언. 화려한 검풍 돌진, 투사체를 무력화하는 바람 장막 기술로 극적인 플레이를 연출하는 대중적 인기의 중단 공격형 전사입니다.',
    '룰루': '리그 오브 레전드(LoL)의 요들 마법사 서포터 챔피언. 요정 친구 픽스와 함께 다니며, 아군을 거대화시켜 생존력을 높이고 적을 아기자기한 동물로 변이시켜 무력화시킵니다.',
    '제드': '리그 오브 레전드(LoL)의 그림자 비급을 다루는 암살자 챔피언. 자신의 그림자와 수시로 위치를 교환하며 단숨에 적의 심장부로 침투해 암살하는 상급자용 물리 캐릭터입니다.',
    '리신': '리그 오브 레전드(LoL)의 앞이 보이지 않는 정글 격투가 챔피언. 화려한 와드 방호 도주와 전 방위 아군 구원, 적을 차서 밀쳐내는 용의 분노 기술로 정글을 종횡무진 지배합니다.',
    '럭스': '리그 오브 레전드(LoL)의 데마시아 출신 빛의 마법사 챔피언. 적을 빛으로 속박하고 아군에게 아방타르한 방어막을 씌워주며, 초장거리에서 거대한 광선을 발사해 일격을 날립니다.',
    '바이': '리그 오브 레전드(LoL)의 필트오버 보안관 챔피언. 마법공학 건틀릿을 착용한 상태로 가공할 펀치를 날려 전방의 모든 방어막을 박살 내고 특정 대상을 확실하게 찍어 누릅니다.',
    '징크스': '리그 오브 레전드(LoL)의 자운 출신 무법자 챔피언. 개틀링건 휘파람과 로켓 런처 빵빵이를 번갈아 난사하며 화끈하게 적을 파괴하는 하이퍼 액티브 원거리 물리 딜러입니다.'
};

const POPULAR_ITEMS_KO = {
    '몰락한왕의검': '리그 오브 레전드(LoL)의 상징적인 근접 공격수 전설급 아이템. 적의 현재 체력에 비례한 가혹한 물리 피해를 주고, 3회 타격 시 이동 속도를 훔쳐 기동력을 극대화합니다.',
    '무한의대검': '리그 오브 레전드(LoL)의 가장 강력한 물리 공격형 전설급 아이템. 공격력과 치명타 확률을 크게 증가시켜 주며, 치명타 발동 시 피해량을 극한으로 폭증시켜 줍니다.',
    '란두인의예언': '리그 오브 레전드(LoL)의 강력한 탱커 전설급 장비. 높은 체력과 방어력을 보장하며, 치명타 피해를 상쇄하고 사용 시 광역으로 적들의 이동 속도를 대폭 감쇄시킵니다.',
    '루덴의메아리': '리그 오브 레전드(LoL)의 마법사 전용 전설급 아이템. 주문력과 마나를 대량 제공하며, 마법 스킬을 맞출 시 메아리 파동을 일으켜 주변 다수의 적에게 추가 폭발 피해를 줍니다.',
    '삼위일체': '리그 오브 레전드(LoL)의 다목적 종합 선물 세트형 전설급 아이템. 스킬 사용 직후 평타를 200% 증폭하는 주문검 효과와 함께 공격 속도, 공격력, 체력을 다채롭게 강화합니다.'
};

const CHAMPIONS_KO = new Set([
    '레오나', '스카너', '아칼리', '렉사이', '렝가', '쉬바나', '초가스', '일라오이', '블라디미르', 
    '카타리나', '하이머딩거', '가렌', '말파이트', '코그모', '타릭', '다이애나', '벨코즈', 
    '아무무', '애니비아', '아트록스', '탐켄치', '트런들', '피즈', '제라스', '클레드', 
    '아이번', '미스포츈', '탈론', '요릭', '피오라', '직스', '카밀', '판테온', '오공', 
    '브랜드', '라이즈', '카르마', '징크스', '니달리', '모데카이저', '신짜오', '레넥톤', 
    '소나', '잔나', '에코', '모르가나', '트린다미어', '신지드', '카시오페아', '리산드라', 
    '잭스', '퀸', '나서스', '오리아나', '케이틀린', '녹턴', '그라가스', '나미', '누누', 
    '룰루', '바드', '바루스', '베이가', '베인', '빅토르', '뽀삐', '세주아니', '소라카', 
    '쉔', '쉬바나', '스카너', '시비르', '신드라', '아리', '애니', '애쉬', '야스오', 
    '엘리스', '우디르', '우르곳', '워윅', '이렐리아', '이브린', '이즈리얼', '자크', 
    '제드', '제이스', '조이', '진', '질리언', '티모', '헤카림', '갱플랭크', '그레이브즈', 
    '럼블', '루시안', '트위스티드페이트', '트위치', '피들스틱', '킨드레드', '아우렐리온솔', 
    '드레이븐', '칼리스타', '카사딘', '럭스', '바이', '갈리오', '나르', '노틸러스', 
    '다리우스', '르블랑', '리븐', '리신', '마스터이', '마오카이', '말자하', '볼리베어', 
    '브라움', '블리츠크랭크', '사이온', '샤코', '스웨인', '쓰레쉬', '아지르', '알리스타', 
    '올라프', '이블린', '자르반4세', '자이라', '카서스', '카직스', '케넨', '케일', 
    '코르키', '탈리야', '트리스타나', '문도박사'
]);

async function main() {
    try {
        console.log('[1/4] 잘못 이어진 12개 테마 설명 수정 작업 시작...');
        let themeFixed = 0;
        for (const corr of CORRECTIONS) {
            const query = `
                UPDATE kkutu_ko 
                SET mean = $1 
                WHERE theme LIKE $2 AND (mean = $3 OR mean = $4);
            `;
            const param = [`%${corr.theme}%`, corr.oldMean, corr.oldMean.replace('of 어휘', '의 어휘')];
            const result = await pool.query(
                `UPDATE kkutu_ko SET mean = $1 WHERE theme LIKE $2 AND (mean = $3 OR mean = $4 OR mean = $5);`,
                [corr.newMean, `%${corr.theme}%`, corr.oldMean, corr.oldMean.replace('of 어휘', '의 어휘'), corr.oldMean.replace(' 등 교육 분야 of 어휘', ' 등 교육 분야의 어휘')]
            );
            themeFixed += result.rowCount;
            console.log(`  ✅ 테마 '${corr.theme}' 수정 완료 (${result.rowCount}개 단어)`);
        }
        console.log(`📊 테마 정렬 수정 총 ${themeFixed}개 완료`);

        console.log('\n[2/4] 한국어 리그 오브 레전드(LOL) 챔피언 및 아이템 설명 업데이트 및 어인정(INJEONG) 등록 중...');
        // 1. Get all words with theme LOL
        const lolKoRes = await pool.query(`SELECT _id, type, theme FROM kkutu_ko WHERE theme LIKE '%LOL%';`);
        let koChampUpdated = 0;
        let koItemUpdated = 0;
        let koOtherUpdated = 0;
        
        for (const row of lolKoRes.rows) {
            const word = row._id;
            let type = row.type;
            let flag = 2; // Default flag 2 for accepted words
            let mean = '';
            
            if (CHAMPIONS_KO.has(word)) {
                // League of Legends champion
                mean = POPULAR_CHAMPS_KO[word] || `리그 오브 레전드(LoL)의 대표 챔피언. 전장에서 강력한 고유 기술과 영리한 기동성으로 전투를 지배하는 끄투 공식 어인정(INJEONG) 캐릭터입니다.`;
                // Ensure it is registered as INJEONG
                if (!type.includes('INJEONG')) {
                    type = type ? `${type},INJEONG` : 'INJEONG';
                }
                koChampUpdated++;
            } else if (POPULAR_ITEMS_KO[word] || anyItemSuffix(word)) {
                // Item
                mean = POPULAR_ITEMS_KO[word] || `리그 오브 레전드(LoL)의 인게임 아이템. 소환사의 협곡 상점에서 골드를 지불하고 구매하여 챔피언의 스펙을 크게 높여주는 장비입니다.`;
                koItemUpdated++;
            } else {
                // Other lore terms
                if (word === '리그오브레전드') {
                    mean = '라이엇 게임즈에서 개발 및 서비스 중인 전 세계 최고의 인기 MOBA 장르 온라인 협곡 대전 게임.';
                } else if (['데마시아', '녹서스', '아이오니아', '프렐요드', '필트오버', '자운', '빌지워터', '그림자군도', '타곤산', '슈리마', '공허', '밴들시티'].includes(word)) {
                    mean = `리그 오브 레전드 세계관의 ${word} 지역. 해당 진영 소속 챔피언들의 출신지이자 독자적인 역사 배경을 지닌 거점입니다.`;
                } else {
                    mean = `리그 오브 레전드(LoL) 관련 용어. 소환사의 협곡 게임 진행 도중 사용되거나 활성화되는 고유 게임 요소입니다.`;
                }
                koOtherUpdated++;
            }
            
            await pool.query(
                `UPDATE kkutu_ko SET type = $1, flag = $2, mean = $3 WHERE _id = $4;`,
                [type, flag, mean, word]
            );
        }
        console.log(`📊 한국어 LOL 수정 완료 (챔피언: ${koChampUpdated}개 [어인정 등록 완료] | 아이템: ${koItemUpdated}개 | 기타: ${koOtherUpdated}개)`);

        console.log('\n[3/4] 영어 리그 오브 레전드(LOL) 챔피언 및 아이템 설명 업데이트 중...');
        const lolEnRes = await pool.query(`SELECT _id, type FROM kkutu_en WHERE theme LIKE '%LOL%';`);
        let enUpdated = 0;
        
        for (const row of lolEnRes.rows) {
            const word = row._id;
            const w_lower = word.lower ? word.lower() : word.toLowerCase();
            let mean = '';
            
            if (w_lower === 'leagueoflegends') {
                mean = 'Popular multiplayer online battle arena (MOBA) video game developed and published by Riot Games.';
            } else {
                mean = `League of Legends (LoL) Champion: ${word.charAt(0).toUpperCase() + word.slice(1)}. A playable legendary hero with unique battlefield abilities.`;
            }
            
            await pool.query(
                `UPDATE kkutu_en SET mean = $1 WHERE _id = $2;`,
                [mean, word]
            );
            enUpdated++;
        }
        console.log(`📊 영어 LOL 수정 완료 (${enUpdated}개 단어)`);

        console.log('\n[4/4] 데이터베이스 연결 테스트 및 최종 점검...');
        const testNunu = await pool.query(`SELECT _id, type, flag, mean, theme FROM kkutu_ko WHERE _id = '누누';`);
        console.log('  🔍 [검증] 누누:', testNunu.rows[0]);
        
        const testFly = await pool.query(`SELECT _id, type, flag, mean, theme FROM kkutu_ko WHERE _id = '애기노랑파리';`);
        console.log('  🔍 [검증] 애기노랑파리:', testFly.rows[0]);
        
    } catch (err) {
        console.error('❌ 데이터베이스 업데이트 중 오류:', err);
    } finally {
        await pool.end();
        console.log('\n🎉 모든 작업 완료!');
    }
}

function anyItemSuffix(word) {
    const item_suffixes = ['검', '갑옷', '지팡이', '망토', '의자', '포', '물약', '깃발', '선지자', '보주', '도전', '예언', '향로', '장막', '신발', '군화', '방패', '우상', '가면', '인사', '모자', '고통', '사브르', '성배', '고서', '전령', '의지', '이빨', '망치', '영약', '학살자', '히드라', '곡궁', '낫', '뿔피리', '눈', '보호구', '장갑', '홀', '석', '인장', '개조', '도가니', '구슬', '펜던트', '시미터', '발걸음', '와드', '속삭임', '피바라기', '아귀', '반지', '수정', '파편', '티아맷'];
    return item_suffixes.some(s => word.endsWith(s) || word.includes(s));
}

main();

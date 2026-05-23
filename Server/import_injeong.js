/**
 * 끄투 특화 단어 추가 임포트
 * 
 * 끄투 게임에서 인정되는 어인정(INJEONG) 단어들을 직접 추가합니다.
 * - 게임 관련 단어, 인터넷 용어, 고유명사 등
 * - flag = 2 (INJEONG), type = 'INJEONG'
 * 
 * 또한 방언/옛말 등 flag가 설정된 단어들도 추가합니다.
 */

const { Pool } = require('pg');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

// 끄투 관련 어인정 단어 목록 (게임에서 자주 쓰이는 인터넷/신조어/게임 용어)
// 이 단어들은 type='INJEONG', flag=2 (어인정 플래그)로 등록
const INJEONG_WORDS = [
    // 게임/인터넷 용어
    { _id: '끄투', mean: '인터넷 끝말잇기 게임', flag: 2 },
    { _id: '끄투온라인', mean: '인터넷 끝말잇기 게임', flag: 2 },
    { _id: '넥슨', mean: '게임회사', flag: 2 },
    { _id: '카카오', mean: '국내 IT 기업', flag: 2 },
    { _id: '네이버', mean: '국내 포털 사이트', flag: 2 },
    { _id: '라이엇', mean: '게임회사 라이엇 게임즈', flag: 2 },
    { _id: '롤', mean: '리그 오브 레전드 약칭', flag: 2 },
    { _id: '배그', mean: '배틀그라운드 약칭', flag: 2 },
    { _id: '오버워치', mean: '블리자드 FPS 게임', flag: 2 },
    { _id: '마크', mean: '마인크래프트 약칭', flag: 2 },
    { _id: '마인크래프트', mean: '모장 스튜디오의 샌드박스 게임', flag: 2 },
    { _id: '포켓몬', mean: '닌텐도 포켓몬스터 시리즈', flag: 2 },
    { _id: '디스코드', mean: '음성 채팅 플랫폼', flag: 2 },
    { _id: '유튜브', mean: '동영상 공유 플랫폼', flag: 2 },
    { _id: '인스타그램', mean: '사진 공유 SNS 플랫폼', flag: 2 },
    { _id: '트위터', mean: 'SNS 플랫폼', flag: 2 },
    { _id: '페이스북', mean: 'SNS 플랫폼', flag: 2 },
    { _id: '틱톡', mean: '숏폼 동영상 플랫폼', flag: 2 },
    { _id: '카톡', mean: '카카오톡 약칭', flag: 2 },
    { _id: '카카오톡', mean: '모바일 메신저', flag: 2 },
    { _id: '라이브', mean: '실시간 방송', flag: 2 },
    { _id: '아이폰', mean: '애플의 스마트폰', flag: 2 },
    { _id: '안드로이드', mean: '구글의 모바일 운영체제', flag: 2 },
    { _id: '아이패드', mean: '애플의 태블릿 컴퓨터', flag: 2 },
    { _id: '맥북', mean: '애플의 노트북', flag: 2 },
    { _id: '갤럭시', mean: '삼성의 스마트폰 시리즈', flag: 2 },
    { _id: '갤노트', mean: '삼성 갤럭시 노트 약칭', flag: 2 },
    { _id: '에어팟', mean: '애플의 무선 이어폰', flag: 2 },
    { _id: '아마존', mean: '미국 전자상거래 기업', flag: 2 },
    { _id: '구글', mean: '미국 IT 기업', flag: 2 },
    { _id: '스타크래프트', mean: '블리자드의 전략 시뮬레이션 게임', flag: 2 },
    { _id: '스타2', mean: '스타크래프트2 약칭', flag: 2 },
    { _id: '워크래프트', mean: '블리자드의 전략 게임', flag: 2 },
    { _id: '디아블로', mean: '블리자드의 액션 RPG 게임', flag: 2 },
    { _id: '하스스톤', mean: '블리자드의 카드 게임', flag: 2 },
    { _id: '발로란트', mean: '라이엇의 FPS 게임', flag: 2 },
    { _id: '에이펙스', mean: '에이펙스 레전드 약칭', flag: 2 },
    { _id: '포트나이트', mean: '에픽게임즈의 배틀로얄 게임', flag: 2 },
    { _id: '마블', mean: '마블 코믹스 및 마블 시네마틱 유니버스', flag: 2 },
    { _id: '아이언맨', mean: '마블 슈퍼히어로', flag: 2 },
    { _id: '어벤져스', mean: '마블 슈퍼히어로 팀', flag: 2 },
    { _id: '스파이더맨', mean: '마블 슈퍼히어로', flag: 2 },
    { _id: '배트맨', mean: 'DC 슈퍼히어로', flag: 2 },
    { _id: '슈퍼맨', mean: 'DC 슈퍼히어로', flag: 2 },
    { _id: '원피스', mean: '일본 만화', flag: 2 },
    { _id: '나루토', mean: '일본 만화', flag: 2 },
    { _id: '드래곤볼', mean: '일본 만화', flag: 2 },
    { _id: '귀멸의칼날', mean: '일본 만화', flag: 2 },
    { _id: '진격의거인', mean: '일본 만화', flag: 2 },
    { _id: '주술회전', mean: '일본 만화', flag: 2 },
    { _id: '블리치', mean: '일본 만화', flag: 2 },
    { _id: '헌터헌터', mean: '일본 만화', flag: 2 },
    { _id: '짱구', mean: '일본 만화 크레용 신짱', flag: 2 },
    { _id: '도라에몽', mean: '일본 만화', flag: 2 },
    { _id: '코난', mean: '일본 만화 명탐정 코난', flag: 2 },
    { _id: '짱구는못말려', mean: '일본 만화', flag: 2 },
    { _id: '보스베이비', mean: '드림웍스 애니메이션', flag: 2 },
    { _id: '겨울왕국', mean: '디즈니 애니메이션', flag: 2 },
    { _id: '토이스토리', mean: '픽사 애니메이션', flag: 2 },
    { _id: '라푼젤', mean: '디즈니 애니메이션', flag: 2 },
    { _id: '모아나', mean: '디즈니 애니메이션', flag: 2 },
    { _id: '쿵푸팬더', mean: '드림웍스 애니메이션', flag: 2 },
    { _id: '슈렉', mean: '드림웍스 애니메이션', flag: 2 },
    // 인터넷 신조어
    { _id: '갓생', mean: '신조어: 대단하고 열심히 사는 삶', flag: 2 },
    { _id: '킹받다', mean: '신조어: 매우 화가 난다', flag: 2 },
    { _id: '갓성비', mean: '신조어: 매우 뛰어난 가성비', flag: 2 },
    { _id: '레전드', mean: '신조어: 전설적인 것', flag: 2 },
    { _id: '꿀잼', mean: '신조어: 매우 재미있음', flag: 2 },
    { _id: '노잼', mean: '신조어: 재미없음', flag: 2 },
    { _id: '개꿀', mean: '신조어: 매우 좋은 상황', flag: 2 },
    { _id: '대박', mean: '신조어: 매우 좋거나 놀라운 것', flag: 2 },
    { _id: '쩔다', mean: '신조어: 매우 대단하다', flag: 2 },
    { _id: '극혐', mean: '신조어: 극도로 혐오스러움', flag: 2 },
    { _id: '존잘', mean: '신조어: 매우 잘생김', flag: 2 },
    { _id: '존예', mean: '신조어: 매우 예쁨', flag: 2 },
    { _id: '퀄리티', mean: '영어 quality: 품질', flag: 2 },
    { _id: '컨텐츠', mean: '영어 contents: 콘텐츠', flag: 2 },
    { _id: '스트리머', mean: '인터넷 방송인', flag: 2 },
    { _id: '유튜버', mean: '유튜브 크리에이터', flag: 2 },
    { _id: '인플루언서', mean: '소셜 미디어 영향력자', flag: 2 },
    { _id: '브이로그', mean: '영상 일기', flag: 2 },
    { _id: '먹방', mean: '먹는 방송', flag: 2 },
    { _id: '쿡방', mean: '요리 방송', flag: 2 },
    // 음식 관련
    { _id: '아이스아메리카노', mean: '얼음을 넣은 아메리카노 커피', flag: 2 },
    { _id: '달고나커피', mean: '설탕과 커피를 섞어 만든 커피', flag: 2 },
    { _id: '마라탕', mean: '중국식 매운 탕', flag: 2 },
    { _id: '탕후루', mean: '중국 과일 사탕', flag: 2 },
    { _id: '치킨', mean: '닭고기 요리', flag: 2 },
    { _id: '피자', mean: '이탈리아식 빵 요리', flag: 2 },
    { _id: '버거', mean: '햄버거의 줄임말', flag: 2 },
    { _id: '타코야키', mean: '일본식 문어볼', flag: 2 },
    { _id: '파스타', mean: '이탈리아식 면 요리', flag: 2 },
    { _id: '스테이크', mean: '두꺼운 고기 구이', flag: 2 },
    // 한국어 긴 단어 (끄투에서 자주 쓰이는)
    { _id: '가나다라마바사아자차카타파하', mean: '한글 자음 순서', flag: 2 },
    { _id: '국제연합교육과학문화기구', mean: '유네스코의 한국어 명칭', flag: 2 },
    { _id: '국제원자력기구', mean: 'IAEA의 한국어 명칭', flag: 2 },
    { _id: '세계보건기구', mean: 'WHO의 한국어 명칭', flag: 2 },
    { _id: '세계무역기구', mean: 'WTO의 한국어 명칭', flag: 2 },
    { _id: '국제통화기금', mean: 'IMF의 한국어 명칭', flag: 2 },
];

async function main() {
    try {
        // 현재 DB 단어 목록 확인
        const dbRes = await pool.query('SELECT _id FROM kkutu_ko;');
        const dbWords = new Set(dbRes.rows.map(r => r._id));
        console.log(`기존 DB: ${dbWords.size}개`);

        // 누락 단어 필터링
        const toInsert = INJEONG_WORDS.filter(w => !dbWords.has(w._id));
        console.log(`추가할 어인정 단어: ${toInsert.length}개`);

        if (toInsert.length === 0) {
            console.log('추가할 단어가 없습니다.');
            return;
        }

        let inserted = 0;
        for (const item of toInsert) {
            try {
                await pool.query(
                    `INSERT INTO kkutu_ko (_id, type, mean, hit, flag, theme) 
                     VALUES ($1, $2, $3, 0, $4, NULL)
                     ON CONFLICT (_id) DO NOTHING;`,
                    [item._id, 'INJEONG', item.mean, item.flag || 2]
                );
                inserted++;
                console.log(`  ✅ 추가: ${item._id}`);
            } catch (err) {
                console.error(`  ❌ 오류 (${item._id}):`, err.message.slice(0, 80));
            }
        }

        const finalRes = await pool.query('SELECT COUNT(*) FROM kkutu_ko;');
        console.log(`\n📊 최종 DB 단어 수: ${finalRes.rows[0].count}개`);
        console.log(`✅ 어인정 단어 ${inserted}개 추가 완료`);

    } catch (err) {
        console.error('치명적 오류:', err);
    } finally {
        await pool.end();
    }
}

main();

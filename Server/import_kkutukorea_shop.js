const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const globalConfig = require('./lib/sub/global.json');

// Base 19 hand-crafted custom items
const baseItems = [
	{ _id: 'b_kkukokore', cost: 50000, term: 0, group: 'BDG1', options: { gEXP: 0.1, gMNY: 0.1 }, name_ko: '끄투코리아 대표 휘장', desc_ko: '끄투코리아 공식 서비스의 위상을 담은 최고 등급의 대표 휘장입니다.', name_en: 'KKuTu Korea Emblem', desc_en: 'The highest tier emblem representing KKuTu Korea official service.' },
	{ _id: 'b_heart_ping', cost: 25000, term: 0, group: 'BDG2', options: { gMNY: 0.1 }, name_ko: '하트 뿅뿅 휘장 (핑셋)', desc_ko: '하트가 뿅뿅 솟아나며 사랑을 전해주는 휘장입니다. 착용 시 핑 획득량이 늘어날 것만 같습니다.', name_en: 'Lovely Hearts Badge', desc_en: 'A lovely badge with overflowing hearts. Perfect for farming Pings.' },
	{ _id: 'b_rainbow_ping', cost: 35000, term: 0, group: 'BDG2', options: { gMNY: 0.08, gEXP: 0.05 }, name_ko: '레인보우 그라데이션 휘장', desc_ko: '오색찬란한 무지개빛으로 빛나는 휘장입니다. 모든 사람들의 이목을 사로잡습니다.', name_en: 'Rainbow Gradient Badge', desc_en: 'A stunning badge glowing in seven rainbow colors.' },
	{ _id: 'b_gold_star', cost: 15000, term: 0, group: 'BDG3', options: { gEXP: 0.08 }, name_ko: '골드 스타 휘장', desc_ko: '반짝반짝 빛나는 황금 별의 기운을 담은 휘장입니다.', name_en: 'Gold Star Badge', desc_en: 'A shiny gold star badge that lights up your profile.' },
	{ _id: 'b_diamond_star', cost: 40000, term: 0, group: 'BDG3', options: { gEXP: 0.12, gMNY: 0.08 }, name_ko: '다이아몬드 스타 휘장 (핑셋)', desc_ko: '다이아몬드처럼 빛나는 찬란한 별의 기운을 담은 휘장입니다.', name_en: 'Diamond Star Badge', desc_en: 'A gorgeous diamond star badge with high stat bonuses.' },
	{ _id: 'b_gold_crown', cost: 30000, term: 0, group: 'BDG1', options: { gEXP: 0.1, gMNY: 0.1 }, name_ko: '황금 왕관 휘장 (핑셋)', desc_ko: '끄투 세계를 지배하는 지혜로운 국왕의 품격을 담은 고귀한 황금 왕관 휘장입니다.', name_en: 'Royal Golden Crown Badge', desc_en: 'A noble gold crown badge fit for a vocabulary king.' },
	{ _id: 'b_wing_angel', cost: 28000, term: 0, group: 'BDG3', options: { gEXP: 0.08, gMNY: 0.08 }, name_ko: '수호 천사 휘장 (핑셋)', desc_ko: '당신을 늘 지켜 주는 수호 천사의 깃털 날개가 장식된 온화한 기운의 휘장입니다.', name_en: 'Guardian Angel Wings Badge', desc_en: 'A holy wings badge filled with pure energy.' },
	{ _id: 'b_devil_wing', cost: 26000, term: 0, group: 'BDG3', options: { gEXP: 0.06, gMNY: 0.09 }, name_ko: '타락 천사 휘장 (핑셋)', desc_ko: '어둠의 심연에서 솟아오른 흑적색 악마의 날개가 새겨진 강렬한 인상의 휘장입니다.', name_en: 'Fallen Devil Wings Badge', desc_en: 'A dark and powerful badge with demonic red wings.' },

	{ _id: 'banana_hair', cost: 8000, term: 0, group: 'Mhead', options: { gMNY: 0.08 }, name_ko: '바나나 헤어 스킨 (핑셋)', desc_ko: '달콤하고 상큼한 노란 바나나를 얹은 헤어 스킨입니다. 핑 획득 셋팅(핑셋) 필수 아이템!', name_en: 'Banana Hair Skin', desc_en: 'A sweet yellow banana hair skin. A must-have item for ping sets!' },
	{ _id: 'soda_hair', cost: 8000, term: 0, group: 'Mhead', options: { gEXP: 0.05 }, name_ko: '소다 헤어 스킨', desc_ko: '시원한 소다맛 아이스크림의 하늘빛을 담은 헤어 스킨입니다.', name_en: 'Soda Ice Hair Skin', desc_en: 'A refreshing light blue hair skin inspired by soda ice cream.' },
	{ _id: 'peach_milk_hair', cost: 9500, term: 0, group: 'Mhead', options: { gEXP: 0.06 }, name_ko: '피치 밀크 헤어 스킨', desc_ko: '부드러운 복숭아 우유빛 핑크 헤어 스킨입니다.', name_en: 'Peach Milk Hair Skin', desc_en: 'A soft and lovely peach pink hair skin.' },
	{ _id: 'angel_halo', cost: 11000, term: 0, group: 'Mhead', options: { gEXP: 0.08 }, name_ko: '천사의 링 머리띠 (핑셋)', desc_ko: '머리 위에 둥둥 떠다니는 신비로운 황금빛 천사 링입니다. 마음씨 착한 모레미들의 필수 아이템!', name_en: 'Glowing Angel Halo', desc_en: 'A floating golden halo representing pure kindness.' },
	{ _id: 'cat_ears', cost: 9000, term: 0, group: 'Mhead', options: { gMNY: 0.07 }, name_ko: '네코미미 고양이 귀 (핑셋)', desc_ko: '착용하면 냥냥 소리가 날 것만 같은 치명적인 귀여움의 고양이 귀 머리띠입니다.', name_en: 'Cute Cat Ears', desc_en: 'Adorable fuzzy cat ears headband.' },
	{ _id: 'crown_gold', cost: 15000, term: 0, group: 'Mhead', options: { gEXP: 0.1 }, name_ko: '미니 황금 왕관 스킨', desc_ko: '모레미의 머리 위에 앙증맞게 얹을 수 있는 최고급 세공 황금 미니 왕관입니다.', name_en: 'Mini Golden Crown', desc_en: 'A tiny gold crown for royal Moremis.' },
	{ _id: 'detective_hat', cost: 7500, term: 0, group: 'Mhead', options: { gEXP: 0.05, gMNY: 0.03 }, name_ko: '명탐정 브라운 모자', desc_ko: '셜록 홈즈처럼 예리한 추리로 단어의 빈칸을 채워낼 것만 같은 클래식 탐정 모자입니다.', name_en: 'Classic Detective Cap', desc_en: 'A brown tweed Sherlock Holmes style detective hat.' },

	{ _id: 'peek_eye', cost: 4500, term: 0, group: 'Meye', options: { gMNY: 0.05 }, name_ko: '힐끔힐끔 눈 (핑셋)', desc_ko: '곁눈질로 상대방의 끄투 단어를 힐끔힐끔 쳐다보는 앙증맞은 눈입니다.', name_en: 'Glancing Eyes', desc_en: 'Cute eyes glancing sideways, as if checking other players\' words.' },
	{ _id: 'sparkle_eye', cost: 4000, term: 0, group: 'Meye', options: { gEXP: 0.04 }, name_ko: '초롱초롱 눈', desc_ko: '호기심과 지혜로 가득 차 초롱초롱 빛나는 눈매입니다.', name_en: 'Sparkling Eyes', desc_en: 'Bright and curious eyes full of wisdom.' },
	{ _id: 'blush_face', cost: 6000, term: 0, group: 'Meye', options: { gMNY: 0.05 }, name_ko: '발그레 홍조 (핑셋)', desc_ko: '볼이 발그레해진 모레미를 만들어 주는 귀여운 홍조 화장품입니다.', name_en: 'Rosy Blush', desc_en: 'Cute rosy cheeks for your Moremi.' },
	{ _id: 'round_glasses', cost: 5000, term: 0, group: 'Meye', options: { gEXP: 0.05 }, name_ko: '동글이 안경', desc_ko: '착용하면 왠지 국어사전의 모든 단어를 다 외운 것 같아 보이는 똑똑한 동글이 안경입니다.', name_en: 'Round Glasses', desc_en: 'Smart round glasses that make your Moremi look like a scholar.' },
	{ _id: 'cool_sunglasses', cost: 6000, term: 0, group: 'Meye', options: { gMNY: 0.06 }, name_ko: '시크 선글라스 (핑셋)', desc_ko: '눈부신 태양 아래 시크하고 힙한 분위기를 완성해 주는 다크 선글라스입니다.', name_en: 'Chic Dark Sunglasses', desc_en: 'Cool black sunglasses that add instant style.' },
	{ _id: 'crying_eye', cost: 5000, term: 0, group: 'Meye', options: { gEXP: 0.05 }, name_ko: '글썽글썽 눈 스킨', desc_ko: '단어를 맞추지 못했을 때 눈물이 그렁그렁 고여 있는 귀여운 눈망울입니다.', name_en: 'Teary Crying Eyes', desc_en: 'Cute watery eyes full of emotion.' },
	{ _id: 'heart_eye', cost: 8000, term: 0, group: 'Meye', options: { gMNY: 0.08 }, name_ko: '하트 뿅뿅 눈 (핑셋)', desc_ko: '사랑하는 사람이나 좋아하는 끄투 단어를 발견했을 때 눈에서 하트가 발사되는 사랑스러운 눈매입니다.', name_en: 'Lovely Heart Eyes', desc_en: 'Sparkling pink heart eyes filled with adoration.' },

	{ _id: 'munch_mouth', cost: 3000, term: 0, group: 'Mmouth', options: { gEXP: 0.03 }, name_ko: '오물오물 입', desc_ko: '단어를 열심히 맞추며 무언가 맛있게 오물오물 씹고 있는 입입니다.', name_en: 'Chewing Mouth', desc_en: 'A cute mouth chewing something while solving words.' },
	{ _id: 'smile_mouth', cost: 2500, term: 0, group: 'Mmouth', options: { gEXP: 0.03 }, name_ko: '방긋방긋 입', desc_ko: '모든 플레이어들에게 항상 방긋방긋 미소를 건네는 친절한 입입니다.', name_en: 'Smiling Mouth', desc_en: 'A friendly smiling mouth that spreads happiness.' },
	{ _id: 'bubble_gum', cost: 4500, term: 0, group: 'Mmouth', options: { gEXP: 0.04 }, name_ko: '풍선껌 부는 입', desc_ko: '단어를 풀면서 커다란 분홍색 풍선껌을 오물오물 불고 있는 개구쟁이 입입니다.', name_en: 'Blowing Bubblegum', desc_en: 'A cute mouth blowing a giant pink bubble.' },
	{ _id: 'lol_mouth', cost: 3500, term: 0, group: 'Mmouth', options: { gEXP: 0.03 }, name_ko: '메롱 장난 입', desc_ko: '상대방을 익살스럽게 놀리는 귀여운 핑크빛 혀를 쏙 내민 입입니다.', name_en: 'Playful Tongue Out', desc_en: 'A mischievous mouth teasing other players.' },
	{ _id: 'mustache', cost: 5000, term: 0, group: 'Mmouth', options: { gMNY: 0.05 }, name_ko: '신사 콧수염 스킨 (핑셋)', desc_ko: '착용하면 왠지 중후하고 매너 있는 플레이를 해야 할 것 같은 클래식 콧수염입니다.', name_en: 'Gentleman Mustache', desc_en: 'A dapper black mustache that adds class.' },

	{ _id: 'gold_angel_cloth', cost: 22000, term: 0, group: 'Mclothes', options: { gMNY: 0.15, gEXP: 0.05 }, name_ko: '골드 그랜드 엔젤 복장 (핑셋)', desc_ko: '끄투코리아 최고의 인기 의상! 찬란한 황금 천사의 날개와 예복이 어우러진 최고급 복장입니다.', name_en: 'Gold Grand Angel Costume', desc_en: 'The most popular costume in KKuTu Korea! Gorgeous gold angel wings and robes.' },
	{ _id: 'korea_hanbok', cost: 18000, term: 0, group: 'Mclothes', options: { gMNY: 0.12, gEXP: 0.04 }, name_ko: '전통 오색 한복 (핑셋)', desc_ko: '단아하고 우아한 선을 자랑하는 전통 오색 한복입니다.', name_en: 'Traditional Hanbok', desc_en: 'Beautiful and elegant traditional Korean Hanbok.' },
	{ _id: 'galaxy_robe', cost: 25000, term: 0, group: 'Mclothes', options: { gEXP: 0.15, gMNY: 0.1 }, name_ko: '은하수 우주 로브 (핑셋)', desc_ko: '깊고 푸른 밤하늘과 오색찬란한 은하수의 기운이 옷자락에 고스란히 담긴 최고급 로브입니다.', name_en: 'Galaxy Nebula Robe', desc_en: 'A premium space-themed cloak glowing with starry nebula details.' },
	{ _id: 'detective_coat', cost: 16000, term: 0, group: 'Mclothes', options: { gEXP: 0.1, gMNY: 0.05 }, name_ko: '명탐정 트렌치코트', desc_ko: '영국 런던의 안개 낀 거리를 누비던 품격 있는 베이지색 클래식 탐정 코트입니다.', name_en: 'Detective Trenchcoat', desc_en: 'A stylish beige detective coat perfect for investigation.' },
	{ _id: 'cute_pajamas', cost: 12000, term: 0, group: 'Mclothes', options: { gEXP: 0.06, gMNY: 0.06 }, name_ko: '동글이 핑크 파자마', desc_ko: '포근하고 부드러운 수면 잠옷으로, 언제 어디서나 달콤한 꿈을 꿀 준비가 된 코스튬입니다.', name_en: 'Cozy Pink Pajamas', desc_en: 'A super soft pink pajama set for comfortable play.' },

	{ _id: 'huge_pencil', cost: 7000, term: 0, group: 'Mhand', options: { gMNY: 0.06 }, name_ko: '커다란 연필 (핑셋)', desc_ko: '단어를 슥슥 적어 내려갈 것 같은 압도적 크기의 학업용 거대 연필입니다.', name_en: 'Giant Pencil', desc_en: 'A gigantic pencil ready to write down all the vocabulary.' },
	{ _id: 'rainbow_umbrella', cost: 8500, term: 0, group: 'Mhand', options: { gEXP: 0.05 }, name_ko: '무지개 우산', desc_ko: '비 오는 날에도 화사함을 유지해 줄 알록달록 무지개 우산입니다.', name_en: 'Rainbow Umbrella', desc_en: 'A colorful umbrella to keep your Moremi bright even on rainy days.' },
	{ _id: 'magical_wand', cost: 13000, term: 0, group: 'Mhand', options: { gMNY: 0.1 }, name_ko: '요술봉 마법봉 (핑셋)', desc_ko: '신비로운 핑크빛 보석이 박혀 있어, 허공에 휘두르면 찬란한 마법 가루가 날리는 요술봉입니다.', name_en: 'Sparkly Magic Wand', desc_en: 'A cute star wand that glows with magical energy.' },
	{ _id: 'gold_torch', cost: 14000, term: 0, group: 'Mhand', options: { gEXP: 0.1 }, name_ko: '황금 성화 봉송 (핑셋)', desc_ko: '스포츠맨십과 불타는 열정을 담아 끄투 전장을 밝히는 찬란한 황금 성화입니다.', name_en: 'Golden Olympic Torch', desc_en: 'A bright torch glowing with eternal flames.' },
	{ _id: 'toy_hammer', cost: 7500, term: 0, group: 'Mhand', options: { gEXP: 0.05, gMNY: 0.03 }, name_ko: '노란 뿅망치 스킨', desc_ko: '상대방의 뚝배기(?)를 뿅 소리와 함께 강타할 것만 같은 장난기 넘치는 노란색 뿅망치입니다.', name_en: 'Yellow Squeaky Hammer', desc_en: 'A fun toy hammer that squeaks on impact.' },

	{ _id: 'fairy_wings', cost: 22000, term: 0, group: 'Mback', options: { gEXP: 0.12, gMNY: 0.08 }, name_ko: '나비 요정의 날개 (핑셋)', desc_ko: '장착 시 투명하고 영롱한 요정의 날개가 모레미 뒷모습을 아름답게 장식해 줍니다.', name_en: 'Fairy Butterfly Wings', desc_en: 'Beautiful glowing translucent wings.' },
	{ _id: 'devil_wings', cost: 20000, term: 0, group: 'Mback', options: { gEXP: 0.08, gMNY: 0.12 }, name_ko: '다크 데빌 날개 (핑셋)', desc_ko: '밤의 어둠을 형상화한 박쥐 모양의 웅장한 악마의 날개입니다. 강렬한 카리스마를 발산합니다.', name_en: 'Demonic Bat Wings', desc_en: 'Intimidating dark wings full of mysterious energy.' },

	{ _id: 'rainbow_name', cost: 15000, term: 0, group: 'NIK', options: { gEXP: 0.05, gMNY: 0.05 }, name_ko: '레인보우 이름', desc_ko: '이름을 <label class="x-rainbow_name">레인보우 그라데이션</label>으로 아름답게 칠합니다.', name_en: 'Rainbow Name Color', desc_en: 'Colors your nickname in beautiful animated rainbow gradient.' },
	{ _id: 'gold_name', cost: 12000, term: 0, group: 'NIK', options: { gEXP: 0.04, gMNY: 0.04 }, name_ko: '황금빛 이름', desc_ko: '이름을 <label class="x-gold_name">황금빛 그라데이션</label>으로 고급스럽게 칠합니다.', name_en: 'Luxury Gold Name Color', desc_en: 'Colors your nickname in elegant glowing gold gradient.' }
];

// Helper to generate 245 mathematically unique premium-themed shop items with zero duplicates
function generateItems() {
	const prefixes = [
		'로열', '블링블링', '샤이닝', '황금빛', '다이아', '네온', '레트로', '유니콘', '사이버', 
		'스페이스', '달콤한', '눈꽃', '레인보우', '엔젤', '데빌', '전설의', '신화의', '우주의', 
		'심해의', '불타는', '얼음', '빛나는', '몽환의', '다크니스', '은하', '오로라', '루비', 
		'크리스탈', '할로윈', '상큼한', '시원한', '봄바람', '단풍빛', '밤하늘', '영롱한'
	]; // 35 prefixes
	const groups = [
		{ name: '휘장', group: 'BDG3', cat: 'badge', templates: ['b2_fire.png', 'b2_metal.png', 'b3_pok.png', 'b3_hwa.png'] },
		{ name: '헤어 스킨', group: 'Mhead', cat: 'head', templates: ['nekomimi.png', 'blue_headphone.png', 'orange_headphone.png', 'blackbere.png'] },
		{ name: '안경', group: 'Meye', cat: 'eye', templates: ['sunglasses.png', 'round_glasses.png', 'peek_eye.png', 'sparkle_eye.png'] },
		{ name: '콧수염 스킨', group: 'Mmouth', cat: 'mouth', templates: ['mustache.png', 'merong.png', 'smile_mouth.png', 'smiling_mouth.png'] },
		{ name: '복장', group: 'Mclothes', cat: 'clothes', templates: ['blackrobe.png', 'pink_vest.png', 'orange_vest.png', 'blue_vest.png'] },
		{ name: '요술봉', group: 'Mhand', cat: 'hand', templates: ['bluecandy.png', 'spanner.png', 'huge_pencil.png', 'rainbow_umbrella.png'] },
		{ name: '날개', group: 'Mback', cat: 'back', templates: ['taengja.png'] }
	]; // 7 groups

	const genList = [];
	let idCounter = 1;

	// Loop nested over all combinations: 35 prefixes * 7 groups = 245 mathematically unique items
	for (let pIdx = 0; pIdx < prefixes.length; pIdx++) {
		const prefix = prefixes[pIdx];
		for (let gIdx = 0; gIdx < groups.length; gIdx++) {
			const grp = groups[gIdx];
			
			const _id = `gen_${grp.cat}_${idCounter++}`;
			
			// dynamic costs from 2,000 to 52,000 pings
			const cost = 2000 + (((pIdx * 7) + gIdx) * 200); 
			
			// stats options scaled slightly by cost
			const baseBonus = 0.02 + ((cost / 52000) * 0.15); 
			const options = {};
			const sumIdx = pIdx + gIdx;
			if (sumIdx % 2 === 0) {
				options.gEXP = parseFloat(baseBonus.toFixed(2));
			} else if (sumIdx % 3 === 0) {
				options.gMNY = parseFloat(baseBonus.toFixed(2));
			} else {
				options.gEXP = parseFloat((baseBonus / 2).toFixed(2));
				options.gMNY = parseFloat((baseBonus / 2).toFixed(2));
			}

			// Pick template
			const template = grp.templates[sumIdx % grp.templates.length];

			genList.push({
				_id,
				cost,
				term: 0,
				group: grp.group,
				options,
				name_ko: `${prefix} ${grp.name}`,
				desc_ko: `${prefix} 테마로 정교하게 세공된 프리미엄 ${grp.name} 아이템입니다.`,
				name_en: `Premium ${prefix} ${grp.cat.toUpperCase()}`,
				desc_en: `A premium ${grp.cat} item with custom theme and stats.`,
				_catFolder: grp.cat,
				_templateFile: template
			});
		}
	}

	return genList;
}

const generatedItems = generateItems();
const items = baseItems.concat(generatedItems);

// Static mappings for baseItems visual assets
const baseTemplateMappings = {
	'b_kkukokore': 'b_kkukokore.png',
	'b_heart_ping': 'b_heart_ping.png',
	'b_rainbow_ping': 'b_rainbow_ping.png',
	'b_gold_star': 'b_gold_star.png',
	'b_diamond_star': 'b2_metal.png',
	'b_gold_crown': 'b1_gm.png',
	'b_wing_angel': 'b3_pok.png',
	'b_devil_wing': 'b3_hwa.png',
	'banana_hair': 'blue_headphone.png',
	'soda_hair': 'orange_headphone.png',
	'peach_milk_hair': 'nekomimi.png',
	'angel_halo': 'nekomimi.png',
	'cat_ears': 'nekomimi.png',
	'crown_gold': 'nekomimi.png',
	'detective_hat': 'blackbere.png',
	'peek_eye': 'peek_eye.png',
	'sparkle_eye': 'sparkle_eye.png',
	'blush_face': 'blush_face.png',
	'round_glasses': 'round_glasses.png',
	'cool_sunglasses': 'sunglasses.png',
	'crying_eye': 'lazy_eye.png',
	'heart_eye': 'sparkle_eye.png',
	'munch_mouth': 'munch_mouth.png',
	'smile_mouth': 'smile_mouth.png',
	'bubble_gum': 'oh.png',
	'lol_mouth': 'merong.png',
	'mustache': 'mustache.png',
	'gold_angel_cloth': 'blackrobe.png',
	'korea_hanbok': 'korea_hanbok.png',
	'galaxy_robe': 'blackrobe.png',
	'detective_coat': 'orange_vest.png',
	'cute_pajamas': 'pink_vest.png',
	'huge_pencil': 'huge_pencil.png',
	'rainbow_umbrella': 'rainbow_umbrella.png',
	'magical_wand': 'bluecandy.png',
	'gold_torch': 'rio_seonghwa.png',
	'toy_hammer': 'spanner.png',
	'fairy_wings': 'taengja.png',
	'devil_wings': 'taengja.png'
};

// Mapping categories to box templates for shop thumbnails
const shopThumbnailTemplates = {
	'BDG1': 'boxB2.png',
	'BDG2': 'boxB2.png',
	'BDG3': 'boxB2.png',
	'BDG4': 'boxB2.png',
	'Mhead': 'boxB3.png',
	'Meye': 'boxB4.png',
	'Mmouth': 'boxB4.png',
	'Mclothes': 'boxB2.png',
	'Mhand': 'boxB3.png',
	'Mshoes': 'boxB3.png',
	'Mback': 'boxB3.png'
};

async function run() {
	console.log("Connecting to PostgreSQL database...");
	const client = new Client({
		user: globalConfig.PG_USER,
		password: globalConfig.PG_PASSWORD,
		port: globalConfig.PG_PORT,
		database: globalConfig.PG_DATABASE,
		host: 'localhost'
	});

	try {
		await client.connect();
		console.log("Connected successfully!");
		
		// Clean up previously generated items first to ensure no old duplicates remain
		console.log("Cleaning up old generated items from database...");
		await client.query("DELETE FROM kkutu_shop WHERE _id LIKE 'gen_%';");
		await client.query("DELETE FROM kkutu_shop_desc WHERE _id LIKE 'gen_%';");

		console.log(`Starting insertion of ${items.length} total custom items (including 245 generated)...`);

		for (const item of items) {
			// Insert into kkutu_shop
			await client.query(`
				INSERT INTO kkutu_shop (_id, cost, hit, term, "group", "updatedAt", options)
				VALUES ($1, $2, 0, $3, $4, $5, $6)
				ON CONFLICT (_id) DO UPDATE SET 
					cost = EXCLUDED.cost,
					"group" = EXCLUDED."group",
					"updatedAt" = EXCLUDED."updatedAt",
					options = EXCLUDED.options
			`, [item._id, item.cost, item.term, item.group, Date.now(), JSON.stringify(item.options)]);

			// Insert into kkutu_shop_desc
			await client.query(`
				INSERT INTO kkutu_shop_desc (_id, "name_ko_KR", "desc_ko_KR", "name_en_US", "desc_en_US")
				VALUES ($1, $2, $3, $4, $5)
				ON CONFLICT (_id) DO UPDATE SET
					"name_ko_KR" = EXCLUDED."name_ko_KR",
					"desc_ko_KR" = EXCLUDED."desc_ko_KR",
					"name_en_US" = EXCLUDED."name_en_US",
					"desc_en_US" = EXCLUDED."desc_en_US"
			`, [item._id, item.name_ko, item.desc_ko, item.name_en, item.desc_en]);
		}
		console.log("All database insertions completed successfully!");

	} catch (err) {
		console.error("Database operation failed:", err);
	} finally {
		await client.end();
	}

	// Step 2: Copy image assets under moremi/
	console.log("\nCopying high-quality visual assets...");
	const moremiDir = path.join(__dirname, 'lib', 'Web', 'public', 'img', 'kkutu', 'moremi');

	for (const item of items) {
		if (item.group === 'NIK') continue;

		let categoryFolder = '';
		let templateFileName = '';

		if (item._templateFile) {
			categoryFolder = item._catFolder;
			templateFileName = item._templateFile;
		} else {
			if (item.group.slice(0, 3) === 'BDG') {
				categoryFolder = 'badge';
			} else {
				categoryFolder = item.group.slice(1);
			}
			templateFileName = baseTemplateMappings[item._id] || 'def.png';
		}

		const srcFile = path.join(moremiDir, categoryFolder, templateFileName);
		const destFile = path.join(moremiDir, categoryFolder, `${item._id}.png`);

		try {
			if (fs.existsSync(srcFile)) {
				fs.copyFileSync(srcFile, destFile);
			} else {
				const fallbackFile = path.join(moremiDir, categoryFolder, 'def.png');
				if (fs.existsSync(fallbackFile)) {
					fs.copyFileSync(fallbackFile, destFile);
				}
			}
		} catch (err) {
			console.error(`Failed to copy moremi asset for ${item._id}:`, err);
		}
	}
	console.log("Visual assets copying finished successfully.");

	// Step 3: Copy custom shop thumbnails
	console.log("\nCopying shop thumbnail assets...");
	const shopDir = path.join(__dirname, 'lib', 'Web', 'public', 'img', 'kkutu', 'shop');

	let thumbnailsCopiedCount = 0;
	for (const item of items) {
		const destFile = path.join(shopDir, `${item._id}.png`);
		
		if (item.group === 'NIK' && (item._id === 'rainbow_name' || item._id === 'gold_name')) {
			continue;
		}

		const boxTemplate = shopThumbnailTemplates[item.group] || 'boxB2.png';
		const srcFile = path.join(shopDir, boxTemplate);

		try {
			if (fs.existsSync(srcFile)) {
				fs.copyFileSync(srcFile, destFile);
				thumbnailsCopiedCount++;
			}
		} catch (err) {
			console.error(`Failed to copy shop thumbnail for ${item._id}:`, err);
		}
	}
	console.log(`Copied ${thumbnailsCopiedCount} shop thumbnails successfully.`);

	console.log("\nImport script finished successfully!");
}

run();

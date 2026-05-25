const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const globalConfig = require('./lib/sub/global.json');

const items = [
	{
		_id: 'b_kkukokore',
		cost: 50000,
		term: 0,
		group: 'BDG1',
		options: {},
		name_ko: '끄투코리아 대표 휘장',
		desc_ko: '끄투코리아 공식 서비스의 위상을 담은 최고 등급의 대표 휘장입니다.',
		name_en: 'KKuTu Korea Emblem',
		desc_en: 'The highest tier emblem representing KKuTu Korea official service.'
	},
	{
		_id: 'b_heart_ping',
		cost: 25000,
		term: 0,
		group: 'BDG2',
		options: {},
		name_ko: '하트 뿅뿅 휘장 (핑셋)',
		desc_ko: '하트가 뿅뿅 솟아나며 사랑을 전해주는 휘장입니다. 착용 시 핑 획득량이 늘어날 것만 같습니다.',
		name_en: 'Lovely Hearts Badge',
		desc_en: 'A lovely badge with overflowing hearts. Perfect for farming Pings.'
	},
	{
		_id: 'b_rainbow_ping',
		cost: 35000,
		term: 0,
		group: 'BDG2',
		options: {},
		name_ko: '레인보우 그라데이션 휘장',
		desc_ko: '오색찬란한 무지개빛으로 빛나는 휘장입니다. 모든 사람들의 이목을 사로잡습니다.',
		name_en: 'Rainbow Gradient Badge',
		desc_en: 'A stunning badge glowing in seven rainbow colors.'
	},
	{
		_id: 'b_gold_star',
		cost: 15000,
		term: 0,
		group: 'BDG3',
		options: {},
		name_ko: '골드 스타 휘장',
		desc_ko: '반짝반짝 빛나는 황금 별의 기운을 담은 휘장입니다.',
		name_en: 'Gold Star Badge',
		desc_en: 'A shiny gold star badge that lights up your profile.'
	},
	{
		_id: 'banana_hair',
		cost: 8000,
		term: 0,
		group: 'Mhead',
		options: {},
		name_ko: '바나나 헤어 스킨 (핑셋)',
		desc_ko: '달콤하고 상큼한 노란 바나나를 얹은 헤어 스킨입니다. 핑 획득 셋팅(핑셋) 필수 아이템!',
		name_en: 'Banana Hair Skin',
		desc_en: 'A sweet yellow banana hair skin. A must-have item for ping sets!'
	},
	{
		_id: 'soda_hair',
		cost: 8000,
		term: 0,
		group: 'Mhead',
		options: {},
		name_ko: '소다 헤어 스킨',
		desc_ko: '시원한 소다맛 아이스크림의 하늘빛을 담은 헤어 스킨입니다.',
		name_en: 'Soda Ice Hair Skin',
		desc_en: 'A refreshing light blue hair skin inspired by soda ice cream.'
	},
	{
		_id: 'peach_milk_hair',
		cost: 9500,
		term: 0,
		group: 'Mhead',
		options: {},
		name_ko: '피치 밀크 헤어 스킨',
		desc_ko: '부드러운 복숭아 우유빛 핑크 헤어 스킨입니다.',
		name_en: 'Peach Milk Hair Skin',
		desc_en: 'A soft and lovely peach pink hair skin.'
	},
	{
		_id: 'peek_eye',
		cost: 4500,
		term: 0,
		group: 'Meye',
		options: {},
		name_ko: '힐끔힐끔 눈 (핑셋)',
		desc_ko: '곁눈질로 상대방의 끄투 단어를 힐끔힐끔 쳐다보는 앙증맞은 눈입니다.',
		name_en: 'Glancing Eyes',
		desc_en: 'Cute eyes glancing sideways, as if checking other players\' words.'
	},
	{
		_id: 'sparkle_eye',
		cost: 4000,
		term: 0,
		group: 'Meye',
		options: {},
		name_ko: '초롱초롱 눈',
		desc_ko: '호기심과 지혜로 가득 차 초롱초롱 빛나는 눈매입니다.',
		name_en: 'Sparkling Eyes',
		desc_en: 'Bright and curious eyes full of wisdom.'
	},
	{
		_id: 'munch_mouth',
		cost: 3000,
		term: 0,
		group: 'Mmouth',
		options: {},
		name_ko: '오물오물 입',
		desc_ko: '단어를 열심히 맞추며 무언가 맛있게 오물오물 씹고 있는 입입니다.',
		name_en: 'Chewing Mouth',
		desc_en: 'A cute mouth chewing something while solving words.'
	},
	{
		_id: 'smile_mouth',
		cost: 2500,
		term: 0,
		group: 'Mmouth',
		options: {},
		name_ko: '방긋방긋 입',
		desc_ko: '모든 플레이어들에게 항상 방긋방긋 미소를 건네는 친절한 입입니다.',
		name_en: 'Smiling Mouth',
		desc_en: 'A friendly smiling mouth that spreads happiness.'
	},
	{
		_id: 'gold_angel_cloth',
		cost: 22000,
		term: 0,
		group: 'Mclothes',
		options: {},
		name_ko: '골드 그랜드 엔젤 복장 (핑셋)',
		desc_ko: '끄투코리아 최고의 인기 의상! 찬란한 황금 천사의 날개와 예복이 어우러진 최고급 복장입니다.',
		name_en: 'Gold Grand Angel Costume',
		desc_en: 'The most popular costume in KKuTu Korea! Gorgeous gold angel wings and robes.'
	},
	{
		_id: 'korea_hanbok',
		cost: 18000,
		term: 0,
		group: 'Mclothes',
		options: {},
		name_ko: '전통 오색 한복 (핑셋)',
		desc_ko: '단아하고 우아한 선을 자랑하는 전통 오색 한복입니다.',
		name_en: 'Traditional Hanbok',
		desc_en: 'Beautiful and elegant traditional Korean Hanbok.'
	},
	{
		_id: 'huge_pencil',
		cost: 7000,
		term: 0,
		group: 'Mhand',
		options: {},
		name_ko: '커다란 연필 (핑셋)',
		desc_ko: '단어를 슥슥 적어 내려갈 것 같은 압도적 크기의 학업용 거대 연필입니다.',
		name_en: 'Giant Pencil',
		desc_en: 'A gigantic pencil ready to write down all the vocabulary.'
	},
	{
		_id: 'rainbow_umbrella',
		cost: 8500,
		term: 0,
		group: 'Mhand',
		options: {},
		name_ko: '무지개 우산',
		desc_ko: '비 오는 날에도 화사함을 유지해 줄 알록달록 무지개 우산입니다.',
		name_en: 'Rainbow Umbrella',
		desc_en: 'A colorful umbrella to keep your Moremi bright even on rainy days.'
	},
	{
		_id: 'blush_face',
		cost: 6000,
		term: 0,
		group: 'Meye',
		options: {},
		name_ko: '발그레 홍조 (핑셋)',
		desc_ko: '볼이 발그레해진 모레미를 만들어 주는 귀여운 홍조 화장품입니다.',
		name_en: 'Rosy Blush',
		desc_en: 'Cute rosy cheeks for your Moremi.'
	},
	{
		_id: 'round_glasses',
		cost: 5000,
		term: 0,
		group: 'Meye',
		options: {},
		name_ko: '동글이 안경',
		desc_ko: '착용하면 왠지 국어사전의 모든 단어를 다 외운 것 같아 보이는 똑똑한 동글이 안경입니다.',
		name_en: 'Round Glasses',
		desc_en: 'Smart round glasses that make your Moremi look like a scholar.'
	},
	{
		_id: 'rainbow_name',
		cost: 15000,
		term: 0,
		group: 'NIK',
		options: {},
		name_ko: '레인보우 이름',
		desc_ko: '이름을 <label class="x-rainbow_name">레인보우 그라데이션</label>으로 아름답게 칠합니다.',
		name_en: 'Rainbow Name Color',
		desc_en: 'Colors your nickname in beautiful animated rainbow gradient.'
	},
	{
		_id: 'gold_name',
		cost: 12000,
		term: 0,
		group: 'NIK',
		options: {},
		name_ko: '황금빛 이름',
		desc_ko: '이름을 <label class="x-gold_name">황금빛 그라데이션</label>으로 고급스럽게 칠합니다.',
		name_en: 'Luxury Gold Name Color',
		desc_en: 'Colors your nickname in elegant glowing gold gradient.'
	}
];

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

		for (const item of items) {
			console.log(`Inserting item: ${item._id} (${item.name_ko})`);

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

	// Step 2: Copy image assets
	console.log("\nCopying placeholder image assets...");
	const assetsDir = path.join(__dirname, 'lib', 'Web', 'public', 'img', 'kkutu', 'moremi');

	for (const item of items) {
		if (item.group === 'NIK') continue; // Nickname skin does not need image files

		let categoryFolder = '';
		let srcFile = '';
		if (item.group.slice(0, 3) === 'BDG') {
			categoryFolder = 'badge';
			srcFile = path.join(assetsDir, 'badge', 'b2_fire.png'); // use fire badge as template
		} else {
			const sub = item.group.slice(1); // 'head', 'eye', 'mouth', 'clothes', 'hand'
			categoryFolder = sub;
			srcFile = path.join(assetsDir, sub, 'def.png');
		}

		const destFile = path.join(assetsDir, categoryFolder, `${item._id}.png`);

		try {
			if (fs.existsSync(srcFile)) {
				fs.copyFileSync(srcFile, destFile);
				console.log(`Copied placeholder for ${item._id} -> ${destFile}`);
			} else {
				console.warn(`Source template not found: ${srcFile}`);
			}
		} catch (err) {
			console.error(`Failed to copy placeholder for ${item._id}:`, err);
		}
	}

	// Step 3: Append CSS styles for custom NIK skins
	console.log("\nAdding premium name skin styles to CSS...");
	const cssFile = path.join(__dirname, 'lib', 'Web', 'public', 'css', 'in_game_kkutu_shop.css');
	
	const customStyles = `
/* KKuTu Korea Custom Name Skins */
.x-rainbow_name {
	background: linear-gradient(45deg, #ff3333, #ffae33, #33ff33, #3333ff, #8d33ff, #ff33c2);
	background-size: 400% 400%;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	animation: rainbow-anim 8s ease infinite;
	font-weight: bold;
}
@keyframes rainbow-anim {
	0% { background-position: 0% 50% }
	50% { background-position: 100% 50% }
	100% { background-position: 0% 50% }
}
.x-gold_name {
	background: linear-gradient(45deg, #ffe066, #f5b041, #f4d03f, #ffe066);
	background-size: 300% 300%;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	animation: gold-anim 4s ease infinite;
	font-weight: bold;
	text-shadow: 0px 0px 2px rgba(245, 176, 65, 0.4);
}
@keyframes gold-anim {
	0% { background-position: 0% 50% }
	50% { background-position: 100% 50% }
	100% { background-position: 0% 50% }
}
`;

	try {
		const existingCss = fs.readFileSync(cssFile, 'utf8');
		if (!existingCss.includes('.x-rainbow_name')) {
			fs.appendFileSync(cssFile, customStyles);
			console.log("Appended premium CSS classes to in_game_kkutu_shop.css");
		} else {
			console.log("CSS classes already exist in in_game_kkutu_shop.css");
		}
	} catch (err) {
		console.error("Failed to append styles to CSS file:", err);
	}

	console.log("\nImport script finished successfully!");
}

run();

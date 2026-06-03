const { Client } = require('pg');
const globalConfig = require('./lib/sub/global.json');

async function check() {
	const client = new Client({
		user: globalConfig.PG_USER,
		password: globalConfig.PG_PASSWORD,
		port: globalConfig.PG_PORT,
		database: globalConfig.PG_DATABASE,
		host: 'localhost'
	});

	try {
		await client.connect();
		const res = await client.query('SELECT _id, "updatedAt" FROM kkutu_shop LIMIT 15;');
		console.log('Sample updatedAt values in kkutu_shop:');
		console.log(res.rows);
	} catch (err) {
		console.error(err);
	} finally {
		await client.end();
	}
}

check();

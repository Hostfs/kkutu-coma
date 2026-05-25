const { Pool } = require('pg');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

async function checkWord(word) {
    const res = await pool.query('SELECT _id, type, flag, mean, theme FROM kkutu_ko WHERE _id = $1;', [word]);
    console.log(`\n🔍 Word '${word}':`);
    if (res.rows.length > 0) {
        console.log(res.rows[0]);
    } else {
        console.log('Not found');
    }
}

async function main() {
    try {
        await checkWord('계란');
        await checkWord('달걀');
        await checkWord('사과');
        await checkWord('누누');
        await checkWord('가렌');
        await checkWord('몰락한왕의검');
        await checkWord('플랑드르악파');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

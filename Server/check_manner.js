const { Pool } = require('pg');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

async function main() {
    try {
        const res = await pool.query("SELECT * FROM kkutu_manner_ko LIMIT 10;");
        console.log('kkutu_manner_ko sample:');
        console.log(res.rows);
        
        const countRes = await pool.query("SELECT COUNT(*) FROM kkutu_manner_ko;");
        console.log('kkutu_manner_ko total count:', countRes.rows[0].count);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

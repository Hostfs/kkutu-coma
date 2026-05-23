const { Pool } = require('pg');
const GLOBAL = require('./Server/lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

async function main() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM kkutu_ko;');
        console.log('Total words in kkutu_ko:', res.rows[0].count);
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await pool.end();
    }
}

main();

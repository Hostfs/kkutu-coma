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
        const res = await pool.query('SELECT type, COUNT(*) FROM kkutu_ko GROUP BY type ORDER BY count DESC LIMIT 20;');
        console.log('Types in kkutu_ko:');
        console.log(res.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await pool.end();
    }
}

main();

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
        const res = await pool.query(
            `SELECT _id, mean, theme FROM kkutu_ko WHERE theme LIKE '%RAG%' LIMIT 10;`
        );
        console.log('RAG Theme word meanings:');
        res.rows.forEach(r => {
            console.log(`  Word: [${r._id}] | Theme: ${r.theme} | Mean: ${r.mean}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

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
        // Query to find words in special themes that have standard dictionary definitions
        const res = await pool.query(
            `SELECT _id, mean, theme 
             FROM kkutu_ko 
             WHERE (theme LIKE '%RAG%' OR theme LIKE '%POK%' OR theme LIKE '%STA%' OR theme LIKE '%OVW%')
               AND mean NOT LIKE '%인기 라면%'
               AND mean NOT LIKE '%포켓몬스터%'
               AND mean NOT LIKE '%스타크래프트%'
               AND mean NOT LIKE '%오버워치%'
             LIMIT 100;`
        );
        console.log('--- Overlapping Dictionary Meanings for Special Themes ---');
        res.rows.forEach(r => {
            console.log(`Word: [${r._id}] | Theme: ${r.theme} | Mean: ${r.mean.substring(0, 100)}...`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

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
        const themes = ['RAG', 'POK', 'MAP', 'OVW', 'STA', 'HSS', 'DGM', 'ZEL', 'CYP', 'NEX', 'WOW'];
        for (const t of themes) {
            const countRes = await pool.query(
                `SELECT COUNT(*) FROM kkutu_ko WHERE theme LIKE $1;`,
                [`%${t}%`]
            );
            const samples = await pool.query(
                `SELECT _id, mean FROM kkutu_ko WHERE theme LIKE $1 LIMIT 5;`,
                [`%${t}%`]
            );
            console.log(`Theme [${t}]: Total = ${countRes.rows[0].count}`);
            samples.rows.forEach(r => {
                console.log(`  - ${r._id}: ${r.mean}`);
            });
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

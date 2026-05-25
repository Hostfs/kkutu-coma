const { Pool } = require('pg');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

async function checkTheme(themeNum) {
    const res = await pool.query(
        `SELECT mean, COUNT(*) FROM kkutu_ko 
         WHERE theme LIKE $1 
         GROUP BY mean ORDER BY count DESC LIMIT 5;`,
        [`%${themeNum}%`]
    );
    console.log(`\n=== Meanings for Theme ${themeNum} ===`);
    res.rows.forEach(r => {
        console.log(`  Count: ${r.count} | Mean: ${r.mean.slice(0, 100)}`);
    });
}

async function main() {
    try {
        await checkTheme('190'); // Animal (should be animal-related, but currently 교통/교역?)
        await checkTheme('380'); // Person (should be person-related, but currently 교육?)
        await checkTheme('360'); // Music (should be music-related, but currently 공업?)
        await checkTheme('390'); // Electricity (should be electricity-related, but currently 교통?)
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

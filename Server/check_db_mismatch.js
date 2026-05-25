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
        console.log('Querying 30 words with actual descriptions...');
        const res = await pool.query(
            `SELECT _id, mean, theme FROM kkutu_ko 
             WHERE mean != '＂1＂［1］（1）' AND mean != '＂1＂' AND mean NOT LIKE '%의 뜻'
             ORDER BY RANDOM() LIMIT 30;`
        );
        
        console.log('\n=== Word Meaning Check ===');
        res.rows.forEach((row, idx) => {
            console.log(`${idx + 1}. [${row._id}] (Theme: ${row.theme})`);
            console.log(`   Mean: ${row.mean}`);
            console.log('-'.repeat(40));
        });
        
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

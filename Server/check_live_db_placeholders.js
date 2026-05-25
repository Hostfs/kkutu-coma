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
        const totalRes = await pool.query('SELECT COUNT(*) FROM kkutu_ko;');
        const placeholderRes = await pool.query("SELECT COUNT(*) FROM kkutu_ko WHERE mean = '＂1＂［1］（1）';");
        const customRes = await pool.query(
            `SELECT COUNT(*) FROM kkutu_ko 
             WHERE mean != '＂1＂［1］（1）' AND mean != '＂1＂' AND mean NOT LIKE '%의 뜻';`
        );
        
        console.log('Live Database Status:');
        console.log('  Total words in kkutu_ko:', totalRes.rows[0].count);
        console.log('  Words with placeholder ＂1＂［1］（1）:', placeholderRes.rows[0].count);
        console.log('  Words with other custom/generic descriptions:', customRes.rows[0].count);
        
        // Let's get a few examples of "other" descriptions
        const samples = await pool.query(
            `SELECT mean, COUNT(*) FROM kkutu_ko 
             WHERE mean != '＂1＂［1］（1）' AND mean != '＂1＂' AND mean NOT LIKE '%의 뜻'
             GROUP BY mean ORDER BY count DESC LIMIT 10;`
        );
        console.log('\nTop 10 most common descriptions in the live database:');
        samples.rows.forEach(r => {
            console.log(`  Count: ${r.count} | Mean: ${r.mean.slice(0, 100)}`);
        });
        
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

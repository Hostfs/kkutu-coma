const { Pool } = require('pg');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

async function checkWord(word) {
    const res = await pool.query('SELECT _id, mean, theme FROM kkutu_ko WHERE _id = $1;', [word]);
    if (res.rows.length > 0) {
        console.log(`✅ [SUCCESS] Word '${word}':\n   - Mean: ${res.rows[0].mean}\n   - Theme: ${res.rows[0].theme}`);
    } else {
        console.log(`❌ [FAILED] Word '${word}' not found in database.`);
    }
}

async function main() {
    try {
        console.log('--- DB Verification for Premium Words ---');
        await checkWord('열무비빔면');
        await checkWord('초코틴틴');
        await checkWord('버터링');
        await checkWord('너구리');
        await checkWord('에이스');
        await checkWord('피카츄');
        await checkWord('라인하르트');
        await checkWord('공허');
        await checkWord('아카데미');
        
        console.log('\n--- DB Verification for Remaining Weird Words in Special Themes ---');
        const weirdCountRes = await pool.query(
            `SELECT COUNT(*) FROM kkutu_ko 
             WHERE (theme LIKE '%RAG%' OR theme LIKE '%POK%' OR theme LIKE '%STA%' OR theme LIKE '%OVW%' OR theme LIKE '%MAP%' OR theme LIKE '%HSS%' OR theme LIKE '%DGM%' OR theme LIKE '%ZEL%' OR theme LIKE '%CYP%' OR theme LIKE '%NEX%' OR theme LIKE '%WOW%')
               AND (mean LIKE '［%' OR mean LIKE '▮%' OR mean LIKE '[명사]%' OR mean LIKE '[동사]%');`
        );
        console.log('Remaining weird dictionary words count:', weirdCountRes.rows[0].count);
        
        const weirdSamples = await pool.query(
            `SELECT _id, mean, theme FROM kkutu_ko 
             WHERE (theme LIKE '%RAG%' OR theme LIKE '%POK%' OR theme LIKE '%STA%' OR theme LIKE '%OVW%' OR theme LIKE '%MAP%' OR theme LIKE '%HSS%' OR theme LIKE '%DGM%' OR theme LIKE '%ZEL%' OR theme LIKE '%CYP%' OR theme LIKE '%NEX%' OR theme LIKE '%WOW%')
               AND (mean LIKE '［%' OR mean LIKE '▮%' OR mean LIKE '[명사]%' OR mean LIKE '[동사]%')
             LIMIT 10;`
        );
        weirdSamples.rows.forEach(r => {
            console.log(`Word: [${r._id}] | Theme: ${r.theme} | Mean: ${r.mean.substring(0, 80)}...`);
        });
        
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

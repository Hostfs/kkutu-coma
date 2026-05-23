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
        const res = await pool.query('SELECT * FROM kkutu_injeong LIMIT 5;');
        console.log('kkutu_injeong sample:');
        console.log(JSON.stringify(res.rows, null, 2));
        
        const count = await pool.query('SELECT COUNT(*) FROM kkutu_injeong;');
        console.log('Total:', count.rows[0].count);
        
        // Also check schema
        const schema = await pool.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'kkutu_injeong'
            ORDER BY ordinal_position;
        `);
        console.log('\nSchema:');
        console.log(schema.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

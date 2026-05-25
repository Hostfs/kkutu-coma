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
        const words = ['열무비빔면', '초코틴틴', '피카츄', '꼬깔콘', '신라면', '진라면', '짜파게티', '불닭볶음면', '홈런볼', '새우깡', '포카칩'];
        const res = await pool.query(
            `SELECT _id, mean, theme FROM kkutu_ko WHERE _id = ANY($1) OR (theme LIKE '%RAG%' AND mean NOT LIKE '%라면%') LIMIT 30;`,
            [words]
        );
        console.log('Words and their definitions:');
        res.rows.forEach(r => {
            console.log(`Word: [${r._id}] | Theme: ${r.theme} | Mean: ${r.mean}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

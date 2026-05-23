const { Pool } = require('pg');
const https = require('https');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

function fetchWords() {
    return new Promise((resolve, reject) => {
        https.get('https://raw.githubusercontent.com/acidsound/korean_wordlist/master/wordslist.txt', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const words = data.split(/\r?\n/).map(w => w.trim()).filter(w => {
                    // Check if it's a valid Korean word: length >= 2, only Korean characters
                    return w.length >= 2 && /^[가-힣]+$/.test(w);
                });
                resolve(words);
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        console.log('Fetching words from github...');
        const words = await fetchWords();
        console.log(`Fetched ${words.length} valid words from github.`);

        // Get unique words
        const uniqueWords = Array.from(new Set(words));
        console.log(`Unique valid words: ${uniqueWords.length}`);

        // Check how many are missing in the DB
        // Let's do a batch check or query
        const dbRes = await pool.query('SELECT _id FROM kkutu_ko;');
        const dbWords = new Set(dbRes.rows.map(r => r._id));
        console.log(`Database has ${dbWords.size} words.`);

        const missing = uniqueWords.filter(w => !dbWords.has(w));
        console.log(`Missing words in DB: ${missing.length}`);

        // Show a few examples of missing words
        console.log('Examples of missing words:', missing.slice(0, 50).join(', '));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

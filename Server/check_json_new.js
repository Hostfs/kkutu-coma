const { Pool } = require('pg');
const https = require('https');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

function fetchJSONWords(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const words = [];
                // Split by line
                const lines = data.split(/\r?\n/);
                for (const line of lines) {
                    if (!line.trim()) continue;
                    // Format: {'word': '...', 'raw': '...'}
                    // Let's use regex to extract the word
                    const match = line.match(/'word':\s*'([^']+)'/);
                    if (match && match[1]) {
                        const w = match[1].trim();
                        // Check if it's a valid Korean word: length >= 2, only Korean characters
                        if (w.length >= 2 && /^[가-힣]+$/.test(w)) {
                            words.push(w);
                        }
                    }
                }
                resolve(words);
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        console.log('Fetching words from dictionary1...');
        const words1 = await fetchJSONWords('https://raw.githubusercontent.com/acidsound/korean_wordlist/master/korean_dictionary1.json');
        console.log(`Fetched ${words1.length} valid words from dictionary1.`);

        console.log('Fetching words from dictionary2...');
        const words2 = await fetchJSONWords('https://raw.githubusercontent.com/acidsound/korean_wordlist/master/korean_dictionary2.json');
        console.log(`Fetched ${words2.length} valid words from dictionary2.`);

        const allWords = [...words1, ...words2];
        const uniqueWords = Array.from(new Set(allWords));
        console.log(`Unique valid words: ${uniqueWords.length}`);

        // Check how many are missing in the DB
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

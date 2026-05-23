const { Pool } = require('pg');
const https = require('https');
const GLOBAL = require('./lib/sub/global.json');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

function fetchCSV() {
    return new Promise((resolve, reject) => {
        https.get('https://raw.githubusercontent.com/isaac7778/word-chain-korean/master/kr_korean.csv', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const words = [];
                const lines = data.split(/\r?\n/);
                for (const line of lines) {
                    if (!line.trim()) continue;
                    // Format: word,pos
                    // Example: ﻿-가,어미 or 가가리,명사
                    const parts = line.split(',');
                    if (parts.length >= 2) {
                        let word = parts[0].trim();
                        // Remove BOM if present
                        if (word.startsWith('\ufeff')) {
                            word = word.slice(1);
                        }
                        const pos = parts[1].trim();
                        
                        // Check if it's a noun-like POS
                        const isValidPOS = ['명사', '대명사', '수사', '의존명사'].includes(pos);
                        
                        if (isValidPOS) {
                            // Clean up word (remove leading/trailing hyphens)
                            word = word.replace(/^-+|-+$/g, '');
                            
                            // Check if it's a valid Korean word: length >= 2, only Korean characters
                            if (word.length >= 2 && /^[가-힣]+$/.test(word)) {
                                words.push(word);
                            }
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
        console.log('Fetching words from kr_korean.csv...');
        const words = await fetchCSV();
        console.log(`Fetched ${words.length} valid nouns/pronouns/numerals.`);

        const uniqueWords = Array.from(new Set(words));
        console.log(`Unique valid nouns: ${uniqueWords.length}`);

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

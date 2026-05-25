const https = require('https');

function fetchURL(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        }).on('error', reject);
    });
}

async function main() {
    try {
        console.log('Downloading sample...');
        const data1 = await fetchURL('https://raw.githubusercontent.com/acidsound/korean_wordlist/master/korean_dictionary1.json');
        const lines = data1.split(/\r?\n/).slice(0, 20);
        console.log('=== Lines ===');
        lines.forEach((l, idx) => console.log(`${idx + 1}: ${l.slice(0, 300)}`));
    } catch (err) {
        console.error(err);
    }
}

main();

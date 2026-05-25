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
        console.log('Downloading dictionary data...');
        // We will fetch korean_dictionary1.json which contains words starting with ㄱ-ㅅ
        const data1 = await fetchURL('https://raw.githubusercontent.com/acidsound/korean_wordlist/master/korean_dictionary1.json');
        
        console.log('Searching for "계란" (egg)...');
        for (const line of data1.split(/\r?\n/)) {
            if (line.includes("'word': '계란'") || line.includes('"word": "계란"')) {
                console.log('Found "계란":');
                console.log(line);
                break;
            }
        }
        
        console.log('\nSearching for "사과" (apple)...');
        for (const line of data1.split(/\r?\n/)) {
            if (line.includes("'word': '사과'") || line.includes('"word": "사과"')) {
                console.log('Found "사과":');
                console.log(line);
            }
        }
        
    } catch (err) {
        console.error(err);
    }
}

main();

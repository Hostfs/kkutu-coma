const https = require('https');

function checkCSV() {
    return new Promise((resolve, reject) => {
        https.get('https://raw.githubusercontent.com/isaac7778/word-chain-korean/master/kr_korean.csv', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const lines = data.split(/\n/);
                console.log(`CSV has ${lines.length} lines.`);
                if (lines.length > 0) {
                    console.log('Sample lines:', lines.slice(0, 10));
                }
                resolve();
            });
        }).on('error', reject);
    });
}

checkCSV();

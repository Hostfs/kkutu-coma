const { Pool } = require('pg');
const GLOBAL = require('./lib/sub/global.json');
const fs = require('fs');

const pool = new Pool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASSWORD,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DATABASE
});

async function main() {
    try {
        const res = await pool.query(
            `SELECT theme, mean, COUNT(*) FROM kkutu_ko 
             WHERE theme IS NOT NULL AND theme != '0' AND theme != '0,0' 
             GROUP BY theme, mean ORDER BY theme, count DESC;`
        );
        
        const themeMap = {};
        res.rows.forEach(r => {
            const themes = r.theme.split(',');
            themes.forEach(t => {
                if (!themeMap[t]) themeMap[t] = [];
                themeMap[t].push({ mean: r.mean, count: r.count });
            });
        });
        
        let outText = "Theme to Meaning mapping in live database:\n";
        for (const t of Object.keys(themeMap).sort((a,b) => parseInt(a)-parseInt(b) || a.localeCompare(b))) {
            outText += `\nTheme '${t}':\n`;
            themeMap[t].slice(0, 3).forEach(m => {
                outText += `  - Count: ${m.count} | Mean: ${m.mean}\n`;
            });
        }
        
        fs.writeFileSync('C:/Users/MS/.gemini/antigravity-cli/brain/155bea12-046a-4957-a9a1-c6347885b9ed/scratch/live_theme_mappings.txt', outText, 'utf-8');
        console.log('Saved to scratch/live_theme_mappings.txt');
        
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();

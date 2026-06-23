const fs = require('fs');
const path = require('path');

const producersPath = path.join(__dirname, '../src/data/producers.json');
const oilsPath = path.join(__dirname, '../src/data/oils.json');

const producers = JSON.parse(fs.readFileSync(producersPath, 'utf8'));
const oils = JSON.parse(fs.readFileSync(oilsPath, 'utf8'));

const webReadyLogosDir = path.join(__dirname, '../web_ready/logos');
const webReadyBottlesDir = path.join(__dirname, '../web_ready/bottles');

const destLogosDir = path.join(__dirname, '../public/images/producers');
const destBottlesDir = path.join(__dirname, '../public/images/oils');

if (!fs.existsSync(destLogosDir)) fs.mkdirSync(destLogosDir, { recursive: true });
if (!fs.existsSync(destBottlesDir)) fs.mkdirSync(destBottlesDir, { recursive: true });

function processDir(srcDir, destDir, type) {
  if (!fs.existsSync(srcDir)) return;
  const files = fs.readdirSync(srcDir);
  
  const groups = {};
  for (const file of files) {
    if (!file.match(/\.(png|webp|jpg)$/)) continue;
    const base = file.replace(/\.[^.]+$/, '');
    if (!groups[base]) groups[base] = [];
    groups[base].push(file);
  }

  for (const base of Object.keys(groups)) {
    const versions = groups[base];
    let chosen = versions.find(v => v.endsWith('.png'));
    if (!chosen) chosen = versions.find(v => v.endsWith('.webp'));
    if (!chosen) chosen = versions[0];
    
    fs.copyFileSync(path.join(srcDir, chosen), path.join(destDir, chosen));
    
    if (type === 'logo') {
      const match = chosen.match(/^logo__(.+?)\./);
      if (match) {
        const slug = match[1];
        const producer = producers.find(p => p.slug === slug);
        if (producer) {
          producer.logo = `/images/producers/${chosen}`;
          console.log(`[Logo] ${slug} -> ${chosen}`);
        }
      }
    } else if (type === 'bottle') {
      const match = chosen.match(/^bottle__(.+?)__(.+?)\./);
      if (match) {
        const producerSlug = match[1];
        const oilSlug = match[2];
        const oil = oils.find(o => o.producerSlug === producerSlug && o.slug === oilSlug);
        if (oil) {
          oil.image = `/images/oils/${chosen}`;
          console.log(`[Bottle] ${oilSlug} -> ${chosen}`);
        }
      }
    }
  }
}

processDir(webReadyLogosDir, destLogosDir, 'logo');
processDir(webReadyBottlesDir, destBottlesDir, 'bottle');

fs.writeFileSync(producersPath, JSON.stringify(producers, null, 2));
fs.writeFileSync(oilsPath, JSON.stringify(oils, null, 2));

console.log("Integration complete.");

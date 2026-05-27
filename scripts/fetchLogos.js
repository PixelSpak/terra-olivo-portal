const fs = require('fs');
const path = require('path');
const axios = require('axios');

const producersDataPath = path.join(__dirname, '../src/data/producers.json');
const logosDir = path.join(__dirname, '../public/images/producers');

if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

async function run() {
  const producers = JSON.parse(fs.readFileSync(producersDataPath, 'utf8'));
  let updated = 0;
  
  for (const producer of producers) {
    if (producer.website && !producer.logo) {
      try {
        const hostname = new URL(producer.website).hostname.replace(/^www\./, '');
        // We will try icon.horse first (very high res)
        const logoUrl = `https://icon.horse/icon/${hostname}`;
        const destPath = path.join(logosDir, `${producer.slug}.png`);
        
        console.log(`Downloading logo for ${hostname}...`);
        
        const response = await axios({
          url: logoUrl,
          method: 'GET',
          responseType: 'arraybuffer',
          timeout: 10000
        });
        
        // icon.horse returns 200 even for fallback. We will just save it.
        fs.writeFileSync(destPath, response.data);
        producer.logo = `/images/producers/${producer.slug}.png`;
        updated++;
      } catch (err) {
        console.error(`Failed logo for ${producer.website}: ${err.message}`);
      }
    }
  }
  
  if (updated > 0) {
    fs.writeFileSync(producersDataPath, JSON.stringify(producers, null, 2), 'utf8');
    console.log(`Updated ${updated} logos!`);
  }
}

run().catch(console.error);

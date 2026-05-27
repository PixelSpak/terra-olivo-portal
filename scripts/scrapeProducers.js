const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const https = require('https');

const producersDataPath = path.join(__dirname, '../src/data/producers.json');
const logosDir = path.join(__dirname, '../public/images/producers');

if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(false);
        return;
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      resolve(false);
    });
  });
}

function extractDomain(url) {
  try {
    let hostname = new URL(url).hostname;
    hostname = hostname.replace(/^www\./, '');
    return hostname;
  } catch (e) {
    return null;
  }
}

async function run() {
  const producers = JSON.parse(fs.readFileSync(producersDataPath, 'utf8'));
  
  // Filter out ones we've already done
  const toProcess = producers.filter(p => p.description.includes('is an award-winning olive oil producer from'));
  
  console.log(`Found ${toProcess.length} producers to scrape...`);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  let processed = 0;
  
  for (const producer of toProcess) {
    processed++;
    console.log(`\n[${processed}/${toProcess.length}] Processing: ${producer.name}`);
    
    try {
      const query = encodeURIComponent(`${producer.name} olive oil`);
      await page.goto(`https://html.duckduckgo.com/html/?q=${query}`, { waitUntil: 'networkidle2', timeout: 15000 });
      
      const result = await page.evaluate(() => {
        const results = Array.from(document.querySelectorAll('.result'));
        
        let bestUrl = null;
        let bestSnippet = null;
        
        for (const res of results) {
          const a = res.querySelector('.result__url');
          const snippet = res.querySelector('.result__snippet');
          if (a && snippet) {
            const href = a.getAttribute('href');
            // Decode DDG url
            let realUrl = '';
            if (href.includes('uddg=')) {
                try {
                    realUrl = decodeURIComponent(href.split('uddg=')[1].split('&')[0]);
                } catch(e) {}
            } else {
                realUrl = href;
            }
            
            // Skip aggregators
            if (!realUrl.includes('facebook.com') && 
                !realUrl.includes('instagram.com') && 
                !realUrl.includes('evoorankings.com') &&
                !realUrl.includes('bestoliveoils.') &&
                !realUrl.includes('oliveoiltimes.com') &&
                !realUrl.includes('linkedin.com')) {
              bestUrl = realUrl;
              bestSnippet = snippet.textContent.trim();
              break;
            }
          }
        }
        
        // If no good URL found, just take the first snippet anyway
        if (!bestSnippet && results[0]) {
            const s = results[0].querySelector('.result__snippet');
            if (s) bestSnippet = s.textContent.trim();
        }
        
        return { url: bestUrl, snippet: bestSnippet };
      });
      
      if (result.snippet) {
        // Only update description if it's substantial
        if (result.snippet.length > 30) {
            producer.description = result.snippet;
            console.log(`  Updated description: ${result.snippet.substring(0, 50)}...`);
        }
      }
      
      if (result.url) {
        const domain = extractDomain(result.url);
        if (domain) {
            producer.website = `https://${domain}`;
            
            const logoPath = path.join(logosDir, `${producer.slug}.png`);
            // Try to get a high-res favicon using Google
            const success = await downloadImage(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`, logoPath);
            
            if (success) {
                // Verify the downloaded file isn't just an empty/generic 16x16 icon (check size)
                const stats = fs.statSync(logoPath);
                if (stats.size > 500) { // arbitrary small size to filter out empty 1px gifs
                    producer.logo = `/images/producers/${producer.slug}.png`;
                    console.log(`  Downloaded logo for ${domain}`);
                } else {
                    fs.unlinkSync(logoPath);
                }
            }
        }
      }
      
      // Save progress
      fs.writeFileSync(producersDataPath, JSON.stringify(producers, null, 2), 'utf8');
      
      // Sleep slightly to avoid rate limit
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (err) {
      console.error(`  Error processing ${producer.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('\nFinished processing all producers!');
}

run().catch(console.error);

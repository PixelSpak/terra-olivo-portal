const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const https = require('https');
const axios = require('axios');
const { removeBackground } = require('@imgly/background-removal-node');

const oilsDataPath = path.join(__dirname, '../src/data/oils.json');
const imagesDir = path.join(__dirname, '../public/images/oils');
const tempDir = path.join(__dirname, '../public/images/temp');

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

async function downloadImage(url, destPath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    });
    fs.writeFileSync(destPath, response.data);
    return true;
  } catch (err) {
    return false;
  }
}

async function run() {
  const oils = JSON.parse(fs.readFileSync(oilsDataPath, 'utf8'));
  const missing = oils.filter(o => !o.image);
  
  console.log(`Found ${missing.length} oils without images. Starting scrape...`);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  let processed = 0;
  
  for (const oil of missing) {
    processed++;
    console.log(`\n[${processed}/${missing.length}] Processing: ${oil.name}`);
    const query = encodeURIComponent(`${oil.name} olive oil bottle`);
    
    // We use duckduckgo HTML search (doesn't require JS, very fast)
    // Wait, DDG HTML search doesn't easily show large images. Let's try Google Images with Puppeteer.
    try {
      await page.goto(`https://duckduckgo.com/?q=${query}&iax=images&ia=images`, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for image tiles to appear
      await page.waitForSelector('.tile--img__img', { timeout: 10000 }).catch(() => {});
      
      const imageUrls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => img.src).filter(src => src && src.includes('external-content') && !src.endsWith('.ico'));
      });
      
      if (imageUrls.length === 0) {
        console.log(`  No images found for ${oil.name}`);
        continue;
      }
      
      // Take the first valid image
      const bestUrl = imageUrls[0];
      const tempPath = path.join(tempDir, `${oil.slug}_temp.jpg`);
      const finalPath = path.join(imagesDir, `${oil.slug}.png`);
      
      console.log(`  Found image, downloading...`);
      const success = await downloadImage(bestUrl, tempPath);
      
      if (success) {
        console.log(`  Downloaded successfully. Removing background...`);
        // Remove background
        const blob = new Blob([fs.readFileSync(tempPath)], { type: 'image/jpeg' });
        const transparentBlob = await removeBackground(blob, {
          output: { format: 'image/png' },
          debug: false
        });
        
        const arrayBuffer = await transparentBlob.arrayBuffer();
        fs.writeFileSync(finalPath, Buffer.from(arrayBuffer));
        
        console.log(`  Background removed! Saved to ${oil.slug}.png`);
        oil.image = `/images/oils/${oil.slug}.png`;
        
        // Save progress immediately so we don't lose data if it crashes
        fs.writeFileSync(oilsDataPath, JSON.stringify(oils, null, 2), 'utf8');
      }
      
    } catch (err) {
      console.error(`  Error processing ${oil.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('\nFinished processing all images!');
}

run().catch(console.error);

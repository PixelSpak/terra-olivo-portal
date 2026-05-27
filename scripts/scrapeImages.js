const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');

const oilsDataPath = path.join(__dirname, '../src/data/oils.json');
const imagesDir = path.join(__dirname, '../public/images/oils');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function downloadImage(url, dest) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      }
    });
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(dest);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}: ${error.message}`);
    return false;
  }
}

async function run() {
  const rawData = fs.readFileSync(oilsDataPath, 'utf8');
  const oils = JSON.parse(rawData);
  
  console.log(`Loaded ${oils.length} oils.`);

  // Launch in non-headless mode to bypass basic bot protections
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1200,800']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // We test on the first 10 oils
  let updatedCount = 0;
  let attempts = 0;

  for (let oil of oils) {
    if (attempts >= 10) break;
    attempts++;

    console.log(`Searching for: ${oil.name}...`);
    try {
      const searchUrl = `https://bestoliveoils.org/search?q=${encodeURIComponent(oil.name)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      await new Promise(r => setTimeout(r, 2000));

      // Extract the actual image SRC instead of taking a screenshot
      const imageUrl = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        let bestSrc = null;
        let maxHeight = 0;
        
        for (const img of imgs) {
          const rect = img.getBoundingClientRect();
          if (rect.height > 100 && rect.height > rect.width) {
            if (rect.height > maxHeight) {
              maxHeight = rect.height;
              bestSrc = img.src;
            }
          }
        }
        return bestSrc;
      });

      if (imageUrl) {
        console.log(`Found image URL for ${oil.name}: ${imageUrl}`);
        const fileName = `${oil.slug}.png`;
        const filePath = path.join(imagesDir, fileName);
        
        const downloaded = await downloadImage(imageUrl, filePath);
        
        if (downloaded !== false) {
          console.log(`Successfully downloaded original bottle image for ${oil.name}`);
          oil.image = `/images/oils/${fileName}`;
          updatedCount++;
        }
      } else {
        console.log(`Could not find a clear bottle image on the page for ${oil.name}`);
      }

    } catch (err) {
      console.error(`Error processing ${oil.name}:`, err.message);
    }
  }

  await browser.close();

  if (updatedCount > 0) {
    fs.writeFileSync(oilsDataPath, JSON.stringify(oils, null, 2), 'utf8');
    console.log(`\nSuccess! Updated ${updatedCount} oils in oils.json.`);
  } else {
    console.log(`\nNo updates made.`);
  }
}

run().catch(console.error);

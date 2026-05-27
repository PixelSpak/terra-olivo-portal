const puppeteer = require('puppeteer');
const fs = require('fs');

async function test() {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // We search for a known producer
  const query = encodeURIComponent("BVS JerusalemOliveOil logo");
  await page.goto(`https://www.google.com/search?tbm=isch&q=${query}`, { waitUntil: 'networkidle2' });
  
  const imgUrl = await page.evaluate(() => {
    // Find the first image thumbnail that is not a navigation icon
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.src && img.src.startsWith('http') && img.width > 50 && img.height > 50) {
        return img.src;
      }
    }
    return null;
  });
  
  console.log('Found image:', imgUrl);
  await browser.close();
}

test();

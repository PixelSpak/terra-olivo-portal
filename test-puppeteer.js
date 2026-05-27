const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Go to search page
  await page.goto('https://bestoliveoils.org/search', { waitUntil: 'networkidle2' });
  
  // Search for Belvedere
  await page.type('input[type="search"]', 'Belvedere');
  
  // Wait for network to settle
  await new Promise(r => setTimeout(r, 2000));
  
  const results = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.map(img => img.src).filter(src => src.includes('bestoliveoils'));
  });
  
  console.log(results);
  await browser.close();
})();

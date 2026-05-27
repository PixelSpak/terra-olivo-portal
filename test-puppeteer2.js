const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Intercept network requests to find Algolia credentials
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('algolia')) {
      console.log('Algolia request:', req.url());
      console.log('Algolia payload:', req.postData());
      console.log('Algolia headers:', req.headers());
    }
    req.continue();
  });
  
  await page.goto('https://bestoliveoils.org/search', { waitUntil: 'networkidle2' });
  await browser.close();
})();

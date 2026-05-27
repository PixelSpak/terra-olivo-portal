const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://bestoliveoils.org/search?q=Al+Zait+Picual', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const src = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    let best = null, maxH = 0;
    for (const img of imgs) {
      if (img.getBoundingClientRect().height > maxH) {
        maxH = img.getBoundingClientRect().height;
        best = img.src;
      }
    }
    return best;
  });

  console.log("Found src:", src);
  await browser.close();
})();

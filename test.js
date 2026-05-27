const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://bestoliveoils.org/search?q=42+Premium+Blend');
  const html = await page.content();
  console.log(html.substring(0, 500));
  const fs = require('fs');
  fs.writeFileSync('page.html', html);
  await browser.close();
})();

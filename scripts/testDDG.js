const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.goto('https://duckduckgo.com/?q=Ptora+Midnight+Picual+olive+oil+bottle&iax=images&ia=images', { waitUntil: 'networkidle2' });
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => i.src);
  });
  console.log('Images found:', imgs.length);
  console.log('First 5:', imgs.slice(0, 5));
  await browser.close();
}
run();

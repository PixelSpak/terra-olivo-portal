const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  await page.goto('https://html.duckduckgo.com/html/?q=' + encodeURIComponent('A.M.G. Karabelas PC olive oil producer'), { waitUntil: 'networkidle2' });
  
  const result = await page.evaluate(() => {
    const firstResult = document.querySelector('.result__url');
    const snippet = document.querySelector('.result__snippet');
    return {
      url: firstResult ? firstResult.href : null,
      text: firstResult ? firstResult.textContent.trim() : null,
      snippet: snippet ? snippet.textContent.trim() : null
    };
  });
  
  console.log('Result:', result);
  await browser.close();
}

test();

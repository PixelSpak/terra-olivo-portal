const fs = require('fs');
const path = require('path');
const https = require('https');

const csvPath = '/Users/gilhasson/Downloads/products_final.csv';
const oilsDataPath = path.join(__dirname, '../src/data/oils.json');
const imagesDir = path.join(__dirname, '../public/images/oils');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

function normalizeWords(str) {
  if (!str) return [];
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
}

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    let inQuotes = false;
    let currentVal = '';
    const values = [];
    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal);
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] ? values[index].trim() : '';
    });
    results.push(obj);
  }
  return results;
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status: ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const csvData = parseCSV(csvContent);
  const oils = JSON.parse(fs.readFileSync(oilsDataPath, 'utf8'));

  let matchedCount = 0;
  let downloadedCount = 0;

  for (const oil of oils) {
    const localWords = normalizeWords(oil.name);
    if (localWords.length === 0) continue;

    let bestMatch = null;
    let bestScore = 0;

    for (const row of csvData) {
      if (!row.product_name) continue;
      const csvWords = normalizeWords(row.product_name);
      if (csvWords.length === 0) continue;

      // Count intersecting words
      let overlap = 0;
      for (const w of localWords) {
        if (csvWords.includes(w)) overlap++;
      }
      
      // We need strong confidence. At least 60% of local words must be in CSV words
      const score = overlap / Math.max(localWords.length, csvWords.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = row;
      }
    }

    // Threshold for matching
    if (bestScore > 0.5 && bestMatch && bestMatch.main_image) {
      // Don't overwrite if we already have it from earlier tests, unless it's missing
      const fileName = `${oil.slug}.png`;
      const destPath = path.join(imagesDir, fileName);
      
      console.log(`Matched [${oil.name}] <-> [${bestMatch.product_name}] (Score: ${bestScore.toFixed(2)})`);
      try {
        await downloadImage(bestMatch.main_image, destPath);
        oil.image = `/images/oils/${fileName}`;
        matchedCount++;
        downloadedCount++;
      } catch (err) {
        console.error(`Failed to download for ${oil.name}:`, err.message);
      }
    }
  }

  if (downloadedCount > 0) {
    fs.writeFileSync(oilsDataPath, JSON.stringify(oils, null, 2), 'utf8');
    console.log(`\nDone! Matched ${matchedCount} and downloaded ${downloadedCount} images.`);
  } else {
    console.log('\nNo strong matches found.');
  }
}

run().catch(console.error);

const fs = require('fs');
const path = require('path');
const { removeBackground } = require('@imgly/background-removal-node');

const oilsDataPath = path.join(__dirname, '../src/data/oils.json');
const publicDir = path.join(__dirname, '../public');

async function run() {
  const oils = JSON.parse(fs.readFileSync(oilsDataPath, 'utf8'));
  const jpgOils = oils.filter(o => o.image && o.image.endsWith('.jpg'));
  
  console.log(`Found ${jpgOils.length} JPG oils to process.`);
  
  for (const oil of jpgOils) {
    console.log(`Processing: ${oil.name}`);
    const inputPath = path.join(publicDir, oil.image.replace(/^\//, ''));
    const finalPath = path.join(publicDir, 'images/oils', `${oil.slug}.png`);
    
    if (!fs.existsSync(inputPath)) {
      console.error(`  File not found: ${inputPath}`);
      continue;
    }
    
    try {
      const blob = new Blob([fs.readFileSync(inputPath)], { type: 'image/jpeg' });
      const transparentBlob = await removeBackground(blob, {
        output: { format: 'image/png' },
        debug: false
      });
      
      const arrayBuffer = await transparentBlob.arrayBuffer();
      fs.writeFileSync(finalPath, Buffer.from(arrayBuffer));
      
      console.log(`  Background removed! Saved to ${oil.slug}.png`);
      
      // Update oil json
      oil.image = `/images/oils/${oil.slug}.png`;
      fs.writeFileSync(oilsDataPath, JSON.stringify(oils, null, 2), 'utf8');
      
      // Optional: Delete the old JPG
      fs.unlinkSync(inputPath);
    } catch (err) {
      console.error(`  Error processing ${oil.name}:`, err.message);
    }
  }
  
  console.log('Finished processing JPGs!');
}

run().catch(console.error);

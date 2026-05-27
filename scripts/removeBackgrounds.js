const fs = require('fs');
const path = require('path');
const { removeBackground } = require('@imgly/background-removal-node');

const imagesDir = path.join(__dirname, '../public/images/oils');

async function processImages() {
  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') && !f.includes('_nobg'));
  
  if (files.length === 0) {
    console.log('No PNG files found to process.');
    return;
  }

  console.log(`Found ${files.length} images. Starting background removal...`);

  for (const file of files) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file); // Overwrite the original

    console.log(`Processing: ${file}`);
    try {
      const blob = await removeBackground(inputPath);
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      console.log(`  -> Success! Background removed for ${file}`);
    } catch (err) {
      console.error(`  -> Failed for ${file}:`, err.message);
    }
  }

  console.log('All done!');
}

processImages().catch(console.error);

/**
 * Normalize all bottle images to a consistent format:
 *   - 600x800 portrait canvas
 *   - White background
 *   - Bottle fit (object-contain) with 40px padding
 *   - Saved as .jpg with high quality
 *
 * Usage: node scripts/normalize-images.mjs
 */

import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, renameSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, "../public/images");
const TMP_DIR = join(__dirname, "../public/images/_normalized");
const WIDTH   = 600;
const HEIGHT  = 800;
const PADDING = 40;

mkdirSync(TMP_DIR, { recursive: true });

const files = readdirSync(SRC_DIR).filter(f =>
  /\.(jpg|jpeg|png|webp)$/i.test(f) && statSync(join(SRC_DIR, f)).isFile()
);

console.log(`Normalizing ${files.length} bottle images → ${WIDTH}×${HEIGHT} white background...\n`);

let ok = 0, fail = 0;
for (const f of files) {
  const inPath  = join(SRC_DIR, f);
  const outName = f.replace(/\.(jpg|jpeg|png|webp)$/i, ".jpg");
  const outPath = join(TMP_DIR, outName);
  try {
    await sharp(inPath)
      .resize(WIDTH - 2 * PADDING, HEIGHT - 2 * PADDING, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .extend({
        top: PADDING, bottom: PADDING, left: PADDING, right: PADDING,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(outPath);
    ok++;
  } catch (e) {
    console.error(`✗ ${f}: ${e.message}`);
    fail++;
  }
}

console.log(`\n✅ Normalized: ${ok} / ${files.length}`);
if (fail) console.log(`✗ Failed: ${fail}`);

// Replace originals with normalized versions
console.log(`\nReplacing originals with normalized versions...`);
for (const f of readdirSync(TMP_DIR)) {
  const newName = f;
  const dst = join(SRC_DIR, newName);
  // Remove any old version (could be .png/.webp etc.)
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const oldPath = join(SRC_DIR, newName.replace(/\.jpg$/, ext));
    if (existsSync(oldPath) && oldPath !== dst) unlinkSync(oldPath);
  }
  renameSync(join(TMP_DIR, f), dst);
}
// Clean up tmp dir
try { require("fs").rmdirSync(TMP_DIR); } catch {}

console.log(`✅ All images normalized in place.`);

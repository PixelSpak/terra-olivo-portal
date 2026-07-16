import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const groups = [
  {
    dir: "public/images/oils",
    maxWidth: 900,
    maxHeight: 1200,
    quality: 82,
  },
  {
    dir: "public/images/temp_bottles",
    maxWidth: 900,
    maxHeight: 1200,
    quality: 82,
  },
  {
    dir: "public/images/producers",
    maxWidth: 512,
    maxHeight: 512,
    quality: 84,
  },
  {
    dir: "public/sponsors",
    maxWidth: 360,
    maxHeight: 180,
    quality: 84,
  },
];

const dataFiles = [
  "src/data/oils.json",
  "src/data/producers.json",
  "src/data/producer-awards.json",
];

const sourceExtPattern = /\.(png|jpe?g)$/i;
const replacements = new Map();
let converted = 0;
let skipped = 0;
let savedBytes = 0;
const errors = [];
const concurrency = 6;

async function listImageFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && sourceExtPattern.test(entry.name))
    .map((entry) => path.join(dir, entry.name));
}

async function convertImage(filePath, group) {
  const parsed = path.parse(filePath);
  const outputPath = path.join(parsed.dir, `${parsed.name}.webp`);
  const before = (await fs.stat(filePath)).size;
  const publicPath = `/${path.relative(path.join(root, "public"), filePath).split(path.sep).join("/")}`;
  const webpPublicPath = publicPath.replace(sourceExtPattern, ".webp");

  try {
    const existing = await fs.stat(outputPath);
    if (existing.size < before) {
      replacements.set(publicPath, webpPublicPath);
      skipped += 1;
      savedBytes += before - existing.size;
      return;
    }
  } catch {
    // No existing WebP yet.
  }

  try {
    await sharp(filePath)
      .rotate()
      .resize({
        width: group.maxWidth,
        height: group.maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: group.quality,
        effort: 4,
      })
      .toFile(outputPath);
  } catch (error) {
    skipped += 1;
    errors.push({
      file: path.relative(root, filePath),
      message: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  const after = (await fs.stat(outputPath)).size;
  if (after >= before) {
    skipped += 1;
    return;
  }

  replacements.set(publicPath, webpPublicPath);
  converted += 1;
  savedBytes += before - after;
}

async function runWithConcurrency(items, worker) {
  let index = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (index < items.length) {
        const item = items[index];
        index += 1;
        await worker(item);
      }
    },
  );

  await Promise.all(runners);
}

function replaceImageReferences(value) {
  if (typeof value === "string") {
    return replacements.get(value) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map(replaceImageReferences);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        replaceImageReferences(entryValue),
      ]),
    );
  }

  return value;
}

async function updateDataFile(relativeFile) {
  const filePath = path.join(root, relativeFile);
  const current = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(current);
  const updated = `${JSON.stringify(replaceImageReferences(parsed), null, 2)}\n`;

  if (updated !== current) {
    await fs.writeFile(filePath, updated);
    return true;
  }

  return false;
}

for (const group of groups) {
  const absoluteDir = path.join(root, group.dir);
  const files = await listImageFiles(absoluteDir);
  await runWithConcurrency(files, (file) => convertImage(file, group));
}

let updatedDataFiles = 0;
for (const dataFile of dataFiles) {
  if (await updateDataFile(dataFile)) {
    updatedDataFiles += 1;
  }
}

console.log(
  JSON.stringify(
    {
      converted,
      skipped,
      errors,
      updatedDataFiles,
      savedMB: Number((savedBytes / 1024 / 1024).toFixed(2)),
    },
    null,
    2,
  ),
);

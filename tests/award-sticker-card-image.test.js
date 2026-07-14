const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const sharp = require("sharp");

const awardStickers = require("../src/data/award-stickers.json");

test("Best of Australia uses a transparent sticker asset in card views", async () => {
  const sticker = awardStickers.find(
    (entry) => entry.year === 2026 && entry.slug === "best-of-australia",
  );

  assert.ok(sticker, "expected Best of Australia sticker metadata");
  assert.equal(
    sticker.image,
    "/images/award-stickers/2026/best-of-australia.png",
  );
  assert.equal(
    sticker.cardImage,
    "/images/award-stickers/2026/best-of-australia-card.png",
  );

  const cardImagePath = path.join(process.cwd(), "public", sticker.cardImage);
  assert.ok(fs.existsSync(cardImagePath), "expected card sticker image");

  const metadata = await sharp(cardImagePath).metadata();
  assert.equal(metadata.hasAlpha, true);

  const { data, info } = await sharp(cardImagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const alphaAt = (x, y) => data[(y * info.width + x) * info.channels + 3];

  assert.equal(alphaAt(0, 0), 0);
  assert.equal(alphaAt(info.width - 1, 0), 0);
  assert.equal(alphaAt(0, info.height - 1), 0);
  assert.equal(alphaAt(info.width - 1, info.height - 1), 0);
});

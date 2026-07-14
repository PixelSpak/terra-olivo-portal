const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const oils = require("../src/data/oils.json");
const producers = require("../src/data/producers.json");
const awardStickers = require("../src/data/award-stickers.json");

test("Lisadurne Hill Hojiblanca has the 2026 Best of Australia special award", () => {
  const oil = oils.find((entry) => entry.slug === "lisadurne-hill-hojiblanca");
  assert.ok(oil, "expected Lisadurne Hill Hojiblanca oil record");
  assert.equal(oil.name, "Lisadurne Hill Hojiblanca");

  const producer = producers.find((entry) => entry.slug === oil.producerSlug);
  assert.ok(producer, "expected producer record for the oil");
  assert.equal(producer.name, "Lisadurne Hill");

  const award = oil.awards.find(
    (entry) => entry.year === 2026 && entry.prize === "Best of Australia",
  );
  assert.ok(award, "expected 2026 Best of Australia award");
  assert.equal(award.category, "Special Award");
  assert.equal(
    award.certificatePdf,
    "/certificates/special-awards/2026/lisadurne-hill-hojiblanca-best-of-australia.pdf",
  );
  assert.ok(
    fs.existsSync(path.join(process.cwd(), "public", award.certificatePdf)),
    "expected local Best of Australia certificate PDF",
  );

  const sticker = awardStickers.find(
    (entry) => entry.year === 2026 && entry.slug === "best-of-australia",
  );
  assert.ok(sticker, "expected 2026 Best of Australia award sticker");
  assert.equal(sticker.label, "Best of Australia");
  assert.ok(
    fs.existsSync(path.join(process.cwd(), "public", sticker.image)),
    "expected local Best of Australia sticker image",
  );
});

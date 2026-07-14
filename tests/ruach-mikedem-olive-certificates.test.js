const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const oils = require("../src/data/oils.json");
const producers = require("../src/data/producers.json");

function publicFileHash(publicPath) {
  const filePath = path.join(process.cwd(), "public", publicPath);
  assert.ok(fs.existsSync(filePath), `expected ${publicPath} to exist`);
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

test("Ruach Mikedem Olive winner has the correct names and certificates", () => {
  const oil = oils.find((entry) => entry.slug === "ruach-mekedem-blend");
  assert.ok(oil, "expected Ruach Mikedem Olive oil record");
  assert.equal(oil.name, "Olive");
  assert.equal(oil.description, "Olive is an award-winning extra virgin olive oil from Israel.");
  assert.equal(oil.certificate, undefined, "expected local award PDFs instead of legacy certificate");

  const producer = producers.find((entry) => entry.slug === oil.producerSlug);
  assert.ok(producer, "expected producer record for the oil");
  assert.equal(producer.name, "Ruach Mikedem");

  const grandPrestigeGold = oil.awards.find(
    (entry) => entry.year === 2026 && entry.prize === "Grand Prestige Gold",
  );
  assert.ok(grandPrestigeGold, "expected 2026 Grand Prestige Gold award");
  assert.equal(
    grandPrestigeGold.certificatePdf,
    "/certificates/awards/2026/ruach-mekedem-blend-grand-prestige-gold.pdf",
  );
  assert.equal(
    publicFileHash(grandPrestigeGold.certificatePdf),
    "c2d4b715592bd45167e97f07100348ad7ca03cf90d5a63ce8d90f860b13a51bf",
  );

  const familyBoutique = oil.awards.find(
    (entry) =>
      entry.year === 2026 &&
      entry.prize === "Best Israeli family Boutique Grand Champion",
  );
  assert.ok(familyBoutique, "expected 2026 Best Israeli family Boutique award");
  assert.equal(familyBoutique.category, "Special Award");
  assert.equal(
    familyBoutique.certificatePdf,
    "/certificates/special-awards/2026/ruach-mekedem-blend-best-israeli-family-boutique-grand-champion.pdf",
  );
  assert.equal(
    publicFileHash(familyBoutique.certificatePdf),
    "2eccc666a51c0041858e71d75e7d45b128ce220521b3b95ca14cc74e7118df89",
  );
});

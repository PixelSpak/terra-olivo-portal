const assert = require("node:assert/strict");
const test = require("node:test");

const {
  TEMP_BOTTLE_IMAGE,
  fallbackOilImageSrc,
} = require("../src/lib/imageFallback.js");

test("falls back missing oil image requests to the temp bottle", () => {
  assert.equal(
    fallbackOilImageSrc("/images/oils/missing-bottle.png"),
    TEMP_BOTTLE_IMAGE,
  );
});

test("keeps the temp bottle fallback stable", () => {
  assert.equal(fallbackOilImageSrc(TEMP_BOTTLE_IMAGE), TEMP_BOTTLE_IMAGE);
  assert.equal(fallbackOilImageSrc(undefined), TEMP_BOTTLE_IMAGE);
});

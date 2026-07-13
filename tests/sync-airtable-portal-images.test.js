const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const sharp = require("sharp");

const {
  createAirtableClient,
  removeWhiteBackgroundFromImage,
  syncAirtablePortalImages,
} = require("../scripts/sync-airtable-portal-images.js");

function makePortalFixture(oils) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "terra-sync-"));
  fs.mkdirSync(path.join(rootDir, "src/data"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "public/images/oils"), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "src/data/oils.json"),
    JSON.stringify(
      oils ?? [
        {
          slug: "knolive-epicure",
          name: "Knolive Epicure",
          producerSlug: "knolive-oils-sl",
          image: "/images/tempbottle_image.png",
          awards: [],
        },
      ],
      null,
      2,
    ),
    "utf8",
  );
  return rootDir;
}

test("syncs Update records into portal oil images and marks Airtable row Done", async () => {
  const rootDir = makePortalFixture();
  const markedDone = [];
  const result = await syncAirtablePortalImages({
    rootDir,
    dryRun: false,
    airtableClient: {
      async listRecordsToUpdate() {
        return [
          {
            id: "rec123",
            fields: {
              Status: "Update",
              "Olive oil name": "Knolive Epicure",
              "Company name": "Knolive Oils S.L.",
              Attachments: [
                {
                  filename: "official-bottle.png",
                  type: "image/png",
                  url: "https://example.com/official-bottle.png",
                },
              ],
            },
          },
        ];
      },
      async markRecordDone(recordId) {
        markedDone.push(recordId);
      },
    },
    downloadAttachment: async () => ({
      buffer: Buffer.from("fake image bytes"),
      contentType: "image/png",
    }),
    processImage: async ({ buffer, contentType }) => ({ buffer, contentType }),
  });

  const oils = JSON.parse(
    fs.readFileSync(path.join(rootDir, "src/data/oils.json"), "utf8"),
  );
  assert.equal(result.updated, 1);
  assert.equal(result.failed, 0);
  assert.deepEqual(markedDone, ["rec123"]);
  assert.equal(
    oils[0].image,
    "/images/oils/bottle__knolive-oils-sl__knolive-epicure.png",
  );
  assert.equal(oils[0].format, "good");
  assert.equal(
    fs.readFileSync(
      path.join(
        rootDir,
        "public/images/oils/bottle__knolive-oils-sl__knolive-epicure.png",
      ),
      "utf8",
    ),
    "fake image bytes",
  );
});

test("prefers portal oil slug over name matching", async () => {
  const rootDir = makePortalFixture([
    {
      slug: "first-oil",
      name: "Shared Oil Name",
      producerSlug: "producer-one",
      awards: [],
    },
    {
      slug: "second-oil",
      name: "Shared Oil Name",
      producerSlug: "producer-two",
      awards: [],
    },
  ]);

  const result = await syncAirtablePortalImages({
    rootDir,
    dryRun: false,
    airtableClient: {
      async listRecordsToUpdate() {
        return [
          {
            id: "rec456",
            fields: {
              Status: "Update",
              "Portal oil slug": "second-oil",
              "Portal producer slug": "producer-two",
              "Olive oil name": "Shared Oil Name",
              Attachments: [
                {
                  filename: "bottle.webp",
                  type: "image/webp",
                  url: "https://example.com/bottle.webp",
                },
              ],
            },
          },
        ];
      },
      async markRecordDone() {},
    },
    downloadAttachment: async () => ({
      buffer: Buffer.from("webp bytes"),
      contentType: "image/webp",
    }),
    processImage: async ({ buffer, contentType }) => ({ buffer, contentType }),
  });

  const oils = JSON.parse(
    fs.readFileSync(path.join(rootDir, "src/data/oils.json"), "utf8"),
  );
  assert.equal(result.updated, 1);
  assert.equal(oils[0].image, undefined);
  assert.equal(
    oils[1].image,
    "/images/oils/bottle__producer-two__second-oil.webp",
  );
});

test("removes only edge-connected white backgrounds from uploaded bottle images", async () => {
  const width = 5;
  const height = 5;
  const pixels = Buffer.alloc(width * height * 4, 255);

  function setPixel(x, y, rgba) {
    const offset = (y * width + x) * 4;
    pixels[offset] = rgba[0];
    pixels[offset + 1] = rgba[1];
    pixels[offset + 2] = rgba[2];
    pixels[offset + 3] = rgba[3];
  }

  for (const [x, y] of [
    [1, 1],
    [2, 1],
    [3, 1],
    [1, 2],
    [3, 2],
    [1, 3],
    [2, 3],
    [3, 3],
  ]) {
    setPixel(x, y, [48, 82, 36, 255]);
  }

  const input = await sharp(pixels, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  const result = await removeWhiteBackgroundFromImage(input);
  const { data } = await sharp(result.buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  function alphaAt(x, y) {
    return data[(y * width + x) * 4 + 3];
  }

  assert.equal(result.contentType, "image/png");
  assert.equal(result.extension, "png");
  assert.equal(alphaAt(0, 0), 0);
  assert.equal(alphaAt(4, 4), 0);
  assert.equal(alphaAt(2, 2), 255);
  assert.equal(alphaAt(1, 2), 255);
});

test("sync writes the processed transparent PNG from uploaded images", async () => {
  const rootDir = makePortalFixture();
  const uploadedTransparentImages = [];

  const result = await syncAirtablePortalImages({
    rootDir,
    dryRun: false,
    airtableClient: {
      async listRecordsToUpdate() {
        return [
          {
            id: "rec789",
            fields: {
              Status: "Update",
              "Portal oil slug": "knolive-epicure",
              Attachments: [
                {
                  filename: "official-bottle.jpg",
                  type: "image/jpeg",
                  url: "https://example.com/official-bottle.jpg",
                },
              ],
            },
          },
        ];
      },
      async markRecordDone() {},
      async uploadTransparentBackgroundAttachment(recordId, image) {
        uploadedTransparentImages.push({
          recordId,
          filename: image.filename,
          contentType: image.contentType,
          buffer: image.buffer.toString("utf8"),
        });
      },
    },
    downloadAttachment: async () => ({
      buffer: Buffer.from("jpg bytes"),
      contentType: "image/jpeg",
    }),
    processImage: async ({ buffer }) => ({
      buffer: Buffer.concat([Buffer.from("transparent:"), buffer]),
      contentType: "image/png",
      extension: "png",
    }),
  });

  const oils = JSON.parse(
    fs.readFileSync(path.join(rootDir, "src/data/oils.json"), "utf8"),
  );

  assert.equal(result.updated, 1);
  assert.equal(
    oils[0].image,
    "/images/oils/bottle__knolive-oils-sl__knolive-epicure.png",
  );
  assert.equal(
    fs.readFileSync(
      path.join(
        rootDir,
        "public/images/oils/bottle__knolive-oils-sl__knolive-epicure.png",
      ),
      "utf8",
    ),
    "transparent:jpg bytes",
  );
  assert.deepEqual(uploadedTransparentImages, [
    {
      recordId: "rec789",
      filename: "bottle__knolive-oils-sl__knolive-epicure.png",
      contentType: "image/png",
      buffer: "transparent:jpg bytes",
    },
  ]);
});

test("Airtable client uploads transparent images to the Transparent bg attachment field", async () => {
  const requests = [];
  const client = createAirtableClient({
    token: "pat123",
    baseId: "app123",
    tableName: "tbl123",
    transparentBgField: "Transparent bg",
    fetchImpl: async (url, init) => {
      requests.push({ url: String(url), init });
      return {
        ok: true,
        async json() {
          return { id: "rec123", fields: {} };
        },
      };
    },
  });

  await client.uploadTransparentBackgroundAttachment("rec123", {
    buffer: Buffer.from("transparent png"),
    contentType: "image/png",
    filename: "bottle.png",
  });

  assert.equal(
    requests[0].url,
    "https://api.airtable.com/v0/app123/rec123/Transparent%20bg/uploadAttachment",
  );
  assert.equal(requests[0].init.method, "POST");
  assert.equal(requests[0].init.headers.Authorization, "Bearer pat123");
  assert.deepEqual(JSON.parse(requests[0].init.body), {
    contentType: "image/png",
    file: "dHJhbnNwYXJlbnQgcG5n",
    filename: "bottle.png",
  });
});

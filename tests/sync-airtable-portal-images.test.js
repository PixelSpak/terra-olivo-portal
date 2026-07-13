const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const sharp = require("sharp");

const {
  createBackgroundRemovalProcessor,
  createAirtableClient,
  removeBackgroundWithRemoveBgApi,
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

test("resizes processed transparent images for Airtable upload", async () => {
  const input = await sharp({
    create: {
      width: 2200,
      height: 1200,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from([48, 82, 36, 255]),
        raw: { width: 1, height: 1, channels: 4 },
        left: 1100,
        top: 600,
      },
    ])
    .png()
    .toBuffer();

  const result = await removeWhiteBackgroundFromImage(input);
  const metadata = await sharp(result.buffer).metadata();

  assert.equal(metadata.width, 1800);
  assert.equal(metadata.height, 982);
});

test("remove.bg processor uploads image bytes and normalizes transparent PNG output", async () => {
  const apiOutput = await sharp({
    create: {
      width: 2200,
      height: 1200,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
  const requests = [];

  const result = await removeBackgroundWithRemoveBgApi(
    {
      buffer: Buffer.from("jpg bytes"),
      contentType: "image/jpeg",
      attachment: { filename: "producer-bottle.jpg" },
    },
    {
      apiKey: "rbg_test_key",
      fetchImpl: async (url, init) => {
        requests.push({ url: String(url), init });
        return {
          ok: true,
          async arrayBuffer() {
            return apiOutput.buffer.slice(
              apiOutput.byteOffset,
              apiOutput.byteOffset + apiOutput.byteLength,
            );
          },
        };
      },
    },
  );

  const entries = Array.from(requests[0].init.body.entries());
  const imageFile = entries.find(([key]) => key === "image_file")?.[1];
  const metadata = await sharp(result.buffer).metadata();

  assert.equal(requests[0].url, "https://api.remove.bg/v1.0/removebg");
  assert.equal(requests[0].init.method, "POST");
  assert.equal(requests[0].init.headers["X-Api-Key"], "rbg_test_key");
  assert.deepEqual(
    entries.filter(([key]) => key !== "image_file"),
    [
      ["size", "auto"],
      ["format", "png"],
    ],
  );
  assert.equal(imageFile.name, "producer-bottle.jpg");
  assert.equal(imageFile.type, "image/jpeg");
  assert.equal(imageFile.size, 9);
  assert.equal(result.contentType, "image/png");
  assert.equal(result.extension, "png");
  assert.equal(metadata.width, 1800);
  assert.equal(metadata.height, 982);
});

test("uses remove.bg as the default processor when REMOVE_BG_API_KEY is configured", async () => {
  const apiOutput = await sharp({
    create: {
      width: 4,
      height: 4,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
  const requests = [];
  const processor = createBackgroundRemovalProcessor({
    env: { REMOVE_BG_API_KEY: "rbg_test_key" },
    fetchImpl: async (url, init) => {
      requests.push({ url: String(url), init });
      return {
        ok: true,
        async arrayBuffer() {
          return apiOutput.buffer.slice(
            apiOutput.byteOffset,
            apiOutput.byteOffset + apiOutput.byteLength,
          );
        },
      };
    },
  });

  const result = await processor({
    buffer: Buffer.from("image bytes"),
    contentType: "image/png",
    attachment: { filename: "bottle.png" },
  });

  assert.equal(requests[0].url, "https://api.remove.bg/v1.0/removebg");
  assert.equal(result.contentType, "image/png");
});

test("Airtable client rejects transparent images over the upload limit before fetch", async () => {
  const client = createAirtableClient({
    token: "pat123",
    baseId: "app123",
    tableName: "tbl123",
    fetchImpl: async () => {
      throw new Error("fetch should not be called");
    },
  });

  await assert.rejects(
    client.uploadTransparentBackgroundAttachment("rec123", {
      buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
      contentType: "image/png",
      filename: "too-large.png",
    }),
    /Transparent bg upload is 5\.0 MB; Airtable direct uploads must be 5 MB or smaller/,
  );
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

test("sync uses the default transparent background processor", async () => {
  const rootDir = makePortalFixture();
  const input = await sharp({
    create: {
      width: 3,
      height: 3,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from([48, 82, 36, 255]),
        raw: { width: 1, height: 1, channels: 4 },
        left: 1,
        top: 1,
      },
    ])
    .png()
    .toBuffer();

  const result = await syncAirtablePortalImages({
    rootDir,
    dryRun: false,
    airtableClient: {
      async listRecordsToUpdate() {
        return [
          {
            id: "recdefault",
            fields: {
              Status: "Update",
              "Portal oil slug": "knolive-epicure",
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
      async markRecordDone() {},
      async uploadTransparentBackgroundAttachment() {},
    },
    downloadAttachment: async () => ({
      buffer: input,
      contentType: "image/png",
    }),
  });

  const imagePath = path.join(
    rootDir,
    "public/images/oils/bottle__knolive-oils-sl__knolive-epicure.png",
  );
  const { data } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  assert.equal(result.updated, 1);
  assert.equal(result.failed, 0);
  assert.equal(data[3], 0);
  assert.equal(data[(1 * 3 + 1) * 4 + 3], 255);
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
    "https://content.airtable.com/v0/app123/rec123/Transparent%20bg/uploadAttachment",
  );
  assert.equal(requests[0].init.method, "POST");
  assert.equal(requests[0].init.headers.Authorization, "Bearer pat123");
  assert.deepEqual(JSON.parse(requests[0].init.body), {
    contentType: "image/png",
    file: "dHJhbnNwYXJlbnQgcG5n",
    filename: "bottle.png",
  });
});

test("Airtable client retries Transparent bg uploads with field ID when field name returns 404", async () => {
  const requests = [];
  const client = createAirtableClient({
    token: "pat123",
    baseId: "app123",
    tableName: "New images for portal",
    transparentBgField: "Transparent bg",
    fetchImpl: async (url, init) => {
      requests.push({ url: String(url), init });
      if (String(url).endsWith("/Transparent%20bg/uploadAttachment")) {
        return {
          ok: false,
          status: 404,
          async json() {
            return { error: { message: "Not found" } };
          },
        };
      }
      if (String(url) === "https://api.airtable.com/v0/meta/bases/app123/tables") {
        return {
          ok: true,
          async json() {
            return {
              tables: [
                {
                  id: "tbl123",
                  name: "New images for portal",
                  fields: [
                    {
                      id: "fld5XvOBrKbThUdYv",
                      name: "Transparent bg",
                      type: "multipleAttachments",
                    },
                  ],
                },
              ],
            };
          },
        };
      }
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

  assert.deepEqual(
    requests.map((request) => request.url),
    [
      "https://content.airtable.com/v0/app123/rec123/Transparent%20bg/uploadAttachment",
      "https://api.airtable.com/v0/meta/bases/app123/tables",
      "https://content.airtable.com/v0/app123/rec123/fld5XvOBrKbThUdYv/uploadAttachment",
    ],
  );
});

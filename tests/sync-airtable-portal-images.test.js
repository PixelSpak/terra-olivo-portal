const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { syncAirtablePortalImages } = require("../scripts/sync-airtable-portal-images.js");

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

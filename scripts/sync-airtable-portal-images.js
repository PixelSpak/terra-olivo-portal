#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const sharp = require("sharp");

const DEFAULT_TABLE_NAME = "New images for portal";
const DEFAULT_STATUS_FIELD = "Status";
const DEFAULT_UPDATE_STATUS = "Update";
const DEFAULT_DONE_STATUS = "Done";
const DEFAULT_TRANSPARENT_BG_FIELD = "Transparent bg";
const ATTACHMENTS_FIELD = "Attachments";
const MAX_AIRTABLE_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_TRANSPARENT_IMAGE_DIMENSION = 1800;
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const IMAGE_TYPE_TO_EXTENSION = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

const OIL_SLUG_FIELDS = ["Portal oil slug", "Oil slug", "oilSlug"];
const PRODUCER_SLUG_FIELDS = ["Portal producer slug", "Producer slug", "producerSlug"];
const OIL_NAME_FIELDS = ["Olive oil name", "Oil name", "oilName", "Name"];
const PRODUCER_NAME_FIELDS = ["Company name", "Producer name", "producerName"];

function parseArgs(argv) {
  const args = {
    dryRun: false,
    rootDir: undefined,
    limit: undefined,
    markDone: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--no-mark-done") {
      args.markDone = false;
    } else if (arg === "--root") {
      args.rootDir = argv[index + 1];
      index += 1;
    } else if (arg === "--limit") {
      args.limit = Number.parseInt(argv[index + 1], 10);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (Number.isNaN(args.limit)) {
    throw new Error("--limit must be a number.");
  }

  return args;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

function loadLocalEnv(rootDir) {
  loadEnvFile(path.join(rootDir, ".env.local"));
  loadEnvFile(path.join(rootDir, ".env"));
}

function requireConfig(value, name) {
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local or the runtime environment.`);
  }
  return value;
}

function resolveAirtableConfig(env = process.env) {
  return {
    token: requireConfig(
      env.AIRTABLE_API_KEY || env.AIRTABLE_TOKEN || env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
      "AIRTABLE_API_KEY",
    ),
    baseId: requireConfig(
      env.AIRTABLE_IMAGE_SUBMISSIONS_BASE_ID || env.AIRTABLE_BASE_ID,
      "AIRTABLE_IMAGE_SUBMISSIONS_BASE_ID",
    ),
    tableName:
      env.AIRTABLE_IMAGE_SUBMISSIONS_TABLE_ID ||
      env.AIRTABLE_IMAGE_SUBMISSIONS_TABLE_NAME ||
      DEFAULT_TABLE_NAME,
    statusField: env.AIRTABLE_IMAGE_SUBMISSIONS_STATUS_FIELD || DEFAULT_STATUS_FIELD,
    updateStatus: env.AIRTABLE_IMAGE_SUBMISSIONS_UPDATE_STATUS || DEFAULT_UPDATE_STATUS,
    doneStatus: env.AIRTABLE_IMAGE_SUBMISSIONS_DONE_STATUS || DEFAULT_DONE_STATUS,
    transparentBgField:
      env.AIRTABLE_IMAGE_SUBMISSIONS_TRANSPARENT_BG_FIELD || DEFAULT_TRANSPARENT_BG_FIELD,
  };
}

function airtableString(value) {
  return `'${String(value).replace(/'/g, "\\'")}'`;
}

function airtableUrl(baseId, tableName, recordId) {
  const parts = [
    "https://api.airtable.com/v0",
    encodeURIComponent(baseId),
    encodeURIComponent(tableName),
  ];
  if (recordId) parts.push(encodeURIComponent(recordId));
  return parts.join("/");
}

function airtableAttachmentUploadUrl(baseId, recordId, fieldName) {
  return [
    "https://content.airtable.com/v0",
    encodeURIComponent(baseId),
    encodeURIComponent(recordId),
    encodeURIComponent(fieldName),
    "uploadAttachment",
  ].join("/");
}

function airtableMetadataTablesUrl(baseId) {
  return [
    "https://api.airtable.com/v0/meta/bases",
    encodeURIComponent(baseId),
    "tables",
  ].join("/");
}

function formatMegabytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function isAirtableFieldId(value) {
  return /^fld[A-Za-z0-9]{14}$/.test(String(value || ""));
}

function createAirtableClient({
  token,
  baseId,
  tableName,
  statusField = DEFAULT_STATUS_FIELD,
  updateStatus = DEFAULT_UPDATE_STATUS,
  doneStatus = DEFAULT_DONE_STATUS,
  transparentBgField = DEFAULT_TRANSPARENT_BG_FIELD,
  fetchImpl = fetch,
  limit,
}) {
  let resolvedTransparentBgField = transparentBgField;

  async function parseAirtableResponse(response) {
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.error?.type ||
        `Airtable request failed with HTTP ${response.status}`;
      throw new Error(message);
    }
    return data;
  }

  async function resolveAttachmentFieldId(fieldName) {
    if (isAirtableFieldId(fieldName)) return fieldName;

    const response = await fetchImpl(airtableMetadataTablesUrl(baseId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await parseAirtableResponse(response);
    const table = (data.tables || []).find(
      (candidate) => candidate.id === tableName || candidate.name === tableName,
    );
    const field = (table?.fields || []).find((candidate) => candidate.name === fieldName);

    if (!field?.id) {
      throw new Error(`Could not find Airtable attachment field "${fieldName}".`);
    }

    resolvedTransparentBgField = field.id;
    return field.id;
  }

  async function uploadAttachment(recordId, image, fieldNameOrId) {
    return fetchImpl(airtableAttachmentUploadUrl(baseId, recordId, fieldNameOrId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: image.contentType,
        file: image.buffer.toString("base64"),
        filename: image.filename,
      }),
    });
  }

  return {
    async listRecordsToUpdate() {
      const records = [];
      let offset;

      do {
        const url = new URL(airtableUrl(baseId, tableName));
        url.searchParams.set(
          "filterByFormula",
          `{${statusField}} = ${airtableString(updateStatus)}`,
        );
        url.searchParams.set("pageSize", "100");
        if (offset) url.searchParams.set("offset", offset);

        const response = await fetchImpl(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await parseAirtableResponse(response);
        records.push(...(data.records || []));
        offset = data.offset;
      } while (offset && (!limit || records.length < limit));

      return limit ? records.slice(0, limit) : records;
    },

    async markRecordDone(recordId) {
      const response = await fetchImpl(airtableUrl(baseId, tableName, recordId), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            [statusField]: doneStatus,
          },
          typecast: true,
        }),
      });
      return parseAirtableResponse(response);
    },

    async uploadTransparentBackgroundAttachment(recordId, image) {
      if (image.buffer.length > MAX_AIRTABLE_ATTACHMENT_BYTES) {
        throw new Error(
          `Transparent bg upload is ${formatMegabytes(
            image.buffer.length,
          )} MB; Airtable direct uploads must be 5 MB or smaller.`,
        );
      }

      let response = await uploadAttachment(recordId, image, resolvedTransparentBgField);
      if (
        response.status === 404 &&
        !isAirtableFieldId(resolvedTransparentBgField)
      ) {
        const fieldId = await resolveAttachmentFieldId(resolvedTransparentBgField);
        response = await uploadAttachment(recordId, image, fieldId);
      }
      return parseAirtableResponse(response);
    },
  };
}

function firstText(fields, names) {
  for (const name of names) {
    const value = fields[name];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value)) {
      const text = value.find((item) => typeof item === "string" && item.trim());
      if (text) return text.trim();
    }
  }
  return "";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function safeSlug(value, fallback) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function findOilForRecord(record, oils) {
  const fields = record.fields || {};
  const portalOilSlug = firstText(fields, OIL_SLUG_FIELDS);
  if (portalOilSlug) {
    const oil = oils.find((candidate) => candidate.slug === portalOilSlug);
    if (!oil) {
      throw new Error(`No portal oil found for slug "${portalOilSlug}".`);
    }
    return oil;
  }

  const oilName = firstText(fields, OIL_NAME_FIELDS);
  if (!oilName) {
    throw new Error("Record is missing an olive oil name or portal oil slug.");
  }

  let candidates = oils.filter((oil) => normalizeText(oil.name) === normalizeText(oilName));
  if (!candidates.length) {
    const oilSlug = slugify(oilName);
    candidates = oils.filter((oil) => oil.slug === oilSlug);
  }

  const producerSlug = firstText(fields, PRODUCER_SLUG_FIELDS);
  if (producerSlug && candidates.length > 1) {
    candidates = candidates.filter((oil) => oil.producerSlug === producerSlug);
  }

  const producerName = firstText(fields, PRODUCER_NAME_FIELDS);
  if (producerName && candidates.length > 1) {
    const guessedProducerSlug = slugify(producerName);
    candidates = candidates.filter((oil) => oil.producerSlug === guessedProducerSlug);
  }

  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    throw new Error(`Multiple portal oils match "${oilName}". Add Portal oil slug.`);
  }
  throw new Error(`No portal oil matches "${oilName}".`);
}

function selectAttachment(record) {
  const attachments = record.fields?.[ATTACHMENTS_FIELD];
  if (!Array.isArray(attachments) || !attachments.length) {
    throw new Error("Record has no image attachment.");
  }

  const attachment = attachments.find((item) => {
    const type = String(item.type || "").toLowerCase();
    const ext = path.extname(String(item.filename || "")).slice(1).toLowerCase();
    return type.startsWith("image/") || IMAGE_EXTENSIONS.has(ext);
  });

  if (!attachment?.url) {
    throw new Error("Record has no supported image attachment URL.");
  }

  return attachment;
}

function extensionForAttachment(attachment, contentType) {
  const normalizedType = String(contentType || attachment.type || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (IMAGE_TYPE_TO_EXTENSION[normalizedType]) return IMAGE_TYPE_TO_EXTENSION[normalizedType];

  const filenameExt = path.extname(String(attachment.filename || ""))
    .slice(1)
    .toLowerCase();
  if (filenameExt === "jpeg") return "jpg";
  if (IMAGE_EXTENSIONS.has(filenameExt)) return filenameExt;

  throw new Error(`Unsupported image type: ${contentType || attachment.type || "unknown"}.`);
}

async function defaultDownloadAttachment(attachment, fetchImpl = fetch) {
  const response = await fetchImpl(attachment.url);
  if (!response.ok) {
    throw new Error(`Attachment download failed with HTTP ${response.status}.`);
  }
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || attachment.type || "",
  };
}

function isEdgeBackgroundPixel(data, pixelIndex) {
  const offset = pixelIndex * 4;
  const alpha = data[offset + 3];
  if (alpha === 0) return false;

  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const brightest = Math.max(red, green, blue);
  const darkest = Math.min(red, green, blue);

  return red >= 235 && green >= 235 && blue >= 235 && brightest - darkest <= 35;
}

async function removeWhiteBackgroundFromImage(input) {
  const buffer = Buffer.isBuffer(input) ? input : input?.buffer;
  if (!buffer) {
    throw new Error("Image processor received no image buffer.");
  }

  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = [];

  function enqueue(pixelIndex) {
    if (pixelIndex < 0 || pixelIndex >= pixelCount) return;
    if (visited[pixelIndex]) return;
    if (!isEdgeBackgroundPixel(data, pixelIndex)) return;
    visited[pixelIndex] = 1;
    queue.push(pixelIndex);
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const pixelIndex = queue[index];
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    if (x > 0) enqueue(pixelIndex - 1);
    if (x < width - 1) enqueue(pixelIndex + 1);
    if (y > 0) enqueue(pixelIndex - width);
    if (y < height - 1) enqueue(pixelIndex + width);
  }

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (visited[pixelIndex]) {
      data[pixelIndex * 4 + 3] = 0;
    }
  }

  return {
    buffer: await sharp(data, {
      raw: { width, height, channels: 4 },
    })
      .resize({
        width: MAX_TRANSPARENT_IMAGE_DIMENSION,
        height: MAX_TRANSPARENT_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 9 })
      .toBuffer(),
    contentType: "image/png",
    extension: "png",
  };
}

async function syncAirtablePortalImages({
  rootDir = path.resolve(__dirname, ".."),
  airtableClient,
  downloadAttachment = defaultDownloadAttachment,
  processImage = removeWhiteBackgroundFromImage,
  dryRun = false,
  markDone = true,
} = {}) {
  if (!airtableClient) {
    loadLocalEnv(rootDir);
    const config = resolveAirtableConfig();
    airtableClient = createAirtableClient(config);
  }

  const oilsPath = path.join(rootDir, "src/data/oils.json");
  const imagesDir = path.join(rootDir, "public/images/oils");
  const oils = loadJson(oilsPath);
  const records = await airtableClient.listRecordsToUpdate();
  const result = {
    checked: records.length,
    updated: 0,
    skipped: 0,
    failed: 0,
    records: [],
  };

  for (const record of records) {
    try {
      const oil = findOilForRecord(record, oils);
      const attachment = selectAttachment(record);
      const downloaded = await downloadAttachment(attachment);
      const processed = await processImage({
        buffer: downloaded.buffer,
        contentType: downloaded.contentType,
        attachment,
        record,
        oil,
      });
      const imageBuffer = processed?.buffer || downloaded.buffer;
      const contentType = processed?.contentType || downloaded.contentType;
      const ext =
        processed?.extension || extensionForAttachment(attachment, contentType);
      const producerSlug = safeSlug(oil.producerSlug, "unknown-producer");
      const oilSlug = safeSlug(oil.slug, "unknown-oil");
      const filename = `bottle__${producerSlug}__${oilSlug}.${ext}`;
      const publicImagePath = `/images/oils/${filename}`;
      const imagePath = path.join(imagesDir, filename);

      if (!dryRun) {
        fs.mkdirSync(imagesDir, { recursive: true });
        fs.writeFileSync(imagePath, imageBuffer);
        oil.image = publicImagePath;
        oil.format = "good";
        writeJson(oilsPath, oils);
        if (airtableClient.uploadTransparentBackgroundAttachment) {
          await airtableClient.uploadTransparentBackgroundAttachment(record.id, {
            buffer: imageBuffer,
            contentType,
            filename,
          });
        }
        if (markDone) {
          await airtableClient.markRecordDone(record.id);
        }
      }

      result.updated += 1;
      result.records.push({
        id: record.id,
        status: dryRun ? "would-update" : "updated",
        oilSlug: oil.slug,
        image: publicImagePath,
      });
    } catch (error) {
      result.failed += 1;
      result.records.push({
        id: record.id,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}

function printHelp() {
  console.log(`Usage: node scripts/sync-airtable-portal-images.js [options]

Options:
  --dry-run        Show what would update without writing files or Airtable status.
  --no-mark-done  Write portal files but leave Airtable Status as Update.
  --limit N       Process at most N Airtable records.
  --root PATH     Portal project root. Defaults to this repository.
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const rootDir = path.resolve(args.rootDir || path.join(__dirname, ".."));
  loadLocalEnv(rootDir);
  const config = resolveAirtableConfig();
  const airtableClient = createAirtableClient({ ...config, limit: args.limit });
  const result = await syncAirtablePortalImages({
    rootDir,
    airtableClient,
    dryRun: args.dryRun,
    markDone: args.markDone,
  });

  console.log(
    `Checked ${result.checked}; updated ${result.updated}; failed ${result.failed}.`,
  );
  for (const record of result.records) {
    if (record.status === "failed") {
      console.log(`- ${record.id}: failed - ${record.error}`);
    } else {
      console.log(`- ${record.id}: ${record.status} ${record.oilSlug} -> ${record.image}`);
    }
  }

  if (result.failed > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = {
  createAirtableClient,
  findOilForRecord,
  removeWhiteBackgroundFromImage,
  syncAirtablePortalImages,
};

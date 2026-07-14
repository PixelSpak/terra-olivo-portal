#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const sharp = require("sharp");

const execFileAsync = promisify(execFile);

const DEFAULT_TABLE_NAME = "New images for portal";
const DEFAULT_STATUS_FIELD = "Status";
const DEFAULT_UPDATE_STATUS = "Update";
const DEFAULT_REVIEW_STATUS = "Check";
const DEFAULT_APPROVED_STATUS = "Approved";
const DEFAULT_DONE_STATUS = "Done";
const DEFAULT_TRANSPARENT_BG_FIELD = "Transparent bg";
const ATTACHMENTS_FIELD = "Attachments";
const MAX_AIRTABLE_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_TRANSPARENT_IMAGE_DIMENSION = 1800;
const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";
const DEFAULT_REMOVE_BG_SIZE = "auto";
const DEFAULT_REMBG_COMMAND = "rembg";
const DEFAULT_REMBG_MODEL = "birefnet-general";
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
    mode: "all",
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
    } else if (arg === "--mode") {
      args.mode = argv[index + 1];
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
  if (!["all", "approved", "update"].includes(args.mode)) {
    throw new Error("--mode must be all, approved, or update.");
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
    reviewStatus: env.AIRTABLE_IMAGE_SUBMISSIONS_REVIEW_STATUS || DEFAULT_REVIEW_STATUS,
    approvedStatus:
      env.AIRTABLE_IMAGE_SUBMISSIONS_APPROVED_STATUS || DEFAULT_APPROVED_STATUS,
    doneStatus: env.AIRTABLE_IMAGE_SUBMISSIONS_DONE_STATUS || DEFAULT_DONE_STATUS,
    transparentBgField:
      env.AIRTABLE_IMAGE_SUBMISSIONS_TRANSPARENT_BG_FIELD || DEFAULT_TRANSPARENT_BG_FIELD,
  };
}

function resolveBackgroundRemovalConfig(env = process.env) {
  const apiKey = env.REMOVE_BG_API_KEY || env.REMOVEBG_API_KEY || "";
  const provider = env.AIRTABLE_IMAGE_BG_REMOVAL_PROVIDER || "local";

  return {
    provider,
    removeBgApiKey: apiKey,
    removeBgSize: env.REMOVE_BG_SIZE || "auto",
    rembgCommand: env.REMBG_COMMAND || DEFAULT_REMBG_COMMAND,
    rembgModel: env.REMBG_MODEL || DEFAULT_REMBG_MODEL,
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
  reviewStatus = DEFAULT_REVIEW_STATUS,
  approvedStatus = DEFAULT_APPROVED_STATUS,
  doneStatus = DEFAULT_DONE_STATUS,
  transparentBgField = DEFAULT_TRANSPARENT_BG_FIELD,
  fetchImpl = fetch,
  limit,
  statuses,
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

  async function patchRecordStatus(recordId, status) {
    const response = await fetchImpl(airtableUrl(baseId, tableName, recordId), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          [statusField]: status,
        },
        typecast: true,
      }),
    });
    return parseAirtableResponse(response);
  }

  return {
    statusField,
    updateStatus,
    reviewStatus,
    approvedStatus,
    doneStatus,
    transparentBgField,

    async listRecordsToUpdate() {
      const records = [];
      let offset;
      const statusesToList =
        Array.isArray(statuses) && statuses.length
          ? statuses
          : [updateStatus, approvedStatus].filter(Boolean);
      const filterFormula =
        statusesToList.length === 1
          ? `{${statusField}} = ${airtableString(statusesToList[0])}`
          : `OR(${statusesToList
              .map((status) => `{${statusField}} = ${airtableString(status)}`)
              .join(", ")})`;

      do {
        const url = new URL(airtableUrl(baseId, tableName));
        url.searchParams.set("filterByFormula", filterFormula);
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

    async markRecordReadyForReview(recordId) {
      return patchRecordStatus(recordId, reviewStatus);
    },

    async markRecordDone(recordId) {
      return patchRecordStatus(recordId, doneStatus);
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

function selectAttachment(record, fieldName = ATTACHMENTS_FIELD, description = "image") {
  const attachments = record.fields?.[fieldName];
  if (!Array.isArray(attachments) || !attachments.length) {
    throw new Error(`Record has no ${description} attachment.`);
  }

  const attachment = attachments.find((item) => {
    const type = String(item.type || "").toLowerCase();
    const ext = path.extname(String(item.filename || "")).slice(1).toLowerCase();
    return type.startsWith("image/") || IMAGE_EXTENSIONS.has(ext);
  });

  if (!attachment?.url) {
    throw new Error(`Record has no supported ${description} attachment URL.`);
  }

  return attachment;
}

function recordStatus(record, statusField = DEFAULT_STATUS_FIELD) {
  const value = record.fields?.[statusField];
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    const text = value.find((item) => typeof item === "string" && item.trim());
    if (text) return text.trim();
  }
  return "";
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

async function normalizeTransparentPng(buffer) {
  return sharp(buffer)
    .resize({
      width: MAX_TRANSPARENT_IMAGE_DIMENSION,
      height: MAX_TRANSPARENT_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function hasTransparentPixels(buffer) {
  let data;
  try {
    ({ data } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }));
  } catch {
    return false;
  }

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) return true;
  }
  return false;
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
    buffer: await normalizeTransparentPng(await sharp(data, {
      raw: { width, height, channels: 4 },
    })
      .png()
      .toBuffer()),
    contentType: "image/png",
    extension: "png",
  };
}

async function removeBackgroundWithRemoveBgApi(input, {
  apiKey,
  fetchImpl = fetch,
  size = DEFAULT_REMOVE_BG_SIZE,
} = {}) {
  const buffer = Buffer.isBuffer(input) ? input : input?.buffer;
  if (!buffer) {
    throw new Error("remove.bg processor received no image buffer.");
  }
  if (!apiKey) {
    throw new Error("Missing REMOVE_BG_API_KEY for remove.bg background removal.");
  }

  const contentType = input?.contentType || "application/octet-stream";
  const filename = input?.attachment?.filename || "image";
  const formData = new FormData();
  formData.append("size", size);
  formData.append("format", "png");
  formData.append("image_file", new Blob([buffer], { type: contentType }), filename);

  const response = await fetchImpl(REMOVE_BG_API_URL, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `remove.bg request failed with HTTP ${response.status}${message ? `: ${message}` : ""}`,
    );
  }

  return {
    buffer: await normalizeTransparentPng(Buffer.from(await response.arrayBuffer())),
    contentType: "image/png",
    extension: "png",
  };
}

async function removeBackgroundWithRembg(input, {
  command = DEFAULT_REMBG_COMMAND,
  model = DEFAULT_REMBG_MODEL,
  execFileImpl = execFileAsync,
  tmpDir = os.tmpdir(),
} = {}) {
  const buffer = Buffer.isBuffer(input) ? input : input?.buffer;
  if (!buffer) {
    throw new Error("rembg processor received no image buffer.");
  }

  if (await hasTransparentPixels(buffer)) {
    return {
      buffer: await normalizeTransparentPng(buffer),
      contentType: "image/png",
      extension: "png",
    };
  }

  let inputExtension = "png";
  try {
    inputExtension = extensionForAttachment(input?.attachment || {}, input?.contentType || "");
  } catch {
    inputExtension = "png";
  }

  const workDir = fs.mkdtempSync(path.join(tmpDir, "terra-rembg-"));
  const inputPath = path.join(workDir, `input.${inputExtension}`);
  const outputPath = path.join(workDir, "output.png");

  try {
    fs.writeFileSync(inputPath, buffer);
    await execFileImpl(command, ["i", "-m", model, inputPath, outputPath], {
      maxBuffer: 20 * 1024 * 1024,
    });
    if (!fs.existsSync(outputPath)) {
      throw new Error("rembg did not create an output image.");
    }
    return {
      buffer: await normalizeTransparentPng(fs.readFileSync(outputPath)),
      contentType: "image/png",
      extension: "png",
    };
  } catch (error) {
    const detail = error?.stderr || error?.message || String(error);
    throw new Error(`rembg background removal failed: ${detail}`);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

function createBackgroundRemovalProcessor({
  env = process.env,
  fetchImpl = fetch,
  execFileImpl = execFileAsync,
} = {}) {
  const config = resolveBackgroundRemovalConfig(env);
  if (config.provider === "removebg") {
    return (input) =>
      removeBackgroundWithRemoveBgApi(input, {
        apiKey: config.removeBgApiKey,
        fetchImpl,
        size: config.removeBgSize,
      });
  }
  if (config.provider === "local") {
    return removeWhiteBackgroundFromImage;
  }
  if (config.provider === "rembg") {
    return (input) =>
      removeBackgroundWithRembg(input, {
        command: config.rembgCommand,
        model: config.rembgModel,
        execFileImpl,
      });
  }
  throw new Error(`Unsupported background removal provider: ${config.provider}.`);
}

async function syncAirtablePortalImages({
  rootDir = path.resolve(__dirname, ".."),
  airtableClient,
  downloadAttachment = defaultDownloadAttachment,
  processImage,
  dryRun = false,
  markDone = true,
} = {}) {
  if (!airtableClient) {
    loadLocalEnv(rootDir);
    const config = resolveAirtableConfig();
    airtableClient = createAirtableClient(config);
  }
  if (!processImage) {
    processImage = createBackgroundRemovalProcessor();
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
  const statusField = airtableClient.statusField || DEFAULT_STATUS_FIELD;
  const updateStatus = airtableClient.updateStatus || DEFAULT_UPDATE_STATUS;
  const approvedStatus = airtableClient.approvedStatus || DEFAULT_APPROVED_STATUS;
  const transparentBgField =
    airtableClient.transparentBgField || DEFAULT_TRANSPARENT_BG_FIELD;

  for (const record of records) {
    try {
      const oil = findOilForRecord(record, oils);
      const currentStatus = recordStatus(record, statusField);
      const isApproved = currentStatus === approvedStatus;
      const isUpdate = currentStatus === updateStatus || (!currentStatus && !isApproved);
      const attachment = isApproved
        ? selectAttachment(
            record,
            transparentBgField,
            `${transparentBgField} review image`,
          )
        : selectAttachment(record);
      const downloaded = await downloadAttachment(attachment);
      const processed = isApproved
        ? {
            buffer: downloaded.buffer,
            contentType: downloaded.contentType,
            extension: extensionForAttachment(attachment, downloaded.contentType),
          }
        : await processImage({
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
        if (isUpdate && airtableClient.uploadTransparentBackgroundAttachment) {
          await airtableClient.uploadTransparentBackgroundAttachment(record.id, {
            buffer: imageBuffer,
            contentType,
            filename,
          });
        }
        if (isApproved) {
          fs.mkdirSync(imagesDir, { recursive: true });
          fs.writeFileSync(imagePath, imageBuffer);
          oil.image = publicImagePath;
          oil.format = "good";
          writeJson(oilsPath, oils);
        }
        if (markDone && isUpdate && airtableClient.markRecordReadyForReview) {
          await airtableClient.markRecordReadyForReview(record.id);
        } else if (markDone && isApproved && airtableClient.markRecordDone) {
          await airtableClient.markRecordDone(record.id);
        }
      }

      result.updated += 1;
      result.records.push({
        id: record.id,
        status: dryRun
          ? isApproved
            ? "would-update"
            : "would-prepare-review"
          : isApproved
            ? "updated"
            : "ready-for-review",
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

function statusesForMode(mode, config) {
  if (mode === "approved") return [config.approvedStatus || DEFAULT_APPROVED_STATUS];
  if (mode === "update") return [config.updateStatus || DEFAULT_UPDATE_STATUS];
  return undefined;
}

function printHelp() {
  console.log(`Usage: node scripts/sync-airtable-portal-images.js [options]

Options:
  --dry-run        Show what would update without writing files or Airtable status.
  --no-mark-done  Leave Airtable Status unchanged after processing.
  --limit N       Process at most N Airtable records.
  --mode MODE      all, approved, or update. Defaults to all.
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
  const airtableClient = createAirtableClient({
    ...config,
    limit: args.limit,
    statuses: statusesForMode(args.mode, config),
  });
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
  createBackgroundRemovalProcessor,
  createAirtableClient,
  findOilForRecord,
  parseArgs,
  removeBackgroundWithRemoveBgApi,
  removeBackgroundWithRembg,
  removeWhiteBackgroundFromImage,
  statusesForMode,
  syncAirtablePortalImages,
};

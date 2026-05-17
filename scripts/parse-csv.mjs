import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = "/root/.claude/uploads/64c7714c-7a2b-48bc-ac10-1f33a249f1eb/a5339f22-Awards_Terraolivo_2025.csv";

// ── CSV parser (handles quoted multiline fields) ───────────────────────────
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (ch === '"') { inQuotes = false; i++; continue; }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { row.push(field.trim()); field = ""; i++; continue; }
    if (ch === '\n') {
      row.push(field.trim()); field = "";
      if (row.some(f => f.length > 0)) rows.push(row);
      row = []; i++; continue;
    }
    if (ch === '\r') { i++; continue; }
    field += ch; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field.trim()); rows.push(row); }
  return rows;
}

// ── Extract URL from "filename (https://...)" format ──────────────────────
function extractUrl(fieldValue) {
  const match = fieldValue.match(/\(https?:\/\/[^)]+\)/);
  if (!match) return undefined;
  return match[0].slice(1, -1); // strip surrounding parens
}

// ── Slug generator ─────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ── Olive variety detection from oil name ──────────────────────────────────
const VARIETIES = [
  "Koroneiki", "Picual", "Coratina", "Arbequina", "Arbequino", "Barnea",
  "Picholine", "Pichuline", "Picholina", "Souri", "Frantoio", "Peranzana",
  "Leccino", "Lecciana", "Leccino", "Hojiblanca", "Manzanilla", "Nocellara",
  "Maurino", "Moraiolo", "Itrana", "Chetoui", "Memecik", "Nabali", "Chemlali",
  "Ascolana", "Cobrançosa", "Cobrancosa", "Galega", "Cornicabra", "Empeltre",
  "Taggiasca", "Ogliarola", "Carolea", "Biancolilla", "Verdial", "Changlot",
  "Blanqueta", "Farga", "Sevillenca", "Morisca", "Gemlik", "Ayvalik",
  "Tonda Iblea", "Nocellara del Belice", "Maalot", "Picholine Marocaine",
];

function detectVarieties(name) {
  const found = [];
  const lower = name.toLowerCase();
  for (const v of VARIETIES) {
    if (lower.includes(v.toLowerCase())) {
      // normalise Arbequino → Arbequina, Pichuline/Picholina → Picholine, Leccino/Lecciana → Leccino
      let canon = v;
      if (v === "Arbequino") canon = "Arbequina";
      if (v === "Pichuline" || v === "Picholina") canon = "Picholine";
      if (v === "Lecciana" || v === "Leccino") canon = "Leccino";
      if (v === "Cobrancosa") canon = "Cobrançosa";
      if (!found.includes(canon)) found.push(canon);
    }
  }
  if (found.length === 0 && /\bblend\b/i.test(name)) found.push("Blend");
  return found;
}

// ── Main ───────────────────────────────────────────────────────────────────
const text = readFileSync(CSV_PATH, "utf-8");
const rows = parseCSV(text);
const [header, ...dataRows] = rows;
console.log(`Header: ${JSON.stringify(header)}`);
console.log(`Data rows: ${dataRows.length}`);

// Map: producerName → Producer
const producerMap = new Map();
// Map: `${evooName}||${producerName}` → OliveOil
const oilMap = new Map();

for (const row of dataRows) {
  if (row.length < 4) continue;
  let [evooName, brandName, country, medal, medalFile, certificate] = row;

  // Collapse internal whitespace/newlines from multiline CSV cells
  brandName = (brandName || "").replace(/\s+/g, " ").trim();
  evooName = (evooName || "").replace(/\s+/g, " ").trim();
  country = (country || "").replace(/\s+/g, " ").trim();
  medal = (medal || "").replace(/\s+/g, " ").trim();

  if (!brandName && !evooName) continue;

  // If no EVOO name, award is brand-level — use brand as the oil name
  const oilName = evooName || brandName;
  const producerName = brandName || oilName;

  // Producer
  if (!producerMap.has(producerName)) {
    producerMap.set(producerName, {
      slug: slugify(producerName),
      name: producerName,
      country,
      region: "",
      description: `${producerName} is an award-winning olive oil producer from ${country}.`,
    });
  }

  const producer = producerMap.get(producerName);
  const oilKey = `${oilName}||${producerName}`;

  if (!oilMap.has(oilKey)) {
    oilMap.set(oilKey, {
      slug: slugify(oilName),
      name: oilName,
      producerSlug: producer.slug,
      country,
      region: "",
      varieties: detectVarieties(oilName),
      intensity: "Medium",
      description: `${oilName} is an award-winning extra virgin olive oil from ${country}.`,
      tastingNotes: [],
      awards: [],
    });
  }

  const oil = oilMap.get(oilKey);
  // Prefer the medal PNG image as the certificate visual
  const certImg = extractUrl(medalFile || "") || extractUrl(certificate || "");
  oil.awards.push({
    year: 2025,
    prize: medal,
    certificateImage: certImg,
  });
}

// Deduplicate oil slugs (same slug for different names)
const usedSlugs = new Map();
for (const oil of oilMap.values()) {
  const base = oil.slug;
  let candidate = base;
  let n = 2;
  while (usedSlugs.has(candidate) && usedSlugs.get(candidate) !== `${oil.name}||${oil.producerSlug}`) {
    candidate = `${base}-${n++}`;
  }
  usedSlugs.set(candidate, `${oil.name}||${oil.producerSlug}`);
  oil.slug = candidate;
}

// Deduplicate producer slugs
const usedPSlugs = new Map();
for (const p of producerMap.values()) {
  const base = p.slug;
  let candidate = base;
  let n = 2;
  while (usedPSlugs.has(candidate) && usedPSlugs.get(candidate) !== p.name) {
    candidate = `${base}-${n++}`;
  }
  usedPSlugs.set(candidate, p.name);
  p.slug = candidate;
}

// Re-sync producerSlug on oils after dedup
for (const oil of oilMap.values()) {
  // find producer by name
  for (const p of producerMap.values()) {
    if (p.name === oil.producerSlug || slugify(p.name) === oil.producerSlug) {
      // Match already set via slugify — will re-check below
    }
  }
}
// Rebuild producerSlug lookup by original slugify match
const slugToProducer = new Map(Array.from(producerMap.values()).map(p => [slugify(p.name), p]));
for (const oil of oilMap.values()) {
  // producerSlug was set from producer.slug at insert time — keep as-is
  // but verify it still matches after dedup
  const found = Array.from(producerMap.values()).find(
    p => p.slug === oil.producerSlug
  );
  if (!found) {
    // fallback: find by slugify of brand name
    const brandEntry = Array.from(producerMap.entries()).find(
      ([name]) => slugify(name) === oil.producerSlug
    );
    if (brandEntry) oil.producerSlug = brandEntry[1].slug;
  }
}

const producers = Array.from(producerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
const oils = Array.from(oilMap.values()).sort((a, b) => a.name.localeCompare(b.name));

console.log(`\nProducers: ${producers.length}`);
console.log(`Oils: ${oils.length}`);
console.log(`\nMedal types:`);
const medals = [...new Set(oils.flatMap(o => o.awards.map(a => a.prize)))].sort();
medals.forEach(m => console.log(`  - ${m}`));

const outDir = join(__dirname, "../src/data");
writeFileSync(join(outDir, "producers.json"), JSON.stringify(producers, null, 2));
writeFileSync(join(outDir, "oils.json"), JSON.stringify(oils, null, 2));
console.log(`\nWrote ${producers.length} producers and ${oils.length} oils.`);

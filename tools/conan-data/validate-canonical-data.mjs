import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const dataDir = path.join(repoRoot, "data", "conan-legacy");
const files = ["equipment.json", "edges.json", "hindrances.json", "backgrounds.json"];
const statuses = new Set(["canon", "draft", "approved", "approved_for_playtest", "revision_required", "vetoed", "gm_only"]);

let failures = 0;

function fail(file, message) {
  failures += 1;
  console.error(`${file}: ${message}`);
}

for (const file of files) {
  const fullPath = path.join(dataDir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    fail(file, `JSON invalido ou ausente: ${error.message}`);
    continue;
  }

  if (!data.version) fail(file, "version ausente.");
  if (!data.kind) fail(file, "kind ausente.");
  if (!Array.isArray(data.records)) fail(file, "records precisa ser array.");

  const ids = new Set();
  for (const [index, record] of (data.records || []).entries()) {
    const label = `${file}#${index + 1}`;
    for (const field of ["id", "name", "type", "category", "editorial_status", "source_refs", "player_safe_text", "gm_notes", "foundry_ready"]) {
      if (!(field in record)) fail(label, `campo obrigatorio ausente: ${field}`);
    }
    if (ids.has(record.id)) fail(label, `id duplicado: ${record.id}`);
    ids.add(record.id);
    if (!statuses.has(record.editorial_status)) fail(label, `editorial_status invalido: ${record.editorial_status}`);
    if ("swade_origin" in record && !["conan-legacy", "swade-core-ref"].includes(record.swade_origin)) fail(label, `swade_origin invalido: ${record.swade_origin}`);
    if ("severity" in record && record.severity !== "") {
      const sevOk = Array.isArray(record.severity)
        ? record.severity.length > 0 && record.severity.every(s => ["minor", "major"].includes(s))
        : ["minor", "major", "minor_or_major"].includes(record.severity);
      if (!sevOk) fail(label, `severity invalida: ${JSON.stringify(record.severity)}`);
    }
    if ("requires_master_conversation" in record && typeof record.requires_master_conversation !== "boolean") fail(label, "requires_master_conversation precisa ser boolean.");
    if (!Array.isArray(record.source_refs) || record.source_refs.length === 0) fail(label, "source_refs precisa ter ao menos uma entrada.");
    if (typeof record.foundry_ready !== "boolean") fail(label, "foundry_ready precisa ser boolean.");
  }

  if (file === "equipment.json") {
    const itemIds = new Set(data.records.map(record => record.id));
    for (const pkg of data.packages || []) {
      for (const entry of pkg.items || []) {
        if (!itemIds.has(entry.item_id)) fail(file, `pacote ${pkg.id} referencia item inexistente: ${entry.item_id}`);
      }
    }
  }
}

if (failures) {
  console.error(`Validacao falhou com ${failures} problema(s).`);
  process.exit(1);
}

console.log(`Validacao canonica OK: ${files.join(", ")}.`);

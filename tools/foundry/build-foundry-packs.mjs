/**
 * Conan Legacy - Build Foundry Packs
 * Foundry VTT 13.351 / SWADE 5.2.6
 *
 * Converte a camada canonica (data/conan-legacy/*.json) em fontes de compendio
 * para o modulo nativo (foundry/conan-legacy-module/packs/_source/).
 *
 * Regras de exportacao (player-safe):
 * - editorial_status permitido: canon, approved, approved_for_playtest
 * - is_public !== false
 * - registros gm_only, draft, revision_required e vetoed ficam de fora e sao
 *   listados no relatorio de build.
 * - gm_notes NUNCA entram no payload exportado.
 *
 * Uso:
 *   node tools/foundry/build-foundry-packs.mjs
 *
 * Saida:
 *   foundry/conan-legacy-module/packs/_source/<pack>.json  (fonte versionavel)
 *   relatorio no stdout
 *
 * A compilacao para LevelDB (formato de pack do Foundry v13) e feita por
 * tools/foundry/compile-packs.mjs, que depende de @foundryvtt/foundryvtt-cli.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const dataDir = path.join(repoRoot, "data", "conan-legacy");
const outDir = path.join(repoRoot, "foundry", "conan-legacy-module", "packs", "_source");

const ALLOWED_STATUS = new Set(["canon", "approved", "approved_for_playtest"]);

/** ID deterministico de 16 chars para Documents Foundry, estavel entre builds. */
function foundryId(seed) {
  return crypto.createHash("sha256").update(seed).digest("base64url").replace(/[-_]/g, "a").slice(0, 16);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8").replace(/^﻿/, ""));
}

function playtestTag(record) {
  return record.editorial_status === "approved_for_playtest" ? "<p><em>[Playtest] Regra aprovada para teste de mesa; pode mudar.</em></p>" : "";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function exportable(records, { requireConanOrigin = false } = {}) {
  const kept = [];
  const skipped = [];
  for (const r of records) {
    if (!ALLOWED_STATUS.has(r.editorial_status) || r.is_public === false) {
      skipped.push({ id: r.id, name: r.name, reason: r.editorial_status });
    } else if (requireConanOrigin && r.swade_origin !== "conan-legacy") {
      skipped.push({ id: r.id, name: r.name, reason: `swade_origin=${r.swade_origin ?? "(ausente)"} — P2: só conteúdo Conan Legacy vira Item` });
    } else {
      kept.push(r);
    }
  }
  return { kept, skipped };
}

/* ---------------- Equipment ---------------- */

function mapEquipment(record) {
  const fx = record.swade_effect || {};
  const itemType = ["weapon", "armor", "shield"].includes(fx.item_type) ? fx.item_type : "gear";
  const descriptionParts = [
    `<p>${escapeHtml(record.player_safe_text)}</p>`,
    `<p><strong>Acesso:</strong> ${escapeHtml(record.access)}${record.requires_master_exception ? " — requer excecao do Mestre" : ""}</p>`,
    record.subcategory ? `<p><strong>Categoria:</strong> ${escapeHtml(record.category_label || record.category)} / ${escapeHtml(record.subcategory)}</p>` : "",
    fx.notes ? `<p>${escapeHtml(fx.notes)}</p>` : "",
    playtestTag(record),
    `<p><em>ID Conan Legacy: ${escapeHtml(record.id)}</em></p>`
  ].filter(Boolean).join("\n");

  const system = {
    description: descriptionParts,
    quantity: 1,
    price: record.cost ?? 0,
    weight: record.weight ?? 0
  };

  if (itemType === "weapon") {
    system.damage = fx.damage || "";
    system.minStr = fx.min_strength || "";
    system.ap = fx.ap ?? 0;
    if (fx.range) system.range = fx.range;
    if (fx.parry) system.parry = fx.parry;
  }
  if (itemType === "armor") {
    system.armor = fx.armor ?? 0;
  }
  if (itemType === "shield") {
    system.parry = fx.parry ?? 0;
  }

  return {
    _id: foundryId(`conan-legacy.equipment.${record.id}`),
    name: record.name,
    type: itemType,
    img: "icons/svg/item-bag.svg",
    system,
    effects: [],
    folder: null,
    flags: {
      "conan-legacy": {
        canonicalId: record.id,
        access: record.access,
        availabilityTags: record.availability_tags || [],
        startingEligible: record.is_starting_eligible === true,
        requiresMasterException: record.requires_master_exception === true,
        editorialStatus: record.editorial_status
      }
    }
  };
}

/* ---------------- Edges / Hindrances ---------------- */

function mapEdge(record) {
  const description = [
    `<p>${escapeHtml(record.player_safe_text).replace(/\n\n/g, "</p><p>")}</p>`,
    record.requirements ? `<p><strong>Requisitos:</strong> ${escapeHtml(Array.isArray(record.requirements) ? record.requirements.join("; ") : record.requirements)}</p>` : "",
    record.mechanical_effect ? `<p><strong>Efeito:</strong> ${escapeHtml(record.mechanical_effect)}</p>` : "",
    masterConversationTag(record),
    playtestTag(record),
    `<p><em>ID Conan Legacy: ${escapeHtml(record.id)}</em></p>`
  ].filter(Boolean).join("\n");
  return {
    _id: foundryId(`conan-legacy.edges.${record.id}`),
    name: record.name,
    type: "edge",
    img: "icons/svg/upgrade.svg",
    system: { description, requirements: { value: Array.isArray(record.requirements) ? record.requirements.join("; ") : (record.requirements || "") } },
    effects: [],
    folder: null,
    flags: { "conan-legacy": { canonicalId: record.id, rank: record.rank || null, subcategory: record.subcategory || null, editorialStatus: record.editorial_status } }
  };
}

function normalizeSeverity(raw) {
  if (Array.isArray(raw)) {
    if (raw.includes("major") && raw.includes("minor")) return "minor_or_major";
    return raw.includes("major") ? "major" : "minor";
  }
  return String(raw || "").toLowerCase();
}

function masterConversationTag(record) {
  return record.requires_master_conversation === true
    ? "<p><em>[Converse com o Mestre] Esta opção exige conversa prévia com o Mestre.</em></p>"
    : "";
}

function mapHindrance(record) {
  const severity = normalizeSeverity(record.severity);
  const description = [
    `<p>${escapeHtml(record.player_safe_text).replace(/\n\n/g, "</p><p>")}</p>`,
    severity === "minor_or_major" ? "<p><strong>Menor ou Maior:</strong> escolha a severidade na ficha; este Item exporta como Menor por padrão (convenção SPEC §4).</p>" : "",
    record.mechanical_effect ? `<p><strong>Efeito:</strong> ${escapeHtml(record.mechanical_effect)}</p>` : "",
    masterConversationTag(record),
    playtestTag(record),
    `<p><em>ID Conan Legacy: ${escapeHtml(record.id)}</em></p>`
  ].filter(Boolean).join("\n");
  return {
    _id: foundryId(`conan-legacy.hindrances.${record.id}`),
    name: record.name,
    type: "hindrance",
    img: "icons/svg/downgrade.svg",
    system: { description, major: severity === "major", severity },
    effects: [],
    folder: null,
    flags: { "conan-legacy": { canonicalId: record.id, subcategory: record.subcategory || null, editorialStatus: record.editorial_status } }
  };
}

/* ---------------- Build ---------------- */

fs.mkdirSync(outDir, { recursive: true });
const report = [];

function buildPack(fileName, packName, mapper, opts = {}) {
  const data = readJson(fileName);
  const { kept, skipped } = exportable(data.records || [], opts);
  const docs = kept.map(mapper);
  const ids = new Set();
  for (const d of docs) {
    if (ids.has(d._id)) throw new Error(`Colisao de _id no pack ${packName}: ${d.name}`);
    ids.add(d._id);
  }
  fs.writeFileSync(path.join(outDir, `${packName}.json`), JSON.stringify(docs, null, 2) + "\n", "utf8");
  report.push({ pack: packName, exported: docs.length, skipped });
  return docs.length;
}

buildPack("equipment.json", "conan-equipment", mapEquipment);
buildPack("edges.json", "conan-edges", mapEdge, { requireConanOrigin: true });
buildPack("hindrances.json", "conan-hindrances", mapHindrance, { requireConanOrigin: true });

// Relatorio em JSON para o journal GM (build-journals.mjs consome).
fs.writeFileSync(path.join(outDir, "build-report.json"), JSON.stringify({ generatedFor: "conan-legacy v0.1.0", report }, null, 2) + "\n", "utf8");

console.log("== Relatorio de build ==");
for (const entry of report) {
  console.log(`\n[${entry.pack}] exportados: ${entry.exported}; fora do export: ${entry.skipped.length}`);
  for (const s of entry.skipped) console.log(`  - ${s.id} (${s.name}): ${s.reason}`);
}
console.log("\nFontes gravadas em foundry/conan-legacy-module/packs/_source/.");
console.log("Proximo passo: node tools/foundry/compile-packs.mjs");

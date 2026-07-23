/**
 * Conan Legacy - Build Hyborian Equipment Pack
 * Foundry VTT 13.351 / SWADE 5.2.6
 *
 * RESOLVE o risco de "dupla fonte de verdade": NAO cria um canonico rico a mao.
 * A fonte editavel unica continua sendo data/conan-legacy/equipment.json. Este build
 * DERIVA o schema rico do SPEC (secao 5.1 / doc tecnico secao 17), aplica as decisoes
 * nao-derivaveis de um overlay pequeno, VALIDA as invariantes mecanicas (SPEC secao 11 +
 * doc secao 15) e GERA tres artefatos:
 *
 *   1. data/canonical/equipment-hyborian.json            (canonico rico, GERADO)
 *   2. foundry/.../packs/_source/conan-equipment-hyborian.json  (payloads Item SWADE, player-safe)
 *   3. output/foundry-validation/equipment-pack-report.md       (relatorio, SPEC secao 12)
 *
 * Uso:
 *   node tools/foundry/build-hyborian-equipment-pack.mjs
 *   (CONAN_REPO_ROOT pode sobrescrever a raiz do repo para teste.)
 *
 * Regras player-safe (identicas ao build-foundry-packs.mjs):
 *   - exportam para o pack apenas: editorial_status em {canon, approved, approved_for_playtest}
 *     e is_public !== false e visibility !== gm_only;
 *   - gm_notes NUNCA entram no payload exportado.
 *
 * Decisoes de mapeamento faithful ao doc tecnico:
 *   - Capacete (is_helmet) NAO vira Item type "armor" no Foundry: vira "gear", para nunca
 *     somar Armor constante (doc secao 6 e secao 15).
 *   - Municao (is_ammunition) vira "gear".
 *   - Escudo preserva Unarmored Hero; armadura corporal desativa (doc secao 5 e secao 6).
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.CONAN_REPO_ROOT
  ? path.resolve(process.env.CONAN_REPO_ROOT)
  : path.resolve(__dirname, "..", "..");

const dataDir = path.join(repoRoot, "data", "conan-legacy");
const srcFile = path.join(dataDir, "equipment.json");
const overlayFile = path.join(dataDir, "equipment-hyborian-overlay.json");
const canonicalOutDir = path.join(repoRoot, "data", "canonical");
const canonicalOut = path.join(canonicalOutDir, "equipment-hyborian.json");
const packSrcDir = path.join(repoRoot, "foundry", "conan-legacy-module", "packs", "_source");
const packSrcOut = path.join(packSrcDir, "conan-equipment-hyborian.json");
const reportDir = path.join(repoRoot, "output", "foundry-validation");
const reportOut = path.join(reportDir, "equipment-pack-report.md");

const ALLOWED_EXPORT_STATUS = new Set(["canon", "approved", "approved_for_playtest"]);

function readJson(file, fallback) {
  if (!fs.existsSync(file)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Arquivo obrigatorio ausente: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
}

function foundryId(seed) {
  return crypto.createHash("sha256").update(seed).digest("base64url").replace(/[-_]/g, "a").slice(0, 16);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ------------ Classificacao (derivada, sem invencao) ------------ */

function classify(record) {
  const fx = record.swade_effect || {};
  const sub = (record.subcategory || "").toLowerCase();
  const isHelmet = record.id.startsWith("HELM") || sub.includes("capacete") || sub.includes("elmo");
  const isAmmunition = sub.includes("municao") || sub.includes("munição");
  const isShield = record.category === "shields" || fx.item_type === "shield";
  const isBodyArmor = record.category === "armor" && !isHelmet;
  const isWeapon = fx.item_type === "weapon" && !isAmmunition;
  return { isHelmet, isAmmunition, isShield, isBodyArmor, isWeapon };
}

function deriveUnarmoredHero(cls) {
  if (cls.isBodyArmor) return "disabled";
  if (cls.isShield || cls.isHelmet) return "preserved";
  return "n/a";
}

function deriveVisibility(record) {
  if (record.editorial_status === "gm_only" || record.access === "Mestre" || record.is_public === false) {
    return "gm_only";
  }
  return "player_safe";
}

/* ------------ Enriquecimento -> registro rico (doc secao 17) ------------ */

function enrich(record, overlayItems) {
  const fx = record.swade_effect || {};
  const cls = classify(record);
  const ov = overlayItems[record.id] || {};
  const foundryType = cls.isHelmet || cls.isAmmunition
    ? "gear"
    : (["weapon", "armor", "shield"].includes(fx.item_type) ? fx.item_type : "gear");

  return {
    // comuns
    id: record.id,
    item_id: record.id,
    name: record.name,
    type: record.type,
    category: record.category,
    subcategory: record.subcategory || "",
    editorial_status: ov.editorial_status || record.editorial_status,
    visibility: ov.visibility || deriveVisibility(record),
    source_refs: record.source_refs || [],
    player_safe_text: record.player_safe_text || "",
    gm_notes: record.gm_notes || "",
    foundry_ready: true,
    // tecnicos de equipamento (doc secao 17)
    family_id: record.family_id ?? ov.family_id ?? null,
    quality_id: record.quality_id ?? ov.quality_id ?? null,
    culture_id: ov.culture_id ?? null,
    access: record.access || "Publico",
    availability_tags: record.availability_tags || [record.access || "Publico"],
    base_cost: ov.base_cost ?? record.cost ?? 0,
    final_cost: record.cost ?? 0,
    weight: record.weight ?? 0,
    bulk_note: ov.bulk_note ?? "",
    is_starting_eligible: record.is_starting_eligible !== false,
    requires_master_exception: Boolean(record.requires_master_exception),
    personal_story_exception_note: ov.personal_story_exception_note ?? "",
    swade_trait: ov.swade_trait ?? null,
    swade_effect: fx,
    swade_baseline_ref: ov.swade_baseline_ref ?? null,
    mechanical_notes: ov.mechanical_notes ?? fx.notes ?? "",
    fictional_permissions: ov.fictional_permissions ?? "",
    source_inspiration: ov.source_inspiration ?? "",
    atlantean_tier: ov.atlantean_tier ?? "nenhum",
    poison_family: ov.poison_family ?? null,
    // classificacao derivada / interacao
    is_body_armor: cls.isBodyArmor,
    is_shield: cls.isShield,
    is_helmet: cls.isHelmet,
    is_ammunition: cls.isAmmunition,
    unarmored_hero_interaction: ov.unarmored_hero_interaction ?? deriveUnarmoredHero(cls),
    foundry_type: foundryType,
    foundry_mapping_status: "derived"
  };
}

/* ------------ Validacao (SPEC secao 11 + doc secao 15) ------------ */

function validate(riches) {
  const errors = [];
  const seen = new Set();
  const req = (r, msg) => { errors.push(`${r.id}: ${msg}`); };

  for (const r of riches) {
    if (seen.has(r.id)) req(r, `id duplicado`);
    seen.add(r.id);

    for (const f of ["name", "category", "access", "editorial_status"]) {
      if (!r[f]) req(r, `campo obrigatorio ausente: ${f}`);
    }
    if (!Array.isArray(r.source_refs) || r.source_refs.length === 0) req(r, `source_refs vazio`);

    if (r.is_starting_eligible && !(typeof r.final_cost === "number")) req(r, `compra inicial sem custo`);
    if (r.access === "Mestre" && r.is_starting_eligible === true) req(r, `item Mestre marcado como is_starting_eligible`);

    if (r.is_helmet && (r.swade_effect?.armor ?? 0) > 0) req(r, `capacete com Armor constante (viola doc secao 15)`);
    if (r.is_shield && r.unarmored_hero_interaction === "disabled") req(r, `escudo desativando Unarmored Hero`);
    if (r.is_body_armor && r.unarmored_hero_interaction !== "disabled" && r.atlantean_tier === "nenhum") {
      req(r, `armadura corporal preservando Unarmored Hero sem ser artefato`);
    }
    if (r.atlantean_tier !== "nenhum" && r.is_starting_eligible === true) req(r, `material atlante elegivel para compra inicial`);

    // Espadas curtas: invariantes criticas
    if (r.id === "WPN-02") {
      const fx = r.swade_effect || {};
      if (fx.damage !== "For+d6-1" || r.final_cost !== 75 || fx.min_strength !== "d6") {
        req(r, `espada curta comum precisa ser For+d6-1, custo 75, Forca minima d6 (achado: ${fx.damage}/${r.final_cost}/${fx.min_strength})`);
      }
    }
    if (r.id === "WPN-03") {
      const fx = r.swade_effect || {};
      if (fx.damage !== "For+d6" || r.final_cost !== 175 || fx.min_strength !== "d6") {
        req(r, `espada curta metalurgia padrao precisa ser For+d6, custo 175, Forca minima d6 (achado: ${fx.damage}/${r.final_cost}/${fx.min_strength})`);
      }
    }
    // Nenhuma outra arma pode receber -1
    if (r.is_weapon && r.id !== "WPN-02") {
      const dmg = r.swade_effect?.damage || "";
      if (/-1\b/.test(dmg)) req(r, `arma com -1 indevido (copia da espada curta): ${dmg}`);
    }
  }
  return errors;
}

/* ------------ Payload Item Foundry (player-safe, flags ricas) ------------ */

function playtestTag(r) {
  return r.editorial_status === "approved_for_playtest"
    ? "<p><em>[Playtest] Regra aprovada para teste de mesa; pode mudar.</em></p>" : "";
}

function mapItem(r) {
  const fx = r.swade_effect || {};
  const itemType = r.foundry_type;
  const descriptionParts = [
    `<p>${escapeHtml(r.player_safe_text)}</p>`,
    `<p><strong>Acesso:</strong> ${escapeHtml(r.access)}${r.requires_master_exception ? " - requer excecao do Mestre" : ""}</p>`,
    r.subcategory ? `<p><strong>Categoria:</strong> ${escapeHtml(r.category)} / ${escapeHtml(r.subcategory)}</p>` : "",
    r.is_helmet ? "<p><em>Protecao situacional: nao soma Armor/Toughness constante.</em></p>" : "",
    r.is_shield ? "<p><em>Escudo: nao desativa Unarmored Hero.</em></p>" : "",
    r.is_body_armor ? "<p><em>Armadura corporal: desativa Unarmored Hero enquanto usada.</em></p>" : "",
    r.mechanical_notes ? `<p>${escapeHtml(r.mechanical_notes)}</p>` : "",
    playtestTag(r),
    `<p><em>ID Conan Legacy: ${escapeHtml(r.id)}</em></p>`
  ].filter(Boolean).join("\n");

  const system = { description: descriptionParts, quantity: 1, price: r.final_cost ?? 0, weight: r.weight ?? 0 };
  if (itemType === "weapon") {
    system.damage = fx.damage || "";
    system.minStr = fx.min_strength || "";
    system.ap = fx.ap ?? 0;
    if (fx.range) system.range = fx.range;
    if (fx.parry) system.parry = fx.parry;
  }
  if (itemType === "armor") system.armor = fx.armor ?? 0;
  if (itemType === "shield") system.parry = fx.parry ?? 0;

  return {
    _id: foundryId(`conan-legacy.equipment-hyborian.${r.id}`),
    name: r.name,
    type: itemType,
    img: "icons/svg/item-bag.svg",
    system,
    effects: [],
    folder: null,
    flags: {
      "conan-legacy": {
        item_id: r.id,
        family_id: r.family_id,
        quality_id: r.quality_id,
        culture_id: r.culture_id,
        access: r.access,
        availabilityTags: r.availability_tags,
        editorial_status: r.editorial_status,
        source_refs: r.source_refs,
        unarmored_hero_interaction: r.unarmored_hero_interaction,
        atlantean_tier: r.atlantean_tier,
        startingEligible: r.is_starting_eligible === true,
        requiresMasterException: r.requires_master_exception === true,
        foundry_mapping_status: r.foundry_mapping_status
      }
    }
  };
}

/* ------------ Build ------------ */

const source = readJson(srcFile);
const overlay = readJson(overlayFile, { items: {} });
const overlayItems = overlay.items || {};

const riches = (source.records || []).map(r => {
  const enriched = enrich(r, overlayItems);
  enriched.is_weapon = classify(r).isWeapon; // usado pela validacao
  return enriched;
});

const errors = validate(riches);

// Exportaveis (player-safe) para o pack
const exportable = riches.filter(r =>
  ALLOWED_EXPORT_STATUS.has(r.editorial_status) && r.visibility !== "gm_only" && r.is_public !== false
);
const skipped = riches.filter(r => !exportable.includes(r));

// Escreve canonico rico (sem o campo auxiliar is_weapon)
const richOut = {
  version: "0.1.0",
  kind: "equipment",
  generated: true,
  do_not_edit: "GERADO por tools/foundry/build-hyborian-equipment-pack.mjs. Edite data/conan-legacy/equipment.json ou o overlay.",
  baseline: { foundry: "13.351", swade: "5.2.6" },
  source_refs: source.source_refs || [],
  generated_at: new Date().toISOString().slice(0, 10),
  records: riches.map(({ is_weapon, ...rest }) => rest)
};

const docsForPack = exportable.map(mapItem);
// checa colisao de _id
const idset = new Set();
for (const d of docsForPack) {
  if (idset.has(d._id)) throw new Error(`Colisao de _id no pack: ${d.name}`);
  idset.add(d._id);
}

// Relatorio (SPEC secao 12)
function countBy(arr, fn) {
  const m = {};
  for (const x of arr) { const k = fn(x); m[k] = (m[k] || 0) + 1; }
  return m;
}
const gmOnly = riches.filter(r => r.visibility === "gm_only");
const starting = riches.filter(r => r.is_starting_eligible && r.access !== "Mestre");
const restricted = riches.filter(r => ["Restrito", "Raro", "Singular"].includes(r.access));
const automated = exportable.filter(r => ["weapon", "armor", "shield"].includes(r.foundry_type));
const textOnly = exportable.filter(r => r.foundry_type === "gear");

const reportLines = [
  `# Relatorio de build - Pacote de Equipamentos da Era Hiboriana`,
  ``,
  `Gerado por \`tools/foundry/build-hyborian-equipment-pack.mjs\` em ${richOut.generated_at}.`,
  `Baseline: Foundry ${richOut.baseline.foundry} / SWADE ${richOut.baseline.swade}.`,
  ``,
  `## Totais`,
  ``,
  `- Registros canonicos (fonte): ${riches.length}`,
  `- Items gerados no pack (player-safe): ${docsForPack.length}`,
  `- Itens fora do pack (GM-only / status / nao publico): ${skipped.length}`,
  `- Itens GM-only: ${gmOnly.length}`,
  `- Itens de compra inicial: ${starting.length}`,
  `- Itens Restritos/Raros/Singulares: ${restricted.length}`,
  `- Items com automacao (weapon/armor/shield): ${automated.length}`,
  `- Items apenas texto/flags (gear): ${textOnly.length}`,
  ``,
  `## Distribuicao por tipo Foundry (pack)`,
  ``,
  ...Object.entries(countBy(docsForPack, d => d.type)).map(([k, v]) => `- ${k}: ${v}`),
  ``,
  `## Itens fora do pack`,
  ``,
  ...(skipped.length ? skipped.map(r => `- ${r.id} (${r.name}): status=${r.editorial_status}, visibilidade=${r.visibility}`) : ["- (nenhum)"]),
  ``,
  `## Validacao (SPEC secao 11 + doc secao 15)`,
  ``,
  errors.length ? `**FALHOU com ${errors.length} problema(s):**` : `**OK — nenhuma violacao.**`,
  ...errors.map(e => `- ${e}`),
  ``,
  `## Pendencias de schema / decisao (nao invento)`,
  ``,
  `- culture_id/atlantean_tier/swade_baseline_ref preenchidos so via overlay; ausentes ficam null.`,
  `- Municao (WPN-17/18) exportada como gear; auditar se deve ser consumivel dedicado.`,
  `- IDs previstos no doc mas ausentes na fonte (ex.: SHD-04 atlante, ARM-06/07): conteudo novo, fora deste build.`,
  ``,
  `## Proximos testes no Foundry`,
  ``,
  `1. Compilar o pack (adicionar conan-equipment-hyborian a compile-packs.mjs) ou usar a macro de mundo.`,
  `2. Arrastar WPN-02 e WPN-03 para um Actor e conferir For+d6-1 vs For+d6 e custos 75 vs 175.`,
  `3. Conferir escudo (Parry, Unarmored Hero preservado), armadura (desativa), capacete (sem Armor constante).`
];

// Escreve saidas
fs.mkdirSync(canonicalOutDir, { recursive: true });
fs.writeFileSync(canonicalOut, JSON.stringify(richOut, null, 2) + "\n", "utf8");
fs.mkdirSync(packSrcDir, { recursive: true });
fs.writeFileSync(packSrcOut, JSON.stringify(docsForPack, null, 2) + "\n", "utf8");
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportOut, reportLines.join("\n") + "\n", "utf8");

console.log(`Canonico rico: ${path.relative(repoRoot, canonicalOut)} (${riches.length} registros)`);
console.log(`Pack source:   ${path.relative(repoRoot, packSrcOut)} (${docsForPack.length} Items)`);
console.log(`Relatorio:     ${path.relative(repoRoot, reportOut)}`);

if (errors.length) {
  console.error(`\nVALIDACAO FALHOU com ${errors.length} problema(s). Veja o relatorio.`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\nValidacao OK. Pack pronto para compilar/testar.`);

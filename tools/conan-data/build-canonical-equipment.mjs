import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const sourcePath = path.join(repoRoot, "docs", "gerador-equipamentos-data.js");
const outputPath = path.join(repoRoot, "data", "conan-legacy", "equipment.json");

const source = fs.readFileSync(sourcePath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: sourcePath });

const sourceData = sandbox.window.CONAN_EQUIPMENT_DATA;
if (!sourceData?.items?.length) {
  throw new Error("CONAN_EQUIPMENT_DATA.items nao encontrado ou vazio.");
}

const sourceRefs = [
  "docs/gerador-equipamentos-data.js",
  "docs/catalogo-equipamentos-era-hiboriana-conan-legacy.md",
  "docs/equipamentos-era-hiboriana-conan-legacy.md",
  "06_System (Rules)/Equipamentos Loot e Artefatos SWADE.md"
];

const categoryById = new Map(sourceData.categories.map(category => [category.id, category.name]));
const accessToStatus = new Map([
  ["Publico", "canon"],
  ["Incomum", "canon"],
  ["Restrito", "approved_for_playtest"],
  ["Raro", "approved_for_playtest"],
  ["Singular", "draft"],
  ["Mestre", "gm_only"]
]);

function canonicalType(item) {
  if (item.category === "services" || item.category === "mounts" || item.category === "transport") return "services_and_mounts";
  return "equipment";
}
function swadeItemType(item) {
  if (item.category === "melee" || item.category === "ranged") return "weapon";
  if (item.category === "armor") return "armor";
  if (item.category === "shields") return "shield";
  return "gear";
}

function textFor(item) {
  const pieces = [];
  if (item.damage) pieces.push(`Dano ${item.damage}.`);
  if (item.range) pieces.push(`Alcance ${item.range}.`);
  if (Number.isFinite(item.ap)) pieces.push(`AP ${item.ap}.`);
  if (item.armor) pieces.push(`Armor +${item.armor}.`);
  if (item.parry) pieces.push(`Parry +${item.parry}.`);
  if (item.effect) pieces.push(item.effect);
  return pieces.join(" ").trim();
}

const records = sourceData.items.map(item => {
  const gmNotes = [
    item.technical_notes,
    item.requires_master_exception ? "Requer aprovacao ou revisao do Mestre para compra inicial/acesso." : "",
    item.is_public === false ? "Nao exibir em catalogo publico." : ""
  ].filter(Boolean).join(" ");

  return {
    id: item.item_id,
    name: item.name,
    type: canonicalType(item),
    category: item.category,
    category_label: categoryById.get(item.category) || item.category,
    subcategory: item.subcategory || "",
    editorial_status: accessToStatus.get(item.access) || "draft",
    source_refs: sourceRefs,
    player_safe_text: textFor(item),
    gm_notes: gmNotes,
    foundry_ready: false,
    family_id: item.family_id || null,
    quality_id: item.quality_id || null,
    cost: item.cost,
    weight: item.weight,
    access: item.access || "Publico",
    availability_tags: item.availability_tags || [item.access || "Publico"],
    is_starting_eligible: item.is_starting_eligible !== false,
    requires_master_exception: Boolean(item.requires_master_exception),
    is_public: item.is_public !== false,
    swade_effect: {
      item_type: swadeItemType(item),
      damage: item.damage || null,
      min_strength: item.min_strength || null,
      ap: Number.isFinite(item.ap) ? item.ap : null,
      range: item.range || null,
      armor: item.armor || 0,
      parry: item.parry || 0,
      notes: item.effect || ""
    },
    foundry_export: {
      item_type: swadeItemType(item),
      pack: item.category === "services" || item.category === "mounts" || item.category === "transport"
        ? "services-and-mounts"
        : "equipment",
      status: "pending-mapping"
    }
  };
});

const canonical = {
  version: "0.1.0",
  kind: "equipment",
  baseline: {
    foundry: "13.351",
    swade: "5.2.6"
  },
  source_refs: sourceRefs,
  generator_source_version: sourceData.version,
  starting_funds: sourceData.startingFunds,
  currency_label: sourceData.currencyLabel,
  categories: sourceData.categories,
  records,
  packages: sourceData.packages.map(pkg => ({
    id: pkg.package_id,
    name: pkg.name,
    value: pkg.value,
    random_eligible: pkg.randomEligible !== false,
    note: pkg.note || "",
    items: pkg.items
  }))
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(canonical, null, 2)}\n`, "utf8");
console.log(`Gerado ${path.relative(repoRoot, outputPath)} com ${records.length} registros.`);

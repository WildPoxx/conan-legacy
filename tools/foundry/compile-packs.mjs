/**
 * Conan Legacy - Compile Foundry Packs
 * Foundry VTT 13.351 / SWADE 5.2.6
 *
 * Compila as fontes de compendio (packs/_source/*.json, geradas por
 * build-foundry-packs.mjs) para o formato LevelDB usado pelo Foundry v13,
 * gravando em foundry/conan-legacy-module/packs/<pack>/.
 *
 * Requisito (uma vez): npm install @foundryvtt/foundryvtt-cli
 * Uso: node tools/foundry/compile-packs.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const moduleDir = path.join(repoRoot, "foundry", "conan-legacy-module");
const sourceDir = path.join(moduleDir, "packs", "_source");

const PACKS = [
  { name: "conan-equipment", collection: "items" },
  { name: "conan-edges", collection: "items" },
  { name: "conan-hindrances", collection: "items" },
  { name: "conan-journals", collection: "journal" },
  { name: "conan-gm-journals", collection: "journal" }
];

for (const { name: pack, collection } of PACKS) {
  const sourceFile = path.join(sourceDir, `${pack}.json`);
  if (!fs.existsSync(sourceFile)) {
    console.warn(`Pulei ${pack}: fonte ausente (${sourceFile}). Rode build-foundry-packs.mjs antes.`);
    continue;
  }
  const docs = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
  if (!docs.length) {
    console.warn(`Pulei ${pack}: fonte vazia.`);
    continue;
  }

  // O CLI espera um diretorio com um arquivo por Document.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `${pack}-`));
  for (const doc of docs) {
    // _key informa ao CLI a colecao do Document (items ou journal).
    // Paginas embutidas de journal precisam do proprio _key hierarquico.
    const withKey = { ...doc, _key: `!${collection}!${doc._id}` };
    if (collection === "journal" && Array.isArray(withKey.pages)) {
      withKey.pages = withKey.pages.map(pg => ({ ...pg, _key: `!journal.pages!${doc._id}.${pg._id}` }));
    }
    fs.writeFileSync(path.join(tmp, `${doc._id}.json`), JSON.stringify(withKey, null, 2), "utf8");
  }

  const dest = path.join(moduleDir, "packs", pack);
  fs.rmSync(dest, { recursive: true, force: true });
  await compilePack(tmp, dest, { log: false });
  fs.rmSync(tmp, { recursive: true, force: true });

  // Verificacao: extrair de volta e conferir contagem e nomes.
  const check = fs.mkdtempSync(path.join(os.tmpdir(), `${pack}-check-`));
  await extractPack(dest, check, { log: false });
  const extracted = fs.readdirSync(check).filter(f => f.endsWith(".json"));
  if (extracted.length !== docs.length) {
    throw new Error(`Pack ${pack}: esperados ${docs.length} documentos, extraidos ${extracted.length}.`);
  }
  fs.rmSync(check, { recursive: true, force: true });
  console.log(`${pack}: ${docs.length} documentos compilados e verificados.`);
}

console.log("Packs compilados em foundry/conan-legacy-module/packs/.");

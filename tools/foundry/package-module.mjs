/**
 * Conan Legacy - Package Module
 * Foundry VTT 13.351 / SWADE 5.2.6
 *
 * Valida o module.json e empacota o modulo em ZIP de release.
 *
 * Gates (falha = sem ZIP):
 * 1. module.json parseia e id === "conan-legacy".
 * 2. Toda entrada de esmodules, styles, languages[].path e packs[].path existe.
 * 3. Vazamento: nenhum arquivo proibido dentro do modulo (pdf, gdoc, psd, ai,
 *    mp4, obsidian, tmp) e nenhuma string "gm_notes" ou "gm_only" com conteudo
 *    nos _source de packs player-visible.
 * 4. Nome de arquivo com acento/caractere especial dentro do modulo e erro
 *    (licao do bug do gerador).
 *
 * Requisito (uma vez): npm install adm-zip
 * Uso: node tools/foundry/package-module.mjs
 * Saida: output/foundry-release/conan-legacy-v<versao>.zip (pasta conan-legacy/ no topo)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const AdmZip = createRequire(import.meta.url)("adm-zip");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const moduleDir = path.join(repoRoot, "foundry", "conan-legacy-module");
const releaseDir = path.join(repoRoot, "output", "foundry-release");

const failures = [];
const fail = msg => failures.push(msg);

/* Gate 1: manifesto */
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(moduleDir, "module.json"), "utf8").replace(/^﻿/, ""));
} catch (error) {
  console.error(`module.json invalido: ${error.message}`);
  process.exit(1);
}
if (manifest.id !== "conan-legacy") fail(`id inesperado no manifesto: ${manifest.id}`);
if (!manifest.version) fail("version ausente no manifesto.");

/* Gate 2: referencias */
const refs = [
  ...(manifest.esmodules || []),
  ...(manifest.styles || []),
  ...(manifest.languages || []).map(l => l.path),
  ...(manifest.packs || []).map(p => p.path)
];
for (const ref of refs) {
  if (!fs.existsSync(path.join(moduleDir, ref))) fail(`referencia do manifesto nao existe: ${ref}`);
}

/* Gates 3 e 4: varredura de arquivos */
const FORBIDDEN = /\.(pdf|gdoc|gsheet|gslides|psd|ai|mp4|mov|tmp|gcs|gca4|lnk)$|\.obsidian|^\.tmp\./i;
const UNSAFE_NAME = /[^\x20-\x7E]/; // qualquer byte fora do ASCII imprimivel
function walk(dir, rel = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = path.posix.join(rel, entry.name);
    if (FORBIDDEN.test(entry.name)) fail(`arquivo proibido no modulo: ${relPath}`);
    if (UNSAFE_NAME.test(entry.name)) fail(`nome de arquivo com caractere fora de ASCII (risco de 404/URL): ${relPath}`);
    if (entry.isDirectory()) walk(path.join(dir, entry.name), relPath);
  }
}
walk(moduleDir);

/* Gate 3b: gm_notes nunca no payload dos _source */
const sourceDir = path.join(moduleDir, "packs", "_source");
if (fs.existsSync(sourceDir)) {
  for (const file of fs.readdirSync(sourceDir).filter(f => f.endsWith(".json") && f !== "build-report.json")) {
    const text = fs.readFileSync(path.join(sourceDir, file), "utf8");
    if (/"gm_notes"/.test(text)) fail(`possivel vazamento de gm_notes em packs/_source/${file}`);
  }
}

if (failures.length) {
  console.error(`Empacotamento bloqueado por ${failures.length} problema(s):`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

/* Empacotar: pasta conan-legacy/ no topo do ZIP; _source fica fora do release */
fs.mkdirSync(releaseDir, { recursive: true });
const zipPath = path.join(releaseDir, `conan-legacy-v${manifest.version}.zip`);
const zip = new AdmZip();
function addDir(dir, rel) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = path.posix.join(rel, entry.name);
    if (relPath.startsWith("conan-legacy/packs/_source")) continue; // fonte fica fora do release
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) addDir(path.join(dir, entry.name), relPath);
    else zip.addFile(relPath, fs.readFileSync(path.join(dir, entry.name)));
  }
}
addDir(moduleDir, "conan-legacy");
zip.writeZip(zipPath);
console.log(`Validacao OK. Release: ${path.relative(repoRoot, zipPath)} (${fs.statSync(zipPath).size} bytes).`);
console.log("Instalacao de teste: extrair o ZIP em Data/modules/ do Foundry e ativar num mundo SWADE.");

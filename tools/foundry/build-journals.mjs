/**
 * Conan Legacy - Build Journals
 * Foundry VTT 13.351 / SWADE 5.2.6
 *
 * Gera as fontes dos packs de JournalEntry:
 * - conan-journals (player-visible, ownership OBSERVER):
 *   1. Guia Consolidado de Criacao e Avancos (fonte autoral do Vault).
 *   2. Lista nominal SWADE Core: apenas nomes/categorias + "ver SWADE Core".
 *      Nenhum texto comercial e reproduzido (decisao P2).
 * - conan-gm-journals (GM-only, ownership NONE para jogadores):
 *   3. Relatorio de build (o que exportou, o que ficou fora e por que).
 *
 * Requisito (uma vez): npm install marked
 * Uso: node tools/foundry/build-journals.mjs  (apos build-foundry-packs.mjs)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(repoRoot, "foundry", "conan-legacy-module", "packs", "_source");

const GUIA = path.join(repoRoot, "01_Characters", "PCs", "Guia Consolidado de Criacao e Avancos SWADE - Conan Legacy.md");
const NOVICE = path.join(repoRoot, "01_Characters", "PCs", "Desvantagens e Vantagens Novice para Criacao de PCs Conan SWADE.md");
const REPORT = path.join(outDir, "build-report.json");

const OWNERSHIP_PLAYER = { default: 2 }; // OBSERVER
const OWNERSHIP_GM = { default: 0 };     // NONE para jogadores; GM sempre ve

function foundryId(seed) {
  return crypto.createHash("sha256").update(seed).digest("base64url").replace(/[-_]/g, "a").slice(0, 16);
}

function page(seed, name, html, sort) {
  return {
    _id: foundryId(seed),
    name,
    type: "text",
    title: { show: true, level: 1 },
    text: { format: 1, content: html },
    sort,
    ownership: { default: -1 },
    flags: {}
  };
}

function journal(seed, name, pages, ownership) {
  return {
    _id: foundryId(seed),
    name,
    pages,
    ownership,
    folder: null,
    sort: 0,
    flags: { "conan-legacy": { generated: true, source: seed } }
  };
}

/* ---- 1. Guia Consolidado (player) ---- */

const guiaMd = fs.readFileSync(GUIA, "utf8").replace(/^﻿/, "");
const guiaHtml = marked.parse(guiaMd);
const guiaJournal = journal(
  "conan-legacy.journal.guia-consolidado",
  "Guia de Criação e Avanços — Conan Legacy",
  [page("conan-legacy.journal.guia-consolidado.p1", "Guia Consolidado", guiaHtml, 100)],
  OWNERSHIP_PLAYER
);

/* ---- 2. Lista nominal SWADE Core (player, so nomes) ---- */

const noviceMd = fs.readFileSync(NOVICE, "utf8").replace(/^﻿/, "");
let sectionH1 = "";
let sectionH2 = "";
const groups = new Map();
for (const line of noviceMd.split(/\r?\n/)) {
  const h1 = line.match(/^# (.+)/);
  const h2 = line.match(/^## (.+)/);
  const h3 = line.match(/^### (.+)/);
  if (h1) { sectionH1 = h1[1].trim(); continue; }
  if (h2) { sectionH2 = h2[1].trim(); continue; }
  if (h3 && h3[1].includes("[SWADE Core]")) {
    // Mantem apenas o titulo (nome PT (EN) + severidade), sem nenhum texto do corpo.
    const title = h3[1].replace(/\s*\[SWADE Core\]\s*$/, "").trim();
    const key = `${sectionH1} — ${sectionH2}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(title);
  }
}
let nominalHtml = "<p>Lista de referência das opções de SWADE Core liberadas para a mesa. "
  + "Os textos completos estão no livro e no compêndio oficial do sistema SWADE: nenhuma regra é reproduzida aqui.</p>";
for (const [group, names] of groups) {
  nominalHtml += `<h2>${group}</h2><ul>` + names.map(n => `<li>${n} — <em>ver SWADE Core</em></li>`).join("") + "</ul>";
}
const nominalJournal = journal(
  "conan-legacy.journal.lista-nominal-swade-core",
  "Opções SWADE Core liberadas (referência nominal)",
  [page("conan-legacy.journal.lista-nominal-swade-core.p1", "Referência nominal", nominalHtml, 100)],
  OWNERSHIP_PLAYER
);

/* ---- 3. Relatorio de build (GM) ---- */

let reportHtml = "<p>Relatório gerado pelo pipeline canônico → packs. GM-only.</p>";
if (fs.existsSync(REPORT)) {
  const { report } = JSON.parse(fs.readFileSync(REPORT, "utf8"));
  for (const entry of report) {
    reportHtml += `<h2>${entry.pack}</h2><p>Exportados: ${entry.exported}. Fora do export: ${entry.skipped.length}.</p>`;
    if (entry.skipped.length) {
      reportHtml += "<ul>" + entry.skipped.map(s => `<li><strong>${s.id}</strong> (${s.name}): ${s.reason}</li>`).join("") + "</ul>";
    }
  }
} else {
  reportHtml += "<p><em>build-report.json ausente; rode build-foundry-packs.mjs antes.</em></p>";
}
const reportJournal = journal(
  "conan-legacy.journal.relatorio-de-build",
  "GM — Relatório de build dos compêndios",
  [page("conan-legacy.journal.relatorio-de-build.p1", "Relatório de build", reportHtml, 100)],
  OWNERSHIP_GM
);

/* ---- Gravar fontes ---- */

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "conan-journals.json"), JSON.stringify([guiaJournal, nominalJournal], null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "conan-gm-journals.json"), JSON.stringify([reportJournal], null, 2) + "\n", "utf8");

console.log(`conan-journals: 2 journals (Guia Consolidado; lista nominal com ${[...groups.values()].flat().length} referências core em ${groups.size} grupos).`);
console.log("conan-gm-journals: 1 journal (relatório de build, GM-only).");
console.log("Proximo passo: node tools/foundry/compile-packs.mjs");

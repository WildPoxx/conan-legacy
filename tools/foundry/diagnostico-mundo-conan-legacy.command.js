/**
 * Conan Legacy - Diagnostico do Mundo Foundry
 * Foundry VTT 13.351 / SWADE 5.2.6
 *
 * Cole este conteudo no campo Command de um Macro do Foundry e execute como GM.
 * O script e apenas leitura: nao cria, atualiza, move ou apaga documentos do mundo.
 */

(async () => {
  const CAMPAIGN_HINTS = {
    expectedWorldTerms: ["conan", "legacy", "hybor", "hibor", "karavazyan"],
    foreignProjectTerms: ["lost frontier", "outsiders", "veracrucia", "pocilga"],
    expectedModuleTerms: ["conan", "swade", "foundry", "dice", "socket", "lib", "token", "monk", "dfreds"]
  };

  const startedAt = new Date();
  const stamp = formatStamp(startedAt);
  const warnings = [];

  function safe(fn, fallback = null, label = "unknown") {
    try {
      const value = fn();
      return value === undefined ? fallback : value;
    } catch (error) {
      warnings.push({
        scope: "safe-read",
        label,
        message: String(error?.message || error)
      });
      return fallback;
    }
  }

  function collectionSize(value) {
    if (!value) return 0;
    if (typeof value.size === "number") return value.size;
    if (typeof value.length === "number") return value.length;
    if (typeof value.contents?.length === "number") return value.contents.length;
    if (typeof value.toObject === "function") {
      return safe(() => value.toObject().length, 0, "collection-toObject-size");
    }
    return 0;
  }

  function collectionContents(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.contents)) return value.contents;
    if (typeof value.values === "function") return Array.from(value.values());
    if (typeof value.toObject === "function") {
      return safe(() => value.toObject(), [], "collection-toObject-contents");
    }
    return [];
  }

  function folderName(doc) {
    return safe(() => doc.folder?.name || doc.folderName || null, null, "folder-name");
  }

  function documentPermission(doc) {
    const ownership = safe(() => doc.ownership || doc.permission || {}, {}, "document-ownership");
    const defaultValue = ownership?.default;
    if (defaultValue === undefined || defaultValue === null) return "unknown";
    return String(defaultValue);
  }

  function redactedValue(value) {
    if (value === null || value === undefined) return value;
    const text = String(value);
    if (/token|secret|password|senha|key|api|auth|credential/i.test(text)) return "[redacted]";
    if (text.length > 160) return `${text.slice(0, 157)}...`;
    return value;
  }

  function maybeForeignProject(name) {
    const normalized = String(name || "").toLowerCase();
    if (CAMPAIGN_HINTS.foreignProjectTerms.some((term) => normalized.includes(term))) return true;
    return /(^|[^a-z0-9])olf([^a-z0-9]|$)/i.test(normalized);
  }

  function maybeConanProject(name) {
    const normalized = String(name || "").toLowerCase();
    return CAMPAIGN_HINTS.expectedWorldTerms.some((term) => normalized.includes(term));
  }

  function pushWarning(scope, id, name, message, severity = "info") {
    warnings.push({ scope, id: id || null, name: name || null, severity, message });
  }

  function imagePathOf(doc) {
    return safe(() => doc.img || doc.texture?.src || doc.background?.src || doc.thumb || null, null, "image-path");
  }

  function sceneBackground(scene) {
    return safe(() => scene.background?.src || scene.img || null, null, "scene-background");
  }

  function sceneForeground(scene) {
    return safe(() => scene.foreground || scene.foregroundElevation || scene.foreground?.src || null, null, "scene-foreground");
  }

  function worldSettingRecords() {
    const results = [];
    const settings = safe(() => game.settings?.settings, null, "settings-registry");
    if (!settings || typeof settings.entries !== "function") return results;

    for (const [key, data] of settings.entries()) {
      const namespace = safe(() => data.namespace || key.split(".")[0], "unknown", "setting-namespace");
      const settingKey = safe(() => data.key || key.split(".").slice(1).join("."), key, "setting-key");
      const scope = safe(() => data.scope || null, null, "setting-scope");
      if (scope !== "world") continue;

      const usefulNamespace =
        namespace === "core" ||
        namespace === "swade" ||
        namespace === "conan-legacy" ||
        safe(() => game.modules?.get(namespace)?.active, false, "setting-module-active");

      if (!usefulNamespace) continue;

      let value = "[unread]";
      if (!/token|secret|password|senha|key|api|auth|credential/i.test(`${namespace}.${settingKey}`)) {
        value = safe(() => game.settings.get(namespace, settingKey), "[error]", `setting:${namespace}.${settingKey}`);
        value = redactedValue(value);
      } else {
        value = "[redacted]";
      }

      results.push({
        namespace,
        key: settingKey,
        scope,
        type: safe(() => data.type?.name || String(data.type || ""), null, "setting-type"),
        value
      });
    }

    return results.sort((a, b) => `${a.namespace}.${a.key}`.localeCompare(`${b.namespace}.${b.key}`));
  }

  function moduleRecords() {
    const modules = collectionContents(game.modules);
    return modules
      .map((module) => {
        const id = safe(() => module.id || module.name, null, "module-id");
        const title = safe(() => module.title || module.data?.title || id, id, "module-title");
        const active = safe(() => Boolean(module.active), false, "module-active");
        const version = safe(() => module.version || module.data?.version || null, null, "module-version");
        const compatibility = safe(() => module.compatibility || module.data?.compatibility || null, null, "module-compatibility");
        const dependencies = safe(() => {
          const rel = module.relationships || module.data?.relationships || {};
          return [
            ...collectionContents(rel.requires).map((dep) => dep.id || dep.name || dep),
            ...collectionContents(rel.systems).map((dep) => dep.id || dep.name || dep)
          ].filter(Boolean);
        }, [], "module-dependencies");

        if (active && maybeForeignProject(`${id} ${title}`)) {
          pushWarning("modules", id, title, "Modulo ativo parece pertencer a outro projeto.", "review");
        }

        return { id, title, active, version, compatibility, dependencies };
      })
      .sort((a, b) => Number(b.active) - Number(a.active) || String(a.title).localeCompare(String(b.title)));
  }

  function sceneRecords() {
    return collectionContents(game.scenes).map((scene) => {
      const record = {
        id: safe(() => scene.id, null, "scene-id"),
        name: safe(() => scene.name, "Sem nome", "scene-name"),
        active: safe(() => Boolean(scene.active), false, "scene-active"),
        navigation: safe(() => Boolean(scene.navigation), false, "scene-navigation"),
        width: safe(() => scene.width, null, "scene-width"),
        height: safe(() => scene.height, null, "scene-height"),
        grid: {
          type: safe(() => scene.grid?.type ?? scene.gridType, null, "scene-grid-type"),
          size: safe(() => scene.grid?.size ?? scene.gridSize, null, "scene-grid-size"),
          distance: safe(() => scene.grid?.distance ?? scene.gridDistance, null, "scene-grid-distance"),
          units: safe(() => scene.grid?.units ?? scene.gridUnits, null, "scene-grid-units")
        },
        background: sceneBackground(scene),
        foreground: sceneForeground(scene),
        counts: {
          tokens: collectionSize(scene.tokens),
          lights: collectionSize(scene.lights),
          walls: collectionSize(scene.walls),
          sounds: collectionSize(scene.sounds),
          tiles: collectionSize(scene.tiles),
          drawings: collectionSize(scene.drawings),
          notes: collectionSize(scene.notes)
        }
      };

      if (!record.background) pushWarning("scenes", record.id, record.name, "Cena sem imagem de fundo.", "review");
      if (maybeForeignProject(record.name) || maybeForeignProject(record.background)) {
        pushWarning("scenes", record.id, record.name, "Cena parece carregar referencia de outro projeto.", "review");
      }
      if (!record.active && !record.navigation && Object.values(record.counts).every((count) => count === 0)) {
        pushWarning("scenes", record.id, record.name, "Cena parece vazia ou ainda nao preparada.", "info");
      }

      return record;
    });
  }

  function actorRecords() {
    return collectionContents(game.actors).map((actor) => {
      const record = {
        id: safe(() => actor.id, null, "actor-id"),
        name: safe(() => actor.name, "Sem nome", "actor-name"),
        type: safe(() => actor.type, null, "actor-type"),
        folder: folderName(actor),
        img: imagePathOf(actor),
        itemCount: collectionSize(actor.items),
        effectCount: collectionSize(actor.effects),
        systemSummary: actorSystemSummary(actor)
      };

      if (!record.img || record.img === "icons/svg/mystery-man.svg") {
        pushWarning("actors", record.id, record.name, "Actor sem imagem propria.", "info");
      }
      if (record.itemCount === 0) pushWarning("actors", record.id, record.name, "Actor sem itens embutidos.", "review");
      if (maybeForeignProject(record.name) || maybeForeignProject(record.folder)) {
        pushWarning("actors", record.id, record.name, "Actor parece pertencer a outro projeto.", "review");
      }

      return record;
    });
  }

  function actorSystemSummary(actor) {
    const system = safe(() => actor.system || {}, {}, "actor-system");
    return {
      wildcard: safe(() => system.wildcard ?? system.wildCard ?? null, null, "actor-wildcard"),
      bennies: safe(() => system.bennies?.value ?? system.bennies?.max ?? null, null, "actor-bennies"),
      pace: safe(() => system.stats?.speed?.value ?? system.pace?.value ?? null, null, "actor-pace"),
      parry: safe(() => system.stats?.parry?.value ?? system.parry?.value ?? null, null, "actor-parry"),
      toughness: safe(() => system.stats?.toughness?.value ?? system.toughness?.value ?? null, null, "actor-toughness"),
      attributes: safe(() => {
        const attrs = system.attributes || {};
        return Object.fromEntries(Object.entries(attrs).map(([key, value]) => [key, value?.die?.sides ?? value?.die ?? value?.value ?? null]));
      }, {}, "actor-attributes")
    };
  }

  function itemRecords() {
    return collectionContents(game.items).map((item) => {
      const record = {
        id: safe(() => item.id, null, "item-id"),
        name: safe(() => item.name, "Sem nome", "item-name"),
        type: safe(() => item.type, null, "item-type"),
        folder: folderName(item),
        img: imagePathOf(item)
      };

      if (!record.img || record.img === "icons/svg/item-bag.svg") {
        pushWarning("items", record.id, record.name, "Item solto sem imagem propria.", "info");
      }
      if (maybeForeignProject(record.name) || maybeForeignProject(record.folder)) {
        pushWarning("items", record.id, record.name, "Item solto parece pertencer a outro projeto.", "review");
      }

      return record;
    });
  }

  function journalRecords() {
    return collectionContents(game.journal).map((journal) => {
      const record = {
        id: safe(() => journal.id, null, "journal-id"),
        name: safe(() => journal.name, "Sem nome", "journal-name"),
        folder: folderName(journal),
        pageCount: collectionSize(journal.pages),
        ownershipDefault: documentPermission(journal)
      };

      if (record.pageCount === 0) pushWarning("journals", record.id, record.name, "Journal sem paginas.", "info");
      if (maybeForeignProject(record.name) || maybeForeignProject(record.folder)) {
        pushWarning("journals", record.id, record.name, "Journal parece pertencer a outro projeto.", "review");
      }
      if (record.ownershipDefault && Number(record.ownershipDefault) >= 2 && /gm|mestre|secret|segredo|spoiler/i.test(record.name)) {
        pushWarning("journals", record.id, record.name, "Journal possivelmente GM-only parece ter permissao publica.", "review");
      }

      return record;
    });
  }

  async function compendiumRecords() {
    const packs = collectionContents(game.packs);
    const results = [];

    for (const pack of packs) {
      const collection = safe(() => pack.collection, null, "pack-collection");
      const label = safe(() => pack.metadata?.label || pack.title || collection, collection, "pack-label");
      const packageName = safe(() => pack.metadata?.packageName || pack.metadata?.package || null, null, "pack-package");
      const documentName = safe(() => pack.documentName || pack.metadata?.type || null, null, "pack-document-name");
      const locked = safe(() => Boolean(pack.locked), null, "pack-locked");
      let count = null;

      try {
        const index = await pack.getIndex();
        count = collectionSize(index);
      } catch (error) {
        pushWarning("compendiums", collection, label, `Nao foi possivel ler indice do compendium: ${error?.message || error}`, "info");
      }

      if (/conan/i.test(`${collection} ${label} ${packageName}`) && count === 0) {
        pushWarning("compendiums", collection, label, "Compendium Conan Legacy esta vazio.", "review");
      }
      if (maybeForeignProject(`${collection} ${label} ${packageName}`)) {
        pushWarning("compendiums", collection, label, "Compendium parece pertencer a outro projeto.", "review");
      }

      results.push({ collection, label, packageName, documentName, count, locked });
    }

    return results.sort((a, b) => String(a.collection).localeCompare(String(b.collection)));
  }

  function macroRecords() {
    return collectionContents(game.macros).map((macro) => {
      const command = safe(() => macro.command || "", "", "macro-command");
      const record = {
        id: safe(() => macro.id, null, "macro-id"),
        name: safe(() => macro.name, "Sem nome", "macro-name"),
        type: safe(() => macro.type, null, "macro-type"),
        scope: safe(() => macro.scope, null, "macro-scope"),
        folder: folderName(macro),
        author: safe(() => macro.author?.name || macro.author?.id || macro.author, null, "macro-author"),
        commandLength: command.length,
        mutatingHints: /(?:Actor|Item|Scene|JournalEntry|Macro|Folder|RollTable|Playlist)\.create|\.update\(|\.delete\(|\.setFlag\(|\.unsetFlag\(|fromCompendium\(|importFrom/i.test(command)
      };

      if (record.mutatingHints) pushWarning("macros", record.id, record.name, "Macro contem indicios de alteracao de dados do mundo.", "review");
      if (maybeForeignProject(record.name) || maybeForeignProject(record.folder)) {
        pushWarning("macros", record.id, record.name, "Macro parece pertencer a outro projeto.", "review");
      }

      return record;
    });
  }

  function folderRecords() {
    return collectionContents(game.folders).map((folder) => ({
      id: safe(() => folder.id, null, "folder-id"),
      name: safe(() => folder.name, "Sem nome", "folder-name"),
      type: safe(() => folder.type, null, "folder-type"),
      parent: safe(() => folder.folder?.name || folder.parent?.name || null, null, "folder-parent")
    }));
  }

  function collectionCounts() {
    return {
      scenes: collectionSize(game.scenes),
      actors: collectionSize(game.actors),
      items: collectionSize(game.items),
      journals: collectionSize(game.journal),
      macros: collectionSize(game.macros),
      folders: collectionSize(game.folders),
      playlists: collectionSize(game.playlists),
      rollTables: collectionSize(game.tables),
      cards: collectionSize(game.cards),
      combats: collectionSize(game.combats),
      users: collectionSize(game.users),
      compendiums: collectionSize(game.packs)
    };
  }

  function nextPlanningQuestions(report) {
    const questions = [];
    if (report.collections.scenes <= 1) questions.push("Quais 3 a 5 cenas iniciais devem ser criadas antes da primeira sessao?");
    if (report.collections.actors === 0) questions.push("Quais NPCs e inimigos basicos devem formar o primeiro lote de Actors?");
    if (report.collections.journals === 0) questions.push("Quais Journals publicos e GM-only precisam existir no mundo?");
    if (report.modules.active.length > 20) questions.push("Quais modulos ativos sao realmente necessarios para Conan Legacy?");
    if (!report.modules.active.some((module) => /conan/i.test(`${module.id} ${module.title}`))) {
      questions.push("O modulo nativo Conan Legacy ja deve ser instalado e ativado neste mundo?");
    }
    if (report.compendiums.filter((pack) => /conan/i.test(`${pack.collection} ${pack.label} ${pack.packageName}`)).length === 0) {
      questions.push("Quais compendios Conan Legacy devem ser a primeira fonte de itens, Edges, Hindrances e Journals?");
    }
    return questions;
  }

  function formatMarkdown(report) {
    const activeModules = report.modules.active;
    const foreignWarnings = report.warnings.filter((warning) => warning.severity === "review");

    return [
      "# Diagnostico Foundry - Conan Legacy",
      "",
      `Gerado em: ${report.metadata.generatedAtLocal}`,
      "",
      "## Resumo",
      "",
      `- Mundo: ${report.environment.world.title || report.environment.world.id || "-"}`,
      `- Foundry: ${report.environment.foundry.version || "-"}`,
      `- Sistema: ${report.environment.system.title || report.environment.system.id || "-"} ${report.environment.system.version || ""}`.trim(),
      `- Modulos ativos: ${activeModules.length}`,
      `- Cenas: ${report.collections.scenes}`,
      `- Actors: ${report.collections.actors}`,
      `- Items soltos: ${report.collections.items}`,
      `- Journals: ${report.collections.journals}`,
      `- Compendios: ${report.collections.compendiums}`,
      `- Macros: ${report.collections.macros}`,
      `- Alertas para revisao: ${foreignWarnings.length}`,
      "",
      "## Ambiente",
      "",
      `- Usuario executor: ${report.environment.user.name || report.environment.user.id || "-"}`,
      `- GM: ${report.environment.user.isGM ? "sim" : "nao"}`,
      `- Jogo pausado: ${report.environment.paused ? "sim" : "nao"}`,
      `- Idioma: ${report.environment.language || "-"}`,
      "",
      "## Modulos Ativos",
      "",
      activeModules.length
        ? activeModules.map((module) => `- ${module.title || module.id} (${module.id || "-"}), versao ${module.version || "-"}`).join("\n")
        : "- Nenhum modulo ativo listado.",
      "",
      "## Cenas",
      "",
      report.scenes.length
        ? report.scenes.map((scene) => `- ${scene.name} (${scene.width || "?"}x${scene.height || "?"}); tokens ${scene.counts.tokens}; lights ${scene.counts.lights}; background: ${scene.background || "-"}`).join("\n")
        : "- Nenhuma cena encontrada.",
      "",
      "## Actors",
      "",
      report.actors.length
        ? report.actors.map((actor) => `- ${actor.name} [${actor.type || "-"}]; itens ${actor.itemCount}; pasta: ${actor.folder || "-"}`).join("\n")
        : "- Nenhum Actor encontrado.",
      "",
      "## Items Soltos",
      "",
      report.items.length
        ? report.items.map((item) => `- ${item.name} [${item.type || "-"}]; pasta: ${item.folder || "-"}`).join("\n")
        : "- Nenhum Item solto encontrado.",
      "",
      "## Journals",
      "",
      report.journals.length
        ? report.journals.map((journal) => `- ${journal.name}; paginas ${journal.pageCount}; permissao default ${journal.ownershipDefault}`).join("\n")
        : "- Nenhum Journal encontrado.",
      "",
      "## Compendios",
      "",
      report.compendiums.length
        ? report.compendiums.map((pack) => `- ${pack.label || pack.collection} (${pack.collection}); tipo ${pack.documentName || "-"}; docs ${pack.count ?? "?"}; pacote ${pack.packageName || "-"}`).join("\n")
        : "- Nenhum compendium encontrado.",
      "",
      "## Macros",
      "",
      report.macros.length
        ? report.macros.map((macro) => `- ${macro.name} [${macro.type || "-"}]; altera dados: ${macro.mutatingHints ? "possivelmente" : "nao indicado"}`).join("\n")
        : "- Nenhum Macro encontrado.",
      "",
      "## Alertas",
      "",
      report.warnings.length
        ? report.warnings.map((warning) => `- [${warning.severity || "info"}] ${warning.scope}${warning.name ? ` / ${warning.name}` : ""}: ${warning.message}`).join("\n")
        : "- Nenhum alerta registrado.",
      "",
      "## Perguntas de Planejamento",
      "",
      report.nextPlanningQuestions.length
        ? report.nextPlanningQuestions.map((question) => `- ${question}`).join("\n")
        : "- Nenhuma pergunta automatica gerada.",
      ""
    ].join("\n");
  }

  function formatStamp(date) {
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  function downloadText(filename, text, mime) {
    if (typeof saveDataToFile === "function") {
      try {
        saveDataToFile(text, mime, filename);
        return { ok: true, mode: "foundry-saveDataToFile", filename };
      } catch (error) {
        pushWarning("download", filename, filename, `saveDataToFile falhou: ${error?.message || error}`, "review");
      }
    }

    try {
      const blob = new Blob([text], { type: mime });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.target = "_self";
      anchor.rel = "noopener";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      return { ok: true, mode: "blob-anchor", filename };
    } catch (error) {
      pushWarning("download", filename, filename, `Falha ao iniciar download: ${error?.message || error}`, "review");
      return { ok: false, mode: "failed", filename, error: String(error?.message || error) };
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function showMirrorDialog(report, jsonText, markdownText, jsonFilename, mdFilename, downloadResults) {
    const content = `
      <style>
        .conan-diagnostic-mirror { display: grid; gap: 0.75rem; }
        .conan-diagnostic-mirror p { margin: 0; }
        .conan-diagnostic-mirror textarea {
          width: 100%;
          min-height: 220px;
          resize: vertical;
          font-family: var(--font-monospace, monospace);
          font-size: 12px;
          white-space: pre;
        }
        .conan-diagnostic-mirror .diagnostic-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }
        .conan-diagnostic-mirror code { user-select: all; }
      </style>
      <div class="conan-diagnostic-mirror">
        <p><strong>Diagnostico gerado.</strong> Se o download nao apareceu, copie um dos espelhos abaixo e salve como arquivo de texto.</p>
        <p>Arquivos sugeridos: <code>${escapeHtml(jsonFilename)}</code> e <code>${escapeHtml(mdFilename)}</code>.</p>
        <p>Modo de download: JSON <code>${escapeHtml(downloadResults.json.mode)}</code>; Markdown <code>${escapeHtml(downloadResults.markdown.mode)}</code>.</p>
        <div class="diagnostic-grid">
          <section>
            <h3>Markdown resumido</h3>
            <textarea readonly data-diagnostic-kind="markdown">${escapeHtml(markdownText)}</textarea>
          </section>
          <section>
            <h3>JSON completo</h3>
            <textarea readonly data-diagnostic-kind="json">${escapeHtml(jsonText)}</textarea>
          </section>
        </div>
      </div>
    `;

    const copyByKind = async (html, kind, fallbackText) => {
      const textarea = html.find(`textarea[data-diagnostic-kind="${kind}"]`)[0];
      const value = textarea?.value || fallbackText;
      try {
        await navigator.clipboard.writeText(value);
        ui.notifications?.info?.(`Diagnostico ${kind === "json" ? "JSON" : "Markdown"} copiado.`);
      } catch (error) {
        textarea?.focus();
        textarea?.select();
        ui.notifications?.warn?.("Nao consegui copiar automaticamente. O texto ficou selecionado para copiar manualmente.");
      }
    };

    const rerunDownload = (kind) => {
      if (kind === "json") {
        const result = downloadText(jsonFilename, jsonText, "application/json;charset=utf-8");
        console.log("Retry download JSON:", result);
      } else {
        const result = downloadText(mdFilename, markdownText, "text/markdown;charset=utf-8");
        console.log("Retry download Markdown:", result);
      }
    };

    new Dialog({
      title: "Conan Legacy - Diagnostico do Mundo",
      content,
      buttons: {
        copyMarkdown: {
          label: "Copiar Markdown",
          callback: (html) => copyByKind(html, "markdown", markdownText)
        },
        copyJson: {
          label: "Copiar JSON",
          callback: (html) => copyByKind(html, "json", jsonText)
        },
        downloadAgain: {
          label: "Tentar download novamente",
          callback: () => {
            rerunDownload("json");
            rerunDownload("markdown");
          }
        },
        close: {
          label: "Fechar"
        }
      },
      default: "copyMarkdown",
      render: (html) => {
        html.find("textarea").on("focus", (event) => event.currentTarget.select());
      }
    }, {
      width: Math.min(window.innerWidth - 120, 1100),
      height: "auto",
      resizable: true
    }).render(true);

    console.log("Espelho de diagnostico disponivel na janela Foundry.", {
      reportId: report.metadata.reportId,
      jsonFilename,
      mdFilename
    });
  }

  const report = {
    metadata: {
      reportId: `conan-legacy-foundry-diagnostico-${stamp}`,
      generatedAt: startedAt.toISOString(),
      generatedAtLocal: startedAt.toLocaleString("pt-BR"),
      macro: "diagnostico-mundo-conan-legacy.command.js",
      purpose: "Planejamento e auditoria inicial do mundo Foundry Conan Legacy.",
      readOnly: true
    },
    environment: {
      foundry: {
        version: safe(() => game.version || game.release?.version || null, null, "foundry-version"),
        generation: safe(() => game.release?.generation || null, null, "foundry-generation"),
        build: safe(() => game.release?.build || null, null, "foundry-build")
      },
      system: {
        id: safe(() => game.system?.id, null, "system-id"),
        title: safe(() => game.system?.title, null, "system-title"),
        version: safe(() => game.system?.version, null, "system-version")
      },
      world: {
        id: safe(() => game.world?.id, null, "world-id"),
        title: safe(() => game.world?.title, null, "world-title"),
        description: redactedValue(safe(() => game.world?.description, null, "world-description"))
      },
      user: {
        id: safe(() => game.user?.id, null, "user-id"),
        name: safe(() => game.user?.name, null, "user-name"),
        isGM: safe(() => Boolean(game.user?.isGM), false, "user-is-gm")
      },
      paused: safe(() => Boolean(game.paused), false, "game-paused"),
      language: safe(() => game.i18n?.lang, null, "game-language")
    },
    modules: {
      active: [],
      inactive: [],
      all: []
    },
    settings: [],
    scenes: [],
    actors: [],
    items: [],
    journals: [],
    compendiums: [],
    macros: [],
    folders: [],
    collections: {},
    warnings,
    nextPlanningQuestions: []
  };

  report.modules.all = moduleRecords();
  report.modules.active = report.modules.all.filter((module) => module.active);
  report.modules.inactive = report.modules.all.filter((module) => !module.active);
  report.settings = worldSettingRecords();
  report.scenes = sceneRecords();
  report.actors = actorRecords();
  report.items = itemRecords();
  report.journals = journalRecords();
  report.compendiums = await compendiumRecords();
  report.macros = macroRecords();
  report.folders = folderRecords();
  report.collections = collectionCounts();
  report.nextPlanningQuestions = nextPlanningQuestions(report);

  if (report.environment.system.id !== "swade") {
    pushWarning("environment", report.environment.system.id, report.environment.system.title, "O sistema ativo nao parece ser SWADE.", "review");
  }
  if (!maybeConanProject(`${report.environment.world.id} ${report.environment.world.title}`)) {
    pushWarning("environment", report.environment.world.id, report.environment.world.title, "O mundo nao contem marcadores obvios de Conan Legacy no nome/id.", "info");
  }

  const jsonText = JSON.stringify(report, null, 2);
  const markdownText = formatMarkdown(report);
  const jsonFilename = `${report.metadata.reportId}.json`;
  const mdFilename = `${report.metadata.reportId}.md`;

  const jsonDownloaded = downloadText(jsonFilename, jsonText, "application/json;charset=utf-8");
  const mdDownloaded = downloadText(mdFilename, markdownText, "text/markdown;charset=utf-8");
  const downloadResults = { json: jsonDownloaded, markdown: mdDownloaded };

  console.group("Conan Legacy - Diagnostico Foundry");
  console.log("JSON completo:", report);
  console.log("Markdown resumido:\n", markdownText);
  console.log("Downloads:", { jsonFilename, mdFilename, downloadResults });
  console.groupEnd();

  showMirrorDialog(report, jsonText, markdownText, jsonFilename, mdFilename, downloadResults);

  ui.notifications?.info?.(`Diagnostico Conan Legacy gerado: ${report.collections.scenes} cenas, ${report.collections.actors} actors, ${report.modules.active.length} modulos ativos.`);
})();

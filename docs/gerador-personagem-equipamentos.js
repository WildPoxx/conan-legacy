(() => {
  "use strict";

  const STORAGE_KEY = "conanLegacyEquipmentState";
  const STEP_KEY = "conanLegacyHeroeForgeStep";
  const DATA = window.CONAN_EQUIPMENT_DATA || { categories: [], items: [], packages: [], startingFunds: 650 };
  const form = document.getElementById("pc-form");
  if (!form) return;

  let state = { packageId: "", items: [], step: "creation" };
  let initialized = false;

  const byId = id => DATA.items.find(item => item.item_id === id);
  const categoryById = id => DATA.categories.find(category => category.id === id);
  const money = value => `${Number(value || 0).toLocaleString("pt-BR")} ${DATA.currencyLabel || "moedas"}`;
  const weight = value => Number.isFinite(value) ? `${Number(value).toLocaleString("pt-BR")} peso` : "-";
  const esc = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  const accessLabel = access => access === "Publico" ? "Comum" : (access || "Comum");

  function ensureHidden(name) {
    let field = form.elements[name];
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }
    return field;
  }

  function visibleItems() {
    return DATA.items.filter(item => item.is_public !== false && item.is_starting_eligible !== false && item.cost !== null && item.access !== "Mestre");
  }

  function normalizeItems(items) {
    const merged = new Map();
    (items || []).forEach(entry => {
      const id = entry.item_id || entry.id;
      const item = byId(id);
      const qty = Math.max(1, Number.parseInt(entry.qty || 1, 10) || 1);
      if (!item) return;
      const current = merged.get(id) || 0;
      merged.set(id, current + qty);
    });
    return [...merged.entries()].map(([item_id, qty]) => ({ item_id, qty }));
  }

  function syncHidden() {
    state.items = normalizeItems(state.items);
    ensureHidden("equipmentPackageId").value = state.packageId || "";
    ensureHidden("equipmentSelectedJson").value = JSON.stringify({ packageId: state.packageId || "", items: state.items });
    ensureHidden("equipmentStep").value = state.step || "creation";
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function readHiddenState() {
    const raw = form.elements.equipmentSelectedJson?.value || "";
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return { packageId: parsed.packageId || "", items: normalizeItems(parsed.items || []), step: form.elements.equipmentStep?.value || "creation" };
    } catch {
      return null;
    }
  }

  function restoreFromForm() {
    const fromHidden = readHiddenState();
    if (fromHidden) state = fromHidden;
    else {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (stored) state = { packageId: stored.packageId || "", items: normalizeItems(stored.items || []), step: stored.step || "creation" };
      } catch {}
    }
    state.step = form.elements.equipmentStep?.value || state.step || localStorage.getItem(STEP_KEY) || "creation";
    syncHidden();
    render();
    applyStep(state.step);
  }

  function selectedPackage() {
    return DATA.packages.find(pkg => pkg.package_id === state.packageId) || null;
  }

  function collect(context = {}) {
    const extraFunds = Number(context.extraFunds || 0);
    const budgetBase = DATA.startingFunds || 650;
    const budget = budgetBase + extraFunds;
    const rows = normalizeItems(state.items).map(entry => {
      const item = byId(entry.item_id);
      const cost = Number(item?.cost || 0) * entry.qty;
      const itemWeight = Number.isFinite(Number(item?.weight)) ? Number(item.weight) * entry.qty : 0;
      return { ...entry, item, cost, weight: itemWeight };
    }).filter(row => row.item);
    const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
    const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
    const warnings = [];
    const errors = [];
    const packageInfo = selectedPackage();

    rows.forEach(row => {
      const item = row.item;
      if (item.requires_master_exception || ["Incomum", "Raro", "Restrito", "Singular"].includes(item.access)) {
        warnings.push(`${item.name}: ${accessLabel(item.access)}; revisar disponibilidade com o Mestre.`);
      }
      if (item.is_body_armor) warnings.push(`${item.name}: armadura corporal desativa Unarmored Hero enquanto usada.`);
      if (item.is_shield) warnings.push(`${item.name}: escudo preserva Unarmored Hero.`);
      if (item.is_helmet) warnings.push(`${item.name}: capacete e protecao situacional; não altera Toughness constante.`);
    });
    if (totalCost > budget) errors.push(`Equipamentos acima do orçamento: ${totalCost}/${budget}.`);

    const armorBonus = rows.reduce((max, row) => row.item.is_body_armor ? Math.max(max, Number(row.item.armor || 0)) : max, 0);
    const shieldParryBonus = rows.reduce((max, row) => row.item.is_shield ? Math.max(max, Number(row.item.parry || 0)) : max, 0);

    return {
      packageId: state.packageId || "",
      packageName: packageInfo?.name || "",
      budgetBase,
      budgetBonus: extraFunds,
      budget,
      totalCost,
      totalWeight,
      remaining: budget - totalCost,
      rows,
      items: rows.map(row => ({
        item_id: row.item.item_id,
        name: row.item.name,
        qty: row.qty,
        unitCost: row.item.cost,
        cost: row.cost,
        unitWeight: row.item.weight,
        weight: row.weight,
        access: row.item.access,
        damage: row.item.damage || "",
        armor: row.item.armor || 0,
        parry: row.item.parry || 0,
        effect: row.item.effect || "",
      })),
      warnings,
      errors,
      armorBonus,
      shieldParryBonus,
      hasBodyArmor: rows.some(row => row.item.is_body_armor),
      hasShield: rows.some(row => row.item.is_shield),
      hasHelmet: rows.some(row => row.item.is_helmet),
      unarmoredHero: rows.some(row => row.item.is_body_armor) ? "desativado por armadura corporal" : (rows.some(row => row.item.is_shield) ? "preservado; escudo não desativa" : "sem armadura corporal selecionada"),
    };
  }

  function addItem(itemId, qty = 1) {
    if (!byId(itemId)) return;
    state.items.push({ item_id: itemId, qty });
    state.packageId = "";
    syncHidden();
    render();
    notifyChange();
  }

  function removeItem(itemId) {
    state.items = state.items.filter(entry => entry.item_id !== itemId);
    state.packageId = "";
    syncHidden();
    render();
    notifyChange();
  }

  function changeQty(itemId, qty) {
    state.items = state.items.map(entry => entry.item_id === itemId ? { ...entry, qty: Math.max(1, Number.parseInt(qty || 1, 10) || 1) } : entry);
    syncHidden();
    render();
    notifyChange();
  }

  function applyPackage(packageId) {
    const pkg = DATA.packages.find(item => item.package_id === packageId);
    if (!pkg) return null;
    state.packageId = pkg.package_id;
    state.items = normalizeItems(pkg.items);
    syncHidden();
    render();
    notifyChange();
    return pkg;
  }

  function applyRandomPackage(random = Math.random) {
    const eligible = DATA.packages.filter(pkg => pkg.randomEligible !== false);
    if (!eligible.length) return null;
    const pkg = eligible[Math.floor(random() * eligible.length) % eligible.length];
    return applyPackage(pkg.package_id);
  }

  function notifyChange() {
    form.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function itemOptionText(item) {
    const parts = [item.name, money(item.cost), accessLabel(item.access)];
    if (item.damage) parts.push(item.damage);
    if (item.armor) parts.push(`Armor +${item.armor}`);
    if (item.parry) parts.push(`Parry +${item.parry}`);
    return parts.join(" | ");
  }

  function renderWarnings(calc) {
    const lines = [...calc.errors.map(text => `<li class="error">${esc(text)}</li>`), ...calc.warnings.map(text => `<li>${esc(text)}</li>`)].join("");
    return `<ul class="equipment-warnings">${lines || "<li>Nenhuma pendência de equipamento no momento.</li>"}</ul>`;
  }

  function renderRows(calc) {
    if (!calc.rows.length) return `<p class="hint">Nenhum item estruturado selecionado. Use um pacote ou adicione itens por categoria.</p>`;
    return `<div class="equipment-list">${calc.rows.map(row => {
      const item = row.item;
      const category = categoryById(item.category)?.name || item.category;
      const details = [category, accessLabel(item.access), item.damage || "", item.armor ? `Armor +${item.armor}` : "", item.parry ? `Parry +${item.parry}` : "", item.effect || ""].filter(Boolean).join("; ");
      return `<div class="equipment-row" data-equipment-row="${esc(item.item_id)}">
        <div><strong>${esc(item.name)}</strong><span>${esc(details)}</span></div>
        <label>Qtd.<input type="number" min="1" max="20" value="${row.qty}" data-equipment-qty="${esc(item.item_id)}"></label>
        <div><span>Custo</span><strong>${money(row.cost)}</strong></div>
        <div><span>Peso</span><strong>${weight(row.weight)}</strong></div>
        <button class="button small" type="button" data-equipment-remove="${esc(item.item_id)}">Remover</button>
      </div>`;
    }).join("")}</div>`;
  }

  function render() {
    const root = document.getElementById("equipment-builder");
    if (!root) return;
    const calc = collect({ extraFunds: window.HeroeForgeValidation?.collect?.().extraFunds || 0 });
    const categoryOptions = DATA.categories.filter(category => visibleItems().some(item => item.category === category.id));
    const selectedCategory = root.querySelector("[data-equipment-category]")?.value || categoryOptions[0]?.id || "";
    const itemOptions = visibleItems().filter(item => item.category === selectedCategory);
    root.innerHTML = `
      <div class="equipment-panel">
        <div class="grid two">
          <label>Pacote inicial
            <select data-equipment-package>
              <option value="">Escolha um pacote...</option>
              ${DATA.packages.map(pkg => `<option value="${esc(pkg.package_id)}" ${pkg.package_id === state.packageId ? "selected" : ""}>${esc(pkg.name)} | ${money(pkg.value)}</option>`).join("")}
            </select>
          </label>
          <button class="button equipment-apply" type="button" data-equipment-apply-package>Aplicar pacote</button>
        </div>
        <p class="hint">Pacotes são pontos de partida. Você pode remover itens, trocar escolhas e escrever exceções para o Mestre no campo livre.</p>
        <div class="equipment-controls">
          <label>Categoria
            <select data-equipment-category>${categoryOptions.map(category => `<option value="${esc(category.id)}" ${category.id === selectedCategory ? "selected" : ""}>${esc(category.name)}</option>`).join("")}</select>
          </label>
          <label>Item
            <select data-equipment-item>${itemOptions.map(item => `<option value="${esc(item.item_id)}">${esc(itemOptionText(item))}</option>`).join("")}</select>
          </label>
          <label>Qtd.<input type="number" min="1" max="20" value="1" data-equipment-add-qty></label>
          <button class="button" type="button" data-equipment-add>Adicionar</button>
        </div>
        ${renderRows(calc)}
        <div class="equipment-summary ${calc.totalCost > calc.budget ? "is-error" : calc.remaining === 0 ? "is-limit" : ""}">
          <div><span>Orçamento</span><strong>${money(calc.budget)}</strong></div>
          <div><span>Gasto</span><strong>${money(calc.totalCost)}</strong></div>
          <div><span>Restante</span><strong>${money(calc.remaining)}</strong></div>
          <div><span>Peso</span><strong>${weight(calc.totalWeight)}</strong></div>
        </div>
        <div class="equipment-effects">
          <div><span>Parry por escudo</span><strong>+${calc.shieldParryBonus}</strong></div>
          <div><span>Armor constante</span><strong>+${calc.armorBonus}</strong></div>
          <div><span>Unarmored Hero</span><strong>${esc(calc.unarmoredHero)}</strong></div>
        </div>
        ${renderWarnings(calc)}
      </div>`;
  }

  function bindBuilder() {
    document.addEventListener("change", event => {
      if (event.target.matches("[data-equipment-category]")) render();
      if (event.target.matches("[data-equipment-qty]")) changeQty(event.target.dataset.equipmentQty, event.target.value);
    });
    document.addEventListener("click", event => {
      const apply = event.target.closest("[data-equipment-apply-package]");
      if (apply) {
        const id = document.querySelector("[data-equipment-package]")?.value;
        if (id && (state.items.length === 0 || window.confirm("Aplicar este pacote vai substituir os equipamentos estruturados atuais. Continuar?"))) applyPackage(id);
        return;
      }
      const add = event.target.closest("[data-equipment-add]");
      if (add) {
        const id = document.querySelector("[data-equipment-item]")?.value;
        const qty = document.querySelector("[data-equipment-add-qty]")?.value || 1;
        addItem(id, qty);
        return;
      }
      const remove = event.target.closest("[data-equipment-remove]");
      if (remove) removeItem(remove.dataset.equipmentRemove);
    });
  }

  function installStepCss() {
    if (document.getElementById("heroe-forge-steps-style")) return;
    const style = document.createElement("style");
    style.id = "heroe-forge-steps-style";
    style.textContent = `
      body[data-hf-step="creation"]{--hf-step-bg:var(--hf-creation-bg, url("assets/cover.png"));}
      body[data-hf-step="equipment"]{--hf-step-bg:var(--hf-equipment-bg, url("assets/cover.png"));}
      body[data-hf-step="links"]{--hf-step-bg:var(--hf-links-bg, url("assets/cover.png"));}
      body[data-hf-step]{background:linear-gradient(180deg,rgba(20,17,13,.72),rgba(20,17,13,1) 440px),var(--hf-step-bg) center top / 100% auto no-repeat,var(--coal);}
      .step-nav{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border:1px solid var(--line);background:rgba(20,17,13,.78);padding:10px;}
      .step-nav .button{min-height:42px;}
      .step-nav .is-active{background:var(--gold);color:#331b06;border-color:#fff;}
      body[data-hf-step="creation"] section[data-step]:not([data-step="creation"]),
      body[data-hf-step="equipment"] section[data-step]:not([data-step="equipment"]),
      body[data-hf-step="links"] section[data-step]:not([data-step="links"]){display:none;}
      .equipment-panel{display:grid;gap:14px;}
      .equipment-apply{align-self:end;min-height:44px;}
      .equipment-controls{display:grid;grid-template-columns:minmax(130px,.8fr) minmax(220px,1.6fr) 92px auto;gap:10px;align-items:end;}
      .equipment-list{display:grid;gap:8px;}
      .equipment-row{display:grid;grid-template-columns:minmax(0,1.5fr) 78px 105px 90px auto;gap:8px;align-items:end;border:1px solid rgba(243,237,226,.14);background:rgba(255,255,255,.03);padding:10px;}
      .equipment-row span,.equipment-summary span,.equipment-effects span{display:block;color:var(--muted);font-size:.76rem;line-height:1.3;}
      .equipment-row label{margin:0;}
      .button.small{min-height:36px;padding:7px 10px;font-size:.82rem;}
      .equipment-summary,.equipment-effects{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;border:1px solid rgba(201,154,74,.36);background:rgba(31,27,22,.85);padding:10px;}
      .equipment-effects{grid-template-columns:repeat(3,minmax(0,1fr));border-color:rgba(243,237,226,.15);}
      .equipment-summary.is-limit{border-color:#cc993c;box-shadow:0 0 0 1px rgba(204,153,60,.25)}
      .equipment-summary.is-error{border-color:#aa332e;box-shadow:0 0 0 1px rgba(170,51,46,.35)}
      .equipment-warnings{margin:0;padding-left:18px;color:var(--muted);font-size:.86rem;}
      .equipment-warnings .error{color:#ffb7a8;}
      @media(max-width:860px){.equipment-controls,.equipment-row,.equipment-summary,.equipment-effects{grid-template-columns:1fr}.equipment-row{align-items:stretch}}
    `;
    document.head.appendChild(style);
  }

  function installStepNav() {
    const ids = {
      "dados-base": "creation",
      atributos: "creation",
      "background-cultural": "creation",
      desvantagens: "creation",
      vantagens: "creation",
      pericias: "creation",
      avancos: "creation",
      equipamentos: "equipment",
      vinculos: "links",
      "comentarios-mestre": "links",
      saida: "links",
    };
    Object.entries(ids).forEach(([id, step]) => document.getElementById(id)?.closest("section")?.setAttribute("data-step", step));
    if (!document.getElementById("heroe-forge-step-nav")) {
      document.querySelector("header")?.insertAdjacentHTML("beforeend", `
        <nav class="step-nav" id="heroe-forge-step-nav" aria-label="Etapas do Heroe Forge">
          <button class="button" type="button" data-step-goto="creation">1. Criação</button>
          <button class="button" type="button" data-step-goto="equipment">2. Equipamentos</button>
          <button class="button" type="button" data-step-goto="links">3. Vínculos e Envio</button>
          <button class="button" type="button" data-step-prev>Voltar</button>
          <button class="button primary" type="button" data-step-next>Avançar</button>
        </nav>`);
    }
    document.addEventListener("click", event => {
      const goto = event.target.closest("[data-step-goto]");
      if (goto) applyStep(goto.dataset.stepGoto);
      if (event.target.closest("[data-step-next]")) applyStep(nextStep(1));
      if (event.target.closest("[data-step-prev]")) applyStep(nextStep(-1));
    });
  }

  function nextStep(delta) {
    const steps = ["creation", "equipment", "links"];
    const index = Math.max(0, steps.indexOf(state.step));
    return steps[Math.max(0, Math.min(steps.length - 1, index + delta))];
  }

  function applyStep(step) {
    const valid = ["creation", "equipment", "links"].includes(step) ? step : "creation";
    state.step = valid;
    document.body.dataset.hfStep = valid;
    document.querySelectorAll("[data-step-goto]").forEach(button => button.classList.toggle("is-active", button.dataset.stepGoto === valid));
    syncHidden();
    try { localStorage.setItem(STEP_KEY, valid); } catch {}
  }

  function prepareHtml() {
    const section = document.getElementById("equipamentos")?.closest("section");
    if (section && !document.getElementById("equipment-builder")) {
      const firstLabel = section.querySelector("label");
      firstLabel?.insertAdjacentHTML("beforebegin", `<div id="equipment-builder"></div>`);
    }
    const wish = form.elements.equipmentWishlist;
    if (wish?.closest("label")) {
      const label = wish.closest("label");
      label.childNodes[0].textContent = "Pedidos, exceções e itens narrativos para o Mestre ";
      wish.placeholder = "Ex.: gostaria de negociar um mapa raro, justificar um veneno como heranca, propor divida com mercador, ou pedir exceção de acesso por história pessoal.";
    }
    const armor = form.elements.armorBonus;
    if (armor?.closest("label")) {
      armor.value = "0";
      armor.closest("label").classList.add("is-hidden");
    }
  }

  function clear() {
    state = { packageId: "", items: [], step: state.step || "creation" };
    syncHidden();
    render();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    ensureHidden("equipmentPackageId");
    ensureHidden("equipmentSelectedJson");
    ensureHidden("equipmentStep");
    installStepCss();
    installStepNav();
    prepareHtml();
    bindBuilder();
    form.addEventListener("input", event => { if (!event.target.closest("#equipment-builder")) setTimeout(render, 0); });
    form.addEventListener("change", event => { if (!event.target.closest("#equipment-builder")) setTimeout(render, 0); });
    restoreFromForm();
    document.getElementById("load-draft")?.addEventListener("click", () => setTimeout(restoreFromForm, 25));
    document.getElementById("clear-form")?.addEventListener("click", () => setTimeout(clear, 25));
  }

  window.HeroeForgeEquipment = {
    init,
    collect,
    render,
    restoreFromForm,
    applyPackage,
    applyRandomPackage,
    clear,
  };

  init();
})();
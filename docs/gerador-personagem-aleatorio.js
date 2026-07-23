(() => {
  "use strict";

  const form = document.getElementById("pc-form");
  const button = document.getElementById("generate-random");
  const catalog = window.CONAN_RANDOM_DATA;
  const validation = window.HeroeForgeValidation;
  if (!form || !button || !catalog || !validation) return;

  function seedValue() {
    const random = new Uint32Array(1);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random);
    else random[0] = Date.now() >>> 0;
    return `${Date.now().toString(36)}-${random[0].toString(36)}`;
  }

  function seededRandom(seed) {
    let state = 2166136261;
    for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
    return () => {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(items, random) {
    return items[Math.floor(random() * items.length)];
  }

  function set(name, value) {
    const field = form.elements[name];
    if (field) field.value = value;
  }

  function valueOf(name) {
    return String(form.elements[name]?.value || "").trim();
  }

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

  function labelForSkill(key) {
    return SKILLS.find(([skillKey]) => skillKey === key)?.[1] || "";
  }

  function hasCharacterChoices() {
    const names = ["pitch", "history", "culturalBackground", "equipmentWishlist", "gmComments"];
    return names.some(name => valueOf(name));
  }

  function validateRequiredIdentity() {
    const playerName = valueOf("playerName");
    const playerEmail = valueOf("playerEmail");
    if (!playerName || !playerEmail) {
      window.alert("O preenchimento de Jogador e E-mail do jogador e obrigatorio para gerar personagens aleatórios.");
      validation.status("Preencha Jogador e E-mail do jogador antes de gerar personagem aleatório.");
      if (!playerName) form.elements.playerName?.focus();
      else form.elements.playerEmail?.focus();
      return false;
    }
    if (form.elements.playerEmail && !form.elements.playerEmail.checkValidity()) {
      window.alert("Informe um e-mail válido do jogador antes de gerar personagem aleatório.");
      validation.status("Informe um e-mail válido do jogador antes de gerar personagem aleatório.");
      form.elements.playerEmail.focus();
      return false;
    }
    return true;
  }

  function confirmOptionalIdentity() {
    const missing = [];
    if (!valueOf("pcName")) missing.push("nome do PC");
    if (!valueOf("origin")) missing.push("origem ou cultura");
    if (!valueOf("concept")) missing.push("conceito de mesa");
    if (!missing.length) return true;
    return !window.confirm(
      "Você gostaria de escolher nome do PC, origem ou cultura, ou conceito de mesa antes de gerar o personagem aleatório?\n\n" +
      "Com origem/cultura e conceito de mesa escolhidos, o sorteio consegue orientar melhor Background, nome, história, vínculos e pacote provisório.\n\n" +
      "OK: voltar ao formulário para preencher.\nCancelar: gerar mesmo assim."
    );
  }

  function resetCharacterFields() {
    form.reset();
    for (const [key] of ATTRIBUTES) set(`attr_${key}`, "d4");
    for (const [key, , , core] of SKILLS) set(`skill_${key}`, core ? "d4" : "-");
    for (let index = 1; index <= 4; index += 1) {
      set(`hindrance_${index}`, "");
      set(`hindranceType_${index}`, "0");
      set(`edge_${index}`, "");
      set(`edgeSource_${index}`, "");
      set(`edgeApproval_${index}`, "Pendente");
    }
    set("spendEdge", "0");
    set("spendAttribute", "0");
    set("spendSkill", "0");
    set("spendFunds", "0");
  }

  function replaceTokens(template, values) {
    return template.replace(/\{(name|origin|role|contact|threat|loss)\}/g, (_, key) => values[key]);
  }

  function applyBenefit(benefit) {
    if (!benefit) return;
    if (benefit.attribute) {
      set(`attr_${benefit.attribute}`, benefit.die);
      return;
    }
    if (benefit.skill) set(`skill_${benefit.skill}`, benefit.die);
  }

  function chooseBackground(random, preferredOrigin) {
    if (preferredOrigin && catalog.backgrounds[preferredOrigin]) return preferredOrigin;
    return pick(Object.keys(catalog.backgrounds), random);
  }

  function chooseHindrances(background, random) {
    const blocked = new Set((background.automaticHindrances || []).flatMap(item => item.blockedIds || [item.id]));
    const choices = catalog.hindrances.filter(item => item.randomEligible && !blocked.has(item.id));
    const first = pick(choices, random);
    const second = pick(choices.filter(item => item.id !== first.id), random);
    set("hindrance_1", first.label);
    set("hindranceType_1", "2");
    set("hindrance_2", second.label);
    set("hindranceType_2", "2");
  }

  function chooseEdges() {
    const choices = catalog.edges.filter(item => item.randomEligible);
    const first = choices[0];
    const second = choices[1];
    set("edge_1", first.label);
    set("edgeSource_1", "Humano");
    set("edgeApproval_1", "Pendente");
    set("edge_2", second.label);
    set("edgeSource_2", "Desvantagem");
    set("edgeApproval_2", "Pendente");
  }

  function chooseSkillsAndAdvances() {
    for (const [key] of ATTRIBUTES) set(`attr_${key}`, "d6");
    const advanceSkills = ["fighting", "shooting", "riding", "survival"];
    const ordinarySkills = ["battle", "thievery"];
    for (const [key, , , core] of SKILLS) if (core) set(`skill_${key}`, "d6");
    for (const key of advanceSkills) set(`skill_${key}`, "d6");
    set(`skill_${ordinarySkills[0]}`, "d6");
    set(`skill_${ordinarySkills[1]}`, "d4");
    set("advanceType_1", "twoSkills");
    set("advanceType_2", "twoSkills");
    validation.update();
    set("advancePrimary_1", labelForSkill(advanceSkills[0]));
    set("advanceSecondary_1", labelForSkill(advanceSkills[1]));
    set("advancePrimary_2", labelForSkill(advanceSkills[2]));
    set("advanceSecondary_2", labelForSkill(advanceSkills[3]));
  }

  function nextDie(current, core) {
    const order = core ? ["d4", "d6", "d8", "d10", "d12"] : ["-", "d4", "d6", "d8", "d10", "d12"];
    const index = Math.max(0, order.indexOf(current || (core ? "d4" : "-")));
    return order[Math.min(order.length - 1, index + 1)];
  }

  function spendRemainingSkillBudget(random) {
    const candidates = ["academics", "boating", "healing", "intimidation", "performance", "taunt", "battle", "thievery"];
    let calc = validation.collect();
    let guard = 0;
    while (calc.skillSpent < calc.skillBudget && guard < 40) {
      guard += 1;
      const remaining = calc.skillBudget - calc.skillSpent;
      const shuffled = [...candidates].sort(() => random() - 0.5);
      let changed = false;
      for (const key of shuffled) {
        const skill = SKILLS.find(([skillKey]) => skillKey === key);
        if (!skill) continue;
        const [, , , core] = skill;
        const field = form.elements[`skill_${key}`];
        if (!field) continue;
        const previousValue = field.value || (core ? "d4" : "-");
        if (previousValue === "d6") continue;
        const upgradedValue = nextDie(previousValue, core);
        if (upgradedValue === previousValue) continue;
        field.value = upgradedValue;
        const nextCalc = validation.collect();
        const delta = nextCalc.skillSpent - calc.skillSpent;
        const hasNewErrors = nextCalc.errors.length > calc.errors.length;
        if (delta > 0 && delta <= remaining && !hasNewErrors) {
          calc = nextCalc;
          changed = true;
          break;
        }
        field.value = previousValue;
        validation.collect();
      }
      if (!changed) break;
    }
    validation.update();
  }

  function generate() {
    if (!validateRequiredIdentity()) return;
    if (!confirmOptionalIdentity()) return;
    if (hasCharacterChoices() && !window.confirm("Substituir as escolhas narrativas atuais por uma ficha aleatória? Jogador, e-mail, nome do PC, origem/cultura e conceito de mesa serao preservados quando preenchidos.")) return;

    const playerName = valueOf("playerName");
    const playerEmail = valueOf("playerEmail");
    const preferredPcName = valueOf("pcName");
    const preferredOrigin = valueOf("origin");
    const preferredConcept = valueOf("concept");
    const seed = seedValue();
    const random = seededRandom(seed);
    const backgroundName = chooseBackground(random, preferredOrigin);
    const background = catalog.backgrounds[backgroundName];
    const benefit = pick(background.benefits.filter(item => item.randomEligible !== false), random);
    const archetype = preferredConcept || pick(background.archetypes, random);
    const name = preferredPcName || pick(catalog.names[backgroundName], random);
    const contact = pick(catalog.contacts, random);
    const threat = pick(catalog.threats, random);
    const loss = pick(catalog.losses, random);
    const legacyPackageChoice = catalog.equipmentPackages?.length ? pick(catalog.equipmentPackages, random) : null;
    const values = { name, origin: preferredOrigin || backgroundName, role: archetype.toLowerCase(), contact, threat, loss };

    resetCharacterFields();
    set("playerName", playerName);
    set("playerEmail", playerEmail);
    set("pcName", name);
    set("origin", preferredOrigin || backgroundName);
    set("concept", archetype);
    set("pitch", replaceTokens(pick(catalog.pitches, random), values));
    set("history", replaceTokens(pick(catalog.histories, random), values));
    set("culturalBackground", backgroundName);
    validation.update();
    set("culturalBenefit", benefit.id);
    chooseSkillsAndAdvances();
    applyBenefit(benefit);
    if (benefit.attribute) set(`attr_${benefit.attribute}`, "d8");
    chooseHindrances(background, random);
    set("spendEdge", "2");
    set("spendSkill", "2");
    chooseEdges();
    spendRemainingSkillBudget(random);
    const packageChoice = window.HeroeForgeEquipment?.applyRandomPackage ? window.HeroeForgeEquipment.applyRandomPackage(random) : legacyPackageChoice;
    if (packageChoice?.package_id) set("equipmentWishlist", "Pacote estruturado escolhido automáticamente. Ajustes, trocas e exceções continuam sujeitos a aprovação do Mestre.");
    else if (packageChoice) set("equipmentWishlist", `Pacote provisório sugerido: ${packageChoice.name} (${packageChoice.value}/650). Conteudo: ${packageChoice.text}. Restante sujeito a escolha e aprovação do Mestre.`);
    set("culturalBackgroundNotes", `Ficha gerada automáticamente. Rever o benefício ${benefit.label} e as limitações do Background com o Mestre.`);
    for (let index = 0; index < catalog.bondTemplates.length; index += 1) set(`bond_${index + 1}`, replaceTokens(catalog.bondTemplates[index], values));
    ensureHidden("randomSeed").value = seed;
    ensureHidden("randomEquipmentPackage").value = packageChoice?.package_id ? `${packageChoice.name} (${packageChoice.package_id}; estruturado)` : (packageChoice ? `${packageChoice.name} (${packageChoice.value}/650; provisório)` : "-");
    validation.update();
    const calc = validation.collect();
    if (calc.errors.length) {
      validation.status(`A ficha aleatória precisa de revisão interna: ${calc.errors[0]}`);
      return;
    }
    validation.status(`Ficha aleatória gerada: ${name}. Revise os detalhes narrativos antes de enviar ao Mestre.`);
  }

  button.addEventListener("click", generate);
})();
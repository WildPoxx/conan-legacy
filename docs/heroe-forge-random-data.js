window.CONAN_RANDOM_DATA = {
  version: "1.0.0",
  hindrances: [
    { id: "cautious", label: "Cautious", grades: [1, 2], randomEligible: true },
    { id: "code-of-honor", label: "Code of Honor", grades: [1, 2], randomEligible: true },
    { id: "curious", label: "Curious", grades: [1, 2], randomEligible: true },
    { id: "enemy", label: "Enemy", grades: [1, 2], randomEligible: true },
    { id: "greedy", label: "Greedy", grades: [1, 2], randomEligible: true },
    { id: "loyal", label: "Loyal", grades: [1, 2], randomEligible: true },
    { id: "obligation", label: "Obligation", grades: [1, 2], randomEligible: true },
    { id: "outsider", label: "Outsider", grades: [1, 2], randomEligible: true },
    { id: "overconfident", label: "Overconfident", grades: [1, 2], randomEligible: true },
    { id: "poverty", label: "Poverty", grades: [1, 2], randomEligible: true },
    { id: "secret", label: "Secret", grades: [1, 2], randomEligible: true },
    { id: "suspicious", label: "Suspicious", grades: [1, 2], randomEligible: true },
    { id: "sangue-chamado", label: "Sangue Chamado", grades: [1], randomEligible: false },
    { id: "vengeful", label: "Vengeful", grades: [1, 2], randomEligible: true },
    { id: "vow", label: "Vow", grades: [1, 2], randomEligible: true },
    { id: "wanted", label: "Wanted", grades: [1, 2], randomEligible: true }
  ],
  edges: [
    { id: "connections", label: "Connections", randomEligible: true },
    { id: "luck", label: "Luck", randomEligible: true },
    { id: "alertness", label: "Alertness", randomEligible: false },
    { id: "brave", label: "Brave", randomEligible: false },
    { id: "fleet-footed", label: "Fleet-Footed", randomEligible: false },
    { id: "scholar", label: "Scholar", randomEligible: false },
    { id: "woodsman", label: "Woodsman", randomEligible: false }
  ],
  backgrounds: {
    Aquilonio: {
      benefits: [
        { id: "persuasion", label: "Persuasion d6", skill: "persuasion", die: "d6" },
        { id: "battle", label: "Battle d4", skill: "battle", die: "d4" }
      ],
      automaticHindrances: [{ id: "obligation", label: "Obligation (Minor) com casa, patrono, legiao, templo ou autoridade." }],
      archetypes: ["Nobre caido ou bastardo", "Agente de faccao", "Mercenario"]
    },
    Bossoniano: {
      benefits: [
        { id: "shooting", label: "Shooting d6", skill: "shooting", die: "d6" },
        { id: "notice", label: "Notice d6", skill: "notice", die: "d6" }
      ],
      automaticHindrances: [],
      archetypes: ["Combatente de fronteira", "Batedor ou cacador"]
    },
    Cimerio: {
      benefits: [
        { id: "strength", label: "Strength d6", attribute: "strength", die: "d6" },
        { id: "vigor", label: "Vigor d6", attribute: "vigor", die: "d6" }
      ],
      automaticHindrances: [{ id: "outsider", label: "Outsider (Minor) automaticamente." }],
      archetypes: ["Combatente de fronteira", "Batedor ou cacador", "Mercenario"]
    },
    Hyrkanio: {
      benefits: [{ id: "riding", label: "Riding d6", skill: "riding", die: "d6" }],
      automaticHindrances: [],
      archetypes: ["Combatente de fronteira", "Mercenario", "Batedor ou cacador"]
    },
    Kothiano: {
      benefits: [{ id: "contract", label: "Contrato ou soldo: +1 em Fighting, Shooting ou Battle uma vez por sessao." }],
      automaticHindrances: [],
      archetypes: ["Mercenario", "Agente de faccao", "Combatente de fronteira"]
    },
    Kushita: {
      benefits: [{ id: "survival", label: "Survival d6", skill: "survival", die: "d6" }],
      automaticHindrances: [],
      archetypes: ["Batedor ou cacador", "Combatente de fronteira", "Curandeiro ou alquimista"]
    },
    Nemedio: {
      benefits: [
        { id: "academics", label: "Academics d6", skill: "academics", die: "d6" },
        { id: "common-knowledge", label: "Common Knowledge d6", skill: "commonKnowledge", die: "d6" }
      ],
      automaticHindrances: [{ id: "curious", blockedIds: ["curious", "cautious"], label: "Curious (Minor) ou Cautious (Minor), conforme a historia." }],
      archetypes: ["Estudioso ocultista", "Agente de faccao", "Nobre caido ou bastardo"]
    },
    Ophireano: {
      benefits: [
        { id: "persuasion", label: "Persuasion d6", skill: "persuasion", die: "d6" },
        { id: "thievery", label: "Thievery d6", skill: "thievery", die: "d6" }
      ],
      automaticHindrances: [],
      fundsNote: "Metade do dinheiro inicial fica presa em roupas, joias, dividas ou favores.",
      archetypes: ["Nobre caido ou bastardo", "Ladrao ou espiao", "Agente de faccao"]
    },
    Picto: {
      benefits: [
        { id: "stealth", label: "Stealth d6", skill: "stealth", die: "d6" },
        { id: "survival", label: "Survival d6", skill: "survival", die: "d6" }
      ],
      automaticHindrances: [{ id: "outsider", label: "Outsider (Minor) em cidades civilizadas e cortes estrangeiras." }],
      archetypes: ["Batedor ou cacador", "Combatente de fronteira"]
    },
    Shemita: {
      benefits: [
        { id: "persuasion", label: "Persuasion d6", skill: "persuasion", die: "d6" },
        { id: "shooting", label: "Shooting d6", skill: "shooting", die: "d6" }
      ],
      automaticHindrances: [{ id: "obligation", label: "Obligation (Minor) com cla, caravana, templo, credor ou familia extensa." }],
      archetypes: ["Agente de faccao", "Batedor ou cacador", "Mercenario"]
    },
    Stigio: {
      benefits: [{ id: "occult", label: "Occult d6", skill: "occult", die: "d6" }, { id: "magic", label: "Arcane Background (Magic)", edge: "Arcane Background (Magic)", randomEligible: false }, { id: "channeling", label: "Arcane Background (Channeling)", edge: "Arcane Background (Channeling)", randomEligible: false }],
      automaticHindrances: [{ id: "sangue-chamado", label: "Sangue Chamado (Minor)." }],
      archetypes: ["Estudioso ocultista", "Sacerdote ambiguo", "Agente de faccao"]
    },
    Zamorano: {
      benefits: [
        { id: "thievery", label: "Thievery d6", skill: "thievery", die: "d6" },
        { id: "stealth", label: "Stealth d6", skill: "stealth", die: "d6" }
      ],
      automaticHindrances: [{ id: "wanted", label: "Wanted (Minor) em uma cidade, guilda, culto ou rede criminosa." }],
      archetypes: ["Ladrao ou espiao", "Agente de faccao"]
    },
    Zingario: {
      benefits: [
        { id: "boating", label: "Boating d6", skill: "boating", die: "d6" },
        { id: "fighting", label: "Fighting d6", skill: "fighting", die: "d6" }
      ],
      automaticHindrances: [{ id: "code-of-honor", blockedIds: ["code-of-honor", "overconfident"], label: "Code of Honor (Minor) ou Overconfident (Minor), conforme a historia." }],
      archetypes: ["Mercenario", "Ladrao ou espiao", "Combatente de fronteira"]
    }
  },
  names: {
    Aquilonio: ["Aurelia", "Cassian", "Livia", "Marcellus", "Sabina"],
    Bossoniano: ["Alric", "Branna", "Corin", "Elowen", "Taran"],
    Cimerio: ["Bran", "Cairn", "Eira", "Morna", "Rurik"],
    Hyrkanio: ["Ariun", "Batu", "Kesh", "Saran", "Togai"],
    Kothiano: ["Damar", "Iria", "Kassos", "Nira", "Varek"],
    Kushita: ["Adisa", "Jabari", "Kesi", "Nala", "Temba"],
    Nemedio: ["Celia", "Dorian", "Lucan", "Mira", "Severin"],
    Ophireano: ["Cassia", "Dario", "Ilaria", "Orso", "Valeria"],
    Picto: ["Asha", "Crow", "Hawk", "Mira", "Red Elk"],
    Shemita: ["Amar", "Dalia", "Jamal", "Nuri", "Samira"],
    Stigio: ["Ankhef", "Iset", "Menka", "Nefru", "Sutek"],
    Zamorano: ["Belar", "Cira", "Davo", "Mireya", "Zara"],
    Zingario: ["Arana", "Belen", "Ciro", "Ines", "Rafaelo"]
  },
  histories: [
    "{name} deixou {origin} depois que uma promessa feita a {contact} cobrou um preco alto demais. Agora procura uma saida em Karavazyan antes que {threat} encontre seu rastro.",
    "Criado entre {origin} e contratos de pouca honra, {name} perdeu {loss} numa disputa com {threat}. A Torre parece uma ma ideia, mas tambem a unica chance de mudar o proprio destino.",
    "Quando {contact} desapareceu seguindo rumores sobre Khar-Volun, {name} herdou uma divida, um segredo e a certeza de que {threat} prefere a historia enterrada."
  ],
  pitches: [
    "Um {role} de {origin} que chegou a Karavazyan com uma divida, um rumor e pouca paciencia.",
    "Um {role} que vende competencia, mas ainda responde por uma promessa feita longe demais.",
    "Um sobrevivente de {origin} disposto a entrar na Torre para recuperar o que perdeu."
  ],
  contacts: ["uma capitao da fronteira", "uma mercadora de especiarias", "um escriba nemedio", "uma guia picta", "uma sacerdotisa sem templo"],
  threats: ["um credor paciente", "uma guilda ofendida", "um oficial que sabe demais", "um rival de sangue", "um culto que prefere silencio"],
  losses: ["uma companhia inteira", "um mapa de familia", "o proprio nome", "um juramento antigo", "uma heranca perigosa"],
  equipmentPackages: [
    { name: "Guarda de fronteira", value: 214, text: "espada curta comum hiboriana, escudo pequeno, gambesao, kit de viagem e racoes para 7 dias" },
    { name: "Cacador do ermo", value: 285, text: "arco curto, 40 flechas, faca, couro endurecido, kit de viagem e tenda pequena" },
    { name: "Ladrao urbano", value: 300, text: "espada curta comum hiboriana, faca, roupas boas, ferramentas de ladrao e kit de disfarce" },
    { name: "Mercenario montado", value: 590, text: "espada longa, escudo pequeno, couro endurecido, cavalo, sela e arreios" },
    { name: "Erudito itinerante", value: 210, text: "faca, roupas boas, kit de escrita, kit de viagem, kit de cura e reagentes de ritual" }
  ],
  bondTemplates: [
    "{contact} pode reconhecer meu nome e sabe por que eu nao devia ter voltado.",
    "A faccao que pode me contratar quer acesso a um contato que mantive em {origin}.",
    "{threat} espalhou uma versao conveniente da minha historia e tem motivo para me vigiar.",
    "Ouvi que Khar-Volun responde a quem chega com uma divida antiga ou um nome perdido.",
    "Eu perderia a unica chance de proteger {loss} se a Aquilonia entrasse em guerra civil.",
    "Minha pior experiencia com autoridade foi servir a quem chamava extorsao de imposto e medo de ordem.",
    "Nao abandono gente que ja foi usada como moeda por uma faccao ou por um senhor de guerra.",
    "Entraria na Torre se a oferta trouxesse {loss}, liberdade para {contact} ou um caminho contra {threat}.",
    "Sonhei com uma porta de pedra, meu nome escrito ao contrario e {contact} pedindo que eu nao a abrisse.",
    "Na Quinta Roda devo evitar alguem ligado a {threat}; ele reconhece detalhes que eu preferia apagar."
  ]
};
"use strict";
/* ──────────────────────────────────────────────────────────────────────────
   CARTAO DE RESULTADO — motor compartilhado
   Usado pela bandeja generica (rolador.html) e pelas fichas de personagem.

   A ORDEM e' a do chat do Foundry, e ela nao muda:
     1 QUEM        nome (e retrato, quando ha' personagem) + hora
     2 O QUE       a coisa rolada
     3 COMO        pericia, atributo, ataque, dano
     4 POR QUE     cada modificador com a ORIGEM escrita
     5 DADOS       um chip por dado; traco e Selvagem em cores distintas;
                   As marcado em expoente; o VENCEDOR destacado
     6 TOTAL       barra propria, corpo grande

   O vencedor sai da comparacao dos TOTAIS de cada dado, com o As ja' somado.
   Um d8 que faz 8 e depois 1 soma 9; um d6 que faz 6 e depois 5 soma 11 — o
   Selvagem venceu, mesmo o primeiro lancamento sendo menor.

   Nenhum botao entra no cartao: ele vira print.
   ────────────────────────────────────────────────────────────────────────── */

const CR = {
  novo(tag, cls, txt){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  },

  agora(){
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
  },

  sinal(n){ return n >= 0 ? "+" + n : "" + n; },

  /* r = {
       quem, retrato, oque, como, mods:[{rotulo,valor}], dados:[{tipo,lados,seq,total,venceu,perdeu}],
       modTotal, total, veredito, classe, alvo, n, selo
     } */
  montar(r){
    const art = this.novo("article", "cartao-res");

    /* 1. QUEM */
    const quem = this.novo("header", "quem");
    if (r.retrato){
      const img = this.novo("img");
      img.src = r.retrato; img.alt = "";
      quem.appendChild(img);
    }
    quem.appendChild(this.novo("span", "nome", r.quem || "Rolagem"));
    const t = this.novo("time", null, r.quando || this.agora());
    quem.appendChild(t);
    art.appendChild(quem);

    /* 2, 3, 4 */
    const miolo = this.novo("div", "miolo");
    miolo.appendChild(this.novo("p", "oque", r.oque));
    if (r.como) miolo.appendChild(this.novo("p", "como", r.como));
    if (r.mods && r.mods.length){
      const ul = this.novo("ul", "mods");
      r.mods.forEach((m) => {
        const li = this.novo("li");
        li.appendChild(document.createTextNode(m.rotulo + ": "));
        li.appendChild(this.novo("b", null, typeof m.valor === "number" ? this.sinal(m.valor) : m.valor));
        ul.appendChild(li);
      });
      miolo.appendChild(ul);
    }
    art.appendChild(miolo);

    /* 5. DADOS */
    const cxd = this.novo("div", "dados");
    r.dados.forEach((d) => {
      const chip = this.novo("span",
        "chip" + (d.tipo === "wild" ? " wild" : d.tipo === "aumento" ? " bonus" : "") +
        (d.venceu ? " venceu" : "") + (d.perdeu ? " perdeu" : ""));
      chip.appendChild(document.createTextNode(String(d.total)));
      if (d.seq.length > 1){
        const sup = this.novo("sup", null, "°");
        chip.appendChild(sup);
      }
      chip.appendChild(this.novo("small", null, "d" + d.lados + (d.seq.length > 1 ? " " + d.seq.join("+") : "")));
      chip.appendChild(this.novo("span", "qual", d.tipo === "wild" ? "selvagem" : (d.rotulo || "traço")));
      cxd.appendChild(chip);
    });
    if (r.modTotal){
      cxd.appendChild(this.novo("span", "sinal", (r.modTotal > 0 ? "+ " : "− ") + Math.abs(r.modTotal)));
    }
    art.appendChild(cxd);

    /* 6. TOTAL */
    const barra = this.novo("div", "barra " + (r.classe || ""));
    barra.appendChild(this.novo("div", "num", String(r.total)));
    barra.appendChild(this.novo("div", "vd", r.veredito));
    const pe = [];
    if (r.alvo) pe.push("alvo 4 · aumento 8");
    pe.push(`#${r.n} · ${r.selo}`);
    barra.appendChild(this.novo("p", "rodape", pe.join("   ·   ")));
    art.appendChild(barra);

    return art;
  },

  /* ── modo "só o resultado": o cartao sozinho na tela, pronto para o print ── */
  palco(){
    let p = document.querySelector(".palco");
    if (!p){
      p = this.novo("div", "palco");
      p.appendChild(this.novo("div", "dentro"));
      document.body.appendChild(p);
    }
    return p;
  },

  isolar(dadosDoCartao){
    const p = this.palco();
    const dentro = p.querySelector(".dentro");
    dentro.innerHTML = "";
    dentro.appendChild(this.montar(dadosDoCartao));
    const sair = this.novo("button", "sair", "← voltar");
    sair.type = "button";
    sair.addEventListener("click", () => { document.body.classList.remove("foco"); });
    dentro.appendChild(sair);
    document.body.classList.add("foco");
    window.scrollTo(0, 0);
  },

  /* texto para o WhatsApp de quem prefere colar em vez de mandar print */
  texto(r){
    const linhas = [];
    linhas.push(`🎲 ${r.quem || "Rolagem"} · ${r.oque}`);
    if (r.como) linhas.push(r.como);
    const dados = r.dados.map((d) => `d${d.lados}=${d.total}${d.seq.length > 1 ? "°" : ""}${d.venceu && r.dados.length > 1 ? " ←" : ""}`).join("  ");
    linhas.push(dados + (r.modTotal ? `   mod ${this.sinal(r.modTotal)}` : ""));
    if (r.mods && r.mods.length) linhas.push("(" + r.mods.map((m) => `${m.rotulo} ${typeof m.valor === "number" ? this.sinal(m.valor) : m.valor}`).join(" · ") + ")");
    linhas.push(`${r.alvo ? "TOTAL" : "DANO"} ${r.total} — ${r.veredito}`);
    linhas.push(`${r.quando || this.agora()} · #${r.n} · ${r.selo}`);
    return linhas.join("\n");
  }
};

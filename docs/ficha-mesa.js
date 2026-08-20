"use strict";
/* ──────────────────────────────────────────────────────────────────────────
   FICHA DE MESA — motor de rolagem
   Conan Legacy · SWADE

   A REGRA DO DADO (SWADE, pp. 90 e 95)
     Ases            todo dado explode enquanto sair o valor maximo
     Dado Selvagem   Wild Card rola tambem 1d6; vale o MAIOR TOTAL
     Modificador     entra DEPOIS de somar a explosao, nunca no dado
     Falha Critica   1 natural no dado de traco E no Dado Selvagem
     Alvo 4; aumento 8
     Ferimento e fadiga penalizam TRACO. Dano nao sofre essa penalidade.
     Dano soma os dados, explode, e nao usa Dado Selvagem.

   Esta pagina nao fala com o Foundry. Mexer no contador de ferimentos aqui
   nao muda nada no jogo — e' so' para a conta sair certa no celular.
   ────────────────────────────────────────────────────────────────────────── */

function rolarDado(lados){
  const primeiro = 1 + Math.floor(Math.random() * lados);
  let total = primeiro, ultimo = primeiro, seq = [primeiro], guarda = 0;
  while (ultimo === lados && guarda++ < 100){
    ultimo = 1 + Math.floor(Math.random() * lados);
    total += ultimo; seq.push(ultimo);
  }
  return { primeiro, total, seq };
}

const sinal = (n) => (n >= 0 ? "+" + n : "" + n);
const el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
};

/* ── estado da pagina ── */
const E = { fer: 0, fad: 0, benn: 0, sit: 0, contador: 0, cadeia: Math.random().toString(36).slice(2, 8), hist: [] };
let P = null;

function selar(txt){
  E.cadeia += "|" + txt;
  let h = 0x811c9dc5;
  for (let i = 0; i < E.cadeia.length; i++){ h ^= E.cadeia.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36).slice(-4).padStart(4, "0");
}

/* penalidade que o corpo carrega, sem o modificador de situacao */
const penalidadeCorpo = () => -Math.min(3, E.fer) - Math.min(2, E.fad);

/* ── rolagem de traco: dado + Dado Selvagem, maior total, modificador depois ── */
function rolarTraco(rotulo, lados, modFixo){
  const mod = (modFixo || 0) + penalidadeCorpo() + E.sit;
  const t = rolarDado(lados);
  const w = rolarDado(6);
  const critico = t.primeiro === 1 && w.primeiro === 1;
  const bruto = Math.max(t.total, w.total);
  const total = bruto + mod;

  let veredito, classe;
  if (critico){ veredito = "FALHA CRÍTICA"; classe = "crit"; }
  else if (total >= 8){ veredito = "SUCESSO COM AUMENTO"; classe = "ok"; }
  else if (total >= 4){ veredito = "SUCESSO"; classe = "ok"; }
  else { veredito = "FALHA"; classe = "bad"; }

  const detalhe =
    `d${lados}: [${t.seq.join(" + ")}] = ${t.total}\n` +
    `d6:  [${w.seq.join(" + ")}] = ${w.total}\n` +
    `maior = ${bruto}${mod ? `   mod ${sinal(mod)}` : ""}   →   ${total}` +
    (mod ? `\n(${modFixo ? `perícia ${sinal(modFixo)} · ` : ""}` +
           `ferimento ${sinal(-Math.min(3, E.fer))} · fadiga ${sinal(-Math.min(2, E.fad))} · situação ${sinal(E.sit)})` : "");

  return { rotulo, total, veredito, classe, detalhe, alvo: true, mod };
}

/* ── rolagem de dano: soma os dados, com Ases, sem Dado Selvagem ── */
function rolarDano(rotulo, formula){
  const expandida = String(formula).replace(/@str/gi, "d" + P.forca);
  const partes = expandida.match(/\d*d\d+|[+-]\s*\d+/gi) || [];
  let total = 0;
  const linhas = [];
  for (const bruta of partes){
    const p = bruta.replace(/\s+/g, "");
    const md = p.match(/^(\d*)d(\d+)$/i);
    if (md){
      const qtd = md[1] ? parseInt(md[1], 10) : 1;
      const lados = parseInt(md[2], 10);
      for (let i = 0; i < qtd; i++){
        const r = rolarDado(lados);
        total += r.total;
        linhas.push(`d${lados}: [${r.seq.join(" + ")}] = ${r.total}`);
      }
    } else {
      const n = parseInt(p, 10);
      if (!isNaN(n)){ total += n; linhas.push(`fixo ${sinal(n)}`); }
    }
  }
  return {
    rotulo, total,
    veredito: "DANO",
    classe: "dano",
    detalhe: `${expandida}\n${linhas.join("\n")}\n→ ${total}\n(dano não sofre penalidade de ferimento)`,
    alvo: false, mod: 0
  };
}

/* ── janela de resultado: aparece logo abaixo do bloco que foi tocado ── */
function mostrar(res, ondeColocar){
  E.contador++;
  const textoBase =
    `🎲 ${P.nome} · ${res.rotulo}\n` +
    `${res.alvo ? "TOTAL" : "DANO"} ${res.total}${res.alvo ? " — " + res.veredito : ""}`;
  const selo = selar(textoBase);
  const paraMandar = `${textoBase}\n#${E.contador} · ${selo}`;

  const cx = el("div", "saida");
  cx.appendChild(el("div", "oque", res.rotulo));
  cx.appendChild(el("div", "total", String(res.total)));
  cx.appendChild(el("div", "verdito " + res.classe, res.veredito));
  cx.appendChild(el("div", "detalhe", res.detalhe));
  if (res.alvo) cx.appendChild(el("div", "detalhe", "alvo 4 · aumento 8"));

  const linha = el("div", "botoes");
  if (navigator.share){
    const bs = el("button", "secund", "Enviar");
    bs.type = "button";
    bs.addEventListener("click", async () => { try { await navigator.share({ text: paraMandar }); } catch(e){} });
    linha.appendChild(bs);
  }
  const bc = el("button", "secund", "Copiar");
  bc.type = "button";
  bc.addEventListener("click", (ev) => copiar(paraMandar, ev.target, "Copiar"));
  linha.appendChild(bc);
  linha.appendChild(el("span", "selo", `#${E.contador} · ${selo}`));
  cx.appendChild(linha);

  const antiga = ondeColocar.querySelector(".saida");
  if (antiga) antiga.remove();
  document.querySelectorAll(".saida").forEach((s) => s.remove());
  ondeColocar.appendChild(cx);
  cx.scrollIntoView({ behavior: "smooth", block: "center" });

  E.hist.push(`#${E.contador} ${selo}  ${res.rotulo}  =${res.total}  ${res.veredito}`);
  const h = document.getElementById("hist");
  if (h) h.textContent = E.hist.join("\n");
}

async function copiar(texto, botao, rotuloOriginal){
  let ok = false;
  try { await navigator.clipboard.writeText(texto); ok = true; }
  catch(e){
    const ta = document.createElement("textarea");
    ta.value = texto; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand("copy"); } catch(e2){}
    document.body.removeChild(ta);
  }
  botao.textContent = ok ? "copiado ✓" : "não deu";
  setTimeout(() => { botao.textContent = rotuloOriginal; }, 1600);
}

/* ── montagem ── */
function botaoTraco(rotulo, lados, modFixo, fraco, grupo){
  const b = el("button", "tr" + (fraco ? " fraco" : ""));
  b.type = "button";
  b.appendChild(el("span", null, rotulo));
  b.appendChild(el("b", null, "d" + lados + (modFixo ? " " + sinal(modFixo) : "")));
  b.addEventListener("click", () => mostrar(rolarTraco(rotulo, lados, modFixo), grupo));
  return b;
}

function atualizarEstado(){
  document.getElementById("valFer").textContent = E.fer;
  document.getElementById("valFad").textContent = E.fad;
  document.getElementById("valBenn").textContent = E.benn;
  document.getElementById("boxFer").className = "estado" + (E.fer ? " ferido" : "");
  document.getElementById("boxFad").className = "estado" + (E.fad ? " ferido" : "");
  const p = penalidadeCorpo();
  const av = document.getElementById("avisoPen");
  av.innerHTML = p
    ? `<b>${p}</b> entra sozinho em toda rolagem de traço desta página — ferimento e fadiga somados. O dano não é penalizado.`
    : "Sem ferimento nem fadiga. Nenhuma penalidade entra sozinha.";
}

function caixaEstado(id, nome, valId, get, set, max){
  const cx = el("div", "estado");
  cx.id = id;
  const esq = el("div");
  esq.appendChild(el("div", "nome", nome));
  esq.appendChild(el("div", "sob", "máx. " + max));
  cx.appendChild(esq);
  const ctrl = el("div", "ctrl");
  const menos = el("button", "pill", "−"); menos.type = "button";
  const val = el("span", "val", String(get())); val.id = valId;
  const mais = el("button", "pill", "+"); mais.type = "button";
  menos.addEventListener("click", () => { set(Math.max(0, get() - 1)); atualizarEstado(); });
  mais.addEventListener("click", () => { set(Math.min(max, get() + 1)); atualizarEstado(); });
  ctrl.appendChild(menos); ctrl.appendChild(val); ctrl.appendChild(mais);
  cx.appendChild(ctrl);
  return cx;
}

function montarFicha(p){
  P = p;
  E.fer = p.estado.ferimentos;
  E.fad = p.estado.fadiga;
  E.benn = p.estado.bennies;

  document.title = p.nome + " — Conan Legacy";

  /* cabeca */
  document.getElementById("retrato").src = p.retrato;
  document.getElementById("retrato").alt = "Retrato de " + p.nome;
  document.getElementById("nome").textContent = p.nome;
  document.getElementById("sub").textContent =
    [p.especie, p.rank ? p.rank + " · " + p.avancos + " avanços" : null].filter(Boolean).join(" · ");

  /* derivados */
  const d = document.getElementById("derivados");
  const der = (nome, valor, obs) => {
    const c = el("div", "der");
    c.appendChild(el("span", null, nome));
    c.appendChild(el("b", null, String(valor)));
    if (obs) c.appendChild(el("small", null, obs));
    d.appendChild(c);
  };
  der("Aparar", p.derivados.aparar, p.derivados.aparetNota || "");
  der("Resistência", p.derivados.resistencia, p.derivados.armadura ? `(${p.derivados.armadura} de armadura)` : "");
  der("Passo", p.derivados.passo, "correr " + p.derivados.correr);

  /* estado */
  const es = document.getElementById("estados");
  es.appendChild(caixaEstado("boxFer", "Ferimentos", "valFer", () => E.fer, (v) => (E.fer = v), p.estado.ferimentosMax));
  es.appendChild(caixaEstado("boxFad", "Fadiga", "valFad", () => E.fad, (v) => (E.fad = v), p.estado.fadigaMax));
  es.appendChild(caixaEstado("boxBenn", "Bennies", "valBenn", () => E.benn, (v) => (E.benn = v), p.estado.benniesMax));

  /* modificador de situacao */
  const om = document.getElementById("optSit");
  [-4, -3, -2, -1, 0, 1, 2, 3, 4].forEach((v) => {
    const b = el("button", "opt" + (v === 0 ? " sel" : ""), v > 0 ? "+" + v : String(v));
    b.type = "button";
    b.addEventListener("click", () => {
      E.sit = v;
      [...om.children].forEach((c) => c.classList.remove("sel"));
      b.classList.add("sel");
    });
    om.appendChild(b);
  });

  /* atributos */
  const gAtr = document.getElementById("gAtributos");
  const cxAtr = el("div", "tracos");
  p.atributos.forEach((a) => cxAtr.appendChild(botaoTraco(a.nome, a.s, a.m, false, gAtr)));
  gAtr.appendChild(cxAtr);

  /* pericias */
  const gPer = document.getElementById("gPericias");
  const cxPer = el("div", "tracos");
  p.pericias.forEach((s) => cxPer.appendChild(botaoTraco(s.nome, s.s, s.m, false, gPer)));
  cxPer.appendChild(botaoTraco("sem perícia", 4, -2, true, gPer));
  gPer.appendChild(cxPer);

  /* armas */
  const gArm = document.getElementById("gArmas");
  const cxArm = el("div");
  p.armas.forEach((w) => {
    const box = el("div", "arma");
    box.appendChild(el("div", "nome", w.nome));
    const det = [];
    det.push("dano " + String(w.dano).replace(/@str/gi, "d" + p.forca));
    if (w.alcance) det.push("alcance " + w.alcance);
    if (w.ap) det.push("AP " + w.ap);
    if (w.minStr) det.push("Força mínima " + w.minStr);
    if (w.notas) det.push(w.notas);
    box.appendChild(el("div", "det", det.join(" · ")));
    const par = el("div", "par");
    const bAtk = el("button", "tr");
    bAtk.type = "button";
    bAtk.appendChild(el("span", null, "Atacar · " + w.pericia));
    bAtk.appendChild(el("b", null, "d" + w.periciaDado + (w.ataqueMod ? " " + sinal(w.ataqueMod) : "")));
    bAtk.addEventListener("click", () => mostrar(rolarTraco(w.nome + " · ataque", w.periciaDado, w.ataqueMod || 0), gArm));
    const bDano = el("button", "tr");
    bDano.type = "button";
    bDano.appendChild(el("span", null, "Dano"));
    bDano.appendChild(el("b", null, String(w.dano).replace(/@str/gi, "d" + p.forca)));
    bDano.addEventListener("click", () => mostrar(rolarDano(w.nome + " · dano", w.dano), gArm));
    par.appendChild(bAtk); par.appendChild(bDano);
    box.appendChild(par);
    cxArm.appendChild(box);
  });
  gArm.appendChild(cxArm);

  /* como os derivados foram calculados */
  const cc = document.getElementById("comoCalculado");
  if (cc && p.comoCalculado) cc.textContent = p.comoCalculado;

  /* historico */
  const bh = document.getElementById("bHist");
  if (bh) bh.addEventListener("click", (ev) => {
    if (!E.hist.length){
      ev.target.textContent = "nada ainda";
      setTimeout(() => { ev.target.textContent = "Copiar histórico"; }, 1400);
      return;
    }
    copiar(`ROLAGENS — ${P.nome}\n` + E.hist.join("\n"), ev.target, "Copiar histórico");
  });

  atualizarEstado();
}

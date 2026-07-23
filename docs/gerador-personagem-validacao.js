(() => {
  "use strict";
  const MASTER_EMAIL = "popota@gmail.com";
  const EMAIL_ENDPOINT = String(window.CONAN_LEGACY_EMAIL_ENDPOINT || '').trim();
  const EMAIL_ENDPOINT_MODE = String(window.CONAN_LEGACY_EMAIL_ENDPOINT_MODE || 'cors').trim();
  const STARTING_FUNDS = 650;
  const LOG_KEY = "conanLegacySendDiagnostics";
  const BASE_ATTRIBUTE_BUDGET = 5;
  const BASE_EDGE_BUDGET = 1;
  const BASE_SKILL_BUDGET = 12;
  const BASE_ADVANCES = 2;
  const HINDRANCE_BENEFIT_LIMIT = 4;
  const formEl = document.getElementById("pc-form");
  const outputEl = document.getElementById("output");
  const statusEl = document.getElementById("status");
  const advanceTypes = [["","Escolha..."],["edge","Nova Vantagem"],["attribute","Aumentar atributo"],["oneSkill","Aumentar uma perícia"],["twoSkills","Aumentar duas perícias"],["reduceHindrance","Reduzir Hindrance Major para Minor"],["saveForHindrance","Guardar para remover Hindrance Major"]];
  const css = `.block-status{width:min(360px,100%);margin:14px 0 0 auto;border:1px solid rgba(201,154,74,.38);background:rgba(31,27,22,.92);padding:10px;font-size:.82rem}.block-status.is-limit{border-color:#cc993c;box-shadow:0 0 0 1px rgba(204,153,60,.25)}.block-status.is-error{border-color:#aa332e;box-shadow:0 0 0 1px rgba(170,51,46,.35)}.block-status.is-warning{border-color:#cc993c}.status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.status-grid span{display:block;color:var(--muted);text-transform:uppercase;font-size:.68rem}.status-grid strong{display:block;margin-top:2px;color:var(--ink);font-size:1rem}.status-message{margin-top:8px;color:var(--muted);line-height:1.35}.block-status.is-limit .status-message{color:#ffcc99}.block-status.is-error .status-message{color:#ffb7a8}.advance-row{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.1fr);gap:8px;align-items:end;margin-bottom:8px}.advance-row textarea{min-height:44px}.is-hidden{display:none!important}.button:disabled{cursor:not-allowed;opacity:.48;filter:grayscale(.25)}.send-diagnostics{margin-top:16px;border-top:1px solid var(--line);padding-top:12px}.send-diagnostics h3{margin-bottom:8px}.send-log{display:grid;gap:6px;max-height:150px;overflow:auto;color:var(--muted);font-size:.76rem}.send-log-entry{border:1px solid rgba(238,224,203,.14);padding:7px;background:rgba(255,255,255,.03)}@media(max-width:720px){.advance-row{grid-template-columns:1fr}}`;
  function esc(v){return String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));}
  function options(items, ph="Escolha..."){return [`<option value="">${ph}</option>`,...items.map(i=>`<option value="${esc(i)}">${esc(i)}</option>`)].join("");}
  function statusText(m){if(statusEl)statusEl.textContent=m;}
  function ensureStatus(id, anchor){let box=document.getElementById(id); if(box||!anchor)return box; box=document.createElement("div"); box.className="block-status"; box.id=id; box.innerHTML=`<div class="status-grid"><div><span>Usado</span><strong data-used>0</strong></div><div><span>Disponível</span><strong data-available>0</strong></div><div><span>Restante</span><strong data-remaining>0</strong></div></div><div class="status-message" data-message>Dentro do limite.</div>`; anchor.insertAdjacentElement("afterend",box); return box;}
  function setBlockStatus(id, used, available, messages=[]){const box=document.getElementById(id); if(!box)return; const remaining=available-used; const err=messages.some(m=>m.type==="error"); const warn=messages.some(m=>m.type==="warning"); box.classList.toggle("is-error",err); box.classList.toggle("is-warning",!err&&warn); box.classList.toggle("is-limit",!err&&!warn&&remaining===0); box.querySelector("[data-used]").textContent=String(used); box.querySelector("[data-available]").textContent=String(available); box.querySelector("[data-remaining]").textContent=String(remaining); box.querySelector("[data-message]").textContent=(err||warn)?messages.map(m=>m.text).join(" "):(remaining===0?"Limite alcancado.":"Dentro do limite.");}
  function enhanceStaticUi(){
    if(!document.getElementById("mechanical-validation-style")){const st=document.createElement("style"); st.id="mechanical-validation-style"; st.textContent=css; document.head.appendChild(st);}
    const origin=formEl.elements.origin; if(origin&&typeof BACKGROUNDS!=="undefined"){const cur=origin.value; origin.innerHTML=options(BACKGROUNDS.map(b=>b.name)); origin.value=cur;}
    ensureStatus("attributes-status",document.getElementById("attribute-fields"));
    const hf=document.getElementById("hindrance-fields"); ensureStatus("hindrance-status",hf?.nextElementSibling||hf);
    ensureStatus("edge-status",document.getElementById("edge-fields"));
    ensureStatus("skill-status",document.getElementById("skill-fields")?.nextElementSibling||document.getElementById("skill-fields"));
    ensureStatus("advance-status",document.getElementById("advance-fields"));
    ensureStatus("equipment-status",document.getElementById("equipment-builder")||document.getElementById("equipamentos")?.closest("section"));
    const hs=document.getElementById("desvantagens")?.closest("section"); if(hs&&!document.getElementById("hindrance-spend-rules")){const p=document.createElement("p"); p.className="notice"; p.id="hindrance-spend-rules"; p.textContent="Gasto dos pontos: 2 pontos de Hindrance sobem 1 atributo em um passo ou compram 1 Vantagem; 1 ponto de Hindrance compra 1 ponto de perícia ou recursos iniciais extras iguais a 2x o dinheiro inicial do cenário."; hs.querySelector(".section-head")?.insertAdjacentElement("afterend",p);}
    const old=formEl.elements.extraSkillPoints; if(old?.closest("label")){old.value="0"; old.closest("label").classList.add("is-hidden");}
    const armor=formEl.elements.armorBonus; if(armor?.closest("label")){armor.value="0"; armor.closest("label").classList.add("is-hidden");}
    const send=document.getElementById("send-master"); if(send)send.textContent="Enviar para o Mestre";
    const legal=document.querySelector(".legal"); if(legal&&!document.getElementById("send-diagnostics"))legal.insertAdjacentHTML("afterend",`<div class="send-diagnostics" id="send-diagnostics"><h3>Diagnóstico de envio</h3><div class="send-log" id="send-log">Nenhum envio registrado nesta sessão.</div></div>`);
    renderBackgroundMechanics(dataObj()); renderHindranceOptions(dataObj()); renderEnhancedAdvances(); renderSendLog();
  }
  function renderEnhancedAdvances(){const c=document.getElementById("advance-fields"); if(!c||c.dataset.enhanced==="true")return; c.dataset.enhanced="true"; c.innerHTML=[1,2].map(i=>`<div class="advance-row" data-advance-row="${i}"><label>Avanço ${i}<select name="advanceType_${i}" data-advance-type="${i}">${advanceTypes.map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select></label><label data-advance-primary-label="${i}">Escolha<select name="advancePrimary_${i}" data-advance-primary="${i}"></select></label><label data-advance-secondary-label="${i}" class="is-hidden">Perícia 2<select name="advanceSecondary_${i}" data-advance-secondary="${i}"></select></label><label data-advance-note-label="${i}">Detalhe<textarea name="advanceNote_${i}" placeholder="Observação opcional para o Mestre."></textarea></label></div>`).join("");}
  function dataObj(){return Object.fromEntries(new FormData(formEl).entries());}
  function dstep(v){return DIE_STEPS[v||"-"]??-1;}
  function dieFromStep(s){return DIE_VALUES[Math.max(0,Math.min(DIE_VALUES.length-1,s+1))]||"d4";}
  function num(v){return Math.max(0,Number.parseInt(v||"0",10)||0);}
  function filled(v){const t=String(v??"").trim(); return t||"-";}
  function selectedBackground(data){return BACKGROUNDS.find(b=>b.name===data.culturalBackground);}
  function selectedHindranceNames(data){const out=[]; for(let i=1;i<=4;i++){if(data[`hindrance_${i}`])out.push(data[`hindrance_${i}`]);} return out;}
  function randomData(){return window.CONAN_RANDOM_DATA||{};}
  function backgroundRule(data){return randomData().backgrounds?.[data.culturalBackground]||null;}
  function selectedBackgroundBenefit(data){const rule=backgroundRule(data); return rule?.benefits?.find(benefit=>benefit.id===data.culturalBenefit)||rule?.benefits?.[0]||null;}
  function automaticBackgroundLimitations(data){return (backgroundRule(data)?.automaticHindrances||[]).map(item=>item.label);}
  function renderBackgroundMechanics(data){
    const rule=backgroundRule(data); const summary=document.getElementById("background-summary"); let holder=document.getElementById("background-mechanics");
    if(!holder){holder=document.createElement("div"); holder.id="background-mechanics"; holder.className="grid two"; document.getElementById("background-fields")?.insertAdjacentElement("afterend",holder);}
    const fingerprint=rule?`${data.culturalBackground}:${rule.benefits.map(item=>item.id).join("|")}`:"";
    if(holder.dataset.fingerprint!==fingerprint){
      holder.dataset.fingerprint=fingerprint;
      if(rule?.benefits?.length){holder.innerHTML=`<label>Benefício mecânico<select name="culturalBenefit">${options(rule.benefits.map(item=>item.id),"Escolha o benefício")}</select></label>`; const select=holder.querySelector("select"); rule.benefits.forEach(item=>{const option=[...select.options].find(entry=>entry.value===item.id); if(option)option.textContent=item.label;}); select.value=rule.benefits.some(item=>item.id===data.culturalBenefit)?data.culturalBenefit:rule.benefits[0].id;}
      else holder.innerHTML="";
    }
    if(summary){
      if(!rule){summary.textContent="Escolha um Background para ver o resumo mecânico.";}
      else {const benefit=selectedBackgroundBenefit({...data,culturalBenefit:holder.querySelector("select")?.value||data.culturalBenefit}); const limits=automaticBackgroundLimitations(data); summary.textContent=`Benefício selecionado: ${benefit?.label||"narrativo"}. Limitações automáticas: ${limits.join(" ")||"nenhuma que conceda pontos."}${rule.fundsNote?` Recursos: ${rule.fundsNote}`:""}`;}
    }
  }
  function renderHindranceOptions(data){
    const catalog=randomData().hindrances||HINDRANCE_OPTIONS.map(label=>({id:label.toLowerCase(),label})); const blocked=new Set((backgroundRule(data)?.automaticHindrances||[]).flatMap(item=>item.blockedIds||[item.id])); const labels=catalog.filter(item=>!blocked.has(item.id)).map(item=>item.label);
    for(let i=1;i<=4;i++){const field=formEl.elements[`hindrance_${i}`],grade=formEl.elements[`hindranceType_${i}`]; if(!field)continue; const current=field.value,previousGrade=grade?.value||"0"; field.innerHTML=options(labels,"Não escolhida"); field.value=labels.includes(current)?current:""; const entry=catalog.find(item=>item.label===field.value); if(grade){const grades=entry?.grades||[1,2]; grade.innerHTML=`<option value="0">Não usada</option>${grades.map(value=>`<option value="${value}">${value===1?"Menor (+1)":"Maior (+2)"}</option>`).join("")}`; grade.value=grades.includes(Number(previousGrade))?previousGrade:"0";}}
  }
  function backgroundAttributeCredit(data,attrs){const benefit=selectedBackgroundBenefit(data); if(!benefit?.attribute)return 0; return Math.max(0,Math.min(attrs[benefit.attribute]||0,dstep(benefit.die)));}
  function backgroundSkillCredit(data,attrs){const benefit=selectedBackgroundBenefit(data); if(!benefit?.skill)return 0; const skill=SKILLS.find(([key])=>key===benefit.skill); if(!skill)return 0; const [key,,attribute,core]=skill; const target=dstep(data[`skill_${key}`]||(core?"d4":"-")); const granted=dstep(benefit.die); return target>=granted?skillCostFromTo(baseSkillStep(core),granted,attrs[attribute]??0):0;}
  function syncBackgroundEdge(data){
    const benefit=selectedBackgroundBenefit(data); const slots=[];
    for(let i=1;i<=4;i++){const edge=formEl.elements[`edge_${i}`],source=formEl.elements[`edgeSource_${i}`],approval=formEl.elements[`edgeApproval_${i}`]; if(edge&&source)slots.push({edge,source,approval});}
    for(const slot of slots){if(slot.source.value==="Background Cultural"&&!benefit?.edge){slot.edge.value=""; slot.source.value=""; if(slot.approval)slot.approval.value="Pendente";}}
    if(!benefit?.edge)return;
    let target=slots.find(slot=>slot.source.value==="Background Cultural")||slots.find(slot=>!slot.edge.value); if(!target)return;
    if(![...target.source.options].some(option=>option.value==="Background Cultural")){const option=document.createElement("option"); option.value="Background Cultural"; option.textContent="Background Cultural"; target.source.appendChild(option);}
    target.edge.value=benefit.edge; target.source.value="Background Cultural"; if(target.approval)target.approval.value="Pendente";
  }
  function updateAdvanceControls(data){
    for(let i=1;i<=2;i++){
      const type=data[`advanceType_${i}`]||""; const pri=formEl.elements[`advancePrimary_${i}`]; const sec=formEl.elements[`advanceSecondary_${i}`];
      const pl=document.querySelector(`[data-advance-primary-label="${i}"]`); const sl=document.querySelector(`[data-advance-secondary-label="${i}"]`); const nl=document.querySelector(`[data-advance-note-label="${i}"]`);
      if(!pri||!sec||!pl||!sl||!nl)continue; const pv=pri.value, sv=sec.value; const skillNames=SKILLS.map(([,l])=>l); const attrNames=ATTRIBUTES.map(([,l])=>l); const hNames=selectedHindranceNames(data); const allHNames=(randomData().hindrances||HINDRANCE_OPTIONS.map(label=>({label}))).map(item=>item.label);
      pl.classList.remove("is-hidden"); sl.classList.add("is-hidden"); nl.classList.remove("is-hidden");
      if(type==="edge"){pl.firstChild.textContent="Vantagem "; pri.innerHTML=options(EDGE_OPTIONS,"Escolha a Vantagem");}
      else if(type==="attribute"){pl.firstChild.textContent="Atributo "; pri.innerHTML=options(attrNames,"Escolha o atributo");}
      else if(type==="oneSkill"){pl.firstChild.textContent="Perícia "; pri.innerHTML=options(skillNames,"Escolha a perícia");}
      else if(type==="twoSkills"){pl.firstChild.textContent="Perícia 1 "; pri.innerHTML=options(skillNames,"Escolha a primeira perícia"); sec.innerHTML=options(skillNames,"Escolha a segunda perícia"); sl.classList.remove("is-hidden");}
      else if(type==="reduceHindrance"){pl.firstChild.textContent="Hindrance "; pri.innerHTML=options(hNames.length?hNames:allHNames,"Escolha a Hindrance");}
      else {pri.innerHTML=`<option value="">Não se aplica</option>`; pl.classList.add("is-hidden");}
      if([...pri.options].some(o=>o.value===pv))pri.value=pv; if([...sec.options].some(o=>o.value===sv))sec.value=sv;
    }
  }
  function attrSteps(data){return Object.fromEntries(ATTRIBUTES.map(([k])=>[k,dstep(data[`attr_${k}`]||"d4")]))}
  function skillByLabel(label){const item=SKILLS.find(([,l])=>l===label); if(!item)return null; const [key,l,attr,core]=item; return {key,label:l,attr,core};}
  function baseSkillStep(core){return core?0:-1;}
  function skillCostFromTo(base,target,attr){let cost=0; for(let s=base+1;s<=target;s++)cost+=s<=attr?1:2; return Math.max(0,cost);}
  function currentSkillStep(data,skill){return dstep(data[`skill_${skill.key}`]||(skill.core?"d4":"-"));}
  function validateAdvanceSkill(data,attrs,label,mode,errors){
    const sk=skillByLabel(label); if(!sk)return 0; const target=currentSkillStep(data,sk); const base=baseSkillStep(sk.core); const prev=target-1; const attr=attrs[sk.attr]??0;
    if(target<=base){errors.push(`Avanço de perícia em ${sk.label}: selecione no bloco Perícias o valor final após o Avanço.`); return 0;}
    if(mode==="oneSkill"&&prev<attr)errors.push(`Avanço de uma perícia em ${sk.label}: use esta opção quando a perícia já estava igual ou acima do atributo vinculado antes do aumento.`);
    if(mode==="twoSkills"&&(prev>=attr||target>attr))errors.push(`Avanço de duas perícias em ${sk.label}: cada perícia deve estar abaixo do atributo vinculado antes do aumento.`);
    return skillCostFromTo(prev,target,attr);
  }
  function collectAdvances(data,attrs,errors,warnings){
    const advances=[]; let attributeAdvances=0, edgeAdvances=0, skillCredits=0;
    for(let i=1;i<=2;i++){
      const type=data[`advanceType_${i}`]||""; const primary=data[`advancePrimary_${i}`]||""; const secondary=data[`advanceSecondary_${i}`]||""; const note=data[`advanceNote_${i}`]||""; if(!type)continue;
      const label=advanceTypes.find(([v])=>v===type)?.[1]||type; const parts=[`Avanço ${i}: ${label}`]; if(primary)parts.push(primary); if(secondary)parts.push(secondary); if(note)parts.push(`nota: ${note}`); advances.push(parts.join("; "));
      if(type==="edge"){if(!primary)errors.push(`Avanço ${i}: escolha qual Vantagem nova será comprada.`); edgeAdvances++; warnings.push(`Avanço ${i}: requisitos da Vantagem precisam de revisão do Mestre.`);}
      else if(type==="attribute"){if(!primary)errors.push(`Avanço ${i}: escolha qual atributo aumenta.`); attributeAdvances++;}
      else if(type==="oneSkill"){if(!primary)errors.push(`Avanço ${i}: escolha a perícia aumentada.`); skillCredits+=validateAdvanceSkill(data,attrs,primary,"oneSkill",errors);}
      else if(type==="twoSkills"){if(!primary||!secondary)errors.push(`Avanço ${i}: escolha duas perícias.`); if(primary&&secondary&&primary===secondary)errors.push(`Avanço ${i}: as duas perícias precisam ser diferentes.`); skillCredits+=validateAdvanceSkill(data,attrs,primary,"twoSkills",errors); skillCredits+=validateAdvanceSkill(data,attrs,secondary,"twoSkills",errors);}
      else if(type==="reduceHindrance"){if(!primary)warnings.push(`Avanço ${i}: informe qual Hindrance Major será reduzida para Minor.`);}
      else if(type==="saveForHindrance")warnings.push(`Avanço ${i}: guardado para remover Hindrance Major; não altera pontos agora.`);
    }
    if(attributeAdvances>1)errors.push("Avanços: aumentar atributo só pode ocorrer uma vez por Rank.");
    if(advances.length>BASE_ADVANCES)errors.push("Avanços: há mais de 2 Avanços preenchidos.");
    return {advances,attributeAdvances,edgeAdvances,skillCredits};
  }
  function emptyEquipment(extraFunds){
    const budgetBase=STARTING_FUNDS,budget=budgetBase+extraFunds;
    return {packageId:"",packageName:"",budgetBase,budgetBonus:extraFunds,budget,totalCost:0,totalWeight:0,remaining:budget,rows:[],items:[],warnings:[],errors:[],armorBonus:0,shieldParryBonus:0,hasBodyArmor:false,hasShield:false,hasHelmet:false,unarmoredHero:"sem armadura corporal selecionada"};
  }
  function equipmentCalc(data,extraFunds){
    if(window.HeroeForgeEquipment?.collect)return window.HeroeForgeEquipment.collect({data,extraFunds});
    const fallback=emptyEquipment(extraFunds);
    if((data.equipmentWishlist||"").trim())fallback.warnings.push("Equipamentos em campo livre: revisar manualmente com o Mestre.");
    return fallback;
  }
  function derivedParry(calc){return 4+Math.floor(((DIE_NUMBERS[calc.data.skill_fighting]||0)/2))+(calc.equipment?.shieldParryBonus||0);}
  function derivedToughness(calc){return 2+Math.floor(((DIE_NUMBERS[calc.data.attr_vigor||"d4"]||4)/2))+(calc.equipment?.armorBonus||0);}
  function collectCalc(){
    let data=dataObj(); renderBackgroundMechanics(data); data=dataObj(); syncBackgroundEdge(data); renderHindranceOptions(data); updateAdvanceControls(data); data=dataObj();
    const errors=[],warnings=[],attrs=attrSteps(data),background=selectedBackground(data),backgroundBenefit=selectedBackgroundBenefit(data);
    const attrRaw=ATTRIBUTES.reduce((sum,[key])=>sum+(attrs[key]||0),0); const attrBackgroundBonus=backgroundAttributeCredit(data,attrs); const attrSpent=Math.max(0,attrRaw-attrBackgroundBonus);
    let hindrancePoints=0; const hindrances=[]; const seen=new Set(),dup=new Set();
    for(let i=1;i<=4;i++){
      const name=data[`hindrance_${i}`]||""; const pts=num(data[`hindranceType_${i}`]); const input=formEl.elements[`hindrancePoints_${i}`]; if(input)input.value=String(name?pts:0); if(!name)continue;
      hindrancePoints+=pts; if(seen.has(name))dup.add(name); seen.add(name); hindrances.push(`${name} (${pts===2?"Maior":"Menor"}, ${pts} ponto${pts===1?"":"s"})`);
    }
    if(hindrancePoints>HINDRANCE_BENEFIT_LIMIT)errors.push(`Desvantagens acima do limite mecânico: ${hindrancePoints}/${HINDRANCE_BENEFIT_LIMIT}.`);
    for(const name of dup)warnings.push(`Desvantagem repetida (${name}): verificar com o Mestre.`);
    const spendEdge=num(data.spendEdge),spendAttribute=num(data.spendAttribute),spendSkill=num(data.spendSkill),spendFunds=num(data.spendFunds);
    const hindranceSpend=spendEdge+spendAttribute+spendSkill+spendFunds,hindranceAvailable=Math.min(hindrancePoints,HINDRANCE_BENEFIT_LIMIT),extraFunds=spendFunds*STARTING_FUNDS*2;
    if(hindranceSpend>hindranceAvailable)errors.push(`Gasto de Hindrance acima dos pontos disponiveis: ${hindranceSpend}/${hindranceAvailable}.`);
    if(spendEdge%2!==0)errors.push("Gasto de Hindrance em Vantagem precisa ser multiplo de 2.");
    if(spendAttribute%2!==0)errors.push("Gasto de Hindrance em Atributo precisa ser multiplo de 2.");
    const adv=collectAdvances(data,attrs,errors,warnings);
    const attrBudget=BASE_ATTRIBUTE_BUDGET+Math.floor(spendAttribute/2)+adv.attributeAdvances; if(attrSpent>attrBudget)errors.push(`Atributos acima do orçamento: ${attrSpent}/${attrBudget}.`);
    let skillSpent=0; const skillCosts={},selectedSkills=[]; const skillBackgroundBonus=backgroundSkillCredit(data,attrs);
    for(const [key,label,attribute,core] of SKILLS){
      const target=dstep(data[`skill_${key}`]||(core?"d4":"-")); const rawCost=skillCostFromTo(baseSkillStep(core),target,attrs[attribute]??0); const freeCost=backgroundBenefit?.skill===key&&target>=dstep(backgroundBenefit.die)?skillBackgroundBonus:0; const cost=Math.max(0,rawCost-freeCost);
      skillCosts[key]=cost; skillSpent+=cost; if(target>=0)selectedSkills.push([label,dieFromStep(target),cost,attribute]);
    }
    const skillBudget=BASE_SKILL_BUDGET+spendSkill+adv.skillCredits; if(skillSpent>skillBudget)errors.push(`Perícias acima do orçamento: ${skillSpent}/${skillBudget}.`);
    let edgeSpent=0,edgeBackgroundBonus=0; const edges=[];
    for(let i=1;i<=4;i++){const name=data[`edge_${i}`]||""; if(!name)continue; const source=data[`edgeSource_${i}`]||"Criação"; const approval=data[`edgeApproval_${i}`]||"Pendente"; edgeSpent++; if(source==="Background Cultural")edgeBackgroundBonus++; edges.push(`${name} - origem: ${source}; status: ${approval}`);}
    const edgeBudget=BASE_EDGE_BUDGET+Math.floor(spendEdge/2)+adv.edgeAdvances+edgeBackgroundBonus; if(edgeSpent>edgeBudget)errors.push(`Vantagens acima do orçamento: ${edgeSpent}/${edgeBudget}.`);
    const answeredBonds=typeof BONDS==="undefined"?0:BONDS.filter((_,i)=>(data[`bond_${i+1}`]||"").trim().length>0).length; if(answeredBonds<5)warnings.push(`Responder pelo menos 5 vínculos. Respondidos: ${answeredBonds}/5.`);
    const equipment=equipmentCalc(data,extraFunds); equipment.errors.forEach(text=>errors.push(text)); equipment.warnings.forEach(text=>warnings.push(text));
    return {data,errors,warnings,canOfficiallyExport:errors.length===0,attrSpent,attrBudget,attrBase:BASE_ATTRIBUTE_BUDGET,attrHindranceBonus:Math.floor(spendAttribute/2),attrBackgroundBonus,attrAdvanceBonus:adv.attributeAdvances,hindrancePoints,hindranceBudget:HINDRANCE_BENEFIT_LIMIT,hindranceSpend,hindranceAvailable,spendEdge,spendAttribute,spendSkill,spendFunds,skillSpent,skillBudget,skillBase:BASE_SKILL_BUDGET,skillHindranceBonus:spendSkill,skillBackgroundBonus,skillAdvanceBonus:adv.skillCredits,skillCosts,selectedSkills,edgeSpent,edgeBudget,edgeBase:BASE_EDGE_BUDGET,edgeHindranceBonus:Math.floor(spendEdge/2),edgeAdvanceBonus:adv.edgeAdvances,edgeBackgroundBonus,hindrances,automaticLimitations:automaticBackgroundLimitations(data),edges,advances:adv.advances,extraFunds,equipment,attrSteps:attrs,answeredBonds,background,backgroundBenefit,backgroundRule:backgroundRule(data)};
  }
  function updateStatuses(calc){
    setBlockStatus("attributes-status",calc.attrSpent,calc.attrBudget,calc.attrSpent>calc.attrBudget?[{type:"error",text:"Excesso de pontos de atributo."}]:[]);
    const hm=[]; if(calc.hindrancePoints>calc.hindranceBudget)hm.push({type:"error",text:"Benefício mecânico acima de 4 pontos."}); if(calc.hindranceSpend>calc.hindranceAvailable)hm.push({type:"error",text:`Gasto acima do disponível: ${calc.hindranceSpend}/${calc.hindranceAvailable}.`}); if(calc.spendEdge%2!==0||calc.spendAttribute%2!==0)hm.push({type:"error",text:"Gastos em Vantagem/Atributo usam blocos de 2 pontos."}); calc.warnings.filter(t=>t.includes("Desvantagem repetida")).forEach(t=>hm.push({type:"warning",text:t})); setBlockStatus("hindrance-status",calc.hindrancePoints,calc.hindranceBudget,hm);
    const em=calc.edgeSpent>calc.edgeBudget?[{type:"error",text:"Excesso de Vantagens."}]:(calc.edgeSpent===calc.edgeBudget?[{type:"warning",text:"Limite de Vantagens alcancado."}]:[]); setBlockStatus("edge-status",calc.edgeSpent,calc.edgeBudget,em);
    setBlockStatus("skill-status",calc.skillSpent,calc.skillBudget,calc.skillSpent>calc.skillBudget?[{type:"error",text:"Excesso de pontos de perícia."}]:[]);
    const am=calc.errors.filter(t=>t.startsWith("Avanço")||t.startsWith("Avanços")).map(t=>({type:"error",text:t})); calc.warnings.filter(t=>t.startsWith("Avanço")).forEach(t=>am.push({type:"warning",text:t})); setBlockStatus("advance-status",calc.advances.length,BASE_ADVANCES,am);
    const eq=calc.equipment||emptyEquipment(calc.extraFunds); const qm=eq.errors.map(text=>({type:"error",text})); eq.warnings.forEach(text=>qm.push({type:"warning",text})); setBlockStatus("equipment-status",eq.totalCost,eq.budget,qm);
  }
  function updateSidebar(calc){
    [["attr-count",`${calc.attrSpent} / ${calc.attrBudget}`],["hindrance-count",`${calc.hindrancePoints} / ${calc.hindranceBudget}`],["hindrance-spend",`${calc.hindranceSpend} / ${calc.hindranceAvailable}`],["skill-count",`${calc.skillSpent} / ${calc.skillBudget}`]].forEach(([id,v])=>{const e=document.getElementById(id); if(e)e.textContent=v;});
    [["attr-bar",calc.attrSpent,calc.attrBudget],["hindrance-bar",calc.hindrancePoints,calc.hindranceBudget],["hindrance-spend-bar",calc.hindranceSpend,calc.hindranceAvailable||1],["skill-bar",calc.skillSpent,calc.skillBudget]].forEach(([id,u,a])=>{const f=document.querySelector(`#${id} span`); if(f)f.style.width=`${Math.min(100,Math.round((u/Math.max(1,a))*100))}%`;});
    const derived=document.getElementById("derived-values"); if(derived){const eq=calc.equipment||emptyEquipment(calc.extraFunds); derived.innerHTML=`<div><span>Pace</span><strong>6</strong></div><div><span>Parry</span><strong>${derivedParry(calc)}</strong></div><div><span>Toughness</span><strong>${derivedToughness(calc)}</strong></div><div><span>Bennies</span><strong>3</strong></div><div><span>Equipamentos</span><strong>${eq.totalCost}/${eq.budget}</strong></div><div><span>Peso</span><strong>${eq.totalWeight}</strong></div>`;}
    const reason=calc.errors.length?`Corrija antes: ${calc.errors[0]}`:""; [document.getElementById("send-master"),document.getElementById("download-output")].forEach(b=>{if(!b)return; b.disabled=!calc.canOfficiallyExport; b.title=reason;});
  }
  function listLines(items){const lines=items.filter(x=>x&&String(x).trim()).map(x=>`- ${x}`); return lines.length?lines.join("\n"):"-";}
  function equipmentItemDetails(item){
    const bits=[]; if(item.damage)bits.push(`dano ${item.damage}`); if(item.armor)bits.push(`Armor +${item.armor}`); if(item.parry)bits.push(`Parry +${item.parry}`); if(item.effect)bits.push(item.effect); return bits.join("; ")||"-";
  }
  function equipmentHumanBlock(calc){
    const eq=calc.equipment||emptyEquipment(calc.extraFunds); const rows=eq.items.map(item=>`- ${item.qty}x ${item.name} - custo ${item.cost}; peso ${item.weight}; acesso ${item.access||"Publico"}; ${equipmentItemDetails(item)}`);
    return `## Armas e Equipamentos
Pacote estruturado: ${eq.packageName?`${eq.packageName} (${eq.packageId})`:"-"}
Orçamento: base ${eq.budgetBase}; bônus por recursos de Hindrance ${eq.budgetBonus}; total ${eq.budget}; gasto ${eq.totalCost}; restante ${eq.remaining}; peso total ${eq.totalWeight}.
Unarmored Hero: ${eq.unarmoredHero}.

Itens escolhidos:
${rows.length?rows.join("\n"):"-"}

Pedidos, exceções e itens narrativos:
${filled(calc.data.equipmentWishlist)}

Pendencias de equipamento:
${listLines([...eq.errors,...eq.warnings])}`;
  }
  function equipmentTechnicalBlock(calc){
    const eq=calc.equipment||emptyEquipment(calc.extraFunds); const items=eq.items.map(item=>`${item.item_id}x${item.qty}(cost=${item.cost};weight=${item.weight};access=${item.access||"Publico"})`).join("; ")||"-";
    return `EQUIPMENT_PACKAGE: ${eq.packageId||"-"}
EQUIPMENT_ITEMS: ${items}
EQUIPMENT_TOTAL: ${eq.totalCost}/${eq.budget}
EQUIPMENT_WEIGHT: ${eq.totalWeight}
EQUIPMENT_WARNINGS: ${eq.warnings.join(" | ")||"-"}
EQUIPMENT_ERRORS: ${eq.errors.join(" | ")||"-"}
EQUIPMENT_FREE_TEXT: ${filled(calc.data.equipmentWishlist)}
UNARMORED_HERO: ${eq.unarmoredHero}`;
  }
  function buildDossiêr2(calc){
    const data=calc.data, pcName=filled(data.pcName), generatedAt=new Date().toLocaleString("pt-BR");
    const attributes=ATTRIBUTES.map(([key,label])=>`- ${label}: ${data[`attr_${key}`]||"d4"}`).join("\n");
    const bg=calc.background?`${calc.background.name} - ${calc.background.identity} Benefício: ${calc.background.benefit} Limitação: ${calc.background.limit}`:"-";
    const skills=calc.selectedSkills.map(([label,die,cost,attr])=>`- ${label} (${attributeLabel(attr)}): ${die}; custo de criação: ${cost}`).join("\n")||"-";
    const bonds=typeof BONDS==="undefined"?"-":BONDS.map((q,i)=>`${i+1}. ${q}\n   ${filled(data[`bond_${i+1}`])}`).join("\n");
    const pending=[...calc.errors,...calc.warnings]; const techSkills=calc.selectedSkills.map(([l,d])=>`${l}=${d}`).join("; ")||"-"; const techAttrs=ATTRIBUTES.map(([k,l])=>`${l}=${data[`attr_${k}`]||"d4"}`).join("; ");
    return `# Dossiê de PC - Conan Legacy

Gerado em: ${generatedAt}
- Geração aleatória: ${data.randomSeed?"sim":"não"}${data.randomSeed?`; semente ${data.randomSeed}`:""}

## Dados do jogador
- Jogador: ${filled(data.playerName)}
- E-mail do jogador: ${filled(data.playerEmail)}
- Personagem: ${pcName}
- Origem ou cultura: ${filled(data.origin)}
- Background Cultural: ${filled(data.culturalBackground)}
- Origem/Background lado a lado: ${filled(data.origin)} | ${filled(data.culturalBackground)}
- Conceito de mesa: ${filled(data.concept)}
- Conceito em uma frase: ${filled(data.pitch)}

## História curta
${filled(data.history)}

## Orçamento de Criação
- Atributos: base ${calc.attrBase}; bônus por Hindrance ${calc.attrHindranceBonus}; bônus por Background ${calc.attrBackgroundBonus}; bônus por Avanço ${calc.attrAdvanceBonus}; usado ${calc.attrSpent}/${calc.attrBudget}.
- Vantagens: base humana ${calc.edgeBase}; bônus por Hindrance ${calc.edgeHindranceBonus}; bônus por Background ${calc.edgeBackgroundBonus}; bônus por Avanço ${calc.edgeAdvanceBonus}; usado ${calc.edgeSpent}/${calc.edgeBudget}.
- Perícias: base ${calc.skillBase}; bônus por Hindrance ${calc.skillHindranceBonus}; bônus por Background ${calc.skillBackgroundBonus}; bônus por Avanço ${calc.skillAdvanceBonus}; usado ${calc.skillSpent}/${calc.skillBudget}.
- Desvantagens: benefício mecânico ${calc.hindrancePoints}/${calc.hindranceBudget}; gasto declarado ${calc.hindranceSpend}/${calc.hindranceAvailable}.
- Recursos extras por Hindrance: ${calc.extraFunds} (${calc.spendFunds} ponto(s) x 2 x ${STARTING_FUNDS}).

## Atributos
${attributes}

## Background Cultural
${bg}
Benefício mecânico selecionado: ${calc.backgroundBenefit?.label||"-"}
Limitações automáticas (não concedem pontos): ${listLines(calc.automaticLimitations)}
Recursos do Background: ${calc.backgroundRule?.fundsNote||"-"}
Observacoes: ${filled(data.culturalBackgroundNotes)}

## Desvantagens
${listLines(calc.hindrances)}

## Vantagens
${listLines(calc.edges)}

## Perícias
${skills}

${equipmentHumanBlock(calc)}

## Avanços iniciais
${listLines(calc.advances)}

## Vínculos de campanha
${bonds}

## Comentários para o Mestre
${filled(data.gmComments)}

## Valores derivados
- Pace: 6
- Parry: ${derivedParry(calc)}
- Toughness: ${derivedToughness(calc)}
- Bennies: 3

## Pendencias para o Mestre
${listLines(pending)}

## BLOCO TECNICO PARA CODEX
PC_NAME: ${pcName}
PLAYER: ${filled(data.playerName)}
PLAYER_EMAIL: ${filled(data.playerEmail)}
ORIGIN: ${filled(data.origin)}
BACKGROUND: ${filled(data.culturalBackground)}
BACKGROUND_BENEFIT: ${calc.backgroundBenefit?.id||"-"}
BACKGROUND_LIMITATIONS: ${calc.automaticLimitations.join("; ")||"-"}
RANDOM_SEED: ${filled(data.randomSeed)}
RANDOM_PACKAGE: ${filled(data.randomEquipmentPackage)}
${equipmentTechnicalBlock(calc)}
ATTRIBUTES: ${techAttrs}
SKILLS: ${techSkills}
HINDRANCES: ${calc.hindrances.join("; ") || "-"}
EDGES: ${calc.edges.join("; ") || "-"}
ADVANCES: ${calc.advances.join("; ") || "-"}
BUDGETS: ATTR=${calc.attrSpent}/${calc.attrBudget}; EDGES=${calc.edgeSpent}/${calc.edgeBudget}; SKILLS=${calc.skillSpent}/${calc.skillBudget}; HINDRANCE=${calc.hindrancePoints}/${calc.hindranceBudget}; HINDRANCE_SPEND=${calc.hindranceSpend}/${calc.hindranceAvailable}; FUNDS_EXTRA=${calc.extraFunds}
ERRORS: ${calc.errors.join(" | ") || "-"}
WARNINGS: ${calc.warnings.join(" | ") || "-"}
`;
  }
  function enhancedUpdate(){const calc=collectCalc(); updateStatuses(calc); updateSidebar(calc); if(outputEl)outputEl.value=buildDossiêr2(calc); return calc;}
  function downloadEnhanced(ev){ev.preventDefault(); ev.stopImmediatePropagation(); const calc=enhancedUpdate(); if(!calc.canOfficiallyExport){statusText(`Corrija as pendências mecânicas antes de baixar TXT: ${calc.errors[0]}`); return;} const filename=`conan-legacy-pc-${slug(calc.data.pcName)}.txt`; const blob=new Blob([outputEl.value],{type:"text/plain;charset=utf-8"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download=filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); statusText("TXT baixado.");}
  async function copyEnhanced(ev){ev.preventDefault(); ev.stopImmediatePropagation(); enhancedUpdate(); await navigator.clipboard.writeText(outputEl.value); statusText("Dossiê copiado. Se houver pendências, elas foram incluidas no texto.");}
  function readLogs(){try{return JSON.parse(localStorage.getItem(LOG_KEY)||"[]");}catch{return[];}}
  function writeLog(entry){const logs=[entry,...readLogs()].slice(0,8); localStorage.setItem(LOG_KEY,JSON.stringify(logs)); renderSendLog();}
  function renderSendLog(){const t=document.getElementById("send-log"); if(!t)return; const logs=readLogs(); if(!logs.length){t.textContent="Nenhum envio registrado nesta sessão."; return;} t.innerHTML=logs.map(l=>`<div class="send-log-entry"><strong>${esc(l.time)}</strong><br>modo: ${esc(l.mode)}; status: ${esc(l.status)}; tamanho: ${esc(l.size)} caracteres${l.error?`<br>erro: ${esc(l.error)}`:""}</div>`).join("");}
  async function sendDossiêr(ev){
    ev.preventDefault(); ev.stopImmediatePropagation(); const calc=enhancedUpdate(); const size=outputEl.value.length;
    if(!calc.canOfficiallyExport){const msg=`Envio bloqueado por pendência mecânica: ${calc.errors[0]}`; statusText(msg); writeLog({time:new Date().toLocaleString("pt-BR"),mode:EMAIL_ENDPOINT?EMAIL_ENDPOINT_MODE:"sem-endpoint",status:"bloqueado",size,error:calc.errors[0]}); return;}
    const payload={masterEmail:MASTER_EMAIL,playerEmail:calc.data.playerEmail||"",playerName:calc.data.playerName||"",pcName:calc.data.pcName||"",dossiêr:outputEl.value,source:"Heroe Forge - Conan Legacy",createdAt:new Date().toISOString()};
    if(!EMAIL_ENDPOINT){
      try{await navigator.clipboard?.writeText(outputEl.value);}catch{}
      statusText("Envio automático ainda não configurado. O dossiê foi copiado quando o navegador permitiu; configure o endpoint do Apps Script para envio real.");
      writeLog({time:new Date().toLocaleString("pt-BR"),mode:"sem-endpoint",status:"não configurado",size,error:"EMAIL_ENDPOINT vazio"});
      return;
    }
    if(EMAIL_ENDPOINT_MODE==="apps-script"){
      try{await fetch(EMAIL_ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)}); statusText("Solicitação enviada ao endpoint do Apps Script. O navegador não confirma a entrega do e-mail nesse modo; confira a caixa do Mestre e o log do Apps Script."); writeLog({time:new Date().toLocaleString("pt-BR"),mode:"apps-script",status:"solicitado",size});}
      catch(error){statusText(`Falha ao chamar o Apps Script: ${error.message}`); writeLog({time:new Date().toLocaleString("pt-BR"),mode:"apps-script",status:"falha",size,error:error.message});}
      return;
    }
    try{const res=await fetch(EMAIL_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); if(!res.ok)throw new Error(`HTTP ${res.status}`); statusText("Dossiê enviado ao Mestre com confirmação do endpoint."); writeLog({time:new Date().toLocaleString("pt-BR"),mode:"endpoint",status:"enviado",size});}
    catch(error){statusText(`Falha no envio pelo endpoint: ${error.message}`); writeLog({time:new Date().toLocaleString("pt-BR"),mode:"endpoint",status:"falha",size,error:error.message});}
  }
  function bindEnhancedEvents(){formEl.addEventListener("input",()=>setTimeout(enhancedUpdate,0)); formEl.addEventListener("change",()=>setTimeout(enhancedUpdate,0)); document.getElementById("download-output")?.addEventListener("click",downloadEnhanced,true); document.getElementById("copy-output")?.addEventListener("click",copyEnhanced,true); document.getElementById("send-master")?.addEventListener("click",sendDossiêr,true); document.getElementById("load-draft")?.addEventListener("click",()=>setTimeout(()=>{window.HeroeForgeEquipment?.restoreFromForm?.(); enhancedUpdate();},30)); document.getElementById("clear-form")?.addEventListener("click",()=>setTimeout(()=>{enhanceStaticUi(); enhancedUpdate();},30));}
  window.HeroeForgeValidation={update:enhancedUpdate,collect:collectCalc,enhance:enhanceStaticUi,status:statusText};
  enhanceStaticUi(); bindEnhancedEvents(); enhancedUpdate();
})();

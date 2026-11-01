const $=id=>document.getElementById(id);
const fmt=v=>v==null?"—":`${v}x`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const ALERT_STEPS=[8,9,10,11];
const BASELINE_KEY="lightning-ai-round-baseline-v1";
const SENT_KEY="lightning-ai-round-sent-v1";
let previousDistances=null;

function eventKey(s){
 return [s.time||"",s.number??"",s.multiplier??""].join("|");
}
function readStore(key,fallback){
 try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}
}
function writeStore(key,value){
 try{localStorage.setItem(key,JSON.stringify(value))}catch{}
}
function updateRoundRadar(spins){
 // CasinoScores rows are expected newest-first: index 0 is the latest spin.
 const events=spins.map((s,index)=>({spin:s,distance:index,key:eventKey(s)}))
   .filter(x=>x.spin.multiplier!=null && Number.isFinite(Number(x.spin.multiplier)) && Number(x.spin.multiplier)!==2);
 const current={};
 events.forEach(e=>current[e.key]=e.distance);
 const baseline=readStore(BASELINE_KEY,null);
 const sent=readStore(SENT_KEY,[]);
 const sentSet=new Set(sent);

 if(baseline){
  events.forEach(e=>{
   ALERT_STEPS.forEach(step=>{
    const oldDistance=baseline[e.key];
    if(oldDistance!=null && oldDistance<step && e.distance>=step && !sentSet.has(e.key+"#"+step)){
     const msg=`Raio ${e.spin.multiplier}x: chegou à ${step}ª rodada seguinte.`;
     if("Notification" in window && Notification.permission==="granted"){
      new Notification("LIGHTNING AI · ALERTA DE RODADA",{body:msg,tag:e.key+"#"+step});
     }
     sentSet.add(e.key+"#"+step);
    }
   });
  });
 }
 writeStore(SENT_KEY,Array.from(sentSet).slice(-500));
 writeStore(BASELINE_KEY,current);
 previousDistances=current;

 const active=events.filter(e=>e.distance<11);
 const host=$("roundAlerts");
 if(!active.length){
  host.innerHTML='<div class="empty">Nenhum multiplicador de raio recente aguardando as rodadas 8–11.</div>';
  return;
 }
 host.innerHTML=active.slice(0,12).map(e=>{
  const next=ALERT_STEPS.filter(n=>n>e.distance);
  const chips=ALERT_STEPS.map(n=>{
   const done=e.distance>=n;
   const remaining=n-e.distance;
   return `<span class="round-chip ${done?"done":remaining===1?"next":""}">${n}ª ${done?"CONCLUÍDA":`em ${remaining} giro(s)`}</span>`;
  }).join("");
  return `<div class="round-event"><div class="round-event-head"><b>${fmt(e.spin.multiplier)} <small>· ${esc(e.spin.time||"horário não informado")}</small></b><span> ${e.distance} giro(s) depois</span></div><div class="round-chips">${chips}</div></div>`;
 }).join("");
}
function enableNotifications(){
 if(!("Notification" in window)){
  $("notificationState").textContent="Este navegador não oferece notificações.";
  return;
 }
 Notification.requestPermission().then(permission=>{
  $("notificationState").textContent=permission==="granted"?"Notificações ativadas. Mantenha o site aberto para receber os alertas.": "Permissão de notificações não concedida.";
  $("enableAlerts").textContent=permission==="granted"?"NOTIFICAÇÕES ATIVAS":"TENTAR NOVAMENTE";
 });
}
function render(data){
 const spins=data.spins||[], high=spins.filter(s=>s.multiplier>=600&&s.multiplier<=2000);
 const max=spins.reduce((m,s)=>Math.max(m,s.multiplier||0),0);
 $("total").textContent=spins.length;
 $("hits").textContent=high.length;
 $("max").textContent=max?fmt(max):"—";
 $("updated").textContent=new Date(data.updatedAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
 $("connection").textContent="FONTE CONECTADA";
 document.querySelector(".source-dot").classList.add("ok");
 $("sourceState").textContent="Histórico recebido";
 $("notice").innerHTML=`<span class="notice-icon">✓</span>${esc(data.warning||"Consulta concluída. Nova atualização automática programada para daqui a 35 segundos.")}`;
 $("highlights").innerHTML=high.length?`<div class="highlights">${high.slice(0,12).map(s=>`<div class="highlight"><b>${fmt(s.multiplier)}</b><small>Número ${s.number} · ${esc(s.time||"horário não informado")}</small></div>`).join("")}</div>`:`<div class="empty">Nenhum multiplicador entre 600x e 2.000x foi identificado no histórico recebido.</div>`;
 updateRoundRadar(spins);
 $("history").innerHTML=spins.filter(s=>Number(s.multiplier)!==2).slice(0,30).map(s=>{const hit=s.multiplier>=600&&s.multiplier<=2000;return `<tr class="${hit?"hitrow":""}"><td>${esc(s.time||"—")}</td><td><span class="number ${s.number===0?"zero":""}">${s.number}</span></td><td class="mult">${fmt(s.multiplier)}</td><td class="${hit?"hitstatus":"status"}">${hit?"ϟ RAIO ALTO":"HISTÓRICO"}</td></tr>`}).join("")||`<tr><td colspan="4" class="empty">Nenhum giro reconhecido pela fonte.</td></tr>`;
}
async function load(){
 const b=$("refresh");b.disabled=true;b.innerHTML="↻ <span>CONSULTANDO</span>";
 try{const r=await fetch("/api/spins",{cache:"no-store"}),d=await r.json();if(!r.ok)throw Error(d.error||"Falha ao consultar a fonte");render(d)}
 catch(e){$("connection").textContent="FONTE INDISPONÍVEL";$("sourceState").textContent="Aguardando acesso à fonte";$("notice").innerHTML=`<span class="notice-icon">!</span>${esc("Não foi possível ler o histórico automaticamente: "+e.message)}`;document.querySelector(".source-dot").classList.remove("ok")}
 finally{b.disabled=false;b.innerHTML="↻ <span>ATUALIZAR</span>"}
}
$("refresh").addEventListener("click",load);load();setInterval(load,35000);

$("enableAlerts").addEventListener("click",enableNotifications);
if("Notification" in window && Notification.permission==="granted") $("notificationState").textContent="Notificações ativadas. Mantenha o site aberto para receber os alertas.";

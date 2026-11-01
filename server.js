const express=require('express'), cheerio=require('cheerio');
const app=express(), PORT=process.env.PORT||3000;
const SOURCE='https://www.casino.org/casinoscores/pt-br/xxxtreme-lightning-roulette/';
let cache={at:0,spins:null,error:null};
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function parse(html){
 const $=cheerio.load(html); let out=[];
 $('table tbody tr').each((_,tr)=>{
  const c=$(tr).find('td').map((i,e)=>clean($(e).text())).get();
  if(c.length<2)return;
  const n=c.map(x=>x.match(/^(0|[1-9]|[12]\\d|3[0-6])$/)).find(Boolean);
  const mm=c.join(' ').match(/(\\d[\\d.,]*)\\s*[x×]/i);
  const tm=c.find(x=>/\\d{1,2}[:h]\\d{2}/.test(x))||'';
  if(n)out.push({time:tm,number:Number(n[0]),multiplier:mm?Number(mm[1].replace(/[.,]/g,'')):null});
 });
 const seen=new Set(); return out.filter(x=>{let k=JSON.stringify(x);if(seen.has(k))return false;seen.add(k);return true;});
}
app.use(express.static('public'));
app.get('/api/status',(q,s)=>s.json({service:'Lightning AI',source:SOURCE,lastSuccess:cache.at?new Date(cache.at).toISOString():null,error:cache.error}));
app.get('/api/spins',async(q,s)=>{
 if(cache.spins&&Date.now()-cache.at<35000)return s.json({updatedAt:new Date(cache.at).toISOString(),source:SOURCE,spins:cache.spins});
 try{
  const r=await fetch(SOURCE,{headers:{'user-agent':'Mozilla/5.0','accept-language':'pt-BR,pt;q=0.9,en;q=0.8'},signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('CasinoScores respondeu HTTP '+r.status);
  const spins=parse(await r.text());
  if(!spins.length)throw Error('Não foi possível identificar a tabela. A página pode ter mudado ou carregar dados por JavaScript.');
  cache={at:Date.now(),spins,error:null};
  s.json({updatedAt:new Date(cache.at).toISOString(),source:SOURCE,spins});
 }catch(e){cache.error=e.message;if(cache.spins)s.json({updatedAt:new Date(cache.at).toISOString(),source:SOURCE,spins:cache.spins,warning:'Falha na atualização; mostrando o último histórico recebido.'});else s.status(502).json({error:e.message,source:SOURCE});}
});
app.get('*',(q,s)=>s.sendFile(require('path').join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log('Lightning AI ativo na porta '+PORT));

'use strict';
// ===== Carnet de route entre les étapes, fins, crédenciale (image et PDF) =====
let TV=null;
function tryExit(){
 if(S.flags.sick){P.x-=10;toast(tt('ui.notMateo'));return;}
 if(S.flags.goatFollow){P.x-=10;toast(tt('ui.goatFirst'));return;}
 const D=W.D;if(!D.travel){P.x-=6;return;}
 mode='travel';$('prompt').hidden=true;TV={from:S.stage,to:S.stage+1,days:D.travel,k:0,t:-.4,wait:false,done:false,used:{}};
 $('tvEy').textContent=tt('tv.ey');$('tvTitle').textContent=tt('tv.title',{x:tt('st.'+STAGES[TV.to].id)});$('tvLog').innerHTML='';$('tvChoice').innerHTML='';
 $('tvBtn').textContent=tt('tv.skip');$('tvBtn').onclick=travelAction;$('travel').hidden=false;drawTvMap();}
function travelAction(){if(!TV)return;if(TV.done){$('travel').hidden=true;const to=TV.to;TV=null;S.hour=13;loadStage(to);return;}if(!TV.wait)TV.t=99;}
function travelUpdate(dt){if(!TV||TV.wait||TV.done)return;TV.t+=dt;if(TV.t>=.8){TV.t=0;travelDay();}}
function tvLine(html){const li=document.createElement('li');li.innerHTML=html;$('tvLog').appendChild(li);const L=$('tvLog');L.scrollTop=L.scrollHeight;}
function tvAsk(text,opts){TV.wait=true;const box=$('tvChoice');box.innerHTML='<p>'+text+'</p>';const row=document.createElement('div');row.className='tvopts';
 opts.forEach((o,k)=>{const b=document.createElement('button');b.textContent=o.t;if(k===0)b.className='primary';b.onclick=()=>{box.innerHTML='';TV.wait=false;o.f&&o.f();};row.appendChild(b);});box.appendChild(row);}
function drawTvMap(){const c=$('tvMap'),x=c.getContext('2d'),R=rectFn(x);x.clearRect(0,0,c.width,c.height);const n=16,w=c.width-20;
 R(10,19,w,2,'#c9a26b');for(let i=0;i<n;i++){const X=10+w*i/(n-1);R(X-2,17,5,6,i<=S.stage?'#5aa844':'#8a6a4a');}
 const p=TV?(TV.from+TV.k/TV.days):S.stage,X=10+w*p/(n-1);R(X-3,8,7,7,'#c8392b');R(X-1,15,3,3,'#c8392b');
 x.fillStyle='#5a3a22';x.font='9px "Pixelify Sans", monospace';x.fillText('Strasbourg',4,36);x.textAlign='right';x.fillText('Santiago',c.width-4,36);x.textAlign='left';}
function travelDay(){
 TV.k++;const hs=humans(),ps=party(),D=STAGES[TV.from];
 const kmA=D.km+(STAGES[TV.to].km-D.km)*(TV.k-1)/TV.days,kmB=D.km+(STAGES[TV.to].km-D.km)*TV.k/TV.days;
 let walk=30;if(S.eq.main==='baton')walk*=.75;if(ill('ampoules'))walk*=1.3;if(ill('fievre'))walk*=1.5;S.energy=Math.max(0,S.energy-walk);
 const auto=[];if(ill('rhume')&&has('sirop')){useItem('sirop');auto.push(tt('tv.useSirop'));}if(ill('fievre')&&has('remede')){useItem('remede');auto.push(tt('tv.useRemede'));}
 if((ill('ampoules')||ill('piqure'))&&has('baume')){useItem('baume');auto.push(tt('tv.useBaume'));}
 const date='<b>'+dateStr(S.day)+'</b> — ';
 const msgs=newDay('travel');if(msgs===null){$('travel').hidden=true;return;}
 S.hour=8;drawTvMap();refreshHUD();
 const {m,dd}=dateParts(S.day);const pick=a=>a[(Math.random()*a.length)|0];
 const after=()=>{for(const a of auto)tvLine('<span class="sub">'+a+'</span>');for(const ms of msgs)tvLine('<span class="bad">'+ms+'</span>');if(S.moral<=0){$('travel').hidden=true;showEnd('abandon');return true;}if(TV.k>=TV.days){TV.done=true;$('tvBtn').textContent=tt('tv.arrive',{x:tt('st.'+STAGES[TV.to].id)});}return false;};
 const cel=(kind)=>{tvLine(date+tt('cel.'+kind+'.x',{c:hs.map(i=>tt('n.'+i)).join(', ')}));if(!ps.length){moral(6);tvLine(tt('cel.soloShort'));log('cel_'+kind);after();return;}
  tvAsk(tt('cel.how'),[{t:tt('o.dance'),f:()=>{moral(12);for(const id of ps)aff(id,COMP[id].pref.dance||5);tvLine(tt('cel.r.dance'));log('cel_'+kind);S.stats.celebs++;after();}},
   {t:tt('o.feast',{n:ps.length+1}),f:()=>{const n=ps.length+1;if(foodCount()<n){moral(4);tvLine(tt('cel.r.nofood'));}else{eatShared(n);moral(18);for(const id of ps)aff(id,(COMP[id].pref.meal||5)+4);tvLine(tt('cel.r.feast'));}log('cel_'+kind);S.stats.celebs++;after();}},
   {t:tt('o.sing'),f:()=>{$('travel').hidden=true;startMini('song',{},sc=>{mode='travel';$('travel').hidden=false;moral(Math.round(6+14*sc));for(const id of ps)aff(id,Math.round((COMP[id].pref.sing||4)*(.5+sc)));tvLine(tt('ui.songDone',{p:Math.round(sc*100)}));log('cel_'+kind);S.stats.celebs++;after();});}}]);};
 if(m===2&&dd===24&&!S.flags.stjean){S.flags.stjean=1;cel('saintjean');return;}
 if(kmA<1000&&kmB>=1000&&!S.flags.half){S.flags.half=1;cel('half');return;}
 if(m===1&&dd===1){tvLine(date+tt('tv.muguet'));after();return;}
 const r=Math.random();
 if(r<.13&&!TV.used.rain){TV.used.rain=1;tvLine(date+tt('tv.rain.x'));tvAsk(tt('tv.rain.q'),[{t:tt('tv.rain.a'),f:()=>{S.day++;S.energy=Math.min(energyCap(),S.energy+10);tvLine(tt('tv.rain.ra'));after();}},{t:tt('tv.rain.b'),f:()=>{if(!S.prot.rhume&&Math.random()<.45){S.ill.rhume={d:0};tvLine('<span class="bad">'+tt('h.rhume.got')+'</span>');}else tvLine(tt('tv.rain.rb'));after();}}]);return;}
 if(r<.22&&!TV.used.share&&foodCount()){TV.used.share=1;tvLine(date+tt('tv.share.x'));tvAsk(tt('tv.share.q'),[{t:tt('tv.share.a'),f:()=>{eatShared(1);moral(10);tvLine(tt('tv.share.ra'));log('share');after();}},{t:tt('tv.share.b'),f:()=>{moral(-3);tvLine(tt('tv.share.rb'));after();}}]);return;}
 if(r<.3&&!TV.used.blis&&S.eq.main!=='baton'){TV.used.blis=1;tvLine(date+tt('tv.blis.x'));tvAsk(tt('tv.blis.q'),[{t:tt('tv.blis.a'),f:()=>{S.day++;S.energy=Math.min(energyCap(),S.energy+20);tvLine(tt('tv.blis.ra'));after();}},{t:tt('tv.blis.b'),f:()=>{if(!S.prot.ampoules&&Math.random()<.6){S.ill.ampoules={d:0};tvLine('<span class="bad">'+tt('h.ampoules.got')+'</span>');}else tvLine(tt('tv.blis.rb'));after();}}]);return;}
 let line;if(hs.length&&Math.random()<.6){const c=hs[(Math.random()*hs.length)|0];line=fill(pick(tl('tv.duo')),{c:tt('n.'+c)});aff(c,2);}
 else if(ps.includes('chien')&&Math.random()<.5)line=pick(tl('tv.dog'));
 else line=pick(tl('tv.solo'));
 tvLine(date+line);after();}

// ---------- Fins ----------
function showEnd(kind){mode='end';$('prompt').hidden=true;$('dlg').hidden=true;$('cardWrap').hidden=true;$('travel').hidden=true;S.flags.ending=kind;
 const qd=Object.values(S.quests).filter(v=>v==='done').length,s=S.stats;
 const stats='<ul class="endstats"><li><b>'+(S.day+1)+'</b> '+tt('end.days')+'</li><li><b>'+qd+'</b> '+tt('end.quests')+'</li><li><b>'+Object.keys(S.seen).length+'</b> '+tt('end.animals')+'</li><li><b>'+Object.keys(S.plants).length+'</b> '+tt('end.plants')+'</li><li><b>'+s.cards+'</b> '+tt('end.cards')+'</li></ul>';
 const cred={t:tt('cr.see'),f:()=>credView(kind)};let h='',btns=[];
 if(kind==='compostelle'){h='<p class="eyebrow">'+tt('end.c.ey')+'</p><h2>'+tt('end.c.t')+'</h2><p>'+tt('end.c.x',{d:dateStr(S.day)})+'</p>'+stats;btns=[cred];
  if(S.flags.finis)btns.push({t:tt('end.c.go'),f:()=>{S.day+=4;closeScreen();S.hour=9;loadStage(16);}});else h+='<p class="hint">'+tt('end.c.hint')+'</p>';
  btns.push({t:tt('end.restart'),f:titleScreen});}
 else if(kind==='finis'){h='<p class="eyebrow">'+tt('end.f.ey')+'</p><h2>'+tt('end.f.t')+'</h2><p>'+tt('end.f.x')+'</p>'+(S.quests.collier==='done'?'<p>'+tt('end.f.rosa')+'</p>':'')+'<p>'+tt('end.f.y')+'</p>'+stats;btns=[cred,{t:tt('end.restart'),f:titleScreen}];}
 else if(kind==='abandon'||kind==='fever'){h='<p class="eyebrow">'+tt('end.a.ey')+'</p><h2>'+tt('end.a.t')+'</h2><p>'+tt(kind==='fever'?'end.a.fever':'end.a.moral')+'</p><p>'+tt('end.a.y')+'</p>'+stats;btns=[{t:tt('end.retry'),f:retryStage},cred,{t:tt('end.restart'),f:titleScreen}];}
 else if(kind==='lost'){h='<p class="eyebrow">'+tt('end.l.ey')+'</p><h2>'+tt('end.l.t')+'</h2><p>'+tt('end.l.x')+'</p>';btns=[{t:tt('end.retry'),f:retryStage}];}
 screen(h,btns,kind);}
function retryStage(){S=JSON.parse(snap);closeScreen();loadStage(S.stage);}

// ---------- Crédenciale ----------
const CR_KEYS=['depart','log','climb','join_noe','race','ford','fire','camp','stars','song','truite','clochette','odile','hansStick','join_hans','chat','noeBye','chevre','dog','noix','cave','rosaStart','join_mateo','hansBye','storm','cel_border','join_lucia','cel_half','cel_saintjean','mateoSaved','cruz','wolf','wolfDog','cel_galice','faint','ill_fievre','share','gift','arrive','rosa','rel_noe','rel_hans','rel_mateo','rel_lucia'];
function credStory(){const out=[],seen={};for(const e of S.log){if(!CR_KEYS.includes(e.k)||seen[e.k])continue;seen[e.k]=1;const v=Object.assign({place:tt('st.'+STAGES[e.st].id)},e.v);if(e.k.startsWith('rel_'))v.r=tt('rel.'+e.k.slice(4)+'.'+(e.v.r||'a'));if(e.v.n)v.n=tt('n.'+e.v.n);out.push({d:e.d,st:e.st,s:fill(tr('cr.'+e.k),v)});}return out.slice(0,22);}
function wrapText(c,s,maxW){const words=s.split(' '),lines=[];let l='';for(const w of words){const tst=l?l+' '+w:w;if(c.measureText(tst).width>maxW&&l){lines.push(l);l=w;}else l=tst;}if(l)lines.push(l);return lines;}
const INK=['#2f4f8a','#a0332a','#5a3a7a','#2f6b3a','#7a4a1e','#1f5a6a'];
const STAMPS={
 cathedrale:['.......x........','.......x........','......xxx.......','......xxx.......','.....xxxxx......','.....x.x.x......','.....xxxxx......','....xxxxxxx.....','....x.xxx.x.....','....xxxxxxx.....','..xxxxxxxxxxx...','..x.xx.x.xx.x...','..xxxxxxxxxxx...','..xx.xx.xx.xx...','..xx.xx.xx.xx...','..xxxxxxxxxxx...'],
 sapin:['.......x........','......xxx.......','.....xxxxx......','......xxx.......','.....xxxxx......','....xxxxxxx.....','.....xxxxx......','....xxxxxxx.....','...xxxxxxxxx....','....xxxxxxx.....','...xxxxxxxxx....','..xxxxxxxxxxx...','.......x........','.......x........','.......x........','................'],
 montagne:['................','.......x........','......xxx.......','.....xx.xx......','....xx...xx.....','...xx..x..xx....','..xx..xxx..xx...','.xx..xx.xx..xx..','xx..xx...xx..xx.','x..xx.....xx..x.','..xx.......xx...','.xx.........xx..','xxxxxxxxxxxxxxx.','................','................','................'],
 eau:['................','................','.xx...xx...xx...','x..x.x..x.x..x..','....x....x....x.','................','.xx...xx...xx...','x..x.x..x.x..x..','....x....x....x.','................','.xx...xx...xx...','x..x.x..x.x..x..','....x....x....x.','................','................','................'],
 foret:['.....xxxxx......','...xxxxxxxxx....','..xxxxxxxxxxx...','.xxxxxxxxxxxxx..','.xxxxxxxxxxxxx..','.xxxxxxxxxxxxx..','..xxxxxxxxxxx...','...xxxxxxxxx....','.....xx.xx......','......xxx.......','......xxx.......','......xxx.......','......xxx.......','.....xxxxx......','....xxxxxxx.....','................'],
 basilique:['..xxx...........','..xxx...........','.xxxxx..........','.xxxxx..........','.x.x.x..........','.xxxxxxxxxxxxx..','.xxxxxxxxxxxxx..','.xxx.x.x.x.x.x..','.xxxxxxxxxxxxx..','.xx..xxxxxxxxx..','.x....xxxxxxxx..','.x....xx.x.x.x..','.x....xxxxxxxx..','.xxxxxxxxxxxxx..','................','................'],
 grotte:['................','................','.....xxxxx......','...xxxxxxxxx....','..xxx.....xxx...','.xxx.......xxx..','.xx.........xx..','xxx..x...x..xxx.','xx..xxx.xxx..xx.','xx...x...x...xx.','xx...........xx.','xx...........xx.','xxxxxxxxxxxxxxx.','................','................','................'],
 pin:['...xxxxxxxxx....','.xxxxxxxxxxxxx..','xxxxxxxxxxxxxxx.','.xxxxxxxxxxxxx..','....xxxxxxx.....','.......x........','.......x........','.......x........','.......x........','.......x........','.......x........','.......x........','......xxx.......','.....xxxxx......','................','................'],
 soleil:['.......x........','..x....x....x...','...x...x...x....','....x.....x.....','......xxx.......','.....xxxxx......','xxx.xxxxxxx.xxx.','.....xxxxx......','......xxx.......','....x.....x.....','...x...x...x....','..x....x....x...','.......x........','................','................','................'],
 croix:['......xxx.......','......xxx.......','..xxxxxxxxxxx...','..xxxxxxxxxxx...','......xxx.......','......xxx.......','......xxx.......','......xxx.......','......xxx.......','......xxx.......','.....xx.xx......','....x..x..x.....','...x.x...x.x....','..x...x.x...x...','.xxxxxxxxxxxxx..','................'],
 phare:['......xxx.......','.....xxxxx......','.....x.x.x......','.....xxxxx......','......xxx.......','......xxx.......','.....xxxxx......','.....x...x......','.....xxxxx......','.....x...x......','....xxxxxxx.....','....x.....x.....','....xxxxxxx.....','.xx...........xx','x..xx.......xx..','.....xxxxxxx....']};
STAMPS.fleuve=STAMPS.eau;
function stampSymbol(c,kind,x,y,col){c.fillStyle=col;const m=STAMPS[kind];
 if(m){m.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='x')c.fillRect(Math.round(x-16+i*2),Math.round(y-16+j*2),2,2);});return;}
 const ic={chataigne:'chataigne',coquille:'coquillage',raisin:'myrtilles'}[kind]||'coquillage';
 const t=mk(8,8),tx=t.getContext('2d');tx.drawImage(iconCanvas(ic,1),0,0);tx.globalCompositeOperation='source-in';tx.fillStyle=col;tx.fillRect(0,0,8,8);c.imageSmoothingEnabled=false;c.drawImage(t,x-16,y-16,32,32);}
function drawStamp(c,cx,cy,r,col,label,date,kind,rot){c.save();c.translate(cx,cy);c.rotate(rot);c.globalAlpha=.82;c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.arc(0,0,r,0,7);c.stroke();c.lineWidth=1.5;c.beginPath();c.arc(0,0,r-7,0,7);c.stroke();
 c.fillStyle=col;c.font='bold 11px "Pixelify Sans", monospace';c.textAlign='center';const L=label.toUpperCase(),sp=Math.min(.17,3.2/L.length);for(let i=0;i<L.length;i++){const a=-Math.PI/2+(i-(L.length-1)/2)*sp;c.save();c.rotate(a+Math.PI/2);c.fillText(L[i],0,-r+16);c.restore();}
 stampSymbol(c,kind,0,-2,col);c.font='10px "Pixelify Sans", monospace';c.fillText(date,0,r-14);c.restore();}
function renderCredential(kind){
 const Wd=900,pad=56,story=credStory(),comps=COMP_ORDER.filter(id=>S.comp[id]);
 const tmp=mk(10,10).getContext('2d');tmp.font='17px "Pixelify Sans", monospace';let storyLines=0;const storyW=[];for(const e of story){const L=wrapText(tmp,e.s,Wd-pad*2-150);storyW.push(L);storyLines+=L.length;}
 const stRows=Math.ceil(Math.max(S.stamps.length,4)/4);
 const Hh=330+stRows*150+80+storyLines*24+story.length*14+(comps.length?90+comps.length*44:0)+190+260;
 const c=mk(Wd,Hh),x=c.getContext('2d'),R=rectFn(x);
 R(0,0,Wd,Hh,'#f4e4bc');const rr=rng(9);for(let k=0;k<2400;k++)R(rr()*Wd,rr()*Hh,2,2,rr()<.5?'rgba(160,120,60,.08)':'rgba(255,255,255,.18)');
 x.strokeStyle='#8a5a33';x.lineWidth=4;x.strokeRect(18,18,Wd-36,Hh-36);x.lineWidth=1.5;x.strokeRect(28,28,Wd-56,Hh-56);
 x.textAlign='center';x.fillStyle='#8a5a33';x.font='15px "Pixelify Sans", monospace';x.fillText('CREDENCIAL DEL PEREGRINO',Wd/2,72);
 x.fillStyle='#6b2e10';x.font='54px "Jacquard 24", "Pixelify Sans", serif';x.fillText(tt('cr.title'),Wd/2,128);
 x.fillStyle='#3f2410';x.font='bold 30px "Pixelify Sans", monospace';x.fillText(S.name,Wd/2,176);
 x.font='17px "Pixelify Sans", monospace';x.fillStyle='#7a5634';
 const route=kind==='finis'?'Strasbourg → Santiago → Fisterra':kind==='compostelle'?'Strasbourg → Santiago de Compostela':'Strasbourg → '+tt('st.'+STAGES[S.stage].id);
 const km=kind==='finis'?KM_FINIS:kind==='compostelle'?KM_END:STAGES[S.stage].km;
 x.fillText(route,Wd/2,208);x.fillText(tt('cr.dates',{a:dateStr(0),b:dateStr(S.day),n:S.day+1,k:km}),Wd/2,234);
 x.drawImage(iconCanvas('coquilleh',5),Wd/2-20,252);
 let y=330;x.textAlign='left';x.fillStyle='#6b2e10';x.font='bold 20px "Pixelify Sans", monospace';x.fillText(tt('cr.stamps'),pad,y-12);R(pad,y-4,Wd-pad*2,2,'#c9a26b');
 const cw=(Wd-pad*2)/4;for(let k=0;k<stRows*4;k++){const s=S.stamps[k],cx=pad+cw*(k%4)+cw/2,cy=y+75+Math.floor(k/4)*150;
  if(s)drawStamp(x,cx,cy,58,INK[k%INK.length],tt('st.'+STAGES[s.st].id).slice(0,24),dateStr(s.d),STAGES[s.st].stamp,(hash(k,3)-.5)*.5);
  else{x.setLineDash([6,6]);x.strokeStyle='rgba(138,90,51,.35)';x.lineWidth=2;x.strokeRect(cx-58,cy-58,116,116);x.setLineDash([]);}}
 y+=stRows*150+60;x.fillStyle='#6b2e10';x.font='bold 20px "Pixelify Sans", monospace';x.fillText(tt('cr.story'),pad,y);R(pad,y+8,Wd-pad*2,2,'#c9a26b');y+=42;
 story.forEach((e,k)=>{x.fillStyle='#8a5a33';x.font='bold 14px "Pixelify Sans", monospace';x.fillText(dateStr(e.d),pad,y);x.font='12px "Pixelify Sans", monospace';x.fillStyle='#a07a52';x.fillText(tt('st.'+STAGES[e.st].id),pad,y+16);
  x.fillStyle='#3f2410';x.font='17px "Pixelify Sans", monospace';storyW[k].forEach((l,j)=>x.fillText(l,pad+150,y+j*24));y+=storyW[k].length*24+14;});
 if(comps.length){y+=30;x.fillStyle='#6b2e10';x.font='bold 20px "Pixelify Sans", monospace';x.fillText(tt('cr.comps'),pad,y);R(pad,y+8,Wd-pad*2,2,'#c9a26b');y+=40;
  for(const id of comps){const im=new Image();const pc=mk(16,24),pcx=pc.getContext('2d');if(id==='chien')drawAnimal(pcx,'chien',8,20,1,0);else drawChar(pcx,8,22,LOOKS[COMP[id].look],'down',0);x.imageSmoothingEnabled=false;x.drawImage(pc,pad,y-30,24,36);
   x.fillStyle='#3f2410';x.font='bold 18px "Pixelify Sans", monospace';x.fillText(tt('n.'+id),pad+40,y-8);x.font='16px "Pixelify Sans", monospace';x.fillStyle='#7a5634';x.fillText(relTitle(id),pad+40,y+12);
   const a=S.comp[id].aff;for(let k=0;k<10;k++){x.fillStyle=a>=(k+1)*10?'#c8392b':'rgba(160,51,42,.2)';const hx=Wd-pad-200+k*20,hy=y-10;x.beginPath();x.arc(hx-3,hy,4,0,7);x.arc(hx+3,hy,4,0,7);x.fill();x.beginPath();x.moveTo(hx-7,hy+1);x.lineTo(hx,hy+9);x.lineTo(hx+7,hy+1);x.fill();}y+=44;}}
 y+=30;x.fillStyle='#6b2e10';x.font='bold 20px "Pixelify Sans", monospace';x.fillText(tt('cr.nature'),pad,y);R(pad,y+8,Wd-pad*2,2,'#c9a26b');y+=40;
 x.fillStyle='#3f2410';x.font='17px "Pixelify Sans", monospace';x.fillText(tt('cr.natureX',{a:Object.keys(S.seen).length,p:Object.keys(S.plants).length,q:Object.values(S.quests).filter(v=>v==='done').length}),pad,y);y+=26;
 let ix=pad;const imgs=JOURNAL_ANIMALS.filter(a=>S.seen[a]);
 for(const a of imgs){const pc=mk(26,20),pcx=pc.getContext('2d');if(a==='papillon')drawButterfly(pcx,13,12,2,.01);else if(a==='libellule')drawDragonfly(pcx,13,10,0);else if(a==='vautour')drawVulture(pcx,13,9,0);else if(a==='truite')pcx.drawImage(iconCanvas('truite',2),5,3);else{const cv=animalCanvas(a,0);pcx.drawImage(cv,(26-cv.width)/2|0,(20-cv.height)/2|0);}x.drawImage(pc,ix,y,52,40);ix+=56;if(ix>Wd-pad-52){ix=pad;y+=44;}}
 y+=70;const seal=kind==='finis'?'Fisterra':kind==='compostelle'?'Compostela':tt('cr.unfinished');
 x.save();x.translate(Wd-pad-110,y+40);x.rotate(-.12);x.strokeStyle='#a0332a';x.lineWidth=4;x.beginPath();x.arc(0,0,92,0,7);x.stroke();x.lineWidth=2;x.beginPath();x.arc(0,0,80,0,7);x.stroke();x.fillStyle='#a0332a';x.textAlign='center';x.font='36px "Jacquard 24", serif';x.fillText(seal,0,10);x.font='12px "Pixelify Sans", monospace';x.fillText(dateStr(S.day),0,40);x.restore();
 x.textAlign='left';x.fillStyle='#7a5634';x.font='16px "Pixelify Sans", monospace';wrapText(x,tt(kind==='finis'?'cr.endF':kind==='compostelle'?'cr.endC':'cr.endA',{name:S.name}),Wd-pad*2-260).forEach((l,j)=>x.fillText(l,pad,y+j*22));
 x.textAlign='center';x.fillStyle='#a07a52';x.font='13px "Pixelify Sans", monospace';x.fillText(tt('ui.title'),Wd/2,Hh-44);
 return c;}
let credCanvas=null;
function credView(kind){credCanvas=renderCredential(kind);const url=credCanvas.toDataURL('image/png');
 screen('<p class="eyebrow">'+tt('cr.ey')+'</p><h2>'+tt('cr.title')+'</h2><div class="credimg"><img src="'+url+'" alt="'+tt('cr.title')+'"></div><p class="sub">'+tt('cr.tip')+'</p>',[
  {t:tt('cr.png'),f:()=>credCanvas.toBlob(b=>saveFile(fileBase()+'.png',b),'image/png')},
  {t:tt('cr.pdf'),f:()=>{const d=credCanvas.toDataURL('image/jpeg',.9),bin=atob(d.split(',')[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);saveFile(fileBase()+'.pdf',makePDF(u,credCanvas.width,credCanvas.height));}},
  {t:tt('cr.back'),f:()=>showEnd(kind)}],'cred');}
function fileBase(){return 'credenciale-'+(S.name||'pelerine').normalize('NFD').replace(/[^\w-]/g,'').toLowerCase();}
async function saveFile(name,blob){
 if(window.claude&&typeof window.claude.use==='function'){try{const d=await window.claude.use('downloads');if(d){await d.save({filename:name,data:blob});toast(tt('cr.saved'));return;}}catch(e){if(e&&e.code==='declined')return;toast(tt('cr.saveFail'));return;}}
 try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},3000);}catch(e){toast(tt('cr.saveFail'));}}
function makePDF(jpg,w,h){const PW=595.28,PH=PW*h/w,enc=s=>new TextEncoder().encode(s),parts=[],xr=[];let off=0;
 const push=b=>{parts.push(b);off+=b.length;},obj=(n,body)=>{xr[n]=off;push(enc(n+' 0 obj\n'));(Array.isArray(body)?body:[enc(body)]).forEach(push);push(enc('\nendobj\n'));};
 push(enc('%PDF-1.4\n'));obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW.toFixed(2)+' '+PH.toFixed(2)+'] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
 obj(4,[enc('<< /Type /XObject /Subtype /Image /Width '+w+' /Height '+h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n'),jpg,enc('\nendstream')]);
 const cs='q '+PW.toFixed(2)+' 0 0 '+PH.toFixed(2)+' 0 0 cm /Im0 Do Q';obj(5,'<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream');
 const xo=off;let xs='xref\n0 6\n0000000000 65535 f \n';for(let n=1;n<=5;n++)xs+=String(xr[n]).padStart(10,'0')+' 00000 n \n';xs+='trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xo+'\n%%EOF';push(enc(xs));
 return new Blob(parts,{type:'application/pdf'});}

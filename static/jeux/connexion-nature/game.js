'use strict';
// ===== Moteur : état, temps, joueuse, santé, animaux, compagnons, campement =====
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const HOUR_S=16,SAVEKEY='connexion-nature-v2',MLEN=[30,31,30,31,31,30];
let S=null,W=null,mode='title',MINI=null,DQ=null,time=0,snap=null,near=null,shake=0;
const inp={l:0,r:0,u:0,d:0,run:0,runT:0};
const P={x:20,y:120,z:0,vz:0,dir:'right',frame:0,anim:0,moving:0,inv:0,trail:[],sx:20,sy:120,running:0};
for(const k in NPCS)NPCS[k].id=k;

function dateParts(d){let m=0,dd=d+1;while(m<5&&dd>MLEN[m]){dd-=MLEN[m];m++;}return{m,dd};}
function dateStr(d){const{m,dd}=dateParts(d);return fill(tr('fmt.date'),{d:dd===1?tr('fmt.first'):dd,m:tr('mo')[m]});}
function hourStr(h){const hh=Math.floor(h)%24,mm=Math.floor((h%1)*4)*15;return hh+':'+(mm<10?'0':'')+mm;}
function newState(name){return{v:2,name:name||'Lou',stage:0,day:0,hour:8,energy:100,moral:80,inv:{},quests:{},flags:{},comp:{},ill:{},prot:{},eq:{main:null,cou:null,tete:null},skills:{},seen:{},plants:{},stamps:[],log:[],
 stats:{gifts:0,cards:0,jumps:0,faints:0,camps:0,songs:0,celebs:0,races:0,climbs:0,fords:0},sun:0,lastCard:-1,replied:-1,letterN:0,runDist:0};}
function save(){try{localStorage.setItem(SAVEKEY,JSON.stringify(S));}catch(e){}}

// ---------- Inventaire, santé, compagnons ----------
const has=(id,n=1)=>(S.inv[id]||0)>=n;
function add(id,n=1,quiet){S.inv[id]=(S.inv[id]||0)+n;if(!quiet)toast('+'+n+' '+tt('it.'+id),id);}
function take(id,n=1){S.inv[id]=Math.max(0,(S.inv[id]||0)-n);if(!S.inv[id]){delete S.inv[id];for(const s in S.eq)if(S.eq[s]===id)S.eq[s]=null;}}
function foodCount(){return FOODS.reduce((a,f)=>a+(S.inv[f]||0),0);}
function eatShared(n){let k=n;for(const f of FOODS.slice().reverse()){while(k>0&&has(f)){take(f);k--;}}return n-k;}
const party=()=>COMP_ORDER.filter(id=>S.comp[id]&&S.comp[id].st==='party'&&!(id==='mateo'&&S.flags.sick));
const humans=()=>party().filter(id=>id!=='chien');
function compMet(id){if(!S.comp[id])S.comp[id]={st:'met',aff:10};}
function joinComp(id){compMet(id);S.comp[id].st='party';P.trail=[];toast(tt('ui.joins',{n:tt('n.'+id)}));log('join_'+id);moral(10);}
function leaveComp(id){if(S.comp[id])S.comp[id].st='left';}
function aff(id,n){const c=S.comp[id];if(!c)return;const b=c.aff;c.aff=clamp(c.aff+n,0,100);if(n>0&&Math.floor(b/10)<Math.floor(c.aff/10))toast(tt('ui.heart',{n:tt('n.'+id)}));}
function relTitle(id){const c=S.comp[id];if(!c)return'';if(c.aff>=80&&c.rel)return tt(id==='chien'?'rel.chien':'rel.'+id+'.'+c.rel);const n=c.aff<20?0:c.aff<50?1:2,L=LANG[LG]||{};return tt(('rel.t'+n+'.'+id) in L?'rel.t'+n+'.'+id:'rel.t'+n);}
const compWho=id=>NPCS[id]||{id,dog:1};
const ill=n=>!!S.ill[n];
const ILLICON={ampoules:'baume',piqure:'plantain',rhume:'sirop',insolation:'chapeau',fievre:'remede'};
function getIll(n,quiet){if(S.ill[n])return;if((n==='ampoules'||n==='rhume')&&S.prot[n]>0){toast(tt('h.protected'));return;}S.ill[n]={d:0};log('ill_'+n);
 if(!quiet)openCard({title:tt('h.'+n),icon:ILLICON[n],html:'<p>'+tt('h.'+n+'.got')+'</p><p class="sub">'+tt('h.'+n+'.cure')+'</p>',buttons:[{t:tt('o.ok')}]});refreshHUD();}
function cure(n){if(!S.ill[n])return false;delete S.ill[n];toast(tt('h.cured',{x:tt('h.'+n)}));refreshHUD();return true;}
function energyCap(){let c=100;if(ill('fievre'))c=50;else if(ill('insolation'))c=65;if(ill('rhume'))c=Math.min(c,80);return c;}
function useItem(id){
 if(id==='baume'){cure('ampoules');cure('piqure');S.prot.ampoules=3;take('baume');toast(tt('h.baume.use'),'baume');}
 else if(id==='plantain'){if(cure('piqure'))take('plantain');else toast(tt('h.noNeed'));}
 else if(id==='sirop'){cure('rhume');S.prot.rhume=3;take('sirop');toast(tt('h.sirop.use'),'sirop');}
 else if(id==='remede'){if(cure('fievre'))take('remede');else toast(tt(S.flags.sick?'h.remede.mateo':'h.noNeed'));}
 refreshHUD();
}
function moral(n){S.moral=clamp(S.moral+n,0,100);refreshHUD();}
function log(k,v){S.log.push({d:S.day,st:S.stage,k,v:v||{}});}
function seeAnimal(sp,quiet){const b=sp.replace(/\d$/,'');if(S.seen[b])return false;S.seen[b]=1;moral(4);
 if(quiet){toast(tt('ui.journalNew',{x:tt('an.'+b)}));return true;}
 openCard({title:tt('an.'+b),aimg:b,html:'<p>'+tt('an.'+b+'.f')+'</p><p class="sub">'+tt('ui.journalAdd')+'</p>',buttons:[{t:tt('o.ok')}]});return true;}
function addStamp(kind){if(!S.stamps.some(s=>s.st===S.stage))S.stamps.push({st:S.stage,d:S.day-1,k:kind});}
function startMini(name,opts,cb){$('stage').classList.add('inmini');MINI=MINIS[name](opts||{},res=>{MINI=null;$('miniHint').hidden=true;$('stage').classList.remove('inmini');mode='walk';cb&&cb(res);});mode='mini';$('prompt').hidden=true;$('miniHint').hidden=false;$('miniHint').textContent=MINI.hint||'';}

const G={get f(){return S.flags},get q(){return S.quests},t:tt,tl,has,add,take,toast:(m,i)=>toast(m,i),moral,log,aff,compMet,joinComp,seeAnimal,startMini,
 say:(w,l,o,d)=>say(w,l,o,d),sayK:(w,k,o,d)=>say(w,tl(k),o,d),npc:id=>NPCS[id],skill:n=>!!S.skills[n],inParty:id=>party().includes(id),partySize:()=>humans().length,
 setQ(id,st){S.quests[id]=st;if(st==='active'||st==='done')toast(tt(st==='done'?'ui.questDone':'ui.questNew',{x:tt('q.'+id+'.n')}));},
 healMateo(){take('remede');S.flags.mateoHealed=1;S.flags.sick=0;S.quests.mateo='done';compMet('mateo');S.comp.mateo.st='party';aff('mateo',25);moral(25);log('mateoSaved');
  const e=W.ents.find(e=>e.k==='mateoSick');if(e){e.gone=1;P.trail=[[e.px,e.py,'down',0,0]];}toast(tt('ui.questDone',{x:tt('q.mateo.n')}));refreshHUD();}
};

// ---------- Chargement d'une étape ----------
function loadStage(i,first){
 S.stage=i;W=buildWorld(i);const D=W.D;
 P.x=18;P.y=W.PY(0)*T+20;P.z=0;P.vz=0;P.dir='right';P.trail=[];P.sx=P.x;P.sy=P.y;W.wolf=null;W.campAt=null;
 W.cam=0;W.camY=clamp(P.y-VH/2,0,W.H*T-VH);
 snap=JSON.stringify(S);save();
 mode='walk';refreshHUD();banner(i);
 if(D.id==='meseta'&&S.flags.metMateo&&!S.flags.mateoHealed){S.flags.sick=1;S.sickT=170;S.quests.mateo='active';
  const lines=tl(S.comp.mateo&&S.comp.mateo.st==='party'?'ev.sick.party':'ev.sick.alone');lines.push(...tl(S.flags.r_remede?'ev.sick.know':'ev.sick.dunno'));
  setTimeout(()=>say('narr',lines),400);}
 else if(first)setTimeout(()=>say('narr',tl('ev.intro')),500);
}
function banner(i){const D=STAGES[i],b=$('banner');$('bnStep').textContent=i<16?tt('ui.stageN',{n:i+1,r:tt('rg.'+D.id)}):tt('ui.secret');$('bnName').textContent=tt('st.'+D.id);$('bnText').textContent=tt('in.'+D.id);b.hidden=false;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');clearTimeout(banner.t);banner.t=setTimeout(()=>{b.hidden=true;},5600);}

// ---------- Boucle ----------
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;try{update(dt);draw();}catch(e){console.error(e);}requestAnimationFrame(loop);}
function update(dt){
 time+=dt;
 if(mode==='dialog'&&DQ&&DQ.typing){DQ.shown+=dt*55;const n=Math.floor(DQ.shown);$('dlgText').textContent=DQ.full.slice(0,n);if(n>=DQ.full.length)finishLine();}
 if(mode==='mini'&&MINI){MINI.update(dt);return;}
 if(mode==='travel'){travelUpdate(dt);return;}
 if(!W)return;
 ambient(dt);
 if(mode==='title'){W.cam=(Math.sin(time*.08)*.5+.5)*(W.Wt*T-VW);W.camY=clamp(W.PY(0)*T-VH/2,0,W.H*T-VH);return;}
 if(mode!=='walk')return;
 if(S.moral<=0){showEnd('abandon');return;}
 const h0=S.hour;S.hour+=dt/HOUR_S;
 if(Math.floor(h0)!==Math.floor(S.hour))hourTick();
 if(S.hour>=23.5){forcedSleep();return;}
 if(S.hour>=20&&S.flags.nightHint!==S.day){S.flags.nightHint=S.day;toast(tt('ui.night'));}
 const D=W.D,tl0=tileAt(P.x,P.y-2);
 let dx=inp.r-inp.l,dy=inp.d-inp.u;P.moving=!!(dx||dy);
 P.running=!!((inp.run||inp.runT)&&P.moving&&S.energy>15&&!ill('fievre'));
 if(P.moving){const l=Math.hypot(dx,dy);dx/=l;dy/=l;
  let sp=P.running?95:56;if(D.slope)sp*=.85;if(tl0===4)sp*=.65;if(ill('ampoules'))sp*=.8;if(ill('fievre'))sp*=.75;if(S.energy<15)sp*=.7;
  const air=P.z>0,ox=P.x,oy=P.y,nx=P.x+dx*sp*dt,ny=P.y+dy*sp*dt;
  if(!blocked(nx,P.y,air))P.x=nx;if(!blocked(P.x,ny,air))P.y=ny;
  const mv=Math.hypot(P.x-ox,P.y-oy);
  if(mv>0){let k=.012;if(P.running)k*=2.5;if(D.slope)k*=S.eq.main==='baton'?1.3:1.8;if(ill('ampoules'))k*=1.3;if(ill('fievre'))k*=1.5;if(sunHot())k*=1.5;if(tl0===4)k*=1.2;
   S.energy=Math.max(0,S.energy-mv*k);if(P.running)S.runDist+=mv;P.anim+=dt*(P.running?1.6:1);P.frame=Math.floor(P.anim*8)%4;
   P.trail.push([P.x,P.y,P.dir,P.frame,P.z]);if(P.trail.length>90)P.trail.shift();}
  P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
 }else P.frame=0;
 if(P.z>0||P.vz>0){P.z+=P.vz*dt;P.vz-=480*dt;if(P.z<=0){P.z=0;P.vz=0;land();}}
 else if(!overHop(P.x,P.y)){P.sx=P.x;P.sy=P.y;}
 if(P.inv>0)P.inv-=dt;
 if(sunHot()){S.sun+=dt/HOUR_S;if(S.sun>.5&&!S.flags['sunHint'+S.stage]){S.flags['sunHint'+S.stage]=1;toast(tt('h.sunHint'));}if(S.sun>2.2&&!ill('insolation'))getIll('insolation');}
 hazards();wolfUpdate(dt);
 if(S.flags.sick){S.sickT-=dt;if(S.sickT<=0){S.flags.sick=0;showEnd('lost');return;}}
 for(const e of W.ents)if(e.trig&&!S.flags['tg'+W.i+e.uid]&&P.x>e.px){S.flags['tg'+W.i+e.uid]=1;fireTrig(e.ev);return;}
 cam(dt);
 if(P.x>W.Wt*T-6){tryExit();return;}
 if(D.endX!=null&&P.x>D.endX*T&&!S.flags.arrived){S.flags.arrived=1;arrive();return;}
 if(S.energy<=0){faint();return;}
 findNear();refreshHUD(true);
}
function cam(dt){const tx=clamp(P.x-VW/2,0,W.Wt*T-VW),ty=clamp(P.y-VH/2-6,0,W.H*T-VH),k=Math.min(1,dt*6);W.cam+=(tx-W.cam)*k;W.camY+=(ty-W.camY)*k;}
function tileAt(x,y){const tx=x/T|0,ty=y/T|0;return W.get(tx,ty);}
function sunHot(){return W&&W.D.hot&&S.hour>=12&&S.hour<17&&S.eq.tete!=='chapeau'&&tileAt(P.x,P.y-2)!==7;}
function blocked(x,y,air){
 if(x<4||y<12||y>W.H*T-2)return true;
 for(const[a,b]of[[x-4,y-3],[x+4,y-3],[x-4,y],[x+4,y]]){if(a>=W.Wt*T)continue;const k=(b/T|0)*W.Wt+(a/T|0);if(W.solid[k])return true;if(W.hop[k]&&!air)return true;}
 for(const e of W.ents)if(e.solidR&&!e.gone&&!e.hide&&Math.hypot(e.px-x,e.py-y)<e.solidR+3)return true;
 return false;
}
function overHop(x,y){for(const[a,b]of[[x-4,y-3],[x+4,y-3],[x-4,y],[x+4,y]]){if(a>=W.Wt*T)continue;if(W.hop[(b/T|0)*W.Wt+(a/T|0)])return true;}return false;}
function jump(){if(mode!=='walk'||P.z>0||P.vz>0)return;P.vz=120;S.energy=Math.max(0,S.energy-.5);}
function land(){if(overHop(P.x,P.y)){const dx=(inp.r-inp.l)||(P.dir==='right'?1:P.dir==='left'?-1:0),dy=(inp.d-inp.u)||(P.dir==='down'?1:P.dir==='up'?-1:0);for(let k=2;k<=12;k+=2){const nx=P.x+dx*k,ny=P.y+dy*k;if(!overHop(nx,ny)&&!blocked(nx,ny,false)){P.x=nx;P.y=ny;S.stats.jumps++;return;}}P.x=P.sx;P.y=P.sy;S.energy=Math.max(0,S.energy-5);shake=.3;
  if(!S.flags.splashHint){S.flags.splashHint=1;say('narr',tl('ui.splashHint'));}else toast(tt('ui.splash'));if(Math.random()<.3)getIll('rhume',true),toast(tt('h.rhume.got'));}
 else S.stats.jumps++;}
function hourTick(){
 if(ill('piqure'))moral(-1);
 for(const id of party())if(Math.random()<.5)aff(id,1);
 if(W.D.wolves&&S.hour>=20&&!W.wolf&&S.flags.wolfNight!==S.day){S.flags.wolfNight=S.day;spawnWolf();}
 save();
}
function forcedSleep(){mode='card';openCard({title:tt('ui.lateT'),html:'<p>'+tt('ui.late')+'</p>',buttons:[{t:tt('o.ok'),f:()=>{const m=newDay('ground');if(m)wakeCard('ground',m);}}]});}
function faint(){S.stats.faints++;S.flags.fainted=1;S.energy=30;moral(-10);S.hour+=3;log('faint');
 openCard({title:tt('ui.faintT'),html:'<p>'+tt('ui.faint')+'</p>',buttons:[{t:tt('o.ok'),f:()=>{if(Math.random()<.5)getIll('fievre');if(S.hour>=23)forcedSleep();}}]});}

// ---------- Nouveau jour ----------
function newDay(kind){
 const eB=S.energy,msgs=[];S.day++;S.hour=7;S.sun=0;
 for(const n of Object.keys(S.ill))S.ill[n].d+=((kind==='gite'||kind==='travel')&&n==='fievre')?.5:1;
 if(S.ill.insolation){delete S.ill.insolation;msgs.push(tt('h.insolation.cured'));}
 if(S.ill.ampoules&&kind==='gite'){S.ill.ampoules.g=(S.ill.ampoules.g||0)+1;if(S.ill.ampoules.g>=3){delete S.ill.ampoules;msgs.push(tt('h.cured',{x:tt('h.ampoules')}));}}
 if(S.ill.piqure&&S.ill.piqure.d>=2){delete S.ill.piqure;if(Math.random()<.5&&!S.ill.fievre){S.ill.fievre={d:0};msgs.push(tt('h.piqure.worse'));}}
 if(S.ill.rhume&&S.ill.rhume.d>=3){delete S.ill.rhume;if(!S.ill.fievre)S.ill.fievre={d:0};msgs.push(tt('h.rhume.worse'));}
 if(!S.prot.ampoules&&!S.ill.ampoules){const p=.05+(S.eq.main!=='baton'?.1:0)+(eB<30?.12:0)+(S.runDist>900?.1:0);if(Math.random()<p){S.ill.ampoules={d:0};msgs.push(tt('h.ampoules.got'));}}
 if(!S.ill.fievre&&eB<12&&Math.random()<(S.flags.fainted?.55:.3)){S.ill.fievre={d:0};msgs.push(tt('h.fievre.got'));}
 let pr=0;if(kind==='camp'||kind==='ground')pr+=.4;if(W&&W.D.rain)pr+=kind==='gite'?.1:.25;
 if(!S.prot.rhume&&!S.ill.rhume&&Math.random()<pr){S.ill.rhume={d:0};msgs.push(tt('h.rhume.got'));}
 S.flags.fainted=0;S.runDist=0;
 for(const k in S.prot){S.prot[k]--;if(S.prot[k]<=0)delete S.prot[k];}
 if(S.ill.fievre&&S.ill.fievre.d>=4){showEnd('fever');return null;}
 if(S.ill.fievre&&S.ill.fievre.d>=1)msgs.push(tt('h.fievre.worse',{n:Math.max(1,Math.ceil(4-S.ill.fievre.d))}));
 const base={gite:100,fire:85,camp:60,ground:45,travel:85}[kind]||60;
 S.energy=Math.min(energyCap(),Math.max(S.energy,base));
 let dm=kind==='travel'?(humans().length?-1:-3):(humans().length?-4:-10);if(party().includes('chien'))dm+=2;if(S.eq.cou==='collier')dm+=2;if(S.eq.tete==='couronne')dm+=2;if(S.ill.fievre)dm-=6;if(S.ill.rhume)dm-=3;
 S.moral=clamp(S.moral+dm,0,100);
 for(const id of party())aff(id,2);
 if(kind!=='ground'&&kind!=='travel')addStamp(kind==='gite'?'gite':'camp');
 if(kind==='gite'||(kind==='travel'&&S.day%2))add('pain',1,true);
 W.campAt=null;for(const e of W.ents)if(e.k==='camp')e.lit=0;
 if(W.wolf)W.wolf=null;
 save();refreshHUD();return msgs;
}

// ---------- Animaux ----------
const ASPD={chat:10,chat2:10,chat3:10,chien:16,renard:20,ecureuil:26,chevre:9,vache:5,vache2:5,mouton:7,heron:0};
function ambient(dt){
 for(const e of W.ents){
  if(e.k==='wasps'){const rad=12+30*(.5+.5*Math.sin(time*.8+e.t0));e.w.forEach((w,k)=>{w.a+=dt*(2.4+k*.3);w.x=e.px+Math.cos(w.a)*rad+Math.sin(time*9+k)*2;w.y=e.py-6+Math.sin(w.a)*rad*.8;});}
  else if(e.k==='cater'){e.cy+=e.v*dt;if(e.cy>e.cy1||e.cy<e.cy0)e.v*=-1;}
  else if(e.k==='animal'&&!e.gone)animalUpdate(e,dt);
 }
 for(const d of W.drops){d.y+=d.s*dt;d.x-=d.s*.25*dt;if(d.y>VH){d.y=-6;d.x=Math.random()*(VW+60);}}
 for(const b of W.birds){b.x+=b.v*dt;if(b.x>W.Wt*T+40)b.x=-40;}
}
function animalUpdate(e,dt){
 const sp=e.sp,dP=Math.hypot(e.px-P.x,e.py-P.y),scare=P.running&&dP<60;
 if(e.hide>0){e.hide-=dt;if(e.hide<=0){e.px=e.hx;e.py=e.hy;}return;}
 e.inv=(sp==='renard'&&!e.den&&S.hour<17&&S.hour>6);if(e.inv)return;
 if(sp==='papillon'){e.ph=(e.ph||0)+dt;e.px=e.hx+Math.sin(e.ph*.9+e.t0)*22;e.py=e.hy+Math.sin(e.ph*1.7+e.t0*2)*10;if(scare&&dP<34){e.hx=clamp(e.hx+(e.px>P.x?50:-50),20,W.Wt*T-20);}return;}
 if(sp==='libellule'){if(!e.tg||Math.hypot(e.tg[0]-e.px,e.tg[1]-e.py)<2){e.tg=[e.hx+(Math.random()-.5)*60,e.hy+(Math.random()-.5)*30];e.wait=Math.random()*1.2;}if(e.wait>0){e.wait-=dt;return;}const a=Math.atan2(e.tg[1]-e.py,e.tg[0]-e.px);e.px+=Math.cos(a)*70*dt;e.py+=Math.sin(a)*70*dt;return;}
 if((sp==='ecureuil'&&(scare||dP<14))||(sp==='renard'&&(scare&&dP<80||dP<20))||(sp==='heron'&&scare&&dP<55)){if(!e.tame){e.hide=sp==='renard'?25:12;return;}}
 const v=ASPD[sp]||10;if(!v)return;
 if(e.follow)return;
 if(e.stray&&dP<40&&P.running){e.gx=e.px+(e.px-P.x);e.gy=e.py;}
 const dg=Math.hypot(e.gx-e.px,e.gy-e.py);
 if(dg<1){e.f=0;if(Math.random()<dt*(sp==='ecureuil'?1.2:.4)){const R=sp==='vache'||sp==='vache2'?30:44;const gx=e.hx+(Math.random()-.5)*R*2,gy=e.hy+(Math.random()-.5)*R*.7;if(!blocked(gx,gy,false)){e.gx=gx;e.gy=gy;}}}
 else{const a=Math.atan2(e.gy-e.py,e.gx-e.px),nx=e.px+Math.cos(a)*v*dt,ny=e.py+Math.sin(a)*v*dt;
  if(Math.hypot(nx-P.x,ny-P.y)>12&&!blocked(nx,ny,false)){e.px=nx;e.py=ny;e.dirx=Math.cos(a)>=0?1:-1;e.f=Math.floor(time*7)%2;}else{e.gx=e.px;e.gy=e.py;}}
}
function spawnWolf(){const side=P.x>W.Wt*T/2?-1:1;let x=clamp(P.x+side*170,30,W.Wt*T-30),y=clamp(P.y+(Math.random()<.5?-60:60),30,W.H*T-20);W.wolf={x,y,dir:-side,f:0,st:'stalk',cool:0};}
function wolfUpdate(dt){const w=W.wolf;if(!w)return;const d=Math.hypot(w.x-P.x,w.y-P.y);w.f=Math.floor(time*6)%2;
 if(w.cool>0){w.cool-=dt;return;}
 if(w.st==='stalk'){if(party().includes('chien')&&d<100){w.st='flee';toast(tt('ev.wolf.dog'));aff('chien',6);seeAnimal('loup',true);log('wolfDog');return;}
  const a=Math.atan2(P.y-w.y,P.x-w.x);w.x+=Math.cos(a)*14*dt;w.y+=Math.sin(a)*14*dt;w.dir=Math.cos(a)>=0?1:-1;if(d<46){w.st='met';wolfMeet();}}
 else if(w.st==='flee'){const a=Math.atan2(w.y-P.y,w.x-P.x);w.x+=Math.cos(a)*60*dt;w.y+=Math.sin(a)*60*dt;w.dir=Math.cos(a)>=0?1:-1;if(d>300)W.wolf=null;}}
function wolfMeet(){const b=[{t:tt('ev.wolf.oRun'),f:()=>{S.energy=Math.max(0,S.energy-15);moral(-10);W.wolf.st='flee';say('narr',tl('ev.wolf.run'));}},
  {t:tt('ev.wolf.oBig'),f:()=>{moral(6);W.wolf.st='flee';log('wolf');say('narr',tl('ev.wolf.big'),null,()=>seeAnimal('loup'));}}];
 if(foodCount())b.push({t:tt('ev.wolf.oFood'),f:()=>{eatShared(1);moral(-2);W.wolf.st='stalk';W.wolf.cool=25;say('narr',tl('ev.wolf.food'));}});
 openCard({title:tt('ev.wolf.t'),aimg:'loup',html:'<p>'+tt('ev.wolf.x')+'</p>',buttons:b});}
function hazards(){
 if(P.inv>0||P.z>7)return;const hx=P.x,hy=P.y-6;
 for(const e of W.ents){
  if(e.k==='wasps')for(const w of e.w)if(Math.hypot(w.x-hx,w.y-hy)<7){hurt(8,w.x,w.y,'wasp');return;}
  if(e.k==='cater')for(let s=0;s<7;s++){const sy=e.cy-Math.sign(e.v)*s*5;if(Math.hypot(e.px-hx,sy-hy)<8){hurt(10,e.px,sy,'cater');return;}}
 }
}
function hurt(n,fx,fy,kind){S.energy=Math.max(0,S.energy-n);P.inv=1.4;const a=Math.atan2(P.y-6-fy,P.x-fx);for(let k=0;k<6;k++){const nx=P.x+Math.cos(a)*2,ny=P.y+Math.sin(a)*2;if(!blocked(nx,P.y,false))P.x=nx;if(!blocked(P.x,ny,false))P.y=ny;}
 shake=.3;if(!S.flags['hurt_'+kind]){S.flags['hurt_'+kind]=1;say('narr',tl('hz.'+kind),null,()=>{if(Math.random()<.7)getIll('piqure');});}else{toast(tt('ui.ouch',{n}));if(Math.random()<.5&&!ill('piqure'))getIll('piqure',true);}}

// ---------- Déclencheurs d'histoire ----------
function fireTrig(ev){
 if(ev==='noeBye'){if(!party().includes('noe'))return;say(NPCS.noe,tl('ev.noeBye'),null,()=>celebrate('noe',()=>{leaveComp('noe');log('noeBye');toast(tt('ui.leaves',{n:tt('n.noe')}));}),true);}
 else if(ev==='hansBye'){if(!party().includes('hans'))return;say(NPCS.hans,tl('ev.hansBye'),null,()=>celebrate('hans',()=>{add('coquilleh',1);leaveComp('hans');log('hansBye');toast(tt('ui.leaves',{n:tt('n.hans')}));}),true);}
 else if(ev==='storm'){say('narr',tl('ev.storm'),null,()=>startMini('runner',{storm:1},res=>{if(res.win){moral(8);log('storm');say('narr',tl('ev.storm.ok'));}else{S.energy=Math.max(0,S.energy-20);moral(-6);say('narr',tl('ev.storm.ko'),null,()=>{if(Math.random()<.6)getIll('rhume');});}}));}
 else if(ev==='border'){celebrate('border');}
 else if(ev==='galiceIn'){celebrate('galice');}
}
function arrive(){const go=()=>showEnd('compostelle');log('arrive');if(party().length)celebrate('arrive',go);else say('narr',tl('cel.arrive.solo'),null,go);}

// ---------- Compagnons : discussion, cœurs, activités ----------
function heartCheck(id,then){const c=S.comp[id];if(!c){then&&then();return false;}
 const done=()=>then&&then();
 if(c.aff>=40&&!c.h1){c.h1=1;say(compWho(id),tl('c.'+id+'.h1'),null,()=>{aff(id,4);done();},true);return true;}
 if(c.aff>=80&&!c.h2){c.h2=1;const pick=r=>{c.rel=r;log('rel_'+id,{r});toast(tt('ui.newRel',{n:tt('n.'+id),r:relTitle(id)}));moral(10);done();};
  if(COMP[id].rel)say(compWho(id),tl('c.'+id+'.h2'),[{t:tt('c.'+id+'.ra'),f:()=>pick('a')},{t:tt('c.'+id+'.rb'),f:()=>pick('b')}],null,true);
  else say(compWho(id),tl('c.'+id+'.h2'),null,()=>pick('a'),true);return true;}
 done();return false;}
function compMenu(id){const c=S.comp[id];
 const b=[{t:tt('o.talk'),f:()=>{if(heartCheck(id))return;const L=tl('c.'+id+'.l');say(compWho(id),[L[(Math.random()*L.length)|0]],null,null,true);aff(id,1);}},{t:tt('o.gift'),f:()=>giftMenu(compWho(id))}];
 if(id==='noe'||id==='mateo')b.push({t:tt('o.race'),f:()=>race(id)});
 if(id!=='chien')b.push({t:tt('o.sing'),f:()=>singTogether()});
 else b.push({t:tt('o.stick'),f:()=>{aff('chien',COMP.chien.pref.play);moral(6);S.hour+=.3;say('narr',tl('c.chien.play'));}});
 b.push({t:tt('o.close')});
 openCard({title:tt('n.'+id),portrait:id,html:'<p class="rel">'+relTitle(id)+'</p>'+heartsHTML(c.aff),buttons:b});}
function race(id){startMini('runner',{rival:id},res=>{S.stats.races++;S.hour+=.4;S.energy=Math.max(0,S.energy-10);
 if(res.win){aff(id,COMP[id].pref.race);moral(10);if(!S.flags.raceWon){S.flags.raceWon=1;log('race',{n:id});}say(compWho(id),tl('c.'+id+'.lose'),null,null,true);}
 else{aff(id,COMP[id].pref.race/2|0);moral(4);say(compWho(id),tl('c.'+id+'.win'),null,null,true);}});}
function singTogether(after){startMini('song',{},sc=>{S.stats.songs++;S.hour+=.5;const g=.5+sc;moral(Math.round(5+15*sc));for(const id of party())aff(id,Math.round((COMP[id].pref.sing||4)*g));
 if(!S.flags.sang){S.flags.sang=1;log('song');}toast(tt('ui.songDone',{p:Math.round(sc*100)}));after&&after();});}

// ---------- Campement ----------
function campInteract(e){
 if(S.hour<17){openCard({title:tt('camp.t'),html:'<p>'+tt('camp.early')+'</p>',buttons:[{t:tt('o.rest1h'),f:()=>{S.hour+=1;S.energy=Math.min(energyCap(),S.energy+12);toast(tt('ui.rested'));}},{t:tt('o.later')}]});return;}
 const need=Math.max(1,3-humans().length);
 if(!has('bois',need)){openCard({title:tt('camp.t'),html:'<p>'+tt('camp.noWood',{n:need})+'</p>',buttons:[{t:tt('o.noFire'),f:()=>campNight(e,false)},{t:tt('o.later')}]});return;}
 openCard({title:tt('camp.t'),html:'<p>'+tt(humans().length?'camp.friends':'camp.alone',{n:need})+'</p>',buttons:[{t:tt('o.fire'),f:()=>{take('bois',need);W.campAt=e;
  startMini('fire',{help:humans().length},ok=>{if(ok){e.lit=1;log('fire');campMenu(e,[]);}else{add('bois',need,true);openCard({title:tt('camp.t'),html:'<p>'+tt('camp.fail')+'</p>',buttons:[{t:tt('o.retry'),f:()=>campInteract(e)},{t:tt('o.noFire'),f:()=>campNight(e,false)}]});}});}},{t:tt('o.later')}]});}
function campMenu(e,done){
 const ps=party(),hs=humans(),b=[];
 if(done.length<3){
  if(!done.includes('meal')){const n=ps.length+1;b.push({t:tt('o.meal',{n}),f:()=>{const got=eatShared(n);if(got<n){moral(-4);say('narr',tl('camp.hungry'),null,()=>campMenu(e,[...done,'meal']));return;}S.energy=Math.min(energyCap(),S.energy+20);moral(8);for(const id of ps)aff(id,COMP[id].pref.meal);say('narr',tl(hs.length?'camp.meal':'camp.mealSolo'),null,()=>campMenu(e,[...done,'meal']));}});}
  if(!done.includes('sing'))b.push({t:tt(hs.length?'o.sing':'o.singSolo'),f:()=>singTogether(()=>campMenu(e,[...done,'sing']))});
  if(hs.length&&!done.includes('story'))b.push({t:tt('o.story'),f:()=>{const id=hs[(Math.random()*hs.length)|0];moral(6);for(const c of hs)aff(c,COMP[c].pref.story);say(compWho(id),tl('camp.story.'+id),null,()=>campMenu(e,[...done,'story']),true);}});
  if(!done.includes('stars'))b.push({t:tt('o.stars'),f:()=>{moral(6);for(const c of ps)aff(c,COMP[c].pref.stars||3);if(!S.flags.stars){S.flags.stars=1;log('stars');}const k=hs.includes('hans')?'camp.stars.hans':'camp.stars';say(hs.includes('hans')?NPCS.hans:'narr',tl(k),null,()=>campMenu(e,[...done,'stars']),true);}});
  if(ps.includes('chien')&&!done.includes('play'))b.push({t:tt('o.stick'),f:()=>{aff('chien',COMP.chien.pref.play);moral(6);say('narr',tl('c.chien.play'),null,()=>campMenu(e,[...done,'play']));}});
 }
 b.push({t:tt('o.sleep'),f:()=>{const h=ps.find(id=>{const c=S.comp[id];return(c.aff>=40&&!c.h1)||(c.aff>=80&&!c.h2);});if(h&&heartCheck(h,()=>campNight(e,true)))return;campNight(e,true);}});
 openCard({title:tt('camp.night'),html:'<p>'+tt(ps.length?'camp.menu':'camp.menuSolo')+'</p>',buttons:b,keep:1});}
function campNight(e,fire){W.campAt=e;S.stats.camps++;const extra=[];
 if(!fire&&W.D.wolves){extra.push(tt('camp.wolves'));moral(-8);}
 if(!fire&&(W.D.theme==='forest'||W.D.theme==='lande')&&foodCount()&&Math.random()<.6){eatShared(1);extra.push(tt('camp.fox'));}
 if(!S.flags.campLog){S.flags.campLog=1;log('camp');}
 fade(()=>{const m=newDay(fire?'fire':'camp');if(!m)return;if(!fire&&W.D.wolves)S.energy=Math.max(20,S.energy-15);wakeCard(fire?'fire':'camp',extra.concat(m));});}

// ---------- Fêtes ----------
function celebrate(kind,after){
 const ps=party(),hs=humans(),fin=()=>{S.stats.celebs++;log('cel_'+kind);after&&after();};
 if(!ps.length){say('narr',tl('cel.solo'),null,()=>{moral(6);fin();});return;}
 const b=[{t:tt('o.sing'),f:()=>singTogether(()=>{moral(6);fin();})},
  {t:tt('o.dance'),f:()=>{moral(12);for(const id of ps)aff(id,COMP[id].pref.dance||5);say('narr',tl('cel.r.dance'),null,fin);}},
  {t:tt('o.feast',{n:ps.length+1}),f:()=>{const n=ps.length+1;if(foodCount()<n){say('narr',tl('cel.r.nofood'),null,()=>{moral(5);fin();});return;}eatShared(n);moral(18);S.energy=Math.min(energyCap(),S.energy+15);for(const id of ps)aff(id,(COMP[id].pref.meal||5)+4);say('narr',tl('cel.r.feast'),null,fin);}}];
 openCard({title:tt('cel.'+kind+'.t'),html:'<p>'+tt('cel.'+kind+'.x',{c:hs.map(i=>tt('n.'+i)).join(', ')})+'</p><p class="sub">'+tt('cel.how')+'</p>',buttons:b,keep:1});}

// ---------- Interactions ----------
function ip(e){return e.img?[e.px,e.base+6]:[e.px,e.py];}
function followerList(){const L=party().slice();if(S.flags.goatFollow)L.push('goat');return L;}
function followerPos(k){const n=P.trail.length;if(!n)return[P.x-12*(k+1),P.y,P.dir,0,0];return P.trail[Math.max(0,n-1-(k+1)*13)];}
function findNear(){let best=null,bd=22;const px=P.x,py=P.y-4;
 for(const e of W.ents){if(!e.act||e.gone||e.hide||e.inv)continue;const[a,b]=ip(e);let r=e.sp==='renard'?48:e.k==='climb'?20:22;const d=Math.hypot(a-px,b-py);if(d<r&&d<bd+(r-22)){bd=d;best=e;}}
 if(!best&&!S.flags.sick){followerList().forEach((id,k)=>{if(id==='goat')return;const f=followerPos(k);const d=Math.hypot(f[0]-px,f[1]-py);if(d<18&&d<bd){bd=d;best={act:'comp',cid:id,px:f[0],py:f[1]};}});}
 near=best;const pr=$('prompt');
 if(best){pr.querySelector('span').textContent=promptLabel(best);pr.hidden=false;}else pr.hidden=true;}
function promptLabel(e){switch(e.act){
 case 'talk':return tt('pr.talk',{n:tt('n.'+e.id)});case 'comp':return tt('pr.talk',{n:tt('n.'+e.cid)});
 case 'animal':return tt(e.stray?'pr.dog':e.lost?'pr.goat':(e.sp.startsWith('chat')?'pr.pet':e.sp==='ecureuil'&&(has('chataigne')||has('noix'))?'pr.feed':'pr.watch'),{n:tt('an.'+e.sp.replace(/\d$/,''))});
 default:return tt('pr.'+e.act);}}
function interact(){const e=near;if(!e)return;
 switch(e.act){
  case 'talk':e.dir=P.x<e.px?'left':'right';if(Math.abs(P.y-e.py)>Math.abs(P.x-e.px))e.dir=P.y<e.py?'up':'down';S.flags['seen_'+e.id]=1;e.def.talk(G);break;
  case 'comp':compMenu(e.cid);break;
  case 'pick':pick(e);break;
  case 'plant':plantCard(e);break;
  case 'post':postcard();break;
  case 'gite':gite();break;
  case 'camp':campInteract(e);break;
  case 'sign':openCard({title:tt('sign.t'),html:'<p>'+tt('sign.'+e.s)+'</p>',buttons:[{t:tt('o.ok')}]});break;
  case 'view':{const k='v'+W.i+e.uid,fst=!S.flags[k];S.flags[k]=1;if(fst){moral(10);log('view');}openCard({title:tt('poi.view'),html:'<p>'+tt('view.'+W.D.id)+'</p>'+(fst?'<p class="sub">'+tt('ui.moralUp',{n:10})+'</p>':''),buttons:[{t:tt('o.ok'),f:()=>{if(W.D.id==='leon')seeAnimal('loup');}}]});break;}
  case 'cascade':{const k='c'+S.day;if(e.used===k){toast(tt('poi.cascade.again'));break;}e.used=k;S.energy=Math.min(energyCap(),S.energy+15);moral(5);openCard({title:tt('poi.cascade'),html:'<p>'+tt('poi.cascade.x')+'</p>',buttons:[{t:tt('o.ok')}]});break;}
  case 'cave':{const k='cv'+W.i,fst=!S.flags[k];S.flags[k]=1;if(fst){moral(10);log('cave');}openCard({title:tt('poi.cave'),html:'<p>'+tt(W.D.id==='perigord'?'poi.cave.perigord':'poi.cave.x')+'</p>',buttons:[{t:tt('o.ok')}]});break;}
  case 'cache':{S.flags['t'+W.i+'_'+e.uid]=1;e.gone=1;const L=['coquillage','miel','ficelle','fromage','coquillage','thym','plantain'],it=L[(hash(W.i,e.uid.length*7+e.tx)*L.length)|0];add(it,1);toast(tt('poi.cache'),it);break;}
  case 'den':break;
  case 'climb':climb(e);break;
  case 'treeclimb':treeClimb(e);break;
  case 'ford':ford(e);break;
  case 'log':startMini('balance',{},res=>{if(res==='ok'){P.x=(e.tx+2)*T+12;P.y=e.ly;P.trail=[];if(!S.flags.logDone){S.flags.logDone=1;log('log');}toast(tt('ui.crossed'));}else{S.energy=Math.max(0,S.energy-12);openCard({title:tt('ui.plouf'),html:'<p>'+tt('ui.fell')+'</p><p class="sub">'+tt(S.eq.main==='baton'?'ui.fell2':'ui.fell3')+'</p>',buttons:[{t:tt('o.retry'),f:()=>{near=e;interact();}},{t:tt('o.later')}]});if(Math.random()<.3)getIll('rhume',true);}});break;
  case 'dive':startMini('dive',{},res=>{S.energy=Math.max(0,S.energy-6);const got=[];if(res.truite&&!has('truite')&&S.quests.poisson!=='done'){S.inv.truite=1;got.push(tt('it.truite'));}if(res.poisson){S.inv.poisson=(S.inv.poisson||0)+res.poisson;got.push(res.poisson+' × '+tt('it.poisson'));}if(res.coq){S.inv.coquillage=(S.inv.coquillage||0)+res.coq;got.push(res.coq+' × '+tt('it.coquillage'));}
   say('narr',[tt(res.air?'dv.air':'dv.out'),got.length?tt('dv.got',{x:got.join(', ')}):tt('dv.none')]);if(Math.random()<.2)getIll('rhume',true);});break;
  case 'sick':NPCS.mateoSick.talk(G);break;
  case 'borne0':if(S.quests.collier==='active'&&has('collier'))say('narr',tl('ev.borne0.first'),[{t:tt('o.lookOcean'),f:()=>showEnd('finis')},{t:tt('o.seeRosa')}]);else showEnd('finis');break;
  case 'frontier':openCard({title:tt('poi.frontier'),html:'<p>'+tt('poi.frontier.x')+'</p>',buttons:[{t:tt('o.ok')}]});break;
  case 'cruz':if(has('caillou'))say('narr',tl('ev.cruz'),null,()=>{take('caillou');moral(25);S.flags.cruz=1;log('cruz');});else say('narr',tl(S.flags.cruz?'ev.cruz.done':'ev.cruz.no'));break;
  case 'nest':seeAnimal('cigogne')||toast(tt('an.cigogne.again'));break;
  case 'animal':animalAct(e);break;
 }}
function animalAct(e){const sp=e.sp,b=sp.replace(/\d$/,'');
 if(P.running){toast(tt('ui.tooFast'));return;}
 if(e.stray){const f=FOODS.find(x=>has(x));if(!f){say('narr',tl('ev.dog.nofood'));return;}take(f);e.trust=(e.trust||0)+1;
  if(e.trust>=2){e.gone=1;S.comp.chien={st:'party',aff:25};P.trail=[];log('dog');say('narr',tl('ev.dog.join'),null,()=>{seeAnimal('chien');toast(tt('ui.joins',{n:tt('n.chien')}));});}
  else say('narr',tl('ev.dog.feed',{f:tt('it.'+f).toLowerCase()}));return;}
 if(e.lost){if(S.quests.chevre==='active'){e.gone=1;S.flags.goatFollow=1;P.trail=[];say('narr',tl('ev.goat.follow'),null,()=>seeAnimal('chevre'));}else say('narr',tl('ev.goat.lost'));return;}
 if(b==='chat'){const k='pet'+e.uid+S.day+Math.floor(S.hour);if(e.pet!==k){e.pet=k;moral(5);}say('narr',tl('an.chat.pet'),null,()=>seeAnimal('chat'));return;}
 if(sp==='ecureuil'&&(has('chataigne')||has('noix'))){take(has('noix')?'noix':'chataigne');e.tame=1;moral(6);say('narr',tl('an.ecureuil.feed'),null,()=>seeAnimal('ecureuil'));return;}
 if(sp==='renard'&&Math.hypot(e.px-P.x,e.py-P.y)<24){e.hide=25;toast(tt('an.renard.flee'));return;}
 if(!seeAnimal(b))toast(tt('an.'+b+'.again'));}
const PICKMSG=['branche','coquillage','saule','thym','plantain','fleur','bois','paille','chataigne','clochette'];
function pick(e){S.flags['t'+W.i+'_'+e.uid]=1;e.gone=1;add(e.item,1);if(PICKMSG.includes(e.item)&&!S.flags['pk_'+e.item]){S.flags['pk_'+e.item]=1;say('narr',tl('pk.'+e.item));}}
function plantCard(e){mode='card';const good=PLANTS[e.id];
 const done=()=>{S.flags['t'+W.i+'_'+e.uid]=1;e.gone=1;S.plants[e.id]=1;};
 openCard({title:tt('ui.whatIs'),icon:e.id,html:'<p>'+tt('pl.'+e.id+'.look')+'</p><p class="clue">'+tt('ui.closer')+' '+tt('pl.'+e.id+'.clue')+'</p>',buttons:[
  {t:tt('o.pickGood'),f:()=>{done();if(good){add(e.id,1);toast(tt('pl.'+e.id+'.ok'),e.id);}else{S.energy=Math.max(0,S.energy-10);moral(-3);openCard({title:tt('ui.careful'),icon:e.id,html:'<p>'+tt('pl.'+e.id+'.why')+'</p><p class="sub">'+tt('ui.throwAway')+'</p>',buttons:[{t:tt('o.remember')}]});}}},
  {t:tt('o.leaveBad'),f:()=>{if(!good){done();moral(4);openCard({title:tt('ui.wellSeen'),icon:e.id,html:'<p>'+tt('pl.'+e.id+'.why')+'</p>',buttons:[{t:tt('o.ok')}]});}else toast(tt('ui.leftGood'));}}]});}
function postcard(){const k='post'+W.i;if(S.flags[k]){toast(tt('ui.cardSent'));return;}mode='card';
 openCard({title:tt('ui.postcard'),cls:'postcard',html:'<div class="pc"><img class="pcstamp" src="'+iconURL('coquilleh')+'" alt=""><p class="hand">'+tt('pc.text',{x:tt('pc.'+W.D.id)})+'</p><p class="sub">'+dateStr(S.day)+' · '+tt('st.'+W.D.id)+'</p></div>',buttons:[{t:tt('o.send'),f:()=>{S.flags[k]=1;S.stats.cards++;S.lastCard=S.day;moral(20);toast(tt('ui.cardOk'));}},{t:tt('o.later')}]});}
function gite(){if(S.flags.sick){say('narr',tl('gite.sick'));return;}
 say('narr',tl('gite.in'),[{t:tt('o.sleepGite'),f:()=>fade(()=>{const m=newDay('gite');if(m)wakeCard('gite',m);})},{t:tt('o.rest1h'),f:()=>{S.hour+=1;S.energy=Math.min(energyCap(),S.energy+15);toast(tt('ui.rested'));}},{t:tt('o.later')}]);}
function climb(e){
 if(e.down){P.x=e.to[0]*T+8;P.y=e.to[1]*T+14;P.trail=[];toast(tt('ui.climbDown'));return;}
 const teach=!S.skills.climb&&W.D.id==='odile'&&S.flags.noeTeach;
 if(!S.skills.climb&&!teach){openCard({title:tt('poi.cliff'),html:'<p>'+tt('climb.noskill')+'</p>',buttons:[{t:tt('o.ok')}]});return;}
 startMini('climb',{h:e.h||10,tuto:teach},ok=>{S.energy=Math.max(0,S.energy-(ok?8:12));
  if(!ok){openCard({title:tt('ui.fallT'),html:'<p>'+tt('climb.fall')+'</p>',buttons:[{t:tt('o.retry'),f:()=>climb(e)},{t:tt('o.later')}]});return;}
  P.x=e.to[0]*T+8;P.y=e.to[1]*T+14;P.trail=[];S.stats.climbs++;if(party().includes('noe'))aff('noe',COMP.noe.pref.climb);
  if(teach){S.skills.climb=1;G.setQ('grimper','done');log('climb');say(NPCS.noe,tl('d.noe.top'),[{t:tt('o.walkTogether'),f:()=>joinComp('noe')},{t:tt('o.alone')}]);}
  else toast(tt('ui.climbed'));});}
function treeClimb(e){
 const q=e.id==='chat'?S.quests.chat:S.quests.noix;
 if(q!=='active'){openCard({title:tt('poi.tree'),html:'<p>'+tt('tree.'+e.id+'.idle')+'</p>',buttons:[{t:tt('o.ok')}]});return;}
 if(!S.skills.climb){openCard({title:tt('poi.tree'),html:'<p>'+tt('climb.noskill')+'</p>',buttons:[{t:tt('o.ok')}]});return;}
 startMini('climb',{h:6,tree:1},ok=>{if(!ok){toast(tt('climb.fall'));return;}S.stats.climbs++;
  if(e.id==='chat'){S.quests.chat='saved';say('narr',tl('tree.chat.ok'),null,()=>seeAnimal('chat'));}
  else{S.flags.noixDone=1;add('noix',4);say('narr',tl('tree.noix.ok'));}});}
function ford(e){const hs=humans().length;
 const go=()=>startMini('ford',{help:hs,dog:party().includes('chien')},ok=>{S.energy=Math.max(0,S.energy-8);
  if(ok){P.x=e.to*T+8;P.y=W.PY(e.to)*T+20;P.trail=[];S.stats.fords++;for(const id of party())aff(id,8);moral(hs?10:4);if(!S.flags['fordLog']){S.flags.fordLog=1;log('ford',{n:hs});}toast(tt(hs?'ford.okT':'ford.okS'));}
  else{if(Math.random()<.5)getIll('rhume',true);openCard({title:tt('ui.plouf'),html:'<p>'+tt('ford.ko')+'</p>',buttons:[{t:tt('o.retry'),f:go},{t:tt('o.later')}]});}});
 say('narr',tl(hs?'ford.introT':'ford.introS'),[{t:tt('o.cross'),f:go},{t:tt('o.later')}]);}
let fadeCb=null;function fade(cb){mode='fade';setTimeout(()=>{mode='walk';cb&&cb();},700);}

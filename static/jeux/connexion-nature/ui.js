'use strict';
// ===== Interface : HUD, dialogues, cartes, panneaux, commandes, écran titre =====
let hudKey='',cardBtns=[];
function refreshHUD(light){if(!S||!W)return;const D=STAGES[S.stage];
 const nx=STAGES[S.stage+1],km=Math.round(D.km+(nx&&D.id!=='galice'?(nx.km-D.km):(D.id==='galice'?KM_END-D.km:0))*clamp(P.x/(W.Wt*T),0,1));
 const key=[S.stage,S.day,Math.floor(S.hour*4),S.energy|0,S.moral|0,km,Object.keys(S.ill).join(),Object.keys(S.prot).join(),S.flags.sick?Math.ceil(S.sickT):0,LG].join();if(light&&key===hudKey)return;hudKey=key;
 $('hudPlace').textContent=tt('st.'+D.id);$('hudDate').textContent=dateStr(S.day)+' · '+hourStr(S.hour);$('hudKm').textContent=km+' km';
 const cap=energyCap();$('barE').style.width=Math.min(S.energy,cap)+'%';$('barE').classList.toggle('low',S.energy<25);$('capE').style.left=cap+'%';$('capE').hidden=cap>=100;
 $('barM').style.width=S.moral+'%';$('barM').classList.toggle('low',S.moral<25);
 const fv=$('fever');fv.hidden=!S.flags.sick;if(S.flags.sick){$('barF').style.width=(S.sickT/170*100)+'%';$('feverT').textContent=Math.ceil(S.sickT)+' s';}
 const ch=[];for(const n of ILLS)if(S.ill[n])ch.push('<span class="chip bad"><img src="'+iconURL(ILLICON[n])+'" alt="">'+tt('h.'+n)+(n==='fievre'?' '+Math.max(1,Math.ceil(4-S.ill.fievre.d))+'/4':'')+'</span>');
 for(const n in S.prot)ch.push('<span class="chip good">'+tt('h.prot.'+n)+'</span>');
 if(sunHot())ch.push('<span class="chip warn">'+tt('h.sun')+'</span>');
 $('chips').innerHTML=ch.join('');}
let toastT=0;function toast(msg,icon){const t=$('toast');t.innerHTML=(icon?'<img src="'+iconURL(icon)+'" alt="">':'')+'<span></span>';t.querySelector('span').textContent=msg;t.hidden=false;t.classList.remove('pop');void t.offsetWidth;t.classList.add('pop');clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2800);}
function heartsHTML(a){let h='<div class="hearts" aria-label="'+Math.round(a/10)+'/10">';for(let k=0;k<10;k++)h+='<i class="'+(a>=(k+1)*10?'on':a>k*10+4?'half':'')+'"></i>';return h+'</div>';}
function portraitURL(id){const c=mk(16,24),x=c.getContext('2d');if(id==='chien')drawAnimal(x,'chien',8,20,1,0);else if(id==='me')drawChar(x,8,22,GIRL,'down',0,S.eq);else drawChar(x,8,22,LOOKS[COMP[id]?COMP[id].look:id],'down',0);return c.toDataURL();}

// ---------- Dialogues ----------
function say(who,lines,opts,done,noGift){DQ={who,lines:lines.map(l=>fill(l)),i:0,opts:opts||[],done,sel:0,noGift};mode='dialog';$('dlg').hidden=false;$('prompt').hidden=true;showLine();}
function showLine(){const raw=DQ.lines[DQ.i]||'';let sp=DQ.who,t=raw;if(raw.startsWith('> ')){sp='narr';t=raw.slice(2);}else if(raw.startsWith('@ ')){sp='me';t=raw.slice(2);}
 const nar=sp==='narr';$('dlg').classList.toggle('narr',nar);const name=nar?'':sp==='me'?S.name:sp&&sp.id?tt('n.'+sp.id):'';$('dlgName').textContent=name;$('dlgName').hidden=!name;
 const pc=$('dlgPort'),x=pc.getContext('2d');x.clearRect(0,0,16,24);pc.hidden=nar||!sp;
 if(!nar&&sp){if(sp==='me')drawChar(x,8,22,GIRL,'down',0,S.eq);else if(sp.dog)drawAnimal(x,'chien',8,20,1,0);else if(sp.look)drawChar(x,8,22,LOOKS[sp.look],'down',0);}
 DQ.full=t;DQ.shown=0;DQ.typing=true;$('dlgText').textContent='';$('dlgOpts').innerHTML='';$('dlgNext').hidden=true;}
function finishLine(){DQ.typing=false;$('dlgText').textContent=DQ.full;const lastL=DQ.i===DQ.lines.length-1;let opts=DQ.opts;
 if(lastL&&!opts.length&&DQ.who&&DQ.who.likes&&!DQ.noGift){const npc=DQ.who;opts=DQ.opts=[{t:tt('o.gift'),f:()=>giftMenu(npc)},{t:tt('o.bye')}];}
 if(lastL&&opts.length){const box=$('dlgOpts');opts.forEach((o,k)=>{const b=document.createElement('button');b.textContent=o.t;b.className=k===DQ.sel?'sel':'';b.onclick=ev=>{ev.stopPropagation();choose(k);};box.appendChild(b);});}else $('dlgNext').hidden=false;}
function choose(k){const d=DQ,o=d.opts[k];DQ=null;$('dlg').hidden=true;mode='walk';if(d.done)d.done();if(o&&o.f)o.f();}
function advance(){if(!DQ)return;if(DQ.typing){finishLine();return;}if(DQ.i<DQ.lines.length-1){DQ.i++;showLine();return;}if(DQ.opts.length){choose(DQ.sel);return;}const d=DQ;DQ=null;$('dlg').hidden=true;mode='walk';if(d.done)d.done();}
function moveSel(n){if(!DQ||DQ.typing||!DQ.opts.length||DQ.i<DQ.lines.length-1)return;DQ.sel=(DQ.sel+n+DQ.opts.length)%DQ.opts.length;[...$('dlgOpts').children].forEach((b,k)=>b.className=k===DQ.sel?'sel':'');}
function giftMenu(npc){const items=Object.keys(S.inv).filter(i=>ITEMS[i]&&ITEMS[i].gift&&S.inv[i]>0);
 if(!items.length){say('narr',[tt('ui.noGift')]);return;}
 openCard({title:tt('ui.giftTo',{n:tt('n.'+npc.id)}),html:'<div class="giftgrid">'+items.map(i=>'<button data-g="'+i+'"><img src="'+iconURL(i)+'" alt=""><span>'+tt('it.'+i)+'</span><b>'+S.inv[i]+'</b></button>').join('')+'</div>',buttons:[{t:tt('o.cancel')}]});
 $('cardBody').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{closeCard();giveGift(npc,b.dataset.g);});}
function giveGift(npc,id){take(id);S.stats.gifts++;const k='g_'+npc.id+id,first=!S.flags[k];S.flags[k]=1;const liked=(npc.likes||COMP[npc.id]&&COMP[npc.id].likes||[]).includes(id);
 if(S.comp[npc.id])aff(npc.id,liked?10:4);if(!S.flags.giftLog){S.flags.giftLog=1;log('gift',{n:npc.id,i:id});}
 const w=npc.dog?{id:'chien',dog:1}:Object.assign({},npc,{likes:null});
 if(liked){if(first)moral(12);const L=tl(npc.dog?'gift.dog':'gift.love');say(w,[L[(Math.random()*L.length)|0],tt('gift.warm')+(first?' '+tt('ui.moralUp',{n:12}):'')],null,null,true);}
 else{if(first)moral(5);say(w,[tt(npc.dog?'gift.dogMeh':'gift.thanks')],null,null,true);}}

// ---------- Cartes ----------
function openCard(o){mode='card';const c=$('card');c.className='card'+(o.cls?' '+o.cls:'');$('cardTitle').textContent=o.title||'';
 const ic=$('cardIcon');const src=o.icon?iconURL(o.icon):o.aimg?animalIcon(o.aimg):o.portrait?portraitURL(o.portrait):null;ic.hidden=!src;if(src)ic.src=src;
 $('cardBody').innerHTML=o.html||'';const bx=$('cardBtns');bx.innerHTML='';cardBtns=o.buttons||[{t:tt('o.ok')}];
 cardBtns.forEach((b,k)=>{const el=document.createElement('button');el.textContent=b.t;if(k===0)el.className='primary';el.onclick=()=>{closeCard();b.f&&b.f();};bx.appendChild(el);});$('cardWrap').hidden=false;$('prompt').hidden=true;}
function closeCard(){$('cardWrap').hidden=true;if(mode==='card')mode='walk';}
function wakeCard(kind,msgs){let html='<p>'+tt('wake.'+kind)+'</p>';
 if(msgs&&msgs.length)html+='<ul class="wakel">'+msgs.map(m=>'<li>'+m+'</li>').join('')+'</ul>';
 if(kind==='gite'&&S.lastCard>S.replied){S.replied=S.lastCard;S.letterN++;moral(15);html+='<div class="letter"><p class="eyebrow">'+tt('letter.t')+'</p><p class="hand">'+fill(tl('letter.l')[(S.letterN-1)%tl('letter.l').length])+'</p><p class="sub">'+tt('ui.moralUp',{n:15})+'</p></div>';}
 openCard({title:tt('wake.t',{d:dateStr(S.day)}),html,buttons:[{t:tt('o.go')}]});}

// ---------- Panneaux ----------
let panelTab='sac',bagSel=null,resetArm=false;
function openPanel(tab){if(mode!=='walk'&&mode!=='panel')return;panelTab=tab||panelTab;mode='panel';$('panelWrap').hidden=false;$('prompt').hidden=true;renderPanel();}
function closePanel(){$('panelWrap').hidden=true;mode='walk';resetArm=false;}
function renderPanel(){document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{b.classList.toggle('on',b.dataset.tab===panelTab);b.textContent=tt('tab.'+b.dataset.tab);});const el=$('panelBody');
 if(panelTab==='sac'){const ids=Object.keys(S.inv).filter(i=>S.inv[i]>0);if(bagSel&&!S.inv[bagSel])bagSel=null;
  const st=ILLS.filter(n=>S.ill[n]).map(n=>'<span class="chip bad">'+tt('h.'+n)+'</span>').concat(Object.keys(S.prot).map(n=>'<span class="chip good">'+tt('h.prot.'+n)+'</span>'));
  const worn=['main','cou','tete'].filter(s=>S.eq[s]).map(s=>tt('it.'+S.eq[s])).join(', ');
  let det='<p class="sub">'+tt('ui.pickItem')+'</p>';
  if(bagSel){const it=ITEMS[bagSel],bt=[];if(it.eat)bt.push('<button class="primary" data-a="eat">'+tt('o.eat',{n:it.eat})+'</button>');if(it.use)bt.push('<button class="primary" data-a="use">'+tt('o.use')+'</button>');
   if(it.equip)bt.push('<button data-a="eq">'+tt(S.eq[it.equip]===bagSel?'o.unwear':'o.wear')+'</button>');
   det='<h4>'+tt('it.'+bagSel)+'</h4><p>'+tt('it.'+bagSel+'.d')+'</p><div class="acts">'+bt.join('')+'</div>';}
  el.innerHTML='<div class="status"><b>'+tt('ui.health')+'</b> '+(st.length?st.join(''):'<span class="sub">'+tt('ui.healthy')+'</span>')+(worn?'<span class="sub"> · '+tt('ui.wearing')+' '+worn+'</span>':'')+'</div>'+
   (ids.length?'<div class="slots">'+ids.map(i=>'<button class="slot'+(i===bagSel?' on':'')+(Object.values(S.eq).includes(i)?' worn':'')+'" data-i="'+i+'" aria-label="'+tt('it.'+i)+'"><img src="'+iconURL(i)+'" alt=""><b>'+S.inv[i]+'</b></button>').join('')+'</div>':'<p class="empty">'+tt('ui.bagEmpty')+'</p>')+
   '<div class="detail">'+det+'</div><p class="sub stats">'+tt('ui.stampsN',{n:S.stamps.length,c:S.stats.cards})+'</p>';
  el.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{bagSel=b.dataset.i;renderPanel();});
  el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a,it=ITEMS[bagSel];
   if(a==='eat'){S.energy=Math.min(energyCap(),S.energy+it.eat);take(bagSel);toast(tt('ui.yum',{n:it.eat}),bagSel);}
   if(a==='use')useItem(bagSel);
   if(a==='eq'){S.eq[it.equip]=S.eq[it.equip]===bagSel?null:bagSel;if(S.eq.tete==='chapeau')S.sun=Math.max(0,S.sun-.5);}
   refreshHUD();renderPanel();});}
 else if(panelTab==='fab'){el.innerHTML='<div class="recipes">'+RECIPES.filter(r=>!r.lock||S.flags[r.lock]).map(r=>{const ok=Object.entries(r.need).every(([i,n])=>(S.inv[i]||0)>=n);
   return '<div class="recipe"><img src="'+iconURL(r.id)+'" alt=""><div><h4>'+tt('it.'+r.id)+'</h4><p class="sub">'+tt('rc.'+r.id)+'</p><div class="need">'+Object.entries(r.need).map(([i,n])=>'<span class="'+((S.inv[i]||0)>=n?'have':'miss')+'"><img src="'+iconURL(i)+'" alt="">'+tt('it.'+i)+' '+(S.inv[i]||0)+'/'+n+'</span>').join('')+'</div></div><button class="primary" data-r="'+r.id+'"'+(ok?'':' disabled')+'>'+tt('o.make')+'</button></div>';}).join('')+'</div>'+(RECIPES.some(r=>r.lock&&!S.flags[r.lock])?'<p class="sub">'+tt('ui.moreRecipes')+'</p>':'');
  el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const r=RECIPES.find(x=>x.id===b.dataset.r);for(const[i,n]of Object.entries(r.need))take(i,n);add(r.id,1);if(!S.flags['made_'+r.id]){S.flags['made_'+r.id]=1;log('made',{i:r.id});}renderPanel();});}
 else if(panelTab==='quetes'){const qs=Object.keys(S.quests);el.innerHTML=qs.length?'<ul class="quests">'+qs.sort((a,b)=>(S.quests[a]==='done')-(S.quests[b]==='done')).map(q=>'<li class="'+S.quests[q]+'"><h4>'+tt('q.'+q+'.n')+(S.quests[q]==='done'?' · '+tt('ui.done'):'')+'</h4><p>'+tt('q.'+q+'.d')+'</p></li>').join('')+'</ul>':'<p class="empty">'+tt('ui.noQuest')+'</p>';}
 else if(panelTab==='comp'){const ids=COMP_ORDER.filter(id=>S.comp[id]);
  el.innerHTML=ids.length?'<div class="comps">'+ids.map(id=>{const c=S.comp[id];return '<div class="compc"><img src="'+portraitURL(id)+'" alt=""><div><h4>'+tt('n.'+id)+' <span class="sub">· '+tt('cs.'+c.st)+'</span></h4><p class="rel">'+relTitle(id)+'</p>'+heartsHTML(c.aff)+'<p class="sub">'+tt('cp.'+id)+'</p></div></div>';}).join('')+'</div><p class="sub">'+tt('ui.compHelp')+'</p>':'<p class="empty">'+tt('ui.noComp')+'</p>';}
 else if(panelTab==='carnet'){const an=JOURNAL_ANIMALS.map(a=>'<button class="jn'+(S.seen[a]?'':' unk')+'" data-j="'+a+'"><img src="'+animalIcon(a)+'" alt=""><span>'+(S.seen[a]?tt('an.'+a):'?')+'</span></button>').join('');
  const pl=Object.keys(PLANTS).map(p=>'<button class="jn'+(S.plants[p]?'':' unk')+'" data-p="'+p+'"><img src="'+iconURL(p)+'" alt=""><span>'+(S.plants[p]?tt('it.'+p)+(PLANTS[p]?'':' ⚠'):'?')+'</span></button>').join('');
  el.innerHTML='<h4>'+tt('ui.animals')+' · '+Object.keys(S.seen).length+'/'+JOURNAL_ANIMALS.length+'</h4><div class="journal">'+an+'</div><h4>'+tt('ui.plants')+' · '+Object.keys(S.plants).length+'/'+Object.keys(PLANTS).length+'</h4><div class="journal">'+pl+'</div><div class="detail" id="jdet"><p class="sub">'+tt('ui.journalHelp')+'</p></div>';
  el.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{const a=b.dataset.j;$('jdet').innerHTML=S.seen[a]?'<h4>'+tt('an.'+a)+'</h4><p>'+tt('an.'+a+'.f')+'</p>':'<p class="sub">'+tt('ui.notSeen')+'</p>';});
  el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const p=b.dataset.p;$('jdet').innerHTML=S.plants[p]?'<h4>'+tt('it.'+p)+'</h4><p>'+tt('pl.'+p+'.clue')+'</p><p class="sub">'+tt(PLANTS[p]?'ui.edible':'ui.toxic')+'</p>':'<p class="sub">'+tt('ui.notSeen')+'</p>';});}
 else if(panelTab==='opt'){el.innerHTML='<h4>'+tt('ui.language')+'</h4><div class="langs">'+LANGS.map(([c,n])=>'<button data-l="'+c+'" class="'+(c===LG?'on':'')+'">'+n+'</button>').join('')+'</div><h4>'+tt('ui.controls')+'</h4><p class="sub">'+tt('ui.help')+'</p><h4>'+tt('ui.restartT')+'</h4><button id="resetBtn">'+tt(resetArm?'ui.restartSure':'ui.restart')+'</button>';
  el.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{setLang(b.dataset.l);hudKey='';refreshHUD();renderPanel();});
  $('resetBtn').onclick=()=>{if(!resetArm){resetArm=true;renderPanel();return;}resetArm=false;closePanel();try{localStorage.removeItem(SAVEKEY);}catch(e){}titleScreen();};}
}

// ---------- Commandes ----------
const KM={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d'};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'){if(e.key==='Enter'){const b=$('screenBtns').querySelector('button');b&&b.click();}return;}
 const k=KM[e.code];if(k){inp[k]=1;e.preventDefault();if(mode==='dialog')moveSel(k==='u'||k==='l'?-1:1);if(mode==='mini'&&MINI&&MINI.key)MINI.key(k);}
 if(e.code==='ShiftLeft'||e.code==='ShiftRight')inp.run=1;
 if(e.code==='Space'){e.preventDefault();if(e.repeat)return;if(mode==='walk')jump();else action();}
 if(e.code==='Enter'||e.code==='KeyE'){e.preventDefault();if(!e.repeat)action();}
 const tabs={KeyI:'sac',KeyC:'fab',KeyJ:'quetes',KeyK:'comp',KeyN:'carnet'};if(tabs[e.code])mode==='panel'&&panelTab===tabs[e.code]?closePanel():openPanel(tabs[e.code]);
 if(e.code==='Escape'){if(mode==='panel')closePanel();else if(mode==='card'&&cardBtns.length===1){closeCard();cardBtns[0].f&&cardBtns[0].f();}}});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)inp[k]=0;if(e.code==='ShiftLeft'||e.code==='ShiftRight')inp.run=0;if(mode==='mini'&&MINI&&MINI.keyup&&(e.code==='Space'||e.code==='Enter'||e.code==='KeyE'))MINI.keyup();});
addEventListener('blur',()=>{inp.l=inp.r=inp.u=inp.d=inp.run=0;});
function action(){if(mode==='walk')interact();else if(mode==='dialog')advance();else if(mode==='mini'&&MINI&&MINI.action)MINI.action();else if(mode==='card'){const b=$('cardBtns').querySelector('button');b&&b.click();}else if(mode==='travel')travelAction();}
document.querySelectorAll('[data-dir]').forEach(b=>{const k=b.dataset.dir;const on=e=>{e.preventDefault();inp[k]=1;b.classList.add('on');if(mode==='dialog')moveSel(k==='u'||k==='l'?-1:1);if(mode==='mini'&&MINI&&MINI.key)MINI.key(k);},off=()=>{inp[k]=0;b.classList.remove('on');};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);});
$('btnA').addEventListener('pointerdown',e=>{e.preventDefault();action();});
$('btnA').addEventListener('pointerup',()=>{if(mode==='mini'&&MINI&&MINI.keyup)MINI.keyup();});
$('btnB').addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='walk')jump();else if(mode==='mini'&&MINI){if(MINI.jump)MINI.jump();else if(MINI.action)MINI.action();}});
$('btnRun').addEventListener('click',()=>{inp.runT=inp.runT?0:1;$('btnRun').classList.toggle('on',!!inp.runT);});
$('dlg').addEventListener('click',()=>{if(mode==='dialog')advance();});
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const t=b.dataset.open;mode==='panel'&&panelTab===t?closePanel():openPanel(t);});
document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.onclick=()=>{panelTab=b.dataset.tab;resetArm=false;renderPanel();});
$('panelClose').onclick=closePanel;
cv.addEventListener('pointerdown',()=>{if(mode==='dialog')advance();else if(mode==='mini'&&MINI&&MINI.action)MINI.action();});
cv.addEventListener('pointerup',()=>{if(mode==='mini'&&MINI&&MINI.keyup)MINI.keyup();});

// ---------- Écran titre ----------
function screen(html,btns,cls){const s=$('screen');s.className='screen '+(cls||'');$('screenBody').innerHTML=html;const bx=$('screenBtns');bx.innerHTML='';btns.forEach((b,k)=>{const el=document.createElement('button');el.textContent=b.t;if(k===0)el.className='primary';el.onclick=b.f;bx.appendChild(el);});s.hidden=false;}
function closeScreen(){$('screen').hidden=true;$('stage').classList.remove('intitle');}
function titleScreen(){let saved=null;try{saved=JSON.parse(localStorage.getItem(SAVEKEY)||'null');}catch(e){}
 const nm=(saved&&saved.name)||($('nameIn')&&$('nameIn').value)||'Lou';
 S=newState(nm);W=buildWorld(0);mode='title';$('stage').classList.add('intitle');$('dlg').hidden=true;$('cardWrap').hidden=true;$('panelWrap').hidden=true;$('travel').hidden=true;
 const h='<div class="langs top">'+LANGS.map(([c,n])=>'<button data-l="'+c+'" class="'+(c===LG?'on':'')+'">'+n+'</button>').join('')+'</div><p class="eyebrow">'+tt('ui.tag')+'</p><h1>'+tt('ui.title')+'</h1><p class="lede">'+tt('ui.lede')+'</p><label class="namefield" for="nameIn">'+tt('ui.name')+'<input id="nameIn" maxlength="14" value="'+nm.replace(/"/g,'')+'" autocomplete="off"></label>';
 const btns=[{t:tt('ui.start'),f:()=>{const n=($('nameIn').value||'').trim()||'Lou';S=newState(n);closeScreen();loadStage(0,true);}}];
 if(saved&&saved.v===2)btns.push({t:tt('ui.continue',{n:tt('st.'+STAGES[saved.stage].id)}),f:()=>{S=saved;closeScreen();loadStage(S.stage);}});
 screen(h,btns,'title');
 $('screenBody').querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const v=$('nameIn').value;setLang(b.dataset.l);titleScreen();$('nameIn').value=v;});}
function boot(){initLang();titleScreen();requestAnimationFrame(loop);}

'use strict';
// ===== Données : objets, recettes, plantes, animaux, compagnons, personnages, étapes =====
const ITEMS={
 coquillage:{gift:1},ficelle:{gift:1},branche:{gift:1},
 baton:{gift:1,equip:'main'},collier:{gift:1,equip:'cou'},couronne:{gift:1,equip:'tete'},chapeau:{gift:1,equip:'tete'},
 myrtilles:{eat:12,gift:1},ail:{eat:8,gift:1},cepe:{eat:12,gift:1},mures:{eat:10,gift:1},chataigne:{eat:10,gift:1},noix:{eat:10,gift:1},
 thym:{gift:1},saule:{gift:1},miel:{eat:15,gift:1},plantain:{gift:1,use:'plantain'},paille:{gift:0},bois:{gift:0},
 remede:{use:'remede'},sirop:{use:'sirop'},baume:{use:'baume'},
 truite:{gift:1},poisson:{eat:20,gift:1},pain:{eat:25,gift:1},fromage:{eat:30,gift:1},fleur:{gift:1},
 credenciale:{},caillou:{},clochette:{},coquilleh:{}
};
const FOODS=['pain','fromage','poisson','miel','myrtilles','mures','cepe','chataigne','noix','ail'];
const RECIPES=[
 {id:'baton',need:{branche:1,coquillage:1,ficelle:1}},
 {id:'collier',need:{coquillage:3,ficelle:1}},
 {id:'couronne',need:{fleur:3}},
 {id:'chapeau',need:{paille:3,ficelle:1}},
 {id:'baume',need:{plantain:2},lock:'r_baume'},
 {id:'sirop',need:{thym:1,miel:1},lock:'r_sirop'},
 {id:'remede',need:{saule:1,thym:1,miel:1},lock:'r_remede'}
];
const PLANTS={myrtilles:1,belladone:0,ail:1,muguet:0,cepe:1,amanite:0,mures:1};
const JOURNAL_ANIMALS=['cigogne','chat','ecureuil','papillon','renard','vache','libellule','heron','chevre','chien','mouton','vautour','loup','truite'];
const ILLS=['ampoules','piqure','rhume','insolation','fievre'];
// préférences des compagnons : gain d'affection par activité
const COMP={
 noe:{look:'noe',likes:['pain','miel','noix','chataigne'],pref:{race:14,climb:14,sing:6,story:8,stars:6,meal:6,dance:8},rel:1},
 hans:{look:'hans',likes:['pain','fromage','miel'],pref:{story:14,stars:14,sing:8,meal:8,race:2,dance:4},rel:1},
 mateo:{look:'mateo',likes:['pain','fromage','miel','poisson','mures','myrtilles'],pref:{race:14,meal:12,sing:8,story:8,stars:6,dance:8},rel:1},
 lucia:{look:'lucia',likes:['fleur','couronne','miel'],pref:{sing:16,dance:14,stars:8,story:8,meal:6},rel:1},
 chien:{dog:1,likes:['pain','fromage','poisson'],pref:{play:16,meal:10,sing:3,story:3,stars:3,dance:6,race:8},rel:0}
};
const COMP_ORDER=['noe','hans','mateo','lucia','chien'];

// ---------- Personnages (logique ; textes dans lang-*.js) ----------
const NPCS={
 maman:{look:'maman',likes:['fleur','couronne'],talk(G){if(!G.f.maman){G.f.maman=1;G.sayK(this,'d.maman.a',null,()=>{G.add('pain',2);G.add('ficelle',2);G.add('caillou',1);G.add('sirop',1);G.f.r_sirop=1;G.log('depart');});}else G.sayK(this,'d.maman.b');}},
 frere:{look:'frere',likes:['pain','couronne','miel'],talk(G){if(!G.has('credenciale')){G.sayK(this,'d.frere.a',null,()=>{G.add('credenciale',1);G.f.r_baume=1;G.toast(G.t('ui.newRecipe',{x:G.t('it.baume')}),'baume');});}else G.sayK(this,'d.frere.b');}},
 bucheron:{look:'bucheron',likes:['myrtilles','pain','fromage'],talk(G){G.sayK(this,'d.bucheron.a');}},
 noe:{look:'noe',likes:['pain','miel','noix'],talk(G){
  if(G.skill('climb')&&!G.inParty('noe'))G.sayK(this,'d.noe.c',[{t:G.t('o.walkTogether'),f:()=>G.joinComp('noe')},{t:G.t('o.alone')}]);
  else if(G.f.noeTeach)G.sayK(this,'d.noe.b');
  else G.sayK(this,'d.noe.a',[{t:G.t('o.noe.yes'),f:()=>{G.f.noeTeach=1;G.compMet('noe');G.setQ('grimper','active');}},{t:G.t('o.later')}]);}},
 marthe:{look:'fermiere',likes:['fleur','couronne','pain'],talk(G){const q=G.q.clochette;
  if(!q)G.sayK(this,'d.marthe.a',[{t:G.t('o.help'),f:()=>G.setQ('clochette','active')},{t:G.t('o.later')}]);
  else if(q==='active'&&G.has('clochette'))G.sayK(this,'d.marthe.c',null,()=>{G.take('clochette');G.add('miel',1);G.add('fromage',1);G.setQ('clochette','done');G.moral(12);G.log('clochette');});
  else if(q==='active')G.sayK(this,'d.marthe.b');else G.sayK(this,'d.marthe.d');}},
 emile:{look:'passeur',likes:['pain','fromage'],talk(G){G.sayK(this,G.partySize()?'d.emile.a':'d.emile.b');}},
 pierrot:{look:'pierrot',likes:['poisson','pain'],talk(G){const q=G.q.poisson;
  if(!q)G.sayK(this,'d.pierrot.a',[{t:G.t('o.dive'),f:()=>G.setQ('poisson','active')},{t:G.t('o.later')}]);
  else if(q==='active'&&G.has('truite'))G.sayK(this,'d.pierrot.c',null,()=>{G.take('truite');G.add('ficelle',1);G.setQ('poisson','done');G.moral(20);G.log('truite');G.seeAnimal('truite');});
  else if(q==='active')G.sayK(this,'d.pierrot.b');else G.sayK(this,'d.pierrot.d');}},
 odile:{look:'odile',likes:['thym','fleur','couronne','miel'],talk(G){const q=G.q.cueillette;
  if(!q)G.sayK(this,'d.odile.a',[{t:G.t('o.help'),f:()=>G.setQ('cueillette','active')},{t:G.t('o.later')}]);
  else if(q==='active'){const miss=['ail','cepe','mures'].filter(i=>!G.has(i));
   if(miss.length)G.say(this,G.tl('d.odile.miss',{list:miss.map(i=>G.t('it.'+i).toLowerCase()).join(', ')}));
   else G.sayK(this,'d.odile.done',null,()=>{['ail','cepe','mures'].forEach(i=>G.take(i));G.f.r_remede=1;G.f.r_sirop=1;G.add('plantain',2);G.setQ('cueillette','done');G.moral(15);G.log('odile');G.toast(G.t('ui.newRecipe',{x:G.t('it.remede')+', '+G.t('it.sirop')}),'remede');});}
  else G.sayK(this,'d.odile.after');}},
 hans:{look:'hans',likes:['pain','fromage','miel'],talk(G){const q=G.q.baton;
  if(q==='done')G.sayK(this,'d.hans.d',[{t:G.t('o.walkTogether'),f:()=>G.joinComp('hans')},{t:G.t('o.alone')}]);
  else if(q==='active'&&G.has('baton'))G.sayK(this,'d.hans.c',[{t:G.t('o.walkTogether'),f:()=>G.joinComp('hans')},{t:G.t('o.alone')}],()=>{G.take('baton');G.add('coquillage',2);G.setQ('baton','done');G.moral(15);G.aff('hans',15);G.log('hansStick');});
  else if(q==='active')G.sayK(this,'d.hans.b');
  else G.sayK(this,'d.hans.a',[{t:G.t('o.hans.yes'),f:()=>{G.setQ('baton','active');G.compMet('hans');}},{t:G.t('o.hans.no')}]);}},
 colette:{look:'colette',likes:['fleur','couronne','miel'],talk(G){const q=G.q.chat;
  if(!q)G.sayK(this,'d.colette.a',[{t:G.t('o.help'),f:()=>G.setQ('chat','active')},{t:G.t('o.later')}]);
  else if(q==='saved')G.sayK(this,'d.colette.c',null,()=>{G.add('miel',2);G.setQ('chat','done');G.moral(15);G.log('chat');});
  else if(q==='active')G.sayK(this,'d.colette.b');else G.sayK(this,'d.colette.d');}},
 gaspard:{look:'gaspard',likes:['pain','fromage'],talk(G){const q=G.q.chevre;
  if(!q)G.sayK(this,'d.gaspard.a',[{t:G.t('o.help'),f:()=>G.setQ('chevre','active')},{t:G.t('o.later')}]);
  else if(q==='active'&&G.f.goatFollow)G.sayK(this,'d.gaspard.c',null,()=>{G.f.goatFollow=0;G.f.goatHome=1;G.add('fromage',2);G.setQ('chevre','done');G.moral(15);G.log('chevre');});
  else if(q==='active')G.sayK(this,'d.gaspard.b');else G.sayK(this,'d.gaspard.d');}},
 gaston:{look:'gaston',likes:['pain','miel'],talk(G){const q=G.q.noix;
  if(!q)G.sayK(this,'d.gaston.a',[{t:G.t('o.help'),f:()=>G.setQ('noix','active')},{t:G.t('o.later')}]);
  else if(q==='active'&&G.f.noixDone)G.sayK(this,'d.gaston.c',null,()=>{G.add('fromage',1);G.add('ficelle',1);G.setQ('noix','done');G.moral(12);G.log('noix');});
  else if(q==='active')G.sayK(this,'d.gaston.b');else G.sayK(this,'d.gaston.d');}},
 marie:{look:'marie',likes:['fleur','couronne','miel'],talk(G){const q=G.q.collier;
  if(!q)G.sayK(this,'d.marie.a',[{t:G.t('o.promise'),f:()=>{G.setQ('collier','active');G.f.finis=1;G.sayK(G.npc('marie'),'d.marie.b',null,()=>G.add('ficelle',1));}},{t:G.t('o.dunno')}]);
  else G.sayK(this,'d.marie.c');}},
 mateo:{look:'mateo',likes:['pain','fromage','miel'],talk(G){if(!G.f.metMateo){G.f.metMateo=1;G.compMet('mateo');G.sayK(this,'d.mateo.a',[{t:G.t('o.yesPlease'),f:()=>G.joinComp('mateo')},{t:G.t('o.alone'),f:()=>G.sayK(G.npc('mateo'),'d.mateo.no')}]);}
  else G.sayK(this,'d.mateo.again',[{t:G.t('o.walkTogether'),f:()=>G.joinComp('mateo')},{t:G.t('o.alone')}]);}},
 benat:{look:'berger',likes:['pain','miel'],talk(G){if(!G.f.fromage){G.f.fromage=1;G.sayK(this,'d.benat.a',null,()=>G.add('fromage',2));}else G.sayK(this,'d.benat.b');}},
 lucia:{look:'lucia',likes:['fleur','couronne','miel'],talk(G){if(!G.f.lucia){G.f.lucia=1;G.compMet('lucia');G.sayK(this,'d.lucia.a',[{t:G.t('o.yesPlease'),f:()=>G.joinComp('lucia')},{t:G.t('o.alone')}],()=>G.add('coquillage',2));}
  else G.sayK(this,'d.lucia.again',[{t:G.t('o.walkTogether'),f:()=>G.joinComp('lucia')},{t:G.t('o.alone')}]);}},
 ramon:{look:'ramon',likes:['fleur','couronne'],talk(G){if(G.f.sick&&!G.f.gotMiel){G.f.gotMiel=1;const teach=!G.f.r_remede;G.f.r_remede=1;G.sayK(this,teach?'d.ramon.a':'d.ramon.a2',null,()=>G.add('miel',1));}else G.sayK(this,'d.ramon.b');}},
 mateoSick:{look:'mateo',talk(G){if(G.has('remede'))G.sayK(this,'d.sick.heal',null,()=>G.healMateo());else G.sayK(this,'d.sick.wait');}},
 rosa:{look:'rosa',likes:['fleur','couronne','collier'],talk(G){const q=G.q.collier;
  if(q==='active'&&G.has('collier'))G.sayK(this,'d.rosa.a',null,()=>{G.take('collier');G.setQ('collier','done');G.moral(30);G.log('rosa');});
  else if(q==='active')G.sayK(this,'d.rosa.b');else if(q==='done')G.sayK(this,'d.rosa.c');else G.sayK(this,'d.rosa.d');}}
};

// ---------- Thèmes ----------
const THEMES={
 alsace:{g:['#5aa23e','#4a8c33','#78be56'],p:['#c9a26b','#b08752','#ddb985'],fl:['#fff','#f2c94c','#e98aa0']},
 forest:{g:['#3f8a35','#326f2b','#5aa844'],p:['#9a7a52','#7d6040','#b8956a'],fl:['#f2c94c','#fff']},
 meadow:{g:['#62a843','#4f9137','#82c25a'],p:['#cfa86d','#b38c54','#e0bd86'],fl:['#c8392b','#fff','#8a7ad0','#f2c94c']},
 lande:{g:['#8aa04a','#728a3a','#a4b862'],p:['#e0cc94','#c7b07a','#efdcab'],fl:['#e98aa0','#b06ad0']},
 mountain:{g:['#5d9a48','#4a7f3a','#7db462'],p:['#a8957a','#8a7a62','#c2b096'],fl:['#fff','#f2c94c','#5a7ad0']},
 rioja:{g:['#9aa64e','#848f3e','#b4be66'],p:['#c4805a','#a86a48','#d89a72'],fl:['#c8392b','#f2c94c']},
 meseta:{g:['#d2b25a','#b8973f','#e6c977'],p:['#c99a6b','#ad7f53','#dbb184'],fl:['#c8392b','#8a5ad0']},
 galice:{g:['#3f9447','#2f7a38','#5ab060'],p:['#a99a7a','#8a7c60','#c4b696'],fl:['#f2c94c','#fff','#c88ad0']},
 coast:{g:['#7aa050','#638840','#94b866'],p:['#c4b28a','#a8966e','#dbc9a2'],fl:['#f2c94c','#e98aa0']}
};

// ---------- Étapes ----------
// side : chemins de traverse {x, dir:-1 haut / 1 bas, poi, gate:'climb'|'jump'|'run'}
const STAGES=[
 {id:'strasbourg',W:56,pb:10,amp:0,theme:'alsace',trees:['cherry','leaf'],dens:.07,tg:.08,travel:4,km:0,stamp:'cathedrale',
  feats:[{t:'town',x0:0,x1:26},{t:'vines',x0:30,x1:53,y0:2,y1:6},{t:'stream',x:46,w:1}],
  side:[{x:36,dir:1,poi:'view'}],picks:{fleur:3,plantain:2,bois:2},animals:{papillon:3},
  ents:[{k:'cathedral',x:13,y:7},{k:'house',v:'fr',x:4,y:7},{k:'house',v:'fr',x:21,y:7},{k:'house',v:'fr',x:6,y:17},{k:'house',v:'fr',x:19,y:17},{k:'post',x:9,y:8},{k:'nest',x:25,y:7},
   {k:'npc',id:'maman',x:3,y:9},{k:'npc',id:'frere',x:17,y:9},{k:'animal',sp:'chat',x:8,y:12},{k:'animal',sp:'chat2',x:23,y:12},{k:'sign',s:'jump',x:43,dy:-2}]},
 {id:'odile',W:86,pb:11,amp:2,theme:'forest',trees:['fir','fir','leaf'],dens:.2,tg:.04,travel:5,km:40,stamp:'sapin',
  feats:[{t:'ravine',x:40,w:2}],
  side:[{x:14,dir:-1,poi:'view',gate:'climb'},{x:58,dir:1,poi:'camp'},{x:72,dir:-1,poi:'cache'}],
  picks:{branche:3,bois:6,plantain:1,fleur:2},plants:{myrtilles:3,belladone:2},animals:{ecureuil:3,papillon:2,renard:1},
  ents:[{k:'npc',id:'bucheron',x:6,dy:-1},{k:'npc',id:'noe',x:11,dy:1},{k:'log',x:40},{k:'gite',x:78,dy:-2},{k:'post',x:81,dy:-1}]},
 {id:'ballons',W:88,pb:11,amp:2,theme:'mountain',trees:['fir','leaf'],dens:.1,rocks:.04,tg:.18,travel:5,km:110,stamp:'montagne',
  feats:[{t:'pond',x0:30,x1:40,y0:16,y1:19},{t:'stream',x:64,w:2}],
  side:[{x:20,dir:-1,poi:'view',gate:'climb'},{x:46,dir:1,poi:'cascade',gate:'jump'},{x:76,dir:-1,poi:'camp'}],
  picks:{fleur:3,thym:1,bois:4,plantain:1},animals:{vache:4,papillon:3,renard:1,ecureuil:1},
  ents:[{k:'pick',item:'clochette',x:54,y:20},{k:'wasps',x:56,dy:3},{k:'sign',s:'run',x:61,dy:-2},{k:'npc',id:'marthe',x:79,dy:2},{k:'gite',v:'stone',x:83,dy:-2},{k:'post',x:86,dy:-1}]},
 {id:'saone',W:84,pb:10,amp:1.5,theme:'meadow',trees:['leaf','willow','oak'],dens:.1,tg:.2,travel:5,km:200,stamp:'eau',
  feats:[{t:'pond',x0:14,x1:22,y0:16,y1:19},{t:'river',x:50,w:3,ford:1}],
  side:[{x:30,dir:-1,poi:'den'},{x:66,dir:1,poi:'camp'},{x:74,dir:-1,poi:'cache',gate:'jump'}],
  picks:{paille:4,plantain:2,bois:4,fleur:2},plants:{mures:2},animals:{libellule:3,papillon:3},
  ents:[{k:'animal',sp:'heron',x:18,y:15},{k:'npc',id:'emile',x:46,dy:-1},{k:'tree',t:'willow',x:47,dy:-3},{k:'pick',item:'saule',x:48,dy:2},{k:'pick',item:'saule',x:55,dy:-2},{k:'tree',t:'willow',x:56,dy:4},{k:'ford',x:49,to:54},{k:'ford',x:54,to:49},{k:'gite',x:78,dy:-2},{k:'post',x:81,dy:-1}]},
 {id:'morvan',W:86,pb:11,amp:2,theme:'forest',trees:['oak','fir','leaf'],dens:.2,tg:.04,travel:4,km:330,stamp:'foret',
  feats:[{t:'river',x:36,w:3,bridge:1},{t:'stream',x:62,w:1}],
  side:[{x:20,dir:1,poi:'camp'},{x:50,dir:-1,poi:'view',gate:'climb'},{x:74,dir:1,poi:'cache'}],
  picks:{bois:6,plantain:1,fleur:1,branche:1},plants:{cepe:2,amanite:2,myrtilles:2},animals:{ecureuil:3,renard:1,papillon:2},
  ents:[{k:'npc',id:'pierrot',x:33,dy:3},{k:'dive',x:35,dy:4},{k:'gite',x:80,dy:-2},{k:'post',x:83,dy:-1}]},
 {id:'vezelay',W:90,pb:10,amp:1.5,theme:'meadow',trees:['leaf','cherry','oak'],dens:.1,tg:.1,travel:6,km:420,stamp:'basilique',
  feats:[{t:'vines',x0:4,x1:12,y0:2,y1:5},{t:'town',x0:60,x1:82}],
  side:[{x:24,dir:1,poi:'cache'},{x:44,dir:-1,poi:'camp'}],
  picks:{fleur:3,plantain:2,bois:3},plants:{ail:2,muguet:2,cepe:1,amanite:2,mures:2,belladone:1},animals:{papillon:3,ecureuil:1},
  ents:[{k:'house',v:'fr',x:12,dy:-2},{k:'npc',id:'odile',x:15,dy:-1},{k:'npc',id:'hans',x:36,dy:2},{k:'basilique',x:71,y:7},{k:'npc',id:'colette',x:63,dy:2},{k:'tree',t:'oak',x:66,dy:5},{k:'treeclimb',x:66,dy:5,id:'chat'},
   {k:'animal',sp:'chat3',x:78,y:12},{k:'house',v:'fr',x:79,y:7},{k:'trig',ev:'noeBye',x:74},{k:'gite',x:85,dy:-2},{k:'post',x:88,dy:-1}]},
 {id:'loire',W:92,pb:9,amp:1.5,theme:'meadow',trees:['willow','leaf','oak'],dens:.09,tg:.28,travel:6,km:520,stamp:'fleuve',
  feats:[{t:'riverH',y0:17},{t:'stream',x:30,w:1},{t:'stream',x:70,w:2}],
  side:[{x:20,dir:-1,poi:'camp'},{x:50,dir:-1,poi:'view'}],
  picks:{saule:2,paille:3,plantain:2,bois:4,fleur:2},animals:{libellule:3,papillon:2},
  ents:[{k:'npc',id:'gaspard',x:12,dy:-1},{k:'goat',x:58,y:3},{k:'animal',sp:'heron',x:40,y:15},{k:'animal',sp:'heron',x:80,y:15},{k:'gite',x:86,dy:-2},{k:'post',x:89,dy:-1}]},
 {id:'limousin',W:90,pb:10,amp:1.5,theme:'meadow',trees:['chestnut','leaf','oak'],dens:.13,tg:.12,travel:6,km:700,stamp:'chataigne',
  feats:[{t:'river',x:56,w:3,ford:1}],
  side:[{x:22,dir:1,poi:'camp'},{x:40,dir:-1,poi:'cascade',gate:'jump'},{x:76,dir:1,poi:'cache'}],
  picks:{chataigne:4,plantain:3,bois:4,fleur:2},plants:{mures:2},animals:{ecureuil:3,papillon:3,renard:1},
  ents:[{k:'dog',x:14,dy:3},{k:'wasps',x:30,dy:-2},{k:'wasps',x:68,dy:3},{k:'ford',x:55,to:60},{k:'ford',x:60,to:55},{k:'gite',x:84,dy:-2},{k:'post',x:87,dy:-1}]},
 {id:'perigord',W:92,pb:11,amp:2,theme:'forest',trees:['oak','chestnut','leaf'],dens:.16,tg:.05,travel:6,km:880,stamp:'grotte',
  side:[{x:30,dir:-1,poi:'cave'},{x:52,dir:1,poi:'camp'},{x:70,dir:-1,poi:'view',gate:'climb'}],
  picks:{bois:5,plantain:1,chataigne:2},plants:{cepe:3,amanite:3},animals:{ecureuil:2,papillon:2,renard:1},
  ents:[{k:'house',v:'fr',x:8,dy:-2},{k:'npc',id:'gaston',x:12,dy:-1},{k:'tree',t:'oak',x:17,dy:4},{k:'treeclimb',x:17,dy:4,id:'noix'},{k:'animal',sp:'chat',x:6,dy:2},{k:'gite',x:86,dy:-2},{k:'post',x:89,dy:-1}]},
 {id:'landes',W:88,pb:10,amp:1,theme:'lande',trees:['umbrella'],dens:.13,tg:.15,travel:5,km:1080,stamp:'pin',
  feats:[{t:'pond',x0:28,x1:40,y0:16,y1:18},{t:'stream',x:50,w:1},{t:'stream',x:62,w:2}],
  side:[{x:20,dir:-1,poi:'camp'},{x:72,dir:1,poi:'cache'}],
  picks:{plantain:2,bois:3,fleur:1},animals:{libellule:3,ecureuil:2,papillon:2,renard:1},
  ents:[{k:'house',v:'lande',x:9,dy:-2},{k:'npc',id:'marie',x:12,dy:-1},{k:'cater',x:24},{k:'pick',item:'coquillage',x:30,y:15},{k:'pick',item:'coquillage',x:34,y:15},{k:'pick',item:'coquillage',x:38,y:15},{k:'cater',x:46},{k:'sign',s:'craste',x:48,dy:-2},{k:'npc',id:'mateo',x:56,dy:-1},{k:'gite',x:82,dy:-2},{k:'post',x:85,dy:-1}]},
 {id:'basque',W:72,pb:10,amp:1.5,theme:'mountain',trees:['leaf','oak'],dens:.08,tg:.1,travel:1,km:1250,stamp:'coquille',
  feats:[{t:'town',x0:30,x1:58}],
  side:[{x:16,dir:1,poi:'view'},{x:64,dir:-1,poi:'cache'}],
  picks:{fleur:2,plantain:1,bois:2},animals:{mouton:4,papillon:2},
  ents:[{k:'npc',id:'benat',x:10,dy:-1},{k:'house',v:'basque',x:34,y:7},{k:'house',v:'basque',x:47,y:7},{k:'house',v:'basque',x:41,y:16},{k:'animal',sp:'chat',x:38,y:12},{k:'animal',sp:'chat2',x:52,y:12},{k:'trig',ev:'hansBye',x:44},{k:'gite',v:'basque',x:54,y:16},{k:'post',x:57,dy:-1}]},
 {id:'pyrenees',W:96,pb:11,amp:3,theme:'mountain',trees:['fir','leaf'],dens:.1,rocks:.07,slope:1,tg:.05,travel:6,km:1260,stamp:'montagne',
  side:[{x:24,dir:-1,poi:'view',gate:'climb'},{x:78,dir:1,poi:'camp'}],
  picks:{thym:4,fleur:2,bois:3,plantain:1},animals:{mouton:5,vautour:3,papillon:2},
  ents:[{k:'trig',ev:'storm',x:40},{k:'frontier',x:64,dy:-2},{k:'trig',ev:'border',x:65},{k:'gite',x:90,dy:-2},{k:'post',x:93,dy:-1}]},
 {id:'rioja',W:92,pb:10,amp:1.5,theme:'rioja',trees:['olive','leaf'],dens:.06,tg:.05,hot:1,travel:7,km:1330,stamp:'raisin',
  feats:[{t:'vines',x0:6,x1:30,y0:1,y1:6},{t:'vines',x0:62,x1:80,y0:15,y1:20},{t:'river',x:50,w:2,ford:1}],
  side:[{x:36,dir:-1,poi:'camp'},{x:76,dir:-1,poi:'view'}],
  picks:{paille:4,thym:2,fleur:2,bois:2},animals:{papillon:2},
  ents:[{k:'npc',id:'lucia',x:18,dy:2},{k:'ford',x:49,to:53},{k:'ford',x:53,to:49},{k:'church',x:84,dy:-2},{k:'nest',x:80,dy:-2},{k:'animal',sp:'chat',x:86,dy:3},{k:'gite',v:'es',x:88,dy:4},{k:'post',x:90,dy:-1}]},
 {id:'meseta',W:96,pb:10,amp:1,theme:'meseta',trees:['olive'],dens:.035,tg:0,hot:1,travel:8,km:1500,stamp:'soleil',
  feats:[{t:'river',x:56,w:1,bridge:1}],
  side:[{x:30,dir:1,poi:'camp'},{x:70,dir:-1,poi:'cache'}],
  picks:{paille:4,thym:3,bois:2},animals:{papillon:2},
  ents:[{k:'mateoSick',x:6,dy:-1},{k:'borne',x:12,dy:-1},{k:'hives',x:24,dy:-2},{k:'npc',id:'ramon',x:27,dy:-1},{k:'tree',t:'willow',x:54,dy:-3},{k:'pick',item:'saule',x:54,dy:2},{k:'pick',item:'saule',x:58,dy:-2},{k:'tree',t:'willow',x:59,dy:4},{k:'nest',x:80,dy:-3},{k:'borne',x:76,dy:2},{k:'gite',v:'es',x:90,dy:-2},{k:'post',x:93,dy:-1}]},
 {id:'leon',W:96,pb:11,amp:2.5,theme:'mountain',trees:['fir','chestnut','oak'],dens:.12,rocks:.05,slope:1,mist:1,wolves:1,tg:.1,travel:7,km:1760,stamp:'croix',
  side:[{x:30,dir:1,poi:'view',gate:'climb'},{x:56,dir:-1,poi:'camp'},{x:72,dir:1,poi:'cache'}],
  picks:{chataigne:3,bois:5,plantain:1,thym:1},animals:{vache2:3,ecureuil:2,renard:1},
  ents:[{k:'cruz',x:16,dy:-2},{k:'trig',ev:'galiceIn',x:80},{k:'palloza',x:84,dy:-2},{k:'palloza',x:88,dy:4},{k:'gite',v:'stone',x:91,dy:-2},{k:'post',x:94,dy:-1}]},
 {id:'galice',W:98,pb:10,amp:1,theme:'galice',trees:['lush','euca','lush'],dens:.16,rain:1,wolves:1,tg:.08,travel:0,endX:88,km:1920,stamp:'coquille',
  feats:[{t:'town',x0:80,x1:97},{t:'stream',x:40,w:1}],
  side:[{x:24,dir:1,poi:'camp'},{x:56,dir:-1,poi:'view'}],
  picks:{fleur:2,plantain:2,bois:3,chataigne:1},animals:{vache2:3,papillon:1},
  ents:[{k:'horreo',x:10,dy:-2},{k:'horreo',x:34,dy:3},{k:'borne',x:46,dy:-1},{k:'house',v:'es',x:70,dy:-2},{k:'animal',sp:'chat',x:84,y:13},{k:'cathedral2',x:93,y:7}]},
 {id:'finisterre',W:40,pb:7,amp:1,theme:'coast',trees:['bush','leaf'],dens:.05,rocks:.05,tg:0,sunset:1,travel:0,km:2050,stamp:'phare',
  feats:[{t:'ocean',x0:33,y0:10,x1:20}],side:[],picks:{},animals:{},
  ents:[{k:'npc',id:'rosa',x:14,dy:-1},{k:'lighthouse',x:27,dy:-2},{k:'borne0',x:31,dy:0}]}
];
const KM_END=2050,KM_FINIS=2140;

'use strict';
// ===== Génération d'une étape : chemin principal, chemins de traverse, hors-piste, rivières =====
// tuiles : 0 herbe · 1 chemin · 2 eau · 3 sable · 4 herbe haute · 5 sentier · 6 pont · 7 pavés · 8 océan · 9 vigne · 10 ruisseau (à sauter) · 11 falaise
const WH=22;
function buildWorld(i){
 const D=STAGES[i],Wt=D.W,H=WH,r=rng(4242+i*977),N=Wt*H;
 const tiles=new Uint8Array(N),solid=new Uint8Array(N),hop=new Uint8Array(N),wall=new Uint8Array(N),keep=new Uint8Array(N);
 const PY=x=>Math.round(D.pb+(D.amp||0)*Math.sin(x*.13+i*1.7));
 const inb=(x,y)=>x>=0&&x<Wt&&y>=0&&y<H;
 const set=(x,y,v)=>{if(inb(x,y))tiles[y*Wt+x]=v;};
 const get=(x,y)=>inb(x,y)?tiles[y*Wt+x]:-1;
 for(let x=0;x<Wt;x++){const a=PY(x),b=x?PY(x-1):a;for(let y=Math.min(a,b);y<=Math.max(a,b)+1;y++)set(x,y,1);}
 const w={D,i,Wt,H,tiles,solid,hop,PY,get,ents:[],trees:[],cam:0,camY:0,drops:[],birds:[]};
 const pois=[];
 // chemins de traverse
 (D.side||[]).forEach((s,si)=>{
  const dir=s.dir,x0=s.x;let x=x0,y=dir<0?PY(x0)-1:PY(x0)+2;const yT=dir<0?3:H-4;
  while(y!==yT){if(get(x,y)===0)set(x,y,5);if(r()<.28){const nx=clamp(x+(r()<.5?-1:1),x0-2,x0+2);if(get(nx,y)===0)set(nx,y,5);x=nx;}y+=dir;}
  set(x,y,5);set(x,y+dir,5);const xe=x;
  const pY=yT+(dir<0?0:1);let yg=null;
  if(s.gate){yg=Math.round((dir<0?PY(x0)-1:PY(x0)+2)*.5+yT*.5);
   const r0=dir<0?0:yg,r1=dir<0?yg:H-1;
   for(let yy=r0;yy<=r1;yy++){wall[yy*Wt+xe-6]=1;wall[yy*Wt+xe+6]=1;}
   if(s.gate==='jump'||s.gate==='run'){const n=s.gate==='run'?2:1;for(let k=0;k<n;k++)for(let xx=xe-5;xx<=xe+5;xx++)set(xx,yg+k*dir,10);}
   if(s.gate==='climb'){for(let k=0;k<2;k++)for(let xx=xe-5;xx<=xe+5;xx++)set(xx,yg+k*dir,11);}
  }
  pois.push({poi:s.poi,x:xe,y:pY,gate:s.gate,yg,dir,si});
 });
 // éléments
 for(const f of D.feats||[]){
  if(f.t==='town')for(let x=f.x0;x<=f.x1;x++)for(let y=D.pb-2;y<=D.pb+3;y++)set(x,y,7);
  if(f.t==='vines')for(let x=f.x0;x<=f.x1;x++)for(let y=f.y0;y<=f.y1;y++)if(get(x,y)===0&&(y-f.y0)%2===0)set(x,y,9);
  if(f.t==='stream')for(let x=f.x;x<f.x+f.w;x++)for(let y=0;y<H;y++){const t=get(x,y);if(t!==2)set(x,y,10);}
  if(f.t==='ravine'||f.t==='river')for(let x=f.x;x<f.x+f.w;x++)for(let y=0;y<H;y++){const t=get(x,y);set(x,y,(f.bridge&&t===1)?6:2);}
  if(f.t==='pond'){for(let x=f.x0-1;x<=f.x1+1;x++)for(let y=f.y0-1;y<=f.y1+1;y++)if(get(x,y)===0||get(x,y)===4)set(x,y,3);for(let x=f.x0;x<=f.x1;x++)for(let y=f.y0;y<=f.y1;y++)set(x,y,2);}
  if(f.t==='riverH'){for(let x=0;x<Wt;x++){for(let y=f.y0;y<H;y++)set(x,y,2);for(let y=f.y0-2;y<f.y0;y++)if(get(x,y)===0)set(x,y,3);}}
  if(f.t==='ocean'){for(let x=0;x<Wt;x++)for(let y=0;y<H;y++)if(x>=f.x0||(y>=f.y0&&x>=f.x1))set(x,y,8);
   for(let pass=0;pass<2;pass++){const sn=[];for(let x=0;x<Wt;x++)for(let y=0;y<H;y++){const t=get(x,y);if(t!==0&&t!==1)continue;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1]]){const n=get(x+a,y+b);if(n===8||(pass&&n===3&&t===0&&r()<.5)){sn.push([x,y]);break;}}}for(const[x,y]of sn)if(get(x,y)===0)set(x,y,3);}}
 }
 // cascade : petit bassin
 for(const p of pois)if(p.poi==='cascade')for(let xx=p.x-1;xx<=p.x+1;xx++)for(let k=0;k<2;k++){const yy=p.dir<0?1+k:H-2-k;set(xx,yy,2);}
 // herbe haute (hors du chemin)
 const tg=D.tg||0;
 if(tg>0){const cell=5,nz=(x,y)=>{const gx=Math.floor(x/cell),gy=Math.floor(y/cell),fx=x/cell-gx,fy=y/cell-gy,h=(a,b)=>hash(a+i*71,b+i*13),s=t=>t*t*(3-2*t),a=h(gx,gy),b=h(gx+1,gy),c=h(gx,gy+1),d=h(gx+1,gy+1);return(a+(b-a)*s(fx))*(1-s(fy))+(c+(d-c)*s(fx))*s(fy);};
  for(let y=0;y<H;y++)for(let x=0;x<Wt;x++){if(get(x,y)!==0)continue;if(Math.abs(y-PY(x)-.5)<2.5)continue;if(nz(x,y)>1-tg*1.6)set(x,y,4);}}
 for(let k=0;k<N;k++){const t=tiles[k];if(t===2||t===8||t===9||t===11)solid[k]=1;if(t===10)hop[k]=1;}
 if(D.endX!=null)for(let y=0;y<H;y++)solid[y*Wt+Wt-1]=1;
 // zones à garder dégagées
 const markKeep=(x,y,rad)=>{for(let b=-rad;b<=rad;b++)for(let a=-rad;a<=rad;a++)if(inb(x+a,y+b))keep[(y+b)*Wt+x+a]=1;};
 for(let y=0;y<H;y++)for(let x=0;x<Wt;x++){const t=tiles[y*Wt+x];if(t===1||t===5||t===6||t===7)markKeep(x,y,1);if(t===10||t===11)markKeep(x,y,0);}
 for(const p of pois)markKeep(p.x,p.y,2);
 // entités placées à la main
 const used=[];
 const addEnt=(e,x,y,id)=>{const o=makeEnt(e,x,y,i,id);if(!o)return null;w.ents.push(o);used.push([x,y]);
  if(o.fw){const x0=x-Math.floor(o.fw/2);for(let a=0;a<o.fw;a++)for(let b=0;b<o.fh;b++){const xx=x0+a,yy=y-b;if(inb(xx,yy))solid[yy*Wt+xx]=1;}for(let a=-1;a<=o.fw;a++)for(let b=-o.fh-2;b<=1;b++)markKeep(x0+a,y+b,0);}
  else markKeep(x,y,1);return o;};
 D.ents.forEach((e,idx)=>{const x=e.x,y=e.y!=null?e.y:PY(x)+(e.dy||0);
  if(e.k==='tree'){w.trees.push({x:x*T+8,y:(y+1)*T-2,tx:x,ty:y,img:getTree(e.t,x)});solid[y*Wt+x]=1;markKeep(x,y,1);return;}
  addEnt(e,x,y,'h'+idx);});
 // points d'intérêt des chemins de traverse
 pois.forEach((p,n)=>{const id='poi'+n;
  if(p.poi==='cascade')addEnt({k:'cascade'},p.x,p.dir<0?1:H-3,id);
  else addEnt({k:p.poi},p.x,p.y,id);
  if(p.gate==='climb'){const base=p.yg-p.dir,top=p.yg+2*p.dir;addEnt({k:'climb',to:[p.x,top],h:10},p.x,base,id+'c');addEnt({k:'climb',to:[p.x,base],h:10,down:1},p.x,top,id+'d');}
  if(p.poi==='den')addEnt({k:'animal',sp:'renard',den:1},p.x+2,p.y,id+'f');
 });
 // arbres des haies (murs des poches)
 for(let y=0;y<H;y++)for(let x=0;x<Wt;x++){const k=y*Wt+x;if(!wall[k]||tiles[k]===2)continue;const ty=D.trees[(r()*D.trees.length)|0];w.trees.push({x:x*T+8,y:(y+1)*T-2,tx:x,ty:y,img:getTree(ty==='umbrella'||ty==='euca'?'bush':ty,(r()*5)|0)});solid[k]=1;tiles[k]=0;hop[k]=0;}
 // placement procédural
 let pc=0;
 const spot=(o)=>{for(let a=0;a<80;a++){const x=3+((r()*(Wt-7))|0),y=1+((r()*(H-2))|0),k=y*Wt+x,t=tiles[k];
  if(solid[k]||hop[k])continue;if(o.tiles&&!o.tiles.includes(t))continue;if(!o.tiles&&t!==0&&t!==4&&t!==3)continue;
  if(!o.onPath&&keep[k]&&!(o.keepOk))continue;if(o.minD!=null&&Math.abs(y-PY(x))<o.minD)continue;
  if(o.nearWater){let ok=false;for(let b=-2;b<=2&&!ok;b++)for(let a=-2;a<=2;a++){const n=get(x+a,y+b);if(n===2||n===10){ok=true;break;}}if(!ok)continue;}
  if(used.some(u=>Math.abs(u[0]-x)<2&&Math.abs(u[1]-y)<2))continue;return[x,y];}return null;};
 for(const[item,n]of Object.entries(D.picks||{}))for(let k=0;k<n;k++){const s=spot({minD:2+(k%3)});if(s){addEnt({k:'pick',item},s[0],s[1],'p'+(pc++));}}
 for(const[id,n]of Object.entries(D.plants||{}))for(let k=0;k<n;k++){const s=spot({minD:2});if(s){addEnt({k:'plant',id},s[0],s[1],'p'+(pc++));}}
 for(const[sp,n]of Object.entries(D.animals||{}))for(let k=0;k<n;k++){
  if(sp==='vautour'){w.birds.push({sp,x:r()*Wt*T,y:30+r()*120,v:12+r()*10,t0:r()*6});continue;}
  const o=sp==='libellule'||sp==='heron'?{nearWater:1,tiles:[0,3,4]}:sp==='chat'?{tiles:[7],onPath:1}:{minD:2};
  const s=spot(o);if(s)addEnt({k:'animal',sp},s[0],s[1],'p'+(pc++));}
 if(D.id==='strasbourg'||D.id==='rioja'||D.id==='meseta')for(let k=0;k<2;k++)w.birds.push({sp:'cigogne',x:r()*Wt*T,y:20+r()*60,v:14,t0:r()*6});
 // arbres et rochers
 for(let y=0;y<H;y++)for(let x=0;x<Wt;x++){
  const k=y*Wt+x,t=tiles[k];if((t!==0&&t!==4)||keep[k]||solid[k])continue;if(x<2)continue;
  if(used.some(u=>Math.abs(u[0]-x)<=1&&Math.abs(u[1]-y)<=1))continue;
  let near=false;for(const tr of w.trees){if(Math.abs(tr.tx-x)<=1&&Math.abs(tr.ty-y)<=1){near=true;break;}}if(near)continue;
  const dp=Math.abs(y-PY(x)-.5);
  if(D.rocks&&r()<D.rocks){w.trees.push({x:x*T+8,y:(y+1)*T-3,tx:x,ty:y,img:getTree('rock',(r()*4)|0)});solid[k]=1;continue;}
  if(r()<D.dens*(.55+Math.min(dp,6)*.12)*(t===4?.5:1)){const ty=D.trees[(r()*D.trees.length)|0];w.trees.push({x:x*T+8+((r()*4)|0)-2,y:(y+1)*T-2,tx:x,ty:y,img:getTree(ty,(r()*5)|0)});solid[k]=1;}
 }
 w.bg=renderBG(w);
 if(D.rain)for(let k=0;k<70;k++)w.drops.push({x:Math.random()*VW,y:Math.random()*VH,s:120+Math.random()*80});
 return w;
}
function makeEnt(e,x,y,i,id){
 const o=Object.assign({},e,{tx:x,ty:y,uid:id,px:x*T+8,py:y*T+14,base:(y+1)*T,t0:Math.random()*6});
 if((o.k==='pick'||o.k==='plant'||o.k==='cache')&&S.flags['t'+i+'_'+id])return null;
 if(o.k==='mateoSick'&&(S.flags.mateoHealed||!S.flags.metMateo))return null;
 if(o.k==='npc'&&S.comp[o.id]&&(S.comp[o.id].st==='party'||S.comp[o.id].st==='left'))return null;
 if(o.k==='dog'&&S.comp.chien&&S.comp.chien.st)return null;
 if(o.k==='goat'&&(S.flags.goatHome||S.flags.goatFollow))return null;
 const img=(c,ay,fw,fh)=>{o.img=c;o.ay=ay;o.fw=fw;o.fh=fh;o.py=o.base;};
 switch(e.k){
  case 'npc':o.def=NPCS[e.id];o.solidR=5;o.dir='down';o.act='talk';break;
  case 'house':img(makeHouse(e.v||'fr',i*10+x),52,3,2);break;
  case 'gite':img(makeHouse(e.v||'stone',i*10+x+3),52,3,2);o.act='gite';break;
  case 'church':img(makeChurch(),60,3,2);break;
  case 'basilique':img(makeBasilique(),78,5,3);break;
  case 'cathedral':img(makeCathStras(),96,5,3);break;
  case 'cathedral2':img(makeCathComp(),100,6,3);break;
  case 'lighthouse':img(makeLighthouse(),82,2,2);break;
  case 'horreo':img(makeHorreo(),34,3,1);break;
  case 'palloza':img(makePalloza(),34,3,1);break;
  case 'hives':img(makeHives(),15,2,1);break;
  case 'post':img(makePost(),17,1,1);o.act='post';break;
  case 'borne':img(makeBorne(0),19,1,1);break;
  case 'borne0':img(makeBorne(1),19,1,1);o.act='borne0';break;
  case 'frontier':img(makeFrontier(),23,1,1);o.act='frontier';break;
  case 'cruz':img(makeCruz(),74,2,1);o.act='cruz';break;
  case 'nest':img(makeNestPole(),43,1,1);o.act='nest';break;
  case 'sign':img(makeRefugeSign(),21,1,1);o.act='sign';break;
  case 'view':img(makeBench(),13,1,1);o.act='view';break;
  case 'cache':img(makeCairn(),13,1,1);o.act='cache';break;
  case 'cave':img(makeCave(),29,2,1);o.act='cave';break;
  case 'camp':o.act='camp';break;
  case 'cascade':o.act='cascade';break;
  case 'pick':o.act='pick';break;
  case 'plant':o.act='plant';break;
  case 'log':{const py=STAGEPY(i,x);o.ly=py*T+20;o.px=x*T-4;o.py=o.ly;o.act='log';break;}
  case 'dive':o.act='dive';break;
  case 'ford':{const py=STAGEPY(i,x);o.py=py*T+20;o.act='ford';break;}
  case 'climb':o.act='climb';break;
  case 'treeclimb':o.act='treeclimb';o.py=o.base+2;break;
  case 'mateoSick':o.act='sick';o.def=NPCS.mateoSick;break;
  case 'wasps':o.w=[0,2.1,4.2].map(a=>({a,ph:Math.random()*6,x:0,y:0}));break;
  case 'cater':{const py=STAGEPY(i,x);o.cy0=py*T-36;o.cy1=py*T+62;o.cy=o.cy0;o.v=13;o.px=x*T+8;break;}
  case 'animal':o.hx=o.px;o.hy=o.py;o.gx=o.px;o.gy=o.py;o.dirx=1;o.act='animal';o.f=0;if(e.sp==='chat'||e.sp==='chat2'||e.sp==='chat3'||e.sp==='vache'||e.sp==='vache2'||e.sp==='mouton'||e.sp==='chevre')o.solidR=5;break;
  case 'dog':o.k='animal';o.sp='chien';o.stray=1;o.hx=o.px;o.hy=o.py;o.gx=o.px;o.gy=o.py;o.dirx=1;o.act='animal';o.f=0;break;
  case 'goat':o.k='animal';o.sp='chevre';o.lost=1;o.hx=o.px;o.hy=o.py;o.gx=o.px;o.gy=o.py;o.dirx=1;o.act='animal';o.f=0;break;
  case 'trig':o.trig=1;break;
  case 'den':break;
 }
 return o;
}
function STAGEPY(i,x){const D=STAGES[i];return Math.round(D.pb+(D.amp||0)*Math.sin(x*.13+i*1.7));}

function renderBG(w){
 const{Wt,H,tiles,D}=w,th=THEMES[D.theme],c=mk(Wt*T,H*T),x=c.getContext('2d'),R=rectFn(x);
 const g=th.g,p=th.p,wheat=D.theme==='meseta';
 const isG=(tx,ty)=>{const t=w.get(tx,ty);return t===0||t===9||t===4;};
 for(let ty=0;ty<H;ty++)for(let tx=0;tx<Wt;tx++){
  const t=tiles[ty*Wt+tx],X=tx*T,Y=ty*T,h=(a,b)=>hash(tx*31+a+w.i*997,ty*17+b);
  if(t===0||t===9||t===4){R(X,Y,16,16,g[0]);
   if(wheat){for(let k=0;k<8;k++){const a=(h(k,1)*16)|0,b=(h(k,2)*12)|0;R(X+a,Y+b,1,4,k%2?g[1]:g[2]);R(X+a,Y+b,1,1,'#f0dc94');}}
   else{for(let k=0;k<4;k++){const a=(h(k,1)*13)|0,b=1+((h(k,2)*12)|0);R(X+a,Y+b,1,2,g[1]);R(X+a+2,Y+b,1,2,g[1]);R(X+a+1,Y+b+1,1,2,g[1]);}
    for(let k=0;k<3;k++){const a=(h(k,3)*14)|0,b=(h(k,4)*14)|0;R(X+a,Y+b,2,1,g[2]);}}
   if(h(9,9)<.13&&t===0){const a=2+((h(8,1)*11)|0),b=2+((h(8,2)*11)|0),fc=th.fl[(h(8,3)*th.fl.length)|0];R(X+a-1,Y+b,3,1,fc);R(X+a,Y+b-1,1,3,fc);R(X+a,Y+b,1,1,'#f2c94c');}
   if(t===4){for(let k=0;k<10;k++){const a=(h(k,11)*15)|0,b=2+((h(k,12)*10)|0),hh=4+((h(k,13)*4)|0);R(X+a,Y+b,1,hh,k%3?g[1]:'#2f5a24');R(X+a,Y+b,1,1,g[2]);if(k%4===0)R(X+a+1,Y+b+1,1,hh-1,g[2]);}R(X,Y+14,16,2,'rgba(0,0,0,.08)');}
   if(t===9){R(X+7,Y+1,2,13,'#6b4426');R(X,Y+4,16,7,'#3f7a2a');for(let k=0;k<6;k++)R(X+((h(k,5)*14)|0),Y+4+((h(k,6)*6)|0),2,2,'#5a9a3a');if(D.theme==='rioja'||D.theme==='alsace')for(let k=0;k<3;k++)R(X+((h(k,7)*13)|0),Y+8+((h(k,8)*3)|0),2,2,D.theme==='rioja'?'#5a2a4a':'#c8c060');R(X,Y+10,16,1,'#2a5a1e');R(X,Y+12,16,2,'rgba(0,0,0,.18)');}
  }else if(t===1||t===5){const pc=t===5?[p[1],p[0],p[2]]:p;R(X,Y,16,16,pc[0]);for(let k=0;k<4;k++){R(X+((h(k,1)*15)|0),Y+((h(k,2)*15)|0),1,1,pc[1]);R(X+((h(k,3)*14)|0),Y+((h(k,4)*15)|0),2,1,pc[2]);}
   const e=t===5?2:0;
   if(isG(tx,ty-1))for(let i=0;i<16;i++)R(X+i,Y,1,1+e+((h(i,5)*3)|0),g[0]);
   if(isG(tx,ty+1))for(let i=0;i<16;i++){const k=1+e+((h(i,6)*3)|0);R(X+i,Y+16-k,1,k,g[0]);}
   if(isG(tx-1,ty))for(let j=0;j<16;j++)R(X,Y+j,1+e+((h(j,7)*2)|0),1,g[0]);
   if(isG(tx+1,ty))for(let j=0;j<16;j++){const k=1+e+((h(j,8)*2)|0);R(X+16-k,Y+j,k,1,g[0]);}
   if(t===5)for(let k=0;k<3;k++)R(X+3+((h(k,9)*10)|0),Y+3+((h(k,10)*10)|0),1,2,g[1]);
  }else if(t===2||t===8||t===10){const deep=t===8?Math.min(1,(tx-30)/10):0;R(X,Y,16,16,t===8?(deep>.5?'#24619e':'#2f78b8'):t===10?'#4a98cc':'#3a86c4');
   const wt=(a,b)=>{const n=w.get(a,b);return n===2||n===8||n===6||n===10||n===-1;};
   const lip=t===10?'#a8957a':'#86c8ec';
   if(!wt(tx,ty-1))R(X,Y,16,2,lip);if(!wt(tx-1,ty))R(X,Y,2,16,lip);if(!wt(tx+1,ty))R(X+14,Y,2,16,lip);if(!wt(tx,ty+1))R(X,Y+14,16,2,t===10?'#7a6a52':'#2c6ea6');
   if(t===10)for(let k=0;k<3;k++)R(X+3+((h(k,14)*9)|0),Y+3+((h(k,15)*9)|0),2,2,'#8a8c94');
  }else if(t===3){R(X,Y,16,16,'#e8d49c');for(let k=0;k<5;k++){R(X+((h(k,1)*15)|0),Y+((h(k,2)*15)|0),1,1,'#d4bc80');R(X+((h(k,3)*15)|0),Y+((h(k,4)*15)|0),1,1,'#f6e8c0');}}
  else if(t===6){R(X,Y,16,16,'#3a86c4');R(X,Y+1,16,14,'#9a6a3e');for(let i=0;i<16;i+=4)R(X+i,Y+1,1,14,'#7a4f2c');if(w.get(tx,ty-1)!==6)R(X,Y,16,2,'#5c3a1e');if(w.get(tx,ty+1)!==6)R(X,Y+14,16,2,'#5c3a1e');}
  else if(t===7){R(X,Y,16,16,'#9a8e76');for(let j=0;j<4;j++)for(let i=0;i<3;i++){const ox=(j%2)*3;R(X+i*6+ox,Y+j*4,5,3,h(i,j)<.5?'#cfc3a8':'#bfb397');R(X+i*6+ox,Y+j*4,5,1,'#ddd3bc');}}
  else if(t===11){R(X,Y,16,16,'#7a7468');for(let k=0;k<5;k++){const a=(h(k,21)*14)|0;R(X+a,Y,1,16,'#5e594f');R(X+a+1,Y+((h(k,22)*8)|0),2,5,'#948d7f');}
   if(w.get(tx,ty-1)!==11){R(X,Y,16,3,g[0]);for(let i=0;i<16;i+=3)R(X+i,Y+3,2,1+((h(i,23)*2)|0),g[1]);}
   if(w.get(tx,ty+1)!==11)R(X,Y+13,16,3,'#4a463e');}
 }
 return c;
}

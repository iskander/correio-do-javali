'use strict';
// ===== Pixel art : utilitaires, icônes, arbres, bâtiments =====
const T=16,VW=320,VH=192;
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function rng(seed){let s=(Math.imul(seed|0,2654435761)>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function hash(a,b){let h=Math.imul(a,374761393)+Math.imul(b,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;}
function rectFn(x){return(a,b,w,h,col)=>{if(!col)return;x.fillStyle=col;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h));};}

// ---------- Icônes 8x8 ----------
const IP={k:'#3a2414',w:'#fff8e8',y:'#f2c94c',o:'#e08a2c',r:'#c8392b',p:'#e98aa0',b:'#4a6fd0',n:'#2b2f6b',g:'#4f9a3a',G:'#2f6b2a',l:'#8fd06a',t:'#8a5a33',T:'#5c3a1e',s:'#f3e1b5',S:'#c99a5b',v:'#8a4fb0',c:'#cfd8dc',d:'#6b6f78',h:'#f6b93b',a:'#9fd8f5',m:'#5a1630',x:'#1a1a22',z:'#e2be5e',Z:'#a8843a',q:'#ece6d8',u:'#e0893a',U:'#a8541e'};
const ICONS={
coquillage:['..sSSs..','.sSsSsS.','sSsSsSsS','sSsSsSsS','.sSsSsS.','..sSsS..','...SS...','..SSSS..'],
ficelle:['........','..yyyy..','.yoyyoy.','yyoyyoyy','yoyyoyyy','.yyoyyo.','..yyyy.o','.......o'],
branche:['......g.','.....tl.','....t...','...t.g..','..t.gl..','.t......','t.......'],
baton:['.sSs....','.SsS....','..t.....','...t....','....t...','.....t..','......t.','.......T'],
collier:['k......k','.k....k.','..s..s..','...kk...','..sSSs..','.sSsSsS.','..sSSs..','...ss...'],
myrtilles:['...g....','..gl.g..','.nn.gl..','nbnn.nn.','nnn.nbnn','.n..nnn.','..nn.n..','.nbn....'],
ail:['.w...w..','wyw.wyw.','.w...w..','..g.g...','.gGlGg..','gGlgGlg.','.gGgGg..','...g....'],
muguet:['....G...','...G.w..','..G.www.','.G.w....','.Gwww...','.G...ww.','gGg.www.','.gGg....'],
cepe:['..tTTt..','.tTttTt.','tTttttTt','.TTTTTT.','..swws..','..swws..','..wwww..','..swws..'],
amanite:['..rrrr..','.rwrrwr.','rrrrwrrr','rwrrrrwr','.wwwwww.','...ww...','..wwww..','...ww...'],
mures:['..g..g..','...gl...','.mvm....','mvmvm...','.mvmv.mv','..mm.mvm','.....mvm','......m.'],
belladone:['.v.G.v..','vvvGvvv.','.v.G.v..','...G....','..xGx...','.xwxGx..','..x..xwx','......x.'],
thym:['..v.v...','.vgvgv..','..gGg.v.','.gGlGgv.','..gGGg..','.gGlGg..','..gGg...','...T....'],
saule:['...TT...','..TtT...','..TtTT..','.TttT...','.TtTT...','.TttT...','..TtT...','...T....'],
miel:['..TTTT..','..wwww..','.hhhhhh.','.hohhoh.','.hhhhhh.','.hohhhh.','.hhhhhh.','..oooo..'],
remede:['...TT...','...cc...','..cggc..','.cgllgc.','.cgggGc.','.cgGGgc.','.cgggGc.','..cccc..'],
sirop:['...TT...','...cc...','...cc...','..cooc..','.cohhoc.','.chhhhc.','.cohhoc.','..cccc..'],
baume:['........','..TTTT..','.cccccc.','.cglglc.','.cgllgc.','.cglglc.','.cccccc.','........'],
plantain:['....d...','...dTd..','....d...','.g..T..g','.gl.T.lg','..glTlg.','.gglGlgg','..ggGgg.'],
truite:['........','...oo...','.oyyyo.o','oyywyyoo','oyyyyyoo','.oyoyo.o','...oo...'],
poisson:['........','...cc...','.cacccc.c','cdacwccdd','ccccccdd','.cdcdc.d','...cc...'],
pain:['........','..oooo..','.oyoyoo.','oyoyoyoo','ooyoyoTo','.TooooT.','..TTTT..'],
fromage:['........','......y.','....yyy.','..yyyyyy','yyyoyyyy','yyyyyoyy','yoyyyyyy','yyyyyyy.'],
fleur:['..r.r...','.rrrrr..','rrkrr...','.rrrrr..','..r.rg..','.....g..','....g...','...g....'],
couronne:['.r.y.r..','yg...gy.','r.....r.','g.....g.','r.....r.','yg...gy.','.r.y.r..'],
credenciale:['kkkkkkkk','kwwwwwwk','kwswwrwk','kwSswwwk','kwwwwwwk','kwrwwswk','kwwwwwwk','kkkkkkkk'],
bois:['........','..TTTTT.','.TttttSs','.TTTTTSs','TTTTTT..','TttttSs.','TTTTTSs.','........'],
paille:['.z.z.z..','zZzZzZ..','.ZzZz...','..ZZZ...','..ZZZ...','.Z.Z.Z..','Z..Z..Z.','........'],
chapeau:['........','...zzz..','..zZZZz.','..zrrrz.','zzzzzzzz','.ZzzzzZ.','........'],
chataigne:['...G....','..gGg...','.TTTTT..','TtttttT.','TtssstT.','TttttTT.','.TTTTT..'],
noix:['........','..SSSS..','.StSStS.','SStSStSS','SStSStSS','.StSStS.','..SSSS..'],
caillou:['........','..dddd..','.dccccd.','dccrcrcd','dccrrrcd','.dccrcd.','..dddd..'],
clochette:['...TT...','..T..T..','..yyyy..','.yhhhhy.','.yhhhhy.','yyyyyyyy','...oo...'],
coquilleh:['..yhhy..','.yhyhyh.','yhyhyhyh','yhyhyhyh','.yhyhyh.','..yhyh..','...hh...','..hhhh..']
};
const _ico={};
function iconCanvas(id,sc=1){const k=id+'@'+sc;if(_ico[k])return _ico[k];const rows=ICONS[id]||ICONS.credenciale;const w=Math.max(...rows.map(r=>r.length));const c=mk(w*sc,8*sc),x=c.getContext('2d');rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){const col=IP[row[i]];if(!col)continue;x.fillStyle=col;x.fillRect(i*sc,j*sc,sc,sc);}});return _ico[k]=c;}
const _icoURL={};
function iconURL(id){return _icoURL[id]||(_icoURL[id]=iconCanvas(id,4).toDataURL());}
function spriteFrom(rows,pal){const w=Math.max(...rows.map(r=>r.length)),c=mk(w,rows.length),x=c.getContext('2d');rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){const col=pal[row[i]];if(!col)continue;x.fillStyle=col;x.fillRect(i,j,1,1);}});return c;}

// ---------- Arbres ----------
const TC={
 leaf:{o:'#23421f',d:'#2f6b2a',m:'#3f8a35',l:'#5aa844',h:'#86c95a'},
 cherry:{o:'#23421f',d:'#2f6b2a',m:'#3f8a35',l:'#5aa844',h:'#86c95a',fl:['#f7c6d6','#ffe3ec','#f0a8c0']},
 fir:{o:'#16301e',d:'#1f4a2c',m:'#2b6238',l:'#3f7f48',h:'#5a9c5c'},
 umbrella:{o:'#1f3a22',d:'#2c5a30',m:'#3b733d',l:'#4f8c4c',h:'#6aa35f'},
 olive:{o:'#3b4a2e',d:'#56683f',m:'#71864f',l:'#8fa463',h:'#b0c27c'},
 euca:{o:'#2a4a3a',d:'#3c6b55',m:'#4f8a6c',l:'#6aa887',h:'#94c7a8'},
 willow:{o:'#2b4a24',d:'#4a7a3a',m:'#6b9a4c',l:'#8db862',h:'#b4d486'},
 lush:{o:'#163a1c',d:'#1f5a2a',m:'#2c7536',l:'#3f9447',h:'#66b562'},
 chestnut:{o:'#203a18',d:'#2f5a22',m:'#447a30',l:'#5f9a3e',h:'#8abb5a',fl:['#e9e0a0','#d9cf88']},
 oak:{o:'#2a3a1a',d:'#3b5a26',m:'#4f7a32',l:'#6a9a42',h:'#92ba5e'},
 bush:{o:'#23421f',d:'#2f6b2a',m:'#3f8a35',l:'#5aa844',h:'#86c95a'},
 rock:{o:'#3e3f45',d:'#6b6d75',m:'#8a8c94',l:'#a9abb2',h:'#cfd1d6'}
};
function shadeBlob(x,W,H,mask,col,lx,ly,R,r,fl){
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=j*W+i;if(!mask[k])continue;
  const edge=i===0||i===W-1||j===0||j===H-1||!mask[k-1]||!mask[k+1]||!mask[k-W]||!mask[k+W];
  let c;if(edge)c=col.o;else{const L=((lx-i)*.55+(ly-j)*.85)/R+(r()-.5)*.45;c=L>.6?col.h:L>.18?col.l:L>-.3?col.m:col.d;if(fl&&r()<.06)c=fl[(r()*fl.length)|0];}
  x.fillStyle=c;x.fillRect(i,j,1,1);}
}
function makeBlobThing(seed,col,o){
 const r=rng(seed),c=mk(o.w,o.h),x=c.getContext('2d'),R=rectFn(x);
 x.fillStyle='rgba(20,30,10,.28)';x.beginPath();x.ellipse(o.ax,o.ay-1,o.sw||9,3,0,0,7);x.fill();
 const t=o.trunk;if(t){const tc=o.tc||['#9a6a3e','#7a4f2c','#553319'];for(let j=t.y0;j<t.y1;j++){R(t.x,j,t.w,1,tc[1]);R(t.x+1,j,1,1,tc[0]);R(t.x+t.w-1,j,1,1,tc[2]);}R(t.x-1,t.y1-2,t.w+2,2,tc[2]);}
 const W=o.w,H=o.ch,mask=new Uint8Array(W*H),j0=o.jit==null?2:o.jit;
 const bl=o.blobs.map(b=>[b[0]+(r()-.5)*j0,b[1]+(r()-.5)*j0,b[2]+(r()-.5)*1.4]);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++)for(const b of bl){const dx=i-b[0],dy=(j-b[1])*(o.sq||1);if(dx*dx+dy*dy<b[2]*b[2]){mask[j*W+i]=1;break;}}
 shadeBlob(x,W,H,mask,col,o.lx,o.ly,o.R||14,r,col.fl);
 return{c,ax:o.ax,ay:o.ay};
}
function makeFir(seed,col){
 const r=rng(seed),W=26,H=52,c=mk(W,H),x=c.getContext('2d'),R=rectFn(x);
 x.fillStyle='rgba(20,30,10,.3)';x.beginPath();x.ellipse(13,48,9,3,0,0,7);x.fill();
 for(let j=38;j<49;j++){R(12,j,3,1,'#6b4426');R(12,j,1,1,'#8a5a33');}
 const HH=42,mask=new Uint8Array(W*HH);
 for(let j=0;j<HH;j++){const tier=Math.min(3,Math.floor(j/10)),loc=j-tier*10,hw=1.5+tier*2.2+loc*.55+(r()-.5)*.8;for(let i=0;i<W;i++)if(Math.abs(i-12.5)<hw)mask[j*W+i]=1;}
 shadeBlob(x,W,HH,mask,col,6,4,16,r);
 return{c,ax:13,ay:48};
}
const TREEDEF={
 leaf:{w:32,h:48,ch:32,blobs:[[16,16,11],[8,19,7],[24,19,7],[16,8,8],[10,11,6],[22,11,6]],trunk:{x:14,w:4,y0:24,y1:46},ax:16,ay:46,lx:10,ly:6},
 umbrella:{w:36,h:58,ch:22,blobs:[[18,12,10],[10,13,8],[26,13,8],[5,15,5],[31,15,5],[18,7,7]],sq:1.5,trunk:{x:16,w:4,y0:16,y1:55},tc:['#b0643c','#8a4a2a','#5c2e1a'],ax:18,ay:55,lx:10,ly:4,sw:10},
 olive:{w:28,h:36,ch:22,blobs:[[14,11,8],[7,13,6],[21,13,6],[14,6,6]],trunk:{x:12,w:4,y0:16,y1:34},tc:['#8a7a66','#6a5a48','#4a3e30'],ax:14,ay:34,lx:8,ly:4,R:11,sw:8},
 euca:{w:30,h:64,ch:30,blobs:[[15,10,8],[8,16,6],[22,14,6],[15,22,5],[11,4,5]],trunk:{x:13,w:4,y0:18,y1:61},tc:['#efe6d0','#cfc3a8','#9a8f78'],ax:15,ay:61,lx:9,ly:4,R:12,sw:7},
 willow:{w:34,h:48,ch:34,blobs:[[17,14,11],[8,20,7],[26,20,7],[6,28,4],[28,28,4],[17,24,8]],sq:.9,trunk:{x:15,w:4,y0:26,y1:46},ax:17,ay:46,lx:10,ly:6},
 chestnut:{w:36,h:50,ch:34,blobs:[[18,16,12],[8,20,8],[28,20,8],[18,8,9]],trunk:{x:16,w:5,y0:26,y1:48},tc:['#8a6a4a','#6a4a2e','#4a3220'],ax:18,ay:48,lx:11,ly:6,sw:11},
 oak:{w:34,h:46,ch:30,blobs:[[17,15,11],[7,18,7],[27,18,7],[12,9,7],[23,9,7]],trunk:{x:15,w:5,y0:22,y1:44},ax:17,ay:44,lx:10,ly:6,sw:10},
 bush:{w:18,h:16,ch:14,blobs:[[9,8,7],[5,9,4],[13,9,4]],ax:9,ay:15,lx:5,ly:3,R:8,sw:7},
 rock:{w:16,h:13,ch:12,blobs:[[8,7,6],[5,8,4],[11,8,4]],sq:1.3,ax:8,ay:12,lx:4,ly:3,R:7,sw:7,jit:1}
};
TREEDEF.cherry=TREEDEF.leaf;TREEDEF.lush=TREEDEF.leaf;TREEDEF.noisetier=TREEDEF.bush;TC.noisetier={...TC.bush,fl:['#c9a26b','#a77a45']};
const _tree={};
function getTree(type,v){const k=type+v;if(_tree[k])return _tree[k];const seed=v*131+type.length*7;let t;
 if(type==='fir')t=makeFir(seed,TC.fir);
 else{const d=TREEDEF[type]||TREEDEF.leaf;t=makeBlobThing(seed,TC[type]||TC.leaf,d);}
 return _tree[k]=t;}

// ---------- Bâtiments ----------
function makeHouse(v,seed){
 const r=rng(seed),w=48,h=56,c=mk(w,h),x=c.getContext('2d'),R=rectFn(x);
 const P={fr:{wall:'#f3e3c3',wd:'#d9c39b',tim:'#6b3a1e',roof:'#b5452f',rd:'#8a2f22',rl:'#d0644a',sh:'#4f7a3a'},
  es:{wall:'#efe7d6',wd:'#cfc3a8',tim:'#8a6a4a',roof:'#c2603a',rd:'#94452a',rl:'#de8256',sh:'#2f5a8a'},
  stone:{wall:'#a99a86',wd:'#857662',tim:'#6b5e4c',roof:'#4a5560',rd:'#343c45',rl:'#6a7684',sh:'#7a3a1e'},
  basque:{wall:'#f6f2ea',wd:'#d8d2c4',tim:'#9a2a22',roof:'#b5452f',rd:'#8a2f22',rl:'#d0644a',sh:'#9a2a22'},
  lande:{wall:'#efe1c4',wd:'#d4bf98',tim:'#5a3a22',roof:'#b85a3a',rd:'#8a3f26',rl:'#d07a54',sh:'#7a8a3a'}}[v]||{};
 R(2,h-5,w-4,5,'rgba(0,0,0,.25)');
 const steep=v==='fr',wt=24,bot=h-4;
 R(5,wt,38,bot-wt,P.wall);R(41,wt,2,bot-wt,P.wd);
 if(v==='fr'||v==='lande'||v==='basque'){R(5,wt,2,bot-wt,P.tim);R(41,wt,2,bot-wt,P.tim);R(23,wt,2,bot-wt,P.tim);R(5,wt+13,38,2,P.tim);
  if(v!=='basque')for(let k=0;k<11;k++){R(7+k*1.5,wt+2+k,2,1,P.tim);R(39-k*1.5,wt+2+k,2,1,P.tim);}}
 if(v==='stone'){for(let j=wt+2;j<bot;j+=4){R(5,j,38,1,P.wd);for(let i=5+((j/4)%2)*4;i<43;i+=8)R(i,j,1,4,P.wd);}}
 const win=(a,b)=>{R(a-1,b-1,8,9,P.tim);R(a,b,6,7,'#9cc3d8');R(a,b,6,1,'#d8eef6');R(a+3,b,1,7,P.tim);R(a,b+3,6,1,P.tim);R(a-3,b,2,7,P.sh);R(a+7,b,2,7,P.sh);R(a-1,b+8,8,2,'#6b3a1e');
  for(let i=0;i<4;i++)R(a+i*2,b+7,1,1,r()<.5?'#e0453a':'#f07aa0');};
 win(10,wt+4);win(32,wt+4);
 R(20,bot-14,9,14,'#4a2a12');R(21,bot-13,7,13,v==='basque'?'#9a2a22':'#7a4a24');R(22,bot-12,5,1,'#8a5a30');R(26,bot-7,1,1,'#f2c94c');
 if(steep){for(let j=0;j<24;j++){const hw=Math.min(24,3+j*.95);R(24-hw,2+j,hw*2,1,j%3===0?P.rd:P.roof);R(24-hw,2+j,2,1,P.rl);}R(23,0,2,3,P.rd);}
 else{for(let j=0;j<13;j++){const hw=14+j*.8;R(24-hw,13+j,hw*2,1,j%3===0?P.rd:P.roof);R(24-hw,13+j,2,1,P.rl);}}
 if(v==='stone'){R(31,bot-12,6,6,'#2f4f8a');R(32,bot-11,4,4,'#f2c94c');R(33,bot-10,2,2,'#c99a5b');}
 return c;
}
function makeCathStras(){
 const c=mk(80,100),x=c.getContext('2d'),R=rectFn(x);
 const A='#c98272',B='#b06a5c',C='#8a4e44',D='#e3a493',O='#4a2420';
 R(4,94,74,5,'rgba(0,0,0,.25)');
 R(10,36,60,60,A);R(10,36,2,60,D);R(68,36,2,60,C);
 for(let i=14;i<68;i+=4)R(i,40,1,52,B);
 R(10,36,60,2,O);R(10,64,60,2,B);R(10,50,60,1,B);
 for(let j=-9;j<=9;j++)for(let i=-9;i<=9;i++){const d=Math.hypot(i,j);if(d>9)continue;const a=Math.atan2(j,i);let col=d>8?O:d<2.2?'#f2c94c':(Math.floor((a+3.2)*2.5)%2?'#3d5fb0':'#c8392b');if(d>4.5&&d<5.3)col=O;R(40+i,50+j,1,1,col);}
 const portal=(px,w,hh)=>{for(let j=0;j<hh;j++){const k=j<w/2?Math.round(w/2-Math.sqrt(Math.max(0,(w/2)**2-(w/2-j)**2))):0;R(px+k,96-hh+j,w-2*k,1,'#3a1e1a');}R(px-1,96-hh-2,w+2,2,B);};
 portal(16,12,20);portal(33,14,26);portal(52,12,20);
 R(10,10,20,26,A);R(10,10,2,26,D);R(28,10,2,26,C);for(let i=13;i<28;i+=3)R(i,13,1,20,B);
 for(let j=0;j<12;j++){const hw=1+j*.75;R(20-hw,j-2,hw*2,1,j%2?B:A);}R(19,-2,2,4,O);
 R(50,24,20,12,A);R(68,24,2,12,C);R(48,22,24,3,B);for(let i=50;i<70;i+=4)R(i,19,2,3,B);
 return c;
}
function makeCathComp(){
 const c=mk(96,104),x=c.getContext('2d'),R=rectFn(x);
 const A='#bfb397',B='#9c917a',C='#7a705c',D='#ddd3ba',L='#8a9a5a',O='#4a4436';
 R(4,98,88,5,'rgba(0,0,0,.25)');
 const tower=(tx)=>{R(tx,30,22,70,A);R(tx,30,2,70,D);R(tx+20,30,2,70,C);for(let j=40;j<96;j+=14)R(tx,j,22,2,B);
  R(tx+7,44,8,10,'#3a3a40');R(tx+7,64,8,10,'#3a3a40');R(tx+3,20,16,10,A);R(tx+3,20,16,2,B);R(tx+6,8,10,12,A);R(tx+9,10,4,6,'#3a3a40');
  for(let j=0;j<8;j++){const hw=1+j*.6;R(tx+11-hw,j,hw*2,1,B);}R(tx+10,-2,2,3,O);
  for(let k=0;k<6;k++)R(tx+((k*7)%20),34+k*11,2,1,L);};
 tower(4);tower(70);
 R(26,40,44,60,A);R(26,40,44,2,B);
 for(let j=0;j<16;j++){const hw=4+j*1.3;R(48-hw,24+j,hw*2,1,j%4===0?B:A);}R(46,18,4,7,A);R(45,14,6,4,'#c7a46a');
 R(36,46,24,22,'#5a6a7a');for(let i=36;i<60;i+=4)R(i,46,1,22,O);R(36,56,24,1,O);R(37,47,22,1,'#9fb8cc');
 R(40,74,16,16,'#3a3a40');R(40,74,16,2,B);
 for(let k=0;k<6;k++){R(22+k*2,90+k*2,52-k*4,2,k%2?B:D);}
 for(let k=0;k<10;k++)R(28+((k*13)%40),42+((k*17)%50),2,1,L);
 return c;
}
function makeBasilique(){
 const c=mk(84,82),x=c.getContext('2d'),R=rectFn(x);
 const A='#e3d6b4',B='#c9b98f',C='#a8986e',O='#5a4a32',RF='#7a8088';
 R(3,77,80,4,'rgba(0,0,0,.25)');
 R(22,36,58,42,A);R(78,36,2,42,C);for(let j=0;j<10;j++)R(20+j*.5,26+j,62-j,1,j%2?RF:'#8a9098');
 for(let i=28;i<78;i+=10){R(i,44,5,9,O);for(let j=0;j<3;j++)R(i+j%2,43-j+1,5-2*(j%2),1,O);R(i-1,54,7,1,B);}
 R(22,58,58,2,B);
 R(4,16,22,62,A);R(4,16,2,62,'#f0e6cc');R(24,16,2,62,C);R(2,14,26,3,B);
 for(let j=0;j<12;j++){const hw=13-j;R(15-hw,2+j,hw*2,1,j%2?RF:'#8a9098');}
 R(11,24,8,10,O);R(11,23,8,1,B);R(10,40,10,12,O);R(14,40,2,12,A);
 for(let j=0;j<20;j++){const k=j<5?Math.round(5-Math.sqrt(25-(5-j)**2)):0;R(8+k,57+j,14-2*k,1,'#3a2a1c');}
 R(7,55,16,2,B);for(let k=0;k<5;k++)R(9+k*3,54,1,1,C);
 return c;
}
function makeLighthouse(){const c=mk(30,84),x=c.getContext('2d'),R=rectFn(x);R(2,79,26,4,'rgba(0,0,0,.25)');
 R(5,64,20,18,'#cfc6b2');R(5,64,20,2,'#a99f8a');R(9,72,6,10,'#4a3a2a');
 for(let j=16;j<66;j++){const hw=5+(j-16)*.06;R(15-hw,j,hw*2,1,'#e9e3d4');R(15-hw,j,2,1,'#fff');R(15+hw-2,j,2,1,'#b9b19d');}
 R(9,10,12,7,'#2f3a40');R(10,11,10,5,'#f6d35a');R(8,8,14,2,'#3a454c');for(let j=0;j<6;j++)R(15-(6-j),2+j,(6-j)*2,1,'#5a2e2a');R(14,0,2,2,'#2f3a40');
 R(11,30,4,6,'#4a5a66');R(11,48,4,6,'#4a5a66');return c;}
function makeHorreo(){const c=mk(44,36),x=c.getContext('2d'),R=rectFn(x);R(2,32,40,3,'rgba(0,0,0,.25)');
 for(const p of[5,20,35]){R(p,24,4,10,'#9c917a');R(p-1,22,6,2,'#bfb397');}
 R(3,10,38,12,'#b8ad95');for(let i=5;i<41;i+=3)R(i,11,1,10,'#7a705c');
 for(let j=0;j<7;j++){const hw=20-j*.6;R(22-hw,3+j,hw*2,1,j%2?'#94452a':'#c2603a');}R(21,0,2,4,'#7a705c');R(19,1,6,1,'#7a705c');R(4,1,2,3,'#7a705c');R(38,1,2,3,'#7a705c');return c;}
function makePalloza(){const c=mk(44,36),x=c.getContext('2d'),R=rectFn(x);R(2,32,40,3,'rgba(0,0,0,.25)');
 R(5,18,34,15,'#9c9384');for(let j=19;j<33;j+=3)for(let i=5+(j%2)*3;i<39;i+=6)R(i,j,5,2,'#b8af9e');R(18,22,8,11,'#3a2a1c');
 for(let j=0;j<18;j++){const hw=4+j*1.15;R(22-hw,1+j,hw*2,1,j%3===0?'#a8843a':'#d4ae5a');for(let i=-hw;i<hw;i+=4)R(22+i+(j%2)*2,1+j,1,1,'#8a6a2a');}
 return c;}
function makePost(){const c=mk(12,18),x=c.getContext('2d'),R=rectFn(x);R(1,16,10,2,'rgba(0,0,0,.25)');R(5,10,2,7,'#6b6f78');R(1,1,10,10,'#f2c94c');R(2,0,8,1,'#f2c94c');R(1,1,1,10,'#c99a2c');R(10,1,1,10,'#c99a2c');R(3,3,6,1,'#3a2414');R(3,6,6,3,'#3d5fb0');R(4,7,4,1,'#f2c94c');return c;}
function makeBorne(km){const c=mk(10,20),x=c.getContext('2d'),R=rectFn(x);R(0,18,10,2,'rgba(0,0,0,.25)');R(1,2,8,17,'#bfb8a8');R(1,2,2,17,'#d9d3c4');R(7,2,2,17,'#9a9384');R(2,0,6,2,'#bfb8a8');R(2,4,6,6,'#2f5aa8');for(let i=0;i<5;i++)R(3+i,7-(i%2),1,2,'#f2c94c');R(3,9,4,1,'#f2c94c');if(km){R(2,12,6,3,'#e9e3d4');R(3,13,1,1,'#333');R(5,13,1,1,'#333');}return c;}
function makeFrontier(){const c=mk(16,24),x=c.getContext('2d'),R=rectFn(x);R(1,22,14,2,'rgba(0,0,0,.25)');R(2,4,12,19,'#c9c2b0');R(2,4,2,19,'#e3ddcc');R(12,4,2,19,'#9a9384');R(3,2,10,2,'#c9c2b0');
 R(4,8,1,6,'#3a3a40');R(4,8,3,1,'#3a3a40');R(4,10,2,1,'#3a3a40');R(8,7,1,8,'#7a705c');R(10,8,1,6,'#3a3a40');R(10,8,3,1,'#3a3a40');R(10,10,2,1,'#3a3a40');R(10,13,3,1,'#3a3a40');return c;}
function makeHives(){const c=mk(34,16),x=c.getContext('2d'),R=rectFn(x);R(1,14,32,2,'rgba(0,0,0,.25)');for(const p of[1,12,23]){R(p,5,10,10,'#e9d3a5');R(p,4,10,2,'#8a5a33');R(p,9,10,1,'#c9a26b');R(p+4,12,2,1,'#3a2414');}return c;}
function makeChurch(){const c=mk(48,64),x=c.getContext('2d'),R=rectFn(x);const A='#d9c9a3',C='#8a7a5a';R(2,59,44,4,'rgba(0,0,0,.25)');
 R(6,34,36,28,A);R(40,34,2,28,C);for(let j=0;j<10;j++){const hw=20-j*1.8;R(24-hw,24+j,hw*2,1,j%2?'#8a3f26':'#b5452f');}
 R(18,6,12,28,A);R(28,6,2,28,C);R(21,10,6,8,'#3a2a20');for(let j=0;j<7;j++){const hw=7-j;R(24-hw,j,hw*2,1,'#5a5a62');}
 R(19,46,10,16,'#3a2a20');for(let j=0;j<5;j++){const k=Math.round(5-Math.sqrt(25-(5-j)**2));R(19+k,41+j,10-2*k,1,'#3a2a20');}R(9,40,5,8,'#4a6a8a');R(34,40,5,8,'#4a6a8a');
 R(19,0,10,3,'#5a4a32');R(18,-1,12,1,'#7a6a4a');R(22,-4,4,3,'#f4f0e6');R(25,-4,2,1,'#c8392b');return c;}
function makeCruz(){const c=mk(40,76),x=c.getContext('2d'),R=rectFn(x),r=rng(77);
 R(2,72,36,4,'rgba(0,0,0,.25)');
 for(let k=0;k<70;k++){const yy=50+r()*22,hw=(yy-48)*.75,xx=20+(r()-.5)*2*hw,s=2+(r()*3|0);R(xx-s/2,yy-s/2,s,s,['#8a8578','#a8a294','#6a665c','#c9c2b0','#b0645a','#5a7aa8'][(r()*6)|0]);}
 R(19,4,3,50,'#7a5a3a');R(19,4,1,50,'#9a7a52');R(21,4,1,50,'#553a22');
 R(17,4,7,2,'#3a3a40');R(19,0,3,9,'#3a3a40');R(15,2,11,2,'#3a3a40');return c;}
function makeNestPole(){const c=mk(18,44),x=c.getContext('2d'),R=rectFn(x);R(5,41,8,3,'rgba(0,0,0,.25)');R(8,12,2,31,'#7a5a3a');R(8,12,1,31,'#9a7a52');
 R(1,8,16,5,'#8a6a3a');for(let i=1;i<17;i+=2)R(i,8+(i%4?0:1),1,4,'#5a4220');R(0,10,18,2,'#6a4a28');
 R(7,1,5,6,'#f4f0e6');R(11,2,4,1,'#d9452a');R(9,1,2,1,'#2a2a2a');R(6,5,7,3,'#f4f0e6');R(5,6,3,2,'#2a2a2a');return c;}
function makeBench(){const c=mk(22,14),x=c.getContext('2d'),R=rectFn(x);R(1,12,20,2,'rgba(0,0,0,.22)');R(2,4,18,2,'#8a5a33');R(2,4,18,1,'#a8784a');R(2,8,18,2,'#8a5a33');R(3,6,2,7,'#5c3a1e');R(17,6,2,7,'#5c3a1e');return c;}
function makeCairn(){const c=mk(14,14),x=c.getContext('2d'),R=rectFn(x);R(1,12,12,2,'rgba(0,0,0,.22)');R(2,8,10,5,'#8a8c94');R(2,8,10,1,'#a9abb2');R(4,4,7,4,'#9a9ca4');R(4,4,7,1,'#cfd1d6');R(5,1,4,3,'#8a8c94');R(5,1,4,1,'#cfd1d6');R(10,0,3,3,'#f2c94c');return c;}
function makeCave(){const c=mk(36,30),x=c.getContext('2d'),R=rectFn(x);
 for(let j=0;j<30;j++){const hw=Math.min(18,6+j*1.2);R(18-hw,j,hw*2,1,j%4?'#8a8478':'#a29c8e');}
 for(let j=0;j<20;j++){const k=j<8?Math.round(8-Math.sqrt(64-(8-j)**2)):0;R(10+k,10+j,16-2*k,1,'#1e1a16');}
 R(5,4,4,2,'#5a8a3a');R(26,6,5,2,'#5a8a3a');return c;}
function makeRefugeSign(){const c=mk(14,22),x=c.getContext('2d'),R=rectFn(x);R(2,20,10,2,'rgba(0,0,0,.22)');R(6,8,2,13,'#6b4426');R(1,2,12,8,'#e3d6b4');R(1,2,12,1,'#a8986e');R(3,4,8,1,'#5a4a32');R(3,6,6,1,'#5a4a32');R(10,3,2,2,'#f2c94c');return c;}

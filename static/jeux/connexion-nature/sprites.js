'use strict';
// ===== Personnages, équipement, animaux, effets =====
const GIRL={skin:'#f2c6a0',hair:'#7a4a24',top:'#3f8f8a',top2:'#2f6f6b',bottom:'#5a4636',scarf:'#d0463a',pack:'#8a5a33',braid:1};
function drawChar(c,X,Y,o,dir,frame,eq,z){
 dir=dir||'down';frame=frame||0;z=z||0;
 const x0=Math.round(X)-6,yb=Math.round(Y)-20,y0=yb-Math.round(z),fl=dir==='right';
 const P=(a,b,w,h,col)=>{if(!col)return;c.fillStyle=col;c.fillRect(x0+(fl?12-a-w:a),y0+b,w,h);};
 c.fillStyle='rgba(0,0,0,.22)';const sh=z>2?6:10;c.fillRect(x0+6-sh/2,yb+19,sh,2);
 const side=dir==='left'||dir==='right',up=dir==='up';
 const l1=frame===1?1:0,l2=frame===3?1:0,shoe=o.shoe||'#3e2616';
 const st=eq&&eq.main==='baton';
 if(st&&up)stick(P,9);
 if(side){P(4,15-l1,2,4,o.bottom);P(3,18-l1,3,1,shoe);P(7,15-l2,2,4,o.bottom);P(6,18-l2,3,1,shoe);}
 else{P(3,15-l1,2,4,o.bottom);P(3,18-l1,2,1,shoe);P(7,15-l2,2,4,o.bottom);P(7,18-l2,2,1,shoe);}
 if(o.robe)P(2,13,8,5,o.robe);
 P(2,9,8,7,o.top);P(2,9,8,1,o.top2);P(9,10,1,6,o.top2);if(o.belt)P(2,13,8,1,o.belt);
 const sw=frame===1?1:frame===3?-1:0;
 if(side){P(5,10+sw,2,4,o.top2);P(5,14+sw,2,1,o.skin);}
 else{P(1,10+sw,1,4,o.top2);P(1,14+sw,1,1,o.skin);P(10,10-sw,1,4,o.top2);P(10,14-sw,1,1,o.skin);}
 if(o.pack){if(up){P(2,9,8,6,o.pack);P(3,10,6,1,'#a8784a');P(5,11,2,2,'#f3e1b5');}else if(side)P(9,9,3,6,o.pack);}
 if(o.scarf&&!up){P(3,9,6,1,o.scarf);if(!side)P(6,10,1,2,o.scarf);}
 if(eq&&eq.cou==='collier'&&!up){if(side){P(2,10,1,1,'#fff8e8');P(3,11,1,1,'#e98aa0');P(4,11,2,2,'#f3e1b5');}else{P(3,10,1,1,'#fff8e8');P(4,11,1,1,'#e98aa0');P(7,11,1,1,'#e98aa0');P(8,10,1,1,'#fff8e8');P(5,12,2,2,'#f3e1b5');P(5,12,1,1,'#c99a5b');}}
 P(2,2,8,7,o.skin);const H=o.hair;
 if(up){P(2,1,8,8,H);P(1,2,1,6,H);P(10,2,1,6,H);if(o.braid){P(5,9,2,4,H);P(5,13,2,1,o.scarf||'#c33');}if(o.long){P(1,7,10,3,H);}}
 else if(side){P(2,1,8,3,H);P(6,2,4,6,H);P(10,3,1,4,H);P(3,5,1,2,'#2b1a10');P(3,7,1,1,'#ee9f8c');if(o.braid){P(9,8,2,4,H);P(9,12,2,1,o.scarf||'#c33');}if(o.long)P(7,7,4,3,H);if(o.beard)P(2,7,5,2,o.beard);}
 else{P(2,1,8,3,H);P(1,2,1,5,H);P(10,2,1,5,H);P(3,4,2,1,H);P(4,5,1,2,'#2b1a10');P(7,5,1,2,'#2b1a10');P(3,7,1,1,'#ee9f8c');P(8,7,1,1,'#ee9f8c');if(o.beard)P(3,7,6,2,o.beard);if(o.long){P(1,7,1,4,H);P(10,7,1,4,H);}}
 if(o.hat){P(0,1,12,1,o.hat);P(2,-1,8,2,o.hat);if(o.hatband)P(2,0,8,1,o.hatband);}
 if(o.cap){P(2,0,8,2,o.cap);P(side?0:3,2,side?3:6,1,o.cap);}
 const head=eq&&eq.tete;
 if(head==='couronne'){P(2,1,8,1,'#4f9a3a');P(1,2,1,1,'#4f9a3a');P(10,2,1,1,'#4f9a3a');P(2,0,1,1,'#e0453a');P(4,0,2,1,'#fff8e8');P(7,0,1,1,'#e0453a');P(9,0,1,1,'#f2c94c');if(!up)P(5,1,1,1,'#e0453a');}
 if(head==='chapeau'){P(-1,1,14,2,'#e2be5e');P(-1,2,14,1,'#a8843a');P(2,-2,8,3,'#e2be5e');P(2,0,8,1,'#c8392b');P(3,-2,6,1,'#f0d888');}
 if(st&&!up)stick(P,side?1:11);
 function stick(P,ax){P(ax,4,1,16,'#8a5a33');P(ax,4,1,1,'#5c3a1e');P(ax-1,3,3,2,'#f3e1b5');P(ax,3,1,1,'#c99a5b');P(ax+1,7,1,2,'#c8392b');}
}
function drawLying(c,X,Y,o,t){
 X=Math.round(X);Y=Math.round(Y);const R=rectFn(c);
 R(X-14,Y-3,28,4,'rgba(0,0,0,.22)');R(X-13,Y-8,26,7,'#7a8a9a');R(X-13,Y-8,26,1,'#9aaaba');
 R(X-12,Y-11,6,6,o.skin);R(X-12,Y-12,6,3,o.hair);R(X-13,Y-11,1,5,o.hair);R(X-9,Y-8,1,1,'#2b1a10');R(X-8,Y-7,1,1,'#e06a5a');
 R(X-6,Y-10,18,5,'#8a4fb0');R(X-6,Y-10,18,1,'#a873cc');for(let i=0;i<18;i+=4)R(X-6+i,Y-8,2,1,'#f2c94c');
 if(Math.sin(t*3)>0)R(X-11,Y-14,1,2,'#9fd8f5');
}
function drawSitting(c,X,Y,o,dir){ // assis autour du feu
 const x0=Math.round(X)-6,y0=Math.round(Y)-16,fl=dir==='right';
 const P=(a,b,w,h,col)=>{if(!col)return;c.fillStyle=col;c.fillRect(x0+(fl?12-a-w:a),y0+b,w,h);};
 c.fillStyle='rgba(0,0,0,.22)';c.fillRect(x0+1,y0+15,10,2);
 P(2,12,8,3,o.bottom);P(1,14,3,1,o.shoe||'#3e2616');P(2,9,8,5,o.top);P(2,9,8,1,o.top2);
 if(o.scarf)P(3,9,6,1,o.scarf);P(2,2,8,7,o.skin);P(2,1,8,3,o.hair);P(6,2,4,6,o.hair);P(3,5,1,2,'#2b1a10');if(o.beard)P(2,7,5,2,o.beard);if(o.long)P(7,7,4,3,o.hair);if(o.hat){P(0,1,12,1,o.hat);P(2,-1,8,2,o.hat);}if(o.cap)P(2,0,8,2,o.cap);
}

// ---------- Animaux ----------
const AN={
 chat:{pal:{u:'#e0893a',U:'#a8541e',x:'#2a1a10',p:'#e98aa0',w:'#fff4e0'},f:[
  ['.........U.U','.........uuu','.U.......uxu','U.uUuUuUuuup','..uUuUuUuuw.','..uuuuuuuu..','..u.u..u.u..','..U.U..U.U..'],
  ['.........U.U','.........uuu','.U.......uxu','U.uUuUuUuuup','..uUuUuUuuw.','..uuuuuuuu..','...u.u..u.u.','...U.U..U.U.']]},
 chien:{pal:{S:'#c99a5b',T:'#7a4f2c',x:'#1a1a22',k:'#1a1a22',w:'#f3e1b5'},f:[
  ['.........TT..','.........TSS.','T........SxSS','.T......SSSSk','..SSSSSSSSw..','..SSSSSSSSw..','..SSSSSSSS...','..S.S...S.S..','..T.T...T.T..'],
  ['.T.......TT..','T........TSS.','.........SxSS','........SSSSk','..SSSSSSSSw..','..SSSSSSSSw..','..SSSSSSSS...','...S.S...S.S.','...T.T...T.T.']]},
 renard:{pal:{u:'#e07a2a',w:'#fff4e0',x:'#2a1a10'},f:[
  ['...........x.x','...........uuu','wu........uuxu','.uu......uuuwx','..uuuuuuuuuw..','...uuuuuuuuw..','...x.x...x.x..','...x.x...x.x..'],
  ['...........x.x','...........uuu','wu........uuxu','.uu......uuuwx','..uuuuuuuuuw..','...uuuuuuuuw..','....x.x...x.x.','....x.x...x.x.']]},
 loup:{pal:{d:'#7a7e86',c:'#b9bcc2',x:'#33353a',y:'#f2c94c'},f:[
  ['............x.x.','............ddd.','d...........dydd','.dd........ddddc','..dddxxxxxddddc.','...ddddddddddc..','...cccccccccc...','...d.d....d.d...','...x.x....x.x...'],
  ['............x.x.','............ddd.','d...........dydd','.dd........ddddc','..dddxxxxxddddc.','...ddddddddddc..','...cccccccccc...','....d.d....d.d..','....x.x....x.x..']]},
 ecureuil:{pal:{U:'#8a3a1a',u:'#c0602a',w:'#fff4e0',x:'#1a1a22'},f:[
  ['.UUU.....','UuuuU..U.','Uu..U.uuu','.U..uuuxu','..Uuuuuu.','...uuuuw.','...uuuw..','...uuu...','...U.U...'],
  ['.UUU.....','UuuuU..U.','Uu..U.uuu','.U..uuuxu','..Uuuuuu.','...uuuuw.','...uuuw..','..uuu....','..U..U...']]},
 chevre:{pal:{q:'#ece6d8',t:'#8a5a33',x:'#1a1a22',k:'#b8ad95'},f:[
  ['........t..t','.........tt.','........qqqq','........qxqq','q......qqqqq','.qqqqqqqqq.k','.qqkqqqqqq..','.qqqqqqqq...','.q.q...q.q..','.t.t...t.t..'],
  ['........t..t','.........tt.','........qqqq','........qxqq','q......qqqqq','.qqqqqqqqq.k','.qqkqqqqqq..','.qqqqqqqq...','..q.q...q.q.','..t.t...t.t.']]},
 vache:{pal:{q:'#f4f0e6',x:'#2a2a2a',p:'#e9a0a8',t:'#c9c2b0'},f:[
  ['..............t..t','..............qqqq','x.............qxqq','.x...........qqqqp','..qqqxxqqqqxxqqqpp','..qqxxxqqqqxxxqq..','..qqqxqqqqqqxqqq..','..qqqqqqqqqqqqqq..','..qqqqqqqqqqqqq...','..q.q......q.q....','..q.q......q.q....','..x.x......x.x....']]},
 cigogne:{pal:{q:'#f4f0e6',x:'#2a2a2a',r:'#d9452a'},f:[
  ['....qq...','....qxq..','....qqrrr','....qq...','...qqq...','..qqqqq..','.qqqqqxx.','.qqqqxxx.','..qqxxx..','...r.r...','...r.r...','...r.r...','..rr.rr..']]},
 heron:{pal:{q:'#b9c0c8',x:'#4a5260',r:'#d9b45a'},f:[
  ['....xq...','....qxq..','....qqrrr','....qq...','....qq...','...qqq...','..qqqqq..','.qqqqqxx.','.qqqqxxx.','..qqxxx..','...r.r...','...r.r...','...r.r...','..rr.rr..']]},
 mouton:{pal:{q:'#f4f0e6',w:'#fff',d:'#d4cec0',x:'#3a3030'},f:[
  ['...........xx.','..wwwwwwww.xxx','.qqqqqqqqqqxwx','.qqqqqqqqqqxx.','.qqqqqqqqqq...','.ddddddddd....','..x.x...x.x...','..x.x...x.x...'],
  ['...........xx.','..wwwwwwww.xxx','.qqqqqqqqqqxwx','.qqqqqqqqqqxx.','.qqqqqqqqqq...','.ddddddddd....','...x.x...x.x..','...x.x...x.x..']]}
};
AN.chat2={pal:{u:'#8a8f98',U:'#5a5e66',x:'#1a1a22',p:'#e98aa0',w:'#e6e6e6'},f:AN.chat.f};
AN.chat3={pal:{u:'#2a2a30',U:'#1a1a20',x:'#f2c94c',p:'#e98aa0',w:'#f4f0e6'},f:AN.chat.f};
AN.vache2={pal:{q:'#c9925a',x:'#8a5a33',p:'#e9b090',t:'#e3d6b4'},f:AN.vache.f};
const _an={};
function animalCanvas(sp,fr){const k=sp+fr;if(_an[k])return _an[k];const a=AN[sp];return _an[k]=spriteFrom(a.f[fr%a.f.length],a.pal);}
function drawAnimal(c,sp,X,Y,dir,fr){
 const a=AN[sp];if(!a)return;const cv=animalCanvas(sp,fr||0),w=cv.width,h=cv.height;X=Math.round(X);Y=Math.round(Y);
 c.fillStyle='rgba(0,0,0,.2)';c.fillRect(X-w/2+1|0,Y-1,w-2,2);
 if(dir<0){c.save();c.translate(X+(w>>1),0);c.scale(-1,1);c.drawImage(cv,0,Y-h);c.restore();}else c.drawImage(cv,X-(w>>1),Y-h);
}
const BFLY=[['#f2e05a','#c9b030'],['#f4d040','#2a2a2a'],['#c8392b','#3d5fb0'],['#ffffff','#bfc8d0'],['#e98a2a','#3a2414']];
function drawButterfly(c,x,y,v,t){x=Math.round(x);y=Math.round(y);const k=BFLY[v%BFLY.length],o=Math.sin(t*18)>0;c.fillStyle=k[0];if(o){c.fillRect(x-3,y-2,3,3);c.fillRect(x+1,y-2,3,3);c.fillStyle=k[1];c.fillRect(x-3,y,1,1);c.fillRect(x+3,y,1,1);}else{c.fillRect(x-1,y-3,1,3);c.fillRect(x+1,y-3,1,3);}c.fillStyle='#2a2a2a';c.fillRect(x,y-2,1,3);}
function drawDragonfly(c,x,y,t){x=Math.round(x);y=Math.round(y);c.fillStyle='#3d7fd0';c.fillRect(x-4,y,8,1);c.fillStyle='#2a4a8a';c.fillRect(x+3,y-1,2,2);c.fillStyle=Math.sin(t*30)>0?'rgba(220,240,255,.8)':'rgba(220,240,255,.4)';c.fillRect(x-1,y-2,2,1);c.fillRect(x+1,y-2,2,1);c.fillRect(x-1,y+1,2,1);c.fillRect(x+1,y+1,2,1);}
function drawVulture(c,x,y,t){x=Math.round(x);y=Math.round(y);const f=Math.sin(t*2)*1.5|0;c.fillStyle='#3a2a20';c.fillRect(x-8,y+f,6,1);c.fillRect(x+3,y+f,6,1);c.fillRect(x-3,y,6,2);c.fillRect(x-10,y+f+1,2,1);c.fillRect(x+9,y+f+1,2,1);c.fillStyle='#e9e0c8';c.fillRect(x+3,y-1,2,1);}
function drawStorkFly(c,x,y,t){x=Math.round(x);y=Math.round(y);const f=Math.sin(t*4)*2|0;c.fillStyle='#f4f0e6';c.fillRect(x-4,y,9,2);c.fillRect(x-2,y-2+f,5,2);c.fillStyle='#2a2a2a';c.fillRect(x-6,y-1+f,3,1);c.fillRect(x+3,y-1+f,3,1);c.fillStyle='#d9452a';c.fillRect(x+5,y,3,1);c.fillRect(x-7,y+1,3,1);}
function animalIcon(sp){const k='ai_'+sp;if(_icoURL[k])return _icoURL[k];const c=mk(26,20),x=c.getContext('2d');
 if(sp==='papillon'){x.save();x.scale(2,2);drawButterfly(x,6,6,2,0.01);x.restore();}
 else if(sp==='libellule'){x.save();x.scale(2,2);drawDragonfly(x,6,5,0);x.restore();}
 else if(sp==='vautour'){drawVulture(x,13,9,0);}
 else if(sp==='truite'){x.drawImage(iconCanvas('truite',2),5,3);}
 else{const cv=animalCanvas(sp,0);const s=Math.min(2,Math.floor(Math.min(24/cv.width,18/cv.height)))||1;x.imageSmoothingEnabled=false;x.drawImage(cv,(26-cv.width*s)/2|0,(20-cv.height*s)/2|0,cv.width*s,cv.height*s);}
 return _icoURL[k]=c.toDataURL();}

// ---------- Feu de camp ----------
function drawCampRing(c,X,Y,lit,t){const R=rectFn(c);X=Math.round(X);Y=Math.round(Y);
 for(let k=0;k<8;k++){const a=k/8*6.283;R(X+Math.cos(a)*7-2,Y+Math.sin(a)*4-1,4,3,k%2?'#8a8c94':'#a9abb2');}
 R(X-5,Y-1,10,2,'#5c3a1e');R(X-3,Y-3,6,2,'#7a4f2c');
 if(lit){const f=Math.sin(t*14),g=Math.sin(t*9+1);R(X-4,Y-6,8,5,'#e0602a');R(X-3,Y-9-(f>0?1:0),6,4,'#f29a3a');R(X-2,Y-12-(g>0?1:0),4,4,'#f6c94c');R(X-1,Y-14+(f>0?1:0),2,3,'#fff2b0');
  for(let k=0;k<3;k++){const p=((t*0.7+k*.33)%1);R(X+Math.sin(t*3+k*2)*4,Y-14-p*22,1,1,p<.6?'#f6c94c':'#e0602a');}}
}
const LOOKS={
 maman:{skin:'#f2c6a0',bottom:'#4a3a2e',hair:'#6b3d1f',top:'#7a9a4a',top2:'#5f7d38',robe:'#6a5a8a',long:1},
 frere:{skin:'#f2c6a0',bottom:'#4a3a2e',hair:'#8a8a8a',top:'#6b4a2e',top2:'#553a22',robe:'#6b4a2e',belt:'#d9c9a3'},
 bucheron:{skin:'#f2c6a0',hair:'#3a2a1a',beard:'#3a2a1a',top:'#b5452f',top2:'#8a2f22',bottom:'#3a4a6a',hat:'#4a3a2a'},
 noe:{skin:'#f0c09a',hair:'#d9a040',top:'#3a6ac0',top2:'#2a50a0',bottom:'#5a5a6a',cap:'#c8392b',pack:'#4a7a3a'},
 fermiere:{skin:'#f2c6a0',bottom:'#4a3a2e',hair:'#b05a2a',top:'#e0d8c0',top2:'#c0b8a0',robe:'#3a6a3a',long:1},
 passeur:{skin:'#e8b890',bottom:'#3a3a4a',hair:'#5a5a5a',beard:'#7a7a7a',top:'#2a4a6a',top2:'#1a3450',hat:'#3a3a3a'},
 pierrot:{skin:'#f2c6a0',bottom:'#3a3a4a',hair:'#bdbdbd',beard:'#bdbdbd',top:'#5a7a8a',top2:'#466270',hat:'#d9c27a'},
 odile:{skin:'#f2c6a0',bottom:'#4a3a2e',hair:'#d9d3c4',top:'#8a6aa8',top2:'#6a4a88',robe:'#5a7a4a',long:1},
 hans:{skin:'#f2c6a0',hair:'#e0c070',beard:'#e0c070',top:'#4a6a8a',top2:'#3a5470',bottom:'#5a4a3a',pack:'#5a7a4a',hat:'#a8844a',hatband:'#5a3a22'},
 colette:{skin:'#f2c6a0',bottom:'#4a3a2e',hair:'#e8e4dc',top:'#c86a8a',top2:'#a04a6a',robe:'#5a4a6a',long:1},
 gaspard:{skin:'#e0b08a',hair:'#4a3a2a',beard:'#4a3a2a',top:'#7a8a3a',top2:'#5a6a2a',bottom:'#4a3a2e',hat:'#6a4a2a'},
 gaston:{skin:'#f2c6a0',hair:'#d9d3c4',top:'#5a3a6a',top2:'#40284e',bottom:'#3a3a3a',cap:'#2a2a3a'},
 marie:{skin:'#f2c6a0',bottom:'#4a3a2e',hair:'#e8e4dc',top:'#3a5a8a',top2:'#2a4470',robe:'#2a2a3a',long:1},
 mateo:{skin:'#e0b08a',hair:'#2a1a12',top:'#d08a2a',top2:'#a86a1a',bottom:'#3a4a6a',pack:'#4a6a3a'},
 berger:{skin:'#e8b890',hair:'#2a2a2a',top:'#f0ece0',top2:'#cfc8b6',bottom:'#2a2a2a',hat:'#1a1a2a',belt:'#c8392b'},
 lucia:{skin:'#c9906a',hair:'#1a1210',top:'#c8392b',top2:'#a02a20',bottom:'#3a3a5a',pack:'#5a3a6a',long:1},
 ramon:{skin:'#d9a07a',hair:'#3a3a3a',beard:'#5a5a5a',top:'#e9e3d4',top2:'#c9c2b0',bottom:'#5a5a4a',hat:'#d9c27a'},
 hospi:{skin:'#e8b890',bottom:'#3a3a4a',hair:'#3a2a1a',top:'#5a7a5a',top2:'#466246',robe:'#5a4a3a'},
 rosa:{skin:'#e8b890',hair:'#5a2a1a',top:'#f2c94c',top2:'#c9a22c',bottom:'#3a4a7a',long:1}
};

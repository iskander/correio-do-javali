'use strict';
// ===== Dessin du monde : décor, entités, compagnons, nuit, météo =====
const LC=mk(VW,VH),lcx=LC.getContext('2d');
function nightAlpha(h){if(h<6)return .64;if(h<7.5)return .64*(7.5-h)/1.5;if(h<19.5)return 0;if(h<21.5)return .64*(h-19.5)/2;return .64;}
function draw(){
 if(mode==='mini'&&MINI){MINI.draw(ctx);return;}
 if(!W){ctx.fillStyle='#2a1a0e';ctx.fillRect(0,0,VW,VH);return;}
 let sx=0;if(shake>0){shake-=1/60;sx=(Math.random()-.5)*3;}
 const cx=Math.round(W.cam+sx),cy=Math.round(W.camY);
 ctx.drawImage(W.bg,cx,cy,VW,VH,0,0,VW,VH);
 ctx.save();ctx.translate(-cx,-cy);
 const x0=Math.floor(cx/T),x1=Math.min(W.Wt-1,x0+21),y0=Math.floor(cy/T),y1=Math.min(W.H-1,y0+13);
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const t=W.tiles[ty*W.Wt+tx];if(t!==2&&t!==8&&t!==10)continue;const h=hash(tx,ty);const off=((time*(t===8?10:t===10?26:16)+h*40)%22)|0;if(off<14){ctx.fillStyle=W.D.sunset&&t===8?'rgba(255,214,140,.7)':'rgba(220,240,255,.55)';ctx.fillRect(tx*T+off,ty*T+4+((h*8)|0),3,1);}}
 const L=[],inV=(x,y)=>x>cx-70&&x<cx+VW+70&&y>cy-30&&y<cy+VH+110;
 for(const t of W.trees)if(inV(t.x,t.y))L.push([t.y,()=>ctx.drawImage(t.img.c,t.x-t.img.ax,t.y-t.img.ay)]);
 for(const e of W.ents)if(!e.gone&&!e.trig&&inV(e.px,e.py))L.push([e.k==='log'?e.ly-12:e.k==='camp'||e.k==='den'||e.k==='ford'?e.py-12:e.py,()=>drawEnt(e)]);
 const title=mode==='title';
 if(!title){
  if(W.campAt){const c=W.campAt,ps=party(),n=ps.length+1;
   for(let k=0;k<n;k++){const a=Math.PI*(.15+.7*k/Math.max(1,n-1))+(n===1?Math.PI*.35:0),x=c.px+Math.cos(a)*22,y=c.py+4+Math.sin(a)*-10+10;
    const id=k===0?null:ps[k-1];L.push([y,()=>{if(id==='chien')drawAnimal(ctx,'chien',x,y,x<c.px?1:-1,0);else if(id)drawSitting(ctx,x,y,LOOKS[COMP[id].look],x<c.px?'right':'left');else drawSitting(ctx,x,y,GIRL,x<c.px?'right':'left');}]);}
  }else{
   followerList().forEach((id,k)=>{const f=followerPos(k);L.push([f[1],()=>{if(id==='chien')drawAnimal(ctx,'chien',f[0],f[1],f[2]==='left'?-1:1,P.moving?f[3]%2:0);else if(id==='goat')drawAnimal(ctx,'chevre',f[0],f[1],f[2]==='left'?-1:1,P.moving?f[3]%2:0);else drawChar(ctx,f[0],f[1],LOOKS[COMP[id].look],f[2],P.moving?f[3]:0,null,f[4]);}]);});
   L.push([P.y,()=>{if(P.inv>0&&Math.floor(time*12)%2)return;drawChar(ctx,P.x,P.y,GIRL,P.dir,P.moving&&P.z===0?P.frame:0,S.eq,P.z);}]);
  }
  if(W.wolf){const w=W.wolf;L.push([w.y,()=>drawAnimal(ctx,'loup',w.x,w.y,w.dir,w.st==='met'?0:w.f)]);}
 }
 L.sort((a,b)=>a[0]-b[0]);for(const d of L)d[1]();
 for(const e of W.ents)if(e.k==='wasps')for(const w of e.w){ctx.fillStyle='#f2c94c';ctx.fillRect(w.x-1,w.y-1,3,2);ctx.fillStyle='#1a1a22';ctx.fillRect(w.x,w.y-1,1,2);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(w.x-1,w.y-2-(Math.floor(time*20)%2),2,1);}
 for(const b of W.birds){if(b.x<cx-30||b.x>cx+VW+30)continue;const by=cy+b.y*.5+Math.sin(time*.5+b.t0)*6;if(b.sp==='vautour'){drawVulture(ctx,b.x,by,time+b.t0);if(!title&&!S.seen.vautour&&mode==='walk')seeAnimal('vautour',true);}else drawStorkFly(ctx,b.x,by,time+b.t0);}
 if(near&&mode==='walk'){let[a,b]=near.act==='comp'?[near.px,near.py]:ip(near);if(near.img)b=near.base-near.ay+4;else b-=26;b+=Math.sin(time*6)*1.5;ctx.fillStyle='#3a2414';ctx.fillRect(a-3,b-1,7,4);ctx.fillRect(a-1,b+3,3,2);ctx.fillStyle='#f2c94c';ctx.fillRect(a-2,b,5,2);ctx.fillRect(a-1,b+2,3,1);ctx.fillRect(a,b+3,1,1);}
 ctx.restore();
 const D=W.D;
 if(D.rain){ctx.fillStyle='rgba(30,50,70,.16)';ctx.fillRect(0,0,VW,VH);ctx.fillStyle='rgba(190,215,240,.6)';for(const d of W.drops)ctx.fillRect(d.x|0,d.y|0,1,4);}
 if(D.mist){for(let k=0;k<4;k++){const y=((k*53+time*4)%(VH+40))-20;ctx.fillStyle='rgba(235,240,245,.10)';ctx.fillRect(0,y,VW,18+k*4);}}
 if(D.sunset){const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'rgba(255,150,60,.22)');g.addColorStop(1,'rgba(150,60,120,.16)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}
 if(S&&!title){const h=W.campAt?Math.max(S.hour,21.5):S.hour;
  if(h>=18&&h<21){ctx.fillStyle='rgba(255,120,40,'+(0.13*Math.sin((h-18)/3*Math.PI))+')';ctx.fillRect(0,0,VW,VH);}
  const a=nightAlpha(h);if(a>.01){lcx.globalCompositeOperation='source-over';lcx.clearRect(0,0,VW,VH);lcx.fillStyle='rgba(14,18,46,'+a+')';lcx.fillRect(0,0,VW,VH);lcx.globalCompositeOperation='destination-out';
   const hole=(x,y,r,s)=>{const g=lcx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+s+')');g.addColorStop(1,'rgba(0,0,0,0)');lcx.fillStyle=g;lcx.fillRect(x-r,y-r,r*2,r*2);};
   hole(P.x-cx,P.y-10-cy,62,.8);
   for(const e of W.ents){if(e.k==='camp'&&e.lit)hole(e.px-cx,e.py-8-cy,96+Math.sin(time*9)*3,1);if((e.k==='gite'||e.k==='house')&&Math.abs(e.px-P.x)<260)hole(e.px-cx,e.base-24-cy,26,.7);}
   ctx.drawImage(LC,0,0);
   for(const e of W.ents)if(e.k==='camp'&&e.lit){ctx.fillStyle='rgba(255,150,60,.10)';ctx.beginPath();ctx.arc(e.px-cx,e.py-8-cy,70,0,7);ctx.fill();}}
  if(S.energy<20&&mode==='walk'){ctx.fillStyle='rgba(40,10,0,'+(.12+.06*Math.sin(time*3))+')';ctx.fillRect(0,0,VW,VH);}
 }
 if(mode==='fade'){ctx.fillStyle='rgba(15,10,25,.88)';ctx.fillRect(0,0,VW,VH);}
}
function drawEnt(e){
 const R=rectFn(ctx);
 if(e.img){ctx.drawImage(e.img,e.px-(e.img.width>>1),e.base-e.ay);if(e.k==='nest'&&Math.floor(time*.7+e.t0)%5===0)R(e.px+3,e.base-e.ay+1,3,1,'#d9452a');return;}
 switch(e.k){
  case 'npc':drawChar(ctx,e.px,e.py,LOOKS[e.def.look],e.dir,0,null);if(!S.flags['seen_'+e.id]&&Math.floor(time*2)%2){R(e.px-1,e.py-30,2,5,'#f2c94c');R(e.px-1,e.py-24,2,2,'#f2c94c');}break;
  case 'pick':case 'plant':{const id=e.k==='pick'?e.item:e.id;if(e.k==='plant'||['thym','plantain','saule','paille'].includes(e.item)){R(e.px-5,e.py-2,10,2,'rgba(0,0,0,.18)');R(e.px-4,e.py-4,2,3,'#2f6b2a');R(e.px+2,e.py-4,2,3,'#2f6b2a');}
   if(e.item==='branche'){const b=getTree('noisetier',1);ctx.drawImage(b.c,e.px-b.ax,e.py+1-b.ay);}
   if(e.item==='chataigne'){const b=getTree('bush',3);}
   ctx.drawImage(iconCanvas(id,1),e.px-4,e.py-11+(e.k==='pick'?Math.round(Math.sin(time*3+e.t0)):0));
   if(Math.floor(time*1.5+e.t0)%3===0)R(e.px+4,e.py-13,1,1,'#fff');
   if(e.k==='plant'&&PLANTS[e.id]&&party().includes('chien')&&Math.hypot(e.px-P.x,e.py-P.y)<70&&Math.floor(time*3)%2)R(e.px-1,e.py-18,2,4,'#f2c94c');break;}
  case 'log':{const x0=(e.tx-1)*T+6,x1=(e.tx+2)*T+10,y=e.ly-10;R(x0,y+8,x1-x0,3,'rgba(0,0,0,.25)');R(x0,y,x1-x0,8,'#7a4f2c');R(x0,y,x1-x0,2,'#9a6a3e');R(x0,y+6,x1-x0,2,'#553319');for(let i=x0+5;i<x1;i+=9)R(i,y+3,4,1,'#5c3a1e');R(x0+12,y,6,2,'#4f9a3a');R(x1-20,y,5,1,'#5aa844');R(x0-2,y-1,4,10,'#c9a26b');R(x0-1,y+1,2,6,'#9a6a3e');break;}
  case 'dive':{const X=e.px+4,Y=e.py-8;R(X,Y,22,9,'#8a5a33');for(let i=0;i<22;i+=4)R(X+i,Y,1,9,'#6b4426');R(X+3,Y+9,2,5,'#553319');R(X+17,Y+9,2,5,'#553319');R(X,Y,22,1,'#a8784a');break;}
  case 'wasps':{const b=getTree('bush',2);ctx.drawImage(b.c,e.px-b.ax,e.py+2-b.ay);R(e.px-3,e.py-16,7,8,'#b8b0a0');R(e.px-2,e.py-15,5,1,'#d8d0c0');R(e.px-2,e.py-12,5,1,'#9a9284');R(e.px,e.py-10,1,1,'#2a2a2a');break;}
  case 'cater':for(let s=6;s>=0;s--){const sy=e.cy-Math.sign(e.v)*s*5;R(e.px-2,sy-2,5,4,s===0?'#3a2a20':'#6a5a3a');R(e.px-3,sy-1,1,1,'#d9c9a3');R(e.px+3,sy-1,1,1,'#d9c9a3');}break;
  case 'animal':if(e.hide>0||e.inv)break;
   if(e.sp==='papillon')drawButterfly(ctx,e.px,e.py-10,(e.tx*7+e.ty)%5,time+e.t0);
   else if(e.sp==='libellule')drawDragonfly(ctx,e.px,e.py-8,time);
   else drawAnimal(ctx,e.sp,e.px,e.py,e.dirx,e.f);
   if(e.stray&&e.trust)R(e.px-1,e.py-16,2,2,'#e98aa0');break;
  case 'mateoSick':drawLying(ctx,e.px,e.py,LOOKS.mateo,time);break;
  case 'camp':drawCampRing(ctx,e.px,e.py-2,e.lit,time);break;
  case 'den':{R(e.px-10,e.py-8,20,8,'#6b4426');R(e.px-6,e.py-6,12,6,'#2a1a10');R(e.px-12,e.py-10,6,2,'#5c3a1e');R(e.px+6,e.py-11,7,2,'#5c3a1e');R(e.px-8,e.py-2,16,2,'#8a6a4a');break;}
  case 'cascade':{const X=e.px,Y=e.py;R(X-14,Y-30,28,22,'#7a7468');R(X-14,Y-30,28,3,'#5aa844');R(X-6,Y-28,12,26,'#86c8ec');for(let k=0;k<5;k++){const yy=Y-28+((time*40+k*7)%26);R(X-5+k*2,yy,1,3,'#e6f4fb');}R(X-10,Y-4,20,3,'rgba(230,244,251,.7)');break;}
  case 'climb':{if(e.down)break;const X=e.px,Y=e.py-4;R(X-1,Y-38,2,36,'#c9a26b');for(let k=0;k<6;k++)R(X-3+(k%2)*4,Y-34+k*6,3,2,'#e3d6b4');R(X-4,Y-40,8,3,'#8a5a33');break;}
  case 'treeclimb':{const q=e.id==='chat'?S.quests.chat:S.quests.noix;if(e.id==='chat'&&q!=='saved'&&q!=='done'){drawAnimal(ctx,'chat',e.px+2,e.py-36,-1,0);if(Math.floor(time*2)%2)R(e.px+8,e.py-48,3,2,'#fff8e8');}if(e.id==='noix'&&!S.flags.noixDone)for(let k=0;k<4;k++)ctx.drawImage(iconCanvas('noix',1),e.px-12+k*7,e.py-40+(k%2)*6);break;}
  case 'ford':{for(let k=0;k<3;k++)R(e.px+(e.to>e.tx?10:-14)+k*6,e.py-4+(k%2)*3,4,2,'#9a9ca4');break;}
 }
}

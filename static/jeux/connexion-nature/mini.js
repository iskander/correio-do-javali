'use strict';
// ===== Mini-jeux : tronc, plongée, escalade, course, gué, chant, feu =====
const MINIS={};
const FONT='8px "Pixelify Sans", monospace';
function txt(c,s,x,y,col,al){c.font=FONT;c.textAlign=al||'left';c.fillStyle='#2e170a';c.fillText(s,x+1,y+1);c.fillStyle=col||'#fff8e8';c.fillText(s,x,y);c.textAlign='left';}
function bar(c,x,y,w,v,col){const R=rectFn(c);R(x-2,y-2,w+4,9,'#3a2414');R(x,y,w*clamp(v,0,1),5,col);}

MINIS.balance=(o,done)=>{
 const stab=S.eq.main==='baton'?.5:has('baton')?.75:1;
 let pos=24,b=0,v=0,t=0,state='go',st=0,fy=0,fv=0,splash=[];
 const trees=[];for(let i=0;i<16;i++)trees.push([i*22+((i*37)%11),60+((i*53)%14),14+((i*29)%8)]);
 return{hint:tt(S.eq.main==='baton'?'mg.balanceStick':'mg.balance'),
 update(dt){t+=dt;
  if(state==='fall'){st+=dt;fv+=320*dt;fy+=fv*dt;if(fy>58&&!splash.length)for(let k=0;k<14;k++)splash.push([pos,170,(Math.random()-.5)*80,-60-Math.random()*80]);
   for(const s of splash){s[0]+=s[2]*dt;s[1]+=s[3]*dt;s[3]+=240*dt;}if(st>1.4)done('fall');return;}
  if(state==='win'){st+=dt;pos+=22*dt;if(st>.9)done('ok');return;}
  const push=(inp.r?1:0)-(inp.l?1:0);
  v+=(b*1.5+Math.sin(t*1.9)*.55+Math.sin(t*3.7+1)*.35)*stab*dt;v+=push*2.4*dt;v*=Math.pow(.6,dt);b+=v*dt*1.6;
  pos+=24*dt*(1-Math.min(1,Math.abs(b))*.5);
  if(Math.abs(b)>=1){state='fall';st=0;}
  if(pos>=292){state='win';st=0;b*=.3;}
 },
 draw(c){const R=rectFn(c);
  R(0,0,VW,VH,'#a8d8ec');R(0,40,VW,30,'#cfe8f0');
  for(const[x,y,h]of trees){c.fillStyle='#4f8a5a';c.beginPath();c.moveTo(x,y-h*2);c.lineTo(x-h*.7,y+4);c.lineTo(x+h*.7,y+4);c.fill();}
  R(0,64,VW,10,'#4f8a5a');
  c.fillStyle='#6b5a48';c.beginPath();c.moveTo(0,70);c.lineTo(46,74);c.lineTo(30,192);c.lineTo(0,192);c.fill();c.beginPath();c.moveTo(VW,70);c.lineTo(274,74);c.lineTo(290,192);c.lineTo(VW,192);c.fill();
  R(30,74,244,94,'#2f4a3a');R(40,90,224,78,'#263e30');
  R(0,170,VW,22,'#3a86c4');for(let i=0;i<12;i++){const x=((i*31+t*40)%340)-10;R(x,174+(i%3)*5,8,1,'#cfe8f6');}
  R(0,104,VW,10,'#7a4f2c');R(0,104,VW,2,'#a8784a');R(0,112,VW,2,'#553319');for(let i=6;i<VW;i+=17)R(i,108,6,1,'#5c3a1e');
  R(296,96,6,8,'#c8392b');R(296,90,1,14,'#3a2414');
  c.save();c.translate(Math.round(pos),104+fy);c.rotate(state==='fall'?b*.7+st*3*Math.sign(b):b*.7);
  drawChar(c,0,0,GIRL,'right',state==='go'?Math.floor(t*6)%4:0,S.eq);c.restore();
  for(const s of splash)R(s[0],s[1],2,2,'#e6f4fb');
  R(98,10,124,12,'#3a2414');R(100,12,120,8,'#c8392b');R(122,12,76,8,'#f2c94c');R(141,12,38,8,'#5aa844');
  const nx=160+clamp(b,-1,1)*58;R(nx-2,7,5,18,'#3a2414');R(nx-1,8,3,16,'#fff8e8');
  R(20,180,280,3,'rgba(0,0,0,.25)');R(20,180,280*clamp((pos-24)/268,0,1),3,'#f2c94c');
 }};
};

MINIS.dive=(o,done)=>{
 let x=60,y=26,vx=0,vy=0,air=1,t=0,dir=1,ended=false,bt=0;
 const res={poisson:0,truite:0,coq:0,air:false};
 const fish=[];for(let k=0;k<5;k++)fish.push({x:40+Math.random()*240,y:60+Math.random()*90,vx:(Math.random()<.5?-1:1)*(16+Math.random()*14),c:['#8aa0b0','#a0907a','#7a9a8a'][k%3],ph:Math.random()*6});
 const gold=(S.quests.poisson==='done'||has('truite'))?null:{x:262,y:150,vx:-20,vy:0,st:1,got:false};
 const shells=S.flags.diveShells?[]:[{x:92,y:177},{x:232,y:179}];
 const rocks=[[44,176,18],[168,178,22],[268,174,26],[212,182,12]];
 const weeds=[];for(let i=0;i<14;i++)weeds.push([10+i*23+((i*7)%9),12+((i*13)%16)]);
 const bubbles=[];
 const finish=()=>{if(ended)return;ended=true;if(!shells.length)S.flags.diveShells=1;done(res);};
 return{hint:tt('mg.dive'),
 update(dt){if(ended)return;t+=dt;
  const ax=inp.r-inp.l,ay=inp.d-inp.u;vx+=ax*260*dt;vy+=ay*260*dt;vy-=16*dt;vx*=Math.pow(.15,dt);vy*=Math.pow(.15,dt);
  x=clamp(x+vx*dt,10,310);y=clamp(y+vy*dt,24,174);if(ax)dir=ax>0?1:-1;
  if(y>32)air-=dt/13;else air=Math.min(1,air+dt*.9);
  if(air<=0){res.air=true;finish();return;}
  bt+=dt;if(bt>.35&&y>30){bt=0;bubbles.push([x+dir*8,y-3]);}
  for(const b of bubbles)b[1]-=30*dt;while(bubbles.length&&bubbles[0][1]<24)bubbles.shift();
  for(let k=fish.length-1;k>=0;k--){const f=fish[k];f.x+=f.vx*dt;if(f.x<16||f.x>304)f.vx*=-1;f.y+=Math.sin(t*2+f.ph)*8*dt;
   if(Math.hypot(f.x-x,f.y-y)<11&&res.poisson<2){fish.splice(k,1);res.poisson++;toast(tt('dv.fish'),'poisson');}}
  if(gold&&!gold.got){const d=Math.hypot(gold.x-x,gold.y-y);
   if(d<60){const a=Math.atan2(gold.y-y,gold.x-x);gold.vx+=Math.cos(a)*200*dt*gold.st;gold.vy+=Math.sin(a)*200*dt*gold.st;gold.st=Math.max(.28,gold.st-dt*.13);}
   else{gold.st=Math.min(1,gold.st+dt*.04);gold.vx+=(Math.random()-.5)*80*dt;gold.vy+=(Math.random()-.5)*80*dt;}
   const sp=Math.hypot(gold.vx,gold.vy),mx=15+80*gold.st;if(sp>mx){gold.vx*=mx/sp;gold.vy*=mx/sp;}
   gold.x+=gold.vx*dt;gold.y+=gold.vy*dt;if(gold.x<20||gold.x>300){gold.vx*=-1;gold.x=clamp(gold.x,20,300);}if(gold.y<60||gold.y>170){gold.vy*=-1;gold.y=clamp(gold.y,60,170);}
   if(d<10){gold.got=true;res.truite=1;toast(tt('it.truite')+' !','truite');}}
  for(let k=shells.length-1;k>=0;k--)if(Math.hypot(shells[k].x-x,shells[k].y-y)<12){shells.splice(k,1);res.coq++;toast(tt('it.coquillage')+' !','coquillage');}
 },
 action(){if(y<=34)finish();else toast(tt('dv.up'));},
 draw(c){const R=rectFn(c);
  R(0,0,VW,24,'#bfe3f2');R(0,14,VW,8,'#5a9a4a');for(let i=0;i<VW;i+=12)R(i,10+((i*7)%5),8,6,'#4f8a40');
  ['#4aa0d0','#3f93c6','#3686ba','#2e78ac','#286b9e','#225e90','#1d5283','#184877'].forEach((col,k)=>R(0,22+k*20,VW,21,col));
  c.fillStyle='rgba(255,255,255,.07)';for(let k=0;k<4;k++){const bx=((k*90+t*8)%400)-40;c.beginPath();c.moveTo(bx,22);c.lineTo(bx+24,22);c.lineTo(bx+70,176);c.lineTo(bx+40,176);c.fill();}
  for(let i=0;i<VW;i+=4)R(i,21+Math.round(Math.sin(i*.12+t*3)),4,2,'#e6f4fb');
  R(0,176,VW,16,'#c9b07a');for(let i=0;i<30;i++)R((i*47)%VW,178+((i*13)%12),2,1,i%2?'#a8905e':'#e0cc98');
  for(const[wx,h]of weeds)for(let j=0;j<h;j++)R(wx+Math.round(Math.sin(t*1.6+j*.3+wx)*j*.12),176-j,2,1,j%3?'#3f8a35':'#5aa844');
  for(const[rx,ry,rr]of rocks){c.fillStyle='#4a5258';c.beginPath();c.ellipse(rx,ry,rr,rr*.6,0,0,7);c.fill();c.fillStyle='#6a747a';c.beginPath();c.ellipse(rx-rr*.25,ry-rr*.2,rr*.6,rr*.3,0,0,7);c.fill();}
  for(const s of shells){R(s.x-4,s.y-3,8,5,'#3a2a3a');R(s.x-3,s.y-3,6,2,'#6a5a7a');R(s.x-1,s.y-4,2,1,'#e6dff0');}
  for(const f of fish){const d=f.vx>0?1:-1;R(f.x-5,f.y-2,10,4,f.c);R(f.x-d*7-1,f.y-3,2,6,f.c);R(f.x+d*3,f.y-1,1,1,'#1a1a22');}
  if(gold&&!gold.got){const d=gold.vx>0?1:-1;R(gold.x-6,gold.y-3,12,6,'#f2c94c');R(gold.x-5,gold.y-3,10,1,'#fff2b0');R(gold.x-d*8-1,gold.y-4,3,8,'#e08a2c');R(gold.x+d*4,gold.y-1,1,1,'#1a1a22');if(Math.floor(t*4)%2)R(gold.x+((t*30)%10)-5,gold.y-6,1,1,'#fff');}
  for(const b of bubbles){c.strokeStyle='rgba(230,244,251,.8)';c.strokeRect(b[0]-1,b[1]-1,3,3);}
  swimmer(c,x,y,dir,t);
  bar(c,10,30,60,air,air<.3?(Math.floor(t*6)%2?'#c8392b':'#f28a7a'):'#9fd8f5');
  let ix=VW-12;const show=(id,n)=>{if(!n)return;ix-=22;c.drawImage(iconCanvas(id,2),ix,26);txt(c,String(n),ix+16,44);};
  show('truite',res.truite);show('poisson',res.poisson);show('coquillage',res.coq);
 }};
};
function swimmer(c,X,Y,d,t){X=Math.round(X);Y=Math.round(Y);const o=GIRL;
 const P=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(d>0?X+a:X-a-w,Y+b,w,h);};const k=Math.floor(t*6)%2;
 P(-12,-1+k,5,2,o.bottom);P(-12,1-k,5,2,o.bottom);P(-14,-1+k,2,2,o.skin);P(-14,1-k,2,2,o.skin);
 P(-7,-3,9,6,o.top);P(-7,-3,9,1,o.top2);P(-5,-4,6,2,o.pack);
 P(2,-4,7,7,o.skin);P(2,-5,6,3,o.hair);P(1,-4,2,6,o.hair);P(-4,-6,6,2,o.hair);P(6,-1,1,2,'#2b1a10');P(1,2,3,1,o.scarf);
 if(k){P(9,-3,5,1,o.skin);P(9,1,4,1,o.skin);}else{P(8,-6,4,1,o.skin);P(8,3,5,1,o.skin);}}

// ---------- Escalade : main gauche, main droite ----------
MINIS.climb=(o,done)=>{
 const H=o.h||10,tree=o.tree,r=rng((Math.random()*1e9)|0);
 const seq=[];for(let k=0;k<H;k++)seq.push(r()<.5?'l':'r');
 let step=0,grip=1,t=0,state='go',st=0,slip=0,anim=0,ledge=0;
 const drain=o.tuto?.05:tree?.08:.1;
 const tex=mk(VW,VH*2),x=tex.getContext('2d'),R0=rectFn(x);
 if(tree){R0(0,0,VW,VH*2,'#a8d8ec');R0(110,0,100,VH*2,'#6b4426');for(let k=0;k<60;k++)R0(110+((k*37)%96),(k*53)%(VH*2),3,10+(k%3)*6,'#553319');for(let k=0;k<5;k++){R0(40,k*80+20,70,8,'#6b4426');R0(210,k*80+60,70,8,'#6b4426');R0(10,k*80+4,60,26,'#3f8a35');R0(240,k*80+44,70,26,'#3f8a35');}}
 else{R0(0,0,VW,VH*2,'#7a7468');for(let k=0;k<140;k++){const a=(k*61)%VW,b=(k*97)%(VH*2);R0(a,b,8+(k%5)*4,3,k%2?'#5e594f':'#948d7f');}for(let k=0;k<20;k++)R0((k*83)%VW,(k*41)%(VH*2),5,3,'#5aa844');}
 return{hint:tt(o.tuto?'mg.climbTuto':'mg.climb'),
 key(k){if(state!=='go'||anim>0)return;if(k!=='l'&&k!=='r')return;
  if(k===seq[step]){step++;anim=.18;grip=Math.min(1,grip+.04);if(step%4===0&&step<H){ledge=1.2;grip=1;}if(step>=H){state='win';st=0;}}
  else{grip-=.25;slip=.3;}},
 update(dt){t+=dt;if(anim>0)anim-=dt;if(slip>0)slip-=dt;
  if(state==='go'){if(ledge>0)ledge-=dt;else grip-=drain*dt;if(grip<=0){state='fall';st=0;}}
  else{st+=dt;if(st>1.1)done(state==='win');}},
 draw(c){const R=rectFn(c);const off=((step-(anim>0?anim/.18:0))*24)%(VH*2);
  const oo=off%(VH*2);c.drawImage(tex,0,oo-VH*2);c.drawImage(tex,0,oo);
  const cx=160,cy=state==='fall'?120+st*st*260:120;
  for(let k=-1;k<5;k++){const s=step+k;if(s<0||s>=H)continue;const side=seq[s],hx=cx+(side==='l'?-22:22),hy=cy-k*24-10+(anim>0?-anim/.18*24:0);
   R(hx-5,hy-3,10,6,k===0?'#f2c94c':'#c9b38a');R(hx-5,hy+3,10,2,'#5e594f');if(k===0&&Math.floor(t*4)%2){txt(c,side==='l'?'◀':'▶',hx+(side==='l'?-16:10),hy+3,'#f2c94c');}}
  if(step%4===0&&step>0&&ledge>0){R(cx-40,cy+8,80,6,'#948d7f');txt(c,tt('mg.ledge'),cx,cy+26,'#fff8e8','center');}
  c.save();if(slip>0)c.translate(Math.sin(t*60)*2,0);drawChar(c,cx,cy+14,GIRL,'up',(step%2)*2+1,S.eq);c.restore();
  R(VW-26,30,10,120,'#3a2414');R(VW-24,32+116*(1-step/H),6,116*step/H,'#5aa844');txt(c,step+'/'+H,VW-21,162,'#fff8e8','center');
  bar(c,12,12,80,grip,grip<.3?'#c8392b':'#f2c94c');txt(c,tt('mg.grip'),12,30);
  if(state==='win')txt(c,tt('mg.top'),160,60,'#f2c94c','center');
 }};
};

// ---------- Course : sauter et courir ----------
MINIS.runner=(o,done)=>{
 const storm=o.storm,rival=o.rival,th=THEMES[W?W.D.theme:'meadow'],goal=storm?3400:3000;
 let dist=0,v=120,y=0,vy=0,t=0,slide=0,stun=0,obs=[],next=1,hits=0,state='go',st=0,rd=0,flash=0;
 const timeL=storm?30:0,rvSpeed=158;
 const hills=[];for(let k=0;k<8;k++)hills.push([k*60,30+(k*17)%25]);
 const jump=()=>{if(state==='go'&&y===0&&slide<=0)vy=235;};
 return{hint:tt(storm?'mg.storm':'mg.race',{n:rival?tt('n.'+rival):''}),
 key(k){if(k==='u')jump();if(k==='d'&&y===0)slide=.65;},action:jump,jump,
 update(dt){t+=dt;if(state!=='go'){st+=dt;if(st>1.2)done({win:state==='win',hits});return;}
  v=Math.min(200,v+5*dt);const sp=stun>0?v*.45:v;if(stun>0)stun-=dt;if(slide>0)slide-=dt;
  dist+=sp*dt;rd+=rvSpeed*dt;
  if(y>0||vy>0){y+=vy*dt;vy-=720*dt;if(y<=0){y=0;vy=0;}}
  next-=dt;if(next<=0){const r=Math.random(),k=r<.3?'rock':r<.55?'log':r<.8?'puddle':'branch';obs.push({k,x:VW+20});next=.9+Math.random()*.9-Math.min(.4,dist/12000);}
  for(const b of obs){b.x-=sp*dt;if(!b.hit&&b.x<78&&b.x>54){const w=b.k==='log'?18:b.k==='puddle'?22:10;
   const hitIt=b.k==='branch'?slide<=0&&y<20:y<(b.k==='log'?9:b.k==='puddle'?2:11);if(hitIt&&b.x<70+w/2&&b.x>58-w/2){b.hit=1;hits++;stun=1;flash=.3;}}}
  obs=obs.filter(b=>b.x>-30);
  if(storm&&Math.random()<dt*.5)flash=.15;if(flash>0)flash-=dt;
  if(dist>=goal){state=(!rival||dist>=rd)?'win':'lose';st=0;}
  else if(rival&&rd>=goal){state='lose';st=0;}
  else if(storm&&t>=timeL){state='lose';st=0;}
 },
 draw(c){const R=rectFn(c);
  R(0,0,VW,VH,storm?'#5a6a7a':'#a8d8ec');
  for(const[hx,hh]of hills){const x=((hx-dist*.2)%480+480)%480-80;c.fillStyle=storm?'#4a5a5a':th.g[1];c.beginPath();c.ellipse(x,130,70,hh+20,0,Math.PI,0);c.fill();}
  R(0,128,VW,64,storm?'#4a6a3a':th.g[0]);R(0,150,VW,14,th.p[0]);for(let i=0;i<20;i++)R(((i*37-dist)%340+340)%340-10,152+(i%3)*4,4,1,th.p[1]);
  for(const b of obs){const X=Math.round(b.x);if(b.k==='rock'){R(X-6,138,12,12,'#8a8c94');R(X-5,138,10,2,'#cfd1d6');}
   else if(b.k==='log'){R(X-9,141,18,9,'#7a4f2c');R(X-9,141,18,2,'#a8784a');R(X+7,141,3,9,'#c9a26b');}
   else if(b.k==='puddle'){R(X-11,148,22,4,'#3a86c4');R(X-9,148,10,1,'#9fd8f5');}
   else{R(X-14,112,28,5,'#5c3a1e');R(X-16,108,12,6,'#3f8a35');R(X+4,107,12,7,'#3f8a35');}}
  if(rival){const rx=70+(rd-dist)*.6;if(rx>-20&&rx<VW+20)drawChar(c,rx,150,LOOKS[COMP[rival].look],'right',Math.floor(t*10)%4);}
  c.save();if(stun>0&&Math.floor(t*14)%2)c.globalAlpha=.5;
  if(slide>0){drawSitting(c,70,152,GIRL,'right');}else drawChar(c,70,150,GIRL,'right',y>0?1:Math.floor(t*(v/14))%4,S.eq,y);c.restore();
  if(storm){c.fillStyle='rgba(190,215,240,.6)';for(let k=0;k<40;k++)c.fillRect(((k*53+t*300)%VW),((k*29+t*400)%VH),1,4);if(flash>0){c.fillStyle='rgba(255,255,255,.5)';c.fillRect(0,0,VW,VH);}}
  R(20,16,280,4,'#3a2414');R(20,16,280*clamp(dist/goal,0,1),4,'#f2c94c');if(rival){const k=clamp(rd/goal,0,1);R(18+280*k,12,4,12,'#c8392b');}
  if(storm)txt(c,tt('mg.time',{n:Math.max(0,Math.ceil(timeL-t))}),VW-10,36,'#fff8e8','right');
  if(state!=='go')txt(c,tt(state==='win'?'mg.win':'mg.lose'),160,80,'#f2c94c','center');
 }};
};

// ---------- Gué : traverser la rivière ensemble ----------
MINIS.ford=(o,done)=>{
 const C=5,Rw=7,cw=40,ch=22,ox=60,oy=20;let help=o.help||0;const r=rng((Math.random()*1e9)|0);
 const st=[];let prev=2;for(let row=1;row<Rw-1;row++){const cols=new Set([prev]);while(cols.size<3)cols.add((r()*C)|0);st[row]={};for(const c of cols)st[row][c]={w:1.1+r()*1.4,p:r()*6};prev=[...cols][(r()*3)|0];}
 let pc=2,pr=0,t=0,state='go',ss=0,trail=[[2,0]],msg=0,fallT=0;
 const up=(row,c)=>{if(row<=0||row>=Rw-1)return 1;const s=st[row][c];if(!s)return-1;return Math.sin(t*s.w+s.p);};
 const sunk=(row,c)=>{const u=up(row,c);return u!==1&&u<-.4;};
 const fall=()=>{if(help>0){help--;msg=1.4;const p=trail[trail.length-2]||[2,0];pc=p[0];pr=p[1];trail.pop();return;}state='lose';ss=0;};
 return{hint:tt('mg.ford'),
 key(k){if(state!=='go')return;let c=pc,row=pr;if(k==='u')row++;if(k==='d')row--;if(k==='l')c--;if(k==='r')c++;if(c<0||c>=C||row<0||row>=Rw)return;
  const u=up(row,c);if(u===-1)return;pc=c;pr=row;trail.push([c,row]);if(trail.length>6)trail.shift();if(u!==1&&u<-.4)fall();else if(row===Rw-1){state='win';ss=0;}},
 update(dt){t+=dt;if(msg>0)msg-=dt;if(state!=='go'){ss+=dt;if(ss>1.1)done(state==='win');return;}if(sunk(pr,pc))fall();},
 draw(c){const R=rectFn(c);R(0,0,VW,VH,'#3a86c4');
  for(let k=0;k<30;k++){const x=((k*47+t*30)%VW),y=(k*23)%VH;R(x,y,10,1,'#86c8ec');}
  R(0,VH-oy-2,VW,oy+2,'#c9b07a');R(0,0,VW,oy+4,'#c9b07a');R(0,0,VW,oy-6,'#5aa844');R(0,VH-8,VW,8,'#5aa844');
  for(let row=1;row<Rw-1;row++)for(let col=0;col<C;col++){const s=st[row][col];if(!s)continue;const u=Math.sin(t*s.w+s.p),X=ox+col*cw+cw/2,Y=VH-oy-row*ch-ch/2+8;
   if(u<-.4){R(X-6,Y-1,12,2,'#5a9ad0');continue;}const h=u<0?.6:1;c.fillStyle=u<0?'#6a6c74':'#9a9ca4';c.beginPath();c.ellipse(X,Y,11*h,6*h,0,0,7);c.fill();R(X-6*h,Y-4*h,8*h,2,'#cfd1d6');if(u<0&&Math.floor(t*8)%2)R(X-12,Y+5,24,1,'#e6f4fb');}
  const cell=(col,row)=>[ox+col*cw+cw/2,VH-oy-row*ch-ch/2+14];
  const ps=party();ps.slice(0,3).forEach((id,k)=>{const p=trail[trail.length-2-k]||[2,0],q=cell(p[0],p[1]);if(id==='chien')drawAnimal(c,'chien',q[0]+8,q[1],1,Math.floor(t*6)%2);else drawChar(c,q[0],q[1],LOOKS[COMP[id].look],'up',0);});
  const q=cell(pc,pr);if(state==='lose'){R(q[0]-8,q[1]-6,16,3,'#e6f4fb');}else drawChar(c,q[0],q[1],GIRL,'up',Math.floor(t*4)%2?1:0,S.eq);
  txt(c,tt('mg.helpers',{n:help}),10,VH-10);
  if(msg>0)txt(c,tt('mg.caught'),160,90,'#f2c94c','center');
  if(state==='win')txt(c,tt('mg.crossed'),160,90,'#f2c94c','center');
 }};
};

// ---------- Chant des pèlerins ----------
MINIS.song=(o,done)=>{
 const syl=['E','ul','tre','ia,','e','su','se','ia,','De','us','ad','ju','va','nos!'],lanes=['l','u','r'];
 const melody=[1,0,1,2,1,0,1,2,0,1,2,1,0,1];const notes=[];let tm=1.6;
 for(let rep=0;rep<2;rep++)syl.forEach((s,k)=>{notes.push({t:tm,l:melody[(k+rep)%melody.length],s,hit:0});tm+=k===3||k===7||k===13?.75:.5;});
 const end=tm+1.2,spd=90,hy=150;let t=0,score=0,last='',lt=0,state='go',st=0;
 const ps=party();
 return{hint:tt('mg.song'),
 key(k){const li=lanes.indexOf(k);if(li<0)return;let best=null,bd=99;for(const n of notes){if(n.hit||n.l!==li)continue;const d=Math.abs((t-n.t)*spd);if(d<bd){bd=d;best=n;}}
  if(best&&bd<16){best.hit=bd<7?2:1;score+=bd<7?1:.7;last=tt(bd<7?'mg.perfect':'mg.good');lt=.6;}else{last=tt('mg.oops');lt=.4;}},
 update(dt){t+=dt;if(lt>0)lt-=dt;for(const n of notes)if(!n.hit&&(t-n.t)*spd>18){n.hit=-1;}
  if(state==='go'&&t>end){state='end';st=0;}if(state==='end'){st+=dt;if(st>1.2)done(clamp(score/notes.length,0,1));}},
 draw(c){const R=rectFn(c);R(0,0,VW,VH,'#1e2440');for(let k=0;k<40;k++)R((k*71)%VW,(k*37)%110,1,1,k%3?'#cfd8f0':'#f2c94c');
  const lx=[130,160,190];for(let i=0;i<3;i++){R(lx[i]-12,0,24,VH,'rgba(255,255,255,.04)');}
  R(110,hy-1,100,2,'#f2c94c');for(let i=0;i<3;i++){R(lx[i]-10,hy-6,20,12,'#3a2414');txt(c,['◀','▲','▶'][i],lx[i],hy+3,'#f2c94c','center');}
  for(const n of notes){const y=hy-(n.t-t)*spd;if(y<-10||y>VH+10||n.hit>0)continue;const X=lx[n.l];R(X-8,y-5,16,10,n.hit<0?'#6a5a7a':['#e0453a','#5aa844','#3d7fd0'][n.l]);R(X-7,y-5,14,2,'rgba(255,255,255,.4)');txt(c,n.s,X+12,y+3,'#fff8e8');}
  const singers=[{look:GIRL,eq:S.eq}].concat(ps.filter(id=>id!=='chien').map(id=>({look:LOOKS[COMP[id].look]})));
  singers.forEach((s,k)=>{const b=Math.abs(Math.sin(t*6+k))*2;drawChar(c,26+k*18,184-b,s.look,'down',0,s.eq);});
  if(ps.includes('chien'))drawAnimal(c,'chien',30+singers.length*18,184,1,Math.floor(t*4)%2);
  for(let k=0;k<4;k++){const p=(t*.5+k*.25)%1;txt(c,'♪',30+k*20+Math.sin(t+k)*6,150-p*60,'rgba(242,201,76,'+(1-p)+')');}
  const cur=notes.find(n=>!n.hit&&n.t>=t-.1);let line='';let shown=0;for(const n of notes.slice(0,14)){line+=n.s+' ';}
  txt(c,'E ultreia, e suseia, Deus adjuva nos!',160,24,'#f2c94c','center');
  if(lt>0)txt(c,last,250,hy+3,'#fff8e8');
  txt(c,Math.round(score/notes.length*100)+'%',VW-10,14,'#fff8e8','right');
 }};
};

// ---------- Feu de camp : étincelles puis souffle ----------
MINIS.fire=(o,done)=>{
 const zw=26+(o.help||0)*8;let t=0,phase=1,m=0,md=1,zx=40+Math.random()*80,sparks=0,flame=.15,blow=false,inZone=0,pen=0,state='go',st=0,fx=[];
 return{hint:tt('mg.fire1'),
 action(){if(state!=='go')return;if(phase===1){const p=m*160;if(p>zx&&p<zx+zw){sparks++;for(let k=0;k<8;k++)fx.push([160,140,(Math.random()-.5)*60,-40-Math.random()*40,.6]);zx=20+Math.random()*(140-zw);if(sparks>=3){phase=2;$('miniHint').textContent=tt('mg.fire2');}}else{fx.push([160,140,0,-10,.3]);}}else blow=true;},
 keyup(){blow=false;},
 update(dt){t+=dt;for(const f of fx){f[0]+=f[2]*dt;f[1]+=f[3]*dt;f[4]-=dt;}fx=fx.filter(f=>f[4]>0);
  if(state!=='go'){st+=dt;if(st>1.2)done(state==='win');return;}
  if(phase===1){m+=md*dt*(1.1+sparks*.25);if(m>1){m=1;md=-1;}if(m<0){m=0;md=1;}}
  else{flame+=(blow?.42:-.18)*dt;flame=clamp(flame,0,1);if(flame>.97){pen++;flame=.2;blow=false;if(pen>=3){state='lose';st=0;}}
   if(flame>.55&&flame<.82)inZone+=dt;if(inZone>=2.6){state='win';st=0;}}},
 draw(c){const R=rectFn(c);R(0,0,VW,VH,'#141a30');for(let k=0;k<50;k++)R((k*71)%VW,(k*37)%120,1,1,'#cfd8f0');R(0,150,VW,42,'#1e2a1e');
  const lit=phase===2?flame:sparks*.05;drawCampRing(c,160,152,phase===2&&flame>.2,t);
  if(phase===2){const h=flame*40;c.fillStyle='rgba(255,150,60,'+(.15+flame*.2)+')';c.beginPath();c.arc(160,140,40+h,0,7);c.fill();}
  for(const f of fx)R(f[0],f[1],2,2,'#f6c94c');
  const ps=party();ps.slice(0,3).forEach((id,k)=>{const x=k%2?220+k*10:100-k*10;if(id==='chien')drawAnimal(c,'chien',x,158,x<160?1:-1,0);else drawSitting(c,x,160,LOOKS[COMP[id].look],x<160?'right':'left');});
  if(phase===1){R(78,40,164,12,'#3a2414');R(80+zx,42,zw,8,'#5aa844');R(80+m*160-1,38,3,16,'#fff8e8');txt(c,tt('mg.sparks',{n:sparks}),160,70,'#f2c94c','center');}
  else{R(296,40,12,100,'#3a2414');R(298,42+96*(1-.82),8,96*.27,'#5aa844');R(298,42+96*(1-flame),8,3,'#fff8e8');R(40,40,80,6,'#3a2414');R(41,41,78*clamp(inZone/2.6,0,1),4,'#f2c94c');txt(c,tt('mg.blow'),80,60,'#fff8e8','center');txt(c,'× '+pen+'/3',300,154,'#fff8e8','center');}
  if(state!=='go')txt(c,tt(state==='win'?'mg.fireOk':'mg.fireKo'),160,100,'#f2c94c','center');
 }};
};

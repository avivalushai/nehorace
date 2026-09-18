// Race drawing: top-down racers, pedestrians, statics, activities, bubbles, HUD.
import { DISP, FONT, GOLD, INK, PINK, SKIN, clamp, hash, rand } from '../core/util.js';
import { R, circ, ell, ln, poly, rr, shade, star } from '../core/draw.js';
import { dogFur } from '../art/dog.js';
import { drawRacerTop } from '../art/racer-top.js';
import { HAIRC, PW, SHIRTC, cx } from './world.js';
import { LH, LW, RK, fmt, lowerBound, race, rctx } from './engine.js';
import { ZONES } from '../music/engine.js';

// ---------- race drawing ----------
function drawPedTop(c,p,t){
  const T=p.type;c.save();c.strokeStyle=INK;c.lineWidth=1.4;
  if(p.flying)c.globalAlpha=Math.min(1,p.fly);
  if(p.down)c.rotate(p.rot);else if(p.vx||p.vd)c.rotate(Math.atan2(p.vx,p.vd));
  const walk=(p.vx||p.vd)&&!p.down?Math.sin(p.ph)*3:0;
  if(T==='dog'||T==='cat'){const s=T==='cat'?.7:1,col=T==='cat'?['#F4A261','#777777','#222222'][p.id%3]:p.fur;c.scale(s,s);
    c.save();c.strokeStyle=col;c.lineWidth=2.5;ln(c,0,8,Math.sin(t*12+p.id)*4,14);c.restore();
    R(c,-4.5,-7+walk*.3,9,15,col);R(c,-3.5,-13,7,7,col);R(c,-4,-13,2,3,shade(col,-.4),1);R(c,2,-13,2,3,shade(col,-.4),1);}
  else if(T==='pigeon'){const flap=p.flying?Math.sin(t*30)*4:0;ell(c,0,0,3,4.5,'#8E949E');if(p.flying){ell(c,-4-flap*.3,0,4,2,'#A6ACB5');ell(c,4+flap*.3,0,4,2,'#A6ACB5');}circ(c,0,-4+(p.flying?0:Math.sin(p.ph)),2.2,'#5E6470',1);}
  else{
    const s=T==='kid'?.72:1;c.scale(s,s);
    R(c,-6,-2+walk,4,6,'#2B2B35',1);R(c,2,-2-walk,4,6,'#2B2B35',1);
    R(c,-8,-3,16,7,p.shirt);
    R(c,-4.5,-9,9,9,SKIN);R(c,-4.5,-9,9,4,p.hair,1);
    if(T==='jogger'){c.fillStyle='#E02A3A';c.fillRect(-4.5,-6,9,1.5);}
    if(T==='senior'){c.save();c.strokeStyle='#6B4B2E';c.lineWidth=2;ln(c,8,-2,11,6);c.restore();}
    if(T==='vendor')R(c,-4.5,-11,9,3,'#FFFFFF');
    if(p.balloon&&!p.down){c.save();c.strokeStyle='#999';c.lineWidth=.8;ln(c,6,-2,10,-14);c.restore();circ(c,10,-17,5,p.balloon);}
  }
  c.restore();
  if(p.down){for(let i=0;i<3;i++){const a=t*5+i*2.1;star(c,Math.cos(a)*9,-10+Math.sin(a)*4,3.2,GOLD);}}
}
function drawStatic(c,s,t,layer){
  c.save();c.strokeStyle=INK;c.lineWidth=2;
  if(layer===1){
    if(s.type==='tree'){ell(c,7,9,s.r,s.r*.8,'rgba(0,0,0,.18)');const g=s.hue<.5?['#2F8A3A','#3FA34A','#5CBF5C']:['#2C7A45','#3E9657','#62B870'];circ(c,0,0,s.r,g[0]);circ(c,-s.r*.25,-s.r*.2,s.r*.62,g[1],1);circ(c,-s.r*.35,-s.r*.35,s.r*.3,g[2],1);}
    if(s.type==='lamp'){ell(c,0,0,11,11,'rgba(255,247,176,.2)');circ(c,0,0,4,'#2B2B35');}
  }else{
    if(s.type==='flower'){circ(c,0,0,15,'#6B4B2E');for(let i=0;i<7;i++){const a=i*.9+s.hue*6;circ(c,Math.cos(a)*9,Math.sin(a)*9,3,['#FF3D8B','#FFC83D','#FFFFFF','#8E44FF'][i%4],1);}}
    if(s.type==='bench'){if(s.broken){c.rotate(.5);R(c,-6,-16,12,14,'#9B6A3A');c.rotate(-1);R(c,-6,4,12,14,'#9B6A3A');}else{R(c,-6,-17,12,34,'#9B6A3A');c.fillStyle='rgba(0,0,0,.2)';c.fillRect(-2,-16,1.5,32);c.fillRect(2,-16,1.5,32);}}
    if(s.type==='bin'){if(s.broken){ell(c,4,2,8,5,'#2E7D4F');for(let i=0;i<5;i++)R(c,-8+i*5,8+(i%2)*4,3,3,['#fff','#E63946','#FFC83D'][i%3],1);}else circ(c,0,0,7,'#2E7D4F');}
    if(s.type==='cart'){if(s.broken){c.rotate(.6);R(c,-12,-9,24,18,'#FFFFFF');c.rotate(-.6);for(let i=0;i<6;i++)circ(c,-14+i*6,14+(i%2)*5,3,['#FFB3CF','#FFF1B0','#B5F0D6'][i%3],1);}
      else{R(c,-12,-9,24,18,'#FFFFFF');for(let i=0;i<8;i++){c.beginPath();c.moveTo(0,0);c.arc(0,0,15,i*Math.PI/4,(i+1)*Math.PI/4);c.closePath();c.fillStyle=i%2?'rgba(255,255,255,.92)':'rgba(255,61,139,.92)';c.fill();}c.beginPath();c.arc(0,0,15,0,7);c.stroke();}}
    if(s.type==='act')drawAct(c,s,t);
    if(s.type==='mangal'){
      c.save();if(s.broken)c.rotate(.35);R(c,-28,-20,56,40,s.hue);c.fillStyle='rgba(255,255,255,.28)';for(let i=0;i<4;i++)c.fillRect(-28+i*14,-20,7,40);c.restore();
      if(s.broken){c.save();c.translate(10,8);c.rotate(1.3);R(c,-7,-4,14,8,'#222');c.restore();for(let i=0;i<5;i++)R(c,-18+i*8,20+(i%2)*4,6,2.5,'#7A3E1A',1);}
      else{R(c,14,-6,14,10,'#222');c.fillStyle='#FF7A1A';c.fillRect(16,-4,10,2);for(let i=0;i<3;i++){const k=(t*.5+i/3)%1;c.fillStyle=`rgba(220,220,220,${.5*(1-k)})`;c.beginPath();c.arc(21+Math.sin(t+i)*3,-8-k*26,3+k*7,0,7);c.fill();}}
      for(let i=0;i<s.sitters;i++){const a=[[-18,-22],[-20,20],[4,24]][i];c.save();c.translate(a[0],a[1]);if(s.broken)c.rotate(Math.sin(t*6+i)*.3);R(c,-7,-3,14,7,SHIRTC[(s.seed+i*3)%SHIRTC.length]);R(c,-4,-8,8,8,SKIN);R(c,-4,-8,8,3,HAIRC[(s.seed+i)%HAIRC.length],1);c.restore();}
    }
  }
  c.restore();
}
function personTop(c,x,y,rot,shirt,hair,sc,lying){c.save();c.translate(x,y);c.rotate(rot);if(sc)c.scale(sc,sc);if(lying){R(c,-4,3,3.5,11,'#2B2B35');R(c,.5,3,3.5,11,'#2B2B35');}R(c,-7,-3,14,7,shirt);R(c,-4,-9,8,8,SKIN);R(c,-4,-9,8,3,hair,1);c.restore();}
function dizzy(c,x,y,t){for(let i=0;i<3;i++){const a=t*5+i*2.1;star(c,x+Math.cos(a)*8,y+Math.sin(a)*3.5,3,GOLD);}}
function drawAct(c,s,t){
  c.scale(1.25,1.25);c.lineWidth=1.4;const down=s.broken&&s.bt<3.2,tt=t+s.ph,sh=i=>SHIRTC[(s.seed+i*3)%SHIRTC.length],hr=i=>HAIRC[(s.seed+i)%HAIRC.length];
  const P=(x,y,rot,i,o)=>{o=o||{};personTop(c,x,y,down?rot+1.4+i*.6:rot,o.shirt||sh(i),o.hair||hr(i),o.sc,down||o.lying);if(down)dizzy(c,x,y-12,t+i);};
  const face=(x,y)=>Math.atan2(-x,y);
  switch(s.kind){
    case 'juggle':{P(0,6,0,0);const cols=['#FF3D8B','#FFC83D','#3DA5FF'];
      if(!down)for(let i=0;i<3;i++){const a=tt*5+i*2.094;circ(c,Math.cos(a)*10,-12+Math.sin(a)*4-Math.abs(Math.cos(a))*7,3,cols[i]);}
      else for(let i=0;i<3;i++)circ(c,-14+i*13,18+(i%2)*4,3,cols[i]);break;}
    case 'frisbee':{P(0,-30,Math.PI,0);P(0,30,0,1);
      if(!down){const k=(Math.sin(tt*1.7)+1)/2,y=-24+48*k,x=Math.sin(k*Math.PI)*16;ell(c,x+3,y+5,6,3,'rgba(0,0,0,.18)');circ(c,x,y,5,'#FF3D8B');circ(c,x,y,2,'#FFFFFF',1);}
      else{circ(c,24,6,5,'#FF3D8B');}break;}
    case 'sunbathe':{
      for(let i=0;i<2;i++){const x=-11+i*22;c.save();c.translate(x,0);if(down)c.rotate(i?.5:-.5);R(c,-8,-20,16,40,i?'#3DA5FF':'#FFC83D');c.fillStyle='rgba(255,255,255,.5)';c.fillRect(-8,-12,16,3);c.fillRect(-8,8,16,3);c.restore();
        c.save();c.translate(x,1);if(down)c.rotate(i?1.3:-1.3);R(c,-3.5,-4,7,19,SKIN);R(c,-3.5,4,7,5,i?'#E63946':'#8E44FF');R(c,-4,-13,8,9,SKIN);R(c,-4,-13,8,3,hr(i),1);R(c,-4,-10,8,2,'#111',1);c.restore();if(down)dizzy(c,x,-18,t+i);}
      if(!down){c.save();c.translate(0,-28);for(let i=0;i<8;i++){c.beginPath();c.moveTo(0,0);c.arc(0,0,12,i*Math.PI/4,(i+1)*Math.PI/4);c.closePath();c.fillStyle=i%2?'rgba(255,255,255,.92)':'rgba(61,165,255,.92)';c.fill();}c.beginPath();c.arc(0,0,12,0,7);c.stroke();c.restore();}break;}
    case 'football':{const pos=[[-22,-16],[20,-12],[0,22]];pos.forEach((p,i)=>P(p[0],p[1],face(p[0],p[1]),i,{sc:.75}));
      R(c,-30,-2,4,4,'#E63946',1);R(c,-30,12,4,4,'#E63946',1);
      if(!down){const k=(tt*.9)%3,i0=Math.floor(k),f=k-i0,a=pos[i0],b=pos[(i0+1)%3];const bx=a[0]+(b[0]-a[0])*f,by=a[1]+(b[1]-a[1])*f;circ(c,bx,by,3.5,'#FFFFFF');circ(c,bx,by,1.2,INK,1);}
      else{circ(c,30,24,3.5,'#FFFFFF');}break;}
    case 'sheshbesh':{
      c.save();if(down)c.rotate(.7);R(c,-12,-9,24,18,'#8B5A2B');R(c,-10,-7,20,14,'#E8C79A',1);
      for(let i=0;i<6;i++){const x=-9+i*3.4,col=i%2?'#7A2E1A':'#1B120C';poly(c,[[x,-7],[x+3,-7],[x+1.5,-1]],col,1);poly(c,[[x,7],[x+3,7],[x+1.5,1]],col,1);}
      c.fillStyle='#8B5A2B';c.fillRect(-.7,-7,1.4,14);c.restore();
      if(!down){const j=Math.abs(Math.sin(tt*3))*3;R(c,-4,-1-j,3,3,'#FFFFFF');R(c,2,-1-j*.7,3,3,'#FFFFFF');}
      else for(let i=0;i<6;i++)circ(c,-16+i*6,14+(i%2)*5,2,i%2?'#7A2E1A':'#FFFFFF',1);
      P(-20,0,Math.PI/2,0,{hair:'#D8D8D8',shirt:'#C8B08A'});P(20,0,-Math.PI/2,1,{hair:'#D8D8D8',shirt:'#9AA3B0'});
      circ(c,-12,-14,2.5,'#FFFFFF');circ(c,12,14,2.5,'#FFFFFF');break;}
    case 'nargila':{const seats=[[-18,-10],[18,-10],[0,20]];
      if(!down){c.save();c.strokeStyle='#5E3A8A';c.lineWidth=1.5;seats.forEach(p=>ln(c,0,0,p[0]*.6,p[1]*.6));c.restore();circ(c,0,0,6,'rgba(61,165,255,.75)');circ(c,0,0,3,'#8B5A2B');circ(c,0,0,1.6,'#FF7A1A',1);
        for(let i=0;i<3;i++){const k=(tt*.45+i/3)%1;c.fillStyle=`rgba(235,235,245,${.55*(1-k)})`;c.beginPath();c.arc(-18+Math.sin(tt+i)*4-k*6,-18-k*24,3+k*8,0,7);c.fill();}}
      else{c.save();c.rotate(1.2);ell(c,0,0,4,11,'rgba(61,165,255,.75)');c.restore();for(let i=0;i<4;i++)circ(c,-8+i*6,8+(i%2)*3,1.8,'#FF7A1A',1);}
      seats.forEach((p,i)=>P(p[0],p[1],face(p[0],p[1]),i));break;}
    case 'yoga':{for(let i=0;i<2;i++){const x=-13+i*26;R(c,x-7,-18,14,36,i?'#8E44FF':'#FF7FB0');
        if(!down){const b=1+Math.sin(tt*1.5+i)*.06;c.save();c.translate(x,0);c.scale(b,b);R(c,-13,-1,26,3,SKIN);personTop(c,0,0,0,sh(i),hr(i));c.restore();}
        else P(x,0,0,i);}break;}
    case 'guitar':{P(0,0,-Math.PI/2,0);P(20,12,face(20,12)+Math.PI,1);
      if(!down){c.save();c.translate(-3,6);c.rotate(.5);ell(c,0,0,5,7,'#B5651D');c.beginPath();c.ellipse(0,0,5,7,0,0,7);c.stroke();R(c,-1,-18,2,12,'#5A3A1C',1);c.restore();
        c.save();c.font=`12px ${FONT}`;c.fillStyle=INK;c.textAlign='center';for(let i=0;i<2;i++){const k=(tt*.5+i*.5)%1;c.globalAlpha=1-k;c.fillText('♪',-10+i*10+Math.sin(tt*2+i)*4,-12-k*22);}c.restore();}
      else{c.save();c.translate(-16,14);c.rotate(1.9);ell(c,0,0,5,7,'#B5651D');R(c,-1,-18,2,12,'#5A3A1C',1);c.restore();}break;}
  }
}
function drawBubble(c,b,x,y){
  c.save();c.direction='rtl';c.font=`13px ${FONT}`;const tw=c.measureText(b.text).width,w=tw+14,h=22;
  x=clamp(x,w/2+4,LW-w/2-4);y=clamp(y,112,LH-40);
  c.globalAlpha=clamp(Math.min(b.life*3,(b.max-b.life)*8+.2),0,1);
  const bg=b.kind==='me'?GOLD:b.kind==='opp'?PINK:'#FFFFFF',fg=b.kind==='opp'?'#FFFFFF':INK;
  c.fillStyle=bg;c.strokeStyle=INK;c.lineWidth=2;rr(c,x-w/2,y-h,w,h,8);c.fill();c.stroke();
  poly(c,[[x-5,y-1],[x+5,y-1],[x,y+6]],bg);c.fillStyle=bg;c.fillRect(x-4,y-3,8,3);
  c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.fillText(b.text,x,y-h/2+1);c.restore();
}
function render(){
  const c=rctx,P=race.player,t=race.t;c.setTransform(RK,0,0,RK,0,0);
  const baseY=LH*.72,shx=race.shake?(Math.random()-.5)*race.shake:0,shy=race.shake?(Math.random()-.5)*race.shake:0;
  const ox=LW/2-race.camX+shx,SX=x=>x+ox,SY=d=>baseY-(d-P.d)+shy;
  const dTop=P.d+baseY+80,dBot=P.d-(LH-baseY)-80;
  c.fillStyle='#63B548';c.fillRect(0,0,LW,LH);
  c.fillStyle='rgba(255,255,255,.055)';for(let d=Math.floor(dBot/70)*70;d<dTop;d+=70)if(Math.floor(d/70)%2===0)c.fillRect(0,SY(d+70),LW,70);
  c.beginPath();for(let d=dBot;d<=dTop;d+=20)c.lineTo(SX(cx(d)-PW/2),SY(d));for(let d=dTop;d>=dBot;d-=20)c.lineTo(SX(cx(d)+PW/2),SY(d));c.closePath();c.fillStyle='#EBD9AC';c.fill();
  c.strokeStyle='#CBB27A';c.lineWidth=5;for(const sd of[-1,1]){c.beginPath();for(let d=dBot;d<=dTop;d+=20)c.lineTo(SX(cx(d)+sd*PW/2),SY(d));c.stroke();}
  c.fillStyle='rgba(150,120,70,.18)';for(let d=Math.floor(dBot/37)*37;d<dTop;d+=37)c.fillRect(SX(cx(d)+(hash(d,1)-.5)*PW*.9),SY(d),4,2);
  for(const ld of[0,race.L]){if(ld<dBot||ld>dTop)continue;const y=SY(ld),x0=SX(cx(ld)-PW/2);for(let i=0;i<PW/10;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#FFFFFF':INK;c.fillRect(x0+i*10,y-10+j*10,10,10);}}
  const i0=lowerBound(race.statics,dBot-60);
  for(let i=i0;i<race.statics.length&&race.statics[i].d<dTop+60;i++){const s=race.statics[i];c.save();c.translate(SX(s.x),SY(s.d));drawStatic(c,s,t,0);c.restore();}
  for(const k of race.pickups){if(k.taken||k.d<dBot||k.d>dTop)continue;const x=SX(k.x),y=SY(k.d)+Math.sin(t*4+k.d)*2;ell(c,x,y,13,13,'rgba(255,200,61,.35)');c.strokeStyle=INK;c.lineWidth=1.6;R(c,x-5,y-9,10,18,'#1F5FD0');poly(c,[[x+1,y-6],[x-3,y+1],[x,y+1],[x-1,y+6],[x+3,y-1],[x,y-1]],GOLD,1);}
  const actors=[];for(const p of race.peds)if(!p.gone&&p.d>dBot&&p.d<dTop)actors.push(p);for(const r of race.racers)if(r.d>dBot-40&&r.d<dTop)actors.push(r);
  actors.sort((a,b)=>b.d-a.d);
  for(const a of actors){c.save();c.translate(SX(a.x),SY(a.d));
    if(a.isRacer){c.scale(1.25,1.25);
      if(a.look.dog!=='none'){c.save();c.translate(20,8);drawPedTop(c,{type:'dog',id:a.idx,vx:0,vd:1,ph:t*12,fur:dogFur(a.look.dog)},t);c.restore();}
      drawRacerTop(c,a);
      c.scale(.8,.8);c.font=`12px ${FONT}`;c.textAlign='center';c.direction='rtl';c.lineWidth=3;c.strokeStyle=INK;c.fillStyle=a.isPlayer?GOLD:'#FFFFFF';const lbl=a.isPlayer?'אתה':a.name;c.strokeText(lbl,0,-34);c.fillText(lbl,0,-34);}
    else drawPedTop(c,a,t);
    c.restore();}
  for(let i=i0;i<race.statics.length&&race.statics[i].d<dTop+60;i++){const s=race.statics[i];if(s.type!=='tree'&&s.type!=='lamp')continue;c.save();c.translate(SX(s.x),SY(s.d));drawStatic(c,s,t,1);c.restore();}
  for(const[bd,txt,col]of[[40,'NehoRace',PINK],[race.L+20,'קו סיום',GOLD]]){if(bd<dBot||bd>dTop)continue;const y=SY(bd),x0=SX(cx(bd)-PW/2-10),w=PW+20;c.strokeStyle=INK;c.lineWidth=2.5;circ(c,x0,y,6,'#2B2B35');circ(c,x0+w,y,6,'#2B2B35');R(c,x0+8,y-11,w-16,22,col);c.fillStyle=col===GOLD?INK:'#FFFFFF';c.font=`18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText(txt,x0+w/2,y+1);}
  if(P.turboT>0){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;for(let i=0;i<14;i++){const x=hash(i,Math.floor(t*20))*LW,y=hash(i+9,Math.floor(t*20))*LH;ln(c,x,y,x,y+40);}}
  {const placed=[];c.font=`13px ${FONT}`;for(const b of race.bubbles){const o=b.owner;const x=SX(o.x);let y=SY(o.d)-(o.isRacer?40:18);if(y<-40||y>LH+40)continue;const w=c.measureText(b.text).width+14;
    for(let k=0;k<6;k++){const hit=placed.find(q=>Math.abs(q.x-x)<(q.w+w)/2&&Math.abs(q.y-y)<25);if(!hit)break;y=hit.y-26;}placed.push({x,y,w});drawBubble(c,b,x,y);}}
  // HUD
  const order=[...race.racers].sort((a,b)=>(b.finished?1e9-b.finishTime:b.d)-(a.finished?1e9-a.finishTime:a.d));const pos=order.indexOf(P)+1;
  c.save();c.lineJoin='round';c.textBaseline='alphabetic';c.strokeStyle=INK;
  c.direction='rtl';c.textAlign='right';c.font=`14px ${FONT}`;c.fillStyle='#FFFFFF';c.lineWidth=3;c.strokeText('מקום',LW-16,26);c.fillText('מקום',LW-16,26);
  c.direction='ltr';const tot='/'+race.racers.length;c.font=`30px ${DISP}`;const pw=c.measureText(tot).width;c.fillStyle='#FFFFFF';c.lineWidth=4;c.strokeText(tot,LW-16,78);c.fillText(tot,LW-16,78);
  c.font=`64px ${DISP}`;c.lineWidth=6;c.strokeText(String(pos),LW-18-pw,78);c.fillStyle=GOLD;c.fillText(String(pos),LW-18-pw,78);
  c.textAlign='center';c.font=`30px ${DISP}`;c.lineWidth=4;const shownT=P.finished?P.finishTime:race.time;c.strokeText(fmt(shownT),LW/2,40);c.fillText(fmt(shownT),LW/2,40);
  const px0=LW-24,px1=24,py=96;c.strokeStyle='rgba(26,11,41,.55)';c.lineWidth=6;c.lineCap='round';ln(c,px0,py,px1,py);c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;ln(c,px0,py,px1,py);
  c.strokeStyle=INK;c.lineWidth=1.5;for(const r of race.racers){if(r.isPlayer)continue;circ(c,px0+(px1-px0)*clamp(r.d/race.L,0,1),py,4.5,PINK);}
  c.lineWidth=2;circ(c,px0+(px1-px0)*clamp(P.d/race.L,0,1),py,7,GOLD);
  for(let i=0;i<4;i++){c.fillStyle=i%2?'#fff':INK;c.fillRect(px1-8+i*4,py-8,4,4);c.fillStyle=i%2?INK:'#fff';c.fillRect(px1-8+i*4,py-4,4,4);}
  c.textAlign='right';c.direction='ltr';c.font=`52px ${DISP}`;c.lineWidth=6;c.strokeStyle=INK;const sp=String(Math.round(P.speed*.09));c.strokeText(sp,LW-18,LH-34);c.fillStyle='#FFFFFF';c.fillText(sp,LW-18,LH-34);
  c.direction='rtl';c.font=`13px ${FONT}`;c.lineWidth=3;c.strokeText('קמ״ש',LW-18,LH-16);c.fillText('קמ״ש',LW-18,LH-16);
  c.textAlign='center';c.direction='rtl';
  if(race.phase==='count'){const n=Math.ceil(race.count);if(n<=3){c.font=`150px ${DISP}`;c.lineWidth=10;c.strokeText(String(n),LW/2,LH*.42);c.fillStyle=GOLD;c.fillText(String(n),LW/2,LH*.42);}
    c.font=`16px ${FONT}`;c.lineWidth=4;c.fillStyle='#fff';for(const[k,s]of[[0,'גוררים אצבע ימינה ושמאלה כדי לנווט'],[24,'פחיות כחולות ממלאות טורבו']]){c.strokeText(s,LW/2,LH*.52+k);c.fillText(s,LW/2,LH*.52+k);}}
  if(race.goT>0){c.font=`120px ${DISP}`;c.lineWidth=10;c.globalAlpha=Math.min(1,race.goT*2);c.strokeText('סע!!',LW/2,LH*.42);c.fillStyle=PINK;c.fillText('סע!!',LW/2,LH*.42);c.globalAlpha=1;}
  if(race.zoneT>0){c.save();c.globalAlpha=clamp(Math.min(race.zoneT,2.6-race.zoneT)*4,0,1);const txt=`♫ ${ZONES[race.zone].name}`;c.font=`20px ${FONT}`;c.direction='rtl';c.textAlign='center';c.textBaseline='middle';const w=c.measureText(txt).width+30;c.fillStyle=PINK;c.strokeStyle=INK;c.lineWidth=2.5;rr(c,LW/2-w/2,116,w,36,18);c.fill();c.stroke();c.fillStyle='#FFFFFF';c.fillText(txt,LW/2,135);c.restore();}
  if(race.phase==='done'){c.font=`96px ${DISP}`;c.lineWidth=9;c.strokeText('סיימת!',LW/2,LH*.4);c.fillStyle=GOLD;c.fillText('סיימת!',LW/2,LH*.4);c.font=`24px ${FONT}`;c.lineWidth=5;const tx=`מקום ${pos}`;c.strokeText(tx,LW/2,LH*.4+40);c.fillStyle='#fff';c.fillText(tx,LW/2,LH*.4+40);}
  c.restore();
}

export { drawPedTop, drawStatic, drawAct, render };

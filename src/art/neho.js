// The Nehorai character: front view (drawNeho) and back view (drawNehoBack).
import { FONT, GOLD, GOLD2, HAIRDK, INK, SKIN } from '../core/util.js';
import { R, circ, ell, ln, poly, rr, shade, star } from '../core/draw.js';
import { PANTS, SHIRTS, SHOES } from '../core/catalog.js';
import { HAIR_COL, KEEP_HAIR, SHADES_LIKE, hairBehind, hairFrontX, hairBackX, beardX, capX, capBackX, chainX, shirtMesh, shirtX, pantsX, shoesX, accX } from './wardrobe.js';

// ================= NEHORAI (front view, origin = feet) =================
function linkChain(c,x0,x2,y,depth,n,lw,lh,c1,c2){
  const cy=2*depth-y,cxm=(x0+x2)/2;
  for(let i=0;i<=n;i++){const u=i/n,a=(1-u)*(1-u),b=2*(1-u)*u,d=u*u;
    const px=a*x0+b*cxm+d*x2,py=a*y+b*cy+d*y;
    const tx=2*(1-u)*(cxm-x0)+2*u*(x2-cxm),ty=2*(1-u)*(cy-y)+2*u*(y-cy);
    c.save();c.translate(px,py);c.rotate(Math.atan2(ty,tx));rr(c,-lw/2,-lh/2,lw,lh,lh/2);c.fillStyle=i%2?c1:c2;c.fill();c.lineWidth=1.3;c.stroke();c.restore();}
}
function hairColor(h){return h==='bleach'?'#F6E07A':h==='mullet'?'#3B2414':HAIR_COL[h]||'#1B120C';}
function drawNeho(c,L,t,pose){
  t=t||0;const sk=SKIN;
  c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=3;
  const P=PANTS[L.pants],S=SHIRTS[L.shirt];
  const pb=P.short?-52:-12;
  // legs and shoes. pose (optional, for idle animation): {legL,legR} lifts each foot, {armL,armR} rotates each arm at the shoulder
  const legs=()=>{
    if(P.short){R(c,-31,-86,28,74,sk);R(c,3,-86,28,74,sk);}
    R(c,-31,-86,28,pb+86,P.c);R(c,3,-86,28,pb+86,P.c);
    if(L.pants==='track'){c.fillStyle='#EDEDED';for(const x of[-29,-24,21,26])c.fillRect(x,-82,3,66);}
    if(L.pants==='ripped'){c.save();c.strokeStyle='#D6E2FA';c.lineWidth=2.5;ln(c,-25,-46,-11,-44);ln(c,-23,-40,-14,-39);ln(c,9,-58,23,-56);ln(c,11,-30,21,-29);c.restore();}
    if(L.pants==='swim'){c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<3;i++){c.fillRect(-28+i*9,-82,3,26);c.fillRect(7+i*9,-82,3,26);}}
    if(L.pants==='shorts'){c.fillStyle='#E7EEF9';c.fillRect(-30,-56,26,3);c.fillRect(4,-56,26,3);}
    pantsX(c,L);
    if(L.shoes==='flip'){R(c,-33,-13,30,9,sk);R(c,3,-13,30,9,sk);R(c,-35,-5,33,5,'#26262E');R(c,2,-5,33,5,'#26262E');c.save();c.strokeStyle='#3DA5FF';c.lineWidth=3;ln(c,-26,-12,-18,-6);ln(c,-10,-12,-18,-6);ln(c,10,-12,18,-6);ln(c,26,-12,18,-6);c.restore();}
    else{const sc=SHOES[L.shoes];R(c,-35,-15,33,15,sc);R(c,2,-15,33,15,sc);c.fillStyle=L.shoes==='blackgold'?GOLD:'rgba(0,0,0,.22)';c.fillRect(-34,-5,31,3);c.fillRect(3,-5,31,3);
      if(L.shoes!=='blackgold'){c.fillStyle=L.shoes==='white'?'#E02A3A':'#FFFFFF';c.fillRect(-27,-11,11,3);c.fillRect(16,-11,11,3);}}
    shoesX(c,L);
  };
  if(!pose)legs();
  else for(const side of[-1,1]){c.save();c.beginPath();c.rect(side<0?-60:0,-110,60,120);c.clip();c.translate(0,-(side<0?pose.legL:pose.legR)||0);legs();c.restore();}
  R(c,-11,-186,22,20,sk);
  const sc=S.c||sk;
  for(const ax of[-64,42]){
    c.save();if(pose){const a=(ax<0?pose.armL:pose.armR)||0;c.translate(ax+11,-164);c.rotate(a);c.translate(-(ax+11),164);}
    if(S.sl==='long'){R(c,ax,-168,22,78,sc);if(L.shirt==='track'){c.fillStyle='#EDEDED';c.fillRect(ax<0?ax+3:ax+16,-164,3,70);}}
    else if(S.sl==='short'){R(c,ax,-140,22,50,sk);R(c,ax-1,-169,24,32,sc);if(L.shirt==='jersey'){c.fillStyle='#1B8A3C';c.fillRect(ax,-141,22,4);}}
    else R(c,ax,-168,22,78,sk);
    R(c,ax+1,-92,20,16,sk);
    c.restore();
  }
  if(L.shirt==='none'){
    R(c,-40,-170,80,86,sk);
    c.save();c.strokeStyle=shade(sk,-.3);c.lineWidth=2.5;
    c.beginPath();c.moveTo(-30,-142);c.quadraticCurveTo(-15,-133,-3,-142);c.moveTo(3,-142);c.quadraticCurveTo(15,-133,30,-142);c.stroke();
    ln(c,0,-132,0,-92);ln(c,-12,-120,12,-120);ln(c,-12,-106,12,-106);
    c.strokeStyle='#2A1A10';c.lineWidth=1.6;for(let i=0;i<7;i++){const hx=-9+i*3,hy=-152+(i%2)*4;ln(c,hx,hy,hx+2,hy-3);}
    c.restore();
  }else if(L.shirt==='mesh'){
    shirtMesh(c,sk);
  }else if(L.shirt==='tank'){
    R(c,-40,-170,80,86,sk);
    poly(c,[[-30,-170],[-18,-170],[-10,-152],[10,-152],[18,-170],[30,-170],[33,-150],[40,-146],[40,-84],[-40,-84],[-40,-146],[-33,-150]],'#FFFFFF');
    c.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<5;i++)c.fillRect(-36+i*17,-140,2,52);
  }else{
    R(c,-40,-170,80,86,sc);
    if(L.shirt==='track'){R(c,-19,-176,38,9,sc);c.fillStyle='#BDBDBD';c.fillRect(-1.5,-166,3,80);R(c,-4,-154,8,10,'#DDDDDD');c.fillStyle='#EDEDED';c.fillRect(-36,-120,72,3);}
    if(L.shirt==='polo'){const cl=shade(sc,.4);poly(c,[[-22,-172],[-2,-168],[-12,-152]],cl);poly(c,[[22,-172],[2,-168],[12,-152]],cl);R(c,-4,-166,8,26,shade(sc,-.08));c.fillStyle='#fff';c.fillRect(-1.5,-160,3,3);c.fillRect(-1.5,-150,3,3);}
    if(L.shirt==='jersey'){c.fillStyle='#1B8A3C';c.fillRect(-40,-170,80,6);c.fillRect(-40,-90,80,6);c.font=`34px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.lineWidth=4;c.strokeText('10',0,-120);c.fillText('10',0,-120);c.lineWidth=3;}
    shirtX(c,L,sc);
  }
  drawChain(c,L,t);
  const hc=hairColor(L.hair);
  if(L.hair==='mullet'){R(c,-44,-238,12,70,hc);R(c,32,-238,12,70,hc);}
  if(L.cap==='none'||KEEP_HAIR.has(L.cap))hairBehind(c,L,hc);
  R(c,-40,-222,8,18,sk);R(c,32,-222,8,18,sk);
  R(c,-34,-248,68,70,sk);
  const bd=HAIRDK;
  if(L.beard==='stubble'){c.fillStyle='rgba(40,25,15,.25)';c.fillRect(-33,-207,66,28);}
  if(L.beard==='strap'){poly(c,[[-34,-212],[-28,-212],[-26,-193],[-10,-187],[10,-187],[26,-193],[28,-212],[34,-212],[34,-179],[-34,-179]],bd);R(c,-13,-202,26,4,bd,1);}
  if(L.beard==='full'){poly(c,[[-34,-216],[-27,-216],[-23,-202],[23,-202],[27,-216],[34,-216],[34,-178],[26,-168],[-26,-168],[-34,-178]],bd);R(c,-14,-204,28,6,bd,1);}
  if(L.beard==='goatee'){R(c,-9,-191,18,13,bd);R(c,-13,-202,26,4,bd,1);}
  beardX(c,L);
  if(L.mood==='angry'){poly(c,[[-25,-235],[-5,-226],[-5,-220],[-25,-229]],HAIRDK,1);poly(c,[[25,-235],[5,-226],[5,-220],[25,-229]],HAIRDK,1);}
  else{poly(c,[[-25,-228],[-6,-233],[-6,-226],[-25,-222]],HAIRDK,1);poly(c,[[25,-228],[6,-233],[6,-226],[25,-222]],HAIRDK,1);}
  const shades=L.acc==='shades'||L.acc==='both'||SHADES_LIKE.has(L.acc);
  if(!shades&&L.mood==='dizzy'){c.save();c.lineWidth=3;for(const ex of[-16,16]){ln(c,ex-5,-221,ex+5,-212);ln(c,ex-5,-212,ex+5,-221);}c.restore();}
  else if(!shades){R(c,-21,-219,10,8,'#24160E',1);R(c,11,-219,10,8,'#24160E',1);c.fillStyle='#fff';c.fillRect(-19,-218,3,3);c.fillRect(13,-218,3,3);}
  c.fillStyle=shade(sk,-.16);c.fillRect(-3,-212,6,10);
  if(L.beard==='full'){R(c,-10,-197,20,5,'#8A3A2A',1);}
  else if(L.mood==='angry'){c.beginPath();c.moveTo(-11,-191);c.quadraticCurveTo(0,-201,11,-191);c.lineWidth=3;c.stroke();}
  else if(L.mood==='dizzy'){circ(c,2,-193,6,'#5A1A1A');}
  else if(L.mood==='win'){R(c,-13,-201,26,9,'#5A1A1A');c.fillStyle='#fff';c.fillRect(-11,-201,22,3);}
  else{c.beginPath();c.moveTo(-11,-195);c.quadraticCurveTo(2,-191,13,-199);c.lineWidth=3;c.stroke();}
  if(L.cap==='none'||KEEP_HAIR.has(L.cap))hairFront(c,L,hc);
  else if(L.hair==='fade'){c.fillStyle='rgba(27,18,12,.5)';c.fillRect(-34,-240,8,20);c.fillRect(26,-240,8,20);}
  drawCap(c,L.cap,t);
  if(shades){R(c,-27,-224,23,12,'#111');R(c,4,-224,23,12,'#111');ln(c,-4,-219,4,-219);c.save();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;ln(c,-22,-214,-16,-222);ln(c,9,-214,15,-222);c.restore();}
  if(L.acc==='cig'||L.acc==='both'){
    c.save();c.translate(12,-196);c.rotate(.22);R(c,0,-2.5,24,5,'#F4F4F4');R(c,0,-2.5,7,5,'#E0A050');R(c,22,-2.5,3,5,'#FF5A1F',1);c.restore();
    for(let i=0;i<3;i++){const k=((t*.6+i/3)%1);c.fillStyle=`rgba(230,230,240,${.5*(1-k)})`;c.beginPath();c.arc(38+Math.sin(t*2+i)*4+k*6,-194-k*40,3+k*7,0,7);c.fill();}
  }
  accX(c,L,t);
  c.restore();
}
function hairFront(c,L,hc){
  const h=L.hair;
  if(h==='fade'){R(c,-35,-260,70,22,hc);c.fillStyle='rgba(27,18,12,.5)';c.fillRect(-34,-238,8,20);c.fillRect(26,-238,8,20);c.save();c.strokeStyle='#D9B08A';c.lineWidth=2;ln(c,16,-243,26,-253);ln(c,22,-241,32,-251);c.restore();}
  if(h==='gel'){c.beginPath();c.moveTo(-36,-234);c.lineTo(-36,-252);c.quadraticCurveTo(-32,-274,0,-274);c.quadraticCurveTo(32,-274,36,-252);c.lineTo(36,-234);c.lineTo(24,-242);c.lineTo(-24,-242);c.closePath();c.fillStyle='#120C08';c.fill();c.stroke();c.save();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=4;c.beginPath();c.moveTo(-20,-263);c.quadraticCurveTo(0,-271,18,-263);c.stroke();c.restore();}
  if(h==='bleach'){const pts=[[-36,-236]];for(let i=0;i<6;i++){pts.push([-30+i*12,i%2?-272:-279]);pts.push([-24+i*12,-254]);}pts[pts.length-1]=[36,-254];pts.push([36,-236]);poly(c,pts,hc);c.fillStyle='#C9A13A';c.fillRect(-34,-244,68,6);}
  if(h==='bald'){ell(c,-12,-238,11,5,'rgba(255,255,255,.45)');}
  if(h==='mullet'){R(c,-35,-258,70,18,hc);poly(c,[[-35,-241],[-19,-241],[-27,-232]],hc);poly(c,[[-17,-241],[-1,-241],[-9,-233]],hc);}
  hairFrontX(c,L,hc);
}
function drawCap(c,cap,t){
  if(cap==='back'){rr(c,-37,-266,74,26,10);c.fillStyle='#E02A3A';c.fill();c.stroke();R(c,-34,-244,68,6,'#B01E2C');c.beginPath();c.arc(0,-244,10,Math.PI,0);c.fillStyle='#1B120C';c.fill();c.stroke();R(c,-8,-248,16,3,'#fff',1);}
  if(cap==='beanie'){rr(c,-38,-274,76,32,12);c.fillStyle='#2B2B35';c.fill();c.stroke();R(c,-39,-250,78,11,'#43434F');c.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<9;i++)c.fillRect(-35+i*8,-249,2,9);}
  if(cap==='tembel'){rr(c,-30,-276,60,30,8);c.fillStyle='#F2EBD0';c.fill();c.stroke();poly(c,[[-50,-240],[50,-240],[40,-252],[-40,-252]],'#E6DDB8');}
  capX(c,cap,t||0);
}
function drawChain(c,L,t){
  const ch=L.chain;
  chainX(c,L,t,linkChain);
  if(ch==='cuban')linkChain(c,-16,16,-178,-132,13,10,7,GOLD,GOLD2);
  if(ch==='double'){linkChain(c,-15,15,-178,-146,10,6,4.5,GOLD,GOLD2);linkChain(c,-19,19,-178,-122,15,6,4.5,GOLD,GOLD2);}
  if(ch==='plate'){linkChain(c,-15,15,-178,-140,10,5,4,GOLD,GOLD2);R(c,-30,-142,60,17,GOLD);c.fillStyle=INK;const nm=((L.name||'').replace(/^נהוראי\s*/,'')||'נהוראי').slice(0,8); /* everyone is נהוראי: the plate shows what comes after it */let fs=12;c.font=`${fs}px ${FONT}`;const w=c.measureText(nm).width;if(w>52){fs*=52/w;c.font=`${fs}px ${FONT}`;}c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText(nm,0,-133);}
  if(ch==='lion'){linkChain(c,-15,15,-178,-148,10,5,4,GOLD,GOLD2);c.save();c.translate(0,-134);for(let i=0;i<12;i++){const a=i*Math.PI/6;poly(c,[[Math.cos(a-.2)*12,Math.sin(a-.2)*12],[Math.cos(a)*18,Math.sin(a)*18],[Math.cos(a+.2)*12,Math.sin(a+.2)*12]],GOLD2,1);}circ(c,0,0,13,GOLD);circ(c,0,0,8,'#FFE08A',1);c.fillStyle=INK;c.fillRect(-4,-3,2,2);c.fillRect(2,-3,2,2);c.fillRect(-1.5,1,3,2);c.restore();}
  if(ch==='silver'){c.save();c.lineWidth=4.5;c.beginPath();c.moveTo(-15,-178);c.quadraticCurveTo(0,-110,15,-178);c.stroke();c.strokeStyle='#D5DCE6';c.lineWidth=2.5;c.stroke();c.restore();R(c,-6,-151,12,16,'#D5DCE6');}
  const a=Math.max(0,Math.sin(t*3));if(a>.05&&ch!=='silver'){c.save();c.globalAlpha=a;star(c,8,-140,7,'#FFFFFF');c.restore();}
}
function drawNehoBack(c,L,t){
  const sk=SKIN;c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=3;
  const P=PANTS[L.pants],S=SHIRTS[L.shirt],pb=P.short?-52:-12;
  if(P.short){R(c,-31,-86,28,74,sk);R(c,3,-86,28,74,sk);}
  R(c,-31,-86,28,pb+86,P.c);R(c,3,-86,28,pb+86,P.c);
  if(L.pants==='track'){c.fillStyle='#EDEDED';for(const x of[-29,-24,21,26])c.fillRect(x,-82,3,66);}
  pantsX(c,L);
  if(L.shoes==='flip'){R(c,-33,-13,30,9,sk);R(c,3,-13,30,9,sk);R(c,-35,-5,33,5,'#26262E');R(c,2,-5,33,5,'#26262E');}
  else{const shc=SHOES[L.shoes];R(c,-35,-15,33,15,shc);R(c,2,-15,33,15,shc);}
  shoesX(c,L);
  R(c,-11,-186,22,20,sk);const sc=S.c||sk;
  for(const ax of[-64,42]){if(S.sl==='long'){R(c,ax,-168,22,78,sc);if(L.shirt==='track'){c.fillStyle='#EDEDED';c.fillRect(ax<0?ax+3:ax+16,-164,3,70);}}else if(S.sl==='short'){R(c,ax,-140,22,50,sk);R(c,ax-1,-169,24,32,sc);}else R(c,ax,-168,22,78,sk);R(c,ax+1,-92,20,16,sk);}
  if(L.shirt==='tank'){R(c,-40,-170,80,86,sk);poly(c,[[-30,-170],[-18,-170],[-12,-160],[12,-160],[18,-170],[30,-170],[33,-150],[40,-146],[40,-84],[-40,-84],[-40,-146],[-33,-150]],'#FFFFFF');}
  else if(L.shirt==='mesh')shirtMesh(c,sk);
  else if(L.shirt==='none'){R(c,-40,-170,80,86,sk);c.save();c.strokeStyle=shade(sk,-.3);c.lineWidth=2.5;ln(c,0,-160,0,-92);c.beginPath();c.moveTo(-28,-150);c.quadraticCurveTo(-18,-128,-8,-146);c.moveTo(28,-150);c.quadraticCurveTo(18,-128,8,-146);c.stroke();c.restore();}
  else{R(c,-40,-170,80,86,sc);c.textAlign='center';c.textBaseline='middle';
    if(L.shirt==='track'){c.fillStyle='#EDEDED';c.font=`18px ${FONT}`;c.direction='ltr';c.fillText('NEHO',0,-132);}
    if(L.shirt==='jersey'){c.fillStyle='#1B8A3C';c.fillRect(-40,-170,80,6);c.font=`36px ${FONT}`;c.direction='ltr';c.fillText('10',0,-116);c.font=`13px ${FONT}`;c.direction='rtl';c.fillText((L.name||'').slice(0,8),0,-150);}
    if(L.shirt==='polo')R(c,-22,-174,44,8,shade(sc,.4));}
  if(L.chain==='silver'){c.save();c.strokeStyle='#D5DCE6';c.lineWidth=3;ln(c,-14,-180,14,-180);c.restore();}else{c.save();c.strokeStyle=GOLD;c.lineWidth=5;ln(c,-14,-180,14,-180);c.restore();R(c,-3,-183,6,6,GOLD2,1);}
  const hc=hairColor(L.hair);
  if(L.hair==='mullet')R(c,-32,-236,64,64,hc);
  R(c,-40,-222,8,18,sk);R(c,32,-222,8,18,sk);R(c,-34,-248,68,70,sk);
  if(L.hair==='mullet')R(c,-32,-230,64,56,hc);
  if(L.cap==='none'||KEEP_HAIR.has(L.cap)){
    if(L.hair==='fade'){R(c,-35,-260,70,30,hc);c.fillStyle='rgba(27,18,12,.45)';c.fillRect(-34,-230,68,24);}
    if(L.hair==='gel'){rr(c,-36,-272,72,48,14);c.fillStyle='#120C08';c.fill();c.stroke();c.save();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=4;ln(c,-14,-262,-14,-236);c.restore();}
    if(L.hair==='bleach'){const pts=[[-36,-222]];for(let i=0;i<6;i++){pts.push([-30+i*12,i%2?-272:-279]);pts.push([-24+i*12,-254]);}pts[pts.length-1]=[36,-254];pts.push([36,-222]);poly(c,pts,hc);}
    if(L.hair==='bald'){ell(c,6,-236,12,6,'rgba(255,255,255,.45)');c.save();c.strokeStyle=shade(sk,-.3);c.lineWidth=2.5;ln(c,-18,-186,18,-186);ln(c,-14,-192,14,-192);c.restore();}
    if(L.hair==='mullet')R(c,-35,-258,70,30,hc);
    hairBackX(c,L,hc,sk);
  }else{
    if(L.cap==='back'){rr(c,-37,-266,74,30,10);c.fillStyle='#E02A3A';c.fill();c.stroke();poly(c,[[-30,-240],[30,-240],[36,-226],[-36,-226]],'#B01E2C');}
    if(L.cap==='beanie'){rr(c,-38,-274,76,40,12);c.fillStyle='#2B2B35';c.fill();c.stroke();R(c,-39,-242,78,11,'#43434F');}
    if(L.cap==='tembel'){rr(c,-30,-276,60,32,8);c.fillStyle='#F2EBD0';c.fill();c.stroke();poly(c,[[-50,-240],[50,-240],[40,-252],[-40,-252]],'#E6DDB8');}
  }
  capBackX(c,L.cap,t);
  if(L.acc==='cig'||L.acc==='both')for(let i=0;i<3;i++){const k=((t*.6+i/3)%1);c.fillStyle=`rgba(230,230,240,${.5*(1-k)})`;c.beginPath();c.arc(36+k*10,-214-k*44,3+k*8,0,7);c.fill();}
  c.restore();
}

export { hairColor, drawNeho, drawNehoBack };

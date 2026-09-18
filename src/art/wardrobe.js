// Unlockable wardrobe: the items added on top of the original ones. drawNeho and drawNehoBack call these
// hooks; each hook only draws item ids it knows, so the original items render exactly as before.
// Coordinates are drawNeho's (origin at the feet): head x -34..34, y -248..-178; torso y -170..-84; legs y -86..-12.
import { INK, GOLD, GOLD2, PINK, SKIN, HAIRDK, FONT } from '../core/util.js';
import { R, ln, poly, rr, circ, ell, shade, star } from '../core/draw.js';

// ---------- hair ----------
const HAIR_COL={afro:'#1B120C',mohawk:PINK,samurai:'#120C08',dreads:'#3B2414',sidecut:'#1B120C',rainbow:'#FF3D8B',eyal:'#1B120C'};
const RAINBOW=['#E63946','#FF7A1A','#FFC83D','#3DDC97','#3DA5FF','#8E44FF'];
// big hair that sits behind the head (drawn before the face)
function hairBehind(c,L,hc){
  const h=L.hair;
  if(h==='afro'){for(const [x,y,r] of[[-30,-236,22],[30,-236,22],[-22,-262,26],[22,-262,26],[0,-272,28]])circ(c,x,y,r,hc);}
  if(h==='dreads'){for(const x of[-46,-40,36,42])R(c,x,-244,8,70,hc);c.fillStyle=GOLD;for(const x of[-46,-40,36,42])c.fillRect(x+1,-190,6,5);}
}
function hairFrontX(c,L,hc){
  const h=L.hair;
  if(h==='afro'){circ(c,0,-262,30,hc,1);circ(c,-20,-252,18,hc,1);circ(c,20,-252,18,hc,1);c.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<14;i++)c.fillRect(-26+(i*17)%52,-282+(i*11)%36,3,3);R(c,-34,-250,68,8,hc,1);}
  if(h==='mohawk'){c.fillStyle='rgba(27,18,12,.35)';c.fillRect(-34,-248,20,24);c.fillRect(14,-248,20,24);
    const pts=[[-12,-246]];for(let i=0;i<5;i++){pts.push([-10+i*5,-290+(i%2)*10]);pts.push([-7.5+i*5,-262]);}pts.push([12,-246]);poly(c,pts,hc);}
  if(h==='samurai'){R(c,-35,-262,70,20,hc);poly(c,[[-35,-242],[-24,-242],[-35,-228]],hc);poly(c,[[35,-242],[24,-242],[35,-228]],hc);
    c.save();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;ln(c,-24,-256,20,-258);c.restore();circ(c,0,-274,11,hc);R(c,-6,-266,12,5,'#E02A3A');}
  if(h==='sidecut'||h==='eyal'){R(c,-35,-260,70,22,hc);c.fillStyle='rgba(27,18,12,.5)';c.fillRect(-34,-238,8,20);c.fillRect(26,-238,8,20);}
  if(h==='sidecut'){c.save();c.strokeStyle='#D9B08A';c.lineWidth=2.5;c.beginPath();c.moveTo(30,-258);c.lineTo(20,-248);c.lineTo(28,-248);c.lineTo(18,-236);c.stroke();c.restore();}
  if(h==='eyal'){c.fillStyle=GOLD;c.font=`16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('✦',-22,-251);}
  if(h==='rainbow'){const pts=[[-36,-236]];for(let i=0;i<6;i++){pts.push([-30+i*12,i%2?-272:-282]);pts.push([-24+i*12,-254]);}pts[pts.length-1]=[36,-254];pts.push([36,-236]);poly(c,pts,'#2B2B35');
    for(let i=0;i<6;i++)poly(c,[[-36+i*12,-254],[-30+i*12,i%2?-272:-282],[-24+i*12,-254]],RAINBOW[i]);R(c,-34,-246,68,8,'#2B2B35');}
}
// back of the head (drawNehoBack), cap off
function hairBackX(c,L,hc,sk){
  const h=L.hair;
  if(h==='afro'){circ(c,0,-240,40,hc);circ(c,-26,-262,22,hc,1);circ(c,26,-262,22,hc,1);circ(c,0,-274,26,hc,1);}
  if(h==='mohawk'){c.fillStyle='rgba(27,18,12,.35)';c.fillRect(-34,-248,68,60);R(c,-9,-262,18,80,hc);}
  if(h==='samurai'){R(c,-35,-262,70,44,hc);circ(c,0,-268,13,hc);R(c,-7,-258,14,6,'#E02A3A');}
  if(h==='dreads'){R(c,-35,-262,70,24,hc);for(let i=0;i<8;i++){R(c,-34+i*9,-242,7,66,hc);c.fillStyle=GOLD;c.fillRect(-33+i*9,-184,5,5);}}
  if(h==='sidecut'){R(c,-35,-260,70,30,hc);c.fillStyle='rgba(27,18,12,.45)';c.fillRect(-34,-230,68,24);c.save();c.strokeStyle='#D9B08A';c.lineWidth=2.5;c.beginPath();c.moveTo(-28,-252);c.lineTo(-16,-240);c.lineTo(-24,-238);c.lineTo(-12,-222);c.stroke();c.restore();}
  if(h==='rainbow'){const pts=[[-36,-222]];for(let i=0;i<6;i++){pts.push([-30+i*12,i%2?-272:-282]);pts.push([-24+i*12,-254]);}pts[pts.length-1]=[36,-254];pts.push([36,-222]);poly(c,pts,'#2B2B35');for(let i=0;i<6;i++)poly(c,[[-36+i*12,-254],[-30+i*12,i%2?-272:-282],[-24+i*12,-254]],RAINBOW[i]);}
  if(h==='eyal'){ // Eyal Golan's eyes shaved into the back of the head
    R(c,-35,-260,70,58,hc);
    c.save();c.lineWidth=3;
    for(const sx of[-1,1]){const ex=sx*15;
      c.strokeStyle=sk;c.beginPath();c.moveTo(ex-11,-228);c.quadraticCurveTo(ex,-240,ex+11,-228);c.quadraticCurveTo(ex,-218,ex-11,-228);c.closePath();c.fillStyle=shade(sk,-.05);c.fill();c.stroke();
      circ(c,ex+sx*1.5,-228,4.5,'#3B2414',1);circ(c,ex+sx*1.5,-228,2,INK,1);c.fillStyle='#fff';c.fillRect(ex+sx*1.5-2.5,-231,2,2);
      c.strokeStyle=sk;c.lineWidth=3.5;c.beginPath();c.moveTo(ex-12,-244);c.quadraticCurveTo(ex,-250,ex+12,-243);c.stroke();c.lineWidth=3;}
    c.restore();star(c,27,-252,5,GOLD);star(c,-28,-214,4,GOLD);
  }
}
// ---------- beard ----------
function beardX(c,L){
  const b=L.beard,bd=HAIRDK;
  if(b==='mustache'){poly(c,[[-17,-203],[-3,-205],[0,-202],[3,-205],[17,-203],[19,-196],[9,-199],[0,-197],[-9,-199],[-19,-196]],bd);}
  if(b==='pencil'){c.save();c.lineWidth=2.5;c.strokeStyle=bd;ln(c,-13,-202,-2,-203);ln(c,2,-203,13,-202);c.restore();}
  if(b==='mutton'){poly(c,[[-34,-222],[-27,-222],[-25,-196],[-14,-186],[-20,-179],[-34,-182]],bd);poly(c,[[34,-222],[27,-222],[25,-196],[14,-186],[20,-179],[34,-182]],bd);}
  if(b==='viking'||b==='gold'){const col=b==='gold'?GOLD:'#8A4A1E';
    poly(c,[[-34,-216],[-27,-216],[-23,-202],[23,-202],[27,-216],[34,-216],[34,-178],[26,-168],[-26,-168],[-34,-178]],col);R(c,-14,-204,28,6,col,1);
    for(const x of[-12,6]){R(c,x,-170,7,26,col);R(c,x-1,-152,9,5,b==='gold'?'#FFF1A8':GOLD);}
    if(b==='gold'){c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-26,-190,16,3);star(c,22,-182,6,'#fff');star(c,-18,-172,4,'#fff');}}
}
// ---------- caps ----------
const KEEP_HAIR=new Set(['halo','headphones','crown']); // headwear that doesn't hide the hair
function capX(c,cap,t){
  if(cap==='bucket'){poly(c,[[-50,-238],[50,-238],[36,-252],[-36,-252]],'#6B8F71');rr(c,-32,-278,64,30,10);c.fillStyle='#7FA886';c.fill();c.stroke();R(c,-32,-256,64,5,'#4E6E54',1);}
  if(cap==='bandana'){rr(c,-37,-266,74,26,10);c.fillStyle='#C1121F';c.fill();c.stroke();c.fillStyle='#fff';for(let i=0;i<6;i++){circ(c,-26+i*10,-254+(i%2)*6,2.2,'#fff',1);}poly(c,[[34,-252],[50,-244],[46,-236],[34,-244]],'#C1121F');}
  if(cap==='helmet'){c.beginPath();c.moveTo(-40,-236);c.quadraticCurveTo(-40,-284,0,-284);c.quadraticCurveTo(40,-284,40,-236);c.closePath();c.fillStyle='#FFC83D';c.fill();c.stroke();R(c,-42,-240,84,7,'#D9951A');R(c,-6,-282,12,40,'#fff',1);c.save();c.lineWidth=2.5;ln(c,-34,-236,-30,-192);ln(c,34,-236,30,-192);c.restore();}
  if(cap==='headphones'){c.save();c.lineWidth=9;c.strokeStyle=INK;c.beginPath();c.arc(0,-232,44,Math.PI*1.05,Math.PI*1.95);c.stroke();c.lineWidth=5;c.strokeStyle='#2B2B35';c.stroke();c.restore();for(const sx of[-1,1]){rr(c,sx*44-11,-236,22,34,8);c.fillStyle=PINK;c.fill();c.stroke();R(c,sx*44-5,-228,10,18,'#fff',1);}}
  if(cap==='halo'){c.save();c.globalAlpha=.35+.15*Math.sin(t*3);ell(c,0,-280,46,14,'#FFF7B0');c.restore();c.save();c.lineWidth=7;c.strokeStyle=GOLD;c.beginPath();c.ellipse(0,-280,32,8,0,0,7);c.stroke();c.lineWidth=2;c.strokeStyle='#FFF1A8';c.stroke();c.restore();}
  if(cap==='crown'){poly(c,[[-32,-252],[-36,-290],[-20,-270],[-8,-298],[0,-276],[8,-298],[20,-270],[36,-290],[32,-252]],GOLD);R(c,-33,-258,66,8,GOLD2);circ(c,0,-262,4,'#E02A3A');circ(c,-18,-262,3,'#3DA5FF');circ(c,18,-262,3,'#3DDC97');for(const x of[-36,-8,8,36])circ(c,x,x%2?-298:-291,3,'#fff',1);}
}
function capBackX(c,cap,t){
  if(cap==='bucket'){poly(c,[[-50,-238],[50,-238],[36,-252],[-36,-252]],'#6B8F71');rr(c,-32,-278,64,30,10);c.fillStyle='#7FA886';c.fill();c.stroke();}
  if(cap==='bandana'){rr(c,-37,-266,74,30,10);c.fillStyle='#C1121F';c.fill();c.stroke();poly(c,[[-6,-240],[6,-240],[10,-218],[0,-222],[-10,-218]],'#C1121F');}
  if(cap==='helmet'){c.beginPath();c.moveTo(-40,-230);c.quadraticCurveTo(-40,-284,0,-284);c.quadraticCurveTo(40,-284,40,-230);c.closePath();c.fillStyle='#FFC83D';c.fill();c.stroke();R(c,-6,-282,12,50,'#fff',1);}
  if(cap==='headphones'||cap==='halo'||cap==='crown')capX(c,cap,t);
}
// ---------- chains ----------
function chainX(c,L,t,linkChain){
  const ch=L.chain;
  if(ch==='hamsa'||ch==='chai'||ch==='mic')linkChain(c,-15,15,-178,-146,10,5,4,GOLD,GOLD2);
  if(ch==='hamsa'){c.save();c.translate(0,-136);poly(c,[[-10,-8],[-10,4],[-6,10],[6,10],[10,4],[10,-8],[6,-10],[6,-2],[2,-2],[2,-12],[-2,-12],[-2,-2],[-6,-2],[-6,-10]],GOLD);circ(c,0,3,3,'#3DA5FF',1);c.restore();}
  if(ch==='chai'){R(c,-14,-146,28,20,GOLD);c.fillStyle=INK;c.font=`15px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('חי',0,-135);}
  if(ch==='mic'){R(c,-4,-140,8,16,'#2B2B35');circ(c,0,-142,7,'#C9CED6');c.save();c.strokeStyle='#888';c.lineWidth=1;for(let i=-1;i<=1;i++)ln(c,-5,-142+i*3,5,-142+i*3);c.restore();}
  if(ch==='triple'){linkChain(c,-15,15,-178,-150,10,5,4,GOLD,GOLD2);linkChain(c,-18,18,-178,-132,13,6,4.5,GOLD,GOLD2);linkChain(c,-21,21,-178,-112,16,7,5,GOLD,GOLD2);}
  if(ch==='diamond'){linkChain(c,-17,17,-178,-128,14,8,6,'#E8F7FF','#9FD8F5');c.save();c.translate(0,-120);poly(c,[[-10,-6],[10,-6],[14,0],[0,16],[-14,0]],'#BFEFFF');c.save();c.strokeStyle='#fff';c.lineWidth=1.5;ln(c,-10,-6,-4,0);ln(c,10,-6,4,0);ln(c,-14,0,14,0);c.restore();c.restore();
    const a=Math.max(0,Math.sin(t*4));c.save();c.globalAlpha=.4+.6*a;star(c,-12,-150,6,'#fff');star(c,14,-126,5,'#fff');c.restore();}
}
// ---------- shirts ----------
function shirtMesh(c,sk){R(c,-40,-170,80,86,sk);c.save();c.strokeStyle='rgba(20,20,26,.75)';c.lineWidth=1.6;for(let i=-40;i<=40;i+=8){ln(c,i,-170,i+20,-84);ln(c,i,-170,i-20,-84);}c.restore();c.save();c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(-40,-170,80,86);c.restore();}
function shirtX(c,L,sc){
  const s=L.shirt;
  if(s==='hawaii'){const cols=['#FFC83D','#FF3D8B','#FFFFFF'];for(let i=0;i<9;i++){const x=-30+(i%3)*28+(i%2)*6,y=-156+Math.floor(i/3)*24;for(let k=0;k<5;k++){const a=k*Math.PI*2/5;circ(c,x+Math.cos(a)*4,y+Math.sin(a)*4,3,cols[i%3],1);}circ(c,x,y,2,'#E02A3A',1);}
    poly(c,[[-20,-172],[0,-156],[20,-172],[12,-172],[0,-162],[-12,-172]],shade(sc,-.15));}
  if(s==='leather'){R(c,-2,-170,4,86,'#C9CED6');c.save();c.strokeStyle='#555';c.lineWidth=1.5;for(let y=-166;y<-88;y+=6)ln(c,-2,y,2,y);c.restore();poly(c,[[-20,-172],[-2,-150],[-8,-172]],'#2B2B35');poly(c,[[20,-172],[2,-150],[8,-172]],'#2B2B35');c.fillStyle='rgba(255,255,255,.18)';c.fillRect(-34,-160,10,50);}
  if(s==='suit'||s==='goldsuit'){const lap=s==='suit'?'#E6E6E6':GOLD2;poly(c,[[-24,-172],[-2,-126],[-14,-172]],lap);poly(c,[[24,-172],[2,-126],[14,-172]],lap);R(c,-9,-172,18,30,'#FFFFFF');
    poly(c,[[-12,-166],[0,-160],[-12,-154]],s==='suit'?INK:'#E02A3A');poly(c,[[12,-166],[0,-160],[12,-154]],s==='suit'?INK:'#E02A3A');circ(c,0,-160,3,s==='suit'?INK:'#E02A3A',1);
    for(const y of[-120,-104])circ(c,-6,y,2.5,s==='suit'?'#BBB':'#FFF1A8',1);
    if(s==='goldsuit'){c.fillStyle='rgba(255,255,255,.4)';c.fillRect(-36,-150,6,56);star(c,26,-110,6,'#fff');star(c,-24,-100,4,'#fff');}}
}
// ---------- pants (inside legs(): both legs are drawn, clipped per leg when posed) ----------
function pantsX(c,L){
  const p=L.pants;
  if(p==='cargo'){for(const x of[-31,3])R(c,x+4,-58,20,16,'#7A704E');}
  if(p==='redtrack'){c.fillStyle='#FFFFFF';for(const x of[-29,-24,21,26])c.fillRect(x,-82,3,66);}
  if(p==='white'){c.fillStyle='rgba(0,0,0,.08)';c.fillRect(-17,-84,3,70);c.fillRect(14,-84,3,70);}
  if(p==='leopard'){c.fillStyle='#5A3A14';for(let i=0;i<16;i++){const x=(i%2?3:-31)+4+((i*7)%20),y=-80+Math.floor(i/2)*8;c.beginPath();c.ellipse(x,y,3,2,.4,0,7);c.fill();}}
  if(p==='pajama'){c.fillStyle='rgba(255,255,255,.35)';for(const x0 of[-31,3]){for(let x=x0+5;x<x0+28;x+=9)c.fillRect(x,-86,3,72);for(let y=-80;y<-14;y+=9)c.fillRect(x0,y,28,3);}}
  if(p==='gold'){c.fillStyle='rgba(255,255,255,.45)';c.fillRect(-27,-84,4,70);c.fillRect(7,-84,4,70);star(c,-10,-40,4,'#fff');star(c,22,-66,3,'#fff');}
}
// ---------- shoes ----------
function shoesX(c,L){
  const s=L.shoes;
  if(s==='crocs'){c.fillStyle='rgba(0,0,0,.35)';for(const x of[-30,-22,-14,7,15,23])for(const y of[-11,-5])c.fillRect(x,y,3,3);}
  if(s==='boots'||s==='high'){const col=s==='boots'?'#6B4A2B':'#F4F4F4';R(c,-33,-30,29,18,col);R(c,4,-30,29,18,col);if(s==='high'){R(c,-33,-26,29,5,'#E02A3A');R(c,4,-26,29,5,'#E02A3A');}else{c.fillStyle='#E0C090';c.fillRect(-26,-28,14,2);c.fillRect(12,-28,14,2);}}
  if(s==='slippers'){for(const x of[-35,2])for(let i=0;i<6;i++)circ(c,x+4+i*5.4,-15,3.2,'#F3E3F7',1);}
  if(s==='rollers'){for(const x0 of[-35,2]){R(c,x0+2,-2,29,3,'#9AA0AE');for(let i=0;i<4;i++)circ(c,x0+6+i*7,4,3.5,i%2?'#FF3D8B':'#3DF5FF');}c.fillStyle='#FFC83D';c.fillRect(-33,-9,29,2);c.fillRect(4,-9,29,2);}
  if(s==='gold'){c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-30,-13,10,2.5);c.fillRect(8,-13,10,2.5);star(c,-6,-10,4,'#fff');}
}
// ---------- accessories ----------
const SHADES_LIKE=new Set(['goldshades']); // accessories that cover the eyes
function accX(c,L,t){
  const a=L.acc;
  if(a==='toothpick'){c.save();c.lineWidth=2.5;c.strokeStyle='#D9B08A';ln(c,6,-196,26,-204);c.restore();}
  if(a==='earring'){circ(c,36,-202,4,'#BFEFFF');const k=Math.max(0,Math.sin(t*4));c.save();c.globalAlpha=k;star(c,38,-206,4,'#fff');c.restore();}
  if(a==='bandaid'){c.save();c.translate(-20,-202);c.rotate(-.4);R(c,-9,-3.5,18,7,'#F2C9A0');c.fillStyle='rgba(0,0,0,.2)';c.fillRect(-2,-2,4,4);c.restore();}
  if(a==='grillz'){R(c,-11,-200,22,7,GOLD);c.fillStyle=GOLD2;for(let i=1;i<4;i++)c.fillRect(-11+i*5.5,-200,1.2,7);star(c,6,-198,3,'#fff');}
  if(a==='tattoo'){c.save();c.fillStyle='#2A4A7A';c.font=`11px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('אמא',0,-176);c.restore();c.save();c.strokeStyle='#2A4A7A';c.lineWidth=1.5;c.beginPath();c.moveTo(-3,-183);c.bezierCurveTo(-8,-188,-12,-182,-3,-179);c.bezierCurveTo(6,-182,2,-188,-3,-183);c.stroke();c.restore();}
  if(a==='goldshades'){R(c,-29,-226,25,13,GOLD);R(c,4,-226,25,13,GOLD);ln(c,-4,-221,4,-221);R(c,-26,-223,19,7,'#2B1B00',1);R(c,7,-223,19,7,'#2B1B00',1);c.save();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2;ln(c,-22,-217,-16,-223);ln(c,11,-217,17,-223);c.restore();}
}
// ---------- race top view: head seen from above. Returns true if it drew the head ----------
function topHeadX(c,L,hy){
  const cap=L.cap,h=L.hair;
  if(cap==='bucket'){circ(c,0,hy,9,'#6B8F71');circ(c,0,hy,6,'#7FA886');return true;}
  if(cap==='bandana'){R(c,-6.5,hy-6.5,13,12,'#C1121F');return true;}
  if(cap==='helmet'){circ(c,0,hy,8,'#FFC83D');R(c,-1.5,hy-8,3,16,'#fff',1);return true;}
  if(cap==='crown'){R(c,-6,hy-6,12,12,GOLD);return true;}
  if(h==='afro'){circ(c,0,hy,10,HAIR_COL.afro);}
  else if(h==='mohawk'){R(c,-6,hy-6,12,12,SKIN);R(c,-2,hy-8,4,14,PINK);}
  else if(h==='samurai'){R(c,-6,hy-6,12,10,HAIR_COL.samurai);circ(c,0,hy+4,3,HAIR_COL.samurai,1);}
  else if(h==='dreads'){R(c,-7,hy-6,14,14,HAIR_COL.dreads);}
  else if(h==='rainbow'){for(let i=0;i<6;i++)R(c,-6+i*2,hy-7,2,12,RAINBOW[i],1);}
  else if(h==='sidecut'||h==='eyal')R(c,-6,hy-6,12,9,HAIR_COL[h]);
  else return false;
  return true;
}
// drawn on top of whatever head was drawn
function topOverlayX(c,L,hy){
  if(L.cap==='halo'){c.save();c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.arc(0,hy,10,0,7);c.stroke();c.restore();}
  if(L.cap==='headphones'){R(c,-9,hy-3,3,7,PINK,1);R(c,6,hy-3,3,7,PINK,1);}
}

export { HAIR_COL, KEEP_HAIR, SHADES_LIKE, hairBehind, hairFrontX, hairBackX, beardX, capX, capBackX, chainX, shirtMesh, shirtX, pantsX, shoesX, accX, topHeadX, topOverlayX };

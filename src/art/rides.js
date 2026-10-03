// Unlockable rides: T-Max maxi-scooter, a giant pitbull, and the Wings of the Shechinah.
// vehicles.js calls these for ids it doesn't know; each returns true if it drew something.
// Side view: origin at ground center, front = -x (like the original vehicles).
import { INK, GOLD, GOLD2, PINK } from '../core/util.js';
import { R, ln, poly, rr, circ, ell, shade, star } from '../core/draw.js';

function vg(c,col,y0,y1){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,.3));g.addColorStop(.55,col);g.addColorStop(1,shade(col,-.3));return g;}
function softGlow(c,x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}

// ---------- giant pitbull, side view: blocky like the rest of the game, facing -x ----------
function pitLeg(c,x,col,back){
  const sh=back?-.16:0;
  R(c,x-15,-74,30,50,shade(col,sh-.04));            // thigh
  R(c,x-11,-30,22,22,shade(col,sh+.04));            // shin
  R(c,x-16,-12,32,12,shade(col,sh-.22));            // paw
  c.save();c.strokeStyle=shade(col,-.45);c.lineWidth=2;for(const dx of[-6,0,6])ln(c,x+dx,-9,x+dx,-2);c.restore();
}
function pit(c,col,parts,ex){
  c.save();c.lineJoin='miter';
  if(parts.tail){c.save();c.translate(62,-104);c.rotate(-.45);R(c,-7,-6,16,48,shade(col,-.12));c.restore();}
  if(parts.body){
    pitLeg(c,50,col,true);pitLeg(c,-40,col,true);
    R(c,-62,-124,124,62,col);                        // body
    R(c,-84,-120,30,54,shade(col,.08));              // chest, pushed forward
    c.fillStyle='rgba(255,255,255,.22)';c.fillRect(-56,-118,108,16);   // light along the back
    c.fillStyle='rgba(0,0,0,.14)';c.fillRect(-56,-74,108,10);          // shadow under the belly
    pitLeg(c,38,col,false);pitLeg(c,-52,col,false);
    c.save();c.strokeStyle=shade(col,-.3);c.lineWidth=3;ln(c,-44,-112,-44,-72);ln(c,-26,-108,-26,-80);c.restore(); // muscle lines
  }
  if(parts.head){
    R(c,-132,-166,74,56,col);                        // head
    poly(c,[[-126,-166],[-118,-196],[-104,-166]],shade(col,-.22),1);   // ears
    poly(c,[[-88,-166],[-80,-194],[-66,-166]],shade(col,-.22),1);
    R(c,-158,-140,30,26,shade(col,.14));             // snout
    R(c,-162,-136,14,10,INK);                        // nose
    R(c,-156,-118,26,6,'#FFFFFF');                   // teeth
    for(let i=0;i<3;i++)poly(c,[[-154+i*8,-118],[-150+i*8,-110],[-146+i*8,-118]],'#FFFFFF',1);
    R(c,-120,-146,14,12,INK);c.fillStyle='#FFFFFF';c.fillRect(-117,-143,5,5);   // eye
    R(c,-100,-152,8,8,shade(col,-.3));               // brow stud
    R(c,-96,-116,38,18,'#2B2B35');                   // collar, on the neck
    for(let i=0;i<3;i++)poly(c,[[-90+i*12,-116],[-85+i*12,-126],[-80+i*12,-116]],'#E0E0E0',1);
    R(c,-84,-104,14,10,GOLD);                        // tag
  }
  if(parts.saddle){
    R(c,-44,-148,80,26,'#C1121F');                   // saddle
    R(c,-44,-126,80,6,GOLD,1);
    c.save();c.strokeStyle=GOLD;c.lineWidth=3;ln(c,-38,-148,-38,-120);ln(c,28,-148,28,-120);c.restore();
    R(c,-56,-160,16,16,'#2B2B35');                   // handle
  }
  pitExtraSide(c,ex,col);
  c.restore();
}

// ---------- what every ride can carry: a box, a flag, a speaker, an aerial, lights, a crown ----------
// anchors per ride: [rear deck, handlebar top, under the ride]
const EXTRA_AT={scooter:[[58,-40],[-74,-150],[0,-16]],bike:[[96,-74],[-70,-150],[0,-16]],
  atv:[[62,-74],[-54,-128],[0,-18]],tmax:[[86,-96],[-96,-150],[0,-20]]};
function rideExtraSide(c,vid,ex){
  const A=EXTRA_AT[vid];if(!A||!ex||ex==='none')return;
  const[[rx,ry],[bx,by],[ux,uy]]=A;
  if(ex==='box'){R(c,rx-26,ry-34,52,34,'#8B5A2B');R(c,rx-26,ry-34,52,8,'#6B4420');
    c.save();c.strokeStyle='#6B4420';c.lineWidth=3;ln(c,rx,ry-34,rx,ry);c.restore();R(c,rx-6,ry-24,12,8,GOLD);}
  if(ex==='flag'){c.save();c.strokeStyle='#C9CED6';c.lineWidth=4;ln(c,bx,by,bx,by-54);c.restore();
    R(c,bx,by-54,46,30,'#FFFFFF');R(c,bx,by-54,46,8,'#2F6FD0');R(c,bx,by-32,46,8,'#2F6FD0');
    c.save();c.strokeStyle='#2F6FD0';c.lineWidth=3;ln(c,bx+14,by-46,bx+32,by-32);ln(c,bx+32,by-46,bx+14,by-32);c.restore();}
  if(ex==='speaker'){R(c,rx-24,ry-40,48,40,'#1E1E26');circ(c,rx-8,ry-28,9,'#555');circ(c,rx+10,ry-16,13,'#555');circ(c,rx+10,ry-16,5,'#222');
    c.save();c.strokeStyle='#3DF5FF';c.lineWidth=3;for(let i=1;i<=2;i++){c.beginPath();c.arc(rx+10,ry-16,16+i*8,-.7,.7);c.stroke();}c.restore();}
  if(ex==='antenna'){c.save();c.strokeStyle='#C9CED6';c.lineWidth=4;ln(c,bx,by,bx-6,by-70);c.restore();
    circ(c,bx-6,by-78,12,'#FF3D8B');circ(c,bx-12,by-84,6,'#FF8FB8',1);}
  if(ex==='led'){c.save();c.globalAlpha=.55;for(const col of['#3DF5FF','#8E44FF'])softGlow(c,ux,uy+6,70,col==='#3DF5FF'?'rgba(61,245,255,.5)':'rgba(142,68,255,.35)');c.restore();
    c.save();c.strokeStyle='#3DF5FF';c.lineWidth=5;c.lineCap='round';ln(c,ux-62,uy,ux+62,uy);c.restore();}
  if(ex==='crown'){R(c,bx-18,by-26,46,16,GOLD);
    for(let i=0;i<4;i++)poly(c,[[bx-18+i*12,by-26],[bx-12+i*12,by-44],[bx-6+i*12,by-26]],GOLD,1);
    for(let i=0;i<3;i++)circ(c,bx-8+i*12,by-18,3.5,i===1?'#FF3D8B':'#3DA5FF',1);}
}
function rideExtraTop(c,vid,ex){
  if(!ex||ex==='none')return;
  if(ex==='box'){R(c,-8,10,16,12,'#8B5A2B');R(c,-8,10,16,3,'#6B4420');}
  if(ex==='speaker'){R(c,-9,9,18,13,'#1E1E26');circ(c,0,15,4,'#555');}
  if(ex==='flag'){R(c,-2,-30,4,10,'#C9CED6');R(c,2,-30,12,8,'#FFFFFF');R(c,2,-30,12,3,'#2F6FD0');}
  if(ex==='antenna'){c.save();c.strokeStyle='#C9CED6';c.lineWidth=2;ln(c,0,-20,0,-34);c.restore();circ(c,0,-36,4,'#FF3D8B');}
  if(ex==='led'){c.save();c.globalAlpha=.5;softGlow(c,0,4,30,'rgba(61,245,255,.6)');c.restore();}
  if(ex==='crown'){R(c,-7,-26,14,6,GOLD);for(let i=0;i<3;i++)poly(c,[[-7+i*5,-26],[-4.5+i*5,-32],[-2+i*5,-26]],GOLD,1);}
}
// ---------- what you can put on the pitbull ----------
function pitExtraSide(c,ex,col){
  if(!ex||ex==='none')return;
  if(ex==='cap'){R(c,-134,-182,74,20,'#E02A3A');R(c,-168,-166,40,12,'#B01E2C');R(c,-104,-188,10,8,'#B01E2C');}
  if(ex==='shades'){R(c,-136,-152,52,18,'#15151B');c.save();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=3;ln(c,-130,-148,-118,-140);c.restore();}
  if(ex==='bandana'){poly(c,[[-130,-114],[-58,-114],[-94,-78]],'#E02A3A',1);
    c.fillStyle='rgba(255,255,255,.8)';for(const[x,y]of[[-116,-106],[-100,-98],[-84,-106]])c.fillRect(x-3,y-3,6,6);}
  if(ex==='gold'){for(let i=0;i<7;i++){const x=-124+i*13,y=-98+Math.sin(i/6*Math.PI)*16;R(c,x-6,y-6,12,12,i%2?GOLD:GOLD2);}
    R(c,-102,-74,22,18,GOLD);c.fillStyle=GOLD2;c.fillRect(-97,-69,12,8);}
  if(ex==='muzzle'){R(c,-162,-142,38,30,'rgba(255,200,61,.25)');
    c.save();c.strokeStyle=GOLD;c.lineWidth=4;for(let i=0;i<3;i++)ln(c,-160+i*12,-142,-160+i*12,-112);ln(c,-162,-128,-124,-128);c.restore();
    R(c,-126,-136,12,20,GOLD);}
  if(ex==='shoes'){for(const x of[50,-40,38,-52]){R(c,x-18,-16,36,16,'#FFFFFF');
    c.fillStyle='#E02A3A';c.fillRect(x-16,-7,32,4);c.fillStyle='#2F6FD0';c.fillRect(x-12,-14,12,5);}}
}
function pitExtraFront(c,ex){
  if(!ex||ex==='none')return;
  if(ex==='cap'){rr(c,-74,-212,148,30,12);c.fillStyle='#E02A3A';c.fill();c.stroke();rr(c,-64,-190,128,14,7);c.fillStyle='#B01E2C';c.fill();c.stroke();circ(c,0,-214,7,'#B01E2C');}
  if(ex==='shades'){rr(c,-56,-172,112,26,10);c.fillStyle='#15151B';c.fill();c.stroke();c.save();c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=4;ln(c,-44,-166,-26,-154);ln(c,14,-166,32,-154);c.restore();}
  if(ex==='bandana'){poly(c,[[-54,-86],[54,-86],[0,-30]],'#E02A3A',1);c.fillStyle='rgba(255,255,255,.75)';for(const[x,y]of[[-28,-74],[0,-62],[26,-74]])circ(c,x,y,4,'#FFFFFF');}
  if(ex==='gold'){c.save();c.lineWidth=4;c.strokeStyle=GOLD;c.beginPath();c.arc(0,-86,46,.15,Math.PI-.15);c.stroke();
    for(let i=0;i<8;i++){const a=.25+i*(Math.PI-.5)/7;circ(c,Math.cos(a)*46,-86+Math.sin(a)*46,5,i%2?GOLD:GOLD2,1);}c.restore();}
  if(ex==='shoes'){for(const sx of[-1,1]){rr(c,sx*46-18,-16,36,18,7);c.fillStyle='#FFFFFF';c.fill();c.stroke();c.fillStyle='#E02A3A';c.fillRect(sx*46-16,-6,32,4);}}
}
function pitExtraTop(c,ex){
  if(!ex||ex==='none')return;
  if(ex==='cap'){rr(c,-9,-40,18,14,5);c.fillStyle='#E02A3A';c.fill();c.stroke();R(c,-6,-45,12,6,'#B01E2C');}
  if(ex==='shades'){R(c,-9,-34,18,5,'#15151B');}
  if(ex==='bandana'){poly(c,[[-8,-18],[8,-18],[0,-8]],'#E02A3A',1);}
  if(ex==='gold'){c.save();c.strokeStyle=GOLD;c.lineWidth=2.5;c.beginPath();c.arc(0,-20,9,.2,Math.PI-.2);c.stroke();c.restore();}
  if(ex==='shoes'){c.fillStyle='#FFFFFF';for(const[x,y]of[[-11,-14],[11,-14],[-11,14],[11,14]])R(c,x-3,y-5,6,10,'#FFFFFF');}
}
// ---------- what you can hang on the wings ----------
function wingExtra(c,ex,t,scale){
  if(!ex||ex==='none')return;
  const k=scale||1;c.save();c.scale(k,k);
  if(ex==='stars'){for(let i=0;i<9;i++){const a=i*.7+(t||0)*.6,r=92+Math.sin(a*2)*24;star(c,Math.cos(a)*r,-146+Math.sin(a)*r*.42,6+(i%3)*2,i%2?GOLD:'#FFFFFF');}}
  if(ex==='doves'){for(const[x,y,s] of[[-104,-212,1],[98,-182,-1],[40,-236,1]]){c.save();c.translate(x,y);c.scale(s,1);
    c.fillStyle='#FFFFFF';c.strokeStyle=INK;c.lineWidth=2;
    c.beginPath();c.ellipse(0,0,16,9,0,0,7);c.fill();c.stroke();
    poly(c,[[2,-4],[-16,-20],[-2,-6]],'#F4F7FF',1);circ(c,13,-6,5,'#FFFFFF',1);circ(c,16,-7,1.6,INK);poly(c,[[19,-6],[26,-4],[19,-2]],GOLD,1);c.restore();}}
  if(ex==='lights'){c.save();c.strokeStyle='rgba(255,244,220,.65)';c.lineWidth=3;
    c.beginPath();c.moveTo(-132,-192);c.quadraticCurveTo(0,-124,132,-192);c.stroke();c.restore();
    for(let i=0;i<=10;i++){const u=i/10,x=-132+264*u,y=-192+(1-Math.pow(2*u-1,2))*68,on=Math.floor((t||0)*4+i)%2===0;
      circ(c,x,y,on?7:5,['#FF3D8B','#FFC83D','#3DF5FF','#3DDC97'][i%4],1);if(on)softGlow(c,x,y,22,'rgba(255,255,255,.5)');}}
  if(ex==='rainbow'){c.save();c.lineWidth=11;c.lineCap='round';
    ['#FF3D3D','#FF9E2C','#FFD93D','#3DDC97','#3DA5FF','#8E44FF'].forEach((col,i)=>{c.strokeStyle=col;c.globalAlpha=.85;
      c.beginPath();c.arc(0,-108,78+i*9,Math.PI*1.1,Math.PI*1.9);c.stroke();});c.restore();}
  if(ex==='gold'){c.save();c.lineWidth=7;c.strokeStyle=GOLD;c.lineCap='round';
    for(const sx of[-1,1]){c.save();c.scale(sx,1);c.beginPath();c.moveTo(66,-118);c.quadraticCurveTo(130,-146,172,-234);c.stroke();c.restore();}
    for(const[x,y]of[[-146,-214],[146,-214],[-110,-150],[110,-150]])star(c,x,y,7,GOLD);c.restore();}
  c.restore();
}
// ---------- wings ----------
function wing(c,side,col,x0){
  // one angel wing seen from the front, from the shoulder (x0) up and out to the tip, feathered along the bottom
  c.save();c.scale(side,1);
  const edge=[[172,-236],[156,-200],[138,-170],[116,-146],[92,-128],[68,-116],[x0+12,-110]];
  c.beginPath();c.moveTo(x0,-172);c.bezierCurveTo(x0+40,-250,120,-280,172,-236);
  for(let i=1;i<edge.length;i++){const[a0,b0]=edge[i-1],[a1,b1]=edge[i];c.quadraticCurveTo((a0+a1)/2+10,(b0+b1)/2+16,a1,b1);}
  c.quadraticCurveTo(x0-4,-124,x0,-172);c.closePath();
  const g=c.createLinearGradient(x0,-260,150,-110);g.addColorStop(0,'#FFFFFF');g.addColorStop(1,shade(col,-.12));c.fillStyle=g;c.fill();c.stroke();
  c.save();c.lineWidth=2;c.strokeStyle=shade(col,-.3);
  c.beginPath();c.moveTo(x0+8,-160);c.quadraticCurveTo(x0+70,-214,160,-222);c.stroke();          // covert feathers line
  for(let i=1;i<edge.length-1;i++){const[x,y]=edge[i];const f=i/(edge.length-1);c.beginPath();c.moveTo(x0+8+(152-x0)*(1-f)*.9,-160-62*(1-f));c.lineTo(x,y);c.stroke();}
  c.restore();
  c.save();c.strokeStyle=GOLD;c.lineWidth=3;c.beginPath();c.moveTo(x0+2,-176);c.bezierCurveTo(x0+40,-252,120,-282,172,-238);c.stroke();c.restore();
  c.restore();
}
// one soft cloud with a flat bottom, drawn as a single outlined shape so it never looks like loose circles
function cloud(c,y,w){
  const r=w*.26;c.save();c.lineJoin='round';c.strokeStyle='rgba(190,205,235,.9)';c.lineWidth=3;
  c.beginPath();
  c.moveTo(-w*.52,y+r*.42);
  c.arc(-w*.34,y+r*.1,r*.62,Math.PI*.9,Math.PI*1.75);
  c.arc(-w*.06,y-r*.3,r*.9,Math.PI*1.1,Math.PI*1.85);
  c.arc(w*.28,y+r*.04,r*.7,Math.PI*1.25,Math.PI*2.05);
  c.arc(w*.46,y+r*.4,r*.44,Math.PI*1.45,Math.PI*.5);
  c.lineTo(-w*.52,y+r*.84);c.closePath();
  const g=c.createLinearGradient(0,y-r,0,y+r);g.addColorStop(0,'#FFFFFF');g.addColorStop(1,'#DCE6F7');
  c.fillStyle=g;c.fill();c.stroke();
  c.save();c.globalAlpha=.55;c.fillStyle='#FFFFFF';c.beginPath();c.ellipse(-w*.1,y-r*.25,w*.2,r*.3,0,0,7);c.fill();c.restore();
  c.restore();
}
function wingsSet(c,col,t,ex){
  softGlow(c,0,-150,190,'rgba(255,247,176,.55)');
  c.save();c.globalAlpha=.25;c.fillStyle='#FFF7B0';for(let i=0;i<7;i++){c.save();c.translate(0,-150);c.rotate(-1.2+i*.4);c.fillRect(-4,-200,8,120);c.restore();}c.restore();
  wing(c,-1,col,18);wing(c,1,col,18);
  c.save();c.lineWidth=6;c.strokeStyle=GOLD;c.beginPath();c.ellipse(0,-262,30,8,0,0,7);c.stroke();c.restore();
  cloud(c,-8,140);
  wingExtra(c,ex,t);
}

// ---------- side view ----------
function vehSideX(c,vid,col,wh,neon,drawWheel,ex){
  if(vid==='tmax'){
    ell(c,4,-1,132,8,'rgba(0,0,0,.3)');
    drawWheel(c,-92,-24,24,wh,false,true);drawWheel(c,90,-24,24,wh,false,true);
    // exhaust
    c.save();c.lineCap='round';c.strokeStyle=INK;c.lineWidth=11;ln(c,40,-20,118,-30);c.strokeStyle='#C9CED6';c.lineWidth=6;ln(c,40,-20,118,-30);c.restore();
    // rear body with seat and tail light
    c.beginPath();c.moveTo(-10,-40);c.lineTo(10,-96);c.quadraticCurveTo(90,-110,126,-82);c.lineTo(122,-52);c.quadraticCurveTo(80,-36,40,-40);c.closePath();c.fillStyle=vg(c,col,-110,-36);c.fill();c.stroke();
    c.beginPath();c.moveTo(14,-100);c.quadraticCurveTo(60,-122,112,-104);c.lineTo(110,-94);c.quadraticCurveTo(60,-108,18,-92);c.closePath();c.fillStyle='#15151B';c.fill();c.stroke();
    R(c,116,-80,10,10,'#FF2D2D');c.fillStyle='rgba(255,255,255,.3)';c.fillRect(30,-78,80,3);
    // floorboard
    R(c,-58,-48,70,10,'#15151B');
    // front apron, shield and windscreen
    c.beginPath();c.moveTo(-58,-40);c.lineTo(-120,-50);c.quadraticCurveTo(-128,-100,-100,-138);c.lineTo(-74,-134);c.quadraticCurveTo(-70,-90,-50,-48);c.closePath();c.fillStyle=vg(c,col,-138,-40);c.fill();c.stroke();
    poly(c,[[-100,-138],[-96,-186],[-78,-180],[-74,-134]],'rgba(170,220,255,.55)');
    R(c,-104,-150,44,8,'#15151B');rr(c,-110,-153,12,13,4);c.fillStyle='#2A2A33';c.fill();c.stroke();
    softGlow(c,-122,-92,34,'rgba(255,247,176,.6)');rr(c,-126,-100,14,16,4);c.fillStyle='#FFF7B0';c.fill();c.stroke();
    c.save();c.fillStyle=GOLD;c.font='bold 16px Impact,sans-serif';c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.fillText('T-MAX',70,-60);c.restore();
    rideExtraSide(c,'tmax',ex);
    return true;
  }
  if(vid==='bigpit'){ell(c,-10,-1,160,10,'rgba(0,0,0,.3)');pit(c,col,{tail:1,body:1,saddle:1,head:1},ex);return true;}
  if(vid==='wings'){wingsSet(c,col,0,ex);return true;}
  return false;
}
// ---------- front view (drawn over the rider) ----------
function vehFrontX(c,vid,col,ex){
  if(vid==='tmax'){rr(c,-22,-60,44,60,10);c.fillStyle='#1E1E26';c.fill();c.stroke();
    c.beginPath();c.moveTo(-60,-60);c.lineTo(60,-60);c.lineTo(50,-150);c.lineTo(-50,-150);c.closePath();c.fillStyle=vg(c,col,-150,-60);c.fill();c.stroke();
    poly(c,[[-46,-150],[46,-150],[36,-212],[-36,-212]],'rgba(170,220,255,.5)');R(c,-88,-160,176,8,'#15151B');R(c,-100,-176,16,14,'#15151B');R(c,84,-176,16,14,'#15151B');
    softGlow(c,-28,-104,30,'rgba(255,247,176,.6)');softGlow(c,28,-104,30,'rgba(255,247,176,.6)');rr(c,-44,-112,30,14,5);c.fillStyle='#FFF7B0';c.fill();c.stroke();rr(c,14,-112,30,14,5);c.fill();c.stroke();return true;}
  if(vid==='bigpit'){const k=2.4;
    for(const sx of[-1,1])R(c,sx*40-12*k/2-6,-60,26,60,col);
    rr(c,-70,-190,140,120,24);c.fillStyle=col;c.fill();c.stroke();
    poly(c,[[-70,-190],[-86,-230],[-44,-196]],shade(col,-.2));poly(c,[[70,-190],[86,-230],[44,-196]],shade(col,-.2));
    rr(c,-40,-130,80,50,16);c.fillStyle=shade(col,.15);c.fill();c.stroke();R(c,-14,-128,28,14,INK,1);
    R(c,-44,-166,16,14,INK,1);R(c,28,-166,16,14,INK,1);c.fillStyle='#fff';c.fillRect(-40,-164,5,5);c.fillRect(32,-164,5,5);
    R(c,-60,-84,120,16,GOLD);for(let i=0;i<6;i++)poly(c,[[-52+i*20,-84],[-46+i*20,-98],[-40+i*20,-84]],'#E0E0E0',1);pitExtraFront(c,ex);return true;}
  if(vid==='wings'){softGlow(c,0,-150,200,'rgba(255,247,176,.45)');wing(c,-1,col,50);wing(c,1,col,50);
    cloud(c,-6,120);wingExtra(c,ex,0);return true;}
  return false;
}
// ---------- rear view: 'back' = far layer (behind the rider), 'front' = near layer ----------
function vehRearBackX(c,vid,col,ex){
  if(vid==='tmax'){poly(c,[[-46,-150],[46,-150],[36,-212],[-36,-212]],'rgba(170,220,255,.4)');R(c,-88,-168,176,8,'#15151B');return true;}
  if(vid==='bigpit'){rr(c,-60,-200,120,80,20);c.fillStyle=col;c.fill();c.stroke();poly(c,[[-60,-196],[-78,-236],[-36,-200]],shade(col,-.2));poly(c,[[60,-196],[78,-236],[36,-200]],shade(col,-.2));R(c,-54,-130,108,14,GOLD);return true;}
  if(vid==='wings'){wingsSet(c,col,0,ex);return true;}
  return false;
}
function vehRearX(c,vid,col,st,drawSticker,ex){
  if(vid==='tmax'){rr(c,-22,-60,44,60,10);c.fillStyle='#1E1E26';c.fill();c.stroke();c.beginPath();c.moveTo(-70,-56);c.lineTo(70,-56);c.lineTo(58,-120);c.lineTo(-58,-120);c.closePath();c.fillStyle=vg(c,col,-120,-56);c.fill();c.stroke();
    R(c,-50,-112,100,10,'#FF2D2D');c.save();c.lineCap='round';c.strokeStyle=INK;c.lineWidth=12;ln(c,52,-40,70,-30);c.strokeStyle='#C9CED6';c.lineWidth=7;ln(c,52,-40,70,-30);c.restore();if(st)drawSticker(c,st,0,-80,70,20,0);return true;}
  if(vid==='bigpit'){for(const sx of[-1,1])R(c,sx*36-13,-70,26,70,col);rr(c,-66,-130,132,76,26);c.fillStyle=col;c.fill();c.stroke();
    c.save();c.translate(0,-120);c.rotate(-.3);R(c,-6,-50,12,50,col);c.restore();R(c,-40,-132,80,18,'#C1121F');R(c,-40,-118,80,4,GOLD,1);if(st)drawSticker(c,st,0,-100,70,20,0);return true;}
  if(vid==='wings'){cloud(c,-6,120);return true;}
  return false;
}
// ---------- race, top view (forward = -y). Returns [seatY, barY] for the rider, or null ----------
function vehTopX(c,vid,col,t,ex){
  if(vid==='tmax'){R(c,-3,-30,6,10,'#111');R(c,-3,18,6,10,'#111');rr(c,-9,-26,18,46,6);c.fillStyle=col;c.fill();c.stroke();R(c,-6,2,12,14,'#15151B');R(c,-12,-22,24,3.5,'#15151B');R(c,-4,20,8,3,'#FF2D2D',1);rideExtraTop(c,'tmax',ex);return[4,-20];}
  if(vid==='bigpit'){const w=Math.sin((t||0)*14)*4;
    for(const [x,y,s] of[[-11,-14,1],[11,-14,-1],[-11,14,-1],[11,14,1]])R(c,x-3,y-4+w*s,6,10,shade(col,-.15));
    c.save();c.translate(0,22);c.rotate(Math.sin((t||0)*10)*.4);R(c,-2,0,4,12,col);c.restore();
    rr(c,-11,-20,22,42,8);c.fillStyle=col;c.fill();c.stroke();rr(c,-9,-38,18,20,6);c.fill();c.stroke();R(c,-5,-40,10,5,shade(col,.2),1);
    poly(c,[[-9,-34],[-13,-40],[-7,-38]],shade(col,-.2));poly(c,[[9,-34],[13,-40],[7,-38]],shade(col,-.2));R(c,-9,-20,18,4,GOLD,1);R(c,-8,-6,16,12,'#C1121F');pitExtraTop(c,ex);return[4,-16];}
  if(vid==='wings'){softGlow(c,0,0,48,'rgba(255,247,176,.6)');
    for(const s of[-1,1]){c.save();c.scale(s,1);const f=Math.sin((t||0)*6)*.15;c.rotate(f);for(let i=0;i<4;i++){c.beginPath();c.moveTo(6,-4+i*4);c.quadraticCurveTo(26,-18+i*6,44-i*5,-10+i*8);c.quadraticCurveTo(24,-2+i*5,6,4+i*4);c.closePath();c.fillStyle=shade(col,-i*.04);c.fill();c.stroke();}c.restore();}
    c.save();c.scale(.22,.22);cloud(c,66,120);wingExtra(c,ex,t,.16);c.restore();return[2,-14];}
  return null;
}

export { vehSideX, vehFrontX, vehRearBackX, vehRearX, vehTopX, rideExtraSide, rideExtraTop };

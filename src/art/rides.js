// Unlockable rides: T-Max maxi-scooter, a giant pitbull, and the Wings of the Shechinah.
// vehicles.js calls these for ids it doesn't know; each returns true if it drew something.
// Side view: origin at ground center, front = -x (like the original vehicles).
import { INK, GOLD, GOLD2, PINK } from '../core/util.js';
import { R, ln, poly, rr, circ, ell, shade, star } from '../core/draw.js';

function vg(c,col,y0,y1){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,.3));g.addColorStop(.55,col);g.addColorStop(1,shade(col,-.3));return g;}
function softGlow(c,x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}

// ---------- giant pitbull: the pitbull drawing mirrored to face -x and scaled up ----------
const PK=2.5;
function pit(c,col,parts){
  const D=(x,y,w,h,f,ns)=>R(c,-(x+w)*PK,y*PK,w*PK,h*PK,f,ns),P=(pts,f,ns)=>poly(c,pts.map(([x,y])=>[-x*PK,y*PK]),f,ns);
  if(parts.tail){c.save();c.translate(30*PK,-40*PK);c.rotate(.9);R(c,-3*PK,-16*PK,6*PK,16*PK,col);c.restore();}
  if(parts.body){D(-30,-44,58,26,col);for(const x of[-26,-12,8,20])D(x,-20,9,20,col);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(-16*PK,-30*PK,26*PK,8*PK);}
  if(parts.saddle){D(-18,-50,30,10,'#C1121F');D(-18,-42,30,3,GOLD,1);D(-6,-58,6,10,'#2B2B35');}
  if(parts.head){D(20,-68,30,28,col);D(44,-56,14,14,shade(col,.15));D(53,-58,6,5,INK,1);P([[22,-68],[28,-78],[32,-68]],shade(col,-.2));D(34,-62,5,5,INK,1);
    D(18,-46,12,8,GOLD);for(let i=0;i<3;i++)P([[19+i*4,-46],[21+i*4,-51],[23+i*4,-46]],'#E0E0E0',1);}
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
function cloud(c,y,w){c.fillStyle='rgba(255,255,255,.95)';for(const [x,r] of[[-w*.5,w*.18],[-w*.22,w*.26],[w*.1,w*.24],[w*.4,w*.18]])circ(c,x,y,r,'#FFFFFF');}
function wingsSet(c,col,t){
  softGlow(c,0,-150,190,'rgba(255,247,176,.55)');
  c.save();c.globalAlpha=.25;c.fillStyle='#FFF7B0';for(let i=0;i<7;i++){c.save();c.translate(0,-150);c.rotate(-1.2+i*.4);c.fillRect(-4,-200,8,120);c.restore();}c.restore();
  wing(c,-1,col,18);wing(c,1,col,18);
  c.save();c.lineWidth=6;c.strokeStyle=GOLD;c.beginPath();c.ellipse(0,-262,30,8,0,0,7);c.stroke();c.restore();
  cloud(c,-8,140);
}

// ---------- side view ----------
function vehSideX(c,vid,col,wh,neon,drawWheel){
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
    return true;
  }
  if(vid==='bigpit'){ell(c,-10,-1,150,9,'rgba(0,0,0,.3)');pit(c,col,{tail:1,body:1,saddle:1,head:1});return true;}
  if(vid==='wings'){wingsSet(c,col,0);return true;}
  return false;
}
// ---------- front view (drawn over the rider) ----------
function vehFrontX(c,vid,col){
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
    R(c,-60,-84,120,16,GOLD);for(let i=0;i<6;i++)poly(c,[[-52+i*20,-84],[-46+i*20,-98],[-40+i*20,-84]],'#E0E0E0',1);return true;}
  if(vid==='wings'){softGlow(c,0,-150,200,'rgba(255,247,176,.45)');wing(c,-1,col,50);wing(c,1,col,50);
    cloud(c,-6,120);return true;}
  return false;
}
// ---------- rear view: 'back' = far layer (behind the rider), 'front' = near layer ----------
function vehRearBackX(c,vid,col){
  if(vid==='tmax'){poly(c,[[-46,-150],[46,-150],[36,-212],[-36,-212]],'rgba(170,220,255,.4)');R(c,-88,-168,176,8,'#15151B');return true;}
  if(vid==='bigpit'){rr(c,-60,-200,120,80,20);c.fillStyle=col;c.fill();c.stroke();poly(c,[[-60,-196],[-78,-236],[-36,-200]],shade(col,-.2));poly(c,[[60,-196],[78,-236],[36,-200]],shade(col,-.2));R(c,-54,-130,108,14,GOLD);return true;}
  if(vid==='wings'){wingsSet(c,col,0);return true;}
  return false;
}
function vehRearX(c,vid,col,st,drawSticker){
  if(vid==='tmax'){rr(c,-22,-60,44,60,10);c.fillStyle='#1E1E26';c.fill();c.stroke();c.beginPath();c.moveTo(-70,-56);c.lineTo(70,-56);c.lineTo(58,-120);c.lineTo(-58,-120);c.closePath();c.fillStyle=vg(c,col,-120,-56);c.fill();c.stroke();
    R(c,-50,-112,100,10,'#FF2D2D');c.save();c.lineCap='round';c.strokeStyle=INK;c.lineWidth=12;ln(c,52,-40,70,-30);c.strokeStyle='#C9CED6';c.lineWidth=7;ln(c,52,-40,70,-30);c.restore();if(st)drawSticker(c,st,0,-80,70,20,0);return true;}
  if(vid==='bigpit'){for(const sx of[-1,1])R(c,sx*36-13,-70,26,70,col);rr(c,-66,-130,132,76,26);c.fillStyle=col;c.fill();c.stroke();
    c.save();c.translate(0,-120);c.rotate(-.3);R(c,-6,-50,12,50,col);c.restore();R(c,-40,-132,80,18,'#C1121F');R(c,-40,-118,80,4,GOLD,1);if(st)drawSticker(c,st,0,-100,70,20,0);return true;}
  if(vid==='wings'){cloud(c,-6,120);return true;}
  return false;
}
// ---------- race, top view (forward = -y). Returns [seatY, barY] for the rider, or null ----------
function vehTopX(c,vid,col,t){
  if(vid==='tmax'){R(c,-3,-30,6,10,'#111');R(c,-3,18,6,10,'#111');rr(c,-9,-26,18,46,6);c.fillStyle=col;c.fill();c.stroke();R(c,-6,2,12,14,'#15151B');R(c,-12,-22,24,3.5,'#15151B');R(c,-4,20,8,3,'#FF2D2D',1);return[4,-20];}
  if(vid==='bigpit'){const w=Math.sin((t||0)*14)*4;
    for(const [x,y,s] of[[-11,-14,1],[11,-14,-1],[-11,14,-1],[11,14,1]])R(c,x-3,y-4+w*s,6,10,shade(col,-.15));
    c.save();c.translate(0,22);c.rotate(Math.sin((t||0)*10)*.4);R(c,-2,0,4,12,col);c.restore();
    rr(c,-11,-20,22,42,8);c.fillStyle=col;c.fill();c.stroke();rr(c,-9,-38,18,20,6);c.fill();c.stroke();R(c,-5,-40,10,5,shade(col,.2),1);
    poly(c,[[-9,-34],[-13,-40],[-7,-38]],shade(col,-.2));poly(c,[[9,-34],[13,-40],[7,-38]],shade(col,-.2));R(c,-9,-20,18,4,GOLD,1);R(c,-8,-6,16,12,'#C1121F');return[4,-16];}
  if(vid==='wings'){softGlow(c,0,0,48,'rgba(255,247,176,.6)');
    for(const s of[-1,1]){c.save();c.scale(s,1);const f=Math.sin((t||0)*6)*.15;c.rotate(f);for(let i=0;i<4;i++){c.beginPath();c.moveTo(6,-4+i*4);c.quadraticCurveTo(26,-18+i*6,44-i*5,-10+i*8);c.quadraticCurveTo(24,-2+i*5,6,4+i*4);c.closePath();c.fillStyle=shade(col,-i*.04);c.fill();c.stroke();}c.restore();}
    for(const [x,y,r] of[[-8,14,6],[0,16,7],[8,14,6]])circ(c,x,y,r,'#FFFFFF',1);return[2,-14];}
  return null;
}

export { vehSideX, vehFrontX, vehRearBackX, vehRearX, vehTopX };

// Vehicles: side, front and rear views, wheels.
import { GOLD, INK } from '../core/util.js';
import { R, circ, ell, ln, poly, rr, shade } from '../core/draw.js';
import { SLOTS, STICKERS } from '../core/catalog.js';
import { drawSticker } from './stickers.js';
import { vehSideX, vehFrontX, vehRearBackX, vehRearX } from './rides.js';

// ================= VEHICLES (side view, origin ground center, front = -x) =================
function vgrad(c,col,y0,y1){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,.3));g.addColorStop(.55,col);g.addColorStop(1,shade(col,-.32));return g;}
function hgrad(c,col,x0,x1){const g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,shade(col,.3));g.addColorStop(1,shade(col,-.28));return g;}
function glossLine(c,x0,y0,x1,y1,w){c.save();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=w||2.5;c.lineCap='round';ln(c,x0,y0,x1,y1);c.restore();}
function glow(c,x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}
function spring(c,x0,y0,x1,y1,n,amp,col){c.save();c.strokeStyle=col;c.lineWidth=3;c.lineJoin='round';const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;c.beginPath();c.moveTo(x0,y0);for(let i=1;i<n;i++){const u=i/n,s=i%2?amp:-amp;c.lineTo(x0+dx*u+nx*s,y0+dy*u+ny*s);}c.lineTo(x1,y1);c.stroke();c.restore();}
function underglow(c,x,y,rx,col){c.save();c.translate(x,y);c.scale(1,.2);glow(c,0,0,rx,col);c.restore();}
function drawWheel(c,x,y,r,style,thin,tread){
  c.save();c.translate(x,y);c.strokeStyle=INK;
  const rim=style==='gold'?GOLD:style==='chrome'?'#E6EBF2':style==='neon'?'#3DF5FF':'#A7AEBB';
  if(style==='neon'){c.shadowColor='#3DF5FF';c.shadowBlur=16;}
  if(thin){
    c.beginPath();c.arc(0,0,r-3,0,7);c.lineWidth=10;c.strokeStyle='#1B1B22';c.stroke();c.shadowBlur=0;
    c.fillStyle='#34343F';for(let i=0;i<28;i++){c.save();c.rotate(i*Math.PI/14);c.fillRect(r-.5,-1.5,2.5,3);c.restore();}
    c.lineWidth=2;c.strokeStyle=INK;c.beginPath();c.arc(0,0,r+2,0,7);c.stroke();c.beginPath();c.arc(0,0,r-8.5,0,7);c.stroke();
    c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=2;c.beginPath();c.arc(0,0,r-4.5,Math.PI*1.1,Math.PI*1.55);c.stroke();
    c.strokeStyle=rim;c.lineWidth=3.5;c.beginPath();c.arc(0,0,r-10,0,7);c.stroke();
    c.strokeStyle=shade(rim,-.2);c.lineWidth=1.1;for(let i=0;i<16;i++){const a=i*Math.PI/8,b=a+(i%2?.45:-.45);ln(c,Math.cos(a)*5,Math.sin(a)*5,Math.cos(b)*(r-11),Math.sin(b)*(r-11));}
    c.strokeStyle=INK;c.lineWidth=2;circ(c,0,0,6,shade(rim,-.1));circ(c,0,0,2.2,INK,1);
  }else{
    const tg=c.createRadialGradient(-r*.3,-r*.3,r*.2,0,0,r);tg.addColorStop(0,'#44444F');tg.addColorStop(1,'#15151B');
    if(tread){c.lineWidth=1.5;for(let i=0;i<16;i++){c.save();c.rotate(i*Math.PI/8);R(c,r-3,-4.5,6,9,'#23232B');c.restore();}}
    c.beginPath();c.arc(0,0,r,0,7);c.fillStyle=tg;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();c.shadowBlur=0;
    c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=2;c.beginPath();c.arc(0,0,r-3,Math.PI*1.05,Math.PI*1.5);c.stroke();
    const hr=r*.58,rg=c.createRadialGradient(-hr*.35,-hr*.4,1,0,0,hr);rg.addColorStop(0,shade(rim,.5));rg.addColorStop(1,shade(rim,-.22));
    c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.arc(0,0,hr,0,7);c.fillStyle=rg;c.fill();c.stroke();
    for(let i=0;i<5;i++){c.save();c.rotate(i*Math.PI*2/5+.63);poly(c,[[hr*.34,-hr*.15],[hr*.84,-hr*.27],[hr*.84,hr*.27],[hr*.34,hr*.15]],'rgba(20,20,28,.85)',1);c.restore();}
    c.lineWidth=1.5;circ(c,0,0,hr*.28,shade(rim,-.08));for(let i=0;i<5;i++){const a=i*Math.PI*2/5;circ(c,Math.cos(a)*hr*.15,Math.sin(a)*hr*.15,1.2,INK,1);}
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.8;c.beginPath();c.arc(0,0,hr*.78,Math.PI*1.15,Math.PI*1.45);c.stroke();
  }
  if(style==='neon'){c.strokeStyle='rgba(61,245,255,.85)';c.lineWidth=2;c.beginPath();c.arc(0,0,r+3,0,7);c.stroke();}
  c.restore();
}
function tube(c,a,b,col,w){c.save();c.lineCap='round';c.strokeStyle=INK;c.lineWidth=w+5;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.strokeStyle=col;c.lineWidth=w;c.stroke();
  if(w>=5){c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=Math.max(1.2,w*.28);const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ox=dy/L*w*.22,oy=-dx/L*w*.22;c.beginPath();c.moveTo(a[0]+ox+dx*.08,a[1]+oy+dy*.08);c.lineTo(b[0]+ox-dx*.08,b[1]+oy-dy*.08);c.stroke();}
  c.restore();}
function drawVehicleSide(c,vid,col,wh,stickers){
  c.save();c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=3;
  const neon=wh==='neon'?'rgba(61,245,255,.55)':'rgba(255,61,139,.45)';
  if(vid==='scooter'){
    ell(c,4,-1,122,7,'rgba(0,0,0,.28)');underglow(c,6,-12,100,neon);
    drawWheel(c,-88,-17,17,wh);drawWheel(c,88,-17,17,wh);
    c.beginPath();c.moveTo(70,-40);c.quadraticCurveTo(90,-48,110,-24);c.lineTo(101,-21);c.quadraticCurveTo(88,-36,72,-31);c.closePath();c.fillStyle=vgrad(c,col,-48,-21);c.fill();c.stroke();
    R(c,104,-33,7,6,'#FF2D2D');
    poly(c,[[-80,-46],[-68,-46],[-84,-17],[-94,-17]],'#15151B');spring(c,-76,-43,-88,-24,7,3.2,'#C9CED6');
    c.save();c.strokeStyle='#2A2A33';c.lineWidth=3.5;ln(c,22,-25,8,-5);c.restore();
    rr(c,-72,-46,158,22,6);c.fillStyle=vgrad(c,col,-46,-24);c.fill();c.stroke();
    c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-66,-29,146,2.5);
    R(c,-66,-50,146,5,'#15151B');c.fillStyle='rgba(255,255,255,.14)';for(let x=-62;x<78;x+=5)c.fillRect(x,-49,1.6,1.6);
    glossLine(c,-62,-43,74,-43,2);
    c.beginPath();c.moveTo(-78,-44);c.lineTo(-62,-44);c.lineTo(-78,-180);c.lineTo(-96,-180);c.closePath();c.fillStyle=hgrad(c,col,-96,-62);c.fill();c.stroke();
    glossLine(c,-89,-172,-75,-58,2);R(c,-82,-64,20,9,'#C9CED6');
    glow(c,-92,-160,30,'rgba(255,247,176,.55)');circ(c,-86,-160,6,'#FFF7B0');
    R(c,-124,-188,62,8,'#15151B');rr(c,-134,-192,16,15,5);c.fillStyle='#2A2A33';c.fill();c.stroke();rr(c,-70,-192,16,15,5);c.fill();c.stroke();
    c.save();c.strokeStyle='#C9CED6';c.lineWidth=2.5;ln(c,-118,-183,-106,-175);c.restore();
    rr(c,-100,-203,24,12,3);c.fillStyle='#111';c.fill();c.stroke();c.fillStyle='#3DF5FF';c.fillRect(-97,-199,12,4);c.fillStyle='#3DDC97';c.fillRect(-84,-199,5,4);
  }else if(vid==='bike'){
    ell(c,0,-1,128,7,'rgba(0,0,0,.28)');underglow(c,0,-10,100,neon);
    drawWheel(c,-86,-36,36,wh,true);drawWheel(c,86,-36,36,wh,true);
    c.save();c.lineWidth=5;c.strokeStyle=INK;c.beginPath();c.arc(-86,-36,43,Math.PI*1.12,Math.PI*1.72);c.stroke();c.beginPath();c.arc(86,-36,43,Math.PI*1.28,Math.PI*1.9);c.stroke();c.lineWidth=3;c.strokeStyle=shade(col,-.15);c.beginPath();c.arc(-86,-36,43,Math.PI*1.12,Math.PI*1.72);c.stroke();c.beginPath();c.arc(86,-36,43,Math.PI*1.28,Math.PI*1.9);c.stroke();c.restore();
    const BB=[8,-44],SEAT=[34,-128],HEAD=[-60,-122],HR=[86,-36],HF=[-86,-36];
    c.save();c.strokeStyle='#4A4A55';c.lineWidth=2;c.setLineDash([3,2]);ln(c,8,-54,86,-41);ln(c,8,-34,86,-31);c.restore();
    tube(c,BB,HR,col,7);tube(c,SEAT,HR,col,6);tube(c,BB,SEAT,col,9);tube(c,[32,-114],[-58,-116],col,8);
    tube(c,HEAD,HF,'#2A2A33',8);tube(c,[-63,-112],[-76,-74],'#C9CED6',4);
    tube(c,HEAD,[-66,-152],'#2A2A33',7);R(c,-94,-158,36,8,'#15151B');rr(c,-100,-161,12,13,4);c.fillStyle='#2A2A33';c.fill();c.stroke();
    rr(c,-74,-172,20,11,3);c.fillStyle='#111';c.fill();c.stroke();c.fillStyle='#3DF5FF';c.fillRect(-71,-168,10,3.5);
    tube(c,SEAT,[36,-140],'#2A2A33',5);
    c.beginPath();c.moveTo(12,-146);c.quadraticCurveTo(14,-154,30,-153);c.lineTo(62,-150);c.quadraticCurveTo(68,-146,60,-141);c.lineTo(18,-140);c.closePath();c.fillStyle='#15151B';c.fill();c.stroke();glossLine(c,20,-150,54,-149,1.8);
    c.save();c.translate(-26,-83);c.rotate(.854);rr(c,-54,-14,108,28,7);c.fillStyle=vgrad(c,shade(col,-.25),-14,14);c.fill();c.stroke();glossLine(c,-48,-9,48,-9,2);for(let i=0;i<4;i++)circ(c,-48+i*5,8,1.5,i<3?'#3DDC97':'#555',1);c.restore();
    c.save();c.strokeStyle='#9AA0AE';c.lineWidth=4;ln(c,60,-70,84,-40);c.restore();
    R(c,50,-104,74,34,'#000');rr(c,50,-104,74,34,5);c.fillStyle=vgrad(c,shade(col,-.35),-104,-70);c.fill();c.stroke();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(50,-96,74,2);R(c,119,-90,6,8,'#FF2D2D');
    c.save();c.translate(8,-44);circ(c,0,0,12,'#9AA0AE');c.save();c.setLineDash([2,2]);c.strokeStyle='#555';c.beginPath();c.arc(0,0,12,0,7);c.stroke();c.restore();c.rotate(.7);R(c,-2.5,0,5,20,'#2A2A33');R(c,-7,18,14,5,'#15151B');c.restore();circ(c,8,-44,4,'#555');
    glow(c,-68,-132,24,'rgba(255,247,176,.55)');circ(c,-64,-132,5,'#FFF7B0');
  }else if(!vehSideX(c,vid,col,wh,neon,drawWheel)){
    ell(c,0,-1,138,8,'rgba(0,0,0,.3)');underglow(c,0,-14,120,neon);
    drawWheel(c,-88,-32,32,wh,false,true);drawWheel(c,84,-32,32,wh,false,true);
    spring(c,-66,-60,-84,-40,8,4,'#E02A3A');spring(c,64,-60,80,-40,8,4,'#E02A3A');
    R(c,-44,-52,86,18,'#2A2A33');
    c.save();c.lineCap='round';c.strokeStyle=INK;c.lineWidth=10;ln(c,92,-54,134,-60);const eg=c.createLinearGradient(0,-64,0,-50);eg.addColorStop(0,'#F2F4F8');eg.addColorStop(1,'#8A92A0');c.strokeStyle=eg;c.lineWidth=6;ln(c,92,-54,134,-60);c.restore();circ(c,135,-60,3.5,'#222',1);
    poly(c,[[-130,-66],[-122,-90],[-50,-94],[-44,-66]],vgrad(c,col,-94,-66));
    poly(c,[[42,-66],[50,-94],[120,-90],[128,-64]],vgrad(c,col,-94,-64));
    c.fillStyle='rgba(255,255,255,.75)';poly(c,[[-118,-84],[-60,-89],[-62,-84],[-116,-80]],'rgba(255,255,255,.8)',1);poly(c,[[56,-89],[114,-86],[116,-82],[58,-85]],'rgba(255,255,255,.8)',1);
    rr(c,-62,-82,122,36,6);c.fillStyle=vgrad(c,col,-82,-46);c.fill();c.stroke();glossLine(c,-56,-78,54,-78,2);
    c.save();c.strokeStyle='#9AA0AE';c.lineWidth=4;ln(c,-128,-100,-62,-104);ln(c,-120,-92,-120,-100);ln(c,-72,-94,-72,-103);ln(c,-140,-70,-128,-72);c.restore();
    c.save();c.strokeStyle='#9AA0AE';c.lineWidth=4;ln(c,62,-104,120,-100);ln(c,70,-94,70,-104);ln(c,112,-90,112,-100);c.restore();
    rr(c,-16,-108,78,16,7);c.fillStyle='#15151B';c.fill();c.stroke();c.save();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1.2;c.setLineDash([3,3]);ln(c,-10,-101,56,-101);c.restore();glossLine(c,-8,-105,50,-105,1.6);
    tube(c,[-56,-94],[-70,-132],'#2A2A33',7);R(c,-98,-138,48,8,'#15151B');rr(c,-104,-141,12,13,4);c.fillStyle='#2A2A33';c.fill();c.stroke();
    c.save();c.strokeStyle='#2A2A33';c.lineWidth=2.5;ln(c,-58,-138,-52,-156);c.restore();circ(c,-51,-160,6,'#C9CED6');
    glow(c,-128,-78,28,'rgba(255,247,176,.55)');rr(c,-128,-84,12,11,3);c.fillStyle='#FFF7B0';c.fill();c.stroke();
  }
  const sl=SLOTS[vid]||[];
  (stickers||[]).forEach((id,i)=>{const s=sl[i];if(!s)return;const st=STICKERS.find(q=>q.id===id);if(st)drawSticker(c,st,s.x,s.y,s.w,s.h,s.r);});
  c.restore();
}
function drawVehicleFront(c,vid,col){
  c.save();c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=3;
  if(vid==='scooter'){rr(c,-9,-38,18,38,6);c.fillStyle='#1E1E26';c.fill();c.stroke();R(c,-12,-58,24,24,'#15151B');R(c,-26,-50,52,12,col);R(c,-10,-186,20,132,col);R(c,-74,-196,148,9,'#15151B');R(c,-84,-199,14,15,'#15151B');R(c,70,-199,14,15,'#15151B');ell(c,0,-156,24,24,'rgba(255,247,176,.3)');circ(c,0,-156,10,'#FFF7B0');}
  else if(vid==='bike'){rr(c,-7,-74,14,74,6);c.fillStyle='#1E1E26';c.fill();c.stroke();R(c,-15,-128,5,82,'#2A2A33');R(c,10,-128,5,82,'#2A2A33');R(c,-10,-152,20,28,col);R(c,-78,-168,156,8,'#15151B');R(c,-88,-171,12,14,'#15151B');R(c,76,-171,12,14,'#15151B');ell(c,0,-136,20,20,'rgba(255,247,176,.3)');circ(c,0,-136,9,'#FFF7B0');}
  else if(!vehFrontX(c,vid,col)){c.fillStyle='#1E1E26';rr(c,-126,-70,46,70,10);c.fill();c.stroke();rr(c,80,-70,46,70,10);c.fill();c.stroke();R(c,-6,-162,12,62,'#2A2A33');R(c,-86,-168,172,9,'#15151B');
    rr(c,-98,-110,196,54,10);c.fillStyle=col;c.fill();c.stroke();R(c,-52,-94,104,26,'#2A2A33');c.save();c.strokeStyle='#555';c.lineWidth=2;for(let i=1;i<6;i++)ln(c,-52+i*17,-94,-52+i*17,-68);c.restore();
    circ(c,-70,-84,11,'#FFF7B0');circ(c,70,-84,11,'#FFF7B0');R(c,-88,-120,176,6,'#9AA0AE');}
  c.restore();
}
function drawVehicleRear(c,vid,col,part,stickers){
  c.save();c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=3;const st=stickers&&stickers.length?STICKERS.find(q=>q.id===stickers[0]):null;
  if(part==='back'&&vehRearBackX(c,vid,col)){c.restore();return;}
  if(part==='back'){if(vid==='scooter'){R(c,-8,-186,16,140,col);R(c,-74,-196,148,9,'#15151B');}else if(vid==='bike')R(c,-78,-168,156,8,'#15151B');else R(c,-86,-168,172,9,'#15151B');c.restore();return;}
  if(vid==='scooter'){rr(c,-9,-36,18,36,6);c.fillStyle='#1E1E26';c.fill();c.stroke();R(c,-26,-52,52,14,col);R(c,-16,-40,32,8,col);R(c,-11,-58,22,6,'#FF2D2D');if(st)drawSticker(c,st,0,-45,46,12,0);}
  else if(vid==='bike'){rr(c,-7,-74,14,74,6);c.fillStyle='#1E1E26';c.fill();c.stroke();R(c,-32,-114,64,34,shade(col,-.38));R(c,-10,-84,20,6,'#FF2D2D');if(st)drawSticker(c,st,0,-99,54,20,0);}
  else if(!vehRearX(c,vid,col,st,drawSticker)){c.fillStyle='#1E1E26';rr(c,-126,-70,46,70,10);c.fill();c.stroke();rr(c,80,-70,46,70,10);c.fill();c.stroke();rr(c,-98,-106,196,50,10);c.fillStyle=col;c.fill();c.stroke();
    R(c,-88,-116,176,6,'#9AA0AE');R(c,-84,-92,24,10,'#FF2D2D');R(c,60,-92,24,10,'#FF2D2D');circ(c,40,-60,7,'#555');if(st)drawSticker(c,st,0,-80,90,26,0);}
  c.restore();
}

export { drawWheel, tube, drawVehicleSide, drawVehicleFront, drawVehicleRear };

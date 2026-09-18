// Dogs, side view: pitbull and pomeranian, plus the unlockable ones in drawDogX.
import { GOLD, INK, PINK } from '../core/util.js';
import { R, circ, poly, rr, ln, shade, star } from '../core/draw.js';

function drawDog(c,type,t){
  c.save();c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=3;
  const wag=Math.sin(t*8)*.5;
  if(type==='pitbull'){
    const col='#8C7B6B';
    c.save();c.translate(-30,-40);c.rotate(-.9+wag);R(c,-3,-16,6,16,col);c.restore();
    R(c,-30,-44,58,26,col);for(const x of[-26,-12,8,20])R(c,x,-20,9,20,col);
    R(c,20,-68,30,28,col);R(c,44,-56,14,14,shade(col,.15));R(c,53,-58,6,5,INK,1);
    poly(c,[[22,-68],[28,-78],[32,-68]],shade(col,-.2));
    R(c,34,-62,5,5,INK,1);
    R(c,18,-46,12,8,GOLD);for(let i=0;i<3;i++)poly(c,[[19+i*4,-46],[21+i*4,-51],[23+i*4,-46]],'#E0E0E0',1);
    c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-10,-30,26,8);
  }else if(!drawDogX(c,type,t,wag)){
    const col='#F7F2EA';
    c.beginPath();c.ellipse(-24,-40,10,12,wag*.3,0,7);c.fillStyle=col;c.fill();c.stroke();
    for(const x of[-12,0,8,16])R(c,x,-12,5,12,col);
    circ(c,0,-26,20,col);circ(c,20,-44,14,col);
    poly(c,[[11,-54],[14,-66],[20,-56]],col);poly(c,[[22,-56],[28,-66],[30,-54]],col);
    R(c,30,-44,5,4,INK,1);R(c,20,-49,4,4,INK,1);
    poly(c,[[8,-57],[16,-62],[16,-52]],PINK);poly(c,[[24,-57],[16,-62],[16,-52]],PINK);
  }
  c.restore();
}

// unlockable dogs (side view, facing right like the pitbull). Returns true if it drew the dog
function drawDogX(c,type,t,wag){
  if(type==='chihuahua'){const col='#D9A66B';
    c.save();c.translate(-16,-26);c.rotate(-1.2+wag);R(c,-2,-10,4,10,col);c.restore();
    for(const x of[-12,-4,6,12])R(c,x,-14,4,14,col);R(c,-16,-28,34,16,PINK);c.fillStyle='#fff';c.fillRect(-16,-22,34,3);
    circ(c,24,-36,11,col);poly(c,[[16,-42],[12,-62],[24,-46]],col);poly(c,[[26,-46],[34,-62],[32,-40]],col);poly(c,[[17,-46],[15,-56],[21,-48]],PINK,1);
    R(c,30,-34,7,6,shade(col,.15));circ(c,26,-38,2.5,INK,1);circ(c,36,-33,1.8,INK,1);return true;}
  if(type==='poodle'){const col='#FFB3D1';
    for(const x of[-18,12])R(c,x,-22,4,22,shade(col,-.1));for(const x of[-18,12])circ(c,x+2,-2,6,col);
    circ(c,-6,-32,16,col);circ(c,-26,-40,8,col);circ(c,22,-44,12,col);circ(c,22,-58,9,col);circ(c,12,-40,8,col);
    R(c,30,-44,10,7,shade(col,.2));circ(c,26,-47,2.5,INK,1);circ(c,40,-42,2,INK,1);return true;}
  if(type==='husky'){const col='#8A95A5';
    c.save();c.translate(-28,-44);c.rotate(-1.5+wag);c.beginPath();c.arc(0,-8,10,Math.PI*.2,Math.PI*1.4);c.lineWidth=7;c.strokeStyle=INK;c.stroke();c.lineWidth=4;c.strokeStyle=col;c.stroke();c.restore();
    R(c,-28,-44,54,24,col);R(c,-20,-28,40,8,'#F2F2F2',1);for(const x of[-24,-10,8,18])R(c,x,-22,8,22,col);
    R(c,18,-70,28,28,col);R(c,28,-58,20,16,'#F2F2F2');R(c,42,-58,8,5,INK,1);poly(c,[[18,-70],[22,-84],[28,-70]],col);poly(c,[[34,-70],[40,-84],[44,-70]],col);
    circ(c,32,-63,3,'#3DA5FF',1);circ(c,32,-63,1.3,INK,1);return true;}
  if(type==='sausage'){const col='#8B4A2B';
    c.save();c.translate(-40,-28);c.rotate(-.5+wag*.6);R(c,-2,-12,4,12,col);c.restore();
    rr(c,-40,-32,78,18,9);c.fillStyle=col;c.fill();c.stroke();for(const x of[-34,-24,20,30])R(c,x,-16,6,16,col);
    R(c,32,-50,20,20,col);R(c,48,-42,16,10,col);R(c,60,-44,5,5,INK,1);R(c,32,-48,8,22,shade(col,-.3));circ(c,44,-44,2.5,INK,1);return true;}
  if(type==='bulldog'){const col='#C9A27A';
    R(c,-26,-38,48,26,col);R(c,-10,-30,20,14,'#F2EDE4',1);for(const x of[-24,-10,6,16])R(c,x,-14,9,14,col);
    rr(c,14,-58,36,32,12);c.fillStyle=col;c.fill();c.stroke();R(c,34,-44,16,14,'#F2EDE4');R(c,44,-46,6,4,INK,1);
    c.save();c.lineWidth=2;ln(c,36,-34,48,-34);c.restore();R(c,18,-62,8,8,shade(col,-.3));R(c,38,-62,8,8,shade(col,-.3));circ(c,28,-48,2.5,INK,1);return true;}
  if(type==='lioncub'){const col='#D9A441';
    c.save();c.translate(-30,-40);c.rotate(-1.1+wag);R(c,-2,-18,4,18,col);circ(c,0,-20,5,'#7A4A1A');c.restore();
    R(c,-30,-42,54,22,col);for(const x of[-26,-12,6,16])R(c,x,-22,9,22,col);
    for(let i=0;i<10;i++){const a=i*Math.PI/5;circ(c,30+Math.cos(a)*16,-52+Math.sin(a)*16,8,'#9A5A1E');}
    circ(c,30,-52,15,col);R(c,36,-50,12,9,'#F2D9A0');R(c,44,-52,5,4,INK,1);circ(c,30,-56,2.6,INK,1);circ(c,40,-56,2.6,INK,1);return true;}
  if(type==='goldpit'){const col=GOLD;
    c.save();c.translate(-30,-40);c.rotate(-.9+wag);R(c,-3,-16,6,16,col);c.restore();
    R(c,-30,-44,58,26,col);for(const x of[-26,-12,8,20])R(c,x,-20,9,20,col);
    R(c,20,-68,30,28,col);R(c,44,-56,14,14,shade(col,.3));R(c,53,-58,6,5,INK,1);poly(c,[[22,-68],[28,-78],[32,-68]],shade(col,-.2));R(c,34,-62,5,5,INK,1);
    poly(c,[[22,-68],[26,-82],[31,-72],[35,-84],[39,-72],[44,-82],[48,-68]],'#FFF1A8');
    c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-24,-40,30,5);const k=Math.max(0,Math.sin(t*4));c.save();c.globalAlpha=.4+.6*k;star(c,-12,-52,6,'#fff');star(c,12,-26,4,'#fff');c.restore();return true;}
  return false;
}
// fur color of each dog when seen from above in the race and the album
const DOG_FUR={pom:'#F7F2EA',chihuahua:'#D9A66B',poodle:'#FFB3D1',husky:'#8A95A5',sausage:'#8B4A2B',bulldog:'#C9A27A',lioncub:'#D9A441',goldpit:GOLD};
const dogFur=type=>DOG_FUR[type]||'#8C7B6B';

export { drawDog, dogFur };

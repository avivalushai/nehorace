// Dogs (pitbull, pomeranian).
import { GOLD, INK, PINK } from '../core/util.js';
import { R, circ, poly, shade } from '../core/draw.js';

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
  }else{
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

export { drawDog };

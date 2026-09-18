// Racers seen from above in the race: vehicle, rider and headwear/hair.
import { INK, GOLD, SKIN, rand } from '../core/util.js';
import { R, ln, poly, circ, ell } from '../core/draw.js';
import { SHIRTS } from '../core/catalog.js';
import { hairColor } from './neho.js';
import { topHeadX, topOverlayX } from './wardrobe.js';
import { vehTopX } from './rides.js';

function drawRacerTop(c,r){
  const L=r.look,vid=r.vid,col=r.color,S=SHIRTS[L.shirt],sc=S.c||SKIN,arm=S.sl==='long'?sc:SKIN;
  c.save();c.rotate(r.lean);c.lineWidth=1.6;c.strokeStyle=INK;
  if(vid==='wings')ell(c,14,22,14,18,'rgba(0,0,0,.12)'); // flying: small shadow, far below
  else ell(c,3,5,vid==='atv'?18:10,24,'rgba(0,0,0,.2)');
  if(r.turboT>0){for(let i=0;i<3;i++){const fl=rand(10,22);poly(c,[[-9+i*5,18],[-1+i*5,18],[-5+i*5,18+fl]],i===1?GOLD:'#FF7A1A',1);}}
  const vt=vehTopX(c,vid,col,performance.now()/1000);
  if(vt){}
  else if(vid==='scooter'){R(c,-2.5,-23,5,8,'#111');R(c,-2.5,14,5,8,'#111');R(c,-5.5,-16,11,32,col);R(c,-12,-22,24,3.5,'#15151B');}
  else if(vid==='bike'){R(c,-2.5,-28,5,13,'#111');R(c,-2.5,14,5,13,'#111');R(c,-2.5,-16,5,32,col);R(c,-12,-18,24,3.5,'#15151B');}
  else{for(const sx of[-1,1])for(const wy of[-16,10])R(c,sx*14-4,wy,8,12,'#111');R(c,-13,-22,26,38,col);R(c,-9,-2,18,13,'#15151B');R(c,-15,-15,30,3.5,'#15151B');}
  const sy=vt?vt[0]:vid==='scooter'?-2:vid==='bike'?3:5,barY=vt?vt[1]:vid==='scooter'?-20:vid==='bike'?-15:-12;
  R(c,-11,barY,4,sy-barY,arm);R(c,7,barY,4,sy-barY,arm);
  R(c,-11,sy-3,22,9,sc);
  c.save();c.strokeStyle=GOLD;c.lineWidth=2.2;ln(c,-5,sy-2.5,5,sy-2.5);c.restore();
  const hy=sy-6;R(c,-6,hy-6,12,12,SKIN);
  if(topHeadX(c,L,hy)){}
  else if(L.cap==='back'){R(c,-6.5,hy-6.5,13,12,'#E02A3A');R(c,-4,hy+5,8,3,'#B01E2C');}
  else if(L.cap==='beanie')R(c,-6.5,hy-6.5,13,12,'#2B2B35');
  else if(L.cap==='tembel'){circ(c,0,hy,9,'#E6DDB8');R(c,-5,hy-5,10,10,'#F2EBD0');}
  else{const h=L.hair,hc=hairColor(h);
    if(h==='fade')R(c,-6,hy-6,12,9,hc);
    if(h==='gel'){R(c,-6,hy-6,12,10,'#120C08');c.save();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1.5;ln(c,-3,hy-4,-3,hy+2);c.restore();}
    if(h==='bleach')poly(c,[[-7,hy+3],[-8,hy-4],[-4,hy-5],[-3,hy-9],[0,hy-6],[3,hy-9],[4,hy-5],[8,hy-4],[7,hy+3]],hc);
    if(h==='bald')circ(c,-2,hy-2,2,'rgba(255,255,255,.6)',1);
    if(h==='mullet'){R(c,-6,hy-6,12,9,hc);R(c,-5,hy+3,10,6,hc);}
  }
  topOverlayX(c,L,hy);
  c.restore();
}

export { drawRacerTop };

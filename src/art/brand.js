// Brand images drawn in code: the app icon (Nehorai's face) and the link-preview card.
// Rendered to PNG files by tests/make-images.mjs (see tools/images.html); not used by the game at runtime.
import { INK, GOLD, PINK, FONT, DISP } from '../core/util.js';
import { rr } from '../core/draw.js';
import { VEH } from '../core/catalog.js';
import { drawNeho } from './neho.js';
import { drawVehicleSide } from './vehicles.js';

// the default Nehorai from the garage
const LOOK={hair:'fade',beard:'stubble',cap:'none',chain:'cuban',shirt:'track',pants:'track',shoes:'white',dog:'none',acc:'shades',name:'נהוראי'};

function stageGlow(c,w,h,cx,cy){
  const g=c.createRadialGradient(cx,cy,w*.02,cx,cy,Math.max(w,h)*.75);g.addColorStop(0,'#7A36B5');g.addColorStop(.55,'#431F66');g.addColorStop(1,'#2A1242');
  c.fillStyle=g;c.fillRect(0,0,w,h);
}

// S = icon size in px. safe: fraction of the icon the face must stay inside (maskable icons get cropped to a circle).
// round: draw a rounded-square background with transparent corners (favicon); otherwise full bleed.
function drawIcon(c,S,o){
  o=o||{};const safe=o.safe||.9;
  c.save();c.clearRect(0,0,S,S);
  if(o.round){rr(c,0,0,S,S,S*.22);c.clip();}
  stageGlow(c,S,S,S/2,S*.38);
  // the head spans x -40..40 and y -264..-166 (hair to neck); fit it into the safe area
  const k=S*safe/104;
  c.translate(S/2,S*.5+k*(-(-264-166)/2));c.scale(k,k);
  drawNeho(c,LOOK,0);
  c.restore();
}

// link preview card for WhatsApp and other apps (1200x630)
function drawShareCard(c,w,h){
  c.save();
  stageGlow(c,w,h,w*.3,h*.35);
  // spotlight and stage floor, like the garage stage
  c.fillStyle='rgba(255,255,255,.06)';c.beginPath();c.moveTo(w*.3-40,0);c.lineTo(w*.3+40,0);c.lineTo(w*.3+w*.26,h*.9);c.lineTo(w*.3-w*.26,h*.9);c.closePath();c.fill();
  c.fillStyle='rgba(255,200,61,.16)';c.beginPath();c.ellipse(w*.3,h*.9,w*.25,h*.05,0,0,7);c.fill();
  c.strokeStyle='rgba(255,200,61,.45)';c.lineWidth=3;c.stroke();
  // Nehorai on the scooter (same layout as the title screen)
  const vs=h*.8/232,cs=vs*.8,x0=w*.3,gy=h*.9;
  c.save();c.translate(x0+18*vs,gy-4*vs);c.scale(cs,cs);drawNeho(c,LOOK,0);c.restore();
  c.save();c.translate(x0,gy);c.scale(vs,vs);drawVehicleSide(c,'scooter',VEH.scooter.color,'gold',['hamsa','nachman']);c.restore();
  // logo, like the title screen: gold, pink and ink shadows, tilted
  c.save();c.translate(w*.76,h*.36);c.rotate(-5*Math.PI/180);
  c.font=`700 ${h*.3}px ${DISP}`;const fit=Math.min(1,w*.4/c.measureText('NehoRace').width);c.scale(fit,fit);
  c.textAlign='center';c.textBaseline='middle';c.direction='ltr';
  c.fillStyle=INK;c.fillText('NehoRace',18,22);c.fillStyle=PINK;c.fillText('NehoRace',8,10);c.fillStyle=GOLD;c.fillText('NehoRace',0,0);
  c.restore();
  c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#FFF4DC';
  c.font=`${h*.07}px ${FONT}`;c.fillText('המירוץ של הנהוראים בפארק',w*.76,h*.66);
  c.globalAlpha=.8;c.font=`${h*.044}px ${FONT}`;c.fillText('בונים נהוראי, בוחרים כלי, ודורסים את הדרך',w*.76,h*.76);
  c.restore();
}

export { drawIcon, drawShareCard };

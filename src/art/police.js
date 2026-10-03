// The park's police: a motorcycle chasing from behind (top view), the same motorcycle from the side,
// and the officer himself (front view), all drawn in code. They show up once three lights are blinking.
import { INK, GOLD, SKIN } from '../core/util.js';
import { R, circ, ell, ln, poly, rr, star } from '../core/draw.js';

const NAVY='#1C2A54',NAVY2='#121B38',SHIRT='#4E79C6',SHIRT2='#3A5FA6',WHITE='#F3F4F8',BOOT='#15151B';
// the siren blinks: red on one beat, blue on the next
const sirenCols=t=>Math.floor(t*6)%2===0?['#FF3B30','#7A1414']:['#2F6FD0','#14315A'];

// police motorcycle from above, chasing. Same scale as the racers (about 26 wide, 60 long)
function drawCopTop(c,t){
  c.save();c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=1.6;
  ell(c,3,6,12,26,'rgba(0,0,0,.22)');
  R(c,-3,-26,6,12,'#111');R(c,-3,15,6,12,'#111');            // wheels
  R(c,-7,-18,14,36,WHITE);R(c,-7,-4,14,8,NAVY);              // body with a navy stripe
  R(c,-13,-20,26,4,'#15151B');                               // handlebars
  R(c,-10,-30,20,5,WHITE);                                   // front fairing
  const[a,b]=sirenCols(t);                                   // siren bar behind the rider
  R(c,-11,8,10,6,a);R(c,1,8,10,6,b);
  c.save();c.globalAlpha=.35;circ(c,-6,11,9,a);circ(c,6,11,9,b);c.restore();
  R(c,-10,-12,5,14,NAVY);R(c,5,-12,5,14,NAVY);               // arms
  R(c,-10,-6,20,13,SHIRT);                                   // back of the officer
  c.fillStyle=GOLD;c.fillRect(-8,-2,16,2);
  R(c,-6,-16,12,12,WHITE);                                   // white helmet
  c.fillStyle=NAVY;c.fillRect(-6,-16,12,3);
  c.restore();
}

// the same motorcycle from the side, parked. About 230 wide, origin on the ground between the wheels
function drawCopBikeSide(c,t){
  c.save();c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=3;
  ell(c,0,-4,120,12,'rgba(0,0,0,.25)');
  for(const wx of[-78,78]){circ(c,wx,-40,38,'#1A1A20');circ(c,wx,-40,16,'#C9CED6',1);}
  R(c,-96,-78,192,30,WHITE);                                  // body
  R(c,-96,-62,192,10,NAVY);                                   // stripe
  R(c,-30,-104,70,28,NAVY2);                                  // seat
  poly(c,[[60,-78],[104,-96],[112,-62],[66,-56]],WHITE,1);    // front fairing
  R(c,74,-132,10,36,'#2B2B35');                               // windscreen post
  c.save();c.globalAlpha=.55;R(c,62,-150,34,36,'#CFE4FF',1);c.restore();
  R(c,-26,-120,12,18,'#2B2B35');                              // siren post
  const[a,b]=sirenCols(t);
  R(c,-44,-136,24,18,a);R(c,-20,-136,24,18,b);
  c.save();c.globalAlpha=.4;circ(c,-32,-127,26,a);circ(c,-8,-127,26,b);c.restore();
  c.fillStyle=NAVY;c.font='700 20px sans-serif';c.textAlign='center';c.direction='ltr';c.fillText('911',0,-60);
  c.restore();
}

// the officer, front view, origin at his feet, same proportions as the Nehorai.
// grab: how far his arm reaches to the side, to hold someone by the shoulder
function drawCopFigure(c,t,grab){
  c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=3;
  // legs, with a light stripe down the side, and boots
  R(c,-31,-86,28,74,NAVY);R(c,3,-86,28,74,NAVY);
  c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-29,-84,3,68);c.fillRect(26,-84,3,68);
  R(c,-35,-16,34,16,BOOT);R(c,2,-16,34,16,BOOT);
  c.fillStyle='rgba(255,255,255,.12)';c.fillRect(-34,-8,32,3);c.fillRect(3,-8,32,3);
  R(c,-11,-186,22,22,SKIN);                                   // neck
  // shirt, with a dark collar, pockets and a gold star
  R(c,-46,-168,92,86,SHIRT);
  poly(c,[[-14,-168],[0,-150],[14,-168]],SHIRT2,1);           // open collar
  c.fillStyle=SHIRT2;c.fillRect(-42,-140,26,22);c.fillRect(16,-140,26,22);
  c.fillStyle=SHIRT2;c.fillRect(-46,-168,20,9);c.fillRect(26,-168,20,9); // epaulettes
  c.fillStyle=GOLD;c.fillRect(-42,-166,12,4);c.fillRect(30,-166,12,4);
  star(c,-28,-152,9,GOLD);
  R(c,-47,-96,94,16,'#15151B');                               // belt
  c.fillStyle=GOLD;c.fillRect(-11,-94,22,12);
  R(c,28,-112,16,24,'#2B2B35');                               // radio on the belt
  c.fillStyle='#8A93A6';c.fillRect(32,-118,4,10);
  // left arm down, the other reaching out
  R(c,-66,-166,22,60,SHIRT);R(c,-66,-110,22,22,SKIN);
  c.save();c.translate(44,-162);c.rotate(-(grab||0));R(c,0,0,22,58,SHIRT);R(c,0,52,22,24,SKIN);c.restore();
  R(c,-34,-250,68,70,SKIN);                                   // head
  c.fillStyle='#2A1D14';c.fillRect(-19,-198,38,8);            // mustache
  c.strokeStyle=INK;c.lineWidth=2.5;                          // aviator sunglasses
  rr(c,-31,-226,26,16,6);c.fillStyle='#15151B';c.fill();c.stroke();
  rr(c,5,-226,26,16,6);c.fill();c.stroke();
  ln(c,-5,-220,5,-220);
  c.lineWidth=3;
  rr(c,-38,-272,76,26,8);c.fillStyle=NAVY;c.fill();c.stroke(); // cap
  rr(c,-44,-252,88,11,5);c.fillStyle=NAVY2;c.fill();c.stroke(); // visor
  c.fillStyle=GOLD;c.fillRect(-9,-268,18,10);
  c.restore();
}

// red and blue light washing over a scene: two soft glows that swap colour on every beat
function copLights(c,w,h,t){
  const[a,b]=sirenCols(t);
  for(const[x,col,str]of[[w*.78,a,.42],[w*.2,b,.3]]){
    const g=c.createRadialGradient(x,h*.3,10,x,h*.45,w*.85);
    g.addColorStop(0,col+Math.round(str*255).toString(16).padStart(2,'0'));g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g;c.fillRect(0,0,w,h);}
}

export { drawCopTop, drawCopBikeSide, drawCopFigure, copLights };

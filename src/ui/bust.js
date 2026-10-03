// "נעצרת": the picture the player gets when the motorcycle catches them, in the park where it happened.
// Every arrest draws a different picture: the light in the park, who is standing around, and what the two of
// them say are all drawn fresh. From here the race is over for the player: last place and no points.
import { $, INK, GOLD, FONT, pick } from '../core/util.js';
import { rr, circ, fitCv } from '../core/draw.js';
import { state } from '../core/state.js';
import { drawNeho } from '../art/neho.js';
import { drawDog } from '../art/dog.js';
import { randLook } from '../race/world.js';
import { parkBackdrop } from '../album/scenes.js';
import { drawCopBikeSide, drawCopFigure, copLights } from '../art/police.js';

const COP_LINES=['רד מהקורקינט לאט לאט','תעודת זהות, יא חכם','אתה יודע כמה דרסת היום?','הפארק הזה לא שלך, אחי','זה מצולם, שתדע','הקורקינט נשאר אצלי','יש לך משהו להגיד לפרוטוקול?','שלוש שעות אני רודף אחריך','שב בצד ותנשום','תגיד תודה שלא לקחתי את השרשרת','כבר חייגתי לאמא שלך','גם על הדשא נסעת? יופי'];
const NEHO_LINES=['זה לא אני, זה הקורקינט','נשבע שהם קפצו עליי','אני סטודנט, יש לי מבחן','דרסתי? רק ליטפתי','אני מכיר את ראש העיר','בוא נדבר על זה כמו גברים','היונה התחילה','אפשר אזהרה בפעם הראשונה?','אבא שלי עורך דין','אני בדרך לשיעור נהיגה','תן לי להסביר, זה סיפור ארוך','המצלמה שלך לא עובדת, נכון?'];
const BYSTANDER=['מצלם, מצלם','איזה בושות','הוא דרס לי את הכלב'];

let raf=0,onNext=null,V=null;
// everything that changes between one arrest and the next
function roll(){return{pal:Math.floor(Math.random()*4),cop:pick(COP_LINES),neho:pick(NEHO_LINES),
  watcher:Math.random()<.55?{look:randLook(),line:pick(BYSTANDER)}:null,dog:Math.random()<.4,
  flip:Math.random()<.5,tilt:(Math.random()-.5)*.1};}

// a speech bubble whose tip sits right above the speaker's head
function bubble(c,x,y,text,bg,fg,side){
  c.save();c.font=`13px ${FONT}`;c.direction='rtl';c.textAlign='center';c.textBaseline='middle';
  const bw=Math.min(c.measureText(text).width+24,Math.min(200,c.canvas.clientWidth*.6)),bh=30,tipX=x,top=y-10-bh;
  const bx=Math.max(6,Math.min(x-bw/2+side*10,c.canvas.clientWidth-bw-6));
  c.strokeStyle=INK;c.lineWidth=2.5;c.fillStyle=bg;
  c.beginPath();                                   // body and tail in one shape, so there is no seam
  c.moveTo(bx+12,top);c.lineTo(bx+bw-12,top);c.quadraticCurveTo(bx+bw,top,bx+bw,top+12);
  c.lineTo(bx+bw,top+bh-12);c.quadraticCurveTo(bx+bw,top+bh,bx+bw-12,top+bh);
  c.lineTo(tipX+9,top+bh);c.lineTo(tipX,top+bh+11);c.lineTo(tipX-5,top+bh);
  c.lineTo(bx+12,top+bh);c.quadraticCurveTo(bx,top+bh,bx,top+bh-12);
  c.lineTo(bx,top+12);c.quadraticCurveTo(bx,top,bx+12,top);c.closePath();c.fill();c.stroke();
  c.fillStyle=fg;c.fillText(text,bx+bw/2,top+bh/2,bw-18);c.restore();
}
function drawScene(cv,S,t){
  const{c,w,h}=fitCv(cv);c.clearRect(0,0,w,h);
  c.save();c.translate(0,-h*.34);parkBackdrop(c,w,h*1.34,0,V.pal);c.restore();
  c.fillStyle='rgba(20,8,36,.2)';c.fillRect(0,0,w,h);
  copLights(c,w,h,t);
  const gy=h*.86,s=Math.min(h*.5/300,w*.4/190);
  const nx=V.flip?w*.62:w*.36,cxp=V.flip?w*.35:w*.63,bx=V.flip?w*.14:w*.86;
  // the motorcycle parked behind, the officer holding on, the Nehorai with his hands up
  c.save();c.translate(bx,gy-2);c.scale((V.flip?-1:1)*s*.55,s*.55);drawCopBikeSide(c,t);c.restore();
  c.save();c.translate(cxp,gy);c.scale((V.flip?1:-1)*s,s);drawCopFigure(c,t,1.22+Math.sin(t*2)*.04);c.restore();
  c.save();c.translate(nx,gy);c.scale(s,s);c.rotate(V.tilt);
  drawNeho(c,{...state.look,mood:'dizzy',dog:'none'},0,{armL:2.5,armR:-2.5,legL:0,legR:0});c.restore();
  if(V.dog){c.save();c.translate(nx-70*s,gy);c.scale(s*.7,s*.7);drawDog(c,'pitbull',t);c.restore();}
  // someone from the park always stops to watch
  const headTop=gy-300*s; // the Nehorai and the officer are both 300 units tall
  if(V.watcher){const wx=w*(V.flip?.86:.12);c.save();c.translate(wx,gy-h*.02);c.scale(s*.55,s*.55);drawNeho(c,{...V.watcher.look,dog:'none',name:''},t);c.restore();
    bubble(c,wx,gy-h*.02-300*s*.55,V.watcher.line,'#FFFFFF',INK,V.flip?1:-1);}
  bubble(c,nx,headTop,V.neho,'#FFF4DC',INK,V.flip?1:-1);
  bubble(c,cxp,headTop-46,V.cop,'#2F6FD0','#FFFFFF',V.flip?-1:1);
  // the ticket, with what it was written for
  const tw=Math.min(w*.3,124),th=96,tx=V.flip?w-tw-w*.04:w*.04,ty=h-44-th;
  c.save();c.translate(tx,ty);c.rotate(V.flip?.07:-.07);c.strokeStyle=INK;c.lineWidth=3;
  rr(c,0,0,tw,th,8);c.fillStyle='#FFF4DC';c.fill();c.stroke();
  c.fillStyle='#C0392B';c.fillRect(0,0,tw,10);
  c.fillStyle=INK;c.font=`15px ${FONT}`;c.textAlign='right';c.direction='rtl';c.textBaseline='middle';
  c.fillText('דו״ח',tw-10,28);
  c.font=`13px ${FONT}`;
  [[`${S.people+S.kids+S.seniors} אנשים`,52],[`${S.dogs+S.cats+S.pigeons} חיות`,72]].forEach(([txt,y])=>c.fillText(txt,tw-10,y,tw-18));
  c.restore();
  // police tape across the bottom
  const by=h-26;c.save();c.strokeStyle=INK;c.lineWidth=2;c.fillStyle=GOLD;c.fillRect(0,by,w,24);c.strokeRect(0,by,w,24);
  c.fillStyle=INK;c.font=`13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';
  for(let x=0;x<w+140;x+=140)c.fillText('משטרה · אין מעבר',x,by+13);
  c.restore();
  // a camera flash from the park's audience, now and then
  const fl=(t*.7)%3;if(fl<.12){c.save();c.globalAlpha=.5*(1-fl/.12);c.fillStyle='#FFFFFF';c.fillRect(0,0,w,h);c.restore();}
}
function showBust(S,next){
  onNext=next;V=roll();
  const victims=S.people+S.kids+S.seniors+S.dogs+S.cats+S.pigeons;
  $('#bustLine').textContent=`דרסת ${victims} נפשות בפארק. הניידת תפסה אותך, המירוץ נגמר, ואפס נקודות.`;
  $('#bust').classList.add('on');
  cancelAnimationFrame(raf);
  const cv=$('#bustCv'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,t0=performance.now();
  const f=now=>{if(!$('#bust').classList.contains('on'))return;drawScene(cv,S,reduce?0:(now-t0)/1000);if(!reduce)raf=requestAnimationFrame(f);};
  requestAnimationFrame(f);
}
$('#bustNext').onclick=()=>{cancelAnimationFrame(raf);$('#bust').classList.remove('on');if(onNext)onNext();};

export { showBust };

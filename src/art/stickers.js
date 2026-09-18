// Vehicle stickers and the hamsa.
import { FONT, INK } from '../core/util.js';
import { rr, shade } from '../core/draw.js';

function hamsaShapes(c,stroke){
  const f=()=>{c.fill();if(stroke)c.stroke();};
  rr(c,-12,-6,24,24,9);f();rr(c,-11,-21,6,18,3);f();rr(c,-3,-24,6,21,3);f();rr(c,5,-21,6,18,3);f();
  c.save();c.translate(-13,4);c.rotate(-.55);rr(c,-3,-9,6,15,3);f();c.restore();
  c.save();c.translate(13,4);c.rotate(.55);rr(c,-3,-9,6,15,3);f();c.restore();
}
function drawHamsa(c,h){
  const s=h/46;c.save();c.scale(s,s);c.lineJoin='round';
  c.fillStyle='#FFFFFF';c.strokeStyle='#FFFFFF';c.lineWidth=6;hamsaShapes(c,true);
  c.fillStyle='#1F5FD0';hamsaShapes(c,false);
  c.beginPath();c.ellipse(0,7,7,4.2,0,0,7);c.fillStyle='#fff';c.fill();
  c.beginPath();c.arc(0,7,2.6,0,7);c.fillStyle='#3DA5FF';c.fill();c.beginPath();c.arc(0,7,1.2,0,7);c.fillStyle=INK;c.fill();
  c.restore();
}
function drawSticker(c,st,x,y,w,h,rot){
  c.save();c.translate(x,y);c.rotate(rot||0);
  if(st.kind==='hamsa'){drawHamsa(c,Math.min(h*1.5,w*.9));c.restore();return;}
  rr(c,-w/2,-h/2,w,h,Math.min(4,h*.25));c.fillStyle=st.bg;c.fill();c.lineWidth=Math.max(1,h*.08);c.strokeStyle=st.border||shade(st.bg,-.35);c.stroke();
  c.fillStyle=st.fg;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';
  c.font=`100px ${FONT}`;const tw=c.measureText(st.text).width/100;
  const f1=Math.min(h*.64,w*.9/tw);
  const words=st.text.split(' ');let f2=0,l1='',l2='';
  if(words.length>1){let best=1e9;for(let i=1;i<words.length;i++){const a=words.slice(0,i).join(' '),b=words.slice(i).join(' ');const m=Math.max(c.measureText(a).width,c.measureText(b).width)/100;if(m<best){best=m;l1=a;l2=b;}}f2=Math.min(h*.4,w*.9/best);}
  if(f2>f1*1.15){c.font=`${f2}px ${FONT}`;c.fillText(l1,0,-h*.2);c.fillText(l2,0,h*.24);}
  else{c.font=`${f1}px ${FONT}`;c.fillText(st.text,0,h*.05);}
  c.restore();
}

export { drawSticker };

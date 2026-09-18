// Album photo scenes (scene*), skies, filters and drawPhoto.
import { DISP, FONT, GOLD, GOLD2, HAIRDK, INK, PINK, SKIN, clamp, hash } from '../core/util.js';
import { R, circ, ell, ln, poly, rr, shade, star } from '../core/draw.js';
import { SHIRTS, STICKERS } from '../core/catalog.js';
import { drawNeho, drawNehoBack } from '../art/neho.js';
import { drawDog } from '../art/dog.js';
import { drawVehicleFront, drawVehicleRear, drawVehicleSide, tube } from '../art/vehicles.js';
import { drawSticker } from '../art/stickers.js';
import { state, vColor } from '../core/state.js';
import { HAIRC, SHIRTC } from '../race/world.js';
import { fmt } from '../race/engine.js';
import { drawAct, drawPedTop, drawRacerTop, drawStatic } from '../race/render.js';
import { ACT_NAME, HUMAN_T, VNAME } from './build.js';

const SKIES=[
 {top:'#6FCBFF',bot:'#FFE4AE',sun:'#FFF3B0',grass:'#6CC04A',hill:'#8FD07A'},
 {top:'#4B2E83',bot:'#FF9E5E',sun:'#FFD27A',grass:'#5A9E44',hill:'#7FA85E',low:true},
 {top:'#9ED8FF',bot:'#EAF7FF',sun:'#FFFFFF',grass:'#78C850',hill:'#9ADB84',clouds:true},
 {top:'#9FB0C2',bot:'#E1E6EA',sun:null,grass:'#66A84A',hill:'#86B872',clouds:true},
];
let PAL=SKIES[0];

// ---------- photo drawing helpers ----------
function drawBystander(c,v,t,fly,hurt){
  const T=v.type;c.save();if(T==='kid')c.scale(.72,.72);c.strokeStyle=INK;c.lineWidth=3;c.lineJoin='round';
  const sk=SKIN,shirt=v.shirt||'#3DA5FF',pants=T==='jogger'?'#26262E':T==='senior'?'#6B5B4B':'#3E4A6B',hair=T==='senior'?'#D8D8D8':(v.hair||HAIRDK);
  if(fly){for(const sd of[-1,1]){c.save();c.translate(sd*14,-80);c.rotate(-sd*.4);R(c,-10,0,20,66,pants);R(c,-12,62,24,12,'#2B2B35');c.restore();}}
  else{R(c,-24,-80,20,68,pants);R(c,4,-80,20,68,pants);R(c,-27,-14,24,14,'#2B2B35');R(c,3,-14,24,14,'#2B2B35');}
  if(fly){R(c,-50,-208,16,62,shirt);R(c,34,-208,16,62,shirt);R(c,-50,-222,16,14,sk);R(c,34,-222,16,14,sk);}
  else{R(c,-50,-148,16,62,shirt);R(c,34,-148,16,62,shirt);R(c,-50,-88,16,14,sk);R(c,34,-88,16,14,sk);}
  R(c,-9,-162,18,12,sk);R(c,-34,-152,68,74,shirt);
  if(T==='jogger'){c.fillStyle='#fff';c.fillRect(-30,-120,60,4);}
  if(T==='vendor'){R(c,-30,-128,60,50,'#F4F4F4');}
  R(c,-28,-214,56,56,sk);
  if(T==='senior'){R(c,-29,-206,9,24,hair);R(c,20,-206,9,24,hair);ell(c,-8,-208,9,4,'rgba(255,255,255,.5)');}
  else R(c,-29,-218,58,16,hair);
  if(T==='jogger')R(c,-29,-202,58,6,'#E02A3A');
  if(T==='vendor')R(c,-24,-238,48,22,'#FFFFFF');
  if(fly){c.save();c.lineWidth=3;for(const ex of[-12,12]){ln(c,ex-5,-199,ex+5,-190);ln(c,ex-5,-190,ex+5,-199);}c.restore();circ(c,0,-173,7,'#5A1A1A');}
  else{R(c,-15,-196,7,7,INK,1);R(c,8,-196,7,7,INK,1);ln(c,-8,-174,8,-174);}
  if(T==='senior'){c.strokeRect(-20,-200,15,11);c.strokeRect(5,-200,15,11);}
  if(hurt){R(c,-30,-212,60,12,'#FFFFFF');c.fillStyle='#E02A3A';c.fillRect(-4,-211,8,10);c.fillRect(-8,-207,16,3);poly(c,[[-52,-140],[-4,-112],[-52,-96]],'#FFFFFF');}
  c.restore();
}
function drawCatSide(c){c.save();c.strokeStyle=INK;c.lineWidth=3;const col='#F4A261';c.save();c.lineWidth=6;c.strokeStyle=col;c.beginPath();c.moveTo(-22,-20);c.quadraticCurveTo(-40,-30,-34,-50);c.stroke();c.restore();
  for(const x of[-14,-4,8,16])R(c,x,-12,5,12,col);c.beginPath();c.ellipse(0,-20,24,12,0,0,7);c.fillStyle=col;c.fill();c.stroke();
  circ(c,24,-32,12,col);poly(c,[[16,-40],[18,-52],[25,-43]],col);poly(c,[[26,-43],[32,-52],[34,-38]],col);R(c,26,-34,3,3,INK,1);c.restore();}
function drawPigeonSide(c,t){c.save();c.strokeStyle=INK;c.lineWidth=2.5;c.beginPath();c.ellipse(0,-12,14,9,0,0,7);c.fillStyle='#8E949E';c.fill();c.stroke();
  circ(c,12,-22,6,'#5E6470');poly(c,[[17,-22],[23,-20],[17,-19]],'#E0A050');const fl=Math.sin(t*25)*10;poly(c,[[-6,-16],[8,-16],[0,-30-fl]],'#A6ACB5');c.restore();}
function drawProp(c,kind){c.save();c.strokeStyle=INK;c.lineWidth=2.5;
  switch(kind){
    case 'mangal':R(c,-26,-8,52,16,'#222');c.fillStyle='#FF7A1A';c.fillRect(-22,-12,44,4);R(c,-22,8,4,16,'#444');R(c,18,8,4,16,'#444');break;
    case 'kebab':c.save();c.strokeStyle='#999';ln(c,-22,0,22,0);c.restore();for(let i=0;i<4;i++)R(c,-16+i*8,-4,6,8,'#7A3E1A');break;
    case 'cart':case 'cone':poly(c,[[-8,0],[8,0],[0,24]],'#E0A050');circ(c,0,-4,10,'#FFB3CF');break;
    case 'juggle':circ(c,0,0,8,'#FF3D8B');break;
    case 'frisbee':c.beginPath();c.ellipse(0,0,20,7,0,0,7);c.fillStyle='#FF3D8B';c.fill();c.stroke();break;
    case 'sunbathe':R(c,-24,-14,48,28,'#FFC83D');c.fillStyle='rgba(255,255,255,.6)';c.fillRect(-24,-4,48,5);break;
    case 'football':circ(c,0,0,12,'#FFFFFF');poly(c,[[0,-5],[5,-1],[3,5],[-3,5],[-5,-1]],INK,1);break;
    case 'sheshbesh':R(c,-24,-16,48,32,'#8B5A2B');R(c,-20,-12,40,24,'#E8C79A');for(let i=0;i<5;i++)poly(c,[[-19+i*8,-12],[-13+i*8,-12],[-16+i*8,-2]],i%2?'#7A2E1A':INK,1);break;
    case 'checker':circ(c,0,0,6,'#7A2E1A');break;
    case 'nargila':rr(c,-10,-4,20,26,7);c.fillStyle='rgba(61,165,255,.85)';c.fill();c.stroke();R(c,-3,-28,6,24,'#C9A15A');circ(c,0,-30,7,'#8B5A2B');break;
    case 'coal':circ(c,0,0,5,'#FF7A1A');break;
    case 'yoga':R(c,-24,-7,48,14,'#FF7FB0');break;
    case 'guitar':c.rotate(-.6);ell(c,0,8,13,16,'#B5651D');c.beginPath();c.ellipse(0,8,13,16,0,0,7);c.stroke();circ(c,0,8,4,INK,1);R(c,-2.5,-34,5,30,'#5A3A1C');break;
    default:circ(c,0,0,7,GOLD);
  }c.restore();}
const SECOND={mangal:'kebab',cart:'cone',sheshbesh:'checker',nargila:'coal',juggle:'juggle',football:'football'};
function flyPath(t,x0,y0,x1,y1,hgt){const tt=t%2.6,u=Math.min(1,tt/1.4);return{x:x0+(x1-x0)*u,y:y0+(y1-y0)*u-Math.sin(u*Math.PI)*hgt,rot:u*7.5,u};}
function orbitStars(c,x,y,r,t,n){for(let i=0;i<(n||3);i++){const a=t*5+i*2.1;star(c,x+Math.cos(a)*r,y+Math.sin(a)*r*.4,r*.35,GOLD);}}
function drawVictim(c,ped,x,y,s,rot,t){
  c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);
  if(HUMAN_T.includes(ped.type)){c.translate(0,115);drawBystander(c,ped,t,true);}
  else if(ped.type==='dog'){c.translate(0,35);drawDog(c,ped.fur==='#F2F2F2'?'pom':'pitbull',t);}
  else if(ped.type==='cat'){c.translate(0,25);drawCatSide(c);}
  else{c.translate(0,15);drawPigeonSide(c,t);}
  c.restore();
}
function phBubble(c,text,x,y,kind,w,h,avoid){
  if(!text)return null;c.save();const fs=w*.045;c.font=`${fs}px ${FONT}`;c.direction='rtl';
  let tw=c.measureText(text).width;const maxW=w*.82;let lines=[text];
  if(tw+fs*1.2>maxW){const ws=text.split(' ');let best=[text],bm=1e9;for(let i=1;i<ws.length;i++){const a=ws.slice(0,i).join(' '),b=ws.slice(i).join(' ');const m=Math.max(c.measureText(a).width,c.measureText(b).width);if(m<bm){bm=m;best=[a,b];}}lines=best;tw=bm;}
  const bw=tw+fs*1.3,bh=fs*1.45*lines.length+fs*.5;x=clamp(x,bw/2+6,w-bw/2-6);y=clamp(y,bh+8,h-12);
  if(avoid&&x-bw/2<avoid.x1&&x+bw/2>avoid.x0&&y-bh<avoid.y1+6&&y>avoid.y0-6){y=avoid.y0-14>bh+8?avoid.y0-14:Math.min(h-12,avoid.y1+bh+18);}
  const bg=kind==='me'?GOLD:kind==='opp'?PINK:'#FFFFFF',fg=kind==='opp'?'#FFFFFF':INK;
  c.fillStyle=bg;c.strokeStyle=INK;c.lineWidth=2.5;rr(c,x-bw/2,y-bh,bw,bh,Math.min(16,bh/2.2));c.fill();c.stroke();
  poly(c,[[x-8,y-2],[x+8,y-2],[x,y+10]],bg);c.fillStyle=bg;c.fillRect(x-6,y-4,12,4);
  c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';lines.forEach((l,i)=>c.fillText(l,x,y-bh+fs*.25+fs*1.45*(i+.5)+1));c.restore();
  return{x0:x-bw/2,x1:x+bw/2,y0:y-bh,y1:y+10};
}
function speedLines(c,x0,x1,y0,y1,t){c.save();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;c.lineCap='round';for(let i=0;i<8;i++){const y=y0+(y1-y0)*hash(i,3),len=40+hash(i,7)*70,x=x0+((t*520+hash(i,5)*400)%Math.max(1,x1-x0));ln(c,x,y,x+len,y);}c.restore();}
function dust(c,x0,x1,y,t,r){for(let i=0;i<7;i++){const k=((t*.9+i/7)%1),x=x0+(x1-x0)*((i/7+t*.35)%1);c.fillStyle=`rgba(217,196,154,${.7*(1-k)})`;c.beginPath();c.arc(x,y-k*r*1.5,r*(.5+k),0,7);c.fill();}}
const LIFT={scooter:44,bike:62,atv:58};
function riderSide(c,x,y,vs,t,o){
  c.save();c.translate(x,y);c.rotate(o.lean==null?-.05:o.lean);c.scale(vs,vs);
  c.save();c.translate(18,-(LIFT[o.vid]||44));c.scale(.8,.8);drawNeho(c,{...o.look,mood:o.mood},t);c.restore();
  drawVehicleSide(c,o.vid,o.color,o.wheels||'std',o.stickers||[]);c.restore();
}
function propsFly(c,ph,t,x0,y0,x1,y1,hgt,s){
  const kind=ph.kind,who=kind==='sheshbesh'?'senior':kind==='football'?'kid':kind==='cart'?'vendor':'adult';
  for(let i=0;i<2;i++){const f=flyPath(t+i*.35,x0+i*s*40,y0,x1+i*s*130,y1,hgt*(1-i*.25));drawVictim(c,{type:who,shirt:SHIRTC[(i*3+2)%8],hair:HAIRC[i%5]},f.x,f.y-60*s,s*.8,-f.rot*(i?-1:1),t);orbitStars(c,f.x,f.y-90*s,26*s,t+i,3);}
  for(let j=0;j<3;j++){const f=flyPath(t+.15*j,x0+20*s,y0-20*s,x1+j*s*90-20*s,y1-50*s,hgt*1.2);c.save();c.translate(f.x,f.y);c.rotate(f.rot*1.3);c.scale(s*1.5,s*1.5);drawProp(c,j===0?kind:(SECOND[kind]||kind));c.restore();}
}
function dateStamp(c,w,h){c.save();c.font=`${w*.05}px ${DISP}`;c.direction='ltr';c.textAlign='left';c.textBaseline='alphabetic';c.fillStyle='rgba(255,154,61,.95)';c.shadowColor='rgba(255,90,0,.8)';c.shadowBlur=6;const d=new Date();c.fillText(`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getFullYear()).slice(2)}`,w*.05,h*.95);c.restore();}

// ---------- the three camera angles ----------
function speedCam(c,w,h,ph,t){
  c.save();const m=12,Lc=Math.min(w,h)*.08;c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=4;
  [[m,m,1,1],[w-m,m,-1,1],[m,h-m,1,-1],[w-m,h-m,-1,-1]].forEach(([x,y,sx,sy])=>{c.beginPath();c.moveTo(x,y+sy*Lc);c.lineTo(x,y);c.lineTo(x+sx*Lc,y);c.stroke();});
  const fs=Math.max(11,w*.036),bx=w*.5,bw=w*.5-m-6;c.fillStyle='rgba(20,8,32,.75)';rr(c,bx,m+8,bw,fs*4.4,10);c.fill();
  c.direction='rtl';c.textAlign='right';c.textBaseline='top';c.fillStyle='#fff';c.font=`${fs}px ${FONT}`;c.fillText('מצלמת אכיפה',w-m-16,m+14);
  c.fillStyle=GOLD;c.font=`${fs*1.7}px ${DISP}`;c.fillText(`${ph.speed||42} קמ״ש`,w-m-16,m+14+fs*1.2);
  c.fillStyle='#fff';c.font=`${fs*.85}px ${FONT}`;c.fillText('מותר בשביל: 6 קמ״ש',w-m-16,m+14+fs*3.1);
  if(Math.floor(t*2)%2===0)circ(c,m+22,m+24,6,'#FF2D2D',1);c.direction='ltr';c.textAlign='left';c.fillStyle='#fff';c.font=`${fs*.9}px ${FONT}`;c.fillText('REC',m+32,m+16);
  c.restore();
}
function sky(c,w,h,hor){const g=c.createLinearGradient(0,0,0,hor);g.addColorStop(0,PAL.top);g.addColorStop(1,PAL.bot);c.fillStyle=g;c.fillRect(0,0,w,hor+1);
  if(PAL.sun)circ(c,w*.83,PAL.low?hor-h*.07:h*.1,h*.05,PAL.sun,1);
  if(PAL.clouds){c.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<3;i++){const x=w*(.14+i*.33),y=h*(.07+(i%2)*.07);[[0,0,1],[.7,.15,.75],[-.7,.18,.7]].forEach(([dx,dy,r])=>{c.beginPath();c.arc(x+dx*h*.05,y+dy*h*.05,h*.036*r,0,7);c.fill();});}}}
function bgSide(c,w,h,t,sp){
  const hor=h*.5;sky(c,w,h,hor);
  c.fillStyle=PAL.hill;c.beginPath();c.moveTo(0,hor);for(let x=0;x<=w+1;x+=w/10)c.lineTo(x,hor-h*.05-Math.sin(x/w*6+1)*h*.03);c.lineTo(w,hor);c.closePath();c.fill();
  c.strokeStyle=INK;c.lineWidth=2;const off=(t*sp*.25)%130;
  for(let x=-130+off;x<w+130;x+=130){R(c,x-3,hor-h*.03,6,h*.05,'#7A4A24',1);circ(c,x,hor-h*.07,h*.055,'#3E9657',1);circ(c,x-h*.025,hor-h*.085,h*.03,'#58B060',1);}
  c.fillStyle=PAL.grass;c.fillRect(0,hor,w,h-hor);
  c.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<5;i++)c.fillRect(0,hor+h*.02+i*h*.045,w,h*.02);
  const py=h*.74,ph=h*.16;c.fillStyle='#EBD9AC';c.fillRect(0,py,w,ph);c.fillStyle='#CBB27A';c.fillRect(0,py,w,4);c.fillRect(0,py+ph-4,w,4);
  c.fillStyle='rgba(150,120,70,.35)';const o2=(t*sp)%70;for(let x=-70+o2;x<w+70;x+=70){c.fillRect(x,py+ph*.3,6,3);c.fillRect(x+30,py+ph*.7,5,3);}
  c.strokeStyle=INK;const o3=(t*sp*1.6)%170;for(let x=-170+o3;x<w+170;x+=170){circ(c,x,h*1.0,h*.06,'#4E9A3A');circ(c,x+42,h*1.01,h*.05,'#5BAE45');}
}
function bgFront(c,w,h,t,sp){
  const hor=h*.42;sky(c,w,h,hor);c.fillStyle=PAL.grass;c.fillRect(0,hor,w,h-hor);
  c.fillStyle='#EBD9AC';c.beginPath();c.moveTo(w*.46,hor);c.lineTo(w*.54,hor);c.lineTo(w*1.08,h);c.lineTo(-w*.08,h);c.closePath();c.fill();
  c.strokeStyle='#CBB27A';c.lineWidth=4;ln(c,w*.46,hor,-w*.08,h);ln(c,w*.54,hor,w*1.08,h);
  for(let k=0;k<7;k++){const z=((k/7)+t*sp*.0035)%1,e=z*z,y=hor+e*(h-hor);c.fillStyle='rgba(150,120,70,.3)';c.fillRect(w/2-2-e*5,y,4+e*10,2+e*6);}
  const trees=[];for(let i=0;i<10;i++){const z=((i/10)+t*sp*.0035)%1;trees.push({z,side:i%2?1:-1});}trees.sort((a,b)=>a.z-b.z);
  c.strokeStyle=INK;for(const tr of trees){const e=tr.z*tr.z,x=w/2+tr.side*(w*.1+e*w*.8),y=hor+e*(h-hor),r=h*.018+e*h*.17;c.lineWidth=1+e*2.5;R(c,x-r*.12,y-r*.9,r*.24,r*.9,'#7A4A24');circ(c,x,y-r*1.15,r,'#3E9657');circ(c,x-r*.3,y-r*1.3,r*.55,'#58B060',1);}
}
// ---------- the camera angles ----------
function turboFlames(c,x,y,s,t){for(let i=0;i<3;i++){const fl=(18+Math.sin(t*40+i*2)*8)*s;poly(c,[[x,y-(10-i*8)*s],[x,y-(4-i*8)*s],[x+fl*(1.6-i*.2),y-(7-i*8)*s]],i===1?GOLD:'#FF7A1A',1);}}
function sceneSide(c,w,h,ph,t){
  const rv=ph.rv||[.5,.5,.5],tree=ph.type==='tree',sp=tree?0:(ph.speed||40)*9;bgSide(c,w,h,t,sp);
  const gy=h*.87,vs=w/420,look=state.look;let px=w*(.56+rv[0]*.1),lean=-.05,mood='win';
  if(tree){const tx=w*.16;c.strokeStyle=INK;c.lineWidth=3;R(c,tx-14,gy-h*.46,28,h*.46,'#7A4A24');circ(c,tx,gy-h*.52,h*.17,'#2F8A3A');circ(c,tx-h*.06,gy-h*.56,h*.1,'#3FA34A',1);circ(c,tx+h*.07,gy-h*.47,h*.08,'#58B060',1);
    for(let i=0;i<6;i++){const y=(t*50+i*h*.09)%(h*.5)+gy-h*.62,x=tx+Math.sin(t*2+i)*h*.08+(hash(i,2)-.5)*h*.2;ell(c,x,y,6,3,'#4FA85A');}
    px=tx+w*.36;lean=.2;mood='dizzy';}
  if(ph.type==='pass'){const ox=w*.98,sv=vs*.82;dust(c,px+w*.12,w,gy-h*.04,t,h*.04);riderSide(c,ox,gy-h*.015,sv,t,{look:ph.opp.look,vid:ph.opp.vid,color:ph.opp.color,mood:'angry',lean:0});dust(c,px+w*.2,w*.9,gy,t+.5,h*.05);}
  if(sp)speedLines(c,px+w*.2,w,h*.3,h*.82,t);
  if(ph.type==='turbo')turboFlames(c,px+118*vs,gy-26*vs,vs*2,t);
  if(look.dog!=='none'){c.save();c.translate(px+w*.33,gy-Math.abs(Math.sin(t*14))*6);c.scale(-vs*.7,vs*.7);drawDog(c,look.dog,t);c.restore();}
  if(ph.slowmo){for(let k=2;k>=1;k--){c.save();c.globalAlpha=.16*k;riderSide(c,px+k*w*.12,gy,vs,t,{look,vid:state.vid,color:vColor(),wheels:state.wheels,stickers:state.stickers,lean,mood});c.restore();}}
  riderSide(c,px,gy+Math.sin(t*20)*1.5,vs,t,{look,vid:state.vid,color:vColor(),wheels:state.wheels,stickers:state.stickers,lean,mood});
  const headY=gy-((LIFT[state.vid]||44)+4+250*.8)*vs;
  if(tree)orbitStars(c,px+18*vs,headY+30*vs,40*vs,t,4);
  let vx=w*.3,vy=h*.2;
  if(ph.type==='knock'){const f=flyPath(t,px-w*.24,gy-h*.02,w*(.05+rv[1]*.1),gy-h*.05,h*(.36+rv[2]*.14)),s=vs*.85;drawVictim(c,ph.ped,f.x,f.y-60*s,s,-f.rot*(rv[1]<.5?1:-1),t);orbitStars(c,f.x,f.y-100*s,30*s,t,3);
    if(ph.ped.balloon){const by=gy-h*.3-(t%2.6)*h*.16;c.save();c.strokeStyle='#999';c.lineWidth=1.5;ln(c,w*.3,by+18,w*.3+Math.sin(t*3)*6,by+50);c.restore();c.strokeStyle=INK;c.lineWidth=2;circ(c,w*.3,by,14,ph.ped.balloon);}
    vx=f.x+w*.05;vy=Math.min(f.y-150*s,h*.3);}
  if(ph.type==='prop')propsFly(c,ph,t,px-w*.24,gy-h*.02,w*(.05+rv[1]*.08),gy-h*.05,h*(.36+rv[2]*.12),vs*.9);
  if(ph.type==='pass'){vx=w*.85;vy=gy-h*.36;}
  const mb=phBubble(c,ph.my,px,headY-6,'me',w,h);
  if(ph.text)phBubble(c,ph.text,vx,vy,ph.type==='pass'?'opp':'ped',w,h,mb);
}
function sceneFront(c,w,h,ph,t){
  const finish=ph.type==='finish';bgFront(c,w,h,t,finish?120:(ph.speed||40)*9);
  if(finish){c.strokeStyle=INK;c.lineWidth=3;R(c,w*.08,h*.2,10,h*.36,'#2B2B35');R(c,w*.92-10,h*.2,10,h*.36,'#2B2B35');
    const by=h*.19,bh=h*.08;R(c,w*.08,by,w*.84,bh,GOLD);for(let i=0;i<24;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?INK:'#fff';c.fillRect(w*.08+i*w*.035,by+bh+j*6,w*.035,6);}
    c.fillStyle=INK;c.font=`${h*.05}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText(`קו סיום: מקום ${ph.pos}`,w/2,by+bh/2+1);}
  if(ph.type==='pass'){const sv=w/1150;dust(c,w*.18,w*.42,h*.66,t,h*.03);riderSide(c,w*.3,h*.66,sv,t,{look:ph.opp.look,vid:ph.opp.vid,color:ph.opp.color,mood:'angry',lean:0});}
  const vs=w/330,gy=h*.995,lift=LIFT[state.vid]||44;
  if(state.look.dog!=='none'){c.save();c.translate(w*.86,gy-Math.abs(Math.sin(t*14))*8);c.scale(-vs*.55,vs*.55);drawDog(c,state.look.dog,t);c.restore();}
  c.save();c.translate(w/2,gy+Math.sin(t*20)*1.5);c.scale(vs,vs);c.save();c.translate(0,-lift);c.scale(.82,.82);drawNeho(c,{...state.look,mood:'win'},t);c.restore();drawVehicleFront(c,state.vid,vColor());c.restore();
  const headY=gy-(lift+250*.82)*vs;let vx=w*.3,vy=h*.2;
  if(ph.type==='knock'){const f=flyPath(t,w*.38,h*.62,w*.1,h*.34,h*.3),s=w/820;drawVictim(c,ph.ped,f.x,f.y,s,-f.rot,t);orbitStars(c,f.x,f.y-40*s,28*s,t,3);vx=f.x+w*.1;vy=f.y-h*.12;}
  if(ph.type==='prop')propsFly(c,ph,t,w*.38,h*.66,w*.08,h*.42,h*.3,w/820);
  if(ph.type==='pass'){vx=w*.3;vy=h*.5;}
  if(finish){for(let i=0;i<34;i++){const x=hash(i,11)*w,y=(t*110+hash(i,13)*h)%h;c.save();c.translate(x,y);c.rotate(t*4+i);c.fillStyle=[GOLD,PINK,'#3DA5FF','#3DDC97','#fff'][i%5];c.fillRect(-4,-2,8,4);c.restore();}}
  else speedCam(c,w,h,ph,t);
  const mb=phBubble(c,ph.my,finish?w*.72:w/2,finish?h*.36:Math.max(h*.2,headY-6),'me',w,h);
  if(ph.text)phBubble(c,ph.text,vx,vy,ph.type==='pass'?'opp':'ped',w,h,mb);
}
function sceneSelfie(c,w,h,ph,t){
  c.save();c.translate(w/2,h/2);c.rotate(-.06);c.scale(1.14,1.14);c.translate(-w/2,-h/2);bgSide(c,w,h,t,(ph.speed||40)*4);c.restore();
  let vx=w*.26,vy=h*.4;
  if(ph.type==='pass'){const sv=w/1250;dust(c,w*.04,w*.3,h*.72,t,h*.03);riderSide(c,w*.24,h*.72,sv,t,{look:ph.opp.look,vid:ph.opp.vid,color:ph.opp.color,mood:'angry',lean:0});vy=h*.52;}
  else if(ph.type==='knock'){const f=flyPath(t,w*.42,h*.66,w*.1,h*.56,h*.3),s=w/1300;drawVictim(c,ph.ped,f.x,f.y,s,-f.rot,t);orbitStars(c,f.x,f.y-40*s,20*s,t,3);vx=f.x+w*.06;vy=f.y-h*.1;}
  else if(ph.type==='prop'){propsFly(c,ph,t,w*.4,h*.7,w*.06,h*.58,h*.25,w/1300);vy=h*.42;}
  const s=h/205,hx=w*.64,feetY=h*.42+213*s,sh=SHIRTS[state.look.shirt],armc=sh.sl==='long'?sh.c:SKIN;
  c.save();c.translate(hx,feetY);c.rotate(.05);c.scale(s,s);c.strokeStyle=INK;c.lineWidth=3;drawNeho(c,{...state.look,mood:'win'},t);
  c.save();c.translate(-50,-162);c.rotate(.95);R(c,-12,0,24,170,armc);if(sh.sl==='short')R(c,-13,0,26,34,sh.c);c.restore();c.restore();
  c.save();c.fillStyle='rgba(255,255,255,.9)';c.font=`${w*.05}px ${FONT}`;c.direction='rtl';c.textAlign='left';c.textBaseline='top';c.fillText('♥ '+(800+Math.floor((ph.rv||[.5])[0]*4000)).toLocaleString('en'),w*.05,h*.05);c.restore();
  const mb=phBubble(c,ph.my,hx-w*.05,h*.17,'me',w,h);
  if(ph.text)phBubble(c,ph.text,vx,vy,ph.type==='pass'?'opp':'ped',w,h,mb);
}
function sceneDrone(c,w,h,ph,t){
  c.fillStyle=PAL.grass;c.fillRect(0,0,w,h);const sc=w/150;
  c.fillStyle='rgba(255,255,255,.07)';const so=(t*120)%(40*sc);for(let y=-40*sc+so;y<h;y+=40*sc)c.fillRect(0,y,w,20*sc);
  const pcx=y=>w/2+Math.sin((y-t*120)/h*3)*w*.07;
  c.beginPath();for(let y=0;y<=h;y+=10)c.lineTo(pcx(y)-w*.27,y);for(let y=h;y>=0;y-=10)c.lineTo(pcx(y)+w*.27,y);c.closePath();c.fillStyle='#EBD9AC';c.fill();
  c.strokeStyle=INK;c.lineWidth=2;for(let i=0;i<6;i++){const y=((i*h/3+t*120)%(h*1.4))-h*.2,x=i%2?w*.07:w*.93;ell(c,x+6,y+8,w*.09,w*.075,'rgba(0,0,0,.18)');circ(c,x,y,w*.09,'#3E9657');circ(c,x-w*.025,y-w*.025,w*.05,'#58B060',1);}
  c.save();c.translate(pcx(h*.62),h*.62);c.scale(sc,sc);
  if(ph.type==='pass'){c.save();c.translate(-22,40);drawRacerTop(c,{look:ph.opp.look,vid:ph.opp.vid,color:ph.opp.color,lean:.12,turboT:0},t);c.restore();}
  if(ph.type==='prop'){c.save();c.translate(-38,-46);if(ph.kind==='mangal')drawStatic(c,{type:'mangal',broken:true,bt:1,sitters:3,hue:'#D62839'},t,0);else if(ph.kind==='cart')drawStatic(c,{type:'cart',broken:true},t,0);else drawAct(c,{kind:ph.kind,broken:true,bt:1,seed:2,ph:0},t);c.restore();}
  if(ph.type==='tree'){c.save();c.translate(-6,-34);drawStatic(c,{type:'tree',r:24,hue:.2},t,1);c.restore();orbitStars(c,0,-8,10,t,3);}
  if(state.look.dog!=='none'){c.save();c.translate(20,12);drawPedTop(c,{type:'dog',id:1,vx:0,vd:1,ph:t*12,fur:state.look.dog==='pom'?'#F7F2EA':'#8C7B6B'},t);c.restore();}
  drawRacerTop(c,{look:state.look,vid:state.vid,color:vColor(),lean:Math.sin(t*3)*.08,turboT:ph.type==='turbo'?1:0},t);
  if(ph.type==='knock'){const k=(t%2.6)/2.6;c.save();c.translate(-12-k*26,-24-k*44);drawPedTop(c,{...ph.ped,id:3,vx:0,vd:0,ph:0,down:true,rot:t*7},t);c.restore();}
  c.restore();
  c.save();c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=2;const cx0=w/2,cy0=h/2;ln(c,cx0-18,cy0,cx0-6,cy0);ln(c,cx0+6,cy0,cx0+18,cy0);ln(c,cx0,cy0-18,cx0,cy0-6);ln(c,cx0,cy0+6,cx0,cy0+18);
  c.strokeRect(w*.05,h*.05,w*.9,h*.9);const fs=w*.04;c.font=`${fs}px ${FONT}`;c.fillStyle='#fff';c.textBaseline='top';c.direction='rtl';c.textAlign='right';c.fillText('רחפן הפארק',w*.92,h*.07);
  c.textAlign='left';c.fillText('גובה 42 מ׳',w*.08,h*.07);c.direction='ltr';c.fillText('4K 60',w*.08,h*.9);c.strokeRect(w*.82,h*.905,w*.08,fs*.8);c.fillRect(w*.825,h*.91,w*.05,fs*.6);c.restore();
  const mb=phBubble(c,ph.my,w*.62,h*.46,'me',w,h);
  if(ph.text)phBubble(c,ph.text,w*.3,h*.3,ph.type==='pass'?'opp':'ped',w,h,mb);
}
function zoomLines(c,w,h,x0,y0,t){c.save();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;for(let i=0;i<16;i++){const a=hash(i,9)*Math.PI*2,k=((t*1.5+hash(i,4))%1),m=Math.min(w,h),r0=m*(.2+k*.6),r1=r0+m*.12;ln(c,x0+Math.cos(a)*r0,y0+Math.sin(a)*r0*.8,x0+Math.cos(a)*r1,y0+Math.sin(a)*r1*.8);}c.restore();}
function sceneRear(c,w,h,ph,t){
  bgFront(c,w,h,t,(ph.speed||40)*9);zoomLines(c,w,h,w/2,h*.42,t);
  let vx=w*.3,vy=h*.24;
  if(ph.type==='knock'){const f=flyPath(t,w*.46,h*.56,w*.2,h*.3,h*.16),s=w/1500;drawVictim(c,ph.ped,f.x,f.y,s,-f.rot,t);orbitStars(c,f.x,f.y-30*s,16*s,t,3);vx=f.x;vy=f.y-h*.08;}
  if(ph.type==='prop')propsFly(c,ph,t,w*.46,h*.58,w*.2,h*.36,h*.15,w/1500);
  if(ph.type==='pass'){const s=w/1000;c.save();c.translate(w*.68,h*.62);c.scale(s,s);drawVehicleRear(c,ph.opp.vid,ph.opp.color,'back');c.save();c.translate(0,-(LIFT[ph.opp.vid]||44));c.scale(.82,.82);drawNehoBack(c,ph.opp.look,t);c.restore();drawVehicleRear(c,ph.opp.vid,ph.opp.color,'front');c.restore();vx=w*.7;vy=h*.4;}
  if(ph.type==='turbo'){for(let i=0;i<3;i++){const s=w/330;poly(c,[[w/2-18*s+i*12*s,h*.93],[w/2-10*s+i*12*s,h*.93],[w/2-14*s+i*12*s,h*.93+(20+Math.sin(t*40+i)*8)*s]],i===1?GOLD:'#FF7A1A',1);}}
  const vs=w/330,gy=h*.995,lift=LIFT[state.vid]||44;
  if(state.look.dog!=='none'){c.save();c.translate(w*.82,gy-Math.abs(Math.sin(t*14))*8);c.scale(vs*.5,vs*.5);drawDog(c,state.look.dog,t);c.restore();}
  c.save();c.translate(w/2,gy+Math.sin(t*20)*1.5);c.rotate(Math.sin(t*2)*.03);c.scale(vs,vs);drawVehicleRear(c,state.vid,vColor(),'back');c.save();c.translate(0,-lift);c.scale(.82,.82);drawNehoBack(c,state.look,t);c.restore();drawVehicleRear(c,state.vid,vColor(),'front',state.stickers);c.restore();
  const mb=phBubble(c,ph.my,w*.64,gy-(lift+250*.82)*vs-6,'me',w,h);
  if(ph.text)phBubble(c,ph.text,vx,vy,ph.type==='pass'?'opp':'ped',w,h,mb);
}
function sceneCCTV(c,w,h,ph,t){
  const tq=Math.floor(t*6)/6;c.save();c.translate(w*.5,h*.5);c.scale(.92,.92);c.rotate(.04);c.translate(-w*.5,-h*.5);c.fillStyle='#222';c.fillRect(-w,-h,w*3,h*3);sceneSide(c,w,h,ph,tq);c.restore();
  applyFx(c,w,h,'bw');c.save();c.fillStyle='rgba(0,0,0,.2)';for(let y=0;y<h;y+=4)c.fillRect(0,y,w,1.6);
  c.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<60;i++)c.fillRect(hash(i,Math.floor(t*12))*w,hash(i+99,Math.floor(t*12))*h,2,2);
  const fs=w*.04;c.font=`${fs}px ${FONT}`;c.fillStyle='#fff';c.textBaseline='top';c.direction='ltr';c.textAlign='left';c.fillText('CAM 03',w*.05,h*.04);
  const d=new Date(),ss=Math.floor(t)%60;c.fillText(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(ss).padStart(2,'0')}`,w*.05,h*.04+fs*1.3);
  c.direction='rtl';c.textAlign='right';c.fillText('מצלמת אבטחה, פארק העירוני',w*.95,h*.04);if(Math.floor(t*2)%2===0)circ(c,w*.93,h*.04+fs*1.9,fs*.35,'#FF2D2D',1);c.restore();
}
function scenePhone(c,w,h,ph,t){
  bgSide(c,w,h,t*.3,20);c.fillStyle='rgba(20,10,30,.5)';c.fillRect(0,0,w,h);
  const pw=w*.68,phh=h*.86,px=(w-pw)/2,py=h*.04;c.strokeStyle=INK;c.lineWidth=3;
  R(c,px+pw*.55,py+phh*.74,pw*.5,phh*.4,SKIN);
  rr(c,px,py,pw,phh,pw*.1);c.fillStyle='#111';c.fill();c.stroke();
  const sx=px+pw*.05,sy=py+phh*.035,sw=pw*.9,sh=phh*.93;
  c.save();rr(c,sx,sy,sw,sh,pw*.07);c.clip();c.translate(sx,sy);(ph.inner==='front'?sceneFront:sceneSide)(c,sw,sh,ph,t);
  const fs=sw*.05;c.font=`${fs}px ${FONT}`;c.textBaseline='top';c.direction='ltr';c.textAlign='left';circ(c,sw*.08,sh*.05,fs*.35,'#FF2D2D',1);c.fillStyle='#fff';c.fillText(`0:${String(Math.floor(t)%60+3).padStart(2,'0')}`,sw*.12,sh*.035);
  for(let i=0;i<5;i++){const k=((t*.7+i/5)%1);c.globalAlpha=1-k;c.font=`${fs*1.3}px ${FONT}`;c.fillText('❤',sw*.86+Math.sin(t*3+i)*8,sh*(.9-k*.5));}c.globalAlpha=1;
  const com=['🔥🔥🔥','אחי מה זה','מישהו מצלם?','חחחחחח','תשלחו לחדשות','זה הדוד שלי'];c.direction='rtl';c.textAlign='right';c.font=`${fs*.9}px ${FONT}`;
  for(let i=0;i<3;i++){const idx=(Math.floor(t*1.2)+i+Math.floor((ph.rv||[0])[0]*6))%com.length,y=sh*(.72+i*.075);c.fillStyle='rgba(0,0,0,.45)';const tw=c.measureText(com[idx]).width;rr(c,sw*.95-tw-fs*.8,y-fs*.2,tw+fs*.8,fs*1.3,fs*.5);c.fill();c.fillStyle='#fff';c.fillText(com[idx],sw*.95-fs*.4,y);}
  c.restore();R(c,px+pw*.88,py+phh*.58,pw*.16,phh*.07,SKIN);R(c,px-pw*.06,py+phh*.5,pw*.14,phh*.06,SKIN);
}
function headlineFor(ph){const n=state.name;
  if(ph.type==='knock')return `${n} דרס ${VNAME[ph.ped.type]} בפארק`;if(ph.type==='pass')return `${n} עקף את ${ph.opp.name} בשביל הליכה`;
  if(ph.type==='prop')return `${ACT_NAME[ph.kind]||'אירוע'} נהרס באמצע הפארק`;if(ph.type==='tree')return `${n} נכנס בעץ. העץ בסדר`;return `${n} נמדד במהירות שיא בפארק`;}
function sceneNews(c,w,h,ph,t){
  c.fillStyle='#15151B';c.fillRect(0,0,w,h);const sx=w*.03,sy=h*.03,sw=w*.94,sh=h*.72;
  c.save();c.beginPath();c.rect(sx,sy,sw,sh);c.clip();c.translate(sx,sy);sceneSide(c,sw,sh,{...ph,my:null,text:null},t);c.restore();
  const fs=w*.045;c.save();c.textBaseline='middle';
  c.fillStyle='#E02A3A';rr(c,sx+w*.03,sy+h*.03,w*.2,fs*1.5,4);c.fill();c.fillStyle='#fff';c.font=`${fs*.8}px ${FONT}`;c.textAlign='center';c.direction='rtl';c.fillText('שידור חי',sx+w*.13,sy+h*.03+fs*.75);
  c.textAlign='right';c.font=`${fs*.9}px ${DISP}`;c.fillStyle='rgba(255,255,255,.9)';c.fillText('ערוץ הפארק',sx+sw-w*.03,sy+h*.05);
  const ly=sy+sh-h*.02;R(c,sx,ly,sw*.3,h*.07,'#E02A3A',1);c.fillStyle='#fff';c.font=`${fs}px ${FONT}`;c.textAlign='center';c.fillText('מבזק',sx+sw*.85,ly+h*.035);
  c.fillStyle='#E02A3A';c.fillRect(sx+sw*.7,ly,sw*.3,h*.07);c.fillStyle='#fff';c.fillText('מבזק',sx+sw*.85,ly+h*.035);c.fillStyle='#FFFFFF';c.fillRect(sx,ly,sw*.7,h*.07);
  c.fillStyle=INK;let hf=fs*1.05;c.font=`${hf}px ${FONT}`;const hl=headlineFor(ph);const mw=sw*.66;const tw=c.measureText(hl).width;if(tw>mw){hf*=mw/tw;c.font=`${hf}px ${FONT}`;}c.textAlign='right';c.fillText(hl,sx+sw*.68,ly+h*.035);
  const S=ph.S||{},tick=`   ◆   עדכון: ${S.people||0} אנשים, ${S.kids||0} ילדים ו-${S.pigeons||0} יונים נפגעו היום בפארק   ◆   העירייה שוקלת לאסור קורקינטים   ◆   ${state.name} סירב להגיב`;
  const ty=h*.9;c.fillStyle='#FFC83D';c.fillRect(0,ty,w,h*.07);c.fillStyle=INK;c.font=`${fs*.85}px ${FONT}`;c.textAlign='left';c.direction='rtl';const tw2=c.measureText(tick).width;const ox=w-((t*60)%(tw2+w));c.fillText(tick,ox,ty+h*.035);c.restore();
}
function sceneHero(c,w,h,ph,t){
  const hor=h*.9;sky(c,w,h,hor);c.fillStyle=PAL.grass;c.fillRect(0,hor,w,h-hor);
  for(let i=0;i<4;i++){c.fillStyle=`rgba(255,240,200,${.25-i*.05})`;circ(c,w*(.82-i*.14),h*(.1+i*.09),h*(.05-i*.008),`rgba(255,240,200,${.3-i*.06})`,1);}
  let vx=w*.3,vy=h*.18;
  if(ph.type==='knock'){const k=(t%2.6)/2.6,x=w*1.1-k*w*1.3,y=h*.22+Math.sin(k*Math.PI)*-h*.06,s=w/700;drawVictim(c,ph.ped,x,y,s,t*5,t);orbitStars(c,x,y-40*s,20*s,t,3);vx=clamp(x,w*.2,w*.8);vy=y-h*.07;}
  if(ph.type==='prop')propsFly(c,ph,t,w*.9,h*.4,w*.1,h*.3,h*.15,w/900);
  if(ph.type==='pass'){const s=w/1300;riderSide(c,w*.14,h*.9,s,t,{look:ph.opp.look,vid:ph.opp.vid,color:ph.opp.color,mood:'angry',lean:0});vx=w*.2;vy=h*.7;}
  const vs=w/250,gy=h*1.12;c.save();c.translate(w/2,gy);c.scale(vs,vs*1.1);c.save();c.translate(0,-(LIFT[state.vid]||44));c.scale(.82,.82);drawNeho(c,{...state.look,mood:'win'},t);c.restore();drawVehicleFront(c,state.vid,vColor());c.restore();
  const mb=phBubble(c,ph.my,w*.7,h*.12,'me',w,h);
  if(ph.text)phBubble(c,ph.text,vx,vy,ph.type==='pass'?'opp':'ped',w,h,mb);
}
function sceneMirror(c,w,h,ph,t){
  bgFront(c,w,h,t,(ph.speed||40)*9);
  const ol=ph.opp?ph.opp.look:state.look,sh=SHIRTS[ol.shirt],sl=sh.sl==='long'?sh.c:SKIN;c.strokeStyle=INK;c.lineWidth=3;
  R(c,w*.02,h*.9,w*.18,h*.12,sl);R(c,w*.8,h*.9,w*.18,h*.12,sl);R(c,-10,h*.86,w+20,h*.035,'#15151B');R(c,w*.06,h*.83,w*.12,h*.08,SKIN);R(c,w*.82,h*.83,w*.12,h*.08,SKIN);
  const mx=w*.66,my=h*.3,mrx=w*.27,mry=h*.15;tube(c,[w*.88,h*.86],[mx+mrx*.55,my+mry*.7],'#2A2A33',8);
  c.save();c.beginPath();c.ellipse(mx,my,mrx,mry,-.08,0,7);c.clip();c.translate(mx-mrx,my-mry);const iw=mrx*2,ih=mry*2;bgFront(c,iw,ih,t,220);
  const s=iw/300;c.save();c.translate(iw/2+Math.sin(t*2)*iw*.05,ih*1.08);c.scale(s,s);c.save();c.translate(0,-(LIFT[state.vid]||44));c.scale(.82,.82);drawNeho(c,{...state.look,mood:'win'},t);c.restore();drawVehicleFront(c,state.vid,vColor());c.restore();
  c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.ellipse(iw*.3,ih*.25,iw*.25,ih*.08,-.4,0,7);c.fill();c.restore();
  c.save();c.lineWidth=8;c.strokeStyle='#15151B';c.beginPath();c.ellipse(mx,my,mrx,mry,-.08,0,7);c.stroke();c.restore();
  c.save();c.font=`${w*.028}px ${FONT}`;c.fillStyle='#fff';c.textAlign='center';c.direction='rtl';c.lineWidth=3;c.strokeStyle=INK;const tx='האובייקטים במראה קרובים יותר ממה שנראה';c.strokeText(tx,mx,my+mry+h*.04);c.fillText(tx,mx,my+mry+h*.04);c.restore();
  const mb=phBubble(c,ph.my,mx,my-mry*.1,'me',w,h);
  if(ph.text)phBubble(c,ph.text,w*.3,h*.72,'opp',w,h,mb);
}
function portrait(c,cx0,headY,s,look,t,mood){c.save();c.translate(cx0,headY+213*s);c.scale(s,s);drawNeho(c,{...look,mood},t);c.restore();}
function sceneWanted(c,w,h,ph,t){
  c.fillStyle='#4A3322';c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<h;y+=h/7)c.fillRect(0,y,w,3);
  c.save();c.translate(w/2,h/2);c.rotate(-.025);c.translate(-w/2,-h/2);
  const x0=w*.07,y0=h*.04,x1=w*.93,y1=h*.96,pts=[];for(let i=0;i<=12;i++)pts.push([x0+(x1-x0)*i/12,y0+(hash(i,1)-.5)*8]);for(let i=0;i<=14;i++)pts.push([x1+(hash(i,2)-.5)*8,y0+(y1-y0)*i/14]);for(let i=12;i>=0;i--)pts.push([x0+(x1-x0)*i/12,y1+(hash(i,3)-.5)*8]);for(let i=14;i>=0;i--)pts.push([x0+(hash(i,4)-.5)*8,y0+(y1-y0)*i/14]);
  c.strokeStyle='#6B4B2E';c.lineWidth=2;poly(c,pts,'#EAD6A8');circ(c,x0+14,y0+14,5,'#777');circ(c,x1-14,y0+14,5,'#777');
  c.fillStyle='#5A2E12';c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.font=`${h*.12}px ${DISP}`;c.fillText('מבוקש',w/2,h*.12);
  c.font=`${h*.032}px ${FONT}`;c.fillText('חי או על קורקינט',w/2,h*.2);
  const fx=w*.22,fy=h*.24,fw=w*.56,fh=h*.36;c.strokeStyle='#5A2E12';c.lineWidth=4;R(c,fx,fy,fw,fh,'#D8C08E');c.save();c.beginPath();c.rect(fx,fy,fw,fh);c.clip();portrait(c,w/2,fy+fh*.34,fh/180,state.look,0,null);c.restore();c.strokeRect(fx,fy,fw,fh);
  c.fillStyle='#5A2E12';c.font=`${h*.07}px ${DISP}`;c.fillText(state.name,w/2,h*.67);
  const S=ph.S||{};c.font=`${h*.03}px ${FONT}`;c.fillText(`על דריסת ${S.people||0} אנשים, ${S.kids||0} ילדים ו-${(S.dogs||0)+(S.cats||0)+(S.pigeons||0)} חיות`,w/2,h*.74);
  c.fillText(`והרס של ${(S.mangal||0)+(S.acts||0)} אירועים משפחתיים בפארק`,w/2,h*.785);
  c.font=`${h*.05}px ${DISP}`;c.fillText('פרס: 20 ש״ח ושווארמה בלאפה',w/2,h*.86);c.restore();
  applyFx(c,w,h,'vintage');
}
function sceneNewspaper(c,w,h,ph,t){
  c.fillStyle='#6B4B2E';c.fillRect(0,0,w,h);c.save();c.translate(w/2,h/2);c.rotate(.035);c.translate(-w/2,-h/2);
  c.fillStyle='rgba(0,0,0,.3)';c.fillRect(w*.08,h*.05,w*.88,h*.92);c.fillStyle='#F4F0E6';c.fillRect(w*.06,h*.03,w*.88,h*.92);
  c.fillStyle=INK;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.font=`${h*.08}px ${DISP}`;c.fillText('ידיעות הפארק',w/2,h*.09);
  c.fillRect(w*.1,h*.135,w*.8,2);c.font=`${h*.022}px ${FONT}`;const d=new Date();c.fillText(`גיליון מיוחד, ${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`,w/2,h*.155);c.fillRect(w*.1,h*.172,w*.8,1);
  let hf=h*.06;c.font=`${hf}px ${FONT}`;const hl=`${state.name} השתולל בפארק`;const tw=c.measureText(hl).width;if(tw>w*.8){hf*=w*.8/tw;c.font=`${hf}px ${FONT}`;}c.fillText(hl,w/2,h*.22);
  const S=ph.S||{},v=(S.people||0)+(S.kids||0)+(S.seniors||0)+(S.dogs||0)+(S.cats||0)+(S.pigeons||0);c.font=`${h*.026}px ${FONT}`;c.fillText(`${v} נפגעים, ${(S.mangal||0)+(S.acts||0)} אירועים הרוסים ועץ אחד בהלם`,w/2,h*.27);
  const fx=w*.1,fy=h*.3,fw=w*.8,fh=h*.38;c.save();c.beginPath();c.rect(fx,fy,fw,fh);c.clip();c.translate(fx,fy);const inner=ph.innerPh||{type:'cruise',angle:'side',speed:40};const keep=PAL;PAL=SKIES[inner.pal||0];sceneSide(c,fw,fh,inner,1.0);PAL=keep;applyFx(c,fw,fh,'bw');c.restore();c.strokeStyle=INK;c.lineWidth=1.5;c.strokeRect(fx,fy,fw,fh);
  c.font=`${h*.02}px ${FONT}`;c.fillStyle='#444';c.fillText('בתמונה: רגע השיא, מתוך סרטון של עובר אורח',w/2,h*.7);
  c.fillStyle='#B8B2A6';for(let col=0;col<3;col++)for(let i=0;i<9;i++){const x=w*.1+col*w*.275,y=h*.74+i*h*.022;c.fillRect(x,y,w*.25*(i===8?.6:1),h*.008);}
  c.restore();
}
function sceneMugshot(c,w,h,ph,t){
  c.fillStyle='#C9CED6';c.fillRect(0,0,w,h);c.fillStyle='#8A93A0';c.strokeStyle='#8A93A0';c.lineWidth=2;c.font=`${h*.025}px ${FONT}`;c.textBaseline='middle';c.direction='ltr';
  for(let k=0;k<8;k++){const y=h*.08+k*h*.1;ln(c,0,y,w,y);c.textAlign='left';c.fillText(String(200-k*10),w*.02,y-h*.018);c.textAlign='right';c.fillText(String(200-k*10),w*.98,y-h*.018);}
  const s=h/260;portrait(c,w/2,h*.2,s,state.look,t,'angry');
  const bx=w*.16,by=h*.64,bw=w*.68,bh=h*.22;c.strokeStyle=INK;c.lineWidth=3;R(c,bx,by,bw,bh,'#111');
  const num=4000+Math.floor(((ph.rv||[.3])[0])*5000);c.fillStyle='#fff';c.textAlign='center';c.direction='rtl';c.font=`${h*.03}px ${FONT}`;c.fillText('משטרת הפארק',w/2,by+bh*.2);
  c.font=`${h*.07}px ${DISP}`;c.fillText(state.name,w/2,by+bh*.52);c.direction='ltr';c.font=`${h*.035}px ${FONT}`;c.fillText(String(num),w/2,by+bh*.83);
  const k=t%2.6;if(k<.12){c.fillStyle=`rgba(255,255,255,${.9-k*7})`;c.fillRect(0,0,w,h);}
}
function sceneGroup(c,w,h,ph,t){
  bgSide(c,w,h,0,0);const s=w/560,gy=h*.9,vs=ph.victims||[];
  const slots=[-.36,.36,-.18,.18].slice(0,vs.length);
  vs.forEach((v,i)=>{const x=w/2+slots[i]*w*1.1,y=gy-(i>1?h*.06:0);c.save();c.translate(x,y);
    if(HUMAN_T.includes(v.type)){c.scale(s*1.25,s*1.25);drawBystander(c,v,t,false,true);}
    else if(v.type==='dog'){c.scale(s*1.4,s*1.4);drawDog(c,v.fur==='#F2F2F2'?'pom':'pitbull',t);c.fillStyle='#fff';c.strokeStyle=INK;c.lineWidth=2;R(c,24,-70,26,7,'#FFFFFF');}
    else if(v.type==='cat'){c.scale(s*1.6,s*1.6);drawCatSide(c);R(c,14,-40,20,6,'#FFFFFF');}
    else{c.scale(s*2,s*2);drawPigeonSide(c,t);R(c,6,-28,12,4,'#FFFFFF');}
    c.restore();});
  c.save();c.translate(w/2,gy+h*.02);c.scale(s*1.45,s*1.45);drawNeho(c,{...state.look,mood:'win'},t);R(c,42,-230,22,34,SKIN);R(c,48,-252,10,24,SKIN);c.restore();
  if(state.look.dog!=='none'){c.save();c.translate(w*.5-w*.16,gy+h*.02);c.scale(s,s);drawDog(c,state.look.dog,t);c.restore();}
  phBubble(c,ph.my||"צ'יז!",w/2,h*.2,'me',w,h);
}
function scenePodium(c,w,h,ph,t){
  bgSide(c,w,h,t*.2,10);const order=ph.order||[],gy=h*.9,s=w/620;
  const blocks=[[1,w*.22,h*.15,'#C9CED6'],[0,w*.5,h*.23,GOLD],[2,w*.78,h*.1,'#D08A4A']];c.strokeStyle=INK;c.lineWidth=3;
  blocks.forEach(([idx,x,bh,col])=>{R(c,x-w*.14,gy-bh,w*.28,bh+h*.1,col);c.fillStyle=INK;c.font=`${h*.07}px ${DISP}`;c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.fillText(String(idx+1),x,gy-bh/2+h*.02);
    const r=order[idx];if(!r)return;c.save();c.translate(x,gy-bh);c.scale(s,s);drawNeho(c,{...r.look,mood:r.me||idx===0?'win':'angry'},t);c.restore();
    c.font=`${h*.03}px ${FONT}`;c.direction='rtl';c.fillStyle=r.me?PINK:INK;c.fillText(r.me?'אתה':r.name,x,gy-bh-h*.29);});
  const mi=order.findIndex(r=>r.me);if(mi>2){c.save();c.translate(w*.9,gy+h*.04);c.scale(s*.8,s*.8);drawNeho(c,{...state.look,mood:'angry'},t);c.restore();c.font=`${h*.028}px ${FONT}`;c.fillStyle=PINK;c.textAlign='center';c.direction='rtl';c.fillText(`אתה (${mi+1})`,w*.9,gy-h*.2);}
  for(let i=0;i<30;i++){const x=hash(i,21)*w,y=(t*100+hash(i,23)*h)%h;c.save();c.translate(x,y);c.rotate(t*4+i);c.fillStyle=[GOLD,PINK,'#3DA5FF','#3DDC97','#fff'][i%5];c.fillRect(-4,-2,8,4);c.restore();}
  if(ph.my)phBubble(c,ph.my,mi>2?w*.82:[w*.22,w*.5,w*.78][mi],mi>2?h*.6:h*.3,'me',w,h);
}
function scenePhotoFinish(c,w,h,ph,t){
  c.fillStyle='#F2EAD8';c.fillRect(0,0,w,h);const order=ph.order||[],mi=Math.max(0,order.findIndex(r=>r.me));
  const pick3=[mi-1,mi,mi+1].filter(i=>i>=0&&i<order.length).map(i=>order[i]),me=order[mi];
  c.fillStyle=INK;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.font=`${h*.05}px ${DISP}`;c.fillText('צילום פוטו פיניש',w/2,h*.06);
  const lx=w*.35;c.fillStyle='#E02A3A';c.fillRect(lx-2,h*.1,4,h*.84);
  c.strokeStyle='rgba(0,0,0,.15)';c.lineWidth=1;for(let i=0;i<=10;i++){const x=w*i/10;ln(c,x,h*.1,x,h*.94);}
  pick3.forEach((r,i)=>{const y=h*(.33+i*.28),dt=me&&r.time!=null&&me.time!=null?(r.time-me.time):0,x=lx+dt*w*.9+(r.me?0:0);
    c.strokeStyle='rgba(0,0,0,.2)';ln(c,0,y+4,w,y+4);
    c.save();c.beginPath();c.rect(0,y-h*.24,w,h*.28);c.clip();riderSide(c,x+w*.06,y,w/700,0,{look:r.look,vid:r.vid,color:r.color,wheels:r.me?state.wheels:'std',stickers:r.me?state.stickers:[],mood:r.me?'win':'angry',lean:-.03});c.restore();
    c.fillStyle=r.me?PINK:INK;c.font=`${h*.03}px ${FONT}`;c.direction='rtl';c.textAlign='right';c.fillText(`${order.indexOf(r)+1}. ${r.me?'אתה':r.name}`,w*.97,y-h*.2);
    c.direction='ltr';c.textAlign='left';c.fillStyle=INK;c.fillText(r.time!=null?fmt(r.time,true):'',w*.03,y-h*.2);});
}
function applyFx(c,w,h,fx){
  if(!fx||fx==='none')return;c.save();
  if(fx==='bw'){c.globalCompositeOperation='saturation';c.fillStyle='#808080';c.fillRect(0,0,w,h);}
  else if(fx==='vintage'){c.globalCompositeOperation='saturation';c.fillStyle='rgba(128,128,128,.65)';c.fillRect(0,0,w,h);c.globalCompositeOperation='multiply';c.fillStyle='rgba(255,214,160,.6)';c.fillRect(0,0,w,h);}
  else if(fx==='warm'){c.globalCompositeOperation='soft-light';c.fillStyle='rgba(255,140,40,.5)';c.fillRect(0,0,w,h);}
  c.restore();
}
const SCENES={side:sceneSide,front:sceneFront,selfie:sceneSelfie,drone:sceneDrone,rear:sceneRear,cctv:sceneCCTV,phone:scenePhone,news:sceneNews,hero:sceneHero,mirror:sceneMirror,
  wanted:sceneWanted,newspaper:sceneNewspaper,mugshot:sceneMugshot,group:sceneGroup,podium:scenePodium,photofinish:scenePhotoFinish};
const NO_STAMP=['news','newspaper','wanted','mugshot','cctv','phone','photofinish'];
function drawPhoto(c,w,h,ph,t){
  c.save();c.beginPath();c.rect(0,0,w,h);c.clip();PAL=SKIES[ph.pal||0];
  (SCENES[ph.angle]||sceneSide)(c,w,h,ph,t);applyFx(c,w,h,ph.fx);
  const g=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(40,10,40,.28)');c.fillStyle=g;c.fillRect(0,0,w,h);
  if(!NO_STAMP.includes(ph.angle))dateStamp(c,w,h);c.restore();
}

// ---------- extra photo types ----------
function hudText(c,txt,x,y,fs,align,col){c.save();c.font=`${fs}px ${FONT}`;c.direction='rtl';c.textAlign=align||'right';c.textBaseline='top';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.6)';c.strokeText(txt,x,y);c.fillStyle=col||'#fff';c.fillText(txt,x,y);c.restore();}
function wrapLines(c,text,maxW){const ws=text.split(' '),out=[];let cur='';for(const wd of ws){const tr=cur?cur+' '+wd:wd;if(c.measureText(tr).width>maxW&&cur){out.push(cur);cur=wd;}else cur=tr;}if(cur)out.push(cur);return out;}
function drawInner(c,x,y,w,h,ph,t,angle){c.save();c.translate(x,y);c.beginPath();c.rect(0,0,w,h);c.clip();(SCENES[angle]||sceneSide)(c,w,h,ph,t);c.restore();}
function riderBack2(c,x,y,s,t,o){c.save();c.translate(x,y);c.scale(s,s);drawVehicleRear(c,o.vid,o.color,'back');c.save();c.translate(0,-(LIFT[o.vid]||44));c.scale(.82,.82);drawNehoBack(c,o.look,t);c.restore();drawVehicleRear(c,o.vid,o.color,'front',o.stickers||[]);c.restore();}

function sceneGopro(c,w,h,ph,t){
  bgFront(c,w,h,t,(ph.speed||40)*12);let vx=w*.3,vy=h*.2;
  if(ph.type==='knock'){const f=flyPath(t,w*.52,h*.62,w*.22,h*.28,h*.2),s=w/650;drawVictim(c,ph.ped,f.x,f.y,s,-f.rot,t);orbitStars(c,f.x,f.y-40*s,24*s,t,3);vx=f.x+w*.08;vy=f.y-h*.08;}
  if(ph.type==='prop')propsFly(c,ph,t,w*.5,h*.66,w*.2,h*.36,h*.22,w/650);
  if(ph.type==='pass'){riderBack2(c,w*.9,h*1.02,w/420,t,{look:ph.opp.look,vid:ph.opp.vid,color:ph.opp.color});vx=w*.72;vy=h*.3;}
  const by=h*.86,S=SHIRTS[state.look.shirt],arm=S.sl==='long'?S.c:SKIN;
  c.save();c.strokeStyle=INK;c.lineWidth=3;R(c,w*.46,by,w*.08,h*.2,vColor());
  rr(c,w*.39,by-h*.09,w*.22,h*.08,8);c.fillStyle='#111';c.fill();c.stroke();c.fillStyle='#3DF5FF';c.font=`${h*.05}px ${DISP}`;c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.fillText(String(ph.speed||40),w*.5,by-h*.048);
  const st=STICKERS.find(q=>q.id===state.stickers[0]);if(st)drawSticker(c,st,w*.5,by+h*.07,w*.075,h*.03,0);
  c.lineCap='round';c.lineWidth=h*.04;c.strokeStyle=INK;c.beginPath();c.moveTo(w*.02,by+h*.04);c.quadraticCurveTo(w*.5,by-h*.03,w*.98,by+h*.04);c.stroke();c.lineWidth=h*.028;c.strokeStyle='#2A2A33';c.stroke();
  c.lineWidth=3;c.strokeStyle=INK;for(const sx of[-1,1]){const hx=w/2+sx*w*.38;R(c,hx-w*.075,by-h*.015,w*.15,h*.1,SKIN);c.fillStyle=shade(SKIN,-.15);for(let k=0;k<3;k++)c.fillRect(hx-w*.06+k*w*.04,by+h*.01,2,h*.05);R(c,hx-w*.08,by+h*.085,w*.16,h*.12,arm);}
  c.restore();
  const g=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.4,w/2,h/2,Math.max(w,h)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.85)');c.fillStyle=g;c.fillRect(0,0,w,h);
  hudText(c,'מצלמת קסדה',w*.94,h*.04,w*.042);if(Math.floor(t*2)%2===0)circ(c,w*.08,h*.06,w*.018,'#FF2D2D',1);
  const mb=phBubble(c,ph.my,w*.62,h*.16,'me',w,h);if(ph.text)phBubble(c,ph.text,vx,vy,ph.type==='pass'?'opp':'ped',w,h,mb);
}
const BOOMS=['בום!','טראח!','בנג!','וואם!','פאו!','קראש!'];
function sceneComic(c,w,h,ph,t){
  (SCENES[ph.inner]||sceneSide)(c,w,h,ph,t);
  c.save();c.globalAlpha=.1;c.fillStyle=INK;const st=w/38;for(let y=0;y<h;y+=st)for(let x=(Math.round(y/st)%2)*st/2;x<w;x+=st){c.beginPath();c.arc(x,y,st*.2,0,7);c.fill();}c.restore();
  const bx=w*(.25+(ph.rv||[.5])[0]*.1),by=h*.58,sc=1+Math.sin(t*7)*.06;c.save();c.translate(bx,by);c.scale(sc,sc);c.rotate(-.15);const pts=[];for(let i=0;i<18;i++){const a=i*Math.PI/9,r=i%2?w*.1:w*.18;pts.push([Math.cos(a)*r,Math.sin(a)*r*.7]);}
  c.strokeStyle=INK;c.lineWidth=4;poly(c,pts,'#FFE600');const word=BOOMS[Math.floor(((ph.rv||[0,0])[1])*BOOMS.length)];c.font=`${w*.095}px ${DISP}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.lineWidth=5;c.strokeStyle='#fff';c.strokeText(word,0,2);c.fillStyle='#E02A3A';c.fillText(word,0,2);c.restore();
  c.lineWidth=w*.035;c.strokeStyle=INK;c.strokeRect(0,0,w,h);
}
const POLLS=[["דרסתי יותר מדי?","כן","ממש לא"],["מי המלך של הפארק?","אני","גם אני"],["עוד סיבוב?","ברור","יאללה"],["לקנות שרשרת עבה יותר?","חובה","אין דבר כזה"]];
function sceneStory(c,w,h,ph,t){
  (SCENES[ph.inner]||sceneSelfie)(c,w,h,ph,t);
  const g=c.createLinearGradient(0,0,0,h*.2);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h*.2);
  const n=4,gap=4,bw=(w*.9-gap*(n-1))/n;for(let i=0;i<n;i++){const x=w*.95-(i+1)*bw-i*gap;c.fillStyle='rgba(255,255,255,.4)';c.fillRect(x,h*.02,bw,3);const f=i<1?1:i===1?(t%2.6)/2.6:0;c.fillStyle='#fff';c.fillRect(x+bw*(1-f),h*.02,bw*f,3);}
  const ar=w*.055,ax=w*.95-ar,ay=h*.07;c.save();c.beginPath();c.arc(ax,ay,ar,0,7);c.clip();c.fillStyle='#FFE4AE';c.fillRect(ax-ar,ay-ar,ar*2,ar*2);portrait(c,ax,ay+ar*.1,ar/40,state.look,t,'win');c.restore();
  c.save();c.strokeStyle=PINK;c.lineWidth=3;c.beginPath();c.arc(ax,ay,ar+2,0,7);c.stroke();c.restore();
  hudText(c,`${state.name} הרשמי`,ax-ar-8,ay-w*.03,w*.038);hudText(c,'לפני 2 דק׳',ax-ar-8,ay+w*.012,w*.03,'right','rgba(255,255,255,.8)');
  const P=POLLS[Math.floor(((ph.rv||[0,0,0])[2])*POLLS.length)],pw=w*.64,px=w/2-pw/2,py=h*.63;c.save();c.fillStyle='#fff';rr(c,px,py,pw,h*.16,14);c.fill();
  c.fillStyle=INK;c.font=`${w*.042}px ${FONT}`;c.textAlign='center';c.textBaseline='top';c.direction='rtl';c.fillText(P[0],w/2,py+h*.015);
  const ob=(k,pct)=>{const oy=py+h*.065+k*h*.045;c.fillStyle='#EEE';rr(c,px+pw*.06,oy,pw*.88,h*.036,8);c.fill();c.fillStyle=k?'#DDD':GOLD;rr(c,px+pw*.94-pw*.88*pct/100,oy,Math.max(16,pw*.88*pct/100),h*.036,8);c.fill();c.fillStyle=INK;c.font=`${w*.034}px ${FONT}`;c.textAlign='right';c.fillText(`${P[k+1]}  ${pct}%`,px+pw*.9,oy+h*.006);};
  ob(0,97);ob(1,3);c.restore();
  c.save();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2;rr(c,w*.2,h*.92,w*.6,h*.05,h*.025);c.stroke();c.restore();hudText(c,'שליחת הודעה',w*.74,h*.93,w*.034);hudText(c,'♥',w*.12,h*.925,w*.06,'center');
}
function sceneMagnet(c,w,h,ph,t){
  const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#FFC9DE');g.addColorStop(1,'#FFE79A');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.font=`${w*.05}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';for(let i=0;i<14;i++){c.fillStyle=i%2?'rgba(255,61,139,.35)':'rgba(255,255,255,.7)';c.fillText('♥',hash(i,51)*w,hash(i,53)*h);}
  const m=w*.07,ih=h*.7;c.save();rr(c,m,m,w-2*m,ih,16);c.clip();drawInner(c,m,m,w-2*m,ih,ph,t,ph.inner||'side');c.restore();
  c.save();c.strokeStyle='#fff';c.lineWidth=5;rr(c,m,m,w-2*m,ih,16);c.stroke();c.restore();
  c.fillStyle='#B3316B';c.font=`${w*.085}px ${DISP}`;c.textBaseline='top';c.direction='rtl';c.fillText(`האירוע של ${state.name}`,w/2,m+ih+h*.02);
  const d=new Date();c.fillStyle='#6B2E4A';c.font=`${w*.036}px ${FONT}`;c.fillText(`${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}   פארק העיר`,w/2,m+ih+h*.105);
  c.save();c.strokeStyle=GOLD2;c.lineWidth=3;c.beginPath();c.arc(w*.14,h*.9,w*.03,0,7);c.stroke();c.beginPath();c.arc(w*.18,h*.9,w*.03,0,7);c.stroke();c.restore();
  c.fillStyle='rgba(107,46,74,.7)';c.font=`${w*.024}px ${FONT}`;c.fillText('צילום: הפקות הפארק',w/2,h*.955);
}
function sceneSlowmo(c,w,h,ph,t){sceneSide(c,w,h,{...ph,slowmo:1},t*.35);c.fillStyle='#000';c.fillRect(0,0,w,h*.07);c.fillRect(0,h*.93,w,h*.07);hudText(c,'הילוך איטי',w*.95,h*.012,w*.045);c.save();c.font=`${w*.04}px ${FONT}`;c.direction='ltr';c.textAlign='left';c.textBaseline='top';c.fillStyle='#fff';c.fillText('x0.25',w*.05,h*.015);c.restore();}
function sceneLineup(c,w,h,ph,t){
  c.fillStyle='#B9C0CB';c.fillRect(0,0,w,h);c.fillStyle='#6B7280';c.fillRect(0,h*.88,w,h*.12);
  c.strokeStyle='rgba(26,11,41,.5)';c.lineWidth=2;c.fillStyle='rgba(26,11,41,.7)';c.font=`${w*.03}px ${FONT}`;c.textAlign='left';c.direction='ltr';c.textBaseline='middle';
  for(let i=0;i<7;i++){const y=h*.88-i*h*.11;ln(c,0,y,w,y);c.fillText(String(140+i*10),w*.015,y-h*.015);}
  const L=ph.lineup||[],n=L.length||1,s=Math.min(h/410,w/(n*150));
  L.forEach((p,i)=>{const x=w*(i+.5)/n;c.save();c.translate(x,h*.9);c.scale(s,s);c.strokeStyle=INK;c.lineWidth=3;drawNeho(c,{...p.look,mood:p.isPlayer?'win':'angry'},t);
    if(p.isPlayer){R(c,-54,-150,108,46,'#111');c.fillStyle='#fff';c.font=`18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText(String(p.name).slice(0,8),0,-136);c.font=`14px ${FONT}`;c.direction='ltr';c.fillText(`0${ph.pos||1}-2026`,0,-116);}
    c.restore();c.save();c.fillStyle=INK;c.font=`${w*.05}px ${DISP}`;c.textAlign='center';c.direction='ltr';c.textBaseline='alphabetic';c.fillText(String(i+1),x,h*.975);c.restore();});
  const fl=Math.max(0,1-(t%2.6)*4);if(fl>0){c.fillStyle=`rgba(255,255,255,${fl*.8})`;c.fillRect(0,0,w,h);}
}
const COVER_LINES=["איך לדרוס עם סטייל","השרשרת הכי עבה בפארק","10 מנגלים שלא תשכחו","בלעדי: {name} מדבר","הטרנינג חוזר לאופנה","מדריך: עקיפה בלי איתות","כל האמת על הכפכפים"];
function sceneMagazine(c,w,h,ph,t){
  const bg=[PINK,'#3DA5FF','#FF7A1A','#8E44FF'][Math.floor(((ph.rv||[0])[0])*4)];c.fillStyle=bg;c.fillRect(0,0,w,h);
  const g=c.createRadialGradient(w*.6,h*.55,10,w*.6,h*.55,w*.8);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.save();c.font=`${w*.24}px ${DISP}`;c.textAlign='center';c.textBaseline='top';c.direction='rtl';c.lineWidth=6;c.strokeStyle=INK;c.strokeText('שכונה',w/2,h*.01);c.fillStyle='#fff';c.fillText('שכונה',w/2,h*.01);c.restore();
  const s=h/300;c.save();c.translate(w*.64,h*1.03);c.scale(s,s);c.strokeStyle=INK;c.lineWidth=3;drawNeho(c,{...state.look,mood:'win'},t);c.restore();
  if(state.look.dog!=='none'){c.save();c.translate(w*.92,h*.99);c.scale(-s*.8,s*.8);drawDog(c,state.look.dog,t);c.restore();}
  (ph.cover||[]).forEach((l,i)=>{const y=h*(.3+i*.13);c.save();c.font=`${w*.05}px ${FONT}`;c.direction='rtl';c.textAlign='right';c.textBaseline='top';wrapLines(c,l,w*.34).forEach((x,k)=>{c.lineWidth=4;c.strokeStyle=INK;c.strokeText(x,w*.4,y+k*w*.06);c.fillStyle=i%2?GOLD:'#fff';c.fillText(x,w*.4,y+k*w*.06);});c.restore();});
  c.save();c.translate(w*.82,h*.3);c.rotate(.2);c.strokeStyle=INK;c.lineWidth=3;circ(c,0,0,w*.1,GOLD);c.fillStyle=INK;c.font=`${w*.04}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('גיליון',0,-w*.025);c.fillText('מיוחד',0,w*.025);c.restore();
  c.fillStyle='#fff';c.fillRect(w*.04,h*.86,w*.18,h*.1);c.fillStyle=INK;for(let i=0;i<22;i++)if(hash(i,61)>.35)c.fillRect(w*.05+i*w*.0072,h*.87,w*.005,h*.07);
}
Object.assign(SCENES,{gopro:sceneGopro,comic:sceneComic,story:sceneStory,magnet:sceneMagnet,slowmo:sceneSlowmo,lineup:sceneLineup,magazine:sceneMagazine});
NO_STAMP.push('gopro','comic','story','magnet','magazine');
const INNER2={comic:['side','front','rear','drone'],story:['selfie','side','front'],magnet:['side','selfie','front']};
SKIES.push({top:'#0B1636',bot:'#3B2B5E',sun:'#F4F1D0',grass:'#2F6B30',hill:'#26404A',night:true});
const skyBase=sky;sky=function(c,w,h,hor){skyBase(c,w,h,hor);if(PAL.night){c.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<40;i++)c.fillRect(hash(i,21)*w,hash(i,23)*hor*.9,1.6,1.6);circ(c,w*.83+h*.022,h*.1-h*.014,h*.045,PAL.top,1);}};

export { drawPhoto, COVER_LINES, INNER2 };

// Garage screens: character builder, vehicle picker, vehicle design, stage composition.
import { show } from '../main.js';
import { $, FONT, INK } from '../core/util.js';
import { ell, fitCv } from '../core/draw.js';
import { COLORS, PARTS, SLOTS, STICKERS, VEH, WHEELS } from '../core/catalog.js';
import { drawNeho, drawNehoBack } from '../art/neho.js';
import { drawDog } from '../art/dog.js';
import { drawVehicleSide, drawWheel } from '../art/vehicles.js';
import { drawSticker } from '../art/stickers.js';
import { state, vColor } from '../core/state.js';
import { startRace } from '../race/engine.js';
import { Music } from '../music/engine.js';
import { setStage } from '../music/songs.js';
import { drawTrophies, toast } from '../shop/ui.js';
import { Stats } from '../core/stats.js';
import { isOpen, rarityOf } from '../core/unlocks.js';
import { track } from '../net/analytics.js';

// ================= COMPOSITION =================
function stageBg(c,w,h,gy,fx=w/2,fw=w){
  const g=c.createRadialGradient(fx,h*.22,10,fx,h*.55,Math.max(w,h)*.8);g.addColorStop(0,'#6E2FA3');g.addColorStop(1,'#2A1242');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.fillStyle='rgba(255,255,255,.05)';c.beginPath();c.moveTo(fx-30,0);c.lineTo(fx+30,0);c.lineTo(fx+fw*.38,gy);c.lineTo(fx-fw*.38,gy);c.closePath();c.fill();
  const ry=Math.max(8,h*.04);ell(c,fx,gy,fw*.4,ry,'rgba(255,200,61,.16)');c.save();c.strokeStyle='rgba(255,200,61,.45)';c.lineWidth=2;c.beginPath();c.ellipse(fx,gy,fw*.4,ry,0,0,7);c.stroke();c.restore();
}
function drawComposition(c,w,h,o){
  const t=o.t||0,gy=h*(o.floor||.93),pop=1+.06*(o.pop||0),breathe=1+Math.sin(t*2.2)*.008;
  c.clearRect(0,0,w,h); // canvases are redrawn without resizing; clear so the partly covered edge column doesn't darken with every redraw
  // o.focus={x,w}: draw the figure in that part of the stage (the background still fills everything)
  const fx=o.focus?o.focus.x:w/2,fw=o.focus?o.focus.w:w;
  stageBg(c,w,h,gy,fx,fw);if(o.trophies)drawTrophies(c,w,h,gy);
  const L=o.look,dog=L.dog&&L.dog!=='none';
  if(o.mode==='char'){
    const s=Math.min(h*.84/285,w*.9/(dog?290:160))*pop;
    const x0=w/2+(dog?40*s:0);
    if(dog){c.save();c.translate(x0-120*s,gy);c.scale(s*.95,s*.95);drawDog(c,L.dog,t);c.restore();}
    // with a back-of-the-head haircut the Nehorai turns around for 2 seconds every 6 to show it off
    const turned=BACK_HAIR.has(L.hair)&&t%6>4;
    c.save();c.translate(x0,gy);c.scale(s,s*breathe);(turned?drawNehoBack:drawNeho)(c,L,t,o.pose);c.restore();
  }else{
    // rides the rider stands on (lift) need more headroom; the original vehicles have lift 0
    const lift=(VEH[o.vid]&&VEH[o.vid].lift)||0,vs=Math.min(fw*.9/(dog?330:280),h*.86/Math.max(232,lift+232))*pop,cs=vs*.8;
    const x0=fx+(dog?28*vs:0)+fw*.05;
    const veh=()=>{c.save();c.translate(x0,gy);c.scale(vs,vs);drawVehicleSide(c,o.vid,o.color,o.wheels,o.stickers);c.restore();};
    if(VEH[o.vid]&&VEH[o.vid].behind)veh(); // wings sit behind the rider
    c.save();c.translate(x0+18*vs+(o.dx||0)*vs,gy-(4+lift)*vs);c.scale(cs,cs*breathe);drawNeho(c,L,t,o.pose);c.restore();
    if(!(VEH[o.vid]&&VEH[o.vid].behind))veh();
    if(dog){c.save();c.translate(x0-165*vs,gy);c.scale(vs*.72,vs*.72);drawDog(c,L.dog,t);c.restore();}
  }
}
let step=0,charTab='hair',designTab='stickers',pop=0,stageRAF=0;
// how many changes the player made in each step, sent with the "next" clicks. Starts over every time the garage opens
const changes=[0,0,0];
function setStep(s){step=s;changes.fill(0);}

function startStage(){cancelAnimationFrame(stageRAF);const cv=$('#stageCv');const t0=performance.now();const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f=now=>{const{c,w,h}=fitCv(cv);pop=Math.max(0,pop-.06);drawComposition(c,w,h,{floor:.88/* room between the stage floor and the panel */,trophies:true,mode:step===0?'char':'veh',look:state.look,vid:state.vid,color:vColor(),wheels:state.wheels,stickers:state.stickers,t:reduce?0:(now-t0)/1000,pop});stageRAF=requestAnimationFrame(f);};stageRAF=requestAnimationFrame(f);}
function stopStage(){cancelAnimationFrame(stageRAF);}

const BACK_HAIR=new Set(['eyal']); // haircuts whose point is the back of the head
function previewPart(cv,part,val){
  const{c,w,h}=fitCv(cv);c.clearRect(0,0,w,h);const L={...state.look,[part]:val};
  const k=Math.min(w,h)/64; // previews are tuned for 64px boxes (phone); bigger boxes (desktop) scale up
  if(part==='dog'){if(val==='none'){c.fillStyle='rgba(255,244,220,.35)';c.font=`${30*k}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('—',w/2,h/2);return;}c.save();c.translate(w/2-6*k,h*.84);c.scale(.62*k,.62*k);drawDog(c,val,0);c.restore();return;}
  const cam={hair:[-226,.55],beard:[-214,.62],cap:[-236,.5],acc:[-214,.62],chain:[-150,.62],shirt:[-128,.4],pants:[-50,.44],shoes:[-12,.7]}[part];
  // hair shaved into the back of the head is previewed from behind
  const back=part==='hair'&&BACK_HAIR.has(val);
  c.save();c.translate(w/2,h/2-cam[0]*cam[1]*k);c.scale(cam[1]*k,cam[1]*k);(back?drawNehoBack:drawNeho)(c,L,0);c.restore();
}
// rarity chip for items that unlock with career points, plus a padlock with the price while still locked
function lockChips(req,open){if(!req)return '';const r=rarityOf(req);
  return `<i class="rar" style="--rc:${r.col}">${r.name}</i>${open?'':`<i class="lock">🔒 <b>${req.toLocaleString('he-IL')}</b></i>`}`;}
function lockedToast(label,req){toast(`${label} נפתח ב-${req.toLocaleString('he-IL')} נקודות קריירה. יש לך ${Stats.career.toLocaleString('he-IL')}. יאללה למירוצים!`);}
function renderPanel(){
  if(typeof Music!=='undefined'&&Music.on&&Music.target>=3)setStage(step===0?3:4);
  document.querySelectorAll('.step').forEach(b=>{const s=+b.dataset.s;b.classList.toggle('on',s===step);b.classList.toggle('done',s<step);});
  $('#plateName').textContent=state.name;$('#plateSub').textContent=step>0?VEH[state.vid].name:'';
  const tabs=$('#tabs'),opts=$('#opts');tabs.innerHTML='';opts.innerHTML='';opts.className='opts';opts.scrollTop=0;
  const mkTab=(label,on,fn)=>{const b=document.createElement('button');b.className='tab'+(on?' on':'');b.textContent=label;b.onclick=fn;tabs.appendChild(b);if(on)requestAnimationFrame(()=>b.scrollIntoView({inline:'nearest',block:'nearest'}));};
  if(step===0){
    tabs.style.display='';
    PARTS.forEach(p=>mkTab(p.label,p.id===charTab,()=>{charTab=p.id;renderPanel();}));
    const part=PARTS.find(p=>p.id===charTab);
    part.items.forEach(([id,label,m])=>{const b=document.createElement('button'),req=m&&m.req,open=isOpen(req);b.className='opt'+(state.look[part.id]===id?' on':'')+(req?' lk':'')+(open?'':' locked');b.innerHTML=`<canvas></canvas><span>${label}</span>${lockChips(req,open)}`;
      b.onclick=()=>{if(!open){lockedToast(label,req);return;}state.look[part.id]=id;changes[0]++;pop=1;renderPanel();};opts.appendChild(b);previewPart(b.querySelector('canvas'),part.id,id);});
  }else if(step===1){
    tabs.style.display='none';opts.classList.add('cards');
    const VTAG={scooter:'הכי מהיר',bike:'הכי מאוזן',atv:'טנק של פארק',tmax:'קטנוע',bigpit:'חי ונושם',wings:'עף'};
    Object.values(VEH).forEach(v=>{const b=document.createElement('button'),sel=state.vid===v.id,open=isOpen(v.req);b.className='opt vcard'+(sel?' on':'')+(open?'':' locked');
      const bars=['מהירות','תאוצה','שליטה','עמידות'].map((n,i)=>`<div class="stat"><i>${n}</i><span class="bar">${[0,1,2,3,4].map(k=>`<u class="${k<v.st[i]?'f':''}"></u>`).join('')}</span></div>`).join('');
      b.innerHTML=`<div class="vvis"><canvas></canvas>${VTAG[v.id]?`<span class="vtag">${VTAG[v.id]}</span>`:''}${lockChips(v.req,open)}</div><div class="vinfo"><h3>${v.name}</h3><p>${v.blurb}</p>${bars}</div>`;
      b.onclick=()=>{if(!open){lockedToast(v.name,v.req);return;}if(state.vid!==v.id){changes[1]++;state.vid=v.id;state.color=null;state.stickers=state.stickers.slice(0,SLOTS[v.id].length);}pop=1;renderPanel();};
      opts.appendChild(b);const{c,w,h}=fitCv(b.querySelector('canvas')),col=sel?vColor():v.color;
      const g=c.createRadialGradient(w/2,h*.62,4,w/2,h*.62,w*.7);g.addColorStop(0,col+'5A');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
      ell(c,w/2,h-7,w*.44,5,'rgba(255,200,61,.2)');c.save();c.translate(w/2,h-6);const sc=Math.min(w/300,h/218);c.scale(sc,sc);drawVehicleSide(c,v.id,col,sel?state.wheels:'std',sel?state.stickers:[]);c.restore();});
  }else{
    tabs.style.display='';
    // rides without wheels (the pitbull, the wings) have no wheels tab
    const V=VEH[state.vid],dtabs=[['color','צבע'],['wheels','גלגלים'],['stickers','מדבקות']].filter(([id])=>!(id==='wheels'&&V.noWheels));
    if(!dtabs.some(([id])=>id===designTab))designTab='color';
    dtabs.forEach(([id,l])=>mkTab(l,designTab===id,()=>{designTab=id;renderPanel();}));
    if(designTab==='color'){opts.classList.add('swatches');COLORS.forEach(col=>{const b=document.createElement('button');b.className='sw'+(vColor()===col?' on':'');b.style.background=col;b.setAttribute('aria-label','צבע');b.onclick=()=>{state.color=col;changes[2]++;pop=1;renderPanel();};opts.appendChild(b);});}
    if(designTab==='wheels'){WHEELS.forEach(([id,l])=>{const b=document.createElement('button');b.className='opt'+(state.wheels===id?' on':'');b.innerHTML=`<canvas></canvas><span>${l}</span>`;b.onclick=()=>{state.wheels=id;changes[2]++;pop=1;renderPanel();};opts.appendChild(b);const{c,w,h}=fitCv(b.querySelector('canvas'));c.strokeStyle=INK;drawWheel(c,w/2,h/2,24*Math.min(w,h)/64,id,false,true);});}
    if(designTab==='stickers'){
      const max=SLOTS[state.vid].length;const n=document.createElement('p');n.className='note';n.textContent=max?`נבחרו ${state.stickers.length} מתוך ${max}. לחיצה נוספת מורידה מדבקה`:'על כנפי השכינה לא מדביקים מדבקות.';opts.appendChild(n);
      if(max)STICKERS.forEach(st=>{const idx=state.stickers.indexOf(st.id);const b=document.createElement('button');b.className='opt stk'+(idx>=0?' on':'');b.setAttribute('aria-label',st.text);b.innerHTML=`${idx>=0?`<em>${idx+1}</em>`:''}<canvas></canvas>`;
        b.onclick=()=>{changes[2]++;const i=state.stickers.indexOf(st.id);if(i>=0)state.stickers.splice(i,1);else{if(state.stickers.length>=max)state.stickers.shift();state.stickers.push(st.id);}pop=1;renderPanel();};
        opts.appendChild(b);const{c,w,h}=fitCv(b.querySelector('canvas'));c.strokeStyle=INK;drawSticker(c,st,w/2,h/2,w-8,h-6,0);});
    }
  }
  $('#nextBtn').textContent=['לבחירת כלי','לעיצוב הכלי','יאללה למירוץ'][step];
  $('#backBtn').textContent=step===0?'לשם':'חזרה';
}
document.querySelectorAll('.step').forEach(b=>b.onclick=()=>{const s=+b.dataset.s;if(s<=step){step=s;renderPanel();}});
$('#nextBtn').onclick=()=>{
  if(step===0)track('choose_vehicle_clicked',{changes:changes[0],...(({name,...look})=>look)(state.look)});
  else if(step===1)track('design_vehicle_clicked',{changes:changes[1],vehicle:state.vid});
  else track('start_race_clicked',{changes:changes[2],vehicle:state.vid,color:vColor(),wheels:VEH[state.vid].noWheels?'none':state.wheels,stickers:state.stickers.length});
  if(step<2){step++;changes[step]=0;renderPanel();}else startRace();};
$('#backBtn').onclick=()=>{if(step>0){step--;renderPanel();}else show('title');};

export { drawComposition, step, setStep, startStage, stopStage, renderPanel, previewPart };

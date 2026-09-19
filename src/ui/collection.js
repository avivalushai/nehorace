// "המוסך שלי": everything the player has won in one place. Rides and garage items that opened with
// career points (the next ones are shown locked, with how many points they need), and what they bought in the shop.
// Tapping something that is open puts it on the Nehorai.
import { $ } from '../core/util.js';
import { ell, fitCv } from '../core/draw.js';
import { PARTS, SLOTS, VEH } from '../core/catalog.js';
import { state } from '../core/state.js';
import { Stats } from '../core/stats.js';
import { isOpen, rarityOf, allLocks } from '../core/unlocks.js';
import { drawVehicleSide } from '../art/vehicles.js';
import { previewPart } from './garage.js';
import { SHOP } from '../shop/items.js';
import { ownedCount, drawItemCard, toast } from '../shop/ui.js';

let tab='look';
const TABS=[['look','נהוראי'],['rides','כלים'],['shop','מהחנות']];
const num=v=>v.toLocaleString('he-IL');
const openCount=()=>allLocks().filter(x=>isOpen(x.req)).length;
const boughtList=()=>SHOP.filter(it=>ownedCount(it.id)>0);
function summary(){const n=openCount()+boughtList().length;return n?`${n} דברים שזכית בהם, שמורים במקום אחד`:'כל מה שתזכה בו יחכה לך פה';}

function card(grid,{label,req,on,draw,onTap,extra}){
  const open=isOpen(req),b=document.createElement('button');b.className='mg-card'+(on?' on':'')+(open?'':' locked');
  const r=req?rarityOf(req):null;
  b.innerHTML=`<canvas></canvas><span></span>${r?`<i class="rar" style="--rc:${r.col}">${r.name}</i>`:''}${open?'':`<i class="lock">🔒 <b>${num(req)}</b></i>`}${extra||''}`;
  b.querySelector('span').textContent=label;
  b.onclick=()=>{if(!open){toast(`${label} נפתח ב-${num(req)} נקודות קריירה. יש לך ${num(Stats.career)}`);return;}if(onTap)onTap();};
  grid.appendChild(b);draw(b.querySelector('canvas'));
}
function head(grid,text){const h=document.createElement('h3');h.className='mg-head';h.textContent=text;grid.appendChild(h);}

function render(){
  const tabs=$('#mgTabs'),grid=$('#mgGrid');tabs.innerHTML='';grid.innerHTML='';
  const locks=allLocks();
  $('#mgNote').textContent=`פתחת ${num(openCount())} מתוך ${num(locks.length)} · ${num(Stats.career)} נקודות קריירה`;
  TABS.forEach(([id,l])=>{const b=document.createElement('button');b.className='tab'+(tab===id?' on':'');b.textContent=l;b.onclick=()=>{tab=id;render();};tabs.appendChild(b);});
  if(tab==='look'){
    PARTS.forEach(p=>{const items=p.items.filter(it=>it[2]&&it[2].req);if(!items.length)return;head(grid,p.label);
      items.forEach(([id,label,m])=>card(grid,{label,req:m.req,on:state.look[p.id]===id,draw:cv=>previewPart(cv,p.id,id),
        onTap:()=>{state.look[p.id]=id;toast(`${label} על הנהוראי שלך`);render();}}));});
  }else if(tab==='rides'){
    Object.values(VEH).forEach(v=>card(grid,{label:v.name,req:v.req,on:state.vid===v.id,
      draw:cv=>{const{c,w,h}=fitCv(cv);c.clearRect(0,0,w,h);ell(c,w/2,h-6,w*.42,4,'rgba(255,200,61,.2)');c.save();c.translate(w/2,h-5);const s=Math.min(w/300,h/218);c.scale(s,s);drawVehicleSide(c,v.id,v.color,'std',[]);c.restore();},
      onTap:()=>{if(state.vid!==v.id){state.vid=v.id;state.color=null;state.stickers=state.stickers.slice(0,SLOTS[v.id].length);}toast(`${v.name} מחכה לך במירוץ הבא`);render();}}));
  }else{
    const list=boughtList();
    if(!list.length){grid.insertAdjacentHTML('beforeend','<p class="shop-empty">עוד לא קנית כלום בחנות של הפארק. המטבעות מהמירוצים מחכים לך.</p>');return;}
    list.forEach(it=>{const n=ownedCount(it.id);card(grid,{label:it.name,draw:cv=>{const{c,w,h}=fitCv(cv);c.clearRect(0,0,w,h);drawItemCard(c,w,h,it);},extra:it.cons&&n>1?`<i class="cnt">×${n}</i>`:''});});
  }
}
function openMyGarage(){$('#myGarage').classList.add('on');$('#myGarage').scrollTop=0;render();}
$('#myGarageBtn').onclick=openMyGarage;
$('#myGarageClose').onclick=()=>$('#myGarage').classList.remove('on');

export { openMyGarage, summary as garageSummary };

// "המוסך": everything the player has won in one place. Garage items and rides that opened with career
// points, and what they bought in the shop. Nothing locked is shown here. Tapping an item puts it on the Nehorai.
import { $ } from '../core/util.js';
import { ell, fitCv } from '../core/draw.js';
import { PARTS, SLOTS, VEH } from '../core/catalog.js';
import { state } from '../core/state.js';
import { Stats } from '../core/stats.js';
import { isOpen, rarityOf } from '../core/unlocks.js';
import { drawVehicleSide } from '../art/vehicles.js';
import { previewPart } from './garage.js';
import { SHOP } from '../shop/items.js';
import { ownedCount, drawItemCard, toast } from '../shop/ui.js';

let tab='look';
const TABS=[['look','נהוראי'],['rides','כלים'],['shop','מהחנות']];
const num=v=>v.toLocaleString('he-IL');
const boughtList=()=>SHOP.filter(it=>ownedCount(it.id)>0);
// only what the player earned: items and rides that opened with career points (not the ones everyone starts with), and purchases
const earnedLook=()=>PARTS.flatMap(p=>p.items.filter(it=>it[2]&&it[2].req&&isOpen(it[2].req)).map(it=>[p,it]));
const earnedRides=()=>Object.values(VEH).filter(v=>v.req&&isOpen(v.req));
const EMPTY={look:'עוד לא עקצת פה כלום. תספורות ובגדים חדשים נפתחים עם נקודות מהמירוצים.',rides:'אין פה עדיין כלי שהרווחת. טי-מקס מחכה לך ב-6,000 נקודות.',shop:'עוד לא קנית כלום בחנות של הפארק. המטבעות מהמירוצים מחכים לך.'};

function card(grid,{label,req,on,draw,onTap,extra}){
  const b=document.createElement('button');b.className='mg-card'+(on?' on':'');
  const r=req?rarityOf(req):null;
  b.innerHTML=`<canvas></canvas><span></span>${r?`<i class="rar" style="--rc:${r.col}">${r.name}</i>`:''}${extra||''}`;
  b.querySelector('span').textContent=label;
  if(onTap)b.onclick=onTap;
  grid.appendChild(b);draw(b.querySelector('canvas'));
}
function head(grid,text){const h=document.createElement('h3');h.className='mg-head';h.textContent=text;grid.appendChild(h);}

function render(){
  const tabs=$('#mgTabs'),grid=$('#mgGrid');tabs.innerHTML='';grid.innerHTML='';
  const look=earnedLook(),rides=earnedRides(),bought=boughtList(),count={look:look.length,rides:rides.length,shop:bought.length};
  $('#mgNote').textContent=`${num(look.length+rides.length+bought.length)} דברים שעקצת · ${num(Stats.career)} נקודות קריירה`;
  TABS.forEach(([id,l])=>{const b=document.createElement('button');b.className='tab'+(tab===id?' on':'');b.innerHTML=`${l} <span class="tcount">${count[id]}</span>`;b.onclick=()=>{tab=id;render();};tabs.appendChild(b);});
  if(!count[tab]){const p=document.createElement('p');p.className='shop-empty';p.textContent=EMPTY[tab];grid.appendChild(p);return;}
  if(tab==='look'){
    let last=null;
    look.forEach(([p,[id,label,m]])=>{if(p!==last){head(grid,p.label);last=p;}
      card(grid,{label,req:m.req,on:state.look[p.id]===id,draw:cv=>previewPart(cv,p.id,id),
        onTap:()=>{state.look[p.id]=id;toast(`${label} על הנהוראי שלך`);render();}});});
  }else if(tab==='rides'){
    rides.forEach(v=>card(grid,{label:v.name,req:v.req,on:state.vid===v.id,
      draw:cv=>{const{c,w,h}=fitCv(cv);c.clearRect(0,0,w,h);ell(c,w/2,h-6,w*.42,4,'rgba(255,200,61,.2)');c.save();c.translate(w/2,h-5);const s=Math.min(w/300,h/218);c.scale(s,s);drawVehicleSide(c,v.id,v.color,'std',[]);c.restore();},
      onTap:()=>{if(state.vid!==v.id){state.vid=v.id;state.color=null;state.stickers=state.stickers.slice(0,SLOTS[v.id].length);}toast(`${v.name} מחכה לך במירוץ הבא`);render();}}));
  }else{
    bought.forEach(it=>{const n=ownedCount(it.id);card(grid,{label:it.name,draw:cv=>{const{c,w,h}=fitCv(cv);c.clearRect(0,0,w,h);drawItemCard(c,w,h,it);},extra:it.cons&&n>1?`<i class="cnt">×${n}</i>`:''});});
  }
}
function openMyGarage(){$('#myGarage').classList.add('on');$('#myGarage').scrollTop=0;render();}
$('#myGarageBtn').onclick=openMyGarage;
$('#myGarageClose').onclick=()=>$('#myGarage').classList.remove('on');

export { openMyGarage };

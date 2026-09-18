// Unlocks: new garage items open with career points (the sum of every race's score).
// An item is [id,label] (always open) or [id,label,{req}] where req is the career points needed.
// Vehicles use VEH[id].req the same way. Rarity is derived from req, with the shop's tier colors.
import { Stats } from './stats.js';
import { PARTS, VEH } from './catalog.js';

const RARITY=[{min:0,name:'רגיל',col:'#8FA3BF'},{min:1500,name:'שווה',col:'#3DDC97'},{min:5000,name:'נדיר',col:'#3DA5FF'},{min:12000,name:'אפי',col:'#FF3D8B'},{min:30000,name:'אגדי',col:'#FFC83D'}];
const rarityOf=req=>RARITY.reduce((t,r)=>req>=r.min?r:t,RARITY[0]);
const isOpen=req=>!req||Stats.career>=req;
// every lockable thing, for "you unlocked..." messages and progress
function allLocks(){
  const out=[];
  PARTS.forEach(p=>p.items.forEach(([id,label,m])=>{if(m&&m.req)out.push({kind:p.label,label,req:m.req});}));
  Object.values(VEH).forEach(v=>{if(v.req)out.push({kind:'כלי',label:v.name,req:v.req});});
  return out.sort((a,b)=>a.req-b.req);
}
const unlockedBetween=(from,to)=>allLocks().filter(x=>x.req>from&&x.req<=to);
const nextUnlock=()=>allLocks().find(x=>x.req>Stats.career)||null;

export { RARITY, rarityOf, isOpen, allLocks, unlockedBetween, nextUnlock };

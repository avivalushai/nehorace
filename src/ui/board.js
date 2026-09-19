// The champions board overlay: this week's best races and all-time wins.
// Player names are user input, so rows are built with textContent only.
import { $, INK, GOLD, GOLD2, FONT, DISP } from '../core/util.js';
import { rr, fitCv } from '../core/draw.js';
import { PARTS } from '../core/catalog.js';
import { state } from '../core/state.js';
import { drawNeho } from '../art/neho.js';
import { fetchBoard } from '../net/leaderboard.js';

let boardTab='week',data=null,podRAF=0;
// another player's look from the server: keep only item ids this game knows, fall back to the default for the rest
const DEFAULT_LOOK={hair:'fade',beard:'stubble',cap:'none',chain:'cuban',shirt:'track',pants:'track',shoes:'white',dog:'none',acc:'shades'};
function safeLook(l,name){const out={...DEFAULT_LOOK,name};PARTS.forEach(p=>{const v=l&&l[p.id];if(p.items.some(([id])=>id===v))out[p.id]=v;});out.dog='none';return out;}
// top 3 standing on a podium: 2nd, 1st (tallest, waving), 3rd
function drawPodium(cv,top,t){
  const{c,w,h}=fitCv(cv);c.clearRect(0,0,w,h);
  const g=c.createRadialGradient(w/2,h*.2,10,w/2,h*.5,w*.7);g.addColorStop(0,'rgba(255,200,61,.22)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  const bw=Math.min(w/3.3,150),base=h-8,heights=[h*.2,h*.28,h*.14],order=[1,0,2]; // slot order left to right: 2nd, 1st, 3rd
  const cols=[GOLD,'#C9CED6','#D9955A']; // gold, silver, bronze by rank
  order.forEach((rank,slot)=>{const r=top[rank];const x=w/2+(slot-1)*(bw+6),bh=heights[slot===1?1:slot===0?0:2];
    c.save();c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=3;rr(c,x-bw/2,base-bh,bw,bh,8);c.fillStyle=cols[rank];c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x-bw/2+6,base-bh+5,bw-12,4);
    c.fillStyle=INK;c.font=`700 ${Math.round(bh*.62)}px ${DISP}`;c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.fillText(String(rank+1),x,base-bh/2+2);c.restore();
    if(!r)return;
    const s=Math.min((base-bh-26)/300,bw/190),feet=base-bh;
    const pose=rank===0?{armR:-2.5+Math.sin(t*6)*.25,armL:.1,legL:0,legR:0}:undefined;
    c.save();c.translate(x,feet);c.scale(s,s);drawNeho(c,{...safeLook(r.look,r.name),mood:rank===0?'win':undefined},t,pose);c.restore();
    c.save();c.font=`${Math.max(12,Math.round(bw*.1))}px ${FONT}`;c.textAlign='center';c.textBaseline='bottom';c.direction='rtl';
    const label=r.name.length>9?r.name.slice(0,9)+'…':r.name;c.lineWidth=4;c.strokeStyle='rgba(26,11,41,.9)';c.strokeText(label,x,feet-300*s-4);c.fillStyle='#FFF4DC';c.fillText(label,x,feet-300*s-4);c.restore();
  });
}
const TABS=[['week','השבוע'],['wins','הכי הרבה ניצחונות']];
const MEDAL=['🥇','🥈','🥉'];
const num=v=>v.toLocaleString('he-IL');

function row(r,unit){const li=document.createElement('li');li.className=r.me?'me':'';
  const rank=document.createElement('span');rank.className='n';rank.textContent=MEDAL[r.rank-1]||r.rank;
  const name=document.createElement('span');name.className='nm';name.textContent=r.name+(r.me?' (אתה)':'');
  const score=document.createElement('b');score.textContent=unit(r.score);
  li.append(rank,name,score);return li;}
function render(){
  const tabs=$('#boardTabs'),list=$('#boardList'),note=$('#boardNote'),pod=$('#boardPodium');tabs.innerHTML='';list.innerHTML='';pod.innerHTML='';
  TABS.forEach(([id,l])=>{const b=document.createElement('button');b.className='tab'+(boardTab===id?' on':'');b.textContent=l;b.onclick=()=>{boardTab=id;render();};tabs.appendChild(b);});
  if(data===null){note.textContent='טוען את הטבלה...';return;}
  if(data===false){note.textContent='אין חיבור לטבלה כרגע. נסו שוב עוד רגע.';return;}
  if(data.disabled){note.textContent='טבלת האלופים עוד לא מחוברת. בקרוב!';return;}
  const B=data[boardTab],unit=boardTab==='week'?(s=>`${num(s)} נק׳`):(s=>s===1?'ניצחון אחד':`${num(s)} ניצחונות`);
  note.textContent=boardTab==='week'?'המירוץ הכי טוב של כל אחד השבוע. מתאפס בכל יום ראשון.':'כל הזמנים. כל מקום ראשון במירוץ הוא ניצחון.';
  if(!B.top.length){const p=document.createElement('p');p.className='board-empty';p.textContent=boardTab==='week'?'עוד אין פה אף אחד השבוע. יאללה, תהיה הראשון!':'עוד אף אחד לא ניצח. זה הזמן.';list.appendChild(p);}
  cancelAnimationFrame(podRAF);
  if(B.top.length){const cv=document.createElement('canvas');cv.className='podium';pod.appendChild(cv);
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,t0=performance.now();
    const f=now=>{if(!cv.isConnected||!$('#board').classList.contains('on'))return;drawPodium(cv,B.top,reduce?0:(now-t0)/1000);if(!reduce)podRAF=requestAnimationFrame(f);};f(t0);}
  B.top.forEach(r=>list.appendChild(row(r,unit)));
  if(B.me&&!B.top.some(r=>r.me)){const gap=document.createElement('li');gap.className='gap';gap.textContent='⋯';list.appendChild(gap);list.appendChild(row({rank:B.me.rank,name:state.name,score:B.me.score,me:true},unit));}
  const you=document.createElement('p');you.className='board-you';you.textContent=`בטבלה אתה מופיע בשם של הנהוראי שלך: ${state.name}`;list.appendChild(you);
}
async function openBoard(tab){
  if(tab)boardTab=tab;data=null;$('#board').classList.add('on');$('#board').scrollTop=0;render();
  const d=await fetchBoard();data=d||false;if($('#board').classList.contains('on'))render();
}
$('#boardClose').onclick=()=>$('#board').classList.remove('on');

export { openBoard };

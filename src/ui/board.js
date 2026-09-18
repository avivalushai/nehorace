// The champions board overlay: this week's best races and all-time wins.
// Player names are user input, so rows are built with textContent only.
import { $ } from '../core/util.js';
import { state } from '../core/state.js';
import { fetchBoard } from '../net/leaderboard.js';

let boardTab='week',data=null;
const TABS=[['week','השבוע'],['wins','הכי הרבה ניצחונות']];
const MEDAL=['🥇','🥈','🥉'];
const num=v=>v.toLocaleString('he-IL');

function row(r,unit){const li=document.createElement('li');li.className=r.me?'me':'';
  const rank=document.createElement('span');rank.className='n';rank.textContent=MEDAL[r.rank-1]||r.rank;
  const name=document.createElement('span');name.className='nm';name.textContent=r.name+(r.me?' (אתה)':'');
  const score=document.createElement('b');score.textContent=unit(r.score);
  li.append(rank,name,score);return li;}
function render(){
  const tabs=$('#boardTabs'),list=$('#boardList'),note=$('#boardNote');tabs.innerHTML='';list.innerHTML='';
  TABS.forEach(([id,l])=>{const b=document.createElement('button');b.className='tab'+(boardTab===id?' on':'');b.textContent=l;b.onclick=()=>{boardTab=id;render();};tabs.appendChild(b);});
  if(data===null){note.textContent='טוען את הטבלה...';return;}
  if(data===false){note.textContent='אין חיבור לטבלה כרגע. נסו שוב עוד רגע.';return;}
  if(data.disabled){note.textContent='טבלת האלופים עוד לא מחוברת. בקרוב!';return;}
  const B=data[boardTab],unit=boardTab==='week'?(s=>`${num(s)} נק׳`):(s=>s===1?'ניצחון אחד':`${num(s)} ניצחונות`);
  note.textContent=boardTab==='week'?'המירוץ הכי טוב של כל אחד השבוע. מתאפס בכל יום ראשון.':'כל הזמנים. כל מקום ראשון במירוץ הוא ניצחון.';
  if(!B.top.length){const p=document.createElement('p');p.className='board-empty';p.textContent=boardTab==='week'?'עוד אין פה אף אחד השבוע. יאללה, תהיה הראשון!':'עוד אף אחד לא ניצח. זה הזמן.';list.appendChild(p);}
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

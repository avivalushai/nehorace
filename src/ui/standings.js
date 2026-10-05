// The standings, shown over the finished race (dimmed behind it) before the results: every racer's Nehorai on a
// six-step podium, then a flat table (no scrolling), where each racer says something about how it went (random lines from FINISH_LINES).
// Names and lines are set with textContent only.
import { $, INK, GOLD, FONT, DISP } from '../core/util.js';
import { rr, fitCv } from '../core/draw.js';
import { drawNeho } from '../art/neho.js';
import { FINISH_LINES } from '../race/texts.js';

// draws n lines from a pool without repeats
function drawLines(pool,n){const a=[...pool];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
const lineGroup=(rank,busted)=>busted?'busted':rank===0?'win':rank<3?'mid':'low';

// left to right: 5th, 3rd, 1st, 2nd, 4th, 6th. 1st is the tallest step and waves; the last one is dizzy
const SLOT_RANKS=[4,2,0,1,3,5],STEP=[.34,.28,.23,.18,.15,.12],STEP_COL=[GOLD,'#C9CED6','#D9955A','#6A3A99','#5B2F86','#4E2775'];
const MOOD=['win',undefined,undefined,'angry','angry','dizzy'];
function drawStandPodium(cv,rows,t){
  const{c,w,h}=fitCv(cv);c.clearRect(0,0,w,h);
  const g=c.createRadialGradient(w/2,h*.25,10,w/2,h*.5,w*.75);g.addColorStop(0,'rgba(255,200,61,.22)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  const bw=(w-12)/6,base=h-8;
  SLOT_RANKS.forEach((rank,slot)=>{const r=rows[rank];if(!r)return;
    const x=6+bw*(slot+.5),bh=h*STEP[rank],feet=base-bh;
    c.save();c.lineJoin='round';c.strokeStyle=INK;c.lineWidth=3;rr(c,x-bw/2+2,feet,bw-4,bh,6);c.fillStyle=STEP_COL[rank];c.fill();c.stroke();
    c.fillStyle=rank<3?INK:'#FFF4DC';c.font=`700 ${Math.round(Math.min(bh*.6,bw*.55,38))}px ${DISP}`;c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.fillText(String(rank+1),x,feet+bh/2+2);c.restore();
    const s=Math.min((bw-4)/170,(h*.6)/300);
    const pose=rank===0?{armR:-2.5+Math.sin(t*6)*.25,armL:.1,legL:0,legR:0}:undefined;
    c.save();c.translate(x,feet);c.scale(s,s);drawNeho(c,{...r.look,dog:'none',mood:MOOD[rank]},t,pose);c.restore();
    // everyone is "נהוראי ...", so the player's label is just their part of the name
    const label=(r.me?(r.name.replace(/^נהוראי\s*/,'')||r.name):r.name).slice(0,8);
    c.save();c.font=`${Math.max(11,Math.round(bw*.2))}px ${FONT}`;c.textAlign='center';c.textBaseline='bottom';c.direction='rtl';
    c.lineWidth=4;c.strokeStyle='rgba(26,11,41,.9)';c.strokeText(label,x,feet-300*s-4);c.fillStyle=r.me?GOLD:'#FFF4DC';c.fillText(label,x,feet-300*s-4);c.restore();
  });
}

let raf=0,onNext=null,goT=0;
// the results come on their own after 5 seconds, for players who don't tap
const AUTO=5000;
function go(){clearTimeout(goT);cancelAnimationFrame(raf);if(!$('#standings').classList.contains('on'))return;$('#standings').classList.remove('on');if(onNext)onNext();}
// rows: the racers in finishing order: {name, look, time (seconds or null), knocks, me}
function showStandings(rows,fmt,next){
  onNext=next;
  const lines={win:drawLines(FINISH_LINES.win,1),mid:drawLines(FINISH_LINES.mid,2),low:drawLines(FINISH_LINES.low,3),busted:drawLines(FINISH_LINES.busted,1)},used={win:0,mid:0,low:0,busted:0};
  const me=rows.find(r=>r.me),fr=rows.find(r=>r.inviter);let duel=null;
  if(me&&fr){const won=!me.busted&&me.time!=null&&me.time<fr.time;
    duel={name:fr.name,won,busted:me.busted,tie:!me.busted&&me.time!=null&&Math.abs(me.time-fr.time)<.05,gap:me.time!=null?(Math.round(Math.abs(me.time-fr.time)*10)/10).toFixed(1):'',line:drawLines(won?FINISH_LINES.duelLost:FINISH_LINES.duelWon,1)[0]};}
  const list=$('#stdList');list.innerHTML='';
  rows.forEach((r,i)=>{const grp=lineGroup(i,r.busted),li=document.createElement('li');li.className=r.me?'me':'';
    li.innerHTML='<span class="n"></span><span class="who"></span><span class="st"><b></b><small></small></span><q></q>';
    li.querySelector('.n').textContent=i+1;
    li.querySelector('.who').textContent=r.name+(r.me?' (אתה)':r.inviter?' (המזמין)':'');
    li.querySelector('.st b').textContent=r.busted?'נעצר':r.time!=null?fmt(r.time,true):'לא סיים';li.querySelector('.st small').textContent=`${r.knocks} נדרסו`;
    li.querySelector('q').textContent=r.inviter&&duel?duel.line:lines[grp][used[grp]++];
    list.appendChild(li);});
  // a duel with the friend who sent the invite: one big line on top, who won and by how much
  const el=$('#stdDuel');el.hidden=!duel;el.classList.toggle('won',!!duel&&duel.won);
  if(duel){const b=document.createElement('b');b.textContent=duel.gap;
    el.replaceChildren(...(duel.busted?[`נעצרת, ו${duel.name} לקח את הדו-קרב`]:duel.tie?[`תיקו מושלם עם ${duel.name}!`]:duel.won?[`ניצחת את ${duel.name} ב-`,b,' שניות!']:[`${duel.name} לקח אותך ב-`,b,' שניות']));}
  $('#standings').classList.add('on');
  cancelAnimationFrame(raf);
  const cv=$('#stdCv'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,t0=performance.now();
  const f=now=>{if(!$('#standings').classList.contains('on'))return;drawStandPodium(cv,rows,reduce?0:Math.max(0,(now-t0)/1000));if(!reduce)raf=requestAnimationFrame(f);};
  requestAnimationFrame(f);
  clearTimeout(goT);goT=setTimeout(go,AUTO);
}
$('#stdNext').onclick=go;

export { showStandings };

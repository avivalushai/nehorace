// Yeshivas on screen: "my yeshivas" (the list, bonuses waiting, opening a new one), one yeshiva's tables (this round,
// and rounds won), the screen after a race in a yeshiva, the home button with its count, and the ?vs=<cid> invite.
// Names come from other players, so everything they wrote is set with textContent only.
import { $, fmtTime } from '../core/util.js';
import { state } from '../core/state.js';
import { trackOf } from '../race/tracks.js';
import { YESHIVA_WORDS } from '../race/texts.js';
import { newCid, createYeshiva, loadYeshiva, myYeshivas, markSeen, claimBonus, renameYeshiva } from '../net/yeshiva.js';
import { shareYeshivaInvite, sharePassed } from './share.js';
import { drawPodium, drawAvatar } from './board.js';
import { startRaceFresh } from '../race/engine.js';
import { addCoins, toast } from '../shop/ui.js';
import { track } from '../net/analytics.js';

const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
const randWord=(not)=>{const pool=YESHIVA_WORDS.filter(w=>w!==not);return pool[Math.floor(Math.random()*pool.length)];};
const left=d=>d<=1?'הסבב נגמר הלילה':`עוד ${d} ימים לסבב`;
const where=t=>trackOf(t).name;
// the title screen's name helpers (main.js owns the name field)
let ui={suffix:()=>'',takeName:()=>{},setHint:()=>{}};
// a yeshiva needs the player's Nehorai name, so friends know who invited them and who passed them
function needName(){
  if(state.name&&state.name!=='נהוראי')return true;
  if(ui.suffix().length>=2){ui.takeName();return true;}
  closeAll();ui.setHint('✗ קודם בוחרים שם לנהוראי, כדי שהחברים בישיבה יידעו מי זה. למשל: נהוראי המלך','bad');$('#nameIn').focus();return false;
}
function closeAll(){['#yeshivas','#yeshiva'].forEach(q=>$(q).classList.remove('on'));}

// ---------- the home button: how many yeshivas had news since the last look (passed you, a new round, a bonus) ----------
async function refreshBadge(){const L=await myYeshivas(),b=$('#ysBadge');b.hidden=!(L&&L.news);if(L&&L.news)b.textContent=L.news;}
$('#challengeBtn').onclick=()=>{track('my_yeshivas_clicked',{news:+($('#ysBadge').hidden?0:$('#ysBadge').textContent)});openYeshivas();};

// ---------- my yeshivas ----------
async function openYeshivas(){
  const body=$('#ysBody');body.replaceChildren(el('p','board-note','טוען את הישיבות...'));
  $('#yeshivas').classList.add('on');$('#yeshivas').scrollTop=0;
  const L=await myYeshivas();
  if(!$('#yeshivas').classList.contains('on'))return;
  renderYeshivas(L||{items:[],bonuses:[]},!L);
  // what's on screen now counts as seen; bonuses stay counted until they're taken
  if(L&&L.items.length)markSeen(L.items.map(y=>y.cid)).then(refreshBadge);
}
function renderYeshivas(L,offline){
  const body=$('#ysBody');body.replaceChildren();
  if(offline){body.append(el('p','board-note','אין חיבור לישיבות כרגע. נסו שוב עוד רגע.'));return;}
  // a round that ended: the bonus waits here until it's tapped
  if(L.bonuses.length){const box=el('div','y-cards');L.bonuses.forEach(b=>box.append(bonusCard(b)));body.append(box);}
  if(!L.items.length){
    const e=el('div','y-empty');e.append(el('h3',null,'אין לך עדיין ישיבה'),el('p',null,'פותחים ישיבה, שולחים לחבר׳ה בוואטסאפ, ומתחרים. כל שבוע מסלול חדש, ומי שמנצח בסבב הוא ראש הישיבה.'));
    body.append(e,createForm());return;}
  const box=el('div','y-cards');
  L.items.forEach(y=>{
    const c=el('button','y-card'+(y.passedBy||y.newRound?' hot':''));
    const meta=el('span','y-meta');
    meta.append(el('b',null,y.myRank?`מקום ${y.myRank}`:'עוד לא רצת'),` · ${!y.players?'עוד אף אחד לא רץ':y.players===1?'שחקן אחד':`${y.players} שחקנים`} · ${where(y.track)} · ${left(y.daysLeft)}`);
    c.append(el('span','y-name',`ישיבת ${y.word}`),meta);
    if(y.passedBy)c.append(el('span','y-alert',`${y.passedBy} עקף אותך`));
    else if(y.newRound)c.append(el('span','y-alert',`סבב ${y.round} התחיל, מסלול חדש`));
    c.onclick=()=>{track('yeshiva_card_clicked',{passed:!!y.passedBy,new_round:!!y.newRound});openYeshiva(y.cid);};
    box.append(c);});
  body.append(box);
  const more=el('button','btn ghost y-new','➕ פותחים ישיבה חדשה');
  more.onclick=()=>{more.replaceWith(createForm());};
  body.append(more);
}
function bonusCard(b){
  const c=el('button','y-bonus');c.append(el('span','ico',b.place===1?'👑':'🏆'),el('span',null,`סבב ${b.round} בישיבת ${b.word} נגמר. מקום ${b.place}`),el('b',null,`+${b.coins.toLocaleString('he-IL')}`));
  c.onclick=async()=>{c.classList.add('done');const r=await claimBonus(b.key);
    if(!r||!r.ok){c.classList.remove('done');toast('לא הצלחנו לקבל את הבונוס. נסו שוב');return;}
    // counts up like the coins after a race, then lands in the wallet
    const bx=c.querySelector('b'),t0=performance.now(),dur=1100;
    const step=now=>{const k=Math.min(1,(now-t0)/dur);bx.textContent='+'+Math.round(r.coins*(1-Math.pow(1-k,3))).toLocaleString('he-IL');if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);
    addCoins(r.coins);toast(`+${r.coins.toLocaleString('he-IL')} מטבעות נכנסו לארנק`);track('yeshiva_bonus_claimed',{place:r.place,coins:r.coins});refreshBadge();};
  return c;
}
// opening a yeshiva: a name drawn from the list (draw again, or write one), then straight to WhatsApp
function createForm(){
  const f=el('div','y-create'),row=el('div','row'),nr=el('div','name-row'),inp=el('input'),dice=el('button','y-dice','🎲'),go=el('button','btn','פותחים ישיבה ושולחים בוואטסאפ');
  inp.maxLength=10;inp.autocomplete='off';inp.value=randWord();inp.setAttribute('aria-label','שם הישיבה');dice.setAttribute('aria-label','להגריל שם אחר');
  nr.append(el('span','name-fixed','ישיבת'),inp);row.append(nr,dice);f.append(el('label',null,'איך קוראים לישיבה?'),row,go);
  dice.onclick=()=>{inp.value=randWord(inp.value);};
  go.onclick=()=>{const word=inp.value.replace(/\s+/g,' ').trim().replace(/^ישיבת\s*/,'')||randWord();if(!needName())return;
    const cid=newCid();createYeshiva(cid,word,state.name);shareYeshivaInvite({cid,word});track('yeshiva_created',{from:'my_yeshivas',with_race:false});
    enterYeshiva({cid,word,mine:true});setTimeout(openYeshivas,1200);};
  return f;
}
// from the results screen: a new yeshiva with the race that just finished, in one tap (or more friends to the current one)
function inviteFromRace(run){
  const vs=state.vs;
  if(vs){shareYeshivaInvite(vs);track('yeshiva_invite_sent',{from:'results'});return;}
  const cid=newCid(),word=randWord();createYeshiva(cid,word,state.name,run);shareYeshivaInvite({cid,word});
  track('yeshiva_created',{from:'results',with_race:true});
  enterYeshiva({cid,word,mine:true,seed:run.seed,track:run.track,racers:[]});
}

// ---------- the player is in a yeshiva: every race from here on is in it ----------
function enterYeshiva(v){
  state.vs=v;$('#startBtn').textContent='בונים נהוראי לישיבה';$('#title').classList.add('invited');
  const b=$('#vsInvite');b.hidden=false;
  b.textContent=v.mine?`⚔️ ישיבת ${v.word} שלך`+(v.players>1?` · ${v.players} שחקנים ›`:''):`⚔️ ${v.ownerName} מזמין אותך לישיבת ${v.word}`+(v.players>1?` · ${v.players} שחקנים ›`:'');
  b.onclick=()=>openYeshiva(v.cid);
  dispatchEvent(new Event('resize')); // the invite line moves the title's layout: the Nehorai is drawn again to fit
  if(v.seed==null)loadYeshiva(v.cid).then(f=>{if(f&&state.vs&&state.vs.cid===v.cid)state.vs={...f,cid:v.cid};});
}
// ?vs=<cid>: a link from WhatsApp. The yeshiva joins the player's list, and the invite shows on the title screen
function initYeshiva(helpers){
  ui=helpers;refreshBadge();
  const cid=new URLSearchParams(location.search).get('vs');
  if(cid)loadYeshiva(cid).then(v=>{if(!v)return;enterYeshiva({...v,cid});track('invite_opened',{track:v.track,players:v.players,mine:v.mine});});
}

// ---------- one yeshiva: this round's table and the rounds won ----------
let shown=null,yTab='round',podRAF=0;
async function openYeshiva(cid){
  $('#yeshiva').classList.add('on');$('#yeshiva').scrollTop=0;
  if(!shown||shown.cid!==cid){$('#yTitle').textContent='ישיבה';$('#ySub').textContent='';$('#yNote').textContent='טוען...';$('#yList').replaceChildren();$('#yPodium').replaceChildren();}
  const v=await loadYeshiva(cid);
  if(!v){$('#yNote').textContent='הישיבה הזאת לא קיימת יותר, או שאין חיבור כרגע.';return;}
  shown={...v,cid};yTab='round';renderYeshiva();
}
function renderYeshiva(){
  const v=shown;
  $('#yTitle').textContent=`ישיבת ${v.word}`;$('#yRename').hidden=!v.mine;$('#yRenameRow').hidden=true;
  const sub=$('#ySub');sub.replaceChildren(el('b',null,`סבב ${v.round}`),` · ${where(v.track)} · ${left(v.daysLeft)}`);
  if(v.headName)sub.append(` · 👑 ראש הישיבה: ${v.headName}`);
  const tabs=$('#yTabs');tabs.replaceChildren();
  [['round','הסבב הזה'],['wins','ניצחונות בסבבים']].forEach(([id,l])=>{const b=el('button','tab'+(yTab===id?' on':''),l);b.onclick=()=>{yTab=id;renderYeshiva();};tabs.append(b);});
  const list=$('#yList'),pod=$('#yPodium'),note=$('#yNote');list.replaceChildren();pod.replaceChildren();cancelAnimationFrame(podRAF);
  const rows=yTab==='round'?v.table.map(r=>({...r,score:r.time})):v.wins.map((r,i)=>({...r,rank:i+1,score:r.wins}));
  const unit=yTab==='round'?fmtTime:(n=>n===1?'סבב אחד':`${n} סבבים`);
  note.textContent=yTab==='round'?(v.myRank?`אתה במקום ${v.myRank} מתוך ${v.table.length} בסבב הזה`:'עוד לא רצת בסבב הזה. הזמן הכי טוב של כל אחד נכנס לטבלה.')
    :'מי ניצח הכי הרבה סבבים. כל יום ראשון מתחיל סבב חדש.';
  if(!rows.length){list.append(el('p','board-empty',yTab==='round'?'עוד אף אחד לא רץ בסבב הזה. תהיה הראשון!':'עוד לא נגמר אף סבב.'));return;}
  if(yTab==='round'){const cv=el('canvas','podium');pod.append(cv);const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,t0=performance.now();
    const f=now=>{if(!cv.isConnected||!$('#yeshiva').classList.contains('on'))return;drawPodium(cv,rows,reduce?0:Math.max(0,(now-t0)/1000));if(!reduce)podRAF=requestAnimationFrame(f);};f(t0);}
  rows.forEach(r=>{list.append(rowEl(r,unit));const av=list.lastChild.querySelector('.av');if(av)drawAvatar(av,r.look,r.name);});
}
// a table row: place, the Nehorai (when the server sent one), name with tags, and the time or the rounds won
const MEDAL=['🥇','🥈','🥉'];
function rowEl(r,unit){const li=el('li',r.me?'me':'');
  const nm=el('span','nm',r.name+(r.me?' (אתה)':''));if(r.head)nm.append(el('span','tag','👑 ראש הישיבה'));
  li.append(el('span','n',MEDAL[r.rank-1]||String(r.rank)),r.look?el('canvas','av'):el('span'),nm,el('b',null,unit(r.score)));return li;}
$('#yClose').onclick=()=>$('#yeshiva').classList.remove('on');
$('#ysClose').onclick=()=>$('#yeshivas').classList.remove('on');
$('#yRace').onclick=()=>{if(!shown||!needName())return;track('yeshiva_race_clicked',{from:'yeshiva'});enterYeshiva(shown);closeAll();startRaceFresh();};
$('#yInvite').onclick=()=>{if(!shown||!needName())return;track('yeshiva_invite_sent',{from:'yeshiva'});shareYeshivaInvite(shown);};
$('#yRename').onclick=()=>{$('#yRenameRow').hidden=false;$('#yRenameIn').value=shown.word;$('#yRenameIn').focus();};
$('#yRenameSave').onclick=async()=>{const word=$('#yRenameIn').value.replace(/\s+/g,' ').trim().replace(/^ישיבת\s*/,'');if(!word)return;
  const v=await renameYeshiva(shown.cid,word);if(!v){toast('לא הצלחנו לשנות את השם. נסו שוב');return;}
  track('yeshiva_renamed');shown={...v,cid:shown.cid};if(state.vs&&state.vs.cid===shown.cid)enterYeshiva({...state.vs,word:v.word});renderYeshiva();};

// ---------- after a race in a yeshiva, before the results ----------
// v: the yeshiva after the race (from the server: improved, before, passed, or stale when the round changed mid-race)
function showYeshivaEnd(v,busted,onAgain,onResults){
  $('#yeshivaEnd').classList.add('on');$('#yeshivaEnd').scrollTop=0; // open first: the avatars measure their canvas
  $('#yeTitle').textContent=`ישיבת ${v.word}`;
  const sub=$('#yeSub');sub.replaceChildren(el('b',null,`סבב ${v.round}`),` · ${where(v.track)} · ${left(v.daysLeft)}`);
  const head=$('#yeHead'),best=v.myTime?fmtTime(v.myTime):null;let won=false,text;
  if(v.stale)text='הסבב התחלף באמצע המירוץ, אז המירוץ הזה לא נספר. מסלול חדש כבר מחכה';
  else if(busted)text=best?`נעצרת. הזמן הכי טוב שלך נשאר ${best}`:'נעצרת, אז עוד אין לך זמן בסבב הזה';
  else if(!v.improved)text=`הזמן הכי טוב שלך נשאר ${best}`;
  else if(!v.before.rank){text=`נכנסת לטבלה במקום ${v.myRank}`;won=v.myRank===1;}
  else if(v.before.rank>v.myRank){text=`עלית ממקום ${v.before.rank} למקום ${v.myRank}`;won=true;}
  else text=`שיפרת ל-${best}, ועדיין במקום ${v.myRank}`;
  head.textContent=text;head.classList.toggle('won',won);
  const passed=v.passed||[];$('#yePassed').hidden=!passed.length;$('#yePassed').textContent=passed.length?`עקפת את ${passed.join(', ')}`:'';
  const list=$('#yeList');list.replaceChildren();v.table.forEach(r=>{list.append(rowEl({...r,score:r.time},fmtTime));drawAvatar(list.lastChild.querySelector('.av'),r.look,r.name);});
  const first=v.table[0];
  $('#yeGap').textContent=!v.myRank?'':v.myRank===1?'אתה ראשון בסבב. עכשיו רק לשמור על זה':`חסרות לך ${(Math.round((v.myTime-first.time)*10)/10).toFixed(1)} שניות למקום הראשון`;
  $('#yeTell').hidden=!passed.length;
  $('#yeTell').onclick=()=>{track('yeshiva_end_clicked',{button:'tell_group'});sharePassed(v,passed);};
  const close=()=>$('#yeshivaEnd').classList.remove('on');
  $('#yeAgain').onclick=()=>{track('yeshiva_end_clicked',{button:'again'});close();onAgain();};
  $('#yeResults').onclick=()=>{track('yeshiva_end_clicked',{button:'results'});close();onResults();};
}

export { initYeshiva, refreshBadge, showYeshivaEnd, inviteFromRace, enterYeshiva };

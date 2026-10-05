// "Bring the guys now": a live race with friends, from the home screen. The one who opens it sends a link
// (?live=<CODE>); whoever opens it types a name and is in the lobby (with the Nehorai they built, or a random one).
// The host taps "יאללה למירוץ", everyone gets 30 seconds to pick their Nehorai and ride, and the race starts on every
// phone at once (src/race/engine.js draws the others from the network). Names are set with textContent only.
import { $, pick } from '../core/util.js';
import { state, vColor, saveLook, loadLook } from '../core/state.js';
import { VEH } from '../core/catalog.js';
import { isOpen } from '../core/unlocks.js';
import { trackList, trackOpen } from '../race/tracks.js';
import { randLook } from '../race/world.js';
import { startRace, liveMessage } from '../race/engine.js';
import { drawComposition } from './garage.js';
import { drawAvatar } from './board.js';
import { shareLive } from './share.js';
import { liveOn, liveReady, newCode, isCode, connect } from '../net/live.js';
import { toast } from '../shop/ui.js';
import { track } from '../net/analytics.js';
import { show } from '../main.js';

const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
let ui={suffix:()=>'',takeName:()=>{},setHint:()=>{}},conn=null,startedRound=0,peek=null,stageRAF=0,tick=0;
const open=()=>{$('#live').classList.add('on');};
const close=()=>{$('#live').classList.remove('on');cancelAnimationFrame(stageRAF);clearInterval(tick);};
const me=()=>conn&&conn.room&&conn.room.players.find(p=>p.pid===conn.pid);
const host=()=>conn&&conn.room&&conn.room.players.find(p=>p.host);
const hello=()=>({name:state.name,look:(({name,...l})=>l)(state.look),vid:state.vid,color:vColor(),wheels:state.wheels});

// ---------- opening a room (the host) and joining one (from a link) ----------
function needName(){
  if(ui.suffix().length>=2){ui.takeName();return true;}
  ui.setHint('✗ קודם בוחרים שם לנהוראי, כדי שהחבר׳ה יידעו מי מזמין. למשל: נהוראי המלך','bad');$('#nameIn').focus();return false;
}
$('#liveBtn').onclick=()=>{
  if(!needName())return;
  const code=newCode();track('live_opened');
  conn=connect(code,onMessage);conn.join(hello());state.live=conn;
  render();open();
};
function joinFromLink(code){
  conn=connect(code,onMessage);
  render();open();
}
function join(nameSuffix){
  state.name=`נהוראי ${nameSuffix}`;state.look.name=state.name;
  // what they built here before comes along; a new player gets a random Nehorai (changeable in the 30 seconds)
  if(!loadLook()){state.look={...randLook(),name:state.name};state.vid='scooter';}
  state.look.name=state.name;
  try{localStorage.setItem('nehorace-name',nameSuffix);}catch(e){}
  $('#nameIn').value=nameSuffix;ui.takeName();
  conn.join(hello());state.live=conn;track('live_joined',{players:peek?peek.players.length:0});
}
function leave(){if(conn)conn.close();conn=null;state.live=null;peek=null;close();$('#againBtn').textContent='עוד סיבוב';}
$('#lvClose').onclick=()=>{track('live_left',{phase:conn&&conn.room?conn.room.phase:'join'});leave();if(!$('#title').classList.contains('on')&&!$('#results').classList.contains('on'))show('title');};

// ---------- the room talks ----------
function onMessage(m){
  if(['pos','knock','finished','left','standings'].includes(m.t)){liveMessage(m);if(m.t!=='left')return;}
  if(m.t==='peek'){peek=m;render();return;}
  if(m.t==='error'){renderError(m.error==='started'?'המירוץ כבר התחיל. בפעם הבאה מהר יותר 😉':m.error==='full'?'המירוץ מלא, כבר יש שישה נהוראים':'משהו השתבש בכניסה למירוץ');return;}
  if(m.t==='lost'){toast('החיבור למירוץ החי נפל');renderError('החיבור נפל. אפשר לנסות להיכנס שוב מהקישור');return;}
  if(m.t!=='room'||!state.live)return;
  const R=m;
  // the race is set: everyone goes to the track together
  if(R.phase==='race'&&startedRound!==R.round){startedRound=R.round;close();$('#againBtn').textContent='🔥 עוד סיבוב עם החבר׳ה';startRace();return;}
  // back in the lobby after a race (the host tapped "again"): the overlay opens for everyone
  if(R.phase==='lobby'&&$('#results').classList.contains('on')&&!$('#live').classList.contains('on'))open();
  if($('#live').classList.contains('on'))render();
}

// ---------- the screens ----------
function render(){
  const body=$('#lvBody');cancelAnimationFrame(stageRAF);clearInterval(tick);body.replaceChildren();
  if(!state.live)return renderJoin(body);
  const R=conn.room;if(!R){$('#lvTitle').textContent='מירוץ חי';body.append(el('p','lv-text','מתחברים...'));return;}
  if(R.phase==='lobby'||R.phase==='done')return renderLobby(body,R);
  if(R.phase==='build')return renderBuild(body,R);
  body.append(el('p','lv-text','המירוץ מתחיל...'));
}
function players(list,max){
  const ul=el('ul','lv-players');
  list.forEach(p=>{const li=el('li',p.pid===conn.pid?'me':'');const cv=el('canvas');
    li.append(cv,el('span','nm',p.name+(p.pid===conn.pid?' (אתה)':'')));
    if(p.host||p.ready)li.append(el('span','st',p.ready?'✅':'👑'));
    ul.append(li);requestAnimationFrame(()=>drawAvatar(cv,p.look,p.name));});
  for(let i=list.length;i<max;i++)ul.append(el('li','empty','מחכים לחבר...'));
  return ul;
}
function renderJoin(body){
  $('#lvTitle').textContent='מירוץ חי';
  if(!peek){body.append(el('p','lv-text','מתחברים...'));return;}
  if(peek.phase!=='lobby'){renderError('המירוץ כבר התחיל. בפעם הבאה מהר יותר 😉');return;}
  const h=peek.players.find(p=>p.host);
  $('#lvSub').textContent='';
  const box=el('div','lv-join');
  box.append(el('p','lv-big',h?`${h.name} מזמין אותך`:'מירוץ חי'),el('p','lv-text','מירוץ חי עם החבר׳ה, עכשיו. רק שם, ונכנסים'));
  if(peek.players.length)box.append(players(peek.players,peek.players.length));
  const nr=el('div','name-row'),inp=el('input');inp.maxLength=10;inp.autocomplete='off';inp.placeholder='המלך';inp.value=ui.suffix();inp.setAttribute('aria-label','השם של הנהוראי שלך');
  nr.append(el('span','name-fixed','נהוראי'),inp);
  const go=el('button','btn','נכנסים למירוץ'),hint=el('small','name-hint');
  go.onclick=()=>{const s=inp.value.replace(/\s+/g,' ').trim();if(s.length<2){hint.textContent='✗ צריך שם אחרי נהוראי, לפחות 2 אותיות';hint.className='name-hint bad';inp.focus();return;}join(s);render();};
  box.append(nr,hint,el('div','lv-actions'));box.lastChild.append(go);body.append(box);
}
function renderLobby(body,R){
  const mine=me(),h=host(),isHost=mine&&mine.host;
  $('#lvTitle').textContent='תביא את החבר׳ה';
  $('#lvSub').textContent=R.phase==='done'?'המירוץ נגמר. עוד סיבוב?':isHost?'שולחים לחבר׳ה ומחכים שייכנסו':`${h?h.name:'החבר'} פתח מירוץ חי`;
  body.append(players(R.players,6));
  const acts=el('div','lv-actions');
  if(isHost){
    const share=el('button','btn ghost','📲 שולחים לחבר׳ה בוואטסאפ');share.onclick=()=>{track('live_invite_sent',{players:R.players.length});shareLive(conn.code);};
    const go=el('button','btn',R.phase==='done'?'🔥 עוד סיבוב':'יאללה למירוץ');
    go.onclick=()=>{if(R.phase==='done'){conn.send({t:'again'});return;}
      track('live_started',{players:R.players.length});conn.send({t:'start',track:pick(trackList().filter(trackOpen)).id});};
    acts.append(go,share);
  }else acts.append(el('p','lv-text',R.phase==='done'?`מחכים ש${h?h.name:'המארח'} יפתח עוד סיבוב`:`מחכים ש${h?h.name:'המארח'} ילחץ יאללה`));
  body.append(acts,el('p','lv-code',conn.code));
}
// 30 seconds: the Nehorai, the ride, or a random one, and "ready"
function renderBuild(body,R){
  const mine=me();$('#lvTitle').textContent='30 שניות להתארגן';
  $('#lvSub').textContent='בוחרים נהוראי וכלי. כשכולם מוכנים, יוצאים';
  const timer=el('p','lv-timer'),stage=el('canvas','lv-stage'),rides=el('div','lv-rides');
  const upd=()=>{const s=Math.max(0,Math.ceil((R.buildUntil-conn.now())/1000));timer.textContent=String(s);};upd();tick=setInterval(upd,250);
  const send=ready=>conn.send({t:'look',...hello(),ready});
  Object.values(VEH).filter(v=>isOpen(v.req)).forEach(v=>{const b=el('button','tab'+(state.vid===v.id?' on':''),v.name);
    b.onclick=()=>{state.vid=v.id;state.color=null;send(!!(mine&&mine.ready));render();};rides.append(b);});
  const dice=el('button','btn ghost','🎲 נהוראי אחר'),ready=el('button','btn',mine&&mine.ready?'✓ מוכן, מחכים לשאר':'מוכן ✓');
  dice.onclick=()=>{const n=state.look.name;state.look={...randLook(),name:n};send(!!(mine&&mine.ready));};
  ready.disabled=!!(mine&&mine.ready);ready.onclick=()=>{saveLook();send(true);track('live_ready');};
  const acts=el('div','lv-actions');acts.append(ready,dice);
  const who=el('p','lv-text',R.players.map(p=>`${p.ready?'✅':'⏳'} ${p.name}`).join('   '));
  body.append(timer,stage,rides,acts,who);
  const t0=performance.now(),f=now=>{if(!stage.isConnected)return;const r=stage.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
    if(stage.width!==Math.round(r.width*dpr)){stage.width=Math.round(r.width*dpr);stage.height=Math.round(r.height*dpr);}
    const c=stage.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,r.width,r.height);
    drawComposition(c,r.width,r.height,{mode:'veh',look:state.look,vid:state.vid,color:vColor(),wheels:state.wheels,stickers:state.stickers,t:(now-t0)/1000});
    stageRAF=requestAnimationFrame(f);};stageRAF=requestAnimationFrame(f);
}
function renderError(text){const body=$('#lvBody');body.replaceChildren();$('#lvTitle').textContent='מירוץ חי';$('#lvSub').textContent='';
  const back=el('button','btn','לשחק רגיל');back.onclick=()=>{leave();show('title');};
  body.append(el('p','lv-big','אופס'),el('p','lv-text',text),el('div','lv-actions'));body.lastChild.append(back);open();}

// after a live race: "another round with the guys" goes back to the room instead of a race alone
const againAlone=$('#againBtn').onclick;
$('#againBtn').onclick=e=>{if(!state.live)return againAlone(e);open();render();};

// the home button shows only where the room server is reachable; ?live=<CODE> opens the join screen
function initLive(helpers){
  ui=helpers;liveReady().then(ok=>{$('#liveBtn').hidden=!ok;});
  const code=new URLSearchParams(location.search).get('live');
  if(liveOn()&&isCode(code)){track('live_link_opened');joinFromLink(code);}
}

export { initLive };

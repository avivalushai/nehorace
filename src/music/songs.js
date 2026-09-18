// The player's own songs per stage, and the songs sheet.
import { $ } from '../core/util.js';
import { step } from '../ui/garage.js';
import { Music, musicInit, musicStart } from './engine.js';

function garageMusic(){const z=step===0?3:4;if(Music.on&&Music.target>=3)setStage(z);else musicStart(z);if(!Songs.prompted&&!Object.keys(Songs.slots).length){Songs.prompted=true;openSongs();}}

// ================= USER SONGS (real songs from the player's device) =================
const Songs={slots:{},prompted:false};
const SONG_SLOTS=[['all','כל המשחק'],[3,'בחירת נהוראי'],[4,'בחירת כלי ועיצוב'],[0,'מירוץ: שער הפארק'],[1,'מירוץ: אזור המנגלים'],[2,'מירוץ: הישורת האחרונה']];
function trackFor(z){return Songs.slots[z]||Songs.slots.all||null;}
function playUser(tr){
  if(!Music.ctx)return;const now=Music.ctx.currentTime;
  if(Music.userCur===tr){if(tr&&tr.audio.paused)tr.audio.play().catch(()=>{});return;}
  const old=Music.userCur;
  if(old){old.gain.gain.cancelScheduledValues(now);old.gain.gain.setTargetAtTime(0,now,.25);setTimeout(()=>{if(Music.userCur!==old)old.audio.pause();},1400);}
  Music.userCur=tr;
  if(tr){tr.gain.gain.cancelScheduledValues(now);tr.gain.gain.setValueAtTime(.0001,now);tr.gain.gain.setTargetAtTime(1,now,.3);tr.audio.play().catch(()=>{});}
}
function setStage(z){
  Music.target=z;if(!Music.ctx||!Music.on)return;const now=Music.ctx.currentTime,tr=trackFor(z);
  playUser(tr);
  if(tr){Music.zone=Music.pend=z;Music.procGain.gain.setTargetAtTime(0,now,.2);}
  else{Music.pend=z;Music.procGain.gain.setTargetAtTime(Music.procEnabled?1:0,now,.2);}
}
function addSong(slot,file){
  if(!file||!musicInit())return;const c=Music.ctx;if(c.state==='suspended')c.resume();
  removeSong(slot,true);
  const url=URL.createObjectURL(file),a=new Audio();a.src=url;a.loop=true;a.preload='auto';a.setAttribute('playsinline','');
  const g=c.createGain();g.gain.value=0;c.createMediaElementSource(a).connect(g);g.connect(Music.master);
  Songs.slots[slot]={name:file.name.replace(/\.[^.]+$/,''),url,audio:a,gain:g};
  renderSongs();if(Music.on)setStage(Music.target);
}
function removeSong(slot,quiet){const o=Songs.slots[slot];if(!o)return;if(Music.userCur===o){o.audio.pause();Music.userCur=null;}o.audio.removeAttribute('src');URL.revokeObjectURL(o.url);o.gain.disconnect();delete Songs.slots[slot];if(!quiet){renderSongs();if(Music.on)setStage(Music.target);}}
function renderSongs(){
  const box=$('#songRows');box.innerHTML='';
  SONG_SLOTS.forEach(([slot,label])=>{const o=Songs.slots[slot];const row=document.createElement('div');row.className='srow';
    const fallback=slot==='all'?(Music.procEnabled?'מוזיקה מובנית':'ללא שיר'):(Songs.slots.all?'השיר של כל המשחק':Music.procEnabled?'מוזיקה מובנית':'ללא שיר');
    row.innerHTML=`<b>${label}</b><small></small><span class="acts"><label class="pickbtn">${o?'החלפה':'בחירת שיר'}<input type="file" accept="audio/*"></label>${o?'<button class="rmbtn">הסרה</button>':''}</span>`;
    row.querySelector('small').textContent=o?('🎵 '+o.name):fallback;
    row.querySelector('input').onchange=e=>addSong(slot,e.target.files[0]);
    if(o)row.querySelector('.rmbtn').onclick=()=>removeSong(slot);
    box.appendChild(row);});
  $('#procChk').checked=Music.procEnabled;
}
function openSongs(){renderSongs();$('#songsSheet').classList.add('on');}
$('#songsBtn').onclick=openSongs;
$('#songsClose').onclick=()=>$('#songsSheet').classList.remove('on');
$('#songsSheet').onclick=e=>{if(e.target.id==='songsSheet')$('#songsSheet').classList.remove('on');};
$('#procChk').onchange=e=>{Music.procEnabled=e.target.checked;renderSongs();if(Music.on)setStage(Music.target);};

export { garageMusic, playUser, setStage };

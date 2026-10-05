// Stage music: which track plays in each stage (garage steps, race zones).
import { step } from '../ui/garage.js';
import { Music, musicStart } from './engine.js';

function garageMusic(){const z=step===0?3:4;if(Music.on&&Music.target>=3)setStage(z);else musicStart(z);}

// ================= STAGE TRACKS =================
// Songs.slots maps a stage (0-2 race zones, 3 character, 4 vehicle, 'all' fallback) to {audio,gain}.
// The menus (building the Nehorai, the vehicle, its design) play a bundled track: assets/music/menu.mp3
// (Pixabay, "Islamic Middle Eastern Music" by Starostin, free under the Pixabay Content License). The race keeps the procedural music.
const Songs={slots:{}};
const MENU_SRC='assets/music/menu.mp3';
// the audio element and its gain are made on first use, once the audio context exists (after the player's first tap)
function bundled(src){let tr=null;return()=>{if(tr||!Music.ctx)return tr;
  const audio=new Audio(src);audio.loop=true;audio.preload='auto';const gain=Music.ctx.createGain();gain.gain.value=0;
  Music.ctx.createMediaElementSource(audio).connect(gain);gain.connect(Music.master);tr={audio,gain};return tr;};}
const menuTrack=bundled(MENU_SRC);
function trackFor(z){return Songs.slots[z]||(z===3||z===4?menuTrack():null)||Songs.slots.all||null;}
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
export { garageMusic, playUser, setStage };

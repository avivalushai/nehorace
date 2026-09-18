// Stage music: which track plays in each stage (garage steps, race zones).
import { step } from '../ui/garage.js';
import { Music, musicStart } from './engine.js';

function garageMusic(){const z=step===0?3:4;if(Music.on&&Music.target>=3)setStage(z);else musicStart(z);}

// ================= STAGE TRACKS =================
// Songs.slots maps a stage (0-2 race zones, 3 character, 4 vehicle, 'all' fallback) to {audio,gain}.
// Empty for now: the player's own songs were removed; licensed tracks bundled with the game will go here.
const Songs={slots:{}};
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
export { garageMusic, playUser, setStage };

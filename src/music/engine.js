// Procedural Mizrahi-style music engine (WebAudio).
import { $ } from '../core/util.js';
import { playUser, setStage } from './songs.js';

// ================= MUSIC — original procedural Mizrahi-style tracks =================
const ZONES=[
 {name:'שער הפארק',bpm:100,root:62,scale:[0,1,4,5,7,8,10],drum:'D.T..kT.D.k.T.k.',bass:{0:0,6:7,8:0,12:5},seed:11,clap:false},
 {name:'אזור המנגלים',bpm:114,root:64,scale:[0,1,4,5,7,8,11],drum:'D.D..kT.D.k.T.k.',bass:{0:0,2:0,6:7,8:0,12:7},seed:23,clap:false},
 {name:'הישורת האחרונה',bpm:132,root:69,scale:[0,1,4,5,7,8,10],drum:'D.TkkkT.DkTkT.kk',bass:{0:0,3:0,6:7,8:0,11:5,12:7},seed:37,clap:true},
];
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function motif(seed,len,hi){const r=mulberry(seed);let deg=Math.floor(r()*3),st=0;const out=[];
  while(st<len){let dur=r()<.25?1:r()<.65?2:r()<.85?3:4;if(st+dur>len)dur=len-st;
    if(st>0&&r()<.14){st+=dur;continue;}
    deg=Math.max(-2,Math.min(hi,deg+[-2,-1,-1,-1,1,1,1,2,0,3,-3][Math.floor(r()*11)]));out.push({s:st,deg,dur,orn:r()<.22});st+=dur;}
  return out;}
function buildMelody(Z,hi){const A=motif(Z.seed,32,hi),B=motif(Z.seed+5,32,hi),m=new Map();
  const cad=ph=>{const q=ph.map(n=>({...n}));if(q.length){q[q.length-1].deg=0;q[q.length-1].orn=true;if(q.length>1)q[q.length-2].deg=1;}return q;};
  [[A,0],[cad(A),32],[B,64],[cad(B),96]].forEach(([ph,off])=>ph.forEach(n=>m.set(n.s+off,n)));Z.mel=m;Z.melLen=128;}
ZONES.push(
 {name:'בחירת נהוראי',bpm:92,root:60,scale:[0,2,3,5,7,8,11],minor:true,dv:.7,drum:'D...T.kkD.D.T...',bass:{0:0,8:0,10:7,12:5},seed:51,clap:false},
 {name:'מוסך הכלים',bpm:106,root:65,scale:[0,1,4,5,7,8,10],dv:.8,drum:'D.T.kkT.D.kkT.k.',bass:{0:0,6:7,8:0,10:0,12:5},seed:64,clap:false});
ZONES.forEach((Z,i)=>buildMelody(Z,i===2?6:8));
const midiHz=m=>440*Math.pow(2,(m-69)/12);
function degMidi(Z,deg){const o=Math.floor(deg/7),i=((deg%7)+7)%7;return Z.root+o*12+Z.scale[i];}
const Music={ctx:null,muted:false,on:false,leadOn:false,zone:0,pend:0,step:0,next:0,timer:0,vol:.5,target:0,userCur:null,procEnabled:false};
function musicInit(){
  if(Music.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  const c=Music.ctx=new AC();
  Music.master=c.createGain();Music.master.gain.value=0;const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;
  Music.master.connect(comp);comp.connect(c.destination);Music.procGain=c.createGain();Music.procGain.gain.value=0;Music.procGain.connect(Music.master);Music.bus=Music.procGain;
  const nb=c.createBuffer(1,c.sampleRate,c.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;Music.noise=nb;
  const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=2600;f.Q.value=2;
  const g=c.createGain();g.gain.value=0;const o1=c.createOscillator(),o2=c.createOscillator();o1.type='sawtooth';o2.type='square';o2.detune.value=8;
  const og2=c.createGain();og2.gain.value=.45;const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=5.6;lg.gain.value=0;lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);
  o1.connect(f);o2.connect(og2);og2.connect(f);f.connect(g);g.connect(Music.bus);
  const dl=c.createDelay(1);dl.delayTime.value=.27;const fb=c.createGain();fb.gain.value=.28;const wet=c.createGain();wet.gain.value=.2;g.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(Music.bus);
  o1.start();o2.start();lfo.start();Music.lead={o1,o2,g,lg};return true;
}
function mEnv(g,t,peak,dec){g.gain.setValueAtTime(peak,t);g.gain.exponentialRampToValueAtTime(.0001,t+dec);}
function doum(t,v){const c=Music.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(52,t+.16);mEnv(g,t,.9*(v||1),.32);o.connect(g);g.connect(Music.bus);o.start(t);o.stop(t+.36);}
function tek(t,v){const c=Music.ctx,sb=c.createBufferSource();sb.buffer=Music.noise;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=3800;f.Q.value=1.4;const g=c.createGain();mEnv(g,t,.55*v,.07);sb.connect(f);f.connect(g);g.connect(Music.bus);sb.start(t,Math.random()*.5);sb.stop(t+.09);
  const o=c.createOscillator(),og=c.createGain();o.type='triangle';o.frequency.value=820;mEnv(og,t,.12*v,.05);o.connect(og);og.connect(Music.bus);o.start(t);o.stop(t+.06);}
function clap(t){const c=Music.ctx;for(let i=0;i<3;i++){const tt=t+i*.011,sb=c.createBufferSource();sb.buffer=Music.noise;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1600;f.Q.value=.9;const g=c.createGain();mEnv(g,tt,.3,.08);sb.connect(f);f.connect(g);g.connect(Music.bus);sb.start(tt,Math.random()*.5);sb.stop(tt+.1);}}
function bassN(t,m,dur){const c=Music.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='triangle';o.frequency.value=midiHz(m);f.type='lowpass';f.frequency.value=500;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.45,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(f);f.connect(g);g.connect(Music.bus);o.start(t);o.stop(t+dur+.02);}
function stab(t,notes){const c=Music.ctx,f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=1800;const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+.11);f.connect(g);g.connect(Music.bus);
  notes.forEach(m=>{const o=c.createOscillator();o.type='square';o.frequency.value=midiHz(m);o.connect(f);o.start(t);o.stop(t+.13);});}
function leadN(t,m,dur,grace){const L=Music.lead,hz=midiHz(m);
  [L.o1,L.o2].forEach(o=>{o.frequency.cancelScheduledValues(t);if(grace){o.frequency.setValueAtTime(midiHz(grace),t);o.frequency.setTargetAtTime(hz,t+.035,.018);}else o.frequency.setTargetAtTime(hz,t,.012);});
  L.g.gain.cancelScheduledValues(t);L.g.gain.setTargetAtTime(.15,t,.008);L.g.gain.setTargetAtTime(.0001,t+dur*.92,.03);
  L.lg.gain.cancelScheduledValues(t);L.lg.gain.setValueAtTime(0,t);L.lg.gain.linearRampToValueAtTime(hz*.009,t+Math.min(.25,dur*.7));}
function mStep(step,t){
  const Z=ZONES[Music.zone],s16=step%16,bar=Math.floor(step/16),sd=60/Z.bpm/4;
  const dv=Z.dv||1,ch=Z.drum[s16];if(ch==='D')doum(t,dv);else if(ch==='T')tek(t,dv);else if(ch==='k')tek(t,.38*dv);
  if(Music.pend!==Music.zone&&s16>=8&&ch==='.')tek(t,.7);
  if(Z.clap&&(s16===4||s16===12))clap(t);
  const cr=Z.minor?[0,0,7,5][bar%4]:(bar%4===2?1:0),base=Z.root-12+cr,third=Z.minor&&cr!==7?3:4;
  if(s16%4===2)stab(t,[base,base+third,base+7]);
  const b=Z.bass[s16];if(b!==undefined)bassN(t,Z.root-24+cr+b,sd*2);
  const n=Music.leadOn&&Z.mel.get(step%Z.melLen);if(n)leadN(t,degMidi(Z,n.deg),n.dur*sd,n.orn?degMidi(Z,n.deg+1):0);
}
function mTick(){if(!Music.on)return;const c=Music.ctx;
  while(Music.next<c.currentTime+.14){mStep(Music.step,Music.next);Music.next+=60/ZONES[Music.zone].bpm/4;Music.step++;
    if(Music.step%16===0&&Music.pend!==Music.zone){Music.zone=Music.pend;Music.step=0;}}}
function musicStart(z){z=z||0;try{if(!musicInit())return;const c=Music.ctx;if(c.state==='suspended')c.resume();Music.on=true;Music.leadOn=z>=3;Music.zone=Music.pend=z;Music.step=0;Music.next=c.currentTime+.08;
  Music.master.gain.cancelScheduledValues(c.currentTime);Music.master.gain.setTargetAtTime(Music.muted?0:Music.vol,c.currentTime,.1);clearInterval(Music.timer);Music.timer=setInterval(mTick,25);setStage(z);}catch(e){}}
function musicStop(){if(!Music.ctx)return;Music.on=false;clearInterval(Music.timer);const c=Music.ctx;Music.master.gain.cancelScheduledValues(c.currentTime);Music.master.gain.setTargetAtTime(0,c.currentTime,.25);playUser(null);}
function toggleMute(){Music.muted=!Music.muted;if(Music.ctx&&Music.on)Music.master.gain.setTargetAtTime(Music.muted?0:Music.vol,Music.ctx.currentTime,.05);['#muteBtn','#gMuteBtn'].forEach(q=>$(q).textContent=Music.muted?'🔇 מוזיקה':'🔊 מוזיקה');}
$('#muteBtn').onclick=toggleMute;$('#gMuteBtn').onclick=toggleMute;

export { ZONES, Music, musicInit, musicStart, musicStop };

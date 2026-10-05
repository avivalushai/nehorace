// Challenges (?vs=<cid>): one link for a whole group of friends. The sender's finished race starts it, and every
// finished race from the link joins it. Fails quietly like the leaderboard: no server means a normal race.
import { playerId } from './leaderboard.js';

const RUN_KEY='nehorace-run';
const isCid=c=>/^[a-f0-9]{12}$/.test(c||'');
function newCid(){const b=new Uint8Array(6);crypto.getRandomValues(b);return [...b].map(x=>x.toString(16).padStart(2,'0')).join('');}
const body=run=>({name:run.name,look:run.look,vid:run.vid,color:run.color,time:run.time,s:run.s});
async function post(data,keepalive){
  try{const res=await fetch('api/challenge',{method:'POST',keepalive,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    if(!res.ok)return null;const d=await res.json();return d.disabled||d.missing?null:d;}catch(e){return null;}
}
// the id is made here and the upload runs beside the share sheet, so the share link is ready on the tap
function createChallenge(cid,run){const id=playerId();if(id)post({cid,id,create:true,seed:run.seed,track:run.track,run:body(run)},true);}
async function joinChallenge(cid,run){const id=playerId();return id?post({cid,id,run:body(run)}):null;}
async function loadChallenge(cid){
  if(!isCid(cid))return null;
  try{const res=await fetch(`api/challenge?c=${cid}&id=${playerId()||''}`);if(!res.ok)return null;const d=await res.json();return d.disabled||d.missing?null:d;}catch(e){return null;}
}
// the last finished race stays in this browser, so a challenge can also be sent from the title screen
function saveRun(run){try{localStorage.setItem(RUN_KEY,JSON.stringify(run));}catch(e){}}
function savedRun(){try{const r=JSON.parse(localStorage.getItem(RUN_KEY)||'null');return r&&Array.isArray(r.s)&&r.seed>=0&&r.track?r:null;}catch(e){return null;}}

export { newCid, createChallenge, joinChallenge, loadChallenge, saveRun, savedRun };

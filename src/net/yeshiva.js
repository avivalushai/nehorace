// Yeshivas (?vs=<cid>): a steady group of friends, a new round and track every week (api/yeshiva.mjs). Every call fails
// quietly like the leaderboard: no server means the game plays on with normal races.
import { playerId } from './leaderboard.js';

const isCid=c=>/^[a-f0-9]{12}$/.test(c||'');
function newCid(){const b=new Uint8Array(6);crypto.getRandomValues(b);return [...b].map(x=>x.toString(16).padStart(2,'0')).join('');}
const body=run=>({seed:run.seed,track:run.track,name:run.name,look:run.look,vid:run.vid,color:run.color,time:run.time,s:run.s});
async function call(data,keepalive){
  const id=playerId();if(!id)return null;
  try{const res=await fetch('api/yeshiva',{method:'POST',keepalive,headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...data})});
    if(!res.ok)return null;const d=await res.json();return d.disabled||d.missing||d.error?null:d;}catch(e){return null;}
}
async function read(q){
  try{const res=await fetch(`api/yeshiva?${q}&id=${playerId()||''}`);if(!res.ok)return null;const d=await res.json();return d.disabled||d.missing||d.error?null:d;}catch(e){return null;}
}
// the id is made here and the request runs beside the share sheet, so the link is ready on the tap
function createYeshiva(cid,word,name,run){return call({action:'create',cid,word,name,...(run?{run:body(run)}:{})},true);}
const raceYeshiva=(cid,run)=>call({action:'race',cid,run:body(run)});
const renameYeshiva=(cid,word)=>call({action:'rename',cid,word});
const loadYeshiva=cid=>isCid(cid)?read(`y=${cid}`):Promise.resolve(null);
const myYeshivas=()=>read('list=1');
const markSeen=cids=>call({action:'seen',cids});
const claimBonus=key=>call({action:'claim',key});

export { newCid, createYeshiva, raceYeshiva, renameYeshiva, loadYeshiva, myYeshivas, markSeen, claimBonus };

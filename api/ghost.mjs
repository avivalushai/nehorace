// Ghosts: a finished race, recorded so a friend can race against it on the same track.
// POST /api/ghost {gid, ghost} stores it (the browser makes the gid, so the share link is ready on the tap);
// GET /api/ghost?g=<gid> reads it back. Ghosts live for 30 days.
import { hasDb, pipeline, json, cleanName, cleanLook, clientIp } from './_lib.mjs';

const TTL=60*60*24*30,IP_PER_HOUR=60;
const TRACKS=['park','promenade','hood'];
const isGid=g=>typeof g==='string'&&/^[a-f0-9]{12}$/.test(g);
const key=g=>`gh:${g}`;

// everything the game draws comes from here, so only known shapes pass: numbers stay numbers, ids stay short
function cleanGhost(g){
  if(!g||typeof g!=='object')return null;
  const seed=+g.seed,time=+g.time,s=g.s;
  if(!(Number.isInteger(seed)&&seed>=0&&seed<2**32))return null;
  if(!TRACKS.includes(g.track))return null;
  if(!(time>=30&&time<=300))return null;
  if(typeof g.vid!=='string'||!/^[a-z0-9]{1,12}$/.test(g.vid))return null;
  if(typeof g.color!=='string'||!/^#[0-9a-fA-F]{6}$/.test(g.color))return null;
  // samples: d and x, ten times a second, the whole race
  if(!Array.isArray(s)||s.length<20||s.length>6000||s.length%2||!s.every(v=>Number.isInteger(v)&&Math.abs(v)<100000))return null;
  const look=cleanLook(g.look);
  return {seed,track:g.track,time,vid:g.vid,color:g.color,name:cleanName(g.name),look:look?JSON.parse(look):{},s};
}

export async function POST(req){
  if(!hasDb())return json({disabled:true});
  let b;try{b=await req.json();}catch{return json({error:'bad-json'},400);}
  if(!isGid(b.gid))return json({error:'bad-id'},400);
  const ghost=cleanGhost(b.ghost);if(!ghost)return json({error:'bad-ghost'},400);
  const hour=Math.floor(Date.now()/3600000),ipKey=`ipg:${clientIp(req)}:${hour}`;
  const [n]=await pipeline([['INCR',ipKey],['EXPIRE',ipKey,'3600']]);
  if(n>IP_PER_HOUR)return json({error:'too-fast'},429);
  const [ok]=await pipeline([['SET',key(b.gid),JSON.stringify(ghost),'NX','EX',String(TTL)]]);
  return json({ok:ok==='OK'});
}

export async function GET(req){
  if(!hasDb())return json({disabled:true});
  const g=new URL(req.url).searchParams.get('g');
  if(!isGid(g))return json({error:'bad-id'},400);
  const [v]=await pipeline([['GET',key(g)]]);
  return v?json({ghost:JSON.parse(v)}):json({missing:true});
}

// Challenges: one link, a whole group of friends. The player who sends it starts the challenge with a finished race;
// everyone who opens the link races on the same track against the sender and the four best of the group so far,
// and their own finished race joins the challenge. Races are recorded lines the game replays.
//   POST /api/challenge {cid, id, run, create?, seed?, track?}  start a challenge (create) or add a finished race
//   GET  /api/challenge?c=<cid>&id=<player id>                  the track, the group table and who to race against
// Keys live for 30 days from the last race: chm:<cid> (seed, track, sender), ch:<cid> (player -> name, look, time),
// chs:<cid> (player -> the recorded line, kept apart so the table reads small)
import { hasDb, pipeline, json, isId, cleanName, cleanLook, clientIp } from './_lib.mjs';

const TTL=60*60*24*30,IP_PER_HOUR=60,MAX_PLAYERS=30,RIVALS=4;
const TRACKS=['park','promenade','hood'];
const isCid=c=>typeof c==='string'&&/^[a-f0-9]{12}$/.test(c);
const K={meta:c=>`chm:${c}`,runs:c=>`ch:${c}`,lines:c=>`chs:${c}`};

// everything the game draws comes from here, so only known shapes pass: numbers stay numbers, ids stay short
function cleanRun(r){
  if(!r||typeof r!=='object')return null;
  const time=+r.time,s=r.s;
  if(!(time>=30&&time<=300))return null;
  if(typeof r.vid!=='string'||!/^[a-z0-9]{1,12}$/.test(r.vid))return null;
  if(typeof r.color!=='string'||!/^#[0-9a-fA-F]{6}$/.test(r.color))return null;
  // the line: how far along and how far off the middle, ten times a second, the whole race
  if(!Array.isArray(s)||s.length<20||s.length>6000||s.length%2||!s.every(v=>Number.isInteger(v)&&Math.abs(v)<100000))return null;
  const look=cleanLook(r.look);
  return {run:{name:cleanName(r.name),look:look?JSON.parse(look):{},vid:r.vid,color:r.color,time},s};
}

// what a player gets: the track, everyone's best time, and the lines to race (the sender and the best four, never themselves)
async function view(cid,id){
  const [metaRaw,flat]=await pipeline([['GET',K.meta(cid)],['HGETALL',K.runs(cid)]]);
  if(!metaRaw)return null;
  const meta=JSON.parse(metaRaw),runs=[];
  for(let i=0;i<flat.length;i+=2)runs.push({pid:flat[i],...JSON.parse(flat[i+1])});
  runs.sort((a,b)=>a.time-b.time);
  const sender=runs.find(r=>r.pid===meta.owner),others=runs.filter(r=>r.pid!==meta.owner&&r.pid!==id).slice(0,RIVALS);
  const pick=[...(sender&&sender.pid!==id?[sender]:[]),...others];
  const lines=pick.length?await pipeline([['HMGET',K.lines(cid),...pick.map(r=>r.pid)]]).then(([v])=>v):[];
  const racers=pick.map((r,i)=>lines[i]&&{name:r.name,look:r.look,vid:r.vid,color:r.color,time:r.time,owner:r.pid===meta.owner,s:JSON.parse(lines[i])}).filter(Boolean);
  const table=runs.map((r,i)=>({rank:i+1,name:r.name,look:r.look,time:r.time,me:r.pid===id,owner:r.pid===meta.owner}));
  return {seed:meta.seed,track:meta.track,ownerName:sender?sender.name:'',mine:meta.owner===id,racers,table};
}

export async function POST(req){
  if(!hasDb())return json({disabled:true});
  let b;try{b=await req.json();}catch{return json({error:'bad-json'},400);}
  const {cid,id}=b;
  if(!isCid(cid)||!isId(id))return json({error:'bad-id'},400);
  const clean=cleanRun(b.run);if(!clean)return json({error:'bad-run'},400);
  const hour=Math.floor(Date.now()/3600000),ipKey=`ipc:${clientIp(req)}:${hour}`;
  const [n]=await pipeline([['INCR',ipKey],['EXPIRE',ipKey,'3600']]);
  if(n>IP_PER_HOUR)return json({error:'too-fast'},429);
  if(b.create){
    const seed=+b.seed;
    if(!(Number.isInteger(seed)&&seed>=0&&seed<2**32)||!TRACKS.includes(b.track))return json({error:'bad-track'},400);
    await pipeline([['SET',K.meta(cid),JSON.stringify({seed,track:b.track,owner:id}),'NX','EX',String(TTL)]]);
  }
  const [metaRaw,prev,flat]=await pipeline([['GET',K.meta(cid)],['HGET',K.runs(cid),id],['HGETALL',K.runs(cid)]]);
  if(!metaRaw)return json({missing:true});
  // one entry per player, their best; a full challenge still answers with the table
  const better=!prev||clean.run.time<JSON.parse(prev).time,room=prev||flat.length/2<MAX_PLAYERS;
  if(better&&room)await pipeline([
    ['HSET',K.runs(cid),id,JSON.stringify(clean.run)],['HSET',K.lines(cid),id,JSON.stringify(clean.s)],
    ['EXPIRE',K.meta(cid),String(TTL)],['EXPIRE',K.runs(cid),String(TTL)],['EXPIRE',K.lines(cid),String(TTL)]]);
  return json({...await view(cid,id),full:!room});
}

export async function GET(req){
  if(!hasDb())return json({disabled:true});
  const q=new URL(req.url).searchParams,cid=q.get('c'),id=q.get('id');
  if(!isCid(cid))return json({error:'bad-id'},400);
  const v=await view(cid,isId(id)?id:'');
  return v?json(v):json({missing:true});
}

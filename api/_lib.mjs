// Shared server code for the leaderboard (files starting with _ are not routes on Vercel).
// Storage is Upstash Redis over its REST API with plain fetch, so there are no dependencies.
// Vercel's Upstash integration sets KV_REST_API_URL/KV_REST_API_TOKEN (older setups: UPSTASH_REDIS_REST_*).

// if the integration was connected with a custom prefix (e.g. STORAGE_REST_API_URL), find it by suffix
const bySuffix=suf=>Object.entries(process.env).find(([k,v])=>k.endsWith(suf)&&v)?.[1];
const dbUrl=()=>process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL||bySuffix('_REST_API_URL');
const dbToken=()=>process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN||bySuffix('_REST_API_TOKEN');
export const hasDb=()=>!!(dbUrl()&&dbToken());

// run several Redis commands in one round trip; returns their results in order
export async function pipeline(cmds){
  const r=await fetch(dbUrl().replace(/\/$/,'')+'/pipeline',{method:'POST',headers:{Authorization:`Bearer ${dbToken()}`,'Content-Type':'application/json'},body:JSON.stringify(cmds)});
  if(!r.ok)throw new Error(`redis ${r.status}`);
  return (await r.json()).map(x=>{if(x.error)throw new Error(x.error);return x.result;});
}

export const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});

// the leaderboard week starts on Sunday, Israel time. Key = that Sunday's date, e.g. 2026-09-13
export function weekKey(now=new Date()){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(now);
  const get=t=>p.find(x=>x.type===t).value;
  const d=new Date(Date.UTC(+get('year'),+get('month')-1,+get('day')));
  d.setUTCDate(d.getUTCDate()-['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday')));
  return d.toISOString().slice(0,10);
}

export const KEYS={week:wk=>`lb:week:${wk}`,wins:'lb:wins',names:'names',looks:'looks',claim:norm=>`nm:${norm}`,claimOf:'nmof',banned:'banned',rate:id=>`rl:${id}`,ipRate:(ip,h)=>`ipl:${ip}:${h}`};
export const isId=id=>typeof id==='string'&&/^[a-f0-9]{32}$/.test(id);

// names are shown to everyone: strip invisible and direction-control characters, cap at 10 like the game,
// and replace hateful ones. The game's own street humor is fine; slurs against groups are not.
const BLOCK=['כושי','ערבוש','נאצי','היטלר','nigger','nigga','nazi','hitler','faggot','kike','מחבל','אנס','פדופיל'];
// every player is "נהוראי <something>": the part after it (up to 10 characters) is what makes the name theirs
export const PREFIX='נהוראי';
// the free part of a name (after "נהוראי", or after "ישיבת"): visible characters only, up to 10, nothing hateful
export function cleanSuffix(raw,prefix){
  const n=String(raw||'').replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g,'').replace(/\s+/g,' ').trim();
  const suffix=(n.startsWith(prefix)?n.slice(prefix.length):n).trim().slice(0,10);
  const flat=suffix.toLowerCase().replace(/[\s.\-_*!]/g,'');
  return BLOCK.some(w=>flat.includes(w))?'':suffix;
}
export function cleanName(raw){const suffix=cleanSuffix(raw,PREFIX);return suffix?`${PREFIX} ${suffix}`:PREFIX;}
export const hasSuffix=name=>name!==PREFIX;
// names are unique regardless of spaces and letter case
export const normName=name=>name.replace(/\s+/g,'').toLowerCase();
// claim a name for a player: free, or already theirs -> true; someone else's -> false. Releases their previous name.
export async function claimName(id,name){
  const norm=normName(name);
  const [,owner,prev]=await pipeline([['SET',KEYS.claim(norm),id,'NX'],['GET',KEYS.claim(norm)],['HGET',KEYS.claimOf,id]]);
  if(owner!==id)return false;
  if(prev&&prev!==norm){const [was]=await pipeline([['GET',KEYS.claim(prev)]]);if(was===id)await pipeline([['DEL',KEYS.claim(prev)]]);}
  if(prev!==norm)await pipeline([['HSET',KEYS.claimOf,id,norm]]);
  return true;
}
export const clientIp=req=>(req.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'local';

// the player's Nehorai, drawn on the podium. Only the known slots with short lowercase ids are kept;
// the game draws nothing it doesn't know, so a crafted look can't break the board for others.
const LOOK_SLOTS=['hair','beard','cap','chain','shirt','pants','shoes','dog','acc'];
export function cleanLook(raw){
  if(!raw||typeof raw!=='object')return null;
  const out={};for(const k of LOOK_SLOTS){const v=raw[k];if(typeof v==='string'&&/^[a-z0-9]{1,12}$/.test(v))out[k]=v;}
  return Object.keys(out).length?JSON.stringify(out):null;
}

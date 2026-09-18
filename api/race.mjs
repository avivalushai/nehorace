// POST /api/race: a finished race. Updates the weekly board (best single-race score this week)
// and the all-time wins board, then returns the player's ranks.
// Body: {id, name, score, pos, time}. Scores come from the browser, so they are sanity-checked and rate limited.
import { hasDb, pipeline, json, weekKey, KEYS, isId, cleanName, clientIp } from './_lib.mjs';

const MAX_SCORE=3000;          // a great race is around 1,000 "street points"
const MIN_TIME=30,MAX_TIME=300; // the track takes about 45 seconds
const RATE=+(process.env.RATE_LIMIT_SECONDS??20); // one result per player per 20 s (a race is longer than that)
const IP_PER_HOUR=120;

export async function POST(req){
  if(!hasDb())return json({disabled:true}); // no database connected yet: a normal answer, not an error
  let b;try{b=await req.json();}catch{return json({error:'bad-json'},400);}
  const {id}=b,score=Math.floor(+b.score),pos=Math.floor(+b.pos),time=+b.time;
  if(!isId(id))return json({error:'bad-id'},400);
  if(!(score>=0&&score<=MAX_SCORE)||!(pos>=1&&pos<=6)||!(time>=MIN_TIME&&time<=MAX_TIME))return json({error:'implausible'},400);
  const name=cleanName(b.name),wk=weekKey(),hour=Math.floor(Date.now()/3600000);
  const [banned,fresh,ipCount]=await pipeline([
    ['SISMEMBER',KEYS.banned,id],
    RATE>0?['SET',KEYS.rate(id),'1','NX','EX',String(RATE)]:['ECHO','OK'],
    ['INCR',KEYS.ipRate(clientIp(req),hour)],
  ]);
  if(banned)return json({error:'banned'},403);
  if(fresh===null||ipCount>IP_PER_HOUR)return json({error:'too-fast'},429);
  const cmds=[
    ['EXPIRE',KEYS.ipRate(clientIp(req),hour),'3600'],
    ['HSET',KEYS.names,id,name],
    ['ZADD',KEYS.week(wk),'GT',String(score),id],
    ['EXPIRE',KEYS.week(wk),String(60*60*24*42)],
  ];
  if(pos===1)cmds.push(['ZINCRBY',KEYS.wins,'1',id]);
  await pipeline(cmds);
  const [wr,ws,nr,ns]=await pipeline([['ZREVRANK',KEYS.week(wk),id],['ZSCORE',KEYS.week(wk),id],['ZREVRANK',KEYS.wins,id],['ZSCORE',KEYS.wins,id]]);
  return json({week:{start:wk,rank:wr===null?null:wr+1,score:ws===null?0:+ws},wins:{rank:nr===null?null:nr+1,wins:ns===null?0:+ns}});
}

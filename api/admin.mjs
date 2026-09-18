// POST /api/admin: remove a player from the boards by the name shown in the table, and ban them from
// submitting again. Body: {token, name}. Needs the ADMIN_TOKEN environment variable set in Vercel.
import { hasDb, pipeline, json, weekKey, KEYS } from './_lib.mjs';

export async function POST(req){
  const token=process.env.ADMIN_TOKEN;
  let b;try{b=await req.json();}catch{return json({error:'bad-json'},400);}
  if(!token||b.token!==token)return json({error:'forbidden'},403);
  if(!hasDb())return json({error:'no-db'},503);
  const [all]=await pipeline([['HGETALL',KEYS.names]]);
  const ids=[];for(let i=0;i<all.length;i+=2)if(all[i+1]===String(b.name||''))ids.push(all[i]);
  if(!ids.length)return json({removed:0});
  const wk=weekKey();
  await pipeline(ids.flatMap(id=>[['ZREM',KEYS.week(wk),id],['ZREM',KEYS.wins,id],['SADD',KEYS.banned,id]]));
  return json({removed:ids.length});
}

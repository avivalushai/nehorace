// Player names are "נהוראי <something>" and unique, so nobody shows up on the board as someone else.
// GET  /api/name?name=&id=  -> {available}    (checked while typing)
// POST /api/name {id,name}  -> {ok} or {taken} (claims the name for this player, releasing their old one)
import { hasDb, pipeline, json, KEYS, isId, cleanName, hasSuffix, normName, claimName } from './_lib.mjs';

export async function GET(req){
  if(!hasDb())return json({disabled:true});
  const q=new URL(req.url).searchParams,name=cleanName(q.get('name')),id=q.get('id');
  if(!hasSuffix(name))return json({available:false,name,reason:'suffix'});
  const [owner]=await pipeline([['GET',KEYS.claim(normName(name))]]);
  return json({available:!owner||(isId(id)&&owner===id),name});
}
export async function POST(req){
  if(!hasDb())return json({disabled:true});
  let b;try{b=await req.json();}catch{return json({error:'bad-json'},400);}
  if(!isId(b.id))return json({error:'bad-id'},400);
  const name=cleanName(b.name);
  if(!hasSuffix(name))return json({ok:false,reason:'suffix',name});
  return json((await claimName(b.id,name))?{ok:true,name}:{taken:true,name});
}

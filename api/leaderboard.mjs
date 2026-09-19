// GET /api/leaderboard?id=<player id>: top 50 of the weekly board and of the wins board, plus the
// asking player's own rank. Player ids are never sent back; rows carry a name, a "me" flag, and the
// player's Nehorai look (drawn on the podium and next to every row).
import { hasDb, pipeline, json, weekKey, KEYS, isId } from './_lib.mjs';

const TOP=50;
const pairs=flat=>{const out=[];for(let i=0;i<flat.length;i+=2)out.push([flat[i],+flat[i+1]]);return out;};

export async function GET(req){
  if(!hasDb())return json({disabled:true}); // no database connected yet: a normal answer, not an error
  const id=new URL(req.url).searchParams.get('id'),me=isId(id)?id:null,wk=weekKey();
  const [weekTop,winsTop,wr,ws,nr,ns]=await pipeline([
    ['ZREVRANGE',KEYS.week(wk),'0',String(TOP-1),'WITHSCORES'],
    ['ZREVRANGE',KEYS.wins,'0',String(TOP-1),'WITHSCORES'],
    me?['ZREVRANK',KEYS.week(wk),me]:['ECHO',''],me?['ZSCORE',KEYS.week(wk),me]:['ECHO',''],
    me?['ZREVRANK',KEYS.wins,me]:['ECHO',''],me?['ZSCORE',KEYS.wins,me]:['ECHO',''],
  ]);
  const W=pairs(weekTop),N=pairs(winsTop),ids=[...new Set([...W,...N].map(([m])=>m))];
  const [names,looks]=ids.length?await pipeline([['HMGET',KEYS.names,...ids],['HMGET',KEYS.looks,...ids]]):[[],[]];
  const nameOf=Object.fromEntries(ids.map((m,i)=>[m,names[i]||'נהוראי']));
  const lookOf=Object.fromEntries(ids.map((m,i)=>{try{return[m,JSON.parse(looks[i])];}catch{return[m,null];}}));
  const rows=list=>list.map(([m,s],i)=>({rank:i+1,name:nameOf[m],score:s,me:m===me,...(lookOf[m]?{look:lookOf[m]}:{})}));
  const mine=(r,s)=>me&&r!==null&&r!==''?{rank:+r+1,score:+s}:null;
  return json({week:{start:wk,top:rows(W),me:mine(wr,ws)},wins:{top:rows(N),me:mine(nr,ns)}});
}

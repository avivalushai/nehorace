// Yeshivas: a steady group of friends who race each other. A yeshiva lives on in weekly rounds: every Sunday (Israel
// time, like the weekly board) a new round starts on a new track and seed, with its own table and recorded races.
// Above the rounds, the yeshiva counts how many rounds each player won. The top three of a round with at least three
// players get a bonus waiting in "my yeshivas". A yeshiva is deleted only after 30 days without a single race.
//   GET  /api/yeshiva?y=<cid>&id=<player>     the yeshiva: this round's track, table and who to race (and it joins the
//                                             player's list, so a yeshiva they were invited to shows up there)
//   GET  /api/yeshiva?list=1&id=<player>      the player's yeshivas, what happened in them since they last looked, bonuses
//   POST /api/yeshiva {action, id, ...}       create {cid, word, name, run?} · race {cid, run, name} · rename {cid, word}
//                                             · seen {cids} · claim {key}
// Races are recorded lines (where along the track and how far off its middle, ten times a second) the game replays.
import { hasDb, pipeline, json, isId, cleanName, cleanSuffix, cleanLook, clientIp, weekKey } from './_lib.mjs';

const TTL=60*60*24*30,ROUND_TTL=60*60*24*40,LIST_TTL=60*60*24*90,IP_PER_HOUR=120,RIVALS=4,MAX_LIST=30;
const TRACKS=['park','promenade','hood'],BONUS=[1000,600,300],BONUS_MIN_PLAYERS=3,BONUS_PER_WEEK=3,PREFIX='ישיבת';
const isCid=c=>typeof c==='string'&&/^[a-f0-9]{12}$/.test(c);
const K={
  meta:c=>`ys:${c}`,round:(c,w)=>`ysk:${c}:${w}`,runs:(c,w)=>`ysr:${c}:${w}`,lines:(c,w)=>`ysl:${c}:${w}`,closed:(c,w)=>`ysc:${c}:${w}`,
  wins:c=>`ysw:${c}`,members:c=>`ysm:${c}`,list:p=>`ypl:${p}`,bonus:p=>`ypb:${p}`,
};
const parse=v=>{try{return v?JSON.parse(v):null;}catch{return null;}};
const pairs=flat=>{const out=[];for(let i=0;i+1<(flat||[]).length;i+=2)out.push([flat[i],flat[i+1]]);return out;};
const weekIdx=wk=>Math.round(Date.parse(wk)/(7*864e5));
// days left in this round, counting today: 7 on Sunday, 1 on Saturday
function daysLeft(now=new Date()){
  const wd=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jerusalem',weekday:'short'}).format(now);
  return 7-['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(wd);
}

// everything the game draws comes from here, so only known shapes pass: numbers stay numbers, ids stay short
function cleanRun(r){
  if(!r||typeof r!=='object')return null;
  const time=+r.time,s=r.s,seed=+r.seed;
  if(!(time>=30&&time<=300)||!(Number.isInteger(seed)&&seed>=0&&seed<2**32)||!TRACKS.includes(r.track))return null;
  if(typeof r.vid!=='string'||!/^[a-z0-9]{1,12}$/.test(r.vid))return null;
  if(typeof r.color!=='string'||!/^#[0-9a-fA-F]{6}$/.test(r.color))return null;
  if(!Array.isArray(s)||s.length<20||s.length>6000||s.length%2||!s.every(v=>Number.isInteger(v)&&Math.abs(v)<100000))return null;
  const look=cleanLook(r.look);
  return {seed,track:r.track,run:{name:cleanName(r.name),look:look?JSON.parse(look):{},vid:r.vid,color:r.color,time},s};
}

// this week's round: its track and seed, made on first use (a yeshiva opened from a race starts on that race's)
async function getRound(cid,wk,first){
  const seed=first?first.seed:Math.floor(Math.random()*2**32),track=first?first.track:TRACKS[Math.floor(Math.random()*TRACKS.length)];
  const [,v]=await pipeline([['SET',K.round(cid,wk),JSON.stringify({seed,track}),'NX','EX',String(ROUND_TTL)],['GET',K.round(cid,wk)]]);
  return parse(v);
}
const sortRuns=flat=>pairs(flat).map(([pid,v])=>({pid,...parse(v)})).filter(r=>r.time).sort((a,b)=>a.time-b.time);

// a round that ended (the yeshiva's last race was in an earlier week) is closed once: its winner gets a round win and
// the "head of the yeshiva" title until the next round closes, and with three players or more the top three get a bonus
async function closeIfDue(cid,meta,wk){
  if(!meta.last||meta.last===wk||meta.closed===meta.last)return meta;
  const done=meta.last,[got]=await pipeline([['SET',K.closed(cid,done),'1','NX','EX',String(ROUND_TTL)]]);
  const [flat,metaNow]=await pipeline([['HGETALL',K.runs(cid,done)],['GET',K.meta(cid)]]);
  const fresh=parse(metaNow)||meta;
  if(got!=='OK')return fresh; // someone else is closing it
  const runs=sortRuns(flat),round=weekIdx(done)-weekIdx(fresh.created)+1,cmds=[];
  if(runs.length){
    cmds.push(['HINCRBY',K.wins(cid),runs[0].pid,'1'],['EXPIRE',K.wins(cid),String(TTL)]);
    fresh.head={pid:runs[0].pid,name:runs[0].name,week:done};
  }
  if(runs.length>=BONUS_MIN_PLAYERS)runs.slice(0,3).forEach((r,i)=>cmds.push(
    ['HSET',K.bonus(r.pid),`${cid}:${done}`,JSON.stringify({cid,word:fresh.word,round,place:i+1,coins:BONUS[i],week:done})],
    ['EXPIRE',K.bonus(r.pid),String(LIST_TTL)]));
  fresh.closed=done;
  cmds.push(['SET',K.meta(cid),JSON.stringify(fresh),'KEEPTTL']);
  await pipeline(cmds);
  return fresh;
}

// the yeshiva as one player sees it
async function view(cid,id,meta){
  const wk=weekKey();meta=await closeIfDue(cid,meta,wk);
  const round=await getRound(cid,wk);
  const [flat,winsFlat,memFlat]=await pipeline([['HGETALL',K.runs(cid,wk)],['HGETALL',K.wins(cid)],['HGETALL',K.members(cid)]]);
  const runs=sortRuns(flat),members=Object.fromEntries(pairs(memFlat)),head=meta.head&&meta.head.pid;
  const sender=runs.find(r=>r.pid===meta.owner),others=runs.filter(r=>r.pid!==meta.owner&&r.pid!==id).slice(0,RIVALS);
  const pick=[...(sender&&sender.pid!==id?[sender]:[]),...others];
  const lines=pick.length?(await pipeline([['HMGET',K.lines(cid,wk),...pick.map(r=>r.pid)]]))[0]:[];
  const racers=pick.map((r,i)=>lines[i]&&{name:r.name,look:r.look,vid:r.vid,color:r.color,time:r.time,owner:r.pid===meta.owner,s:parse(lines[i])}).filter(Boolean);
  const table=runs.map((r,i)=>({rank:i+1,name:r.name,look:r.look,time:r.time,me:r.pid===id,owner:r.pid===meta.owner,head:r.pid===head}));
  const wins=pairs(winsFlat).map(([pid,n])=>({name:members[pid]||'',wins:+n,me:pid===id,head:pid===head})).filter(r=>r.name).sort((a,b)=>b.wins-a.wins);
  const me=table.find(r=>r.me);
  return {cid,word:meta.word,mine:meta.owner===id,ownerName:members[meta.owner]||meta.ownerName||'',headName:meta.head?meta.head.name:'',
    round:weekIdx(wk)-weekIdx(meta.created)+1,week:wk,daysLeft:daysLeft(),seed:round.seed,track:round.track,
    players:Object.keys(members).length,table,wins,racers,myRank:me?me.rank:null,myTime:me?me.time:null};
}
async function remember(id,cid,seen){
  const [prev]=await pipeline([['HGET',K.list(id),cid]]);
  if(prev&&!seen)return;
  await pipeline([['HSET',K.list(id),cid,JSON.stringify(seen||{})],['EXPIRE',K.list(id),String(LIST_TTL)]]);
}

// the player's yeshivas: the ones where something happened since they last looked come first (passed them, a new round),
// then the latest. Bonuses wait beside them, at most three a week (the best three)
async function list(id){
  const wk=weekKey(),items=[];
  const [flat,bonusFlat]=await pipeline([['HGETALL',K.list(id)],['HGETALL',K.bonus(id)]]);
  for(const [cid,v] of pairs(flat).slice(0,MAX_LIST)){
    const [raw]=await pipeline([['GET',K.meta(cid)]]),meta=parse(raw);
    if(!meta){await pipeline([['HDEL',K.list(id),cid]]);continue;}
    const y=await view(cid,id,meta),seen=parse(v)||{};
    const passedBy=seen.week===wk&&seen.rank&&y.myRank>seen.rank?y.table[y.myRank-2].name:null;
    items.push({cid,word:y.word,mine:y.mine,round:y.round,track:y.track,daysLeft:y.daysLeft,players:y.players,myRank:y.myRank,
      leader:y.table[0]?y.table[0].name:null,passedBy,newRound:!!seen.week&&seen.week!==wk,last:meta.last||meta.created});
  }
  const fresh=await pipeline([['HGETALL',K.bonus(id)]]).then(([f])=>pairs(f)),byWeek={},drop=[],bonuses=[];
  for(const [key,v] of fresh){const b=parse(v);if(!b){drop.push(key);continue;}(byWeek[b.week]=byWeek[b.week]||[]).push({key,...b});}
  for(const arr of Object.values(byWeek)){arr.sort((a,b)=>b.coins-a.coins);bonuses.push(...arr.slice(0,BONUS_PER_WEEK));drop.push(...arr.slice(BONUS_PER_WEEK).map(b=>b.key));}
  if(drop.length)await pipeline([['HDEL',K.bonus(id),...drop]]);
  const score=y=>(y.passedBy?2:0)+(y.newRound?1:0);
  items.sort((a,b)=>score(b)-score(a)||(a.last<b.last?1:a.last>b.last?-1:0));
  return {items,bonuses,news:items.filter(y=>y.passedBy||y.newRound).length+bonuses.length};
}

export async function GET(req){
  if(!hasDb())return json({disabled:true});
  const q=new URL(req.url).searchParams,id=isId(q.get('id'))?q.get('id'):'';
  if(q.has('list'))return id?json(await list(id)):json({error:'bad-id'},400);
  const cid=q.get('y');if(!isCid(cid))return json({error:'bad-id'},400);
  const [raw]=await pipeline([['GET',K.meta(cid)]]),meta=parse(raw);
  if(!meta)return json({missing:true});
  if(id)await remember(id,cid);
  return json(await view(cid,id,meta));
}

export async function POST(req){
  if(!hasDb())return json({disabled:true});
  let b;try{b=await req.json();}catch{return json({error:'bad-json'},400);}
  const {id,cid,action}=b;
  if(!isId(id))return json({error:'bad-id'},400);
  const hour=Math.floor(Date.now()/3600000),ipKey=`ipy:${clientIp(req)}:${hour}`;
  const [n]=await pipeline([['INCR',ipKey],['EXPIRE',ipKey,'3600']]);
  if(n>IP_PER_HOUR)return json({error:'too-fast'},429);
  const wk=weekKey();

  if(action==='seen'){
    for(const c of (Array.isArray(b.cids)?b.cids:[]).filter(isCid).slice(0,MAX_LIST)){
      const [flat]=await pipeline([['HGETALL',K.runs(c,wk)]]),i=sortRuns(flat).findIndex(r=>r.pid===id);
      await remember(id,c,{week:wk,rank:i<0?null:i+1});
    }
    return json({ok:true});
  }
  if(action==='claim'){
    const key=String(b.key||'');if(!/^[a-f0-9]{12}:\d{4}-\d{2}-\d{2}$/.test(key))return json({error:'bad-key'},400);
    const [v,gone]=await pipeline([['HGET',K.bonus(id),key],['HDEL',K.bonus(id),key]]);
    return json(gone&&parse(v)?{ok:true,...parse(v)}:{ok:false});
  }
  if(!isCid(cid))return json({error:'bad-id'},400);

  if(action==='create'){
    const clean=b.run?cleanRun(b.run):null;if(b.run&&!clean)return json({error:'bad-run'},400);
    const meta={word:cleanSuffix(b.word,PREFIX)||'האחים',owner:id,ownerName:cleanName(b.name),created:wk,last:null,closed:null,head:null};
    const [ok]=await pipeline([['SET',K.meta(cid),JSON.stringify(meta),'NX','EX',String(TTL)]]);
    if(ok!=='OK')return json({error:'taken'},409);
    await getRound(cid,wk,clean);
    await remember(id,cid,{week:wk,rank:null});
    if(!clean)return json(await view(cid,id,meta));
    b.action='race';
  }
  const [raw]=await pipeline([['GET',K.meta(cid)]]);let meta=parse(raw);
  if(!meta)return json({missing:true});

  if(b.action==='rename'){
    if(meta.owner!==id)return json({error:'not-owner'},403);
    const word=cleanSuffix(b.word,PREFIX);if(!word)return json({error:'bad-name'},400);
    meta.word=word;await pipeline([['SET',K.meta(cid),JSON.stringify(meta),'KEEPTTL']]);
    return json(await view(cid,id,meta));
  }
  if(b.action!=='race')return json({error:'bad-action'},400);

  const clean=cleanRun(b.run);if(!clean)return json({error:'bad-run'},400);
  meta=await closeIfDue(cid,meta,wk);
  const round=await getRound(cid,wk);
  // a race that started before Sunday and ended after it belongs to a round that is over
  if(round.seed!==clean.seed)return json({...await view(cid,id,meta),stale:true});
  const [flat]=await pipeline([['HGETALL',K.runs(cid,wk)]]),before=sortRuns(flat),bi=before.findIndex(r=>r.pid===id);
  const prevTime=bi<0?null:before[bi].time,improved=prevTime===null||clean.run.time<prevTime;
  meta.last=wk;
  if(improved)await pipeline([
      ['HSET',K.runs(cid,wk),id,JSON.stringify(clean.run)],['HSET',K.lines(cid,wk),id,JSON.stringify(clean.s)],
      ['EXPIRE',K.runs(cid,wk),String(ROUND_TTL)],['EXPIRE',K.lines(cid,wk),String(ROUND_TTL)]]);
  // every race keeps the yeshiva alive for another 30 days
  await pipeline([['SET',K.meta(cid),JSON.stringify(meta),'EX',String(TTL)],['HSET',K.members(cid),id,clean.run.name],
    ['EXPIRE',K.members(cid),String(TTL)],['EXPIRE',K.wins(cid),String(TTL)],['EXPIRE',K.round(cid,wk),String(ROUND_TTL)]]);
  const y=await view(cid,id,meta);
  // who the player passed: ahead of them before this race, behind them now
  const passed=improved?before.filter(r=>r.pid!==id&&r.time>=clean.run.time&&(prevTime===null||r.time<prevTime)).map(r=>r.name):[];
  await remember(id,cid,{week:wk,rank:y.myRank});
  return json({...y,improved,before:{rank:bi<0?null:bi+1,time:prevTime},passed});
}

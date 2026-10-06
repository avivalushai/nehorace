// The live race server: "bring the guys now". One Durable Object per room (a 6-letter code in the link), holding
// everyone's WebSocket for the whole race. The server keeps the order of things; the race itself runs in each phone:
//   lobby  who joined (name and Nehorai); the host taps "יאללה למירוץ"
//   build  30 seconds for everyone to pick their Nehorai and ride (earlier if all are ready)
//   race   a shared start time; each phone sends where its racer is, 15 times a second, and the others draw it.
//          Knocked-down pedestrians are passed on too, so they fall on every screen
//   done   everyone finished (or a minute after the first one did, or they left): the standings. "again" goes back to lobby
// Messages are small JSON objects with a type `t`. Everything a player sends is checked before it reaches the others.

const MAX_PLAYERS=6,BUILD_MS=30000,COUNTDOWN_MS=4500,FINISH_GRACE_MS=60000,EMPTY_ROOM_MS=10*60000;
const TRACKS=['park','promenade','hood'];
const LOOK_SLOTS=['hair','beard','cap','chain','shirt','pants','shoes','dog','acc'];
const isPid=p=>typeof p==='string'&&/^[a-f0-9]{32}$/.test(p);
const num=(v,lim)=>Number.isFinite(v)&&Math.abs(v)<=lim?v:0;
// names and looks come from players: visible characters only, short ids only (the game draws nothing it doesn't know)
const cleanName=n=>{const s=String(n||'').replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩<>]/g,'').replace(/\s+/g,' ').trim().slice(0,20);return s||'נהוראי';};
const cleanLook=l=>{const out={};if(l&&typeof l==='object')for(const k of LOOK_SLOTS)if(typeof l[k]==='string'&&/^[a-z0-9]{1,12}$/.test(l[k]))out[k]=l[k];return out;};
const cleanRide=r=>({vid:typeof r?.vid==='string'&&/^[a-z0-9]{1,12}$/.test(r.vid)?r.vid:'scooter',color:typeof r?.color==='string'&&/^#[0-9a-fA-F]{6}$/.test(r.color)?r.color:'#2C2C38',
  wheels:typeof r?.wheels==='string'&&/^[a-z0-9]{1,12}$/.test(r.wheels)?r.wheels:'gold'});

export class Room{
  constructor(ctx){this.ctx=ctx;this.players=new Map();this.phase='lobby';this.host=null;this.timer=0;this.emptyTimer=0;this.round=0;}

  async fetch(req){
    if(req.headers.get('Upgrade')!=='websocket')return new Response('expected a websocket',{status:426});
    const pair=new WebSocketPair(),[client,ws]=Object.values(pair);
    ws.accept();
    ws.addEventListener('message',e=>{let m;try{m=JSON.parse(e.data);}catch{return;}if(m&&typeof m.t==='string')this.on(ws,m);});
    const gone=()=>this.leave(ws);ws.addEventListener('close',gone);ws.addEventListener('error',gone);
    return new Response(null,{status:101,webSocket:client});
  }

  send(ws,m){try{ws.send(JSON.stringify(m));}catch{}}
  all(m,except){const s=JSON.stringify({...m,now:Date.now()});for(const p of this.players.values())if(p.ws&&p.ws!==except)try{p.ws.send(s);}catch{}}
  who(ws){for(const p of this.players.values())if(p.ws===ws)return p;return null;}
  // what everyone sees of everyone
  roster(){return [...this.players.values()].map(p=>({pid:p.pid,name:p.name,look:p.look,...p.ride,host:p.pid===this.host,ready:p.ready,here:!!p.ws,finished:p.time!=null,time:p.time}));}
  // the host leads; while the host's phone is away (asleep, a tunnel), anyone in the room can start the next race
  canLead(p){return p.pid===this.host||!this.players.get(this.host)?.ws;}
  lobby(){this.all({t:'room',phase:this.phase,round:this.round,hostHere:!!this.players.get(this.host)?.ws,players:this.roster(),seed:this.seed,track:this.track,buildUntil:this.buildUntil,raceAt:this.raceAt});}

  on(ws,m){
    if(m.t==='ping')return this.send(ws,{t:'pong',c:m.c,now:Date.now()}); // the phones line their clocks up with this one
    // a look before joining: who's in the room and who opened it (the join screen shows it)
    if(m.t==='peek')return this.send(ws,{t:'peek',phase:this.phase,players:this.roster(),now:Date.now()});
    if(m.t==='hello')return this.hello(ws,m);
    const p=this.who(ws);if(!p)return;
    if(m.t==='look'){p.name=cleanName(m.name);p.look=cleanLook(m.look);p.ride=cleanRide(m);if(this.phase==='build'&&m.ready)p.ready=true;this.lobby();if(this.phase==='build')this.maybeGo();return;}
    if(m.t==='start'&&this.canLead(p)&&this.phase==='lobby')return this.build(m.track);
    if(m.t==='pos'&&this.phase==='race'){
      // where this racer is: distance along the track, offset from its middle, speed, lean, turbo
      this.all({t:'pos',pid:p.pid,d:num(m.d,30000),x:num(m.x,2000),s:num(m.s,2000),l:num(m.l,1),b:m.b?1:0,k:num(m.k,1e6)},ws);return;}
    if(m.t==='knock'&&this.phase==='race'&&Number.isInteger(m.id)&&m.id>=0&&m.id<100000){this.all({t:'knock',pid:p.pid,id:m.id,vx:num(m.vx,2000),vd:num(m.vd,2000)},ws);return;}
    if(m.t==='finish'&&this.phase==='race'&&p.time==null){
      p.time=m.busted?null:Math.max(1,num(m.time,600));p.busted=!!m.busted;p.done=true;
      this.all({t:'finished',pid:p.pid,time:p.time,busted:p.busted});
      if(!this.graceTimer)this.graceTimer=setTimeout(()=>this.done(),FINISH_GRACE_MS);
      this.maybeDone();return;}
    if(m.t==='again'&&this.canLead(p)&&this.phase==='done'){this.reset();this.lobby();return;}
  }

  hello(ws,m){
    if(!isPid(m.pid))return this.send(ws,{t:'error',error:'bad-id'});
    clearTimeout(this.emptyTimer);
    let p=this.players.get(m.pid);
    if(p){ // the same player again (a refresh, a dropped connection): the new socket takes over
      if(p.ws&&p.ws!==ws)try{p.ws.close(4000,'replaced');}catch{}
      p.ws=ws;
    }else{
      if(this.phase!=='lobby')return this.send(ws,{t:'error',error:'started'});
      if(this.players.size>=MAX_PLAYERS)return this.send(ws,{t:'error',error:'full'});
      p={pid:m.pid,ws,name:cleanName(m.name),look:cleanLook(m.look),ride:cleanRide(m),ready:false,time:null,done:false};
      this.players.set(p.pid,p);
    }
    if(!this.host||!this.players.has(this.host))this.host=p.pid;
    this.send(ws,{t:'welcome',pid:p.pid,now:Date.now()});
    this.lobby();
  }

  leave(ws){
    const p=this.who(ws);if(!p)return;p.ws=null;
    // in the lobby someone who left is gone; once the race is set they stay (their racer finishes or stops where it was)
    if(this.phase==='lobby')this.players.delete(p.pid);
    // the host passes on only when they're gone for good (left the lobby); otherwise they're the host when they're back
    if(p.pid===this.host&&!this.players.has(p.pid)){const next=[...this.players.values()].find(q=>q.ws);this.host=next?next.pid:null;}
    this.all({t:'left',pid:p.pid});this.lobby();
    if(this.phase==='build')this.maybeGo();
    if(this.phase==='race')this.maybeDone();
    if(![...this.players.values()].some(q=>q.ws))this.emptyTimer=setTimeout(()=>{this.players.clear();this.reset();this.host=null;},EMPTY_ROOM_MS);
  }

  // the host started: one track and seed for everyone, and 30 seconds to get the Nehorai right
  build(track){
    this.phase='build';this.round++;
    this.seed=Math.floor(Math.random()*2**32);this.track=TRACKS.includes(track)?track:'park';
    this.buildUntil=Date.now()+BUILD_MS;
    for(const p of this.players.values())p.ready=false;
    clearTimeout(this.timer);this.timer=setTimeout(()=>this.go(),BUILD_MS);
    this.lobby();
  }
  maybeGo(){const here=[...this.players.values()].filter(p=>p.ws);if(here.length&&here.every(p=>p.ready))this.go();}
  // everyone is set: the race starts at the same moment on every phone (after the countdown)
  go(){
    if(this.phase!=='build')return;clearTimeout(this.timer);
    this.phase='race';this.raceAt=Date.now()+COUNTDOWN_MS;
    // whoever left during the build doesn't race
    for(const [pid,p] of this.players)if(!p.ws)this.players.delete(pid);
    this.lobby();
  }
  maybeDone(){const racing=[...this.players.values()].filter(p=>p.ws&&!p.done);if(!racing.length)this.done();}
  done(){
    if(this.phase!=='race')return;clearTimeout(this.graceTimer);this.graceTimer=0;
    this.phase='done';
    const order=[...this.players.values()].sort((a,b)=>(a.time==null)-(b.time==null)||(a.time||0)-(b.time||0));
    this.all({t:'standings',standings:order.map((p,i)=>({pid:p.pid,name:p.name,look:p.look,place:i+1,time:p.time,busted:!!p.busted,left:!p.ws&&!p.done}))});
    this.lobby();
  }
  reset(){clearTimeout(this.timer);clearTimeout(this.graceTimer);this.graceTimer=0;this.phase='lobby';this.seed=undefined;this.track=undefined;this.buildUntil=undefined;this.raceAt=undefined;
    for(const [pid,p] of this.players){if(!p.ws)this.players.delete(pid);else{p.ready=false;p.time=null;p.done=false;p.busted=false;}}}
}

// /room/<CODE>: the room's WebSocket. The code is 6 letters and digits, made by whoever opens the room
export default{
  async fetch(req,env){
    const url=new URL(req.url),m=url.pathname.match(/^\/room\/([A-Z0-9]{6})$/);
    if(!m)return new Response('NehoRace live',{status:url.pathname==='/'?200:404});
    return env.ROOMS.get(env.ROOMS.idFromName(m[1])).fetch(req);
  },
};

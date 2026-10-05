// A whole live room with three players, against the local server (`npm run dev` in this folder):
// joining, the host starting, ready early, positions and knocks passed on, finishing, standings, and another round.
//   node test-room.mjs [ws://localhost:8788]
const BASE=process.argv[2]||'ws://localhost:8788',CODE=Math.random().toString(36).slice(2,8).toUpperCase().padEnd(6,'X');
const pid=()=>[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');
const fails=[],ok=(cond,what)=>{if(!cond)fails.push(what);console.log(cond?'✓':'✗',what);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function player(name){
  const ws=new WebSocket(`${BASE}/room/${CODE}`),me={name,pid:pid(),ws,got:[],room:null};
  ws.onmessage=e=>{const m=JSON.parse(e.data);me.got.push(m);if(m.t==='room')me.room=m;};
  me.send=m=>ws.send(JSON.stringify(m));
  me.wait=async(pred,ms=3000)=>{const t0=Date.now();while(Date.now()-t0<ms){const m=me.got.find(pred);if(m)return m;await sleep(20);}return null;};
  me.open=new Promise(r=>ws.onopen=r);
  return me;
}

const A=player('נהוראי אלף'),B=player('נהוראי בית');
await Promise.all([A.open,B.open]);
A.send({t:'hello',pid:A.pid,name:A.name,look:{hair:'fade'},vid:'atv',color:'#FF7A1A'});await A.wait(m=>m.t==='welcome');
B.send({t:'hello',pid:B.pid,name:B.name,look:{hair:'mullet',x:'<script>'},vid:'bike'});
await sleep(300);
ok(A.room&&A.room.players.length===2,'both players are in the lobby');
ok(A.room.players.find(p=>p.pid===A.pid).host,'whoever came first is the host');
ok(!('x' in A.room.players.find(p=>p.pid===B.pid).look),'unknown look slots are dropped');
const P=player('peeker');await P.open;P.send({t:'peek'});const pk=await P.wait(m=>m.t==='peek');
ok(pk&&pk.players.length===2&&pk.players.some(p=>p.host&&p.name==='נהוראי אלף'),'peeking shows who is in and who opened it');await sleep(100);ok(A.room.players.length===2,'peeking does not join');P.ws.close();
const pong=(A.send({t:'ping',c:123}),await A.wait(m=>m.t==='pong'));ok(pong&&pong.c===123&&pong.now>0,'ping answers with the server clock');

B.send({t:'start',track:'hood'});await sleep(200);ok(A.room.phase==='lobby','only the host can start');
A.send({t:'start',track:'hood'});await sleep(200);
ok(A.room.phase==='build'&&A.room.track==='hood'&&Number.isInteger(A.room.seed),'the host starts: build, with a track and a seed');
ok(A.room.buildUntil-Date.now()>25000,'30 seconds to build');

const C=player('נהוראי גימל');await C.open;C.send({t:'hello',pid:C.pid,name:C.name});
ok(!!(await C.wait(m=>m.t==='error'&&m.error==='started')),'a late player hears the race has started');

A.send({t:'look',name:A.name,look:{hair:'bald'},vid:'tmax',color:'#123456',ready:true});await sleep(150);
ok(A.room.phase==='build','one ready of two: still building');
B.send({t:'look',name:B.name,look:{hair:'mullet'},vid:'bike',ready:true});await sleep(200);
ok(A.room.phase==='race'&&A.room.raceAt>Date.now(),'all ready: the race is set, with a start time ahead');
ok(A.room.players.find(p=>p.pid===A.pid).vid==='tmax','the ride picked in the build goes into the race');

A.send({t:'pos',d:120.5,x:-12,s:400,l:.1,b:1});
const pos=await B.wait(m=>m.t==='pos');ok(pos&&pos.pid===A.pid&&pos.d===120.5&&pos.b===1,'positions reach the others');
ok(!A.got.some(m=>m.t==='pos'),'nobody gets their own position back');
A.send({t:'pos',d:1e9,x:'a'});const bad=await B.wait(m=>m.t==='pos'&&m!==pos);ok(bad&&bad.d===0&&bad.x===0,'impossible numbers are zeroed');
A.send({t:'knock',id:37,vx:50,vd:200});ok(!!(await B.wait(m=>m.t==='knock'&&m.id===37&&m.pid===A.pid)),'knocked-down pedestrians reach the others');

A.send({t:'finish',time:45.2});await sleep(150);ok(A.room.phase==='race','one finished, the other still racing');
B.send({t:'finish',time:47.9});const st=await A.wait(m=>m.t==='standings');
ok(st&&st.standings[0].pid===A.pid&&st.standings[1].time===47.9,'everyone finished: standings in order');
await sleep(100);ok(A.room.phase==='done','the room is done');

A.send({t:'again'});await sleep(200);
ok(A.room.phase==='lobby'&&A.room.players.length===2&&A.room.players.every(p=>!p.ready&&!p.finished),'"again" takes everyone back to the lobby');

B.ws.close();await sleep(300);ok(A.room.players.length===1,'leaving the lobby removes the player');
A.ws.close();C.ws.close();
console.log(fails.length?`FAIL (${fails.length})`:'PASS');process.exit(fails.length?1:0);

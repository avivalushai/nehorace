// The live race connection (live/room.js on Cloudflare): one WebSocket to the room, the room's state as it changes,
// the server's clock (so every phone starts the race at the same moment), and a reconnect if the line drops.
import { playerId } from './leaderboard.js';

// where the room server runs: on this computer while developing (`npm run dev` in live/), otherwise on Cloudflare
const LIVE_URL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?'ws://localhost:8788':'wss://nehorace-live.nehorace-live.workers.dev';
const liveOn=()=>!!LIVE_URL&&!!playerId();
// the home button shows only when the room server answers (a quick look, two seconds at most)
async function liveReady(){if(!liveOn())return false;
  try{await fetch(LIVE_URL.replace(/^ws/,'http')+'/',{mode:'no-cors',signal:AbortSignal.timeout(2000)});return true;}catch(e){return false;}}
const newCode=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',b=crypto.getRandomValues(new Uint8Array(6));return [...b].map(x=>A[x%A.length]).join('');};
const isCode=c=>/^[A-Z0-9]{6}$/.test(c||'');

// one room at a time. on(msg) gets every message; the room's latest state is kept in conn.room
function connect(code,on){
  const conn={code,pid:playerId(),room:null,offset:0,ws:null,closed:false,tries:0,hello:null};
  conn.now=()=>Date.now()+conn.offset; // the server's clock
  conn.send=m=>{try{if(conn.ws&&conn.ws.readyState===1)conn.ws.send(JSON.stringify(m));}catch(e){}};
  conn.join=hello=>{conn.hello=hello;conn.send({t:'hello',pid:conn.pid,...hello});};
  conn.close=()=>{conn.closed=true;try{conn.ws&&conn.ws.close();}catch(e){}};
  const open=()=>{
    const ws=new WebSocket(`${LIVE_URL}/room/${code}`);conn.ws=ws;
    ws.onopen=()=>{conn.tries=0;
      // three pings: the quickest answer gives the best guess of the server's clock
      let best=1e9;const ping=()=>conn.send({t:'ping',c:Date.now()});ping();setTimeout(ping,300);setTimeout(ping,700);
      conn.onPong=(c,now)=>{const rtt=Date.now()-c;if(rtt<best){best=rtt;conn.offset=now+rtt/2-Date.now();}};
      if(conn.hello)conn.send({t:'hello',pid:conn.pid,...conn.hello});else conn.send({t:'peek'});on({t:'open'});};
    ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(_){return;}
      if(m.t==='pong'){conn.onPong&&conn.onPong(m.c,m.now);return;}
      if(m.t==='room')conn.room=m;on(m);};
    ws.onclose=()=>{if(conn.closed)return;
      // a dropped line (a tunnel, switching to wifi): try again a few times, as the same player
      if(conn.tries++<5)setTimeout(open,600*conn.tries);else on({t:'lost'});};
  };
  open();return conn;
}

export { liveOn, liveReady, newCode, isCode, connect };

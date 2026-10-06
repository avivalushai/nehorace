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
  const conn={code,pid:playerId(),room:null,offset:0,ws:null,closed:false,tries:0,hello:null,queue:[]};
  conn.now=()=>Date.now()+conn.offset; // the server's clock
  // a message sent while the line is down waits for it (the phone slept on the results screen, then "another round")
  conn.send=m=>{try{if(conn.ws&&conn.ws.readyState===1){conn.ws.send(JSON.stringify(m));return;}}catch(e){}
    if(m.t!=='pos'&&m.t!=='ping'&&conn.queue.length<20)conn.queue.push(m);reopen();};
  conn.join=hello=>{conn.hello=hello;conn.send({t:'hello',pid:conn.pid,...hello});};
  conn.close=()=>{conn.closed=true;try{conn.ws&&conn.ws.close();}catch(e){}};
  const open=()=>{
    const ws=new WebSocket(`${LIVE_URL}/room/${code}`);conn.ws=ws;
    ws.onopen=()=>{conn.tries=0;conn.lost=false;
      // three pings: the quickest answer gives the best guess of the server's clock
      let best=1e9;const ping=()=>conn.send({t:'ping',c:Date.now()});ping();setTimeout(ping,300);setTimeout(ping,700);
      conn.onPong=(c,now)=>{const rtt=Date.now()-c;if(rtt<best){best=rtt;conn.offset=now+rtt/2-Date.now();}};
      if(conn.hello)conn.send({t:'hello',pid:conn.pid,...conn.hello});else conn.send({t:'peek'});
      const q=conn.queue.splice(0);q.forEach(conn.send);on({t:'open'});};
    ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(_){return;}
      if(m.t==='pong'){conn.onPong&&conn.onPong(m.c,m.now);return;}
      if(m.t==='room')conn.room=m;on(m);};
    ws.onclose=()=>{if(conn.closed||conn.ws!==ws)return;
      // a dropped line (a tunnel, switching to wifi): try again, as the same player. After a while it waits for the
      // page to be on screen again, or for the player to do something
      if(conn.tries++<8)setTimeout(open,Math.min(5000,600*conn.tries));else{conn.lost=true;on({t:'lost'});}};
  };
  const reopen=()=>{if(conn.closed)return;const w=conn.ws;if(w&&(w.readyState===0||w.readyState===1))return;conn.tries=0;open();};
  // back on screen (the phone woke up): make sure the line is up
  const wake=()=>{if(document.visibilityState==='visible')reopen();};
  document.addEventListener('visibilitychange',wake);
  const close0=conn.close;conn.close=()=>{document.removeEventListener('visibilitychange',wake);close0();};
  open();return conn;
}

export { liveOn, liveReady, newCode, isCode, connect };

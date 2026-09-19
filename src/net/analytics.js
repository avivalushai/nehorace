// Amplitude events, sent with plain fetch to its HTTP API (EU data center), no SDK.
// The player is the same anonymous id as the champions board (device_id). No names or other personal text is sent.
// Events are only sent from the live site: never from localhost, ?dev, or automated browsers (the tests).
// Everywhere else they are only kept in window.__amp, so tests can check what would have been sent.
import { playerId } from './leaderboard.js';
import { Stats } from '../core/stats.js';

const API_KEY='97669f8f19540b26cdaea9be5c26e477'; // a browser key: meant to be public
const ENDPOINT='https://api.eu.amplitude.com/2/httpapi';
const live=!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&!new URLSearchParams(location.search).has('dev')&&!navigator.webdriver;
const device=matchMedia('(min-width:860px)').matches?'desktop':'phone';
let session=Date.now(),lastAt=Date.now(),queue=[],timer=0,n=0;
const log=(window.__amp=[]);

function track(type,props){
  const now=Date.now();if(now-lastAt>30*60*1000)session=now;lastAt=now; // a new session after 30 idle minutes
  const ev={event_type:type,device_id:playerId()||'no-storage',session_id:session,time:now,insert_id:`${session}-${n++}`,platform:'Web',language:navigator.language,
    event_properties:props||{},user_properties:{$set:{device,career_points:Stats.career,races:Stats.races,wins:Stats.wins}}};
  log.push(ev);if(!live)return;
  queue.push(ev);clearTimeout(timer);if(queue.length>=10)flush();else timer=setTimeout(flush,2000);
}
function flush(keepalive){
  if(!queue.length)return;const events=queue;queue=[];
  fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:API_KEY,events}),keepalive:!!keepalive}).catch(()=>{});
}
// the player may close the tab right after a race: send what's waiting
addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush(true);});

export { track };

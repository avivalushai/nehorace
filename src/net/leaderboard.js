// Leaderboard client: an anonymous player id kept in this browser (no login), sending finished races,
// and reading the boards. Every call fails quietly: the game works the same without the server.
const PLAYER_KEY='nehorace-player';
function playerId(){
  try{let id=localStorage.getItem(PLAYER_KEY);
    if(!/^[a-f0-9]{32}$/.test(id||'')){const b=new Uint8Array(16);crypto.getRandomValues(b);id=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem(PLAYER_KEY,id);}
    return id;}catch(e){return null;}
}
// races simulated by the ?dev shortcut never reach the real board (only a local dev server)
const devOnLive=()=>new URLSearchParams(location.search).has('dev')&&!/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
async function submitRace(r){
  const id=playerId();if(!id||devOnLive())return null;
  try{const res=await fetch('api/race',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...r})});return res.ok?await res.json():null;}catch(e){return null;}
}
async function fetchBoard(){
  try{const res=await fetch(`api/leaderboard?id=${playerId()||''}`);return res.ok?await res.json():null;}catch(e){return null;}
}

export { playerId, submitRace, fetchBoard };

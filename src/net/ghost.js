// Ghost races: the player's last finished race, sent when they invite a friend, and the friend's ghost read
// from an invite link (?vs=<gid>). Fails quietly like the leaderboard: no server means a normal race.
function newGid(){const b=new Uint8Array(6);crypto.getRandomValues(b);return [...b].map(x=>x.toString(16).padStart(2,'0')).join('');}
function saveGhost(gid,ghost){
  try{fetch('api/ghost',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({gid,ghost})}).catch(()=>{});}catch(e){}
}
async function loadGhost(gid){
  if(!/^[a-f0-9]{12}$/.test(gid||''))return null;
  try{const res=await fetch(`api/ghost?g=${gid}`);if(!res.ok)return null;const d=await res.json();return d.ghost||null;}catch(e){return null;}
}

export { newGid, saveGhost, loadGhost };

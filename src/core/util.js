// Shared constants (palette, fonts) and tiny helpers: rand, pick, clamp, $, hash.

// ================= CONSTANTS =================
const INK='#1A0B29',GOLD='#FFC83D',GOLD2='#D9951A',PINK='#FF3D8B',SKIN='#D39A6A',HAIRDK='#1B120C';
const FONT="'Secular One','Arial Hebrew',Arial,sans-serif", DISP="'Karantina','Secular One',Impact,sans-serif";
const rand=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)], clamp=(v,a,b)=>v<a?a:v>b?b:v;
const $=s=>document.querySelector(s);
function hash(a,b){const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s);}

export { INK, GOLD, GOLD2, SKIN, HAIRDK, PINK, FONT, DISP, rand, clamp, pick, $, hash };

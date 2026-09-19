// Entry point: loads every module, screen navigation (show), title screen, startup.
import { $ } from './core/util.js';
import { fitCv } from './core/draw.js';
import './core/catalog.js';
import './race/texts.js';
import './art/neho.js';
import './art/dog.js';
import './art/vehicles.js';
import './art/stickers.js';
import { state, vColor } from './core/state.js';
import { drawComposition, renderPanel, setStep, startStage, stopStage } from './ui/garage.js';
import './race/world.js';
import './race/engine.js';
import './race/render.js';
import { musicStop } from './music/engine.js';
import { garageMusic } from './music/songs.js';
import './album/scenes.js';
import './album/build.js';
import './album/ui.js';
import './shop/items.js';
import { walletLoad } from './shop/ui.js';
import { Stats, devAddCareer } from './core/stats.js';
import { nextUnlock } from './core/unlocks.js';
import { openBoard } from './ui/board.js';
import { devQuickRace, fmt } from './race/engine.js';

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));if(id==='garage'){renderPanel();startStage();garageMusic();}else{stopStage();if(id!=='race')musicStop();}if(id==='title'){renderBest();startTitle();}}
// on the title screen the Nehorai idles: steps in place, drifts along the deck, swings his arms and waves now and then.
// Static (t=0, no pose) when the player prefers reduced motion
let titleAnim=false,titleT0=0,titleRAF=0;
function titlePose(t){const s=Math.sin(t*4),w=t%7,wave=w>4.6&&w<6.4;
  return{dx:Math.sin(t*.9)*10,pose:{legL:Math.max(0,s)*6,legR:Math.max(0,-s)*6,armL:.16*s,armR:wave?-2.5+Math.sin(t*14)*.3:-.16*s}};}
function drawTitle(){const{c,w,h}=fitCv($('#titleCv'));const t=titleAnim?(performance.now()-titleT0)/1000:0,a=titleAnim?titlePose(t):{};
  drawComposition(c,w,h,{mode:'veh',look:state.look,vid:state.vid,color:vColor(),wheels:state.wheels,stickers:state.stickers,t,pose:a.pose,dx:a.dx});}
function startTitle(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){titleAnim=false;drawTitle();return;}
  if(!titleAnim){titleAnim=true;titleT0=performance.now();}
  cancelAnimationFrame(titleRAF);const f=()=>{if(!$('#title').classList.contains('on')){titleAnim=false;return;}drawTitle();titleRAF=requestAnimationFrame(f);};f();}
const takeName=()=>{state.name=($('#nameIn').value.trim()||'נהוראי').slice(0,10);state.look.name=state.name;};
$('#startBtn').onclick=()=>{takeName();setStep(0);show('garage');};
$('#boardBtn').onclick=()=>{takeName();openBoard('week');};
// nudge players who keep the default name: the champions board is full of "נהוראי" otherwise
const nameHint=()=>{const v=$('#nameIn').value.trim();$('#nameHint').hidden=!!v&&v!=='נהוראי';};
$('#nameIn').addEventListener('input',nameHint);nameHint();
// personal records line on the title screen (hidden until the first race). Numbers are isolated so RTL doesn't flip them
function renderBest(){const el=$('#bestLine');if(!Stats.races){el.hidden=true;return;}
  const num=v=>`<b>${v}</b>`,parts=[`השיא שלך: ${num(Stats.bestScore.toLocaleString('he-IL'))} נקודות`,Stats.races===1?'מירוץ אחד':`${num(Stats.races)} מירוצים`];
  if(Stats.wins)parts.push(Stats.wins===1?'ניצחון אחד':`${num(Stats.wins)} ניצחונות`);if(Stats.bestTime)parts.push(`הכי מהיר: ${num(fmt(Stats.bestTime,true))}`);
  const nx=nextUnlock();let line=parts.join(' · ')+`<br>🔓 ${num(Stats.career.toLocaleString('he-IL'))} נקודות קריירה`;
  if(nx)line+=` · הבא: ${nx.label} (עוד ${num((nx.req-Stats.career).toLocaleString('he-IL'))})`;
  el.innerHTML=line;el.hidden=false;}
if(new URLSearchParams(location.search).has('dev')){$('#devBtn').hidden=false;$('#devBtn').onclick=()=>{takeName();devQuickRace();};
  $('#devPts').hidden=false;$('#devPts').onclick=()=>{devAddCareer(5000);renderBest();};}
walletLoad();

renderBest();
startTitle();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{drawTitle();if($('#garage').classList.contains('on'))renderPanel();});

export { show, drawTitle };

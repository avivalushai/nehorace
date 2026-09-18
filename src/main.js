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

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));if(id==='garage'){renderPanel();startStage();garageMusic();}else{stopStage();if(id!=='race')musicStop();}if(id==='title')drawTitle();}
function drawTitle(){const{c,w,h}=fitCv($('#titleCv'));drawComposition(c,w,h,{mode:'veh',look:state.look,vid:state.vid,color:vColor(),wheels:state.wheels,stickers:state.stickers,t:0});}
$('#startBtn').onclick=()=>{state.name=($('#nameIn').value.trim()||'נהוראי').slice(0,10);state.look.name=state.name;setStep(0);show('garage');};
walletLoad();

drawTitle();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{drawTitle();if($('#garage').classList.contains('on'))renderPanel();});

export { show, drawTitle };

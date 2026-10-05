// Player selection state (name, look, vehicle, design).
import { PARTS, VEH } from './catalog.js';

// ================= STATE & SCREENS =================
const state={name:'נהוראי',look:{hair:'fade',beard:'stubble',cap:'none',chain:'cuban',shirt:'track',pants:'track',shoes:'white',dog:'none',acc:'shades',name:'נהוראי'},track:'park',vid:'scooter',extra:'none',color:null,wheels:'gold',stickers:['hamsa','nachman']};
function vColor(){return state.color||VEH[state.vid].color;}

// the Nehorai and the ride are kept in this browser from race to race, so a returning player (and a live race lobby)
// starts with what they built. Only items the game knows come back
const LOOK_KEY='nehorace-look';
function saveLook(){try{localStorage.setItem(LOOK_KEY,JSON.stringify({look:(({name,...l})=>l)(state.look),vid:state.vid,color:state.color,wheels:state.wheels,stickers:state.stickers}));}catch(e){}}
function loadLook(){try{const o=JSON.parse(localStorage.getItem(LOOK_KEY)||'null');if(!o)return false;
  PARTS.forEach(p=>{const v=o.look&&o.look[p.id];if(p.items.some(([id])=>id===v))state.look[p.id]=v;});
  if(VEH[o.vid])state.vid=o.vid;if(typeof o.color==='string'&&/^#[0-9a-fA-F]{6}$/.test(o.color))state.color=o.color;
  if(typeof o.wheels==='string')state.wheels=o.wheels;if(Array.isArray(o.stickers))state.stickers=o.stickers.filter(x=>typeof x==='string').slice(0,6);return true;}catch(e){return false;}}

export { state, vColor, saveLook, loadLook };

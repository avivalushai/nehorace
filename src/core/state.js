// Player selection state (name, look, vehicle, design).
import { VEH } from './catalog.js';

// ================= STATE & SCREENS =================
const state={name:'נהוראי',look:{hair:'fade',beard:'stubble',cap:'none',chain:'cuban',shirt:'track',pants:'track',shoes:'white',dog:'none',acc:'shades',name:'נהוראי'},vid:'scooter',color:null,wheels:'gold',stickers:['hamsa','nachman']};
function vColor(){return state.color||VEH[state.vid].color;}

export { state, vColor };

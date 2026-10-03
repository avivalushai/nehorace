// The three places a race can happen. A track changes the ground, what stands on the sides, the light,
// and the names of the three zones. New tracks open with career points, like the garage items.
import { Stats } from '../core/stats.js';

const TRACKS={
  park:{id:'park',name:'הפארק',blurb:'דשא, מנגלים, והולכי רגל שלא מסתכלים',req:0,
    zones:['שער הפארק','הדשא הגדול','הגבעה'],
    ground:{path:'#EBD9AC',edge:'#CBB27A',left:'grass',right:'grass',far:'#63B548'}},
  promenade:{id:'promenade',name:'הטיילת',blurb:'ים משמאל, ספסלים מימין, וחול על הרצפה',req:3000,
    zones:['תחילת הטיילת','מול המציל','ליד הקיוסק'],
    ground:{path:'#E4DACA',edge:'#C6B79C',left:'sea',right:'walk',far:'#D8CDB4',sand:'#F0E0BC',sea:'#1E74C4',sea2:'#2F8FD8',walk:'#CFC8BC'}},
  hood:{id:'hood',name:'השכונה בלילה',blurb:'אספלט, פנסים, ומי שעוד ער בשעה הזאת',req:6000,night:true,
    zones:['הרחוב הראשי','ליד המכולת','החניה האחורית'],
    ground:{path:'#3C3C46',edge:'#6E6E7C',left:'street',right:'street',far:'#23232C',walk:'#55555F'}},
};
const trackList=()=>Object.values(TRACKS);
const trackOf=id=>TRACKS[id]||TRACKS.park;
const trackOpen=t=>!t.req||Stats.career>=t.req;

export { TRACKS, trackList, trackOf, trackOpen };

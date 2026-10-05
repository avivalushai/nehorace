// Sharing to WhatsApp: a picture drawn in code plus a line with the game's address.
// Phones get the system share sheet with the image (WhatsApp is one tap away); where images can't be
// shared (most computers), WhatsApp opens with the text and the link, whose preview shows the game's card.
import { INK, GOLD, PINK, FONT, DISP, fmtTime } from '../core/util.js';
import { state, vColor } from '../core/state.js';
import { drawComposition } from './garage.js';
import { newCid, createChallenge } from '../net/challenge.js';

const SITE='https://nehorace.vercel.app';
// the link goes back to where the game is running: the live site, a preview build, or a local dev server
const LINK=/^https?:$/.test(location.protocol)?location.origin:SITE;
// the image is made while the button is pressed (toDataURL is synchronous), so phones still count the share as a tap
function fileOf(cv,name){
  const bin=atob(cv.toDataURL('image/png').split(',')[1]),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);
  return new File([a],name,{type:'image/png'});
}
// q: more of the address before from=wa, e.g. 'vs=<cid>&' for a challenge
function shareImage(cv,text,name,q=''){
  const file=fileOf(cv,name),msg=`${text}\n${LINK}/?${q}from=wa`; // ?from=wa: Amplitude counts who came from a shared link
  if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],text:msg}).catch(()=>{});return;}
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank','noopener');
}

// the race card: the player's Nehorai on their ride, their place, score and the game's address
function drawRaceCard(c,W,H,r){
  const top=H*.68;
  drawComposition(c,W,top,{mode:'veh',look:state.look,vid:state.vid,color:vColor(),wheels:state.wheels,stickers:state.stickers,t:1});
  c.fillStyle='#2A1242';c.fillRect(0,top,W,H-top);
  c.fillStyle=PINK;c.fillRect(0,top,W,10);
  c.save();c.translate(W/2,H*.738);c.rotate(-3*Math.PI/180);c.font=`700 ${H*.075}px ${DISP}`;c.textAlign='center';c.textBaseline='middle';c.direction='ltr';
  c.fillStyle=INK;c.fillText('NehoRace',9,10);c.fillStyle=PINK;c.fillText('NehoRace',4,5);c.fillStyle=GOLD;c.fillText('NehoRace',0,0);c.restore();
  c.direction='rtl';c.textAlign='center';c.textBaseline='middle';
  // r.invite: an invitation to a yeshiva (no race yet), otherwise the race's place and score
  c.fillStyle=GOLD;c.font=`700 ${H*.08}px ${DISP}`;c.fillText(r.invite?`הזמנה לישיבה ב${r.invite}`:`מקום ${r.pos}: ${r.title}`,W/2,H*.81,W*.9);
  c.fillStyle='#FFF4DC';c.font=`${H*.034}px ${FONT}`;c.fillText(r.invite?state.name:`${state.name} · ${r.score.toLocaleString('he-IL')} נקודות ערסיות`,W/2,H*.868,W*.9);
  c.globalAlpha=.8;c.font=`${H*.027}px ${FONT}`;c.fillText('חושב שתגבר? בוא בוא כנסס נראה אותך',W/2,H*.912,W*.9);
  c.globalAlpha=1;c.fillStyle=GOLD;c.direction='ltr';c.fillText(SITE.replace('https://',''),W/2,H*.954);
}
function shareRace(r){
  const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;drawRaceCard(cv.getContext('2d'),W,H,r);
  shareImage(cv,`${state.name} סיים במקום ${r.pos} במירוץ של הנהוראים בפארק, עם ${r.score.toLocaleString('he-IL')} נקודות ערסיות. חושב שתגבר? בוא בוא כנסס נראה אותך`,'nehorace.png');
}
// "race a friend": a challenge link. A new one starts from the race (the id is made here and the upload runs beside
// the share sheet, so the tap still opens it); from inside a challenge it invites more friends to the same one
function shareDuel(run,trackName,cid){
  if(!cid){cid=newCid();createChallenge(cid,{seed:run.seed,track:run.track,name:run.name},run);}
  const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;drawRaceCard(cv.getContext('2d'),W,H,run);
  shareImage(cv,`${state.name} מזמין אותך לישיבה ב${trackName.replace(/^ה/,'')}. סיימתי ב-${fmtTime(run.time)}, בוא בוא כנסס נראה אותך עוקף`,'nehorace-challenge.png',`vs=${cid}&`);
  return cid;
}
// an invitation without a race of the player's own (from the title screen): a new, empty yeshiva (ch: {seed, track}),
// or more friends for the one they're in (cid)
function shareYeshiva(trackName,ch,cid){
  if(!cid){cid=newCid();createChallenge(cid,{...ch,name:state.name});}
  const where=trackName.replace(/^ה/,''),W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;drawRaceCard(cv.getContext('2d'),W,H,{invite:where});
  shareImage(cv,`${state.name} מזמין אותך לישיבה ב${where}. בוא בוא כנסס נראה אותך`,'nehorace-challenge.png',`vs=${cid}&`);
  return cid;
}
export { SITE, shareImage, shareRace, shareDuel, shareYeshiva, drawRaceCard };

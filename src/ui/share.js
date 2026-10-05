// Sharing to WhatsApp: a picture drawn in code plus a line with the game's address.
// Phones get the system share sheet with the image (WhatsApp is one tap away); where images can't be
// shared (most computers), WhatsApp opens with the text and the link, whose preview shows the game's card.
import { INK, GOLD, PINK, FONT, DISP } from '../core/util.js';
import { state, vColor } from '../core/state.js';
import { drawComposition } from './garage.js';

const SITE='https://nehorace.vercel.app';
// the link goes back to where the game is running: the live site, a preview build, or a local dev server
const LINK=/^https?:$/.test(location.protocol)?location.origin:SITE;
// the image is made while the button is pressed (toDataURL is synchronous), so phones still count the share as a tap
function fileOf(cv,name){
  const bin=atob(cv.toDataURL('image/png').split(',')[1]),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);
  return new File([a],name,{type:'image/png'});
}
// q: more of the address before from=wa, e.g. 'vs=<cid>&' for a yeshiva
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
  // r.line1/line2: a yeshiva card (an invitation, or who you passed), otherwise the race's place and score
  c.fillStyle=GOLD;c.font=`700 ${H*.08}px ${DISP}`;c.fillText(r.line1||`מקום ${r.pos}: ${r.title}`,W/2,H*.81,W*.9);
  c.fillStyle='#FFF4DC';c.font=`${H*.034}px ${FONT}`;c.fillText(r.line2||`${state.name} · ${r.score.toLocaleString('he-IL')} נקודות ערסיות`,W/2,H*.868,W*.9);
  c.globalAlpha=.8;c.font=`${H*.027}px ${FONT}`;c.fillText('חושב שתגבר? בוא בוא כנסס נראה אותך',W/2,H*.912,W*.9);
  c.globalAlpha=1;c.fillStyle=GOLD;c.direction='ltr';c.fillText(SITE.replace('https://',''),W/2,H*.954);
}
function shareRace(r){
  const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;drawRaceCard(cv.getContext('2d'),W,H,r);
  shareImage(cv,`${state.name} סיים במקום ${r.pos} במירוץ של הנהוראים בפארק, עם ${r.score.toLocaleString('he-IL')} נקודות ערסיות. חושב שתגבר? בוא בוא כנסס נראה אותך`,'nehorace.png');
}
// an invitation to a yeshiva (y: {cid, word}); the link opens it. The yeshiva itself is made by whoever calls this
function shareYeshivaInvite(y){
  const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;
  drawRaceCard(cv.getContext('2d'),W,H,{line1:`הזמנה לישיבת ${y.word}`,line2:state.name});
  shareImage(cv,`${state.name} מזמין אותך לישיבת ${y.word}. כל שבוע מסלול חדש, בוא בוא כנסס נראה אותך`,'nehorace-yeshiva.png',`vs=${y.cid}&`);
}
// telling the group: "נהוראי X עקף את נהוראי Y בישיבת Z", with the same link
function sharePassed(y,names){
  const who=names.length>2?`${names.slice(0,2).join(', ')} ועוד ${names.length-2}`:names.join(' ואת '),W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;
  drawRaceCard(cv.getContext('2d'),W,H,{line1:`עקפתי את ${who}`,line2:`${state.name} · ישיבת ${y.word}`});
  shareImage(cv,`${state.name} עקף את ${who} בישיבת ${y.word}. נראה אתכם מחזירים`,'nehorace-yeshiva.png',`vs=${y.cid}&`);
}

export { SITE, shareImage, shareRace, shareYeshivaInvite, sharePassed, drawRaceCard };

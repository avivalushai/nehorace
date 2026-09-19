// Album grid and lightbox UI, saving a photo.
import { $, FONT, INK } from '../core/util.js';
import { fitCv } from '../core/draw.js';
import { state } from '../core/state.js';
import { drawPhoto } from './scenes.js';
import { ALBUM } from './build.js';
import { shareImage, SITE } from '../ui/share.js';

// ---------- album + lightbox UI ----------
let lbI=0,lbRAF=0,lbT0=0,lbX=null;
function openAlbum(){
  $('#album').classList.add('on');$('#album').scrollTop=0;
  const d=new Date();$('#albumSub').textContent=`אלבום המירוץ של ${state.name}, ${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`;
  const g=$('#albumGrid');g.innerHTML='';
  ALBUM.forEach((ph,i)=>{const b=document.createElement('button');b.className='pol';b.style.setProperty('--r',((i%2?1:-1)*(1.2+(i%3)*.7))+'deg');
    b.innerHTML='<canvas></canvas><span></span>';b.querySelector('span').textContent=ph.caption;b.setAttribute('aria-label',ph.caption);b.onclick=()=>openLB(i);g.appendChild(b);
    const{c,w,h}=fitCv(b.querySelector('canvas'));drawPhoto(c,w,h,ph,1.0);});
}
function lbInfo(){$('#lbCap').textContent=ALBUM[lbI].caption;$('#lbCount').textContent=`${lbI+1} מתוך ${ALBUM.length}`;}
function openLB(i){lbI=i;lbT0=performance.now();$('#lightbox').classList.add('on');lbInfo();cancelAnimationFrame(lbRAF);
  const f=now=>{const{c,w,h}=fitCv($('#lbCv'));drawPhoto(c,w,h,ALBUM[lbI],(now-lbT0)/1000);lbRAF=requestAnimationFrame(f);};lbRAF=requestAnimationFrame(f);}
function lbGo(d){lbI=(lbI+d+ALBUM.length)%ALBUM.length;lbT0=performance.now();lbInfo();}
function closeLB(){cancelAnimationFrame(lbRAF);$('#lightbox').classList.remove('on');}
$('#giftBtn').onclick=openAlbum;
$('#albumClose').onclick=()=>$('#album').classList.remove('on');
$('#lbClose').onclick=closeLB;$('#lbNext').onclick=()=>lbGo(1);$('#lbPrev').onclick=()=>lbGo(-1);
$('#lbCv').addEventListener('pointerdown',e=>{lbX=e.clientX;});
$('#lbCv').addEventListener('pointerup',e=>{if(lbX==null)return;const dx=e.clientX-lbX;lbX=null;if(Math.abs(dx)>40)lbGo(dx<0?1:-1);});
addEventListener('keydown',e=>{if(!$('#lightbox').classList.contains('on'))return;if(e.key==='ArrowLeft')lbGo(1);if(e.key==='ArrowRight')lbGo(-1);if(e.key==='Escape')closeLB();});
// the magnet as a picture: the photo, its caption, and where it's from
function photoCanvas(){
  const W=1080,H=1540,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
  c.fillStyle='#FFFFFF';c.fillRect(0,0,W,H);c.save();c.translate(40,40);drawPhoto(c,1000,1250,ALBUM[lbI],1.0);c.restore();
  c.fillStyle=INK;c.font=`46px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText(ALBUM[lbI].caption,W/2,1360,W-80);
  c.fillStyle='#B3831D';c.font=`34px ${FONT}`;c.fillText('מתנה קטנה מאירוע גדול',W/2,1440);
  c.fillStyle='#8A7A99';c.font=`28px ${FONT}`;c.direction='ltr';c.fillText(SITE.replace('https://',''),W/2,1496);
  return cv;
}
$('#lbSave').onclick=()=>{
  const a=document.createElement('a');a.href=photoCanvas().toDataURL('image/png');a.download=`nehorace-${lbI+1}.png`;document.body.appendChild(a);a.click();a.remove();
};
$('#lbShare').onclick=()=>shareImage(photoCanvas(),`מגנט מהמירוץ של ${state.name}: ${ALBUM[lbI].caption}. בואו למירוץ של הנהוראים בפארק`,`nehorace-${lbI+1}.png`);

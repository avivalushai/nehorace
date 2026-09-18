// Coins, wallet, shop screen and garage trophies.
import { $ } from '../core/util.js';
import { ell, fitCv, star } from '../core/draw.js';
import { SHOP, SHOP_TABS, drawItem, tierOf } from './items.js';

// ================= COINS + SHOP =================
const Wallet={coins:0,inv:{}};
// saved in localStorage; window.storage (claude.ai artifacts only) is a fallback. storage can be blocked (private mode), so every access is guarded
const WALLET_KEY='nehorace-wallet';
function walletApply(raw){if(!raw)return false;const o=JSON.parse(raw);if(!o||typeof o!=='object')return false;
  Wallet.coins=Number.isFinite(o.coins)&&o.coins>0?Math.floor(o.coins):0;Wallet.inv={};
  if(o.inv&&typeof o.inv==='object')for(const[id,n]of Object.entries(o.inv))if(Number.isFinite(n)&&n>0)Wallet.inv[id]=Math.floor(n);return true;}
async function walletLoad(){
  let ok=false;try{ok=walletApply(localStorage.getItem(WALLET_KEY));}catch(e){}
  if(!ok)try{if(window.storage){const r=await window.storage.get(WALLET_KEY,false);if(r&&walletApply(r.value))walletSave();}}catch(e){}
  updWalletUI();}
async function walletSave(){const data=JSON.stringify({coins:Wallet.coins,inv:Wallet.inv});
  try{localStorage.setItem(WALLET_KEY,data);}catch(e){}
  try{if(window.storage)await window.storage.set(WALLET_KEY,data,false);}catch(e){}}
const PLACE_COINS=[300,200,150,100,70,50];
function calcCoins(pos,S){S=S||{};const rows=[['🏁',`מקום ${pos} במירוץ`,PLACE_COINS[pos-1]||40]];const add=(ic,l,n,per)=>{if(n>0)rows.push([ic,`${n} ${l}`,n*per]);};
  add('🧍','אנשים שדרסת',S.people||0,15);add('🧒','ילדים',S.kids||0,20);add('👴','פנסיונרים',S.seniors||0,18);add('🐾','חיות',(S.dogs||0)+(S.cats||0)+(S.pigeons||0),8);
  add('🍖','מנגלים שהפכת',S.mangal||0,30);add('🎯','פעילויות שהרסת',S.acts||0,25);add('🗑️','פריטי רכוש ציבורי',S.property||0,5);add('🛴','נהוראים שדחפת',S.bumps||0,10);add('🤬','קללות שחטפת',S.curses||0,2);
  return rows;}
let shopTab='all';
function ownedCount(id){return Wallet.inv[id]||0;}
function updWalletUI(){const n=Wallet.coins.toLocaleString('he-IL');['#walletNow','#shopCoins'].forEach(q=>{const e=$(q);if(e)e.textContent=n;});}
function showCoins(rows,won){
  $('#coinRows').innerHTML=rows.map(([ic,l,v])=>`<li><span>${ic} ${l}</span><b>+${v}</b></li>`).join('');
  const el=$('#coinsWon'),t0=performance.now(),dur=1300;const step=now=>{const k=Math.min(1,(now-t0)/dur);el.textContent='+'+Math.round(won*(1-Math.pow(1-k,3))).toLocaleString('he-IL');if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);updWalletUI();
}
function toast(msg){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),2200);}
function drawItemCard(c,w,h,it){
  const T=tierOf(it.price),g=c.createRadialGradient(w/2,h*.45,4,w/2,h*.5,Math.max(w,h)*.7);g.addColorStop(0,T.col+'70');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  if(it.price>=1500){c.save();c.translate(w/2,h*.48);c.fillStyle=T.col+'26';for(let i=0;i<10;i++){c.rotate(Math.PI/5);c.beginPath();c.moveTo(0,0);c.lineTo(w,-w*.13);c.lineTo(w,w*.13);c.closePath();c.fill();}c.restore();}
  ell(c,w/2,h*.87,w*.28,h*.05,'rgba(0,0,0,.4)');
  c.save();c.translate(w/2,h*.47);drawItem(c,it.id,Math.min(w,h)*.8);c.restore();
  if(it.price>=500)[[.18,.2],[.84,.28],[.26,.72]].forEach(([x,y],i)=>star(c,w*x,h*y,4+i,'rgba(255,255,255,.9)'));
}
function nextGoal(){const pool=SHOP.filter(it=>!it.cons&&!ownedCount(it.id)).sort((a,b)=>a.price-b.price);return pool.find(it=>it.price>Wallet.coins)||pool[pool.length-1]||null;}
function renderShop(justId){
  updWalletUI();const tabs=$('#shopTabs');tabs.innerHTML='';
  const cnt={all:SHOP.length,mine:SHOP.filter(it=>ownedCount(it.id)>0).length};SHOP.forEach(it=>cnt[it.cat]=(cnt[it.cat]||0)+1);
  SHOP_TABS.forEach(([id,l])=>{const b=document.createElement('button');b.className='tab'+(shopTab===id?' on':'');b.innerHTML=`${l} <span class="tcount">${cnt[id]||0}</span>`;b.onclick=()=>{shopTab=id;renderShop();};tabs.appendChild(b);});
  const grid=$('#shopGrid');grid.innerHTML='';
  if(shopTab==='all'){const gl=nextGoal();if(gl){const pct=Math.min(100,Math.round(Wallet.coins/gl.price*100)),left=Math.max(0,gl.price-Wallet.coins),races=Math.ceil(left/350);
    const d=document.createElement('div');d.className='goal';d.innerHTML=`<canvas></canvas><div><small>היעד הבא שלך</small><b></b><div class="gprog"><i style="width:${pct}%"></i></div><span>${left?`${Wallet.coins.toLocaleString('he-IL')} מתוך ${gl.price.toLocaleString('he-IL')}, ${races>1?`עוד בערך ${races} מירוצים`:'עוד מירוץ אחד בערך'}`:'אפשר לקנות עכשיו!'}</span></div>`;
    d.querySelector('b').textContent=gl.name;grid.appendChild(d);const{c,w,h}=fitCv(d.querySelector('canvas'));drawItemCard(c,w,h,gl);}}
  const list=SHOP.filter(it=>shopTab==='all'||(shopTab==='mine'?ownedCount(it.id)>0:it.cat===shopTab));
  if(!list.length){grid.insertAdjacentHTML('beforeend','<p class="shop-empty">עוד לא קנית כלום. יאללה, לעבוד על המירוצים.</p>');return;}
  list.forEach(it=>{const own=ownedCount(it.id),owned=!it.cons&&own>0,can=Wallet.coins>=it.price,T=tierOf(it.price);
    const card=document.createElement('div');card.className='item'+(owned?' owned':'')+(justId===it.id?' pop':'');card.dataset.id=it.id;card.style.setProperty('--tc',T.col);
    card.innerHTML=`<div class="ivis"><canvas></canvas><span class="rar">${T.name}</span>${owned?'<span class="stamp">שלך</span>':''}${it.cons&&own?`<span class="cnt">יש לך ${own}</span>`:''}</div>
      <b class="iname"></b><small class="iline"></small>${it.perk?`<small class="iperk">⚡ ${it.perk}</small>`:''}
      ${!owned&&!can?`<div class="iprog"><i style="width:${Math.round(Wallet.coins/it.price*100)}%"></i></div>`:''}
      <div class="ibot"><span class="price"><span class="coin"></span>${it.price.toLocaleString('he-IL')}</span><button class="buy"></button></div>`;
    card.querySelector('.iname').textContent=it.name;card.querySelector('.iline').textContent=it.line||'';
    const btn=card.querySelector('.buy');
    if(owned){btn.textContent='ברשותך';btn.disabled=true;}
    else if(!can){btn.textContent=`חסרים ${(it.price-Wallet.coins).toLocaleString('he-IL')}`;btn.disabled=true;}
    else{btn.textContent=it.cons&&own?'עוד אחד':'קנייה';btn.onclick=()=>buyItem(it);}
    grid.appendChild(card);const{c,w,h}=fitCv(card.querySelector('canvas'));drawItemCard(c,w,h,it);});
}
function buyItem(it){if(Wallet.coins<it.price)return;if(!it.cons&&ownedCount(it.id))return;Wallet.coins-=it.price;Wallet.inv[it.id]=ownedCount(it.id)+1;walletSave();toast(`קנית ${it.name}! ${it.line||''}`);renderShop(it.id);}
function openShop(){$('#shop').classList.add('on');$('#shop').scrollTop=0;renderShop();}
$('#shopBtn').onclick=openShop;$('#shopClose').onclick=()=>$('#shop').classList.remove('on');
if($('#gShopBtn'))$('#gShopBtn').onclick=openShop;
// trophies: big things you own show up on the garage stage
function drawTrophies(c,w,h,gy){
  const has=id=>ownedCount(id)>0,S=Math.min(w,h);
  if(has('civic')){c.save();c.globalAlpha=.95;c.translate(w*.5,gy-S*.2);drawItem(c,'civic',S*.9);c.restore();}
  const spots=[['nargila',w*.1],['speaker',w*.9],['karaoke',w*.2],['puppy',w*.8],['crete',null]];
  spots.forEach(([id,x])=>{if(x==null||!has(id))return;c.save();c.translate(x,gy-S*.1);drawItem(c,id,S*.22);c.restore();});
}

export { Wallet, walletLoad, walletSave, calcCoins, ownedCount, showCoins, drawTrophies };

// Race loop: start, update, collisions, speech bubbles, input, finish and results screen.
import { drawTitle, show } from '../main.js';
import { $, clamp, hash, pick, rand } from '../core/util.js';
import { fitCv } from '../core/draw.js';
import { COLORS, VEH } from '../core/catalog.js';
import { OPP_NAMES, TXT } from './texts.js';
import { state, vColor } from '../core/state.js';
import { drawComposition, setStep, stopStage } from '../ui/garage.js';
import { PW, RACE_LEN, cx, genWorld, makeRacer, newDir, randLook, resetPid } from './world.js';
import { render } from './render.js';
import { Music, musicStart, musicStop } from '../music/engine.js';
import { setStage } from '../music/songs.js';
import { ALBUM, buildAlbum, rec } from '../album/build.js';
import { Wallet, calcCoins, ownedCount, showCoins, walletSave, toast } from '../shop/ui.js';
import { shareRace } from '../ui/share.js';
import { garageSummary } from '../ui/collection.js';
import { Stats, recordRace } from '../core/stats.js';
import { unlockedBetween } from '../core/unlocks.js';
import { submitRace } from '../net/leaderboard.js';
import { openBoard } from '../ui/board.js';

let race=null,rRAF=0,lastTs=0,RK=1,LW=400,LH=800;
const rcv=$('#raceCv'),rctx=rcv.getContext('2d'),keys={};
function resizeRace(){const W=innerWidth,H=innerHeight,dpr=Math.min(2,devicePixelRatio||1);rcv.width=Math.round(W*dpr);rcv.height=Math.round(H*dpr);rcv.style.width=W+'px';rcv.style.height=H+'px';const k=Math.min(W/440,H/700);RK=k*dpr;LW=W/k;LH=H/k;}
addEventListener('resize',()=>{if(race)resizeRace();if($('#title').classList.contains('on'))drawTitle();if($('#results').classList.contains('on'))drawResultsStage();});
function startRace(){
  stopStage();show('race');resizeRace();resetPid();
  race={L:RACE_LEN,t:0,time:0,phase:'count',count:3.4,goT:0,bubbles:[],pending:[],shake:0,doneT:0,tSeg:1,
    stats:{people:0,kids:0,seniors:0,dogs:0,cats:0,pigeons:0,mangal:0,acts:0,property:0,trees:0,bumps:0,curses:0,grass:0},zone:0,zoneT:0,moments:[]};
  const me=makeRacer({isPlayer:true,name:state.name,look:{...state.look},vid:state.vid,color:vColor(),idx:0});
  const names=[...OPP_NAMES].sort(()=>Math.random()-.5).slice(0,5);
  const opps=names.map((n,i)=>{const L=randLook();L.name=n;const vid=pick(['scooter','scooter','bike','atv']);return makeRacer({name:n,look:L,vid,color:pick(COLORS),idx:i+1,top:VEH[vid].top*rand(.9,.985)});});
  const grid=[[0,-40],[0,40],[-45,-40],[-45,40],[-90,-40],[-90,40]];
  race.racers=[...opps,me];race.racers.forEach((r,i)=>{r.d=grid[i][0];r.x=cx(r.d)+grid[i][1];r.targetX=r.x;r.offset=grid[i][1];});
  race.player=me;race.camX=me.x;
  genWorld();
  opps.slice(0,3).forEach((o,i)=>race.pending.push({t:.4+i*.9,owner:o,list:TXT.oppPre,at:true}));
  if(ownedCount('redbull')>0){Wallet.inv.redbull--;walletSave();race.tSeg=Math.min(3,race.tSeg+1);race.pending.push({t:.8,owner:race.player,list:['פחית רדבול! טורבו מלא','שותה רדבול ויוצא לדרך']});}
  updPips();musicStart();lastTs=performance.now();cancelAnimationFrame(rRAF);rRAF=requestAnimationFrame(loop);
}
function loop(ts){if(!race)return;const dt=Math.min(.05,Math.max(0,(ts-lastTs)/1000));lastTs=ts;update(dt);if(race){render();rRAF=requestAnimationFrame(loop);}}
function updPips(){$('#pips').innerHTML=[0,1,2].map(i=>`<span class="pip ${i<race.tSeg?'on':''}"></span>`).join('');$('#turboBtn').classList.toggle('empty',race.tSeg===0);}

function say(owner,list,atPlayer,force){
  if(!owner||!list||!list.length)return;if(owner.sayCd>0&&!force)return;owner.sayCd=1.7;
  const kind=owner.isPlayer?'me':owner.isRacer?'opp':'ped';
  race.bubbles=race.bubbles.filter(b=>b.owner!==owner);
  if(race.bubbles.length>=5){const i=race.bubbles.findIndex(b=>b.kind!=='me');if(i>=0)race.bubbles.splice(i,1);else return;}
  const text=pick(list);race.bubbles.push({owner,text,life:2.4,max:2.4,kind});if(atPlayer)race.stats.curses++;return text;
}
function knock(p,r,dx,dd){
  const sp0=r.speed;
  const len=Math.hypot(dx,dd)||1,k=.5+r.speed/450*(r.turboT>0?1.5:1);
  p.down=true;p.downT=2.2+Math.random();p.kvx=dx/len*120*k+rand(-40,40);p.kvd=r.speed*.5+dd/len*60;p.spin=rand(-9,9);p.byPlayer=!!r.isPlayer;
  r.speed*=1-r.veh.hitPen*p.m;r.stun=Math.max(r.stun,.3*p.m);r.knocks++;
  if(r.isPlayer){race.stats[p.cat]++;race.shake=Math.max(race.shake,4*p.m+1.5);const rl=TXT.rideHit[r.vid],tx=say(p,rl&&(p.type==='adult'||p.type==='kid'||p.type==='senior'||p.type==='jogger')&&Math.random()<.5?rl:TXT.hit[p.type],true,true);rec({type:'knock',ped:{type:p.type,shirt:p.shirt,hair:p.hair,balloon:p.balloon,fur:p.fur},text:tx,speed:Math.round(sp0*.09)});if(Math.random()<.6)race.pending.push({t:.6,owner:r,list:TXT.pHit});}
  else if(Math.random()<.35)say(p,TXT.hit[p.type]);
}
function hitStatic(s,r,dx){
  const me=r.isPlayer,sp0=Math.round(r.speed*.09);
  if(r.veh.flies&&FLY_OVER.has(s.type))return; // the wings fly over trees, lamps, benches and bins
  if(s.type==='tree'||s.type==='lamp'){
    if(r.solidCd>0)return;r.solidCd=.6;r.speed*=r.veh.id==='atv'?.55:.3;r.stun=.6;r.x+=(dx>0?-1:1)*10;if(me){r.targetX=r.x;race.stats.trees++;race.shake=9;const my=say(r,TXT.pTree,false,true);rec({type:'tree',my,speed:0});}return;}
  s.broken=true;s.bt=0;r.speed*=1-r.veh.hitPen*s.m;r.stun=Math.max(r.stun,.25);
  if(s.type==='act'){r.knocks+=s.people;if(me){race.stats.acts++;race.stats[s.cat]+=s.people;rec({type:'prop',kind:s.kind,speed:sp0,text:say(s,TXT.act[s.kind],true,true)});race.shake=7;if(Math.random()<.6)race.pending.push({t:1.7,owner:s,list:TXT.getup,at:true});}else if(Math.random()<.4)say(s,TXT.act[s.kind]);}
  else if(s.type==='mangal'){r.knocks+=s.sitters;if(me){race.stats.mangal++;race.stats.people+=s.sitters;rec({type:'prop',kind:'mangal',speed:sp0,text:say(s,TXT.mangal,true,true)});race.shake=7;}}
  else if(s.type==='cart'){if(me){race.stats.property++;rec({type:'prop',kind:'cart',speed:sp0,text:say(s,TXT.cart,true,true)});race.shake=6;}}
  else if(me){race.stats.property++;race.shake=4;if(Math.random()<.5)say(s,TXT.prop,true);else race.pending.push({t:.2,owner:r,list:TXT.pProp});}
}
function lowerBound(arr,d){let lo=0,hi=arr.length;while(lo<hi){const m=(lo+hi)>>1;if(arr[m].d<d)lo=m+1;else hi=m;}return lo;}

function update(dt){
  const P=race.player;race.t+=dt;
  if(race.phase==='count'){race.count-=dt;if(race.count<=0){race.phase='race';race.goT=1.1;race.zoneT=2.6;Music.leadOn=true;}}
  const racing=race.phase!=='count';
  if(race.phase!=='count')race.time+=dt;
  if(race.goT>0)race.goT-=dt;
  if(keys.left)P.targetX-=320*P.veh.handling*dt;if(keys.right)P.targetX+=320*P.veh.handling*dt;
  for(const r of race.racers){
    r.sayCd-=dt;r.bumpCd-=dt;r.solidCd-=dt;r.stun=Math.max(0,r.stun-dt);if(r.turboT>0)r.turboT-=dt;
    const grass=Math.abs(r.x-cx(r.d))>PW/2;
    let target=0;
    if(racing){
      target=r.top*(grass?r.veh.grassF:1)*(r.turboT>0?1.45:1);
      if(!r.isPlayer){const diff=r.d-P.d;if(diff>450)target*=.9;else if(diff<-350)target*=1.08;if(r.finished)target*=.4;
        r.aiT-=dt;if(r.aiT<=0){r.aiT=rand(7,14);r.turboT=2;if(Math.random()<.4)say(r,TXT.oppChat,false);}}
      if(r.isPlayer&&race.phase==='done')target=r.top*.3;
      if(r.stun>0)target*=.6;
      if(r.isPlayer&&grass&&race.phase==='race')race.stats.grass+=dt;
    }
    const a=target>r.speed?r.veh.accel:2.4;r.speed+=(target-r.speed)*Math.min(1,a*dt);
    const oldD=r.d;r.d+=r.speed*dt;
    let tx;
    if(r.isPlayer){r.targetX+=(cx(r.d)-cx(oldD))*.85;const lim=PW/2+110;r.targetX=clamp(r.targetX,cx(r.d)-lim,cx(r.d)+lim);tx=r.targetX;}
    else{
      r.offT-=dt;if(r.offT<=0){r.offT=rand(1.5,4);r.offset=rand(-PW/2+25,PW/2-25);}
      tx=cx(r.d+90)+r.offset;
      for(const p of race.peds){if(p.down||p.gone||p.ghost>0||p.flying)continue;const dd=p.d-r.d;if(dd<8||dd>150)continue;const dx=p.x-r.x;if(Math.abs(dx)<26){if(hash(p.id,r.idx)>r.careless)tx=p.x+(dx>0?-40:40);break;}}
    }
    const maxLat=(r.isPlayer?340:230)*r.veh.handling*dt*(r.stun>0?.5:1);
    const px=r.x;r.x+=clamp(tx-r.x,-maxLat,maxLat);if(r.stun>0)r.x+=Math.sin(race.t*40)*.8;
    const lim=PW/2+115,c0=cx(r.d);r.x=clamp(r.x,c0-lim,c0+lim);
    r.lean+=(clamp((r.x-px)/Math.max(dt,1e-3)*.004,-.35,.35)-r.lean)*Math.min(1,10*dt);
    if(!r.finished&&r.d>=race.L){r.finished=true;r.finishTime=race.time-(r.d-race.L)/Math.max(r.speed,1);if(r.isPlayer){race.phase='done';race.doneT=2.6;race.statsAtFinish={...race.stats};}}
  }
  for(const p of race.peds){
    if(p.gone||Math.abs(p.d-P.d)>1300)continue;
    p.ph+=dt*8;p.nearCd-=dt;p.sayCd-=dt;p.ghost-=dt;
    if(p.down){const f=Math.exp(-3.5*dt);p.x+=p.kvx*dt;p.d+=p.kvd*dt;p.kvx*=f;p.kvd*=f;p.rot+=p.spin*dt;p.spin*=f;p.downT-=dt;
      if(p.downT<=0){p.down=false;p.ghost=1.5;p.rot=0;if(p.type==='pigeon'){p.flying=true;p.fly=2;p.vx=rand(-60,60);p.vd=rand(60,120);}else if(p.byPlayer&&Math.random()<.45)say(p,TXT.getup,true);}
      continue;}
    if(p.flying){p.x+=p.vx*dt;p.d+=p.vd*dt;p.fly-=dt;if(p.fly<=0)p.gone=true;continue;}
    p.turnT-=dt;if(p.turnT<=0)newDir(p);
    p.x+=p.vx*dt;p.d+=p.vd*dt;
    const off=p.x-cx(p.d),lim=PW/2+(p.type==='dog'||p.type==='kid'?50:8);
    if(off>lim)p.vx=-Math.abs(p.vx)-5;else if(off<-lim)p.vx=Math.abs(p.vx)+5;
    if(p.type==='pigeon'&&!p.fleeChk){for(const r of race.racers){const dd=p.d-r.d;if(dd>0&&dd<95&&Math.abs(p.x-r.x)<55){p.fleeChk=true;if(Math.random()<.7){p.flying=true;p.fly=2.5;p.vx=rand(-110,110);p.vd=rand(40,160);}break;}}}
  }
  if(racing)for(const r of race.racers){if(r.isPlayer&&r.finished)continue;
    for(const p of race.peds){if(p.down||p.gone||p.ghost>0||p.flying)continue;const dd=p.d-r.d;if(dd>40||dd<-40)continue;const dx=p.x-r.x,rs=r.veh.r+p.r,d2=dx*dx+dd*dd;
      if(d2<rs*rs)knock(p,r,dx,dd);
      else if(r.isPlayer&&d2<(rs+22)*(rs+22)&&p.nearCd<=0&&r.speed>220){p.nearCd=5;if(Math.random()<.45)say(p,TXT.near[p.type]||TXT.near.adult,true);}}
    const i0=lowerBound(race.statics,r.d-40);
    for(let i=i0;i<race.statics.length&&race.statics[i].d<r.d+40;i++){const s=race.statics[i];if(!s.col||s.broken)continue;const dx=s.x-r.x,dd=s.d-r.d,rs=r.veh.r+s.col;if(dx*dx+dd*dd<rs*rs)hitStatic(s,r,dx);}
  }
  const RS=race.racers;
  for(let i=0;i<RS.length;i++)for(let j=i+1;j<RS.length;j++){const a=RS[i],b=RS[j];const dd=b.d-a.d;if(Math.abs(dd)>36)continue;const dx=b.x-a.x,rs=a.veh.r+b.veh.r;
    if(dx*dx+dd*dd<rs*rs){const sg=dx>=0?1:-1,ov=(rs-Math.abs(dx))*.5+.5,wa=b.veh.mass/(a.veh.mass+b.veh.mass);a.x-=sg*ov*wa*1.6;b.x+=sg*ov*(1-wa)*1.6;
      (dd>0?a:b).speed*=.9;
      if(a.bumpCd<=0&&b.bumpCd<=0&&racing){a.bumpCd=b.bumpCd=1.2;if((a.isPlayer||b.isPlayer)&&!P.finished){const o=a.isPlayer?b:a;race.stats.bumps++;race.shake=5;say(o,TXT.oppBump,true,true);race.pending.push({t:.7,owner:P,list:TXT.pBump});}}}}
  for(const k of race.pickups){if(k.taken)continue;if(Math.abs(k.d-P.d)<20&&Math.abs(k.x-P.x)<20){k.taken=true;race.tSeg=Math.min(3,race.tSeg+1);updPips();say(P,TXT.pPick,false);}}
  if(race.phase==='race'&&race.time>2){for(const r of RS){if(r.isPlayer)continue;const now=r.d>P.d;if(now!==r.ahead){r.ahead=now;if(now)say(r,TXT.oppPass,true);else{let my=null,op=null;if(Math.random()<.5)my=say(P,TXT.pPass,false);else op=say(r,TXT.oppPassed,true);rec({type:'pass',opp:{name:r.name,look:{...r.look},vid:r.vid,color:r.color},text:op||pick(TXT.oppPassed),my:my||pick(TXT.pPass)});}}}}
  else for(const r of RS)r.ahead=r.d>P.d;
  for(const q of race.pending)q.t-=dt;
  race.pending=race.pending.filter(q=>{if(q.t<=0){say(q.owner,q.list,q.at,true);return false;}return true;});
  race.bubbles.forEach(b=>b.life-=dt);race.bubbles=race.bubbles.filter(b=>b.life>0);
  for(const s of race.statics){if(s.broken)s.bt+=dt;if(s.sayCd)s.sayCd-=dt;}
  {const zi=P.d<race.L/3?0:P.d<2*race.L/3?1:2;if(zi!==race.zone){race.zone=zi;race.zoneT=2.6;setStage(zi);}if(race.zoneT>0)race.zoneT-=dt;}
  if(race.phase==='race'){const j0=lowerBound(race.statics,P.d-70);for(let i=j0;i<race.statics.length&&race.statics[i].d<P.d+70;i++){const s=race.statics[i];if(s.type!=='act'||s.broken)continue;s.nearCd-=dt;const dx=s.x-P.x,dd=s.d-P.d;if(s.nearCd<=0&&dx*dx+dd*dd<(s.col+70)*(s.col+70)){s.nearCd=6;if(Math.random()<.4)say(s,TXT.actNear,true);}}}
  race.shake=Math.max(0,race.shake-dt*20);
  race.camX+=((.55*cx(P.d+120)+.45*P.x)-race.camX)*Math.min(1,5*dt);
  if(race.phase==='done'&&!race.ff){race.doneT-=dt;if(race.doneT<=0)finishRace();}
}

// ---------- input ----------
let drag=null;
rcv.addEventListener('pointerdown',e=>{drag={x:e.clientX,id:e.pointerId};try{rcv.setPointerCapture(e.pointerId);}catch(_){}});
rcv.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||!race)return;const k=RK/Math.min(2,devicePixelRatio||1);race.player.targetX+=(e.clientX-drag.x)/k*1.15;drag.x=e.clientX;});
const endDrag=e=>{if(drag&&e.pointerId===drag.id)drag=null;};rcv.addEventListener('pointerup',endDrag);rcv.addEventListener('pointercancel',endDrag);
addEventListener('keydown',e=>{if(!race)return;if(e.key==='ArrowLeft'||e.key==='a')keys.left=true;if(e.key==='ArrowRight'||e.key==='d')keys.right=true;if(e.key===' '){e.preventDefault();useTurbo();}if(e.key==='Escape')exitRace();});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=false;if(e.key==='ArrowRight'||e.key==='d')keys.right=false;});
const FLY_OVER=new Set(['tree','lamp','bench','bin']);
function useTurbo(){if(!race||race.phase!=='race'||race.tSeg<=0||race.player.turboT>0)return;race.tSeg--;race.player.turboT=race.player.veh.turboLen||2.3;updPips();const my=say(race.player,(TXT.rideTurbo[race.player.vid])||TXT.pTurbo,false,true);if(!race.moments.some(m=>m.type==='turbo'))rec({type:'turbo',my});}
$('#turboBtn').addEventListener('pointerdown',e=>{e.preventDefault();useTurbo();});
function exitRace(){cancelAnimationFrame(rRAF);musicStop();race=null;setStep(0);show('garage');}
$('#exitBtn').onclick=exitRace;

// ---------- results ----------
function fmt(tm,hund){const cs=Math.floor(tm*100+1e-6);return `${Math.floor(cs/6000)}:${String(Math.floor(cs/100)%60).padStart(2,'0')}.${hund?String(cs%100).padStart(2,'0'):Math.floor(cs%100/10)}`;}
function finishRace(){
  musicStop();
  cancelAnimationFrame(rRAF);
  race.ff=true;for(let g=0;g<60*240&&race.racers.some(r=>!r.finished);g++)update(1/60);
  const order=[...race.racers].sort((a,b)=>{if(a.finished&&b.finished)return a.finishTime-b.finishTime;if(a.finished)return -1;if(b.finished)return 1;return b.d-a.d;});
  const P=race.player,pos=order.indexOf(P)+1,S=race.statsAtFinish||race.stats;
  const titles=['מלך הפארק','סגן מלך','פודיום, אחי','באמצע, כמו תמיד','תחליף סוללה','אכלת אבק'];
  $('#resRank').textContent=`מקום ${pos}`;$('#resTitle').textContent=titles[pos-1]||titles[5];$('#resTime').textContent=`זמן: ${fmt(P.finishTime,true)}`;
  const victims=S.people+S.kids+S.seniors+S.dogs+S.cats+S.pigeons;
  const score=S.people*10+S.kids*15+S.seniors*12+(S.dogs+S.cats+S.pigeons)*6+S.mangal*25+S.acts*15+S.property*5+S.trees*3+S.bumps*6+S.curses*2+Math.max(0,7-pos)*20;
  {const before=Stats.career,rc=recordRace({score,pos,time:P.finished?P.finishTime:0,victims}),badges=[];
    if(rc.newScore)badges.push('🏆 שיא נקודות חדש!');if(rc.newTime)badges.push('⏱️ הזמן הכי מהיר שלך!');
    const opened=unlockedBetween(before,Stats.career);opened.slice(0,3).forEach(x=>badges.push(`🔓 פתחת: ${x.label}`));if(opened.length>3)badges.push(`🔓 ועוד ${opened.length-3} פריטים`);
    // send the race to the champions board; the weekly rank shows up as another badge when it answers
    submitRace({name:state.name,score,pos,time:P.finishTime,look:(({name,...l})=>l)(state.look)}).then(r=>{if(r&&(r.nameTaken||r.nameRequired)){toast(r.nameTaken?`השם ${state.name} כבר תפוס, אז המירוץ לא נכנס לטבלה. בחרו שם אחר במסך הפתיחה`:'כדי להיכנס לטבלת האלופים צריך להוסיף שם אחרי נהוראי');return;}if(!r||!r.week||!r.week.rank)return;const el=$('#resRec'),sp=document.createElement('span');sp.textContent=`🏆 מקום ${r.week.rank} השבוע`;el.appendChild(sp);el.hidden=false;});
    const el=$('#resRec');el.innerHTML=badges.map(b=>`<span>${b}</span>`).join('');el.hidden=!badges.length;}
  // what you ran over is listed once, with the coins it earned; the score goes up top
  $('#resScore').innerHTML=`<b>${score.toLocaleString('he-IL')}</b> נקודות ערסיות`;
  {const card={pos,score,title:titles[pos-1]||titles[5]};$('#shareBtn').onclick=()=>shareRace(card);}
  $('#verdict').textContent=victims===0?'עברת את כל הפארק בלי לגעת באף אחד. בטוח שאתה נהוראי?':victims<5?'התחלה יפה. העירייה עוד לא שמה לב':victims<13?'יש כבר שלוש תלונות בקבוצת הווטסאפ של השכונה':victims<26?'המשטרה בדרך, והיא לא שמחה':'הפארק סגור עד להודעה חדשה. אגדה.';
  $('#table').innerHTML=order.map((r,i)=>`<li class="${r.isPlayer?'me':''}"><span class="n">${i+1}</span><span>${r.isPlayer?r.name+' (אתה)':r.name}<small>${r.veh.name}</small></span><span>${r.knocks} נדרסו<small>${r.finished?fmt(r.finishTime,true):'לא סיים'}</small></span></li>`).join('');
  buildAlbum(pos,race.moments||[],order.map(r=>({name:r.name,look:{...r.look},vid:r.vid,color:r.color,time:r.finished?r.finishTime:null,me:!!r.isPlayer})),S);$('#giftSub').textContent=`${ALBUM.length} מגנטים מהמירוץ, באהבה מהפארק`;
  {const crow=calcCoins(pos,S),won=crow.reduce((a,r)=>a+r[2],0);Wallet.coins+=won;walletSave();showCoins(crow,won);}
  $('#myGarageSub').textContent=garageSummary();
  race=null;show('results');$('#results').scrollTop=0;$('.res-panel').scrollTop=0;
  drawResultsStage();
}
function drawResultsStage(){const{c,w,h}=fitCv($('#resCv'));drawComposition(c,w,h,{mode:'veh',look:state.look,vid:state.vid,color:vColor(),wheels:state.wheels,stickers:state.stickers,t:1});}
// dev shortcut (?dev in the address): simulate a whole race instantly and land on the results screen
function devQuickRace(){startRace();for(let g=0;g<60*300&&race;g++)update(1/60);}
$('#againBtn').onclick=startRace;
$('#resBoardBtn').onclick=()=>openBoard('week');
$('#garageBtn').onclick=()=>{setStep(0);show('garage');};

export { race, RK, LW, LH, rctx, startRace, devQuickRace, lowerBound, fmt };

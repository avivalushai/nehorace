// Race world: path geometry (cx), pedestrians, activities and static objects.
import { pick, rand } from '../core/util.js';
import { PARTS, VEH } from '../core/catalog.js';
import { ACTS, ZONE_ACTS } from './texts.js';
import { race } from './engine.js';

// ================= RACE =================
const PW=230,RACE_LEN=18000;
const cx=d=>Math.sin(d*.0021)*58+Math.sin(d*.0055+1.3)*22;
const PT={adult:{r:8,m:1,cat:'people'},vendor:{r:8,m:1,cat:'people'},kid:{r:6,m:.6,cat:'kids'},senior:{r:8,m:.9,cat:'seniors'},jogger:{r:8,m:1,cat:'people'},dog:{r:7,m:.5,cat:'dogs'},cat:{r:5,m:.3,cat:'cats'},pigeon:{r:4,m:.1,cat:'pigeons'}};
const SHIRTC=['#E63946','#3DA5FF','#F4A261','#8E44FF','#2A9D8F','#F2F2F2','#FFB703','#6D597A'];
let pid=0;
function resetPid(){pid=0;}
const HAIRC=['#1B120C','#5A3A1C','#C9A15A','#2B2B2B','#8B3A1A'];

function randLook(){const L={name:''};PARTS.forEach(p=>{L[p.id]=pick(p.items.filter(it=>!it[2]||it[2].req<12000))[0];});L.dog=Math.random()<.2?pick(['pitbull','pom']):'none';return L;}
function makeRacer(o){const V=VEH[o.vid];return Object.assign({isRacer:true,veh:V,d:0,x:0,speed:0,top:V.top,targetX:0,stun:0,turboT:0,sayCd:0,lean:0,knocks:0,finished:false,finishTime:0,bumpCd:0,solidCd:0,offset:0,offT:0,aiT:rand(6,12),careless:rand(.3,.62),ahead:false},o);}
function makePed(type,d,x){const p={id:pid++,type,d,x,vx:0,vd:0,r:PT[type].r,m:PT[type].m,cat:PT[type].cat,turnT:0,down:false,ghost:0,nearCd:0,sayCd:0,rot:0,ph:Math.random()*6,shirt:pick(SHIRTC),hair:pick(HAIRC),fur:pick(['#8B5A2B','#D9A66B','#F2F2F2','#333333']),balloon:type==='kid'&&Math.random()<.5?pick(['#FF3D8B','#FFC83D','#3DA5FF']):null};
  if(type==='jogger'){p.vd=-rand(80,115);p.shirt=pick(['#C6FF3D','#FF3D8B','#3DF5FF']);}
  if(type==='senior'){p.hair='#D8D8D8';p.shirt=pick(['#C8B08A','#9AA3B0','#7A8F6A']);}
  if(type==='vendor')p.shirt='#FFFFFF';
  return p;}
function newDir(p){
  const T=p.type;
  if(T==='vendor'||T==='pigeon'){p.vx=p.vd=0;p.turnT=99;return;}
  if(T==='adult'){if(Math.random()<.25){p.vx=(Math.random()<.5?-1:1)*rand(18,28);p.vd=rand(-6,6);}else{p.vd=(Math.random()<.5?-1:1)*rand(14,28);p.vx=rand(-10,10);}p.turnT=rand(2,5);}
  if(T==='kid'){const a=rand(0,Math.PI*2),s=rand(35,70);p.vx=Math.cos(a)*s;p.vd=Math.sin(a)*s;p.turnT=rand(.6,1.6);}
  if(T==='senior'){p.vd=(Math.random()<.5?-1:1)*rand(6,12);p.vx=rand(-4,4);p.turnT=rand(4,7);}
  if(T==='jogger'){p.vx=rand(-15,15);p.turnT=rand(1,2);}
  if(T==='dog'){if(Math.random()<.2){p.vx=p.vd=0;}else{const a=rand(0,Math.PI*2),s=rand(40,100);p.vx=Math.cos(a)*s;p.vd=Math.sin(a)*s;}p.turnT=rand(.5,1.4);}
  if(T==='cat'){if(Math.random()<.7){p.vx=p.vd=0;p.turnT=rand(1.5,3);}else{const a=rand(0,Math.PI*2),s=rand(80,130);p.vx=Math.cos(a)*s;p.vd=Math.sin(a)*s;p.turnT=rand(.4,.8);}}
}
function genWorld(){
  const Lr=race.L,S=race.statics=[],P=race.peds=[],K=race.pickups=[];
  const clear=(list,x,d,pad)=>!list.some(a=>Math.abs(a.d-d)<a.col+pad&&Math.abs(a.x-x)<a.col+pad);
  for(let s=-800;s<Lr+900;s+=200){
    const zi=s<Lr/3?0:s<2*Lr/3?1:2,taken=[];
    for(const side of[-1,1]){
      if(s>100&&s<Lr&&Math.random()<.45){const d=s+rand(30,170),kind=pick(ZONE_ACTS[zi]),A=ACTS[kind];
        const col=A.col*1.25,o={type:'act',kind,d,x:cx(d)+side*(PW/2+col+rand(6,22)),col,m:.8,people:A.people,cat:A.cat,seed:Math.floor(Math.random()*8),ph:Math.random()*6,nearCd:0};S.push(o);taken.push(o);}
      if(Math.random()<(zi===1?.3:.12)&&s>200&&s<Lr){const d=s+rand(20,180),x=cx(d)+side*(PW/2+rand(40,70));if(clear(taken,x,d,30)){const o={type:'mangal',d,x,col:24,m:.8,sitters:2+Math.floor(Math.random()*2),hue:pick(['#D62839','#1F5FD0','#2A9D8F']),seed:Math.floor(Math.random()*8)};S.push(o);taken.push(o);}}
    }
    for(const side of[-1,1]){
      const nT=1+Math.floor(Math.random()*3);
      for(let i=0;i<nT;i++){const d=s+rand(0,200),x=cx(d)+side*(PW/2+rand(48,270)),r=rand(20,32);if(clear(taken,x,d,r+10))S.push({type:'tree',d,x,r,col:8,hue:Math.random()});}
      if(Math.random()<.22){const d=s+rand(20,180);S.push({type:'bench',d,x:cx(d)+side*(PW/2+16),col:11,m:.7});}
      if(Math.random()<.2&&s>300&&s<Lr-300){const d=s+rand(20,180);S.push({type:'bin',d,x:cx(d)+side*(PW/2-10),col:7,m:.5});}
      if(Math.random()<.2){const d=s+rand(0,200),x=cx(d)+side*(PW/2+rand(30,200));if(clear(taken,x,d,20))S.push({type:'flower',d,x,col:0,hue:Math.random()});}
    }
    if(Math.floor(s/200)%2===0)for(const side of[-1,1])S.push({type:'lamp',d:s,x:cx(s)+side*(PW/2+7),col:4});
    if(s>800&&s<Lr-500&&Math.random()<.12){const side=Math.random()<.5?-1:1,d=s+100;S.push({type:'cart',d,x:cx(d)+side*(PW/2-24),col:13,m:1});P.push(makePed('vendor',d-6,cx(d)+side*(PW/2-50)));}
  }
  S.sort((a,b)=>a.d-b.d);
  for(let d=450;d<Lr-250;d+=rand(34,68)){
    const x=cx(d)+rand(-PW/2+12,PW/2-12),r=Math.random();
    if(r<.65&&Math.random()<.2)continue; // 20% fewer people on the path
    if(r<.3)P.push(makePed('adult',d,x));else if(r<.45)P.push(makePed('kid',d,x));else if(r<.56)P.push(makePed('senior',d,x));
    else if(r<.65)P.push(makePed('jogger',d,x));else if(r<.77)P.push(makePed('dog',d,x));else if(r<.84)P.push(makePed('cat',d,x));
    else{const n=4+Math.floor(Math.random()*3);for(let i=0;i<n;i++)P.push(makePed('pigeon',d+rand(-14,14),x+rand(-16,16)));}
  }
  P.forEach(newDir);
  for(let d=700;d<Lr-400;d+=rand(520,780))K.push({d,x:cx(d)+rand(-PW/2+22,PW/2-22),taken:false});
}

export { PW, RACE_LEN, cx, SHIRTC, resetPid, HAIRC, randLook, makeRacer, newDir, genWorld };

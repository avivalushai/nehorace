// Album building: recording race moments, choosing angles and captions.
import { pick } from '../core/util.js';
import { TXT } from '../race/texts.js';
import { state } from '../core/state.js';
import { race } from '../race/engine.js';
import { COVER_LINES, INNER2 } from './scenes.js';

// ================= ALBUM: "מתנה קטנה מאירוע גדול" =================
const HUMAN_T=['adult','kid','senior','jogger','vendor'];
const VNAME={adult:'עובר אורח',kid:'ילד עם בלון',senior:'פנסיונר',jogger:'רץ בוקר',vendor:'מוכר גלידה',dog:'כלב',cat:'חתול',pigeon:'יונה'};
const ACT_NAME={mangal:'מנגל משפחתי',cart:'עגלת גלידה',juggle:"מופע ג'אגלינג",frisbee:'משחק פריזבי',sunbathe:'שיזוף משפחתי',football:'משחק כדורגל',sheshbesh:'משחק שש-בש',nargila:'ערב נרגילה',yoga:'שיעור יוגה',guitar:'הופעת גיטרה'};
const CAPS={
 adult:["נכנס לאלבום בלי שהזמינו אותו","רגע לפני התלונה במשטרה","שלום לך אדוני, לא ראיתי אותך","הוא רק רצה לקנות במבה","הוא עוד לא יודע שהוא באלבום"],
 kid:["הבלון עוד בדרך לירח","אבא שלו שוטר. נראה מה יהיה","הילד הזה יספר על זה בגן שנה שלמה","מחר בגן: הצגה ותספר"],
 senior:["הוא יכתוב על זה בפייסבוק. באותיות גדולות","בזמנו לא היו קורקינטים בפארק","המקל עדיין מסתובב באוויר","ערב טוב גם לך, אדוני"],
 jogger:["שבר שיא אישי. לא בריצה","האימון של היום נגמר מוקדם","השעון החכם רשם: טיסה"],
 vendor:["הגלידות לא שרדו את האירוע","ארטיק על חשבון הבית"],
 dog:["הכלב קיבל טיסה חינם","מישהו יחזיר את הכלב הזה לבעלים?","וואף באוויר"],
 cat:["נשארו לו שמונה נשמות","החתול ראה את כל חייו עוברים מול העיניים","נחת על ארבע, כמובן"],
 pigeon:["היונים לא ציפו לזה","היונה הזאת כבר לא חוזרת לפארק","נוצות בכל הפארק"],
 pass:["{opp} עדיין לא מבין מה קרה לו","תאכל אבק, {opp}","הפרצוף של {opp} שווה את כל המירוץ","{opp} שוקל להחליף תחביב","ביי ביי, {opp}"],
 mangal:["הקבב עף לפני שהגיע לצלחת","המנגל הכי קצר בהיסטוריה","הכבד היה כמעט מוכן"],
 cart:["כל הגלידות על חשבון הבית","טעם חדש: אספלט"],
 juggle:["הכדור השלישי עוד באוויר","ג'אגלינג עם בני אדם"],frisbee:["תפיסה של אלופים. עם הפנים","הפריזבי נחת בעיר אחרת"],sunbathe:["השיזוף נגמר מוקדם היום","המגבת עפה, הכבוד גם"],
 football:["פנדל! ואף אחד לא שם לב לשער","כרטיס אדום לנהוראי"],sheshbesh:["המארס הכי יקר בהיסטוריה","שש-בש, ואז בום"],nargila:["הגחלים עפו לכל עבר","ענבים-מנטה באוויר"],
 yoga:["תנוחת הכלב המבולבל","נשימה עמוקה. ואז עוד אחת"],guitar:["הסולו נקטע בשיאו","ההופעה הבאה נדחתה"],
 tree:["העץ הזה קפץ עליו. באמת","מי שם פה עץ?","העץ ניצח בסיבוב הזה"],
 turbo:["טורבו. והשרשרת עפה אחורה","מהירות האור, גרסת הפארק"],
 cruise:["נסיעה רגועה בפארק. כמעט","רגע של שקט לפני הסערה"],
};
const ANGLE_CAPS={cctv:["מצלמת האבטחה ראתה הכל","העירייה כבר ביקשה את ההקלטות"],phone:["מישהו כבר העלה את זה לטיקטוק","שלושה מיליון צפיות בשעה"],news:["עלה לחדשות. הפעם לא בגלל השירה","מבזק מיוחד מהפארק"],
 drone:["צילום רחפן. שווה כל שקל","מלמעלה זה נראה עוד יותר גרוע"],rear:["מצלמת גב. הם לא ראו אותו מגיע","מבט מאחורי השרשרת"],hero:["זווית גבורה","ככה נראה אלוף"],
 mirror:["האובייקטים במראה קרובים יותר ממה שנראה"],selfie:["סלפי לאינסטגרם","חייב להעלות את זה לסטורי"],front:["דו״ח בדרך הביתה","המצלמה תפסה {speed} קמ״ש בשביל הליכה"]};
const SPECIAL_CAPS={wanted:["מבוקש בכל הפארקים בארץ","העירייה הדפיסה 500 עותקים"],newspaper:["עמוד ראשון, סוף סוף","אמא שלו גזרה את הכתבה"],mugshot:["תמונה לתיק. חיוך למצלמה","התמונה הכי יפה שלו השנה"],
 group:["תמונה משפחתית עם כל הנפגעים","צ'יז! כולם באו לאירוע"],photofinish:["ההבדל היה בשרשרת","הכרעה בצילום"]};
let ALBUM=[];
function rec(m){if(!race||race.ff||race.player.finished||race.moments.length>80)return;m.t=race.time;if(m.speed==null)m.speed=Math.round(race.player.speed*.09);race.moments.push(m);}
function pickDistinct(arr,n,key){const out=[],seen=new Set();for(const m of arr){const k=key(m);if(!seen.has(k)){seen.add(k);out.push(m);if(out.length>=n)return out;}}for(const m of arr){if(out.length>=n)break;if(!out.includes(m))out.push(m);}return out;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const ANGLES_FOR={knock:['side','front','selfie','drone','rear','cctv','phone','news','hero'],pass:['side','front','selfie','drone','rear','mirror','phone','news'],prop:['side','front','selfie','drone','cctv','phone','news','hero'],
 tree:['side','cctv','phone','news','drone'],turbo:['rear','hero','front','side','drone'],cruise:['side','hero','rear','drone']};
const ALL_ANGLES=['side','front','selfie','drone','rear','cctv','phone','news','hero','mirror'];
const FX_OK=['side','front','selfie','drone','rear','hero','mirror','group','podium'];
const randPal=()=>{const r=Math.random();return r<.4?0:r<.58?1:r<.72?2:r<.86?3:4;};
const randFx=()=>{const r=Math.random();return r<.55?'none':r<.7?'vintage':r<.85?'warm':'bw';};
const rv3=()=>[Math.random(),Math.random(),Math.random()];
function capFor(ph){
  if(ANGLE_CAPS[ph.angle]&&Math.random()<.45)return pick(ANGLE_CAPS[ph.angle]).replace('{speed}',ph.speed||42);
  const key=ph.type==='knock'?ph.ped.type:ph.type==='prop'?ph.kind:ph.type;return pick(CAPS[key]||CAPS.cruise).replace('{opp}',ph.opp?ph.opp.name:'');
}
function buildAlbum(pos,M,order,S){
  S=S||{};order=order||[];
  const H=M.filter(m=>m.type==='knock'&&HUMAN_T.includes(m.ped.type)),A=M.filter(m=>m.type==='knock'&&!HUMAN_T.includes(m.ped.type));
  const PS=M.filter(m=>m.type==='pass'),PR=M.filter(m=>m.type==='prop'),TR=M.filter(m=>m.type==='tree'),TU=M.filter(m=>m.type==='turbo');
  let list=[...pickDistinct(shuffle([...H]),3,m=>m.ped.type),...pickDistinct(shuffle([...A]),1,m=>m.ped.type),...pickDistinct(shuffle([...PS]),2,m=>m.opp.name),...pickDistinct(shuffle([...PR]),2,m=>m.kind),...TR.slice(0,1)];
  if(list.length<5)list.push(...TU.slice(0,1));
  if(list.length<3)list.push({type:'cruise',t:5,speed:40},{type:'cruise',t:9,speed:38});
  list.sort((a,b)=>a.t-b.t);
  let deck=shuffle([...ALL_ANGLES]);
  const takeAngle=type=>{const ok=ANGLES_FOR[type]||ANGLES_FOR.cruise;let i=deck.findIndex(a=>ok.includes(a));if(i<0){deck=shuffle([...ALL_ANGLES]);i=deck.findIndex(a=>ok.includes(a));}return i>=0?deck.splice(i,1)[0]:pick(ok);};
  const base=list.map(m=>{const ph={...m,rv:rv3(),pal:randPal(),S,order};ph.angle=takeAngle(m.type);if(INNER2[ph.angle])ph.inner=m.type==='tree'?'side':pick(INNER2[ph.angle]);ph.fx=FX_OK.includes(ph.angle)?randFx():'none';ph.caption=capFor(ph);
    ph.my=ph.my||pick(m.type==='knock'||m.type==='prop'?TXT.pHit:m.type==='tree'?TXT.pTree:m.type==='pass'?TXT.pPass:TXT.pTurbo);return ph;});
  // one-off specials: a different mix every race
  const victims=(S.people||0)+(S.kids||0)+(S.seniors||0)+(S.dogs||0)+(S.cats||0)+(S.pigeons||0);
  const pool=[];
  if(victims>0)pool.push({angle:'wanted'});
  const ev=base.filter(p=>p.type==='knock'||p.type==='pass'||p.type==='prop');
  if(ev.length)pool.push({angle:'newspaper',innerPh:{...pick(ev),angle:'side',my:null,text:null,fx:'none'}});
  pool.push({angle:'mugshot'});
  const oppsL=order.filter(r=>!r.me&&!r.isPlayer);if(oppsL.length>=2){const l=shuffle([...oppsL]).slice(0,3).map(r=>({look:{...r.look,name:r.name},name:r.name,isPlayer:false}));l.splice(Math.floor(Math.random()*(l.length+1)),0,{look:{...state.look,name:state.name},name:state.name,isPlayer:true});pool.push({angle:'lineup',lineup:l,pos});}
  pool.push({angle:'magazine',cover:shuffle([...COVER_LINES]).slice(0,3).map(x=>x.replace('{name}',state.name))});
  const hv=pickDistinct(M.filter(m=>m.type==='knock'),4,m=>m.ped.type).map(m=>m.ped);
  if(hv.length>=2)pool.push({angle:'group',victims:hv,my:"צ'יז!"});
  const specials=shuffle(pool).slice(0,base.length<5?4:3).map(sp=>({type:'special',...sp,S,order,pal:randPal(),rv:rv3(),fx:FX_OK.includes(sp.angle)?randFx():'none',caption:pick(SPECIAL_CAPS[sp.angle])}));
  const all=[...base];specials.forEach(sp=>all.splice(1+Math.floor(Math.random()*all.length),0,sp));
  const fv=pick(['finish','podium','photofinish']),fin={type:'finish',pos,speed:0,S,order,pal:randPal(),rv:rv3(),fx:'none'};
  if(fv==='finish'){fin.angle='front';fin.caption=pos===1?'מלך הפארק על קו הסיום':`מקום ${pos}. העיקר שהשרשרת שלמה`;fin.my=pos===1?'אין עליי בעולם!':'בפעם הבאה, אחי';}
  else if(fv==='podium'){fin.angle='podium';fin.caption=pos<=3?(pos===1?'הפודיום שלו, הפארק שלו':'על הפודיום, אחי'):'לפחות הוא בתמונה';fin.my=pos<=3?'אין עליי!':'זה מכור!';}
  else{fin.angle='photofinish';fin.caption=pick(SPECIAL_CAPS.photofinish);}
  all.push(fin);ALBUM=all;
}
FX_OK.push('slowmo');
ALL_ANGLES.push('gopro','comic','story','magnet','slowmo');
['knock','pass','prop'].forEach(k=>ANGLES_FOR[k].push('gopro','comic','story','magnet','slowmo'));
ANGLES_FOR.tree.push('comic','slowmo','magnet');ANGLES_FOR.turbo.push('gopro','slowmo','story');ANGLES_FOR.cruise.push('gopro','magnet','story');
Object.assign(ANGLE_CAPS,{gopro:["מצלמת הקסדה לא משקרת","ככה זה נראה מהכידון"],comic:["נכנס לחוברת הקומיקס של השכונה","ואז הגיע הבום"],story:["הסטורי הכי נצפה בשכונה","97 אחוז אמרו כן"],magnet:["המגנט שכל האורחים לקחו הביתה","מגנט למקרר, מתנה מהאירוע"],slowmo:["בהילוך איטי זה נראה אפילו יותר גרוע","כל שנייה נצרבה"]});
Object.assign(SPECIAL_CAPS,{lineup:["העדים הצביעו על אותו אחד","מסדר זיהוי. אף אחד לא הופתע"],magazine:["שער הגיליון החודשי","סוף סוף מישהו כתב עליו כתבה"]});

export { HUMAN_T, VNAME, ACT_NAME, ALBUM, rec, buildAlbum };

// Shop catalog, rarity tiers and item drawings.
import { FONT, GOLD, GOLD2, INK, PINK } from '../core/util.js';
import { R, circ, ell, ln, poly, rr, star } from '../core/draw.js';
import { drawDog } from '../art/dog.js';

const SHOP=[
 {id:'seeds',name:'שקית גרעינים שחורים',price:25,cat:'small',cons:1,line:'הקליפות כבר על הרצפה'},
 {id:'flipflops',name:'כפכפי אצבע חדשים',price:50,cat:'style',line:'עם הפס הכחול, כמו שצריך'},
 {id:'redbull',name:'פחית רדבול',price:60,cat:'small',cons:1,perk:'טורבו נוסף בתחילת המירוץ הבא',line:'הלב דופק, הקורקינט טס'},
 {id:'shawarma',name:'שווארמה בלאפה',price:70,cat:'small',cons:1,line:'עם הכל, ועמבה בצד'},
 {id:'barber',name:'תספורת אצל שלומי',price:80,cat:'style',cons:1,line:'פייד חדש עם שני קווים'},
 {id:'marlboro',name:'מלבורו אדום',price:90,cat:'small',cons:1,line:'קופסה אחת. נגמרת עד הערב'},
 {id:'shades',name:'משקפי שמש מראה',price:150,cat:'style',line:'עכשיו רואים רק את עצמך'},
 {id:'tracksuit',name:'טרנינג מבריק חדש',price:250,cat:'style',line:'מבריק כמו הרצפה בקניון'},
 {id:'gym',name:'מנוי שנתי לחדר כושר',price:300,cat:'big',line:'בעיקר לסלפי מול המראה'},
 {id:'nargila',name:'נרגילה',price:350,cat:'big',line:'מישהו כבר מבקש ראש'},
 {id:'speaker',name:'רמקול בלוטות׳ ענק',price:400,cat:'big',line:'כל הפארק ישמע מזרחית'},
 {id:'karaoke',name:'ערכת קריוקי',price:600,cat:'big',line:'השכנים כבר מתקשרים'},
 {id:'teeth',name:'הלבנת שיניים',price:700,cat:'style',line:'חיוך שמסנוור בלילה'},
 {id:'puppy',name:'גור פיטבול',price:800,cat:'big',line:'קוראים לו טייסון'},
 {id:'chain24',name:'שרשרת זהב 24 קראט',price:900,cat:'style',line:'שוקלת יותר מהקורקינט'},
 {id:'concert',name:'כרטיס להופעה של אייל גולן',price:1200,cat:'big',line:'שורה ראשונה, ליד הרמקולים'},
 {id:'uman',name:'כרטיס טיסה לאומן',price:1500,cat:'big',line:'נ נח נחמ נחמן מאומן'},
 {id:'watch',name:'שעון זהב עם יהלומים',price:1800,cat:'style',line:'לא מראה שעה, רק נוצץ'},
 {id:'phone',name:'טלפון חדש עם 3 מצלמות',price:2000,cat:'big',line:'בשביל עוד סטוריז מהפארק'},
 {id:'crete',name:'חופשה בכרתים',price:2500,cat:'big',line:'הכל כלול, כולל הבלגן'},
 {id:'civic',name:'הונדה סיוויק',price:5000,cat:'big',line:'מונמכת, עם חלונות כהים'},
];
const SHOP_TABS=[['all','הכל'],['small','קטנים'],['style','סטייל'],['big','גדולים'],['mine','שלי']];
function drawItem(c,id,S){
  c.save();const k=S/100;c.scale(k,k);c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=3;
  switch(id){
    case 'seeds':poly(c,[[-28,-30],[28,-30],[34,40],[-34,40]],'#222');R(c,-24,-10,48,24,'#FFFFFF');c.fillStyle=INK;c.font=`12px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('גרעינים',0,2);for(let i=0;i<5;i++){c.save();c.translate(-30+i*15,-40+(i%2)*6);c.rotate(i);ell(c,0,0,5,3,i%2?'#fff':'#333');c.restore();}break;
    case 'flipflops':for(const sx of[-1,1]){c.save();c.translate(sx*20,0);c.rotate(sx*.15);c.beginPath();c.ellipse(0,0,15,40,0,0,7);c.fillStyle='#26262E';c.fill();c.stroke();c.strokeStyle='#3DA5FF';c.lineWidth=5;ln(c,0,-26,-11,-4);ln(c,0,-26,11,-4);c.restore();}break;
    case 'redbull':rr(c,-20,-44,40,88,8);c.fillStyle='#2F4FA0';c.fill();c.stroke();c.fillStyle='#C9CED6';c.fillRect(-20,-44,20,88);R(c,-20,-44,40,88,'rgba(0,0,0,0)');R(c,-17,-50,34,8,'#C9CED6');c.fillStyle='#fff';c.font=`13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.save();c.translate(0,4);c.rotate(-Math.PI/2);c.direction='rtl';c.fillText('אנרגיה',0,0);c.restore();break;
    case 'shawarma':c.save();c.rotate(-.35);rr(c,-20,-40,40,80,18);c.fillStyle='#E8C58A';c.fill();c.stroke();c.fillStyle='#5BAE45';c.fillRect(-14,-44,8,10);c.fillStyle='#E63946';c.fillRect(-4,-46,8,10);c.fillStyle='#8B4A20';c.fillRect(6,-44,8,10);R(c,-22,10,44,32,'#FFFFFF');c.restore();break;
    case 'barber':c.lineWidth=5;ln(c,-24,30,20,-36);ln(c,24,30,-20,-36);c.lineWidth=3;for(const sx of[-1,1]){c.beginPath();c.arc(sx*24,38,10,0,7);c.fillStyle='#FFC83D';c.fill();c.stroke();}circ(c,0,4,4,'#999');break;
    case 'marlboro':R(c,-26,-36,52,76,'#FFFFFF');R(c,-26,-36,52,26,'#D11F2A');for(let i=0;i<3;i++){R(c,-16+i*12,-52,8,18,'#FFFFFF');R(c,-16+i*12,-52,8,5,'#E0A050');}c.fillStyle=INK;c.font=`12px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('אדום',0,14);break;
    case 'shades':c.save();c.lineWidth=5;ln(c,-40,-6,40,-6);c.restore();for(const sx of[-1,1]){const g=c.createLinearGradient(sx*22-18,-20,sx*22+18,16);g.addColorStop(0,'#3DF5FF');g.addColorStop(.5,'#8E44FF');g.addColorStop(1,'#FF3D8B');c.beginPath();c.ellipse(sx*22,0,18,14,0,0,7);c.fillStyle=g;c.fill();c.stroke();}break;
    case 'tracksuit':poly(c,[[-24,-40],[24,-40],[46,-20],[40,40],[-40,40],[-46,-20]],'#17171F');c.fillStyle='#EDEDED';c.fillRect(-2,-38,4,76);for(const sx of[-1,1]){c.fillRect(sx*38-2,-22,4,60);}poly(c,[[-12,-40],[0,-28],[12,-40]],'#2B2B35');break;
    case 'gym':R(c,-30,-4,60,8,'#9AA0AE');for(const sx of[-1,1]){R(c,sx*30-(sx>0?0:12),-22,12,44,'#2B2B35');R(c,sx*44-(sx>0?0:8),-15,8,30,'#2B2B35');}break;
    case 'nargila':c.beginPath();c.ellipse(0,26,22,20,0,0,7);c.fillStyle='rgba(61,165,255,.85)';c.fill();c.stroke();R(c,-4,-34,8,44,'#C9A15A');c.beginPath();c.ellipse(0,-10,14,4,0,0,7);c.fillStyle=GOLD;c.fill();c.stroke();R(c,-10,-46,20,12,'#8B5A2B');R(c,-6,-50,12,4,'#FF7A1A');c.save();c.strokeStyle='#5E3A8A';c.lineWidth=4;c.beginPath();c.moveTo(12,20);c.quadraticCurveTo(46,10,36,-30);c.stroke();c.restore();break;
    case 'speaker':rr(c,-30,-44,60,88,10);c.fillStyle='#1E1E26';c.fill();c.stroke();circ(c,0,-18,12,'#555');circ(c,0,20,20,'#555');circ(c,0,20,8,'#222');c.save();c.strokeStyle='#3DF5FF';c.lineWidth=3;c.beginPath();c.arc(0,20,26,-.6,.6);c.stroke();c.restore();break;
    case 'karaoke':c.save();c.rotate(-.5);rr(c,-8,-10,16,56,6);c.fillStyle='#2B2B35';c.fill();c.stroke();c.restore();circ(c,-12,-22,16,'#C9CED6');c.save();c.strokeStyle='#999';c.lineWidth=1.5;for(let i=-2;i<=2;i++)ln(c,-12+i*5,-36,-12+i*5,-8);c.restore();c.fillStyle=PINK;c.font=`34px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('♪',28,-20);c.fillText('♫',22,20);break;
    case 'teeth':c.beginPath();c.moveTo(-26,-30);c.quadraticCurveTo(0,-44,26,-30);c.quadraticCurveTo(34,0,20,34);c.lineTo(10,40);c.lineTo(4,10);c.lineTo(-4,10);c.lineTo(-10,40);c.lineTo(-20,34);c.quadraticCurveTo(-34,0,-26,-30);c.closePath();c.fillStyle='#FFFFFF';c.fill();c.stroke();star(c,22,-34,12,GOLD);star(c,-30,10,8,GOLD);break;
    case 'puppy':c.save();c.translate(-10,40);c.scale(.95,.95);drawDog(c,'pitbull',0);c.restore();break;
    case 'chain24':for(let i=0;i<16;i++){const a=i/16*Math.PI*2;c.save();c.translate(Math.cos(a)*32,Math.sin(a)*26-6);c.rotate(a+Math.PI/2);rr(c,-7,-5,14,10,5);c.fillStyle=i%2?GOLD:GOLD2;c.fill();c.stroke();c.restore();}circ(c,0,28,12,GOLD);star(c,0,28,7,'#fff');break;
    case 'concert':rr(c,-44,-26,88,52,8);c.fillStyle=GOLD;c.fill();c.stroke();c.save();c.setLineDash([4,4]);ln(c,20,-24,20,24);c.restore();c.fillStyle=INK;c.font=`16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('הופעה',-10,-6);c.font=`12px ${FONT}`;c.fillText('שורה 1',-10,12);c.font=`22px ${FONT}`;c.fillText('♪',32,0);break;
    case 'uman':rr(c,-44,-22,88,44,8);c.fillStyle='#FFFFFF';c.fill();c.stroke();R(c,-44,-22,88,12,'#1F5FD0');c.fillStyle=INK;c.font=`11px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('תל אביב ← אומן',0,6);c.save();c.translate(24,-38);c.rotate(-.3);poly(c,[[-16,0],[16,-3],[20,0],[16,3]],'#C9CED6');poly(c,[[-2,-2],[8,-14],[12,-14],[6,-2]],'#C9CED6');poly(c,[[-2,2],[8,14],[12,14],[6,2]],'#C9CED6');c.restore();break;
    case 'watch':R(c,-12,-46,24,92,GOLD2);circ(c,0,0,26,GOLD);circ(c,0,0,19,'#FFFFFF');for(let i=0;i<12;i++){const a=i*Math.PI/6;star(c,Math.cos(a)*15,Math.sin(a)*15,2.4,'#3DF5FF');}ln(c,0,0,0,-12);ln(c,0,0,9,0);break;
    case 'phone':rr(c,-26,-46,52,92,10);c.fillStyle='#2B2B35';c.fill();c.stroke();rr(c,-18,-38,24,30,6);c.fillStyle='#111';c.fill();for(const [x,y]of[[-10,-30],[-10,-17],[1,-24]])circ(c,x,y,4.5,'#3A3A48');circ(c,12,-32,2.5,'#FFF7B0',1);break;
    case 'crete':circ(c,26,-26,16,'#FFC83D');R(c,-46,10,92,32,'#3DA5FF',1);c.save();c.strokeStyle='#fff';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-40+i*28,22);c.quadraticCurveTo(-33+i*28,16,-26+i*28,22);c.stroke();}c.restore();R(c,-46,32,92,10,'#EBD9AC',1);c.save();c.lineWidth=3;ln(c,-18,34,-18,-20);c.restore();c.beginPath();c.moveTo(-44,-18);c.quadraticCurveTo(-18,-44,8,-18);c.closePath();c.fillStyle=PINK;c.fill();c.stroke();break;
    case 'civic':c.beginPath();c.moveTo(-48,14);c.lineTo(-46,-4);c.lineTo(-24,-8);c.lineTo(-10,-26);c.lineTo(22,-26);c.lineTo(36,-8);c.lineTo(48,-4);c.lineTo(48,14);c.closePath();c.fillStyle='#E8E8EC';c.fill();c.stroke();
      poly(c,[[-8,-22],[6,-22],[6,-9],[-18,-9]],'#1A1A22');poly(c,[[10,-22],[20,-22],[30,-9],[10,-9]],'#1A1A22');R(c,40,-12,10,5,'#2B2B35');R(c,44,-18,3,6,'#2B2B35');R(c,-48,-2,6,5,'#FFF7B0');R(c,44,-2,5,5,'#FF2D2D');
      for(const x of[-28,28]){circ(c,x,14,11,'#1E1E26');circ(c,x,14,5,GOLD);}c.save();c.strokeStyle=PINK;c.lineWidth=2;ln(c,-40,4,40,4);c.restore();break;
    default:circ(c,0,0,30,GOLD);
  }c.restore();}
const TIERS=[{max:99,name:'נפוץ',col:'#8FA3BF'},{max:499,name:'שווה',col:'#3DDC97'},{max:1499,name:'נדיר',col:'#3DA5FF'},{max:2999,name:'אפי',col:'#FF3D8B'},{max:1e9,name:'אגדי',col:'#FFC83D'}];
const tierOf=p=>TIERS.find(t=>p<=t.max);

export { SHOP, SHOP_TABS, drawItem, tierOf };

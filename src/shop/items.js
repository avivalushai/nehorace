// Shop catalog, rarity tiers and item drawings.
import { FONT, GOLD, GOLD2, INK, PINK, SKIN } from '../core/util.js';
import { R, circ, ell, ln, poly, rr, star } from '../core/draw.js';
import { drawDog } from '../art/dog.js';

const SHOP=[
 {id:'seeds',name:'שקית גרעינים שחורים',price:25,cat:'small',cons:1,line:'הקליפות כבר על הרצפה'},
 {id:'coffee',name:'קפה שחור מהקיוסק',price:35,cat:'small',cons:1,line:'שלוש כפיות סוכר, בלי להתנצל'},
 {id:'bamba',name:'שקית במבה',price:45,cat:'small',cons:1,line:'חצי נשפכת על הטרנינג'},
 {id:'flipflops',name:'כפכפי אצבע חדשים',price:50,cat:'style',line:'עם הפס הכחול, כמו שצריך'},
 {id:'redbull',name:'פחית רדבול',price:60,cat:'small',cons:1,perk:'טורבו נוסף בתחילת המירוץ הבא',line:'הלב דופק, הקורקינט טס'},
 {id:'shawarma',name:'שווארמה בלאפה',price:70,cat:'small',cons:1,line:'עם הכל, ועמבה בצד'},
 {id:'shampoo',name:'שמפו ״עדן שולדרס״',price:70,cat:'style',cons:1,line:'בלי קשקשים, עם ברק'},
 {id:'barber',name:'תספורת אצל שלומי',price:80,cat:'style',cons:1,line:'פייד חדש עם שני קווים'},
 {id:'marlboro',name:'מלבורו אדום',price:90,cat:'small',cons:1,line:'קופסה אחת. נגמרת עד הערב'},
 {id:'brows',name:'גבות מעוצבות אצל רויטל',price:90,cat:'style',cons:1,line:'קו ישר, בלי רחמים'},
 {id:'shades',name:'משקפי שמש מראה',price:150,cat:'style',line:'עכשיו רואים רק את עצמך'},
 {id:'ashkelon',name:'נסיעה בטיילת באשקלון',price:150,cat:'small',cons:1,line:'חלון פתוח, מוזיקה בפול'},
 {id:'braha',name:'ברכה מהרב',price:220,cat:'small',cons:1,perk:'הניידת מוותרת לך פעם אחת',line:'שם ידו על הראש ואמר: סע לאט'},
 {id:'tracksuit',name:'טרנינג מבריק חדש',price:250,cat:'style',line:'מבריק כמו הרצפה בקניון'},
 {id:'table',name:'שולחן מתקפל לישיבות',price:250,cat:'big',line:'נפתח בשנייה, גם לשבת'},
 {id:'perfume',name:'בושם ערסי שמריחים מרחוק',price:260,cat:'style',line:'שתי לחיצות, כל הפארק יודע'},
 {id:'gym',name:'מנוי שנתי לחדר כושר',price:300,cat:'big',line:'בעיקר לסלפי מול המראה'},
 {id:'nargila',name:'נרגילה',price:350,cat:'big',line:'מישהו כבר מבקש ראש'},
 {id:'speaker',name:'רמקול בלוטות׳ ענק',price:400,cat:'big',line:'כל הפארק ישמע מזרחית'},
 {id:'babasali',name:'תמונה של הבאבא סאלי',price:400,cat:'big',line:'שמירה על הקורקינט'},
 {id:'karaoke',name:'ערכת קריוקי',price:600,cat:'big',line:'השכנים כבר מתקשרים'},
 {id:'dragon',name:'שובר לקעקוע דרקון',price:600,cat:'style',cons:1,line:'על כל הגב, שלוש פגישות'},
 {id:'teeth',name:'הלבנת שיניים',price:700,cat:'style',line:'חיוך שמסנוור בלילה'},
 {id:'beach44',name:'שולחן בחוף 4 על 4 בראשון',price:700,cat:'big',line:'ממש על הים, עם צל'},
 {id:'puppy',name:'גור פיטבול',price:800,cat:'big',line:'קוראים לו טייסון'},
 {id:'chain24',name:'שרשרת זהב 24 קראט',price:900,cat:'style',line:'שוקלת יותר מהקורקינט'},
 {id:'tiger',name:'תמונה עם נמר מתאילנד',price:900,cat:'style',line:'הנמר היה רגוע, אנחנו לא'},
 {id:'jacuzzi',name:'ג׳קוזי מתנפח במרפסת',price:1100,cat:'big',line:'השכנים למטה כבר מתלוננים'},
 {id:'concert',name:'כרטיס להופעה של אייל גולן',price:1200,cat:'big',line:'שורה ראשונה, ליד הרמקולים'},
 {id:'beluga',name:'בקבוק בלוגה',price:1300,cat:'big',line:'על השולחן, שכולם יראו'},
 {id:'uman',name:'כרטיס טיסה לאומן',price:1500,cat:'big',line:'נ נח נחמ נחמן מאומן'},
 {id:'stereo',name:'מערכת סטריאו עם סאב',price:1600,cat:'big',line:'הרעידה מגיעה עד הקומה השלישית'},
 {id:'cams',name:'מערכת מצלמות על כל הבית',price:1700,cat:'big',line:'שיראו מי נגע בקורקינט'},
 {id:'watch',name:'שעון זהב עם יהלומים',price:1800,cat:'style',line:'לא מראה שעה, רק נוצץ'},
 {id:'beitar',name:'מנוי לבוקס של ביתר ירושלים',price:1800,cat:'big',line:'צהוב שחור, שורה ראשונה'},
 {id:'phone',name:'טלפון חדש עם 3 מצלמות',price:2000,cat:'big',line:'בשביל עוד סטוריז מהפארק'},
 {id:'chandelier',name:'נברשת קריסטל לסלון',price:2200,cat:'big',line:'התקרה כבר לא עומדת בזה'},
 {id:'crete',name:'חופשה בכרתים',price:2500,cat:'big',line:'הכל כלול, כולל הבלגן'},
 {id:'jetski',name:'אופנוע ים צהוב',price:2800,cat:'big',line:'חונה ליד השולחן בחוף'},
 {id:'civic',name:'הונדה סיוויק',price:5000,cat:'big',line:'מונמכת, עם חלונות כהים'},
 {id:'eyalshow',name:'הופעה פרטית של אייל גולן במרפסת',price:6000,cat:'big',line:'כל השכונה למטה מצלמת'},
 {id:'helicopter',name:'מסוק פרטי לאומן',price:8000,cat:'big',line:'נ נח נחמ נחמן, מהאוויר'},
 {id:'villa',name:'וילה עם עמודים ושני אריות מגבס',price:9999,cat:'big',line:'שתי קומות, שלוש מרפסות, אפס ספרים'},
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
    case 'shampoo':rr(c,-20,-34,40,74,10);c.fillStyle='#2F6FD0';c.fill();c.stroke();R(c,-12,-48,24,16,'#E8EDF5');rr(c,-16,-18,32,36,6);c.fillStyle='#EAF2FF';c.fill();c.stroke();c.fillStyle=INK;c.font=`11px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('עדן',0,-4);c.fillText('שולדרס',0,10);break;
    case 'ashkelon':{R(c,-50,20,100,20,'#555C6B');c.save();c.strokeStyle='#FFF';c.setLineDash([10,8]);c.lineWidth=3;ln(c,-50,30,50,30);c.restore();
      R(c,24,-30,6,50,'#7A4A24');for(let i=0;i<5;i++){c.save();c.translate(27,-30);c.rotate(-1.2+i*.6);poly(c,[[0,0],[26,-8],[30,2],[4,6]],'#3E9657',1);c.restore();}
      rr(c,-46,-34,54,30,6);c.fillStyle='#2F6FD0';c.fill();c.stroke();c.fillStyle='#FFF';c.font=`13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('אשקלון',-19,-19);break;}
    case 'table':{R(c,-48,-14,96,12,'#E8E8EC');for(const sx of[-1,1]){R(c,sx*34-3,-2,6,40,'#9AA0AE');R(c,sx*20-3,-2,6,40,'#9AA0AE');}R(c,-40,36,80,6,'#9AA0AE');c.fillStyle='rgba(0,0,0,.12)';c.fillRect(-48,-6,96,4);break;}
    case 'babasali':{rr(c,-36,-46,72,92,6);c.fillStyle=GOLD;c.fill();c.stroke();R(c,-28,-38,56,76,'#F3E6C8');
      circ(c,0,-10,15,'#E8C9A0');R(c,-16,-26,32,10,'#2B2B35');poly(c,[[-15,-6],[15,-6],[12,22],[-12,22]],'#F6F2E8',1);R(c,-20,16,40,24,'#2B2B35');break;}
    case 'dragon':{rr(c,-46,-28,92,56,8);c.fillStyle='#FFF4DC';c.fill();c.stroke();c.save();c.setLineDash([4,4]);ln(c,-46,0,46,0);c.restore();
      c.save();c.translate(-4,-12);c.scale(.9,.9);poly(c,[[-26,6],[-8,-10],[6,-4],[18,-14],[24,-2],[8,8],[-6,4],[-18,14]],'#2E8B57',1);poly(c,[[14,-12],[26,-22],[28,-10]],'#3FA34A',1);circ(c,20,-10,2.2,INK);c.restore();
      c.fillStyle=INK;c.font=`12px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('שובר לקעקוע',0,16);break;}
    case 'beach44':{R(c,-6,-18,8,46,'#8B5A2B');for(const sx of[-1,1])poly(c,[[0,-20],[sx*44,0],[0,-2]],sx>0?'#FF3D8B':'#FFC83D',1);
      R(c,-34,26,68,8,'#C9A15A');R(c,-28,34,6,16,'#8B5A2B');R(c,22,34,6,16,'#8B5A2B');R(c,-46,46,92,6,'#EBD9AC');
      c.fillStyle=INK;c.font=`13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='ltr';c.fillText('4x4',1,30);break;}
    case 'tiger':{rr(c,-44,-34,88,68,6);c.fillStyle='#8B5A2B';c.fill();c.stroke();R(c,-37,-27,74,54,'#3E9657');
      for(const sx of[-1,1]){poly(c,[[sx*20,-12],[sx*30,-26],[sx*33,-8]],'#F2913B',1);}                       // ears
      c.beginPath();c.ellipse(0,2,26,22,0,0,7);c.fillStyle='#F2913B';c.fill();c.stroke();                      // head
      c.save();c.beginPath();c.ellipse(0,2,26,22,0,0,7);c.clip();c.fillStyle='#2A1D14';
      for(const sx of[-1,1]){c.fillRect(sx*9-1.5,-24,3,12);c.fillRect(sx*17-2,-18,3.5,11);c.fillRect(sx*22-2,0,4,9);c.fillRect(sx*20-2,12,4,8);}c.restore();
      c.fillStyle='#FFF4DC';c.beginPath();c.ellipse(0,12,13,9,0,0,7);c.fill();c.stroke();                      // muzzle
      c.fillStyle='#2A1D14';for(const sx of[-1,1])c.fillRect(sx*9-2,-6,4,6);                                   // eyes
      poly(c,[[-4,6],[4,6],[0,11]],'#2A1D14',1);                                                               // nose
      c.save();c.strokeStyle='#2A1D14';c.lineWidth=1.5;for(const sx of[-1,1])for(let i=0;i<2;i++)ln(c,sx*11,12+i*4,sx*24,9+i*6);c.restore();
      break;}
    case 'beluga':{rr(c,-17,-30,34,70,8);c.fillStyle='rgba(220,236,255,.9)';c.fill();c.stroke();R(c,-8,-54,16,26,'rgba(220,236,255,.9)');R(c,-10,-60,20,8,'#C9CED6');
      rr(c,-15,-16,30,34,4);c.fillStyle='#17305E';c.fill();c.stroke();c.fillStyle=GOLD;c.font=`10px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('בלוגה',0,-6);
      c.save();c.fillStyle='#C9CED6';c.beginPath();c.ellipse(0,8,9,5,0,0,7);c.fill();poly(c,[[9,8],[15,4],[15,12]],'#C9CED6',1);c.restore();break;}
    case 'beitar':{c.save();c.rotate(-.12);rr(c,-50,-16,100,32,6);c.fillStyle=GOLD;c.fill();c.stroke();
      c.save();c.beginPath();c.rect(-50,-16,100,32);c.clip();c.fillStyle='#1A1A22';for(let x=-50;x<50;x+=20)c.fillRect(x,-16,9,32);c.restore();
      c.strokeRect(-50,-16,100,32);c.restore();
      c.fillStyle=INK;c.font=`13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';R(c,-30,20,60,20,'#FFF4DC');c.fillText('ביתר',0,30);break;}
    case 'coffee':{poly(c,[[-22,-30],[22,-30],[16,36],[-16,36]],'#FFFFFF');R(c,-24,-36,48,8,'#D7D7DE');c.save();c.beginPath();c.moveTo(-22,-30);c.lineTo(22,-30);c.lineTo(16,36);c.lineTo(-16,36);c.closePath();c.clip();c.fillStyle='#4A2C17';c.fillRect(-24,-18,48,60);c.restore();
      c.save();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=3;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*7,-44);c.quadraticCurveTo(sx*14,-54,sx*5,-64);c.stroke();}c.restore();break;}
    case 'bamba':{rr(c,-28,-38,56,76,10);c.fillStyle='#FFD64A';c.fill();c.stroke();R(c,-22,-10,44,22,'#E8552F');c.fillStyle='#FFFFFF';c.font=`13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('במבה',0,1);
      for(const[x,y]of[[-14,-26],[2,-30],[14,22],[-6,26]]){c.save();c.translate(x,y);c.rotate(x);rr(c,-9,-5,18,10,5);c.fillStyle='#F2D9A0';c.fill();c.stroke();c.restore();}break;}
    case 'brows':{circ(c,0,6,30,SKIN);c.fillStyle='#2A1D14';for(const sx of[-1,1]){c.save();c.translate(sx*13,-6);c.rotate(sx*.18);rr(c,-11,-4,22,7,3);c.fill();c.stroke();c.restore();}
      for(const sx of[-1,1])circ(c,sx*11,10,3.4,INK);c.save();c.strokeStyle=INK;c.lineWidth=2.5;c.beginPath();c.arc(0,16,10,.2,2.9);c.stroke();c.restore();
      c.save();c.strokeStyle='#C9CED6';c.lineWidth=3;ln(c,26,-34,44,-16);c.restore();star(c,-24,-24,5,'#FFFFFF');break;}
    case 'braha':{rr(c,-34,-44,68,88,8);c.fillStyle='#FFF4DC';c.fill();c.stroke();R(c,-34,-44,68,12,'#2F6FD0');
      c.save();c.translate(0,-14);c.fillStyle=GOLD;for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.fillRect(-1.5,-22,3,10);c.restore();}c.restore();
      circ(c,0,-14,9,'#FFFFFF',1);c.fillStyle=INK;c.font=`12px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('בהצלחה',0,10);c.fillText('ושמירה',0,26);break;}
    case 'perfume':{rr(c,-20,-20,40,56,8);c.fillStyle='rgba(43,43,53,.85)';c.fill();c.stroke();R(c,-9,-34,18,16,'#C9A15A');R(c,-13,-44,26,12,GOLD);
      c.save();c.globalAlpha=.5;for(const[x,y]of[[26,-46],[34,-34],[22,-28]])circ(c,x,y,4,'#FFC83D');c.restore();
      c.fillStyle=GOLD;c.font=`11px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('בושם',0,6);break;}
    case 'jacuzzi':{c.beginPath();c.ellipse(0,8,44,26,0,0,7);c.fillStyle='#2F6FD0';c.fill();c.stroke();
      c.save();c.beginPath();c.ellipse(0,8,44,26,0,0,7);c.clip();c.fillStyle='#5AA8FF';c.fillRect(-44,-4,88,40);c.restore();
      c.beginPath();c.ellipse(0,8,44,26,0,0,7);c.stroke();
      for(const[x,y,r]of[[-18,0,7],[2,-4,9],[20,2,6],[-6,8,5]])circ(c,x,y,r,'rgba(255,255,255,.75)',1);
      c.save();c.globalAlpha=.6;for(const[x,y]of[[-10,-26],[6,-34],[18,-24]])circ(c,x,y,5,'#E6F2FF');c.restore();break;}
    case 'stereo':{rr(c,-46,-30,92,60,8);c.fillStyle='#1E1E26';c.fill();c.stroke();circ(c,-22,0,16,'#555');circ(c,-22,0,6,'#222');circ(c,16,-10,9,'#555');
      rr(c,2,2,34,24,4);c.fillStyle='#0E0E14';c.fill();c.stroke();c.fillStyle='#3DF5FF';for(let i=0;i<5;i++)c.fillRect(6+i*6,20-(4+i*3),4,4+i*3);
      c.save();c.strokeStyle='#3DF5FF';c.lineWidth=3;for(let i=1;i<=2;i++){c.beginPath();c.arc(-22,0,16+i*9,-.7,.7);c.stroke();}c.restore();break;}
    case 'cams':{rr(c,-46,-34,92,50,6);c.fillStyle='#1E1E26';c.fill();c.stroke();
      for(let i=0;i<4;i++){const x=-40+(i%2)*46,y=-28+Math.floor(i/2)*24;R(c,x,y,40,20,'#2F6FD0');c.fillStyle='rgba(255,255,255,.25)';c.fillRect(x+2,y+2,36,4);}
      c.save();c.translate(10,34);c.rotate(-.25);rr(c,-20,-9,38,18,5);c.fillStyle='#E8E8EC';c.fill();c.stroke();R(c,16,-5,10,10,'#2B2B35');circ(c,24,0,4,'#FF3B30');R(c,-22,-13,8,26,'#9AA0AE');c.restore();break;}
    case 'chandelier':{c.save();c.globalAlpha=.5;circ(c,0,-4,44,'rgba(255,200,61,.35)');c.restore();
      R(c,-3,-54,6,16,'#C9A15A');
      poly(c,[[-32,-38],[32,-38],[20,-12],[-20,-12]],GOLD,1);
      c.save();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2;ln(c,-26,-34,-16,-16);ln(c,0,-34,0,-16);ln(c,26,-34,16,-16);c.restore();
      for(const x of[-26,-13,0,13,26]){poly(c,[[x,-10],[x+5,0],[x,16],[x-5,0]],'#DCEBFF',1);}
      for(const x of[-22,0,22]){circ(c,x,-6,6,'#FFF7B0',1);}
      star(c,-34,16,5,'#FFFFFF');star(c,32,8,4,'#FFFFFF');break;}
    case 'jetski':{poly(c,[[-40,16],[-32,-4],[4,-12],[32,-10],[56,4],[46,18]],'#FFC83D',1);   // hull, nose to the right
      poly(c,[[-36,8],[-26,0],[8,-4],[34,-2],[48,6],[46,16],[-38,14]],'#F0A500',1);            // lower half, darker
      rr(c,-30,-26,40,16,7);c.fillStyle='#1E1E26';c.fill();c.stroke();                         // seat
      R(c,16,-26,9,18,'#2B2B35');                                                              // steering column
      c.save();c.strokeStyle=INK;c.lineWidth=5;c.lineCap='round';ln(c,10,-28,30,-30);c.restore();
      c.save();c.beginPath();c.moveTo(-54,12);                                                 // the sea, drawn in front so the ski sits in it
      for(let x=-54;x<=54;x+=9)c.lineTo(x,12+Math.sin(x/8)*3);
      c.lineTo(54,46);c.lineTo(-54,46);c.closePath();c.fillStyle='#2F6FD0';c.fill();c.restore();
      c.save();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-40+i*30,28);c.quadraticCurveTo(-32+i*30,22,-24+i*30,28);c.stroke();}c.restore();
      c.save();c.globalAlpha=.9;for(const[x,y,r]of[[-46,2,9],[-56,10,6],[-40,-8,5]])circ(c,x,y,r,'#FFFFFF');c.restore();break;}
    case 'eyalshow':{R(c,-50,20,100,14,'#2B2B35');R(c,-46,34,92,8,'#1A1A22');
      c.save();c.globalAlpha=.35;poly(c,[[-30,-46],[-14,-46],[10,24],[-50,24]],'#FFC83D');poly(c,[[14,-46],[30,-46],[52,24],[6,24]],'#FF3D8B');c.restore();
      c.save();c.translate(0,20);c.scale(.62,.62);R(c,-14,-54,28,54,'#15151B');circ(c,0,-66,14,SKIN);R(c,-15,-80,30,12,'#2A1D14');R(c,-22,-48,10,34,SKIN);R(c,12,-48,10,34,SKIN);c.restore();
      R(c,8,-16,4,18,'#2B2B35');circ(c,10,-20,6,'#C9CED6');
      c.fillStyle=GOLD;c.font=`16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('♫',-28,-6);c.fillText('♪',30,-18);break;}
    case 'helicopter':{R(c,-2,-40,4,12,'#2B2B35');c.save();c.strokeStyle=INK;c.lineWidth=4;ln(c,-46,-42,46,-42);ln(c,-20,-46,22,-38);c.restore();
      c.beginPath();c.ellipse(-4,-6,34,22,0,0,7);c.fillStyle='#F3F4F8';c.fill();c.stroke();
      c.beginPath();c.ellipse(-20,-8,14,12,0,0,7);c.fillStyle='rgba(110,203,255,.9)';c.fill();c.stroke();
      R(c,24,-14,34,10,'#F3F4F8');R(c,52,-26,6,20,'#F3F4F8');c.save();c.strokeStyle=INK;c.lineWidth=3;ln(c,50,-22,62,-16);c.restore();
      R(c,-34,16,52,5,'#9AA0AE');R(c,-30,8,5,10,'#9AA0AE');R(c,10,8,5,10,'#9AA0AE');
      c.fillStyle='#2F6FD0';c.font=`11px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('נ נח',-4,-2);break;}
    case 'villa':{R(c,-48,-6,96,42,'#F3E6C8');poly(c,[[-56,-6],[0,-40],[56,-6]],'#C0392B',1);
      for(const x of[-38,-14,12,34]){R(c,x,-4,10,34,'#FFFFFF');R(c,x-3,-8,16,6,'#E8E8EC');R(c,x-3,28,16,6,'#E8E8EC');}
      R(c,-8,8,18,28,'#8B5A2B');circ(c,6,22,2,GOLD);
      for(const sx of[-1,1]){c.save();c.translate(sx*52,30);c.scale(sx*.85,.85);
        R(c,-10,-6,20,12,'#D9CDB4');circ(c,8,-10,8,'#D9CDB4');circ(c,8,-10,11,'rgba(217,205,180,.6)',1);R(c,-12,6,24,5,'#C9BBA0');c.restore();}
      star(c,-30,-30,5,'#FFFFFF');break;}
    default:circ(c,0,0,30,GOLD);
  }c.restore();}
const TIERS=[{max:99,name:'נפוץ',col:'#8FA3BF'},{max:499,name:'שווה',col:'#3DDC97'},{max:1499,name:'נדיר',col:'#3DA5FF'},{max:2999,name:'אפי',col:'#FF3D8B'},{max:1e9,name:'אגדי',col:'#FFC83D'}];
const tierOf=p=>TIERS.find(t=>p<=t.max);

export { SHOP, SHOP_TABS, drawItem, tierOf };

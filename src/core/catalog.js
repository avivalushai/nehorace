// Game catalog data: character parts, vehicles, colors, wheels, stickers, sticker SLOTS.

const PARTS=[
 {id:'hair',label:'תספורת',items:[['fade','פייד עם קווים'],['gel',"ג'ל מבריק"],['bleach','בלונד קוצים'],['bald','קרחת'],['mullet','מאלט']]},
 {id:'beard',label:'זקן',items:[['none','בלי'],['stubble','זיפים'],['strap','רצועת לסת'],['full','זקן מלא'],['goatee','גוטי']]},
 {id:'cap',label:'כובע',items:[['none','בלי'],['back','מצחייה הפוכה'],['beanie','כובע גרב'],['tembel','כובע טמבל']]},
 {id:'chain',label:'שרשרת',items:[['cuban','קובנית עבה'],['double','כפולה'],['plate','שלט עם השם'],['lion','תליון אריה'],['silver','כסף דקה']]},
 {id:'shirt',label:'חולצה',items:[['track','טרנינג מבריק'],['tank','גופייה לבנה'],['polo','פולו ורודה'],['jersey','חולצת כדורגל'],['none','בלי חולצה']]},
 {id:'pants',label:'מכנסיים',items:[['track','טרנינג'],['ripped',"ג'ינס קרוע"],['shorts',"שורט ג'ינס"],['swim','בגד ים']]},
 {id:'shoes',label:'נעליים',items:[['white','סניקרס לבנות'],['flip','כפכפים'],['blackgold','שחור וזהב'],['red','סניקרס אדומות']]},
 {id:'dog',label:'כלב',items:[['none','בלי'],['pitbull','פיטבול'],['pom','פומרניאן']]},
 {id:'acc',label:'אביזרים',items:[['none','בלי'],['cig','סיגריה'],['shades','משקפי שמש'],['both','שניהם']]},
];
const PANTS={track:{c:'#17171F',short:false},ripped:{c:'#2F4E8A',short:false},shorts:{c:'#4A7CC0',short:true},swim:{c:'#D7263D',short:true}};
const SHIRTS={track:{c:'#17171F',sl:'long'},tank:{c:'#FFFFFF',sl:'none'},polo:{c:'#FF7FB0',sl:'short'},jersey:{c:'#FFD21F',sl:'short'},none:{c:null,sl:'none'}};
const SHOES={white:'#F4F4F4',blackgold:'#1C1C22',red:'#E02A3A'};

const VEH={
 scooter:{id:'scooter',name:'קורקינט חשמלי',top:500,accel:1.6,handling:1.0,hitPen:.5,grassF:.55,r:11,mass:1,color:'#2C2C38',blurb:'הכי מהיר וזריז. מתפרק מכל מכה',st:[5,5,5,1]},
 bike:{id:'bike',name:'אופניים חשמליים',top:480,accel:1.25,handling:.85,hitPen:.36,grassF:.68,r:12,mass:1.3,color:'#1FB57A',blurb:'מאוזנים. סוללה של חצי יום',st:[4,3,4,3]},
 atv:{id:'atv',name:'טרקטורון',top:445,accel:.95,handling:.7,hitPen:.16,grassF:.96,r:16,mass:2.5,color:'#FF7A1A',blurb:'איטי, אבל עובר דרך הכל. גם דשא',st:[3,2,2,5]},
};
const COLORS=['#2C2C38','#FF3D8B','#1FB57A','#3DA5FF','#FF7A1A','#FFC83D','#F2F2F2','#8E44FF'];
const WHEELS=[['std','רגילים'],['gold','חישוקי זהב'],['neon','נאון'],['chrome','כרום']];
const STICKERS=[
 {id:'hamsa',text:'חמסה',kind:'hamsa'},
 {id:'nachman',text:'נ נח נחמ נחמן מאומן',bg:'#FFFFFF',fg:'#1F3FA8',border:'#1F3FA8'},
 {id:'eyal',text:'אייל גולן צדק',bg:'#141414',fg:'#FFC83D',border:'#FFC83D'},
 {id:'letova',text:'הכל לטובה',bg:'#FFC83D',fg:'#1A0B29'},
 {id:'amisrael',text:'עם ישראל חי',bg:'#1F5FD0',fg:'#FFFFFF'},
 {id:'nocalm',text:'רק לא להתעצבן',bg:'#FF3D8B',fg:'#FFFFFF'},
 {id:'toda',text:'תודה לאל',bg:'#FFFFFF',fg:'#C1121F',border:'#C1121F'},
 {id:'mom',text:'סע לאט, אמא שלי בפנים',bg:'#3DDC97',fg:'#1A0B29'},
 {id:'nofear',text:'בלי פחד',bg:'#C1121F',fg:'#FFFFFF'},
];
const SLOTS={
 scooter:[{x:-30,y:-35,w:58,h:16,r:0},{x:40,y:-35,w:58,h:16,r:0},{x:-75,y:-85,w:54,h:14,r:-1.695},{x:-82,y:-139,w:46,h:14,r:-1.695}],
 bike:[{x:-42,y:-101,w:44,h:18,r:.854},{x:-10,y:-65,w:44,h:18,r:.854},{x:87,y:-88,w:66,h:26,r:0}],
 atv:[{x:-31,y:-64,w:54,h:24,r:0},{x:29,y:-64,w:54,h:24,r:0},{x:-87,y:-77,w:56,h:15,r:-.05},{x:85,y:-77,w:56,h:15,r:.05}],
};

export { PARTS, PANTS, SHIRTS, SHOES, VEH, COLORS, WHEELS, STICKERS, SLOTS };

// Game catalog data: character parts, vehicles, colors, wheels, stickers, sticker SLOTS.

const PARTS=[
 {id:'hair',label:'תספורת',items:[['fade','פייד עם קווים'],['gel',"ג'ל מבריק"],['bleach','בלונד קוצים'],['bald','קרחת'],['mullet','מאלט'],['afro','אפרו',{req:1500}],['mohawk','מוהוק ורוד',{req:2500}],['samurai','קוקו סמוראי',{req:4000}],['dreads','ראסטות',{req:6000}],['sidecut','ברק מגולח בצד',{req:8000}],['rainbow','קוצים בצבעי הקשת',{req:14000}],['eyal','העיניים של אייל גולן מגולחות מאחורה',{req:35000}]]},
 {id:'beard',label:'זקן',items:[['none','בלי'],['stubble','זיפים'],['strap','רצועת לסת'],['full','זקן מלא'],['goatee','גוטי'],['mustache','שפם ערסי',{req:1500}],['pencil','שפם עיפרון',{req:3000}],['mutton','פאות לחיים',{req:5500}],['viking','זקן ויקינג קלוע',{req:13000}],['gold','זקן זהב',{req:32000}]]},
 {id:'cap',label:'כובע',items:[['none','בלי'],['back','מצחייה הפוכה'],['beanie','כובע גרב'],['tembel','כובע טמבל'],['bucket','כובע דייגים',{req:1500}],['bandana','בנדנה אדומה',{req:2500}],['helmet','קסדה (פעם ראשונה בחיים)',{req:4500}],['headphones','אוזניות ענק',{req:7000}],['halo','הילה של צדיק',{req:20000}],['crown','הכתר של מלך הפארק',{req:40000}]]},
 {id:'chain',label:'שרשרת',items:[['cuban','קובנית עבה'],['double','כפולה'],['plate','שלט עם השם'],['lion','תליון אריה'],['silver','כסף דקה'],['hamsa','תליון חמסה',{req:1500}],['chai','תליון חי',{req:3000}],['mic','תליון מיקרופון',{req:5000}],['triple','שלוש שרשראות',{req:9000}],['diamond','שרשרת יהלומים',{req:25000}]]},
 {id:'shirt',label:'חולצה',items:[['track','טרנינג מבריק'],['tank','גופייה לבנה'],['polo','פולו ורודה'],['jersey','חולצת כדורגל'],['none','בלי חולצה'],['hawaii','חולצת הוואי',{req:1500}],['mesh','גופיית רשת',{req:3000}],['leather','מעיל עור',{req:6000}],['suit','חליפת חתן לבנה',{req:14000}],['goldsuit','חליפת זהב של מלך',{req:38000}]]},
 {id:'pants',label:'מכנסיים',items:[['track','טרנינג'],['ripped',"ג'ינס קרוע"],['shorts',"שורט ג'ינס"],['swim','בגד ים'],['cargo',"מכנסי דגמ״ח",{req:1500}],['redtrack','טרנינג אדום',{req:2500}],['white','לבנים של שבת',{req:4500}],['leopard','מנומר',{req:9000}],['pajama',"פיג'מה משובצת",{req:12000}],['gold','מכנסי זהב',{req:30000}]]},
 {id:'shoes',label:'נעליים',items:[['white','סניקרס לבנות'],['flip','כפכפים'],['blackgold','שחור וזהב'],['red','סניקרס אדומות'],['crocs','קרוקס ורודים',{req:1500}],['boots','מגפי עבודה',{req:3000}],['high','סניקרס גבוהות',{req:6000}],['slippers','נעלי בית פרוותיות',{req:10000}],['rollers','רולרבליידס',{req:16000}],['gold','נעלי זהב',{req:28000}]]},
 {id:'dog',label:'כלב',items:[['none','בלי'],['pitbull','פיטבול'],['pom','פומרניאן'],['chihuahua',"צ'יוואווה עם סוודר",{req:1500}],['poodle','פודל ורוד',{req:3000}],['husky','האסקי',{req:5000}],['sausage','נקניקי',{req:7000}],['bulldog','בולדוג',{req:9000}],['lioncub','גור אריה',{req:18000}],['goldpit','פיטבול זהב',{req:45000}]]},
 {id:'acc',label:'אביזרים',items:[['none','בלי'],['cig','סיגריה'],['shades','משקפי שמש'],['both','שניהם'],['toothpick','קיסם',{req:1500}],['earring','עגיל יהלום',{req:2500}],['bandaid','פלסטר על הלחי',{req:4000}],['grillz','שיני זהב',{req:8000}],['tattoo','קעקוע "אמא" בצוואר',{req:12000}],['goldshades','משקפי זהב של מיליונר',{req:30000}]]},
];
const PANTS={track:{c:'#17171F',short:false},ripped:{c:'#2F4E8A',short:false},shorts:{c:'#4A7CC0',short:true},swim:{c:'#D7263D',short:true},cargo:{c:'#8F8662',short:false},redtrack:{c:'#C1121F',short:false},white:{c:'#EDEDED',short:false},leopard:{c:'#D9A441',short:false},pajama:{c:'#5B7DB8',short:false},gold:{c:'#E0B030',short:false}};
const SHIRTS={track:{c:'#17171F',sl:'long'},tank:{c:'#FFFFFF',sl:'none'},polo:{c:'#FF7FB0',sl:'short'},jersey:{c:'#FFD21F',sl:'short'},none:{c:null,sl:'none'},hawaii:{c:'#1FA3A3',sl:'short'},mesh:{c:null,sl:'none'},leather:{c:'#1C1C22',sl:'long'},suit:{c:'#F4F4F4',sl:'long'},goldsuit:{c:'#E0B030',sl:'long'}};
const SHOES={white:'#F4F4F4',blackgold:'#1C1C22',red:'#E02A3A',crocs:'#FF7FB0',boots:'#6B4A2B',high:'#F4F4F4',slippers:'#F3E3F7',rollers:'#2B2B35',gold:'#E0B030'};

const VEH={
 scooter:{id:'scooter',name:'קורקינט חשמלי',top:500,accel:1.6,handling:1.0,hitPen:.5,grassF:.55,r:11,mass:1,color:'#2C2C38',blurb:'הכי מהיר וזריז. מתפרק מכל מכה',st:[5,5,5,1]},
 bike:{id:'bike',name:'אופניים חשמליים',top:480,accel:1.25,handling:.85,hitPen:.36,grassF:.68,r:12,mass:1.3,color:'#1FB57A',blurb:'מאוזנים. סוללה של חצי יום',st:[4,3,4,3]},
 atv:{id:'atv',name:'טרקטורון',top:445,accel:.95,handling:.7,hitPen:.16,grassF:.96,r:16,mass:2.5,color:'#FF7A1A',blurb:'איטי, אבל עובר דרך הכל. גם דשא',st:[3,2,2,5]},
 tmax:{id:'tmax',name:'טי-מקס',top:565,accel:1.35,handling:.8,hitPen:.28,grassF:.5,r:14,mass:1.9,color:'#1C1C22',blurb:'קטנוע של גברים. הכי מהיר בפארק, טורבו ארוך, אבל שונא דשא',st:[5,4,3,4],req:6000,turboLen:3.4,lift:16},
 bigpit:{id:'bigpit',name:'פיטבול ענק',top:475,accel:1.7,handling:.95,hitPen:.08,grassF:1,r:17,mass:3.2,color:'#8C7B6B',blurb:'לא צריך דלק, רק בשר. רץ על דשא ודוחף את כולם מהשביל',st:[3,5,4,5],req:15000,noWheels:true,lift:100},
 wings:{id:'wings',name:'כנפי השכינה',top:545,accel:1.9,handling:1.2,hitPen:.12,grassF:1,r:13,mass:1.5,color:'#FFF4DC',blurb:'עף מעל עצים, עמודים וספסלים. הכי נדיר שיש',st:[5,5,5,4],req:50000,noWheels:true,behind:true,flies:true,lift:26},
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
 tmax:[{x:70,y:-84,w:66,h:18,r:.05},{x:-92,y:-70,w:36,h:14,r:-1.25},{x:30,y:-58,w:46,h:12,r:0}],
 bigpit:[{x:-5,y:-110,w:66,h:20,r:0},{x:-5,y:-72,w:90,h:18,r:0}],
 wings:[],
};

export { PARTS, PANTS, SHIRTS, SHOES, VEH, COLORS, WHEELS, STICKERS, SLOTS };

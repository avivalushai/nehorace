# מפת הקוד

הקוד מחולק ל-`ES modules` שנטענים ישירות בדפדפן, בלי שלב בנייה. `index.html` טוען את `styles/app.css` ואת `src/main.js`, ו-`main.js` מייבא את כל שאר המודולים.

```
index.html             # שלד המסכים, טוען את styles/app.css ואת src/main.js
styles/app.css         # כל ה-CSS
manifest.webmanifest   # שם, אייקונים ומסך מלא ל"הוספה למסך הבית"
assets/                # אייקונים ו-share.jpg, נוצרים מהקוד (לא לערוך ידנית)
tools/catalog.html     # קטלוג: כל פריט מקדימה ומאחורה, כל כלי מכל הכיוונים
tools/images.html      # דף תצוגה מקדימה שמצייר את האייקונים ואת תמונת השיתוף
api/_lib.mjs           # שרת: חיבור ל-Redis, שבוע (ראשון, שעון ישראל), ניקוי שמות
api/race.mjs           # POST: מירוץ שהסתיים. בדיקת סבירות, הגבלת קצב, עדכון הטבלאות
api/leaderboard.mjs    # GET: 20 המובילים בכל טבלה והמקום שלך
api/admin.mjs          # POST: הסרת שחקן לפי שם וחסימתו (דורש ADMIN_TOKEN)
src/net/leaderboard.js # צד המשחק: מזהה שחקן, שליחת מירוץ, קריאת הטבלה
src/ui/board.js        # מסך טבלת האלופים
src/main.js            # נקודת כניסה: show (ניווט בין מסכים), drawTitle, כפתור הפתיחה, אתחול
src/core/util.js       # צבעים ופונטים (INK, GOLD, FONT, DISP...), rand, pick, clamp, $, hash
src/core/draw.js       # R, ln, poly, rr, circ, ell, shade, star, fitCv
src/core/catalog.js    # PARTS, PANTS, SHIRTS, SHOES, VEH, COLORS, WHEELS, STICKERS, SLOTS
src/core/state.js      # state (הבחירות של השחקן), vColor
src/core/unlocks.js    # פתיחת פריטים לפי נקודות קריירה, דרגות נדירות, מה נפתח עכשיו ומה הבא
src/core/stats.js      # Stats: שיאים אישיים (מירוצים, ניצחונות, שיא נקודות, זמן הכי מהיר), נשמר ב-localStorage
src/art/neho.js        # drawNeho, hairFront, drawCap, drawChain, drawNehoBack
src/art/dog.js         # drawDog
src/art/vehicles.js    # drawVehicleSide, drawVehicleFront, drawVehicleRear, drawWheel
src/art/stickers.js    # drawSticker, drawHamsa
src/art/wardrobe.js    # הפריטים שנפתחים: תספורות, זקנים, כובעים, שרשראות, חולצות, מכנסיים, נעליים ואביזרים (hooks בתוך drawNeho)
src/art/rides.js       # הכלים שנפתחים: טי-מקס, פיטבול ענק, כנפי השכינה, מכל הכיוונים
src/art/racer-top.js   # drawRacerTop: רוכב וכלי במבט מלמעלה במירוץ
src/art/brand.js       # drawIcon (פרצוף הנהוראי לאייקון), drawShareCard (תמונת התצוגה המקדימה לקישור)
src/ui/garage.js       # renderPanel, previewPart, startStage, drawComposition, step + setStep
src/race/texts.js      # TXT: כל הקללות והמשפטים, ACTS, ZONE_ACTS, OPP_NAMES
src/race/world.js      # PW, RACE_LEN, cx, genWorld, makePed, makeRacer, newDir, pid + resetPid
src/race/engine.js     # startRace, update, knock, hitStatic, say, שליטה (גרירה, מקשים, טורבו), finishRace, מסך תוצאות
src/race/render.js     # render, drawRacerTop, drawPedTop, drawStatic, drawAct, drawBubble
src/music/engine.js    # musicInit, mStep, mTick, musicStart, musicStop, toggleMute
src/music/songs.js     # מוזיקה לכל שלב: setStage, playUser, garageMusic (מוכן לשירים מורשים שיצורפו למשחק)
src/album/scenes.js    # כל פונקציות scene*, SKIES, sky, applyFx, drawPhoto
src/album/build.js     # rec, buildAlbum, capFor, כיתובים וזוויות צילום
src/album/ui.js        # openAlbum, openLB, שמירת תמונה
src/shop/items.js      # SHOP, TIERS, drawItem
src/shop/ui.js         # Wallet, calcCoins, showCoins, renderShop, buyItem, toast, drawTrophies
```

## איך הפיצול נעשה

הקוד הועתק מהקובץ המקורי כמו שהוא, ונוספו רק שורות `import` ו-`export`. היו רק ארבעה שינויים קטנים, בלי שינוי התנהגות:

- `setStep(s)` ב-`ui/garage.js`: שלושה מקומות מחוץ למוסך איפסו את `step` ישירות.
- `pid` עבר ל-`race/world.js`, ו-`startRace` מאפס אותו דרך `resetPid()`.
- `ALBUM` הופרד מההצהרה של `PAL`, כי כל אחד מהם שייך למודול אחר.
- ההרחבות של רשימות הזוויות והכיתובים באלבום (`FX_OK.push`, `ANGLES_FOR`, `ANGLE_CAPS`...) עברו ל-`album/build.js`, ליד הרשימות עצמן, כדי שירוצו אחרי שהרשימות נוצרו.

אחרי כל מודול שהוצא הורצה בדיקת `Playwright` במסך 390 על 844. היא עוברת על כל המסכים, בודקת שאין שגיאות ב-`console` ושאין גלילה אופקית, ומשווה פיקסל אחר פיקסל את המסכים הסטטיים לגרסה המקורית.

## שני כללים של מודולים

1. **ייבוא הוא לקריאה בלבד.** אי אפשר לכתוב `step=0` ממודול שמייבא את `step`. מוסיפים setter במודול שמחזיק את המשתנה.
2. **סדר טעינה.** קוד שרץ ברמה העליונה של מודול (לא בתוך פונקציה) לא יכול לקרוא `const` ממודול שעוד לא נטען, כי יש תלויות מעגליות בין המודולים. קריאה לפונקציות היא תמיד בסדר. אתחול המשחק (`walletLoad`, `drawTitle`) נשאר בסוף `main.js`, שנטען אחרון.

## מוסכמות שחשוב לשמור

- כל פונקציית ציור מקבלת `ctx` ראשון ומשאירה את ה-`ctx` באותו מצב (`save` ו-`restore`).
- מערכת הצירים במירוץ: `d` זה מרחק קדימה, `x` זה סטייה לצדדים, ו-`cx(d)` מחזיר את מרכז השביל.
- מיקומי המדבקות על כל כלי נמצאים ב-`SLOTS`. שינוי גיאומטריה של כלי מחייב עדכון שם.
- כל טקסט חדש בממשק נכתב בעברית ונבדק בטלפון.

## פריטים שנפתחים

פריט בקטלוג הוא `[id,label]` (פתוח תמיד) או `[id,label,{req}]`, כאשר `req` הוא נקודות הקריירה שצריך (סכום הנקודות מכל המירוצים). כלים משתמשים ב-`VEH[id].req`. הדרגה (רגיל, שווה, נדיר, אפי, אגדי) נגזרת מ-`req` ב-`core/unlocks.js`.

**הוספת פריט חדש:**
1. מוסיפים אותו ל-`PARTS` ב-`core/catalog.js` עם `req`. חולצה, מכנסיים ונעליים צריכים גם רשומה ב-`SHIRTS`, `PANTS` או `SHOES`.
2. מציירים אותו ב-`art/wardrobe.js`, בפונקציה של הקטגוריה (ולכלב ב-`drawDogX` ב-`art/dog.js`). לצייר גם מאחורה (`hairBackX`, `capBackX`) ומלמעלה (`topHeadX`) כשרלוונטי.
3. בודקים ב-`tools/catalog.html` (http://localhost:8765/tools/catalog.html).

**כלי חדש:** רשומה ב-`VEH` (סטטיסטיקות, `req`, ולפי הצורך `lift` לגובה הרוכב, `behind` כשהכלי מאחורי הרוכב, `noWheels`, `flies`, `turboLen`), מיקומי מדבקות ב-`SLOTS`, `LIFT` ב-`album/scenes.js`, וציור בכל הכיוונים ב-`art/rides.js`.

## טבלת האלופים

**נתונים ב-Redis:**
- `lb:week:<תאריך יום ראשון>`: המירוץ הכי טוב של כל שחקן באותו שבוע (`ZADD GT`). נמחק אוטומטית אחרי 6 שבועות.
- `lb:wins`: מספר הניצחונות של כל שחקן.
- `names`: השם האחרון של כל שחקן.
- `looks`: הלוק האחרון של הנהוראי של כל שחקן, לפודיום. השרת שומר רק משבצות מוכרות עם מזהים קצרים, והמשחק מצייר רק פריטים שקיימים בקטלוג (`safeLook` ב-`ui/board.js`).
- `banned`: שחקנים חסומים.

השרת לא מחזיר מזהי שחקנים, רק שם ודגל "זה אתה".

**הגנות:**
- ניקוד בין 0 ל-3,000, מקום בין 1 ל-6, זמן בין 30 ל-300 שניות.
- תוצאה אחת לשחקן בכל 20 שניות, ועד 120 תוצאות לשעה מכל כתובת IP.
- שמות מקסימום 10 תווים, בלי תווים נסתרים, ורשימת מילים פוגעניות שמוחלפות ב"נהוראי".
- הניקוד מחושב בדפדפן, ולכן אפשר רק לסנן רמאויות בולטות, לא למנוע רמאות לגמרי.

**מצב `?dev`:** מירוצים מהקיצור נשלחים רק לשרת מקומי, אף פעם לא לאתר החי.

**הסרת שחקן מהטבלה:** מגדירים ב-Vercel משתנה סביבה `ADMIN_TOKEN` (סיסמה ארוכה), ואז:
```bash
curl -X POST https://nehorace.vercel.app/api/admin -H 'Content-Type: application/json' -d '{"token":"<הסיסמה>","name":"<השם בטבלה>"}'
```

**בלי מסד נתונים** (לפני שחיברו אותו): ה-API עונה `{disabled:true}`, והמשחק מציג "טבלת האלופים עוד לא מחוברת".

## אייקונים ותצוגה מקדימה לקישור

האייקונים ותמונת השיתוף מצוירים בקוד ב-`src/art/brand.js`, בעזרת אותן פונקציות ציור של המשחק. וואטסאפ והטלפון לא מריצים JavaScript, ולכן שומרים אותם כקבצים ב-`assets/`. אחרי שינוי בדמות או בעיצוב מריצים `npm run images` בתיקייה `tests`, ואפשר לראות את התוצאה ב-`tools/images.html`.

`og:image` ו-`og:url` ב-`index.html` הם כתובות מלאות של האתר החי (`https://nehorace.vercel.app/`), כי וואטסאפ לא מבין כתובות יחסיות. אם הכתובת של האתר משתנה, מעדכנים את שניהם.

## דברים שכדאי לעשות בקלוד קוד

- העלאה לאתר קבוע עם כתובת שמתעדכנת בכל שינוי.
- כפתור שיתוף עם תמונה מהמירוץ של השחקן: `navigator.share` עם קובץ תמונה מ-`drawPhoto`, ונפילה להורדה כשאין תמיכה. התמונה בתצוגה המקדימה של הקישור תמיד קבועה (`share.jpg`), כי וואטסאפ לא מריץ את המשחק.
- מסלולים נוספים ושעות יום שונות.
- להפוך פריטים מהחנות למשפיעים במשחק, למשל הסיוויק ככלי רכב.

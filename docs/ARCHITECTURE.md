# מפת הקוד

הקוד מחולק ל-`ES modules` שנטענים ישירות בדפדפן, בלי שלב בנייה. `index.html` טוען את `styles/app.css` ואת `src/main.js`, ו-`main.js` מייבא את כל שאר המודולים.

```
index.html             # שלד המסכים, טוען את styles/app.css ואת src/main.js
styles/app.css         # כל ה-CSS
manifest.webmanifest   # שם, אייקונים ומסך מלא ל"הוספה למסך הבית"
assets/                # אייקונים ו-share.jpg, נוצרים מהקוד (לא לערוך ידנית)
tools/images.html      # דף תצוגה מקדימה שמצייר את האייקונים ואת תמונת השיתוף
src/main.js            # נקודת כניסה: show (ניווט בין מסכים), drawTitle, כפתור הפתיחה, אתחול
src/core/util.js       # צבעים ופונטים (INK, GOLD, FONT, DISP...), rand, pick, clamp, $, hash
src/core/draw.js       # R, ln, poly, rr, circ, ell, shade, star, fitCv
src/core/catalog.js    # PARTS, PANTS, SHIRTS, SHOES, VEH, COLORS, WHEELS, STICKERS, SLOTS
src/core/state.js      # state (הבחירות של השחקן), vColor
src/art/neho.js        # drawNeho, hairFront, drawCap, drawChain, drawNehoBack
src/art/dog.js         # drawDog
src/art/vehicles.js    # drawVehicleSide, drawVehicleFront, drawVehicleRear, drawWheel
src/art/stickers.js    # drawSticker, drawHamsa
src/art/brand.js       # drawIcon (פרצוף הנהוראי לאייקון), drawShareCard (תמונת התצוגה המקדימה לקישור)
src/ui/garage.js       # renderPanel, previewPart, startStage, drawComposition, step + setStep
src/race/texts.js      # TXT: כל הקללות והמשפטים, ACTS, ZONE_ACTS, OPP_NAMES
src/race/world.js      # PW, RACE_LEN, cx, genWorld, makePed, makeRacer, newDir, pid + resetPid
src/race/engine.js     # startRace, update, knock, hitStatic, say, שליטה (גרירה, מקשים, טורבו), finishRace, מסך תוצאות
src/race/render.js     # render, drawRacerTop, drawPedTop, drawStatic, drawAct, drawBubble
src/music/engine.js    # musicInit, mStep, mTick, musicStart, musicStop, toggleMute
src/music/songs.js     # שירים של המשתמש, setStage, playUser, garageMusic
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

## אייקונים ותצוגה מקדימה לקישור

האייקונים ותמונת השיתוף מצוירים בקוד ב-`src/art/brand.js`, בעזרת אותן פונקציות ציור של המשחק. וואטסאפ והטלפון לא מריצים JavaScript, ולכן שומרים אותם כקבצים ב-`assets/`. אחרי שינוי בדמות או בעיצוב מריצים `npm run images` בתיקייה `tests`, ואפשר לראות את התוצאה ב-`tools/images.html`.

`og:image` ו-`og:url` ב-`index.html` הם כתובות מלאות של האתר החי (`https://avivalushai.github.io/nehorace/`), כי וואטסאפ לא מבין כתובות יחסיות. אם הכתובת של האתר משתנה, מעדכנים את שניהם.

## דברים שכדאי לעשות בקלוד קוד

- העלאה לאתר קבוע עם כתובת שמתעדכנת בכל שינוי.
- כפתור שיתוף עם תמונה מהמירוץ של השחקן: `navigator.share` עם קובץ תמונה מ-`drawPhoto`, ונפילה להורדה כשאין תמיכה. התמונה בתצוגה המקדימה של הקישור תמיד קבועה (`share.jpg`), כי וואטסאפ לא מריץ את המשחק.
- מסלולים נוספים ושעות יום שונות.
- להפוך פריטים מהחנות למשפיעים במשחק, למשל הסיוויק ככלי רכב.

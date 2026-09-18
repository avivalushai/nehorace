# מפת הקוד ותוכנית פיצול

כל הקוד נמצא כרגע בתוך תגית `script` אחת ב-`index.html`. הסדר בקובץ הוא: קבועים, עזרי ציור, דמויות, כלים, מסכי בחירה, מנוע מירוץ, מוזיקה, אלבום, חנות.

## פיצול מוצע

```
index.html          # שלד, מסכים ריקים, טעינת מודולים
styles/app.css      # כל ה-CSS
src/main.js         # אתחול, ניווט בין מסכים
src/core/draw.js    # R, ln, poly, rr, circ, ell, shade, star, fitCv
src/core/state.js   # state, מצב נבחר, טעינה ושמירה
src/art/neho.js     # drawNeho, hairFront, drawCap, drawChain, drawNehoBack
src/art/dog.js      # drawDog
src/art/vehicles.js # drawVehicleSide, drawVehicleFront, drawVehicleRear, drawWheel
src/art/stickers.js # drawSticker, drawHamsa
src/ui/garage.js    # renderPanel, previewPart, startStage, drawComposition
src/race/world.js   # genWorld, makePed, newDir, statics
src/race/engine.js  # startRace, update, knock, hitStatic, say, finishRace
src/race/render.js  # render, drawRacerTop, drawPedTop, drawStatic, drawAct, drawBubble
src/race/texts.js   # TXT: כל הקללות והמשפטים
src/music/engine.js # musicInit, mStep, mTick, musicStart, musicStop
src/music/songs.js  # טעינת שירים של המשתמש, setStage, playUser
src/album/scenes.js # כל פונקציות scene*, applyFx, drawPhoto
src/album/build.js  # rec, buildAlbum, capFor
src/album/ui.js     # openAlbum, openLB, שמירת תמונה
src/shop/items.js   # SHOP, TIERS, drawItem
src/shop/ui.js      # renderShop, buyItem, calcCoins, showCoins, Wallet
```

## סדר עבודה מומלץ

1. להעתיק את `index.html` כמו שהוא ולוודא שהוא עובד.
2. להוציא קודם את ה-CSS, ואז את הטקסטים (`TXT`, `SHOP`, `PARTS`), כי הם עצמאיים.
3. להמיר לקבצי `ES modules` עם `type="module"`, מודול אחד בכל פעם, ולבדוק את המשחק אחרי כל צעד.
4. רק בסוף, אם בכלל, להוסיף כלי בנייה.

## מוסכמות שחשוב לשמור

- כל פונקציית ציור מקבלת `ctx` ראשון ומשאירה את ה-`ctx` באותו מצב (`save` ו-`restore`).
- מערכת הצירים במירוץ: `d` זה מרחק קדימה, `x` זה סטייה לצדדים, ו-`cx(d)` מחזיר את מרכז השביל.
- מיקומי המדבקות על כל כלי נמצאים ב-`SLOTS`. שינוי גיאומטריה של כלי מחייב עדכון שם.
- כל טקסט חדש בממשק נכתב בעברית ונבדק בטלפון.

## דברים שכדאי לעשות בקלוד קוד

- שמירת הארנק והקניות ב-`localStorage`, כך שיישמרו גם מחוץ לאתר של Claude.
- העלאה לאתר קבוע עם כתובת שמתעדכנת בכל שינוי.
- מסלולים נוספים ושעות יום שונות.
- להפוך פריטים מהחנות למשפיעים במשחק, למשל הסיוויק ככלי רכב.

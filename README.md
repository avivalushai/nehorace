# NehoRace

מירוץ נהוראים בפארק. בלי שלב בנייה, בלי ספריות.

המשחק באוויר: https://nehorace.vercel.app

## הרצה

```bash
node tests/dev-server.mjs
```

ואז לפתוח את http://localhost:8765. השרת מריץ גם את טבלת האלופים עם מסד נתונים מדומה. אי אפשר לפתוח את `index.html` ישירות מהקובץ, כי המשחק בנוי ממודולים.

## מבנה נוכחי

- `index.html` — שלד המסכים.
- `styles/app.css` — כל העיצוב.
- `api/` — פונקציות השרת של טבלת האלופים (Vercel).
- `src/` — הקוד, מחולק למודולים (נקודת כניסה: `src/main.js`).
- `CLAUDE.md` — הקשר לקלוד קוד: מסכים, מערכות, כללי עבודה ועיצוב.
- `tests/` — בדיקת Playwright לכל המסכים (ראו CLAUDE.md).
- `docs/ARCHITECTURE.md` — מפת המודולים והמוסכמות.
- `docs/FIRST-PROMPT.md` — מה לכתוב לקלוד קוד בהתחלה.

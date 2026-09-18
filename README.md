# NehoRace

מירוץ נהוראים בפארק. בלי שלב בנייה, בלי ספריות.

המשחק באוויר: https://nehorace.vercel.app

## הרצה

```bash
python3 -m http.server 8000
```

ואז לפתוח את http://localhost:8000. אי אפשר לפתוח את `index.html` ישירות מהקובץ, כי המשחק בנוי ממודולים.

## מבנה נוכחי

- `index.html` — שלד המסכים.
- `styles/app.css` — כל העיצוב.
- `src/` — הקוד, מחולק למודולים (נקודת כניסה: `src/main.js`).
- `CLAUDE.md` — הקשר לקלוד קוד: מסכים, מערכות, כללי עבודה ועיצוב.
- `tests/` — בדיקת Playwright לכל המסכים (ראו CLAUDE.md).
- `docs/ARCHITECTURE.md` — מפת המודולים והמוסכמות.
- `docs/FIRST-PROMPT.md` — מה לכתוב לקלוד קוד בהתחלה.

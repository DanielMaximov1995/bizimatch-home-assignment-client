# מערכת ניהול חשבוניות והוצאות - צד לקוח

ממשק משתמש מודרני לניהול חשבוניות והוצאות לעסק, עם תמיכה מלאה בעברית ו-RTL.

## ארכיטקטורה

האפליקציה בנויה על Next.js 15 עם App Router, ומשתמשת ב-React 18 עם TypeScript. העיצוב מבוסס על TailwindCSS עם רכיבי UI מותאמים אישית.

**מבנה הפרויקט:**
- **app** - דפים ו-routing (App Router)
  - `(auth)` - דפי התחברות והרשמה
  - `(root)` - דף ראשי עם ניהול הוצאות
- **components** - רכיבי UI
  - `auth` - רכיבי התחברות והרשמה
  - `expenses` - רכיבי ניהול הוצאות וחשבוניות
  - `ui` - רכיבי UI בסיסיים (button, card, dialog וכו')
- **contexts** - ניהול state גלובלי (AuthContext)
- **lib** - פונקציות עזר ו-API client

**תכונות עיקריות:**
- התחברות והרשמה מאובטחת
- העלאת חשבוניות עם drag & drop
- תצוגה וסינון הוצאות בטבלה
- עריכה ומחיקה של הוצאות
- סיווג הוצאות לקטגוריות

## הפעלת המערכת

**התקנה:**
```bash
npm install
```

**הגדרת משתני סביבה (.env):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**הרצה:**
```bash
npm run dev    # פיתוח (פורט 3000)
npm run build  # בנייה לייצור
npm start      # הרצה בייצור
```

## טכנולוגיות

- **Next.js** - Framework ל-React עם Server Components
- **React.js** - ספריית UI
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Sonner** - מערכת התראות (toast notifications)
- **Lucide React** - אייקונים
- **shadcn/ui** - רכיבי UI (מותאמים)

## מבנה הקוד

הקוד מאורגן בצורה מודולרית עם הפרדה ברורה בין רכיבים, לוגיקה עסקית ופונקציות עזר. כל רכיב עצמאי וניתן לשימוש חוזר.

**ניהול State:**
- Context API לניהול אימות משתמש
- Local state ברכיבים עם useState
- Server-side data fetching עם useEffect

**תקשורת עם השרת:**
- כל הקריאות ל-API מרוכזות ב-`lib/api.ts`
- טיפול אוטומטי ב-JWT tokens
- Error handling מרכזי

## תכונות UI/UX

- **עיצוב מודרני** - ממשק נקי ואינטואיטיבי
- **תמיכה בעברית** - כל הטקסטים בעברית עם RTL מלא
- **Responsive** - עובד על כל הגדלי מסך
- **Accessibility** - תמיכה ב-screen readers וניווט במקלדת
- **Loading states** - אינדיקטורים ברורים לטעינה
- **Error handling** - הודעות שגיאה ברורות למשתמש

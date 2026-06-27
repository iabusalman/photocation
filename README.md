# Photocation — واجهة الموقع (Frontend)

منصّة ذكاء اصطناعي تحدّد الموقع الجغرافي لأي صورة. هذه واجهة المستخدم الاحترافية
(تصميم داكن فاخر، عربي RTL) المبنية كمعاينة قابلة للعرض قبل ربط الخلفية والمصادقة والدفع.

## التقنيات
- **React 18 + TypeScript + Vite**
- **Tailwind CSS** — نظام تصميم داكن مخصّص
- **Framer Motion** — حركات وانتقالات ناعمة (تحترم `prefers-reduced-motion`)
- **Wouter** — توجيه خفيف
- **lucide-react** — الأيقونات
- خطوط: IBM Plex Sans Arabic + Plus Jakarta Sans

## الصفحات
| المسار | الوصف |
|--------|-------|
| `/` | الصفحة الرئيسية (Hero + كيف تعمل + المزايا + الجمهور + رأي + CTA) |
| `/analyze` | عرض تجريبي تفاعلي لتحليل صورة وإظهار الموقع على خريطة |
| `/pricing` | باقات الاشتراك (مجاني / مبتدئ / محترف) بالريال السعودي |
| `/login` · `/register` | المصادقة مع أزرار Google و Apple |

## التشغيل محلياً
```bash
cd photocation
npm install
npm run dev      # http://localhost:5173
npm run build    # بناء الإنتاج إلى dist/
npm run preview  # معاينة بناء الإنتاج
```

## الخطوات القادمة (قيد الانتظار)
- ربط الخلفية (tRPC / Node) وقاعدة البيانات.
- تفعيل تسجيل الدخول الفعلي عبر **Google OAuth** و **Apple Sign In**.
- بوابة الدفع **Moyasar** (بطاقة · Apple Pay · مدى) بالريال السعودي.
- الربط على دومين خاص (مثل `photoai.click`).

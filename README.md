# Photocation

منصّة ذكاء اصطناعي تحدّد الموقع الجغرافي لأي صورة (الدولة، المدينة، الإحداثيات،
والمعالم). المشروع كامل: **واجهة** أمامية احترافية (عربي RTL) + **خلفية** REST مع
تسجيل دخول Google/Apple، اشتراكات مدفوعة عبر **Moyasar**، وتحليل الصور بالذكاء
الاصطناعي.

## البنية

```
photocation/
├── (الجذر)     # الواجهة — React 18 + TypeScript + Vite + Tailwind + wouter
└── backend/    # الخلفية — Express + TypeScript + Prisma (auth, payments, AI)
```

## الواجهة (Frontend)

التقنيات: React 18 + TypeScript + Vite، Tailwind CSS، Framer Motion، wouter، lucide-react.

| المسار | الوصف |
|--------|-------|
| `/` | الصفحة الرئيسية |
| `/analyze` | رفع صورة وتحليل موقعها فعلياً عبر الخلفية (يتطلب تسجيل دخول) |
| `/pricing` | باقات الاشتراك (مجاني / مبتدئ / محترف) بالريال السعودي |
| `/checkout` | إتمام الدفع عبر نموذج Moyasar |
| `/payment/callback` | التحقق من الدفع بعد العودة من Moyasar |
| `/login` · `/register` | تسجيل الدخول عبر Google و Apple |

```bash
cp .env.example .env   # املأ VITE_API_BASE والمفاتيح العامة
npm install
npm run dev            # http://localhost:5173
npm run build
```

## الخلفية (Backend)

Express + TypeScript + Prisma (SQLite للتطوير، قابل للتبديل إلى PostgreSQL).

نقاط رئيسية:
- `POST /api/auth/google` · `POST /api/auth/apple` · `GET /api/auth/me`
- `GET /api/plans`
- `POST /api/payments/subscribe` · `GET /api/payments/verify` · `POST /api/payments/webhook`
- `POST /api/analyze` (تحليل الصورة بالذكاء الاصطناعي + حصّة حسب الباقة) · `GET /api/analyze/history`

```bash
cd backend
cp .env.example .env   # املأ JWT/Google/Apple/Moyasar/ANTHROPIC والمفاتيح
npm install
npm run db:push
npm run dev            # http://localhost:4000
```

## الميزات المُنجزة

- 🔐 تسجيل دخول فعلي عبر **Google** (التحقق من ID token) و **Apple** (التحقق من JWKS)، وإصدار جلسة JWT.
- 💳 اشتراكات عبر **Moyasar** (بطاقة · Apple Pay · مدى) مع تأكيد عبر Webhook وتحقّق من الخادم وحارس تطابق المبلغ.
- 🧠 تحليل الصور بالذكاء الاصطناعي (Claude vision) لاستنتاج الموقع، مع حصّة استخدام حسب الباقة (10 / 100 / 1000).
- 🗄️ Prisma ORM مع نماذج User / Subscription / Analysis.

## المتغيّرات البيئية

انظر `./.env.example` (الواجهة) و `backend/.env.example` (الخلفية).

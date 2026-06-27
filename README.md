# Photocation

منصة لاكتشاف وحجز جلسات ومواقع التصوير الاحترافي، مع تسجيل دخول عبر Google و Apple، ودفع إلكتروني عبر **Moyasar**.

A platform to discover and book professional photography sessions and locations, with Google & Apple sign-in and online payments via **Moyasar**.

## بنية المشروع / Structure

```
photocation/
├── backend/     # Express + TypeScript + Prisma (REST API, auth, payments)
└── frontend/    # Vite + React + TypeScript + Tailwind (UI)
```

## التشغيل السريع / Quick start

### الخلفية / Backend

```bash
cd backend
cp .env.example .env        # املأ المتغيّرات / fill in the variables
npm install
npm run db:push             # ينشئ قاعدة بيانات SQLite للتطوير
npm run db:seed             # بيانات تجريبية / sample data
npm run dev                 # http://localhost:4000
```

### الواجهة / Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## الميزات / Features

- 🔐 تسجيل دخول بـ Google (OpenID / ID token) و Apple (Sign in with Apple)
- 💳 الدفع عبر بوّابة Moyasar مع تأكيد عبر Webhook والتحقق من الخادم
- 📅 حجز جلسات التصوير وإدارة الحجوزات
- 🗄️ Prisma ORM (SQLite للتطوير، قابل للتبديل إلى PostgreSQL للإنتاج)

## المتغيّرات البيئية / Environment variables

انظر `backend/.env.example` و `frontend/.env.example`.

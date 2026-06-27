# نشر Photocation (Deployment)

ثلاثة مسارات. اختر واحداً. كلها تستخدم **PostgreSQL** في الإنتاج
(`backend/prisma/schema.prod.prisma`).

> ملاحظة عن المفاتيح: الواجهة والخلفية تعملان فوراً للتصفّح، لكن لتفعيل
> **تسجيل الدخول** و**التحليل بالذكاء الاصطناعي** و**الدفع** تحتاج:
> Google client id، Apple services id، مفتاح Anthropic، ومفاتيح Moyasar.

---

## المسار A — Render (الأسهل، رابط عام بكل شيء)

يوجد ملف `render.yaml` يُنشئ: قاعدة Postgres + خدمة الخلفية (Docker) + موقع الواجهة الثابت.

1. ادفع الكود إلى GitHub (مفعّل).
2. في Render: **New + → Blueprint** ثم اختر هذا المستودع/الفرع.
3. Render ينشئ الخدمات الثلاث. بعد أول نشر، املأ المتغيّرات السرّية (المعلّمة `sync: false`) في لوحة كل خدمة:
   - **photocation-api**: `CORS_ORIGINS` = رابط الواجهة، `PAYMENT_CALLBACK_URL` = `https://<الواجهة>/payment/callback`، ثم مفاتيح Google/Apple/Moyasar/Anthropic.
   - **photocation-web**: `VITE_API_BASE` = رابط الخلفية، و`VITE_*` للمفاتيح العامة.
4. أعد النشر (Manual Deploy) بعد ضبط المتغيّرات. افتح رابط `photocation-web`.

روابط Render تكون عادةً: `https://photocation-web.onrender.com` و `https://photocation-api.onrender.com`.

---

## المسار B — Vercel (واجهة) + Render (خلفية)

**الخلفية على Render:**
- New + → **Web Service** → هذا المستودع، Root Directory = `backend`، Runtime = **Docker**.
- أنشئ قاعدة Postgres على Render واربط `DATABASE_URL`.
- اضبط بقية المتغيّرات من `backend/.env.example`.

**الواجهة على Vercel:**
- استورد المستودع (Vercel يكتشف Vite، و`vercel.json` يضبط الـ SPA rewrites).
- أضِف متغيّرات `VITE_*` (خصوصاً `VITE_API_BASE` = رابط خلفية Render).
- Deploy.

---

## المسار C — Docker على خادمك (استضافة ذاتية)

```bash
cp .env.deploy.example .env     # عبّئ القيم
docker compose up --build -d
# الواجهة: http://localhost:8080   |   الخلفية: http://localhost:4000
```

`docker-compose.yml` يشغّل Postgres + الخلفية + الواجهة (nginx). لنشر عام،
ضع المشروع خلف عاكس (Caddy/Nginx) مع TLS، واضبط `CORS_ORIGINS`،
`PAYMENT_CALLBACK_URL`، و`VITE_API_BASE` على دومينك.

---

## بعد النشر — ربط مزوّدي الهوية والدفع

- **Google**: في Google Cloud Console، أضِف رابط الواجهة إلى *Authorized JavaScript origins*.
- **Apple**: في *Services ID*، أضِف الدومين و *Return URL* = `https://<الواجهة>/login`.
- **Moyasar**: من لوحة Moyasar، اضبط *Webhook* على
  `https://<الخلفية>/api/payments/webhook` بنفس قيمة `MOYASAR_WEBHOOK_SECRET`.

## التحقّق السريع

```bash
curl https://<الخلفية>/health           # {"status":"ok",...}
curl https://<الخلفية>/api/plans        # قائمة الباقات
```

# 📱 Study Bac - تطبيق Android

> **مرافقك الذكي للدراسة** - تطبيق Android مبني بـ Next.js + Capacitor

---

## 🎯 نظرة عامة

تطبيق **Study Bac** هو مساعد دراسي ذكي يساعد الطلاب على:
- 📅 تنظيم الجدول الدراسي
- ✅ إدارة المهام والواجبات
- 📚 تتبع تقدم الدراسة
- 🔔 تلقي تنبيهات ذكية
- 🤖 الاستفادة من الذكاء الاصطناعي للدراسة

---

## 🏗️ البنية التقنية

### Frontend
- **Framework**: Next.js 16.2.6 (App Router)
- **Language**: TypeScript 5.7.4
- **UI**: React 19 + Tailwind CSS 4
- **Mobile**: Capacitor 6.x

### Backend
- **API**: Next.js API Routes
- **Database**: Neon PostgreSQL (Cloud)
- **Auth**: JWT + bcrypt
- **Hosting**: Cloudflare Workers

### AI & Services
- **AI Models**: Groq, Mistral AI, Google Gemini, OpenAI
- **OCR**: Tesseract.js, Chrome Lens OCR
- **ML**: TensorFlow.js
- **Notifications**: Web Push + Telegram Bot

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 20+
- npm أو pnpm
- (اختياري) Java JDK 17+ و Android SDK للبناء المحلي

### التثبيت

```bash
# 1. Clone المشروع
git clone https://github.com/haedara22/studyzone.git
cd studyzone

# 2. تثبيت Dependencies
npm install

# 3. إعداد Environment Variables
cp .env.example .env
# عدّل .env بالمعلومات الخاصة بك

# 4. تشغيل Dev Server
npm run dev
```

---

## 📱 بناء تطبيق Android

### الطريقة 1: عبر GitHub Actions (موصى به - بدون تثبيت SDK)

1. **Push الكود إلى GitHub**
```bash
git add .
git commit -m "Ready for Android build"
git push origin main
```

2. **إعداد Secrets**
   - اذهب إلى: `Settings` → `Secrets and variables` → `Actions`
   - أضف: `DATABASE_URL`, `JWT_SECRET`, إلخ... (راجع `.env.example`)

3. **تشغيل Workflow**
   - اذهب إلى: `Actions` → `Android Build`
   - اضغط `Run workflow`
   - اختر `debug` أو `release` أو `aab`
   - انتظر 5-10 دقائق

4. **تحميل APK**
   - بعد نجاح البناء، حمّل من `Artifacts`
   - ثبّت على هاتفك!

**للتفاصيل**: راجع [`ANDROID_QUICKSTART.md`](./ANDROID_QUICKSTART.md)

---

### الطريقة 2: بناء محلي (يحتاج Java + Android SDK)

```bash
# 1. بناء المشروع
npm run build

# 2. إضافة Android (أول مرة فقط)
npx cap add android

# 3. مزامنة Assets
npm run android:sync

# 4. بناء APK
npm run android:build

# 5. الناتج في:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**للتفاصيل الكاملة**: راجع [`ANDROID_SETUP.md`](./ANDROID_SETUP.md)

---

## 📂 هيكل المشروع

```
student/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # صفحات التسجيل والدخول
│   │   ├── (dashboard)/    # لوحة التحكم
│   │   ├── api/            # API Routes
│   │   ├── planner/        # المخطط الدراسي
│   │   └── subjects/       # إدارة المواد
│   ├── components/         # React Components
│   ├── lib/                # Utilities & Helpers
│   ├── hooks/              # Custom React Hooks
│   └── types/              # TypeScript Types
├── android/                # Android Project (Capacitor)
├── public/                 # Static Assets
├── .github/workflows/      # GitHub Actions CI/CD
├── capacitor.config.ts     # Capacitor Configuration
├── next.config.ts          # Next.js Configuration
└── package.json            # Dependencies
```

---

## 🔐 إعداد Keystore للـ Release

### إنشاء Keystore (مرة واحدة)

```powershell
cd android\app
keytool -genkeypair -v -storetype PKCS12 -keystore studybac-release.keystore -alias studybac -keyalg RSA -keysize 2048 -validity 10000
```

### إعداد GitHub Secrets للـ Release

1. حوّل keystore إلى base64:
```powershell
$bytes = [System.IO.File]::ReadAllBytes("android\app\studybac-release.keystore")
$base64 = [System.Convert]::ToBase64String($bytes)
$base64 | Out-File keystore-base64.txt
```

2. أضف Secrets:
   - `KEYSTORE_BASE64`
   - `KEYSTORE_PASSWORD`
   - `KEY_ALIAS`
   - `KEY_PASSWORD`

**للتفاصيل**: راجع [`android/RELEASE_SIGNING.md`](./android/RELEASE_SIGNING.md)

---

## 🛠️ Scripts متاحة

### Development
```bash
npm run dev          # Next.js dev server
npm run build        # بناء Production
npm run start        # تشغيل Production build
npm run lint         # ESLint
```

### Cloudflare
```bash
npm run deploy       # نشر على Cloudflare
npm run preview      # معاينة محلية
```

### Android
```bash
npm run android:sync            # مزامنة Capacitor
npm run android:build           # بناء Debug APK
npm run android:build:release   # بناء Release APK
npm run android:build:aab       # بناء AAB للـ Play Store
npm run android:clean           # تنظيف Build
```

---

## 🌐 Environment Variables

### المطلوبة

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret-key

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_USERNAME=YourBotName

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key

# AI Services (اختياري)
GROQ_API_KEY=your-groq-key
MISTRAL_API_KEY=your-mistral-key
```

راجع [`.env.example`](./.env.example) للقائمة الكاملة.

---

## 📖 التوثيق

### للمطورين
- 📘 [`ANDROID_SETUP.md`](./ANDROID_SETUP.md) - دليل شامل مفصّل
- ⚡ [`ANDROID_QUICKSTART.md`](./ANDROID_QUICKSTART.md) - بدء سريع
- 🔐 [`android/RELEASE_SIGNING.md`](./android/RELEASE_SIGNING.md) - التوقيع والنشر
- 🔑 [`android/CREATE_KEYSTORE.md`](./android/CREATE_KEYSTORE.md) - إنشاء Keystore

### للمستخدمين
- 📱 [`README.md`](./README.md) - معلومات عامة عن المشروع

---

## 🧪 الاختبار

### اختبار على جهاز حقيقي

```bash
# 1. فعّل USB Debugging على الهاتف
# 2. وصّل الهاتف بالكمبيوتر
# 3. نفذ:
adb devices
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### اختبار عبر Web

```bash
npm run dev
# افتح: http://localhost:3000
```

---

## 🚀 النشر

### Cloudflare Workers/Pages
```bash
npm run deploy
```

### Google Play Store
1. أنشئ حساب Google Play Developer ($25)
2. ابنِ AAB موقّع
3. ارفع على Play Console
4. املأ Store Listing
5. انشر!

**للتفاصيل**: راجع [`android/RELEASE_SIGNING.md`](./android/RELEASE_SIGNING.md)

---

## 🤝 المساهمة

نرحب بالمساهمات! الرجاء:
1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit تغييراتك (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر تحت رخصة MIT.

---

## 📧 التواصل

- **المطور**: Study Bac Team
- **Email**: support@studybac.com
- **Telegram Bot**: [@Stu66bot](https://t.me/Stu66bot)
- **GitHub**: [haedara22/studyzone](https://github.com/haedara22/studyzone)

---

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org/)
- [Capacitor](https://capacitorjs.com/)
- [Cloudflare](https://www.cloudflare.com/)
- [Neon Database](https://neon.tech/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📊 الحالة

![Build Status](https://img.shields.io/github/actions/workflow/status/haedara22/studyzone/android-build.yml?label=Android%20Build)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

**بُني بـ ❤️ بواسطة Kiro AI**

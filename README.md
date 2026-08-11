# 📚 StudyZone - نظام إدارة الدراسة الذكي

تطبيق ويب وموبايل شامل لإدارة المهام الدراسية، الجداول، والتذكيرات مع دعم الذكاء الاصطناعي لتحليل الصور والنصوص.

## ✨ المميزات

### 🎯 إدارة المهام والدراسة
- ✅ إضافة وتتبع المهام الدراسية
- 📅 جدول دراسي تفاعلي
- 📊 لوحة تحكم شاملة بإحصائيات مفصلة
- 🔔 تذكيرات ذكية (Push Notifications + Telegram Bot)

### 🤖 الذكاء الاصطناعي
- 📸 تحليل الصور باستخدام Google Gemini AI
- 📝 استخراج النصوص من الصور (OCR)
- 💡 تحليل ذكي للمحتوى الدراسي

### 🔐 المصادقة والأمان
- 🔑 نظام مصادقة آمن مع JWT
- 👤 إدارة حسابات المستخدمين
- 🛡️ حماية API endpoints

### 📱 منصات متعددة
- 🌐 تطبيق ويب (Next.js 15)
- 📱 تطبيق Android (Capacitor)
- 💬 Telegram Bot للتذكيرات

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 15.1** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Radix UI** - UI Components
- **Tanstack Query** - Data Fetching
- **Zustand** - State Management
- **Framer Motion** - Animations

### Backend & API
- **Next.js API Routes**
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

### Mobile
- **Capacitor 6** - Native Mobile App
- **Android SDK 34** - Target Platform

### AI & Services
- **Google Gemini AI** - Image Analysis
- **Telegram Bot API** - Notifications
- **Push API** - Web Notifications
- **Service Workers** - PWA Support

### Deployment
- **Cloudflare Workers** - Serverless
- **GitHub Actions** - CI/CD
- **OpenNext** - Cloudflare Adapter

## 📋 المتطلبات

- Node.js 18+ و npm/pnpm/yarn
- PostgreSQL Database
- Google Gemini API Key
- Telegram Bot Token (اختياري)

## 🚀 التثبيت والتشغيل

### 1. استنساخ المشروع

```bash
git clone https://github.com/haedara22/studyzone.git
cd studyzone
```

### 2. تثبيت Dependencies

```bash
npm install
# أو
pnpm install
# أو
yarn install
```

### 3. إعداد المتغيرات البيئية

انسخ ملف `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

املأ المتغيرات في `.env`:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# JWT
JWT_SECRET=your_secure_jwt_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Telegram Bot (اختياري)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. إعداد قاعدة البيانات

```bash
# تشغيل migrations
npm run db:push

# أو لإنشاء migrations جديدة
npm run db:generate
npm run db:migrate
```

### 5. تشغيل التطبيق

#### Development

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

#### Production Build

```bash
npm run build
npm start
```

#### معاينة Cloudflare

```bash
npm run preview
```

### 6. بناء تطبيق Android

```bash
# بناء Next.js
npm run build

# مزامنة Capacitor
npx cap sync android

# فتح في Android Studio
npx cap open android
```

## 📱 تطبيق Android

### المتطلبات
- Android Studio
- JDK 17
- Android SDK 34

### بناء APK

يمكنك استخدام GitHub Actions لبناء APK تلقائياً:

1. اذهب إلى تبويب **Actions** في GitHub
2. اختر **Android Build Workflow**
3. اضغط **Run workflow**
4. انتظر حتى يكتمل البناء
5. قم بتنزيل APK من Artifacts

أو يدوياً:

```bash
cd android
./gradlew assembleRelease
```

سيتم إنشاء APK في:
`android/app/build/outputs/apk/release/app-release.apk`

## 🔧 السكريبتات المتاحة

```bash
# Development
npm run dev              # تشغيل dev server
npm run build            # بناء للإنتاج
npm start                # تشغيل production server
npm run preview          # معاينة Cloudflare

# Database
npm run db:push          # تطبيق schema على DB
npm run db:generate      # إنشاء migrations
npm run db:migrate       # تشغيل migrations
npm run db:studio        # فتح Drizzle Studio

# Code Quality
npm run lint             # فحص الكود
npm run type-check       # فحص TypeScript

# Capacitor
npm run cap:sync         # مزامنة مع المنصات
npm run cap:android      # فتح Android Studio
```

## 📁 هيكل المشروع

```
studyzone/
├── app/                      # Next.js App Router
│   ├── (auth)/              # صفحات المصادقة
│   ├── api/                 # API Routes
│   ├── dashboard/           # صفحة Dashboard
│   └── ocr-tools/           # أدوات OCR
├── components/              # React Components
│   ├── ui/                  # UI Components (Radix)
│   ├── dashboard/           # Dashboard Components
│   ├── planner/            # Planner Components
│   └── tasks/              # Task Components
├── lib/                     # Utilities & Config
│   ├── db/                 # Database (Drizzle)
│   ├── auth/               # Authentication
│   └── telegram/           # Telegram Bot
├── hooks/                   # Custom React Hooks
├── store/                   # Zustand Stores
├── public/                  # Static Assets
├── android/                 # Capacitor Android
└── .github/workflows/       # CI/CD

```

## 🔐 الأمان

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ HTTP-only Cookies
- ✅ CORS Configuration
- ✅ Environment Variables
- ✅ API Route Protection
- ❌ **.env files** لا يتم رفعها على Git

## 🤝 المساهمة

المساهمات مرحب بها! يرجى:

1. Fork المشروع
2. إنشاء feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📝 الترخيص

هذا المشروع مفتوح المصدر ومتاح بموجب [MIT License](LICENSE).

## 👨‍💻 المطور

**Haedara22**
- GitHub: [@haedara22](https://github.com/haedara22)
- Repository: [studyzone](https://github.com/haedara22/studyzone)

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org/) - React Framework
- [Capacitor](https://capacitorjs.com/) - Mobile Framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Google Gemini](https://ai.google.dev/) - AI API
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Cloudflare Workers](https://workers.cloudflare.com/)

## 📞 الدعم

إذا واجهت أي مشاكل أو لديك أسئلة:
- افتح [Issue](https://github.com/haedara22/studyzone/issues)
- تواصل عبر GitHub Discussions

---

صنع بـ ❤️ باستخدام Next.js و TypeScript

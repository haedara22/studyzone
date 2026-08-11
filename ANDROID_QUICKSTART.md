# 🚀 Android Quick Start Guide

## ⚡ الطريقة السريعة - بدون تثبيت محلي

### استخدام GitHub Actions (موصى به)

1. **Push الكود إلى GitHub**
```powershell
git add .
git commit -m "Add Android support with Capacitor"
git push origin main
```

2. **انتظر البناء التلقائي**
   - اذهب إلى: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
   - سترى workflow "🤖 Android Build" يعمل تلقائياً
   - انتظر 5-10 دقائق حتى ينتهي

3. **حمّل APK**
   - بعد نجاح البناء، اذهب إلى الـ workflow run
   - في قسم "Artifacts" ستجد `app-debug.apk`
   - حمّله وثبته على هاتفك!

### بناء يدوي (manual trigger)

1. اذهب إلى: `Actions` → `Android Build`
2. اضغط `Run workflow`
3. اختر Build Type:
   - `debug` - للاختبار السريع
   - `release` - للإنتاج (يحتاج keystore)
   - `aab` - للنشر على Google Play
4. اضغط `Run workflow`
5. حمّل من Artifacts

---

## 🔐 إعداد Secrets (للـ Release Build)

### GitHub Secrets المطلوبة:

اذهب إلى: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

#### Secrets الأساسية:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
TELEGRAM_BOT_TOKEN=your-token
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key
GROQ_API_KEY=your-groq-key
MISTRAL_API_KEY=your-mistral-key
```

#### Secrets للـ Release Signing (اختياري):
```
KEYSTORE_BASE64=base64-encoded-keystore
KEYSTORE_PASSWORD=your-keystore-password
KEY_ALIAS=studybac
KEY_PASSWORD=your-key-password
```

### كيفية تحويل Keystore إلى Base64:
```powershell
# في Windows PowerShell
$bytes = [System.IO.File]::ReadAllBytes("android\app\studybac-release.keystore")
$base64 = [System.Convert]::ToBase64String($bytes)
$base64 | Out-File keystore.base64.txt
```

---

## 💻 البناء المحلي (إذا كان SDK مثبت)

### المتطلبات:
- Node.js 18+
- Java JDK 17+
- Android SDK

### الأوامر:
```powershell
# بناء المشروع
npm run build

# إضافة Android (أول مرة فقط)
npx cap add android

# مزامنة الملفات
npm run android:sync

# بناء Debug APK
npm run android:build

# بناء Release APK
npm run android:build:release

# بناء AAB
npm run android:build:aab
```

### مواقع الملفات:
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📱 تثبيت APK على الهاتف

### الطريقة 1: عبر USB
1. فعّل "Developer Options" في الهاتف
2. فعّل "USB Debugging"
3. وصّل الهاتف بالكمبيوتر
4. نفذ:
```powershell
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### الطريقة 2: مباشرة (سهلة)
1. انقل ملف APK إلى الهاتف (USB أو Email أو Cloud)
2. افتح الملف من File Manager
3. اسمح بـ "Install from Unknown Sources"
4. ثبّت التطبيق

---

## 🔧 Troubleshooting

### البناء فشل في GitHub Actions
- تحقق من Secrets (DATABASE_URL, etc.)
- راجع logs الكاملة في workflow run
- تأكد من أن جميع dependencies موجودة في package.json

### التطبيق لا يتصل بالـ API
- تحقق من Production URL في `capacitor.config.ts`
- تأكد من أن Backend مستضاف ويعمل
- افحص Network tab في Chrome DevTools عبر Remote Debugging

### أيقونة التطبيق لا تظهر
- أضف أيقونات في `android/app/src/main/res/mipmap-*`
- أو استخدم: `npx capacitor-assets generate`

---

## 📖 للمزيد

راجع `ANDROID_SETUP.md` للدليل الكامل المفصّل.

---

**مطور بواسطة Kiro AI** 🤖

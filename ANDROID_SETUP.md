# 📱 دليل إعداد تطبيق Android - Study Bac

هذا الدليل الشامل لتحويل مشروع Study Bac إلى تطبيق Android حقيقي باستخدام Capacitor **بدون Android Studio**.

---

## 📋 المتطلبات

### 1. Node.js و npm
- Node.js 18+ (مثبت بالفعل ✅)
- npm (مثبت بالفعل ✅)

### 2. Java Development Kit (JDK)
- **الإصدار المطلوب**: JDK 17 أو أحدث
- **التحميل**: 
  - [Adoptium Eclipse Temurin](https://adoptium.net/) (موصى به)
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)
  - [Microsoft Build of OpenJDK](https://www.microsoft.com/openjdk)

#### تثبيت JDK على Windows:
```powershell
# باستخدام Chocolatey (إذا كان مثبتاً)
choco install openjdk17

# أو باستخدام Scoop
scoop install openjdk17

# أو حمّل المثبت من الموقع الرسمي
```

#### إعداد JAVA_HOME:
1. افتح **Environment Variables** من System Properties
2. أضف متغير جديد:
   - الاسم: `JAVA_HOME`
   - القيمة: مسار تثبيت Java (مثلاً: `C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot`)
3. أضف `%JAVA_HOME%\bin` إلى متغير `Path`

#### التحقق من التثبيت:
```powershell
java -version
# يجب أن يظهر: openjdk version "17.x.x" أو أعلى
```

---

### 3. Android SDK Command-line Tools

**⚠️ مهم**: نستخدم Command-line Tools فقط، **بدون Android Studio**

#### الخطوة 1: تحميل Command-line Tools
1. اذهب إلى: https://developer.android.com/studio#command-line-tools-only
2. حمّل **Command line tools only** لنظام Windows
3. استخرج الملف إلى مجلد (مثلاً: `C:\Android\cmdline-tools`)

#### الخطوة 2: إعداد هيكل المجلدات
يجب أن يكون الهيكل كالتالي:
```
C:\Android\
  └── cmdline-tools\
      └── latest\
          ├── bin\
          ├── lib\
          └── ...
```

إذا لم يكن هناك مجلد `latest`، أنشئه وانقل محتويات المجلد الرئيسي إليه.

#### الخطوة 3: إعداد ANDROID_HOME
1. افتح **Environment Variables**
2. أضف متغير جديد:
   - الاسم: `ANDROID_HOME` أو `ANDROID_SDK_ROOT`
   - القيمة: `C:\Android` (مسار المجلد الرئيسي)
3. أضف إلى متغير `Path`:
   - `%ANDROID_HOME%\cmdline-tools\latest\bin`
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\build-tools\34.0.0` (بعد التثبيت)

#### الخطوة 4: تثبيت المكونات المطلوبة
```powershell
# افتح PowerShell كمسؤول

# قبول التراخيص
sdkmanager --licenses

# تثبيت المكونات الأساسية
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# تثبيت إضافية (اختياري لكن موصى به)
sdkmanager "extras;android;m2repository" "extras;google;m2repository"
```

#### التحقق من التثبيت:
```powershell
# تحقق من SDK Manager
sdkmanager --list

# تحقق من adb
adb version

# تحقق من المتغيرات
echo $env:ANDROID_HOME
echo $env:JAVA_HOME
```

---

## 🚀 إعداد المشروع

### 1. بناء المشروع
```powershell
cd c:\Users\DELL\Desktop\student
npm run build
```

هذا الأمر سيبني المشروع وينشئ مجلد `.open-next/assets` المطلوب لـ Capacitor.

### 2. إنشاء Android Project
```powershell
# إضافة منصة Android (يحتاج Java و Android SDK)
npx cap add android
```

هذا الأمر سينشئ مجلد `android/` يحتوي على مشروع Android/Gradle كامل.

### 3. مزامنة Assets
```powershell
# بعد كل تغيير في الكود
npm run android:sync

# أو يدوياً
npx cap sync android
```

---

## 🔨 بناء APK محلياً

### Debug APK (للاختبار)
```powershell
cd android
.\gradlew assembleDebug

# المخرجات في:
# android\app\build\outputs\apk\debug\app-debug.apk
```

### Release APK (للإنتاج)
```powershell
cd android
.\gradlew assembleRelease

# المخرجات في:
# android\app\build\outputs\apk\release\app-release-unsigned.apk
```

### Android App Bundle (AAB) - للنشر على Google Play
```powershell
cd android
.\gradlew bundleRelease

# المخرجات في:
# android\app\build\outputs\bundle\release\app-release.aab
```

---

## 🔐 إعداد Release Signing

لنشر التطبيق على Google Play، يجب توقيعه.

### 1. إنشاء Keystore
```powershell
cd android\app

keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore studybac-release.keystore `
  -alias studybac `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000

# سيطلب منك:
# - كلمة مرور للـ keystore
# - كلمة مرور للـ alias
# - معلومات الشركة/المطور
```

⚠️ **مهم جداً**: احفظ الـ keystore وكلمات المرور في مكان آمن! فقدانها = لا يمكن تحديث التطبيق!

### 2. إعداد Gradle للتوقيع

أنشئ ملف `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=studybac
storeFile=app/studybac-release.keystore
```

⚠️ **لا تضف `key.properties` إلى Git!** تأكد من وجوده في `.gitignore`

### 3. تعديل `android/app/build.gradle`

أضف قبل `android {`:
```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

داخل `android { ... }` أضف:
```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 4. بناء Release موقّع
```powershell
cd android
.\gradlew assembleRelease

# أو AAB
.\gradlew bundleRelease
```

---

## 🌐 إعداد Production URL

التطبيق يتصل بـ backend مستضاف على Cloudflare Workers.

### ملف `capacitor.config.ts`:
```typescript
server: {
  url: 'https://student.pages.dev', // ✅ Production URL
  cleartext: false,
  androidScheme: 'https'
}
```

⚠️ **مهم**: تأكد من تغيير URL إلى URL الإنتاج الفعلي قبل النشر!

### التحقق من عدم وجود localhost:
```powershell
# ابحث في الكود عن أي localhost
grep -r "localhost" src/
grep -r "127.0.0.1" src/
```

---

## 🎨 تخصيص الأيقونات والشاشات

### تخصيص App Icon:
1. ضع أيقونة بحجم 1024x1024 في `resources/icon.png`
2. نفذ:
```powershell
npx capacitor-assets generate --iconBackgroundColor '#2563EB'
```

### تخصيص Splash Screen:
1. ضع صورة بحجم 2732x2732 في `resources/splash.png`
2. نفذ:
```powershell
npx capacitor-assets generate
```

---

## 🔧 Commands مفيدة

```powershell
# تطوير
npm run dev                    # تشغيل Next.js dev server
npm run build                  # بناء المشروع

# Capacitor
npm run android:sync           # مزامنة الكود مع Android
npm run android:build          # بناء Debug APK
npm run android:build:release  # بناء Release APK
npm run android:build:aab      # بناء AAB
npm run android:clean          # تنظيف build cache

# Cloudflare
npm run deploy                 # نشر على Cloudflare
npm run preview                # معاينة محلية
```

---

## 🐛 حل المشاكل الشائعة

### 1. `java: command not found`
- تأكد من تثبيت JDK
- تأكد من إضافة `JAVA_HOME` و `%JAVA_HOME%\bin` إلى PATH
- أعد تشغيل PowerShell بعد تعديل Environment Variables

### 2. `sdkmanager: command not found`
- تأكد من هيكل المجلدات الصحيح (`cmdline-tools/latest/`)
- تأكد من إضافة `ANDROID_HOME` و paths الصحيحة
- أعد تشغيل PowerShell

### 3. `License not accepted`
```powershell
sdkmanager --licenses
# اضغط 'y' لقبول كل license
```

### 4. Gradle build fails
```powershell
# نظف الـ cache وأعد البناء
cd android
.\gradlew clean
.\gradlew assembleDebug --stacktrace
```

### 5. `EACCES: permission denied`
```powershell
# شغّل PowerShell كـ Administrator
```

---

## 🎯 البناء عبر GitHub Actions (بدون تثبيت محلي)

إذا لم ترد تثبيت Java/Android SDK محلياً، استخدم GitHub Actions:

1. انقل الكود إلى GitHub
2. أضف secrets في Settings → Secrets:
   - `KEYSTORE_BASE64`: الـ keystore مشفر بـ base64
   - `KEYSTORE_PASSWORD`: كلمة مرور keystore
   - `KEY_ALIAS`: alias name
   - `KEY_PASSWORD`: كلمة مرور key
3. Push إلى `main` branch
4. حمّل APK/AAB من Artifacts

---

## 📦 النشر على Google Play

### 1. إنشاء حساب Google Play Developer
- التكلفة: $25 (مرة واحدة)
- https://play.google.com/console/signup

### 2. إنشاء تطبيق جديد
1. اذهب إلى Play Console
2. Create App
3. املأ البيانات الأساسية

### 3. رفع AAB
1. Production → Create new release
2. ارفع `app-release.aab`
3. املأ release notes
4. Review → Start rollout

### 4. متطلبات النشر
- Privacy Policy URL
- App screenshots (2-8 صور)
- Feature graphic (1024x500)
- App icon
- Short و Full description
- تصنيف المحتوى

---

## 🔄 تحديث التطبيق

### 1. زيادة version في `android/app/build.gradle`:
```gradle
versionCode 2  // زد بمقدار 1
versionName "1.1.0"  // حدّث الإصدار
```

### 2. بناء ونشر:
```powershell
npm run build
npm run android:sync
cd android
.\gradlew bundleRelease
```

### 3. رفع على Google Play
- Production → Create new release
- ارفع AAB الجديد

---

## 📚 مصادر إضافية

- [Capacitor Documentation](https://capacitorjs.com/)
- [Android SDK Command-line Tools](https://developer.android.com/studio/command-line)
- [Gradle Build Tool](https://gradle.org/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## 💡 نصائح مهمة

1. **احفظ الـ keystore**: فقدانه = لا يمكن تحديث التطبيق
2. **لا تضع secrets في Git**: استخدم `.gitignore`
3. **اختبر قبل النشر**: جرّب APK على أجهزة حقيقية
4. **استخدم Production URL**: لا localhost في الإنتاج
5. **راقب الأداء**: استخدم Google Play Console Analytics

---

## ✅ Checklist قبل النشر

- [ ] تم اختبار جميع الوظائف
- [ ] Production URL صحيح
- [ ] لا توجد localhost references
- [ ] Keystore محفوظ بشكل آمن
- [ ] versionCode تم زيادته
- [ ] App icon and splash screen محدثين
- [ ] Permissions صحيحة في AndroidManifest.xml
- [ ] Privacy Policy جاهز
- [ ] Screenshots and graphics جاهزة
- [ ] Release notes مكتوبة

---

**تم إنشاء هذا الدليل بواسطة Kiro AI** 🤖

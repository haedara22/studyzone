# 🔐 دليل Release Signing و النشر

## 📝 نظرة عامة

هذا الدليل يشرح كيفية إعداد التوقيع الرقمي (Signing) للإصدارات النهائية من تطبيق Study Bac Android.

---

## 🔑 إنشاء Keystore (مرة واحدة فقط)

### الطريقة 1: باستخدام keytool (محلياً)

```powershell
# انتقل إلى مجلد android/app
cd android\app

# أنشئ keystore جديد
keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore studybac-release.keystore `
  -alias studybac `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000

# سيطلب منك:
# 1. كلمة مرور للـ keystore (احفظها جيداً!)
# 2. كلمة مرور للـ alias (يمكن أن تكون نفسها)
# 3. اسمك أو اسم الشركة
# 4. اسم الوحدة التنظيمية
# 5. المدينة والدولة
```

### الطريقة 2: باستخدام Android Studio (إذا كان مثبتاً)

1. افتح المشروع في Android Studio
2. اذهب إلى: `Build` → `Generate Signed Bundle / APK`
3. اختر `APK` أو `Android App Bundle`
4. اضغط `Create new...` في حقل Key store path
5. املأ البيانات المطلوبة

---

## 🗄️ معلومات الـ Keystore

احفظ هذه المعلومات في مكان آمن:

```
Keystore File: studybac-release.keystore
Keystore Password: [كلمة المرور التي اخترتها]
Key Alias: studybac
Key Password: [كلمة المرور للـ alias]
```

⚠️ **تحذير حرج**: فقدان الـ keystore أو كلمات المرور = **لا يمكن تحديث التطبيق على Google Play أبداً**!

**نصائح الأمان:**
- احفظ الـ keystore في مكانين آمنين (cloud backup)
- لا تشارك الـ keystore مع أحد
- استخدم password manager لحفظ كلمات المرور
- لا تضع الـ keystore في Git

---

## 🔧 إعداد Gradle للتوقيع (محلياً)

### 1. إنشاء ملف key.properties

أنشئ ملف `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=studybac
storeFile=studybac-release.keystore
```

⚠️ **لا تضع هذا الملف في Git!** (موجود بالفعل في .gitignore)

### 2. تعديل android/app/build.gradle

الملف معد بالفعل للتوقيع التلقائي إذا وجد `key.properties`.

---

## 🚀 البناء عبر GitHub Actions

### إعداد GitHub Secrets

اذهب إلى: `Repository` → `Settings` → `Secrets and variables` → `Actions`

أضف Secrets التالية:

#### 1. KEYSTORE_BASE64
```powershell
# حوّل الـ keystore إلى base64
$bytes = [System.IO.File]::ReadAllBytes("android\app\studybac-release.keystore")
$base64 = [System.Convert]::ToBase64String($bytes)
$base64 | Out-File keystore-base64.txt

# انسخ محتوى keystore-base64.txt وضعه في GitHub Secret
```

#### 2. باقي Secrets
```
KEYSTORE_PASSWORD=your-keystore-password
KEY_ALIAS=studybac
KEY_PASSWORD=your-key-password
```

### تعديل GitHub Actions Workflow

الـ workflow موجود بالفعل في `.github/workflows/android-build.yml`

لتفعيل Release Signing، أضف في الـ workflow:

```yaml
- name: 🔐 Decode Keystore
  if: github.event.inputs.build_type == 'release' || github.event.inputs.build_type == 'aab'
  run: |
    echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/studybac-release.keystore

- name: 🔨 Build Release APK with Signing
  if: github.event.inputs.build_type == 'release'
  working-directory: android
  run: ./gradlew assembleRelease --stacktrace
  env:
    SIGNING_KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
    SIGNING_KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
    SIGNING_KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
```

---

## 🏗️ أوامر البناء المحلي

### Debug Build (بدون توقيع)
```powershell
cd android
.\gradlew assembleDebug

# الناتج:
# android\app\build\outputs\apk\debug\app-debug.apk
```

### Release Build (مع توقيع)
```powershell
cd android
.\gradlew assembleRelease

# الناتج:
# android\app\build\outputs\apk\release\app-release.apk
```

### Android App Bundle (للـ Google Play)
```powershell
cd android
.\gradlew bundleRelease

# الناتج:
# android\app\build\outputs\bundle\release\app-release.aab
```

---

## 🔍 التحقق من التوقيع

### فحص APK Signature
```powershell
# تحقق من التوقيع
jarsigner -verify -verbose -certs android\app\build\outputs\apk\release\app-release.apk

# يجب أن يظهر: "jar verified."
```

### استخراج معلومات Keystore
```powershell
keytool -list -v -keystore android\app\studybac-release.keystore -alias studybac

# سيعرض:
# - SHA1 Fingerprint
# - SHA256 Fingerprint  
# - صلاحية الشهادة
```

---

## 📦 Google Play Console

### تحضير الإصدار الأول

1. **إنشاء حساب Google Play Developer**
   - التكلفة: $25 (مرة واحدة)
   - https://play.google.com/console/signup

2. **إنشاء تطبيق جديد**
   - اذهب إلى Play Console
   - "Create app"
   - املأ المعلومات الأساسية

3. **إعداد App signing by Google Play**
   - Play Console → Setup → App signing
   - اختر "Use Google-generated key" (موصى به)
   - أو ارفع الـ keystore الخاص بك

4. **رفع AAB**
   - Production → Create new release
   - ارفع `app-release.aab`
   - املأ Release notes
   - Review → Start rollout

### متطلبات النشر

#### معلومات إلزامية:
- ✅ App name
- ✅ Short description (80 حرف)
- ✅ Full description (4000 حرف)
- ✅ App icon (512x512 PNG)
- ✅ Feature graphic (1024x500 PNG)
- ✅ Screenshots (2-8 صور)
- ✅ Privacy Policy URL
- ✅ تصنيف المحتوى

#### معلومات اختيارية:
- 🔹 Video trailer
- 🔹 Promo graphics
- 🔹 TV banner

---

## 🔄 تحديث التطبيق

### زيادة Version Code و Version Name

في `android/app/build.gradle`:

```gradle
defaultConfig {
    // ...
    versionCode 2  // زد بـ 1 عن الإصدار السابق
    versionName "1.1.0"  // حدّث حسب semantic versioning
}
```

### خطوات التحديث:

1. **تحديث الكود**
```powershell
# في جذر المشروع
npm run build
npx cap sync android
```

2. **زيادة Version**
```gradle
versionCode 2
versionName "1.1.0"
```

3. **بناء AAB جديد**
```powershell
cd android
.\gradlew bundleRelease
```

4. **رفع على Google Play**
   - Production → Create new release
   - ارفع AAB الجديد
   - أضف Release notes
   - Review → Start rollout

---

## 🧪 اختبار قبل النشر

### Internal Testing Track
- أسرع طريقة للاختبار
- يصل للمستخدمين خلال دقائق
- أضف email addresses للـ testers

### Closed Testing (Alpha/Beta)
- اختبار مع مجموعة أكبر
- يمكن استخدام رابط عام
- يصل خلال ساعات

### Open Testing
- متاح للجميع
- اختياري قبل Production
- يمكن جمع Feedback

---

## 📊 App Bundle vs APK

| Feature | APK | AAB |
|---------|-----|-----|
| حجم التحميل | أكبر | أصغر بـ 15-35% |
| Google Play | ✅ | ✅ موصى به |
| تثبيت مباشر | ✅ | ❌ |
| Dynamic Delivery | ❌ | ✅ |
| مطلوب للتطبيقات الجديدة | ❌ | ✅ منذ أغسطس 2021 |

**التوصية**: استخدم AAB للنشر على Google Play، واحتفظ بـ APK للتوزيع المباشر أو الاختبار.

---

## 🛡️ أمان إضافي

### App Signing by Google Play (موصى به)

**المزايا:**
- Google يدير الـ signing key
- يمكن إعادة تعيين الـ upload key إذا فُقد
- حماية أفضل للـ signing key

**الإعداد:**
1. Play Console → Setup → App signing
2. اختر "Continue" للسماح لـ Google بإدارة المفتاح
3. ارفع الـ keystore الخاص بك (اختياري)
4. أو دع Google ينشئ مفتاحاً جديداً

### Code Obfuscation (تشويش الكود)

في `android/app/build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## 📝 Checklist قبل النشر

### Code:
- [ ] تم اختبار جميع الوظائف
- [ ] لا توجد console.log في Production
- [ ] API URLs صحيحة (Production)
- [ ] لا توجد hardcoded secrets

### Build:
- [ ] versionCode تم زيادته
- [ ] versionName محدّث
- [ ] Keystore موجود وسليم
- [ ] AAB موقّع بشكل صحيح

### Play Console:
- [ ] Screenshots محدثة
- [ ] Description محدّث
- [ ] Release notes مكتوبة
- [ ] Privacy Policy URL صالح
- [ ] تصنيف المحتوى صحيح

### Testing:
- [ ] تم الاختبار على أجهزة حقيقية
- [ ] تم الاختبار على إصدارات Android مختلفة
- [ ] Permissions تعمل بشكل صحيح
- [ ] Push Notifications تعمل

---

## 🆘 استكشاف الأخطاء

### الملف studybac-release.keystore غير موجود
```
السبب: لم يتم إنشاء الـ keystore بعد
الحل: اتبع خطوات "إنشاء Keystore" أعلاه
```

### jarsigner: unable to sign jar
```
السبب: كلمة مرور خاطئة أو keystore تالف
الحل: تحقق من key.properties والبيانات
```

### Google Play يرفض الـ APK/AAB
```
السبب: توقيع مختلف عن الإصدار السابق
الحل: يجب استخدام نفس الـ keystore دائماً
```

### Version code must be greater than...
```
السبب: versionCode لم يتم زيادته
الحل: زد versionCode في build.gradle
```

---

## 📚 موارد إضافية

- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Upload App to Play Console](https://support.google.com/googleplay/android-developer/answer/9859152)
- [App Bundle Format](https://developer.android.com/guide/app-bundle)
- [ProGuard](https://developer.android.com/studio/build/shrink-code)

---

**تم إنشاؤه بواسطة Kiro AI** 🤖

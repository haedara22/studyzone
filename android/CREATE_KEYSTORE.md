# 🔑 دليل سريع لإنشاء Keystore

## ⚡ الطريقة السريعة

### Windows PowerShell

```powershell
# 1. انتقل إلى مجلد android/app
cd android\app

# 2. أنشئ الـ keystore
keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore studybac-release.keystore `
  -alias studybac `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000

# 3. سيطلب منك إدخال:
#    - Keystore password (اخترها واحفظها!)
#    - اسمك الأول والأخير
#    - اسم الوحدة التنظيمية (اتركها فارغة أو ضع "Development")
#    - اسم المؤسسة (اختياري)
#    - المدينة (اختياري)
#    - الولاية/المحافظة (اختياري)
#    - رمز الدولة (مثلاً: DZ للجزائر)
#    - تأكيد المعلومات (y)
#    - Key password (اضغط Enter لاستخدام نفس كلمة مرور keystore)
```

## 📝 احفظ هذه المعلومات

بعد الإنشاء، احفظ هذه المعلومات في مكان آمن:

```
Keystore Path: android/app/studybac-release.keystore
Keystore Password: [كلمة المرور التي اخترتها]
Key Alias: studybac
Key Password: [نفس كلمة مرور keystore أو مختلفة]
```

## 🔐 إعداد للبناء المحلي

أنشئ ملف `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=studybac
storeFile=app/studybac-release.keystore
```

⚠️ **لا تضع هذا الملف في Git!**

## 🚀 إعداد لـ GitHub Actions

### 1. حوّل الـ keystore إلى base64

```powershell
# PowerShell
$bytes = [System.IO.File]::ReadAllBytes("android\app\studybac-release.keystore")
$base64 = [System.Convert]::ToBase64String($bytes)
$base64 | Out-File keystore-base64.txt

# افتح keystore-base64.txt وانسخ المحتوى
```

### 2. أضف GitHub Secrets

اذهب إلى: `Repository Settings` → `Secrets and variables` → `Actions` → `New repository secret`

أضف:
- `KEYSTORE_BASE64`: [المحتوى من keystore-base64.txt]
- `KEYSTORE_PASSWORD`: [كلمة مرور keystore]
- `KEY_ALIAS`: studybac
- `KEY_PASSWORD`: [كلمة مرور key]

## ✅ التحقق

```powershell
# تحقق من الـ keystore
keytool -list -v -keystore android\app\studybac-release.keystore -alias studybac

# سيطلب كلمة المرور ثم يعرض معلومات الشهادة
```

## 🆘 حل المشاكل

### keytool: command not found
- تأكد من تثبيت Java JDK
- أضف `%JAVA_HOME%\bin` إلى PATH

### Keystore was tampered with, or password was incorrect
- كلمة المرور خاطئة
- أعد الإدخال بعناية

---

لمزيد من التفاصيل، راجع: `RELEASE_SIGNING.md`

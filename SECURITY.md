# 🔐 سياسة الأمان (Security Policy)

## الإصدارات المدعومة

نحن نوفر تحديثات أمنية للإصدارات التالية من StudyZone:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## الإبلاغ عن ثغرة أمنية

نحن نأخذ الأمان على محمل الجد. إذا اكتشفت ثغرة أمنية في StudyZone، يرجى الإبلاغ عنها بشكل مسؤول.

### 🚨 كيفية الإبلاغ

**لا تفتح Issue عام للثغرات الأمنية!**

بدلاً من ذلك، يرجى:

1. **التواصل الخاص:**
   - أرسل تفاصيل الثغرة عبر GitHub Security Advisory
   - أو راسلنا مباشرةً عبر Issue خاص

2. **معلومات مطلوبة:**
   - وصف تفصيلي للثغرة
   - خطوات إعادة الإنتاج
   - التأثير المحتمل
   - الإصدارات المتأثرة
   - أي proof-of-concept code (اختياري)

### ⏱️ وقت الاستجابة

- **الإقرار:** خلال 48 ساعة
- **التقييم الأولي:** خلال 7 أيام
- **الإصلاح:** حسب خطورة الثغرة (أولوية عالية خلال 14 يوم)

### 🎁 الاعتراف

نقدر جهودك في تحسين أمان StudyZone! سيتم:
- إضافة اسمك في قائمة الشكر (إن رغبت)
- الإشارة إلى مساهمتك في release notes

## 🛡️ ممارسات الأمان

### للمطورين

عند المساهمة في المشروع:

#### 1. Environment Variables
```bash
# ✅ استخدم .env للمتغيرات الحساسة
DATABASE_URL=...
JWT_SECRET=...

# ❌ لا تضع secrets في الكود
const apiKey = "hardcoded-key"; // خطأ!
```

#### 2. Authentication
```typescript
// ✅ تحقق من المصادقة في جميع API routes المحمية
const user = await verifyAuth(request);
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// ❌ لا تنسى التحقق
export async function POST(request: Request) {
  // مباشرة إلى المنطق بدون تحقق - خطأ!
}
```

#### 3. Input Validation
```typescript
// ✅ تحقق من صحة المدخلات
const data = await request.json();
if (!data.title || typeof data.title !== 'string') {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}

// ❌ لا تثق بالمدخلات مباشرةً
const data = await request.json();
await db.insert(tasks).values(data); // خطر!
```

#### 4. SQL Injection Prevention
```typescript
// ✅ استخدم Drizzle ORM دائماً
await db.select().from(users).where(eq(users.id, userId));

// ❌ لا تستخدم raw SQL مع user input
await db.execute(`SELECT * FROM users WHERE id = ${userId}`); // خطر!
```

#### 5. XSS Prevention
```typescript
// ✅ React يقوم بـ escaping تلقائياً
<div>{userContent}</div>

// ❌ تجنب dangerouslySetInnerHTML مع محتوى غير موثوق
<div dangerouslySetInnerHTML={{ __html: userContent }} /> // خطر!
```

#### 6. CORS Configuration
```typescript
// ✅ حدد origins المسموحة بوضوح
const allowedOrigins = ['https://yourdomain.com'];

// ❌ لا تستخدم '*' في production
headers.set('Access-Control-Allow-Origin', '*'); // خطر!
```

### للمستخدمين

#### 1. Environment Setup
- لا تشارك ملفات `.env` مطلقاً
- استخدم passwords قوية ومعقدة
- قم بتغيير `JWT_SECRET` لقيمة فريدة وقوية

#### 2. API Keys
- احتفظ بـ API keys في مكان آمن
- لا ترفع `.env` على Git
- استخدم `.env.example` كقالب فقط

#### 3. Database
- استخدم SSL للاتصال بقاعدة البيانات
- لا تشارك connection strings
- فعّل authentication على database

#### 4. Deployment
```bash
# قبل الـ deploy، تأكد من:
# ✅ .env في .gitignore
git ls-files | grep .env

# ✅ لا secrets في الكود
git grep -i "password\|secret\|api_key" -- '*.ts' '*.js'
```

## 🔍 فحص الأمان

### Automated Checks

نستخدم الأدوات التالية:

```bash
# TypeScript Type Checking
npm run type-check

# Linting
npm run lint

# Dependency Audit
npm audit

# نوصي بتشغيلها قبل كل commit
```

### Manual Review

قبل دمج أي PR، نراجع:
- [ ] Authentication & Authorization
- [ ] Input Validation
- [ ] SQL Queries
- [ ] Environment Variables Usage
- [ ] Error Messages (لا تكشف معلومات حساسة)

## 📚 موارد إضافية

### OWASP Top 10
نلتزم بمعايير OWASP:
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Software and Data Integrity
9. Security Logging Failures
10. Server-Side Request Forgery

### Best Practices Links
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [npm Security](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)

## 📝 Changelog

### Security Updates

سيتم توثيق جميع التحديثات الأمنية هنا:

#### [Future Updates]
- تحديثات قادمة...

## 🙏 شكر وتقدير

شكراً لجميع الباحثين الأمنيين والمساهمين الذين يساعدون في جعل StudyZone أكثر أماناً.

---

**تذكر:** الأمان مسؤولية الجميع. إذا رأيت شيئاً، قل شيئاً! 🔐

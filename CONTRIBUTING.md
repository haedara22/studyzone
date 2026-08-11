# 🤝 المساهمة في StudyZone

شكراً لاهتمامك بالمساهمة في StudyZone! نحن نرحب بجميع المساهمات من المجتمع.

## 📋 جدول المحتويات

- [كيفية المساهمة](#كيفية-المساهمة)
- [إرشادات الكود](#إرشادات-الكود)
- [عملية Pull Request](#عملية-pull-request)
- [الإبلاغ عن المشاكل](#الإبلاغ-عن-المشاكل)
- [اقتراح ميزات جديدة](#اقتراح-ميزات-جديدة)

## 🚀 كيفية المساهمة

### 1. Fork المشروع

اضغط على زر "Fork" في أعلى الصفحة لإنشاء نسخة من المشروع في حسابك.

### 2. استنسخ Fork الخاص بك

```bash
git clone https://github.com/YOUR_USERNAME/studyzone.git
cd studyzone
```

### 3. أضف Remote للمشروع الأصلي

```bash
git remote add upstream https://github.com/haedara22/studyzone.git
```

### 4. أنشئ Branch جديد

```bash
git checkout -b feature/your-feature-name
```

استخدم أسماء واضحة للـ branches:
- `feature/` للميزات الجديدة (مثل: `feature/add-dark-mode`)
- `fix/` لإصلاح الأخطاء (مثل: `fix/login-button-bug`)
- `docs/` للتوثيق (مثل: `docs/update-readme`)
- `refactor/` لإعادة هيكلة الكود (مثل: `refactor/optimize-queries`)

### 5. قم بالتطوير

- اتبع [إرشادات الكود](#إرشادات-الكود)
- اكتب كود نظيف وقابل للصيانة
- أضف تعليقات عند الحاجة
- تأكد من أن الكود يعمل بدون أخطاء

### 6. Commit التغييرات

```bash
git add .
git commit -m "نوع: وصف مختصر للتغيير"
```

أمثلة على رسائل Commit الجيدة:
```
feat: إضافة ميزة الوضع الليلي
fix: إصلاح خطأ في تسجيل الدخول
docs: تحديث دليل التثبيت
refactor: تحسين أداء استعلامات قاعدة البيانات
style: تحسين تصميم صفحة Dashboard
test: إضافة اختبارات للـ API
```

### 7. Push إلى Fork الخاص بك

```bash
git push origin feature/your-feature-name
```

### 8. افتح Pull Request

اذهب إلى صفحة المشروع الأصلي واضغط "New Pull Request".

## 💻 إرشادات الكود

### TypeScript

- استخدم TypeScript في جميع الملفات
- حدد الأنواع بوضوح (تجنب `any`)
- استخدم Interfaces للـ objects المعقدة

```typescript
// ✅ جيد
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// ❌ سيء
const task: any = { ... };
```

### React Components

- استخدم Functional Components مع Hooks
- استخدم `use client` للـ client components
- قسّم الـ components الكبيرة إلى components أصغر

```typescript
'use client';

import { useState } from 'react';

export function TaskItem({ task }: { task: Task }) {
  // ...
}
```

### Styling

- استخدم Tailwind CSS للتصميم
- استخدم الـ utility classes
- حافظ على consistency مع التصميم الحالي

```tsx
<div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800">
  {/* Content */}
</div>
```

### API Routes

- استخدم HTTP methods بشكل صحيح (GET, POST, PUT, DELETE)
- تحقق من المصادقة في جميع الـ protected routes
- أرجع status codes مناسبة
- استخدم معالجة أخطاء مناسبة

```typescript
export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Logic here...
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Database

- استخدم Drizzle ORM لجميع العمليات
- لا تكتب SQL مباشرةً
- استخدم transactions للعمليات المعقدة

```typescript
await db.insert(tasks).values({
  userId: user.id,
  title: 'New Task',
  completed: false,
});
```

### التسمية

- استخدم camelCase للمتغيرات والدوال
- استخدم PascalCase للـ components والـ types
- استخدم UPPER_CASE للـ constants
- استخدم أسماء واضحة ووصفية

```typescript
// Variables & Functions
const taskList = [...];
function handleSubmit() { ... }

// Components & Types
function TaskList() { ... }
interface TaskProps { ... }

// Constants
const MAX_TASKS = 100;
const API_URL = '...';
```

## 🔄 عملية Pull Request

### قبل فتح PR

1. **تحديث من upstream:**
```bash
git fetch upstream
git merge upstream/main
```

2. **تشغيل الاختبارات:**
```bash
npm run type-check
npm run lint
npm run build
```

3. **مراجعة التغييرات:**
- تأكد من أن جميع التغييرات ضرورية
- احذف أي كود تجريبي أو console.logs
- تأكد من عدم وجود merge conflicts

### وصف PR

عند فتح Pull Request، املأ الوصف بالمعلومات التالية:

```markdown
## 📝 الوصف
وصف مختصر للتغييرات

## 🎯 نوع التغيير
- [ ] Bug fix (تغيير لا يكسر الوظائف الموجودة)
- [ ] New feature (تغيير يضيف وظيفة جديدة)
- [ ] Breaking change (تغيير قد يؤثر على الوظائف الموجودة)
- [ ] Documentation update

## ✅ Checklist
- [ ] الكود يتبع إرشادات المشروع
- [ ] تم إجراء مراجعة ذاتية للكود
- [ ] أضفت تعليقات في المناطق المعقدة
- [ ] لا توجد warnings جديدة
- [ ] تم اختبار التغييرات

## 📷 Screenshots (إن وجدت)
أضف screenshots للتغييرات UI

## 🔗 Issues المرتبطة
Closes #issue_number
```

### بعد فتح PR

- انتظر المراجعة من المطورين
- قم بالرد على التعليقات والاقتراحات
- قم بإجراء التغييرات المطلوبة
- كن صبوراً ومتعاوناً

## 🐛 الإبلاغ عن المشاكل

إذا وجدت bug، يرجى فتح Issue مع المعلومات التالية:

### معلومات Bug Report

```markdown
## 🐛 وصف المشكلة
وصف واضح ومختصر للمشكلة

## 📝 خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. اضغط على '...'
3. قم بالتمرير إلى '...'
4. المشكلة تحدث

## ✅ السلوك المتوقع
ماذا كنت تتوقع أن يحدث

## 📷 Screenshots
إن أمكن، أضف screenshots

## 💻 البيئة
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node Version: [e.g. 18.17.0]
- App Version: [e.g. 1.0.0]

## 📋 معلومات إضافية
أي معلومات أخرى عن المشكلة
```

## 💡 اقتراح ميزات جديدة

لاقتراح ميزة جديدة، افتح Issue مع:

```markdown
## 🚀 وصف الميزة
وصف واضح للميزة المقترحة

## 🎯 المشكلة التي تحلها
ما المشكلة التي ستحلها هذه الميزة؟

## 💡 الحل المقترح
كيف تتصور تنفيذ هذه الميزة؟

## 🔄 البدائل
هل فكرت في حلول بديلة؟

## 📋 معلومات إضافية
أي سياق أو screenshots إضافية
```

## 📞 التواصل

إذا كان لديك أسئلة:
- افتح [Discussion](https://github.com/haedara22/studyzone/discussions)
- اسأل في تعليقات Issue أو PR
- تواصل عبر GitHub

## 🙏 شكراً

شكراً لمساهمتك في جعل StudyZone أفضل! كل مساهمة، مهما كانت صغيرة، تُحدث فرقاً.

---

**ملاحظة:** بمساهمتك في هذا المشروع، فإنك توافق على أن مساهمتك ستكون مرخصة بموجب MIT License.

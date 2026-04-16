# جلب بيانات السيرفر

## نظرة عامة

هذا النظام يسمح لك بجلب بيانات التقدم من السيرفر (للقراءة فقط) دون تعديلها.

## الملفات

### 1. `progress.server.json`
- **الوصف**: نسخة للقراءة فقط من بيانات السيرفر
- **المصدر**: يتم جلبها من السيرفر عبر `fetch_server_data.php`
- **الحالة**: **للقراءة فقط** - لن يتم تعديلها أبداً
- **في Git**: مستثنى من Git (موجود في `.gitignore`)

### 2. `progress.local.json`
- **الوصف**: بيانات التطوير المحلية
- **المصدر**: يتم حفظها محلياً عند التطوير
- **الحالة**: قابلة للتعديل للتطوير والاختبار
- **في Git**: مستثنى من Git

### 3. `progress.json`
- **الوصف**: بيانات السيرفر الحقيقية (في `main/` فقط)
- **المصدر**: السيرفر الفعلي
- **الحالة**: **لا تلمس هذا الملف** - بيانات المستخدمين الحقيقية

## كيفية الاستخدام

### خطوة 1: تحديث عنوان السيرفر

افتح `dev/fetch_server_data.php` وعدل السطر:

```php
$SERVER_URL = 'https://your-server.com/get_progress.php';
```

ضع عنوان السيرفر الفعلي.

### خطوة 2: جلب البيانات

افتح في المتصفح:
```
http://localhost:8000/fetch_server_data.php
```

أو من سطر الأوامر:
```bash
php dev/fetch_server_data.php
```

### خطوة 3: عرض البيانات

بعد الجلب، البيانات ستكون في `progress.server.json` وستظهر تلقائياً في:
- `index.html` - الصفحة الرئيسية
- `person.html` - الصفحة الشخصية

## كيف يعمل النظام

1. **`fetch_server_data.php`**: يجلب البيانات من السيرفر ويحفظها في `progress.server.json`
2. **`get_progress.php`**: يقرأ من `progress.server.json` (للقراءة) + `progress.local.json` (للتطوير)
3. **`save_progress.php`**: يكتب فقط في `progress.local.json` (لن يعدل بيانات السيرفر)

## الأمان

- ✅ `progress.server.json` للقراءة فقط - لن يتم تعديله
- ✅ `save_progress.php` يكتب فقط في `progress.local.json`
- ✅ بيانات السيرفر الأصلية (`progress.json` في `main/`) لن تُمس
- ✅ يمكنك جلب البيانات في أي وقت دون قلق

## ملاحظات مهمة

- ⚠️ **لا تعدل `progress.server.json` يدوياً** - استخدم `fetch_server_data.php` فقط
- ⚠️ **لا ترفع `progress.server.json` على GitHub** - موجود في `.gitignore`
- ⚠️ **بيانات السيرفر للقراءة فقط** - للتطوير استخدم `progress.local.json`


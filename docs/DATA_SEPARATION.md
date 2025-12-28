# فصل البيانات بين اللوكال والسيرفر

## النظام الجديد

تم إضافة نظام فصل البيانات بين بيئة التطوير (local) وبيئة الإنتاج (production).

### الملفات

- **`config.php`**: ملف الإعدادات الذي يحدد البيئة
- **`progress.json`**: ملف التقدم على السيرفر (production)
- **`progress.local.json`**: ملف التقدم المحلي (development)

### كيفية الاستخدام

#### في بيئة التطوير (Local)

1. افتح `config.php`
2. تأكد أن `ENVIRONMENT` مضبوط على `'local'`:
   ```php
   define('ENVIRONMENT', 'local');
   ```
3. البيانات ستُحفظ في `progress.local.json`
4. هذا الملف موجود في `.gitignore` ولن يُرفع على GitHub

#### في بيئة الإنتاج (Production)

1. افتح `config.php`
2. غيّر `ENVIRONMENT` إلى `'production'`:
   ```php
   define('ENVIRONMENT', 'production');
   ```
3. البيانات ستُحفظ في `progress.json`
4. هذا الملف سيُرفع على السيرفر

### ملاحظات مهمة

- ✅ **`progress.local.json`** موجود في `.gitignore` - لن يُرفع على GitHub
- ✅ **`progress.json`** سيُرفع على GitHub (يحتوي على بيانات السيرفر)
- ⚠️ **لا تغير `ENVIRONMENT` في `dev/`** - اتركه `'local'` دائماً
- ⚠️ **غيّر `ENVIRONMENT` في `main/`** إلى `'production'` بعد استدعاء من GitHub

### عند الرفع على السيرفر

1. استدعي الكود في `main/` من GitHub
2. افتح `main/config.php`
3. غيّر `ENVIRONMENT` إلى `'production'`
4. ارفع الملفات على السيرفر
5. تأكد أن `progress.json` موجود على السيرفر (بيانات المستخدمين)

### الأمان

- بيانات اللوكال منفصلة تماماً عن بيانات السيرفر
- لن يتم رفع بيانات التطوير بالغلط على السيرفر
- كل بيئة لها ملفها الخاص


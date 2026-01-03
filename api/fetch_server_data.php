<?php
// Script to fetch progress.json from production server
// This file is READ-ONLY - it only fetches, never modifies server data

header('Content-Type: text/html; charset=utf-8');

// Configuration - UPDATE THIS with your server URL
$SERVER_URL = 'https://az-dev.com/family/bakara/api/get_progress.php';

$outputFile = __DIR__ . '/../progress.json';

echo "<!DOCTYPE html>\n";
echo "<html lang='ar' dir='rtl'>\n";
echo "<head><meta charset='UTF-8'><title>جلب بيانات السيرفر</title></head>\n";
echo "<body style='font-family: Arial; padding: 20px; direction: rtl;'>\n";
echo "<h2>جلب بيانات السيرفر</h2>\n";

try {
    // Fetch data from server
    $ch = curl_init($SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For testing only
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("خطأ في الاتصال: " . $error);
    }
    
    if ($httpCode !== 200) {
        echo "<p style='color: orange;'>تحذير: كود HTTP: $httpCode</p>\n";
        echo "<h3>الرد من السيرفر:</h3>\n";
        echo "<pre style='background: #fff3cd; padding: 15px; border-radius: 5px; overflow-x: auto; max-height: 300px;'>";
        echo htmlspecialchars(substr($response, 0, 2000));
        echo "</pre>\n";
        throw new Exception("خطأ HTTP: " . $httpCode);
    }
    
    // Show raw response for debugging
    if (empty($response)) {
        throw new Exception("الرد من السيرفر فارغ");
    }
    
    // Validate JSON
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "<h3>الرد الخام من السيرفر (أول 2000 حرف):</h3>\n";
        echo "<pre style='background: #fff3cd; padding: 15px; border-radius: 5px; overflow-x: auto; max-height: 300px;'>";
        echo htmlspecialchars(substr($response, 0, 2000));
        echo "</pre>\n";
        echo "<p style='color: orange;'>خطأ JSON: " . json_last_error_msg() . " (كود الخطأ: " . json_last_error() . ")</p>\n";
        throw new Exception("خطأ في تحليل JSON: " . json_last_error_msg());
    }
    
    // Save to local file (READ-ONLY copy)
    file_put_contents($outputFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    $count = is_array($data) ? count($data) : 0;
    
    echo "<p style='color: green; font-weight: bold;'>✓ تم جلب البيانات بنجاح!</p>\n";
    echo "<p>عدد السجلات: <strong>$count</strong></p>\n";
    echo "<p>تم الحفظ في: <code>progress.json</code></p>\n";
    echo "<p style='color: #666;'>ملاحظة: هذه البيانات ستُرفع على السيرفر عند الرفع التالي</p>\n";
    
    // Show preview
    if ($count > 0) {
        echo "<h3>معاينة البيانات:</h3>\n";
        echo "<pre style='background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;'>";
        echo htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "</pre>\n";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red; font-weight: bold;'>✗ خطأ: " . htmlspecialchars($e->getMessage()) . "</p>\n";
    echo "<p>تأكد من:</p>\n";
    echo "<ul>\n";
    echo "<li>عنوان السيرفر صحيح في ملف <code>fetch_server_data.php</code></li>\n";
    echo "<li>السيرفر متاح ويمكن الوصول إليه</li>\n";
    echo "<li>ملف <code>get_progress.php</code> موجود على السيرفر</li>\n";
    echo "</ul>\n";
}

echo "<hr>\n";
echo "<p><a href='../index.html' style='color: #667eea;'>← العودة للصفحة الرئيسية</a></p>\n";
echo "</body></html>\n";


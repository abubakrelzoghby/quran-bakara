<?php
// Simple viewer for server data (read-only)

header('Content-Type: text/html; charset=utf-8');

$serverFile = __DIR__ . '/progress.server.json';
$localFile = __DIR__ . '/progress.local.json';

echo "<!DOCTYPE html>\n";
echo "<html lang='ar' dir='rtl'>\n";
echo "<head><meta charset='UTF-8'><title>عرض البيانات</title>";
echo "<style>body{font-family:Arial;padding:20px;direction:rtl;} pre{background:#f5f5f5;padding:15px;border-radius:5px;overflow-x:auto;} .section{margin:20px 0;}</style></head>\n";
echo "<body>\n";
echo "<h2>عرض البيانات</h2>\n";

// Server data
echo "<div class='section'>";
echo "<h3>📥 بيانات السيرفر (progress.server.json) - للقراءة فقط</h3>\n";
if (file_exists($serverFile)) {
    $data = json_decode(file_get_contents($serverFile), true);
    $count = is_array($data) ? count($data) : 0;
    echo "<p><strong>عدد السجلات: $count</strong></p>\n";
    echo "<pre>" . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>\n";
} else {
    echo "<p style='color:orange;'>⚠️ الملف غير موجود - قم بجلب البيانات أولاً من <a href='fetch_server_data.php'>fetch_server_data.php</a></p>\n";
}
echo "</div>";

// Local data
echo "<div class='section'>";
echo "<h3>💻 بيانات اللوكال (progress.local.json) - للتطوير</h3>\n";
if (file_exists($localFile)) {
    $data = json_decode(file_get_contents($localFile), true);
    $count = is_array($data) ? count($data) : 0;
    echo "<p><strong>عدد السجلات: $count</strong></p>\n";
    echo "<pre>" . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>\n";
} else {
    echo "<p style='color:gray;'>الملف فارغ أو غير موجود</p>\n";
}
echo "</div>";

echo "<hr>\n";
echo "<p><a href='index.html'>← الصفحة الرئيسية</a> | <a href='fetch_server_data.php'>🔄 جلب بيانات السيرفر</a></p>\n";
echo "</body></html>\n";


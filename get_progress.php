<?php
// Return all saved progress
// Priority: progress.local.json (local dev) > progress.server.json (read-only from server)
// Local data takes precedence - so you can test without affecting server data

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

$data = [];

// First, load server data (read-only copy) as base
$serverFile = __DIR__ . '/progress.server.json';
if (file_exists($serverFile)) {
    $json = file_get_contents($serverFile);
    $decoded = json_decode($json, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}

// Then merge with local data (local overwrites server - for testing)
$localFile = PROGRESS_FILE;
if (file_exists($localFile)) {
    $json = file_get_contents($localFile);
    $decoded = json_decode($json, true);
    if (is_array($decoded)) {
        // Local data overwrites server data (so you can test locally)
        $data = array_merge($data, $decoded);
    }
}

echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);



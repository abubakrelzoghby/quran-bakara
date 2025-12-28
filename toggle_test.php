<?php
// Simple test endpoint to toggle a key in progress.json

header('Content-Type: application/json; charset=utf-8');

$file = __DIR__ . '/progress.json';

// Load current data
$data = [];
if (file_exists($file)) {
    $json = file_get_contents($file);
    $decoded = json_decode($json, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}

// Get key from query, default to "test_key"
$key = isset($_GET['key']) ? $_GET['key'] : 'test_key';

// Toggle value
$current = isset($data[$key]) ? (bool)$data[$key] : false;
$new = !$current;
$data[$key] = $new;

// Save back to file
file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'key' => $key,
    'value' => $new,
    'all' => $data,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);



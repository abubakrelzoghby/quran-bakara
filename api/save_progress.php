<?php
// Save single day progress into progress.json (real production data)

header('Content-Type: application/json; charset=utf-8');

// Save to real progress.json file (will be uploaded to server)
$file = __DIR__ . '/../progress.json';

// Read JSON body
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body'], JSON_UNESCAPED_UNICODE);
    exit;
}

$key = isset($input['key']) ? trim($input['key']) : '';
$completed = isset($input['completed']) ? (bool)$input['completed'] : false;

if ($key === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing key'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Load current data
$data = [];
if (file_exists($file)) {
    $json = file_get_contents($file);
    $decoded = json_decode($json, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}

// Update or remove key
if ($completed) {
    $data[$key] = true;
} else {
    unset($data[$key]);
}

// Save back to file
file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'ok' => true,
    'key' => $key,
    'completed' => $completed,
    'all' => $data,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);



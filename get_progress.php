<?php
// Return all saved progress from progress.json

header('Content-Type: application/json; charset=utf-8');

$file = __DIR__ . '/progress.json';

$data = [];
if (file_exists($file)) {
    $json = file_get_contents($file);
    $decoded = json_decode($json, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}

echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);



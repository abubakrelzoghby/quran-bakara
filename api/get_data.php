<?php
// Simple API to get schedule data with auto-generation of current week
// Security: Read-only for data, no user input processing

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/data.json';

// Load base data
if (!file_exists($dataFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Data file not found'], JSON_UNESCAPED_UNICODE);
    exit;
}

$json = file_get_contents($dataFile);
$data = json_decode($json, true);

if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid data file'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Calculate current week number
$startDate = new DateTime($data['config']['startDate']);
$today = new DateTime();
$diff = $today->diff($startDate);
$daysDiff = (int)$diff->format('%a');
$currentWeek = (int)floor($daysDiff / 7) + 1;

// Rotation pattern repeats every 3 weeks
// Week 1 = pattern[0], Week 2 = pattern[1], Week 3 = pattern[2]
// Week 4 = pattern[0] again, etc.
$rotationIndex = ($currentWeek - 1) % 3;
$rotationPattern = $data['rotationPattern'][$rotationIndex];

// Add current week rotation to data (for compatibility)
if (!isset($data['weeks'])) {
    $data['weeks'] = [];
}

// Ensure current week exists in weeks array
if (!isset($data['weeks'][$currentWeek])) {
    $data['weeks'][$currentWeek] = [
        'weekNumber' => $currentWeek,
        'rotation' => $rotationPattern
    ];
}

// Return data with current week info
$response = [
    'config' => $data['config'],
    'sections' => $data['sections'],
    'rotationPattern' => $data['rotationPattern'],
    'currentWeek' => $currentWeek,
    'currentWeekRotation' => $rotationPattern
];

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);


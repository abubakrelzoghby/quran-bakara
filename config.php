<?php
// Configuration file to separate local and production data
// Set to 'local' for development, 'production' for server

define('ENVIRONMENT', 'local'); // Change to 'production' on server

if (ENVIRONMENT === 'local') {
    define('PROGRESS_FILE', __DIR__ . '/progress.local.json');
} else {
    define('PROGRESS_FILE', __DIR__ . '/progress.json');
}


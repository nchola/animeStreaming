<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'], // Paths to apply CORS
    'allowed_methods' => ['*'], // Allowed HTTP methods
    'allowed_origins' => ['*'], // Allow all origins (or specify your frontend URL, e.g., ['http://localhost:3000'])
    'allowed_origins_patterns' => [], // Regex patterns for origins
    'allowed_headers' => ['*'], // Allowed headers
    'exposed_headers' => [], // Headers to expose
    'max_age' => 0, // Max age for preflight requests
    'supports_credentials' => false, // Allow credentials (cookies, authorization headers)
];

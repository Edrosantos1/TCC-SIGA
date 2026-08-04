<?php
header('Content-Type: application/json');

$configPath = __DIR__ . '/../includes/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
} else {
    echo json_encode(['error' => 'Configuração não encontrada']);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$reservasData = [
    [
        'id' => 1,
        'itemId' => 1,
        'title' => 'Introdução à Programação com Python',
        'author' => 'Eric Matthes',
        'year' => 2019,
        'type' => 'book',
        'cover' => null,
        'reservedAt' => '2026-07-28',
        'expiryDate' => '2026-08-04',
        'status' => 'pending',
        'available' => true,
    ],
    [
        'id' => 2,
        'itemId' => 4,
        'title' => 'O Pequeno Príncipe',
        'author' => 'Antoine de Saint-Exupéry',
        'year' => 1943,
        'type' => 'book',
        'cover' => null,
        'reservedAt' => '2026-07-30',
        'expiryDate' => '2026-08-06',
        'status' => 'ready',
        'available' => true,
    ],
    [
        'id' => 3,
        'itemId' => 11,
        'title' => 'National Geographic - Edição Brasil',
        'author' => 'National Geographic Society',
        'year' => 2024,
        'type' => 'magazine',
        'cover' => null,
        'reservedAt' => '2026-07-25',
        'expiryDate' => '2026-08-01',
        'status' => 'pending',
        'available' => true,
    ],
    [
        'id' => 4,
        'itemId' => 16,
        'title' => 'Sistema de Monitoramento de Estufa com IoT',
        'author' => 'Ana Paula Ferreira, Lucas Rodrigues, Thiago Mendes',
        'year' => 2024,
        'type' => 'tcc',
        'cover' => null,
        'reservedAt' => '2026-07-20',
        'expiryDate' => '2026-07-27',
        'status' => 'completed',
        'available' => true,
    ],
    [
        'id' => 5,
        'itemId' => 6,
        'title' => 'O Hobbit',
        'author' => 'J.R.R. Tolkien',
        'year' => 1937,
        'type' => 'book',
        'cover' => null,
        'reservedAt' => '2026-07-15',
        'expiryDate' => '2026-07-22',
        'status' => 'cancelled',
        'available' => true,
    ],
];

echo json_encode($reservasData);
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

$historicoData = [
    // Empréstimos
    [
        'id' => 1,
        'type' => 'loan',
        'itemId' => 2,
        'title' => 'Clean Code: A Handbook of Agile Software Craftsmanship',
        'author' => 'Robert C. Martin',
        'year' => 2008,
        'cover' => null,
        'date' => '2026-07-01',
        'status' => 'returned',
        'dueDate' => '2026-07-15',
        'returnedAt' => '2026-07-14',
    ],
    [
        'id' => 2,
        'type' => 'loan',
        'itemId' => 5,
        'title' => '1984',
        'author' => 'George Orwell',
        'year' => 1949,
        'cover' => null,
        'date' => '2026-06-20',
        'status' => 'overdue',
        'dueDate' => '2026-07-05',
        'returnedAt' => null,
    ],
    [
        'id' => 3,
        'type' => 'loan',
        'itemId' => 9,
        'title' => 'Sapiens: Uma Breve História da Humanidade',
        'author' => 'Yuval Noah Harari',
        'year' => 2011,
        'cover' => null,
        'date' => '2026-06-10',
        'status' => 'returned',
        'dueDate' => '2026-06-25',
        'returnedAt' => '2026-06-24',
    ],
    // Reservas
    [
        'id' => 6,
        'type' => 'reservation',
        'itemId' => 4,
        'title' => 'O Pequeno Príncipe',
        'author' => 'Antoine de Saint-Exupéry',
        'year' => 1943,
        'cover' => null,
        'date' => '2026-07-30',
        'status' => 'completed',
        'reservedAt' => '2026-07-30',
        'pickedUpAt' => '2026-07-31',
    ],
    [
        'id' => 7,
        'type' => 'reservation',
        'itemId' => 16,
        'title' => 'Sistema de Monitoramento de Estufa com IoT',
        'author' => 'Ana Paula Ferreira, Lucas Rodrigues, Thiago Mendes',
        'year' => 2024,
        'cover' => null,
        'date' => '2026-07-20',
        'status' => 'completed',
        'reservedAt' => '2026-07-20',
        'pickedUpAt' => '2026-07-21',
    ],
    [
        'id' => 8,
        'type' => 'reservation',
        'itemId' => 6,
        'title' => 'O Hobbit',
        'author' => 'J.R.R. Tolkien',
        'year' => 1937,
        'cover' => null,
        'date' => '2026-07-15',
        'status' => 'cancelled',
        'reservedAt' => '2026-07-15',
        'pickedUpAt' => null,
    ],
];

echo json_encode($historicoData);
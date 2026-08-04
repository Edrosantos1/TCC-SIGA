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

$notificationsData = [
    [
        'id' => 1,
        'type' => 'overdue',
        'params' => ['book' => 'Introdução à Programação com Python', 'days' => 3],
        'date' => date('Y-m-d H:i:s', strtotime('-2 days')),
        'read' => false,
    ],
    [
        'id' => 2,
        'type' => 'reminder',
        'params' => [],
        'date' => date('Y-m-d H:i:s', strtotime('-1 day')),
        'read' => false,
    ],
    [
        'id' => 3,
        'type' => 'newBook',
        'params' => ['book' => 'Clean Architecture'],
        'date' => date('Y-m-d H:i:s', strtotime('-5 days')),
        'read' => true,
    ],
    [
        'id' => 4,
        'type' => 'reservationReady',
        'params' => ['book' => 'O Pequeno Príncipe'],
        'date' => date('Y-m-d H:i:s', strtotime('-3 days')),
        'read' => false,
    ],
];

echo json_encode($notificationsData);
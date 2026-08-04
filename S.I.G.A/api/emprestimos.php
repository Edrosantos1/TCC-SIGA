<?php
header('Content-Type: application/json');

$configPath = __DIR__ . '/../includes/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
} else {
    echo json_encode(['error' => 'Configuração não encontrada']);
    exit;
}

// Verifica se a sessão já está ativa antes de iniciar
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// (Opcional) Verifica autenticação – descomente se quiser restringir
// if (!isset($_SESSION['usuario_id'])) {
//     http_response_code(401);
//     echo json_encode(['error' => 'Não autorizado']);
//     exit;
// }

$loansData = [
    [
        'id' => 1,
        'itemId' => 1,
        'title' => 'Introdução à Programação com Python',
        'author' => 'Eric Matthes',
        'type' => 'book',
        'cover' => null,
        'loanDate' => '2026-07-15',
        'dueDate' => '2026-08-14',
        'returnDate' => null,
        'status' => 'active',
        'renewed' => false,
    ],
    [
        'id' => 2,
        'itemId' => 2,
        'title' => 'Clean Code',
        'author' => 'Robert C. Martin',
        'type' => 'book',
        'cover' => null,
        'loanDate' => '2026-07-20',
        'dueDate' => '2026-08-19',
        'returnDate' => null,
        'status' => 'active',
        'renewed' => false,
    ],
    [
        'id' => 3,
        'itemId' => 3,
        'title' => 'Engenharia de Software Moderna',
        'author' => 'Marco Tulio Valente',
        'type' => 'book',
        'cover' => null,
        'loanDate' => '2026-06-10',
        'dueDate' => '2026-07-10',
        'returnDate' => null,
        'status' => 'overdue',
        'renewed' => false,
    ],
    [
        'id' => 4,
        'itemId' => 11,
        'title' => 'National Geographic - Edição Brasil',
        'author' => 'National Geographic Society',
        'type' => 'magazine',
        'cover' => null,
        'loanDate' => '2026-07-01',
        'dueDate' => '2026-07-15',
        'returnDate' => '2026-07-14',
        'status' => 'returned',
        'renewed' => false,
    ],
    [
        'id' => 5,
        'itemId' => 12,
        'title' => 'Veja - Edição 2023',
        'author' => 'Editora Abril',
        'type' => 'magazine',
        'cover' => null,
        'loanDate' => '2026-06-20',
        'dueDate' => '2026-07-20',
        'returnDate' => '2026-07-18',
        'status' => 'returned',
        'renewed' => false,
    ],
    [
        'id' => 6,
        'itemId' => 16,
        'title' => 'Sistema de Monitoramento de Estufa com IoT',
        'author' => 'Ana Paula Ferreira, Lucas Rodrigues, Thiago Mendes',
        'type' => 'tcc',
        'cover' => null,
        'loanDate' => '2026-07-25',
        'dueDate' => '2026-08-24',
        'returnDate' => null,
        'status' => 'active',
        'renewed' => false,
    ],
    [
        'id' => 7,
        'itemId' => 17,
        'title' => 'Aplicativo de Gestão Financeira para Jovens',
        'author' => 'Beatriz Santos, Felipe Lima',
        'type' => 'tcc',
        'cover' => null,
        'loanDate' => '2026-06-01',
        'dueDate' => '2026-07-01',
        'returnDate' => '2026-06-30',
        'status' => 'returned',
        'renewed' => false,
    ],
    [
        'id' => 8,
        'itemId' => 20,
        'title' => 'Rede Social para Troca de Livros',
        'author' => 'Gabriel Martins, Isabela Torres, Pedro Henrique Costa',
        'type' => 'tcc',
        'cover' => null,
        'loanDate' => '2026-05-15',
        'dueDate' => '2026-06-14',
        'returnDate' => '2026-06-10',
        'status' => 'returned',
        'renewed' => false,
    ],
];

echo json_encode($loansData);
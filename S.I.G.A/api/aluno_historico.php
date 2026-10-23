<?php
header('Content-Type: application/json');

$configPath = __DIR__ . '/../includes/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
} else {
    echo json_encode(['error' => 'Configuração não encontrada']);
    exit;
}

/** @var mysqli $conn */
if (session_status() === PHP_SESSION_NONE) session_start();
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$usuario_id = (int) $_SESSION['usuario_id'];
$historicoData = [];
$sql = "SELECT e.id_emprestimo AS id, 'loan' AS type, e.id_catalogo AS itemId,
               e.titulo_item AS title, COALESCE(c.autor, '') AS author,
               c.ano_publicacao AS year, c.capa_url AS cover,
               DATE(e.data_emprestimo) AS date,
               CASE
                   WHEN e.status = 'emprestado' AND e.data_devolucao_prevista < CURDATE() THEN 'atrasado'
                   ELSE e.status
               END AS status,
               e.data_devolucao_prevista AS dueDate, NULL AS returnedAt,
               NULL AS reservedAt, NULL AS pickedUpAt
        FROM emprestimos e LEFT JOIN catalogo c ON c.id_catalogo = e.id_catalogo
        WHERE e.id_aluno = ?
        UNION ALL
        SELECT r.id_reserva AS id, 'reservation' AS type, r.id_catalogo AS itemId,
               r.titulo_item AS title, COALESCE(c.autor, '') AS author,
               c.ano_publicacao AS year, c.capa_url AS cover,
               DATE(r.data_reserva) AS date, r.status, NULL AS dueDate,
               NULL AS returnedAt, r.data_reserva AS reservedAt, NULL AS pickedUpAt
        FROM reservas r LEFT JOIN catalogo c ON c.id_catalogo = r.id_catalogo
        WHERE r.id_aluno = ?
        ORDER BY date DESC";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao consultar histórico']);
    exit;
}
$stmt->bind_param('ii', $usuario_id, $usuario_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    if ($row['type'] === 'loan') {
        if ($row['status'] === 'devolvido') {
            $row['status'] = 'returned';
        } elseif ($row['status'] === 'atrasado') {
            $row['status'] = 'overdue';
        } elseif ($row['status'] === 'emprestado') {
            $row['status'] = 'active';
        } elseif ($row['status'] === 'retirado') {
            $row['status'] = 'active';
        } else {
            $row['status'] = 'pending';
        }
    } else {
        $row['status'] = $row['status'] === 'retirada' ? 'completed' : ($row['status'] === 'cancelada' ? 'cancelled' : $row['status']);
    }
    $row['cover'] = $row['cover'] ?: null;
    $historicoData[] = $row;
}
$stmt->close();
echo json_encode($historicoData);
/*
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

*/
<?php
header('Content-Type: application/json');

$configPath = __DIR__ . '/../includes/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
} else {
    echo json_encode(['error' => 'Configuração não encontrada']);
    exit;
}

if (session_status() === PHP_SESSION_NONE) session_start();
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$usuario_id = (int) $_SESSION['usuario_id'];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    if (($input['action'] ?? '') !== 'mark_all_read') {
        http_response_code(400);
        echo json_encode(['error' => 'Ação inválida']);
        exit;
    }
    $stmt = $conn->prepare('UPDATE notificacoes SET lida = 1 WHERE id_aluno = ?');
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    if (!str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
        header('Location: dashboard_aluno.php?mensagem=Notificacoes+marcadas+como+lidas');
        exit;
    }
    echo json_encode(['success' => true]);
    exit;
}

$stmt = $conn->prepare('SELECT id, titulo, mensagem, tipo, criado_em, lida FROM notificacoes WHERE id_aluno = ? ORDER BY criado_em DESC LIMIT 20');
$stmt->bind_param('i', $usuario_id);
$stmt->execute();
$result = $stmt->get_result();
$notificationsData = [];
while ($row = $result->fetch_assoc()) {
    $notificationsData[] = [
        'id' => (int) $row['id'],
        'titulo' => $row['titulo'],
        'mensagem' => $row['mensagem'],
        'tipo' => $row['tipo'],
        'criado_em' => $row['criado_em'],
        'lida' => (bool) $row['lida'],
    ];
}
echo json_encode($notificationsData);
/*
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

*/
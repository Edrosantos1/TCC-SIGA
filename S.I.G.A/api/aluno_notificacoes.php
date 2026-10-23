<?php
header('Content-Type: application/json');

$configPath = __DIR__ . '/../includes/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
} else {
    echo json_encode(['error' => 'Configuração não encontrada']);
    exit;
}

$conn = $GLOBALS['conn'] ?? null;
if (!($conn instanceof mysqli)) {
    http_response_code(500);
    echo json_encode(['error' => 'Conexão com o banco de dados indisponível']);
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
    $csrf = isset($input['csrf']) && is_string($input['csrf']) ? $input['csrf'] : null;
    if (!csrf_validar($csrf)) {
        http_response_code(403);
        echo json_encode(['error' => 'Token CSRF inválido. Recarregue a página e tente novamente.']);
        exit;
    }

    if (($input['action'] ?? '') !== 'mark_all_read') {
        http_response_code(400);
        echo json_encode(['error' => 'Ação inválida']);
        exit;
    }
    $stmt = $conn->prepare('UPDATE notificacoes SET lida = 1 WHERE id_aluno = ? AND (lida = 0 OR lida IS NULL)');
    if (!$stmt) {
        http_response_code(500);
        exit('Não foi possível atualizar as notificações.');
    }
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $stmt->close();
    if (!str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
        $paginasPermitidas = [
            'painel.php',
            'catalogo.php',
            'favoritos.php',
            'emprestimos.php',
            'reservas.php',
            'historico.php',
            'configuracoes.php',
        ];
        $pagina = $input['redirect'] ?? 'painel.php';
        $consulta = '';
        if (is_string($pagina) && strpos($pagina, '?') !== false) {
            [$pagina, $consulta] = explode('?', $pagina, 2);
            if (!preg_match('/^[A-Za-z0-9_\-.%=&\[\]+,:@~]*$/', $consulta)) {
                $consulta = '';
            }
        }
        if (!is_string($pagina) || !in_array($pagina, $paginasPermitidas, true)) {
            $pagina = 'painel.php';
            $consulta = '';
        }
        $diretorioRaiz = dirname(dirname(str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '')));
        $basePath = rtrim($diretorioRaiz, '/');
        header('Location: ' . $basePath . '/aluno/' . $pagina . ($consulta !== '' ? '?' . $consulta : ''), true, 303);
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
        'params' => ['book' => 'Introdução Ã  Programação com Python', 'days' => 3],
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

<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['admin_id'])) {
    echo json_encode([]);
    exit;
}

$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    echo json_encode(['error' => 'Sem conexão']);
    exit;
}

$termo = isset($_GET['q']) ? trim($_GET['q']) : '';
if (strlen($termo) < 1) {
    echo json_encode([]);
    exit;
}

// BUSCA POR PREFIXO (starts with)
$termo_like = $termo . '%';

try {
    $sql = "SELECT id_aluno AS id, nome_aluno AS nome, 'aluno' AS tipo
            FROM login_aluno
            WHERE nome_aluno LIKE ?
            ORDER BY nome_aluno ASC
            LIMIT 10";

    if ($db instanceof mysqli) {
        $stmt = $db->prepare($sql);
        $stmt->bind_param('s', $termo_like);
        $stmt->execute();
        $result = $stmt->get_result();
        $dados = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
    } elseif ($db instanceof PDO) {
        $stmt = $db->prepare($sql);
        $stmt->execute([$termo_like]);
        $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $dados = [];
    }

    echo json_encode($dados);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
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

// ========== RECEBER PARÂMETROS ==========
$periodo = isset($_GET['periodo']) ? $_GET['periodo'] : 'semana';
$ordenacao = isset($_GET['ordenacao']) ? $_GET['ordenacao'] : 'mais_recente';

// ========== CONSTRUIR FILTRO DE PERÍODO ==========
$filtro_data = '';

switch ($periodo) {
    case 'hoje':
        $filtro_data = "AND DATE(n.criado_em) = CURDATE()";
        break;
    case 'semana':
        $filtro_data = "AND n.criado_em >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        break;
    case 'mes':
        $filtro_data = "AND n.criado_em >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
        break;
    case 'todo':
    default:
        $filtro_data = "";
        break;
}

// ========== CONSTRUIR ORDENAÇÃO ==========
$order_by = ($ordenacao === 'mais_antigo') ? 'ASC' : 'DESC';

try {
    // 🔥 AGRUPAR POR id_envio (NÃO POR id)
    $sql = "
        SELECT 
            n.id_envio,
            n.titulo,
            n.mensagem,
            n.tipo,
            MAX(n.criado_em) AS criado_em,
            COUNT(DISTINCT n.id_aluno) AS total_alunos,
            GROUP_CONCAT(DISTINCT l.nome_aluno SEPARATOR ', ') AS alunos_nomes
        FROM notificacoes n
        INNER JOIN login_aluno l ON n.id_aluno = l.id_aluno
        WHERE n.id_envio IS NOT NULL AND 1=1 {$filtro_data}
        GROUP BY n.id_envio
        ORDER BY criado_em {$order_by}
        LIMIT 100
    ";

    if ($db instanceof mysqli) {
        $result = $db->query($sql);
        $notificacoes = $result->fetch_all(MYSQLI_ASSOC);
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($sql);
        $notificacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $notificacoes = [];
    }

    // ========== PROCESSAR RESULTADOS ==========
    foreach ($notificacoes as &$notif) {
        // Se tiver mais de 5 alunos, mostrar "Todos os alunos"
        if ($notif['total_alunos'] > 5) {
            $notif['alunos_nomes'] = 'Todos os alunos';
        }
        // Adicionar um id fake para o front-end
        $notif['id'] = $notif['id_envio'];
    }

    echo json_encode($notificacoes);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
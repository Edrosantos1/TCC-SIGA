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

// Busca por prefixo
$termo_like = $termo . '%';

try {
    $sql = "SELECT id_aluno AS id, nome_aluno AS nome, serie_aluno
            FROM login_aluno
            WHERE nome_aluno LIKE ?
            ORDER BY nome_aluno ASC
            LIMIT 10";

    if ($db instanceof mysqli) {
        $stmt = $db->prepare($sql);
        $stmt->bind_param('s', $termo_like);
        $stmt->execute();
        $result = $stmt->get_result();
        $alunos = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // Para cada aluno, verificar se tem reservas e empréstimos
        foreach ($alunos as &$aluno) {
            $id = $aluno['id'];
            
            // Verificar reservas
            $reservas_sql = "SELECT COUNT(*) as total FROM reservas WHERE id_aluno = ? AND status IN ('pendente', 'aprovada')";
            $reservas_stmt = $db->prepare($reservas_sql);
            $reservas_stmt->bind_param('i', $id);
            $reservas_stmt->execute();
            $reservas_result = $reservas_stmt->get_result();
            $reservas_count = $reservas_result->fetch_assoc()['total'];
            $reservas_stmt->close();
            $aluno['tem_reservas'] = $reservas_count > 0;
            
            // Verificar empréstimos
            $emprestimos_sql = "SELECT COUNT(*) as total FROM emprestimos WHERE id_aluno = ? AND status IN ('emprestado', 'atrasado')";
            $emprestimos_stmt = $db->prepare($emprestimos_sql);
            $emprestimos_stmt->bind_param('i', $id);
            $emprestimos_stmt->execute();
            $emprestimos_result = $emprestimos_stmt->get_result();
            $emprestimos_count = $emprestimos_result->fetch_assoc()['total'];
            $emprestimos_stmt->close();
            $aluno['tem_emprestimos'] = $emprestimos_count > 0;
        }
        
    } elseif ($db instanceof PDO) {
        $stmt = $db->prepare($sql);
        $stmt->execute([$termo_like]);
        $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($alunos as &$aluno) {
            $id = $aluno['id'];
            
            $reservas_stmt = $db->prepare("SELECT COUNT(*) as total FROM reservas WHERE id_aluno = ? AND status IN ('pendente', 'aprovada')");
            $reservas_stmt->execute([$id]);
            $aluno['tem_reservas'] = $reservas_stmt->fetchColumn() > 0;
            
            $emprestimos_stmt = $db->prepare("SELECT COUNT(*) as total FROM emprestimos WHERE id_aluno = ? AND status IN ('emprestado', 'atrasado')");
            $emprestimos_stmt->execute([$id]);
            $aluno['tem_emprestimos'] = $emprestimos_stmt->fetchColumn() > 0;
        }
    } else {
        $alunos = [];
    }

    echo json_encode($alunos);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
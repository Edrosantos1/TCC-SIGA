<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/reservas_funcoes.php';

// Verifica se o admin está logado
if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

siga_expirar_reservas($conexao);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_validar()) {
    $_SESSION['msg_erro'] = 'Sessão expirada ou token de segurança inválido. Recarregue a página e tente novamente.';
    header('Location: reservas_adm.php');
    exit;
}

// Identifica a conexão
$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    $_SESSION['msg_erro'] = 'Erro de conexão com o banco de dados.';
    header('Location: reservas_adm.php');
    exit;
}

if (!isset($_POST['id']) || !is_numeric($_POST['id'])) {
    $_SESSION['msg_erro'] = 'Requisição inválida.';
    header('Location: reservas_adm.php');
    exit;
}

$id = intval($_POST['id']);

try {
    if ($db instanceof mysqli) {
        $db->begin_transaction();

        // Busca a reserva (precisa estar aprovada)
        $stmt = $db->prepare("SELECT id_aluno, id_catalogo, titulo_item FROM reservas WHERE id_reserva = ? AND status = 'aprovada' FOR UPDATE");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $reserva = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$reserva) {
            $db->rollback();
            $_SESSION['msg_erro'] = 'Reserva não encontrada, não está aprovada ou o prazo de retirada expirou.';
            header('Location: reservas_adm.php');
            exit;
        }

        // Cria o empréstimo (data_devolucao_prevista é calculada automaticamente pelo trigger)
        $stmtEmp = $db->prepare("INSERT INTO emprestimos (id_aluno, id_catalogo, titulo_item, data_emprestimo, status) VALUES (?, ?, ?, NOW(), 'emprestado')");
        $stmtEmp->bind_param('iis', $reserva['id_aluno'], $reserva['id_catalogo'], $reserva['titulo_item']);
        $stmtEmp->execute();
        $stmtEmp->close();

        // Marca a reserva como retirada
        $stmtUp = $db->prepare("UPDATE reservas SET status = 'retirada' WHERE id_reserva = ? AND status = 'aprovada'");
        $stmtUp->bind_param('i', $id);
        $stmtUp->execute();
        $afetadas = $stmtUp->affected_rows;
        $stmtUp->close();

        if ($afetadas > 0) {
            $db->commit();
            $_SESSION['msg_sucesso'] = 'Retirada confirmada! Empréstimo registrado com sucesso.';
        } else {
            $db->rollback();
            $_SESSION['msg_erro'] = 'Não foi possível confirmar a retirada. Tente novamente.';
        }
    } elseif ($db instanceof PDO) {
        $db->beginTransaction();

        $stmt = $db->prepare("SELECT id_aluno, id_catalogo, titulo_item FROM reservas WHERE id_reserva = ? AND status = 'aprovada' FOR UPDATE");
        $stmt->execute([$id]);
        $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reserva) {
            $db->rollBack();
            $_SESSION['msg_erro'] = 'Reserva não encontrada, não está aprovada ou o prazo de retirada expirou.';
            header('Location: reservas_adm.php');
            exit;
        }

        $stmtEmp = $db->prepare("INSERT INTO emprestimos (id_aluno, id_catalogo, titulo_item, data_emprestimo, status) VALUES (?, ?, ?, NOW(), 'emprestado')");
        $stmtEmp->execute([$reserva['id_aluno'], $reserva['id_catalogo'], $reserva['titulo_item']]);

        $stmtUp = $db->prepare("UPDATE reservas SET status = 'retirada' WHERE id_reserva = ? AND status = 'aprovada'");
        $stmtUp->execute([$id]);
        $afetadas = $stmtUp->rowCount();

        if ($afetadas > 0) {
            $db->commit();
            $_SESSION['msg_sucesso'] = 'Retirada confirmada! Empréstimo registrado com sucesso.';
        } else {
            $db->rollBack();
            $_SESSION['msg_erro'] = 'Não foi possível confirmar a retirada. Tente novamente.';
        }
    } else {
        throw new Exception('Conexão não suportada.');
    }
} catch (Exception $e) {
    if ($db instanceof mysqli) $db->rollback();
    elseif ($db instanceof PDO) $db->rollBack();
    $_SESSION['msg_erro'] = 'Erro ao confirmar retirada: ' . $e->getMessage();
}

header('Location: reservas_adm.php');
exit;
<?php
session_start();
require_once __DIR__ . '/../includes/config.php';

// Verifica se o admin está logado
if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
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

/// ============================================================
// 1. AÇÃO INDIVIDUAL (via id + acao OU id + status)
// ============================================================
if (isset($_POST['id']) && is_numeric($_POST['id'])) {
    $id = intval($_POST['id']);
    $status = null;

    // Verifica se veio 'status' (direto) ou 'acao' (mapeando para status)
    if (isset($_POST['status']) && in_array($_POST['status'], ['aprovada', 'rejeitada'])) {
        $status = $_POST['status'];
    } elseif (isset($_POST['acao']) && in_array($_POST['acao'], ['aprovar', 'rejeitar'])) {
        $status = ($_POST['acao'] === 'aprovar') ? 'aprovada' : 'rejeitada';
    }

    if (!$status) {
        $_SESSION['msg_erro'] = 'Status inválido.';
        header('Location: reservas_adm.php');
        exit;
    }

    try {
        if ($db instanceof mysqli) {
            $stmt = $db->prepare("UPDATE reservas SET status = ? WHERE id_reserva = ? AND status = 'pendente'");
            $stmt->bind_param('si', $status, $id);
            $stmt->execute();
            $afetadas = $stmt->affected_rows;
            $stmt->close();
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare("UPDATE reservas SET status = ? WHERE id_reserva = ? AND status = 'pendente'");
            $stmt->execute([$status, $id]);
            $afetadas = $stmt->rowCount();
        } else {
            throw new Exception('Conexão não suportada.');
        }

        if ($afetadas > 0) {
            $_SESSION['msg_sucesso'] = "Reserva $status com sucesso!";
        } else {
            $_SESSION['msg_erro'] = 'Reserva não encontrada ou já foi processada.';
        }
    } catch (Exception $e) {
        $_SESSION['msg_erro'] = 'Erro ao atualizar: ' . $e->getMessage();
    }

    header('Location: reservas_adm.php');
    exit;
}

// ============================================================
// 2. AÇÃO MÚLTIPLA (via ids[] + acao)
// ============================================================
if (isset($_POST['acao']) && in_array($_POST['acao'], ['aprovar', 'rejeitar']) && isset($_POST['ids']) && is_array($_POST['ids'])) {
    $acao = $_POST['acao'];
    $status = ($acao === 'aprovar') ? 'aprovada' : 'rejeitada';
    $ids = array_map('intval', $_POST['ids']);
    $ids = array_filter($ids);

    if (empty($ids)) {
        $_SESSION['msg_erro'] = 'Nenhum ID válido foi enviado.';
        header('Location: reservas_adm.php');
        exit;
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    try {
        $sql = "UPDATE reservas SET status = ? WHERE id_reserva IN ($placeholders) AND status = 'pendente'";
        if ($db instanceof mysqli) {
            $stmt = $db->prepare($sql);
            $types = 's' . str_repeat('i', count($ids));
            $params = array_merge([$status], $ids);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $afetadas = $stmt->affected_rows;
            $stmt->close();
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare($sql);
            $params = array_merge([$status], $ids);
            $stmt->execute($params);
            $afetadas = $stmt->rowCount();
        } else {
            throw new Exception('Conexão não suportada.');
        }

        if ($afetadas > 0) {
            $_SESSION['msg_sucesso'] = "$afetadas reserva" . ($afetadas > 1 ? 's' : '') . " $status com sucesso!";
        } else {
            $_SESSION['msg_erro'] = 'Nenhuma reserva pendente foi atualizada. Verifique se já foram processadas.';
        }
    } catch (Exception $e) {
        $_SESSION['msg_erro'] = 'Erro ao atualizar: ' . $e->getMessage();
    }

    header('Location: reservas_adm.php');
    exit;
}

// ============================================================
// 3. NENHUMA AÇÃO VÁLIDA
// ============================================================
$_SESSION['msg_erro'] = 'Requisição inválida.';
header('Location: reservas_adm.php');
exit;
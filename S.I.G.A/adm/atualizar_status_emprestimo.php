<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    $_SESSION['msg_erro'] = 'Erro de conexão com o banco de dados.';
    header('Location: pendencias_adm.php');
    exit;
}

// ========== RECEBER DADOS DO POST ==========
$id_emprestimo = isset($_POST['id']) ? intval($_POST['id']) : 0;
$novo_status = isset($_POST['status']) ? trim($_POST['status']) : '';

if ($id_emprestimo <= 0) {
    $_SESSION['msg_erro'] = 'ID do empréstimo inválido.';
    header('Location: pendencias_adm.php');
    exit;
}

if (!in_array($novo_status, ['devolvido', 'emprestado', 'atrasado'])) {
    $_SESSION['msg_erro'] = 'Status inválido.';
    header('Location: pendencias_adm.php');
    exit;
}

// ========== ATUALIZAR ==========
$stmt = $db->prepare("UPDATE emprestimos SET status = ? WHERE id_emprestimo = ?");
if (!$stmt) {
    $_SESSION['msg_erro'] = 'Erro na preparação da consulta.';
    header('Location: pendencias_adm.php');
    exit;
}

$stmt->bind_param("si", $novo_status, $id_emprestimo);

if ($stmt->execute()) {
    $affected = $stmt->affected_rows;
    if ($affected > 0) {
        $_SESSION['msg_sucesso'] = 'Empréstimo devolvido com sucesso!';
    } else {
        $_SESSION['msg_erro'] = 'Nenhuma alteração foi feita. Verifique se o empréstimo existe.';
    }
} else {
    $_SESSION['msg_erro'] = 'Erro ao atualizar: ' . $stmt->error;
}

$stmt->close();

header('Location: pendencias_adm.php');
exit;
?>
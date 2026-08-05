<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

if (!$db) {
    $_SESSION['msg_erro'] = 'Erro de conexão com o banco de dados.';
    header('Location: reservas_adm.php');
    exit;
}

// ========== RECEBER DADOS DO POST ==========
$id_reserva = isset($_POST['id']) ? intval($_POST['id']) : 0;
$novo_status = isset($_POST['status']) ? trim($_POST['status']) : '';

if ($id_reserva <= 0) {
    $_SESSION['msg_erro'] = 'ID da reserva inválido.';
    header('Location: reservas_adm.php');
    exit;
}

if (!in_array($novo_status, ['aprovada', 'rejeitada'])) {
    $_SESSION['msg_erro'] = 'Status inválido.';
    header('Location: reservas_adm.php');
    exit;
}

$stmt = $db->prepare("UPDATE reservas SET status = ? WHERE id_reserva = ?");
if (!$stmt) {
    $_SESSION['msg_erro'] = 'Erro na preparação da consulta.';
    header('Location: reservas_adm.php');
    exit;
}

$stmt->bind_param("si", $novo_status, $id_reserva);

if ($stmt->execute()) {
    if ($novo_status === 'aprovada') {
        $_SESSION['msg_sucesso'] = 'Reserva aprovada com sucesso!';
    } else {
        $_SESSION['msg_sucesso'] = 'Reserva rejeitada com sucesso.';
    }
} else {
    $_SESSION['msg_erro'] = 'Erro ao atualizar: ' . $stmt->error;
}

$stmt->close();
header('Location: reservas_adm.php');
exit;
?>
<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

header('Content-Type: application/json');

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Sessão expirada ou não autorizado.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
error_log("📥 Recebido: " . print_r($input, true)); // LOG NO SERVIDOR

$id_reserva = isset($input['id']) ? intval($input['id']) : 0;
$novo_status = isset($input['status']) ? $input['status'] : '';

// ACEITA APENAS 'aprovada' ou 'rejeitada'
if ($id_reserva <= 0 || !in_array($novo_status, ['aprovada', 'rejeitada'])) {
    error_log("❌ Status inválido: " . $novo_status);
    echo json_encode(['success' => false, 'message' => 'Parâmetros inválidos. Status: ' . $novo_status]);
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
    echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco.']);
    exit;
}

$stmt = $db->prepare("UPDATE reservas SET status = ? WHERE id_reserva = ?");
if ($stmt) {
    $stmt->bind_param("si", $novo_status, $id_reserva);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar no banco.']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Erro na preparação da consulta.']);
}
?>
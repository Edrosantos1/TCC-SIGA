<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

header('Content-Type: application/json');

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Sessão expirada.']);
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
    echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco de dados.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$id_emprestimo = isset($data['id']) ? intval($data['id']) : 0;
$novo_status = isset($data['status']) ? trim($data['status']) : '';

if ($id_emprestimo <= 0 || !in_array($novo_status, ['devolvido', 'emprestado', 'atrasado'])) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
    exit;
}

// Atualiza o status do empréstimo no MySQL
$stmt = $db->prepare("UPDATE emprestimos SET status = ? WHERE id_emprestimo = ?");
if ($stmt) {
    $stmt->bind_param("si", $novo_status, $id_emprestimo);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Status atualizado com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar no banco de dados.']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Erro na preparação da consulta.']);
}
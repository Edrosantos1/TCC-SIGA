<?php
// ========== DEBUG (REMOVA DEPOIS) ==========
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ========== INICIAR SESSÃO E VERIFICAR LOGIN ==========
session_start();

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

// ========== INCLUIR CONFIGURAÇÃO ==========
require_once __DIR__ . '/../includes/config.php';

// ========== IDENTIFICAR CONEXÃO ==========
$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

// ========== VERIFICAR CONEXÃO ==========
if (!$db) {
    $_SESSION['msg_erro'] = 'Erro de conexão com o banco de dados.';
    header('Location: reservas_adm.php');
    exit;
}

// ========== RECEBER DADOS DO POST ==========
$id_aluno = isset($_POST['id_aluno']) ? intval($_POST['id_aluno']) : 0;
$material = isset($_POST['material']) ? trim($_POST['material']) : '';
$data_limite = isset($_POST['data_limite']) ? trim($_POST['data_limite']) : '';
$tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : 'Livro';

// ========== VALIDAÇÕES ==========
if ($id_aluno <= 0) {
    $_SESSION['msg_erro'] = 'Selecione um aluno válido.';
    header('Location: reservas_adm.php');
    exit;
}

if (empty($material)) {
    $_SESSION['msg_erro'] = 'Informe o material a ser reservado.';
    header('Location: reservas_adm.php');
    exit;
}

if (empty($data_limite)) {
    $_SESSION['msg_erro'] = 'Selecione uma data limite.';
    header('Location: reservas_adm.php');
    exit;
}

// ========== VALIDAR DATA ==========
$data_limite_obj = DateTime::createFromFormat('Y-m-d', $data_limite);
$hoje = new DateTime();
$hoje->setTime(0, 0, 0);

if (!$data_limite_obj || $data_limite_obj < $hoje) {
    $_SESSION['msg_erro'] = 'A data limite deve ser hoje ou no futuro.';
    header('Location: reservas_adm.php');
    exit;
}

// ========== VERIFICAR SE O ALUNO EXISTE ==========
$check_query = "SELECT id_aluno FROM login_aluno WHERE id_aluno = ?";
$check_stmt = $db->prepare($check_query);

if (!$check_stmt) {
    $_SESSION['msg_erro'] = 'Erro ao verificar aluno.';
    header('Location: reservas_adm.php');
    exit;
}

$check_stmt->bind_param("i", $id_aluno);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    $_SESSION['msg_erro'] = 'Aluno não encontrado.';
    $check_stmt->close();
    header('Location: reservas_adm.php');
    exit;
}
$check_stmt->close();

// ========== VERIFICAR SE A COLUNA tipo_item EXISTE ==========
$coluna_tipo = false;
$tipo_check = $db->query("SHOW COLUMNS FROM reservas LIKE 'tipo_item'");
if ($tipo_check && $tipo_check->num_rows > 0) {
    $coluna_tipo = true;
}

// ========== INSERIR RESERVA ==========
if ($coluna_tipo) {
    // Com a coluna tipo_item
    $query = "INSERT INTO reservas (id_aluno, titulo_item, tipo_item, data_reserva, data_limite, status) 
              VALUES (?, ?, ?, NOW(), ?, 'aprovada')";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        $_SESSION['msg_erro'] = 'Erro na preparação da consulta: ' . $db->error;
        header('Location: reservas_adm.php');
        exit;
    }
    
    $stmt->bind_param("isss", $id_aluno, $material, $tipo, $data_limite);
    
} else {
    // Sem a coluna tipo_item
    $query = "INSERT INTO reservas (id_aluno, titulo_item, data_reserva, data_limite, status) 
              VALUES (?, ?, NOW(), ?, 'aprovada')";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        $_SESSION['msg_erro'] = 'Erro na preparação da consulta: ' . $db->error;
        header('Location: reservas_adm.php');
        exit;
    }
    
    $stmt->bind_param("iss", $id_aluno, $material, $data_limite);
}

// ========== EXECUTAR ==========
if ($stmt->execute()) {
    $_SESSION['msg_sucesso'] = 'Reserva criada e aprovada com sucesso!';
} else {
    $_SESSION['msg_erro'] = 'Erro ao criar reserva: ' . $stmt->error;
}

$stmt->close();

// ========== REDIRECIONAR ==========
header('Location: reservas_adm.php');
exit;
?>
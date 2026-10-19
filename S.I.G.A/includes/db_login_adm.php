<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_validar()) {
    $_SESSION['flash_admin_login_error'] = 'Sessão expirada. Recarregue a página e tente novamente.';
    header('Location: ../adm/login_adm.php');
    exit;
}

$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

function redirecionarLoginAdminComErro(string $mensagem): void
{
    $_SESSION['flash_admin_login_error'] = $mensagem;
    header('Location: ../adm/login_adm.php');
    exit;
}

if ($email === '' || $senha === '') {
    redirecionarLoginAdminComErro('Preencha e-mail e senha.');
}

$stmt = $conexao->prepare("SELECT id_adm, email_adm, senha_adm, nome_adm FROM login_admin WHERE email_adm = ?");
if (!$stmt) {
    error_log('Falha ao preparar a consulta de login administrativo: ' . $conexao->error);
    redirecionarLoginAdminComErro('Não foi possível entrar. Tente novamente mais tarde.');
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$stmt->close();

// VERIFICAR SENHA
if ($admin && password_verify($senha, $admin['senha_adm'])) {
    session_regenerate_id(true);
    $_SESSION['id_adm'] = $admin['id_adm'];
    $_SESSION['admin_id'] = $admin['id_adm'];
    $_SESSION['email_adm'] = $admin['email_adm'];
    $_SESSION['admin_nome'] = $admin['nome_adm'] ?? 'Administrador';
    header('Location: ../adm/dashboard_adm.php');
    exit;
} else {
    redirecionarLoginAdminComErro('E-mail ou senha inválidos.');
}


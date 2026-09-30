<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexao.php';

$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

// ATENÇÃO: Como este arquivo está na pasta 'includes', 
// usamos '../adm/' para ele voltar para a pasta onde estão as telas visuais.

if ($email === '' || $senha === '') {
    // Retorna para a tela de login na pasta adm
    header('Location: ../adm/login_adm.php?erro=Preencha e-mail e senha');
    exit;
}

// BUSCAR ADMIN (incluindo nome_adm)
$stmt = $conexao->prepare("SELECT id_adm, email_adm, senha_adm, nome_adm FROM login_admin WHERE email_adm = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$stmt->close();

// VERIFICAR SENHA
if ($admin && password_verify($senha, $admin['senha_adm'])) {
    
    $_SESSION['id_adm'] = $admin['id_adm'];
    $_SESSION['admin_id'] = $admin['id_adm']; // Variável extra para evitar bugs
    $_SESSION['email_adm'] = $admin['email_adm'];
    $_SESSION['admin_nome'] = $admin['nome_adm'] ?? 'Administrador';
    
    // LOGIN COM SUCESSO: Redireciona para o dashboard na pasta adm
    header('Location: ../adm/dashboard_adm.php');
    exit;
    
} else {
    
    // SENHA ERRADA: Retorna para a tela de login na pasta adm
    header('Location: ../adm/login_adm.php?erro=E-mail ou senha inválidos');
    exit;
    
}
?>
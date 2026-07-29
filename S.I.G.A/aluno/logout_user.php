<?php
require_once __DIR__ . '/../includes/config.php'; 

// Remove token do banco de dados (se estiver logado)
if (isset($_SESSION['usuario_id'])) {
    require_once __DIR__ . '/../includes/conexao.php';
    $id = $_SESSION['usuario_id'];
    mysqli_query($conexao, "UPDATE login_aluno SET relembrar_token=NULL, token_expiracao=NULL WHERE id_aluno=$id");
}

// Destroi a sessão
$_SESSION = array();
session_destroy();

// Limpa os cookies
setcookie('relembrar_token', '', time() - 3600, '/');
setcookie('user_id', '', time() - 3600, '/');

// Redireciona para o login
header('Location: login_user.php');
exit;
?>
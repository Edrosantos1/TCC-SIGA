<?php
// aluno_redirect.php
require_once __DIR__ . '/verificar_login.php'; // tenta recriar sessão via cookie

if (isset($_SESSION['usuario_id'])) {
    header('Location: dashboard_aluno.php');
} else {
    header('Location: login_user.php');
}
exit;
?>
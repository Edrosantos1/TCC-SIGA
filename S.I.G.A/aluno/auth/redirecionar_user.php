<?php
// redirecionar_user.php
require_once __DIR__ . '/verificar_login_user.php'; // tenta recriar sessão via cookie

if (isset($_SESSION['usuario_id'])) {
    if (empty($_SESSION['usuario_serie'])) {
        header('Location: login_user.php?status=serie_necessaria&novo=0');
    } else {
        header('Location: ../painel_user.php');
    }
} else {
    header('Location: login_user.php');
}
exit;
?>



<?php
// aluno_redirecionar.php
require_once __DIR__ . '/verificar_login.php'; // tenta recriar sessão via cookie

if (isset($_SESSION['usuario_id'])) {
    if (empty($_SESSION['usuario_serie'])) {
        header('Location: login.php?status=serie_necessaria&novo=0');
    } else {
        header('Location: ../painel.php');
    }
} else {
    header('Location: login.php');
}
exit;
?>



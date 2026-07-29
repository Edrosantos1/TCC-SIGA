<?php
// verificar_login_adm.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verifica qualquer uma das possíveis variáveis de sessão
if (!isset($_SESSION['id_adm']) && !isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php?erro=Faça login para acessar');
    exit;
}

// Garantir compatibilidade
if (isset($_SESSION['id_adm']) && !isset($_SESSION['admin_id'])) {
    $_SESSION['admin_id'] = $_SESSION['id_adm'];
}
?>
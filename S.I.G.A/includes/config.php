<?php

// 🔐 Força configurações de sessão SEGURAS
ini_set('session.cookie_lifetime', 0);           // ⏰ Expira quando fecha o navegador
ini_set('session.gc_maxlifetime', 1800);         // 30 minutos de inatividade
ini_set('session.use_only_cookies', 1);          // Apenas cookies, sem URL params
ini_set('session.use_strict_mode', 1);           // Rejeita sessões inválidas
ini_set('session.cookie_samesite', 'Lax');       // CSRF protection

// Configura o cookie de sessão
// (0 = expira ao fechar, '/' = disponível em todo site, false = não via HTTPS, true = não acessível por JS)
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

// Inicia a sessão APENAS se não estiver ativa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ⏰ Validar e destruir sessão temporária expirada
if (isset($_SESSION['login_temporario']) && isset($_SESSION['tempo_expiracao_temporario'])) {
    if (time() > $_SESSION['tempo_expiracao_temporario']) {
        // Sessão temporária expirou - destruir completamente
        $_SESSION = array();
        session_destroy();
        session_start();
    }
}

require_once __DIR__ . '/conexao.php';
$conn = $conexao;
?>
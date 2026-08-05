<?php
// =============================================
// verificar_login_adm.php
// =============================================

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar login
if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

// ========== CARREGAR CONFIGURAÇÕES ==========
$config_classes = '';

// 🔥 CAMINHO CORRETO
$caminho_config = __DIR__ . '/../includes/aplicar_configuracoes.php';

if (file_exists($caminho_config)) {
    require_once $caminho_config;
    if (function_exists('aplicarConfiguracoes')) {
        $config_classes = aplicarConfiguracoes();
    }
}

// Garantir que seja string
if (!is_string($config_classes)) {
    $config_classes = '';
}

// Disponibilizar globalmente
$GLOBALS['config_classes'] = $config_classes;

// 🔥 DEBUG - Verificar se está funcionando
// echo '<!-- CONFIG CLASSES: ' . $config_classes . ' -->';
?>
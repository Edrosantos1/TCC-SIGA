<?php
// 1. Segurança Básica (Impede roubo de sessão por JavaScript)
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');

// 2. Inicia a sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 3. Controle de Inatividade (1 hora = 3600 segundos)
$tempo_limite = 3600;

// Verifica se tem alguém logado (Aluno ou Admin)
if (isset($_SESSION['usuario_id']) || isset($_SESSION['id_adm'])) {
    
    // Se ficou inativo por mais de 1 hora, destrói a sessão
    if (isset($_SESSION['ultima_atividade']) && (time() - $_SESSION['ultima_atividade'] > $tempo_limite)) {
        session_unset();
        session_destroy();
        
        // Manda de volta para o login 
        // (Ajuste o caminho '../aluno/login_user.php' se precisar ir para o admin)
        header("Location: ../aluno/login_user.php?error=" . urlencode("Sua sessão expirou por inatividade."));
        exit;
    }

    // Atualiza a hora do último clique
    $_SESSION['ultima_atividade'] = time();
}

// 4. Conecta com o Banco de Dados
require_once __DIR__ . '/conexao.php';
$conn = $conexao;
?>
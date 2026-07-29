<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexao.php';

/**
 * Função auxiliar para validar email
 */
function isValidEmail($email) {
    $emailRegex = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
    return preg_match($emailRegex, $email) === 1;
}

/**
 * Função auxiliar para redirecionar com erro personalizado
 */
function redirectWithError($message, $type = 'login') {
    $errorParam = urlencode($message);
    $typeParam = ($type === 'register') ? 'register' : 'login';
    header("Location: login_user.php?error={$errorParam}&type={$typeParam}");
    exit;
}

// ============================================
// CAPTURAR DADOS DO FORMULÁRIO
// ============================================

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$senha = isset($_POST['senha']) ? $_POST['senha'] : '';

// ============================================
// VALIDAÇÕES - Email
// ============================================

if ($email === '') {
    redirectWithError('Por favor, preencha seu email.', 'login');
}

if (!isValidEmail($email)) {
    redirectWithError('Por favor, insira um email válido (ex: seu@email.com).', 'login');
}

// ============================================
// VALIDAÇÕES - Senha
// ============================================

if ($senha === '') {
    redirectWithError('Por favor, preencha sua senha.', 'login');
}

// ============================================
// BUSCAR USUÁRIO NO BANCO DE DADOS
// ============================================

// ✅ PREPARED STATEMENT para buscar aluno
$stmt = $conexao->prepare("SELECT id_aluno, nome_aluno, serie_aluno, senha_aluno FROM login_aluno WHERE email_aluno = ?");

if (!$stmt) {
    redirectWithError('Erro ao conectar com o banco de dados. Tente novamente mais tarde.', 'login');
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$usuario = $result->fetch_assoc();
$stmt->close();

// ============================================
// VERIFICAR EMAIL E SENHA
// ============================================

// 🔐 VERIFICAR SENHA COM HASH
if ($usuario && password_verify($senha, $usuario['senha_aluno'])) {
    
    // ============================================
    // LOGIN BEM-SUCEDIDO
    // ============================================
    
    // ✅ Criar apenas sessão
    $_SESSION['usuario_id']    = $usuario['id_aluno'];
    $_SESSION['usuario_nome']  = $usuario['nome_aluno'];
    $_SESSION['usuario_serie'] = $usuario['serie_aluno'];

    // Remover marcadores de sessão temporária
    unset($_SESSION['login_temporario']);
    unset($_SESSION['tempo_expiracao_temporario']);

    // TOKEN (30 DIAS)
    $token = bin2hex(random_bytes(32));
    $expiracao = date('Y-m-d H:i:s', strtotime('+30 days'));
    
    $stmt = $conexao->prepare("UPDATE login_aluno SET relembrar_token = ?, token_expiracao = ? WHERE id_aluno = ?");
    if ($stmt) {
        $stmt->bind_param("ssi", $token, $expiracao, $usuario['id_aluno']);
        $stmt->execute();
        $stmt->close();
    }
    
    // Criar cookies
    setcookie('relembrar_token', $token, time() + 30*24*60*60, '/');
    setcookie('user_id', $usuario['id_aluno'], time() + 30*24*60*60, '/');
    
    header('Location: dashboard_aluno.php');
    exit;
    
} else {
    // ============================================
    // EMAIL OU SENHA INCORRETOS
    // ============================================
    redirectWithError('Email ou senha incorretos. Tente novamente.', 'login');
}

?>
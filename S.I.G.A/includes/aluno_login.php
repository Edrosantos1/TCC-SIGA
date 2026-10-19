<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_validar()) {
    $_SESSION['flash_login_error'] = ['msg' => 'Sessão expirada. Recarregue a página e tente novamente.', 'register' => false];
    header('Location: ../aluno/auth/login.php');
    exit;
}

/**
 * Função auxiliar para validar email
 */
function isValidEmail($email) {
    $emailRegex = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
    return preg_match($emailRegex, $email) === 1;
}

/**
 * Função auxiliar para redirecionar com erro personalizado
 * CORREÇÃO: Adicionado ../aluno/ para sair da pasta includes
 */
function redirectWithError($message, $type = 'login') {
    $_SESSION['flash_login_error'] = [
        'msg' => $message,
        'register' => $type === 'register',
    ];
    header('Location: ../aluno/auth/login.php');
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

if ($usuario && password_verify($senha, $usuario['senha_aluno'])) {
    
    // ============================================
    // LOGIN BEM-SUCEDIDO
    // ============================================
    
    session_regenerate_id(true);
    $_SESSION['usuario_id']    = $usuario['id_aluno'];
    $_SESSION['usuario_nome']  = $usuario['nome_aluno'];
    $_SESSION['usuario_serie'] = $usuario['serie_aluno'];

    unset($_SESSION['login_temporario']);
    unset($_SESSION['tempo_expiracao_temporario']);

    $token = bin2hex(random_bytes(32));
    $expiracao = date('Y-m-d H:i:s', strtotime('+30 days'));
    
    $tokenHash = hash('sha256', $token);
    $stmt = $conexao->prepare("UPDATE login_aluno SET relembrar_token = ?, token_expiracao = ? WHERE id_aluno = ?");
    if ($stmt) {
        $stmt->bind_param("ssi", $tokenHash, $expiracao, $usuario['id_aluno']);
        $stmt->execute();
        $stmt->close();
    }
    
    setcookie('relembrar_token', $token, appCookieOptions(time() + 30 * 24 * 60 * 60));
    setcookie('user_id', (string) $usuario['id_aluno'], appCookieOptions(time() + 30 * 24 * 60 * 60));
    
    // CORREÇÃO: Adicionado ../aluno/ no redirecionamento de sucesso
    header('Location: ../aluno/painel.php');
    exit;
    
} else {
    // ============================================
    // EMAIL OU SENHA INCORRETOS
    // ============================================
    redirectWithError('Email ou senha incorretos. Tente novamente.', 'login');
}
?>

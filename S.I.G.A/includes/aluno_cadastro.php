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
 * CORREÇÃO: Adicionado ../aluno/ para sair da pasta includes
 */
function redirectWithError($message, $type = 'login') {
    $errorParam = urlencode($message);
    $typeParam = ($type === 'register') ? 'register' : 'login';
    header("Location: ../aluno/login_user.php?error={$errorParam}&type={$typeParam}");
    exit;
}

// ============================================
// CAPTURAR DADOS DO FORMULÁRIO
// ============================================

$nome           = isset($_POST['nome']) ? trim($_POST['nome']) : '';
$serie          = isset($_POST['serie']) ? trim($_POST['serie']) : '';
$email          = isset($_POST['email']) ? trim($_POST['email']) : '';
$senha          = isset($_POST['senha']) ? $_POST['senha'] : '';
$confirmarSenha = isset($_POST['confirmar_senha']) ? $_POST['confirmar_senha'] : '';

// ============================================
// VALIDAÇÕES - Nome
// ============================================

if ($nome === '') {
    redirectWithError('Por favor, preencha seu nome.', 'register');
}

// Validar se o nome tem pelo menos 2 caracteres
if (strlen($nome) < 2) {
    redirectWithError('O nome deve ter pelo menos 2 caracteres.', 'register');
}

// ============================================
// VALIDAÇÕES - Email
// ============================================

if ($email === '') {
    redirectWithError('Por favor, preencha seu email.', 'register');
}

if (!isValidEmail($email)) {
    redirectWithError('Por favor, insira um email válido (ex: seu@email.com).', 'register');
}

// ============================================
// VALIDAÇÕES - Série
// ============================================

if ($serie === '') {
    redirectWithError('Por favor, selecione uma série.', 'register');
}

// Validação de série permitida
$seriesPermitidas = ['6º ano', '7º ano', '8º ano', '9º ano', '1º ano', '2º ano', '3º ano'];
if (!in_array($serie, $seriesPermitidas)) {
    redirectWithError('Série inválida. Selecione uma série válida.', 'register');
}

// ============================================
// VALIDAÇÕES - Senha
// ============================================

if ($senha === '') {
    redirectWithError('Por favor, preencha sua senha.', 'register');
}

if (strlen($senha) < 8) {
    redirectWithError('A senha deve ter no mínimo 8 caracteres.', 'register');
}

// ============================================
// VALIDAÇÕES - Confirmação de Senha
// ============================================

if ($confirmarSenha === '') {
    redirectWithError('Por favor, confirme sua senha.', 'register');
}

if ($senha !== $confirmarSenha) {
    redirectWithError('As senhas não coincidem.', 'register');
}

// ============================================
// VERIFICAR SE EMAIL JÁ EXISTE
// ============================================

$stmt = $conexao->prepare("SELECT id_aluno FROM login_aluno WHERE email_aluno = ?");

if (!$stmt) {
    redirectWithError('Erro ao conectar com o banco de dados. Tente novamente mais tarde.', 'register');
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if (mysqli_num_rows($result) > 0) {
    $stmt->close();
    redirectWithError('Este email já está registrado. Tente fazer login ou use outro email.', 'register');
}
$stmt->close();

// ============================================
// CRIPTOGRAFAR SENHA
// ============================================

$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

// ============================================
// INSERIR NOVO USUÁRIO NO BANCO
// ============================================

$stmt = $conexao->prepare("INSERT INTO login_aluno (nome_aluno, serie_aluno, email_aluno, senha_aluno) VALUES (?, ?, ?, ?)");

if (!$stmt) {
    redirectWithError('Erro ao registrar. Tente novamente mais tarde.', 'register');
}

$stmt->bind_param("ssss", $nome, $serie, $email, $senhaHash);

if ($stmt->execute()) {
    $novoId = $stmt->insert_id;
    $stmt->close();
    
    // ============================================
    // REGISTRO BEM-SUCEDIDO - CRIAR SESSÃO
    // ============================================
    
    $_SESSION['usuario_id']    = $novoId;
    $_SESSION['usuario_nome']  = $nome;
    $_SESSION['usuario_serie'] = $serie;
    
    // CORREÇÃO: Adicionado ../aluno/ no redirecionamento de sucesso
    header('Location: ../aluno/dashboard_aluno.php');
    exit;
    
} else {
    $stmt->close();
    redirectWithError('Erro ao registrar. Tente novamente mais tarde.', 'register');
}
?>
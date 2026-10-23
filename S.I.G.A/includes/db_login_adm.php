<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexao.php';

// Limite de tentativas de login (proteção contra tentativa e erro de senha)
const LOGIN_ADM_MAX_TENTATIVAS_IP = 5;      // erros por IP na janela
const LOGIN_ADM_MAX_TENTATIVAS_EMAIL = 10;  // erros por e-mail na janela (maior, para o adm real não ser travado por terceiros)
const LOGIN_ADM_JANELA_MINUTOS = 15;

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_validar()) {
    $_SESSION['flash_admin_login_error'] = 'Sessão expirada. Recarregue a página e tente novamente.';
    header('Location: ../adm/login_adm.php');
    exit;
}

$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

function redirecionarLoginAdminComErro(string $mensagem): void
{
    $_SESSION['flash_admin_login_error'] = $mensagem;
    header('Location: ../adm/login_adm.php');
    exit;
}

function loginAdmGarantirTabela(mysqli $conexao): void
{
    $conexao->query(
        "CREATE TABLE IF NOT EXISTS login_admin_tentativas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45) NOT NULL,
            email VARCHAR(100) NOT NULL,
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_tentativas_ip (ip, criado_em),
            INDEX idx_tentativas_email (email, criado_em)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

function loginAdmBloqueado(mysqli $conexao, string $ip, string $emailChave): bool
{
    $stmt = $conexao->prepare(
        "SELECT COALESCE(SUM(ip = ?), 0) AS por_ip, COALESCE(SUM(email = ?), 0) AS por_email
         FROM login_admin_tentativas
         WHERE criado_em > (NOW() - INTERVAL " . LOGIN_ADM_JANELA_MINUTOS . " MINUTE)"
    );
    if (!$stmt) {
        return false;
    }
    $stmt->bind_param('ss', $ip, $emailChave);
    $stmt->execute();
    $linha = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return (int) ($linha['por_ip'] ?? 0) >= LOGIN_ADM_MAX_TENTATIVAS_IP
        || (int) ($linha['por_email'] ?? 0) >= LOGIN_ADM_MAX_TENTATIVAS_EMAIL;
}

function loginAdmRegistrarFalha(mysqli $conexao, string $ip, string $emailChave): void
{
    $stmt = $conexao->prepare('INSERT INTO login_admin_tentativas (ip, email) VALUES (?, ?)');
    if ($stmt) {
        $stmt->bind_param('ss', $ip, $emailChave);
        $stmt->execute();
        $stmt->close();
    }
    // Limpeza de registros antigos
    $conexao->query('DELETE FROM login_admin_tentativas WHERE criado_em < (NOW() - INTERVAL 1 DAY)');
}

function loginAdmLimparTentativas(mysqli $conexao, string $ip, string $emailChave): void
{
    $stmt = $conexao->prepare('DELETE FROM login_admin_tentativas WHERE ip = ? OR email = ?');
    if ($stmt) {
        $stmt->bind_param('ss', $ip, $emailChave);
        $stmt->execute();
        $stmt->close();
    }
}

if ($email === '' || $senha === '') {
    redirecionarLoginAdminComErro('Preencha e-mail e senha.');
}

// REMOTE_ADDR de propósito: cabeçalhos como X-Forwarded-For podem ser forjados pelo cliente.
$ip = substr((string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 45);
$emailChave = mb_strtolower(mb_substr(trim((string) $email), 0, 100));

// Se o controle de tentativas falhar (ex.: banco sem permissão de CREATE), o login continua funcionando.
$limiteAtivo = true;
try {
    loginAdmGarantirTabela($conexao);
    if (loginAdmBloqueado($conexao, $ip, $emailChave)) {
        redirecionarLoginAdminComErro('Muitas tentativas de login. Aguarde ' . LOGIN_ADM_JANELA_MINUTOS . ' minutos e tente novamente.');
    }
} catch (Throwable $e) {
    error_log('Controle de tentativas de login administrativo indisponível: ' . $e->getMessage());
    $limiteAtivo = false;
}

$stmt = $conexao->prepare("SELECT id_adm, email_adm, senha_adm, nome_adm FROM login_admin WHERE email_adm = ?");
if (!$stmt) {
    error_log('Falha ao preparar a consulta de login administrativo: ' . $conexao->error);
    redirecionarLoginAdminComErro('Não foi possível entrar. Tente novamente mais tarde.');
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$stmt->close();

// VERIFICAR SENHA
if ($admin && password_verify($senha, $admin['senha_adm'])) {
    if ($limiteAtivo) {
        try {
            loginAdmLimparTentativas($conexao, $ip, $emailChave);
        } catch (Throwable $e) {
            error_log('Falha ao limpar tentativas de login: ' . $e->getMessage());
        }
    }
    session_regenerate_id(true);
    $_SESSION['id_adm'] = $admin['id_adm'];
    $_SESSION['admin_id'] = $admin['id_adm'];
    $_SESSION['email_adm'] = $admin['email_adm'];
    $_SESSION['admin_nome'] = $admin['nome_adm'] ?? 'Administrador';
    header('Location: ../adm/dashboard_adm.php');
    exit;
} else {
    if ($limiteAtivo) {
        try {
            loginAdmRegistrarFalha($conexao, $ip, $emailChave);
        } catch (Throwable $e) {
            error_log('Falha ao registrar tentativa de login: ' . $e->getMessage());
        }
    }
    redirecionarLoginAdminComErro('E-mail ou senha inválidos.');
}

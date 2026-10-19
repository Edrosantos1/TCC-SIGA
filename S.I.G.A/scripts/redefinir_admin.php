<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../includes/conexao.php';

function lerEntrada(string $prompt): string
{
    fwrite(STDOUT, $prompt);
    $value = fgets(STDIN);
    return $value === false ? '' : trim($value);
}

$email = lerEntrada('E-mail da conta administrativa: ');
$nome = lerEntrada('Nome do administrador: ');
$senha = lerEntrada('Nova senha: ');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $nome === '' || $senha === '') {
    fwrite(STDERR, "Dados invalidos. Informe e-mail valido, nome e uma senha nao vazia.\n");
    exit(1);
}

fwrite(STDOUT, "A conta sera atualizada ou criada para {$email}. Continuar? Digite SIM: ");
if (trim((string) fgets(STDIN)) !== 'SIM') {
    fwrite(STDOUT, "Operacao cancelada.\n");
    exit(0);
}

$senhaHash = password_hash($senha, PASSWORD_DEFAULT);
if (!is_string($senhaHash)) {
    fwrite(STDERR, "Nao foi possivel gerar o hash da senha.\n");
    exit(1);
}

$stmt = $conexao->prepare('SELECT id_adm FROM login_admin WHERE email_adm = ?');
if (!$stmt) {
    fwrite(STDERR, "Falha ao preparar consulta: {$conexao->error}\n");
    exit(1);
}
$stmt->bind_param('s', $email);
if (!$stmt->execute()) {
    fwrite(STDERR, "Falha ao consultar a conta: {$stmt->error}\n");
    exit(1);
}
$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$stmt->close();

if ($admin) {
    $stmt = $conexao->prepare('UPDATE login_admin SET nome_adm = ?, senha_adm = ? WHERE id_adm = ?');
    if (!$stmt) {
        fwrite(STDERR, "Falha ao preparar atualizacao: {$conexao->error}\n");
        exit(1);
    }
    $adminId = (int) $admin['id_adm'];
    $stmt->bind_param('ssi', $nome, $senhaHash, $adminId);
} else {
    $stmt = $conexao->prepare('INSERT INTO login_admin (email_adm, senha_adm, nome_adm) VALUES (?, ?, ?)');
    if (!$stmt) {
        fwrite(STDERR, "Falha ao preparar criacao da conta: {$conexao->error}\n");
        exit(1);
    }
    $stmt->bind_param('sss', $email, $senhaHash, $nome);
}

if (!$stmt->execute()) {
    fwrite(STDERR, "Falha ao salvar a conta administrativa: {$stmt->error}\n");
    exit(1);
}

$stmt->close();
fwrite(STDOUT, "Conta administrativa atualizada. A senha foi armazenada como hash.\n");

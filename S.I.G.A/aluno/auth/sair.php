<?php
require_once __DIR__ . '/../../includes/config.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_validar()) {
        http_response_code(403);
        exit('Token CSRF inválido. Recarregue a página e tente novamente.');
    }

    require_once __DIR__ . '/../../includes/conexao.php';
    $id = (int) $_SESSION['usuario_id'];
    $stmt = $conexao->prepare('UPDATE login_aluno SET relembrar_token = NULL, token_expiracao = NULL WHERE id_aluno = ?');
    if (!$stmt) {
        error_log('Falha ao preparar a remoção do token de lembrança: ' . $conexao->error);
    } else {
        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) {
            error_log('Falha ao remover o token de lembrança: ' . $stmt->error);
        }
        $stmt->close();
    }

    $_SESSION = [];
    session_destroy();
    setcookie('relembrar_token', '', appCookieOptions(time() - 3600));
    setcookie('user_id', '', appCookieOptions(time() - 3600));
    header('Location: login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET, POST');
    exit('Método não permitido.');
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmar saída — SiGA ITJ</title>
    <link rel="stylesheet" href="../../assets/css/shared/confirmacao_saida.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
    <main class="confirm-card">
        <div class="confirm-icon"><i class="fas fa-right-from-bracket" aria-hidden="true"></i></div>
        <h1>Sair da sua conta?</h1>
        <p>Você precisará entrar novamente para acessar sua conta.</p>
        <form method="POST" action="sair.php">
            <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
            <div class="confirm-actions">
                <a href="../painel.php">Continuar na conta</a>
                <button type="submit"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Sair</button>
            </div>
        </form>
    </main>
</body>
</html>

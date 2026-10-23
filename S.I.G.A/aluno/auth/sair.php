<?php
require_once __DIR__ . '/../../includes/config.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) {
    http_response_code(405);
    header('Allow: GET, POST');
    exit('Método não permitido.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !csrf_validar()) {
    http_response_code(403);
    exit('Token CSRF inválido. Recarregue a página e tente novamente.');
}

$id = (int) $_SESSION['usuario_id'];
$stmt = $conn->prepare('UPDATE login_aluno SET relembrar_token = NULL, token_expiracao = NULL WHERE id_aluno = ?');
if (!$stmt) {
    error_log('Falha ao preparar a remoção do token de lembrança: ' . $conn->error);
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

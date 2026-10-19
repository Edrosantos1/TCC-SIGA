<?php
require_once __DIR__ . '/../../includes/config.php';

// Se a sessão está ativa, apenas permite continuar
if (isset($_SESSION['usuario_id'])) {
    return;
}

// ✅ Recuperar apenas se tiver cookies de "Lembrar-me" (login normal)
if (isset($_COOKIE['relembrar_token']) && isset($_COOKIE['user_id'])) {

    require_once __DIR__ . '/../../includes/conexao.php';

    $token = $_COOKIE['relembrar_token'];
    $userId = intval($_COOKIE['user_id']);
    $agora = date('Y-m-d H:i:s');

    $stmt = $conexao->prepare("
        SELECT id_aluno, nome_aluno, serie_aluno, relembrar_token
        FROM login_aluno
        WHERE id_aluno = ?
        AND token_expiracao > ?
    ");

    $stmt->bind_param("is", $userId, $agora);
    $stmt->execute();

    $result = $stmt->get_result();
    $usuario = $result->fetch_assoc();

    $stmt->close();

    $tokenHash = hash('sha256', $token);
    $tokenValido = $usuario && (
        hash_equals((string) $usuario['relembrar_token'], $tokenHash)
    );

    if ($tokenValido) {
        $_SESSION['usuario_id']    = $usuario['id_aluno'];
        $_SESSION['usuario_nome']  = $usuario['nome_aluno'];
        $_SESSION['usuario_serie'] = $usuario['serie_aluno'];
    } else {
        // Cookie inválido ou expirado
        setcookie('relembrar_token', '', appCookieOptions(time() - 3600));
        setcookie('user_id', '', appCookieOptions(time() - 3600));
    }
}
?>

<?php
require_once __DIR__ . '/../includes/config.php';

// Se a sessão está ativa, apenas permite continuar
if (isset($_SESSION['usuario_id'])) {
    return;
}

// ✅ Recuperar apenas se tiver cookies de "Lembrar-me" (login normal)
if (isset($_COOKIE['relembrar_token']) && isset($_COOKIE['user_id'])) {

    require_once __DIR__ . '/../includes/conexao.php';

    $token = $_COOKIE['relembrar_token'];
    $userId = intval($_COOKIE['user_id']);
    $agora = date('Y-m-d H:i:s');

    $stmt = $conexao->prepare("
        SELECT id_aluno, nome_aluno, serie_aluno
        FROM login_aluno
        WHERE id_aluno = ?
        AND relembrar_token = ?
        AND token_expiracao > ?
    ");

    $stmt->bind_param("iss", $userId, $token, $agora);
    $stmt->execute();

    $result = $stmt->get_result();
    $usuario = $result->fetch_assoc();

    $stmt->close();

    if ($usuario) {
        $_SESSION['usuario_id']    = $usuario['id_aluno'];
        $_SESSION['usuario_nome']  = $usuario['nome_aluno'];
        $_SESSION['usuario_serie'] = $usuario['serie_aluno'];
    } else {
        // Cookie inválido ou expirado
        setcookie('relembrar_token', '', time() - 3600, '/');
        setcookie('user_id', '', time() - 3600, '/');
    }
}
?>
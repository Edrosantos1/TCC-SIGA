<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/auth/verificar_login_user.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: auth/login_user.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_validar()) {
        http_response_code(403);
        exit('Token CSRF inválido. Recarregue a página e tente novamente.');
    }

    $usuario_id = $_SESSION['usuario_id'];

    $stmt_usuario = $conn->prepare('SELECT id_aluno FROM login_aluno WHERE id_aluno = ?');
    $stmt_usuario->bind_param('i', $usuario_id);
    $stmt_usuario->execute();
    $usuarioExiste = $stmt_usuario->get_result()->num_rows > 0;
    $stmt_usuario->close();

    if (!$usuarioExiste) {
        unset($_SESSION['usuario_id'], $_SESSION['usuario_nome'], $_SESSION['usuario_serie']);
        setcookie('relembrar_token', '', appCookieOptions(time() - 3600));
        setcookie('user_id', '', appCookieOptions(time() - 3600));
        session_regenerate_id(true);
        $_SESSION['flash_login_error'] = [
            'msg' => 'sessao_usuario_invalida',
            'register' => false,
        ];
        header('Location: auth/login_user.php');
        exit;
    }

    $item_id = intval($_POST['item_id']);
    $tipo_item = $_POST['tipo_item'];
    
    // Define para onde redirecionar (padrão é a página anterior)
    $redirect = redirect_seguro($_POST['redirect'] ?? ($_SERVER['HTTP_REFERER'] ?? ''), 'catalogo_user.php');

    // Validação básica do tipo de item
    $tipos_permitidos = ['livro', 'revista', 'tcc'];
    if (!in_array($tipo_item, $tipos_permitidos)) {
        header('Location: ' . $redirect);
        exit;
    }

    // 1. Verifica se já existe na tabela de favoritos
    $sql_check = "SELECT id FROM favoritos WHERE usuario_id = ? AND item_id = ? AND tipo_item = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("iis", $usuario_id, $item_id, $tipo_item);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows > 0) {
        // Se existe, REMOVE (Delete)
        $sql_delete = "DELETE FROM favoritos WHERE usuario_id = ? AND item_id = ? AND tipo_item = ?";
        $stmt_delete = $conn->prepare($sql_delete);
        $stmt_delete->bind_param("iis", $usuario_id, $item_id, $tipo_item);
        $stmt_delete->execute();
        $stmt_delete->close();
    } else {
        // Se não existe, ADICIONA (Insert)
        $data_favorito = date('Y-m-d H:i:s');
        $sql_insert = "INSERT INTO favoritos (usuario_id, item_id, tipo_item, data_favorito) VALUES (?, ?, ?, ?)";
        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bind_param("iiss", $usuario_id, $item_id, $tipo_item, $data_favorito);
        $stmt_insert->execute();
        $stmt_insert->close();
    }
    
    $stmt_check->close();

    // 2. Redireciona de volta
    header("Location: " . $redirect);
    exit;
} else {
    // Se não for POST, manda para o dashboard
    header('Location: painel_user.php');
    exit;
}
?>


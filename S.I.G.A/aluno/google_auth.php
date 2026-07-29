<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/conexao.php';
header('Content-Type: application/json');

// ============================================================
// 1. RECEBE O TOKEN (apenas o token, sem email/nome do POST)
// ============================================================
$google_token = $_POST['google_token'] ?? '';
if (!$google_token) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Token não fornecido.']);
    exit;
}

// ============================================================
// 2. VALIDA O TOKEN COM A API DO GOOGLE
// ============================================================
function fetchUrl(string $url) {
    // Primeiro tenta file_get_contents, pois é simples.
    $response = @file_get_contents($url);
    if ($response !== false) {
        return $response;
    }

    // Se allow_url_fopen estiver desabilitado, tenta cURL.
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response !== false && $httpCode >= 200 && $httpCode < 300) {
            return $response;
        }

        error_log('google_auth.php: cURL falhou para tokeninfo (' . $httpCode . ') - ' . $error);
    }

    return false;
}

function verificarTokenGoogle($id_token) {
    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($id_token);
    $response = fetchUrl($url);
    if ($response === false) {
        return false;
    }

    $dados = json_decode($response, true);
    if (!$dados || isset($dados['error'])) {
        return false;
    }

    $client_id = '1039622063080-o38po3mnc76be497osrdtfsfmjb7j5q9.apps.googleusercontent.com';
    if (($dados['aud'] ?? '') !== $client_id) {
        return false; // token não foi emitido para o seu app
    }

    return $dados; // retorna array com email, name, sub, etc.
}

$userData = verificarTokenGoogle($google_token);
if (!$userData) {
    http_response_code(401);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Token inválido ou expirado.']);
    exit;
}

// Agora sim, use os dados vindos do Google
$email = $userData['email'];
$nome  = $userData['name'];

// (Opcional) Validações extras
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Email inválido.']);
    exit;
}
if (strlen(trim($nome)) < 2) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Nome inválido.']);
    exit;
}

// ============================================================
// 3. VERIFICA SE USUÁRIO JÁ EXISTE – LOGIN OU CADASTRO
// ============================================================
try {
    $stmt = $conexao->prepare("SELECT id_aluno, nome_aluno, serie_aluno FROM login_aluno WHERE email_aluno = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $usuario = $result->fetch_assoc();
    $stmt->close();

    if ($usuario) {
        // --- LOGIN ---
        $_SESSION['usuario_id']   = $usuario['id_aluno'];
        $_SESSION['usuario_nome'] = $usuario['nome_aluno'];
        $_SESSION['usuario_serie'] = $usuario['serie_aluno'];
        $_SESSION['login_google'] = true;
        $_SESSION['user_email']   = $email;
        $mensagem = 'Login realizado com sucesso.';
        $novo = false;
        // Se a série ainda não foi escolhida (conta antiga ou cadastro
        // via Google que nunca completou o perfil), sinaliza pro front.
        $precisaSerie = empty($usuario['serie_aluno']);
    } else {
        // --- CADASTRO ---
        // Não define série aqui: fica em branco até o usuário escolher
        // na tela de "completar cadastro" (veja completar_serie.php).
        $serie = '';
        $precisaSerie = true;
        $senhaAleatoria = bin2hex(random_bytes(16));
        $senhaHash = password_hash($senhaAleatoria, PASSWORD_DEFAULT);
        $nomeLimpo = htmlspecialchars(trim($nome), ENT_QUOTES, 'UTF-8');

        $stmt = $conexao->prepare("INSERT INTO login_aluno (nome_aluno, email_aluno, serie_aluno, senha_aluno) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $nomeLimpo, $email, $serie, $senhaHash);
        if ($stmt->execute()) {
            $novoId = $stmt->insert_id;
            $stmt->close();

            $_SESSION['usuario_id']   = $novoId;
            $_SESSION['usuario_nome'] = $nomeLimpo;
            $_SESSION['usuario_serie'] = $serie;
            $_SESSION['login_google'] = true;
            $_SESSION['user_email']   = $email;
            $mensagem = 'Cadastro realizado com sucesso.';
            $novo = true;
        } else {
            throw new Exception("Erro ao inserir no banco: " . $stmt->error);
        }
    }

    // ============================================================
    // 4. GERAR TOKEN "LEMBRAR-ME" E COOKIES
    // ============================================================
    $tokenLembrar = bin2hex(random_bytes(32));
    $expiracao = date('Y-m-d H:i:s', strtotime('+30 days'));
    $stmt = $conexao->prepare("UPDATE login_aluno SET relembrar_token = ?, token_expiracao = ? WHERE id_aluno = ?");
    $stmt->bind_param("ssi", $tokenLembrar, $expiracao, $_SESSION['usuario_id']);
    $stmt->execute();
    $stmt->close();

    setcookie('relembrar_token', $tokenLembrar, time() + 30*24*60*60, '/', '', false, true);
    setcookie('user_id', $_SESSION['usuario_id'], time() + 30*24*60*60, '/', '', false, true);

    echo json_encode([
        'sucesso'      => true,
        'mensagem'     => $mensagem,
        'novo'         => $novo,
        'precisa_serie' => $precisaSerie
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Erro no google_auth.php: " . $e->getMessage());
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro interno. Tente novamente.']);
}
?>
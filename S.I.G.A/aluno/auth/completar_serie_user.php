<?php
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/conexao.php';

// ============================================================
// Endpoint chamado depois do login/cadastro via Google, quando
// o back-end sinaliza "precisa_serie": true. Só atualiza a série
// de quem já tem uma sessão válida (não recebe id pelo POST).
// ============================================================

if (!isset($_SESSION['usuario_id'])) {
    $_SESSION['flash_login_error'] = ['msg' => 'Você precisa estar logado.', 'register' => false];
    header('Location: login_user.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_validar()) {
    $_SESSION['flash_login_error'] = ['msg' => 'Sessão expirada. Recarregue a página e tente novamente.', 'register' => true];
    header('Location: login_user.php');
    exit;
}

$serie = $_POST['serie'] ?? '';

$seriesPermitidas = ['6º ano', '7º ano', '8º ano', '9º ano', '1º ano', '2º ano', '3º ano'];

if (!in_array($serie, $seriesPermitidas, true)) {
    $_SESSION['flash_login_error'] = ['msg' => 'Série inválida.', 'register' => true];
    header('Location: login_user.php');
    exit;
}

try {
    $stmt = $conexao->prepare("UPDATE login_aluno SET serie_aluno = ? WHERE id_aluno = ?");

    // prepare() retorna false em erro (SQL errado, tabela renomeada,
    // conexão caiu). Sem esse check, o bind_param quebraria com um
    // erro fatal fora do try/catch.
    if (!$stmt) {
        throw new Exception('Falha ao preparar a query: ' . $conexao->error);
    }

    $stmt->bind_param("si", $serie, $_SESSION['usuario_id']);

    // execute() também retorna false em erro (FK inválida, timeout etc),
    // sem lançar exceção por padrão — precisa ser checado manualmente.
    if (!$stmt->execute()) {
        throw new Exception('Falha ao executar update: ' . $stmt->error);
    }

    // affected_rows == 0 não é erro por si só (aluno já pode estar
    // nessa série), mas ajuda a investigar se o id_aluno da sessão
    // não bate com nenhuma linha da tabela.
    if ($stmt->affected_rows === 0) {
        error_log("completar_serie_user.php: nenhuma linha afetada para id_aluno=" . $_SESSION['usuario_id']);
    }

    $stmt->close();

    $_SESSION['usuario_serie'] = $serie;

    header('Location: ../painel_user.php?mensagem=S%C3%A9rie+atualizada+com+sucesso');
    exit;
} catch (Exception $e) {
    error_log("Erro no completar_serie_user.php: " . $e->getMessage());
    $_SESSION['flash_login_error'] = ['msg' => 'Erro interno. Tente novamente.', 'register' => true];
    header('Location: login_user.php');
    exit;
}


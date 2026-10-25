<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/auth/verificar_login.php';
require_once __DIR__ . '/../includes/aluno_funcoes_config.php';
require_once __DIR__ . '/../includes/config_redirect.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: auth/login.php');
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

// Buscar nome do aluno
$sql_nome = "SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?";
$stmt = $conn->prepare($sql_nome);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$primeiroNome = 'Aluno';
if ($row = $stmt->get_result()->fetch_assoc()) {
    $primeiroNome = explode(' ', trim($row['nome_aluno']))[0];
}
$stmt->close();

$notificacoes = [];
$stmt_notificacoes = $conn->prepare(
    'SELECT id_envio, titulo, mensagem, tipo, criado_em FROM notificacoes WHERE id_aluno = ? AND COALESCE(lida, 0) = 0 ORDER BY criado_em DESC LIMIT 5'
);
if ($stmt_notificacoes) {
    $stmt_notificacoes->bind_param('i', $usuario_id);
    $stmt_notificacoes->execute();
    $notificacoes = $stmt_notificacoes->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_notificacoes->close();
}

// Processar formulário (valida e grava; depois redireciona para evitar reenvio)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['salvar'])) {
    if (!csrf_validar()) {
        $_SESSION['msg_erro'] = 'Sessão expirada ou token de segurança inválido. Recarregue a página e tente novamente.';
        header('Location: configuracoes.php');
        exit;
    }

    try {
        $ok = salvar_configuracoes_aluno($usuario_id, $_POST, $conn);
    } catch (Throwable $e) {
        error_log('Erro ao salvar preferências do aluno: ' . $e->getMessage());
        $ok = false;
    }

    if ($ok) {
        $_SESSION['msg_sucesso'] = 'Preferências salvas com sucesso!';
    } else {
        $_SESSION['msg_erro'] = 'Não foi possível salvar suas preferências. Tente novamente.';
    }
    $destino = $ok ? config_destino_local_seguro($_POST['redirect_apos_salvar'] ?? null) : null;
    header('Location: ' . ($destino ?? 'configuracoes.php'));
    exit;
}

// Carregar configurações do aluno
$configuracoes = carregar_configuracoes_aluno($usuario_id, $conn);

// Mensagens flash
$msg_sucesso = $_SESSION['msg_sucesso'] ?? null;
$msg_erro    = $_SESSION['msg_erro'] ?? null;
unset($_SESSION['msg_sucesso'], $_SESSION['msg_erro']);

// Grupos de opções (cada um vira um card; o valor salvo é a chave de 'opcoes')
$grupos = [
    'tamanho_fonte' => [
        'titulo' => 'Tamanho da Fonte',
        'icone'  => 'fa-font',
        'desc'   => 'Altere o tamanho do texto em todo o sistema',
        'opcoes' => [
            'pequeno' => ['Pequeno', '<i class="fas fa-font" style="font-size: 12px;"></i>'],
            'medio'   => ['Médio',   '<i class="fas fa-font" style="font-size: 16px;"></i>'],
            'grande'  => ['Grande',  '<i class="fas fa-font" style="font-size: 22px;"></i>'],
        ],
    ],
    'daltonismo' => [
        'titulo' => 'Daltonismo',
        'icone'  => 'fa-eye',
        'desc'   => 'Ajuste as cores para facilitar a diferença entre tons confundidos',
        'opcoes' => [
            'normal'       => ['Normal',       '<i class="fas fa-eye"></i>'],
            'protanopia'   => ['Protanopia',   '<span class="emoji" aria-hidden="true">🔴</span>'],
            'deuteranopia' => ['Deuteranopia', '<span class="emoji" aria-hidden="true">🟢</span>'],
            'tritanopia'   => ['Tritanopia',   '<span class="emoji" aria-hidden="true">🔵</span>'],
        ],
    ],
    'espacamento' => [
        'titulo' => 'Espaçamento',
        'icone'  => 'fa-arrows-alt-h',
        'desc'   => 'Ajuste a densidade da informação na tela',
        'opcoes' => [
            'compacto'    => ['Compacto',    '<i class="fas fa-compress-arrows-alt"></i>'],
            'normal'      => ['Normal',      '<i class="fas fa-arrows-alt-h"></i>'],
            'confortavel' => ['Confortável', '<i class="fas fa-expand-arrows-alt"></i>'],
        ],
    ],
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
    <title>Configurações — SiGA ITJ</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/aluno/painel_aluno.css">
    <link rel="stylesheet" href="../assets/css/aluno/aluno_unificado.css">
    <link rel="stylesheet" href="../assets/css/aluno/configuracoes_aluno.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/aluno/notificacoes_aluno.css">
    <link rel="stylesheet" href="../assets/css/shared/config_unsaved_changes.css?v=<?= filemtime(__DIR__ . '/../assets/css/shared/config_unsaved_changes.css') ?>">
    <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>
    <script src="../assets/js/aluno/painel_aluno.js?v=<?= time() ?>" defer></script>
    <script src="../assets/js/aluno/notificacoes_aluno.js?v=<?= time() ?>" defer></script>
    <script src="../assets/js/aluno/configuracoes_aluno.js?v=<?= time() ?>" defer></script>
    <script src="../assets/js/shared/config_unsaved_changes.js?v=<?= filemtime(__DIR__ . '/../assets/js/shared/config_unsaved_changes.js') ?>" defer></script>
</head>
<body>

    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="fas fa-book-reader"></i>
                <span>SiGA ITJ</span>
            </div>
            <button class="collapse-icon" id="collapseBtn" title="Recolher menu">
                <span></span>
                <span></span>
            </button>
        </div>
        <nav class="sidebar-nav">
            <a href="painel.php" class="nav-item"><i class="fas fa-home"></i><span>Visão Geral</span></a>
            <a href="catalogo.php" class="nav-item"><i class="fas fa-search"></i><span>Catálogo</span></a>
            <a href="favoritos.php" class="nav-item"><i class="fas fa-heart"></i><span>Meus Favoritos</span></a>
            <a href="emprestimos.php" class="nav-item"><i class="fas fa-book"></i><span>Meus Empréstimos</span></a>
            <a href="reservas.php" class="nav-item"><i class="fas fa-clock"></i><span>Minhas Reservas</span></a>
            <a href="historico.php" class="nav-item"><i class="fas fa-history"></i><span>Histórico</span></a>
            <a href="configuracoes.php" class="nav-item active"><i class="fas fa-sliders-h"></i><span>Configurações</span></a>
        </nav>
    </aside>

    <div class="main-content">
        <?php require __DIR__ . '/../includes/aluno_top_header.php'; ?>

        <main class="container dashboard-main">
            <div class="config-container">
                <div class="config-header">
                    <h1><i class="fas fa-sliders-h"></i> Minhas Preferências</h1>
                    <p>Ajuste suas preferências de acessibilidade. As mudanças aparecem na hora; clique em salvar para mantê-las.</p>
                </div>

                <?php if ($msg_sucesso): ?>
                    <div class="flash-message flash-success" role="status">
                        <i class="fas fa-check-circle"></i>
                        <?= htmlspecialchars($msg_sucesso) ?>
                    </div>
                <?php endif; ?>

                <?php if ($msg_erro): ?>
                    <div class="flash-message flash-error" role="alert">
                        <i class="fas fa-exclamation-circle"></i>
                        <?= htmlspecialchars($msg_erro) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="" id="formPreferencias">
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">

                    <?php foreach ($grupos as $campo => $grupo): ?>
                        <?php $atual = $configuracoes[$campo]; ?>
                        <div class="config-card" role="radiogroup" aria-label="<?= htmlspecialchars($grupo['titulo']) ?>">
                            <h3><i class="fas <?= $grupo['icone'] ?>"></i> <?= htmlspecialchars($grupo['titulo']) ?></h3>
                            <p class="desc"><?= htmlspecialchars($grupo['desc']) ?></p>
                            <div class="form-group">
                                <div class="opcoes-grid">
                                    <?php foreach ($grupo['opcoes'] as $valor => [$rotulo, $icone]): ?>
                                        <?php $marcado = ($atual === $valor); ?>
                                        <label class="opcao-card <?= $marcado ? 'active' : '' ?>">
                                            <input type="radio" name="<?= $campo ?>" value="<?= $valor ?>" <?= $marcado ? 'checked' : '' ?>>
                                            <?= $icone ?>
                                            <span><?= htmlspecialchars($rotulo) ?></span>
                                        </label>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>

                    <!-- Reduzir Animações -->
                    <div class="config-card">
                        <h3><i class="fas fa-stop-circle"></i> Acessibilidade</h3>
                        <p class="desc">Reduza ou desative animações para melhor performance e acessibilidade</p>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" name="reduzir_animacoes" value="1" <?= $configuracoes['reduzir_animacoes'] === '1' ? 'checked' : '' ?>>
                                <span class="slider"></span>
                                <span class="toggle-label">Reduzir animações</span>
                            </label>
                        </div>
                    </div>

                    <div class="config-actions">
                        <div class="aviso-nao-salvo" id="avisoNaoSalvo" hidden>
                            <i class="fas fa-info-circle"></i> Você tem alterações que ainda não foram salvas.
                        </div>
                        <button type="submit" name="salvar" class="btn-salvar">
                            <i class="fas fa-save"></i> Salvar Preferências
                        </button>
                        <button type="button" class="btn-restaurar" id="btnRestaurar">
                            <i class="fas fa-undo"></i> Restaurar padrão
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>

    <div class="unsaved-dialog" id="unsaved-changes-dialog" role="dialog" aria-modal="true" aria-labelledby="unsaved-dialog-title" aria-describedby="unsaved-dialog-description" hidden>
        <div class="unsaved-dialog__panel">
            <div class="unsaved-dialog__icon" aria-hidden="true"><i class="fas fa-floppy-disk"></i></div>
            <h2 id="unsaved-dialog-title">Alterações não salvas</h2>
            <p id="unsaved-dialog-description">Você alterou suas preferências. Deseja aplicar as mudanças antes de sair?</p>
            <div class="unsaved-dialog__actions">
                <button type="button" class="unsaved-dialog__button unsaved-dialog__button--save" data-unsaved-action="save">Salvar e sair</button>
                <button type="button" class="unsaved-dialog__button unsaved-dialog__button--discard" data-unsaved-action="discard">Sair sem salvar</button>
                <button type="button" class="unsaved-dialog__button unsaved-dialog__button--stay" data-unsaved-action="stay">Continuar editando</button>
            </div>
        </div>
    </div>

</body>
</html>








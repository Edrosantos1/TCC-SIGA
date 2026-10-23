<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';
require_once __DIR__ . '/../includes/config_redirect.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$config_classes = $GLOBALS['config_classes'] ?? '';
$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';
$id_adm = $_SESSION['admin_id'];

// ========== IDENTIFICAR CONEXÃO ==========
$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    $_SESSION['msg_erro'] = 'Erro de conexão com o banco de dados.';
    header('Location: dashboard_adm.php');
    exit;
}

// ========== BUSCAR ALUNOS PARA A BUSCA DO CABEÇALHO ==========
$sql_alunos_busca = "
    SELECT
        a.id_aluno,
        a.nome_aluno,
        a.serie_aluno,
        EXISTS (
            SELECT 1 FROM reservas r
            WHERE r.id_aluno = a.id_aluno AND r.status IN ('pendente', 'aprovada')
        ) AS tem_reservas,
        EXISTS (
            SELECT 1 FROM emprestimos e
            WHERE e.id_aluno = a.id_aluno
              AND e.status IN ('emprestado', 'atrasado')
        ) AS tem_emprestimos
    FROM login_aluno a
    ORDER BY a.nome_aluno
";
try {
    if ($db instanceof mysqli) {
        $result_alunos_busca = $db->query($sql_alunos_busca);
        if (!$result_alunos_busca) {
            throw new RuntimeException('Consulta de alunos retornou erro.');
        }
        $alunos_busca = $result_alunos_busca->fetch_all(MYSQLI_ASSOC);
    } elseif ($db instanceof PDO) {
        $stmt_alunos_busca = $db->query($sql_alunos_busca);
        $alunos_busca = $stmt_alunos_busca->fetchAll(PDO::FETCH_ASSOC);
    } else {
        throw new RuntimeException('Tipo de conexão com o banco de dados não suportado.');
    }
} catch (Throwable $e) {
    error_log('Falha ao carregar alunos para busca do cabeçalho: ' . $e->getMessage());
    $_SESSION['msg_erro'] = 'Não foi possível carregar os alunos para a busca do cabeçalho.';
    $alunos_busca = [];
}

// ========== BUSCAR NOTIFICAÇÕES PARA O SININHO (APENAS 5 MAIS RECENTES) ==========
$notificacoes = array();
if ($db) {
    try {
        $sql = "
            SELECT 
                n.id_envio,
                n.titulo,
                n.mensagem,
                n.tipo,
                MAX(n.criado_em) AS criado_em,
                COUNT(DISTINCT n.id_aluno) AS total_alunos
            FROM notificacoes n
            WHERE n.id_envio IS NOT NULL AND n.id_envio != ''
            GROUP BY n.id_envio, n.titulo, n.mensagem, n.tipo
            ORDER BY criado_em DESC
            LIMIT 5
        ";

        if ($db instanceof mysqli) {
            $result = $db->query($sql);
            $notificacoes = $result->fetch_all(MYSQLI_ASSOC);
        } elseif ($db instanceof PDO) {
            $stmt = $db->query($sql);
            $notificacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $notificacoes = [];
        }
    } catch (Exception $e) {
        $notificacoes = [];
    }
}

// ========== VERIFICAR TABELA DE CONFIGURAÇÕES ==========
$tabela_existe = false;
if ($db instanceof mysqli) {
    $result = $db->query("SHOW TABLES LIKE 'configuracoes'");
    $tabela_existe = $result->num_rows > 0;
} elseif ($db instanceof PDO) {
    $stmt = $db->query("SHOW TABLES LIKE 'configuracoes'");
    $tabela_existe = $stmt->rowCount() > 0;
}

$defaults = [
    ['tamanho_fonte', 'medio', 'Tamanho da fonte: pequeno, medio, grande'],
    ['tema', 'claro', 'Tema: claro, escuro, alto_contraste'],
    ['daltonismo', 'normal', 'Tipo de daltonismo: normal, protanopia, deuteranopia, tritanopia'],
    ['espacamento', 'normal', 'Espaçamento: compacto, normal, confortavel'],
    ['reduzir_animacoes', '0', 'Reduzir animações: 0=desligado, 1=ligado']
];

if (!$tabela_existe) {
    $create_sql = "
        CREATE TABLE configuracoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            chave VARCHAR(50) NOT NULL UNIQUE,
            valor VARCHAR(255) NOT NULL,
            descricao VARCHAR(255),
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ";
    if (!$db->query($create_sql)) {
        error_log('Falha ao criar tabela configuracoes: ' . ($db instanceof mysqli ? $db->error : 'erro PDO'));
        http_response_code(500);
        exit('Não foi possível inicializar as configurações.');
    }
}

// A tabela pode existir sem as preferências da interface; complete apenas as ausentes.
$insertDefault = $db->prepare(
    'INSERT IGNORE INTO configuracoes (chave, valor, descricao) VALUES (?, ?, ?)'
);
if (!$insertDefault) {
    error_log('Falha ao preparar as configurações padrão: ' . ($db instanceof mysqli ? $db->error : 'erro PDO'));
    http_response_code(500);
    exit('Não foi possível inicializar as configurações.');
}

foreach ($defaults as $d) {
    if ($db instanceof mysqli) {
        [$chaveDefault, $valorDefault, $descricaoDefault] = $d;
        $insertDefault->bind_param('sss', $chaveDefault, $valorDefault, $descricaoDefault);
        if (!$insertDefault->execute()) {
            error_log('Falha ao inserir configuração padrão: ' . $insertDefault->error);
            http_response_code(500);
            exit('Não foi possível inicializar as configurações.');
        }
    } elseif ($db instanceof PDO && !$insertDefault->execute($d)) {
        error_log('Falha ao inserir configuração padrão: ' . implode(' ', $insertDefault->errorInfo()));
        http_response_code(500);
        exit('Não foi possível inicializar as configurações.');
    }
}
if ($db instanceof mysqli) {
    $insertDefault->close();
} elseif ($db instanceof PDO) {
    $insertDefault->closeCursor();
}

// ========== BUSCAR CONFIGURAÇÕES ==========
$configuracoes = [];
if ($db instanceof mysqli) {
    $result = $db->query("SELECT * FROM configuracoes ORDER BY id");
    while ($row = $result->fetch_assoc()) {
        $configuracoes[$row['chave']] = $row['valor'];
    }
} elseif ($db instanceof PDO) {
    $stmt = $db->query("SELECT * FROM configuracoes ORDER BY id");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $configuracoes[$row['chave']] = $row['valor'];
    }
}

// Use os mesmos valores permitidos pela tela do aluno.
$opcoesPermitidas = [
    'tamanho_fonte' => ['pequeno', 'medio', 'grande'],
    'daltonismo' => ['normal', 'protanopia', 'deuteranopia', 'tritanopia'],
    'espacamento' => ['compacto', 'normal', 'confortavel'],
];
$valoresPadrao = [
    'tamanho_fonte' => 'medio',
    'daltonismo' => 'normal',
    'espacamento' => 'normal',
    'reduzir_animacoes' => '0',
];
foreach ($valoresPadrao as $campo => $padrao) {
    if ($campo !== 'reduzir_animacoes' && !in_array($configuracoes[$campo] ?? null, $opcoesPermitidas[$campo], true)) {
        $configuracoes[$campo] = $padrao;
    } elseif ($campo === 'reduzir_animacoes' && !in_array($configuracoes[$campo] ?? null, ['0', '1'], true)) {
        $configuracoes[$campo] = $padrao;
    }
}
$config_classes = function_exists('aplicarConfiguracoes') ? aplicarConfiguracoes() : $config_classes;
if (function_exists('aplicarTemaAdminCookie')) {
    $config_classes = aplicarTemaAdminCookie($config_classes);
}

// ========== PROCESSAR FORMULÁRIO ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['salvar'])) {
    if (!csrf_validar()) {
        $_SESSION['msg_erro'] = 'Sessão expirada ou token de segurança inválido. Recarregue a página e tente novamente.';
        header('Location: configuracoes_adm.php');
        exit;
    }

    $novasConfiguracoes = [];
    foreach ($opcoesPermitidas as $campo => $opcoes) {
        $valor = $_POST[$campo] ?? $configuracoes[$campo];
        if (!is_string($valor) || !in_array($valor, $opcoes, true)) {
            $_SESSION['msg_erro'] = 'Uma das preferências enviadas não é válida.';
            header('Location: configuracoes_adm.php');
            exit;
        }
        $novasConfiguracoes[$campo] = $valor;
    }
    $novasConfiguracoes['reduzir_animacoes'] = isset($_POST['reduzir_animacoes']) ? '1' : '0';

    if ($db instanceof mysqli) {
        if (!$db->begin_transaction()) {
            error_log('Falha ao iniciar atualização de configurações: ' . $db->error);
            $_SESSION['msg_erro'] = 'Não foi possível salvar as preferências. Tente novamente.';
            header('Location: configuracoes_adm.php');
            exit;
        }
        $stmt = $db->prepare("UPDATE configuracoes SET valor = ? WHERE chave = ?");
        if (!$stmt) {
            $db->rollback();
            error_log('Falha ao preparar atualização de configurações: ' . $db->error);
            $_SESSION['msg_erro'] = 'Não foi possível salvar as preferências. Tente novamente.';
            header('Location: configuracoes_adm.php');
            exit;
        }
        $ok = true;
        $valor = '';
        $campo = '';
        $stmt->bind_param('ss', $valor, $campo);
        foreach ($novasConfiguracoes as $campo => $valor) {
            if (!$stmt->execute()) {
                $ok = false;
                error_log('Falha ao salvar preferência ' . $campo . ': ' . $stmt->error);
                break;
            }
        }
        $stmt->close();
        if (!$ok || !$db->commit()) {
            $db->rollback();
            $_SESSION['msg_erro'] = 'Não foi possível salvar as preferências. Tente novamente.';
            header('Location: configuracoes_adm.php');
            exit;
        }
    } elseif ($db instanceof PDO) {
        try {
            $db->beginTransaction();
            $stmt = $db->prepare("UPDATE configuracoes SET valor = ? WHERE chave = ?");
            foreach ($novasConfiguracoes as $campo => $valor) {
                $stmt->execute([$valor, $campo]);
            }
            $db->commit();
        } catch (Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            error_log('Falha ao salvar preferências administrativas: ' . $e->getMessage());
            $_SESSION['msg_erro'] = 'Não foi possível salvar as preferências. Tente novamente.';
            header('Location: configuracoes_adm.php');
            exit;
        }
    }

    $_SESSION['msg_sucesso'] = 'Preferências salvas com sucesso!';
    $destino = config_destino_local_seguro($_POST['redirect_apos_salvar'] ?? null);
    header('Location: ' . ($destino ?? 'configuracoes_adm.php'));
    exit;
}

// ========== MENSAGENS FLASH ==========
$msg_sucesso = $_SESSION['msg_sucesso'] ?? null;
$msg_erro = $_SESSION['msg_erro'] ?? null;
unset($_SESSION['msg_sucesso'], $_SESSION['msg_erro']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurações — SiGA ITJ Admin</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/adm/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/adm/configuracoes_adm.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/shared/config_unsaved_changes.css?v=<?= filemtime(__DIR__ . '/../assets/css/shared/config_unsaved_changes.css') ?>">
    <script src="../assets/js/adm/configuracoes_adm.js?v=<?= time() ?>" defer></script>
    <script src="../assets/js/shared/config_unsaved_changes.js?v=<?= filemtime(__DIR__ . '/../assets/js/shared/config_unsaved_changes.js') ?>" defer></script>
    <link rel="stylesheet" href="../assets/css/adm/admin_temas_paginas.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/adm/preferencias_adm.css?v=<?= time() ?>">
</head>
<body class="<?= $config_classes ?>">

    <!-- ========== SIDEBAR ========== -->
            <aside class="sidebar" id="sidebar" aria-label="Menu principal">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="fas fa-book-reader"></i>
                <span>SIGA ITJ</span>
            </div>
            <button class="collapse-icon" id="collapseBtn" title="Recolher menu" aria-label="Recolher menu">
                <span></span><span></span>
            </button>
        </div>

        <nav class="sidebar-nav" id="sidebar-nav">
            <a href="dashboard_adm.php" class="nav-item"><i class="fas fa-home"></i><span>Dashboard</span></a>
            <a href="reservas_adm.php" class="nav-item"><i class="fas fa-bookmark"></i><span>Reservas</span></a>
            <a href="pendencias_adm.php" class="nav-item"><i class="fas fa-exclamation-circle"></i><span>Pendências</span></a>
            <a href="catalogo_adm.php" class="nav-item"><i class="fas fa-book"></i><span>Catálogo</span></a>
            <a href="extrato_adm.php" class="nav-item"><i class="fas fa-history"></i><span>Extrato</span></a>
            <a href="notificacoes_adm.php" class="nav-item"><i class="fas fa-bell"></i><span>Notificações</span></a>
            <a href="logout_adm.php" class="nav-item nav-logout"><i class="fas fa-sign-out-alt"></i><span>Sair</span></a>
        </nav>
    </aside>

    <!-- ========== CONTEÚDO PRINCIPAL ========== -->
    <div class="main-content">

        <!-- ========== TOP HEADER ========== -->
        <header class="top-header">
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="search-input" placeholder="Pesquisar por aluno..." autocomplete="off">
                <div class="search-results-dropdown" id="search-results" style="display:none;"></div>
            </div>

            <div class="header-right">
                <?php require __DIR__ . '/../includes/admin_appearance_controls.php'; ?>
                <div class="admin-profile" id="admin-profile-btn">
                    <div class="admin-avatar">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <div class="admin-info">
                        <span class="admin-label">Administradora</span>
                        <strong class="admin-name"><?= htmlspecialchars($nome_bibliotecaria) ?></strong>
                    </div>
                    <i class="fas fa-chevron-down admin-chevron"></i>
                </div>

                <div class="profile-dropdown" id="profile-dropdown">
                    <a href="perfil_adm.php"><i class="fas fa-user-cog"></i> Meu Perfil</a>
                    <a href="configuracoes_adm.php"><i class="fas fa-sliders-h"></i> Configurações</a>
                    <div class="dropdown-divider"></div>
                    <a href="logout_adm.php" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                </div>

                <!-- ========== NOTIFICAÇÃO (sininho) ========== -->
                <div class="notification-container">
                    <button class="notification-btn" id="notification-btn" title="Notificações">
                        <i class="fas fa-bell"></i>
                        <?php if (count($notificacoes) > 0): ?>
                            <span class="badge"><?= count($notificacoes) ?></span>
                        <?php endif; ?>
                    </button>
                    <div class="notification-dropdown" id="notification-dropdown">
                        <div class="notification-header">
                            <h4><i class="fas fa-bell"></i> Últimas notificações</h4>
                        </div>
                        <div class="notification-list" id="notification-list-dropdown">
                            <!-- Preenchido via JS -->
                        </div>
                        <a class="notification-view-all" href="notificacoes_adm.php">Ver todas as notificações</a>
                    </div>
                </div>
            </div>
        </header>

        <!-- ========== MAIN ========== -->
        <main class="dashboard-main">
            <div class="config-container">
                <div class="config-header">
                    <h1><i class="fas fa-sliders-h"></i> Preferências do Sistema</h1>
                    <p>Ajuste a visualização e acessibilidade do painel administrativo</p>
                </div>

                <!-- ========== MENSAGENS FLASH ========== -->
                <?php if ($msg_sucesso): ?>
                    <div class="flash-message flash-success">
                        <i class="fas fa-check-circle"></i>
                        <?= htmlspecialchars($msg_sucesso) ?>
                    </div>
                <?php elseif ($msg_erro): ?>
                    <div class="flash-message flash-error">
                        <i class="fas fa-exclamation-circle"></i>
                        <?= htmlspecialchars($msg_erro) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="" id="formPreferencias">
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
                    <!-- ========== TAMANHO DA FONTE ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-font"></i> Tamanho da Fonte</h3>
                        <p class="desc">Altere o tamanho da fonte em todo o sistema</p>
                        <div class="form-group">
                            <div class="opcoes-grid">
                                <label class="opcao-card <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'pequeno' ? 'active' : '' ?>">
                                    <input type="radio" name="tamanho_fonte" value="pequeno" <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'pequeno' ? 'checked' : '' ?>>
                                    <i class="fas fa-font" style="font-size: 12px;"></i>
                                    <span>Pequeno</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'medio' ? 'active' : '' ?>">
                                    <input type="radio" name="tamanho_fonte" value="medio" <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'medio' ? 'checked' : '' ?>>
                                    <i class="fas fa-font" style="font-size: 16px;"></i>
                                    <span>Médio</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'grande' ? 'active' : '' ?>">
                                    <input type="radio" name="tamanho_fonte" value="grande" <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'grande' ? 'checked' : '' ?>>
                                    <i class="fas fa-font" style="font-size: 22px;"></i>
                                    <span>Grande</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ========== DALTONISMO ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-eye"></i> Daltonismo</h3>
                        <p class="desc">Ajuste as cores para diferentes tipos de daltonismo</p>
                        <div class="form-group">
                            <div class="opcoes-grid">
                                <label class="opcao-card <?= ($configuracoes['daltonismo'] ?? 'normal') === 'normal' ? 'active' : '' ?>">
                                    <input type="radio" name="daltonismo" value="normal" <?= ($configuracoes['daltonismo'] ?? 'normal') === 'normal' ? 'checked' : '' ?>>
                                    <i class="fas fa-eye"></i>
                                    <span>Normal</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['daltonismo'] ?? 'normal') === 'protanopia' ? 'active' : '' ?>">
                                    <input type="radio" name="daltonismo" value="protanopia" <?= ($configuracoes['daltonismo'] ?? 'normal') === 'protanopia' ? 'checked' : '' ?>>
                                    <span style="color: #ff6b6b;">🔴</span>
                                    <span>Protanopia</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['daltonismo'] ?? 'normal') === 'deuteranopia' ? 'active' : '' ?>">
                                    <input type="radio" name="daltonismo" value="deuteranopia" <?= ($configuracoes['daltonismo'] ?? 'normal') === 'deuteranopia' ? 'checked' : '' ?>>
                                    <span style="color: #51cf66;">🟢</span>
                                    <span>Deuteranopia</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['daltonismo'] ?? 'normal') === 'tritanopia' ? 'active' : '' ?>">
                                    <input type="radio" name="daltonismo" value="tritanopia" <?= ($configuracoes['daltonismo'] ?? 'normal') === 'tritanopia' ? 'checked' : '' ?>>
                                    <span style="color: #4dabf7;">🔵</span>
                                    <span>Tritanopia</span>
                                </label>
                            </div>
                            <div class="daltonismo-preview" aria-live="polite">
                                <span>Prévia dos status:</span>
                                <span class="status-badge status-pendente">Pendente</span>
                                <span class="status-badge status-emprestado">Emprestado</span>
                                <span class="status-badge status-atrasado">Atrasado</span>
                            </div>
                        </div>
                    </div>

                    <!-- ========== ESPAÇAMENTO ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-arrows-alt-h"></i> Espaçamento</h3>
                        <p class="desc">Ajuste a densidade da informação na tela</p>
                        <div class="form-group">
                            <div class="opcoes-grid">
                                <label class="opcao-card <?= ($configuracoes['espacamento'] ?? 'normal') === 'compacto' ? 'active' : '' ?>">
                                    <input type="radio" name="espacamento" value="compacto" <?= ($configuracoes['espacamento'] ?? 'normal') === 'compacto' ? 'checked' : '' ?>>
                                    <i class="fas fa-compress-arrows-alt"></i>
                                    <span>Compacto</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['espacamento'] ?? 'normal') === 'normal' ? 'active' : '' ?>">
                                    <input type="radio" name="espacamento" value="normal" <?= ($configuracoes['espacamento'] ?? 'normal') === 'normal' ? 'checked' : '' ?>>
                                    <i class="fas fa-arrows-alt-h"></i>
                                    <span>Normal</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['espacamento'] ?? 'normal') === 'confortavel' ? 'active' : '' ?>">
                                    <input type="radio" name="espacamento" value="confortavel" <?= ($configuracoes['espacamento'] ?? 'normal') === 'confortavel' ? 'checked' : '' ?>>
                                    <i class="fas fa-expand-arrows-alt"></i>
                                    <span>Confortável</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ========== REDUZIR ANIMAÇÕES ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-stop-circle"></i> Acessibilidade</h3>
                        <p class="desc">Reduza ou desative animações para melhor performance e acessibilidade</p>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" name="reduzir_animacoes" value="1" <?= ($configuracoes['reduzir_animacoes'] ?? '0') == '1' ? 'checked' : '' ?>>
                                <span class="slider"></span>
                                <span class="toggle-label">Reduzir animações</span>
                            </label>
                        </div>
                    </div>

                    <!-- ========== BOTÃO SALVAR ========== -->
                    <div class="config-actions">
                        <div class="aviso-nao-salvo" id="avisoNaoSalvo" hidden role="status">
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

    <script>
        // ========== DADOS DAS NOTIFICAÇÕES ==========
        const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
        window.alunosBuscaData = <?= json_encode($alunos_busca, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>

    <div class="unsaved-dialog" id="unsaved-changes-dialog" role="dialog" aria-modal="true" aria-labelledby="unsaved-dialog-title" aria-describedby="unsaved-dialog-description" hidden>
        <div class="unsaved-dialog__panel">
            <div class="unsaved-dialog__icon" aria-hidden="true"><i class="fas fa-floppy-disk"></i></div>
            <h2 id="unsaved-dialog-title">Alterações não salvas</h2>
            <p id="unsaved-dialog-description">Você alterou as preferências do sistema. Deseja aplicar as mudanças antes de sair?</p>
            <div class="unsaved-dialog__actions">
                <button type="button" class="unsaved-dialog__button unsaved-dialog__button--save" data-unsaved-action="save">Salvar e sair</button>
                <button type="button" class="unsaved-dialog__button unsaved-dialog__button--discard" data-unsaved-action="discard">Sair sem salvar</button>
                <button type="button" class="unsaved-dialog__button unsaved-dialog__button--stay" data-unsaved-action="stay">Continuar editando</button>
            </div>
        </div>
    </div>

</body>
</html>
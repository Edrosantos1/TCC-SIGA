<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';
$config_classes = $GLOBALS['config_classes'] ?? '';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';

// ========== FILTRO POR ALUNO ==========
$filtro_aluno_id = isset($_GET['aluno_id']) ? intval($_GET['aluno_id']) : 0;
$filtro_aluno_nome = '';

// ========== FILTRO POR STATUS (vindo do dashboard) ==========
$filtro_status = isset($_GET['filtro']) ? trim($_GET['filtro']) : 'todos';
$filtros_validos_status = ['todos', 'atrasado', 'hoje', 'emprestado'];
if (!in_array($filtro_status, $filtros_validos_status, true)) {
    $filtro_status = 'todos';
}
$segmento_filtro = isset($_GET['segmento']) ? trim($_GET['segmento']) : '';
if (!in_array($segmento_filtro, ['Ensino Fundamental II', 'Ensino Médio'], true)) {
    $segmento_filtro = '';
}

// ========== IDENTIFICAR CONEXÃO ==========
$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

// ========== NOTIFICAÇÕES (sininho) ==========
$notificacoes = array();
if ($db) {
    try {
        $sql = "
            SELECT n.id_envio, n.titulo, n.mensagem, n.tipo,
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
        }
    } catch (Exception $e) {
        $notificacoes = [];
    }
}

// ========== PENDÊNCIAS ==========
$pendencias = array();
if ($db) {
    $query = "
        SELECT 
            e.id_emprestimo AS id,
            l.nome_aluno AS aluno,
            l.serie_aluno AS serie,
            e.titulo_item AS material,
            'Livro' AS tipo,
            e.data_emprestimo,
            e.data_devolucao_prevista AS data_limite,
            e.status
        FROM emprestimos e
        INNER JOIN login_aluno l ON e.id_aluno = l.id_aluno
        WHERE e.status IN ('emprestado', 'atrasado', 'devolucao_solicitada')
    ";
    $params = [];
    $param_types = '';
    if ($filtro_aluno_id > 0) {
        $query .= " AND e.id_aluno = ?";
        $params[] = $filtro_aluno_id;
        $param_types .= 'i';
    }
    if ($segmento_filtro !== '') {
        $query .= " AND CASE
            WHEN l.serie_aluno IN ('6º ano','7º ano','8º ano','9º ano') THEN 'Ensino Fundamental II'
            WHEN l.serie_aluno IN ('1º ano','2º ano','3º ano') THEN 'Ensino Médio'
            ELSE 'Outros'
        END = ?";
        $params[] = $segmento_filtro;
        $param_types .= 's';
    }
    $query .= " ORDER BY e.data_devolucao_prevista ASC";

    if ($db instanceof mysqli) {
        $stmt = $db->prepare($query);
        if (!$stmt) {
            error_log('Falha ao preparar a consulta de pendências: ' . $db->error);
        } else {
            if ($params) {
                $stmt->bind_param($param_types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result) $pendencias = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->prepare($query);
        if (!$stmt) {
            error_log('Falha ao preparar a consulta de pendências.');
        } else {
            $stmt->execute($params);
            $pendencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
}

// ========== CONTAGENS + DIAS RESTANTES/ATRASADOS ==========
$total_no_prazo = 0;
$total_atrasados = 0;
$total_vence_hoje = 0;
$data_hoje = date('Y-m-d');

foreach ($pendencias as &$p) {
    $hoje_ts  = strtotime($data_hoje);
    $limite_ts = strtotime($p['data_limite']);
    $dias_diff = (int)floor(($limite_ts - $hoje_ts) / 86400);
    $prazo_vencido = $dias_diff < 0;
    $dias_prazo_exibicao = $dias_diff;

    $p['atraso_pendente'] = $p['status'] === 'devolucao_solicitada' && $prazo_vencido;
    if ($p['status'] === 'atrasado' && !$prazo_vencido) {
        $p['status'] = 'emprestado';
    } elseif ($p['status'] !== 'devolucao_solicitada' && $p['status'] !== 'devolvido' && $prazo_vencido) {
        $p['status'] = 'atrasado';
    }

    if ($p['status'] === 'atrasado' || $p['atraso_pendente']) {
        $p['dias_restantes'] = $dias_prazo_exibicao;
        $p['dias_atraso'] = abs($dias_prazo_exibicao);
        $total_atrasados++;
    } else {
        $p['dias_restantes'] = $dias_prazo_exibicao;
        $p['dias_atraso'] = 0;
        if ($p['status'] !== 'devolucao_solicitada') {
            $total_no_prazo++;
        }
        if ($dias_prazo_exibicao === 0) $total_vence_hoje++;
    }
}
unset($p);

$total_geral = count($pendencias);
$pendencias_json = json_encode($pendencias, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// ========== ALUNOS (para filtro + busca global com status) ==========
$alunos = array();
if ($db) {
    $sql_alunos = "
        SELECT a.id_aluno, a.nome_aluno, a.serie_aluno,
               EXISTS(SELECT 1 FROM reservas r WHERE r.id_aluno = a.id_aluno AND r.status IN ('pendente','aprovada')) AS tem_reservas,
               EXISTS(SELECT 1 FROM emprestimos m WHERE m.id_aluno = a.id_aluno AND m.status IN ('emprestado','atrasado','devolucao_solicitada')) AS tem_emprestimos
        FROM login_aluno a
        ORDER BY a.nome_aluno
    ";
    if ($db instanceof mysqli) {
        $result_alunos = $db->query($sql_alunos);
        if ($result_alunos) {
            while ($row = $result_alunos->fetch_assoc()) {
                $row['tem_reservas'] = (bool)$row['tem_reservas'];
                $row['tem_emprestimos'] = (bool)$row['tem_emprestimos'];
                $alunos[] = $row;
            }
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($sql_alunos);
        if ($stmt) {
            $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($alunos as &$a) {
                $a['tem_reservas'] = (bool)$a['tem_reservas'];
                $a['tem_emprestimos'] = (bool)$a['tem_emprestimos'];
            }
            unset($a);
        }
    }
}
$alunos_json = json_encode($alunos, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// Nome do aluno filtrado
if ($filtro_aluno_id > 0) {
    foreach ($alunos as $a) {
        if ((int)$a['id_aluno'] === $filtro_aluno_id) { $filtro_aluno_nome = $a['nome_aluno']; break; }
    }
    if ($filtro_aluno_nome === '' && isset($_GET['aluno_nome'])) $filtro_aluno_nome = (string)$_GET['aluno_nome'];
}

// ========== FLASH ==========
$msg_sucesso = $_SESSION['msg_sucesso'] ?? null;
$msg_erro    = $_SESSION['msg_erro'] ?? null;
unset($_SESSION['msg_sucesso'], $_SESSION['msg_erro']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
    <title>Pendências — SiGA ITJ Admin</title>

    <script>
        try {
            if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
                document.documentElement.classList.add('sidebar-collapsed-init');
            }
        } catch (e) {}
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/adm/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/adm/reservas_adm.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/adm/pendencias_adm.css?v=<?= time() ?>">
    <script src="../assets/js/adm/pendencias_adm.js?v=<?= time() ?>" defer></script>
    <link rel="stylesheet" href="../assets/css/adm/admin_temas_paginas.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/adm/preferencias_adm.css?v=<?= time() ?>">
</head>
<body class="<?= $config_classes ?>">

    <!-- SIDEBAR -->
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
            <a href="pendencias_adm.php" class="nav-item active"><i class="fas fa-exclamation-circle"></i><span>Pendências</span></a>
            <a href="catalogo_adm.php" class="nav-item"><i class="fas fa-book"></i><span>Catálogo</span></a>
            <a href="extrato_adm.php" class="nav-item"><i class="fas fa-history"></i><span>Extrato</span></a>
            <a href="notificacoes_adm.php" class="nav-item"><i class="fas fa-bell"></i><span>Notificações</span></a>
            <a href="logout_adm.php" class="nav-item nav-logout"><i class="fas fa-sign-out-alt"></i><span>Sair</span></a>
        </nav>
    </aside>

    <!-- MAIN -->
    <div class="main-content">

        <!-- TOP HEADER -->
        <header class="top-header">
            <!-- BUSCA GLOBAL DE ALUNO -->
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="search-input" placeholder="Pesquisar por aluno..." autocomplete="off">
                <div class="search-results-dropdown" id="search-results" style="display:none;"></div>
            </div>

            <div class="header-right">
                <?php require __DIR__ . '/../includes/admin_appearance_controls.php'; ?>
                <div class="admin-profile" id="admin-profile-btn" tabindex="0" role="button" aria-haspopup="true">
                    <div class="admin-avatar"><i class="fas fa-user-shield"></i></div>
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

                <div class="notification-container">
                    <button class="notification-btn" id="notification-btn" title="Notificações" aria-label="Ver notificações">
                        <i class="fas fa-bell"></i>
                        <?php if (count($notificacoes) > 0): ?>
                            <span class="badge-notif"><?= count($notificacoes) ?></span>
                        <?php endif; ?>
                    </button>
                    <div class="notification-dropdown" id="notification-dropdown">
                        <div class="notification-header">
                            <h4><i class="fas fa-bell"></i> Últimas notificações</h4>
                        </div>
                        <div class="notification-list" id="notification-list-dropdown"></div>
                        <a class="notification-view-all" href="notificacoes_adm.php">Ver todas as notificações</a>
                    </div>
                </div>
            </div>
        </header>

        <main class="dashboard-main">

            <!-- PAGE HEADER -->
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-exclamation-circle"></i> Empréstimos &amp; Pendências</h1>
                    <p class="page-subtitle">
                        Acompanhe os materiais emprestados e registre as devoluções em um clique.
                        <?php if ($filtro_aluno_id > 0): ?>
                            <br><strong class="filtro-aluno-tag">
                                <i class="fas fa-user"></i> <?= htmlspecialchars($filtro_aluno_nome) ?>
                            </strong>
                        <?php endif; ?>
                        <?php if ($segmento_filtro !== ''): ?>
                            <br><strong class="filtro-aluno-tag">
                                <i class="fas fa-users"></i> <?= htmlspecialchars($segmento_filtro) ?>
                            </strong>
                        <?php endif; ?>
                    </p>
                </div>
                <?php if ($filtro_aluno_id > 0 || $segmento_filtro !== ''): ?>
                    <a href="pendencias_adm.php<?= $filtro_status !== 'todos' ? '?filtro=' . rawurlencode($filtro_status) : '' ?>" class="btn-limpar-filtro">
                        <i class="fas fa-times"></i> Limpar Filtro
                    </a>
                <?php endif; ?>
            </div>

            <!-- FILTROS -->
            <div class="filtros-container">
                <div class="filtros-tabs" id="filtros-tabs" role="tablist" aria-label="Filtrar por situação">
                    <button class="filtro-tab <?= $filtro_status === 'todos' ? 'active' : '' ?>" data-status="todos" role="tab" aria-selected="<?= $filtro_status === 'todos' ? 'true' : 'false' ?>">
                        <i class="fas fa-list"></i> Todos
                        <span class="tab-badge" id="badge-todos"><?= $total_geral ?></span>
                    </button>
                    <button class="filtro-tab <?= $filtro_status === 'atrasado' ? 'active' : '' ?>" data-status="atrasado" role="tab" aria-selected="<?= $filtro_status === 'atrasado' ? 'true' : 'false' ?>">
                        <i class="fas fa-exclamation-triangle"></i> Atrasados
                        <span class="tab-badge atrasado" id="badge-atrasado"><?= $total_atrasados ?></span>
                    </button>
                    <button class="filtro-tab <?= $filtro_status === 'hoje' ? 'active' : '' ?>" data-status="hoje" role="tab" aria-selected="<?= $filtro_status === 'hoje' ? 'true' : 'false' ?>">
                        <i class="fas fa-hourglass-half"></i> Vence hoje
                        <span class="tab-badge hoje" id="badge-hoje"><?= $total_vence_hoje ?></span>
                    </button>
                    <button class="filtro-tab <?= $filtro_status === 'emprestado' ? 'active' : '' ?>" data-status="emprestado" role="tab" aria-selected="<?= $filtro_status === 'emprestado' ? 'true' : 'false' ?>">
                        <i class="fas fa-clock"></i> No Prazo
                        <span class="tab-badge emprestado" id="badge-emprestado"><?= $total_no_prazo ?></span>
                    </button>
                </div>

                <div class="filtros-acoes">
                    <!-- FILTRO DA TABELA -->
                    <div class="filtro-tabela-wrapper">
                        <i class="fas fa-filter"></i>
                        <input type="search" id="filtro-tabela" placeholder="Filtrar por aluno ou material..." autocomplete="off" aria-label="Filtrar empréstimos da tabela">
                    </div>

                    <div class="filtro-busca-ativa" id="filtro-busca-ativa" style="display: none;">
                        <span><i class="fas fa-search"></i> "<strong id="busca-termo"></strong>"</span>
                        <span class="busca-count" id="busca-count">0</span>
                        <button class="limpar-busca" id="limpar-busca" aria-label="Limpar busca">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="ordenacao-wrapper">
                        <button class="btn-ordenacao" id="btn-ordenacao" title="Ordenar empréstimos" aria-haspopup="true">
                            <i class="fas fa-sort"></i>
                            <span id="ordenacao-label">Mais recente</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="ordenacao-dropdown" id="ordenacao-dropdown">
                            <button class="ordenacao-item active" data-ordem="recente">
                                <i class="fas fa-arrow-down"></i> Mais recente
                            </button>
                            <button class="ordenacao-item" data-ordem="antigo">
                                <i class="fas fa-arrow-up"></i> Mais antigo
                            </button>
                            <button class="ordenacao-item" data-ordem="urgencia">
                                <i class="fas fa-fire"></i> Mais urgentes
                            </button>
                            <button class="ordenacao-item" data-ordem="aluno">
                                <i class="fas fa-user"></i> Aluno (A–Z)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- LISTA -->
            <div class="reservas-list-container">
                <div class="reservas-table-wrapper" id="table-wrapper">
                    <table class="reservas-table" aria-label="Lista de pendências">
                        <thead>
                            <tr>
                                <th class="col-aluno">Aluno</th>
                                <th>Material</th>
                                <th class="text-center">Tipo</th>
                                <th class="text-center">Empréstimo</th>
                                <th class="text-center">Devolução</th>
                                <th class="text-center">Status</th>
                                <th class="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="pendencias-tbody"></tbody>
                    </table>
                </div>

                <!-- Empty state -->
                <div class="empty-state" id="empty-state" style="display: none;">
                    <div class="empty-illustration">
                        <i class="fas fa-inbox" id="empty-icon"></i>
                    </div>
                    <h3 id="empty-title">Tudo em ordem! 🎉</h3>
                    <p id="empty-message">Nenhum empréstimo ativo no momento.</p>
                    <a href="catalogo_adm.php" class="empty-cta" id="empty-catalogo">
                        <i class="fas fa-book"></i> Ir para o Catálogo
                    </a>
                </div>
            </div>

        </main>
    </div>

    <!-- MODAL: CONFIRMAR DEVOLUÇÃO -->
    <div class="modal-overlay" id="modal-devolucao" hidden>
        <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-devolucao-titulo">
            <div class="modal-header">
                <div class="modal-icon"><i class="fas fa-undo-alt"></i></div>
                <div class="modal-header-text">
                    <h3 id="modal-devolucao-titulo">Registrar devolução</h3>
                    <p>Confirme os dados antes de finalizar.</p>
                </div>
            </div>

            <div class="modal-info">
                <div class="modal-info-row">
                    <span class="modal-info-label"><i class="fas fa-book"></i> Material</span>
                    <span class="modal-info-value" id="modal-material"></span>
                </div>
                <div class="modal-info-row">
                    <span class="modal-info-label"><i class="fas fa-user-graduate"></i> Aluno</span>
                    <span class="modal-info-value" id="modal-aluno"></span>
                </div>
                <div class="modal-info-row" id="modal-prazo-linha">
                    <span class="modal-info-label"><i class="fas fa-calendar-day"></i> Prazo de devolução</span>
                    <span class="modal-info-value">
                        <span id="modal-prazo"></span>
                        <span class="modal-prazo-badge" id="modal-prazo-badge"></span>
                    </span>
                </div>
            </div>

            <p class="modal-aviso"><i class="fas fa-info-circle"></i> Esta ação não pode ser desfeita.</p>

            <div class="modal-acoes">
                <button type="button" class="btn-modal btn-cancelar" id="modal-cancelar">Cancelar</button>
                <button type="button" class="btn-modal btn-confirmar" id="modal-confirmar">
                    <i class="fas fa-check"></i> Confirmar devolução
                </button>
            </div>
        </div>
    </div>

<script>
    const pendenciasData   = <?= $pendencias_json ?>;
    const alunosData       = <?= $alunos_json ?>;
    const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    const msgSucesso       = <?= json_encode($msg_sucesso, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    const msgErro          = <?= json_encode($msg_erro, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    window.filtroInicialPendencias = <?= json_encode($filtro_status) ?>;
</script>

</body>
</html>
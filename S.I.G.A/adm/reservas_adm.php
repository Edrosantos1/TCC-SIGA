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

// ========== IDENTIFICAR CONEXÃO ==========
$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

// ============================================
// ARQUIVAMENTO AUTOMÁTICO (corrigido – sem loop)
// ============================================
if (file_exists(__DIR__ . '/executar_arquivamento.php')) {
    if (!isset($_SESSION['_arquivamento_executado'])) {
        $_SESSION['_arquivamento_executado'] = true;
        $arquivou = include __DIR__ . '/executar_arquivamento.php';
        unset($_SESSION['_arquivamento_executado']);
    }
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

// ========== CANCELAR RESERVAS EXPIRADAS ==========
if (file_exists(__DIR__ . '/cancelar_reservas_expiradas.php')) {
    include_once __DIR__ . '/cancelar_reservas_expiradas.php';
}

// ========== EMPRÉSTIMOS ATRASADOS (selo do menu "Pendências") ==========
$total_atrasados = 0;
if ($db) {
    try {
        $sql_atrasados = "
            SELECT COUNT(*) AS total
            FROM emprestimos
            WHERE status = 'atrasado'
               OR (status = 'emprestado' AND data_devolucao_prevista < '" . date('Y-m-d') . "')
        ";
        if ($db instanceof mysqli) {
            $res_atr = $db->query($sql_atrasados);
            if ($res_atr) {
                $row_atr = $res_atr->fetch_assoc();
                $total_atrasados = (int)($row_atr['total'] ?? 0);
            }
        } elseif ($db instanceof PDO) {
            $stmt_atr = $db->query($sql_atrasados);
            if ($stmt_atr) {
                $row_atr = $stmt_atr->fetch(PDO::FETCH_ASSOC);
                $total_atrasados = (int)($row_atr['total'] ?? 0);
            }
        }
    } catch (Exception $e) {
        $total_atrasados = 0;
    }
}

// ========== RESERVAS ==========
$reservas = array();

if ($db) {
    $query = "
        SELECT 
            r.id_reserva AS id,
            l.nome_aluno AS aluno,
            l.serie_aluno AS serie,
            r.id_aluno,
            r.titulo_item AS material,
            r.data_reserva,
            r.data_limite,
            r.status
        FROM reservas r
        INNER JOIN login_aluno l ON r.id_aluno = l.id_aluno
    ";
    if ($filtro_aluno_id > 0) {
        $query .= " WHERE r.id_aluno = " . intval($filtro_aluno_id);
    }
    $query .= " ORDER BY r.data_reserva DESC";

    if ($db instanceof mysqli) {
        $result = $db->query($query);
        if ($result) $reservas = $result->fetch_all(MYSQLI_ASSOC);
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($query);
        if ($stmt) $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

// ========== CONTAGENS ==========
$total_pendentes = 0;
$total_aprovadas = 0;
$total_rejeitadas = 0;
$total_expiradas = 0;
$total_retiradas = 0;

foreach ($reservas as $r) {
    if ($r['status'] === 'pendente') {
        $total_pendentes++;
    } elseif ($r['status'] === 'aprovada') {
        $total_aprovadas++;
    } elseif ($r['status'] === 'rejeitada') {
        $total_rejeitadas++;
    } elseif ($r['status'] === 'expirada') {
        $total_expiradas++;
    } elseif ($r['status'] === 'retirada') {
        $total_retiradas++;
    }
}

$total_geral = count($reservas);
$reservas_json = json_encode($reservas, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// ========== ALUNOS ==========
$alunos = array();
if ($db) {
    $sql_alunos = "SELECT id_aluno, nome_aluno, serie_aluno FROM login_aluno ORDER BY nome_aluno";
    if ($db instanceof mysqli) {
        $result_alunos = $db->query($sql_alunos);
        if ($result_alunos) {
            while ($row = $result_alunos->fetch_assoc()) $alunos[] = $row;
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($sql_alunos);
        if ($stmt) $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
$alunos_json = json_encode($alunos, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// Nome do aluno filtrado: busca no banco (o PHP já decodifica o $_GET, não usar urldecode de novo)
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
    <title>Reservas — SiGA ITJ Admin</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/reservas_adm.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/modal_reserva.css?v=<?= time() ?>">
</head>
<body class="<?= $config_classes ?>">

    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar" aria-label="Menu principal">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="fas fa-book-reader"></i>
                <span>SiGA ITJ</span>
            </div>
            <button class="collapse-icon" id="collapseBtn" title="Recolher menu" aria-label="Recolher menu">
                <span></span><span></span>
            </button>
        </div>

        <nav class="sidebar-nav" id="sidebar-nav">
            <a href="dashboard_adm.php" class="nav-item"><i class="fas fa-home"></i><span>Dashboard</span></a>
            <a href="reservas_adm.php" class="nav-item active"><i class="fas fa-bookmark"></i><span>Reservas</span></a>
            <a href="pendencias_adm.php" class="nav-item"><i class="fas fa-exclamation-circle"></i><span>Pendências</span></a>
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
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="search-input" placeholder="Pesquisar por aluno ou livro…  ( / )" autocomplete="off" aria-label="Pesquisar por aluno ou livro">
            </div>

            <div class="header-right">
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
                    </div>
                </div>
            </div>
        </header>

        <main class="dashboard-main">

            <!-- PAGE HEADER -->
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-bookmark"></i> Gerenciar Reservas</h1>
                    <p class="page-subtitle">
                        Aprove ou rejeite as solicitações dos alunos e confirme as retiradas.
                        <?php if ($filtro_aluno_id > 0): ?>
                            <br><strong class="filtro-aluno-tag">
                                <i class="fas fa-user"></i> <?= htmlspecialchars($filtro_aluno_nome) ?>
                            </strong>
                        <?php endif; ?>
                    </p>
                </div>
                <div class="page-actions">
                    <?php if ($filtro_aluno_id > 0): ?>
                        <a href="reservas_adm.php" class="btn-limpar-filtro">
                            <i class="fas fa-times"></i> Limpar Filtro
                        </a>
                    <?php endif; ?>
                    <a href="executar_arquivamento.php" class="btn-arquivar">
                        <i class="fas fa-archive"></i> Arquivar Agora
                    </a>
                    <button type="button" class="btn-primary" id="btn-nova-reserva">
                        <i class="fas fa-plus"></i> Nova Reserva Manual
                    </button>
                </div>
            </div>

            <!-- AVISO DE ARQUIVAMENTO -->
            <div class="aviso-arquivamento" id="avisoArquivamento" role="note">
                <i class="fas fa-info-circle"></i>
                <span>
                    <strong>Arquivamento mensal:</strong> as reservas com status diferente de <strong>"pendente"</strong>
                    vão para o <a href="extrato_adm.php">Extrato</a> automaticamente, 1 mês após o último arquivamento.
                </span>
                <button type="button" class="fechar-aviso" id="fechar-aviso" title="Fechar aviso" aria-label="Fechar aviso">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- FILTROS -->
            <div class="filtros-container">
                <div class="filtros-tabs" id="filtros-tabs" role="tablist" aria-label="Filtrar por situação">
                    <button type="button" class="filtro-tab active" data-status="todos" role="tab" aria-selected="true">
                        <i class="fas fa-list"></i> Todos
                        <span class="tab-badge" id="badge-todos"><?= $total_geral ?></span>
                    </button>
                    <button type="button" class="filtro-tab" data-status="pendente" role="tab" aria-selected="false">
                        <i class="fas fa-hourglass-half"></i> Pendentes
                        <span class="tab-badge pendente" id="badge-pendente"><?= $total_pendentes ?></span>
                    </button>
                    <button type="button" class="filtro-tab" data-status="aprovada" role="tab" aria-selected="false">
                        <i class="fas fa-check-circle"></i> Aprovadas
                        <span class="tab-badge aprovada" id="badge-aprovada"><?= $total_aprovadas ?></span>
                    </button>
                    <button type="button" class="filtro-tab" data-status="rejeitada" role="tab" aria-selected="false">
                        <i class="fas fa-times-circle"></i> Rejeitadas
                        <span class="tab-badge rejeitada" id="badge-rejeitada"><?= $total_rejeitadas ?></span>
                    </button>
                    <button type="button" class="filtro-tab" data-status="expirada" role="tab" aria-selected="false">
                        <i class="fas fa-clock"></i> Expiradas
                        <span class="tab-badge expirada" id="badge-expirada"><?= $total_expiradas ?></span>
                    </button>
                    <button type="button" class="filtro-tab" data-status="retirada" role="tab" aria-selected="false">
                        <i class="fas fa-hand-holding-heart"></i> Retiradas
                        <span class="tab-badge retirada" id="badge-retirada"><?= $total_retiradas ?></span>
                    </button>
                </div>

                <div class="filtros-acoes">
                    <span class="resultado-info" id="resultado-info" aria-live="polite"></span>

                    <div class="filtro-busca-ativa" id="filtro-busca-ativa" style="display: none;">
                        <span><i class="fas fa-search"></i> "<strong id="busca-termo"></strong>"</span>
                        <span class="busca-count" id="busca-count">0</span>
                        <button type="button" class="limpar-busca" id="limpar-busca" aria-label="Limpar busca">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="ordenacao-wrapper">
                        <button type="button" class="btn-ordenacao" id="btn-ordenacao" title="Ordenar reservas" aria-haspopup="true">
                            <i class="fas fa-sort"></i>
                            <span id="ordenacao-label">Mais recente</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="ordenacao-dropdown" id="ordenacao-dropdown">
                            <button type="button" class="ordenacao-item active" data-ordem="recente">
                                <i class="fas fa-arrow-down"></i> Mais recente
                            </button>
                            <button type="button" class="ordenacao-item" data-ordem="antigo">
                                <i class="fas fa-arrow-up"></i> Mais antigo
                            </button>
                            <button type="button" class="ordenacao-item" data-ordem="limite">
                                <i class="fas fa-calendar-day"></i> Prazo mais próximo
                            </button>
                            <button type="button" class="ordenacao-item" data-ordem="aluno">
                                <i class="fas fa-user"></i> Aluno (A–Z)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- LISTA -->
            <div class="reservas-list-container">
                <div class="reservas-table-wrapper" id="table-wrapper">
                    <form id="formReservasMassa" method="POST" action="atualizar_status_reserva.php">
                        <div class="acoes-massa" role="toolbar" aria-label="Ações em massa">
                            <button type="submit" name="acao" value="aprovar" class="btn-acao-massa btn-aprovar-massa" disabled>
                                <i class="fas fa-check"></i> Aprovar selecionados
                            </button>
                            <button type="submit" name="acao" value="rejeitar" class="btn-acao-massa btn-rejeitar-massa" disabled>
                                <i class="fas fa-times"></i> Rejeitar selecionados
                            </button>
                            <span class="selecionados-info" id="selecionados-info" aria-live="polite">Nenhum selecionado</span>
                        </div>

                        <div class="tabela-scroll">
                            <table class="reservas-table" aria-label="Lista de reservas">
                                <thead>
                                    <tr>
                                        <th class="col-check">
                                            <input type="checkbox" id="selecionarTodos" class="checkbox-reserva-todos" aria-label="Selecionar todas as reservas pendentes">
                                        </th>
                                        <th class="col-aluno">Aluno</th>
                                        <th>Material</th>
                                        <th class="text-center">Tipo</th>
                                        <th class="text-center">Reserva</th>
                                        <th class="text-center">Limite</th>
                                        <th class="text-center">Status</th>
                                        <th class="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="reservas-tbody"></tbody>
                            </table>
                        </div>
                    </form>
                </div>

                <!-- Empty state -->
                <div class="empty-state" id="empty-state" style="display: none;">
                    <div class="empty-illustration">
                        <i class="fas fa-inbox" id="empty-icon"></i>
                    </div>
                    <h3 id="empty-title">Nenhuma reserva ainda</h3>
                    <p id="empty-message">As solicitações feitas pelos alunos vão aparecer aqui.</p>
                    <button type="button" class="empty-cta" id="empty-limpar" style="display: none;">
                        <i class="fas fa-filter-circle-xmark"></i> Limpar filtros
                    </button>
                    <button type="button" class="empty-cta" id="empty-nova" style="display: none;">
                        <i class="fas fa-plus"></i> Nova reserva manual
                    </button>
                </div>
            </div>

        </main>
    </div>

    <!-- MODAL: CONFIRMAR AÇÃO (aprovar / rejeitar / retirada) -->
    <div class="cfm-overlay" id="modal-confirmacao" hidden>
        <div class="cfm-box" role="dialog" aria-modal="true" aria-labelledby="cfm-titulo" data-variante="aprovar">
            <div class="cfm-header">
                <div class="cfm-icon"><i class="fas fa-check" id="cfm-icone"></i></div>
                <div class="cfm-header-text">
                    <h3 id="cfm-titulo">Aprovar reserva</h3>
                    <p id="cfm-subtitulo">Confirme os dados antes de continuar.</p>
                </div>
            </div>

            <div class="cfm-info" id="cfm-info"></div>

            <div class="cfm-acoes">
                <button type="button" class="cfm-btn cfm-btn-cancelar" id="cfm-cancelar">Cancelar</button>
                <button type="button" class="cfm-btn cfm-btn-confirmar" id="cfm-confirmar">
                    <i class="fas fa-check"></i> Confirmar
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL NOVA RESERVA -->
    <div class="modal-overlay" id="modalReserva">
        <div class="modal-reserva">
            <div class="modal-header">
                <h2><i class="fas fa-plus-circle"></i> Nova Reserva Manual</h2>
                <button class="modal-close" id="modalCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="formNovaReserva" method="POST" action="salvar_reserva_manual.php">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Buscar Aluno <span class="required">*</span></label>
                        <div class="busca-aluno-container">
                            <input type="text" id="buscaAluno" placeholder="Digite o nome do aluno..." autocomplete="off">
                            <div class="aluno-suggestions" id="alunoSuggestions"></div>
                        </div>
                        <div class="aluno-selecionado" id="alunoSelecionado">
                            <div class="info-aluno">
                                <div class="avatar" id="alunoAvatar">?</div>
                                <div class="detalhes">
                                    <span class="nome" id="alunoNomeSelecionado">Nome do Aluno</span>
                                    <span class="matricula" id="alunoMatriculaSelecionada">Série: ---</span>
                                </div>
                            </div>
                            <button class="btn-remover" id="removerAluno"><i class="fas fa-times"></i></button>
                        </div>
                        <input type="hidden" id="idAlunoSelecionado" name="id_aluno" value="">
                    </div>
                    <div class="form-group">
                        <label>Material <span class="required">*</span></label>
                        <input type="text" name="material" id="materialReserva" placeholder="Ex: O Pequeno Príncipe, Física Vol. 1" required />
                    </div>
                    <div class="form-group">
                        <label>Tipo de Material</label>
                        <select name="tipo" id="tipoMaterial">
                            <option value="Livro">📚 Livro</option>
                            <option value="E-book">📱 E-book</option>
                            <option value="Apostila">📄 Apostila</option>
                            <option value="Periódico">📰 Periódico</option>
                            <option value="CD/DVD">💿 CD/DVD</option>
                            <option value="Outro">📦 Outro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data Limite <span class="required">*</span></label>
                        <input type="date" name="data_limite" id="dataLimite" required />
                        <div class="helper-text">A data deve ser hoje ou no futuro</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-modal btn-modal-cancel" id="modalCancelBtn">Cancelar</button>
                    <button type="submit" class="btn-modal btn-modal-save" id="modalSaveBtn">
                        <i class="fas fa-save"></i> Salvar Reserva
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- TOAST CONTAINER -->
    <div class="toast-container"></div>

    <!-- MENSAGENS FLASH -->
    <?php if ($msg_sucesso): ?>
        <div id="flash-msg" data-type="success" data-message="<?= htmlspecialchars($msg_sucesso) ?>" style="display:none;"></div>
    <?php elseif ($msg_erro): ?>
        <div id="flash-msg" data-type="error" data-message="<?= htmlspecialchars($msg_erro) ?>" style="display:none;"></div>
    <?php endif; ?>

    <!-- DADOS PARA O JAVASCRIPT -->
    <script>
        const reservasData     = <?= $reservas_json ?>;
        const alunosData       = <?= $alunos_json ?>;
        const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>

    <!-- SCRIPTS -->
    <script src="../assets/js/reservas_adm.js?v=<?= time() ?>"></script>
    <script src="../assets/js/modal_reserva.js?v=<?= time() ?>"></script>

</body>
</html>
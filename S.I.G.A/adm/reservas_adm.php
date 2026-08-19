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
$filtro_aluno_nome = isset($_GET['aluno_nome']) ? urldecode($_GET['aluno_nome']) : '';

// ========== IDENTIFICAR CONEXÃO ==========
$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

// ========== BUSCAR NOTIFICAÇÕES PARA O SININHO ==========
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

// ========== CANCELAR RESERVAS EXPIRADAS ==========
if (file_exists(__DIR__ . '/cancelar_reservas_expiradas.php')) {
    include_once __DIR__ . '/cancelar_reservas_expiradas.php';
}

// ========== BUSCAR RESERVAS ==========
$reservas = array();

if ($db) {
    $query = "
        SELECT 
            r.id_reserva AS id,
            l.nome_aluno AS aluno,
            r.id_aluno,
            r.titulo_item AS material,
            'Livro' AS tipo,
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
        if ($result) {
            $reservas = $result->fetch_all(MYSQLI_ASSOC);
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($query);
        if ($stmt) {
            $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
}

// ========== CONTAGENS ==========
$total_pendentes = 0;
$total_aprovadas = 0;
$total_rejeitadas = 0;
$total_expiradas = 0;

foreach ($reservas as $r) {
    if ($r['status'] === 'pendente') {
        $total_pendentes++;
    } elseif ($r['status'] === 'aprovada') {
        $total_aprovadas++;
    } elseif ($r['status'] === 'rejeitada') {
        $total_rejeitadas++;
    } elseif ($r['status'] === 'expirada') {
        $total_expiradas++;
    }
}

$total_geral = count($reservas);
$reservas_json = json_encode($reservas, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// ========== CARREGAR TODOS OS ALUNOS PARA O JS ==========
$alunos = array();
if ($db) {
    $sql_alunos = "SELECT id_aluno, nome_aluno, serie_aluno FROM login_aluno ORDER BY nome_aluno";
    if ($db instanceof mysqli) {
        $result_alunos = $db->query($sql_alunos);
        if ($result_alunos) {
            while ($row = $result_alunos->fetch_assoc()) {
                $alunos[] = $row;
            }
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($sql_alunos);
        if ($stmt) {
            $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
}
$alunos_json = json_encode($alunos, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

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
    <title>Reservas — SiGA ITJ Admin</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/reservas_adm.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/modal_reserva.css?v=<?= time() ?>">
    <style>
        /* Estilos para ações em massa */
        .acoes-massa {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: #f8faff;
            border-bottom: 1px solid #edf2f7;
            border-radius: 14px 14px 0 0;
            flex-wrap: wrap;
        }
        .btn-acao-massa {
            padding: 8px 18px;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn-acao-massa:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
        }
        .btn-aprovar-massa {
            background: #eafaf1;
            color: #27ae60;
            border: 1px solid #d4f0e0;
        }
        .btn-aprovar-massa:not(:disabled):hover {
            background: #27ae60;
            color: white;
            border-color: #27ae60;
            transform: scale(1.02);
        }
        .btn-rejeitar-massa {
            background: #fef0ef;
            color: #e74c3c;
            border: 1px solid #fde2df;
        }
        .btn-rejeitar-massa:not(:disabled):hover {
            background: #e74c3c;
            color: white;
            border-color: #e74c3c;
            transform: scale(1.02);
        }
        .selecionados-info {
            font-size: 13px;
            color: #94a3b8;
            margin-left: auto;
        }
        .reservas-table tbody td:first-child,
        .reservas-table thead th:first-child {
            text-align: center;
            width: 40px;
        }
        .checkbox-reserva {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body class="<?= $config_classes ?>">

    <!-- ========== SIDEBAR ========== -->
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

        <nav class="sidebar-nav" id="sidebar-nav">
            <a href="dashboard_adm.php" class="nav-item">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
            </a>
            <a href="reservas_adm.php" class="nav-item active">
                <i class="fas fa-bookmark"></i>
                <span>Reservas</span>
                <span class="nav-badge" id="reservas-badge"><?= $total_pendentes ?></span>
            </a>
            <a href="pendencias_adm.php" class="nav-item">
                <i class="fas fa-exclamation-circle"></i>
                <span>Pendências</span>
            </a>
            <a href="catalogo_adm.php" class="nav-item">
                <i class="fas fa-book"></i>
                <span>Catálogo</span>
            </a>
            <a href="notificacoes_adm.php" class="nav-item">
                <i class="fas fa-bell"></i>
                <span>Notificações</span>
            </a>
            <div class="nav-divider"></div>
            <a href="logout_adm.php" class="nav-item nav-logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Sair</span>
            </a>
        </nav>
    </aside>

    <!-- ========== CONTEÚDO PRINCIPAL ========== -->
    <div class="main-content">

        <!-- ========== TOP HEADER ========== -->
        <header class="top-header">
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="search-input" placeholder="Pesquisar reservas por aluno..." autocomplete="off">
            </div>

            <div class="header-right">
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
                            <span class="badge" style="
                                position: absolute;
                                top: -4px;
                                right: -4px;
                                background: #e74c3c;
                                color: white;
                                font-size: 10px;
                                font-weight: 700;
                                min-width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 0 5px;
                            "><?= count($notificacoes) ?></span>
                        <?php endif; ?>
                    </button>
                    <div class="notification-dropdown" id="notification-dropdown">
                        <div class="notification-header">
                            <h4><i class="fas fa-bell"></i> Últimas notificações</h4>
                        </div>
                        <div class="notification-list" id="notification-list-dropdown">
                            <!-- Preenchido via JS -->
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- ========== MAIN ========== -->
        <main class="dashboard-main">

            <!-- ========== CABEÇALHO DA PÁGINA ========== -->
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-bookmark"></i> Gerenciar Reservas</h1>
                    <p class="page-subtitle">
                        Gerencie todas as solicitações de reserva dos alunos
                        <?php if ($filtro_aluno_id > 0): ?>
                            <br><strong style="color: #0b4b9b;">📌 Aluno: <?= htmlspecialchars($filtro_aluno_nome) ?></strong>
                        <?php endif; ?>
                    </p>
                </div>
                <div class="page-actions">
                    <?php if ($filtro_aluno_id > 0): ?>
                        <a href="reservas_adm.php" style="background: #f0f4fd; border: none; padding: 10px 20px; border-radius: 10px; text-decoration: none; color: #0b4b9b; font-weight: 600; display: inline-block; margin-right: 10px;">
                            <i class="fas fa-times"></i> Limpar Filtro
                        </a>
                    <?php endif; ?>
                    <button class="btn-primary" id="btn-nova-reserva">
                        <i class="fas fa-plus"></i> Nova Reserva Manual
                    </button>
                </div>
            </div>

            <!-- ========== FILTROS ========== -->
            <div class="filtros-container">
                <div class="filtros-tabs" id="filtros-tabs">
                    <button class="filtro-tab active" data-status="todos">
                        <i class="fas fa-list"></i> Todos
                        <span class="tab-badge" id="badge-todos"><?= $total_geral ?></span>
                    </button>
                    <button class="filtro-tab" data-status="pendente">
                        <i class="fas fa-hourglass-half"></i> Pendentes
                        <span class="tab-badge pendente" id="badge-pendente"><?= $total_pendentes ?></span>
                    </button>
                    <button class="filtro-tab" data-status="aprovada">
                        <i class="fas fa-check-circle"></i> Aprovadas
                        <span class="tab-badge aprovada" id="badge-aprovada"><?= $total_aprovadas ?></span>
                    </button>
                    <button class="filtro-tab" data-status="rejeitada">
                        <i class="fas fa-times-circle"></i> Rejeitadas
                        <span class="tab-badge rejeitada" id="badge-rejeitada"><?= $total_rejeitadas ?></span>
                    </button>
                    <button class="filtro-tab" data-status="expirada">
                        <i class="fas fa-clock"></i> Expiradas
                        <span class="tab-badge expirada" id="badge-expirada"><?= $total_expiradas ?></span>
                    </button>
                </div>

                <div class="filtros-acoes">
                    <!-- ========== BOTÃO DE ORDENAÇÃO ========== -->
                    <div class="ordenacao-wrapper">
                        <button class="btn-ordenacao" id="btn-ordenacao" title="Ordenar reservas">
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
                        </div>
                    </div>

                    <div class="filtro-busca-ativa" id="filtro-busca-ativa" style="display: none;">
                        <span><i class="fas fa-search"></i> Buscando por: "<strong id="busca-termo"></strong>"</span>
                        <button class="limpar-busca" id="limpar-busca"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            </div>

            <!-- ========== LISTA DE RESERVAS ========== -->
            <div class="reservas-list-container">
                <div class="reservas-table-wrapper">
                    <form id="formReservasMassa" method="POST" action="atualizar_status_reserva.php">
                        <div class="acoes-massa">
                            <button type="submit" name="acao" value="aprovar" class="btn-acao-massa btn-aprovar-massa" disabled>
                                <i class="fas fa-check"></i> Aprovar Selecionados
                            </button>
                            <button type="submit" name="acao" value="rejeitar" class="btn-acao-massa btn-rejeitar-massa" disabled>
                                <i class="fas fa-times"></i> Rejeitar Selecionados
                            </button>
                            <span class="selecionados-info" id="selecionados-info">Nenhum selecionado</span>
                        </div>

                        <table class="reservas-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px; text-align: center;">
                                        <input type="checkbox" id="selecionarTodos">
                                    </th>
                                    <th>Aluno</th>
                                    <th>Material</th>
                                    <th>Tipo</th>
                                    <th>Data da Reserva</th>
                                    <th>Data Limite</th>
                                    <th>Status</th>
                                    <th class="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody id="reservas-tbody">
                                <!-- Renderizado via JavaScript -->
                            </tbody>
                        </table>
                    </form>
                </div>
                <div class="empty-state" id="empty-state" style="display: none;">
                    <i class="fas fa-inbox"></i>
                    <h3>Nenhuma reserva encontrada</h3>
                    <p id="empty-message">Não há reservas para os filtros selecionados</p>
                </div>
            </div>

        </main>
    </div>

    <!-- ========== MODAL NOVA RESERVA (COM BUSCA LOCAL) ========== -->
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
                    <!-- Busca de Aluno -->
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
                    <!-- Material -->
                    <div class="form-group">
                        <label>Material <span class="required">*</span></label>
                        <input type="text" name="material" id="materialReserva" placeholder="Ex: O Pequeno Príncipe, Física Vol. 1" required />
                    </div>
                    <!-- Tipo -->
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
                    <!-- Data Limite -->
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

    <!-- ========== TOAST CONTAINER ========== -->
    <div class="toast-container"></div>

    <!-- ========== MENSAGENS FLASH ========== -->
    <?php if ($msg_sucesso): ?>
        <div id="flash-msg" data-type="success" data-message="<?= htmlspecialchars($msg_sucesso) ?>" style="display:none;"></div>
    <?php elseif ($msg_erro): ?>
        <div id="flash-msg" data-type="error" data-message="<?= htmlspecialchars($msg_erro) ?>" style="display:none;"></div>
    <?php endif; ?>

    <!-- ========== DADOS PARA O JAVASCRIPT ========== -->
    <script>
        const reservasData = <?= $reservas_json ?>;
        const alunosData = <?= $alunos_json ?>;
        const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>

    <!-- ========== SCRIPTS ========== -->
    <script src="../assets/js/reservas_adm.js?v=<?= time() ?>"></script>
    <script src="../assets/js/modal_reserva.js?v=<?= time() ?>"></script>

</body>
</html>
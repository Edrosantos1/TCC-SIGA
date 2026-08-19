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

// ========== BUSCAR EMPRÉSTIMOS/PENDÊNCIAS ==========
$pendencias = array();

if ($db) {
    $query = "
        SELECT 
            e.id_emprestimo AS id,
            l.nome_aluno AS aluno,
            e.titulo_item AS material,
            'Livro' AS tipo,
            e.data_emprestimo,
            e.data_devolucao_prevista AS data_limite,
            e.status
        FROM emprestimos e
        INNER JOIN login_aluno l ON e.id_aluno = l.id_aluno
        WHERE e.status IN ('emprestado', 'atrasado')
    ";
    
    if ($filtro_aluno_id > 0) {
        $query .= " AND e.id_aluno = " . intval($filtro_aluno_id);
    }
    
    $query .= " ORDER BY e.data_devolucao_prevista ASC";
    
    if ($db instanceof mysqli) {
        $result = $db->query($query);
        if ($result) {
            $pendencias = $result->fetch_all(MYSQLI_ASSOC);
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($query);
        if ($stmt) {
            $pendencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
}

// ========== CONTAGENS E ATUALIZAÇÃO DINÂMICA DE STATUS ==========
$total_no_prazo = 0;
$total_atrasados = 0;
$data_hoje = date('Y-m-d');

foreach ($pendencias as &$p) {
    if ($p['status'] !== 'devolvido' && $p['data_limite'] < $data_hoje) {
        $p['status'] = 'atrasado';
    }
    
    if ($p['status'] === 'atrasado') {
        $total_atrasados++;
    } else {
        $total_no_prazo++;
    }
}
unset($p);

$total_geral = count($pendencias);
$pendencias_json = json_encode($pendencias, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// ========== CARREGAR ALUNOS PARA O JS ==========
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
    <title>Pendências — SiGA ITJ Admin</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/reservas_adm.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/pendencias_adm.css?v=<?= time() ?>">
    <script src="../assets/js/pendencias_adm.js?v=<?= time() ?>" defer></script>
    <style>
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
            <a href="reservas_adm.php" class="nav-item">
                <i class="fas fa-bookmark"></i>
                <span>Reservas</span>
            </a>
            <a href="pendencias_adm.php" class="nav-item active">
                <i class="fas fa-exclamation-circle"></i>
                <span>Pendências</span>
                <?php if ($total_atrasados > 0): ?>
                    <span class="nav-badge alert" id="pendencias-badge"><?= $total_atrasados ?></span>
                <?php endif; ?>
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
                <input type="text" id="search-input" placeholder="Pesquisar pendências por aluno..." autocomplete="off">
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

            <!-- ========== CABEÇALHO DA PÁGINA ========== -->
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-exclamation-circle"></i> Empréstimos & Pendências</h1>
                    <p class="page-subtitle">
                        Acompanhe os materiais emprestados e registre as devoluções
                        <?php if ($filtro_aluno_id > 0): ?>
                            <br><strong style="color: #0b4b9b;">📌 Aluno: <?= htmlspecialchars($filtro_aluno_nome) ?></strong>
                        <?php endif; ?>
                    </p>
                </div>
                <?php if ($filtro_aluno_id > 0): ?>
                    <div>
                        <a href="pendencias_adm.php" style="background: #f0f4fd; border: none; padding: 10px 20px; border-radius: 10px; text-decoration: none; color: #0b4b9b; font-weight: 600; display: inline-block;">
                            <i class="fas fa-times"></i> Limpar Filtro
                        </a>
                    </div>
                <?php endif; ?>
            </div>

            <!-- ========== FILTROS ========== -->
            <div class="filtros-container">
                <div class="filtros-tabs" id="filtros-tabs">
                    <button class="filtro-tab active" data-status="todos">
                        <i class="fas fa-list"></i> Todos
                        <span class="tab-badge" id="badge-todos"><?= $total_geral ?></span>
                    </button>
                    <button class="filtro-tab" data-status="atrasado">
                        <i class="fas fa-exclamation-triangle"></i> Atrasados
                        <span class="tab-badge cancelada" id="badge-atrasado"><?= $total_atrasados ?></span>
                    </button>
                    <button class="filtro-tab" data-status="emprestado">
                        <i class="fas fa-clock"></i> No Prazo
                        <span class="tab-badge aprovada" id="badge-emprestado"><?= $total_no_prazo ?></span>
                    </button>
                </div>

                <div class="filtros-acoes">
                    <!-- ========== BOTÃO DE ORDENAÇÃO ========== -->
                    <div class="ordenacao-wrapper">
                        <button class="btn-ordenacao" id="btn-ordenacao" title="Ordenar empréstimos">
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

            <!-- ========== LISTA DE PENDÊNCIAS ========== -->
            <div class="reservas-list-container">
                <div class="reservas-table-wrapper">
                    <table class="reservas-table">
                        <thead>
                            <tr>
                                <th>Aluno</th>
                                <th>Material</th>
                                <th>Tipo</th>
                                <th>Data Empréstimo</th>
                                <th>Devolução Prevista</th>
                                <th>Status</th>
                                <th class="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="pendencias-tbody">
                            <!-- Preenchido via JS -->
                        </tbody>
                    </table>
                </div>
                <div class="empty-state" id="empty-state" style="display: none;">
                    <i class="fas fa-inbox"></i>
                    <h3>Nenhum empréstimo ativo no momento</h3>
                    <p id="empty-message">Não há pendências cadastradas</p>
                </div>
            </div>

        </main>
    </div>

<script>
    const pendenciasData = <?= $pendencias_json ?>;
    const alunosData = <?= $alunos_json ?>;
    const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
</script>


</body>
</html>
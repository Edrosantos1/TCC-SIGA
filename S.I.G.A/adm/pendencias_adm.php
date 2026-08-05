<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';

// ========== FILTRO POR ALUNO ==========
$filtro_aluno_id = isset($_GET['aluno_id']) ? intval($_GET['aluno_id']) : 0;
$filtro_aluno_nome = isset($_GET['aluno_nome']) ? urldecode($_GET['aluno_nome']) : '';

// ========== IDENTIFICAR CONEXÃO (MYSQLI OU PDO) ==========
$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

// ========== BUSCAR EMPRÉSTIMOS/PENDÊNCIAS DO BANCO ==========

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
    <link rel="stylesheet" href="../assets/css/reservas_adm.css">
    <script src="../assets/js/pendencias_adm.js?v=<?= time() ?>" defer></script>
</head>
<body>

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

                <div class="notification-container">
                    <button class="notification-btn" id="notification-btn" title="Notificações">
                        <i class="fas fa-bell"></i>
                    </button>
                    <div class="notification-dropdown" id="notification-dropdown">
                        <div class="notification-header">
                            <h4><i class="fas fa-bell"></i> Notificações</h4>
                            <button class="mark-read-btn">Marcar todas como lidas</button>
                        </div>
                        <div class="notification-list" id="notification-list">
                            <div class="empty-notifications">
                                <i class="far fa-bell-slash"></i>
                                <p>Nenhuma notificação</p>
                            </div>
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

                <div class="filtro-busca-ativa" id="filtro-busca-ativa" style="display: none;">
                    <span><i class="fas fa-search"></i> Buscando por: "<strong id="busca-termo"></strong>"</span>
                    <button class="limpar-busca" id="limpar-busca"><i class="fas fa-times"></i></button>
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
    </script>

</body>
</html>
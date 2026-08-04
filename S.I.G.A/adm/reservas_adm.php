<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$nome_bibliotecaria = isset($_SESSION['admin_nome']) ? $_SESSION['admin_nome'] : 'Bibliotecária';

// ========== IDENTIFICAR A CONEXÃO MYSQLI ==========
$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

// ========== CANCELAR RESERVAS EXPIRADAS AUTOMATICAMENTE ==========
if (file_exists(__DIR__ . '/cancelar_reservas_expiradas.php')) {
    include_once __DIR__ . '/cancelar_reservas_expiradas.php';
}

// ========== BUSCAR RESERVAS DO BANCO (MYSQLI) ==========
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
        ORDER BY r.data_reserva DESC
    ";
    
    $result = $db->query($query);

    if ($result) {
        $reservas = $result->fetch_all(MYSQLI_ASSOC);
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

// Passar dados para o JavaScript
$reservas_json = json_encode($reservas, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
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
    <script src="../assets/js/reservas_adm.js?v=<?= time() ?>" defer></script>
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
            <a href="reservas_adm.php" class="nav-item active">
                <i class="fas fa-bookmark"></i>
                <span>Reservas</span>
                <span class="nav-badge" id="reservas-badge"><?= $total_pendentes ?></span>
            </a>
            <a href="pendencias_adm.php" class="nav-item">
                <i class="fas fa-exclamation-circle"></i>
                <span>Pendências</span>
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
                    <h1><i class="fas fa-bookmark"></i> Gerenciar Reservas</h1>
                    <p class="page-subtitle">Gerencie todas as solicitações de reserva dos alunos</p>
                </div>
                <div class="page-actions">
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

                <div class="filtro-busca-ativa" id="filtro-busca-ativa" style="display: none;">
                    <span><i class="fas fa-search"></i> Buscando por: "<strong id="busca-termo"></strong>"</span>
                    <button class="limpar-busca" id="limpar-busca"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <!-- ========== LISTA DE RESERVAS ========== -->
            <div class="reservas-list-container">
                <div class="reservas-table-wrapper">
                    <table class="reservas-table">
                        <thead>
                            <tr>
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
                </div>
                <div class="empty-state" id="empty-state" style="display: none;">
                    <i class="fas fa-inbox"></i>
                    <h3>Nenhuma reserva encontrada</h3>
                    <p id="empty-message">Não há reservas para os filtros selecionados</p>
                </div>
            </div>

        </main>
    </div>

    <!-- ========== DADOS PARA O JAVASCRIPT ========== -->
    <script>
        const reservasData = <?= $reservas_json ?>;
    </script>

</body>
</html>
<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$config_classes = $GLOBALS['config_classes'] ?? '';
$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';

// ========== CARREGAR TODOS OS ALUNOS COM STATUS ==========
$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

$alunos = array();
if ($db) {
    try {
        $sql_alunos = "SELECT id_aluno, nome_aluno, serie_aluno FROM login_aluno ORDER BY nome_aluno";
        if ($db instanceof mysqli) {
            $result_alunos = $db->query($sql_alunos);
            if ($result_alunos) {
                while ($row = $result_alunos->fetch_assoc()) {
                    $id = $row['id_aluno'];
                    // Contar reservas
                    $reservas_sql = "SELECT COUNT(*) as total FROM reservas WHERE id_aluno = ? AND status IN ('pendente', 'aprovada')";
                    $reservas_stmt = $db->prepare($reservas_sql);
                    $tem_reservas = false;
                    if ($reservas_stmt) {
                        $reservas_stmt->bind_param('i', $id);
                        $reservas_stmt->execute();
                        $reservas_result = $reservas_stmt->get_result();
                        $tem_reservas = ($reservas_result->fetch_assoc()['total'] > 0);
                        $reservas_stmt->close();
                    }
                    // Contar empréstimos
                    $emprestimos_sql = "SELECT COUNT(*) as total FROM emprestimos WHERE id_aluno = ? AND status IN ('emprestado', 'atrasado')";
                    $emprestimos_stmt = $db->prepare($emprestimos_sql);
                    $tem_emprestimos = false;
                    if ($emprestimos_stmt) {
                        $emprestimos_stmt->bind_param('i', $id);
                        $emprestimos_stmt->execute();
                        $emprestimos_result = $emprestimos_stmt->get_result();
                        $tem_emprestimos = ($emprestimos_result->fetch_assoc()['total'] > 0);
                        $emprestimos_stmt->close();
                    }
                    $row['tem_reservas'] = $tem_reservas;
                    $row['tem_emprestimos'] = $tem_emprestimos;
                    $alunos[] = $row;
                }
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->query($sql_alunos);
            if ($stmt) {
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $id = $row['id_aluno'];
                    $reservas_stmt = $db->prepare("SELECT COUNT(*) as total FROM reservas WHERE id_aluno = ? AND status IN ('pendente', 'aprovada')");
                    $tem_reservas = false;
                    if ($reservas_stmt) {
                        $reservas_stmt->execute([$id]);
                        $tem_reservas = ($reservas_stmt->fetchColumn() > 0);
                    }
                    $emprestimos_stmt = $db->prepare("SELECT COUNT(*) as total FROM emprestimos WHERE id_aluno = ? AND status IN ('emprestado', 'atrasado')");
                    $tem_emprestimos = false;
                    if ($emprestimos_stmt) {
                        $emprestimos_stmt->execute([$id]);
                        $tem_emprestimos = ($emprestimos_stmt->fetchColumn() > 0);
                    }
                    $row['tem_reservas'] = $tem_reservas;
                    $row['tem_emprestimos'] = $tem_emprestimos;
                    $alunos[] = $row;
                }
            }
        }
    } catch (Exception $e) {
        $alunos = array();
    }
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

$alunos_json = json_encode($alunos, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Admin — SiGA ITJ</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <script src="../assets/js/dashboard_adm.js?v=<?= time() ?>" defer></script>
</head>
<body class="<?= $config_classes ?>">

    <!-- SIDEBAR ADMIN -->
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
            <a href="dashboard_adm.php" class="nav-item active">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
            </a>
            <a href="reservas_adm.php" class="nav-item">
                <i class="fas fa-bookmark"></i>
                <span>Reservas</span>
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

    <!-- CONTEÚDO PRINCIPAL -->
    <div class="main-content">

        <!-- TOP HEADER -->
        <header class="top-header">
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="search-input" placeholder="Pesquisar por aluno..." autocomplete="off">
                <div class="search-results-dropdown" id="search-results" style="display:none;"></div>
            </div>

            <div class="header-right">
                <!-- PERFIL DO ADMIN -->
                <div class="admin-profile" id="admin-profile-btn">
                    <div class="admin-avatar">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <div class="admin-info">
                        <span class="admin-label">Administradora</span>
                        <strong class="admin-name" id="admin-name"><?= htmlspecialchars($nome_bibliotecaria) ?></strong>
                    </div>
                    <i class="fas fa-chevron-down admin-chevron"></i>
                </div>

                <!-- DROPDOWN PERFIL -->
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

        <!-- ÁREA PRINCIPAL -->
        <main class="dashboard-main">

            <!-- SAUDAÇÃO -->
            <section class="welcome-section">
                <div class="welcome-text">
                    <h1>Bem-vinda, <span id="welcome-name"><?= htmlspecialchars($nome_bibliotecaria) ?></span>!</h1>
                    <p>Aqui você pode pesquisar alunos cadastrados no sistema.</p>
                </div>
                <div class="welcome-date" id="welcome-date">
                    <!-- Data preenchida via JS -->
                </div>
            </section>
        </main>
    </div>

    <script>
        // ========== DADOS DOS ALUNOS INJETADOS ==========
        const alunosData = <?= $alunos_json ?>;
        
        // ========== DADOS DAS NOTIFICAÇÕES ==========
        const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>

</body>
</html>
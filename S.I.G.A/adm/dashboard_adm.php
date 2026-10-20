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
                    $emprestimos_sql = "SELECT COUNT(*) as total FROM emprestimos WHERE id_aluno = ? AND status IN ('emprestado', 'atrasado', 'devolucao_solicitada')";
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
                    $emprestimos_stmt = $db->prepare("SELECT COUNT(*) as total FROM emprestimos WHERE id_aluno = ? AND status IN ('emprestado', 'atrasado', 'devolucao_solicitada')");
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

// ============================================================
// ========== DASHBOARD BI — KPIs E GRÁFICOS ==================
// ============================================================

$sqlSegmento = "
  CASE 
    WHEN a.serie_aluno IN ('6º ano','7º ano','8º ano','9º ano') THEN 'Ensino Fundamental II'
    WHEN a.serie_aluno IN ('1º ano','2º ano','3º ano')          THEN 'Ensino Médio'
    ELSE 'Outros'
  END
";

$segmento_filtro = isset($_GET['segmento']) ? trim($_GET['segmento']) : '';
if (!in_array($segmento_filtro, ['Ensino Fundamental II', 'Ensino Médio'], true)) {
    $segmento_filtro = '';
}
$whereSeg = '';
$bind_tipos   = '';
$bind_valores = [];

if ($segmento_filtro !== '') {
    $whereSeg     = " AND ($sqlSegmento) = ? ";
    $bind_tipos   = 's';
    $bind_valores = [$segmento_filtro];
}
$bind_tipos_com_data = 's' . $bind_tipos;
$bind_valores_com_data = array_merge([date('Y-m-d')], $bind_valores);

$pendencias = $emprestimosAtivos = $reservasNovas = $atrasados = 0;
$porSegmento = [];
$porSerie    = [];

if ($db) {
    try {
        // -------- KPI 1: Pendências Totais --------
        $sql = "SELECT COUNT(*) AS total
                FROM emprestimos e
                JOIN login_aluno a ON a.id_aluno = e.id_aluno
                WHERE e.status IN ('emprestado','atrasado','devolucao_solicitada') $whereSeg";
        if ($db instanceof mysqli) {
            $stmt = $db->prepare($sql);
            if ($stmt) {
                if ($bind_tipos) $stmt->bind_param($bind_tipos, ...$bind_valores);
                $stmt->execute();
                $pendencias = (int) $stmt->get_result()->fetch_assoc()['total'];
                $stmt->close();
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare($sql);
            $stmt->execute($bind_valores);
            $pendencias = (int) $stmt->fetchColumn();
        }

        // -------- KPI 2: Empréstimos Ativos --------
        $sql = "SELECT COUNT(*) AS total
                FROM emprestimos e
                JOIN login_aluno a ON a.id_aluno = e.id_aluno
                                WHERE e.status = 'emprestado'
                                    AND e.data_devolucao_prevista >= ? $whereSeg";
        if ($db instanceof mysqli) {
            $stmt = $db->prepare($sql);
            if ($stmt) {
                $stmt->bind_param($bind_tipos_com_data, ...$bind_valores_com_data);
                $stmt->execute();
                $emprestimosAtivos = (int) $stmt->get_result()->fetch_assoc()['total'];
                $stmt->close();
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare($sql);
            $stmt->execute($bind_valores_com_data);
            $emprestimosAtivos = (int) $stmt->fetchColumn();
        }

        // -------- KPI 3: Reservas Novas --------
        $sql = "SELECT COUNT(*) AS total
                FROM reservas r
                JOIN login_aluno a ON a.id_aluno = r.id_aluno
                WHERE r.status = 'pendente' $whereSeg";
        if ($db instanceof mysqli) {
            $stmt = $db->prepare($sql);
            if ($stmt) {
                if ($bind_tipos) $stmt->bind_param($bind_tipos, ...$bind_valores);
                $stmt->execute();
                $reservasNovas = (int) $stmt->get_result()->fetch_assoc()['total'];
                $stmt->close();
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare($sql);
            $stmt->execute($bind_valores);
            $reservasNovas = (int) $stmt->fetchColumn();
        }

        // -------- KPI 4: Atrasados --------
        $sql = "SELECT COUNT(*) AS total
                FROM emprestimos e
                JOIN login_aluno a ON a.id_aluno = e.id_aluno
                                WHERE e.status IN ('emprestado','atrasado','devolucao_solicitada')
                                    AND e.data_devolucao_prevista < ? $whereSeg";
        if ($db instanceof mysqli) {
            $stmt = $db->prepare($sql);
            if ($stmt) {
                $stmt->bind_param($bind_tipos_com_data, ...$bind_valores_com_data);
                $stmt->execute();
                $atrasados = (int) $stmt->get_result()->fetch_assoc()['total'];
                $stmt->close();
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare($sql);
            $stmt->execute($bind_valores_com_data);
            $atrasados = (int) $stmt->fetchColumn();
        }

        // -------- GRÁFICO 1: Pendências por Segmento --------
        $sql = "SELECT ($sqlSegmento) AS segmento, COUNT(*) AS total
                FROM emprestimos e
                JOIN login_aluno a ON a.id_aluno = e.id_aluno
                WHERE e.status IN ('emprestado','atrasado','devolucao_solicitada')
                GROUP BY segmento ORDER BY segmento";
        if ($db instanceof mysqli) {
            $r = $db->query($sql);
            if ($r) $porSegmento = $r->fetch_all(MYSQLI_ASSOC);
        } elseif ($db instanceof PDO) {
            $porSegmento = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        }

        // -------- GRÁFICO 2: Pendências por Série --------
        $sql = "SELECT a.serie_aluno AS serie, COUNT(*) AS total
                FROM emprestimos e
                JOIN login_aluno a ON a.id_aluno = e.id_aluno
                WHERE e.status IN ('emprestado','atrasado','devolucao_solicitada') $whereSeg
                GROUP BY a.serie_aluno
                ORDER BY FIELD(a.serie_aluno,
                  '6º ano','7º ano','8º ano','9º ano',
                  '1º ano','2º ano','3º ano')";
        if ($db instanceof mysqli) {
            $stmt = $db->prepare($sql);
            if ($stmt) {
                if ($bind_tipos) $stmt->bind_param($bind_tipos, ...$bind_valores);
                $stmt->execute();
                $porSerie = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                $stmt->close();
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare($sql);
            $stmt->execute($bind_valores);
            $porSerie = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

    } catch (Exception $e) {
        error_log('Dashboard BI: ' . $e->getMessage());
    }
}

$labelsSegmento  = array_column($porSegmento, 'segmento');
$valoresSegmento = array_map('intval', array_column($porSegmento, 'total'));
$labelsSerie     = array_column($porSerie, 'serie');
$valoresSerie    = array_map('intval', array_column($porSerie, 'total'));
$segmentoQuery = $segmento_filtro !== '' ? http_build_query(['segmento' => $segmento_filtro]) : '';
$hrefPendencias = 'pendencias_adm.php' . ($segmentoQuery !== '' ? '?' . $segmentoQuery : '');
$hrefNoPrazo = 'pendencias_adm.php?filtro=emprestado' . ($segmentoQuery !== '' ? '&' . $segmentoQuery : '');
$hrefReservas = 'reservas_adm.php?filtro=pendente' . ($segmentoQuery !== '' ? '&' . $segmentoQuery : '');
$hrefAtrasados = 'pendencias_adm.php?filtro=atrasado' . ($segmentoQuery !== '' ? '&' . $segmentoQuery : '');

$alunos_json = json_encode($alunos, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Admin — SiGA ITJ</title>

    <script>
        // Evita o "pulo" da sidebar: aplica o estado antes do CSS renderizar
        try {
            if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
                document.documentElement.classList.add('sidebar-collapsed-init');
            }
        } catch (e) {}
    </script>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/adm/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/adm/preferencias_adm.css?v=<?= time() ?>">
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="../assets/js/adm/dashboard_adm.js?v=<?= time() ?>" defer></script>
</head>
<body class="<?= $config_classes ?>">

    <!-- SIDEBAR ADMIN -->
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
            <a href="dashboard_adm.php" class="nav-item active"><i class="fas fa-home"></i><span>Dashboard</span></a>
            <a href="reservas_adm.php" class="nav-item"><i class="fas fa-bookmark"></i><span>Reservas</span></a>
            <a href="pendencias_adm.php" class="nav-item"><i class="fas fa-exclamation-circle"></i><span>Pendências</span></a>
            <a href="catalogo_adm.php" class="nav-item"><i class="fas fa-book"></i><span>Catálogo</span></a>
            <a href="extrato_adm.php" class="nav-item"><i class="fas fa-history"></i><span>Extrato</span></a>
            <a href="notificacoes_adm.php" class="nav-item"><i class="fas fa-bell"></i><span>Notificações</span></a>
            <a href="logout_adm.php" class="nav-item nav-logout"><i class="fas fa-sign-out-alt"></i><span>Sair</span></a>
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
                <?php require __DIR__ . '/../includes/admin_appearance_controls.php'; ?>
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

                <div class="profile-dropdown" id="profile-dropdown">
                    <a href="perfil_adm.php"><i class="fas fa-user-cog"></i> Meu Perfil</a>
                    <a href="configuracoes_adm.php"><i class="fas fa-sliders-h"></i> Configurações</a>
                    <div class="dropdown-divider"></div>
                    <a href="logout_adm.php" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                </div>

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
                        <div class="notification-list" id="notification-list-dropdown"></div>
                        <a class="notification-view-all" href="notificacoes_adm.php">Ver todas as notificações</a>
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
                    <p>Aqui está o panorama do sistema em tempo real.</p>
                </div>
                <div class="welcome-date">
                    <span class="welcome-date-label">Hoje</span>
                    <strong id="welcome-date-value"><?= date('d/m/Y') ?></strong>
                </div>
            </section>

            <!-- AVISO DE FILTRO ATIVO -->
            <?php if ($segmento_filtro !== ''): ?>
              <div class="bi-filtro-alert">
                <span>Filtrando por segmento: <strong><?= htmlspecialchars($segmento_filtro) ?></strong></span>
                <a href="dashboard_adm.php">✕ Limpar filtro</a>
              </div>
            <?php endif; ?>

            <!-- KPIs -->
            <section class="stats-grid">
                <a href="<?= htmlspecialchars($hrefPendencias, ENT_QUOTES, 'UTF-8') ?>" class="stat-card-link">
                    <div class="stat-card stat-orange">
                        <i class="fas fa-exclamation-circle stat-icon"></i>
                        <div class="stat-info">
                            <span class="stat-number"><?= $pendencias ?></span>
                            <span class="stat-label">Pendências Totais</span>
                        </div>
                    </div>
                </a>
                <a href="<?= htmlspecialchars($hrefNoPrazo, ENT_QUOTES, 'UTF-8') ?>" class="stat-card-link">
                    <div class="stat-card stat-blue">
                        <i class="fas fa-book-open stat-icon"></i>
                        <div class="stat-info">
                            <span class="stat-number"><?= $emprestimosAtivos ?></span>
                            <span class="stat-label">Empréstimos no Prazo</span>
                        </div>
                    </div>
                </a>
                <a href="<?= htmlspecialchars($hrefReservas, ENT_QUOTES, 'UTF-8') ?>" class="stat-card-link">
                    <div class="stat-card stat-teal">
                        <i class="fas fa-bookmark stat-icon"></i>
                        <div class="stat-info">
                            <span class="stat-number"><?= $reservasNovas ?></span>
                            <span class="stat-label">Reservas Novas</span>
                        </div>
                    </div>
                </a>
                <a href="<?= htmlspecialchars($hrefAtrasados, ENT_QUOTES, 'UTF-8') ?>" class="stat-card-link">
                    <div class="stat-card stat-red">
                        <i class="fas fa-exclamation-triangle stat-icon"></i>
                        <div class="stat-info">
                            <span class="stat-number"><?= $atrasados ?></span>
                            <span class="stat-label">Empréstimos Atrasados</span>
                        </div>
                    </div>
                </a>
            </section>

            <!-- GRÁFICOS -->
            <div class="bi-charts-row">
                <div class="card-section">
                    <div class="section-header">
                        <h2><i class="fas fa-chart-pie"></i> Pendências por Segmento</h2>
                    </div>
                    <div id="chartDonut"></div>
                </div>
                <div class="card-section">
                    <div class="section-header">
                        <h2><i class="fas fa-chart-bar"></i> Pendências por Série</h2>
                    </div>
                    <div id="chartBarras"></div>
                </div>
            </div>

        </main>
    </div>

    <script>
        const alunosData = <?= $alunos_json ?>;
        const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;

        window.labelsSegmento  = <?= json_encode($labelsSegmento,  JSON_UNESCAPED_UNICODE) ?>;
        window.valoresSegmento = <?= json_encode($valoresSegmento) ?>;
        window.labelsSerie     = <?= json_encode($labelsSerie,     JSON_UNESCAPED_UNICODE) ?>;
        window.valoresSerie    = <?= json_encode($valoresSerie) ?>;
    </script>

</body>
</html>
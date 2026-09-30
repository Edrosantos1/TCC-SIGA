<?php
// extrato_adm.php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

// Identifica a conexão
$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

if (!$db) {
    die('<div style="padding: 20px; color: #721c24; background: #f8d7da; border-radius: 8px;">
            <strong>Erro:</strong> Não foi possível conectar ao banco de dados.
         </div>');
}

$filtro_mes = isset($_GET['mes']) ? $_GET['mes'] : '';
$filtro_aluno = isset($_GET['aluno_id']) ? intval($_GET['aluno_id']) : 0;
$filtro_status = isset($_GET['status']) ? $_GET['status'] : '';

// ========== MESES DISPONÍVEIS ==========
$meses_disponiveis = [];
if ($db) {
    $sql_meses = "SELECT DISTINCT mes_referencia FROM extrato_reservas ORDER BY mes_referencia DESC";
    if ($db instanceof mysqli) {
        $res = $db->query($sql_meses);
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $meses_disponiveis[] = $row['mes_referencia'];
            }
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($sql_meses);
        if ($stmt) {
            $meses_disponiveis = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }
    }
}

// ========== MONTAR QUERY ==========
$extrato = [];
$where = [];
$params = [];
$types = '';

if ($filtro_mes) {
    $where[] = "mes_referencia = ?";
    $params[] = $filtro_mes;
    $types .= 's';
}
if ($filtro_aluno > 0) {
    $where[] = "e.id_aluno = ?";
    $params[] = $filtro_aluno;
    $types .= 'i';
}
if ($filtro_status) {
    $where[] = "status = ?";
    $params[] = $filtro_status;
    $types .= 's';
}

$sql = "SELECT e.*, l.nome_aluno 
        FROM extrato_reservas e
        JOIN login_aluno l ON e.id_aluno = l.id_aluno";

if ($where) {
    $sql .= " WHERE " . implode(' AND ', $where);
}
$sql .= " ORDER BY e.data_arquivamento DESC, e.data_reserva DESC";

// Executa a consulta
if ($db) {
    try {
        if ($db instanceof mysqli) {
            $stmt = $db->prepare($sql);
            if ($stmt) {
                if ($params) {
                    $stmt->bind_param($types, ...$params);
                }
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result) {
                    $extrato = $result->fetch_all(MYSQLI_ASSOC);
                }
                $stmt->close();
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare($sql);
            if ($stmt) {
                $stmt->execute($params);
                $extrato = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        }
    } catch (Exception $e) {
        error_log('Erro no extrato: ' . $e->getMessage());
        $extrato = [];
    }
}

// ========== ALUNOS PARA FILTRO ==========
$alunos = [];
if ($db) {
    $sql_alunos = "SELECT id_aluno, nome_aluno FROM login_aluno ORDER BY nome_aluno";
    if ($db instanceof mysqli) {
        $res = $db->query($sql_alunos);
        if ($res) {
            while ($row = $res->fetch_assoc()) {
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

// ========== DADOS DO TOP HEADER (busca de alunos + sininho) ==========
function extrato_query_all($db, $sql) {
    if ($db instanceof mysqli) {
        $r = $db->query($sql);
        return $r ? $r->fetch_all(MYSQLI_ASSOC) : [];
    }
    if ($db instanceof PDO) {
        $s = $db->query($sql);
        return $s ? $s->fetchAll(PDO::FETCH_ASSOC) : [];
    }
    return [];
}

$alunos_busca = [];
$notificacoes = [];
if ($db) {
    try {
        $alunos_busca = extrato_query_all($db, "
            SELECT a.id_aluno, a.nome_aluno, a.serie_aluno,
                   EXISTS(SELECT 1 FROM reservas r
                          WHERE r.id_aluno = a.id_aluno AND r.status IN ('pendente', 'aprovada')) AS tem_reservas,
                   EXISTS(SELECT 1 FROM emprestimos m
                          WHERE m.id_aluno = a.id_aluno AND m.status IN ('emprestado', 'atrasado')) AS tem_emprestimos
            FROM login_aluno a
            ORDER BY a.nome_aluno
        ");
        foreach ($alunos_busca as &$ab) {
            $ab['tem_reservas']    = (bool)$ab['tem_reservas'];
            $ab['tem_emprestimos'] = (bool)$ab['tem_emprestimos'];
        }
        unset($ab);
    } catch (Exception $e) {
        error_log('Erro busca alunos (extrato): ' . $e->getMessage());
        $alunos_busca = [];
    }

    try {
        $notificacoes = extrato_query_all($db, "
            SELECT n.id_envio, n.titulo, n.mensagem, n.tipo,
                   MAX(n.criado_em) AS criado_em,
                   COUNT(DISTINCT n.id_aluno) AS total_alunos
            FROM notificacoes n
            WHERE n.id_envio IS NOT NULL AND n.id_envio != ''
            GROUP BY n.id_envio, n.titulo, n.mensagem, n.tipo
            ORDER BY criado_em DESC
            LIMIT 5
        ");
    } catch (Exception $e) {
        error_log('Erro notificações (extrato): ' . $e->getMessage());
        $notificacoes = [];
    }
}

$header_data_json = json_encode([
    'alunos'       => $alunos_busca,
    'notificacoes' => $notificacoes,
], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// ========== HELPERS DE EXIBIÇÃO ==========
function mes_pt($ym) {
    static $nomes = [1 => 'Janeiro', 2 => 'Fevereiro', 3 => 'Março', 4 => 'Abril', 5 => 'Maio', 6 => 'Junho',
                     7 => 'Julho', 8 => 'Agosto', 9 => 'Setembro', 10 => 'Outubro', 11 => 'Novembro', 12 => 'Dezembro'];
    $ts = strtotime($ym . '-01');
    if (!$ts) return htmlspecialchars((string)$ym);
    return $nomes[(int)date('n', $ts)] . '/' . date('Y', $ts);
}

$status_info = [
    'pendente'   => ['Pendente',   'fa-clock'],
    'aprovada'   => ['Aprovada',   'fa-check-circle'],
    'rejeitada'  => ['Rejeitada',  'fa-times-circle'],
    'expirada'   => ['Expirada',   'fa-hourglass-end'],
    'retirada'   => ['Retirada',   'fa-box-open'],
    'cancelada'  => ['Cancelada',  'fa-ban'],
    'indefinido' => ['Indefinido', 'fa-question-circle'],
];
$filtros_ativos = ($filtro_mes !== '' || $filtro_aluno > 0 || $filtro_status !== '');
$total_atrasados = $total_atrasados ?? 0;
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extrato de Reservas – SiGA ITJ</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/extrato_adm.css?v=<?= time() ?>">
    <script src="../assets/js/extrato_adm.js?v=<?= time() ?>" defer></script>
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

        <nav class="sidebar-nav" id="sidebar-nav">
            <a href="dashboard_adm.php" class="nav-item">
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
                <?php if ($total_atrasados > 0): ?>
                    <span class="nav-badge alert" id="pendencias-badge"><?= (int)$total_atrasados ?></span>
                <?php endif; ?>
            </a>
            <a href="catalogo_adm.php" class="nav-item">
                <i class="fas fa-book"></i>
                <span>Catálogo</span>
            </a>
            <a href="extrato_adm.php" class="nav-item active">
                <i class="fas fa-history"></i>
                <span>Extrato</span>
            </a>
            <a href="notificacoes_adm.php" class="nav-item">
                <i class="fas fa-bell"></i>
                <span>Notificações</span>
            </a>
            <a href="logout_adm.php" class="nav-item nav-logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Sair</span>
            </a>
        </nav>
    </aside>

    <div class="main-content">
        <header class="top-header">
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="search-input" placeholder="Pesquisar por aluno..." autocomplete="off">
                <div class="search-results-dropdown" id="search-results" style="display:none;"></div>
            </div>

            <div class="header-right">
                <div class="admin-profile" id="admin-profile-btn">
                    <div class="admin-avatar"><i class="fas fa-user-shield"></i></div>
                    <div class="admin-info">
                        <span class="admin-label">Administradora</span>
                        <strong class="admin-name" id="admin-name"><?= htmlspecialchars($_SESSION['admin_nome'] ?? 'Bibliotecária') ?></strong>
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
                    <button type="button" class="notification-btn" id="notification-btn" title="Notificações">
                        <i class="fas fa-bell"></i>
                        <?php if (count($notificacoes) > 0): ?>
                            <span class="notification-badge"><?= count($notificacoes) ?></span>
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

        <main class="dashboard-main extrato-page">
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-history"></i> Extrato de Reservas</h1>
                    <p class="page-subtitle">Histórico completo de todas as reservas finalizadas (arquivadas mensalmente)</p>
                </div>
                <button type="button" class="btn-secundario" id="btn-imprimir">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            </div>

            <form class="filtros-extrato" id="form-filtros" method="get" action="extrato_adm.php">
                <div class="grupo">
                    <label for="filtro_mes"><i class="fas fa-calendar-alt"></i> Mês de referência</label>
                    <select id="filtro_mes" name="mes">
                        <option value="">Todos os meses</option>
                        <?php foreach ($meses_disponiveis as $m): ?>
                            <option value="<?= htmlspecialchars($m) ?>" <?= ($filtro_mes == $m) ? 'selected' : '' ?>>
                                <?= mes_pt($m) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="grupo">
                    <label for="filtro_aluno"><i class="fas fa-user-graduate"></i> Aluno</label>
                    <select id="filtro_aluno" name="aluno_id">
                        <option value="0">Todos</option>
                        <?php foreach ($alunos as $a): ?>
                            <option value="<?= (int)$a['id_aluno'] ?>" <?= ($filtro_aluno == $a['id_aluno']) ? 'selected' : '' ?>>
                                <?= htmlspecialchars($a['nome_aluno']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="grupo">
                    <label for="filtro_status"><i class="fas fa-tag"></i> Status</label>
                    <select id="filtro_status" name="status">
                        <option value="">Todos</option>
                        <?php foreach (['aprovada', 'rejeitada', 'expirada', 'retirada', 'cancelada'] as $s): ?>
                            <option value="<?= $s ?>" <?= ($filtro_status === $s) ? 'selected' : '' ?>><?= $status_info[$s][0] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="filtros-acoes">
                    <button type="submit" class="btn-filtrar"><i class="fas fa-filter"></i> Filtrar</button>
                    <?php if ($filtros_ativos): ?>
                        <a href="extrato_adm.php" class="btn-limpar"><i class="fas fa-eraser"></i> Limpar</a>
                    <?php endif; ?>
                </div>
            </form>

            <div class="filtros-ativos" id="filtros-ativos"></div>

            <div class="barra-tabela">
                <div class="total-registros">
                    <span class="numero" id="contador"><?= count($extrato) ?></span>
                    registro(s) encontrado(s)
                    <span class="info-busca" id="info-busca"></span>
                </div>
                <?php if (!empty($extrato)): ?>
                    <div class="busca-tabela">
                        <i class="fas fa-search"></i>
                        <input type="search" id="busca-tabela" placeholder="Buscar nesta lista (aluno, material...)" autocomplete="off">
                    </div>
                <?php endif; ?>
            </div>

            <?php if (empty($extrato)): ?>
                <div class="sem-resultados">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhum registro no extrato para os filtros selecionados.</p>
                    <div class="sub">Tente ajustar os filtros ou aguarde o próximo arquivamento mensal.</div>
                </div>
            <?php else: ?>
                <div class="table-wrapper">
                    <table class="table-extrato">
                        <thead>
                            <tr>
                                <th data-sort>Aluno</th>
                                <th data-sort>Material</th>
                                <th data-sort>Data Reserva</th>
                                <th data-sort>Data Limite</th>
                                <th data-sort>Status</th>
                                <th data-sort>Mês Ref.</th>
                                <th data-sort>Arquivado em</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($extrato as $e):
                                $st = ($e['status'] !== '' && $e['status'] !== null) ? $e['status'] : 'indefinido';
                                $st_label = $status_info[$st][0] ?? ucfirst($st);
                                $st_icon  = $status_info[$st][1] ?? 'fa-circle';
                                $st_class = preg_replace('/[^a-z_-]/', '', strtolower($st));
                            ?>
                                <tr>
                                    <td data-label="Aluno"><?= htmlspecialchars($e['nome_aluno']) ?></td>
                                    <td data-label="Material" class="col-material"><?= htmlspecialchars($e['titulo_item']) ?></td>
                                    <td data-label="Data reserva" class="col-data" data-value="<?= (int)strtotime($e['data_reserva']) ?>"><?= date('d/m/Y H:i', strtotime($e['data_reserva'])) ?></td>
                                    <td data-label="Data limite" class="col-data" data-value="<?= $e['data_limite'] ? (int)strtotime($e['data_limite']) : 0 ?>"><?= $e['data_limite'] ? date('d/m/Y', strtotime($e['data_limite'])) : '-' ?></td>
                                    <td data-label="Status"><span class="status-badge status-<?= $st_class ?>"><i class="fas <?= $st_icon ?>"></i><?= htmlspecialchars($st_label) ?></span></td>
                                    <td data-label="Mês ref." class="col-data" data-value="<?= htmlspecialchars($e['mes_referencia']) ?>"><?= mes_pt($e['mes_referencia']) ?></td>
                                    <td data-label="Arquivado em" class="col-data" data-value="<?= (int)strtotime($e['data_arquivamento']) ?>"><?= date('d/m/Y H:i', strtotime($e['data_arquivamento'])) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <div class="sem-resultados" id="busca-vazia" hidden>
                        <i class="fas fa-search"></i>
                        <p>Nada encontrado para essa busca.</p>
                        <div class="sub">Confira a digitação ou apague o texto da busca.</div>
                    </div>
                </div>
            <?php endif; ?>
        </main>
    </div>

    <script>
        window.extratoHeaderData = <?= $header_data_json ?>;
    </script>
</body>
</html>
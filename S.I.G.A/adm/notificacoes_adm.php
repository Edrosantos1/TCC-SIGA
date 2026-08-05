<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';
$config_classes = $GLOBALS['config_classes'] ?? '';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$nome_bibliotecaria = isset($_SESSION['admin_nome']) ? $_SESSION['admin_nome'] : 'Bibliotecária';

// ========== IDENTIFICAR CONEXÃO ==========
$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

// ========== RECEBER FILTROS DO GET ==========
$periodo_filtro = isset($_GET['periodo']) ? $_GET['periodo'] : 'semana';
$ordenacao_filtro = isset($_GET['ordenacao']) ? $_GET['ordenacao'] : 'mais_recente';

// ========== BUSCAR ALUNOS ==========
$alunos = array();
if ($db) {
    try {
        $queryAlunos = "SELECT id_aluno, nome_aluno, serie_aluno AS turma FROM login_aluno ORDER BY nome_aluno ASC";
        $resultAlunos = $db->query($queryAlunos);
        if ($resultAlunos) {
            if (method_exists($resultAlunos, 'fetch_all')) {
                $alunos = $resultAlunos->fetch_all(MYSQLI_ASSOC);
            } else {
                while ($row = $resultAlunos->fetch_assoc()) {
                    $alunos[] = $row;
                }
            }
        }
    } catch (Exception $e) {
        $alunos = array();
    }
}

$alunos_json = json_encode($alunos);

// ========== BUSCAR NOTIFICAÇÕES PARA O SININHO (APENAS 5 MAIS RECENTES) ==========
$notificacoes_sininho = array();
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
            $notificacoes_sininho = $result->fetch_all(MYSQLI_ASSOC);
        } elseif ($db instanceof PDO) {
            $stmt = $db->query($sql);
            $notificacoes_sininho = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $notificacoes_sininho = [];
        }
    } catch (Exception $e) {
        $notificacoes_sininho = [];
    }
}

// ========== BUSCAR HISTÓRICO COM FILTROS ==========
$historico = array();
if ($db) {
    try {
        $filtro_data = '';
        switch ($periodo_filtro) {
            case 'hoje':
                $filtro_data = "AND DATE(n.criado_em) = CURDATE()";
                break;
            case 'semana':
                $filtro_data = "AND n.criado_em >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
                break;
            case 'mes':
                $filtro_data = "AND n.criado_em >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
                break;
            case 'todo':
            default:
                $filtro_data = "";
                break;
        }

        $order_by = ($ordenacao_filtro === 'mais_antigo') ? 'ASC' : 'DESC';

        $sql = "
            SELECT 
                n.id_envio,
                n.titulo,
                n.mensagem,
                n.tipo,
                MAX(n.criado_em) AS criado_em,
                COUNT(DISTINCT n.id_aluno) AS total_alunos,
                GROUP_CONCAT(DISTINCT l.nome_aluno SEPARATOR ', ') AS alunos_nomes
            FROM notificacoes n
            INNER JOIN login_aluno l ON n.id_aluno = l.id_aluno
            WHERE n.id_envio IS NOT NULL AND n.id_envio != '' {$filtro_data}
            GROUP BY n.id_envio, n.titulo, n.mensagem, n.tipo
            ORDER BY criado_em {$order_by}
            LIMIT 100
        ";

        if ($db instanceof mysqli) {
            $result = $db->query($sql);
            $historico = $result->fetch_all(MYSQLI_ASSOC);
        } elseif ($db instanceof PDO) {
            $stmt = $db->query($sql);
            $historico = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $historico = [];
        }

        foreach ($historico as &$item) {
            $item['total_alunos'] = (int)$item['total_alunos'];
            if ($item['total_alunos'] > 5) {
                $item['alunos_nomes'] = 'Todos os alunos';
            }
            $item['id'] = $item['id_envio'];
        }
        unset($item);
    } catch (Exception $e) {
        $historico = array();
    }
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
    <title>Notificações — SiGA ITJ Admin</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/notificacoes_adm.css?v=<?= time() ?>">

    <script>
        const alunosData = <?= $alunos_json ?>;
        const notificacoesData = <?= json_encode($notificacoes_sininho) ?>;
    </script>
    <script src="../assets/js/notificacoes_adm.js?v=<?= time() ?>" defer></script>
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
            <a href="pendencias_adm.php" class="nav-item">
                <i class="fas fa-exclamation-circle"></i>
                <span>Pendências</span>
            </a>
            <a href="notificacoes_adm.php" class="nav-item active">
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
            <div class="header-right" style="width: 100%; justify-content: flex-end;">
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

                <!-- ========== SININHO ========== -->
                <div class="notification-container">
                    <button class="notification-btn" id="notification-btn" title="Notificações">
                        <i class="fas fa-bell"></i>
                        <?php if (count($notificacoes_sininho) > 0): ?>
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
                            "><?= count($notificacoes_sininho) ?></span>
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

            <!-- ========== CABEÇALHO ========== -->
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-bullhorn"></i> Central de Notificações</h1>
                    <p class="page-subtitle">Envie avisos e comunicados para os alunos</p>
                </div>
            </div>

            <!-- ========== BLOCO DE COMPOSIÇÃO ========== -->
            <div class="compose-card">
                <form id="form-notificacao" method="POST" action="enviar_notificacao_adm.php" autocomplete="off">

                    <div class="compose-section">
                        <label class="compose-label"><i class="fas fa-users"></i> Destinatário</label>
                        <div class="destinatario-tabs">
                            <button type="button" class="dest-tab active" data-tipo="todos">
                                <i class="fas fa-globe"></i> Todos os alunos
                            </button>
                            <button type="button" class="dest-tab" data-tipo="especifico">
                                <i class="fas fa-user"></i> Aluno específico
                            </button>
                        </div>
                        <input type="hidden" id="destinatario-tipo-input" name="destinatario_tipo" value="todos">

                        <div class="aluno-busca-wrapper" id="aluno-busca-wrapper" style="display:none;">
                            <div class="search-container busca-aluno-container">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" id="busca-aluno-input" placeholder='Digite o nome do aluno...' autocomplete="off">
                            </div>
                            <div class="aluno-sugestoes" id="aluno-sugestoes"></div>
                            <div class="aluno-selecionado" id="aluno-selecionado" style="display:none;">
                                <i class="fas fa-user-check"></i>
                                <span id="aluno-selecionado-nome"></span>
                                <button type="button" id="remover-aluno-selecionado" title="Remover">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <input type="hidden" id="id-aluno-selecionado" name="id_aluno" value="">
                        </div>
                    </div>

                    <div class="compose-section">
                        <label class="compose-label"><i class="fas fa-tag"></i> Categoria</label>
                        <div class="categoria-tabs">
                            <button type="button" class="categoria-tab" data-categoria="pendencia">
                                <i class="fas fa-exclamation-circle"></i> Pendência
                            </button>
                            <button type="button" class="categoria-tab active" data-categoria="aviso">
                                <i class="fas fa-info-circle"></i> Aviso
                            </button>
                        </div>
                        <input type="hidden" id="categoria-input" name="categoria" value="aviso">
                    </div>

                    <div class="compose-section">
                        <label class="compose-label" for="mensagem-textarea"><i class="fas fa-pen"></i> Mensagem</label>
                        <textarea id="mensagem-textarea" name="mensagem" rows="5" placeholder="Escreva o comunicado que os alunos vão receber..."></textarea>
                    </div>

                    <div class="compose-section compose-envio">
                        <label class="checkbox-envio">
                            <input type="checkbox" id="enviar-email-checkbox" name="enviar_email" value="1" checked>
                            <span>Enviar também por e-mail</span>
                        </label>
                        <button type="submit" class="btn-primary btn-enviar" id="btn-enviar-notificacao">
                            <i class="fas fa-paper-plane"></i> Enviar notificação
                        </button>
                    </div>

                </form>
            </div>

            <!-- ========== HISTÓRICO COM FILTROS ========== -->
            <div class="historico-card">
                <h3><i class="fas fa-history"></i> Histórico de notificações enviadas</h3>

                <!-- ========== FILTROS VIA GET (LINKS DIRETOS - SEM AJAX) ========== -->
                <div class="filtros-historico">
                    <div style="display: flex; flex-wrap: wrap; gap: 16px 32px; align-items: center; width: 100%;">
                        <div class="filtro-periodo">
                            <span class="filtro-label"><i class="fas fa-calendar-alt"></i> Período:</span>
                            <div class="filtro-group">
                                <a href="?periodo=semana&ordenacao=<?= urlencode($ordenacao_filtro) ?>" class="filtro-btn <?= $periodo_filtro === 'semana' ? 'active' : '' ?>">Esta semana</a>
                                <a href="?periodo=hoje&ordenacao=<?= urlencode($ordenacao_filtro) ?>" class="filtro-btn <?= $periodo_filtro === 'hoje' ? 'active' : '' ?>">Hoje</a>
                                <a href="?periodo=mes&ordenacao=<?= urlencode($ordenacao_filtro) ?>" class="filtro-btn <?= $periodo_filtro === 'mes' ? 'active' : '' ?>">Este mês</a>
                                <a href="?periodo=todo&ordenacao=<?= urlencode($ordenacao_filtro) ?>" class="filtro-btn <?= $periodo_filtro === 'todo' ? 'active' : '' ?>">Todo o tempo</a>
                            </div>
                        </div>

                        <div class="filtros-ordenacao">
                            <span class="filtro-label"><i class="fas fa-sort"></i> Ordenar:</span>
                            <div class="filtro-group">
                                <a href="?periodo=<?= urlencode($periodo_filtro) ?>&ordenacao=mais_recente" class="filtro-btn <?= $ordenacao_filtro === 'mais_recente' ? 'active' : '' ?>">
                                    <i class="fas fa-arrow-down"></i> Mais recente
                                </a>
                                <a href="?periodo=<?= urlencode($periodo_filtro) ?>&ordenacao=mais_antigo" class="filtro-btn <?= $ordenacao_filtro === 'mais_antigo' ? 'active' : '' ?>">
                                    <i class="fas fa-arrow-up"></i> Mais antigo
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <?php if (empty($historico)): ?>
                    <div class="empty-historico">
                        <i class="fas fa-inbox"></i>
                        <p>Nenhuma notificação encontrada para este período.</p>
                    </div>
                <?php else: ?>
                    <div class="historico-lista">
                        <?php foreach ($historico as $item): 
                            $totalAlunos = (int)$item['total_alunos'];
                            $textoAlunos = ($totalAlunos === 1) ? '1 aluno' : $totalAlunos . ' alunos';
                        ?>
                            <div class="historico-item">
                                <div class="historico-header">
                                    <div class="historico-info">
                                        <span class="historico-categoria <?= $item['tipo'] ?>">
                                            <i class="fas <?= $item['tipo'] === 'pendencia' ? 'fa-exclamation-triangle' : 'fa-info-circle' ?>"></i>
                                            <?= $item['tipo'] === 'pendencia' ? 'Pendência' : 'Aviso' ?>
                                        </span>
                                        <span class="historico-data">
                                            <i class="far fa-calendar-alt"></i>
                                            <?= date('d/m/Y H:i', strtotime($item['criado_em'])) ?>
                                        </span>
                                    </div>
                                    <span class="historico-destinatarios">
                                        <i class="fas fa-users"></i> <?= $textoAlunos ?>
                                    </span>
                                </div>
                                
                                <div class="historico-mensagem">
                                    <?= htmlspecialchars($item['mensagem']) ?>
                                </div>
                                
                                <div class="historico-alunos">
                                    <?php if ($item['alunos_nomes'] === 'Todos os alunos'): ?>
                                        <span style="display: inline-flex; align-items: center; gap: 6px; background: #eaf4ff; padding: 4px 14px; border-radius: 12px; color: #0b4b9b; font-weight: 600; font-size: 12px;">
                                            <i class="fas fa-globe"></i> Enviado para todos os alunos
                                        </span>
                                    <?php else: ?>
                                        <?= htmlspecialchars($item['alunos_nomes']) ?>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

        </main>
    </div>

</body>
</html>
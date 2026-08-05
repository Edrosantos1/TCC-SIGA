<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

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

    <script src="../assets/js/notificacoes_adm.js?v=<?= time() ?>" defer></script>
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

                <div class="notification-container">
                    <button class="notification-btn" id="notification-btn" title="Notificações">
                        <i class="fas fa-bell"></i>
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
                            display: none;
                            align-items: center;
                            justify-content: center;
                            padding: 0 5px;
                        ">0</span>
                    </button>
                    <div class="notification-dropdown" id="notification-dropdown">
                        <div class="notification-header">
                            <h4><i class="fas fa-bell"></i> Notificações enviadas</h4>
                            <button class="mark-read-btn" id="atualizar-btn">Atualizar</button>
                        </div>
                        <div class="notification-list" id="notification-list-dropdown">
                            <div class="empty-notifications">
                                <i class="far fa-bell-slash"></i>
                                <p>Nenhuma notificação enviada</p>
                            </div>
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

                    <!-- Destinatário -->
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

                    <!-- 🔥 CATEGORIA - AVISO COMO DEFAULT -->
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

                    <!-- Mensagem -->
                    <div class="compose-section">
                        <label class="compose-label" for="mensagem-textarea"><i class="fas fa-pen"></i> Mensagem</label>
                        <textarea id="mensagem-textarea" name="mensagem" rows="5" placeholder="Escreva o comunicado que os alunos vão receber..."></textarea>
                    </div>

                    <!-- Envio -->
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

            <!-- ========== HISTÓRICO DE NOTIFICAÇÕES ========== -->
            <div class="historico-card">
                <h3><i class="fas fa-history"></i> Histórico de notificações enviadas</h3>
                
                <!-- FILTROS -->
                <div class="filtros-historico">
                    <div class="filtro-periodo">
                        <span class="filtro-label"><i class="fas fa-calendar-alt"></i> Período:</span>
                        <div class="filtro-group">
                            <button class="filtro-btn active" data-periodo="semana">Esta semana</button>
                            <button class="filtro-btn" data-periodo="hoje">Hoje</button>
                            <button class="filtro-btn" data-periodo="mes">Este mês</button>
                            <button class="filtro-btn" data-periodo="todo">Todo o tempo</button>
                        </div>
                    </div>

                    <div class="filtros-ordenacao">
                        <span class="filtro-label"><i class="fas fa-sort"></i> Ordenar:</span>
                        <div class="filtro-group">
                            <button class="filtro-btn active" data-ordenacao="mais_recente">
                                <i class="fas fa-arrow-down"></i> Mais recente
                            </button>
                            <button class="filtro-btn" data-ordenacao="mais_antigo">
                                <i class="fas fa-arrow-up"></i> Mais antigo
                            </button>
                        </div>
                    </div>
                </div>

                <!-- LOADING -->
                <div class="historico-loading" id="historico-loading">
                    <i class="fas fa-spinner"></i>
                    <span>Carregando histórico...</span>
                </div>

                <!-- CONTEÚDO -->
                <div class="historico-lista">
                    <!-- Preenchido via JavaScript -->
                </div>

                <!-- EMPTY STATE -->
                <div class="empty-historico" style="display: none;">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma notificação encontrada para este período.</p>
                </div>
            </div>

        </main>
    </div>

    <script>
        const alunosData = <?= $alunos_json ?>;
    </script>

</body>
</html>
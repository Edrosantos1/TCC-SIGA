<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$config_classes = $GLOBALS['config_classes'] ?? '';
$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';
$id_adm = $_SESSION['admin_id'];

// ========== IDENTIFICAR CONEXÃO ==========
$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    $_SESSION['msg_erro'] = 'Erro de conexão com o banco de dados.';
    header('Location: dashboard_adm.php');
    exit;
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

// ========== VERIFICAR TABELA DE CONFIGURAÇÕES ==========
$tabela_existe = false;
if ($db instanceof mysqli) {
    $result = $db->query("SHOW TABLES LIKE 'configuracoes'");
    $tabela_existe = $result->num_rows > 0;
} elseif ($db instanceof PDO) {
    $stmt = $db->query("SHOW TABLES LIKE 'configuracoes'");
    $tabela_existe = $stmt->rowCount() > 0;
}

if (!$tabela_existe) {
    $create_sql = "
        CREATE TABLE configuracoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            chave VARCHAR(50) NOT NULL UNIQUE,
            valor VARCHAR(255) NOT NULL,
            descricao VARCHAR(255),
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ";
    $db->query($create_sql);

    $defaults = [
        ['tamanho_fonte', 'medio', 'Tamanho da fonte: pequeno, medio, grande'],
        ['tema', 'claro', 'Tema: claro, escuro, alto_contraste'],
        ['daltonismo', 'normal', 'Tipo de daltonismo: normal, protanopia, deuteranopia, tritanopia'],
        ['espacamento', 'normal', 'Espaçamento: compacto, normal, confortavel'],
        ['reduzir_animacoes', '0', 'Reduzir animações: 0=desligado, 1=ligado']
    ];

    foreach ($defaults as $d) {
        $db->query("INSERT INTO configuracoes (chave, valor, descricao) VALUES ('$d[0]', '$d[1]', '$d[2]')");
    }
}

// ========== BUSCAR CONFIGURAÇÕES ==========
$configuracoes = [];
if ($db instanceof mysqli) {
    $result = $db->query("SELECT * FROM configuracoes ORDER BY id");
    while ($row = $result->fetch_assoc()) {
        $configuracoes[$row['chave']] = $row['valor'];
    }
} elseif ($db instanceof PDO) {
    $stmt = $db->query("SELECT * FROM configuracoes ORDER BY id");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $configuracoes[$row['chave']] = $row['valor'];
    }
}

// ========== PROCESSAR FORMULÁRIO ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['salvar'])) {
    $campos = [
        'tamanho_fonte',
        'tema',
        'daltonismo',
        'espacamento',
        'reduzir_animacoes'
    ];

    foreach ($campos as $campo) {
        $valor = isset($_POST[$campo]) ? trim($_POST[$campo]) : '';
        if ($campo === 'reduzir_animacoes') {
            $valor = isset($_POST[$campo]) ? '1' : '0';
        }
        if (!empty($valor) || $campo === 'reduzir_animacoes') {
            if ($db instanceof mysqli) {
                $stmt = $db->prepare("UPDATE configuracoes SET valor = ? WHERE chave = ?");
                $stmt->bind_param('ss', $valor, $campo);
                $stmt->execute();
                $stmt->close();
            } elseif ($db instanceof PDO) {
                $stmt = $db->prepare("UPDATE configuracoes SET valor = ? WHERE chave = ?");
                $stmt->execute([$valor, $campo]);
            }
        }
    }

    $_SESSION['msg_sucesso'] = 'Preferências salvas com sucesso!';
    header('Location: configuracoes_adm.php');
    exit;
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
    <title>Configurações — SiGA ITJ Admin</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/configuracoes_adm.css?v=<?= time() ?>">
    <script src="../assets/js/configuracoes_adm.js?v=<?= time() ?>" defer></script>
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
            <a href="catalogo_adm.php" class="nav-item">
                <i class="fas fa-book"></i>
                <span>Catálogo</span>
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
            <div class="config-container">
                <div class="config-header">
                    <h1><i class="fas fa-sliders-h"></i> Preferências do Sistema</h1>
                    <p>Ajuste a aparência e acessibilidade do painel administrativo</p>
                </div>

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

                <form method="POST" action="">
                    <!-- ========== TAMANHO DA FONTE ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-font"></i> Tamanho da Fonte</h3>
                        <p class="desc">Altere o tamanho da fonte em todo o sistema</p>
                        <div class="form-group">
                            <div class="opcoes-grid">
                                <label class="opcao-card <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'pequeno' ? 'active' : '' ?>">
                                    <input type="radio" name="tamanho_fonte" value="pequeno" <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'pequeno' ? 'checked' : '' ?>>
                                    <i class="fas fa-font" style="font-size: 12px;"></i>
                                    <span>Pequeno</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'medio' ? 'active' : '' ?>">
                                    <input type="radio" name="tamanho_fonte" value="medio" <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'medio' ? 'checked' : '' ?>>
                                    <i class="fas fa-font" style="font-size: 16px;"></i>
                                    <span>Médio</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'grande' ? 'active' : '' ?>">
                                    <input type="radio" name="tamanho_fonte" value="grande" <?= ($configuracoes['tamanho_fonte'] ?? 'medio') === 'grande' ? 'checked' : '' ?>>
                                    <i class="fas fa-font" style="font-size: 22px;"></i>
                                    <span>Grande</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ========== TEMA ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-palette"></i> Tema</h3>
                        <p class="desc">Escolha o tema visual do sistema</p>
                        <div class="form-group">
                            <div class="opcoes-grid">
                                <label class="opcao-card <?= ($configuracoes['tema'] ?? 'claro') === 'claro' ? 'active' : '' ?>">
                                    <input type="radio" name="tema" value="claro" <?= ($configuracoes['tema'] ?? 'claro') === 'claro' ? 'checked' : '' ?>>
                                    <i class="fas fa-sun"></i>
                                    <span>Claro</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['tema'] ?? 'claro') === 'escuro' ? 'active' : '' ?>">
                                    <input type="radio" name="tema" value="escuro" <?= ($configuracoes['tema'] ?? 'claro') === 'escuro' ? 'checked' : '' ?>>
                                    <i class="fas fa-moon"></i>
                                    <span>Escuro</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['tema'] ?? 'claro') === 'alto_contraste' ? 'active' : '' ?>">
                                    <input type="radio" name="tema" value="alto_contraste" <?= ($configuracoes['tema'] ?? 'claro') === 'alto_contraste' ? 'checked' : '' ?>>
                                    <i class="fas fa-circle" style="color: #000; border: 2px solid #fff; background: #fff;"></i>
                                    <span>Alto Contraste</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ========== DALTONISMO ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-eye"></i> Daltonismo</h3>
                        <p class="desc">Ajuste as cores para diferentes tipos de daltonismo</p>
                        <div class="form-group">
                            <div class="opcoes-grid">
                                <label class="opcao-card <?= ($configuracoes['daltonismo'] ?? 'normal') === 'normal' ? 'active' : '' ?>">
                                    <input type="radio" name="daltonismo" value="normal" <?= ($configuracoes['daltonismo'] ?? 'normal') === 'normal' ? 'checked' : '' ?>>
                                    <i class="fas fa-eye"></i>
                                    <span>Normal</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['daltonismo'] ?? 'normal') === 'protanopia' ? 'active' : '' ?>">
                                    <input type="radio" name="daltonismo" value="protanopia" <?= ($configuracoes['daltonismo'] ?? 'normal') === 'protanopia' ? 'checked' : '' ?>>
                                    <span style="color: #ff6b6b;">🔴</span>
                                    <span>Protanopia</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['daltonismo'] ?? 'normal') === 'deuteranopia' ? 'active' : '' ?>">
                                    <input type="radio" name="daltonismo" value="deuteranopia" <?= ($configuracoes['daltonismo'] ?? 'normal') === 'deuteranopia' ? 'checked' : '' ?>>
                                    <span style="color: #51cf66;">🟢</span>
                                    <span>Deuteranopia</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['daltonismo'] ?? 'normal') === 'tritanopia' ? 'active' : '' ?>">
                                    <input type="radio" name="daltonismo" value="tritanopia" <?= ($configuracoes['daltonismo'] ?? 'normal') === 'tritanopia' ? 'checked' : '' ?>>
                                    <span style="color: #4dabf7;">🔵</span>
                                    <span>Tritanopia</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ========== ESPAÇAMENTO ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-arrows-alt-h"></i> Espaçamento</h3>
                        <p class="desc">Ajuste a densidade da informação na tela</p>
                        <div class="form-group">
                            <div class="opcoes-grid">
                                <label class="opcao-card <?= ($configuracoes['espacamento'] ?? 'normal') === 'compacto' ? 'active' : '' ?>">
                                    <input type="radio" name="espacamento" value="compacto" <?= ($configuracoes['espacamento'] ?? 'normal') === 'compacto' ? 'checked' : '' ?>>
                                    <i class="fas fa-compress-arrows-alt"></i>
                                    <span>Compacto</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['espacamento'] ?? 'normal') === 'normal' ? 'active' : '' ?>">
                                    <input type="radio" name="espacamento" value="normal" <?= ($configuracoes['espacamento'] ?? 'normal') === 'normal' ? 'checked' : '' ?>>
                                    <i class="fas fa-arrows-alt-h"></i>
                                    <span>Normal</span>
                                </label>
                                <label class="opcao-card <?= ($configuracoes['espacamento'] ?? 'normal') === 'confortavel' ? 'active' : '' ?>">
                                    <input type="radio" name="espacamento" value="confortavel" <?= ($configuracoes['espacamento'] ?? 'normal') === 'confortavel' ? 'checked' : '' ?>>
                                    <i class="fas fa-expand-arrows-alt"></i>
                                    <span>Confortável</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ========== REDUZIR ANIMAÇÕES ========== -->
                    <div class="config-card">
                        <h3><i class="fas fa-stop-circle"></i> Acessibilidade</h3>
                        <p class="desc">Reduza ou desative animações para melhor performance e acessibilidade</p>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" name="reduzir_animacoes" value="1" <?= ($configuracoes['reduzir_animacoes'] ?? '0') == '1' ? 'checked' : '' ?>>
                                <span class="slider"></span>
                                <span class="toggle-label">Reduzir animações</span>
                            </label>
                        </div>
                    </div>

                    <!-- ========== BOTÃO SALVAR ========== -->
                    <button type="submit" name="salvar" class="btn-salvar">
                        <i class="fas fa-save"></i> Salvar Preferências
                    </button>
                </form>
            </div>
        </main>
    </div>

    <script>
        // ========== DADOS DAS NOTIFICAÇÕES ==========
        const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>

</body>
</html>
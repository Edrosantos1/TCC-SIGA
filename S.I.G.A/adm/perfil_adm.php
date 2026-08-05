<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';
$config_classes = $GLOBALS['config_classes'] ?? '';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$id_adm = $_SESSION['admin_id'];
$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';
$email_adm = $_SESSION['admin_email'] ?? '';

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

// ========== BUSCAR DADOS DO ADMIN ==========
$admin = array();
if ($db) {
    $sql = "SELECT id_adm, nome_adm, email_adm FROM login_admin WHERE id_adm = ?";
    if ($db instanceof mysqli) {
        $stmt = $db->prepare($sql);
        $stmt->bind_param('i', $id_adm);
        $stmt->execute();
        $result = $stmt->get_result();
        $admin = $result->fetch_assoc();
        $stmt->close();
    } elseif ($db instanceof PDO) {
        $stmt = $db->prepare($sql);
        $stmt->execute([$id_adm]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

// ========== PROCESSAR FORMULÁRIO ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $acao = isset($_POST['acao']) ? $_POST['acao'] : '';
    
    // ========== ATUALIZAR NOME ==========
    if ($acao === 'atualizar_nome') {
        $novo_nome = isset($_POST['nome_adm']) ? trim($_POST['nome_adm']) : '';
        
        if (empty($novo_nome)) {
            $_SESSION['msg_erro'] = 'O nome não pode ficar vazio.';
        } else {
            if ($db instanceof mysqli) {
                $stmt = $db->prepare("UPDATE login_admin SET nome_adm = ? WHERE id_adm = ?");
                $stmt->bind_param('si', $novo_nome, $id_adm);
                $stmt->execute();
                $stmt->close();
            } elseif ($db instanceof PDO) {
                $stmt = $db->prepare("UPDATE login_admin SET nome_adm = ? WHERE id_adm = ?");
                $stmt->execute([$novo_nome, $id_adm]);
            }
            $_SESSION['admin_nome'] = $novo_nome;
            $_SESSION['msg_sucesso'] = 'Nome atualizado com sucesso!';
            header('Location: perfil_adm.php');
            exit;
        }
    }
    
    // ========== ALTERAR SENHA ==========
    if ($acao === 'alterar_senha') {
        $senha_atual = isset($_POST['senha_atual']) ? $_POST['senha_atual'] : '';
        $nova_senha = isset($_POST['nova_senha']) ? $_POST['nova_senha'] : '';
        $confirmar_senha = isset($_POST['confirmar_senha']) ? $_POST['confirmar_senha'] : '';
        
        if (empty($senha_atual) || empty($nova_senha) || empty($confirmar_senha)) {
            $_SESSION['msg_erro'] = 'Todos os campos de senha são obrigatórios.';
        } elseif (strlen($nova_senha) < 3) {
            $_SESSION['msg_erro'] = 'A nova senha deve ter pelo menos 3 caracteres.';
        } elseif ($nova_senha !== $confirmar_senha) {
            $_SESSION['msg_erro'] = 'As senhas não coincidem.';
        } else {
            // Verificar senha atual
            $senha_hash = null;
            if ($db instanceof mysqli) {
                $stmt = $db->prepare("SELECT senha_adm FROM login_admin WHERE id_adm = ?");
                $stmt->bind_param('i', $id_adm);
                $stmt->execute();
                $result = $stmt->get_result();
                $row = $result->fetch_assoc();
                $senha_hash = $row['senha_adm'];
                $stmt->close();
            } elseif ($db instanceof PDO) {
                $stmt = $db->prepare("SELECT senha_adm FROM login_admin WHERE id_adm = ?");
                $stmt->execute([$id_adm]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $senha_hash = $row['senha_adm'];
            }
            
            // Verificar senha atual (suporte para '123' e hash)
            $senha_correta = false;
            if (password_verify($senha_atual, $senha_hash)) {
                $senha_correta = true;
            } elseif ($senha_atual === '123') {
                $senha_correta = true;
            }
            
            if (!$senha_correta) {
                $_SESSION['msg_erro'] = 'Senha atual incorreta.';
            } else {
                $nova_senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);
                if ($db instanceof mysqli) {
                    $stmt = $db->prepare("UPDATE login_admin SET senha_adm = ? WHERE id_adm = ?");
                    $stmt->bind_param('si', $nova_senha_hash, $id_adm);
                    $stmt->execute();
                    $stmt->close();
                } elseif ($db instanceof PDO) {
                    $stmt = $db->prepare("UPDATE login_admin SET senha_adm = ? WHERE id_adm = ?");
                    $stmt->execute([$nova_senha_hash, $id_adm]);
                }
                $_SESSION['msg_sucesso'] = 'Senha alterada com sucesso!';
                header('Location: perfil_adm.php');
                exit;
            }
        }
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
    <title>Meu Perfil — SiGA ITJ Admin</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/perfil_adm.css?v=<?= time() ?>">
    <script src="../assets/js/perfil_adm.js?v=<?= time() ?>" defer></script>
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
            <div class="perfil-container">
                <div class="perfil-header">
                    <div class="perfil-avatar">
                        <div class="avatar-grande">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        <div class="perfil-info">
                            <h1><?= htmlspecialchars($admin['nome_adm'] ?? 'Administrador') ?></h1>
                            <p><i class="fas fa-envelope"></i> <?= htmlspecialchars($admin['email_adm'] ?? '') ?></p>
                        </div>
                    </div>
                    <div class="perfil-stats">
                        <div class="stat-item">
                            <span class="numero"><?= date('d/m/Y') ?></span>
                            <span class="label">Data de hoje</span>
                        </div>
                    </div>
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

                <div class="perfil-cards">
                    <!-- ========== CARD: EDITAR NOME ========== -->
                    <div class="perfil-card">
                        <h3><i class="fas fa-user-edit"></i> Editar Nome</h3>
                        <form method="POST" action="">
                            <input type="hidden" name="acao" value="atualizar_nome">
                            <div class="form-group">
                                <label for="nome_adm">Nome completo</label>
                                <input type="text" id="nome_adm" name="nome_adm" value="<?= htmlspecialchars($admin['nome_adm'] ?? '') ?>" required>
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> Atualizar Nome
                            </button>
                        </form>
                    </div>

                    <!-- ========== CARD: ALTERAR SENHA (COM OLHINHO) ========== -->
                    <div class="perfil-card">
                        <h3><i class="fas fa-key"></i> Alterar Senha</h3>
                        <form method="POST" action="">
                            <input type="hidden" name="acao" value="alterar_senha">
                            
                            <div class="form-group">
                                <label for="senha_atual">Senha atual</label>
                                <div class="senha-container">
                                    <input type="password" id="senha_atual" name="senha_atual" placeholder="Digite sua senha atual" required>
                                    <button type="button" class="toggle-senha" title="Mostrar senha">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="nova_senha">Nova senha</label>
                                <div class="senha-container">
                                    <input type="password" id="nova_senha" name="nova_senha" placeholder="Mínimo 3 caracteres" required>
                                    <button type="button" class="toggle-senha" title="Mostrar senha">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmar_senha">Confirmar nova senha</label>
                                <div class="senha-container">
                                    <input type="password" id="confirmar_senha" name="confirmar_senha" placeholder="Digite a nova senha novamente" required>
                                    <button type="button" class="toggle-senha" title="Mostrar senha">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-key"></i> Alterar Senha
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // ========== DADOS DAS NOTIFICAÇÕES ==========
        const notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>

</body>
</html>
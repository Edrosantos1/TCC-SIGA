<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login.php';
require_once __DIR__ . '/../includes/aluno_functions_config.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login_user.php');
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

// Buscar nome do aluno
$sql_nome = "SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?";
$stmt = $conn->prepare($sql_nome);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$primeiroNome = 'Aluno';
if ($row = $stmt->get_result()->fetch_assoc()) {
    $primeiroNome = explode(' ', trim($row['nome_aluno']))[0];
}
$stmt->close();

// Carregar configurações do aluno
$configuracoes = carregar_configuracoes_aluno($usuario_id, $conn);

// Processar formulário
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['salvar'])) {
    salvar_configuracoes_aluno($usuario_id, $_POST, $conn);
    $_SESSION['msg_sucesso'] = 'Preferências salvas com sucesso!';
    header('Location: configuracoes_aluno.php');
    exit;
}

// Mensagens flash
$msg_sucesso = $_SESSION['msg_sucesso'] ?? null;
unset($_SESSION['msg_sucesso']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurações — SiGA ITJ</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_aluno.css">
    <link rel="stylesheet" href="../assets/css/student_unified.css">
    <link rel="stylesheet" href="../assets/css/configuracoes_aluno.css?v=<?= time() ?>">
    <script src="../assets/js/configuracoes_aluno.js?v=<?= time() ?>" defer></script>
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
        <nav class="sidebar-nav">
            <a href="dashboard_aluno.php" class="nav-item"><i class="fas fa-home"></i> Visão Geral</a>
            <a href="catalogo.php" class="nav-item"><i class="fas fa-search"></i> Catálogo</a>
            <a href="favoritos.php" class="nav-item"><i class="fas fa-heart"></i> Meus Favoritos</a>
            <a href="meus_emprestimos.php" class="nav-item"><i class="fas fa-book"></i> Meus Empréstimos</a>
            <a href="reservas.php" class="nav-item"><i class="fas fa-clock"></i> Minhas Reservas</a>
            <a href="historico.php" class="nav-item"><i class="fas fa-history"></i> Histórico</a>
            <a href="configuracoes_aluno.php" class="nav-item active"><i class="fas fa-sliders-h"></i> Configurações</a>
        </nav>
    </aside>

    <div class="main-content">
        <header class="top-header">
            <div class="header-right" style="width: 100%; justify-content: flex-end;">
                <div class="user-info">
                    <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
                    <span class="welcome">Olá, <strong><?= htmlspecialchars($primeiroNome) ?></strong>!</span>
                </div>
                <a href="logout_user.php" class="btn-logout" title="Sair">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Sair</span>
                </a>
            </div>
        </header>

        <main class="container dashboard-main">
            <div class="config-container">
                <div class="config-header">
                    <h1><i class="fas fa-sliders-h"></i> Minhas Preferências</h1>
                    <p>Ajuste a aparência e acessibilidade do sistema</p>
                </div>

                <?php if ($msg_sucesso): ?>
                    <div class="flash-message flash-success">
                        <i class="fas fa-check-circle"></i>
                        <?= htmlspecialchars($msg_sucesso) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="">
                    <!-- Tamanho da Fonte -->
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

                    <!-- Tema -->
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

                    <!-- Daltonismo -->
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

                    <!-- Espaçamento -->
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

                    <!-- Reduzir Animações -->
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

                    <button type="submit" name="salvar" class="btn-salvar">
                        <i class="fas fa-save"></i> Salvar Preferências
                    </button>
                </form>
            </div>
        </main>
    </div>

</body>
</html>
<?php
require_once __DIR__ . '/../includes/config.php'; 
require_once __DIR__ . '/auth/verificar_login.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: auth/login.php');
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$primeiroNome = 'Aluno';

// Buscar nome do aluno
$sql = "SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?";
$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $nomeCompleto = trim($row['nome_aluno']);
        $partes = explode(' ', $nomeCompleto);
        $primeiroNome = $partes[0] ?: 'Aluno';
    }
    $stmt->close();
}

// ========== BUSCAR NOTIFICAÇÕES PARA O SININHO (ALUNO) ==========
$notificacoes = array();
$sql_notif = "
    SELECT 
        n.id_envio,
        n.titulo,
        n.mensagem,
        n.tipo,
        n.criado_em
    FROM notificacoes n
    WHERE n.id_aluno = ?
    ORDER BY n.criado_em DESC
    LIMIT 5
";
$stmt_notif = $conn->prepare($sql_notif);
if ($stmt_notif) {
    $stmt_notif->bind_param("i", $usuario_id);
    $stmt_notif->execute();
    $res_notif = $stmt_notif->get_result();
    $notificacoes = $res_notif->fetch_all(MYSQLI_ASSOC);
    $stmt_notif->close();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
  <title>Dashboard - SiGA ITJ</title>
  
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/aluno/painel_aluno.css">
  <link rel="stylesheet" href="../assets/css/aluno/aluno_unificado.css">
  <link rel="stylesheet" href="../assets/css/aluno/notificacoes_aluno.css">
  <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>
  <script src="../assets/js/aluno/painel_aluno.js" defer></script>
  <script src="../assets/js/aluno/notificacoes_aluno.js" defer></script>

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
    <a href="painel.php" class="nav-item active">
        <i class="fas fa-home"></i><span>Visão Geral</span>
    </a>
    <a href="catalogo.php" class="nav-item">
        <i class="fas fa-search"></i><span>Catálogo</span>
    </a>
    <a href="favoritos.php" class="nav-item">
        <i class="fas fa-heart"></i><span>Meus Favoritos</span>
    </a>
    <a href="emprestimos.php" class="nav-item">
        <i class="fas fa-book"></i><span>Meus Empréstimos</span>
    </a>
    <a href="reservas.php" class="nav-item">
        <i class="fas fa-clock"></i><span>Minhas Reservas</span>
    </a>
    <a href="historico.php" class="nav-item">
        <i class="fas fa-history"></i><span>Histórico</span>
    </a>
    <a href="configuracoes.php" class="nav-item">
      <i class="fas fa-sliders-h"></i><span>Configurações</span>
    </a>
</nav>
  </aside>

  <div class="main-content">

    <header class="top-header">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input type="text" id="search-input" placeholder="Buscar livros, autores, revistas..." autocomplete="off">
      </div>

      <div class="header-right">

        <div class="language-wrapper">
          <button class="language-button" aria-label="Selecionar idioma">
            <img src="../assets/Imagens/br.png" class="flag" alt="Bandeira do Brasil">
            <span>PT</span>
            <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>
          </button>
          <ul class="language-list">
            <li data-lang="pt" tabindex="0"><img src="../assets/Imagens/br.png" class="flag" alt="Português"> Português</li>
            <li data-lang="en" tabindex="0"><img src="../assets/Imagens/us.png" class="flag" alt="English"> English</li>
            <li data-lang="es" tabindex="0"><img src="../assets/Imagens/es.png" class="flag" alt="Español"> Español</li>
          </ul>
        </div>

        <div class="user-info">
          <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
          <span class="welcome">Olá, <strong id="user-name"><?= htmlspecialchars($primeiroNome) ?></strong>!</span>
        </div>

        <a href="auth/sair.php" class="btn-logout" title="Sair">
          <i class="fas fa-sign-out-alt"></i>
          <span id="logout-text">Sair</span>
        </a>

        <div class="notification-container">
          <button class="notification-btn" id="notification-btn" title="Notificações">
            <i class="fas fa-bell"></i>
            <?php if (count($notificacoes) > 0): ?>
              <span class="badge"><?= count($notificacoes) ?></span>
            <?php endif; ?>
          </button>
          <div class="notification-dropdown" id="notification-dropdown">
            <div class="notification-header">
              <h4><i class="fas fa-bell"></i> Notificações</h4>
            </div>
            <div class="notification-list" id="notification-list-dropdown"></div>
            <form id="mark-read-form" action="../api/aluno_notificacoes.php" method="POST" style="padding: 0 12px 12px;">
              <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
              <input type="hidden" name="action" value="mark_all_read">
              <input type="hidden" name="redirect" value="../aluno/painel.php">
              <button type="submit" class="btn-secondary" id="mark-read-btn">Marcar tudo como lido</button>
            </form>
          </div>
        </div>
      </div>
    </header>

  </div>

  <script>
    window.notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  </script>
</body>
</html>





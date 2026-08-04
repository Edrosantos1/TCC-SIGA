<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login_user.php');
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$sql = "SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

$primeiroNome = 'Aluno';
if ($row = $result->fetch_assoc()) {
    $nomeCompleto = trim($row['nome_aluno']);
    $partes = explode(' ', $nomeCompleto);
    $primeiroNome = $partes[0] ?: 'Aluno';
}
$stmt->close();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meus Empréstimos - SiGA ITJ</title>

  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/dashboard_aluno.css">
  <link rel="stylesheet" href="../assets/css/meus_emprestimos.css">

  <script src="../assets/js/dashboard_aluno.js" defer></script>
  <script src="../assets/js/meus_emprestimos.js" defer></script>
</head>
<body>

  <!-- SIDEBAR -->
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
      <a href="dashboard_aluno.php" class="nav-item">
        <i class="fas fa-home"></i>
        <span>Visão Geral</span>
      </a>
      <a href="catalogo.php" class="nav-item">
        <i class="fas fa-search"></i>
        <span>Catálogo</span>
      </a>
      <a href="meus_emprestimos.php" class="nav-item active">
        <i class="fas fa-book"></i>
        <span>Meus Empréstimos</span>
      </a>
      <a href="reservas.php" class="nav-item">
        <i class="fas fa-clock"></i>
        <span>Minhas Reservas</span>
      </a>
      <a href="historico.php" class="nav-item">
        <i class="fas fa-history"></i>
        <span>Histórico</span>
      </a>
    </nav>
  </aside>

  <!-- CONTEÚDO PRINCIPAL -->
  <div class="main-content">
    <!-- TOP HEADER (idêntico) -->
    <header class="top-header">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input type="text" id="search-input" placeholder="Buscar livros, autores, revistas..." autocomplete="off">
      </div>

      <div class="header-right">
        <!-- SELETOR DE IDIOMA -->
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

        <!-- USUÁRIO -->
        <div class="user-info">
          <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
          <span class="welcome">Olá, <strong id="user-name"><?= htmlspecialchars($primeiroNome) ?></strong>!</span>
        </div>

        <!-- LOGOUT -->
        <a href="logout_user.php" class="btn-logout" title="Sair">
          <i class="fas fa-sign-out-alt"></i>
          <span id="logout-text">Sair</span>
        </a>

        <!-- NOTIFICAÇÃO -->
        <div class="notification-container">
          <button class="notification-btn" id="notification-btn" title="Notificações">
            <i class="fas fa-bell"></i>
            <span class="notification-dot"></span>
            <span class="notification-badge" id="notification-badge" style="display: none;">0</span>
          </button>
          <div class="notification-dropdown" id="notification-dropdown">
            <div class="notification-header">
              <h4><i class="fas fa-bell"></i> Notificações</h4>
              <button class="mark-read-btn" id="mark-read-btn">Marcar todas como lidas</button>
            </div>
            <div class="notification-list" id="notification-list">
              <div class="empty-notifications" style="display: none;">
                <i class="far fa-bell-slash"></i>
                <p>Nenhuma notificação nova</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- CONTEÚDO DOS EMPRÉSTIMOS -->
    <main class="loans-main">
      <div class="loans-header">
        <h1 id="loans-title">Meus Empréstimos</h1>
        <p id="loans-subtitle">Acompanhe seus livros, revistas e TCCs emprestados</p>
      </div>

      <!-- Abas: Ativos e Histórico -->
      <div class="loans-tabs">
        <button class="tab-btn active" data-tab="active" id="tab-active">Ativos</button>
        <button class="tab-btn" data-tab="history" id="tab-history">Histórico</button>
      </div>

      <!-- Lista de empréstimos ativos -->
      <div class="loans-list" id="active-loans">
        <!-- Os cards serão inseridos via JS -->
      </div>

      <!-- Lista de histórico -->
      <div class="loans-list" id="history-loans" style="display: none;">
        <!-- Os cards de histórico serão inseridos via JS -->
      </div>

      <!-- Mensagem de vazio -->
      <div class="loans-empty" id="loans-empty" style="display: none;">
        <i class="fas fa-book-open"></i>
        <p id="loans-empty-text">Nenhum empréstimo encontrado</p>
      </div>
    </main>
  </div>

  <!-- MODAL DE RENOVAÇÃO / DEVOLUÇÃO (opcional) -->
  <div class="modal-overlay" id="loan-modal-overlay">
    <div class="modal-container" id="loan-modal">
      <button class="modal-close" id="loan-modal-close"><i class="fas fa-times"></i></button>
      <div class="modal-content">
        <h2 id="loan-modal-title">Detalhes do Empréstimo</h2>
        <div id="loan-modal-body">
          <!-- Conteúdo dinâmico -->
        </div>
        <div class="modal-actions">
          <button id="loan-renew-btn" class="btn-primary">Renovar</button>
          <button id="loan-return-btn" class="btn-secondary">Devolver</button>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
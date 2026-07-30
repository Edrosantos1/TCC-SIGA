<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';
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
  <script src="../assets/js/dashboard_adm.js" defer></script>
</head>
<body>

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

        <!-- NOTIFICAÇÃO (sininho) -->
        <div class="notification-container">
          <button class="notification-btn" id="notification-btn" title="Notificações">
            <i class="fas fa-bell"></i>
          </button>
          <div class="notification-dropdown" id="notification-dropdown">
            <div class="notification-header">
              <h4><i class="fas fa-bell"></i> Notificações</h4>
              <button class="mark-read-btn" id="mark-read-btn">Marcar todas como lidas</button>
            </div>
            <div class="notification-list" id="notification-list">
              <!-- Preenchido via JS (caso queira, mas pode ficar vazio) -->
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
</body>
</html>
<?php
require_once __DIR__ . '/../includes/config.php'; 
require_once __DIR__ . '/verificar_login.php';

// Se não estiver logado, redireciona
if (!isset($_SESSION['usuario_id'])) {
    header('Location: login_user.php');
    exit;
}

// Buscar o nome do aluno no banco
$usuario_id = $_SESSION['usuario_id'];
$primeiroNome = 'Aluno';

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
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - SiGA ITJ</title>
  
 
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/dashboard_aluno.css">
  <script src="../assets/js/dashboard_aluno.js" defer></script>

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
      <a href="dashboard_aluno.php" class="nav-item active">
        <i class="fas fa-home"></i>
        <span>Visão Geral</span>
      </a>
      <a href="catalogo.php" class="nav-item">
        <i class="fas fa-search"></i>
        <span>Catálogo</span>
      </a>
      <a href="meus_emprestimos.php" class="nav-item">
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

    <!-- TOP HEADER -->
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
  
  <!-- DROPDOWN NOTIFICAÇÕES -->
  <div class="notification-dropdown" id="notification-dropdown">
    <div class="notification-header">
      <h4><i class="fas fa-bell"></i> Notificações</h4>
      <button class="mark-read-btn" id="mark-read-btn">Marcar todas como lidas</button>
    </div>
    <div class="notification-list" id="notification-list">
      <!-- As notificações serão inseridas via JS -->
      <div class="empty-notifications" style="display: none;">
        <i class="far fa-bell-slash"></i>
        <p>Nenhuma notificação nova</p>
      </div>
    </div>
  </div>
</div>
  </div>
</header>
    <!-- MAIN -->
    <main class="dashboard-main">

      <!-- CONTINUAR LENDO -->
      <section class="last-viewed">
        <h2><i class="fas fa-clock"></i> Em Andamento</h2>
        <div class="last-viewed-wrapper">

          <a href="#" id="last-viewed-main-link" class="continue-card">
            <img id="last-viewed-cover" class="book-cover" src="../assets/Imagens/capa-exemplo.jpg" alt="Capa do livro em andamento">
            <div class="continue-info">
              <span class="item-type-badge"><i class="fas fa-book"></i> Livro</span>
              <h3 id="last-viewed-title">Introdução à Programação com Python</h3>
              <p class="author" id="last-viewed-author">Eric Matthes</p>

              <div class="progress-bar">
                <div class="progress" id="last-viewed-progress" style="width: 68%"></div>
              </div>
              <p class="progress-text" id="last-viewed-progress-text">68% concluído • Página 214 de 412</p>

              <div class="rating">
                <span>Avalie este material:</span>
                <div class="stars">
                  <i class="far fa-star" data-value="1"></i>
                  <i class="far fa-star" data-value="2"></i>
                  <i class="far fa-star" data-value="3"></i>
                  <i class="far fa-star" data-value="4"></i>
                  <i class="far fa-star" data-value="5"></i>
                </div>
              </div>

              <span class="btn-continue">Continuar Leitura →</span>
            </div>
          </a>

          <aside class="recent-items-panel">
            <div class="recent-items-label"><i class="fas fa-history"></i> Vistos Recentemente</div>
            <div class="recent-items-list" id="recent-items-list"></div>
          </aside>

        </div>
      </section>

      <!-- AÇÕES RÁPIDAS -->
      <section>
        <h2 class="section-title">Ações Rápidas</h2>
        <div class="actions-grid">
          <a href="catalogo.php" class="action-btn">
            <i class="fas fa-search"></i>
            <span>Explorar Catálogo</span>
          </a>
          <a href="meus_emprestimos.php" class="action-btn">
            <i class="fas fa-book"></i>
            <span>Meus Empréstimos</span>
          </a>
          <a href="reservas.php" class="action-btn">
            <i class="fas fa-clock"></i>
            <span>Minhas Reservas</span>
          </a>
        </div>
      </section>

      <!-- CARROSSEL DE TCCs -->
      <section class="tcc-section">
        <h2 class="section-title" id="tcc-section-title">Trabalhos de Conclusão de Curso</h2>
        <p class="tcc-subtitle" id="tcc-section-subtitle">Explore os TCCs da nossa escola e inspire-se para o seu projeto</p>

        <div class="tcc-carousel">
          <button class="tcc-nav-btn" id="tcc-prev" aria-label="TCC anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="tcc-track-container">
            <div class="tcc-track" id="tcc-track"></div>
          </div>
          <button class="tcc-nav-btn" id="tcc-next" aria-label="Próximo TCC">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </section>

    </main>
  </div>

    <!-- MODAL DE DETALHES DO TCC -->
    <div class="tcc-modal-overlay" id="tcc-modal-overlay">
      <div class="tcc-modal" role="dialog" aria-modal="true">
        <button class="tcc-modal-close" id="tcc-modal-close" aria-label="Fechar">
          <i class="fas fa-times"></i>
        </button>
        <div class="tcc-modal-body">
          <div class="tcc-modal-cover-wrap">
            <img id="tcc-modal-cover" src="" alt="">
          </div>
          <div class="tcc-modal-info">
            <span class="tcc-modal-badge">
              <i class="fas fa-graduation-cap"></i>
              <span id="tcc-modal-badge-text">TCC</span>
            </span>
            <h3 id="tcc-modal-title"></h3>
            <div class="tcc-modal-meta">
              <span id="tcc-modal-year"></span> · <span id="tcc-modal-area"></span>
            </div>

            <h4 id="tcc-theme-label">Tema</h4>
            <p id="tcc-modal-theme"></p>

            <h4 id="tcc-members-label">Integrantes</h4>
            <ul id="tcc-modal-members"></ul>

            <div class="tcc-modal-actions">
              <button id="tcc-favorite-btn">
                <i class="far fa-heart" id="tcc-favorite-icon"></i>
                <span id="tcc-favorite-text">Favoritar</span>
              </button>
              <button id="tcc-reserve-btn">
                <i class="fas fa-bookmark"></i>
                <span id="tcc-reserve-text">Reservar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

</body>
</html>
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
    </main>
</body>
</html>
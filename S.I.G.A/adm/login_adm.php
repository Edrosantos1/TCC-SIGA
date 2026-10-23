<?php
require_once __DIR__ . '/../includes/config.php';

// Se já estiver logado, redireciona
if (isset($_SESSION['admin_id']) || isset($_SESSION['id_adm'])) {
    header('Location: dashboard_adm.php');
    exit;
}
$erro = $_SESSION['flash_admin_login_error'] ?? '';
unset($_SESSION['flash_admin_login_error']);
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light" data-suporta-alto-contraste="true">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
  <title>Login Administrador · SiGA ITJ</title>
  <script>
    (function () {
      try {
        var theme = localStorage.getItem("siga-tema");
        if (theme !== "light" && theme !== "dark" && theme !== "contrast") {
          theme = localStorage.getItem("siga-theme");
          if (theme === "light" || theme === "dark" || theme === "contrast") {
            localStorage.setItem("siga-tema", theme);
            localStorage.removeItem("siga-theme");
          }
        }
        if (theme !== "light" && theme !== "dark" && theme !== "contrast") {
          theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        document.documentElement.setAttribute("data-theme", theme);
      } catch (error) {}
    })();
  </script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/adm/login_adm.css?v=<?= filemtime(__DIR__ . '/../assets/css/adm/login_adm.css') ?>">
</head>
<body>
  <div class="full-background">

    <button type="button" class="theme-toggle" id="theme_toggle" aria-label="Alternar tema">
      <i class="fas fa-moon icon-moon" aria-hidden="true"></i>
      <i class="fas fa-sun icon-sun" aria-hidden="true"></i>
      <i class="fas fa-circle-half-stroke icone-contraste" aria-hidden="true"></i>
    </button>

    <!-- SELETOR DE IDIOMA -->
    <div class="language-wrapper">
      <button class="language-button" aria-label="Selecionar idioma" aria-expanded="false" aria-haspopup="listbox">
        <img src="../assets/Imagens/br.png" class="flag" alt="Bandeira do Brasil" id="current-flag">
        <span id="current-lang-text">PT</span>
        <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>
      </button>
      <ul class="language-list" role="listbox">
        <li data-lang="pt" tabindex="-1" role="option">
          <img src="../assets/Imagens/br.png" class="flag" alt="Português"> Português
        </li>
        <li data-lang="en" tabindex="-1" role="option">
          <img src="../assets/Imagens/us.png" class="flag" alt="English"> English
        </li>
        <li data-lang="es" tabindex="-1" role="option">
          <img src="../assets/Imagens/es.png" class="flag" alt="Español"> Español
        </li>
      </ul>
    </div>

    <!-- CABEÇALHO -->
    <div class="auth-header">
      <a href="../index.html" class="back-arrow" aria-label="Voltar para página inicial">
        <i class="fas fa-arrow-left"></i>
      </a>
      <a href="../index.html" class="brand-logo">
        <i class="fas fa-book-reader icon-logo"></i> SIGA ITJ
      </a>
    </div>

    <!-- CONTAINER PRINCIPAL -->
    <div class="container">
      <!-- LADO ESQUERDO -->
      <div class="panel-decorativo">
        <div class="panel-content">
          <div class="shield-icon">
            <i class="fas fa-user-shield"></i>
          </div>
          <h2 id="panel-title">Painel Administrativo</h2>
          <p id="panel-desc">Gerencie sua biblioteca com praticidade.</p>
          <div class="illustration-icons">
            <i class="fas fa-book"></i>
            <i class="fas fa-cogs"></i>
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
      </div>

      <!-- LADO DIREITO -->
      <div class="form-container">
        
        <!-- MENSAGEM DE ERRO -->
        <?php if ($erro): ?>
          <div class="error-message" id="error-message" style="color: #dc2626; background: rgba(220,38,38,0.08); border: 1px solid #dc2626; padding: 14px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <?= htmlspecialchars($erro, ENT_QUOTES, 'UTF-8') ?>
          </div>
        <?php endif; ?>

        <form id="form-login-adm" autocomplete="off" action="../includes/db_login_adm.php" method="POST">
          <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
          <h1 class="dot-title">Login Admin</h1>

          <div class="input-group">
            <input type="email" placeholder="Email" id="admin-email" name="email" required>
            <i class="fas fa-envelope icon-input"></i>
          </div>

          <div class="input-group">
            <input type="password" placeholder="Senha" id="admin-password" name="senha" required>
            <i class="fas fa-eye toggle-eye" id="toggleAdminPassword"></i>
          </div>

          <p class="caps-warning" id="caps_warning_admin">Caps Lock ativado!</p>

          <div class="buttons-layout">
            <button type="submit" class="btn-primary" id="btn-submit-login">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script src="../assets/js/adm/login_adm.js"></script>
  <script src="../assets/js/shared/tema.js"></script>
</body>
</html>
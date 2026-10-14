<?php
session_start();

// Se já estiver logado, redireciona
if (isset($_SESSION['admin_id']) || isset($_SESSION['id_adm'])) {
    header('Location: dashboard_adm.php');
    exit;
}
$erro = isset($_GET['erro']) ? htmlspecialchars($_GET['erro']) : '';
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>Login Administrador · SiGA ITJ</title>

  <!-- Aplica o tema salvo (o mesmo da página inicial) antes de renderizar -->
  <script>
    (function () {
      try {
        var t = localStorage.getItem("siga-theme");
        if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", t);
      } catch (e) {}
    })();
  </script>

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/login_adm.css">
</head>
<body>
  <div class="login-page">

    <!-- CABEÇALHO: voltar + logo (esquerda) | tema + idioma (direita) -->
    <header class="topbar">
      <div class="auth-header">
        <a href="../index.html" class="back-arrow" data-i18n-aria="back_label" aria-label="Voltar para página inicial">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </a>
        <a href="../index.html" class="brand-logo">
          <i class="fas fa-book-reader icon-logo" aria-hidden="true"></i> SIGA ITJ
        </a>
      </div>

      <div class="topbar-actions">
        <!-- BOTÃO DE TEMA ESCURO -->
        <button type="button" class="theme-toggle" id="theme_toggle" aria-pressed="false"
                data-i18n-aria="theme_label" aria-label="Tema escuro">
          <i class="fas fa-moon icon-moon" aria-hidden="true"></i>
          <i class="fas fa-sun icon-sun" aria-hidden="true"></i>
        </button>

        <!-- SELETOR DE IDIOMA -->
        <div class="language-wrapper">
          <button type="button" class="language-button" data-i18n-aria="lang_label"
                  aria-label="Selecionar idioma" aria-expanded="false" aria-haspopup="listbox">
            <img src="../assets/Imagens/br.png" class="flag" alt="Bandeira do Brasil" id="current-flag">
            <span id="current-lang-text">PT</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>
          </button>
          <ul class="language-list" role="listbox">
            <li data-lang="pt" tabindex="-1" role="option" aria-selected="true">
              <img src="../assets/Imagens/br.png" class="flag" alt="Português"> Português
            </li>
            <li data-lang="en" tabindex="-1" role="option" aria-selected="false">
              <img src="../assets/Imagens/us.png" class="flag" alt="English"> English
            </li>
            <li data-lang="es" tabindex="-1" role="option" aria-selected="false">
              <img src="../assets/Imagens/es.png" class="flag" alt="Español"> Español
            </li>
          </ul>
        </div>
      </div>
    </header>

    <main class="login-split">

      <!-- LADO ESQUERDO -->
      <aside class="panel-decorativo">
        <div class="panel-content">
          <div class="shield-icon" aria-hidden="true">
            <i class="fas fa-user-shield"></i>
          </div>
          <h2 id="panel-title" data-i18n="panelTitle">Painel Administrativo</h2>
          <p id="panel-desc" data-i18n="panelDesc">Gerencie sua biblioteca com praticidade.</p>
          <div class="illustration-icons" aria-hidden="true">
            <i class="fas fa-book"></i>
            <i class="fas fa-cogs"></i>
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
      </aside>

      <!-- LADO DIREITO -->
      <section class="form-container">
        <div class="login-card">

          <!-- MENSAGEM DE ERRO -->
          <?php if ($erro): ?>
            <div class="error-message" id="error-message" role="alert">
              <?= $erro ?>
            </div>
          <?php endif; ?>

          <form id="form-login-adm" autocomplete="off" action="../includes/db_login_adm.php" method="POST">
            <h1 class="dot-title" data-i18n="titleLogin">Login Admin</h1>

            <div class="input-group">
              <label for="admin-email" class="sr-only" data-i18n="phEmail">Email</label>
              <input type="email" placeholder="Email" data-i18n-ph="phEmail" id="admin-email" name="email" required>
              <i class="fas fa-envelope icon-input" aria-hidden="true"></i>
            </div>

            <div class="input-group">
              <label for="admin-password" class="sr-only" data-i18n="phPassword">Senha</label>
              <input type="password" placeholder="Senha" data-i18n-ph="phPassword" id="admin-password" name="senha" required>
              <button type="button" class="toggle-eye" id="toggleAdminPassword"
                      aria-label="Mostrar senha" aria-pressed="false">
                <i class="fas fa-eye" aria-hidden="true"></i>
              </button>
            </div>

            <p class="caps-warning" id="caps_warning_admin" role="status" hidden data-i18n="msgCaps">Caps Lock ativado!</p>

            <div class="buttons-layout">
              <button type="submit" class="btn-primary" id="btn-submit-login" data-i18n="btnLogin">Entrar</button>
            </div>
          </form>
        </div>
      </section>

    </main>
  </div>

  <script src="../assets/js/login_adm.js"></script>
</body>
</html>
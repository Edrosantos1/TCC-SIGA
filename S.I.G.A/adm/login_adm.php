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
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Administrador · SiGA ITJ</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/login_adm.css">
</head>
<body>
  <div class="full-background">

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
        <i class="fas fa-book-reader icon-logo"></i> SiGA ITJ
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
            <?= $erro ?>
          </div>
        <?php endif; ?>

        <form id="form-login-adm" autocomplete="off" action="../includes/DBlogin_adm.php" method="POST">
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

          <div class="options-group">
            <a href="#">Esqueceu a senha?</a>
          </div>

          <div class="buttons-layout">
            <button type="submit" class="btn-primary" id="btn-submit-login">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script src="../assets/js/login_adm.js"></script>
</body>
</html>
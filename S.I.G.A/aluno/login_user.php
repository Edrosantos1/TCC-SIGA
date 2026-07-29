<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login / Registro - SiGA ITJ</title>
  <!-- FontAwesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- CSS -->
  <link rel="stylesheet" href="../assets/css/login_user.css">
  <!-- JS -->
  <script src="../assets/js/login_user.js" defer></script>
</head>
<body>
  <div class="full-background">

    <!-- SELETOR DE IDIOMA -->
    <div class="language-wrapper">
      <button class="language-button" aria-label="Selecionar idioma" aria-expanded="false" aria-haspopup="listbox">
        <img src="../assets/Imagens/br.png" class="flag" alt="Bandeira do Brasil" id="current-flag">
        <span id="current-lang-text">PT</span>
        <svg viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5"/>
        </svg>
      </button>
      <ul class="language-list" role="listbox">
        <li data-lang="pt" tabindex="0" role="option" aria-selected="true">
          <img src="../assets/Imagens/br.png" class="flag" alt="Português"> Português
        </li>
        <li data-lang="en" tabindex="0" role="option">
          <img src="../assets/Imagens/us.png" class="flag" alt="English"> English
        </li>
        <li data-lang="es" tabindex="0" role="option">
          <img src="../assets/Imagens/es.png" class="flag" alt="Español"> Español
        </li>
      </ul>
    </div>

    <!-- CABEÇALHO FIXO COMPARTILHADO -->
    <div class="auth-header">
      <a href="../index.html" class="back-arrow" aria-label="Voltar para página inicial">
        <i class="fas fa-arrow-left"></i>
      </a>
      <a href="../index.html" class="brand-logo">
        <span class="fas fa-book-reader icon-logo"></span> SiGA ITJ
      </a>
    </div>

    <!-- CONTAINER PRINCIPAL -->
    <div class="container" id="container">

      <!-- ================= LOGIN ================= -->
      <!-- DOM order 1: é o formulário visível por padrão -->
      <div class="form-container sign-in">
        <form id="form-login" action="../includes/DBlogin_user.php" method="POST" autocomplete="off" novalidate>
          <h1 id="title-login" class="dot-title">Faça seu Login</h1>
          <div class="error-message" style="display:none;"></div>

          <div class="input-group">
            <input type="email" placeholder="Email" name="email" id="login-email">
            <i class="fas fa-envelope icon-input"></i>
          </div>

          <div class="input-group">
            <input type="password" placeholder="Senha" name="senha" id="login-password">
            <i class="fas fa-eye toggle-eye" id="togglePasswordLogin"></i>
          </div>

          <p id="caps_warning" class="caps-warning">Caps Lock ativado!</p>

          <div class="options-group">
            <a href="#!" id="link-forgot">Esqueceu a senha?</a>
          </div>

          <div class="buttons-layout">
            <button type="submit" class="btn-primary" id="btn-submit-login">Entrar</button>
            <div class="google-login-container">
              <button type="button" class="google-login-btn" id="googleLoginBtn">
                <i class="fab fa-google"></i> Entrar com Google
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- ================= REGISTRO ================= -->
      <!-- DOM order 2: oculto por padrão — inert remove da Tab nav e da a11y tree -->
      <div class="form-container sign-up" inert>
        <form id="form-register" action="../includes/DBcadastro_user.php" method="POST" autocomplete="off" novalidate>
          <h1 id="title-register" class="dot-title">Crie sua Conta</h1>
          <div class="reg-error-message" style="display:none;"></div>

          <div class="input-group">
            <input type="text" placeholder="Nome" name="nome" id="reg-name">
            <i class="fas fa-id-card icon-input"></i>
          </div>

          <div class="input-group">
            <select name="serie" id="reg-serie">
              <option value="" disabled selected>Selecione a série</option>
              <option value="6º ano">6º ano</option>
              <option value="7º ano">7º ano</option>
              <option value="8º ano">8º ano</option>
              <option value="9º ano">9º ano</option>
              <option value="1º ano">1º EM</option>
              <option value="2º ano">2º EM</option>
              <option value="3º ano">3º EM</option>
            </select>
            <i class="fas fa-graduation-cap icon-input"></i>
          </div>

          <div class="input-group">
            <input type="email" placeholder="Email" name="email" id="reg-email">
            <i class="fas fa-envelope icon-input"></i>
          </div>

          <div class="input-group">
            <input type="password" placeholder="Senha" name="senha" id="reg-password">
            <i class="fas fa-eye toggle-eye" id="togglePasswordReg"></i>
          </div>

          <!-- INDICADOR DE FORÇA DE SENHA -->
          <div class="strength-indicator" id="strength-indicator">
            <div class="strength-bars">
              <span class="strength-bar"></span>
              <span class="strength-bar"></span>
              <span class="strength-bar"></span>
              <span class="strength-bar"></span>
            </div>
            <span class="strength-label" id="strength-label"></span>
          </div>

          <!-- CHECKLIST DE REQUISITOS -->
          <ul class="password-requirements" id="password-requirements" aria-label="Requisitos da senha">
            <li class="req-item" id="req-length">
              <i class="fas fa-circle-xmark req-icon"></i>
              <span id="req-length-text">Mínimo 8 caracteres</span>
            </li>
            <li class="req-item" id="req-upper">
              <i class="fas fa-circle-xmark req-icon"></i>
              <span id="req-upper-text">Uma letra maiúscula</span>
            </li>
            <li class="req-item" id="req-number">
              <i class="fas fa-circle-xmark req-icon"></i>
              <span id="req-number-text">Um número</span>
            </li>
            <li class="req-item" id="req-special">
              <i class="fas fa-circle-xmark req-icon"></i>
              <span id="req-special-text">Um caractere especial</span>
            </li>
          </ul>

          <div class="input-group">
            <input type="password" placeholder="Confirmar Senha" name="confirmar_senha" id="reg-confirm-password">
            <i class="fas fa-eye toggle-eye" id="toggleConfirmPasswordReg"></i>
            <div id="confirm-error" class="error-message" style="display:none;"></div>
          </div>

          <p id="caps_warning_reg" class="caps-warning">Caps Lock ativado!</p>

          <div class="buttons-layout">
            <button type="submit" class="btn-primary" id="btn-submit-register">Criar conta</button>
            <div class="google-login-container">
              <button type="button" class="google-login-btn" id="googleRegisterBtn">
                <i class="fab fa-google"></i> Cadastrar com Google
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- PAINEL LATERAL -->
      <div class="toggle-container">
        <div class="toggle">
          <!-- toggle-left: fora da tela inicialmente -->
          <div class="toggle-panel toggle-left">
            <h1 id="panel-title-left">Já nos conhece?</h1>
            <p id="panel-desc-left">Acesse sua conta para continuar sua jornada acadêmica.</p>
            <button class="btn-secondary" id="login" tabindex="-1">ENTRAR</button>
          </div>
          <!-- toggle-right: visível no estado inicial -->
          <div class="toggle-panel toggle-right">
            <h1 id="panel-title-right">Novo por aqui?</h1>
            <p id="panel-desc-right">Junte-se a nós e comece sua jornada acadêmica hoje mesmo.</p>
            <button class="btn-secondary" id="register">REGISTRE-SE</button>
          </div>
        </div>
      </div>

    </div><!-- /container -->
  </div><!-- /full-background -->

  <?php
    /**
     * Script PHP para capturar erros do servidor e exibir no frontend
     * Funciona com os formulários de login e registro
     *
     * SEGURANÇA: $_GET['error'] vem direto da URL (não confiável).
     * - $_GET já é decodificado automaticamente pelo PHP, então NÃO
     *   chamamos urldecode() de novo (evita decodificação dupla).
     * - O valor é injetado dentro de uma <script> tag. addslashes()
     *   sozinho NÃO impede que alguém feche a tag com "</script>" e
     *   injete HTML/JS arbitrário (XSS refletido). Por isso usamos
     *   json_encode() com as flags JSON_HEX_*, que transforma
     *   <, >, &, ' e " em sequências \uXXXX seguras dentro de JS.
     */

    if (isset($_GET['error'])) {
      $error = (string) $_GET['error'];
      $isRegistration = isset($_GET['type']) && $_GET['type'] === 'register';

      $seletor = $isRegistration ? '.sign-up .reg-error-message' : '.sign-in .error-message';

      $errorJson = json_encode(
        $error,
        JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
      );
      $seletorJson = json_encode($seletor);

      echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
          var errorDiv = document.querySelector(" . $seletorJson . ");
          if (errorDiv) {
            errorDiv.textContent = " . $errorJson . ";
            errorDiv.style.display = 'block';
          }
        });
      </script>";
    }
  ?>

<!-- ================= MODAL: COMPLETAR SÉRIE (pós Google) ================= -->
<!-- Exibido quando google_auth.php responde com precisa_serie: true,
     ou seja: cadastro novo via Google, ou conta antiga sem série salva. -->
<div id="modalSerieGoogle" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modalSerieTitle">
  <div class="modal-box">

    <span class="step">
      <span class="dots"><span class="active"></span><span class="active"></span></span>
      PASSO 2 DE 2
    </span>

    <h2 id="modalSerieTitle" class="dot-title">Quase lá! <span class="cap">🎓</span></h2>
    <p id="modalSerieDesc">Escolha sua série para concluir o cadastro.</p>

    <div class="group-label">Ensino Fundamental</div>
    <div class="grade-grid">
      <button type="button" class="grade" data-value="6º ano">6º</button>
      <button type="button" class="grade" data-value="7º ano">7º</button>
      <button type="button" class="grade" data-value="8º ano">8º</button>
      <button type="button" class="grade" data-value="9º ano">9º</button>
    </div>

    <div class="group-label">Ensino Médio</div>
    <div class="grade-grid">
      <button type="button" class="grade" data-value="1º ano">1º</button>
      <button type="button" class="grade" data-value="2º ano">2º</button>
      <button type="button" class="grade" data-value="3º ano">3º</button>
    </div>

    <!-- input escondido: guarda o valor selecionado pra ser lido no submit -->
    <input type="hidden" id="modal-serie-select" value="">

    <div class="reg-error-message" id="modalSerieError">⚠ Selecione uma série para continuar.</div>

    <button type="button" class="btn-primary" id="btnConfirmarSerieGoogle">Confirmar</button>
  </div>
</div>
  <!-- Google Sign-In SDK -->
  <script src="https://accounts.google.com/gsi/client" async defer onload="window.onGoogleSDKLoaded && window.onGoogleSDKLoaded()"></script>
</body>
</html>
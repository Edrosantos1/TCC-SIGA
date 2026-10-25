<?php
require_once __DIR__ . '/../../includes/config.php';
$serverError = $_SESSION['flash_login_error'] ?? null;
unset($_SESSION['flash_login_error']);
if (!is_array($serverError)) {
    $serverError = null;
}
$completarSerieGoogle = isset($_SESSION['usuario_id'])
    && empty($_SESSION['usuario_serie'])
    && ($_GET['status'] ?? '') === 'serie_necessaria';
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light" data-suporta-alto-contraste="true">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
  <title>Login / Registro - SIGA ITJ</title>
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
  <link rel="stylesheet" href="../../assets/css/aluno/login_user.css?v=<?= filemtime(__DIR__ . '/../../assets/css/aluno/login_user.css') ?>">
  <script src="../../assets/js/aluno/login_user.js?v=<?= filemtime(__DIR__ . '/../../assets/js/aluno/login_user.js') ?>" defer></script>
</head>
<body>
  <form id="formulario_google" action="google_user.php" method="POST" class="formulario-oculto">
    <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
    <input type="hidden" name="google_token" id="token_google" value="">
  </form>

  <div class="fundo-autenticacao">

    <button type="button" class="alternar-tema" id="alternar_tema" aria-label="Alternar tema">
      <i class="fas fa-moon icone-lua" aria-hidden="true"></i>
      <i class="fas fa-sun icone-sol" aria-hidden="true"></i>
      <i class="fas fa-circle-half-stroke icone-contraste" aria-hidden="true"></i>
    </button>

    <div class="seletor-idioma">
      <button class="botao-idioma" aria-label="Selecionar idioma" aria-expanded="false" aria-haspopup="listbox">
        <img src="../../assets/Imagens/br.png" class="bandeira" alt="Bandeira do Brasil" id="bandeira_atual">
        <span id="texto_idioma_atual">PT</span>
        <svg viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5"/>
        </svg>
      </button>
      <ul class="lista-idiomas" role="listbox">
        <li data-idioma="pt" tabindex="0" role="option" aria-selected="true">
          <img src="../../assets/Imagens/br.png" class="bandeira" alt="Português"> Português
        </li>
        <li data-idioma="en" tabindex="0" role="option">
          <img src="../../assets/Imagens/us.png" class="bandeira" alt="English"> English
        </li>
        <li data-idioma="es" tabindex="0" role="option">
          <img src="../../assets/Imagens/es.png" class="bandeira" alt="Español"> Español
        </li>
      </ul>
    </div>

    <div class="cabecalho-autenticacao">
      <a href="../../index.html" class="link-voltar" aria-label="Voltar para página inicial">
        <i class="fas fa-arrow-left"></i>
      </a>
      <a href="../../index.html" class="logotipo">
        <span class="fas fa-book-reader icone-logotipo"></span> SIGA ITJ
      </a>
    </div>

    <div class="formulario-acesso" id="formulario_acesso">

      <div class="painel-formulario formulario-login">
        <form id="formulario_login" action="../../includes/login_user.php" method="POST" novalidate>
          <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
          <h1 id="titulo_login" class="titulo-pontuado">Faça seu Login</h1>
          <div class="mensagem-erro" style="display:none;"></div>

          <div class="grupo-campo">
            <input type="email" placeholder="Email" name="email" id="email_login" autocomplete="username">
            <i class="fas fa-envelope icone-campo"></i>
          </div>

          <div class="grupo-campo">
            <input type="password" placeholder="Senha" name="senha" id="senha_login" autocomplete="current-password">
            <i class="fas fa-eye alternar-senha" id="alternar_senha_login"></i>
          </div>

          <p id="aviso_caps_lock_login" class="aviso-caps-lock">Caps Lock ativado!</p>

          <div class="opcoes-login">
            <a href="#!" id="link_esqueci_senha">Esqueceu a senha?</a>
          </div>

          <div class="grupo-botoes">
            <button type="submit" class="botao-principal" id="botao_enviar_login">Entrar</button>
            <div class="conteiner-login-google">
              <button type="button" class="botao-login-google" id="botao_login_google">
                <i class="fab fa-google"></i> Entrar com Google
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="painel-formulario formulario-cadastro" inert>
        <form id="formulario_cadastro" action="../../includes/cadastro_user.php" method="POST" novalidate>
          <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
          <h1 id="titulo_cadastro" class="titulo-pontuado">Crie sua Conta</h1>
          <div class="mensagem-erro-cadastro" style="display:none;"></div>

          <div class="grupo-campo">
            <input type="text" placeholder="Nome" name="nome" id="nome_cadastro" autocomplete="name">
            <i class="fas fa-id-card icone-campo"></i>
          </div>

          <div class="grupo-campo">
            <select name="serie" id="serie_cadastro">
              <option value="" disabled selected>Selecione a série</option>
              <option value="6º ano">6º ano</option>
              <option value="7º ano">7º ano</option>
              <option value="8º ano">8º ano</option>
              <option value="9º ano">9º ano</option>
              <option value="1º ano">1º EM</option>
              <option value="2º ano">2º EM</option>
              <option value="3º ano">3º EM</option>
            </select>
            <i class="fas fa-graduation-cap icone-campo"></i>
          </div>

          <div class="grupo-campo">
            <input type="email" placeholder="Email" name="email" id="email_cadastro" autocomplete="email">
            <i class="fas fa-envelope icone-campo"></i>
          </div>

          <div class="grupo-campo">
            <input type="password" placeholder="Senha" name="senha" id="senha_cadastro" autocomplete="new-password">
            <i class="fas fa-eye alternar-senha" id="alternar_senha_cadastro"></i>
          </div>

          <div class="indicador-forca" id="indicador_forca_senha">
            <div class="barras-forca">
              <span class="barra-forca"></span>
              <span class="barra-forca"></span>
              <span class="barra-forca"></span>
              <span class="barra-forca"></span>
            </div>
            <span class="rotulo-forca" id="rotulo_forca_senha"></span>
          </div>

          <ul class="requisitos-senha" id="requisitos_senha" aria-label="Requisitos da senha">
            <li class="item-requisito" id="requisito_comprimento">
              <i class="fas fa-circle-xmark icone-requisito"></i>
              <span id="texto_requisito_comprimento">Mínimo 8 caracteres</span>
            </li>
            <li class="item-requisito" id="requisito_maiuscula">
              <i class="fas fa-circle-xmark icone-requisito"></i>
              <span id="texto_requisito_maiuscula">Uma letra maiúscula</span>
            </li>
            <li class="item-requisito" id="requisito_numero">
              <i class="fas fa-circle-xmark icone-requisito"></i>
              <span id="texto_requisito_numero">Um número</span>
            </li>
            <li class="item-requisito" id="requisito_especial">
              <i class="fas fa-circle-xmark icone-requisito"></i>
              <span id="texto_requisito_especial">Um caractere especial</span>
            </li>
          </ul>

          <div class="grupo-campo">
            <input type="password" placeholder="Confirmar Senha" name="confirmar_senha" id="confirmar_senha_cadastro" autocomplete="new-password">
            <i class="fas fa-eye alternar-senha" id="alternar_confirmacao_senha_cadastro"></i>
          </div>

          <p id="aviso_caps_lock_cadastro" class="aviso-caps-lock">Caps Lock ativado!</p>

          <div class="grupo-botoes">
            <button type="submit" class="botao-principal" id="botao_enviar_cadastro">Criar conta</button>
          </div>
        </form>
      </div>

      <div class="conteiner-alternancia">
        <div class="alternancia">
          <div class="painel-alternancia painel-esquerdo">
            <h1 id="titulo_painel_esquerdo">Já nos conhece?</h1>
            <p id="descricao_painel_esquerdo">Acesse sua conta para continuar sua jornada acadêmica.</p>
            <button class="botao-secundario" id="botao_ir_login" tabindex="-1">ENTRAR</button>
          </div>
          <div class="painel-alternancia painel-direito">
            <h1 id="titulo_painel_direito">Novo por aqui?</h1>
            <p id="descricao_painel_direito">Junte-se a nós e comece sua jornada acadêmica hoje mesmo.</p>
            <button class="botao-secundario" id="botao_ir_cadastro">REGISTRE-SE</button>
          </div>
        </div>
      </div>

    </div>
  </div>
  <script>
    window.ERRO_SERVIDOR = <?= json_encode($serverError, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>;
    window.COMPLETAR_SERIE_GOOGLE = <?= json_encode($completarSerieGoogle) ?>;
  </script>

<div id="modal_serie_google" class="sobreposicao-modal" role="dialog" aria-modal="true" aria-labelledby="titulo_modal_serie">
  <div class="caixa-modal">

    <span class="etapa">
      <span class="pontos"><span class="ativo"></span><span class="ativo"></span></span>
      PASSO 2 DE 2
    </span>

    <h2 id="titulo_modal_serie" class="titulo-pontuado">Quase lá! <span class="icone-formatura">🎓</span></h2>
    <p id="descricao_modal_serie">Escolha sua série para concluir o cadastro.</p>

    <div class="rotulo-grupo">Ensino Fundamental</div>
    <div class="grade-series">
      <button type="button" class="botao-serie" data-valor="6º ano">6º</button>
      <button type="button" class="botao-serie" data-valor="7º ano">7º</button>
      <button type="button" class="botao-serie" data-valor="8º ano">8º</button>
      <button type="button" class="botao-serie" data-valor="9º ano">9º</button>
    </div>

    <div class="rotulo-grupo">Ensino Médio</div>
    <div class="grade-series">
      <button type="button" class="botao-serie" data-valor="1º ano">1º</button>
      <button type="button" class="botao-serie" data-valor="2º ano">2º</button>
      <button type="button" class="botao-serie" data-valor="3º ano">3º</button>
    </div>

    <div class="mensagem-erro-cadastro" id="erro_modal_serie" role="alert">Selecione uma série para continuar.</div>

    <form id="formulario_completar_serie" action="completar_serie_user.php" method="POST">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
      <input type="hidden" id="serie_modal_google" name="serie" value="">
      <button type="submit" class="botao-principal" id="botao_confirmar_serie_google">Confirmar</button>
    </form>
  </div>
</div>
  <script src="https://accounts.google.com/gsi/client" async defer onload="window.onGoogleSDKLoaded && window.onGoogleSDKLoaded()"></script>
  <script src="../../assets/js/shared/tema.js"></script>
</body>
</html>

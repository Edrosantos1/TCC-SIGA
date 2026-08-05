// ============================================================
//  login_user.js – Versão unificada (i18n + validações + Google Sign-In)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ── Referências aos elementos da página ──
  const googleBtn = document.getElementById('googleLoginBtn');
  const googleRegisterBtn = document.getElementById('googleRegisterBtn');
  const container = document.getElementById('container');
  const wrapper = document.querySelector(".language-wrapper");
  const langBtn = document.querySelector(".language-button");
  const langItems = document.querySelectorAll(".language-list li");

  // Elementos do formulário de registro
  const regName = document.getElementById("reg-name");
  const regSerie = document.getElementById("reg-serie");
  const regEmail = document.getElementById("reg-email");
  const regPassword = document.getElementById("reg-password");
  const regConfirmPassword = document.getElementById("reg-confirm-password");
  const registerForm = document.getElementById("form-register");
  const confirmErrorDiv = document.getElementById("confirm-error");

    // ===== CORREÇÃO: TAB + ENTER/ESPAÇO NO SELECT DE SÉRIE =====
  if (regSerie) {
    // Garante que o select tenha tabindex (já possui por padrão, mas por segurança)
    regSerie.setAttribute('tabindex', '0');

    // Abre o dropdown do select com teclado e evita que o Enter submeta o formulário
    regSerie.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();

        if (typeof regSerie.showPicker === 'function') {
          regSerie.showPicker();
        } else {
          regSerie.focus();
        }
      }
    });
  }

  // Elementos do formulário de login
  const loginForm = document.getElementById("form-login");
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const loginErrorDiv = document.querySelector(".sign-in .error-message");

  // Elementos do modal "completar série" (pós Google)
  const modalSerieGoogle = document.getElementById("modalSerieGoogle");
  const modalSerieSelect = document.getElementById("modal-serie-select");
  const modalSerieError = document.getElementById("modalSerieError");
  const btnConfirmarSerieGoogle = document.getElementById("btnConfirmarSerieGoogle");

  const capsWarningReg = document.getElementById("caps_warning_reg");
  const capsWarningLogin = document.getElementById("caps_warning");

  // ── Função para validar email ──
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ── traduções ──
  let idiomaAtual = "pt";
  const translations = {
    pt: {
      flag: "../assets/Imagens/br.png",
      titleLogin: "Faça seu Login",
      titleRegister: "Crie sua Conta",
      phName: "Nome",
      phEmail: "Email",
      phPassword: "Senha",
      phConfirm: "Confirmar Senha",
      btnRegister: "Criar conta",
      btnLogin: "Entrar",
      textRemember: "Lembrar-me",
      linkForgot: "Esqueci a senha?",
      panelTitleLeft: "Já nos conhece?",
      panelDescLeft: "Acesse sua conta para continuar sua jornada acadêmica.",
      btnPanelLeft: "ENTRAR",
      panelTitleRight: "Novo por aqui?",
      panelDescRight: "Junte-se a nós e comece sua jornada acadêmica hoje mesmo.",
      btnPanelRight: "REGISTRE-SE",
      msgCaps: "Caps Lock ativado!",
      googleBtn: "Entrar com Google",
      googleRegisterBtn: "Cadastrar com Google",
      googleAlert: "Integração com Google em desenvolvimento. Em breve você poderá logar com sua conta Google.",
      confirmErrorMsg: "As senhas não coincidem.",
      strengthWeak: "Fraca",
      strengthFair: "Razoável",
      strengthGood: "Boa",
      strengthStrong: "Forte",
      reqLength: "Mínimo 8 caracteres",
      reqUpper: "Uma letra maiúscula",
      reqNumber: "Um número",
      reqSpecial: "Um caractere especial",
      serie6: "6º ano",
      serie7: "7º ano",
      serie8: "8º ano",
      serie9: "9º ano",
      serie1: "1º EM",
      serie2: "2º EM",
      serie3: "3º EM",
      errorNameEmpty: "Por favor, preencha seu nome.",
      errorEmailEmpty: "Por favor, preencha seu email.",
      errorEmailInvalid: "Por favor, insira um email válido (ex: seu@email.com).",
      errorPasswordEmpty: "Por favor, preencha sua senha.",
      errorPasswordShort: "A senha deve ter no mínimo 8 caracteres.",
      errorConfirmEmpty: "Por favor, confirme sua senha.",
      errorSerieEmpty: "Por favor, selecione uma série.",
      errorLoginEmailEmpty: "Por favor, preencha seu email.",
      errorLoginPasswordEmpty: "Por favor, preencha sua senha.",
      errorLoginFailed: "Email ou senha incorretos. Tente novamente.",
      modalSerieTitle: "Quase lá!",
      modalSerieDesc: "Escolha sua série para concluir o cadastro.",
      modalSerieConfirm: "Confirmar",
    },
    en: {
      flag: "../assets/Imagens/us.png",
      titleLogin: "Sign In",
      titleRegister: "Create Account",
      phName: "Name",
      phEmail: "Email",
      phPassword: "Password",
      phConfirm: "Confirm Password",
      btnRegister: "Sign Up",
      btnLogin: "Sign In",
      textRemember: "Remember me",
      linkForgot: "Forgot Password?",
      panelTitleLeft: "Welcome Back!",
      panelDescLeft: "Access your account to continue your academic journey.",
      btnPanelLeft: "SIGN IN",
      panelTitleRight: "New here?",
      panelDescRight: "Join us and start your academic journey today.",
      btnPanelRight: "SIGN UP",
      msgCaps: "Caps Lock is on!",
      googleBtn: "Sign in with Google",
      googleRegisterBtn: "Sign up with Google",
      googleAlert: "Google integration under development. Soon you'll be able to log in with your Google account.",
      confirmErrorMsg: "Passwords do not match.",
      strengthWeak: "Weak",
      strengthFair: "Fair",
      strengthGood: "Good",
      strengthStrong: "Strong",
      reqLength: "At least 8 characters",
      reqUpper: "One uppercase letter",
      reqNumber: "One number",
      reqSpecial: "One special character",
      serie6: "6th grade",
      serie7: "7th grade",
      serie8: "8th grade",
      serie9: "9th grade",
      serie1: "1st year High School",
      serie2: "2nd year High School",
      serie3: "3rd year High School",
      errorNameEmpty: "Please fill in your name.",
      errorEmailEmpty: "Please fill in your email.",
      errorEmailInvalid: "Please enter a valid email (e.g., your@email.com).",
      errorPasswordEmpty: "Please fill in your password.",
      errorPasswordShort: "Password must be at least 8 characters long.",
      errorConfirmEmpty: "Please confirm your password.",
      errorSerieEmpty: "Please select a grade.",
      errorLoginEmailEmpty: "Please fill in your email.",
      errorLoginPasswordEmpty: "Please fill in your password.",
      errorLoginFailed: "Incorrect email or password. Please try again.",
      modalSerieTitle: "Almost there!",
      modalSerieDesc: "Choose your grade to finish signing up.",
      modalSerieConfirm: "Confirm",
    },
    es: {
      flag: "../assets/Imagens/es.png",
      titleLogin: "Iniciar Sesión",
      titleRegister: "Crea tu Cuenta",
      phName: "Nombre",
      phEmail: "Correo electrónico",
      phPassword: "Contraseña",
      phConfirm: "Confirmar Contraseña",
      btnRegister: "Registrarse",
      btnLogin: "Entrar",
      textRemember: "Recuérdame",
      linkForgot: "¿Olvidaste tu contraseña?",
      panelTitleLeft: "¡Bienvenido de nuevo!",
      panelDescLeft: "Accede a tu cuenta para continuar tu viaje académico.",
      btnPanelLeft: "ENTRAR",
      panelTitleRight: "¿Nuevo por aquí?",
      panelDescRight: "Únete a nosotros y comienza tu viaje académico hoy mismo.",
      btnPanelRight: "REGÍSTRATE",
      msgCaps: "¡Bloq Mayús activado!",
      googleBtn: "Iniciar sesión con Google",
      googleRegisterBtn: "Regístrate con Google",
      googleAlert: "Integración con Google en desarrollo. Pronto podrás iniciar sesión con tu cuenta de Google.",
      confirmErrorMsg: "Las contraseñas no coinciden.",
      strengthWeak: "Débil",
      strengthFair: "Regular",
      strengthGood: "Buena",
      strengthStrong: "Fuerte",
      reqLength: "Mínimo 8 caracteres",
      reqUpper: "Una letra mayúscula",
      reqNumber: "Un número",
      reqSpecial: "Un carácter especial",
      serie6: "6º grado",
      serie7: "7º grado",
      serie8: "8º grado",
      serie9: "9º grado",
      serie1: "1º año Bachillerato",
      serie2: "2º año Bachillerato",
      serie3: "3º año Bachillerato",
      errorNameEmpty: "Por favor, complete su nombre.",
      errorEmailEmpty: "Por favor, complete su correo electrónico.",
      errorEmailInvalid: "Por favor, ingrese un correo válido (ej: su@correo.com).",
      errorPasswordEmpty: "Por favor, complete su contraseña.",
      errorPasswordShort: "La contraseña debe tener al menos 8 caracteres.",
      errorConfirmEmpty: "Por favor, confirme su contraseña.",
      errorSerieEmpty: "Por favor, seleccione un grado.",
      errorLoginEmailEmpty: "Por favor, complete su correo electrónico.",
      errorLoginPasswordEmpty: "Por favor, complete su contraseña.",
      errorLoginFailed: "Correo o contraseña incorrectos. Intente de nuevo.",
      modalSerieTitle: "¡Ya casi!",
      modalSerieDesc: "Elige tu grado para terminar tu registro.",
      modalSerieConfirm: "Confirmar",
    }
  };

  // ── Função para atualizar o select de série ──
  function updateSerieSelect() {
    const t = translations[idiomaAtual];
    const serieSelect = document.getElementById("reg-serie");
    if (!serieSelect) {
      console.warn("Elemento #reg-serie não encontrado.");
      return;
    }
    const valorAtual = serieSelect.value;
    serieSelect.innerHTML = `
      <option value="" disabled selected>Selecione a série</option>
      <option value="6º ano">${t.serie6}</option>
      <option value="7º ano">${t.serie7}</option>
      <option value="8º ano">${t.serie8}</option>
      <option value="9º ano">${t.serie9}</option>
      <option value="1º ano">${t.serie1}</option>
      <option value="2º ano">${t.serie2}</option>
      <option value="3º ano">${t.serie3}</option>
    `;
    if (valorAtual && [...serieSelect.options].some(opt => opt.value === valorAtual)) {
      serieSelect.value = valorAtual;
    }
  }

  // ── Função para atualizar o select de série do modal (pós Google) ──
  function updateModalSerieSelect() {
    const t = translations[idiomaAtual];
    if (!modalSerieSelect) return;
    const valorAtual = modalSerieSelect.value;
    modalSerieSelect.innerHTML = `
      <option value="" disabled selected>Selecione a série</option>
      <option value="6º ano">${t.serie6}</option>
      <option value="7º ano">${t.serie7}</option>
      <option value="8º ano">${t.serie8}</option>
      <option value="9º ano">${t.serie9}</option>
      <option value="1º ano">${t.serie1}</option>
      <option value="2º ano">${t.serie2}</option>
      <option value="3º ano">${t.serie3}</option>
    `;
    if (valorAtual && [...modalSerieSelect.options].some(opt => opt.value === valorAtual)) {
      modalSerieSelect.value = valorAtual;
    }
  }

  // ── Função para mostrar erro em um campo ──
  function showFieldError(input, errorMessage) {
    const inputGroup = input.closest('.input-group');
    if (!inputGroup) return;

    let errorDiv = inputGroup.querySelector('.field-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      inputGroup.appendChild(errorDiv);
    }

    errorDiv.textContent = errorMessage;
    errorDiv.style.display = 'block';
    input.classList.add('input-error');
  }

  // ── Função para limpar erro de um campo ──
  function clearFieldError(input) {
    const inputGroup = input.closest('.input-group');
    if (!inputGroup) return;

    const errorDiv = inputGroup.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
    input.classList.remove('input-error');
  }

  // ── Validação de Email ──
  function validateEmail(input) {
    const email = input.value.trim();
    if (email === '') {
      showFieldError(input, translations[idiomaAtual].errorEmailEmpty);
      return false;
    }
    if (!isValidEmail(email)) {
      showFieldError(input, translations[idiomaAtual].errorEmailInvalid);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  // ── Validação de Nome ──
  function validateName(input) {
    const name = input.value.trim();
    if (name === '') {
      showFieldError(input, translations[idiomaAtual].errorNameEmpty);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  // ── Validação de Série ──
  function validateSerie(input) {
    if (input.value === '') {
      showFieldError(input, translations[idiomaAtual].errorSerieEmpty);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  // ── Validação de Senha (Registro) ──
  function validatePasswordReg(input) {
    const password = input.value;
    if (password === '') {
      showFieldError(input, translations[idiomaAtual].errorPasswordEmpty);
      return false;
    }
    if (password.length < 8) {
      showFieldError(input, translations[idiomaAtual].errorPasswordShort);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  // ── Validação de Confirmação de Senha ──
  function validateConfirmPassword(input) {
    const confirm = input.value;
    if (confirm === '') {
      showFieldError(input, translations[idiomaAtual].errorConfirmEmpty);
      return false;
    }
    if (regPassword.value !== confirm) {
      showFieldError(input, translations[idiomaAtual].confirmErrorMsg);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  // ── Validação de Login ──
  function validateLoginEmail(input) {
    const email = input.value.trim();
    if (email === '') {
      showFieldError(input, translations[idiomaAtual].errorLoginEmailEmpty);
      return false;
    }
    if (!isValidEmail(email)) {
      showFieldError(input, translations[idiomaAtual].errorEmailInvalid);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  function validateLoginPassword(input) {
    const password = input.value;
    if (password === '') {
      showFieldError(input, translations[idiomaAtual].errorLoginPasswordEmpty);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  // ── Função para atualizar toda a interface conforme o idioma ──
  function aplicarIdioma(lang) {
    idiomaAtual = lang;
    const t = translations[lang];

    document.getElementById("current-flag").src = t.flag;
    document.getElementById("current-lang-text").textContent = lang.toUpperCase();

    document.querySelectorAll(".language-list li").forEach(li => {
      const langLi = li.dataset.lang;
      if (langLi && translations[langLi]) {
        const img = li.querySelector("img");
        if (img) img.src = translations[langLi].flag;
      }
    });

    document.getElementById("title-register").textContent = t.titleRegister;
    if (regName) regName.placeholder = t.phName;
    if (regEmail) regEmail.placeholder = t.phEmail;
    if (regPassword) regPassword.placeholder = t.phPassword;
    if (regConfirmPassword) regConfirmPassword.placeholder = t.phConfirm;
    const btnRegister = document.getElementById("btn-submit-register");
    if (btnRegister) btnRegister.textContent = t.btnRegister;
    if (capsWarningReg) capsWarningReg.textContent = t.msgCaps;

    document.getElementById("title-login").textContent = t.titleLogin;
    if (loginEmail) loginEmail.placeholder = t.phEmail;
    if (loginPassword) loginPassword.placeholder = t.phPassword;
    const rememberText = document.getElementById("text-remember");
    if (rememberText) rememberText.textContent = t.textRemember;
    const forgotLink = document.getElementById("link-forgot");
    if (forgotLink) forgotLink.textContent = t.linkForgot;
    const btnLogin = document.getElementById("btn-submit-login");
    if (btnLogin) btnLogin.textContent = t.btnLogin;
    if (capsWarningLogin) capsWarningLogin.textContent = t.msgCaps;

    const panelLeftTitle = document.getElementById("panel-title-left");
    if (panelLeftTitle) panelLeftTitle.textContent = t.panelTitleLeft;
    const panelLeftDesc = document.getElementById("panel-desc-left");
    if (panelLeftDesc) panelLeftDesc.textContent = t.panelDescLeft;
    const loginBtn = document.getElementById("login");
    if (loginBtn) loginBtn.textContent = t.btnPanelLeft;
    const panelRightTitle = document.getElementById("panel-title-right");
    if (panelRightTitle) panelRightTitle.textContent = t.panelTitleRight;
    const panelRightDesc = document.getElementById("panel-desc-right");
    if (panelRightDesc) panelRightDesc.textContent = t.panelDescRight;
    const registerBtn = document.getElementById("register");
    if (registerBtn) registerBtn.textContent = t.btnPanelRight;

    if (googleBtn) {
      googleBtn.innerHTML = `<i class="fab fa-google"></i> ${t.googleBtn}`;
    }
    if (googleRegisterBtn) {
      googleRegisterBtn.innerHTML = `<i class="fab fa-google"></i> ${t.googleRegisterBtn}`;
    }

    updateSerieSelect();

    const modalSerieTitleEl = document.getElementById("modalSerieTitle");
    if (modalSerieTitleEl) modalSerieTitleEl.textContent = t.modalSerieTitle;
    const modalSerieDescEl = document.getElementById("modalSerieDesc");
    if (modalSerieDescEl) modalSerieDescEl.textContent = t.modalSerieDesc;
    if (btnConfirmarSerieGoogle) btnConfirmarSerieGoogle.textContent = t.modalSerieConfirm;
    updateModalSerieSelect();

    if (regPassword && regPassword.value) updateStrengthIndicator(regPassword.value);

    applyRequirementLabels();
    if (regPassword && regPassword.value) updateRequirements(regPassword.value);

    clearMessages();
  }

  function clearMessages() {
    const errorMsg = document.querySelector(".error-message");
    const regErrorMsg = document.querySelector(".reg-error-message");
    if (errorMsg) errorMsg.style.display = "none";
    if (regErrorMsg) regErrorMsg.style.display = "none";
    if (confirmErrorDiv) confirmErrorDiv.style.display = "none";
  }

  // ── Limpa todas as mensagens de erro (gerais + por campo) ──
  function limparErros() {
    clearMessages();
    document.querySelectorAll('.field-error').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }

  function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return 1;
    if (score === 2) return 2;
    if (score <= 4) return 3;
    return 4;
  }

  function updateStrengthIndicator(password) {
    const indicator = document.getElementById('strength-indicator');
    const label = document.getElementById('strength-label');
    if (!indicator || !label) return;
    if (!password) {
      indicator.style.display = 'none';
      indicator.className = 'strength-indicator';
      return;
    }
    indicator.style.display = 'block';
    const level = getPasswordStrength(password);
    indicator.className = `strength-indicator level-${level}`;
    const t = translations[idiomaAtual];
    label.textContent = [t.strengthWeak, t.strengthFair, t.strengthGood, t.strengthStrong][level - 1];
  }

  const REQ_CHECKS = {
    length: pwd => pwd.length >= 8,
    upper: pwd => /[A-Z]/.test(pwd),
    number: pwd => /[0-9]/.test(pwd),
    special: pwd => /[^A-Za-z0-9]/.test(pwd),
  };

  function updateRequirements(password) {
    Object.keys(REQ_CHECKS).forEach(key => {
      const item = document.getElementById(`req-${key}`);
      if (!item) return;
      const met = REQ_CHECKS[key](password);
      const icon = item.querySelector('.req-icon');
      item.classList.toggle('met', met);
      if (icon) {
        icon.classList.toggle('fa-circle-check', met);
        icon.classList.toggle('fa-circle-xmark', !met);
      }
    });
  }

  function applyRequirementLabels() {
    const t = translations[idiomaAtual];
    const map = { length: t.reqLength, upper: t.reqUpper, number: t.reqNumber, special: t.reqSpecial };
    Object.entries(map).forEach(([key, text]) => {
      const span = document.getElementById(`req-${key}-text`);
      if (span) span.textContent = text;
    });
  }

  if (regPassword) {
    regPassword.addEventListener('focus', () => {
      const reqs = document.getElementById('password-requirements');
      if (reqs) reqs.classList.add('visible');
    });
    regPassword.addEventListener('blur', () => {
      const reqs = document.getElementById('password-requirements');
      if (reqs) reqs.classList.remove('visible');
    });
  }

  if (regPassword) {
    regPassword.addEventListener("input", () => {
      updateStrengthIndicator(regPassword.value);
      updateRequirements(regPassword.value);
    });
  }

  if (regConfirmPassword) {
    regConfirmPassword.addEventListener("input", () => {
      if (regConfirmPassword.value !== '') {
        validateConfirmPassword(regConfirmPassword);
      }
    });
  }

  if (regName) {
    regName.addEventListener('blur', () => validateName(regName));
  }
  if (regEmail) {
    regEmail.addEventListener('blur', () => validateEmail(regEmail));
  }
  if (regPassword) {
    regPassword.addEventListener('blur', () => validatePasswordReg(regPassword));
  }
  if (regConfirmPassword) {
    regConfirmPassword.addEventListener('blur', () => validateConfirmPassword(regConfirmPassword));
  }
  if (regSerie) {
    regSerie.addEventListener('blur', () => validateSerie(regSerie));
  }

  if (loginEmail) {
    loginEmail.addEventListener('blur', () => validateLoginEmail(loginEmail));
  }
  if (loginPassword) {
    loginPassword.addEventListener('blur', () => validateLoginPassword(loginPassword));
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const isNameValid = validateName(regName);
      const isSerieValid = validateSerie(regSerie);
      const isEmailValid = validateEmail(regEmail);
      const isPasswordValid = validatePasswordReg(regPassword);
      const isConfirmValid = validateConfirmPassword(regConfirmPassword);

      if (isNameValid && isSerieValid && isEmailValid && isPasswordValid && isConfirmValid) {
        registerForm.submit();
      } else {
        if (!isNameValid) regName.focus();
        else if (!isSerieValid) regSerie.focus();
        else if (!isEmailValid) regEmail.focus();
        else if (!isPasswordValid) regPassword.focus();
        else if (!isConfirmValid) regConfirmPassword.focus();
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const isEmailValid = validateLoginEmail(loginEmail);
      const isPasswordValid = validateLoginPassword(loginPassword);

      if (isEmailValid && isPasswordValid) {
        loginForm.submit();
      } else {
        if (!isEmailValid) loginEmail.focus();
        else if (!isPasswordValid) loginPassword.focus();
      }
    });
  }

  // ============================================================
  //  GOOGLE SIGN-IN
  // ============================================================
  let googleInicializado = false;

  function inicializarGoogle() {
    if (!window.google || !google.accounts || !google.accounts.id) {
      console.warn("⏳ Google SDK ainda não carregado.");
      return false;
    }
    try {
      google.accounts.id.initialize({
        client_id: '1039622063080-o38po3mnc76be497osrdtfsfmjb7j5q9.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true // migração recomendada pelo Google (FedCM)
      });
      googleInicializado = true;

      // Sobrepõe o botão OFICIAL do Google (invisível) em cima dos botões
      // customizados. Diferente do prompt() do One Tap, este fluxo SEMPRE
      // abre a tela de seleção de conta, sem sofrer cooldown/supressão.
      renderizarBotaoGoogleInvisivel(googleBtn, 'gsiOverlayLogin');
      renderizarBotaoGoogleInvisivel(googleRegisterBtn, 'gsiOverlayRegister');

      console.log("✅ Google Sign-In inicializado com sucesso.");
      return true;
    } catch (e) {
      console.error("❌ Erro ao inicializar Google:", e);
      return false;
    }
  }

  // ── Cria/posiciona um botão oficial do Google, invisível, exatamente
  //    em cima do botão customizado correspondente ──
  function renderizarBotaoGoogleInvisivel(botaoCustomizado, idOverlay) {
    if (!botaoCustomizado) return;

    let overlay = document.getElementById(idOverlay);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = idOverlay;
      overlay.style.position = 'absolute';
      overlay.style.opacity = '0';
      overlay.style.overflow = 'hidden';
      overlay.style.zIndex = '9999';
      overlay.style.pointerEvents = 'auto';
      document.body.appendChild(overlay);

      // Garante que o botão customizado não capture mais o clique
      // (o overlay, por estar por cima, recebe o clique primeiro)
      botaoCustomizado.style.position = botaoCustomizado.style.position || 'relative';
    }

    const posicionar = () => {
      const rect = botaoCustomizado.getBoundingClientRect();
      overlay.style.top = `${window.scrollY + rect.top}px`;
      overlay.style.left = `${window.scrollX + rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    };

    posicionar();
    window.addEventListener('resize', posicionar);
    window.addEventListener('scroll', posicionar, true);

    // Reposiciona sempre que o layout pode ter mudado (ex.: troca login/registro)
    const resizeObserver = new ResizeObserver(posicionar);
    resizeObserver.observe(document.body);

    google.accounts.id.renderButton(overlay, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: Math.max(botaoCustomizado.offsetWidth, 200)
    });
  }

  // Função chamada quando o SDK termina de carregar (via onload)
  window.onGoogleSDKLoaded = function() {
    console.log("📡 SDK do Google carregado.");
    inicializarGoogle();
  };

  // Tentar inicializar imediatamente se o SDK já estiver disponível
  if (window.google && google.accounts && google.accounts.id) {
    inicializarGoogle();
  } else {
    // Fallback: verificar a cada 500ms por até 10 segundos
    let tentativas = 0;
    const intervalo = setInterval(() => {
      if (inicializarGoogle()) {
        clearInterval(intervalo);
      }
      tentativas++;
      if (tentativas > 20) { // 10 segundos
        clearInterval(intervalo);
        console.error("❌ Google SDK não carregou a tempo.");
        mostrarErroGoogle("O serviço de login do Google não está disponível. Tente recarregar a página.");
      }
    }, 500);
  }

  // ── Função para mostrar erro genérico (Google) ──
  function mostrarErroGoogle(mensagem) {
    const isActive = container.classList.contains('active');
    const errorDiv = isActive ?
      document.querySelector('.sign-up .reg-error-message') :
      document.querySelector('.sign-in .error-message');
    if (errorDiv) {
      errorDiv.textContent = mensagem;
      errorDiv.style.display = 'block';
    }
  }

  // ── Callback do Google (recebe o ID token) ──
  function handleCredentialResponse(response) {
    const token = response?.credential;
    if (!token) {
      console.error("❌ Nenhum token recebido.");
      mostrarErroGoogle("Não foi possível obter credenciais do Google.");
      return;
    }
    console.log("🔑 Token recebido, enviando para o servidor...");
    enviarTokenParaServidor(token);
  }

  // ── Envia o ID token para o backend, que valida com o Google ──
  function enviarTokenParaServidor(token) {
    limparErros();
    const form = new FormData();
    form.append('google_token', token);

    fetch('./google_auth.php', {
      method: 'POST',
      body: form
    })
      .then(response => response.json())
      .then(data => {
        if (data.sucesso) {
          console.log("✅ Autenticação bem-sucedida:", data.mensagem);
          if (data.precisa_serie) {
            abrirModalSerie();
          } else {
            window.location.href = 'dashboard_aluno.php';
          }
        } else {
          console.error("❌ Erro no servidor:", data.mensagem);
          mostrarErroGoogle(data.mensagem || 'Erro ao autenticar com Google.');
        }
      })
      .catch(erro => {
        console.error("❌ Erro na requisição:", erro);
        mostrarErroGoogle('Erro ao conectar com o servidor. Tente novamente.');
      });
  }

  // ── Botões de série do modal (6º, 7º, 8º... 1º-3º EM) ──
  // Clicar num botão preenche o input escondido #modal-serie-select
  // (que é o valor lido por confirmarSerieGoogle) e marca visualmente
  // o botão selecionado.
  const gradeButtons = modalSerieGoogle
    ? modalSerieGoogle.querySelectorAll('.grade')
    : [];

  function selecionarGrade(botao) {
    gradeButtons.forEach(b => b.classList.remove('selected'));
    botao.classList.add('selected');
    if (modalSerieSelect) modalSerieSelect.value = botao.dataset.value;
    if (modalSerieError) modalSerieError.style.display = 'none';
    // Ativa o estado visual "pronto" do botão Confirmar (CSS: .btn-primary.ready)
    if (btnConfirmarSerieGoogle) btnConfirmarSerieGoogle.classList.add('ready');
  }

  gradeButtons.forEach(botao => {
    botao.addEventListener('click', () => selecionarGrade(botao));
  });

  // ── Modal "completar cadastro": abre quando falta escolher a série ──
  function abrirModalSerie() {
    if (modalSerieError) modalSerieError.style.display = 'none';
    if (modalSerieSelect) modalSerieSelect.value = '';
    gradeButtons.forEach(b => b.classList.remove('selected'));
    if (btnConfirmarSerieGoogle) {
      btnConfirmarSerieGoogle.disabled = false;
      btnConfirmarSerieGoogle.classList.remove('ready', 'loading');
    }
    if (modalSerieGoogle) modalSerieGoogle.style.display = 'flex';
  }

  function fecharModalSerie() {
    if (modalSerieGoogle) modalSerieGoogle.style.display = 'none';
  }

  function confirmarSerieGoogle() {
    const serie = modalSerieSelect ? modalSerieSelect.value : '';
    if (!serie) {
      if (modalSerieError) {
        modalSerieError.textContent = translations[idiomaAtual].errorSerieEmpty;
        modalSerieError.style.display = 'block';
      }
      return;
    }

    if (modalSerieError) modalSerieError.style.display = 'none';
    if (btnConfirmarSerieGoogle) {
      btnConfirmarSerieGoogle.disabled = true;
      btnConfirmarSerieGoogle.classList.remove('ready');
      btnConfirmarSerieGoogle.classList.add('loading');
    }

    const form = new FormData();
    form.append('serie', serie);

    fetch('./completar_serie.php', {
      method: 'POST',
      body: form
    })
      .then(response => response.json())
      .then(data => {
        if (data.sucesso) {
          window.location.href = 'dashboard_aluno.php';
        } else {
          if (modalSerieError) {
            modalSerieError.textContent = data.mensagem || 'Erro ao salvar a série.';
            modalSerieError.style.display = 'block';
          }
          if (btnConfirmarSerieGoogle) {
            btnConfirmarSerieGoogle.disabled = false;
            btnConfirmarSerieGoogle.classList.remove('loading');
            btnConfirmarSerieGoogle.classList.add('ready');
          }
        }
      })
      .catch(erro => {
        console.error("❌ Erro ao salvar série:", erro);
        if (modalSerieError) {
          modalSerieError.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
          modalSerieError.style.display = 'block';
        }
        if (btnConfirmarSerieGoogle) {
          btnConfirmarSerieGoogle.disabled = false;
          btnConfirmarSerieGoogle.classList.remove('loading');
          btnConfirmarSerieGoogle.classList.add('ready');
        }
      });
  }

  if (btnConfirmarSerieGoogle) {
    btnConfirmarSerieGoogle.addEventListener('click', confirmarSerieGoogle);
  }

  function triggerGoogleSignIn() {
    if (!googleInicializado) {
      if (!inicializarGoogle()) {
        mostrarErroGoogle("O login com Google não está disponível. Recarregue a página.");
        return;
      }
    }
    // O prompt só funciona se for chamado por interação do usuário (clique)
    try {
      google.accounts.id.disableAutoSelect();
      // IMPORTANTE: passar um callback para saber quando o Google
      // decide NÃO exibir o prompt (isso acontece de forma silenciosa,
      // sem erro nenhum, então sem esse callback fica impossível saber
      // o motivo — é o que estava fazendo parecer que "nada acontece").
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.warn("⚠️ Prompt NÃO exibido. Motivo:", notification.getNotDisplayedReason());
          mostrarErroGoogle("Não foi possível abrir a seleção de conta do Google. Verifique se cookies de terceiros estão habilitados, ou tente pelo botão do Google diretamente.");
        } else if (notification.isSkippedMoment()) {
          console.warn("⚠️ Prompt pulado. Motivo:", notification.getSkippedReason());
        } else if (notification.isDismissedMoment()) {
          console.log("ℹ️ Prompt fechado pelo usuário. Motivo:", notification.getDismissedReason());
        }
      });
      console.log("📱 Prompt do Google acionado.");
    } catch (e) {
      console.error("❌ Erro ao chamar prompt:", e);
      mostrarErroGoogle("Erro ao abrir a tela de seleção de conta. Tente novamente.");
    }
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerGoogleSignIn();
    });
  }
  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerGoogleSignIn();
    });
  }

  // ============================================================
  //  TOGGLE LOGIN / REGISTRO + IDIOMA + UI DIVERSA
  // ============================================================
  document.getElementById('register').addEventListener('click', () => {
    container.classList.add("active");
    document.querySelector('.auth-header')?.classList.add('dark-theme');
    clearMessages();
  });
  document.getElementById('login').addEventListener('click', () => {
    container.classList.remove("active");
    document.querySelector('.auth-header')?.classList.remove('dark-theme');
    clearMessages();
  });

  function setupToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggle || !input) return;

    // Previne que o foco saia do input quando clica no toggle
    toggle.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.classList.toggle("fa-eye", isPassword);
      toggle.classList.toggle("fa-eye-slash", !isPassword);
      input.focus(); // Garante que o input mantenha o foco
    });
  }
  setupToggle("togglePasswordLogin", "login-password");
  setupToggle("togglePasswordReg", "reg-password");
  setupToggle("toggleConfirmPasswordReg", "reg-confirm-password");

  if (langBtn) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.toggle("open");
      wrapper.classList.toggle("active", isOpen);
      langBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }
  document.addEventListener("click", () => {
    if (wrapper) {
      wrapper.classList.remove("open");
      wrapper.classList.remove("active");
      langBtn?.setAttribute("aria-expanded", "false");
    }
  });

  langItems.forEach(item => {
    item.addEventListener("click", () => {
      const lang = item.dataset.lang;
      if (lang && translations[lang]) {
        aplicarIdioma(lang);
      }
      wrapper.classList.remove("open");
      wrapper.classList.remove("active");
      langBtn?.setAttribute("aria-expanded", "false");
    });
  });

  function handleCaps(input, warning) {
    if (!input || !warning) return;
    input.addEventListener("keyup", (e) => {
      warning.style.display = e.getModifierState("CapsLock") ? "block" : "none";
    });
    input.addEventListener("focusout", () => {
      warning.style.display = "none";
    });
  }
  handleCaps(loginPassword, capsWarningLogin);
  handleCaps(regPassword, capsWarningReg);

  aplicarIdioma("pt");

  const btnLang = document.querySelector(".language-button");
  const flagImg = document.getElementById("current-flag");
  const langSpan = document.getElementById("current-lang-text");
  const svg = btnLang?.querySelector("svg");
  if (btnLang && flagImg && flagImg.parentNode !== btnLang) {
    btnLang.innerHTML = '';
    btnLang.appendChild(flagImg);
    btnLang.appendChild(langSpan);
    if (svg) btnLang.appendChild(svg);
  }
});

// ============================================================
//  ACESSIBILIDADE: foco/tab apenas no formulário e painel visíveis
// ============================================================
function updatePanelFocusability() {
  const container = document.getElementById('container');
  const isActive = container && container.classList.contains('active');

  const toggleLeft = document.querySelector('.toggle-left');
  const toggleRight = document.querySelector('.toggle-right');

  if (toggleLeft && toggleRight) {
    const hiddenPanel = isActive ? toggleRight : toggleLeft;
    const visiblePanel = isActive ? toggleLeft : toggleRight;

    hiddenPanel.querySelectorAll('button, a, [tabindex]').forEach(el => {
      el.setAttribute('tabindex', '-1');
    });
    visiblePanel.querySelectorAll('button, a').forEach(el => {
      el.removeAttribute('tabindex');
    });
  }
}

function updateFormFocusability() {
  const c = document.getElementById('container');
  const isActive = c && c.classList.contains('active');
  const signIn = document.querySelector('.sign-in');
  const signUp = document.querySelector('.sign-up');
  if (isActive) {
    if (signIn) signIn.inert = true;
    if (signUp) signUp.inert = false;
  } else {
    if (signUp) signUp.inert = true;
    if (signIn) signIn.inert = false;
  }
}

updatePanelFocusability();
updateFormFocusability();

document.querySelectorAll('.toggle-panel button').forEach(btn => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});

document.querySelectorAll('.language-list li').forEach(item => {
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

const _container = document.getElementById('container');
if (_container) {
  const _observer = new MutationObserver(() => {
    updatePanelFocusability();
    updateFormFocusability();
  });
  _observer.observe(_container, { attributes: true, attributeFilter: ['class'] });
}
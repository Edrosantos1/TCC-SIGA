
document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById('botao_login_google');
  const formularioAcesso = document.getElementById('formulario_acesso');
  let reposicionarSobreposicaoGoogle = () => {};
  const wrapper = document.querySelector(".seletor-idioma");
  const langBtn = document.querySelector(".botao-idioma");
  const langItems = document.querySelectorAll(".lista-idiomas li");
  const regName = document.getElementById("nome_cadastro");
  const regSerie = document.getElementById("serie_cadastro");
  const regEmail = document.getElementById("email_cadastro");
  const regPassword = document.getElementById("senha_cadastro");
  const regConfirmPassword = document.getElementById("confirmar_senha_cadastro");
  const registerForm = document.getElementById("formulario_cadastro");
  if (regSerie) {
    regSerie.setAttribute('tabindex', '0');
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
  const loginForm = document.getElementById("formulario_login");
  const loginEmail = document.getElementById("email_login");
  const loginPassword = document.getElementById("senha_login");
  const modalSerieGoogle = document.getElementById("modal_serie_google");
  const modalSerieSelect = document.getElementById("serie_modal_google");
  const modalSerieError = document.getElementById("erro_modal_serie");
  const btnConfirmarSerieGoogle = document.getElementById("botao_confirmar_serie_google");

  const capsWarningReg = document.getElementById("aviso_caps_lock_cadastro");
  const capsWarningLogin = document.getElementById("aviso_caps_lock_login");
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  let idiomaAtual = "pt";
  const translations = {
    pt: {
      bandeira: "../../assets/Imagens/br.png",
      titleLogin: "Faça seu Login",
      titleRegister: "Crie sua Conta",
      phName: "Nome",
      phEmail: "Email",
      phPassword: "Senha",
      phConfirm: "Confirmar Senha",
      btnRegister: "Criar conta",
      btnLogin: "Entrar",
      linkForgot: "Esqueci a senha?",
      panelTitleLeft: "Já nos conhece?",
      panelDescLeft: "Acesse sua conta para continuar sua jornada acadêmica.",
      btnPanelLeft: "ENTRAR",
      panelTitleRight: "Novo por aqui?",
      panelDescRight: "Junte-se a nós e comece sua jornada acadêmica hoje mesmo.",
      btnPanelRight: "REGISTRE-SE",
      msgCaps: "Caps Lock ativado!",
      googleBtn: "Entrar com Google",
      confirmErrorMsg: "As senhas não coincidem.",
      strengthWeak: "Fraca",
      strengthFair: "Razoável",
      strengthGood: "Boa",
      strengthExcellent: "Ótima",
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
      errorUserNotFound: "Não encontramos nenhuma conta com esse email.",
      errorWrongPassword: "Senha incorreta. Tente novamente.",
      errorEmailInUse: "Este email já está cadastrado. Tente fazer login.",
      errorSessionInvalid: "Sua sessão não está mais vinculada a uma conta ativa. Entre novamente.",
      errorGeneric: "Algo deu errado. Tente novamente.",
      modalSerieTitle: "Quase lá!",
      modalSerieDesc: "Escolha sua série para concluir o cadastro.",
      modalSerieConfirm: "Confirmar",
    },
    en: {
      bandeira: "../../assets/Imagens/us.png",
      titleLogin: "Sign In",
      titleRegister: "Create Account",
      phName: "Name",
      phEmail: "Email",
      phPassword: "Password",
      phConfirm: "Confirm Password",
      btnRegister: "Sign Up",
      btnLogin: "Sign In",
      linkForgot: "Forgot Password?",
      panelTitleLeft: "Welcome Back!",
      panelDescLeft: "Access your account to continue your academic journey.",
      btnPanelLeft: "SIGN IN",
      panelTitleRight: "New here?",
      panelDescRight: "Join us and start your academic journey today.",
      btnPanelRight: "SIGN UP",
      msgCaps: "Caps Lock is on!",
      googleBtn: "Sign in with Google",
      confirmErrorMsg: "Passwords do not match.",
      strengthWeak: "Weak",
      strengthFair: "Fair",
      strengthGood: "Good",
      strengthExcellent: "Excellent",
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
      errorUserNotFound: "We couldn't find an account with this email.",
      errorWrongPassword: "Incorrect password. Please try again.",
      errorEmailInUse: "This email is already registered. Try signing in.",
      errorSessionInvalid: "Your session is no longer linked to an active account. Please sign in again.",
      errorGeneric: "Something went wrong. Please try again.",
      modalSerieTitle: "Almost there!",
      modalSerieDesc: "Choose your grade to finish signing up.",
      modalSerieConfirm: "Confirm",
    },
    es: {
      bandeira: "../../assets/Imagens/es.png",
      titleLogin: "Iniciar Sesión",
      titleRegister: "Crea tu Cuenta",
      phName: "Nombre",
      phEmail: "Correo electrónico",
      phPassword: "Contraseña",
      phConfirm: "Confirmar Contraseña",
      btnRegister: "Registrarse",
      btnLogin: "Entrar",
      linkForgot: "¿Olvidaste tu contraseña?",
      panelTitleLeft: "¡Bienvenido de nuevo!",
      panelDescLeft: "Accede a tu cuenta para continuar tu viaje académico.",
      btnPanelLeft: "ENTRAR",
      panelTitleRight: "¿Nuevo por aquí?",
      panelDescRight: "Únete a nosotros y comienza tu viaje académico hoy mismo.",
      btnPanelRight: "REGÍSTRATE",
      msgCaps: "¡Bloq Mayús activado!",
      googleBtn: "Iniciar sesión con Google",
      confirmErrorMsg: "Las contraseñas no coinciden.",
      strengthWeak: "Débil",
      strengthFair: "Regular",
      strengthGood: "Buena",
      strengthExcellent: "Excelente",
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
      errorUserNotFound: "No encontramos ninguna cuenta con este correo.",
      errorWrongPassword: "Contraseña incorrecta. Intente de nuevo.",
      errorEmailInUse: "Este correo ya está registrado. Intente iniciar sesión.",
      errorSessionInvalid: "Su sesión ya no está vinculada a una cuenta activa. Inicie sesión de nuevo.",
      errorGeneric: "Algo salió mal. Intente de nuevo.",
      modalSerieTitle: "¡Ya casi!",
      modalSerieDesc: "Elige tu grado para terminar tu registro.",
      modalSerieConfirm: "Confirmar",
    }
  };
  function updateSerieSelect() {
    const t = translations[idiomaAtual];
    const serieSelect = document.getElementById("serie_cadastro");
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
  function showFieldError(input, errorMessage) {
    const inputGroup = input.closest('.grupo-campo');
    if (!inputGroup) return;

    let errorDiv = inputGroup.querySelector('.erro-campo');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'erro-campo';
      inputGroup.appendChild(errorDiv);
    }

    errorDiv.textContent = errorMessage;
    errorDiv.style.display = 'block';
    input.classList.add('campo-invalido');
  }
  function clearFieldError(input) {
    const inputGroup = input.closest('.grupo-campo');
    if (!inputGroup) return;

    const errorDiv = inputGroup.querySelector('.erro-campo');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
    input.classList.remove('campo-invalido');
  }
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
  function validateName(input) {
    const name = input.value.trim();
    if (name === '') {
      showFieldError(input, translations[idiomaAtual].errorNameEmpty);
      return false;
    }
    clearFieldError(input);
    return true;
  }
  function validateSerie(input) {
    if (input.value === '') {
      showFieldError(input, translations[idiomaAtual].errorSerieEmpty);
      return false;
    }
    clearFieldError(input);
    return true;
  }
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
  function aplicarIdioma(lang, limpar = true) {
    idiomaAtual = lang;
    const t = translations[lang];

    document.documentElement.lang = ({ pt: "pt-BR", en: "en", es: "es" })[lang] || "pt-BR";
    if (typeof window.atualizarRotuloTema === "function") window.atualizarRotuloTema();

    document.getElementById("bandeira_atual").src = t.bandeira;
    document.getElementById("texto_idioma_atual").textContent = lang.toUpperCase();

    document.querySelectorAll(".lista-idiomas li").forEach(li => {
      const langLi = li.dataset.idioma;
      if (langLi && translations[langLi]) {
        const img = li.querySelector("img");
        if (img) img.src = translations[langLi].bandeira;
      }
    });

    document.getElementById("titulo_cadastro").textContent = t.titleRegister;
    if (regName) regName.placeholder = t.phName;
    if (regEmail) regEmail.placeholder = t.phEmail;
    if (regPassword) regPassword.placeholder = t.phPassword;
    if (regConfirmPassword) regConfirmPassword.placeholder = t.phConfirm;
    const btnRegister = document.getElementById("botao_enviar_cadastro");
    if (btnRegister) btnRegister.textContent = t.btnRegister;
    if (capsWarningReg) capsWarningReg.textContent = t.msgCaps;

    document.getElementById("titulo_login").textContent = t.titleLogin;
    if (loginEmail) loginEmail.placeholder = t.phEmail;
    if (loginPassword) loginPassword.placeholder = t.phPassword;
    const forgotLink = document.getElementById("link_esqueci_senha");
    if (forgotLink) forgotLink.textContent = t.linkForgot;
    const btnLogin = document.getElementById("botao_enviar_login");
    if (btnLogin) btnLogin.textContent = t.btnLogin;
    if (capsWarningLogin) capsWarningLogin.textContent = t.msgCaps;

    const panelLeftTitle = document.getElementById("titulo_painel_esquerdo");
    if (panelLeftTitle) panelLeftTitle.textContent = t.panelTitleLeft;
    const panelLeftDesc = document.getElementById("descricao_painel_esquerdo");
    if (panelLeftDesc) panelLeftDesc.textContent = t.panelDescLeft;
    const loginBtn = document.getElementById("botao_ir_login");
    if (loginBtn) loginBtn.textContent = t.btnPanelLeft;
    const panelRightTitle = document.getElementById("titulo_painel_direito");
    if (panelRightTitle) panelRightTitle.textContent = t.panelTitleRight;
    const panelRightDesc = document.getElementById("descricao_painel_direito");
    if (panelRightDesc) panelRightDesc.textContent = t.panelDescRight;
    const registerBtn = document.getElementById("botao_ir_cadastro");
    if (registerBtn) registerBtn.textContent = t.btnPanelRight;

    if (googleBtn) {
      googleBtn.innerHTML = `<i class="fab fa-google"></i> ${t.googleBtn}`;
    }
    updateSerieSelect();

    const modalSerieTitleEl = document.getElementById("titulo_modal_serie");
    if (modalSerieTitleEl) modalSerieTitleEl.textContent = t.modalSerieTitle;
    const modalSerieDescEl = document.getElementById("descricao_modal_serie");
    if (modalSerieDescEl) modalSerieDescEl.textContent = t.modalSerieDesc;
    if (btnConfirmarSerieGoogle) btnConfirmarSerieGoogle.textContent = t.modalSerieConfirm;
    updateModalSerieSelect();

    if (regPassword && regPassword.value) updateStrengthIndicator(regPassword.value);

    applyRequirementLabels();
    if (regPassword && regPassword.value) updateRequirements(regPassword.value);

    if (limpar) clearMessages();
  }
  function setBoxMessage(box, texto) {
    if (!box) return;
    box.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = 'fas fa-circle-exclamation';
    icon.setAttribute('aria-hidden', 'true');
    const span = document.createElement('span');
    span.className = 'msg-text';
    // Mensagens do servidor são exibidas como texto, nunca interpretadas como HTML.
    span.textContent = texto;
    box.appendChild(icon);
    box.appendChild(span);
    box.setAttribute('role', 'alert');
    box.style.display = 'flex';
  }
  function resolverMensagemServidor(msg) {
    const t = translations[idiomaAtual];
    const mapa = {
      credenciais_invalidas: t.errorLoginFailed,
      email_nao_encontrado: t.errorUserNotFound,
      senha_incorreta: t.errorWrongPassword,
      email_em_uso: t.errorEmailInUse,
      sessao_usuario_invalida: t.errorSessionInvalid,
    };
    return mapa[msg] || msg || t.errorGeneric;
  }

  function clearMessages() {
    const errorMsg = document.querySelector(".formulario-login .mensagem-erro");
    const regErrorMsg = document.querySelector(".formulario-cadastro .mensagem-erro-cadastro");
    if (errorMsg) errorMsg.style.display = "none";
    if (regErrorMsg) regErrorMsg.style.display = "none";
    [loginEmail, loginPassword].forEach(i => i && i.classList.remove('campo-invalido'));
  }
  function limparErros() {
    clearMessages();
    document.querySelectorAll('.erro-campo').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.campo-invalido').forEach(el => el.classList.remove('campo-invalido'));
  }

  function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return 1;
    if (score === 2) return 2;
    return score;
  }

  function updateStrengthIndicator(password) {
    const indicator = document.getElementById('indicador_forca_senha');
    const label = document.getElementById('rotulo_forca_senha');
    if (!indicator || !label) return;
    if (!password) {
      indicator.style.display = 'none';
      indicator.className = 'indicador-forca';
      return;
    }
    indicator.style.display = 'block';
    const level = getPasswordStrength(password);
    indicator.className = `indicador-forca nivel-${level}`;
    const t = translations[idiomaAtual];
    label.textContent = [t.strengthWeak, t.strengthFair, t.strengthGood, t.strengthExcellent][level - 1];
  }

  const REQ_CHECKS = {
    length: pwd => pwd.length >= 8,
    upper: pwd => /[A-Z]/.test(pwd),
    number: pwd => /[0-9]/.test(pwd),
    special: pwd => /[^A-Za-z0-9]/.test(pwd),
  };
  const IDS_REQUISITOS = {
    length: { item: "requisito_comprimento", texto: "texto_requisito_comprimento" },
    upper: { item: "requisito_maiuscula", texto: "texto_requisito_maiuscula" },
    number: { item: "requisito_numero", texto: "texto_requisito_numero" },
    special: { item: "requisito_especial", texto: "texto_requisito_especial" },
  };

  function updateRequirements(password) {
    Object.keys(REQ_CHECKS).forEach(key => {
      const item = document.getElementById(IDS_REQUISITOS[key].item);
      if (!item) return;
      const met = REQ_CHECKS[key](password);
      const icon = item.querySelector('.icone-requisito');
      item.classList.toggle('atendido', met);
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
      const span = document.getElementById(IDS_REQUISITOS[key].texto);
      if (span) span.textContent = text;
    });
  }

  if (regPassword) {
    regPassword.addEventListener('focus', () => {
      const reqs = document.getElementById('requisitos_senha');
      if (reqs) reqs.classList.add('visivel');
    });
    regPassword.addEventListener('blur', () => {
      const reqs = document.getElementById('requisitos_senha');
      if (reqs) reqs.classList.remove('visivel');
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
  let googleInicializado = false;

  function inicializarGoogle() {
    if (!window.google || !google.accounts || !google.accounts.id) {
      console.warn("⏳ Google SDK ainda não carregado.");
      return false;
    }
    if (googleInicializado) return true;

    try {
      google.accounts.id.initialize({
        client_id: '1039622063080-o38po3mnc76be497osrdtfsfmjb7j5q9.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true
      });
      googleInicializado = true;
      renderizarBotaoGoogleInvisivel(googleBtn, 'sobreposicao_login_google');

      console.log("✅ Google Sign-In inicializado com sucesso.");
      return true;
    } catch (e) {
      console.error("❌ Erro ao inicializar Google:", e);
      return false;
    }
  }
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
      botaoCustomizado.style.position = botaoCustomizado.style.position || 'relative';
    }

    const posicionar = () => {
      const rect = botaoCustomizado.getBoundingClientRect();
      overlay.style.top = `${window.scrollY + rect.top}px`;
      overlay.style.left = `${window.scrollX + rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.pointerEvents =
        rect.width > 0 && rect.height > 0 && !formularioAcesso.classList.contains('ativo') ? 'auto' : 'none';
    };

    reposicionarSobreposicaoGoogle = posicionar;
    posicionar();
    window.addEventListener('resize', posicionar);
    window.addEventListener('scroll', posicionar, true);
    const resizeObserver = new ResizeObserver(posicionar);
    resizeObserver.observe(document.body);
    resizeObserver.observe(botaoCustomizado);
    resizeObserver.observe(formularioAcesso);

    google.accounts.id.renderButton(overlay, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: Math.max(botaoCustomizado.offsetWidth, 200)
    });
  }
  window.onGoogleSDKLoaded = function() {
    console.log("📡 SDK do Google carregado.");
    inicializarGoogle();
  };
  if (window.google && google.accounts && google.accounts.id) {
    inicializarGoogle();
  } else {
    let tentativas = 0;
    const intervalo = setInterval(() => {
      if (inicializarGoogle()) {
        clearInterval(intervalo);
      }
      tentativas++;
      if (tentativas > 20) {
        clearInterval(intervalo);
        console.error("❌ Google SDK não carregou a tempo.");
        mostrarErroGoogle("O serviço de login do Google não está disponível. Tente recarregar a página.");
      }
    }, 500);
  }
  function mostrarErroGoogle(mensagem) {
    const isActive = formularioAcesso.classList.contains('ativo');
    const errorDiv = isActive ?
      document.querySelector('.formulario-cadastro .mensagem-erro-cadastro') :
      document.querySelector('.formulario-login .mensagem-erro');
    setBoxMessage(errorDiv, mensagem);
  }
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
  function enviarTokenParaServidor(token) {
    limparErros();
    const tokenInput = document.getElementById('token_google');
    const form = document.getElementById('formulario_google');
    if (!tokenInput || !form) {
      mostrarErroGoogle('Não foi possível preparar a autenticação.');
      return;
    }
    tokenInput.value = token;
    // Envia o token no formulário POST tradicional, sem chamadas AJAX.
    form.submit();
  }
  const gradeButtons = modalSerieGoogle
    ? modalSerieGoogle.querySelectorAll('.botao-serie')
    : [];

  function selecionarGrade(botao) {
    gradeButtons.forEach(b => b.classList.remove('selecionado'));
    botao.classList.add('selecionado');
    if (modalSerieSelect) modalSerieSelect.value = botao.dataset.valor;
    if (modalSerieError) modalSerieError.style.display = 'none';
    if (btnConfirmarSerieGoogle) btnConfirmarSerieGoogle.classList.add('pronto');
  }

  gradeButtons.forEach(botao => {
    botao.addEventListener('click', () => selecionarGrade(botao));
  });
  function abrirModalSerie() {
    if (modalSerieError) modalSerieError.style.display = 'none';
    if (modalSerieSelect) modalSerieSelect.value = '';
    gradeButtons.forEach(b => b.classList.remove('selecionado'));
    if (btnConfirmarSerieGoogle) {
      btnConfirmarSerieGoogle.disabled = false;
      btnConfirmarSerieGoogle.classList.remove('pronto', 'carregando');
    }
    if (modalSerieGoogle) modalSerieGoogle.style.display = 'flex';
  }

  if (window.COMPLETAR_SERIE_GOOGLE) {
    abrirModalSerie();
  }

  const formularioCompletarSerie = document.getElementById('formulario_completar_serie');
  if (formularioCompletarSerie) {
    formularioCompletarSerie.addEventListener('submit', (event) => {
      if (!modalSerieSelect || !modalSerieSelect.value) {
        event.preventDefault();
        if (modalSerieError) {
          modalSerieError.textContent = translations[idiomaAtual].errorSerieEmpty;
          modalSerieError.style.display = 'block';
        }
        gradeButtons[0]?.focus();
        return;
      }
      if (modalSerieError) {
        modalSerieError.style.display = 'none';
      }
    });
  }

  function triggerGoogleSignIn() {
    if (!googleInicializado) {
      if (!inicializarGoogle()) {
        mostrarErroGoogle("O login com Google não está disponível. Recarregue a página.");
        return;
      }
    }
    try {
      google.accounts.id.disableAutoSelect();
      google.accounts.id.prompt();
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
  function definirModoCadastro(ativo) {
    formularioAcesso.classList.toggle("ativo", ativo);
    document.querySelector('.cabecalho-autenticacao')?.classList.toggle('tema-escuro', ativo);
    reposicionarSobreposicaoGoogle();
    clearMessages();
  }

  document.getElementById('botao_ir_cadastro').addEventListener('click', () => definirModoCadastro(true));
  document.getElementById('botao_ir_login').addEventListener('click', () => definirModoCadastro(false));

  let inicioArraste = null;
  let cliqueAposArraste = false;
  let temporizadorCliqueAposArraste;
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) {
      inicioArraste = null;
      return;
    }

    const toque = event.touches[0];
    inicioArraste = { x: toque.clientX, y: toque.clientY };
  }, { passive: true });

  document.addEventListener('touchend', (event) => {
    if (!inicioArraste || !event.changedTouches.length) return;

    const toque = event.changedTouches[0];
    const deslocamentoX = toque.clientX - inicioArraste.x;
    const deslocamentoY = toque.clientY - inicioArraste.y;
    inicioArraste = null;

    if (Math.abs(deslocamentoX) < 55 || Math.abs(deslocamentoX) < Math.abs(deslocamentoY) * 1.2) return;

    cliqueAposArraste = true;
    clearTimeout(temporizadorCliqueAposArraste);
    temporizadorCliqueAposArraste = setTimeout(() => {
      cliqueAposArraste = false;
    }, 500);
    definirModoCadastro(deslocamentoX < 0);
  }, { passive: true });

  document.addEventListener('touchcancel', () => {
    inicioArraste = null;
  }, { passive: true });

  document.addEventListener('click', (event) => {
    if (!cliqueAposArraste) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    cliqueAposArraste = false;
    clearTimeout(temporizadorCliqueAposArraste);
  }, true);

  function setupToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggle || !input) return;
    toggle.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.classList.toggle("fa-eye", !isPassword);
      toggle.classList.toggle("fa-eye-slash", isPassword);
      input.focus();
    });
  }
  setupToggle("alternar_senha_login", "senha_login");
  setupToggle("alternar_senha_cadastro", "senha_cadastro");
  setupToggle("alternar_confirmacao_senha_cadastro", "confirmar_senha_cadastro");

  if (langBtn) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.toggle("aberto");
      wrapper.classList.toggle("ativo", isOpen);
      langBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }
  document.addEventListener("click", () => {
    if (wrapper) {
      wrapper.classList.remove("aberto");
      wrapper.classList.remove("ativo");
      langBtn?.setAttribute("aria-expanded", "false");
    }
  });

  langItems.forEach(item => {
    item.addEventListener("click", () => {
      const lang = item.dataset.idioma;
      if (lang && translations[lang]) {
        aplicarIdioma(lang);
        try {
          localStorage.setItem("siga-idioma", lang);
          localStorage.removeItem("siga-lang");
        } catch (error) {
        }
      }
      wrapper.classList.remove("aberto");
      wrapper.classList.remove("ativo");
      langBtn?.setAttribute("aria-expanded", "false");
    });
  });
  function mostrarErroDoServidor() {
    const err = window.ERRO_SERVIDOR;
    if (!err || !err.msg) return;
    const texto = resolverMensagemServidor(err.msg);

    if (err.register) {
      definirModoCadastro(true);
      setBoxMessage(document.querySelector('.formulario-cadastro .mensagem-erro-cadastro'), texto);
    } else {
      setBoxMessage(document.querySelector('.formulario-login .mensagem-erro'), texto);
      const soSenha = (err.msg === 'senha_incorreta');
      const soEmail = (err.msg === 'email_nao_encontrado');
      if (loginEmail && !soSenha) loginEmail.classList.add('campo-invalido');
      if (loginPassword && !soEmail) loginPassword.classList.add('campo-invalido');
      (soSenha ? loginPassword : loginEmail)?.focus();
    }
    if (window.history && history.replaceState) {
      history.replaceState(null, '', location.pathname);
    }
  }
  [loginEmail, loginPassword].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      const box = document.querySelector('.formulario-login .mensagem-erro');
      if (box) box.style.display = 'none';
      if (loginEmail) loginEmail.classList.remove('campo-invalido');
      if (loginPassword) loginPassword.classList.remove('campo-invalido');
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

  let idiomaInicial = "pt";
  try {
    let idiomaSalvo = localStorage.getItem("siga-idioma");
    if (!idiomaSalvo) {
      idiomaSalvo = localStorage.getItem("siga-lang");
      if (idiomaSalvo) {
        localStorage.setItem("siga-idioma", idiomaSalvo);
        localStorage.removeItem("siga-lang");
      }
    }
    if (idiomaSalvo && translations[idiomaSalvo]) idiomaInicial = idiomaSalvo;
  } catch (error) {}
  aplicarIdioma(idiomaInicial, false);
  mostrarErroDoServidor();

  const btnLang = document.querySelector(".botao-idioma");
  const flagImg = document.getElementById("bandeira_atual");
  const langSpan = document.getElementById("texto_idioma_atual");
  const svg = btnLang?.querySelector("svg");
  if (btnLang && flagImg && flagImg.parentNode !== btnLang) {
    btnLang.innerHTML = '';
    btnLang.appendChild(flagImg);
    btnLang.appendChild(langSpan);
    if (svg) btnLang.appendChild(svg);
  }
});
function updatePanelFocusability() {
  const formularioAcesso = document.getElementById('formulario_acesso');
  const isActive = formularioAcesso && formularioAcesso.classList.contains('ativo');

  const toggleLeft = document.querySelector('.painel-esquerdo');
  const toggleRight = document.querySelector('.painel-direito');

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
  const c = document.getElementById('formulario_acesso');
  const isActive = c && c.classList.contains('ativo');
  const signIn = document.querySelector('.formulario-login');
  const signUp = document.querySelector('.formulario-cadastro');
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

document.querySelectorAll('.painel-alternancia button').forEach(btn => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});

document.querySelectorAll('.lista-idiomas li').forEach(item => {
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

const _container = document.getElementById('formulario_acesso');
if (_container) {
  const _observer = new MutationObserver(() => {
    updatePanelFocusability();
    updateFormFocusability();
  });
  _observer.observe(_container, { attributes: true, attributeFilter: ['class'] });
}
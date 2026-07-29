document.addEventListener("DOMContentLoaded", () => {

  // Referências
  const wrapper = document.querySelector(".language-wrapper");
  const langBtn = document.querySelector(".language-button");
  const langItems = document.querySelectorAll(".language-list li");
  const currentFlag = document.getElementById("current-flag");
  const currentLangText = document.getElementById("current-lang-text");

  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const capsWarning = document.getElementById("caps_warning_admin");
  const formLogin = document.getElementById("form-login-adm");
  const errorMessageDiv = document.getElementById("error-message");

  // ==================== TRADUÇÕES ====================
  let idiomaAtual = "pt";

  const translations = {
    pt: { 
      flag: "../assets/Imagens/br.png", 
      titleLogin: "Login Admin", 
      phEmail: "Email", 
      phPassword: "Senha", 
      btnLogin: "Entrar", 
      linkForgot: "Esqueceu a senha?", 
      msgCaps: "Caps Lock ativado!", 
      panelTitle: "Painel Administrativo", 
      panelDesc: "Gerencie sua biblioteca com praticidade.",
      errorLogin: "E-mail ou senha inválidos",
      errorEmpty: "Preencha o e-mail e a senha" 
    },
    en: { 
      flag: "../assets/Imagens/us.png", 
      titleLogin: "Admin Login", 
      phEmail: "Email", 
      phPassword: "Password", 
      btnLogin: "Sign In", 
      linkForgot: "Forgot Password?", 
      msgCaps: "Caps Lock is on!", 
      panelTitle: "Admin Panel", 
      panelDesc: "Manages your library with practicality.",
      errorLogin: "Invalid email or password",
      errorEmpty: "Please fill in email and password" 
    },
    es: { 
      flag: "../assets/Imagens/es.png", 
      titleLogin: "Login Admin", 
      phEmail: "Correo electrónico", 
      phPassword: "Contraseña", 
      btnLogin: "Entrar", 
      linkForgot: "¿Olvidaste tu contraseña?", 
      msgCaps: "¡Bloq Mayús activado!", 
      panelTitle: "Panel de Administración", 
      panelDesc: "Gestiona tu biblioteca con practicidad.",
      errorLogin: "Correo o contraseña inválidos",
      errorEmpty: "Por favor complete el correo y la contraseña" 
    }
  };

  // Salvar e carregar idioma
  function saveLanguage(lang) {
    localStorage.setItem('idiomaAdmin', lang);
  }

  function loadSavedLanguage() {
    const savedLang = localStorage.getItem('idiomaAdmin');
    if (savedLang && translations[savedLang]) {
      idiomaAtual = savedLang;
      currentFlag.src = translations[savedLang].flag;
      currentLangText.textContent = savedLang.toUpperCase();
      applyLanguage(savedLang);
    }
  }

  function applyLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    document.querySelector(".dot-title").textContent = t.titleLogin;
    emailInput.placeholder = t.phEmail;
    passwordInput.placeholder = t.phPassword;
    document.getElementById("btn-submit-login").textContent = t.btnLogin;
    document.querySelector(".options-group a").textContent = t.linkForgot;
    capsWarning.textContent = t.msgCaps;
    document.getElementById("panel-title").textContent = t.panelTitle;
    document.getElementById("panel-desc").textContent = t.panelDesc;
  }

  loadSavedLanguage();

  // ── Gerencia abertura/fechamento do dropdown com acessibilidade ──
  function openMenu() {
    wrapper.classList.add("active");
    langBtn.setAttribute("aria-expanded", "true");
    // Habilita Tab nos itens somente quando o menu está aberto
    langItems.forEach(li => li.setAttribute("tabindex", "0"));
    // Foca o primeiro item ao abrir pelo teclado
    langItems[0] && langItems[0].focus();
  }

  function closeMenu(returnFocus = false) {
    wrapper.classList.remove("active");
    langBtn.setAttribute("aria-expanded", "false");
    // Remove os itens do fluxo de Tab quando o menu está fechado
    langItems.forEach(li => li.setAttribute("tabindex", "-1"));
    if (returnFocus) langBtn.focus();
  }

  // Estado inicial: menu fechado, itens fora do Tab
  langBtn.setAttribute("aria-expanded", "false");
  langBtn.setAttribute("aria-haspopup", "listbox");
  langItems.forEach(li => {
    li.setAttribute("tabindex", "-1");
    li.setAttribute("role", "option");
  });

  // Clique no botão
  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.classList.contains("active") ? closeMenu(true) : openMenu();
  });

  // Enter / Space abre o menu; Escape fecha
  langBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      wrapper.classList.contains("active") ? closeMenu(true) : openMenu();
    } else if (e.key === "Escape") {
      closeMenu(true);
    }
  });

  // Fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) closeMenu();
  });

  langItems.forEach((item, index) => {
    // Seleção por clique
    item.addEventListener("click", () => selectLang(item));

    // Seleção e navegação por teclado
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectLang(item);
      } else if (e.key === "Escape") {
        closeMenu(true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = langItems[index + 1] || langItems[0];
        next.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = langItems[index - 1] || langItems[langItems.length - 1];
        prev.focus();
      } else if (e.key === "Tab") {
        // Fecha o menu apenas se sair do último item (Shift+Tab no primeiro também fecha)
        const isLast = index === langItems.length - 1;
        const isFirst = index === 0;
        if ((!e.shiftKey && isLast) || (e.shiftKey && isFirst)) {
          closeMenu();
        }
      }
    });
  });

  function selectLang(item) {
    const lang = item.dataset.lang;
    if (lang && translations[lang]) {
      idiomaAtual = lang;
      currentFlag.src = translations[lang].flag;
      currentLangText.textContent = lang.toUpperCase();
      applyLanguage(lang);
      saveLanguage(lang);
    }
    closeMenu(true);
  }

  // Limpar URL
  function cleanUrl() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('erro')) {
      url.searchParams.delete('erro');
      window.history.replaceState({}, '', url);
    }
  }
  cleanUrl();

  // Olho da senha
  function setupToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggle || !input) return;
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.classList.toggle("fa-eye", isPassword);
      toggle.classList.toggle("fa-eye-slash", !isPassword);
    });
  }
  setupToggle("toggleAdminPassword", "admin-password");

  // Caps Lock
  passwordInput.addEventListener("keyup", (e) => {
    capsWarning.style.display = e.getModifierState("CapsLock") ? "block" : "none";
  });
  passwordInput.addEventListener("focusout", () => {
    capsWarning.style.display = "none";
  });

  // Navegação com Enter
  emailInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordInput.focus();
    }
  });

  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      formLogin.submit();
    }
  });

  // Esconder erro ao digitar
  if (errorMessageDiv) {
    [emailInput, passwordInput].forEach(campo => {
      campo.addEventListener("focus", () => errorMessageDiv.style.display = "none");
      campo.addEventListener("input", () => errorMessageDiv.style.display = "none");
    });
  }

  // Loading no botão
  formLogin.addEventListener("submit", () => {
    const btn = document.getElementById("btn-submit-login");
    const textoOriginal = btn.textContent;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + textoOriginal;
    btn.disabled = true;
  });

});
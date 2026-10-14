// ==================== TRADUÇÕES ====================
const translations = {
  pt: {
    page_title: "Login Administrador · SiGA ITJ",
    titleLogin: "Login Admin",
    phEmail: "Email",
    phPassword: "Senha",
    btnLogin: "Entrar",
    msgCaps: "Caps Lock ativado!",
    panelTitle: "Painel Administrativo",
    panelDesc: "Gerencie sua biblioteca com praticidade.",
    back_label: "Voltar para página inicial",
    theme_label: "Tema escuro",
    lang_label: "Selecionar idioma",
    show_password: "Mostrar senha",
    hide_password: "Ocultar senha"
  },
  en: {
    page_title: "Administrator Login · SiGA ITJ",
    titleLogin: "Admin Login",
    phEmail: "Email",
    phPassword: "Password",
    btnLogin: "Sign In",
    msgCaps: "Caps Lock is on!",
    panelTitle: "Admin Panel",
    panelDesc: "Manage your library with practicality.",
    back_label: "Back to home page",
    theme_label: "Dark theme",
    lang_label: "Select language",
    show_password: "Show password",
    hide_password: "Hide password"
  },
  es: {
    page_title: "Acceso de Administrador · SiGA ITJ",
    titleLogin: "Login Admin",
    phEmail: "Correo electrónico",
    phPassword: "Contraseña",
    btnLogin: "Entrar",
    msgCaps: "¡Bloq Mayús activado!",
    panelTitle: "Panel de Administración",
    panelDesc: "Gestiona tu biblioteca con practicidad.",
    back_label: "Volver a la página de inicio",
    theme_label: "Tema oscuro",
    lang_label: "Seleccionar idioma",
    show_password: "Mostrar contraseña",
    hide_password: "Ocultar contraseña"
  }
};

const HTML_LANG = { pt: "pt-BR", en: "en", es: "es" };
const KEY_LANG = "siga-lang";        // mesma chave da página inicial
const KEY_LANG_OLD = "idiomaAdmin";  // chave antiga (continua sendo lida)
const KEY_THEME = "siga-theme";

// localStorage com proteção (navegação privada / bloqueio de cookies)
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignora */ } }
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  // Idioma
  const wrapper = document.querySelector(".language-wrapper");
  const langBtn = document.querySelector(".language-button");
  const langItems = document.querySelectorAll(".language-list li");
  const currentFlag = document.getElementById("current-flag");
  const currentLangText = document.getElementById("current-lang-text");

  // Formulário
  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const capsWarning = document.getElementById("caps_warning_admin");
  const formLogin = document.getElementById("form-login-adm");
  const errorMessageDiv = document.getElementById("error-message");
  const submitBtn = document.getElementById("btn-submit-login");
  const eyeBtn = document.getElementById("toggleAdminPassword");
  const eyeIcon = eyeBtn.querySelector("i");
  const themeBtn = document.getElementById("theme_toggle");

  let idiomaAtual = "pt";

  // ───────────── IDIOMA ─────────────
  function updateEye() {
    const t = translations[idiomaAtual];
    const visible = passwordInput.type === "text";
    eyeBtn.setAttribute("aria-label", visible ? t.hide_password : t.show_password);
    eyeBtn.setAttribute("aria-pressed", visible ? "true" : "false");
    eyeIcon.classList.toggle("fa-eye", !visible);
    eyeIcon.classList.toggle("fa-eye-slash", visible);
  }

  function applyLanguage(lang) {
    const t = translations[lang];
    if (!t) return;
    idiomaAtual = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      if (t[el.dataset.i18n] !== undefined) el.textContent = t[el.dataset.i18n];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      if (t[el.dataset.i18nPh] !== undefined) el.placeholder = t[el.dataset.i18nPh];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
      if (t[el.dataset.i18nAria] !== undefined) el.setAttribute("aria-label", t[el.dataset.i18nAria]);
    });

    document.title = t.page_title;
    root.lang = HTML_LANG[lang];

    langItems.forEach(li => {
      const selected = li.dataset.lang === lang;
      li.setAttribute("aria-selected", selected ? "true" : "false");
      if (selected) {
        const flag = li.querySelector(".flag");
        currentFlag.src = flag.src;
        currentFlag.alt = flag.alt;
      }
    });
    currentLangText.textContent = lang.toUpperCase();
    updateEye();
  }

  // ── Dropdown de idioma com acessibilidade por teclado ──
  function openMenu() {
    wrapper.classList.add("open");
    langBtn.setAttribute("aria-expanded", "true");
    langItems.forEach(li => li.setAttribute("tabindex", "0"));
    langItems[0] && langItems[0].focus();
  }

  function closeMenu(returnFocus = false) {
    wrapper.classList.remove("open");
    langBtn.setAttribute("aria-expanded", "false");
    langItems.forEach(li => li.setAttribute("tabindex", "-1"));
    if (returnFocus) langBtn.focus();
  }

  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.classList.contains("open") ? closeMenu(true) : openMenu();
  });

  langBtn.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu(true);
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) closeMenu();
  });

  langItems.forEach((item, index) => {
    item.addEventListener("click", () => selectLang(item));

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectLang(item);
      } else if (e.key === "Escape") {
        closeMenu(true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        (langItems[index + 1] || langItems[0]).focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (langItems[index - 1] || langItems[langItems.length - 1]).focus();
      } else if (e.key === "Tab") {
        const isLast = index === langItems.length - 1;
        const isFirst = index === 0;
        if ((!e.shiftKey && isLast) || (e.shiftKey && isFirst)) closeMenu();
      }
    });
  });

  function selectLang(item) {
    const lang = item.dataset.lang;
    if (lang && translations[lang]) {
      applyLanguage(lang);
      store.set(KEY_LANG, lang);
    }
    closeMenu(true);
  }

  // ───────────── TEMA ESCURO ─────────────
  function setTheme(theme, save = true) {
    root.setAttribute("data-theme", theme);
    themeBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    if (save) store.set(KEY_THEME, theme);
  }

  themeBtn.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  // O <head> já aplicou o tema; aqui só sincronizamos o botão
  setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);

  // ───────────── LIMPAR ?erro= DA URL ─────────────
  const url = new URL(window.location.href);
  if (url.searchParams.has("erro")) {
    url.searchParams.delete("erro");
    window.history.replaceState({}, "", url);
  }

  // ───────────── OLHO DA SENHA ─────────────
  eyeBtn.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    updateEye();
    passwordInput.focus();
  });

  // ───────────── CAPS LOCK ─────────────
  function checkCaps(e) {
    capsWarning.hidden = !(e.getModifierState && e.getModifierState("CapsLock"));
  }
  passwordInput.addEventListener("keydown", checkCaps);
  passwordInput.addEventListener("keyup", checkCaps);
  passwordInput.addEventListener("focusout", () => { capsWarning.hidden = true; });

  // ───────────── ENTER ─────────────
  // No e-mail, Enter leva para a senha. Na senha, o Enter nativo envia o
  // formulário (já respeitando a validação dos campos obrigatórios).
  emailInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordInput.focus();
    }
  });

  // ───────────── ESCONDER ERRO AO DIGITAR ─────────────
  if (errorMessageDiv) {
    [emailInput, passwordInput].forEach(campo => {
      campo.addEventListener("focus", () => { errorMessageDiv.style.display = "none"; });
      campo.addEventListener("input", () => { errorMessageDiv.style.display = "none"; });
    });
  }

  // ───────────── LOADING NO BOTÃO ─────────────
  formLogin.addEventListener("submit", () => {
    const textoOriginal = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ' + textoOriginal;
    submitBtn.disabled = true;
  });

  // Se a pessoa voltar pelo botão "voltar" do navegador, destrava o botão
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      submitBtn.disabled = false;
      submitBtn.textContent = translations[idiomaAtual].btnLogin;
    }
  });

  // ───────────── IDIOMA INICIAL ─────────────
  const saved = store.get(KEY_LANG) || store.get(KEY_LANG_OLD);
  applyLanguage(translations[saved] ? saved : "pt");
});
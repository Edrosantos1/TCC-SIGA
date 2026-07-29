// ===================== TRADUÇÕES COMPLETAS =====================
const translations = {
  pt: {
    title: "Sua biblioteca digital completa",
    subtitle: "Acesse livros, materiais e recursos educacionais em um só lugar.",
    stat_materials: "+500 materiais",
    stat_access: "Acesso ilimitado",
    btn_student: "Sou Aluno",
    btn_admin: "Sou Administrador",
    nav_about: "Sobre o SiGA",
    nav_contact: "Fale com a Secretaria",
    footer_copyright: "© 2026 SiGA ITJ. Todos os direitos reservados.",
    footer_support: "Suporte",
    footer_terms: "Termos de Uso",
    footer_privacy: "Política de Privacidade",
    sobre_title: "O que é a <span>SiGA</span>?",
    sobre_subtitle: "Conheça um pouco do nosso trabalho e propósito",
    sobre_p1: "O <strong>SiGA</strong> (Sistema Integrado de Gestão de Acervo) é a plataforma digital de gerenciamento de bibliotecas escolares. Nossa missão é democratizar o acesso ao conhecimento, oferecendo um ambiente virtual completo para consulta e empréstimos de materiais acadêmicos.",
    sobre_p2: "Com um acervo em constante crescimento, o SiGA atende alunos, professores e funcionários, centralizando livros didáticos, artigos científicos, periódicos e outros recursos educacionais. Tudo isso com acesso ilimitado, 24 horas por dia, de qualquer dispositivo.",
    sobre_p3: "Além da praticidade, nossa plataforma prioriza a organização e a inclusão: é possível pesquisar por categorias, autores e títulos, renovar empréstimos online, tudo isso na palma da sua mão. O SiGA é mais do que uma biblioteca digital – é um portal para o conhecimento, projetado para inspirar e apoiar a jornada acadêmica de cada usuário. <strong>O conhecimento não pode esperar e com o SiGA, está sempre ao seu alcance.</strong>",
    passos_title: "Comece em <span>3 passos</span>",
    passos_subtitle: "Simples, rápido e gratuito para alunos",
    passo1_title: "1. Cadastre-se",
    passo1_desc: "Crie sua conta gratuita usando seu email institucional.",
    passo2_title: "2. Encontre",
    passo2_desc: "Pesquise entre centenas de livros e materiais didáticos.",
    passo3_title: "3. Acesse",
    passo3_desc: "Leia online ou faça download para estudar onde quiser."
  },
  en: {
    title: "Your complete digital library",
    subtitle: "Access books, materials and educational resources in one place.",
    stat_materials: "+500 materials",
    stat_access: "Unlimited access",
    btn_student: "I'm a Student",
    btn_admin: "I'm an Administrator",
    nav_about: "About SiGA",
    nav_contact: "Contact Support",
    footer_copyright: "© 2026 SiGA ITJ. All rights reserved.",
    footer_support: "Support",
    footer_terms: "Terms of Use",
    footer_privacy: "Privacy Policy",
    sobre_title: "What is <span>SiGA</span>?",
    sobre_subtitle: "Learn a little about our work and purpose",
    sobre_p1: "<strong>SiGA</strong> (Integrated Collection Management System) is the digital management platform for school libraries. Our mission is to democratize access to knowledge, offering a complete virtual environment for consultation and borrowing of academic materials.",
    sobre_p2: "With a constantly growing collection, SiGA serves students, teachers and staff, centralizing textbooks, scientific articles, journals and other educational resources. All with unlimited access, 24 hours a day, from any device.",
    sobre_p3: "In addition to practicality, our platform prioritizes organization and inclusion: you can search by categories, authors and titles, renew loans online, all in the palm of your hand. SiGA is more than a digital library – it is a gateway to knowledge, designed to inspire and support each user's academic journey. <strong>Knowledge cannot wait and with SiGA, it is always within your reach.</strong>",
    passos_title: "Start in <span>3 steps</span>",
    passos_subtitle: "Simple, fast and free for students",
    passo1_title: "1. Sign up",
    passo1_desc: "Create your free account using your institutional email.",
    passo2_title: "2. Find",
    passo2_desc: "Search among hundreds of books and teaching materials.",
    passo3_title: "3. Access",
    passo3_desc: "Read online or download to study anywhere."
  },
  es: {
    title: "Tu biblioteca digital completa",
    subtitle: "Accede a libros, materiales y recursos educativos en un solo lugar.",
    stat_materials: "+500 materiales",
    stat_access: "Acceso ilimitado",
    btn_student: "Soy Alumno",
    btn_admin: "Soy Administrador",
    nav_about: "Sobre el SiGA",
    nav_contact: "Contactar Secretaría",
    footer_copyright: "© 2026 SiGA ITJ. Todos los derechos reservados.",
    footer_support: "Soporte",
    footer_terms: "Términos de Uso",
    footer_privacy: "Política de Privacidad",
    sobre_title: "¿Qué es <span>SiGA</span>?",
    sobre_subtitle: "Conoce un poco de nuestro trabajo y propósito",
    sobre_p1: "<strong>SiGA</strong> (Sistema Integrado de Gestión de Acervo) es la plataforma digital de gestión de bibliotecas escolares. Nuestra misión es democratizar el acceso al conocimiento, ofreciendo un entorno virtual completo para consulta y préstamo de materiales académicos.",
    sobre_p2: "Con un acervo en constante crecimiento, SiGA atiende a estudiantes, profesores y funcionarios, centralizando libros de texto, artículos científicos, revistas y otros recursos educativos. Todo con acceso ilimitado, las 24 horas del día, desde cualquier dispositivo.",
    sobre_p3: "Además de la practicidad, nuestra plataforma prioriza la organización y la inclusión: es posible buscar por categorías, autores y títulos, renovar préstamos en línea, todo en la palma de tu mano. SiGA es más que una biblioteca digital: es un portal al conocimiento, diseñado para inspirar y apoyar la trayectoria académica de cada usuario. <strong>El conocimiento no puede esperar y con SiGA, siempre está a tu alcance.</strong>",
    passos_title: "Comienza en <span>3 pasos</span>",
    passos_subtitle: "Sencillo, rápido y gratuito para alumnos",
    passo1_title: "1. Regístrate",
    passo1_desc: "Crea tu cuenta gratuita usando tu correo institucional.",
    passo2_title: "2. Encuentra",
    passo2_desc: "Busca entre cientos de libros y materiales didácticos.",
    passo3_title: "3. Accede",
    passo3_desc: "Lee en línea o descarga para estudiar donde quieras."
  }
};

// ===================== INICIALIZAÇÃO =====================
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".language-wrapper");
  const button = document.querySelector(".language-button");
  const items = document.querySelectorAll(".language-list li");
  const mainFlag = button.querySelector(".flag");
  const langSpan = button.querySelector("span");

  // Função que aplica o idioma em todos os elementos
  function applyLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    // Elementos principais
    document.getElementById("title").textContent = t.title;
    document.getElementById("subtitle").textContent = t.subtitle;
    document.getElementById("stat_materials").textContent = t.stat_materials;
    document.getElementById("stat_access").textContent = t.stat_access;
    document.getElementById("btn_student").textContent = t.btn_student;
    document.getElementById("btn_admin").textContent = t.btn_admin;
    document.getElementById("nav_about").textContent = t.nav_about;
    document.getElementById("nav_contact").textContent = t.nav_contact;
    document.getElementById("footer_copyright").textContent = t.footer_copyright;
    document.getElementById("footer_support").textContent = t.footer_support;
    document.getElementById("footer_terms").textContent = t.footer_terms;
    document.getElementById("footer_privacy").textContent = t.footer_privacy;

    // Seção Sobre
    document.getElementById("sobre_title").innerHTML = t.sobre_title;
    document.getElementById("sobre_subtitle").textContent = t.sobre_subtitle;
    document.getElementById("sobre_p1").innerHTML = t.sobre_p1;
    document.getElementById("sobre_p2").innerHTML = t.sobre_p2;
    document.getElementById("sobre_p3").innerHTML = t.sobre_p3;

    // Seção 3 passos
    document.getElementById("passos_title").innerHTML = t.passos_title;
    document.getElementById("passos_subtitle").textContent = t.passos_subtitle;
    document.getElementById("passo1_title").textContent = t.passo1_title;
    document.getElementById("passo1_desc").textContent = t.passo1_desc;
    document.getElementById("passo2_title").textContent = t.passo2_title;
    document.getElementById("passo2_desc").textContent = t.passo2_desc;
    document.getElementById("passo3_title").textContent = t.passo3_title;
    document.getElementById("passo3_desc").textContent = t.passo3_desc;
  }

  // ── Gerencia abertura/fechamento do dropdown com acessibilidade ──
  function openMenu() {
    wrapper.classList.add("open");
    button.setAttribute("aria-expanded", "true");
    // Habilita Tab nos itens somente quando o menu está aberto
    items.forEach(li => li.setAttribute("tabindex", "0"));
    // Foca o primeiro item ao abrir pelo teclado
    items[0] && items[0].focus();
  }

  function closeMenu(returnFocus = false) {
    wrapper.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    // Remove os itens do fluxo de Tab quando o menu está fechado
    items.forEach(li => li.setAttribute("tabindex", "-1"));
    if (returnFocus) button.focus();
  }

  // Estado inicial: menu fechado, itens fora do Tab
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-haspopup", "listbox");
  items.forEach(li => {
    li.setAttribute("tabindex", "-1");
    li.setAttribute("role", "option");
  });

  // Clique no botão
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.classList.contains("open") ? closeMenu(true) : openMenu();
  });

  // Enter / Space abre o menu quando o botão está focado
  button.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      wrapper.classList.contains("open") ? closeMenu(true) : openMenu();
    } else if (e.key === "Escape") {
      closeMenu(true);
    }
  });

  // Fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) closeMenu();
  });

  // Trocar idioma ao clicar ou pressionar Enter/Space nas opções
  items.forEach((item, index) => {
    item.addEventListener("click", () => selectLanguage(item));

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectLanguage(item);
      } else if (e.key === "Escape") {
        closeMenu(true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[index + 1] || items[0];
        next.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = items[index - 1] || items[items.length - 1];
        prev.focus();
      } else if (e.key === "Tab") {
        // Fecha o menu apenas se sair do último item (Shift+Tab no primeiro também fecha)
        const isLast = index === items.length - 1;
        const isFirst = index === 0;
        if ((!e.shiftKey && isLast) || (e.shiftKey && isFirst)) {
          closeMenu();
        }
      }
    });
  });

  function selectLanguage(item) {
    const lang = item.dataset.lang;
    const clickedFlag = item.querySelector(".flag").src;
    const clickedAlt = item.querySelector(".flag").alt;

    langSpan.textContent = lang.toUpperCase();
    mainFlag.src = clickedFlag;
    mainFlag.alt = "Bandeira " + clickedAlt;

    applyLanguage(lang);
    closeMenu(true);
  }

  // Idioma inicial: português
  applyLanguage("pt");

  // ====== Menu mobile ======
  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');

  function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !navLinks.classList.contains('open');
    if (isOpen) {
      navLinks.classList.add('open');
      menuButton.setAttribute('aria-expanded', 'true');
    } else {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  }

  if (menuButton) {
    menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Fecha o menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (navLinks && !navLinks.contains(e.target) && menuButton && !menuButton.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Fecha o menu ao redimensionar para desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) toggleMenu(false);
  });

  // Fecha o menu quando um link de navegação é clicado (mobile)
  const navAnchors = navLinks ? navLinks.querySelectorAll('a') : null;
  if (navAnchors) {
    navAnchors.forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  }

  // Keyboard: close menu with Escape, trap Tab within the menu when open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close both menus
      toggleMenu(false);
      closeMenu(true);
    }

    if (e.key === 'Tab' && navLinks && navLinks.classList.contains('open')) {
      const focusable = Array.from(navLinks.querySelectorAll('a, button'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ===================== EVENTOS DOS LINKS DO FOOTER =====================
  document.getElementById("footer_support").addEventListener("click", (e) => {
    e.preventDefault();
    alert("💬 Suporte SiGA: suporte@sigaitj.com\nWhatsApp: (11) 91234-5678");
  });

  document.getElementById("footer_terms").addEventListener("click", (e) => {
    e.preventDefault();
    alert("📄 Termos de Uso: Este é um ambiente acadêmico. O uso indevido implica em sanções disciplinares.");
  });

  document.getElementById("footer_privacy").addEventListener("click", (e) => {
    e.preventDefault();
    alert("🔒 Política de Privacidade: Seus dados são utilizados apenas para fins institucionais e não são compartilhados.");
  });
});
// =============================================
// painel_aluno.js - SiGA ITJ (Dashboard)
// =============================================

// ===================== TRADUÇÕES DO DASHBOARD =====================
const dashboardTranslations = {
  pt: {
    search_placeholder: "Buscar Livros, autores, revistas...",
    welcome_prefix: "Olá, ",
    logout: "Sair",
    notification_title: "Notificações",
    nav_overview: "Visão Geral",
    nav_catalog: "Catálogo",
    nav_favorites: "Meus Favoritos",
    nav_loans: "Meus Empréstimos",
    nav_reservations: "Minhas Reservas",
    nav_history: "Histórico",
    nav_settings: "Configurações",
    quick_actions_title: "Ações Rápidas",
    explore_catalog: "Explorar Catálogo",
    my_loans: "Meus Empréstimos",
    my_reservations: "Minhas Reservas",
    collapse_menu: "Recolher menu",
    language_label: "Selecionar idioma",
    appearance_label: "Aparência",
    mark_all_read: "Marcar tudo como lido",
    notif_empty: "Nenhuma notificação por aqui",
    notif_pendency: "Pendência",
    notif_notice: "Aviso",
    time_now: "Agora pouco",
    time_min: "min atrás",
    time_hour: "h atrás",
    time_yesterday: "Ontem",
    loans_active_title: "Meus Empréstimos Ativos",
    view_loans: "Ver empréstimos",
    return_expected: "Devolução prevista:",
    no_active_loans: "Você não tem empréstimos ativos no momento.",
    tcc_view_all: "Ver todos",
    tcc_empty: "Ainda não há TCCs cadastrados no catálogo.",
    tcc_prev: "TCCs anteriores",
    tcc_next: "Próximos TCCs",
    tcc_close: "Fechar detalhes",
    ranking_title: "Acervos em destaque",
    ranking_link: "Meus favoritos",
    ranking_empty: "O ranking aparece assim que os materiais receberem favoritos.",
    place_label: "{n}º lugar",
    favorites_word: "favoritos",
    loan_date_label: "Empréstimo:",
    due_date_label: "Vencimento:"
  },
  en: {
    search_placeholder: "Search books, authors, magazines...",
    welcome_prefix: "Hello, ",
    logout: "Logout",
    notification_title: "Notifications",
    nav_overview: "Overview",
    nav_catalog: "Catalog",
    nav_favorites: "My Favorites",
    nav_loans: "My Loans",
    nav_reservations: "My Reservations",
    nav_history: "History",
    nav_settings: "Settings",
    quick_actions_title: "Quick Actions",
    explore_catalog: "Explore Catalog",
    my_loans: "My Loans",
    my_reservations: "My Reservations",
    collapse_menu: "Collapse menu",
    language_label: "Select language",
    appearance_label: "Appearance",
    mark_all_read: "Mark all as read",
    notif_empty: "No notifications here",
    notif_pendency: "Pending issue",
    notif_notice: "Notice",
    time_now: "Just now",
    time_min: "min ago",
    time_hour: "h ago",
    time_yesterday: "Yesterday",
    loans_active_title: "My Active Loans",
    view_loans: "View loans",
    return_expected: "Expected return:",
    no_active_loans: "You have no active loans at the moment.",
    tcc_view_all: "View all",
    tcc_empty: "There are no theses registered in the catalog yet.",
    tcc_prev: "Previous theses",
    tcc_next: "Next theses",
    tcc_close: "Close details",
    ranking_title: "Featured collection",
    ranking_link: "My favorites",
    ranking_empty: "The ranking appears as soon as items receive favorites.",
    place_label: "Rank {n}",
    favorites_word: "favorites",
    loan_date_label: "Loan:",
    due_date_label: "Due:"
  },
  es: {
    search_placeholder: "Buscar libros, autores, revistas...",
    welcome_prefix: "Hola, ",
    logout: "Salir",
    notification_title: "Notificaciones",
    nav_overview: "Visión General",
    nav_catalog: "Catálogo",
    nav_favorites: "Mis Favoritos",
    nav_loans: "Mis Préstamos",
    nav_reservations: "Mis Reservas",
    nav_history: "Historial",
    nav_settings: "Configuración",
    quick_actions_title: "Acciones Rápidas",
    explore_catalog: "Explorar Catálogo",
    my_loans: "Mis Préstamos",
    my_reservations: "Mis Reservas",
    collapse_menu: "Contraer menú",
    language_label: "Seleccionar idioma",
    appearance_label: "Apariencia",
    mark_all_read: "Marcar todo como leído",
    notif_empty: "No hay notificaciones por aquí",
    notif_pendency: "Pendiente",
    notif_notice: "Aviso",
    time_now: "Hace un momento",
    time_min: "min atrás",
    time_hour: "h atrás",
    time_yesterday: "Ayer",
    loans_active_title: "Mis Préstamos Activos",
    view_loans: "Ver préstamos",
    return_expected: "Devolución prevista:",
    no_active_loans: "No tienes préstamos activos en este momento.",
    tcc_view_all: "Ver todos",
    tcc_empty: "Aún no hay TFCs registrados en el catálogo.",
    tcc_prev: "TFCs anteriores",
    tcc_next: "Próximos TFCs",
    tcc_close: "Cerrar detalles",
    ranking_title: "Acervos destacados",
    ranking_link: "Mis favoritos",
    ranking_empty: "El ranking aparece cuando los materiales reciban favoritos.",
    place_label: "Puesto {n}",
    favorites_word: "favoritos",
    loan_date_label: "Préstamo:",
    due_date_label: "Vencimiento:"
  }
};

// ===================== FUNÇÕES AUXILIARES =====================
function showFeedbackMessage(message) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = message;
  msgDiv.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; 
    transform: translateX(-50%); background: #0b4b9b; 
    color: white; padding: 12px 24px; border-radius: 8px;
    z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: opacity 0.3s;
  `;
  document.body.appendChild(msgDiv);
  setTimeout(() => {
    msgDiv.style.opacity = '0';
    setTimeout(() => msgDiv.remove(), 500);
  }, 2000);
}

function applyDashboardLanguage(lang) {
  const t = dashboardTranslations[lang];
  if (!t) return;

  document.documentElement.lang = { pt: 'pt-BR', en: 'en', es: 'es' }[lang] || 'pt-BR';
  if (typeof window.atualizarRotuloTema === 'function') window.atualizarRotuloTema();

  // Textos marcados no HTML: data-i18n (texto), -placeholder, -title (title + aria-label), -aria, -alt
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const texto = t[el.dataset.i18n];
    if (texto !== undefined) el.textContent = texto;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const texto = t[el.dataset.i18nPlaceholder];
    if (texto !== undefined) el.placeholder = texto;
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const texto = t[el.dataset.i18nTitle];
    if (texto !== undefined) {
      el.title = texto;
      el.setAttribute('aria-label', texto);
    }
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const texto = t[el.dataset.i18nAria];
    if (texto !== undefined) el.setAttribute('aria-label', texto);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const texto = t[el.dataset.i18nAlt];
    if (texto !== undefined) el.alt = texto;
  });
  document.querySelectorAll('.podium-medal[data-pos]').forEach((el) => {
    el.setAttribute('aria-label', t.place_label.replace('{n}', el.dataset.pos));
  });

  // Cabeçalho
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t.search_placeholder;

  const welcome = document.querySelector('.user-info .welcome');
  if (welcome && welcome.firstChild && welcome.firstChild.nodeType === Node.TEXT_NODE) {
    welcome.firstChild.textContent = t.welcome_prefix;
  }

  const logoutSpan = document.getElementById('logout-text');
  if (logoutSpan) logoutSpan.textContent = t.logout;

  const notifBtn = document.getElementById('notification-btn');
  if (notifBtn) notifBtn.title = t.notification_title;

  // Menu lateral (na ordem dos links)
  const navTexts = [
    t.nav_overview,
    t.nav_catalog,
    t.nav_favorites,
    t.nav_loans,
    t.nav_reservations,
    t.nav_history,
    t.nav_settings
  ];
  document.querySelectorAll('.sidebar-nav .nav-item').forEach((item, idx) => {
    const span = item.querySelector('span');
    if (span && navTexts[idx]) span.textContent = navTexts[idx];
  });

  // Painel: ações rápidas (só existem nessa página)
  const quickTitle = document.querySelector('.section-title');
  if (quickTitle) quickTitle.textContent = t.quick_actions_title;

  const actionTexts = [t.explore_catalog, t.my_loans, t.my_reservations];
  document.querySelectorAll('.actions-grid .action-btn span').forEach((btn, idx) => {
    if (actionTexts[idx]) btn.textContent = actionTexts[idx];
  });

  // Sininho e carrossel de TCCs
  document.dispatchEvent(new CustomEvent('siga:idioma', { detail: { lang } }));
  if (typeof applyTccLanguage === 'function') applyTccLanguage(lang);
}

// ===================== SELETOR DE IDIOMA =====================
function initLanguageSwitcher() {
  const wrapper = document.querySelector('.language-wrapper');
  const button = wrapper?.querySelector('.language-button');
  const items = document.querySelectorAll('.language-list li');
  const mainFlag = button?.querySelector('.flag');
  const langSpan = button?.querySelector('span');

  if (!wrapper || !button) {
    return;
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapper.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      const lang = item.dataset.lang;
      const clickedFlag = item.querySelector('.flag')?.src || mainFlag?.src;
      const clickedAlt = item.querySelector('.flag')?.alt || '';

      if (langSpan && mainFlag && clickedFlag) {
        langSpan.textContent = lang.toUpperCase();
        mainFlag.src = clickedFlag;
        mainFlag.alt = clickedAlt;
      }

      applyDashboardLanguage(lang);
      wrapper.classList.remove('open');
      localStorage.setItem('siga-idioma', lang);
      localStorage.removeItem('dashboard_lang');
    });
  });

  let savedLang = localStorage.getItem('siga-idioma');
  if (!savedLang) {
    savedLang = localStorage.getItem('dashboard_lang');
    if (savedLang) {
      localStorage.setItem('siga-idioma', savedLang);
      localStorage.removeItem('dashboard_lang');
    }
  }
  savedLang = savedLang || 'pt';
  const selectedItem = Array.from(items).find(item => item.dataset.lang === savedLang);
  if (selectedItem && langSpan && mainFlag) {
    const flagImg = selectedItem.querySelector('.flag');
    if (flagImg) {
      mainFlag.src = flagImg.src;
      mainFlag.alt = flagImg.alt;
    }
    langSpan.textContent = savedLang.toUpperCase();
  }
  applyDashboardLanguage(savedLang);
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Sidebar: restaura o estado sem animar o carregamento inicial
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('collapseBtn');
  
  if (collapseBtn && sidebar) {
    const podeRecolher = window.matchMedia('(min-width: 901px)').matches;
    let recolhida = false;
    try {
      recolhida = podeRecolher && localStorage.getItem('sidebarCollapsed') === 'true';
    } catch (error) {}

    sidebar.classList.toggle('collapsed', recolhida);
    document.documentElement.classList.remove('sidebar-collapsed-init');
    
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      try {
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
      } catch (error) {}
    });
  }

  // 2. Barra de pesquisa
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const term = searchInput.value.trim();
        if (term) window.location.href = `catalogo.php?busca=${encodeURIComponent(term)}`;
      }
    });
  }

  document.querySelectorAll('.podium-material[data-catalogo-visualizar]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
      if (!csrf) {
        window.location.href = link.href;
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = link.href;

      [
        ['visualizar', link.dataset.catalogoVisualizar],
        ['csrf', csrf]
      ].forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    });
  });

  // 3. Inicializa idioma
  initLanguageSwitcher();
  
  if (window.favoritosPHP) {
    Object.keys(window.favoritosPHP).forEach(key => {
      const parts = key.split('_');
      if (parts[0] === 'tcc' && parts[1]) tccActiveFavorites.add(Number(parts[1]));
    });
  }
  if (window.reservasData) {
    window.reservasData.forEach(reserva => {
      if (reserva.id_catalogo) {
        tccActiveReserves.add(Number(reserva.id_catalogo));
        tccReservationIds.set(Number(reserva.id_catalogo), Number(reserva.id_reserva));
      }
    });
  }
  // 5. Inicializa carrossel de TCCs
  initTccCarousel();

});

// ===================== CARROSSEL DE TCCs =====================

// Traduções do carrossel
const tccTranslations = {
  pt: {
    section_title: 'Trabalhos de Conclusão de Curso',
    section_subtitle: 'Explore os TCCs da nossa escola e inspire-se para o seu projeto',
    badge: 'TCC',
    theme_label: 'Tema',
    members_label: 'Integrantes',
    favorite: 'Favoritar',
    favorited: 'Favoritado',
    reserve: 'Reservar',
    reserved: 'Reservado',
    cancel_reserve: 'Cancelar reserva',
    feedback_favorited: 'TCC adicionado aos favoritos!',
    feedback_unfavorited: 'TCC removido dos favoritos.',
    feedback_reserved: 'Reserva realizada com sucesso!',
    feedback_unreserved: 'Reserva cancelada.',
    untitled: 'Sem título',
    no_author: 'Autor não informado',
    no_year: 'Ano não informado',
    no_description: 'Descrição não informada',
    view_details: 'Ver detalhes',
  },
  en: {
    section_title: 'Thesis Works',
    section_subtitle: 'Explore our school\'s theses and get inspired for your own project',
    badge: 'Thesis',
    theme_label: 'Theme',
    members_label: 'Members',
    favorite: 'Favorite',
    favorited: 'Favorited',
    reserve: 'Reserve',
    reserved: 'Reserved',
    cancel_reserve: 'Cancel reservation',
    feedback_favorited: 'Thesis added to favorites!',
    feedback_unfavorited: 'Thesis removed from favorites.',
    feedback_reserved: 'Reservation made successfully!',
    feedback_unreserved: 'Reservation cancelled.',
    untitled: 'Untitled',
    no_author: 'Author not informed',
    no_year: 'Year not informed',
    no_description: 'Description not informed',
    view_details: 'View details',
  },
  es: {
    section_title: 'Trabajos de Fin de Carrera',
    section_subtitle: 'Explora los TFCs de nuestra escuela e inspírate para tu proyecto',
    badge: 'TFC',
    theme_label: 'Tema',
    members_label: 'Integrantes',
    favorite: 'Agregar a favoritos',
    favorited: 'En favoritos',
    reserve: 'Reservar',
    reserved: 'Reservado',
    cancel_reserve: 'Cancelar reserva',
    feedback_favorited: '¡TFC agregado a favoritos!',
    feedback_unfavorited: 'TFC eliminado de favoritos.',
    feedback_reserved: '¡Reserva realizada con éxito!',
    feedback_unreserved: 'Reserva cancelada.',
    untitled: 'Sin título',
    no_author: 'Autor no informado',
    no_year: 'Año no informado',
    no_description: 'Descripción no informada',
    view_details: 'Ver detalles',
  }
};

// TCCs cadastrados no banco e injetados pela página.
const tccData = (window.tccsData || []).map(item => {
  const tr = () => tccTranslations[getCurrentLanguage()] || tccTranslations.pt;
  // Getters: os textos padrão acompanham o idioma escolhido no momento da exibição.
  return {
    id: Number(item.id_catalogo),
    get title() { return item.titulo || tr().untitled; },
    get author() { return item.autor || tr().no_author; },
    cover: item.capa_url || null,
    get year() { return item.ano_publicacao || tr().no_year; },
    area: item.autor || 'TCC',
    get theme() { return item.descricao || tr().no_description; },
    get members() { return (item.autor || tr().no_author).split(',').map(member => member.trim()); }
  };
});
// Paleta de gradientes para os placeholders
const tccGradients = [
  'linear-gradient(135deg, #0b4b9b 0%, #17c8cc 100%)',
  'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #e91e63 0%, #ff9800 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)',
  'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
  'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
];

let tccCurrentIndex = 0;
let tccVisibleCount = 0;
let tccActiveFavorites = new Set();
let tccActiveReserves = new Set();
let tccReservationIds = new Map();
let tccCurrentId = null;

function getTccVisibleCount() {
  const container = document.querySelector('.tcc-track-container');
  if (!container) return 5;
  const containerWidth = container.offsetWidth;
  const cardWidth = 140 + 16; // card + gap
  return Math.max(1, Math.floor(containerWidth / cardWidth));
}

function renderTccCarousel() {
  const track = document.getElementById('tcc-track');
  if (!track) return;

  track.innerHTML = '';

  tccData.forEach((tcc, idx) => {
    const card = document.createElement('div');
    card.className = 'tcc-cover-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${(tccTranslations[getCurrentLanguage()] || tccTranslations.pt).view_details}: ${tcc.title}`);
    card.dataset.id = tcc.id;

    const gradient = tccGradients[idx % tccGradients.length];
    const initial = tcc.title.charAt(0).toUpperCase();

    if (tcc.cover) {
      card.innerHTML = `
        <img src="${tcc.cover}" alt="${tcc.title}">
        <div class="tcc-cover-year">${tcc.year}</div>
      `;
    } else {
      card.innerHTML = `
        <div class="tcc-cover-placeholder" style="background: ${gradient}">
          <i class="fas fa-graduation-cap"></i>
          <span>${tcc.title}</span>
        </div>
        <div class="tcc-cover-year">${tcc.year}</div>
      `;
    }

    card.addEventListener('click', () => openTccModal(tcc.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTccModal(tcc.id);
      }
    });

    track.appendChild(card);
  });

  tccVisibleCount = getTccVisibleCount();
  updateTccNav();
}

function updateTccNav() {
  tccVisibleCount = getTccVisibleCount();
  const total = tccData.length;
  const maxIndex = Math.max(0, total - tccVisibleCount);

  const prevBtn = document.getElementById('tcc-prev');
  const nextBtn = document.getElementById('tcc-next');
  if (prevBtn) prevBtn.disabled = maxIndex === 0;
  if (nextBtn) nextBtn.disabled = maxIndex === 0;

  const track = document.getElementById('tcc-track');
  if (track) {
    const cardWidth = 140 + 16;
    track.style.transform = `translateX(-${tccCurrentIndex * cardWidth}px)`;
  }
}

function initTccCarousel() {
  renderTccCarousel();

  const prevBtn = document.getElementById('tcc-prev');
  const nextBtn = document.getElementById('tcc-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      tccVisibleCount = getTccVisibleCount();
      const maxIndex = Math.max(0, tccData.length - tccVisibleCount);
      if (maxIndex > 0) {
        tccCurrentIndex = tccCurrentIndex === 0 ? maxIndex : tccCurrentIndex - 1;
        updateTccNav();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      tccVisibleCount = getTccVisibleCount();
      const maxIndex = Math.max(0, tccData.length - tccVisibleCount);
      if (maxIndex > 0) {
        tccCurrentIndex = tccCurrentIndex >= maxIndex ? 0 : tccCurrentIndex + 1;
        updateTccNav();
      }
    });
  }

  const carousel = document.querySelector('.tcc-carousel');
  if (carousel && tccData.length > getTccVisibleCount()) {
    window.setInterval(() => {
      if (document.hidden || carousel.matches(':hover, :focus-within')) return;
      if (document.getElementById('tcc-modal-overlay')?.classList.contains('open')) return;

      const maxIndex = Math.max(0, tccData.length - getTccVisibleCount());
      tccCurrentIndex = tccCurrentIndex >= maxIndex ? 0 : tccCurrentIndex + 1;
      updateTccNav();
    }, 5000);
  }

  // Reajusta no resize
  window.addEventListener('resize', () => {
    tccVisibleCount = getTccVisibleCount();
    const maxIndex = Math.max(0, tccData.length - tccVisibleCount);
    if (tccCurrentIndex > maxIndex) tccCurrentIndex = maxIndex;
    updateTccNav();
  });

  // Fechar modal
  const overlay = document.getElementById('tcc-modal-overlay');
  const closeBtn = document.getElementById('tcc-modal-close');

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeTccModal();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeTccModal);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTccModal();
  });

  // Botões de ação no modal
  const favBtn = document.getElementById('tcc-favorite-btn');
  const resBtn = document.getElementById('tcc-reserve-btn');

  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const lang = getCurrentLanguage();
      const t = tccTranslations[lang] || tccTranslations.pt;
      const icon = document.getElementById('tcc-favorite-icon');
      const text = document.getElementById('tcc-favorite-text');

      if (tccActiveFavorites.has(tccCurrentId)) {
        tccActiveFavorites.delete(tccCurrentId);
        favBtn.classList.remove('favorited');
        if (icon) { icon.className = 'far fa-heart'; }
        if (text) text.textContent = t.favorite;
        showFeedbackMessage(t.feedback_unfavorited);
      } else {
        tccActiveFavorites.add(tccCurrentId);
        favBtn.classList.add('favorited');
        if (icon) { icon.className = 'fas fa-heart'; }
        if (text) text.textContent = t.favorited;
        showFeedbackMessage(t.feedback_favorited);
      }
    });
  }

  if (resBtn) {
    resBtn.addEventListener('click', () => {
      const input = document.getElementById('tcc-reserva-item-id');
      if (input) input.value = tccCurrentId;
    });
  }
}

function openTccModal(id) {
  const tcc = tccData.find(t => t.id === id);
  if (!tcc) return;
  tccCurrentId = id;
  const itemId = document.getElementById('tcc-modal-item-id');
  if (itemId) itemId.value = id;
  const reservaInput = document.getElementById('tcc-reserva-item-id');
  if (reservaInput) reservaInput.value = id;

  const lang = getCurrentLanguage();
  const tr = tccTranslations[lang] || tccTranslations.pt;
  const idx = tccData.findIndex(t => t.id === id);
  const gradient = tccGradients[idx % tccGradients.length];

  // Preencher capa
  const coverImg = document.getElementById('tcc-modal-cover');
  if (coverImg) {
    if (tcc.cover) {
      coverImg.src = tcc.cover;
      coverImg.alt = tcc.title;
      coverImg.style.display = 'block';
      coverImg.style.background = '';
    } else {
      coverImg.src = '';
      coverImg.alt = tcc.title;
      coverImg.style.background = gradient;
      coverImg.style.display = 'none';

      // Criar/atualizar placeholder no modal
      let placeholderModal = document.getElementById('tcc-modal-cover-placeholder');
      if (!placeholderModal) {
        placeholderModal = document.createElement('div');
        placeholderModal.id = 'tcc-modal-cover-placeholder';
        placeholderModal.style.cssText = `
          width:150px; height:210px; border-radius:10px;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:10px;
          box-shadow:0 10px 24px rgba(0,0,0,0.15);
          color:rgba(255,255,255,0.85); text-align:center;
          font-family: inherit;
        `;
        placeholderModal.innerHTML = `<i class="fas fa-graduation-cap" style="font-size:38px;"></i>
          <span style="font-size:11px; padding:0 10px; line-height:1.4; font-weight:500; color:rgba(255,255,255,0.75);">${tcc.title}</span>`;
        coverImg.parentNode.insertBefore(placeholderModal, coverImg);
      } else {
        placeholderModal.style.display = 'flex';
        placeholderModal.querySelector('span').textContent = tcc.title;
      }
      placeholderModal.style.background = gradient;
    }
  }

  // Ocultar placeholder se tem capa
  const ph = document.getElementById('tcc-modal-cover-placeholder');
  if (ph) ph.style.display = tcc.cover ? 'none' : 'flex';
  if (coverImg) coverImg.style.display = tcc.cover ? 'block' : 'none';

  // Textos
  const titleEl = document.getElementById('tcc-modal-title');
  if (titleEl) titleEl.textContent = tcc.title;

  const yearEl = document.getElementById('tcc-modal-year');
  if (yearEl) yearEl.textContent = tcc.year;

  const areaEl = document.getElementById('tcc-modal-area');
  if (areaEl) areaEl.textContent = tcc.area;

  const themeEl = document.getElementById('tcc-modal-theme');
  if (themeEl) themeEl.textContent = tcc.theme;

  const badgeText = document.getElementById('tcc-modal-badge-text');
  if (badgeText) badgeText.textContent = tr.badge;

  const themeLabel = document.getElementById('tcc-theme-label');
  if (themeLabel) themeLabel.textContent = tr.theme_label;

  const membersLabel = document.getElementById('tcc-members-label');
  if (membersLabel) membersLabel.textContent = tr.members_label;

  // Integrantes
  const membersList = document.getElementById('tcc-modal-members');
  if (membersList) {
    membersList.innerHTML = '';
    tcc.members.forEach(name => {
      const li = document.createElement('li');
      li.setAttribute('data-initial', name.charAt(0).toUpperCase());
      li.textContent = name;
      membersList.appendChild(li);
    });
  }

  // Estado dos botões
  const favBtn = document.getElementById('tcc-favorite-btn');
  const favIcon = document.getElementById('tcc-favorite-icon');
  const favText = document.getElementById('tcc-favorite-text');
  if (favBtn && favIcon && favText) {
    const isFaved = tccActiveFavorites.has(id);
    favBtn.classList.toggle('favorited', isFaved);
    favIcon.className = isFaved ? 'fas fa-heart' : 'far fa-heart';
    favText.textContent = isFaved ? tr.favorited : tr.favorite;
  }

  const resBtn = document.getElementById('tcc-reserve-btn');
  const resText = document.getElementById('tcc-reserve-text');
  if (resBtn && resText) {
    const isReserved = tccActiveReserves.has(id);
    resBtn.classList.toggle('reserved', isReserved);
    resText.textContent = isReserved ? tr.cancel_reserve : tr.reserve;
    const reservaForm = resBtn.closest('form');
    const reservaIdInput = reservaForm?.querySelector('[name="id_catalogo"], [name="id"]');
    const reservaActionInput = reservaForm?.querySelector('[name="action"]');
    if (reservaIdInput) {
      reservaIdInput.name = isReserved ? 'id' : 'id_catalogo';
      reservaIdInput.value = isReserved ? (tccReservationIds.get(id) || id) : id;
    }
    if (reservaActionInput) reservaActionInput.value = isReserved ? 'cancel' : '';
  }

  // Abrir overlay
  const overlay = document.getElementById('tcc-modal-overlay');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTccModal() {
  const overlay = document.getElementById('tcc-modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  tccCurrentId = null;
}

function applyTccLanguage(lang) {
  const t = tccTranslations[lang] || tccTranslations.pt;

  const titleEl = document.getElementById('tcc-section-title');
  if (titleEl) titleEl.lastChild.textContent = ' ' + t.section_title;

  const subtitleEl = document.getElementById('tcc-section-subtitle');
  if (subtitleEl) subtitleEl.textContent = t.section_subtitle;

  // Os cartões são desenhados pelo JS: refaz para trocar o aria-label e os textos padrão
  if (document.getElementById('tcc-track')) renderTccCarousel();
}

// ===================== FUNÇÃO PARA OBTER IDIOMA ATUAL =====================
function getCurrentLanguage() {
  let idioma = localStorage.getItem('siga-idioma');
  if (!idioma) {
    idioma = localStorage.getItem('dashboard_lang');
    if (idioma) {
      localStorage.setItem('siga-idioma', idioma);
      localStorage.removeItem('dashboard_lang');
    }
  }
  return idioma || 'pt';
}
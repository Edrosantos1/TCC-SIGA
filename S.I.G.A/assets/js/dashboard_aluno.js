// =============================================
// dashboard_aluno.js - SiGA ITJ (Dashboard)
// =============================================

// ===================== TRADUÇÕES DO DASHBOARD =====================
const dashboardTranslations = {
  pt: {
    search_placeholder: "Buscar livros, autores, revistas...",
    welcome_prefix: "Olá, ",
    logout: "Sair",
    notification_title: "Notificações",
    nav_overview: "Visão Geral",
    nav_catalog: "Catálogo",
    nav_loans: "Meus Empréstimos",
    nav_reservations: "Minhas Reservas",
    nav_history: "Histórico",
    last_viewed_title: "Em Andamento",
    rating_label: "Avalie este material:",
    continue_reading: "Continuar Leitura →",
    progress_text: "% concluído • Página {current} de {total}",
    quick_actions_title: "Ações Rápidas",
    explore_catalog: "Explorar Catálogo",
    my_loans: "Meus Empréstimos",
    my_reservations: "Minhas Reservas",
    notifications: {
      overdue: "O livro \"{book}\" está {days} dias atrasado. Por favor, devolva à biblioteca.",
      reminder: "Lembrete: Você tem um livro para devolver amanhã.",
      newBook: "Novo livro disponível no catálogo: \"{book}\".",
      reservationReady: "Sua reserva de \"{book}\" já está disponível para retirada.",
      empty: "Nenhuma notificação nova"
    }
  },
  en: {
    search_placeholder: "Search books, authors, magazines...",
    welcome_prefix: "Hello, ",
    logout: "Logout",
    notification_title: "Notifications",
    nav_overview: "Overview",
    nav_catalog: "Catalog",
    nav_loans: "My Loans",
    nav_reservations: "My Reservations",
    nav_history: "History",
    last_viewed_title: "In Progress",
    rating_label: "Rate this material:",
    continue_reading: "Continue Reading →",
    progress_text: "% completed • Page {current} of {total}",
    quick_actions_title: "Quick Actions",
    explore_catalog: "Explore Catalog",
    my_loans: "My Loans",
    my_reservations: "My Reservations",
    notifications: {
      overdue: "The book \"{book}\" is {days} days overdue. Please return it to the library.",
      reminder: "Reminder: You have a book to return tomorrow.",
      newBook: "New book available in the catalog: \"{book}\".",
      reservationReady: "Your reservation for \"{book}\" is now available for pickup.",
      empty: "No new notifications"
    }
  },
  es: {
    search_placeholder: "Buscar libros, autores, revistas...",
    welcome_prefix: "Hola, ",
    logout: "Salir",
    notification_title: "Notificaciones",
    nav_overview: "Visión General",
    nav_catalog: "Catálogo",
    nav_loans: "Mis Préstamos",
    nav_reservations: "Mis Reservas",
    nav_history: "Historial",
    last_viewed_title: "En Progresso",
    rating_label: "Califica este material:",
    continue_reading: "Continuar Lectura →",
    progress_text: "% completado • Página {current} de {total}",
    quick_actions_title: "Acciones Rápidas",
    explore_catalog: "Explorar Catálogo",
    my_loans: "Mis Préstamos",
    my_reservations: "Mis Reservas",
    notifications: {
      overdue: "El libro \"{book}\" tiene {days} días de retraso. Por favor, devuélvalo a la biblioteca.",
      reminder: "Recordatorio: Tiene un libro que devolver mañana.",
      newBook: "Nuevo libro disponible en el catálogo: \"{book}\".",
      reservationReady: "Su reserva de \"{book}\" ya está disponible para recoger.",
      empty: "No hay notificaciones nuevas"
    }
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
  if (!t) {
    console.warn(`Idioma "${lang}" não encontrado.`);
    return;
  }
  console.log(`Aplicando idioma: ${lang}`);

  // Header
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t.search_placeholder;

  const logoutSpan = document.getElementById('logout-text');
  if (logoutSpan) logoutSpan.textContent = t.logout;

  const notifBtn = document.getElementById('notification-btn');
  if (notifBtn) notifBtn.title = t.notification_title;

  // Sidebar
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const navTexts = [t.nav_overview, t.nav_catalog, t.nav_loans, t.nav_reservations, t.nav_history];
  navItems.forEach((item, idx) => {
    const span = item.querySelector('span');
    if (span && navTexts[idx]) span.textContent = navTexts[idx];
  });

  // Seção "Última Coisa Vista"
  const lastViewedTitle = document.querySelector('.last-viewed h2');
  if (lastViewedTitle) {
    const icon = lastViewedTitle.querySelector('i');
    if (icon) lastViewedTitle.innerHTML = `<i class="${icon.className}"></i> ${t.last_viewed_title}`;
    else lastViewedTitle.innerHTML = `<i class="fas fa-clock"></i> ${t.last_viewed_title}`;
  }

  const ratingSpan = document.querySelector('.rating span');
  if (ratingSpan) ratingSpan.textContent = t.rating_label;

  const continueBtn = document.querySelector('.btn-continue');
  if (continueBtn) continueBtn.textContent = t.continue_reading;

  // Tradução do texto de progresso
  const progressTextElem = document.querySelector('.progress-text');
  if (progressTextElem) {
    const originalText = progressTextElem.textContent;
    const match = originalText.match(/(\d+)%.*?Página\s*(\d+)\s*de\s*(\d+)/i);
    if (match) {
      const percent = match[1];
      const current = match[2];
      const total = match[3];
      progressTextElem.textContent = t.progress_text
        .replace('%', percent)
        .replace('{current}', current)
        .replace('{total}', total);
    } else {
      let newText = originalText.replace('concluído', 'completado');
      if (lang === 'en') newText = newText.replace('concluído', 'completed');
      progressTextElem.textContent = newText;
    }
  }

  // Seção "Ações Rápidas"
  const quickTitle = document.querySelector('.section-title');
  if (quickTitle) quickTitle.textContent = t.quick_actions_title;

  const actionBtns = document.querySelectorAll('.actions-grid .action-btn span');
  const actionTexts = [t.explore_catalog, t.my_loans, t.my_reservations];
  actionBtns.forEach((btn, idx) => {
    if (actionTexts[idx]) btn.textContent = actionTexts[idx];
  });

  // Atualiza notificações se o sistema já estiver carregado
  if (typeof renderNotifications === 'function') {
    renderNotifications(lang);
  }

  // Atualiza textos do carrossel de TCCs
  if (typeof applyTccLanguage === 'function') {
    applyTccLanguage(lang);
  }
}

// ===================== SELETOR DE IDIOMA =====================
function initLanguageSwitcher() {
  const wrapper = document.querySelector('.language-wrapper');
  const button = wrapper?.querySelector('.language-button');
  const items = document.querySelectorAll('.language-list li');
  const mainFlag = button?.querySelector('.flag');
  const langSpan = button?.querySelector('span');

  if (!wrapper || !button) {
    console.error('Elementos do seletor de idioma não encontrados!');
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
        mainFlag.alt = `Bandeira ${clickedAlt}`;
      }

      applyDashboardLanguage(lang);
      wrapper.classList.remove('open');
      localStorage.setItem('dashboard_lang', lang);
      console.log(`Idioma alterado para: ${lang}`);
    });
  });

  const savedLang = localStorage.getItem('dashboard_lang') || 'pt';
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

// ===================== SISTEMA DE NOTIFICAÇÕES =====================
let notificationsData = [];
let unreadCount = 0;

// Dados mockados (exemplo)
const rawNotifications = [
  {
    id: 1,
    type: 'overdue',
    params: { book: 'Introdução à Programação com Python', days: 3 },
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: false
  },
  {
    id: 2,
    type: 'reminder',
    params: {},
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: false
  },
  {
    id: 3,
    type: 'newBook',
    params: { book: 'Clean Architecture' },
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true
  }
];

function translateNotification(notif, lang) {
  const t = dashboardTranslations[lang]?.notifications;
  if (!t) return 'Notificação';
  
  switch (notif.type) {
    case 'overdue':
      return t.overdue.replace('{book}', notif.params.book).replace('{days}', notif.params.days);
    case 'reminder':
      return t.reminder;
    case 'newBook':
      return t.newBook.replace('{book}', notif.params.book);
    case 'reservationReady':
      return t.reservationReady.replace('{book}', notif.params.book);
    default:
      return 'Notificação';
  }
}

function formatRelativeDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getCurrentLanguage() {
  return localStorage.getItem('dashboard_lang') || 'pt';
}

function saveNotificationsToLocal() {
  const toStore = notificationsData.map(n => ({
    ...n,
    date: n.date.toISOString()
  }));
  localStorage.setItem('dashboard_notifications', JSON.stringify(toStore));
}

function loadNotifications() {
  const stored = localStorage.getItem('dashboard_notifications');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      notificationsData = parsed.map(n => ({
        ...n,
        date: new Date(n.date)
      }));
    } catch(e) { console.error(e); }
  }
  
  if (!notificationsData.length) {
    notificationsData = rawNotifications.map(n => ({
      ...n,
      date: new Date(n.date)
    }));
    saveNotificationsToLocal();
  }
  
  renderNotifications(getCurrentLanguage());
}

function renderNotifications(lang) {
  const listContainer = document.getElementById('notification-list');
  const emptyDiv = listContainer?.querySelector('.empty-notifications');
  const badge = document.getElementById('notification-badge');
  const dot = document.querySelector('.notification-dot');
  
  if (!listContainer) return;
  
  unreadCount = notificationsData.filter(n => !n.read).length;
  
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  
  if (dot) {
    dot.style.opacity = unreadCount > 0 ? '1' : '0.3';
  }
  
  if (notificationsData.length === 0) {
    if (emptyDiv) emptyDiv.style.display = 'block';
    const items = listContainer.querySelectorAll('.notification-item');
    items.forEach(item => item.remove());
    return;
  }
  
  if (emptyDiv) emptyDiv.style.display = 'none';
  
  const existingItems = listContainer.querySelectorAll('.notification-item');
  existingItems.forEach(item => item.remove());
  
  const sorted = [...notificationsData].sort((a, b) => b.date - a.date);
  
  sorted.forEach(notif => {
    const message = translateNotification(notif, lang);
    const relativeDate = formatRelativeDate(notif.date);
    const item = document.createElement('div');
    item.className = `notification-item ${!notif.read ? 'unread' : ''}`;
    item.dataset.id = notif.id;
    
    let iconClass = 'fas fa-exclamation-triangle';
    if (notif.type === 'reminder') iconClass = 'fas fa-clock';
    else if (notif.type === 'newBook') iconClass = 'fas fa-book';
    else if (notif.type === 'reservationReady') iconClass = 'fas fa-check-circle';
    
    item.innerHTML = `
      <div class="notification-icon">
        <i class="${iconClass}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-message">${escapeHtml(message)}</div>
        <div class="notification-date">
          <i class="far fa-calendar-alt"></i> ${relativeDate}
        </div>
      </div>
    `;
    
    item.addEventListener('click', () => {
      if (!notif.read) {
        notif.read = true;
        renderNotifications(getCurrentLanguage());
        saveNotificationsToLocal();
      }
    });
    
    listContainer.appendChild(item);
  });
}

function markAllAsRead() {
  let changed = false;
  notificationsData.forEach(n => {
    if (!n.read) {
      n.read = true;
      changed = true;
    }
  });
  if (changed) {
    renderNotifications(getCurrentLanguage());
    saveNotificationsToLocal();
    showFeedbackMessage('Todas as notificações foram marcadas como lidas');
  }
}

function initNotifications() {
  const notifBtn = document.getElementById('notification-btn');
  const dropdown = document.getElementById('notification-dropdown');
  const markReadBtn = document.getElementById('mark-read-btn');
  
  if (!notifBtn || !dropdown) return;
  
  loadNotifications();
  
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });
  
  document.addEventListener('click', (e) => {
    if (!notifBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
  
  if (markReadBtn) {
    markReadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      markAllAsRead();
    });
  }
}

// ===================== HISTÓRICO DE VISUALIZADOS =====================

// Dados mockados — em produção, viriam do backend/localStorage
const recentlyViewedData = [
  {
    id: 1,
    title: 'Introdução à Programação com Python',
    author: 'Eric Matthes',
    cover: '../assets/Imagens/capa-exemplo.jpg',
    type: 'book',
    progress: 68,
    page: 214,
    totalPages: 412,
    href: 'ler.php?id=1'
  },
  {
    id: 2,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    cover: null,
    type: 'book',
    progress: 35,
    page: 112,
    totalPages: 320,
    href: 'ler.php?id=2'
  },
  {
    id: 3,
    title: 'Engenharia de Software Moderna',
    author: 'Marco Tulio Valente',
    cover: null,
    type: 'book',
    progress: 10,
    page: 28,
    totalPages: 280,
    href: 'ler.php?id=3'
  }
];

function getItemTypeIcon(type) {
  switch (type) {
    case 'magazine': return 'fas fa-newspaper';
    case 'tcc': return 'fas fa-graduation-cap';
    default: return 'fas fa-book';
  }
}

function renderRecentItems() {
  const mainItem = recentlyViewedData[0];
  const recentItems = recentlyViewedData.slice(1, 3);

  if (mainItem) {
    const mainLink = document.getElementById('last-viewed-main-link');
    if (mainLink) mainLink.href = mainItem.href;

    const mainCover = document.getElementById('last-viewed-cover');
    if (mainCover) {
      mainCover.src = mainItem.cover || '../assets/Imagens/capa-exemplo.jpg';
      mainCover.alt = mainItem.title;
    }

    const mainTitle = document.getElementById('last-viewed-title');
    if (mainTitle) mainTitle.textContent = mainItem.title;

    const mainAuthor = document.getElementById('last-viewed-author');
    if (mainAuthor) mainAuthor.textContent = mainItem.author;

    const mainProgress = document.getElementById('last-viewed-progress');
    if (mainProgress) mainProgress.style.width = `${mainItem.progress}%`;

    const mainProgressText = document.getElementById('last-viewed-progress-text');
    const lang = getCurrentLanguage();
    const t = dashboardTranslations[lang];
    if (mainProgressText && t) {
      mainProgressText.textContent = t.progress_text
        .replace('%', mainItem.progress + '%')
        .replace('{current}', mainItem.page)
        .replace('{total}', mainItem.totalPages);
    }
  }

  const list = document.getElementById('recent-items-list');
  if (!list) return;
  list.innerHTML = '';

  recentItems.forEach(item => {
    const card = document.createElement('a');
    card.href = item.href;
    card.className = 'recent-item-card';
    card.title = item.title;

    const coverHTML = item.cover
      ? `<img src="${item.cover}" alt="${item.title}" class="recent-item-cover">`
      : `<div class="recent-item-cover placeholder"><i class="${getItemTypeIcon(item.type)}"></i></div>`;

    card.innerHTML = `
      ${coverHTML}
      <div class="recent-item-info">
        <div class="recent-item-title">${item.title}</div>
        <div class="recent-item-author">${item.author}</div>
        <div class="recent-item-mini-progress">
          <div class="recent-item-mini-progress-fill" style="width: ${item.progress}%"></div>
        </div>
      </div>
    `;

    list.appendChild(card);
  });
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Collapse da sidebar
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('collapseBtn');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }
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

  // 3. Inicializa idioma
  initLanguageSwitcher();
  
  // 4. Inicializa notificações
  initNotifications();

  // 5. Renderiza itens visualizados recentemente
  renderRecentItems();

  // 6. Inicializa carrossel de TCCs
  initTccCarousel();

  console.log('%cDashboard SiGA ITJ carregado com sucesso!', 'color: #0b4b9b; font-weight: bold;');
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
    feedback_favorited: 'TCC adicionado aos favoritos!',
    feedback_unfavorited: 'TCC removido dos favoritos.',
    feedback_reserved: 'Reserva realizada com sucesso!',
    feedback_unreserved: 'Reserva cancelada.',
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
    feedback_favorited: 'Thesis added to favorites!',
    feedback_unfavorited: 'Thesis removed from favorites.',
    feedback_reserved: 'Reservation made successfully!',
    feedback_unreserved: 'Reservation cancelled.',
  },
  es: {
    section_title: 'Trabajos de Fin de Carrera',
    section_subtitle: 'Explora los TFCs de nuestra escuela e inspírate para tu proyecto',
    badge: 'TFC',
    theme_label: 'Tema',
    members_label: 'Integrantes',
    favorite: 'Favoritar',
    favorited: 'Favorito',
    reserve: 'Reservar',
    reserved: 'Reservado',
    feedback_favorited: '¡TFC agregado a favoritos!',
    feedback_unfavorited: 'TFC eliminado de favoritos.',
    feedback_reserved: '¡Reserva realizada con éxito!',
    feedback_unreserved: 'Reserva cancelada.',
  }
};

// Dados mockados dos TCCs — em produção, viria da API
const tccData = [
  {
    id: 1,
    title: 'Sistema de Monitoramento de Estufa com IoT',
    cover: null,
    year: 2024,
    area: 'Tecnologia da Informação',
    theme: 'Desenvolvimento de um sistema embarcado com Arduino e sensores de temperatura, umidade e luminosidade para monitoramento automatizado de estufas agrícolas, com painel de controle via web.',
    members: ['Ana Paula Ferreira', 'Lucas Rodrigues', 'Thiago Mendes']
  },
  {
    id: 2,
    title: 'Aplicativo de Gestão Financeira para Jovens',
    cover: null,
    year: 2024,
    area: 'Desenvolvimento de Software',
    theme: 'Criação de um aplicativo mobile com React Native voltado para educação financeira e controle de gastos para jovens entre 15 e 25 anos, com gamificação de metas.',
    members: ['Beatriz Santos', 'Felipe Lima']
  },
  {
    id: 3,
    title: 'Plataforma E-learning para Ensino de Programação',
    cover: null,
    year: 2023,
    area: 'Educação & Tecnologia',
    theme: 'Desenvolvimento de uma plataforma web interativa com trilhas de aprendizado personalizadas, exercícios com correção automática e fórum de dúvidas para ensino de lógica de programação.',
    members: ['Carlos Eduardo Nunes', 'Mariana Costa', 'Rafael Souza', 'Juliana Alves']
  },
  {
    id: 4,
    title: 'Reconhecimento de Gestos com Machine Learning',
    cover: null,
    year: 2023,
    area: 'Inteligência Artificial',
    theme: 'Implementação de um modelo de aprendizado de máquina com TensorFlow para reconhecimento de gestos em tempo real via câmera, aplicado ao controle de dispositivos domésticos.',
    members: ['Diego Carvalho', 'Fernanda Oliveira']
  },
  {
    id: 5,
    title: 'Rede Social para Troca de Livros',
    cover: null,
    year: 2023,
    area: 'Desenvolvimento Web',
    theme: 'Desenvolvimento de uma rede social com geolocalização para facilitar a doação e troca de livros entre usuários próximos, incentivando o hábito da leitura e a economia circular.',
    members: ['Gabriel Martins', 'Isabela Torres', 'Pedro Henrique Costa']
  },
  {
    id: 6,
    title: 'Dashboard de Análise de Dados para Pequenos Negócios',
    cover: null,
    year: 2022,
    area: 'Business Intelligence',
    theme: 'Criação de um painel de análise de dados com gráficos interativos e relatórios automáticos voltado para microempresas, integrando dados de vendas, estoque e clientes.',
    members: ['Letícia Barbosa', 'Matheus Ribeiro']
  },
  {
    id: 7,
    title: 'Robô Autônomo para Mapeamento de Ambientes',
    cover: null,
    year: 2022,
    area: 'Robótica',
    theme: 'Construção de um robô com sensores ultrassônicos e câmera capaz de mapear ambientes fechados autonomamente e gerar plantas baixas em formato digital.',
    members: ['Nicolas Almeida', 'Rebeca Fonseca', 'Samuel Dias']
  },
  {
    id: 8,
    title: 'Chatbot de Atendimento para Biblioteca Escolar',
    cover: null,
    year: 2022,
    area: 'Inteligência Artificial',
    theme: 'Desenvolvimento de um assistente virtual baseado em processamento de linguagem natural para auxílio no atendimento de uma biblioteca escolar, com funcionalidades de consulta de acervo e reserva de livros.',
    members: ['Vitória Nascimento', 'Henrique Castro']
  }
];

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
    card.setAttribute('aria-label', `Ver detalhes: ${tcc.title}`);
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
      if (e.key === 'Enter' || e.key === ' ') openTccModal(tcc.id);
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
  if (prevBtn) prevBtn.disabled = tccCurrentIndex <= 0;
  if (nextBtn) nextBtn.disabled = tccCurrentIndex >= maxIndex;

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
      if (tccCurrentIndex > 0) {
        tccCurrentIndex--;
        updateTccNav();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      tccVisibleCount = getTccVisibleCount();
      const maxIndex = Math.max(0, tccData.length - tccVisibleCount);
      if (tccCurrentIndex < maxIndex) {
        tccCurrentIndex++;
        updateTccNav();
      }
    });
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
      const lang = getCurrentLanguage();
      const t = tccTranslations[lang] || tccTranslations.pt;
      const text = document.getElementById('tcc-reserve-text');

      if (tccActiveReserves.has(tccCurrentId)) {
        tccActiveReserves.delete(tccCurrentId);
        resBtn.classList.remove('reserved');
        if (text) text.textContent = t.reserve;
        showFeedbackMessage(t.feedback_unreserved);
      } else {
        tccActiveReserves.add(tccCurrentId);
        resBtn.classList.add('reserved');
        if (text) text.textContent = t.reserved;
        showFeedbackMessage(t.feedback_reserved);
      }
    });
  }
}

function openTccModal(id) {
  const tcc = tccData.find(t => t.id === id);
  if (!tcc) return;
  tccCurrentId = id;

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
      // fallback visual com ícone via CSS: apenas oculta o img quebrado
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
    resText.textContent = isReserved ? tr.reserved : tr.reserve;
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
  if (titleEl) titleEl.textContent = t.section_title;

  const subtitleEl = document.getElementById('tcc-section-subtitle');
  if (subtitleEl) subtitleEl.textContent = t.section_subtitle;
}

// Patch: integrar com o seletor de idioma já existente
const _originalApplyDashboardLanguage = applyDashboardLanguage;
// Sobrescreve para também aplicar ao carrossel
(function patchLanguage() {
  const originalFn = applyDashboardLanguage;
  window._tccLanguagePatch = function(lang) {
    applyTccLanguage(lang);
  };
})();
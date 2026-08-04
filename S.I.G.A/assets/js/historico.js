// historico.js
// ===================== DADOS MOCKADOS =====================
// Em produção, viriam da API/banco de dados

const historicoData = [
  // Empréstimos
  {
    id: 1,
    type: 'loan',
    itemId: 2,
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    year: 2008,
    cover: null,
    date: '2026-07-01',
    status: 'returned', // returned, overdue
    dueDate: '2026-07-15',
    returnedAt: '2026-07-14',
  },
  {
    id: 2,
    type: 'loan',
    itemId: 5,
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    cover: null,
    date: '2026-06-20',
    status: 'overdue',
    dueDate: '2026-07-05',
    returnedAt: null,
  },
  {
    id: 3,
    type: 'loan',
    itemId: 9,
    title: 'Sapiens: Uma Breve História da Humanidade',
    author: 'Yuval Noah Harari',
    year: 2011,
    cover: null,
    date: '2026-06-10',
    status: 'returned',
    dueDate: '2026-06-25',
    returnedAt: '2026-06-24',
  },
  {
    id: 4,
    type: 'loan',
    itemId: 12,
    title: 'Veja - Edição 2023',
    author: 'Editora Abril',
    year: 2023,
    cover: null,
    date: '2026-05-15',
    status: 'returned',
    dueDate: '2026-05-30',
    returnedAt: '2026-05-28',
  },
  {
    id: 5,
    type: 'loan',
    itemId: 15,
    title: 'PC Gamer - Edição Especial',
    author: 'PC Gamer US',
    year: 2024,
    cover: null,
    date: '2026-04-01',
    status: 'overdue',
    dueDate: '2026-04-15',
    returnedAt: null,
  },

  // Reservas
  {
    id: 6,
    type: 'reservation',
    itemId: 4,
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    year: 1943,
    cover: null,
    date: '2026-07-30',
    status: 'completed', // completed, cancelled
    reservedAt: '2026-07-30',
    pickedUpAt: '2026-07-31',
  },
  {
    id: 7,
    type: 'reservation',
    itemId: 16,
    title: 'Sistema de Monitoramento de Estufa com IoT',
    author: 'Ana Paula Ferreira, Lucas Rodrigues, Thiago Mendes',
    year: 2024,
    cover: null,
    date: '2026-07-20',
    status: 'completed',
    reservedAt: '2026-07-20',
    pickedUpAt: '2026-07-21',
  },
  {
    id: 8,
    type: 'reservation',
    itemId: 6,
    title: 'O Hobbit',
    author: 'J.R.R. Tolkien',
    year: 1937,
    cover: null,
    date: '2026-07-15',
    status: 'cancelled',
    reservedAt: '2026-07-15',
    pickedUpAt: null,
  },
  {
    id: 9,
    type: 'reservation',
    itemId: 8,
    title: 'A Arte da Guerra',
    author: 'Sun Tzu',
    year: -500,
    cover: null,
    date: '2026-07-10',
    status: 'cancelled',
    reservedAt: '2026-07-10',
    pickedUpAt: null,
  },
  {
    id: 10,
    type: 'reservation',
    itemId: 19,
    title: 'Reconhecimento de Gestos com Machine Learning',
    author: 'Diego Carvalho, Fernanda Oliveira',
    year: 2023,
    cover: null,
    date: '2026-06-28',
    status: 'completed',
    reservedAt: '2026-06-28',
    pickedUpAt: '2026-06-30',
  },
];

// ===================== TRADUÇÕES =====================
const historicoTranslations = {
  pt: {
    page_title: 'Histórico',
    page_subtitle: 'Consulte todo o histórico de empréstimos e reservas',
    filter_type: 'Tipo',
    filter_period: 'Período',
    filter_all: 'Todos',
    filter_loans: 'Empréstimos',
    filter_reservations: 'Reservas',
    period_30: 'Últimos 30 dias',
    period_90: 'Últimos 90 dias',
    period_180: 'Últimos 180 dias',
    period_365: 'Último ano',
    period_all: 'Todo o histórico',
    search_placeholder: 'Buscar no histórico...',
    empty_message: 'Nenhum registro encontrado no histórico.',
    load_more: 'Carregar mais',
    status_returned: 'Devolvido',
    status_overdue: 'Atrasado',
    status_completed: 'Concluída',
    status_cancelled: 'Cancelada',
    status_pending: 'Pendente',
    type_loan: 'Empréstimo',
    type_reservation: 'Reserva',
    date_loan: 'Data do empréstimo',
    date_reservation: 'Data da reserva',
    due_date: 'Data de devolução',
    returned_at: 'Devolvido em',
    picked_up_at: 'Retirado em',
    details: 'Detalhes',
  },
  en: {
    page_title: 'History',
    page_subtitle: 'View your complete loan and reservation history',
    filter_type: 'Type',
    filter_period: 'Period',
    filter_all: 'All',
    filter_loans: 'Loans',
    filter_reservations: 'Reservations',
    period_30: 'Last 30 days',
    period_90: 'Last 90 days',
    period_180: 'Last 180 days',
    period_365: 'Last year',
    period_all: 'All history',
    search_placeholder: 'Search history...',
    empty_message: 'No records found in history.',
    load_more: 'Load more',
    status_returned: 'Returned',
    status_overdue: 'Overdue',
    status_completed: 'Completed',
    status_cancelled: 'Cancelled',
    status_pending: 'Pending',
    type_loan: 'Loan',
    type_reservation: 'Reservation',
    date_loan: 'Loan date',
    date_reservation: 'Reservation date',
    due_date: 'Due date',
    returned_at: 'Returned on',
    picked_up_at: 'Picked up on',
    details: 'Details',
  },
  es: {
    page_title: 'Historial',
    page_subtitle: 'Consulta todo el historial de préstamos y reservas',
    filter_type: 'Tipo',
    filter_period: 'Período',
    filter_all: 'Todos',
    filter_loans: 'Préstamos',
    filter_reservations: 'Reservas',
    period_30: 'Últimos 30 días',
    period_90: 'Últimos 90 días',
    period_180: 'Últimos 180 días',
    period_365: 'Último año',
    period_all: 'Todo el historial',
    search_placeholder: 'Buscar en el historial...',
    empty_message: 'No se encontraron registros en el historial.',
    load_more: 'Cargar más',
    status_returned: 'Devuelto',
    status_overdue: 'Atrasado',
    status_completed: 'Completada',
    status_cancelled: 'Cancelada',
    status_pending: 'Pendiente',
    type_loan: 'Préstamo',
    type_reservation: 'Reserva',
    date_loan: 'Fecha del préstamo',
    date_reservation: 'Fecha de la reserva',
    due_date: 'Fecha de devolución',
    returned_at: 'Devuelto el',
    picked_up_at: 'Retirado el',
    details: 'Detalles',
  }
};

// Mesclar com traduções do dashboard
if (typeof dashboardTranslations !== 'undefined') {
  for (let lang in historicoTranslations) {
    if (dashboardTranslations[lang]) {
      Object.assign(dashboardTranslations[lang], historicoTranslations[lang]);
    } else {
      dashboardTranslations[lang] = historicoTranslations[lang];
    }
  }
}

// ===================== ESTADO =====================
let allItems = [...historicoData];
let filteredItems = [];
let displayedItems = [];
let itemsPerPage = 10;
let currentPage = 0;
let currentFilters = {
  type: 'all',
  period: '30',
  search: '',
};

// ===================== FUNÇÕES AUXILIARES =====================
function getCurrentLanguage() {
  return localStorage.getItem('dashboard_lang') || 'pt';
}

function getHistoricoTranslation(key, lang) {
  const t = historicoTranslations[lang] || historicoTranslations.pt;
  return t[key] || key;
}

function showFeedbackMessage(message) {
  if (typeof window.showFeedbackMessage === 'function') {
    window.showFeedbackMessage(message);
    return;
  }
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

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getCoverColor(index) {
  const colors = [
    '#0b4b9b', '#17c8cc', '#6a11cb', '#f7971e', '#e91e63',
    '#11998e', '#4568dc', '#c94b4b', '#134e5e', '#ff6b6b',
    '#4ecdc4', '#45b7d1', '#f9ca24', '#6ab04c', '#eb4d4b'
  ];
  return colors[index % colors.length];
}

function getStatusClass(status) {
  switch (status) {
    case 'returned': return 'status-returned';
    case 'overdue': return 'status-overdue';
    case 'completed': return 'status-completed';
    case 'cancelled': return 'status-cancelled';
    case 'pending': return 'status-pending';
    default: return '';
  }
}

function getStatusLabel(status, lang) {
  const map = {
    returned: 'status_returned',
    overdue: 'status_overdue',
    completed: 'status_completed',
    cancelled: 'status_cancelled',
    pending: 'status_pending',
  };
  return getHistoricoTranslation(map[status] || 'status_pending', lang);
}

function getTypeLabel(type, lang) {
  const map = {
    loan: 'type_loan',
    reservation: 'type_reservation',
  };
  return getHistoricoTranslation(map[type] || 'type_loan', lang);
}

// ===================== FILTROS =====================
function applyFilters() {
  const type = document.getElementById('filter-type')?.value || 'all';
  const period = document.getElementById('filter-period')?.value || '30';
  const search = document.getElementById('filter-search')?.value.toLowerCase().trim() || '';

  currentFilters = { type, period, search };

  let filtered = [...allItems];

  // Filtrar por tipo
  if (type !== 'all') {
    filtered = filtered.filter(item => item.type === type);
  }

  // Filtrar por período
  if (period !== 'all') {
    const days = parseInt(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date + 'T00:00:00');
      return itemDate >= cutoff;
    });
  }

  // Filtrar por busca
  if (search) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(search) ||
      item.author.toLowerCase().includes(search)
    );
  }

  // Ordenar por data (mais recente primeiro)
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  filteredItems = filtered;
  currentPage = 0;
  displayedItems = [];
  renderHistorico();
}

// ===================== RENDERIZAÇÃO =====================
function renderHistorico() {
  const list = document.getElementById('historico-list');
  const empty = document.getElementById('historico-empty');
  const emptyMsg = document.getElementById('empty-message');
  const loadMoreBtn = document.getElementById('load-more-btn');

  if (!list) return;

  const lang = getCurrentLanguage();

  if (currentPage === 0) {
    list.innerHTML = '';
    displayedItems = [];
  }

  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;
  const itemsToShow = filteredItems.slice(start, end);

  if (itemsToShow.length === 0 && currentPage === 0) {
    empty.style.display = 'block';
    emptyMsg.textContent = getHistoricoTranslation('empty_message', lang);
    loadMoreBtn.style.display = 'none';
    return;
  }

  empty.style.display = 'none';

  itemsToShow.forEach((item, idx) => {
    const card = createHistoricoCard(item, start + idx, lang);
    list.appendChild(card);
    displayedItems.push(item);
  });

  // Controle do botão "carregar mais"
  if (end >= filteredItems.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-block';
  }
}

function createHistoricoCard(item, index, lang) {
  const card = document.createElement('div');
  card.className = 'historico-item';
  card.dataset.id = item.id;

  const coverColor = getCoverColor(index);
  const statusLabel = getStatusLabel(item.status, lang);
  const statusClass = getStatusClass(item.status);
  const typeLabel = getTypeLabel(item.type, lang);
  const typeBadgeClass = item.type === 'loan' ? 'badge-loan' : 'badge-reservation';

  let coverHTML;
  if (item.cover) {
    coverHTML = `<img src="${item.cover}" alt="${item.title}" class="historico-cover">`;
  } else {
    const iconMap = { book: 'fa-book', magazine: 'fa-newspaper', tcc: 'fa-graduation-cap' };
    const icon = iconMap[item.type] || 'fa-book';
    coverHTML = `
      <div class="historico-cover-placeholder" style="background: ${coverColor}">
        <i class="fas ${icon}"></i>
        <span>${item.title}</span>
      </div>
    `;
  }

  // Informações adicionais específicas
  let extraInfo = '';
  if (item.type === 'loan') {
    extraInfo = `
      <span><i class="far fa-calendar-check"></i> ${getHistoricoTranslation('due_date', lang)}: ${formatDate(item.dueDate)}</span>
      ${item.returnedAt ? `<span><i class="fas fa-undo-alt"></i> ${getHistoricoTranslation('returned_at', lang)}: ${formatDate(item.returnedAt)}</span>` : ''}
    `;
  } else {
    extraInfo = `
      <span><i class="far fa-calendar-alt"></i> ${getHistoricoTranslation('date_reservation', lang)}: ${formatDate(item.date)}</span>
      ${item.pickedUpAt ? `<span><i class="fas fa-check-circle"></i> ${getHistoricoTranslation('picked_up_at', lang)}: ${formatDate(item.pickedUpAt)}</span>` : ''}
    `;
  }

  card.innerHTML = `
    ${coverHTML}
    <div class="historico-info">
      <div class="title">${item.title}</div>
      <div class="author">${item.author}</div>
      <div class="meta">
        <span><span class="historico-badge ${typeBadgeClass}">${typeLabel}</span></span>
        <span><i class="far fa-calendar-alt"></i> ${getHistoricoTranslation(item.type === 'loan' ? 'date_loan' : 'date_reservation', lang)}: ${formatDate(item.date)}</span>
        ${extraInfo}
        <span class="historico-status ${statusClass}">${statusLabel}</span>
      </div>
    </div>
    <div class="historico-actions">
      <button class="btn-detail" data-action="detail"><i class="fas fa-info-circle"></i> ${getHistoricoTranslation('details', lang)}</button>
    </div>
  `;

  // Evento de detalhe
  const detailBtn = card.querySelector('[data-action="detail"]');
  if (detailBtn) {
    detailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openHistoricoModal(item.id);
    });
  }

  // Clique no card abre modal
  card.addEventListener('click', () => {
    openHistoricoModal(item.id);
  });

  return card;
}

function loadMoreItems() {
  if (displayedItems.length < filteredItems.length) {
    currentPage++;
    renderHistorico();
  }
}

// ===================== MODAL =====================
function openHistoricoModal(itemId) {
  const item = allItems.find(i => i.id === itemId);
  if (!item) return;

  const lang = getCurrentLanguage();
  const coverColor = getCoverColor(allItems.indexOf(item));

  const overlay = document.getElementById('historico-modal-overlay');
  const coverImg = document.getElementById('modal-cover-img');
  const coverPlaceholder = document.getElementById('modal-cover-placeholder');
  const titleEl = document.getElementById('modal-title');
  const authorEl = document.getElementById('modal-author');
  const yearEl = document.getElementById('modal-year');
  const typeEl = document.getElementById('modal-type');
  const dateEl = document.getElementById('modal-date');
  const statusEl = document.getElementById('modal-status');
  const extraEl = document.getElementById('modal-extra');

  // Preencher dados
  if (item.cover) {
    coverImg.src = item.cover;
    coverImg.alt = item.title;
    coverImg.style.display = 'block';
    coverPlaceholder.style.display = 'none';
  } else {
    coverImg.style.display = 'none';
    coverPlaceholder.style.display = 'flex';
    coverPlaceholder.style.background = coverColor;
    coverPlaceholder.querySelector('span').textContent = item.title;
  }

  titleEl.textContent = item.title;
  authorEl.textContent = item.author;
  yearEl.textContent = `Ano: ${item.year}`;
  const typeMap = { book: 'Livro', magazine: 'Revista', tcc: 'TCC' };
  typeEl.textContent = `Tipo: ${typeMap[item.type] || item.type}`;

  const typeLabel = getTypeLabel(item.type, lang);
  const statusLabel = getStatusLabel(item.status, lang);
  const statusClass = getStatusClass(item.status);

  dateEl.textContent = `${getHistoricoTranslation(item.type === 'loan' ? 'date_loan' : 'date_reservation', lang)}: ${formatDate(item.date)}`;

  statusEl.textContent = statusLabel;
  statusEl.className = `status-badge ${statusClass}`;

  // Informações extras
  let extraText = '';
  if (item.type === 'loan') {
    extraText = `${getHistoricoTranslation('due_date', lang)}: ${formatDate(item.dueDate)}`;
    if (item.returnedAt) {
      extraText += ` • ${getHistoricoTranslation('returned_at', lang)}: ${formatDate(item.returnedAt)}`;
    }
  } else {
    if (item.reservedAt) {
      extraText = `${getHistoricoTranslation('date_reservation', lang)}: ${formatDate(item.reservedAt)}`;
    }
    if (item.pickedUpAt) {
      extraText += ` • ${getHistoricoTranslation('picked_up_at', lang)}: ${formatDate(item.pickedUpAt)}`;
    }
  }
  extraEl.textContent = extraText;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeHistoricoModal() {
  const overlay = document.getElementById('historico-modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  // Aplicar traduções iniciais
  applyHistoricoLanguage(getCurrentLanguage());

  // Aplicar filtros iniciais
  applyFilters();

  // Eventos dos filtros
  const filterType = document.getElementById('filter-type');
  const filterPeriod = document.getElementById('filter-period');
  const filterSearch = document.getElementById('filter-search');
  const filterSearchBtn = document.getElementById('filter-search-btn');

  if (filterType) filterType.addEventListener('change', applyFilters);
  if (filterPeriod) filterPeriod.addEventListener('change', applyFilters);
  if (filterSearch) filterSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyFilters();
  });
  if (filterSearchBtn) filterSearchBtn.addEventListener('click', applyFilters);

  // Botão carregar mais
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreItems);

  // Fechar modal
  const overlay = document.getElementById('historico-modal-overlay');
  const closeBtn = document.getElementById('historico-modal-close');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeHistoricoModal();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeHistoricoModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHistoricoModal();
  });

  // Integrar com mudança de idioma
  window.addEventListener('storage', (e) => {
    if (e.key === 'dashboard_lang') {
      const lang = e.newValue || 'pt';
      applyHistoricoLanguage(lang);
      applyFilters();
    }
  });

  document.addEventListener('languageChanged', (e) => {
    applyHistoricoLanguage(e.detail.lang);
    applyFilters();
  });

  console.log('%cHistórico carregado!', 'color: #0b4b9b; font-weight: bold;');
});

// ===================== APLICA IDIOMA =====================
function applyHistoricoLanguage(lang) {
  const t = historicoTranslations[lang] || historicoTranslations.pt;

  document.getElementById('historico-title').textContent = t.page_title;
  document.getElementById('historico-subtitle').textContent = t.page_subtitle;

  const typeLabel = document.getElementById('filter-type-label');
  if (typeLabel) typeLabel.textContent = t.filter_type;

  const periodLabel = document.getElementById('filter-period-label');
  if (periodLabel) periodLabel.textContent = t.filter_period;

  // Opções dos selects
  const typeSelect = document.getElementById('filter-type');
  if (typeSelect) {
    const opts = typeSelect.options;
    for (let opt of opts) {
      const val = opt.value;
      if (val === 'all') opt.textContent = t.filter_all;
      else if (val === 'loan') opt.textContent = t.filter_loans;
      else if (val === 'reservation') opt.textContent = t.filter_reservations;
    }
  }

  const periodSelect = document.getElementById('filter-period');
  if (periodSelect) {
    const opts = periodSelect.options;
    for (let opt of opts) {
      const val = opt.value;
      if (val === '30') opt.textContent = t.period_30;
      else if (val === '90') opt.textContent = t.period_90;
      else if (val === '180') opt.textContent = t.period_180;
      else if (val === '365') opt.textContent = t.period_365;
      else if (val === 'all') opt.textContent = t.period_all;
    }
  }

  const searchInput = document.getElementById('filter-search');
  if (searchInput) searchInput.placeholder = t.search_placeholder;

  const emptyMsg = document.getElementById('empty-message');
  if (emptyMsg) emptyMsg.textContent = t.empty_message;

  const loadBtn = document.getElementById('load-more-btn');
  if (loadBtn) loadBtn.textContent = t.load_more;

  // Re-renderizar (os cards serão recriados)
  applyFilters();
}

// Sobrescrever função de tradução do dashboard para incluir histórico
if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function(lang) {
    originalApply(lang);
    applyHistoricoLanguage(lang);
  };
}
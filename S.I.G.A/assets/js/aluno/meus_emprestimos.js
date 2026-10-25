// meus_emprestimos.js

// ===================== TRADUÇÕES =====================
const loansTranslations = {
  pt: {
    loans_title: 'Meus Empréstimos',
    loans_subtitle: 'Acompanhe seus livros, revistas e TCCs emprestados',
    tab_active: 'Ativos',
    tab_history: 'Histórico',
    empty_active: 'Nenhum empréstimo ativo no momento.',
    empty_history: 'Nenhum empréstimo no histórico.',
    status_pending: 'Aguardando aprovação',
    status_refused: 'Recusado',
    status_active: 'Ativo',
    status_overdue: 'Atrasado',
    status_returned: 'Devolvido',
    loan_date: 'Empréstimo: {date}',
    due_date: 'Vencimento: {date}',
    days_left: '{days} dias restantes',
    days_left_one: '1 dia restante',
    days_today: 'Vence hoje',
    days_overdue: '{days} dias atrasado',
    days_overdue_one: '1 dia atrasado',
    loans_search_placeholder: 'Buscar nos seus empréstimos...',
    filter_all: 'Todos',
    filter_livro: 'Livros',
    filter_revista: 'Revistas',
    filter_tcc: 'TCCs',
    sort_recentes: 'Mais recentes',
    sort_antigos: 'Mais antigos',
    sort_vencimento: 'Vencimento próximo',
    sort_titulo_asc: 'Título A-Z',
    sort_titulo_desc: 'Título Z-A',
    view_grid: 'Ver em grade',
    view_list: 'Ver em lista',
    view_grid_label: 'Grade',
    view_list_label: 'Lista',
    no_results_title: 'Nenhum item encontrado',
    no_results_text: 'Nenhum empréstimo corresponde aos filtros atuais.',
    clear_filters: 'Limpar filtros',
    modal_title: 'Detalhes do Empréstimo',
    detail_section: 'Informações do empréstimo',
    detail_loan_date: 'Data do empréstimo',
    detail_due_date: 'Vencimento',
    detail_type: 'Tipo de material',
    detail_code: 'Código',
    detail_close: 'Fechar',
    action_renew: 'Renovar empréstimo',
    action_renewed: 'Empréstimo renovado por mais 15 dias.',
    action_requested: 'Solicitação enviada. Aguarde a conferência da biblioteca.',
    action_failed: 'Não foi possível concluir a ação.',
    type_livro: 'Livro',
    type_revista: 'Revista',
    type_tcc: 'TCC',
    days_block_ok: 'Tempo restante',
    days_block_warning: 'Atenção',
    days_block_danger: 'Atrasado',
    days_block_neutral: 'Situação',
    author_unknown: 'Autor não informado',
  },
  en: {
    loans_title: 'My Loans',
    loans_subtitle: 'Track your books, magazines and theses loans',
    tab_active: 'Active',
    tab_history: 'History',
    empty_active: 'No active loans at the moment.',
    empty_history: 'No loans in history.',
    status_pending: 'Awaiting approval',
    status_refused: 'Refused',
    status_active: 'Active',
    status_overdue: 'Overdue',
    status_returned: 'Returned',
    loan_date: 'Loan: {date}',
    due_date: 'Due: {date}',
    days_left: '{days} days left',
    days_left_one: '1 day left',
    days_today: 'Due today',
    days_overdue: '{days} days overdue',
    days_overdue_one: '1 day overdue',
    loans_search_placeholder: 'Search your loans...',
    filter_all: 'All',
    filter_livro: 'Books',
    filter_revista: 'Magazines',
    filter_tcc: 'Theses',
    sort_recentes: 'Most recent',
    sort_antigos: 'Oldest',
    sort_vencimento: 'Due soon',
    sort_titulo_asc: 'Title A-Z',
    sort_titulo_desc: 'Title Z-A',
    view_grid: 'Grid view',
    view_list: 'List view',
    view_grid_label: 'Grid',
    view_list_label: 'List',
    no_results_title: 'No items found',
    no_results_text: 'No loan matches the current filters.',
    clear_filters: 'Clear filters',
    modal_title: 'Loan Details',
    detail_section: 'Loan information',
    detail_loan_date: 'Loan date',
    detail_due_date: 'Due date',
    detail_type: 'Material type',
    detail_code: 'Code',
    detail_close: 'Close',
    action_renew: 'Renew loan',
    action_renewed: 'Loan renewed for 15 more days.',
    action_requested: 'Request sent. Please wait for the library to verify the return.',
    action_failed: 'The action could not be completed.',
    type_livro: 'Book',
    type_revista: 'Magazine',
    type_tcc: 'Thesis',
    days_block_ok: 'Time left',
    days_block_warning: 'Attention',
    days_block_danger: 'Overdue',
    days_block_neutral: 'Status',
    author_unknown: 'Author not informed',
  },
  es: {
    loans_title: 'Mis Préstamos',
    loans_subtitle: 'Sigue tus libros, revistas y TFCs prestados',
    tab_active: 'Activos',
    tab_history: 'Historial',
    empty_active: 'No hay préstamos activos en este momento.',
    empty_history: 'No hay préstamos en el historial.',
    status_pending: 'Esperando aprobación',
    status_refused: 'Rechazado',
    status_active: 'Activo',
    status_overdue: 'Atrasado',
    status_returned: 'Devuelto',
    loan_date: 'Préstamo: {date}',
    due_date: 'Vencimiento: {date}',
    days_left: '{days} días restantes',
    days_left_one: '1 día restante',
    days_today: 'Vence hoy',
    days_overdue: '{days} días atrasado',
    days_overdue_one: '1 día atrasado',
    loans_search_placeholder: 'Buscar en tus préstamos...',
    filter_all: 'Todos',
    filter_livro: 'Libros',
    filter_revista: 'Revistas',
    filter_tcc: 'Tesis',
    sort_recentes: 'Más recientes',
    sort_antigos: 'Más antiguos',
    sort_vencimento: 'Vence pronto',
    sort_titulo_asc: 'Título A-Z',
    sort_titulo_desc: 'Título Z-A',
    view_grid: 'Ver en cuadrícula',
    view_list: 'Ver en lista',
    view_grid_label: 'Cuadrícula',
    view_list_label: 'Lista',
    no_results_title: 'Ningún elemento encontrado',
    no_results_text: 'Ningún préstamo coincide con los filtros actuales.',
    clear_filters: 'Limpiar filtros',
    modal_title: 'Detalles del Préstamo',
    detail_section: 'Información del préstamo',
    detail_loan_date: 'Fecha del préstamo',
    detail_due_date: 'Vencimiento',
    detail_type: 'Tipo de material',
    detail_code: 'Código',
    detail_close: 'Cerrar',
    action_renew: 'Renovar préstamo',
    action_renewed: 'Préstamo renovado por 15 días más.',
    action_requested: 'Solicitud enviada. Espera la verificación de la biblioteca.',
    action_failed: 'No se pudo completar la acción.',
    type_livro: 'Libro',
    type_revista: 'Revista',
    type_tcc: 'Tesis',
    days_block_ok: 'Tiempo restante',
    days_block_warning: 'Atención',
    days_block_danger: 'Atrasado',
    days_block_neutral: 'Situación',
    author_unknown: 'Autor no informado',
  }
};

if (typeof dashboardTranslations !== 'undefined') {
  for (let lang in loansTranslations) {
    if (dashboardTranslations[lang]) {
      Object.assign(dashboardTranslations[lang], loansTranslations[lang]);
    } else {
      dashboardTranslations[lang] = loansTranslations[lang];
    }
  }
}

// ===================== AUXILIARES =====================
if (typeof window.getCurrentLanguage !== 'function') {
  window.getCurrentLanguage = function () {
    let idioma = localStorage.getItem('siga-idioma');
    if (!idioma) {
      idioma = localStorage.getItem('dashboard_lang');
      if (idioma) {
        localStorage.setItem('siga-idioma', idioma);
        localStorage.removeItem('dashboard_lang');
      }
    }
    return idioma || 'pt';
  };
}

function getTranslation(key, lang, params = {}) {
  const t = loansTranslations[lang] || loansTranslations.pt;
  let text = t[key] || key;
  for (let [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return text;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getDaysBetween(date1, date2) {
  return Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24));
}

/**
 * Normaliza status cru do banco.
 */
function mapStatus(raw) {
  const s = String(raw || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (s.startsWith('devolv') || s.startsWith('finaliz') ||
      s === 'returned'  || s === 'finished' || s === 'entregue') {
    return 'returned';
  }
  if (s.startsWith('recus') || s.startsWith('rejeit') ||
      s === 'refused'   || s === 'rejected') {
    return 'refused';
  }
  if (s.startsWith('atras')  || s === 'overdue' || s === 'late' || s === 'vencido') {
    return 'overdue';
  }
  if (s.startsWith('pend')   || s.startsWith('aguard') ||
      s === 'pending'        || s === 'retirado' || s === 'waiting') {
    return 'pending';
  }
  return 'active';
}

function mapType(raw) {
  const s = String(raw || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (s.startsWith('revist') || s === 'magazine') return 'revista';
  if (s.startsWith('tcc') || s.startsWith('tese') ||
      s.startsWith('thes') || s === 'monografia') return 'tcc';
  return 'livro';
}

// ===================== ESTADO =====================
let loans = [];
const loansState = {
  tab: 'active',
  filter: 'todos',
  search: '',
  sort: 'recentes',
  view: 'grid'
};

// ===================== CARREGAR DADOS =====================
function loadLoans() {
  const lang = getCurrentLanguage();
  const activeContainer = document.getElementById('active-loans');
  const historyContainer = document.getElementById('history-loans');

  const raw = window.emprestimosData || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  loans = raw.map(l => {
    const dueDate = l.data_devolucao_prevista ? new Date(`${l.data_devolucao_prevista}T00:00:00`) : null;
    const status = mapStatus(l.status);
    return {
      id: Number(l.id_emprestimo || l.id),
      title: l.titulo_item || l.title || 'Sem título',
      author: l.autor || l.author || '',
      cover: l.capa_url || l.cover || '',
      type: mapType(l.tipo || l.type),
      loanDate: l.data_emprestimo ? new Date(l.data_emprestimo) : null,
      dueDate,
      status: status === 'active' && dueDate && dueDate < today ? 'overdue' : status,
      rawStatus: l.status,
      renovado: Number(l.renovado) === 1,
    };
  });

  renderLoans();
}

// ===================== RENDERIZAÇÃO =====================
function getCoverColor(index) {
  const colors = ['#0b4b9b', '#17c8cc', '#6a11cb', '#f7971e', '#e91e63', '#11998e', '#4568dc', '#c94b4b'];
  return colors[index % colors.length];
}

function getStatusLabel(status, lang) {
  const map = {
    active:   getTranslation('status_active', lang),
    overdue:  getTranslation('status_overdue', lang),
    returned: getTranslation('status_returned', lang),
    pending:  getTranslation('status_pending', lang),
    refused:  getTranslation('status_refused', lang),
  };
  return map[status] || status;
}

function computeDaysInfo(loan, lang) {
  if (!['active', 'overdue'].includes(loan.status)) return { text: '', cls: 'neutral' };
  if (!loan.dueDate) return { text: '', cls: 'neutral' };

  const now = new Date();
  const days = getDaysBetween(now, loan.dueDate);

  if (days > 7)   return { text: getTranslation('days_left', lang, { days }), cls: 'ok' };
  if (days > 1)   return { text: getTranslation('days_left', lang, { days }), cls: 'warning' };
  if (days === 1) return { text: getTranslation('days_left_one', lang), cls: 'warning' };
  if (days === 0) return { text: getTranslation('days_today', lang), cls: 'warning' };
  const abs = Math.abs(days);
  return {
    text: abs === 1 ? getTranslation('days_overdue_one', lang) : getTranslation('days_overdue', lang, { days: abs }),
    cls: 'danger'
  };
}

function createLoanCard(loan, index, lang) {
  const card = document.createElement('article');
  card.className = 'loan-card';
  card.dataset.id = loan.id;
  card.dataset.tipo = loan.type;
  card.dataset.status = loan.status;

  const isPending = loan.status === 'pending';
  const coverColor = getCoverColor(index);

  let coverHTML;
  if (loan.cover) {
    coverHTML = `<img src="${loan.cover}" alt="${loan.title}" class="loan-cover" loading="lazy">`;
  } else {
    const iconMap = { livro: 'fa-book', revista: 'fa-newspaper', tcc: 'fa-graduation-cap' };
    const icon = iconMap[loan.type] || 'fa-book';
    coverHTML = `
      <div class="loan-cover-placeholder" style="background: linear-gradient(135deg, ${coverColor}, ${coverColor}cc)">
        <i class="fas ${icon}"></i>
      </div>`;
  }

  const typeIcons = { livro: 'fa-book', revista: 'fa-newspaper', tcc: 'fa-graduation-cap' };
  const typeIcon  = typeIcons[loan.type] || 'fa-book';
  const typeLabel = getTranslation('type_' + (typeIcons[loan.type] ? loan.type : 'livro'), lang);
  const statusLabel = getStatusLabel(loan.status, lang);
  const loanDateStr = formatDate(loan.loanDate);
  const dueDateStr  = loan.dueDate ? formatDate(loan.dueDate) : getTranslation('status_pending', lang);
  const daysInfo    = computeDaysInfo(loan, lang);

  card.innerHTML = `
    <div class="loan-cover-wrap">
      ${coverHTML}
      <span class="loan-type-badge tipo-badge type-${loan.type || 'livro'}"><i class="fas ${typeIcon}"></i> ${typeLabel}</span>
      <span class="loan-badge status-${loan.status}">${statusLabel}</span>
    </div>
    <div class="loan-body">
      <h4 class="loan-title" title="${loan.title}">${loan.title}</h4>
      <p class="loan-author">${loan.author || getTranslation('author_unknown', lang)}</p>
      <div class="loan-dates">
        <span><i class="far fa-clock"></i> ${getTranslation('loan_date', lang, { date: loanDateStr })}</span>
        ${!isPending ? `<span><i class="far fa-calendar-check"></i> ${getTranslation('due_date', lang, { date: dueDateStr })}</span>` : ''}
      </div>
      ${daysInfo.text ? `<span class="loan-days ${daysInfo.cls}"><i class="fas fa-clock"></i> ${daysInfo.text}</span>` : ''}
    </div>
  `;

  card.addEventListener('click', () => openLoanModal(loan.id));
  return card;
}

// ===================== FILTRO + SORT =====================
function applyFiltersAndSort(list) {
  const search = loansState.search;
  const filter = loansState.filter;
  const sort   = loansState.sort;

  let filtered = list.filter(l => {
    const tipo   = l.type || '';
    const titulo = (l.title || '').toLowerCase();
    const autor  = (l.author || '').toLowerCase();
    const matchFilter = filter === 'todos' || tipo === filter;
    const matchSearch = !search || titulo.includes(search) || autor.includes(search);
    return matchFilter && matchSearch;
  });

  filtered.sort((a, b) => {
    switch (sort) {
      case 'antigos':
        return (a.loanDate?.getTime() || 0) - (b.loanDate?.getTime() || 0);
      case 'vencimento': {
        const da = a.dueDate?.getTime() || Infinity;
        const db = b.dueDate?.getTime() || Infinity;
        return da - db;
      }
      case 'titulo-asc':
        return (a.title || '').localeCompare(b.title || '', 'pt', { sensitivity: 'base' });
      case 'titulo-desc':
        return (b.title || '').localeCompare(a.title || '', 'pt', { sensitivity: 'base' });
      case 'recentes':
      default:
        return (b.loanDate?.getTime() || 0) - (a.loanDate?.getTime() || 0);
    }
  });

  return filtered;
}

function renderLoans() {
  const activeContainer  = document.getElementById('active-loans');
  const historyContainer = document.getElementById('history-loans');
  const toolbar = document.getElementById('loans-toolbar');
  const noResults = document.getElementById('loans-no-results');
  const lang = getCurrentLanguage();

  // Separa ativos e histórico
  const allActive  = loans.filter(l =>
    l.status === 'active' || l.status === 'overdue' || l.status === 'pending'
  );
  const allHistory = loans.filter(l =>
    l.status === 'returned' || l.status === 'refused'
  );

  // Lista da aba atual
  const sourceList = loansState.tab === 'active' ? allActive : allHistory;

  if (toolbar) toolbar.hidden = loans.length === 0;

  // ========== CONTADORES — APENAS DA ABA ATUAL ==========
  const counts = { todos: sourceList.length, livro: 0, revista: 0, tcc: 0 };
  sourceList.forEach(l => {
    const t = l.type || 'livro';
    if (counts[t] !== undefined) counts[t]++;
  });
  document.querySelectorAll('.loan-chip .chip-count').forEach(el => {
    const key = el.dataset.count;
    if (counts[key] !== undefined) el.textContent = counts[key];
  });
  // =====================================================

  // Tab ativa
  const tabActiveEl  = document.getElementById('tab-active');
  const tabHistoryEl = document.getElementById('tab-history');
  if (tabActiveEl)  tabActiveEl.classList.toggle('active',  loansState.tab === 'active');
  if (tabHistoryEl) tabHistoryEl.classList.toggle('active', loansState.tab === 'history');

  activeContainer.style.display  = loansState.tab === 'active'  ? 'grid' : 'none';
  historyContainer.style.display = loansState.tab === 'history' ? 'grid' : 'none';

  const targetContainer = loansState.tab === 'active' ? activeContainer : historyContainer;
  targetContainer.innerHTML = '';

  // Estado vazio puro
  if (sourceList.length === 0) {
    const emptyKey  = loansState.tab === 'active' ? 'empty_active' : 'empty_history';
    const emptyIcon = loansState.tab === 'active' ? 'fa-book-open' : 'fa-history';
    targetContainer.innerHTML = `<div class="loan-empty"><i class="fas ${emptyIcon}"></i><p>${getTranslation(emptyKey, lang)}</p></div>`;
    if (noResults) noResults.hidden = true;
    targetContainer.classList.remove('list-view');
    return;
  }

  const filtered = applyFiltersAndSort(sourceList);
  targetContainer.classList.toggle('list-view', loansState.view === 'list');

  if (filtered.length === 0) {
    if (noResults) noResults.hidden = false;
    targetContainer.style.display = 'none';
    return;
  }

  if (noResults) noResults.hidden = true;
  targetContainer.style.display = 'grid';

  filtered.forEach((loan, idx) => {
    targetContainer.appendChild(createLoanCard(loan, idx, lang));
  });
}

// ===================== MODAL DE DETALHES =====================
function openLoanModal(id) {
  const loan = loans.find(l => String(l.id) === String(id));
  if (!loan) return;

  const lang = getCurrentLanguage();
  const overlay   = document.getElementById('loan-modal-overlay');
  const content   = document.getElementById('loan-modal-content');
  const cancelBtn = document.getElementById('loan-modal-cancel');

  const statusLabel = getStatusLabel(loan.status, lang);
  const loanDate = formatDate(loan.loanDate);
  const dueDate  = formatDate(loan.dueDate);
  const daysInfo = computeDaysInfo(loan, lang);
  const typeLabel = getTranslation('type_' + loan.type, lang);

  const iconMap = { livro: 'fa-book', revista: 'fa-newspaper', tcc: 'fa-graduation-cap' };
  const coverIcon = iconMap[loan.type] || 'fa-book';

  let coverHTML = loan.cover
    ? `<img src="${loan.cover}" alt="${loan.title}">`
    : `<div class="loan-detail-cover-ph"><i class="fas ${coverIcon}"></i></div>`;

  let daysBlockHTML = '';
  if (daysInfo.text) {
    const label = getTranslation('days_block_' + daysInfo.cls, lang);
    const icon = daysInfo.cls === 'danger'  ? 'fa-triangle-exclamation'
               : daysInfo.cls === 'warning' ? 'fa-hourglass-half'
               : daysInfo.cls === 'ok'      ? 'fa-circle-check'
               : 'fa-circle-info';
    daysBlockHTML = `
      <div class="loan-detail-days ${daysInfo.cls}">
        <i class="fas ${icon}"></i>
        <div class="loan-detail-days-text">
          <small>${label}</small>
          <span>${daysInfo.text}</span>
        </div>
      </div>
    `;
  }

  const showDue = loan.dueDate ? dueDate : getTranslation('status_pending', lang);

  content.innerHTML = `
    <div class="loan-detail-hero">
      <div class="loan-detail-cover">${coverHTML}</div>
      <div class="loan-detail-head">
        <span class="loan-detail-status status-${loan.status}">
          <i class="fas fa-circle"></i> ${statusLabel}
        </span>
        <h3>${loan.title}</h3>
        <p class="loan-detail-author">
          <i class="fas fa-user-pen"></i> ${loan.author || getTranslation('author_unknown', lang)}
        </p>
      </div>
    </div>

    <div class="loan-detail-body">
      <p class="loan-detail-section-title">
        <i class="fas fa-circle-info"></i> ${getTranslation('detail_section', lang)}
      </p>

      <div class="loan-detail-grid">
        <div class="loan-detail-item">
          <span class="loan-detail-label"><i class="far fa-calendar-alt"></i> ${getTranslation('detail_loan_date', lang)}</span>
          <span class="loan-detail-value">${loanDate || '—'}</span>
        </div>
        <div class="loan-detail-item">
          <span class="loan-detail-label"><i class="far fa-calendar-check"></i> ${getTranslation('detail_due_date', lang)}</span>
          <span class="loan-detail-value">${showDue || '—'}</span>
        </div>
        <div class="loan-detail-item">
          <span class="loan-detail-label"><i class="fas fa-bookmark"></i> ${getTranslation('detail_type', lang)}</span>
          <span class="loan-detail-value">${typeLabel}</span>
        </div>
        <div class="loan-detail-item">
          <span class="loan-detail-label"><i class="fas fa-hashtag"></i> ${getTranslation('detail_code', lang)}</span>
          <span class="loan-detail-value">#${String(loan.id).padStart(4, '0')}</span>
        </div>
      </div>

      ${daysBlockHTML}
    </div>
  `;

  if (cancelBtn) {
    cancelBtn.onclick = closeLoanModal;
    cancelBtn.textContent = getTranslation('detail_close', lang);
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLoanModal() {
  const overlay = document.getElementById('loan-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function setLoanFilter(chips, filter) {
  chips.forEach(chip => {
    const active = chip.dataset.filter === filter;
    chip.classList.toggle('active', active);
    chip.disabled = active;
    chip.setAttribute('aria-pressed', String(active));
  });
}

// ===================== TOOLBAR =====================
function initLoansToolbar() {
  const toolbar = document.getElementById('loans-toolbar');
  if (!toolbar) return;

  const searchInput  = document.getElementById('loans-search-input');
  const chips        = toolbar.querySelectorAll('.loan-chip');
  const sortSelect   = document.getElementById('loans-sort-select');
  const viewButtons  = toolbar.querySelectorAll('.loans-view-toggle button');
  const clearBtn     = document.getElementById('loans-clear-filters');

  setLoanFilter(chips, loansState.filter);

  if (searchInput) {
    let t;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(t);
      const value = e.target.value;
      t = setTimeout(() => {
        loansState.search = value.trim().toLowerCase();
        renderLoans();
      }, 180);
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      loansState.filter = chip.dataset.filter;
      setLoanFilter(chips, loansState.filter);
      renderLoans();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      loansState.sort = e.target.value;
      renderLoans();
    });
  }

  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      loansState.view = btn.dataset.view;
      viewButtons.forEach(b => {
        const active = b.dataset.view === loansState.view;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      try { localStorage.setItem('loans_view', loansState.view); } catch (e) {}
      renderLoans();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      loansState.filter = 'todos';
      loansState.search = '';
      if (searchInput) searchInput.value = '';
      setLoanFilter(chips, loansState.filter);
      renderLoans();
    });
  }

  try {
    const saved = localStorage.getItem('loans_view');
    if (saved === 'list' || saved === 'grid') {
      loansState.view = saved;
      viewButtons.forEach(b => {
        const active = b.dataset.view === saved;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
  } catch (e) {}
}

// ===================== IDIOMA =====================
function applyLoansLanguage(lang) {
  const dict = loansTranslations[lang] || loansTranslations.pt;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key]) {
      el.title = dict[key];
      el.setAttribute('aria-label', dict[key]);
    }
  });

  if (loans.length > 0) renderLoans();
}

if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function (lang) {
    originalApply(lang);
    applyLoansLanguage(lang);
  };
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  applyLoansLanguage(getCurrentLanguage());
  initLoansToolbar();
  loadLoans();

  const tabActiveEl  = document.getElementById('tab-active');
  const tabHistoryEl = document.getElementById('tab-history');
  if (tabActiveEl) {
    tabActiveEl.addEventListener('click', () => {
      loansState.tab = 'active';
      renderLoans();
    });
  }
  if (tabHistoryEl) {
    tabHistoryEl.addEventListener('click', () => {
      loansState.tab = 'history';
      renderLoans();
    });
  }

  const overlay  = document.getElementById('loan-modal-overlay');
  const closeBtn = document.getElementById('loan-modal-close');
  if (overlay)  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLoanModal(); });
  if (closeBtn) closeBtn.addEventListener('click', closeLoanModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLoanModal(); });

  document.addEventListener('languageChanged', (e) => applyLoansLanguage(e.detail.lang));
  window.addEventListener('storage', (e) => {
    if (e.key === 'siga-idioma') applyLoansLanguage(e.newValue || 'pt');
  });

  console.log('%cMeus Empréstimos SiGA ITJ carregado!', 'color: #0b4b9b; font-weight: bold;');
});
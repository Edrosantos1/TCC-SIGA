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
    renew: 'Renovar',
    renew_disabled: 'Indisponível',
    return: 'Devolver',
    modal_title: 'Detalhes do Empréstimo',
    modal_renew_title: 'Renovar empréstimo',
    modal_return_title: 'Devolver item',
    modal_renew_confirm: 'Deseja renovar este empréstimo? A nova data de vencimento será {newDate}.',
    modal_return_confirm: 'Tem certeza que deseja devolver este item?',
    feedback_renewed: 'Empréstimo renovado com sucesso! Nova data: {newDate}',
    feedback_returned: 'Item devolvido com sucesso!',
    feedback_error: 'Erro ao processar ação. Tente novamente.',
    loading: 'Carregando empréstimos...',
    error: 'Erro ao carregar empréstimos. Tente novamente.',
    search_placeholder: 'Buscar nos seus empréstimos...',
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
    no_results_title: 'Nenhum item encontrado',
    no_results_text: 'Nenhum empréstimo corresponde aos filtros atuais.',
    clear_filters: 'Limpar filtros',
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
    renew: 'Renew',
    renew_disabled: 'Unavailable',
    return: 'Return',
    modal_title: 'Loan Details',
    modal_renew_title: 'Renew loan',
    modal_return_title: 'Return item',
    modal_renew_confirm: 'Do you want to renew this loan? The new due date will be {newDate}.',
    modal_return_confirm: 'Are you sure you want to return this item?',
    feedback_renewed: 'Loan renewed successfully! New date: {newDate}',
    feedback_returned: 'Item returned successfully!',
    feedback_error: 'Error processing action. Please try again.',
    loading: 'Loading loans...',
    error: 'Error loading loans. Please try again.',
    search_placeholder: 'Search your loans...',
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
    no_results_title: 'No items found',
    no_results_text: 'No loan matches the current filters.',
    clear_filters: 'Clear filters',
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
    renew: 'Renovar',
    renew_disabled: 'No disponible',
    return: 'Devolver',
    modal_title: 'Detalles del Préstamo',
    modal_renew_title: 'Renovar préstamo',
    modal_return_title: 'Devolver ítem',
    modal_renew_confirm: '¿Desea renovar este préstamo? La nueva fecha de vencimiento será {newDate}.',
    modal_return_confirm: '¿Está seguro que desea devolver este ítem?',
    feedback_renewed: '¡Préstamo renovado con éxito! Nueva fecha: {newDate}',
    feedback_returned: '¡Ítem devuelto con éxito!',
    feedback_error: 'Error al procesar la acción. Intente nuevamente.',
    loading: 'Cargando préstamos...',
    error: 'Error al cargar préstamos. Intente de nuevo.',
    search_placeholder: 'Buscar en tus préstamos...',
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
    no_results_title: 'Ningún elemento encontrado',
    no_results_text: 'Ningún préstamo coincide con los filtros actuales.',
    clear_filters: 'Limpiar filtros',
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
    return localStorage.getItem('dashboard_lang') || 'pt';
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

if (typeof window.showFeedbackMessage !== 'function') {
  window.showFeedbackMessage = function (message) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
      position: fixed; bottom: 20px; left: 50%;
      transform: translateX(-50%); background: #0b4b9b;
      color: white; padding: 12px 24px; border-radius: 10px;
      z-index: 100000; box-shadow: 0 8px 24px rgba(11,75,155,0.25);
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    document.body.appendChild(msgDiv);
    setTimeout(() => {
      msgDiv.style.opacity = '0';
      msgDiv.style.transform = 'translateX(-50%) translateY(8px)';
      setTimeout(() => msgDiv.remove(), 400);
    }, 2400);
  };
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
async function fetchLoans() {
  const lang = getCurrentLanguage();
  const activeContainer = document.getElementById('active-loans');
  const historyContainer = document.getElementById('history-loans');

  if (activeContainer) {
    activeContainer.innerHTML = `<div class="loan-empty"><i class="fas fa-spinner fa-pulse"></i><p>${getTranslation('loading', lang)}</p></div>`;
  }
  if (historyContainer) {
    historyContainer.innerHTML = `<div class="loan-empty"><i class="fas fa-spinner fa-pulse"></i><p>${getTranslation('loading', lang)}</p></div>`;
  }

  try {
    const apiUrl = '../api/aluno_emprestimos.php';
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const loanRows = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);

    loans = loanRows.map(l => ({
      ...l,
      loanDate: l.loanDate ? new Date(l.loanDate) : null,
      dueDate: l.dueDate ? new Date(l.dueDate) : null,
    }));

    const now = new Date();
    loans.forEach(l => {
      if (l.status !== 'returned' && l.status !== 'pending' && l.status !== 'refused' && l.dueDate && l.dueDate < now) {
        l.status = 'overdue';
      }
    });

    renderLoans();
  } catch (error) {
    console.error('Erro ao carregar empréstimos:', error);
    if (activeContainer) {
      activeContainer.innerHTML = `<div class="loan-empty"><i class="fas fa-exclamation-triangle"></i><p>${getTranslation('error', lang)}</p></div>`;
    }
  }
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

  if (days > 7)  return { text: getTranslation('days_left', lang, { days }), cls: 'ok' };
  if (days > 0)  return { text: days === 1 ? getTranslation('days_left_one', lang) : getTranslation('days_left', lang, { days }), cls: 'warning' };
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
  card.dataset.tipo = loan.type || 'livro';
  card.dataset.titulo = loan.title || '';
  card.dataset.autor = loan.author || '';
  card.dataset.status = loan.status;
  card.dataset.data = loan.loanDate ? loan.loanDate.getTime() : 0;
  card.dataset.due = loan.dueDate ? loan.dueDate.getTime() : 0;

  const isActive = loan.status === 'active' || loan.status === 'overdue';
  const isPending = loan.status === 'pending';
  const coverColor = getCoverColor(index);

  // Capa
  let coverHTML;
  if (loan.cover) {
    coverHTML = `<img src="${loan.cover}" alt="${loan.title}" class="loan-cover" loading="lazy">`;
  } else {
    const iconMap = { livro: 'fa-book', revista: 'fa-newspaper', tcc: 'fa-graduation-cap' };
    const icon = iconMap[loan.type] || 'fa-book';
    coverHTML = `
      <div class="loan-cover-placeholder" style="background: ${coverColor}">
        <i class="fas ${icon}"></i>
      </div>`;
  }

  // Status badge
  const statusLabel = getStatusLabel(loan.status, lang);
  const statusClass = loan.status; // active|overdue|pending|returned|refused

  // Datas
  const loanDateStr = formatDate(loan.loanDate);
  const dueDateStr = loan.dueDate ? formatDate(loan.dueDate) : getTranslation('status_pending', lang);

  // Dias restantes
  const daysInfo = computeDaysInfo(loan, lang);

  // Ações
  let actionsHTML = '';
  if (isActive) {
    const canRenew = !loan.renovado && loan.status !== 'overdue';
    actionsHTML = `
      <div class="loan-actions">
        <button class="btn-renew" ${!canRenew ? 'disabled' : ''} data-action="renew">
          ${canRenew ? getTranslation('renew', lang) : getTranslation('renew_disabled', lang)}
        </button>
        <button class="btn-return" data-action="return">
          ${getTranslation('return', lang)}
        </button>
      </div>`;
  }

  card.innerHTML = `
    <div class="loan-cover-wrap">
      ${coverHTML}
      <span class="loan-badge status-${statusClass}">${statusLabel}</span>
    </div>
    <div class="loan-body">
      <h4 class="loan-title" title="${loan.title}">${loan.title}</h4>
      <p class="loan-author">${loan.author || 'Autor não informado'}</p>
      <div class="loan-dates">
        <span><i class="far fa-calendar-alt"></i> ${isPending ? getTranslation('loan_date', lang, { date: loanDateStr }) : getTranslation('loan_date', lang, { date: loanDateStr })}</span>
        ${!isPending ? `<span><i class="far fa-calendar-check"></i> ${getTranslation('due_date', lang, { date: dueDateStr })}</span>` : ''}
      </div>
      ${daysInfo.text ? `<span class="loan-days ${daysInfo.cls}"><i class="fas fa-clock"></i> ${daysInfo.text}</span>` : ''}
    </div>
    ${actionsHTML}
  `;

  const renewBtn = card.querySelector('.btn-renew');
  if (renewBtn && !renewBtn.disabled) {
    renewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLoanModal(loan.id, 'renew');
    });
  }

  const returnBtn = card.querySelector('.btn-return');
  if (returnBtn) {
    returnBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLoanModal(loan.id, 'return');
    });
  }

  card.addEventListener('click', () => openLoanModal(loan.id, 'view'));

  return card;
}

// ===================== FILTRO + SORT + VIEW =====================
function applyFiltersAndSort(container, list, lang) {
  const search = loansState.search;
  const filter = loansState.filter;
  const sort = loansState.sort;

  let filtered = list.filter(l => {
    const tipo = l.type || '';
    const titulo = (l.title || '').toLowerCase();
    const autor = (l.author || '').toLowerCase();
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
  const activeContainer = document.getElementById('active-loans');
  const historyContainer = document.getElementById('history-loans');
  const toolbar = document.getElementById('loans-toolbar');
  const noResults = document.getElementById('loans-no-results');
  const lang = getCurrentLanguage();

  const allActive = loans.filter(l => ['active', 'overdue', 'pending'].includes(l.status));
  const allHistory = loans.filter(l => ['returned', 'refused'].includes(l.status));

  // Mostra toolbar se há QUALQUER empréstimo
  if (toolbar) toolbar.hidden = loans.length === 0;

  // Contadores por tipo (baseado no conjunto atual — ativos + histórico)
  const counts = { todos: loans.length, livro: 0, revista: 0, tcc: 0 };
  loans.forEach(l => {
    const t = l.type || 'livro';
    if (counts[t] !== undefined) counts[t]++;
  });
  document.querySelectorAll('.loan-chip .chip-count').forEach(el => {
    const key = el.dataset.count;
    if (counts[key] !== undefined) el.textContent = counts[key];
  });

  // Tab ativa
  document.getElementById('tab-active').classList.toggle('active', loansState.tab === 'active');
  document.getElementById('tab-history').classList.toggle('active', loansState.tab === 'history');
  activeContainer.style.display = loansState.tab === 'active' ? 'grid' : 'none';
  historyContainer.style.display = loansState.tab === 'history' ? 'grid' : 'none';

  // Determina a lista da tab atual
  const sourceList = loansState.tab === 'active' ? allActive : allHistory;
  const targetContainer = loansState.tab === 'active' ? activeContainer : historyContainer;

  targetContainer.innerHTML = '';

  // Empty state puro (sem empréstimos nessa categoria)
  if (sourceList.length === 0) {
    const emptyKey = loansState.tab === 'active' ? 'empty_active' : 'empty_history';
    const emptyIcon = loansState.tab === 'active' ? 'fa-book-open' : 'fa-history';
    targetContainer.innerHTML = `<div class="loan-empty"><i class="fas ${emptyIcon}"></i><p>${getTranslation(emptyKey, lang)}</p></div>`;
    if (noResults) noResults.hidden = true;
    targetContainer.classList.toggle('list-view', false);
    return;
  }

  // Filtra + ordena
  const filtered = applyFiltersAndSort(targetContainer, sourceList, lang);

  // Aplica view
  targetContainer.classList.toggle('list-view', loansState.view === 'list');

  // Aplica filtros: se nada passou, mostra o "no-results"
  if (filtered.length === 0) {
    if (noResults) noResults.hidden = false;
    targetContainer.style.display = 'none';
    return;
  }

  if (noResults) noResults.hidden = true;

  filtered.forEach((loan, idx) => {
    targetContainer.appendChild(createLoanCard(loan, idx, lang));
  });
}

// ===================== AÇÕES =====================
async function renewLoan(id) {
  const lang = getCurrentLanguage();
  const loan = loans.find(l => String(l.id) === String(id));
  if (!loan) return;
  if (loan.renovado || loan.status === 'overdue' || loan.status === 'returned') {
    window.showFeedbackMessage(getTranslation('feedback_error', lang));
    return;
  }

  try {
    const response = await fetch('../api/aluno_emprestimos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'renew', id: id })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao renovar');

    window.showFeedbackMessage(getTranslation('feedback_renewed', lang, { newDate: formatDate(data.new_due) }));
    await fetchLoans();
  } catch (error) {
    console.error(error);
    window.showFeedbackMessage(getTranslation('feedback_error', lang));
  }
}

async function returnLoan(id) {
  const lang = getCurrentLanguage();
  const loan = loans.find(l => String(l.id) === String(id));
  if (!loan || loan.status === 'returned') return;

  try {
    const response = await fetch('../api/aluno_emprestimos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'return', id: id })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao devolver');

    window.showFeedbackMessage(getTranslation('feedback_returned', lang));
    await fetchLoans();
  } catch (error) {
    console.error(error);
    window.showFeedbackMessage(getTranslation('feedback_error', lang));
  }
}

// ===================== MODAL =====================
function openLoanModal(id, action) {
  const loan = loans.find(l => String(l.id) === String(id));
  if (!loan) return;

  const lang = getCurrentLanguage();
  const overlay = document.getElementById('loan-modal-overlay');
  const title = document.getElementById('loan-modal-title');
  const body = document.getElementById('loan-modal-body');
  const renewBtn = document.getElementById('loan-renew-btn');
  const returnBtn = document.getElementById('loan-return-btn');

  title.textContent = getTranslation('modal_title', lang);

  const loanDate = formatDate(loan.loanDate);
  const dueDate = formatDate(loan.dueDate);

  body.innerHTML = `
    <p><strong>${loan.title}</strong> — ${loan.author || 'Autor não informado'}</p>
    <p><strong>${getTranslation('loan_date', lang, { date: '' })}</strong> ${loanDate}</p>
    <p><strong>${getTranslation('due_date', lang, { date: '' })}</strong> ${loan.status === 'pending' ? getTranslation('status_pending', lang) : dueDate}</p>
    <p><strong>Status:</strong> ${getStatusLabel(loan.status, lang)}</p>
  `;

  // RENOVAR
  if (action === 'renew' && loan.status !== 'returned' && !loan.renovado && loan.status !== 'overdue') {
    const newDue = new Date();
    newDue.setDate(newDue.getDate() + 15);
    const confirmMsg = getTranslation('modal_renew_confirm', lang, { newDate: formatDate(newDue) });
    renewBtn.style.display = 'inline-block';
    renewBtn.onclick = async () => {
      const ok = window.uiConfirm
        ? await window.uiConfirm(confirmMsg, {
            titulo: getTranslation('modal_renew_title', lang),
            tipo: 'question',
            textoConfirmar: getTranslation('renew', lang),
            textoCancelar: 'Cancelar'
          })
        : confirm(confirmMsg);
      if (ok) {
        renewLoan(id);
        closeLoanModal();
      }
    };
  } else {
    renewBtn.style.display = 'none';
  }

  // DEVOLVER
  if (action === 'return' && loan.status !== 'returned') {
    const confirmMsg = getTranslation('modal_return_confirm', lang);
    returnBtn.style.display = 'inline-block';
    returnBtn.onclick = async () => {
      const ok = window.uiConfirm
        ? await window.uiConfirm(confirmMsg, {
            titulo: getTranslation('modal_return_title', lang),
            tipo: 'warning',
            textoConfirmar: getTranslation('return', lang),
            textoCancelar: 'Cancelar'
          })
        : confirm(confirmMsg);
      if (ok) {
        returnLoan(id);
        closeLoanModal();
      }
    };
  } else {
    returnBtn.style.display = 'none';
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

// ===================== TOOLBAR =====================
function initLoansToolbar() {
  const toolbar = document.getElementById('loans-toolbar');
  if (!toolbar) return;

  const searchInput = document.getElementById('loans-search-input');
  const chips = toolbar.querySelectorAll('.loan-chip');
  const sortSelect = document.getElementById('loans-sort-select');
  const viewButtons = toolbar.querySelectorAll('.loans-view-toggle button');
  const clearBtn = document.getElementById('loans-clear-filters');

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
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loansState.filter = chip.dataset.filter;
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
      chips.forEach(c => c.classList.toggle('active', c.dataset.filter === 'todos'));
      renderLoans();
    });
  }

  // Restaura view salva
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

  renderLoans();
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
  fetchLoans();

  document.getElementById('tab-active').addEventListener('click', () => {
    loansState.tab = 'active';
    renderLoans();
  });
  document.getElementById('tab-history').addEventListener('click', () => {
    loansState.tab = 'history';
    renderLoans();
  });

  const overlay = document.getElementById('loan-modal-overlay');
  const closeBtn = document.getElementById('loan-modal-close');
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLoanModal(); });
  if (closeBtn) closeBtn.addEventListener('click', closeLoanModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLoanModal(); });

  document.addEventListener('languageChanged', (e) => applyLoansLanguage(e.detail.lang));
  window.addEventListener('storage', (e) => {
    if (e.key === 'dashboard_lang') applyLoansLanguage(e.newValue || 'pt');
  });

  console.log('%cMeus Empréstimos SiGA ITJ carregado!', 'color: #0b4b9b; font-weight: bold;');
});
// meus_emprestimos.js
// ===================== DADOS VINDOS DA API =====================
let loans = [];
let currentTab = 'active';
let currentLoanId = null;

// ===================== TRADUÇÕES =====================
const loansTranslations = {
  pt: {
    loans_title: 'Meus Empréstimos',
    loans_subtitle: 'Acompanhe seus livros, revistas e TCCs emprestados',
    tab_active: 'Ativos',
    tab_history: 'Histórico',
    empty_active: 'Nenhum empréstimo ativo no momento.',
    empty_history: 'Nenhum empréstimo no histórico.',
    status_active: 'Ativo',
    status_overdue: 'Atrasado',
    status_returned: 'Devolvido',
    loan_date: 'Empréstimo: {date}',
    due_date: 'Vencimento: {date}',
    return_date: 'Devolução: {date}',
    days_left: '{days} dias restantes',
    days_overdue: '{days} dias atrasado',
    renew: 'Renovar',
    renew_disabled: 'Renovação indisponível',
    return: 'Devolver',
    return_disabled: 'Já devolvido',
    modal_title: 'Detalhes do Empréstimo',
    modal_renew_confirm: 'Deseja renovar este empréstimo? A nova data de vencimento será {newDate}.',
    modal_return_confirm: 'Tem certeza que deseja devolver este item?',
    feedback_renewed: 'Empréstimo renovado com sucesso! Nova data: {newDate}',
    feedback_returned: 'Item devolvido com sucesso!',
    feedback_error: 'Erro ao processar ação. Tente novamente.',
    days: 'dias',
    day: 'dia',
    loading: 'Carregando empréstimos...',
    error: 'Erro ao carregar empréstimos. Tente novamente.',
  },
  en: {
    loans_title: 'My Loans',
    loans_subtitle: 'Track your books, magazines and theses loans',
    tab_active: 'Active',
    tab_history: 'History',
    empty_active: 'No active loans at the moment.',
    empty_history: 'No loans in history.',
    status_active: 'Active',
    status_overdue: 'Overdue',
    status_returned: 'Returned',
    loan_date: 'Loan: {date}',
    due_date: 'Due: {date}',
    return_date: 'Return: {date}',
    days_left: '{days} days left',
    days_overdue: '{days} days overdue',
    renew: 'Renew',
    renew_disabled: 'Renewal unavailable',
    return: 'Return',
    return_disabled: 'Already returned',
    modal_title: 'Loan Details',
    modal_renew_confirm: 'Do you want to renew this loan? The new due date will be {newDate}.',
    modal_return_confirm: 'Are you sure you want to return this item?',
    feedback_renewed: 'Loan renewed successfully! New date: {newDate}',
    feedback_returned: 'Item returned successfully!',
    feedback_error: 'Error processing action. Please try again.',
    days: 'days',
    day: 'day',
    loading: 'Loading loans...',
    error: 'Error loading loans. Please try again.',
  },
  es: {
    loans_title: 'Mis Préstamos',
    loans_subtitle: 'Sigue tus libros, revistas y TFCs prestados',
    tab_active: 'Activos',
    tab_history: 'Historial',
    empty_active: 'No hay préstamos activos en este momento.',
    empty_history: 'No hay préstamos en el historial.',
    status_active: 'Activo',
    status_overdue: 'Atrasado',
    status_returned: 'Devuelto',
    loan_date: 'Préstamo: {date}',
    due_date: 'Vencimiento: {date}',
    return_date: 'Devolución: {date}',
    days_left: '{days} días restantes',
    days_overdue: '{days} días atrasado',
    renew: 'Renovar',
    renew_disabled: 'Renovación no disponible',
    return: 'Devolver',
    return_disabled: 'Ya devuelto',
    modal_title: 'Detalles del Préstamo',
    modal_renew_confirm: '¿Desea renovar este préstamo? La nueva fecha de vencimiento será {newDate}.',
    modal_return_confirm: '¿Está seguro que desea devolver este ítem?',
    feedback_renewed: '¡Préstamo renovado con éxito! Nueva fecha: {newDate}',
    feedback_returned: '¡Ítem devuelto con éxito!',
    feedback_error: 'Error al procesar la acción. Intente nuevamente.',
    days: 'días',
    day: 'día',
    loading: 'Cargando préstamos...',
    error: 'Error al cargar préstamos. Intente de nuevo.',
  }
};

// Mesclar com as traduções do dashboard
if (typeof dashboardTranslations !== 'undefined') {
  for (let lang in loansTranslations) {
    if (dashboardTranslations[lang]) {
      Object.assign(dashboardTranslations[lang], loansTranslations[lang]);
    } else {
      dashboardTranslations[lang] = loansTranslations[lang];
    }
  }
}

// ===================== FUNÇÕES AUXILIARES =====================
function getCurrentLanguage() {
  return localStorage.getItem('dashboard_lang') || 'pt';
}

function getTranslation(key, lang, params = {}) {
  const t = loansTranslations[lang] || loansTranslations.pt;
  let text = t[key] || key;
  for (let [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return text;
}

// ===================== GARANTIR FUNÇÃO DE FEEDBACK =====================
if (typeof window.showFeedbackMessage !== 'function') {
  window.showFeedbackMessage = function(message) {
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
  };
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getDaysBetween(date1, date2) {
  const diff = Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24));
  return diff;
}

// ===================== CARREGAR DADOS DA API =====================
async function fetchLoans() {
  const activeContainer = document.getElementById('active-loans');
  const historyContainer = document.getElementById('history-loans');
  const empty = document.getElementById('loans-empty');
  const lang = getCurrentLanguage();

  // Mostra carregamento
  if (activeContainer) {
    activeContainer.innerHTML = `<div class="loan-empty"><i class="fas fa-spinner fa-pulse"></i> ${getTranslation('loading', lang)}</div>`;
  }
  if (historyContainer) {
    historyContainer.innerHTML = `<div class="loan-empty"><i class="fas fa-spinner fa-pulse"></i> ${getTranslation('loading', lang)}</div>`;
  }
  if (empty) empty.style.display = 'none';

  try {
    // 🔥 CAMINHO ABSOLUTO CORRETO
    const response = await fetch('/S.I.G.A/api/emprestimos.php', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin',
    });

    // 🔍 LOG PARA DEPURAÇÃO
    const text = await response.text();
    console.log('Resposta bruta do servidor:', text);

    // Tenta parsear manualmente
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Falha ao parsear JSON:', parseError);
      throw new Error('Resposta não é JSON válido');
    }

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    if (data.error) throw new Error(data.error);

    // Converte datas strings para objetos Date
    loans = data.map(l => ({
      ...l,
      loanDate: new Date(l.loanDate),
      dueDate: new Date(l.dueDate),
      returnDate: l.returnDate ? new Date(l.returnDate) : null,
    }));

    // Salva no localStorage para cache
    saveLoans();

    renderLoans();
    console.log('Empréstimos carregados com sucesso!', loans.length, 'itens');
  } catch (error) {
    console.error('Erro ao carregar empréstimos:', error);
    window.showFeedbackMessage(getTranslation('error', lang));
    if (activeContainer) {
      activeContainer.innerHTML = `<div class="loan-empty"><i class="fas fa-exclamation-triangle"></i> ${getTranslation('error', lang)}</div>`;
    }
  }
}

// ===================== LOCAL STORAGE (cache) =====================
function saveLoans() {
  const toStore = loans.map(l => ({
    ...l,
    loanDate: l.loanDate.toISOString(),
    dueDate: l.dueDate.toISOString(),
    returnDate: l.returnDate ? l.returnDate.toISOString() : null,
  }));
  localStorage.setItem('loans_data', JSON.stringify(toStore));
}

function loadLoansFromCache() {
  const stored = localStorage.getItem('loans_data');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      loans = parsed.map(l => ({
        ...l,
        loanDate: new Date(l.loanDate),
        dueDate: new Date(l.dueDate),
        returnDate: l.returnDate ? new Date(l.returnDate) : null,
      }));
      return true;
    } catch (e) { console.warn('Erro ao carregar cache', e); }
  }
  return false;
}

// ===================== RENDERIZAÇÃO =====================
function getCoverColor(index) {
  const colors = ['#0b4b9b', '#17c8cc', '#6a11cb', '#f7971e', '#e91e63', '#11998e', '#4568dc', '#c94b4b'];
  return colors[index % colors.length];
}

function getStatusLabel(status, lang) {
  const map = {
    active: getTranslation('status_active', lang),
    overdue: getTranslation('status_overdue', lang),
    returned: getTranslation('status_returned', lang),
  };
  return map[status] || status;
}

function renderLoans() {
  const activeContainer = document.getElementById('active-loans');
  const historyContainer = document.getElementById('history-loans');
  const empty = document.getElementById('loans-empty');
  const lang = getCurrentLanguage();

  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const historyLoans = loans.filter(l => l.status === 'returned');

  // Renderizar ativos
  activeContainer.innerHTML = '';
  if (activeLoans.length === 0) {
    activeContainer.innerHTML = `<div class="loan-empty"><i class="fas fa-book-open"></i><p>${getTranslation('empty_active', lang)}</p></div>`;
  } else {
    activeLoans.forEach((loan, idx) => {
      const card = createLoanCard(loan, idx, lang);
      activeContainer.appendChild(card);
    });
  }

  // Renderizar histórico
  historyContainer.innerHTML = '';
  if (historyLoans.length === 0) {
    historyContainer.innerHTML = `<div class="loan-empty"><i class="fas fa-history"></i><p>${getTranslation('empty_history', lang)}</p></div>`;
  } else {
    historyLoans.forEach((loan, idx) => {
      const card = createLoanCard(loan, idx, lang);
      historyContainer.appendChild(card);
    });
  }

  // Controle de abas
  const activeTab = document.getElementById('tab-active');
  const historyTab = document.getElementById('tab-history');
  if (currentTab === 'active') {
    activeContainer.style.display = 'flex';
    historyContainer.style.display = 'none';
    activeTab.classList.add('active');
    historyTab.classList.remove('active');
  } else {
    activeContainer.style.display = 'none';
    historyContainer.style.display = 'flex';
    historyTab.classList.add('active');
    activeTab.classList.remove('active');
  }

  if (empty) empty.style.display = 'none';
}

function createLoanCard(loan, index, lang) {
  const card = document.createElement('div');
  card.className = 'loan-card';
  card.dataset.id = loan.id;

  const isOverdue = loan.status === 'overdue';
  const isActive = loan.status === 'active' || isOverdue;
  const coverColor = getCoverColor(index);

  let coverHTML;
  if (loan.cover) {
    coverHTML = `<img src="${loan.cover}" alt="${loan.title}" class="loan-cover">`;
  } else {
    coverHTML = `
      <div class="loan-cover-placeholder" style="background: ${coverColor}">
        <i class="fas ${loan.type === 'book' ? 'fa-book' : loan.type === 'magazine' ? 'fa-newspaper' : 'fa-graduation-cap'}"></i>
      </div>
    `;
  }

  const now = new Date();
  let daysInfo = '';
  if (isActive) {
    const days = getDaysBetween(now, loan.dueDate);
    if (days > 0) {
      daysInfo = getTranslation('days_left', lang, { days });
    } else if (days === 0) {
      daysInfo = 'Vence hoje';
    } else {
      daysInfo = getTranslation('days_overdue', lang, { days: Math.abs(days) });
    }
  }

  const statusLabel = getStatusLabel(loan.status, lang);
  const statusClass = loan.status === 'overdue' ? 'overdue' : (loan.status === 'returned' ? 'returned' : 'active');

  const loanDateStr = formatDate(loan.loanDate);
  const dueDateStr = formatDate(loan.dueDate);
  const returnDateStr = loan.returnDate ? formatDate(loan.returnDate) : '';

  let actionsHTML = '';
  if (isActive) {
    const canRenew = !loan.renewed && loan.status !== 'overdue';
    actionsHTML = `
      <div class="loan-actions">
        <button class="btn-renew" ${!canRenew ? 'disabled' : ''} data-action="renew">
          ${canRenew ? getTranslation('renew', lang) : getTranslation('renew_disabled', lang)}
        </button>
        <button class="btn-return" data-action="return">
          ${getTranslation('return', lang)}
        </button>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="loan-info">
      ${coverHTML}
      <div class="loan-details">
        <div class="loan-title">${loan.title}</div>
        <div class="loan-author">${loan.author}</div>
        <div class="loan-meta">
          <span><i class="far fa-calendar-alt"></i> ${getTranslation('loan_date', lang, { date: loanDateStr })}</span>
          <span><i class="far fa-calendar-check"></i> ${getTranslation('due_date', lang, { date: dueDateStr })}</span>
          ${loan.returnDate ? `<span><i class="fas fa-undo-alt"></i> ${getTranslation('return_date', lang, { date: returnDateStr })}</span>` : ''}
          <span class="loan-status ${statusClass}">${statusLabel}</span>
          ${isActive ? `<span style="font-size:13px; color:#64748b;">${daysInfo}</span>` : ''}
        </div>
      </div>
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

  card.addEventListener('click', () => {
    openLoanModal(loan.id, 'view');
  });

  return card;
}

// ===================== AÇÕES =====================
function renewLoan(id) {
  const loan = loans.find(l => l.id === id);
  if (!loan) return;
  if (loan.renewed || loan.status === 'overdue' || loan.status === 'returned') {
    window.showFeedbackMessage(getTranslation('feedback_error', getCurrentLanguage()));
    return;
  }

  const newDueDate = new Date();
  newDueDate.setDate(newDueDate.getDate() + 15);
  loan.dueDate = newDueDate;
  loan.renewed = true;
  saveLoans();
  const lang = getCurrentLanguage();
  window.showFeedbackMessage(getTranslation('feedback_renewed', lang, { newDate: formatDate(newDueDate) }));
  renderLoans();
}

function returnLoan(id) {
  const loan = loans.find(l => l.id === id);
  if (!loan || loan.status === 'returned') return;

  loan.status = 'returned';
  loan.returnDate = new Date();
  saveLoans();
  const lang = getCurrentLanguage();
  window.showFeedbackMessage(getTranslation('feedback_returned', lang));
  renderLoans();
}

// ===================== MODAL =====================
function openLoanModal(id, action) {
  const loan = loans.find(l => l.id === id);
  if (!loan) return;

  currentLoanId = id;
  const lang = getCurrentLanguage();

  const overlay = document.getElementById('loan-modal-overlay');
  const title = document.getElementById('loan-modal-title');
  const body = document.getElementById('loan-modal-body');
  const renewBtn = document.getElementById('loan-renew-btn');
  const returnBtn = document.getElementById('loan-return-btn');

  title.textContent = getTranslation('modal_title', lang);

  const loanDate = formatDate(loan.loanDate);
  const dueDate = formatDate(loan.dueDate);
  const returnDate = loan.returnDate ? formatDate(loan.returnDate) : '—';

  body.innerHTML = `
    <p><strong>${loan.title}</strong> — ${loan.author}</p>
    <p><strong>${getTranslation('loan_date', lang, { date: '' })}</strong> ${loanDate}</p>
    <p><strong>${getTranslation('due_date', lang, { date: '' })}</strong> ${dueDate}</p>
    <p><strong>${getTranslation('return_date', lang, { date: '' })}</strong> ${returnDate}</p>
    <p><strong>Status:</strong> ${getStatusLabel(loan.status, lang)}</p>
  `;

  if (action === 'renew' && loan.status !== 'returned' && !loan.renewed && loan.status !== 'overdue') {
    const newDue = new Date();
    newDue.setDate(newDue.getDate() + 15);
    const confirmMsg = getTranslation('modal_renew_confirm', lang, { newDate: formatDate(newDue) });
    renewBtn.style.display = 'inline-block';
    renewBtn.onclick = () => {
      if (confirm(confirmMsg)) {
        renewLoan(id);
        closeLoanModal();
      }
    };
  } else {
    renewBtn.style.display = 'none';
  }

  if (action === 'return' && loan.status !== 'returned') {
    const confirmMsg = getTranslation('modal_return_confirm', lang);
    returnBtn.style.display = 'inline-block';
    returnBtn.onclick = () => {
      if (confirm(confirmMsg)) {
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
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  currentLoanId = null;
}

// ===================== TABS =====================
function switchTab(tab) {
  currentTab = tab;
  renderLoans();
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  applyLoansLanguage(getCurrentLanguage());

  const hasCache = loadLoansFromCache();
  if (hasCache && loans.length > 0) {
    renderLoans();
    fetchLoans(); // atualiza em background
  } else {
    fetchLoans();
  }

  document.getElementById('tab-active').addEventListener('click', () => {
    switchTab('active');
  });
  document.getElementById('tab-history').addEventListener('click', () => {
    switchTab('history');
  });

  const overlay = document.getElementById('loan-modal-overlay');
  const closeBtn = document.getElementById('loan-modal-close');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeLoanModal();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeLoanModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLoanModal();
  });

  document.addEventListener('languageChanged', (e) => {
    applyLoansLanguage(e.detail.lang);
    renderLoans();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'dashboard_lang') {
      const lang = e.newValue || 'pt';
      applyLoansLanguage(lang);
      renderLoans();
    }
  });

  console.log('%cMeus Empréstimos SiGA ITJ carregado!', 'color: #0b4b9b; font-weight: bold;');
});

// ===================== APLICA IDIOMA =====================
function applyLoansLanguage(lang) {
  const t = loansTranslations[lang] || loansTranslations.pt;

  document.getElementById('loans-title').textContent = t.loans_title;
  document.getElementById('loans-subtitle').textContent = t.loans_subtitle;
  document.getElementById('tab-active').textContent = t.tab_active;
  document.getElementById('tab-history').textContent = t.tab_history;

  renderLoans();
}

if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function(lang) {
    originalApply(lang);
    applyLoansLanguage(lang);
  };
}
// reservas.js
// ===================== DADOS MOCKADOS =====================
// Em produção, viriam da API/banco de dados

const reservasData = [
  {
    id: 1,
    itemId: 1,
    title: 'Introdução à Programação com Python',
    author: 'Eric Matthes',
    year: 2019,
    type: 'book',
    cover: null,
    reservedAt: '2026-07-28',
    expiryDate: '2026-08-04',
    status: 'pending', // pending, ready, cancelled, completed
    available: true,
  },
  {
    id: 2,
    itemId: 4,
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    year: 1943,
    type: 'book',
    cover: null,
    reservedAt: '2026-07-30',
    expiryDate: '2026-08-06',
    status: 'ready',
    available: true,
  },
  {
    id: 3,
    itemId: 11,
    title: 'National Geographic - Edição Brasil',
    author: 'National Geographic Society',
    year: 2024,
    type: 'magazine',
    cover: null,
    reservedAt: '2026-07-25',
    expiryDate: '2026-08-01',
    status: 'pending',
    available: true,
  },
  {
    id: 4,
    itemId: 16,
    title: 'Sistema de Monitoramento de Estufa com IoT',
    author: 'Ana Paula Ferreira, Lucas Rodrigues, Thiago Mendes',
    year: 2024,
    type: 'tcc',
    cover: null,
    reservedAt: '2026-07-20',
    expiryDate: '2026-07-27',
    status: 'completed',
    available: true,
  },
  {
    id: 5,
    itemId: 6,
    title: 'O Hobbit',
    author: 'J.R.R. Tolkien',
    year: 1937,
    type: 'book',
    cover: null,
    reservedAt: '2026-07-15',
    expiryDate: '2026-07-22',
    status: 'cancelled',
    available: true,
  },
  {
    id: 6,
    itemId: 8,
    title: 'A Arte da Guerra',
    author: 'Sun Tzu',
    year: -500,
    type: 'book',
    cover: null,
    reservedAt: '2026-07-10',
    expiryDate: '2026-07-17',
    status: 'cancelled',
    available: true,
  },
  {
    id: 7,
    itemId: 19,
    title: 'Reconhecimento de Gestos com Machine Learning',
    author: 'Diego Carvalho, Fernanda Oliveira',
    year: 2023,
    type: 'tcc',
    cover: null,
    reservedAt: '2026-06-28',
    expiryDate: '2026-07-05',
    status: 'completed',
    available: false,
  },
];

// ===================== TRADUÇÕES =====================
const reservasTranslations = {
  pt: {
    page_title: 'Minhas Reservas',
    page_subtitle: 'Acompanhe suas reservas ativas e histórico',
    tab_active: 'Ativas',
    tab_history: 'Histórico',
    status_pending: 'Pendente',
    status_ready: 'Disponível para retirada',
    status_cancelled: 'Cancelada',
    status_completed: 'Concluída',
    reserved_on: 'Reservado em',
    expires_on: 'Expira em',
    empty_active: 'Você não tem reservas ativas no momento.',
    empty_history: 'Nenhuma reserva no histórico.',
    cancel_reserve: 'Cancelar Reserva',
    confirm_pickup: 'Confirmar Retirada',
    detail: 'Detalhes',
    modal_cancel: 'Cancelar Reserva',
    modal_pickup: 'Confirmar Retirada',
    feedback_cancel_success: 'Reserva cancelada com sucesso!',
    feedback_cancel_error: 'Não foi possível cancelar a reserva.',
    feedback_pickup_success: 'Retirada confirmada! Aproveite o material.',
    feedback_pickup_error: 'Não foi possível confirmar a retirada.',
    confirm_cancel_title: 'Confirmar cancelamento',
    confirm_cancel_message: 'Tem certeza que deseja cancelar esta reserva?',
    confirm_pickup_title: 'Confirmar retirada',
    confirm_pickup_message: 'Confirme que você está retirando este material.',
  },
  en: {
    page_title: 'My Reservations',
    page_subtitle: 'Track your active reservations and history',
    tab_active: 'Active',
    tab_history: 'History',
    status_pending: 'Pending',
    status_ready: 'Ready for pickup',
    status_cancelled: 'Cancelled',
    status_completed: 'Completed',
    reserved_on: 'Reserved on',
    expires_on: 'Expires on',
    empty_active: 'You have no active reservations.',
    empty_history: 'No reservations in history.',
    cancel_reserve: 'Cancel Reservation',
    confirm_pickup: 'Confirm Pickup',
    detail: 'Details',
    modal_cancel: 'Cancel Reservation',
    modal_pickup: 'Confirm Pickup',
    feedback_cancel_success: 'Reservation cancelled successfully!',
    feedback_cancel_error: 'Unable to cancel reservation.',
    feedback_pickup_success: 'Pickup confirmed! Enjoy the material.',
    feedback_pickup_error: 'Unable to confirm pickup.',
    confirm_cancel_title: 'Confirm cancellation',
    confirm_cancel_message: 'Are you sure you want to cancel this reservation?',
    confirm_pickup_title: 'Confirm pickup',
    confirm_pickup_message: 'Confirm that you are picking up this material.',
  },
  es: {
    page_title: 'Mis Reservas',
    page_subtitle: 'Sigue tus reservas activas e historial',
    tab_active: 'Activas',
    tab_history: 'Historial',
    status_pending: 'Pendiente',
    status_ready: 'Disponible para retirar',
    status_cancelled: 'Cancelada',
    status_completed: 'Completada',
    reserved_on: 'Reservado el',
    expires_on: 'Expira el',
    empty_active: 'No tienes reservas activas.',
    empty_history: 'No hay reservas en el historial.',
    cancel_reserve: 'Cancelar Reserva',
    confirm_pickup: 'Confirmar Retiro',
    detail: 'Detalles',
    modal_cancel: 'Cancelar Reserva',
    modal_pickup: 'Confirmar Retiro',
    feedback_cancel_success: '¡Reserva cancelada con éxito!',
    feedback_cancel_error: 'No se pudo cancelar la reserva.',
    feedback_pickup_success: '¡Retiro confirmado! Disfruta del material.',
    feedback_pickup_error: 'No se pudo confirmar el retiro.',
    confirm_cancel_title: 'Confirmar cancelación',
    confirm_cancel_message: '¿Estás seguro de cancelar esta reserva?',
    confirm_pickup_title: 'Confirmar retiro',
    confirm_pickup_message: 'Confirma que estás retirando este material.',
  }
};

// Mesclar com as traduções do dashboard
if (typeof dashboardTranslations !== 'undefined') {
  for (let lang in reservasTranslations) {
    if (dashboardTranslations[lang]) {
      Object.assign(dashboardTranslations[lang], reservasTranslations[lang]);
    } else {
      dashboardTranslations[lang] = reservasTranslations[lang];
    }
  }
}

// ===================== ESTADO =====================
let reservas = [...reservasData];
let activeTab = 'active';
let currentReservaId = null;

// ===================== FUNÇÕES AUXILIARES =====================
function getCurrentLanguage() {
  return localStorage.getItem('dashboard_lang') || 'pt';
}

function getReservaTranslation(key, lang) {
  const t = reservasTranslations[lang] || reservasTranslations.pt;
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
    case 'pending': return 'status-pending';
    case 'ready': return 'status-ready';
    case 'cancelled': return 'status-cancelled';
    case 'completed': return 'status-completed';
    default: return '';
  }
}

function getStatusLabel(status, lang) {
  const map = {
    pending: 'status_pending',
    ready: 'status_ready',
    cancelled: 'status_cancelled',
    completed: 'status_completed',
  };
  return getReservaTranslation(map[status] || 'status_pending', lang);
}

// ===================== RENDERIZAÇÃO =====================
function renderReservas() {
  const activeList = document.getElementById('reservas-active-list');
  const historyList = document.getElementById('reservas-history-list');
  const empty = document.getElementById('reservas-empty');
  const emptyMsg = document.getElementById('empty-message');
  const activeCount = document.getElementById('active-count');

  if (!activeList || !historyList) return;

  const lang = getCurrentLanguage();

  // Filtrar ativas (pending, ready)
  const activeReservas = reservas.filter(r => r.status === 'pending' || r.status === 'ready');
  // Histórico (cancelled, completed)
  const historyReservas = reservas.filter(r => r.status === 'cancelled' || r.status === 'completed');

  // Atualizar badge
  if (activeCount) activeCount.textContent = activeReservas.length;

  // Renderizar ativas
  if (activeReservas.length === 0) {
    activeList.innerHTML = '';
    // Mostrar mensagem vazia se a aba ativa estiver selecionada
    if (activeTab === 'active') {
      empty.style.display = 'block';
      emptyMsg.textContent = getReservaTranslation('empty_active', lang);
    }
  } else {
    empty.style.display = 'none';
    activeList.innerHTML = '';
    activeReservas.forEach((reserva, idx) => {
      const card = createReservaCard(reserva, idx, lang);
      activeList.appendChild(card);
    });
  }

  // Renderizar histórico
  if (historyReservas.length === 0) {
    historyList.innerHTML = '';
    if (activeTab === 'history') {
      empty.style.display = 'block';
      emptyMsg.textContent = getReservaTranslation('empty_history', lang);
    }
  } else {
    if (activeTab !== 'active') empty.style.display = 'none';
    historyList.innerHTML = '';
    historyReservas.forEach((reserva, idx) => {
      const card = createReservaCard(reserva, idx, lang);
      historyList.appendChild(card);
    });
  }

  // Ajustar visibilidade das listas
  if (activeTab === 'active') {
    activeList.style.display = 'flex';
    historyList.style.display = 'none';
    if (activeReservas.length === 0) {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
    }
  } else {
    activeList.style.display = 'none';
    historyList.style.display = 'flex';
    if (historyReservas.length === 0) {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
    }
  }
}

function createReservaCard(reserva, index, lang) {
  const card = document.createElement('div');
  card.className = 'reserva-card';
  card.dataset.id = reserva.id;

  const coverColor = getCoverColor(index);
  const statusLabel = getStatusLabel(reserva.status, lang);
  const statusClass = getStatusClass(reserva.status);

  let coverHTML;
  if (reserva.cover) {
    coverHTML = `<img src="${reserva.cover}" alt="${reserva.title}" class="reserva-cover">`;
  } else {
    const iconMap = { book: 'fa-book', magazine: 'fa-newspaper', tcc: 'fa-graduation-cap' };
    const icon = iconMap[reserva.type] || 'fa-book';
    coverHTML = `
      <div class="reserva-cover-placeholder" style="background: ${coverColor}">
        <i class="fas ${icon}"></i>
        <span>${reserva.title}</span>
      </div>
    `;
  }

  const isActive = reserva.status === 'pending' || reserva.status === 'ready';
  const showCancel = isActive && reserva.status !== 'ready';
  const showPickup = reserva.status === 'ready';

  card.innerHTML = `
    ${coverHTML}
    <div class="reserva-info">
      <div class="title">${reserva.title}</div>
      <div class="author">${reserva.author}</div>
      <div class="meta">
        <span><i class="far fa-calendar-alt"></i> ${getReservaTranslation('reserved_on', lang)}: ${formatDate(reserva.reservedAt)}</span>
        ${reserva.expiryDate ? `<span><i class="far fa-hourglass"></i> ${getReservaTranslation('expires_on', lang)}: ${formatDate(reserva.expiryDate)}</span>` : ''}
        <span class="reserva-status ${statusClass}">${statusLabel}</span>
      </div>
    </div>
    <div class="reserva-actions">
      ${showCancel ? `<button class="btn-cancel" data-action="cancel"><i class="fas fa-times"></i> ${getReservaTranslation('cancel_reserve', lang)}</button>` : ''}
      ${showPickup ? `<button class="btn-pickup" data-action="pickup"><i class="fas fa-check"></i> ${getReservaTranslation('confirm_pickup', lang)}</button>` : ''}
      <button class="btn-detail" data-action="detail"><i class="fas fa-info-circle"></i> ${getReservaTranslation('detail', lang)}</button>
    </div>
  `;

  // Eventos dos botões
  const cancelBtn = card.querySelector('[data-action="cancel"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCancel(reserva.id);
    });
  }

  const pickupBtn = card.querySelector('[data-action="pickup"]');
  if (pickupBtn) {
    pickupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePickup(reserva.id);
    });
  }

  const detailBtn = card.querySelector('[data-action="detail"]');
  if (detailBtn) {
    detailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openReservaModal(reserva.id);
    });
  }

  // Clique no card abre modal
  card.addEventListener('click', () => {
    openReservaModal(reserva.id);
  });

  return card;
}

// ===================== AÇÕES =====================
function handleCancel(reservaId) {
  const lang = getCurrentLanguage();
  const confirmMsg = getReservaTranslation('confirm_cancel_message', lang);
  if (!confirm(confirmMsg)) return;

  const reserva = reservas.find(r => r.id === reservaId);
  if (!reserva) return;

  // Simula cancelamento
  reserva.status = 'cancelled';
  showFeedbackMessage(getReservaTranslation('feedback_cancel_success', lang));
  renderReservas();
  closeReservaModal();
}

function handlePickup(reservaId) {
  const lang = getCurrentLanguage();
  const confirmMsg = getReservaTranslation('confirm_pickup_message', lang);
  if (!confirm(confirmMsg)) return;

  const reserva = reservas.find(r => r.id === reservaId);
  if (!reserva) return;

  // Simula confirmação de retirada
  reserva.status = 'completed';
  showFeedbackMessage(getReservaTranslation('feedback_pickup_success', lang));
  renderReservas();
  closeReservaModal();
}

// ===================== MODAL =====================
function openReservaModal(reservaId) {
  const reserva = reservas.find(r => r.id === reservaId);
  if (!reserva) return;

  currentReservaId = reservaId;
  const lang = getCurrentLanguage();
  const coverColor = getCoverColor(reservas.indexOf(reserva));

  const overlay = document.getElementById('reserva-modal-overlay');
  const coverImg = document.getElementById('modal-cover-img');
  const coverPlaceholder = document.getElementById('modal-cover-placeholder');
  const titleEl = document.getElementById('modal-title');
  const authorEl = document.getElementById('modal-author');
  const yearEl = document.getElementById('modal-year');
  const typeEl = document.getElementById('modal-type');
  const reserveDateEl = document.getElementById('modal-reserve-date');
  const expiryDateEl = document.getElementById('modal-expiry-date');
  const statusEl = document.getElementById('modal-status');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const pickupBtn = document.getElementById('modal-pickup-btn');
  const cancelText = document.getElementById('modal-cancel-text');
  const pickupText = document.getElementById('modal-pickup-text');
  const actionsDiv = document.getElementById('modal-actions');

  // Preencher dados
  if (reserva.cover) {
    coverImg.src = reserva.cover;
    coverImg.alt = reserva.title;
    coverImg.style.display = 'block';
    coverPlaceholder.style.display = 'none';
  } else {
    coverImg.style.display = 'none';
    coverPlaceholder.style.display = 'flex';
    coverPlaceholder.style.background = coverColor;
    coverPlaceholder.querySelector('span').textContent = reserva.title;
  }

  titleEl.textContent = reserva.title;
  authorEl.textContent = reserva.author;
  yearEl.textContent = `Ano: ${reserva.year}`;
  const typeMap = { book: 'Livro', magazine: 'Revista', tcc: 'TCC' };
  typeEl.textContent = `Tipo: ${typeMap[reserva.type] || reserva.type}`;
  reserveDateEl.textContent = `${getReservaTranslation('reserved_on', lang)}: ${formatDate(reserva.reservedAt)}`;
  expiryDateEl.textContent = reserva.expiryDate ? `${getReservaTranslation('expires_on', lang)}: ${formatDate(reserva.expiryDate)}` : '';

  const statusLabel = getStatusLabel(reserva.status, lang);
  const statusClass = getStatusClass(reserva.status);
  statusEl.textContent = statusLabel;
  statusEl.className = `status-badge ${statusClass}`;

  // Botões
  const isActive = reserva.status === 'pending' || reserva.status === 'ready';
  const showCancel = isActive && reserva.status !== 'ready';
  const showPickup = reserva.status === 'ready';

  if (cancelText) cancelText.textContent = getReservaTranslation('modal_cancel', lang);
  if (pickupText) pickupText.textContent = getReservaTranslation('modal_pickup', lang);

  cancelBtn.style.display = showCancel ? 'inline-flex' : 'none';
  pickupBtn.style.display = showPickup ? 'inline-flex' : 'none';
  if (!showCancel && !showPickup) {
    actionsDiv.style.display = 'none';
  } else {
    actionsDiv.style.display = 'flex';
  }

  // Remover listeners antigos (clonar e substituir)
  const newCancel = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  newCancel.addEventListener('click', () => {
    handleCancel(reservaId);
  });

  const newPickup = pickupBtn.cloneNode(true);
  pickupBtn.parentNode.replaceChild(newPickup, pickupBtn);
  newPickup.addEventListener('click', () => {
    handlePickup(reservaId);
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReservaModal() {
  const overlay = document.getElementById('reserva-modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  currentReservaId = null;
}

// ===================== TABS =====================
function switchTab(tab) {
  activeTab = tab;
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  renderReservas();
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  // Aplicar traduções iniciais
  applyReservasLanguage(getCurrentLanguage());

  // Renderizar
  renderReservas();

  // Eventos das abas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Fechar modal
  const overlay = document.getElementById('reserva-modal-overlay');
  const closeBtn = document.getElementById('reserva-modal-close');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeReservaModal();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeReservaModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeReservaModal();
  });

  // Integrar com mudança de idioma
  window.addEventListener('storage', (e) => {
    if (e.key === 'dashboard_lang') {
      const lang = e.newValue || 'pt';
      applyReservasLanguage(lang);
      renderReservas();
    }
  });

  document.addEventListener('languageChanged', (e) => {
    applyReservasLanguage(e.detail.lang);
    renderReservas();
  });

  console.log('%cMinhas Reservas carregado!', 'color: #0b4b9b; font-weight: bold;');
});

// ===================== APLICA IDIOMA =====================
function applyReservasLanguage(lang) {
  const t = reservasTranslations[lang] || reservasTranslations.pt;

  document.getElementById('reservas-title').textContent = t.page_title;
  document.getElementById('reservas-subtitle').textContent = t.page_subtitle;

  const tabActive = document.getElementById('tab-active-label');
  if (tabActive) tabActive.textContent = t.tab_active;

  const tabHistory = document.getElementById('tab-history-label');
  if (tabHistory) tabHistory.textContent = t.tab_history;

  const emptyMsg = document.getElementById('empty-message');
  if (emptyMsg) {
    if (activeTab === 'active') {
      emptyMsg.textContent = t.empty_active;
    } else {
      emptyMsg.textContent = t.empty_history;
    }
  }

  // Atualizar botões nos cards (recriar)
  renderReservas();
}

// Sobrescrever função de tradução do dashboard para incluir reservas
if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function(lang) {
    originalApply(lang);
    applyReservasLanguage(lang);
  };
}
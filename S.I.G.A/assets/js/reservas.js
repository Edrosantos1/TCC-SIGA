// ===================== TRADUÇÕES =====================
const reservasTranslations = {
  pt: {
    page_title: 'Minhas Reservas',
    page_subtitle: 'Acompanhe suas reservas ativas e histórico',
    tab_active: 'Ativas',
    tab_history: 'Histórico',
    status_pending: 'Pendente',
    status_approved: 'Pronto para retirada',
    status_cancelled: 'Cancelada',
    status_rejected: 'Rejeitada',
    status_expired: 'Expirada',
    status_completed: 'Concluída',
    status_retirada: 'Retirada (Emprestado)',
    reserved_on: 'Reservado em',
    expires_on: 'Expira em',
    empty_active: 'Você não tem reservas ativas no momento.',
    empty_history: 'Nenhuma reserva no histórico.',
    cancel_reserve: 'Cancelar Reserva',
    feedback_cancel_success: 'Reserva cancelada com sucesso!',
    feedback_cancel_error: 'Não foi possível cancelar a reserva.',
    feedback_load_error: 'Erro ao carregar reservas. Tente novamente.',
  },
  en: {
    page_title: 'My Reservations',
    page_subtitle: 'Track your active reservations and history',
    tab_active: 'Active',
    tab_history: 'History',
    status_pending: 'Pending',
    status_approved: 'Ready for pickup',
    status_cancelled: 'Cancelled',
    status_rejected: 'Rejected',
    status_expired: 'Expired',
    status_completed: 'Completed',
    status_retirada: 'Picked up',
    reserved_on: 'Reserved on',
    expires_on: 'Expires on',
    empty_active: 'You have no active reservations.',
    empty_history: 'No reservations in history.',
    cancel_reserve: 'Cancel Reservation',
    feedback_cancel_success: 'Reservation cancelled successfully!',
    feedback_cancel_error: 'Unable to cancel reservation.',
    feedback_load_error: 'Error loading reservations. Please try again.',
  },
  es: {
    page_title: 'Mis Reservas',
    page_subtitle: 'Sigue tus reservas activas e historial',
    tab_active: 'Activas',
    tab_history: 'Historial',
    status_pending: 'Pendiente',
    status_approved: 'Listo para retirar',
    status_cancelled: 'Cancelada',
    status_rejected: 'Rechazada',
    status_expired: 'Expirada',
    status_completed: 'Completada',
    status_retirada: 'Retirada',
    reserved_on: 'Reservado el',
    expires_on: 'Expira el',
    empty_active: 'No tienes reservas activas.',
    empty_history: 'No hay reservas en el historial.',
    cancel_reserve: 'Cancelar Reserva',
    feedback_cancel_success: '¡Reserva cancelada con éxito!',
    feedback_cancel_error: 'No se pudo cancelar la reserva.',
    feedback_load_error: 'Error al cargar reservas. Intente de nuevo.',
  }
};

// Mesclar com traduções do dashboard
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
let reservas = [];
let activeTab = 'active';

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
    transform: translateX(-50%);
    background: #0b4b9b;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: opacity 0.3s;
  `;
  document.body.appendChild(msgDiv);
  setTimeout(() => {
    msgDiv.style.opacity = '0';
    setTimeout(() => msgDiv.remove(), 500);
  }, 3000);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
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
    case 'pendente': return 'status-pending';
    case 'aprovada': return 'status-approved';
    case 'cancelada': return 'status-cancelled';
    case 'rejeitada': return 'status-rejected';
    case 'expirada': return 'status-expired';
    case 'retirada': return 'status-retirada';
    default: return '';
  }
}

function getStatusLabel(status, lang) {
  const map = {
    pendente: 'status_pending',
    aprovada: 'status_approved',
    cancelada: 'status_cancelled',
    rejeitada: 'status_rejected',
    expirada: 'status_expired',
    retirada: 'status_retirada',
  };
  return getReservaTranslation(map[status] || 'status_pending', lang);
}

// ===================== CARREGAR RESERVAS DA API =====================
async function fetchReservas() {
  try {
    const response = await fetch('../api/aluno_reservas.php', {
      credentials: 'same-origin'
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro ${response.status}: ${text}`);
    }
    const data = await response.json();
    reservas = data;
    renderReservas();
  } catch (error) {
    console.error('Erro ao carregar reservas:', error);
    const lang = getCurrentLanguage();
    showFeedbackMessage(getReservaTranslation('feedback_load_error', lang));
    reservas = [];
    renderReservas();
  }
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

  // Ativas: pendente e aprovada (ainda não retiradas)
  const activeReservas = reservas.filter(r => r.status === 'pendente' || r.status === 'aprovada');
  // Histórico: rejeitada, expirada, cancelada, retirada
  const historyReservas = reservas.filter(r => 
    ['rejeitada', 'expirada', 'cancelada', 'retirada'].includes(r.status)
  );

  if (activeCount) activeCount.textContent = activeReservas.length;

  // Renderizar ativas
  if (activeReservas.length === 0) {
    activeList.innerHTML = '';
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
    activeList.style.display = 'grid';
    historyList.style.display = 'none';
    if (activeReservas.length === 0) {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
    }
  } else {
    activeList.style.display = 'none';
    historyList.style.display = 'grid';
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
  card.dataset.id = reserva.id_reserva || reserva.id;

  const coverColor = getCoverColor(index);
  const statusLabel = getStatusLabel(reserva.status, lang);
  const statusClass = getStatusClass(reserva.status);

  const title = reserva.titulo || reserva.titulo_item || 'Título não disponível';
  const author = reserva.autor || 'Autor não informado';
  let cover = reserva.capa_url || null;
  if (cover && !cover.startsWith('http') && !cover.startsWith('/')) {
    cover = '../' + cover;
  }
  const type = reserva.tipo || 'livro';
  const reservedAt = reserva.data_reserva;
  const expiryDate = reserva.data_limite;

  let coverHTML;
  if (cover) {
    coverHTML = `<img src="${cover}" alt="${title}" class="reserva-cover" onerror="this.style.display='none'">`;
  } else {
    const iconMap = { livro: 'fa-book', revista: 'fa-newspaper', tcc: 'fa-graduation-cap' };
    const icon = iconMap[type] || 'fa-book';
    coverHTML = `
      <div class="reserva-cover-placeholder" style="background: ${coverColor}">
        <i class="fas ${icon}"></i>
        <span>${title}</span>
      </div>
    `;
  }

  let actionsHTML = '';
  if (reserva.status === 'pendente') {
    actionsHTML = `
      <div class="reserva-actions">
        <button class="btn-cancel" data-action="cancel">
          <i class="fas fa-times"></i> ${getReservaTranslation('cancel_reserve', lang)}
        </button>
      </div>
    `;
  } else if (reserva.status === 'aprovada') {
    actionsHTML = `
      <div class="reserva-actions">
        <span class="status-ready-text">
          <i class="fas fa-check-circle"></i> ${getReservaTranslation('status_approved', lang)}
        </span>
      </div>
    `;
  } else if (reserva.status === 'retirada') {
    actionsHTML = `
      <div class="reserva-actions">
        <span class="status-retirada-text">
          <i class="fas fa-hand-holding-heart"></i> ${getReservaTranslation('status_retirada', lang)}
        </span>
      </div>
    `;
  }

  card.innerHTML = `
    ${coverHTML}
    <div class="reserva-info">
      <div class="title">${title}</div>
      <div class="author">${author}</div>
      <div class="meta">
        <span><i class="far fa-calendar-alt"></i> ${getReservaTranslation('reserved_on', lang)}: ${formatDate(reservedAt)}</span>
        ${expiryDate ? `<span><i class="far fa-hourglass"></i> ${getReservaTranslation('expires_on', lang)}: ${formatDate(expiryDate)}</span>` : ''}
        <span class="reserva-status ${statusClass}">${statusLabel}</span>
      </div>
    </div>
    ${actionsHTML}
  `;

  const cancelBtn = card.querySelector('[data-action="cancel"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCancel(reserva.id_reserva || reserva.id);
    });
  }

  return card;
}

// ===================== AÇÕES COM API =====================
async function handleCancel(reservaId) {
  const lang = getCurrentLanguage();
  const confirmMsg = 'Tem certeza que deseja cancelar esta reserva?';
  if (!confirm(confirmMsg)) return;

  try {
    const response = await fetch('../api/aluno_reservas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ action: 'cancel', id: reservaId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao cancelar');

    showFeedbackMessage(getReservaTranslation('feedback_cancel_success', lang));
    await fetchReservas();
  } catch (error) {
    console.error(error);
    showFeedbackMessage(getReservaTranslation('feedback_cancel_error', lang));
  }
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
  applyReservasLanguage(getCurrentLanguage());

  fetchReservas();

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Fechar modal (não usado)
  const overlay = document.getElementById('reserva-modal-overlay');
  if (overlay) overlay.style.display = 'none';

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

  console.log('%cMinhas Reservas carregado com status retirada!', 'color: #0b4b9b; font-weight: bold;');
});

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
    emptyMsg.textContent = (activeTab === 'active') ? t.empty_active : t.empty_history;
  }

  renderReservas();
}

if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function(lang) {
    originalApply(lang);
    applyReservasLanguage(lang);
  };
}
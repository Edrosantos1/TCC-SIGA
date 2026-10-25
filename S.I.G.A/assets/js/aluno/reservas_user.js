// ===================== TRADUÇÕES =====================
const reservasTranslations = {
  pt: {
    reservations_tabs: 'Reservas',
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
    status_retirada: 'Retirada',
    type_book: 'Livro',
    type_magazine: 'Revista',
    type_tcc: 'TCC',
    reserved_on: 'Reservado em',
    expires_on: 'Expira em',
    deadline_label: 'Prazo',
    days_overdue: 'Prazo vencido',
    days_today: 'Vence hoje',
    days_one: 'Falta 1 dia',
    days_many: 'Faltam {n} dias',
    author_unknown: 'Autor não informado',
    title_unknown: 'Título não disponível',
    empty_active: 'Você não tem reservas ativas no momento.',
    empty_history: 'Nenhuma reserva no histórico.',
    cancel_reserve: 'Cancelar reserva',
    confirm_cancel_title: 'Cancelar reserva',
    confirm_cancel_msg: 'Tem certeza que deseja cancelar a reserva de "{titulo}"?',
    confirm_cancel_yes: 'Sim, cancelar',
    confirm_cancel_no: 'Manter reserva',
    view_label: 'Modo de visualização',
    view_grid: 'Grade',
    view_list: 'Lista',
    view_grid_title: 'Ver em grade',
    view_list_title: 'Ver em lista',
    empty_cta: 'Explorar catálogo',
  },
  en: {
    reservations_tabs: 'Reservations',
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
    type_book: 'Book',
    type_magazine: 'Magazine',
    type_tcc: 'Thesis',
    reserved_on: 'Reserved on',
    expires_on: 'Expires on',
    deadline_label: 'Deadline',
    days_overdue: 'Deadline passed',
    days_today: 'Due today',
    days_one: '1 day left',
    days_many: '{n} days left',
    author_unknown: 'Author not informed',
    title_unknown: 'Title unavailable',
    empty_active: 'You have no active reservations.',
    empty_history: 'No reservations in history.',
    cancel_reserve: 'Cancel reservation',
    confirm_cancel_title: 'Cancel reservation',
    confirm_cancel_msg: 'Are you sure you want to cancel the reservation for "{titulo}"?',
    confirm_cancel_yes: 'Yes, cancel',
    confirm_cancel_no: 'Keep reservation',
    view_label: 'View mode',
    view_grid: 'Grid',
    view_list: 'List',
    view_grid_title: 'View as grid',
    view_list_title: 'View as list',
    empty_cta: 'Browse catalog',
  },
  es: {
    reservations_tabs: 'Reservas',
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
    type_book: 'Libro',
    type_magazine: 'Revista',
    type_tcc: 'TFC',
    reserved_on: 'Reservado el',
    expires_on: 'Expira el',
    deadline_label: 'Plazo',
    days_overdue: 'Plazo vencido',
    days_today: 'Vence hoy',
    days_one: 'Falta 1 día',
    days_many: 'Faltan {n} días',
    author_unknown: 'Autor no informado',
    title_unknown: 'Título no disponible',
    empty_active: 'No tienes reservas activas.',
    empty_history: 'No hay reservas en el historial.',
    cancel_reserve: 'Cancelar reserva',
    confirm_cancel_title: 'Cancelar reserva',
    confirm_cancel_msg: '¿Está seguro de cancelar la reserva de "{titulo}"?',
    confirm_cancel_yes: 'Sí, cancelar',
    confirm_cancel_no: 'Mantener reserva',
    view_label: 'Modo de vista',
    view_grid: 'Cuadrícula',
    view_list: 'Lista',
    view_grid_title: 'Ver en cuadrícula',
    view_list_title: 'Ver en lista',
    empty_cta: 'Explorar catálogo',
  }
};

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

const VIEW_KEY = 'reservas_view';
let viewMode = 'grid';
try { if (localStorage.getItem(VIEW_KEY) === 'list') viewMode = 'list'; } catch (e) {}

const STATUS_META = {
  pendente:  { key: 'status_pending',   css: 'status-pending',   icon: 'fa-hourglass-half' },
  aprovada:  { key: 'status_approved',  css: 'status-approved',  icon: 'fa-check-circle' },
  cancelada: { key: 'status_cancelled', css: 'status-cancelled', icon: 'fa-ban' },
  rejeitada: { key: 'status_rejected',  css: 'status-rejected',  icon: 'fa-times-circle' },
  expirada:  { key: 'status_expired',   css: 'status-expired',   icon: 'fa-clock' },
  retirada:  { key: 'status_retirada',  css: 'status-retirada',  icon: 'fa-hand-holding-heart' },
};
const ACTIVE_STATUS = ['pendente', 'aprovada'];
const HISTORY_STATUS = ['rejeitada', 'expirada', 'cancelada', 'retirada'];

// ===================== AUXILIARES =====================
function tRes(key, lang, params = {}) {
  const dict = reservasTranslations[lang] || reservasTranslations.pt;
  let text = dict[key] || reservasTranslations.pt[key] || key;
  Object.entries(params).forEach(([k, v]) => {
    text = text.split(`{${k}}`).join(v);
  });
  return text;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function parseDate(str) {
  if (!str) return null;
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(str, lang) {
  const d = parseDate(str);
  if (!d) return '';
  const locale = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[lang] || 'pt-BR';
  return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function daysUntil(str) {
  const d = parseDate(str);
  if (!d) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d - today) / 86400000);
}

function normalizeType(type) {
  const t = String(type || 'livro').toLowerCase();
  if (t === 'book') return 'livro';
  if (t === 'magazine') return 'revista';
  return ['livro', 'revista', 'tcc'].includes(t) ? t : 'livro';
}

const TYPE_META = {
  livro:   { key: 'type_book',     icon: 'fa-book',           css: 'tipo-livro' },
  revista: { key: 'type_magazine', icon: 'fa-newspaper',      css: 'tipo-revista' },
  tcc:     { key: 'type_tcc',      icon: 'fa-graduation-cap', css: 'tipo-tcc' },
};

function coverPlaceholderHTML(type, title) {
  const meta = TYPE_META[type];
  return `
    <div class="reserva-cover-placeholder ${meta.css}">
      <i class="fas ${meta.icon}"></i>
      <span>${escapeHtml(title)}</span>
    </div>`;
}

// ===================== CARREGAR =====================
function loadReservas() {
  reservas = (window.reservasData || []).map(reserva => ({
    ...reserva,
    id: Number(reserva.id_reserva || reserva.id),
    status: reserva.status || 'pendente',
  }));
}

// ===================== RENDER =====================
function renderReservas() {
  const activeList = document.getElementById('reservas-active-list');
  const historyList = document.getElementById('reservas-history-list');
  const empty = document.getElementById('reservas-empty');
  const emptyMsg = document.getElementById('empty-message');
  if (!activeList || !historyList) return;

  const lang = getCurrentLanguage();
  const activeReservas = reservas.filter(r => ACTIVE_STATUS.includes(r.status));
  const historyReservas = reservas.filter(r => HISTORY_STATUS.includes(r.status));

  const activeCount = document.getElementById('active-count');
  const historyCount = document.getElementById('history-count');
  if (activeCount) activeCount.textContent = activeReservas.length;
  if (historyCount) historyCount.textContent = historyReservas.length;

  activeList.innerHTML = '';
  historyList.innerHTML = '';
  activeReservas.forEach(r => activeList.appendChild(createReservaCard(r, lang)));
  historyReservas.forEach(r => historyList.appendChild(createReservaCard(r, lang)));

  const isActiveTab = activeTab === 'active';
  const current = isActiveTab ? activeReservas : historyReservas;
  activeList.style.display = isActiveTab ? 'grid' : 'none';
  historyList.style.display = isActiveTab ? 'none' : 'grid';

  if (empty) empty.style.display = current.length === 0 ? 'block' : 'none';
  if (emptyMsg) emptyMsg.textContent = tRes(isActiveTab ? 'empty_active' : 'empty_history', lang);

  const cta = document.getElementById('empty-cta');
  if (cta) cta.style.display = isActiveTab ? 'inline-flex' : 'none';
}

function buildDeadlineRow(reserva, lang, isActive) {
  if (!reserva.data_limite) return '';
  const dateText = formatDate(reserva.data_limite, lang);
  if (!dateText) return '';

  let chip = '';
  let urgency = '';
  if (isActive) {
    const n = daysUntil(reserva.data_limite);
    if (n !== null) {
      const label = n < 0 ? tRes('days_overdue', lang)
                  : n === 0 ? tRes('days_today', lang)
                  : n === 1 ? tRes('days_one', lang)
                  : tRes('days_many', lang, { n });
      urgency = n <= 1 ? 'is-urgent' : n <= 3 ? 'is-soon' : '';
      chip = `<span class="prazo-chip">${label}</span>`;
    }
  }

  const rowLabel = tRes(isActive ? 'expires_on' : 'deadline_label', lang);
  return `
    <div class="reserva-date ${urgency}">
      <dt><i class="far fa-hourglass"></i> ${rowLabel}</dt>
      <dd>${dateText}${chip}</dd>
    </div>`;
}

function buildFooter(reserva, lang) {
  if (reserva.status === 'pendente') {
    return `
      <div class="reserva-actions">
        <button class="btn-cancel" type="button" data-action="cancel">
          <i class="fas fa-times"></i> ${tRes('cancel_reserve', lang)}
        </button>
      </div>`;
  }
  return '';
}

function createReservaCard(reserva, lang) {
  const card = document.createElement('article');
  const status = STATUS_META[reserva.status] ? reserva.status : 'pendente';
  const statusMeta = STATUS_META[status];
  const isActive = ACTIVE_STATUS.includes(status);
  card.className = `reserva-card is-${status}`;
  card.dataset.id = reserva.id_reserva || reserva.id;

  const type = normalizeType(reserva.tipo);
  const typeMeta = TYPE_META[type];
  const title = reserva.titulo || reserva.titulo_item || tRes('title_unknown', lang);
  const author = reserva.autor || tRes('author_unknown', lang);

  let cover = reserva.capa_url || null;
  if (cover && !/^(https?:)?\/\//.test(cover) && !cover.startsWith('/')) {
    cover = '../' + cover;
  }

  const coverHTML = cover
    ? `<img src="${escapeHtml(cover)}" alt="" class="reserva-cover" loading="lazy">`
    : coverPlaceholderHTML(type, title);

  card.innerHTML = `
    <div class="reserva-cover-wrap">
      ${coverHTML}
      <span class="tipo-badge ${typeMeta.css}"><i class="fas ${typeMeta.icon}"></i> ${tRes(typeMeta.key, lang)}</span>
    </div>
    <div class="reserva-body">
      <div class="reserva-top">
        <span class="reserva-status ${statusMeta.css}"><i class="fas ${statusMeta.icon}"></i> ${tRes(statusMeta.key, lang)}</span>
      </div>
      <h3 class="title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
      <p class="author">${escapeHtml(author)}</p>
      <dl class="reserva-dates">
        <div class="reserva-date">
          <dt><i class="far fa-calendar-alt"></i> ${tRes('reserved_on', lang)}</dt>
          <dd>${formatDate(reserva.data_reserva, lang)}</dd>
        </div>
        ${buildDeadlineRow(reserva, lang, isActive)}
      </dl>
      ${buildFooter(reserva, lang)}
    </div>
  `;

  const img = card.querySelector('img.reserva-cover');
  if (img) {
    img.addEventListener('error', () => {
      const placeholder = document.createElement('template');
      placeholder.innerHTML = coverPlaceholderHTML(type, title).trim();
      img.replaceWith(placeholder.content.firstElementChild);
    }, { once: true });
  }

  const cancelBtn = card.querySelector('[data-action="cancel"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCancel(reserva.id_reserva || reserva.id, title);
    });
  }

  return card;
}

// ===================== CANCELAR =====================
function handleCancel(reservaId, title) {
  const lang = getCurrentLanguage();
  const form = document.getElementById('cancel-reserva-form');
  const idInput = document.getElementById('cancel-reserva-id');
  if (!form || !idInput) return;

  const submit = () => {
    idInput.value = reservaId;
    form.submit();
  };
  const message = tRes('confirm_cancel_msg', lang, { titulo: title });

  if (typeof window.uiConfirm === 'function') {
    window.uiConfirm(message, {
      titulo: tRes('confirm_cancel_title', lang),
      tipo: 'warning',
      textoConfirmar: tRes('confirm_cancel_yes', lang),
      textoCancelar: tRes('confirm_cancel_no', lang)
    }).then(ok => { if (ok) submit(); });
  } else if (confirm(message)) {
    submit();
  }
}

// ===================== TABS =====================
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isCurrent = btn.dataset.tab === tab;
    btn.classList.toggle('active', isCurrent);
    btn.setAttribute('aria-selected', String(isCurrent));
    btn.tabIndex = isCurrent ? 0 : -1;
  });
  renderReservas();
}

function onTabKeydown(e) {
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  const i = tabs.indexOf(e.currentTarget);
  let next = null;
  if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
  else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
  else if (e.key === 'Home') next = tabs[0];
  else if (e.key === 'End') next = tabs[tabs.length - 1];
  if (!next) return;
  e.preventDefault();
  next.focus();
  switchTab(next.dataset.tab);
}

// ===================== VIEW =====================
function applyView() {
  document.querySelectorAll('.reservas-list').forEach(list => {
    list.dataset.view = viewMode;
  });
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.view === viewMode));
  });
}

function setView(mode) {
  viewMode = mode === 'list' ? 'list' : 'grid';
  try { localStorage.setItem(VIEW_KEY, viewMode); } catch (e) {}
  applyView();
}

// ===================== IDIOMA =====================
function applyReservasLanguage(lang) {
  const t = reservasTranslations[lang] || reservasTranslations.pt;

  const title = document.getElementById('reservas-title');
  const subtitle = document.getElementById('reservas-subtitle');
  if (title) title.textContent = t.page_title;
  if (subtitle) subtitle.textContent = t.page_subtitle;

  const tabActive = document.getElementById('tab-active-label');
  if (tabActive) tabActive.textContent = t.tab_active;
  const tabHistory = document.getElementById('tab-history-label');
  if (tabHistory) tabHistory.textContent = t.tab_history;

  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setText('view-grid-label', t.view_grid);
  setText('view-list-label', t.view_list);
  setText('empty-cta-label', t.empty_cta);

  const toggle = document.getElementById('view-toggle');
  if (toggle) toggle.setAttribute('aria-label', t.view_label);
  const gridBtn = document.getElementById('view-grid-btn');
  const listBtn = document.getElementById('view-list-btn');
  if (gridBtn) { gridBtn.title = t.view_grid_title; gridBtn.setAttribute('aria-label', t.view_grid_title); }
  if (listBtn) { listBtn.title = t.view_list_title; listBtn.setAttribute('aria-label', t.view_list_title); }

  renderReservas();
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  loadReservas();
  applyView();
  applyReservasLanguage(getCurrentLanguage());

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    btn.addEventListener('keydown', onTabKeydown);
  });

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'siga-idioma') applyReservasLanguage(e.newValue || 'pt');
  });

  document.addEventListener('languageChanged', (e) => {
    applyReservasLanguage(e.detail.lang);
  });
});

if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function (lang) {
    originalApply(lang);
    applyReservasLanguage(lang);
  };
}
/* =============================================
   catalogo.js — Catálogo (v2)
   UX/UI: ui_alerts nas confirmações + toast melhorado
   ============================================= */

// ===================== TRADUÇÕES =====================
const catalogTranslations = {
  pt: {
    catalog_title: 'Catálogo',
    catalog_subtitle: 'Explore nosso acervo de livros, revistas e TCCs',
    filter_all: 'Todos',
    filter_books: 'Livros',
    filter_magazines: 'Revistas',
    filter_tcc: 'TCCs',
    search_placeholder: 'Buscar por título ou autor...',
    no_results: 'Nenhum resultado encontrado',
    availability_available: 'Disponível',
    availability_unavailable: 'Indisponível',
    action_favorite: 'Favoritar',
    action_favorited: 'Favoritado',
    action_reserve: 'Reservar',
    action_reserved: 'Reservado',
    action_cancel_reserve: 'Cancelar reserva',
    type_book: 'Livro',
    type_magazine: 'Revista',
    type_tcc: 'TCC',
    error: 'Erro ao carregar o catálogo. Tente novamente.',
    feedback_fav_added: 'Adicionado aos favoritos',
    feedback_fav_removed: 'Removido dos favoritos',
    feedback_fav_error: 'Não foi possível atualizar o favorito',
    feedback_reserve_success: 'Reserva realizada com sucesso!',
    feedback_reserve_error: 'Erro ao reservar: {error}',
    feedback_reserve_unavailable: 'Item indisponível para reserva',
    feedback_cancel_success: 'Reserva cancelada!',
    feedback_cancel_error: 'Erro ao cancelar reserva.',
    confirm_cancel_title: 'Cancelar reserva',
    confirm_cancel_msg: 'Tem certeza que deseja cancelar a reserva de "{titulo}"?',
    confirm_cancel_yes: 'Sim, cancelar',
    confirm_cancel_no: 'Manter reserva',
    confirm_unfav_title: 'Remover dos favoritos',
    confirm_unfav_msg: 'Deseja remover "{titulo}" dos favoritos?',
    confirm_unfav_yes: 'Sim, remover',
    confirm_unfav_no: 'Cancelar'
  },
  en: {
    catalog_title: 'Catalog',
    catalog_subtitle: 'Explore our collection of books, magazines and theses',
    filter_all: 'All',
    filter_books: 'Books',
    filter_magazines: 'Magazines',
    filter_tcc: 'Theses',
    search_placeholder: 'Search by title or author...',
    no_results: 'No results found',
    availability_available: 'Available',
    availability_unavailable: 'Unavailable',
    action_favorite: 'Favorite',
    action_favorited: 'Favorited',
    action_reserve: 'Reserve',
    action_reserved: 'Reserved',
    action_cancel_reserve: 'Cancel reservation',
    type_book: 'Book',
    type_magazine: 'Magazine',
    type_tcc: 'Thesis',
    error: 'Error loading catalog. Please try again.',
    feedback_fav_added: 'Added to favorites',
    feedback_fav_removed: 'Removed from favorites',
    feedback_fav_error: 'Could not update favorite',
    feedback_reserve_success: 'Reservation made successfully!',
    feedback_reserve_error: 'Error reserving: {error}',
    feedback_reserve_unavailable: 'Item unavailable for reservation',
    feedback_cancel_success: 'Reservation cancelled!',
    feedback_cancel_error: 'Error cancelling reservation.',
    confirm_cancel_title: 'Cancel reservation',
    confirm_cancel_msg: 'Are you sure you want to cancel the reservation for "{titulo}"?',
    confirm_cancel_yes: 'Yes, cancel',
    confirm_cancel_no: 'Keep reservation',
    confirm_unfav_title: 'Remove from favorites',
    confirm_unfav_msg: 'Remove "{titulo}" from favorites?',
    confirm_unfav_yes: 'Yes, remove',
    confirm_unfav_no: 'Cancel'
  },
  es: {
    catalog_title: 'Catálogo',
    catalog_subtitle: 'Explora nuestro acervo de libros, revistas y TFCs',
    filter_all: 'Todos',
    filter_books: 'Libros',
    filter_magazines: 'Revistas',
    filter_tcc: 'TFCs',
    search_placeholder: 'Buscar por título o autor...',
    no_results: 'No se encontraron resultados',
    availability_available: 'Disponible',
    availability_unavailable: 'No disponible',
    action_favorite: 'Favoritar',
    action_favorited: 'Favorito',
    action_reserve: 'Reservar',
    action_reserved: 'Reservado',
    action_cancel_reserve: 'Cancelar reserva',
    type_book: 'Libro',
    type_magazine: 'Revista',
    type_tcc: 'TFC',
    error: 'Error al cargar el catálogo. Intente de nuevo.',
    feedback_fav_added: 'Agregado a favoritos',
    feedback_fav_removed: 'Eliminado de favoritos',
    feedback_fav_error: 'No se pudo actualizar el favorito',
    feedback_reserve_success: '¡Reserva realizada con éxito!',
    feedback_reserve_error: 'Error al reservar: {error}',
    feedback_reserve_unavailable: 'Artículo no disponible para reserva',
    feedback_cancel_success: '¡Reserva cancelada!',
    feedback_cancel_error: 'Error al cancelar reserva.',
    confirm_cancel_title: 'Cancelar reserva',
    confirm_cancel_msg: '¿Está seguro de cancelar la reserva de "{titulo}"?',
    confirm_cancel_yes: 'Sí, cancelar',
    confirm_cancel_no: 'Mantener reserva',
    confirm_unfav_title: 'Quitar de favoritos',
    confirm_unfav_msg: '¿Quitar "{titulo}" de favoritos?',
    confirm_unfav_yes: 'Sí, quitar',
    confirm_unfav_no: 'Cancelar'
  }
};

if (typeof dashboardTranslations !== 'undefined') {
  for (let lang in catalogTranslations) {
    if (dashboardTranslations[lang]) {
      Object.assign(dashboardTranslations[lang], catalogTranslations[lang]);
    } else {
      dashboardTranslations[lang] = catalogTranslations[lang];
    }
  }
}

// ===================== ESTADO GLOBAL =====================
let catalogItems = [];
let favorites = new Set();
let reservations = new Map();

// ===================== AUXILIARES =====================
function getCurrentLanguage() {
  return localStorage.getItem('dashboard_lang') || 'pt';
}

function tCat(key, params = {}) {
  const lang = getCurrentLanguage();
  const dict = catalogTranslations[lang] || catalogTranslations.pt;
  let text = dict[key] || key;
  for (let [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return text;
}

// ===================== TOAST =====================
if (typeof window.showFeedbackMessage !== 'function') {
  window.showFeedbackMessage = function(message, type = 'info') {
    const colors = {
      success: { bg: '#27ae60', shadow: 'rgba(39,174,96,0.28)', icon: 'fa-check-circle' },
      error:   { bg: '#e74c3c', shadow: 'rgba(231,76,60,0.28)', icon: 'fa-exclamation-circle' },
      warning: { bg: '#e67e22', shadow: 'rgba(230,126,34,0.28)', icon: 'fa-exclamation-triangle' },
      info:    { bg: '#0b4b9b', shadow: 'rgba(11,75,155,0.28)', icon: 'fa-info-circle' }
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.className = 'siga-toast';
    toast.innerHTML = `<i class="fas ${c.icon}"></i><span>${message}</span>`;
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: ${c.bg}; color: white;
      padding: 13px 22px; border-radius: 12px;
      z-index: 100000;
      box-shadow: 0 10px 28px ${c.shadow};
      font-family: 'Inter', sans-serif;
      font-size: 14px; font-weight: 500;
      display: inline-flex; align-items: center; gap: 10px;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1);
      pointer-events: none;
      max-width: calc(100vw - 32px);
    `;
    document.body.appendChild(toast);
    void toast.offsetWidth;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(16px)';
      setTimeout(() => toast.remove(), 350);
    }, 2600);
  };
}

function showFeedback(message, type = 'info') {
  if (window.showFeedbackMessage) {
    // Tenta passar o tipo, se a assinatura suportar
    try {
      window.showFeedbackMessage(message, type);
    } catch (e) {
      window.showFeedbackMessage(message);
    }
  }
}

// ===================== CARREGAR DADOS =====================
function loadCatalogData() {
  if (window.catalogData && Array.isArray(window.catalogData)) {
    catalogItems = window.catalogData;

    if (window.favoritosPHP) {
      favorites = new Set();
      for (let key in window.favoritosPHP) {
        const parts = key.split('_');
        const id = parseInt(parts[1]);
        if (!isNaN(id)) favorites.add(String(id));
      }
    }

    if (window.reservasAtivas) {
      reservations = new Map(
        Object.entries(window.reservasAtivas).map(([id, reserva]) => [String(id), reserva.id_reserva])
      );
    }
    renderCatalog();
  } else {
    const grid = document.getElementById('catalog-grid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#94a3b8;">
          <i class="fas fa-exclamation-triangle" style="font-size:36px; opacity:.5; margin-bottom:10px; display:block;"></i>
          ${tCat('error')}
        </div>`;
    }
  }
}

function submitForm(form) {
  form.method = 'POST';
  form.action = form.action || window.location.pathname;
  form.submit();
}

// ===================== HELPERS DE TIPO =====================
function getItemTypeLabel(type, lang) {
  const t = type ? type.toLowerCase() : '';
  const map = {
    book: 'type_book', livro: 'type_book',
    magazine: 'type_magazine', revista: 'type_magazine',
    tcc: 'type_tcc'
  };
  return map[t] ? tCat(map[t]) : type;
}

function getTypeIcon(type) {
  const t = (type || '').toLowerCase();
  if (t === 'livro' || t === 'book') return 'fa-book';
  if (t === 'revista' || t === 'magazine') return 'fa-newspaper';
  if (t === 'tcc') return 'fa-graduation-cap';
  return 'fa-book';
}

function getBadgeClass(type) {
  const t = (type || '').toLowerCase();
  if (t === 'livro' || t === 'book') return 'tipo-livro';
  if (t === 'revista' || t === 'magazine') return 'tipo-revista';
  if (t === 'tcc') return 'tipo-tcc';
  return 'tipo-livro';
}

// ===================== RENDER =====================
function createItemCard(item, index, lang) {
  const card = document.createElement('article');
  card.className = 'catalogo-card';
  const itemId = String(item.id || item.id_catalogo);
  card.dataset.id = itemId;

  const isFav = favorites.has(itemId);
  const isRes = reservations.has(itemId);
  const itemType = item.tipo || item.type || 'livro';
  const typeLabel = getItemTypeLabel(itemType, lang);
  const coverUrl = item.capa_url || item.cover;
  const title = item.title || item.titulo || '';
  const author = item.author || item.autor || 'Autor não informado';

  // Capa
  let coverHTML;
  if (coverUrl && coverUrl !== '') {
    coverHTML = `<img src="${coverUrl}" alt="Capa de ${title}" loading="lazy">`;
  } else {
    const icon = getTypeIcon(itemType);
    coverHTML = `
      <div class="capa-placeholder">
        <i class="fas ${icon}"></i>
        <span>${title}</span>
      </div>`;
  }

  const badgeClass = getBadgeClass(itemType);

  card.innerHTML = `
    <div class="card-capa">
      ${coverHTML}
      <span class="tipo-badge ${badgeClass}">
        <i class="fas ${getTypeIcon(itemType)}"></i> ${typeLabel}
      </span>
    </div>
    <div class="card-info">
      <h4 title="${title}">${title}</h4>
      <p class="autor">${author}</p>
      <div class="card-actions">
        <button class="btn-favorite ${isFav ? 'favorited' : ''}" data-action="favorite" type="button" aria-label="${isFav ? tCat('action_favorited') : tCat('action_favorite')}">
          <i class="fas fa-heart"></i>
          <span>${isFav ? tCat('action_favorited') : tCat('action_favorite')}</span>
        </button>
        <button class="btn-reserve ${isRes ? 'reserved' : ''}" data-action="reserve" type="button"
                aria-pressed="${isRes}" ${isRes ? `title="${tCat('action_cancel_reserve')}"` : ''}>
          <i class="fas ${isRes ? 'fa-check' : 'fa-hand-holding'}"></i>
          <span>${isRes ? tCat('action_reserved') : tCat('action_reserve')}</span>
        </button>
      </div>
    </div>
  `;

  // Click no card → abre modal (exceto em botões)
  card.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    openItemModal(itemId);
  });

  // Ações
  const favBtn = card.querySelector('.btn-favorite');
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(itemId);
    });
  }

  const resBtn = card.querySelector('.btn-reserve');
  if (resBtn) {
    resBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleReserve(itemId);
    });
  }

  return card;
}

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  const empty = document.getElementById('catalog-empty');
  if (!grid) return;

  const lang = getCurrentLanguage();

  if (catalogItems.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  grid.innerHTML = '';
  catalogItems.forEach((item, idx) => {
    grid.appendChild(createItemCard(item, idx, lang));
  });
}

// ===================== AÇÕES =====================
function createActionForm(action, fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action === 'favorite' ? '../aluno/toggle_favorito.php' : '../api/aluno_reservas.php';
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  return form;
}

function submitCatalogAction(form) {
  // Formulário solto (fora do DOM) tem o submit ignorado pelos navegadores
  form.style.display = 'none';
  document.body.appendChild(form);
  form.submit();
}

function toggleFavorite(id) {
  const item = catalogItems.find(i => String(i.id || i.id_catalogo) === String(id));
  if (!item) return;

  const wasFav = favorites.has(id);
  if (wasFav && typeof window.uiConfirm === 'function') {
    window.uiConfirm(tCat('confirm_unfav_msg', { titulo: item.title || item.titulo || 'este item' }), {
      titulo: tCat('confirm_unfav_title'),
      tipo: 'warning',
      textoConfirmar: tCat('confirm_unfav_yes'),
      textoCancelar: tCat('confirm_unfav_no')
    }).then(ok => {
      if (ok) submitCatalogAction(createActionForm('favorite', {
        item_id: id,
        tipo_item: item.tipo || item.type || 'livro',
        redirect: '../aluno/catalogo.php'
      }));
    });
    return;
  }

  submitCatalogAction(createActionForm('favorite', {
    item_id: id,
    tipo_item: item.tipo || item.type || 'livro',
    redirect: '../aluno/catalogo.php'
  }));
}

function toggleReserve(id) {
  const item = catalogItems.find(i => String(i.id || i.id_catalogo) === String(id));
  if (!item) return;

  // Já reservado → o mesmo botão passa a cancelar a reserva
  if (reservations.has(String(id))) {
    confirmCancelReserve(id);
    return;
  }

  const qty = item.quantity ?? item.quantidade;
  if (qty !== undefined && qty <= 0 && !reservations.has(id)) {
    showFeedback(tCat('feedback_reserve_unavailable'), 'warning');
    return;
  }

  submitCatalogAction(createActionForm('reserve', {
    id_catalogo: id,
    tipo: item.tipo || item.type || 'livro',
    redirect: '../aluno/catalogo.php'
  }));
}

function confirmCancelReserve(id) {
  const item = catalogItems.find(i => String(i.id || i.id_catalogo) === String(id));
  const title = item?.title || item?.titulo || 'este item';

  if (typeof window.uiConfirm === 'function') {
    window.uiConfirm(tCat('confirm_cancel_msg', { titulo: title }), {
      titulo: tCat('confirm_cancel_title'),
      tipo: 'warning',
      textoConfirmar: tCat('confirm_cancel_yes'),
      textoCancelar: tCat('confirm_cancel_no')
    }).then(ok => {
      if (ok) submitCatalogAction(createActionForm('cancel', {
        action: 'cancel',
        id: reservations.get(String(id)) || id,
        redirect: '../aluno/catalogo.php'
      }));
    });
  } else if (confirm(tCat('confirm_cancel_msg', { titulo: title }))) {
    submitCatalogAction(createActionForm('cancel', {
      action: 'cancel',
      id: reservations.get(String(id)) || id,
      redirect: '../aluno/catalogo.php'
    }));
  }
}

// ===================== MODAL =====================
function openItemModal(id) {
  const item = catalogItems.find(i => String(i.id || i.id_catalogo) === String(id));
  if (!item) return;

  const lang = getCurrentLanguage();
  const isFav = favorites.has(id);
  const isRes = reservations.has(id);

  const overlay = document.getElementById('item-modal-overlay');
  const coverImg = document.getElementById('modal-cover-img');
  const coverPlaceholder = document.getElementById('modal-cover-placeholder');
  const titleEl = document.getElementById('modal-title');
  const authorEl = document.getElementById('modal-author');
  const yearEl = document.getElementById('modal-year');
  const categoryEl = document.getElementById('modal-category');
  const descEl = document.getElementById('modal-description');
  const availEl = document.getElementById('modal-availability');
  const typeBadgeEl = document.getElementById('modal-type-badge');
  const favBtn = document.getElementById('modal-favorite-btn');
  const favIcon = document.getElementById('modal-favorite-icon');
  const favText = document.getElementById('modal-favorite-text');
  const resBtn = document.getElementById('modal-reserve-btn');
  const resText = document.getElementById('modal-reserve-text');

  const itemType = item.tipo || item.type || 'livro';
  const typeLabel = getItemTypeLabel(itemType, lang);

  // Badge de tipo no modal
  if (typeBadgeEl) {
    typeBadgeEl.textContent = typeLabel;
    typeBadgeEl.style.background = '#eaf4ff';
    typeBadgeEl.style.color = '#0b4b9b';
    if (itemType === 'revista') { typeBadgeEl.style.background = '#fff4ec'; typeBadgeEl.style.color = '#d35400'; }
    if (itemType === 'tcc') { typeBadgeEl.style.background = '#f3e8ff'; typeBadgeEl.style.color = '#6a11cb'; }
  }

  // Capa
  const coverUrl = item.capa_url || item.cover;
  if (coverUrl && coverUrl !== '') {
    coverImg.src = coverUrl;
    coverImg.alt = item.title || item.titulo;
    coverImg.style.display = 'block';
    coverPlaceholder.style.display = 'none';
  } else {
    coverImg.style.display = 'none';
    coverPlaceholder.style.display = 'flex';
    coverPlaceholder.innerHTML = `
      <i class="fas ${getTypeIcon(itemType)}"></i>
      <span>${item.title || item.titulo || ''}</span>`;
  }

  // Textos
  titleEl.textContent = item.title || item.titulo || '';
  authorEl.textContent = item.author || item.autor || 'Autor não informado';

  const year = item.year || item.ano_publicacao;
  yearEl.textContent = year ? `Ano: ${year}` : 'Ano não informado';
  yearEl.style.display = 'inline-block';

  categoryEl.textContent = `Categoria: ${item.category || 'Não categorizado'}`;

  descEl.textContent = item.description || item.descricao || 'Sem descrição disponível.';

  // Disponibilidade
  const qty = item.quantity ?? item.quantidade;
  const isAvail = item.available !== undefined ? item.available : (qty > 0);
  if (isAvail) {
    availEl.textContent = tCat('availability_available');
    availEl.className = 'availability available';
  } else {
    availEl.textContent = tCat('availability_unavailable');
    availEl.className = 'availability unavailable';
  }

  // Botão favorito
  favIcon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
  favText.textContent = isFav ? tCat('action_favorited') : tCat('action_favorite');
  favBtn.classList.toggle('favorited', isFav);

  // Botão reservar
  resText.textContent = isRes ? tCat('action_reserved') : tCat('action_reserve');
  resBtn.classList.toggle('reserved', isRes);
  resBtn.disabled = false;
  resBtn.title = isRes ? tCat('action_cancel_reserve') : '';
  const resIcon = resBtn.querySelector('i');
  if (resIcon) resIcon.className = isRes ? 'fas fa-check' : 'fas fa-hand-holding';

  // Remove listeners antigos clonando
  const newFavBtn = favBtn.cloneNode(true);
  favBtn.parentNode.replaceChild(newFavBtn, favBtn);
  newFavBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFavorite(id);
  });

  const newResBtn = resBtn.cloneNode(true);
  resBtn.parentNode.replaceChild(newResBtn, resBtn);
  newResBtn.addEventListener('click', () => {
    toggleReserve(id);
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeItemModal() {
  const overlay = document.getElementById('item-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===================== IDIOMA =====================
function applyCatalogLanguage(lang) {
  const t = catalogTranslations[lang] || catalogTranslations.pt;

  const title = document.getElementById('catalog-title');
  const subtitle = document.getElementById('catalog-subtitle');
  if (title) title.innerHTML = `<i class="fas fa-compass"></i> ${t.catalog_title}`;
  if (subtitle) subtitle.textContent = t.catalog_subtitle;

  const noResults = document.getElementById('catalog-no-results');
  if (noResults) noResults.textContent = t.no_results;

  const searchInput = document.querySelector('.filter-search input');
  if (searchInput) searchInput.placeholder = t.search_placeholder;

  // Chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    const val = chip.value;
    const label = val === '' ? t.filter_all :
                  val === 'livro' ? t.filter_books :
                  val === 'revista' ? t.filter_magazines :
                  val === 'tcc' ? t.filter_tcc : val;
    const span = chip.querySelector('.chip-text');
    if (span) span.textContent = label;
  });
}

if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function (lang) {
    originalApply(lang);
    applyCatalogLanguage(lang);
  };
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  applyCatalogLanguage(getCurrentLanguage());
  loadCatalogData();

  const modalOverlay = document.getElementById('item-modal-overlay');
  const modalClose = document.getElementById('item-modal-close');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeItemModal();
    });
  }
  if (modalClose) modalClose.addEventListener('click', closeItemModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeItemModal();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'dashboard_lang') applyCatalogLanguage(e.newValue || 'pt');
  });

  document.addEventListener('languageChanged', (e) => {
    applyCatalogLanguage(e.detail.lang);
  });
});
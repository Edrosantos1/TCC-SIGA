/* =============================================
   favoritos.js — Meus Favoritos
   UX/UI v2: confirmação com ui_alerts + toast
   ============================================= */

// ===================== TRADUÇÕES =====================
const favoritosTranslations = {
  pt: {
    page_title: 'Meus Favoritos',
    page_subtitle: 'Seus itens salvos para leitura ou reserva futura.',
    remove_title: 'Remover dos favoritos',
    added_on: 'Adicionado em',
    empty_favoritos: 'Você ainda não tem nenhum item nos favoritos',
    explore_catalog: 'Explorar o Catálogo',
    favorites_search_placeholder: 'Buscar nos seus favoritos...',
    filter_all: 'Todos',
    filter_livro: 'Livros',
    filter_revista: 'Revistas',
    filter_tcc: 'TCCs',
    sort_recentes: 'Mais recentes',
    sort_antigos: 'Mais antigos',
    sort_titulo_asc: 'Título A-Z',
    sort_titulo_desc: 'Título Z-A',
    view_grid: 'Ver em grade',
    view_list: 'Ver em lista',
    view_grid_label: 'Grade',
    view_list_label: 'Lista',
    no_results_title: 'Nenhum item encontrado',
    no_results_text: 'Nenhum favorito corresponde aos filtros atuais.',
    clear_filters: 'Limpar filtros',
    confirm_remove_title: 'Remover dos favoritos',
    confirm_remove_msg: 'Deseja realmente remover "{titulo}" dos seus favoritos?',
    confirm_remove_yes: 'Sim, remover',
    confirm_remove_no: 'Cancelar',
    removing: 'Removendo...'
  },
  en: {
    page_title: 'My Favorites',
    page_subtitle: 'Your items saved for future reading or reservation.',
    remove_title: 'Remove from favorites',
    added_on: 'Added on',
    empty_favoritos: 'You don\u2019t have any favorites yet',
    explore_catalog: 'Explore the Catalog',
    favorites_search_placeholder: 'Search your favorites...',
    filter_all: 'All',
    filter_livro: 'Books',
    filter_revista: 'Magazines',
    filter_tcc: 'Theses',
    sort_recentes: 'Most recent',
    sort_antigos: 'Oldest',
    sort_titulo_asc: 'Title A-Z',
    sort_titulo_desc: 'Title Z-A',
    view_grid: 'Grid view',
    view_list: 'List view',
    view_grid_label: 'Grid',
    view_list_label: 'List',
    no_results_title: 'No items found',
    no_results_text: 'No favorite matches the current filters.',
    clear_filters: 'Clear filters',
    confirm_remove_title: 'Remove from favorites',
    confirm_remove_msg: 'Really remove "{titulo}" from your favorites?',
    confirm_remove_yes: 'Yes, remove',
    confirm_remove_no: 'Cancel',
    removing: 'Removing...'
  },
  es: {
    page_title: 'Mis Favoritos',
    page_subtitle: 'Tus elementos guardados para leer o reservar más tarde.',
    remove_title: 'Quitar de favoritos',
    added_on: 'Agregado el',
    empty_favoritos: 'Aún no tienes ningún elemento en favoritos',
    explore_catalog: 'Explorar el Catálogo',
    favorites_search_placeholder: 'Buscar en tus favoritos...',
    filter_all: 'Todos',
    filter_livro: 'Libros',
    filter_revista: 'Revistas',
    filter_tcc: 'Tesis',
    sort_recentes: 'Más recientes',
    sort_antigos: 'Más antiguos',
    sort_titulo_asc: 'Título A-Z',
    sort_titulo_desc: 'Título Z-A',
    view_grid: 'Ver en cuadrícula',
    view_list: 'Ver en lista',
    view_grid_label: 'Cuadrícula',
    view_list_label: 'Lista',
    no_results_title: 'Ningún elemento encontrado',
    no_results_text: 'Ningún favorito coincide con los filtros actuales.',
    clear_filters: 'Limpiar filtros',
    confirm_remove_title: 'Quitar de favoritos',
    confirm_remove_msg: '¿Realmente quitar "{titulo}" de tus favoritos?',
    confirm_remove_yes: 'Sí, quitar',
    confirm_remove_no: 'Cancelar',
    removing: 'Quitando...'
  }
};

if (typeof dashboardTranslations !== 'undefined') {
  for (let lang in favoritosTranslations) {
    if (dashboardTranslations[lang]) {
      Object.assign(dashboardTranslations[lang], favoritosTranslations[lang]);
    } else {
      dashboardTranslations[lang] = favoritosTranslations[lang];
    }
  }
}

// ===================== AUXILIARES =====================
function tFav(key, params = {}) {
  const lang = getCurrentLanguage();
  const dict = favoritosTranslations[lang] || favoritosTranslations.pt;
  let text = dict[key] || key;
  for (let [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return text;
}

function applyFavoritosLanguage(lang) {
  const dict = favoritosTranslations[lang] || favoritosTranslations.pt;

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
}

if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function (lang) {
    originalApply(lang);
    applyFavoritosLanguage(lang);
  };
}

// ===================== REMOÇÃO COM CONFIRMAÇÃO =====================
function attachRemoveHandlers() {
  document.querySelectorAll('.form-remover-favorito').forEach(form => {
    if (form.dataset.bound === '1') return;
    form.dataset.bound = '1';
    form.addEventListener('submit', handleRemoveSubmit);
  });
}

async function handleRemoveSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const btn = form.querySelector('.btn-remover-favorito');
  const card = form.closest('.favorito-card');
  const titulo = card?.dataset.titulo || 'este item';

  // Se uiConfirm existir, pede confirmação; senão, segue direto
  if (typeof window.uiConfirm === 'function') {
    const ok = await window.uiConfirm(
      tFav('confirm_remove_msg', { titulo }),
      {
        titulo: tFav('confirm_remove_title'),
        tipo: 'warning',
        textoConfirmar: tFav('confirm_remove_yes'),
        textoCancelar: tFav('confirm_remove_no')
      }
    );
    if (!ok) return;
  }

  // Feedback visual: botão em loading
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
    btn.title = tFav('removing');
  }

  // Animação de saída do card antes de submeter
  if (card) {
    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
  }

  // Envia o form após a animação
  setTimeout(() => {
    form.submit();
  }, 200);
}

// ===================== BUSCA / FILTRO / SORT / VIEW =====================
const favState = {
  filter: 'todos',
  sort: 'recentes',
  search: '',
  view: 'grid'
};

function getFavoritoCards() {
  return Array.from(document.querySelectorAll('#favoritos-grid .favorito-card'));
}

function applyFiltersAndSort() {
  const grid = document.getElementById('favoritos-grid');
  const cards = getFavoritoCards();
  if (!grid || cards.length === 0) return;

  let visibleCount = 0;
  cards.forEach(card => {
    const tipo = card.dataset.tipo || '';
    const titulo = (card.dataset.titulo || '').toLowerCase();
    const autor = (card.dataset.autor || '').toLowerCase();

    const matchesFilter = favState.filter === 'todos' || tipo === favState.filter;
    const matchesSearch = !favState.search || titulo.includes(favState.search) || autor.includes(favState.search);
    const visible = matchesFilter && matchesSearch;

    card.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });

  const sorted = cards.slice().sort((a, b) => {
    switch (favState.sort) {
      case 'antigos':
        return (parseInt(a.dataset.data, 10) || 0) - (parseInt(b.dataset.data, 10) || 0);
      case 'titulo-asc':
        return (a.dataset.titulo || '').localeCompare(b.dataset.titulo || '', 'pt', { sensitivity: 'base' });
      case 'titulo-desc':
        return (b.dataset.titulo || '').localeCompare(a.dataset.titulo || '', 'pt', { sensitivity: 'base' });
      case 'recentes':
      default:
        return (parseInt(b.dataset.data, 10) || 0) - (parseInt(a.dataset.data, 10) || 0);
    }
  });
  sorted.forEach(card => grid.appendChild(card));

  const noResults = document.getElementById('favoritos-no-results');
  if (noResults) noResults.hidden = visibleCount !== 0;
}

function setFavoritosView(view, grid, buttons) {
  favState.view = view;
  grid.classList.toggle('list-view', view === 'list');
  buttons.forEach(btn => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  try { localStorage.setItem('favoritos_view', view); } catch (e) {}
}

function setFavoritosFilter(chips, filter) {
  chips.forEach(chip => {
    const active = chip.dataset.filter === filter;
    chip.classList.toggle('active', active);
    chip.disabled = active;
    chip.setAttribute('aria-pressed', String(active));
  });
}

function initFavoritosToolbar() {
  const toolbar = document.getElementById('fav-toolbar');
  if (!toolbar) return;

  const searchInput = document.getElementById('fav-search-input');
  const chips = toolbar.querySelectorAll('.fav-chip');
  const sortSelect = document.getElementById('fav-sort-select');
  const viewButtons = toolbar.querySelectorAll('.fav-view-toggle button');
  const clearBtn = document.getElementById('fav-clear-filters');
  const grid = document.getElementById('favoritos-grid');

  setFavoritosFilter(chips, favState.filter);

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const value = e.target.value;
      debounceTimer = setTimeout(() => {
        favState.search = value.trim().toLowerCase();
        applyFiltersAndSort();
      }, 180);
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      favState.filter = chip.dataset.filter;
      setFavoritosFilter(chips, favState.filter);
      applyFiltersAndSort();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      favState.sort = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (viewButtons.length && grid) {
    let savedView = 'grid';
    try { savedView = localStorage.getItem('favoritos_view') || 'grid'; } catch (e) {}
    setFavoritosView(savedView, grid, viewButtons);
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => setFavoritosView(btn.dataset.view, grid, viewButtons));
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      favState.filter = 'todos';
      favState.search = '';
      if (searchInput) searchInput.value = '';
      setFavoritosFilter(chips, favState.filter);
      applyFiltersAndSort();
    });
  }
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  applyFavoritosLanguage(getCurrentLanguage());
  attachRemoveHandlers();
  initFavoritosToolbar();

  window.addEventListener('storage', (e) => {
    if (e.key === 'siga-idioma') applyFavoritosLanguage(e.newValue || 'pt');
  });

  document.addEventListener('languageChanged', (e) => {
    applyFavoritosLanguage(e.detail.lang);
  });
});
// catalogo.js
// ===================== DADOS VINDOS DA API =====================
let catalogItems = [];
let isLoading = false;

// ===================== TRADUÇÕES DO CATÁLOGO =====================
const catalogTranslations = {
  pt: {
    catalog_title: 'Catálogo',
    catalog_subtitle: 'Explore nosso acervo de livros, revistas e TCCs',
    filter_category: 'Categoria',
    filter_sort: 'Ordenar por',
    filter_all: 'Todos',
    filter_books: 'Livros',
    filter_magazines: 'Revistas',
    filter_tcc: 'TCCs',
    sort_relevance: 'Relevância',
    sort_title: 'Título',
    sort_author: 'Autor',
    sort_year: 'Ano',
    search_placeholder: 'Buscar no catálogo...',
    no_results: 'Nenhum resultado encontrado',
    details_title: 'Detalhes',
    availability_available: 'Disponível',
    availability_unavailable: 'Indisponível',
    action_favorite: 'Favoritar',
    action_favorited: 'Favoritado',
    action_reserve: 'Reservar',
    action_reserved: 'Reservado',
    load_more: 'Carregar mais',
    type_book: 'Livro',
    type_magazine: 'Revista',
    type_tcc: 'TCC',
    loading: 'Carregando catálogo...',
    error: 'Erro ao carregar o catálogo. Tente novamente.',
  },
  en: {
    catalog_title: 'Catalog',
    catalog_subtitle: 'Explore our collection of books, magazines and theses',
    filter_category: 'Category',
    filter_sort: 'Sort by',
    filter_all: 'All',
    filter_books: 'Books',
    filter_magazines: 'Magazines',
    filter_tcc: 'Theses',
    sort_relevance: 'Relevance',
    sort_title: 'Title',
    sort_author: 'Author',
    sort_year: 'Year',
    search_placeholder: 'Search in catalog...',
    no_results: 'No results found',
    details_title: 'Details',
    availability_available: 'Available',
    availability_unavailable: 'Unavailable',
    action_favorite: 'Favorite',
    action_favorited: 'Favorited',
    action_reserve: 'Reserve',
    action_reserved: 'Reserved',
    load_more: 'Load more',
    type_book: 'Book',
    type_magazine: 'Magazine',
    type_tcc: 'Thesis',
    loading: 'Loading catalog...',
    error: 'Error loading catalog. Please try again.',
  },
  es: {
    catalog_title: 'Catálogo',
    catalog_subtitle: 'Explora nuestro acervo de libros, revistas y TFCs',
    filter_category: 'Categoría',
    filter_sort: 'Ordenar por',
    filter_all: 'Todos',
    filter_books: 'Libros',
    filter_magazines: 'Revistas',
    filter_tcc: 'TFCs',
    sort_relevance: 'Relevancia',
    sort_title: 'Título',
    sort_author: 'Autor',
    sort_year: 'Año',
    search_placeholder: 'Buscar en el catálogo...',
    no_results: 'No se encontraron resultados',
    details_title: 'Detalles',
    availability_available: 'Disponible',
    availability_unavailable: 'No disponible',
    action_favorite: 'Favoritar',
    action_favorited: 'Favorito',
    action_reserve: 'Reservar',
    action_reserved: 'Reservado',
    load_more: 'Cargar más',
    type_book: 'Libro',
    type_magazine: 'Revista',
    type_tcc: 'TFC',
    loading: 'Cargando catálogo...',
    error: 'Error al cargar el catálogo. Intente de nuevo.',
  }
};

// Mesclar com as traduções do dashboard (se existirem)
if (typeof dashboardTranslations !== 'undefined') {
  for (let lang in catalogTranslations) {
    if (dashboardTranslations[lang]) {
      Object.assign(dashboardTranslations[lang], catalogTranslations[lang]);
    } else {
      dashboardTranslations[lang] = catalogTranslations[lang];
    }
  }
}

// ===================== ESTADO =====================
let currentItems = [];
let displayedItems = [];
let itemsPerPage = 12;
let currentPage = 0;
let favorites = new Set();
let reservations = new Set();

// ===================== FUNÇÕES AUXILIARES =====================
function getCurrentLanguage() {
  return localStorage.getItem('dashboard_lang') || 'pt';
}

function getCatalogTranslation(key, lang) {
  const t = catalogTranslations[lang] || catalogTranslations.pt;
  return t[key] || key;
}

// ===================== GARANTIR FUNÇÃO DE FEEDBACK =====================
// Se a função global do dashboard não existir, cria uma fallback simples.
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

// ===================== CARREGAR DADOS DA API =====================
async function fetchCatalog() {
  const grid = document.getElementById('catalog-grid');
  const empty = document.getElementById('catalog-empty');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const lang = getCurrentLanguage();

  // Exibe mensagem de carregamento
  if (grid) {
    grid.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> ${getCatalogTranslation('loading', lang)}</div>`;
  }
  if (empty) empty.style.display = 'none';
  if (loadMoreBtn) loadMoreBtn.style.display = 'none';

  try {
    const response = await fetch('/S.I.G.A/api/catalogo.php', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    catalogItems = data;
    currentItems = [...catalogItems];
    displayedItems = [];

    loadCatalogState();
    applyFilters();

    console.log('Catálogo carregado com sucesso!', catalogItems.length, 'itens');
  } catch (error) {
    console.error('Erro ao carregar catálogo:', error);
    if (grid) {
      grid.innerHTML = `<div class="loading-error"><i class="fas fa-exclamation-triangle"></i> ${getCatalogTranslation('error', lang)}</div>`;
    }
    window.showFeedbackMessage(getCatalogTranslation('error', lang));
  }
}

// ===================== ESTADO LOCAL STORAGE =====================
function loadCatalogState() {
  try {
    const fav = localStorage.getItem('catalog_favorites');
    if (fav) favorites = new Set(JSON.parse(fav));
    const res = localStorage.getItem('catalog_reservations');
    if (res) reservations = new Set(JSON.parse(res));
  } catch (e) { console.warn('Erro ao carregar estado do catálogo', e); }
}

function saveCatalogState() {
  localStorage.setItem('catalog_favorites', JSON.stringify([...favorites]));
  localStorage.setItem('catalog_reservations', JSON.stringify([...reservations]));
}

// ===================== RENDERIZAÇÃO =====================
function getItemTypeLabel(type, lang) {
  const map = {
    book: getCatalogTranslation('type_book', lang),
    magazine: getCatalogTranslation('type_magazine', lang),
    tcc: getCatalogTranslation('type_tcc', lang),
  };
  return map[type] || type;
}

function getCoverColor(index) {
  const colors = [
    '#0b4b9b', '#17c8cc', '#6a11cb', '#f7971e', '#e91e63',
    '#11998e', '#4568dc', '#c94b4b', '#134e5e', '#ff6b6b',
    '#4ecdc4', '#45b7d1', '#f9ca24', '#6ab04c', '#eb4d4b'
  ];
  return colors[index % colors.length];
}

function createItemCard(item, index, lang) {
  const card = document.createElement('div');
  card.className = 'catalog-item-card';
  card.dataset.id = item.id;

  const isFav = favorites.has(item.id);
  const isRes = reservations.has(item.id);
  const typeLabel = getItemTypeLabel(item.type, lang);
  const coverColor = getCoverColor(index);

  let coverHTML;
  if (item.cover) {
    coverHTML = `<img src="${item.cover}" alt="${item.title}" class="card-cover">`;
  } else {
    coverHTML = `
      <div class="card-cover-placeholder" style="background: ${coverColor}">
        <i class="fas ${item.type === 'book' ? 'fa-book' : item.type === 'magazine' ? 'fa-newspaper' : 'fa-graduation-cap'}"></i>
        <span>${item.title}</span>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="card-cover-wrapper">
      ${coverHTML}
      <span class="card-type-badge">${typeLabel}</span>
    </div>
    <div class="card-info">
      <div class="card-title">${item.title}</div>
      <div class="card-author">${item.author}</div>
      <div class="card-meta">
        <span>${item.year}</span>
        <span>${item.category}</span>
      </div>
      <div class="card-actions">
        <button class="btn-favorite ${isFav ? 'favorited' : ''}" data-action="favorite">
          <i class="fas ${isFav ? 'fa-heart' : 'fa-heart'}"></i>
          <span>${isFav ? getCatalogTranslation('action_favorited', lang) : getCatalogTranslation('action_favorite', lang)}</span>
        </button>
        <button class="btn-reserve ${isRes ? 'reserved' : ''}" data-action="reserve">
          <i class="fas fa-hand-holding"></i>
          <span>${isRes ? getCatalogTranslation('action_reserved', lang) : getCatalogTranslation('action_reserve', lang)}</span>
        </button>
      </div>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    openItemModal(item.id);
  });

  const favBtn = card.querySelector('.btn-favorite');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  });

  const resBtn = card.querySelector('.btn-reserve');
  resBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleReserve(item.id);
  });

  return card;
}

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  const empty = document.getElementById('catalog-empty');
  const loadMoreBtn = document.getElementById('load-more-btn');

  if (!grid) return;

  const lang = getCurrentLanguage();
  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;

  if (currentPage === 0) {
    grid.innerHTML = '';
    displayedItems = [];
  }

  const itemsToShow = currentItems.slice(start, end);

  if (itemsToShow.length === 0 && currentPage === 0) {
    empty.style.display = 'block';
    loadMoreBtn.style.display = 'none';
    return;
  }

  empty.style.display = 'none';

  itemsToShow.forEach((item, idx) => {
    const card = createItemCard(item, start + idx, lang);
    grid.appendChild(card);
    displayedItems.push(item);
  });

  if (end >= currentItems.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-block';
  }
}

// ===================== FILTROS E ORDENAÇÃO =====================
function applyFilters() {
  const category = document.getElementById('filter-category')?.value || 'all';
  const sort = document.getElementById('filter-sort')?.value || 'relevance';
  const searchTerm = document.getElementById('filter-search')?.value.toLowerCase().trim() || '';

  let filtered = [...catalogItems];

  if (category !== 'all') {
    filtered = filtered.filter(item => item.type === category);
  }

  if (searchTerm) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.author.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  }

  switch (sort) {
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'author':
      filtered.sort((a, b) => a.author.localeCompare(b.author));
      break;
    case 'year':
      filtered.sort((a, b) => b.year - a.year);
      break;
    default:
      break;
  }

  currentItems = filtered;
  currentPage = 0;
  renderCatalog();
}

// ===================== AÇÕES =====================
function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
    window.showFeedbackMessage('Removido dos favoritos');
  } else {
    favorites.add(id);
    window.showFeedbackMessage('Adicionado aos favoritos');
  }
  saveCatalogState();
  refreshCurrentView();
}

function toggleReserve(id) {
  if (reservations.has(id)) {
    reservations.delete(id);
    window.showFeedbackMessage('Reserva cancelada');
  } else {
    const item = catalogItems.find(i => i.id === id);
    if (item && !item.available) {
      window.showFeedbackMessage('Item indisponível para reserva');
      return;
    }
    reservations.add(id);
    window.showFeedbackMessage('Reserva realizada com sucesso!');
  }
  saveCatalogState();
  refreshCurrentView();
}

function refreshCurrentView() {
  const page = currentPage;
  currentPage = 0;
  renderCatalog();
  if (page > 0 && currentItems.length > itemsPerPage) {
    for (let i = 0; i < page; i++) {
      loadMoreItems();
    }
  }
}

function loadMoreItems() {
  const totalItems = currentItems.length;
  const displayedCount = displayedItems.length;
  if (displayedCount < totalItems) {
    currentPage++;
    renderCatalog();
  }
}

// ===================== MODAL =====================
function openItemModal(id) {
  const item = catalogItems.find(i => i.id === id);
  if (!item) return;

  const lang = getCurrentLanguage();
  const isFav = favorites.has(id);
  const isRes = reservations.has(id);
  const coverColor = getCoverColor(catalogItems.indexOf(item));

  const overlay = document.getElementById('item-modal-overlay');
  const coverImg = document.getElementById('modal-cover-img');
  const coverPlaceholder = document.getElementById('modal-cover-placeholder');
  const titleEl = document.getElementById('modal-title');
  const authorEl = document.getElementById('modal-author');
  const yearEl = document.getElementById('modal-year');
  const categoryEl = document.getElementById('modal-category');
  const typeEl = document.getElementById('modal-type');
  const descEl = document.getElementById('modal-description');
  const availEl = document.getElementById('modal-availability');
  const favBtn = document.getElementById('modal-favorite-btn');
  const favIcon = document.getElementById('modal-favorite-icon');
  const favText = document.getElementById('modal-favorite-text');
  const resBtn = document.getElementById('modal-reserve-btn');
  const resText = document.getElementById('modal-reserve-text');

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
  categoryEl.textContent = `Categoria: ${item.category}`;
  typeEl.textContent = `Tipo: ${getItemTypeLabel(item.type, lang)}`;
  descEl.textContent = item.description || 'Sem descrição disponível.';

  if (item.available) {
    availEl.textContent = getCatalogTranslation('availability_available', lang);
    availEl.className = 'availability available';
  } else {
    availEl.textContent = getCatalogTranslation('availability_unavailable', lang);
    availEl.className = 'availability unavailable';
  }

  const favLabel = isFav ? getCatalogTranslation('action_favorited', lang) : getCatalogTranslation('action_favorite', lang);
  favIcon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
  favText.textContent = favLabel;
  favBtn.classList.toggle('favorited', isFav);

  const resLabel = isRes ? getCatalogTranslation('action_reserved', lang) : getCatalogTranslation('action_reserve', lang);
  resText.textContent = resLabel;
  resBtn.classList.toggle('reserved', isRes);

  const newFavBtn = favBtn.cloneNode(true);
  favBtn.parentNode.replaceChild(newFavBtn, favBtn);
  newFavBtn.addEventListener('click', () => {
    toggleFavorite(id);
    openItemModal(id);
  });

  const newResBtn = resBtn.cloneNode(true);
  resBtn.parentNode.replaceChild(newResBtn, resBtn);
  newResBtn.addEventListener('click', () => {
    toggleReserve(id);
    openItemModal(id);
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeItemModal() {
  const overlay = document.getElementById('item-modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  applyCatalogLanguage(getCurrentLanguage());
  fetchCatalog();

  const filterCategory = document.getElementById('filter-category');
  const filterSort = document.getElementById('filter-sort');
  const filterSearch = document.getElementById('filter-search');
  const filterSearchBtn = document.getElementById('filter-search-btn');

  if (filterCategory) filterCategory.addEventListener('change', applyFilters);
  if (filterSort) filterSort.addEventListener('change', applyFilters);
  if (filterSearch) filterSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyFilters();
  });
  if (filterSearchBtn) filterSearchBtn.addEventListener('click', applyFilters);

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreItems);

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
    if (e.key === 'dashboard_lang') {
      const lang = e.newValue || 'pt';
      applyCatalogLanguage(lang);
    }
  });

  document.addEventListener('languageChanged', (e) => {
    applyCatalogLanguage(e.detail.lang);
  });

  console.log('%cCatálogo SiGA ITJ carregado!', 'color: #0b4b9b; font-weight: bold;');
});

// ===================== APLICA IDIOMA =====================
function applyCatalogLanguage(lang) {
  const t = catalogTranslations[lang] || catalogTranslations.pt;

  document.getElementById('catalog-title').textContent = t.catalog_title;
  document.getElementById('catalog-subtitle').textContent = t.catalog_subtitle;

  const catLabel = document.getElementById('filter-category-label');
  if (catLabel) catLabel.textContent = t.filter_category;

  const sortLabel = document.getElementById('filter-sort-label');
  if (sortLabel) sortLabel.textContent = t.filter_sort;

  const catSelect = document.getElementById('filter-category');
  if (catSelect) {
    const options = catSelect.options;
    for (let opt of options) {
      const val = opt.value;
      if (val === 'all') opt.textContent = t.filter_all;
      else if (val === 'book') opt.textContent = t.filter_books;
      else if (val === 'magazine') opt.textContent = t.filter_magazines;
      else if (val === 'tcc') opt.textContent = t.filter_tcc;
    }
  }

  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) {
    const options = sortSelect.options;
    for (let opt of options) {
      const val = opt.value;
      if (val === 'relevance') opt.textContent = t.sort_relevance;
      else if (val === 'title') opt.textContent = t.sort_title;
      else if (val === 'author') opt.textContent = t.sort_author;
      else if (val === 'year') opt.textContent = t.sort_year;
    }
  }

  const searchInput = document.getElementById('filter-search');
  if (searchInput) searchInput.placeholder = t.search_placeholder;

  const emptyMsg = document.getElementById('catalog-no-results');
  if (emptyMsg) emptyMsg.textContent = t.no_results;

  const loadBtn = document.getElementById('load-more-btn');
  if (loadBtn) loadBtn.textContent = t.load_more;

  if (catalogItems.length > 0) {
    refreshCurrentView();
  }
}

if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function(lang) {
    originalApply(lang);
    applyCatalogLanguage(lang);
  };
}
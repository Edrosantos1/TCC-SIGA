// catalogo.js - Versão com dados injetados via PHP

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

// ===================== ESTADO GLOBAL =====================
let catalogItems = [];
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

// Feedback (fallback se não existir a função global)
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

// ===================== CARREGAR DADOS (INJETADOS) =====================
function loadCatalogData() {
  if (window.catalogData && Array.isArray(window.catalogData)) {
    catalogItems = window.catalogData;
    currentItems = [...catalogItems];
    displayedItems = [];
    currentPage = 0;

    // Carregar favoritos do PHP (já vem no window.favoritosPHP)
    if (window.favoritosPHP) {
      favorites = new Set();
      for (let key in window.favoritosPHP) {
        // key é "tipo_id", mas o toggle_favorito usa apenas item_id
        // Precisamos extrair o id. O formato é "livro_1", "tcc_2", etc.
        const parts = key.split('_');
        const id = parseInt(parts[1]);
        if (!isNaN(id)) favorites.add(id);
      }
    }

    // Carregar reservas do localStorage (se houver)
    try {
      const res = localStorage.getItem('catalog_reservations');
      if (res) reservations = new Set(JSON.parse(res));
    } catch(e) {}

    renderCatalog();
    const empty = document.getElementById('catalog-empty');
    if (empty) empty.style.display = 'none';
    const loadMore = document.getElementById('load-more-btn');
    if (loadMore) loadMore.style.display = currentItems.length > itemsPerPage ? 'inline-block' : 'none';

    console.log(`Catálogo carregado: ${catalogItems.length} itens.`);
  } else {
    console.warn('Dados do catálogo não encontrados (window.catalogData).');
    const grid = document.getElementById('catalog-grid');
    if (grid) {
      grid.innerHTML = `<div class="loading-error"><i class="fas fa-exclamation-triangle"></i> ${getCatalogTranslation('error', getCurrentLanguage())}</div>`;
    }
  }
}

// ===================== ESTADO LOCAL STORAGE (RESERVAS) =====================
function saveCatalogState() {
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
        <span>${item.year || ''}</span>
        <span>${item.category || ''}</span>
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
      (item.category && item.category.toLowerCase().includes(searchTerm))
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
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
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
  // Atualiza o estado visual nos cards e modal
  refreshCurrentView();
}

function toggleReserve(id) {
  if (reservations.has(id)) {
    reservations.delete(id);
    window.showFeedbackMessage('Reserva cancelada');
  } else {
    // Verificar disponibilidade
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
  // Re-renderiza a lista atual mantendo a página
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
  yearEl.textContent = item.year ? `Ano: ${item.year}` : 'Ano não informado';
  categoryEl.textContent = `Categoria: ${item.category || 'Não categorizado'}`;
  typeEl.textContent = `Tipo: ${getItemTypeLabel(item.type, lang)}`;
  descEl.textContent = item.description || 'Sem descrição disponível.';

  if (item.available) {
    availEl.textContent = getCatalogTranslation('availability_available', lang);
    availEl.className = 'availability available';
  } else {
    availEl.textContent = getCatalogTranslation('availability_unavailable', lang);
    availEl.className = 'availability unavailable';
  }

  // Atualizar botão favoritar
  const favLabel = isFav ? getCatalogTranslation('action_favorited', lang) : getCatalogTranslation('action_favorite', lang);
  favIcon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
  favText.textContent = favLabel;
  favBtn.classList.toggle('favorited', isFav);

  // Atualizar botão reservar
  const resLabel = isRes ? getCatalogTranslation('action_reserved', lang) : getCatalogTranslation('action_reserve', lang);
  resText.textContent = resLabel;
  resBtn.classList.toggle('reserved', isRes);

  // Configurar actions
  // Remover listeners antigos clonando
  const newFavBtn = favBtn.cloneNode(true);
  favBtn.parentNode.replaceChild(newFavBtn, favBtn);
  newFavBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFavorite(id);
    openItemModal(id);
  });

  const newResBtn = resBtn.cloneNode(true);
  resBtn.parentNode.replaceChild(newResBtn, resBtn);
  newResBtn.addEventListener('click', () => {
    toggleReserve(id);
    openItemModal(id);
  });

  // Abrir modal
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
  // Aplicar idioma inicial
  applyCatalogLanguage(getCurrentLanguage());

  // Carregar dados do catálogo (injetados)
  loadCatalogData();

  // Configurar filtros
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

  // Modal
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

  // Escuta mudanças de idioma
  window.addEventListener('storage', (e) => {
    if (e.key === 'dashboard_lang') {
      const lang = e.newValue || 'pt';
      applyCatalogLanguage(lang);
    }
  });

  // Disparar evento de idioma (caso o dashboard já tenha aplicado)
  document.addEventListener('languageChanged', (e) => {
    applyCatalogLanguage(e.detail.lang);
  });

  console.log('%cCatálogo SiGA ITJ carregado com dados unificados!', 'color: #0b4b9b; font-weight: bold;');
});

// ===================== APLICA IDIOMA =====================
function applyCatalogLanguage(lang) {
  const t = catalogTranslations[lang] || catalogTranslations.pt;

  const title = document.getElementById('catalog-title');
  const subtitle = document.getElementById('catalog-subtitle');
  if (title) title.textContent = t.catalog_title;
  if (subtitle) subtitle.textContent = t.catalog_subtitle;

  const catLabel = document.getElementById('filter-category-label');
  if (catLabel) catLabel.textContent = t.filter_category;

  const sortLabel = document.getElementById('filter-sort-label');
  if (sortLabel) sortLabel.textContent = t.filter_sort;

  const catSelect = document.getElementById('filter-category');
  if (catSelect) {
    for (let opt of catSelect.options) {
      const val = opt.value;
      if (val === 'all') opt.textContent = t.filter_all;
      else if (val === 'book') opt.textContent = t.filter_books;
      else if (val === 'magazine') opt.textContent = t.filter_magazines;
      else if (val === 'tcc') opt.textContent = t.filter_tcc;
    }
  }

  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) {
    for (let opt of sortSelect.options) {
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

  // Atualizar textos dos cards já renderizados
  document.querySelectorAll('.catalog-item-card').forEach(card => {
    const id = parseInt(card.dataset.id);
    const item = catalogItems.find(i => i.id === id);
    if (!item) return;
    const isFav = favorites.has(id);
    const isRes = reservations.has(id);
    const favSpan = card.querySelector('.btn-favorite span');
    const resSpan = card.querySelector('.btn-reserve span');
    if (favSpan) {
      favSpan.textContent = isFav ? t.action_favorited : t.action_favorite;
    }
    if (resSpan) {
      resSpan.textContent = isRes ? t.action_reserved : t.action_reserve;
    }
    const typeBadge = card.querySelector('.card-type-badge');
    if (typeBadge) {
      typeBadge.textContent = getItemTypeLabel(item.type, lang);
    }
  });

  // Se houver modal aberto, atualizar também
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) {
    // Não temos contexto do item atual, mas podemos ignorar ou atualizar somente se aberto
  }
}

// ===================== INTEGRAÇÃO COM O SELETOR DE IDIOMA GLOBAL =====================
// Se a função applyDashboardLanguage existir, estendemos
if (typeof applyDashboardLanguage === 'function') {
  const originalApply = applyDashboardLanguage;
  window.applyDashboardLanguage = function(lang) {
    originalApply(lang);
    applyCatalogLanguage(lang);
  };
}
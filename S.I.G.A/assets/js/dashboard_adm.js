// =============================================
// dashboard_adm.js — APENAS PESQUISA
// =============================================

// ========== SIDEBAR ==========
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('collapseBtn');
  if (!sidebar || !collapseBtn) return;
  collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('adm_sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });
  if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }
}

// ========== DATA/HORA ==========
function renderDate() {
  const el = document.getElementById('welcome-date');
  if (!el) return;
  const now = new Date();
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  el.innerHTML = `${now.getDate()} de ${meses[now.getMonth()]}, ${now.getFullYear()}`;
}

// ========== PERFIL ==========
function initProfileDropdown() {
  const btn = document.getElementById('admin-profile-btn');
  const dropdown = document.getElementById('profile-dropdown');
  if (!btn || !dropdown) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.classList.toggle('open');
    dropdown.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      btn.classList.remove('open');
      dropdown.classList.remove('show');
    }
  });
}

// ========== NOTIFICAÇÕES (opcional) ==========
function initNotifications() {
  const btn = document.getElementById('notification-btn');
  const dropdown = document.getElementById('notification-dropdown');
  if (!btn || !dropdown) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

// ========== PESQUISA (PREFIXO) ==========
function initSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let timeoutId;

  input.addEventListener('input', function() {
    const q = this.value.trim();
    if (q.length === 0) {
      results.style.display = 'none';
      return;
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`buscar_dados.php?q=${encodeURIComponent(q)}`);
        const data = await response.json();

        if (data.error || !Array.isArray(data) || data.length === 0) {
          results.style.display = 'none';
          return;
        }

        results.innerHTML = '';
        data.slice(0, 6).forEach(item => {
          const div = document.createElement('div');
          div.className = 'search-result-item';
          div.innerHTML = `
            <i class="fas fa-user-graduate"></i>
            <div style="font-weight:600;font-size:14px;">${item.nome}</div>
            <span class="search-result-tag tag-aluno">Aluno</span>
          `;
          results.appendChild(div);
        });

        results.style.display = 'block';
      } catch (error) {
        console.error('Erro na busca:', error);
        results.style.display = 'none';
      }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.style.display = 'none';
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') results.style.display = 'none';
  });
}

// ========== ESCAPE HTML ==========
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
  initSidebar();
  renderDate();
  initProfileDropdown();
  initNotifications();
  initSearch();
  console.log('Dashboard com pesquisa de alunos (prefixo)');
});
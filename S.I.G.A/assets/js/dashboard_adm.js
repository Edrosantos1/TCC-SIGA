// =============================================
// dashboard_adm.js — SiGA ITJ (Painel Admin)
// =============================================

// ========== DADOS MOCKADOS ==========

const reservasData = [
  { id: 1, aluno: 'Ana Paula Silva',   livro: 'Clean Code',              data: '2025-06-05', status: 'pendente'  },
  { id: 2, aluno: 'Bruno Costa',       livro: 'Algoritmos — CLRS',       data: '2025-06-06', status: 'aprovada'  },
  { id: 3, aluno: 'Camila Rodrigues',  livro: 'O Programador Apaixonado', data: '2025-06-07', status: 'pendente'  },
  { id: 4, aluno: 'Diego Mendes',      livro: 'Python Fluente',          data: '2025-06-07', status: 'cancelada' },
  { id: 5, aluno: 'Elisa Ferreira',    livro: 'Código Limpo',            data: '2025-06-08', status: 'pendente'  },
];

const pendenciasData = [
  { id: 1, tipo: 'atrasado', aluno: 'Bruno Costa',       livro: 'DOM Scripting',         dias: 5  },
  { id: 2, tipo: 'multa',    aluno: 'Fernanda Lima',     livro: 'Arquitetura Limpa',     dias: 12 },
  { id: 3, tipo: 'reserva',  aluno: 'Gabriel Santos',    livro: 'Design Patterns',       dias: null },
];

const atividadeData = [
  { tipo: 'emprestimo',  texto: '<strong>Ana Paula Silva</strong> retirou <strong>Python Crash Course</strong>', tempo: 'Há 12 min'  },
  { tipo: 'devolucao',   texto: '<strong>Bruno Costa</strong> devolveu <strong>Clean Code</strong>',            tempo: 'Há 45 min'  },
  { tipo: 'reserva',     texto: '<strong>Camila Rodrigues</strong> reservou <strong>O Programador Apaixonado</strong>', tempo: 'Há 1h'      },
  { tipo: 'alerta',      texto: 'Livro <strong>DOM Scripting</strong> está <strong>5 dias atrasado</strong>',   tempo: 'Há 2h'      },
  { tipo: 'emprestimo',  texto: '<strong>Diego Mendes</strong> retirou <strong>Algoritmos — CLRS</strong>',     tempo: 'Ontem 16:30' },
  { tipo: 'devolucao',   texto: '<strong>Elisa Ferreira</strong> devolveu <strong>Código Limpo</strong>',       tempo: 'Ontem 14:00' },
];

const notificacoesData = [
  { id: 1, tipo: 'alerta',   mensagem: 'Bruno Costa está com 5 dias de atraso na devolução de "DOM Scripting".',    lida: false, tempo: 'Há 30 min' },
  { id: 2, tipo: 'reserva',  mensagem: 'Nova reserva pendente de Camila Rodrigues para "O Programador Apaixonado".', lida: false, tempo: 'Há 1h'     },
  { id: 3, tipo: 'multa',    mensagem: 'Fernanda Lima possui multa em aberto de R$ 12,00.',                         lida: false, tempo: 'Há 3h'     },
  { id: 4, tipo: 'sistema',  mensagem: 'Backup automático do sistema realizado com sucesso.',                        lida: false, tempo: 'Há 6h'     },
];

// ========== SIDEBAR COLLAPSE ==========

function initSidebar() {
  const sidebar    = document.getElementById('sidebar');
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
  const diasSemana = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  el.innerHTML = `
    <strong>${now.getDate()} de ${meses[now.getMonth()]}, ${now.getFullYear()}</strong>
    ${diasSemana[now.getDay()]}
  `;
}

// ========== PERFIL DROPDOWN ==========

function initProfileDropdown() {
  const btn      = document.getElementById('admin-profile-btn');
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

// ========== NOTIFICAÇÕES ==========

function renderNotificacoes() {
  const list  = document.getElementById('notification-list');
  const badge = document.getElementById('notification-badge');
  if (!list) return;

  const iconMap = {
    alerta:  'fas fa-exclamation-triangle',
    reserva: 'fas fa-bookmark',
    multa:   'fas fa-dollar-sign',
    sistema: 'fas fa-cog',
  };

  list.innerHTML = '';

  const naoLidas = notificacoesData.filter(n => !n.lida).length;
  if (badge) {
    badge.textContent = naoLidas;
    badge.style.display = naoLidas > 0 ? 'flex' : 'none';
  }

  if (notificacoesData.length === 0) {
    list.innerHTML = `<div class="empty-notifications"><i class="far fa-bell-slash"></i><p>Nenhuma notificação</p></div>`;
    return;
  }

  notificacoesData.forEach(notif => {
    const item = document.createElement('div');
    item.className = `notification-item ${!notif.lida ? 'unread' : ''}`;
    item.dataset.id = notif.id;
    item.innerHTML = `
      <div class="notification-icon"><i class="${iconMap[notif.tipo] || 'fas fa-info-circle'}"></i></div>
      <div class="notification-content">
        <div class="notification-message">${notif.mensagem}</div>
        <div class="notification-date"><i class="far fa-clock"></i> ${notif.tempo}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      notif.lida = true;
      renderNotificacoes();
    });
    list.appendChild(item);
  });
}

function initNotifications() {
  const btn      = document.getElementById('notification-btn');
  const dropdown = document.getElementById('notification-dropdown');
  const markAll  = document.getElementById('mark-read-btn');
  if (!btn || !dropdown) return;

  renderNotificacoes();

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
  if (markAll) {
    markAll.addEventListener('click', (e) => {
      e.stopPropagation();
      notificacoesData.forEach(n => n.lida = true);
      renderNotificacoes();
    });
  }
}

// ========== RESERVAS TABLE ==========

function renderReservas() {
  const tbody = document.getElementById('reservas-tbody');
  if (!tbody) return;

  const statusMap = {
    pendente:  { label: 'Pendente',  cls: 'status-pendente',  icon: 'fas fa-hourglass-half' },
    aprovada:  { label: 'Aprovada',  cls: 'status-aprovada',  icon: 'fas fa-check-circle'   },
    cancelada: { label: 'Cancelada', cls: 'status-cancelada', icon: 'fas fa-times-circle'   },
  };

  tbody.innerHTML = '';

  reservasData.forEach(r => {
    const s = statusMap[r.status] || statusMap['pendente'];
    const acoes = r.status === 'pendente'
      ? `<button class="btn-acao btn-aprovar"  onclick="aprovarReserva(${r.id})">Aprovar</button>
         <button class="btn-acao btn-rejeitar" onclick="rejeitarReserva(${r.id})">Rejeitar</button>`
      : `<span style="font-size:12px;color:#94a3b8;">—</span>`;

    const dataFormatada = new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${r.aluno}</strong></td>
      <td>${r.livro}</td>
      <td>${dataFormatada}</td>
      <td><span class="status-badge ${s.cls}"><i class="${s.icon}"></i> ${s.label}</span></td>
      <td>${acoes}</td>
    `;
    tbody.appendChild(tr);
  });
}

function aprovarReserva(id) {
  const reserva = reservasData.find(r => r.id === id);
  if (reserva) {
    reserva.status = 'aprovada';
    renderReservas();
    showToast(`Reserva de "${reserva.livro}" aprovada!`, 'success');
  }
}

function rejeitarReserva(id) {
  const reserva = reservasData.find(r => r.id === id);
  if (reserva) {
    reserva.status = 'cancelada';
    renderReservas();
    showToast(`Reserva de "${reserva.livro}" rejeitada.`, 'error');
  }
}

// ========== PENDÊNCIAS ==========

function renderPendencias() {
  const list = document.getElementById('pendencias-list');
  if (!list) return;

  const tipoMap = {
    atrasado: { iconCls: 'pendencia-atrasado', icon: 'fas fa-clock',            label: 'Atraso na devolução' },
    multa:    { iconCls: 'pendencia-multa',    icon: 'fas fa-exclamation',      label: 'Multa em aberto'     },
    reserva:  { iconCls: 'pendencia-reserva',  icon: 'fas fa-bookmark',         label: 'Reserva aguardando'  },
  };

  list.innerHTML = '';

  pendenciasData.forEach(p => {
    const t = tipoMap[p.tipo] || tipoMap['atrasado'];
    const diasBadge = p.dias
      ? `<span class="pendencia-dias">${p.dias}d atraso</span>`
      : `<span class="pendencia-dias" style="background:#eaf4ff;color:#0b4b9b;">Novo</span>`;

    const item = document.createElement('div');
    item.className = 'pendencia-item';
    item.innerHTML = `
      <div class="pendencia-icon ${t.iconCls}"><i class="${t.icon}"></i></div>
      <div class="pendencia-info">
        <div class="pendencia-title">${p.aluno}</div>
        <div class="pendencia-sub">${p.livro} · ${t.label}</div>
      </div>
      ${diasBadge}
    `;
    list.appendChild(item);
  });

  // Atualiza badge do menu
  const navBadge = document.getElementById('pendencias-badge');
  if (navBadge) navBadge.textContent = pendenciasData.length;
}

// ========== ATIVIDADE TIMELINE ==========

function renderAtividade() {
  const container = document.getElementById('atividade-timeline');
  if (!container) return;

  const dotMap = {
    emprestimo: { cls: 'dot-emprestimo', icon: 'fas fa-book-open'  },
    devolucao:  { cls: 'dot-devolucao',  icon: 'fas fa-undo-alt'   },
    reserva:    { cls: 'dot-reserva',    icon: 'fas fa-bookmark'   },
    alerta:     { cls: 'dot-alerta',     icon: 'fas fa-exclamation' },
  };

  container.innerHTML = '';

  atividadeData.forEach(a => {
    const d = dotMap[a.tipo] || dotMap['emprestimo'];
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="timeline-dot ${d.cls}"><i class="${d.icon}"></i></div>
      <div class="timeline-content">
        <div class="timeline-action">${a.texto}</div>
        <div class="timeline-time"><i class="far fa-clock"></i> ${a.tempo}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

// ========== PESQUISA GLOBAL ==========

const searchMockData = [
  { tipo: 'aluno', nome: 'Ana Paula Silva',   sub: 'Matrícula #00142' },
  { tipo: 'aluno', nome: 'Bruno Costa',       sub: 'Matrícula #00098' },
  { tipo: 'livro', nome: 'Clean Code',        sub: 'Robert C. Martin' },
  { tipo: 'livro', nome: 'Python Fluente',    sub: 'Luciano Ramalho'  },
  { tipo: 'aluno', nome: 'Camila Rodrigues',  sub: 'Matrícula #00201' },
  { tipo: 'livro', nome: 'Código Limpo',      sub: 'Robert C. Martin' },
  { tipo: 'livro', nome: 'Algoritmos — CLRS', sub: 'Cormen et al.'    },
];

function initSearch() {
  const input   = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.style.display = 'none'; return; }

    const filtered = searchMockData.filter(d =>
      d.nome.toLowerCase().includes(q) || d.sub.toLowerCase().includes(q)
    );

    if (filtered.length === 0) { results.style.display = 'none'; return; }

    results.innerHTML = '';
    filtered.slice(0, 6).forEach(d => {
      const iconCls = d.tipo === 'aluno' ? 'fas fa-user-graduate' : 'fas fa-book';
      const tagCls  = d.tipo === 'aluno' ? 'tag-aluno' : 'tag-livro';
      const tagLbl  = d.tipo === 'aluno' ? 'Aluno' : 'Livro';
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = `
        <i class="${iconCls}"></i>
        <div>
          <div style="font-weight:600;font-size:14px;">${d.nome}</div>
          <div style="font-size:12px;color:#94a3b8;">${d.sub}</div>
        </div>
        <span class="search-result-tag ${tagCls}">${tagLbl}</span>
      `;
      results.appendChild(div);
    });

    results.style.display = 'block';
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

// ========== TOAST / FEEDBACK ==========

function showToast(message, type = 'success') {
  const bg = type === 'success' ? '#27ae60' : '#e74c3c';
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%);
    background: ${bg}; color: white;
    padding: 12px 24px; border-radius: 10px;
    z-index: 9999; box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
    opacity: 0; transition: opacity 0.3s;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = '1');
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  renderDate();
  initProfileDropdown();
  initNotifications();
  renderReservas();
  renderPendencias();
  renderAtividade();
  initSearch();

  console.log('%cPainel Admin SiGA ITJ carregado!', 'color: #e67e22; font-weight: bold;');
});
// =============================================
// dashboard_adm.js — COM NOTIFICAÇÕES (HISTÓRICO)
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

// ========== NOTIFICAÇÕES (HISTÓRICO) ==========
// ========== NOTIFICAÇÕES (HISTÓRICO) ==========
function initNotifications() {
  const btn = document.getElementById('notification-btn');
  const dropdown = document.getElementById('notification-dropdown');
  const list = document.getElementById('notification-list');
  const markReadBtn = document.querySelector('.mark-read-btn');
  
  if (!btn || !dropdown || !list) return;

  // Carregar histórico de notificações enviadas
  async function carregarNotificacoes() {
    try {
      const response = await fetch('buscar_notificacoes.php');
      const data = await response.json();

      if (data.error) {
        console.error('Erro ao carregar notificações:', data.error);
        list.innerHTML = `
          <div class="empty-notifications">
            <i class="far fa-bell-slash"></i>
            <p>Erro ao carregar notificações</p>
          </div>
        `;
        return;
      }

      if (data.length === 0) {
        list.innerHTML = `
          <div class="empty-notifications">
            <i class="far fa-bell-slash"></i>
            <p>Nenhuma notificação enviada</p>
          </div>
        `;
        return;
      }

      list.innerHTML = data.map(notif => {
        // 🔥 CORES DIFERENCIADAS
        const isPendencia = notif.tipo === 'pendencia';
        const corIcon = isPendencia ? '#e74c3c' : '#0b4b9b';
        const corBadge = isPendencia ? '#e74c3c' : '#0b4b9b';
        const icone = isPendencia ? 'fa-exclamation-triangle' : 'fa-info-circle';
        const label = isPendencia ? 'Pendência' : 'Aviso';
        
        return `
          <div class="notification-item" data-id="${notif.id}">
            <div class="notification-icon" style="color: ${corIcon};">
              <i class="fas ${icone}"></i>
            </div>
            <div class="notification-content">
              <div class="notification-message">
                <strong style="color: ${corBadge};">${label}</strong><br>
                ${escapeHtml(notif.mensagem)}
              </div>
              <div class="notification-footer">
                <span class="notification-date">${formatarData(notif.criado_em)}</span>
                <span class="notification-destinatarios">
                  <i class="fas fa-users"></i> ${notif.total_alunos} aluno(s)
                </span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Atualizar badge com total de notificações
      atualizarBadge(data.length);

    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      list.innerHTML = `
        <div class="empty-notifications">
          <i class="far fa-bell-slash"></i>
          <p>Erro ao carregar notificações</p>
        </div>
      `;
    }
  }

  // Atualizar badge do sininho
  function atualizarBadge(total) {
    const badge = document.querySelector('.notification-btn .badge');
    if (badge) {
      if (total > 0) {
        badge.textContent = total;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Formatar data
  function formatarData(data) {
    const d = new Date(data + ' UTC');
    const agora = new Date();
    const diff = Math.floor((agora - d) / 1000);
    
    if (diff < 60) return 'Agora pouco';
    if (diff < 3600) return Math.floor(diff / 60) + ' min atrás';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
    if (diff < 172800) return 'Ontem';
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  }

  // Escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Abrir/fechar dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
    if (dropdown.classList.contains('show')) {
      carregarNotificacoes();
    }
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });

  // Botão "Marcar todas como lidas" - na verdade recarrega
  if (markReadBtn) {
    markReadBtn.textContent = 'Atualizar';
    markReadBtn.addEventListener('click', () => {
      carregarNotificacoes();
      // Feedback visual
      markReadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
      setTimeout(() => {
        markReadBtn.innerHTML = 'Atualizar';
      }, 1000);
    });
  }

  // Carregar notificações ao abrir a página
  carregarNotificacoes();

  // Recarregar a cada 60 segundos
  setInterval(carregarNotificacoes, 60000);
}

// ========== COR ÚNICA ==========
function getAvatarColor() {
  return '#0b4b9b';
}

// ========== REDIRECIONAR ALUNO ==========
function redirecionarAluno(aluno) {
  const id = aluno.id;
  const nome = aluno.nome;
  const temReservas = aluno.tem_reservas;
  const temEmprestimos = aluno.tem_emprestimos;
  
  console.log('🔍 Aluno:', nome, 'Reservas:', temReservas, 'Empréstimos:', temEmprestimos);
  
  if (temReservas && temEmprestimos) {
    window.location.href = `perfil_aluno.php?id=${id}`;
    return;
  }
  
  if (temReservas) {
    window.location.href = `reservas_adm.php?aluno_id=${id}`;
    return;
  }
  
  if (temEmprestimos) {
    window.location.href = `pendencias_adm.php?aluno_id=${id}`;
    return;
  }
  
  alert(`O aluno ${nome} não possui reservas ou empréstimos ativos.`);
}

// ========== PESQUISA ==========
function initSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let timeoutId;

  input.addEventListener('input', function() {
    const q = this.value.trim();
    if (q.length === 0) {
      results.style.display = 'none';
      results.innerHTML = '';
      return;
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`buscar_dados.php?q=${encodeURIComponent(q)}`);
        const data = await response.json();

        if (data.error || !Array.isArray(data) || data.length === 0) {
          results.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999;">
              <i class="fas fa-search"></i> Nenhum aluno encontrado
            </div>
          `;
          results.style.display = 'block';
          return;
        }

        results.innerHTML = '';
        data.slice(0, 8).forEach(item => {
          const nome = item.nome || '?';
          const inicial = nome.trim().charAt(0).toUpperCase();
          const cor = getAvatarColor();
          const serie = item.serie_aluno || 'Aluno';
          
          let statusIcon = '';
          if (item.tem_reservas && item.tem_emprestimos) {
            statusIcon = '📚📖';
          } else if (item.tem_reservas) {
            statusIcon = '📚';
          } else if (item.tem_emprestimos) {
            statusIcon = '📖';
          } else {
            statusIcon = '';
          }
          
          const div = document.createElement('div');
          div.style.cssText = `
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 10px 16px !important;
            cursor: pointer !important;
            border-bottom: 1px solid #f0f0f0 !important;
            transition: background 0.2s !important;
          `;
          
          div.innerHTML = `
            <div style="
              width: 40px !important;
              height: 40px !important;
              border-radius: 50% !important;
              background-color: ${cor} !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: #fff !important;
              font-weight: 600 !important;
              font-size: 16px !important;
              flex-shrink: 0 !important;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            ">${inicial}</div>
            
            <div style="flex: 1 !important; min-width: 0 !important;">
              <div style="font-weight: 600 !important; font-size: 14px !important; color: #2d3748 !important;">
                ${escapeHtml(nome)}
              </div>
              <div style="font-size: 12px !important; color: #718096 !important;">
                ${escapeHtml(serie)}
              </div>
            </div>
            
            ${statusIcon ? `<div style="font-size: 14px !important; opacity: 0.6 !important;">${statusIcon}</div>` : ''}
          `;
          
          div.addEventListener('click', () => {
            redirecionarAluno(item);
          });
          
          div.addEventListener('mouseenter', () => {
            div.style.background = '#f8f9fa';
          });
          div.addEventListener('mouseleave', () => {
            div.style.background = 'transparent';
          });
          
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
      results.innerHTML = '';
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      results.style.display = 'none';
      results.innerHTML = '';
    }
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
  console.log('✅ Dashboard com histórico de notificações');
});
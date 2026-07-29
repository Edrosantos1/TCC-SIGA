// =============================================
// reservas_adm.js — SiGA ITJ Admin
// =============================================

// ========== VARIÁVEIS GLOBAIS ==========
let reservas = [];
let filtroAtual = 'todos';
let buscaAtual = '';

// ========== RENDERIZAR RESERVAS ==========
function renderizarReservas() {
    const tbody = document.getElementById('reservas-tbody');
    const emptyState = document.getElementById('empty-state');
    const emptyMessage = document.getElementById('empty-message');
    
    // Filtrar reservas
    let reservasFiltradas = reservas;
    
    // Filtrar por status
    if (filtroAtual !== 'todos') {
        reservasFiltradas = reservasFiltradas.filter(r => r.status === filtroAtual);
    }
    
    // Filtrar por busca
    if (buscaAtual.trim() !== '') {
        const termo = buscaAtual.toLowerCase().trim();
        reservasFiltradas = reservasFiltradas.filter(r => 
            r.aluno.toLowerCase().includes(termo) || 
            r.material.toLowerCase().includes(termo)
        );
    }
    
    // Atualizar badges
    atualizarBadges();
    
    // Mostrar/ocultar empty state
    if (reservasFiltradas.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        let mensagem = 'Não há reservas ';
        if (filtroAtual !== 'todos') {
            mensagem += `com status "${filtroAtual}" `;
        }
        if (buscaAtual.trim() !== '') {
            mensagem += `para a busca "${buscaAtual}"`;
        }
        emptyMessage.textContent = mensagem || 'Não há reservas para os filtros selecionados';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Renderizar linhas
    tbody.innerHTML = reservasFiltradas.map(reserva => {
        const statusClass = reserva.status;
        const statusIcon = {
            'pendente': 'fa-hourglass-half',
            'aprovada': 'fa-check-circle',
            'cancelada': 'fa-times-circle'
        }[reserva.status] || 'fa-circle';
        
        const dataReserva = new Date(reserva.data_reserva);
        const dataLimite = new Date(reserva.data_limite);
        
        return `
            <tr class="reserva-row" data-id="${reserva.id}">
                <td>
                    <div class="aluno-info">
                        <span class="aluno-avatar">${reserva.aluno.charAt(0)}</span>
                        <span class="aluno-nome">${escapeHtml(reserva.aluno)}</span>
                    </div>
                </td>
                <td class="material-nome">${escapeHtml(reserva.material)}</td>
                <td><span class="tipo-badge">${escapeHtml(reserva.tipo)}</span></td>
                <td>${formatarData(dataReserva)}</td>
                <td>${formatarDataSimples(dataLimite)}</td>
                <td>
                    <span class="status-badge status-${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${reserva.status.charAt(0).toUpperCase() + reserva.status.slice(1)}
                    </span>
                </td>
                <td class="acoes-cell">
                    ${reserva.status === 'pendente' ? `
                        <button class="btn-acao btn-aprovar" onclick="aprovarReserva(${reserva.id})">
                            <i class="fas fa-check"></i> Aprovar
                        </button>
                        <button class="btn-acao btn-rejeitar" onclick="rejeitarReserva(${reserva.id})">
                            <i class="fas fa-times"></i> Rejeitar
                        </button>
                    ` : `
                        <span class="sem-acao">—</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
    
    // Atualizar contagens nos stats
    atualizarStats(reservasFiltradas.length);
}

// ========== FUNÇÕES AUXILIARES ==========
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatarData(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function formatarDataSimples(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function atualizarBadges() {
    const total = reservas.length;
    const pendentes = reservas.filter(r => r.status === 'pendente').length;
    const aprovadas = reservas.filter(r => r.status === 'aprovada').length;
    const canceladas = reservas.filter(r => r.status === 'cancelada').length;
    
    document.getElementById('badge-todos').textContent = total;
    document.getElementById('badge-pendente').textContent = pendentes;
    document.getElementById('badge-aprovada').textContent = aprovadas;
    document.getElementById('badge-cancelada').textContent = canceladas;
    document.getElementById('reservas-badge').textContent = pendentes;
}

function atualizarStats(filtradas) {
    // Atualizar apenas o total de reservas filtradas
    // Os outros stats permanecem com os valores totais
}

// ========== FILTROS ==========
function initFiltros() {
    const tabs = document.querySelectorAll('.filtro-tab');
    const buscaInput = document.getElementById('search-input');
    const limparBusca = document.getElementById('limpar-busca');
    const buscaAtiva = document.getElementById('filtro-busca-ativa');
    const buscaTermo = document.getElementById('busca-termo');
    
    // Filtros de status
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover active de todos
            tabs.forEach(t => t.classList.remove('active'));
            // Adicionar active no clicado
            this.classList.add('active');
            
            // Atualizar filtro
            filtroAtual = this.dataset.status;
            
            // Renderizar novamente
            renderizarReservas();
        });
    });
    
    // Busca
    let timeoutId;
    buscaInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const termo = this.value.trim();
            buscaAtual = termo;
            
            if (termo) {
                buscaTermo.textContent = termo;
                buscaAtiva.style.display = 'flex';
            } else {
                buscaAtiva.style.display = 'none';
            }
            
            renderizarReservas();
        }, 300);
    });
    
    // Limpar busca
    limparBusca.addEventListener('click', function() {
        buscaInput.value = '';
        buscaAtual = '';
        buscaAtiva.style.display = 'none';
        renderizarReservas();
    });
}

// ========== SIDEBAR COLLAPSE ==========
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

// ========== PERFIL DROPDOWN ==========
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

// ========== NOTIFICAÇÕES ==========
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

// ========== AÇÕES DAS RESERVAS ==========
function aprovarReserva(id) {
    if (!confirm('Deseja aprovar esta reserva?')) return;

    // Em produção: enviar requisição AJAX para o backend
    const reserva = reservas.find(r => r.id === id);
    if (reserva) {
        reserva.status = 'aprovada';
        renderizarReservas();
        showToast('Reserva aprovada com sucesso!', 'success');
    }
}

function rejeitarReserva(id) {
    if (!confirm('Deseja rejeitar esta reserva?')) return;

    // Em produção: enviar requisição AJAX para o backend
    const reserva = reservas.find(r => r.id === id);
    if (reserva) {
        reserva.status = 'cancelada';
        renderizarReservas();
        showToast('Reserva rejeitada.', 'error');
    }
}

// ========== TOAST ==========
function criarContainerToast() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = criarContainerToast();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remover após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados
    if (typeof reservasData !== 'undefined') {
        reservas = reservasData;
    }
    
    initSidebar();
    initProfileDropdown();
    initNotifications();
    initFiltros();
    
    // Renderizar inicial
    renderizarReservas();

    console.log('%cPágina de Reservas - SiGA ITJ Admin carregada!', 'color: #e67e22; font-weight: bold;');
});
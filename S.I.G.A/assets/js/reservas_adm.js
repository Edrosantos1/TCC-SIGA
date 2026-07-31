// ========== VARIÁVEIS GLOBAIS ==========
let reservas = [];
let filtroAtual = 'todos';
let buscaAtual = '';

// ========== RENDERIZAR RESERVAS ==========
function renderizarReservas() {
    const tbody = document.getElementById('reservas-tbody');
    const emptyState = document.getElementById('empty-state');
    const emptyMessage = document.getElementById('empty-message');
    const tableWrapper = document.querySelector('.reservas-table-wrapper');

    if (!tbody) return;

    // Filtrar reservas
    let reservasFiltradas = reservas;
    
    // Filtrar por status
    if (filtroAtual !== 'todos') {
        reservasFiltradas = reservasFiltradas.filter(r => r.status === filtroAtual);
    }
    
    // Filtrar por busca (APENAS POR ALUNO)
    if (buscaAtual.trim() !== '') {
        const termo = buscaAtual.toLowerCase().trim();
        reservasFiltradas = reservasFiltradas.filter(r => 
            r.aluno && r.aluno.toLowerCase().startsWith(termo)
        );
    }
    
    // Atualizar badges
    atualizarBadges();
    
    // Mostrar/ocultar empty state
    if (reservasFiltradas.length === 0) {
        tbody.innerHTML = '';
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            let mensagem = 'Não há reservas ';
            if (filtroAtual !== 'todos') {
                mensagem += `com status "${filtroAtual}" `;
            }
            if (buscaAtual.trim() !== '') {
                mensagem += `para a busca "${buscaAtual}"`;
            }
            if (emptyMessage) emptyMessage.textContent = mensagem || 'Não há reservas para os filtros selecionados';
        }
        return;
    }
    
    if (tableWrapper) tableWrapper.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    // Renderizar linhas HTML
    tbody.innerHTML = reservasFiltradas.map(reserva => {
        const statusClass = reserva.status;
        const statusIcon = {
            'pendente': 'fa-hourglass-half',
            'aprovada': 'fa-check-circle',
            'cancelada': 'fa-times-circle',
            'rejeitada': 'fa-times-circle',
            'expirada': 'fa-clock'
        }[reserva.status] || 'fa-circle';
        
        const dataReservaFormatada = formatarData(reserva.data_reserva);
        const dataLimiteFormatada = formatarData(reserva.data_limite);
        const inicialAluno = reserva.aluno ? reserva.aluno.trim().charAt(0).toUpperCase() : '?';

        return `
            <tr class="reserva-row" data-id="${reserva.id}">
                <td>
                    <div class="aluno-info">
                        <span class="aluno-avatar">${escapeHtml(inicialAluno)}</span>
                        <span class="aluno-nome">${escapeHtml(reserva.aluno)}</span>
                    </div>
                </td>
                <td class="material-nome">${escapeHtml(reserva.material)}</td>
                <td><span class="tipo-badge">${escapeHtml(reserva.tipo || 'Livro')}</span></td>
                <td>${dataReservaFormatada}</td>
                <td>${dataLimiteFormatada}</td>
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
}

// ========== FUNÇÕES AUXILIARES DE DATA (FORMATO DD/MM/AAAA) ==========
function formatarData(dataStr) {
    if (!dataStr) return '-';
    // Remove qualquer horário que venha junto do MySQL (ex: "2026-07-31 00:10:00" -> "2026-07-31")
    const dataApenas = dataStr.split(' ')[0];
    const partes = dataApenas.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function atualizarBadges() {
    const total = reservas.length;
    const pendentes = reservas.filter(r => r.status === 'pendente').length;
    const aprovadas = reservas.filter(r => r.status === 'aprovada').length;
    const rejeitadas = reservas.filter(r => r.status === 'rejeitada').length;
    const expiradas = reservas.filter(r => r.status === 'expirada').length;

    const bTodos = document.getElementById('badge-todos');
    const bPendente = document.getElementById('badge-pendente');
    const bAprovada = document.getElementById('badge-aprovada');
    const bRejeitada = document.getElementById('badge-rejeitada');
    const bExpirada = document.getElementById('badge-expirada');
    const bBadgeNav = document.getElementById('reservas-badge');

    if (bTodos) bTodos.textContent = total;
    if (bPendente) bPendente.textContent = pendentes;
    if (bAprovada) bAprovada.textContent = aprovadas;
    if (bRejeitada) bRejeitada.textContent = rejeitadas;
    if (bExpirada) bExpirada.textContent = expiradas;  
    if (bBadgeNav) bBadgeNav.textContent = pendentes;
}

// ========== FILTROS E BUSCA ==========
function initFiltros() {
    const tabs = document.querySelectorAll('.filtro-tab');
    const buscaInput = document.getElementById('search-input');
    const limparBusca = document.getElementById('limpar-busca');
    const buscaAtiva = document.getElementById('filtro-busca-ativa');
    const buscaTermo = document.getElementById('busca-termo');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filtroAtual = this.dataset.status;
            renderizarReservas();
        });
    });
    
    let timeoutId;
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const termo = this.value.trim();
                buscaAtual = termo;
                
                if (termo) {
                    if (buscaTermo) buscaTermo.textContent = termo;
                    if (buscaAtiva) buscaAtiva.style.display = 'flex';
                } else {
                    if (buscaAtiva) buscaAtiva.style.display = 'none';
                }
                
                renderizarReservas();
            }, 300);
        });
    }
    
    if (limparBusca) {
        limparBusca.addEventListener('click', function() {
            if (buscaInput) buscaInput.value = '';
            buscaAtual = '';
            if (buscaAtiva) buscaAtiva.style.display = 'none';
            renderizarReservas();
        });
    }
}

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

// ========== AÇÕES DE STATUS ==========
async function alterarStatusReserva(id, novoStatus) {
    try {
        const response = await fetch('atualizar_status_reserva.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: novoStatus })
        });

        const result = await response.json();

        if (result.success) {
            const reserva = reservas.find(r => Number(r.id) === Number(id));
            if (reserva) {
                reserva.status = novoStatus;
                renderizarReservas();
            } else {
                location.reload();
            }

            if (novoStatus === 'aprovada') {
                showToast('Reserva aprovada com sucesso!', 'success');
            } else if (novoStatus === 'rejeitada') {
                showToast('Reserva rejeitada com sucesso.', 'error');
            }
        } else {
            showToast(result.message || 'Erro ao atualizar status.', 'error');
        }
    } catch (error) {
        showToast('Erro de comunicação com o servidor.', 'error');
    }
}

window.aprovarReserva = function(id) {
    if (!confirm('Deseja aprovar esta reserva?')) return;
    alterarStatusReserva(id, 'aprovada');
};

window.rejeitarReserva = function(id) {
    if (!confirm('Deseja rejeitar esta reserva?')) return;
    alterarStatusReserva(id, 'rejeitada');
};

// ========== TOAST ==========
function criarContainerToast() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info') {
    const container = criarContainerToast();
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

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    if (typeof reservasData !== 'undefined') {
        reservas = reservasData;
    }
    
    initSidebar();
    initProfileDropdown();
    initNotifications();
    initFiltros();
    
    renderizarReservas();
});
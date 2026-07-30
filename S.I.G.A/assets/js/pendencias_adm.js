// Global array carregado pelo PHP
let pendencias = typeof pendenciasData !== 'undefined' ? pendenciasData : [];
let filtroStatusAtual = 'todos';
let termoBuscaAtual = '';

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initProfileDropdown();
    initNotificationDropdown();
    initFiltrosTabs();
    initBusca();
    renderizarPendencias();
});

// ========== RENDERIZAÇÃO DA TABELA ==========
function renderizarPendencias() {
    const tbody = document.getElementById('pendencias-tbody');
    const emptyState = document.getElementById('empty-state');
    const tableWrapper = document.querySelector('.reservas-table-wrapper');

    if (!tbody) return;

    // Filtra por status e termo de busca (APENAS POR ALUNO, COM PREFIXO)
    let filtradas = pendencias.filter(p => {
        const matchStatus = filtroStatusAtual === 'todos' || p.status === filtroStatusAtual;
        
        const termo = termoBuscaAtual.toLowerCase().trim();
        const matchBusca = !termo || 
            (p.aluno && p.aluno.toLowerCase().startsWith(termo)); // <-- CORRIGIDO

        return matchStatus && matchBusca;
    });

    // Se estiver vazio
    if (filtradas.length === 0) {
        tbody.innerHTML = '';
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            const emptyMsg = document.getElementById('empty-message');
            if (emptyMsg) {
                emptyMsg.textContent = termoBuscaAtual 
                    ? `Nenhum aluno encontrado para "${termoBuscaAtual}".`
                    : 'Nenhum empréstimo ativo nesta categoria.';
            }
        }
        atualizarContadores();
        return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    // Monta as linhas HTML
    tbody.innerHTML = filtradas.map(p => {
        const dataEmpFormatted = formatarData(p.data_emprestimo);
        const dataLimFormatted = formatarData(p.data_limite);
        const inicial = p.aluno ? p.aluno.trim().charAt(0).toUpperCase() : '?';

        let badgeClass = 'status-aprovada';
        let statusTexto = 'No Prazo';
        let iconeStatus = 'fa-clock';

        if (p.status === 'atrasado') {
            badgeClass = 'status-cancelada';
            statusTexto = 'Atrasado';
            iconeStatus = 'fa-exclamation-triangle';
        }

        return `
            <tr class="reserva-row" data-id="${p.id}">
                <td>
                    <div class="aluno-info">
                        <span class="aluno-avatar">${escapeHtml(inicial)}</span>
                        <span class="aluno-nome">${escapeHtml(p.aluno)}</span>
                    </div>
                </td>
                <td class="material-nome">${escapeHtml(p.material)}</td>
                <td><span class="tipo-badge">${escapeHtml(p.tipo || 'Livro')}</span></td>
                <td>${dataEmpFormatted}</td>
                <td>${dataLimFormatted}</td>
                <td>
                    <span class="status-badge ${badgeClass}">
                        <i class="fas ${iconeStatus}"></i> ${statusTexto}
                    </span>
                </td>
                <td class="acoes-cell">
                    <button class="btn-acao btn-aprovar" onclick="devolverMaterial(${p.id})" title="Dar Baixa / Registrar Devolução">
                        <i class="fas fa-check-double"></i> Dar Baixa
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    atualizarContadores();
}

// ========== FILTROS E BUSCA ==========
function initFiltrosTabs() {
    const tabs = document.querySelectorAll('.filtro-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filtroStatusAtual = tab.dataset.status;
            renderizarPendencias();
        });
    });
}

function initBusca() {
    const searchInput = document.getElementById('search-input');
    const buscaAtivaBox = document.getElementById('filtro-busca-ativa');
    const buscaTermoText = document.getElementById('busca-termo');
    const limparBtn = document.getElementById('limpar-busca');

    if (!searchInput) return;

    let timeoutId;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            termoBuscaAtual = e.target.value.trim();
            if (termoBuscaAtual) {
                if (buscaAtivaBox) buscaAtivaBox.style.display = 'flex';
                if (buscaTermoText) buscaTermoText.textContent = termoBuscaAtual;
            } else {
                if (buscaAtivaBox) buscaAtivaBox.style.display = 'none';
            }
            renderizarPendencias();
        }, 300);
    });

    if (limparBtn) {
        limparBtn.addEventListener('click', () => {
            searchInput.value = '';
            termoBuscaAtual = '';
            if (buscaAtivaBox) buscaAtivaBox.style.display = 'none';
            renderizarPendencias();
        });
    }
}

// ========== ATUALIZAR CONTADORES DOS BADGES ==========
function atualizarContadores() {
    const totalGeral = pendencias.length;
    const totalAtrasados = pendencias.filter(p => p.status === 'atrasado').length;
    const totalNoPrazo = pendencias.filter(p => p.status === 'emprestado').length;

    const bTodos = document.getElementById('badge-todos');
    const bAtrasado = document.getElementById('badge-atrasado');
    const bEmprestado = document.getElementById('badge-emprestado');
    const navBadge = document.getElementById('pendencias-badge');

    if (bTodos) bTodos.textContent = totalGeral;
    if (bAtrasado) bAtrasado.textContent = totalAtrasados;
    if (bEmprestado) bEmprestado.textContent = totalNoPrazo;
    if (navBadge) navBadge.textContent = totalAtrasados;
}

// ========== AÇÃO DE DAR BAIXA (DEVOLUÇÃO) ==========
window.devolverMaterial = async function(id) {
    if (!confirm('Confirmar a devolução deste livro/material?')) return;

    try {
        const response = await fetch('atualizar_status_emprestimo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: 'devolvido' })
        });

        const result = await response.json();

        if (result.success) {
            pendencias = pendencias.filter(p => Number(p.id) !== Number(id));
            renderizarPendencias();
            showToast('Devolução registrada com sucesso!', 'success');
        } else {
            showToast(result.message || 'Erro ao registrar devolução.', 'error');
        }
    } catch (error) {
        showToast('Erro de comunicação com o servidor.', 'error');
    }
};

// ========== AUXILIARES ==========
function formatarData(dataStr) {
    if (!dataStr) return '-';
    const partes = dataStr.split(' ')[0].split('-');
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

function initNotificationDropdown() {
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
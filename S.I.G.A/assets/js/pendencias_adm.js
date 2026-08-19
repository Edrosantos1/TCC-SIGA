// ========== VARIÁVEIS GLOBAIS ==========
let pendencias = [];
let filtroAtual = 'todos';
let buscaAtual = '';
let ordemAtual = 'recente';
let notificacoes = [];

// ========== FUNÇÕES AUXILIARES PARA NOTIFICAÇÕES ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatarData(data) {
    const d = new Date(data);
    const agora = new Date();
    const diff = Math.floor((agora - d) / 1000);
    
    if (diff < 60) return 'Agora pouco';
    if (diff < 3600) return Math.floor(diff / 60) + ' min atrás';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
    if (diff < 172800) return 'Ontem';
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

function renderizarDropdownNotificacoes() {
    const lista = document.getElementById('notification-list-dropdown');
    if (!lista) return;

    if (!notificacoes || notificacoes.length === 0) {
        lista.innerHTML = `
            <div class="empty-notifications">
                <i class="far fa-bell-slash"></i>
                <p>Nenhuma notificação enviada</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = notificacoes.slice(0, 10).map(notificacao => {
        const isPendencia = notificacao.tipo === 'pendencia';
        const corIcon = isPendencia ? '#e67e22' : '#0b4b9b';
        const icone = isPendencia ? 'fa-exclamation-triangle' : 'fa-info-circle';
        const label = isPendencia ? 'Pendência' : 'Aviso';
        
        const totalAlunos = parseInt(notificacao.total_alunos, 10) || 0;
        const textoAlunos = totalAlunos === 1 ? '1 aluno' : totalAlunos + ' alunos';
        
        return `
            <div class="notification-item">
                <div class="notification-icon" style="color: ${corIcon};">
                    <i class="fas ${icone}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">
                        <strong style="color: ${corIcon};">${label}</strong><br>
                        ${escapeHtml(notificacao.mensagem)}
                    </div>
                    <div class="notification-footer">
                        <span class="notification-date">${formatarData(notificacao.criado_em)}</span>
                        <span class="notification-destinatarios">
                            <i class="fas fa-users"></i> ${textoAlunos}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== RENDERIZAR PENDÊNCIAS ==========
function renderizarPendencias() {
    const tbody = document.getElementById('pendencias-tbody');
    const emptyState = document.getElementById('empty-state');
    const emptyMessage = document.getElementById('empty-message');
    const tableWrapper = document.querySelector('.reservas-table-wrapper');

    if (!tbody) return;

    let pendenciasFiltradas = pendencias;

    if (filtroAtual !== 'todos') {
        pendenciasFiltradas = pendenciasFiltradas.filter(p => p.status === filtroAtual);
    }

    if (buscaAtual.trim() !== '') {
        const termo = buscaAtual.toLowerCase().trim();
        pendenciasFiltradas = pendenciasFiltradas.filter(p => 
            p.aluno && p.aluno.toLowerCase().startsWith(termo)
        );
    }

    // ========== ORDENAR ==========
    if (ordemAtual === 'recente') {
        pendenciasFiltradas.sort((a, b) => {
            const dataA = new Date(a.data_emprestimo);
            const dataB = new Date(b.data_emprestimo);
            return dataB - dataA;
        });
    } else {
        pendenciasFiltradas.sort((a, b) => {
            const dataA = new Date(a.data_emprestimo);
            const dataB = new Date(b.data_emprestimo);
            return dataA - dataB;
        });
    }

    atualizarBadges();

    if (pendenciasFiltradas.length === 0) {
        tbody.innerHTML = '';
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            let mensagem = 'Nenhum empréstimo ';
            if (filtroAtual !== 'todos') {
                mensagem += `com status "${filtroAtual}" `;
            }
            if (buscaAtual.trim() !== '') {
                mensagem += `para a busca "${buscaAtual}"`;
            }
            if (emptyMessage) emptyMessage.textContent = mensagem || 'Não há empréstimos para os filtros selecionados';
        }
        return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = pendenciasFiltradas.map(pendencia => {
        const statusClass = pendencia.status;
        const statusIcon = {
            'emprestado': 'fa-check-circle',
            'atrasado': 'fa-exclamation-triangle',
            'devolvido': 'fa-undo-alt'
        }[pendencia.status] || 'fa-circle';
        const statusLabel = pendencia.status.charAt(0).toUpperCase() + pendencia.status.slice(1);

        const dataEmprestimoFormatada = formatarDataBR(pendencia.data_emprestimo);
        const dataLimiteFormatada = formatarDataBR(pendencia.data_limite);
        const inicialAluno = pendencia.aluno ? pendencia.aluno.trim().charAt(0).toUpperCase() : '?';

        return `
            <tr class="pendencia-row" data-id="${pendencia.id}">
                <td>
                    <div class="aluno-info">
                        <span class="aluno-avatar">${escapeHtml(inicialAluno)}</span>
                        <span class="aluno-nome">${escapeHtml(pendencia.aluno)}</span>
                    </div>
                </td>
                <td class="material-nome">${escapeHtml(pendencia.material)}</td>
                <td><span class="tipo-badge">${escapeHtml(pendencia.tipo || 'Livro')}</span></td>
                <td class="col-data">${dataEmprestimoFormatada}</td>
                <td class="col-data">${dataLimiteFormatada}</td>
                <td>
                    <span class="status-badge status-${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${statusLabel}
                    </span>
                </td>
                <td class="acoes-cell">
                    ${pendencia.status === 'emprestado' || pendencia.status === 'atrasado' ? `
                        <button class="btn-acao btn-aprovar" onclick="confirmarDevolucao(${pendencia.id}, '${escapeHtml(pendencia.material)}', '${escapeHtml(pendencia.aluno)}')">
                            <i class="fas fa-undo-alt"></i> Devolver
                        </button>
                    ` : `
                        <span class="sem-acao">—</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

// ========== FUNÇÃO DE CONFIRMAÇÃO DE DEVOLUÇÃO ==========
window.confirmarDevolucao = function(id, material, aluno) {
    if (confirm(`📚 Deseja registrar a devolução do livro "${material}" do aluno ${aluno}?\n\nEsta ação não pode ser desfeita.`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'atualizar_status_emprestimo.php';
        
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = 'id';
        inputId.value = id;
        
        const inputStatus = document.createElement('input');
        inputStatus.type = 'hidden';
        inputStatus.name = 'status';
        inputStatus.value = 'devolvido';
        
        form.appendChild(inputId);
        form.appendChild(inputStatus);
        document.body.appendChild(form);
        form.submit();
    }
};

// ========== FUNÇÕES AUXILIARES ==========
function formatarDataBR(dataStr) {
    if (!dataStr) return '-';
    const dataApenas = dataStr.split(' ')[0];
    const partes = dataApenas.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
}

function atualizarBadges() {
    const total = pendencias.length;
    const atrasados = pendencias.filter(p => p.status === 'atrasado').length;
    const emprestados = pendencias.filter(p => p.status === 'emprestado').length;

    const bTodos = document.getElementById('badge-todos');
    const bAtrasado = document.getElementById('badge-atrasado');
    const bEmprestado = document.getElementById('badge-emprestado');
    const bBadgeNav = document.getElementById('pendencias-badge');

    if (bTodos) bTodos.textContent = total;
    if (bAtrasado) bAtrasado.textContent = atrasados;
    if (bEmprestado) bEmprestado.textContent = emprestados;
    if (bBadgeNav) bBadgeNav.textContent = atrasados;
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
            renderizarPendencias();
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

                renderizarPendencias();
            }, 300);
        });
    }

    if (limparBusca) {
        limparBusca.addEventListener('click', function() {
            if (buscaInput) buscaInput.value = '';
            buscaAtual = '';
            if (buscaAtiva) buscaAtiva.style.display = 'none';
            renderizarPendencias();
        });
    }
}

// ========== ORDENAÇÃO ==========
function initOrdenacao() {
    const btnOrdenacao = document.getElementById('btn-ordenacao');
    const dropdown = document.getElementById('ordenacao-dropdown');
    const items = document.querySelectorAll('.ordenacao-item');
    const label = document.getElementById('ordenacao-label');
    
    if (!btnOrdenacao || !dropdown) return;
    
    btnOrdenacao.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function(e) {
        if (!btnOrdenacao.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    items.forEach(item => {
        item.addEventListener('click', function() {
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            ordemAtual = this.dataset.ordem;
            
            if (ordemAtual === 'recente') {
                label.textContent = 'Mais recente';
            } else {
                label.textContent = 'Mais antigo';
            }
            
            dropdown.classList.remove('show');
            renderizarPendencias();
        });
    });
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

// ========== NOTIFICAÇÕES (SININHO) - SEM AJAX ==========
function initNotifications() {
    const btn = document.getElementById('notification-btn');
    const dropdown = document.getElementById('notification-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) {
            renderizarDropdownNotificacoes();
        }
    });

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

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
    if (typeof pendenciasData !== 'undefined') {
        pendencias = pendenciasData;
    }
    
    if (typeof notificacoesData !== 'undefined') {
        notificacoes = notificacoesData;
    }

    initSidebar();
    initProfileDropdown();
    initNotifications();
    initFiltros();
    initOrdenacao();

    renderizarPendencias();
    renderizarDropdownNotificacoes();
});
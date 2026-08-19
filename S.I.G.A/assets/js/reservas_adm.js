// ========== VARIÁVEIS GLOBAIS ==========
let reservas = [];
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

// ========== RENDERIZAR RESERVAS ==========
function renderizarReservas() {
    const tbody = document.getElementById('reservas-tbody');
    const emptyState = document.getElementById('empty-state');
    const emptyMessage = document.getElementById('empty-message');
    const tableWrapper = document.querySelector('.reservas-table-wrapper');

    if (!tbody) return;

    let reservasFiltradas = reservas;
    
    if (filtroAtual !== 'todos') {
        reservasFiltradas = reservasFiltradas.filter(r => r.status === filtroAtual);
    }
    
    if (buscaAtual.trim() !== '') {
        const termo = buscaAtual.toLowerCase().trim();
        reservasFiltradas = reservasFiltradas.filter(r => 
            r.aluno && r.aluno.toLowerCase().startsWith(termo)
        );
    }
    
    // ========== ORDENAR ==========
    if (ordemAtual === 'recente') {
        reservasFiltradas.sort((a, b) => {
            const dataA = new Date(a.data_reserva);
            const dataB = new Date(b.data_reserva);
            return dataB - dataA;
        });
    } else {
        reservasFiltradas.sort((a, b) => {
            const dataA = new Date(a.data_reserva);
            const dataB = new Date(b.data_reserva);
            return dataA - dataB;
        });
    }
    
    atualizarBadges();
    
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
    
    tbody.innerHTML = reservasFiltradas.map(reserva => {
        const statusClass = reserva.status;
        const statusIcon = {
            'pendente': 'fa-hourglass-half',
            'aprovada': 'fa-check-circle',
            'cancelada': 'fa-times-circle',
            'rejeitada': 'fa-times-circle',
            'expirada': 'fa-clock'
        }[reserva.status] || 'fa-circle';
        
        const dataReservaFormatada = formatarDataBR(reserva.data_reserva);
        const dataLimiteFormatada = formatarDataBR(reserva.data_limite);
        const inicialAluno = reserva.aluno ? reserva.aluno.trim().charAt(0).toUpperCase() : '?';

        // Checkbox apenas para pendentes
        const isPendente = reserva.status === 'pendente';
        const checkboxHtml = isPendente 
            ? `<input type="checkbox" class="checkbox-reserva" name="ids[]" value="${reserva.id}">`
            : '';

        return `
            <tr class="reserva-row" data-id="${reserva.id}">
                <td style="text-align: center;">${checkboxHtml}</td>
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
                        <button class="btn-acao btn-aprovar" onclick="confirmarAprovacao(${reserva.id}, '${escapeHtml(reserva.material)}', '${escapeHtml(reserva.aluno)}')">
                            <i class="fas fa-check"></i> Aprovar
                        </button>
                        <button class="btn-acao btn-rejeitar" onclick="confirmarRejeicao(${reserva.id}, '${escapeHtml(reserva.material)}', '${escapeHtml(reserva.aluno)}')">
                            <i class="fas fa-times"></i> Rejeitar
                        </button>
                    ` : `
                        <span class="sem-acao">—</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');

    // Atualizar estado dos botões de seleção em massa
    atualizarBotoesMassa();
}

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
            renderizarReservas();
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

// ========== CONFIRMAÇÃO DE APROVAÇÃO (individual) ==========
window.confirmarAprovacao = function(id, material, aluno) {
    if (confirm(`✅ Deseja aprovar a reserva do livro "${material}" do aluno ${aluno}?`)) {
        // Cria um form com os dados
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'atualizar_status_reserva.php';
        
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = 'id';
        inputId.value = id;
        
        const inputAcao = document.createElement('input');
        inputAcao.type = 'hidden';
        inputAcao.name = 'acao';
        inputAcao.value = 'aprovar';
        
        form.appendChild(inputId);
        form.appendChild(inputAcao);
        document.body.appendChild(form);
        form.submit();
    }
};

// ========== CONFIRMAÇÃO DE REJEIÇÃO (individual) ==========
window.confirmarRejeicao = function(id, material, aluno) {
    if (confirm(`❌ Deseja rejeitar a reserva do livro "${material}" do aluno ${aluno}?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'atualizar_status_reserva.php';
        
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = 'id';
        inputId.value = id;
        
        const inputAcao = document.createElement('input');
        inputAcao.type = 'hidden';
        inputAcao.name = 'acao';
        inputAcao.value = 'rejeitar';
        
        form.appendChild(inputId);
        form.appendChild(inputAcao);
        document.body.appendChild(form);
        form.submit();
    }
};

// ========== SELEÇÃO EM MASSA ==========
function atualizarBotoesMassa() {
    const checkboxes = document.querySelectorAll('.checkbox-reserva:checked');
    const count = checkboxes.length;
    const btnAprovar = document.querySelector('.btn-aprovar-massa');
    const btnRejeitar = document.querySelector('.btn-rejeitar-massa');
    const info = document.getElementById('selecionados-info');

    if (count > 0) {
        if (btnAprovar) btnAprovar.disabled = false;
        if (btnRejeitar) btnRejeitar.disabled = false;
        if (info) info.textContent = `${count} reserva${count > 1 ? 's' : ''} selecionada${count > 1 ? 's' : ''}`;
    } else {
        if (btnAprovar) btnAprovar.disabled = true;
        if (btnRejeitar) btnRejeitar.disabled = true;
        if (info) info.textContent = 'Nenhum selecionado';
    }

    // Atualiza o checkbox "selecionar todos"
    const selecionarTodos = document.getElementById('selecionarTodos');
    if (selecionarTodos) {
        const todos = document.querySelectorAll('.checkbox-reserva');
        const marcados = document.querySelectorAll('.checkbox-reserva:checked');
        selecionarTodos.checked = todos.length > 0 && marcados.length === todos.length;
    }
}

// ========== EVENTOS DE SELEÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Selecionar todos
    const selecionarTodos = document.getElementById('selecionarTodos');
    if (selecionarTodos) {
        selecionarTodos.addEventListener('change', function() {
            const checked = this.checked;
            document.querySelectorAll('.checkbox-reserva').forEach(cb => cb.checked = checked);
            atualizarBotoesMassa();
        });
    }

    // Mudança em qualquer checkbox
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('checkbox-reserva')) {
            atualizarBotoesMassa();
        }
    });

    // Interceptar submit do formulário de ações em massa
    const formMassa = document.getElementById('formReservasMassa');
    if (formMassa) {
        formMassa.addEventListener('submit', function(e) {
            const checkboxes = document.querySelectorAll('.checkbox-reserva:checked');
            if (checkboxes.length === 0) {
                e.preventDefault();
                showToast('Selecione pelo menos uma reserva.', 'error');
                return;
            }
            const acao = this.querySelector('button[type="submit"][name="acao"]:focus')?.value;
            if (!acao) {
                e.preventDefault();
                showToast('Selecione uma ação (Aprovar ou Rejeitar).', 'error');
                return;
            }
            const mensagem = acao === 'aprovar' 
                ? `Deseja aprovar ${checkboxes.length} reserva${checkboxes.length > 1 ? 's' : ''}?`
                : `Deseja rejeitar ${checkboxes.length} reserva${checkboxes.length > 1 ? 's' : ''}?`;
            if (!confirm(mensagem)) {
                e.preventDefault();
            }
        });
    }
});

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
    
    if (typeof notificacoesData !== 'undefined') {
        notificacoes = notificacoesData;
    }
    
    initSidebar();
    initProfileDropdown();
    initNotifications();
    initFiltros();
    initOrdenacao();
    
    renderizarReservas();
    renderizarDropdownNotificacoes();
});

// ========== MENSAGENS FLASH ==========
document.addEventListener('DOMContentLoaded', function() {
    const flashMsg = document.getElementById('flash-msg');
    if (flashMsg) {
        const type = flashMsg.dataset.type;
        const message = flashMsg.dataset.message;
        if (type === 'success') {
            showToast(message, 'success');
        } else if (type === 'error') {
            showToast(message, 'error');
        }
        flashMsg.remove();
    }
});
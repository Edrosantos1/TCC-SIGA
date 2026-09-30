// ========== VARIÁVEIS GLOBAIS ==========
let reservas = [];
let filtroAtual = 'todos';
let buscaAtual = '';
let ordemAtual = 'recente';
let notificacoes = [];

// ========== FUNÇÕES AUXILIARES ==========
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

function formatarDataBR(dataStr) {
    if (!dataStr) return '-';
    const dataApenas = dataStr.split(' ')[0];
    const partes = dataApenas.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
}

function renderizarDropdownNotificacoes() {
    const lista = document.getElementById('notification-list-dropdown');
    if (!lista) return;
    if (!notificacoes || notificacoes.length === 0) {
        lista.innerHTML = `<div class="empty-notifications"><i class="far fa-bell-slash"></i><p>Nenhuma notificação enviada</p></div>`;
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
                <div class="notification-icon" style="color: ${corIcon};"><i class="fas ${icone}"></i></div>
                <div class="notification-content">
                    <div class="notification-message"><strong style="color: ${corIcon};">${label}</strong><br>${escapeHtml(notificacao.mensagem)}</div>
                    <div class="notification-footer">
                        <span class="notification-date">${formatarData(notificacao.criado_em)}</span>
                        <span class="notification-destinatarios"><i class="fas fa-users"></i> ${textoAlunos}</span>
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

    if (ordemAtual === 'recente') {
        reservasFiltradas.sort((a, b) => new Date(b.data_reserva) - new Date(a.data_reserva));
    } else {
        reservasFiltradas.sort((a, b) => new Date(a.data_reserva) - new Date(b.data_reserva));
    }

    atualizarBadges();

    if (reservasFiltradas.length === 0) {
        tbody.innerHTML = '';
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            let mensagem = 'Não há reservas ';
            if (filtroAtual !== 'todos') mensagem += `com status "${filtroAtual}" `;
            if (buscaAtual.trim() !== '') mensagem += `para a busca "${buscaAtual}"`;
            if (emptyMessage) emptyMessage.textContent = mensagem || 'Não há reservas para os filtros selecionados';
        }
        atualizarBotoesMassa();
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
            'expirada': 'fa-clock',
            'retirada': 'fa-hand-holding-heart'
        }[reserva.status] || 'fa-circle';
        const dataReservaFormatada = formatarDataBR(reserva.data_reserva);
        const dataLimiteFormatada = formatarDataBR(reserva.data_limite);
        const inicialAluno = reserva.aluno ? reserva.aluno.trim().charAt(0).toUpperCase() : '?';
        const isPendente = reserva.status === 'pendente';
        const isAprovada = reserva.status === 'aprovada';
        // ⬇️ CHECKBOX SÓ APARECE PARA PENDENTES — MAS AGORA COM ID ÚNICO
        const checkboxHtml = isPendente 
            ? `<input type="checkbox" class="checkbox-reserva" name="ids[]" value="${reserva.id}" data-id="${reserva.id}" autocomplete="off">` 
            : '';

        // Botões de ação dinâmicos
        let acoesHtml = '<span class="sem-acao">—</span>';
        if (isPendente) {
            acoesHtml = `
                <button type="button" class="btn-acao btn-aprovar" data-action="aprovar" data-id="${reserva.id}">
                    <i class="fas fa-check"></i> Aprovar
                </button>
                <button type="button" class="btn-acao btn-rejeitar" data-action="rejeitar" data-id="${reserva.id}">
                    <i class="fas fa-times"></i> Rejeitar
                </button>
            `;
        } else if (isAprovada) {
            acoesHtml = `
                <button type="button" class="btn-retirar" data-action="retirar" data-id="${reserva.id}">
                    <i class="fas fa-hand-holding-heart"></i> Confirmar Retirada
                </button>
            `;
        }

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
                <td class="acoes-cell">${acoesHtml}</td>
            </tr>
        `;
    }).join('');

    atualizarBotoesMassa();
}

// ========== BADGES ==========
function atualizarBadges() {
    const total = reservas.length;
    const pendentes = reservas.filter(r => r.status === 'pendente').length;
    const aprovadas = reservas.filter(r => r.status === 'aprovada').length;
    const rejeitadas = reservas.filter(r => r.status === 'rejeitada').length;
    const expiradas = reservas.filter(r => r.status === 'expirada').length;
    const retiradas = reservas.filter(r => r.status === 'retirada').length;

    const bTodos = document.getElementById('badge-todos');
    const bPendente = document.getElementById('badge-pendente');
    const bAprovada = document.getElementById('badge-aprovada');
    const bRejeitada = document.getElementById('badge-rejeitada');
    const bExpirada = document.getElementById('badge-expirada');
    const bRetirada = document.getElementById('badge-retirada');
    const bBadgeNav = document.getElementById('reservas-badge');

    if (bTodos) bTodos.textContent = total;
    if (bPendente) bPendente.textContent = pendentes;
    if (bAprovada) bAprovada.textContent = aprovadas;
    if (bRejeitada) bRejeitada.textContent = rejeitadas;
    if (bExpirada) bExpirada.textContent = expiradas;
    if (bRetirada) bRetirada.textContent = retiradas;
    if (bBadgeNav) bBadgeNav.textContent = pendentes;
}

// ========== BOTÕES DE AÇÃO EM MASSA ==========
function atualizarBotoesMassa() {
    const checkboxesMarcados = document.querySelectorAll('.checkbox-reserva:checked');
    const checkboxesTotais = document.querySelectorAll('.checkbox-reserva');
    const count = checkboxesMarcados.length;
    const totalCheckboxes = checkboxesTotais.length;

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

    // Atualiza o "selecionar todos"
    const selecionarTodos = document.getElementById('selecionarTodos');
    if (selecionarTodos) {
        if (totalCheckboxes === 0) {
            selecionarTodos.checked = false;
            selecionarTodos.disabled = true;
            selecionarTodos.indeterminate = false;
        } else {
            selecionarTodos.disabled = false;
            selecionarTodos.checked = count === totalCheckboxes;
            selecionarTodos.indeterminate = count > 0 && count < totalCheckboxes;
        }
    }
}

// ========== INICIALIZA AÇÕES EM MASSA (CHECKBOXES + SELECT ALL + SUBMIT) ==========
function initAcoesMassa() {
    const tbody = document.getElementById('reservas-tbody');

    // ✅ Delegação de evento: qualquer checkbox marcado/desmarcado dispara atualização
    if (tbody) {
        tbody.addEventListener('change', function(e) {
            if (e.target && e.target.classList && e.target.classList.contains('checkbox-reserva')) {
                atualizarBotoesMassa();
            }
        });

        // Também escuta cliques diretos (fallback para navegadores antigos)
        tbody.addEventListener('click', function(e) {
            if (e.target && e.target.classList && e.target.classList.contains('checkbox-reserva')) {
                // Pequeno delay para o checkbox ter atualizado seu estado
                setTimeout(atualizarBotoesMassa, 0);
            }
        });
    }

    // ✅ "Selecionar todos"
    const selecionarTodos = document.getElementById('selecionarTodos');
    if (selecionarTodos) {
        selecionarTodos.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.checkbox-reserva');
            checkboxes.forEach(cb => { cb.checked = this.checked; });
            atualizarBotoesMassa();
        });
    }

    // ✅ Confirmação + validação antes de submeter
    const form = document.getElementById('formReservasMassa');
    if (form) {
        form.addEventListener('submit', function(e) {
            const checkboxesMarcados = document.querySelectorAll('.checkbox-reserva:checked');
            if (checkboxesMarcados.length === 0) {
                e.preventDefault();
                showToast('Selecione pelo menos uma reserva para continuar.', 'error');
                return;
            }

            // Descobre qual botão foi clicado
            let acao = null;
            if (e.submitter && e.submitter.name === 'acao') {
                acao = e.submitter.value;
            } else {
                // Fallback: procura o botão ativo
                const btnAtivo = document.activeElement;
                if (btnAtivo && btnAtivo.name === 'acao') acao = btnAtivo.value;
            }

            const verbo = acao === 'aprovar' ? 'aprovar' : 'rejeitar';
            const qtd = checkboxesMarcados.length;
            const msg = `Deseja realmente ${verbo} ${qtd} reserva${qtd > 1 ? 's' : ''}?`;
            if (!confirm(msg)) {
                e.preventDefault();
            }
        });
    }

    // Estado inicial
    atualizarBotoesMassa();
}

// ========== FUNÇÕES DE AÇÃO INDIVIDUAL ==========
window.confirmarAprovacao = function(id, material, aluno) {
    if (confirm(`✅ Deseja aprovar a reserva do livro "${material}" do aluno ${aluno}?`)) {
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

window.confirmarRetirada = function(id, material, aluno) {
    if (confirm(`📚 Confirma que o aluno "${aluno}" está retirando o material "${material}"?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'confirmar_retirada.php';
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = 'id';
        inputId.value = id;
        form.appendChild(inputId);
        document.body.appendChild(form);
        form.submit();
    }
};

// ========== DELEGAÇÃO DE EVENTOS DOS BOTÕES DE AÇÃO INDIVIDUAL ==========
function initAcoesReserva() {
    const tbody = document.getElementById('reservas-tbody');
    if (!tbody) return;
    tbody.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn || !tbody.contains(btn)) return;
        const id = parseInt(btn.dataset.id, 10);
        const reserva = reservas.find(r => r.id == id);
        if (!reserva) return;
        const material = reserva.material || '';
        const aluno = reserva.aluno || '';
        if (btn.dataset.action === 'aprovar') {
            confirmarAprovacao(id, material, aluno);
        } else if (btn.dataset.action === 'rejeitar') {
            confirmarRejeicao(id, material, aluno);
        } else if (btn.dataset.action === 'retirar') {
            confirmarRetirada(id, material, aluno);
        }
    });
}

// ========== FILTROS, BUSCA E ORDENAÇÃO ==========
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
            label.textContent = ordemAtual === 'recente' ? 'Mais recente' : 'Mais antigo';
            dropdown.classList.remove('show');
            renderizarReservas();
        });
    });
}

// ========== SIDEBAR, PERFIL, NOTIFICAÇÕES ==========
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    if (!sidebar || !collapseBtn) return;
    collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('adm_sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    if (localStorage.getItem('adm_sidebarCollapsed') === 'true') sidebar.classList.add('collapsed');
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

function initNotifications() {
    const btn = document.getElementById('notification-btn');
    const dropdown = document.getElementById('notification-dropdown');
    if (!btn || !dropdown) return;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) renderizarDropdownNotificacoes();
    });
    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) dropdown.classList.remove('show');
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
    const icons = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', info: 'fas fa-info-circle' };
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${message}</span>`;
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
    if (typeof reservasData !== 'undefined') reservas = reservasData;
    if (typeof notificacoesData !== 'undefined') notificacoes = notificacoesData;

    initSidebar();
    initProfileDropdown();
    initNotifications();
    initFiltros();
    initOrdenacao();
    initAcoesReserva();
    initAcoesMassa();   // ⬅️ NOVO: liga checkboxes, select-all e submit em massa
    renderizarReservas();
    renderizarDropdownNotificacoes();
});
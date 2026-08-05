// ========== VARIÁVEIS GLOBAIS ==========
let alunos = [];
let alunoSelecionado = null;
let destinatarioAtual = 'todos';
let categoriaAtual = 'aviso';
let notificacoesHeader = [];

// ========== FUNÇÕES AUXILIARES ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatarData(data) {
    const d = new Date(data);  // <-- REMOVI O '+ "UTC"'
    const agora = new Date();
    const diff = Math.floor((agora - d) / 1000);
    
    if (diff < 60) return 'Agora pouco';
    if (diff < 3600) return Math.floor(diff / 60) + ' min atrás';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
    if (diff < 172800) return 'Ontem';
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

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

// ========== DROPDOWN DE NOTIFICAÇÕES ==========
function renderizarDropdownNotificacoes() {
    const lista = document.getElementById('notification-list-dropdown');
    if (!lista) return;

    if (notificacoesHeader.length === 0) {
        lista.innerHTML = `
            <div class="empty-notifications">
                <i class="far fa-bell-slash"></i>
                <p>Nenhuma notificação enviada</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = notificacoesHeader.slice(0, 10).map(notificacao => {
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

    atualizarBadge(notificacoesHeader.length);
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

// ========== TRAVA DE DUPLO ENVIO NO FORMULÁRIO ==========
function initFormNotificacao() {
    const form = document.getElementById('form-notificacao');
    const btnEnviar = document.getElementById('btn-enviar-notificacao');
    if (!form || !btnEnviar) return;

    form.addEventListener('submit', function (e) {
        if (destinatarioAtual === 'especifico' && !alunoSelecionado) {
            e.preventDefault();
            alert('Por favor, selecione um aluno para enviar a notificação.');
            return;
        }

        const msgInput = document.getElementById('mensagem-textarea');
        if (!msgInput || !msgInput.value.trim()) {
            e.preventDefault();
            alert('Por favor, digite a mensagem da notificação.');
            return;
        }

        // Desabilita o botão para evitar duplo clique e envios duplicados
        setTimeout(() => {
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        }, 10);
    });
}

// ========== ATUALIZAR CATEGORIA POR DESTINATÁRIO ==========
function atualizarCategoriaPorDestinatario() {
    const tabPendencia = document.querySelector('.categoria-tab[data-categoria="pendencia"]');
    const tabAviso = document.querySelector('.categoria-tab[data-categoria="aviso"]');
    if (!tabPendencia || !tabAviso) return;

    if (destinatarioAtual === 'todos') {
        tabPendencia.classList.add('disabled');
        if (tabPendencia.classList.contains('active')) {
            tabPendencia.classList.remove('active');
            tabAviso.classList.add('active');
            categoriaAtual = 'aviso';
            document.getElementById('categoria-input').value = 'aviso';
        }
    } else {
        tabPendencia.classList.remove('disabled');
    }
}

// ========== DESTINATÁRIO TABS ==========
function initDestinatarioTabs() {
    const tabs = document.querySelectorAll('.dest-tab');
    const buscaWrapper = document.getElementById('aluno-busca-wrapper');
    const inputHidden = document.getElementById('destinatario-tipo-input');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            destinatarioAtual = this.dataset.tipo;
            if (inputHidden) inputHidden.value = destinatarioAtual;

            if (destinatarioAtual === 'especifico') {
                buscaWrapper.style.display = 'block';
            } else {
                buscaWrapper.style.display = 'none';
                limparAlunoSelecionado();
            }

            atualizarCategoriaPorDestinatario();
        });
    });
}

// ========== CATEGORIA TABS ==========
function initCategoriaTabs() {
    const tabs = document.querySelectorAll('.categoria-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            if (this.classList.contains('disabled')) return;
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            categoriaAtual = this.dataset.categoria;
            document.getElementById('categoria-input').value = categoriaAtual;
        });
    });
}

// ========== BUSCA ALUNO ==========
function initBuscaAluno() {
    const input = document.getElementById('busca-aluno-input');
    const sugestoesBox = document.getElementById('aluno-sugestoes');
    if (!input || !sugestoesBox) return;

    let timeoutId;

    input.addEventListener('input', function () {
        clearTimeout(timeoutId);
        const termo = this.value.trim();

        if (termo.length === 0) {
            sugestoesBox.innerHTML = '';
            sugestoesBox.style.display = 'none';
            return;
        }

        timeoutId = setTimeout(() => {
            renderizarSugestoesAluno(termo);
        }, 200);
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const primeiraSugestao = sugestoesBox.querySelector('.aluno-sugestao-item');
            if (primeiraSugestao) {
                primeiraSugestao.click();
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !sugestoesBox.contains(e.target)) {
            sugestoesBox.innerHTML = '';
            sugestoesBox.style.display = 'none';
        }
    });
}

function renderizarSugestoesAluno(termo) {
    const sugestoesBox = document.getElementById('aluno-sugestoes');
    const termoLower = termo.toLowerCase().trim();
    
    const resultados = alunos
        .filter(a => (a.nome_aluno || '').toLowerCase().startsWith(termoLower))
        .slice(0, 6);

    if (resultados.length === 0) {
        sugestoesBox.innerHTML = `<div class="aluno-sugestao-vazia">Nenhum aluno encontrado para "${escapeHtml(termo)}"</div>`;
        sugestoesBox.style.display = 'block';
        return;
    }

    sugestoesBox.innerHTML = resultados.map(aluno => `
        <div class="aluno-sugestao-item" data-id="${aluno.id_aluno}">
            <i class="fas fa-user"></i>
            <span>${escapeHtml(aluno.nome_aluno)}</span>
            ${aluno.turma ? `<span class="aluno-turma">${escapeHtml(aluno.turma)}</span>` : ''}
        </div>
    `).join('');

    sugestoesBox.style.display = 'block';

    sugestoesBox.querySelectorAll('.aluno-sugestao-item').forEach(item => {
        item.addEventListener('click', function() {
            const id = this.dataset.id;
            const aluno = alunos.find(a => String(a.id_aluno) === String(id));
            if (aluno) selecionarAluno(aluno);
        });
    });
}

function selecionarAluno(aluno) {
    alunoSelecionado = aluno;

    const input = document.getElementById('busca-aluno-input');
    const sugestoesBox = document.getElementById('aluno-sugestoes');
    const selecionadoBox = document.getElementById('aluno-selecionado');
    const selecionadoNome = document.getElementById('aluno-selecionado-nome');
    const idHidden = document.getElementById('id-aluno-selecionado');

    input.value = '';
    sugestoesBox.innerHTML = '';
    sugestoesBox.style.display = 'none';
    selecionadoNome.textContent = aluno.turma ? `${aluno.nome_aluno} — ${aluno.turma}` : aluno.nome_aluno;
    selecionadoBox.style.display = 'inline-flex';
    if (idHidden) idHidden.value = aluno.id_aluno;
}

function limparAlunoSelecionado() {
    alunoSelecionado = null;

    const input = document.getElementById('busca-aluno-input');
    const selecionadoBox = document.getElementById('aluno-selecionado');
    const idHidden = document.getElementById('id-aluno-selecionado');

    if (input) input.value = '';
    if (selecionadoBox) selecionadoBox.style.display = 'none';
    if (idHidden) idHidden.value = '';
}

function initRemoverAlunoSelecionado() {
    const btn = document.getElementById('remover-aluno-selecionado');
    if (!btn) return;
    btn.addEventListener('click', limparAlunoSelecionado);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function () {
    if (typeof alunosData !== 'undefined') {
        alunos = alunosData;
    }
    if (typeof notificacoesData !== 'undefined') {
        notificacoesHeader = notificacoesData;
    }

    initSidebar();
    initProfileDropdown();
    initNotifications();
    initFormNotificacao();
    initDestinatarioTabs();
    initCategoriaTabs();
    initBuscaAluno();
    initRemoverAlunoSelecionado();

    atualizarCategoriaPorDestinatario();
    renderizarDropdownNotificacoes();
});
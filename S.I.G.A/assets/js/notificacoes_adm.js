// ========== VARIÁVEIS GLOBAIS ==========
let notificacoesHeader = [];
let alunos = [];
let alunoSelecionado = null; // { id_aluno, nome_aluno, turma }
let destinatarioAtual = 'todos'; // 'todos' | 'especifico'
let categoriaAtual = 'pendencia'; // 'pendencia' | 'aviso'

// ========== FUNÇÕES AUXILIARES ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== DROPDOWN DE NOTIFICAÇÕES DO HEADER (sininho) ==========
function renderizarDropdownNotificacoes() {
    const lista = document.getElementById('notification-list-dropdown');
    if (!lista) return;

    if (notificacoesHeader.length === 0) {
        lista.innerHTML = `
            <div class="empty-notifications">
                <i class="far fa-bell-slash"></i>
                <p>Nenhuma notificação</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = notificacoesHeader.slice(0, 5).map(notificacao => `
        <div class="notificacao-item">
            <div class="notificacao-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="notificacao-content">
                <h4>${escapeHtml(notificacao.titulo || 'Nova Notificação')}</h4>
                <p>${escapeHtml(notificacao.mensagem || 'Você tem um novo aviso no sistema.')}</p>
            </div>
        </div>
    `).join('');
}

function initMarcarComoLidas() {
    const botao = document.querySelector('.mark-read-btn');
    if (!botao) return;

    botao.addEventListener('click', (e) => {
        e.stopPropagation();
        notificacoesHeader = [];
        renderizarDropdownNotificacoes();
    });
}

// ========== SIDEBAR (RECOLHER / EXPANDIR) ==========
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

// ========== NOTIFICAÇÕES (sino do header) ==========
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

// =============================================
// BLOCO DE COMPOSIÇÃO
// =============================================

// ========== GERENCIAR CATEGORIA CONFORME DESTINATÁRIO ==========
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
        }
    } else {
        tabPendencia.classList.remove('disabled');
    }
}

// ---------- Destinatário (todos x aluno específico) ----------
function initDestinatarioTabs() {
    const tabs = document.querySelectorAll('.dest-tab');
    const buscaWrapper = document.getElementById('aluno-busca-wrapper');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            destinatarioAtual = this.dataset.tipo;

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

// ---------- Categoria ----------
function initCategoriaTabs() {
    const tabs = document.querySelectorAll('.categoria-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            if (this.classList.contains('disabled')) return;

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            categoriaAtual = this.dataset.categoria;
        });
    });
}

// ---------- Busca inteligente de alunos (COM SUPORTE A ENTER) ----------
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
            return;
        }

        timeoutId = setTimeout(() => {
            renderizarSugestoesAluno(termo);
        }, 200);
    });

    // ========== SUPORTE À TECLA ENTER ==========
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();

            const primeiraSugestao = sugestoesBox.querySelector('.aluno-sugestao-item');
            
            if (primeiraSugestao) {
                primeiraSugestao.click();
            } else if (this.value.trim().length > 0) {
                const termo = this.value.trim().toLowerCase();
                const alunoEncontrado = alunos.find(a => 
                    (a.nome_aluno || '').toLowerCase().includes(termo)
                );
                
                if (alunoEncontrado) {
                    selecionarAluno(alunoEncontrado);
                } else {
                    showToast('Nenhum aluno encontrado com este nome.', 'error');
                }
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !sugestoesBox.contains(e.target)) {
            sugestoesBox.innerHTML = '';
        }
    });
}

function renderizarSugestoesAluno(termo) {
    const sugestoesBox = document.getElementById('aluno-sugestoes');
    const termoLower = termo.toLowerCase().trim();
    
    // FILTRO POR PREFIXO (começa com o termo digitado)
    const resultados = alunos
        .filter(a => {
            const nome = (a.nome_aluno || '').toLowerCase();
            return nome.startsWith(termoLower); // <-- MUDANÇA AQUI
        })
        .slice(0, 6);

    if (resultados.length === 0) {
        sugestoesBox.innerHTML = `<div class="aluno-sugestao-vazia">Nenhum aluno encontrado para "${escapeHtml(termo)}"</div>`;
        return;
    }

    sugestoesBox.innerHTML = resultados.map(aluno => `
        <div class="aluno-sugestao-item" data-id="${aluno.id_aluno}">
            <i class="fas fa-user"></i>
            <span>${escapeHtml(aluno.nome_aluno)}</span>
            ${aluno.turma ? `<span class="aluno-turma">${escapeHtml(aluno.turma)}</span>` : ''}
        </div>
    `).join('');

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
    const buscaContainer = document.querySelector('.busca-aluno-container');

    input.value = '';
    sugestoesBox.innerHTML = '';
    selecionadoNome.textContent = aluno.turma ? `${aluno.nome_aluno} — ${aluno.turma}` : aluno.nome_aluno;
    selecionadoBox.style.display = 'inline-flex';
    
    if (buscaContainer) {
        buscaContainer.style.display = 'none';
    }
}

function limparAlunoSelecionado() {
    alunoSelecionado = null;

    const input = document.getElementById('busca-aluno-input');
    const selecionadoBox = document.getElementById('aluno-selecionado');
    const buscaContainer = document.querySelector('.busca-aluno-container');

    if (input) {
        input.value = '';
        input.style.display = '';
    }
    if (selecionadoBox) {
        selecionadoBox.style.display = 'none';
    }
    if (buscaContainer) {
        buscaContainer.style.display = 'block';
    }
}

function initRemoverAlunoSelecionado() {
    const btn = document.getElementById('remover-aluno-selecionado');
    if (!btn) return;
    btn.addEventListener('click', limparAlunoSelecionado);
}

// ---------- Envio do formulário ----------
function initFormEnvio() {
    const form = document.getElementById('form-notificacao');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const mensagem = document.getElementById('mensagem-textarea').value.trim();
        const enviarEmail = document.getElementById('enviar-email-checkbox').checked;
        const btnEnviar = document.getElementById('btn-enviar-notificacao');

        if (mensagem === '') {
            showToast('Escreva uma mensagem antes de enviar.', 'error');
            return;
        }

        if (destinatarioAtual === 'especifico' && !alunoSelecionado) {
            showToast('Selecione um aluno específico ou mude para "Todos os alunos".', 'error');
            return;
        }

        const payload = {
            destinatario_tipo: destinatarioAtual,
            id_aluno: destinatarioAtual === 'especifico' ? alunoSelecionado.id_aluno : null,
            categoria: categoriaAtual,
            mensagem: mensagem,
            enviar_email: enviarEmail
        };

        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            const response = await fetch('enviar_notificacao_adm.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                showToast('Notificação enviada com sucesso!', 'success');
                resetarFormulario();
            } else {
                showToast(result.message || 'Erro ao enviar notificação.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro de comunicação com o servidor.', 'error');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar notificação';
        }
    });
}

function resetarFormulario() {
    document.getElementById('mensagem-textarea').value = '';

    document.querySelectorAll('.dest-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.dest-tab[data-tipo="todos"]').classList.add('active');
    destinatarioAtual = 'todos';
    document.getElementById('aluno-busca-wrapper').style.display = 'none';
    limparAlunoSelecionado();

    document.querySelectorAll('.categoria-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.categoria-tab[data-categoria="pendencia"]').classList.add('active');
    categoriaAtual = 'pendencia';
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
        <span>${escapeHtml(message)}</span>
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
document.addEventListener('DOMContentLoaded', function () {
    if (typeof notificacoesData !== 'undefined') {
        notificacoesHeader = notificacoesData;
    }
    if (typeof alunosData !== 'undefined') {
        alunos = alunosData;
    }

    initSidebar();
    initProfileDropdown();
    initNotifications();
    initMarcarComoLidas();
    renderizarDropdownNotificacoes();

    initDestinatarioTabs();
    initCategoriaTabs();
    initBuscaAluno();
    initRemoverAlunoSelecionado();
    initFormEnvio();

    // Aplica estado inicial (desabilita Pendência quando "Todos" estiver ativo)
    atualizarCategoriaPorDestinatario();
});
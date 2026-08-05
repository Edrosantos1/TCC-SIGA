// ========== VARIÁVEIS GLOBAIS ==========
let alunos = [];
let alunoSelecionado = null;
let destinatarioAtual = 'todos';
let categoriaAtual = 'aviso';
let filtroPeriodo = 'semana';
let filtroOrdenacao = 'mais_recente';
let enviando = false;

// ========== FUNÇÕES AUXILIARES ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

// ========== PREVENIR ENVIO DUPLICADO ==========
function initPrevenirEnvioDuplicado() {
    const form = document.getElementById('form-notificacao');
    const btnEnviar = document.getElementById('btn-enviar-notificacao');
    
    if (form && btnEnviar) {
        form.addEventListener('submit', function(e) {
            if (enviando) {
                e.preventDefault();
                return;
            }
            
            enviando = true;
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        });
    }
}

// ========== FILTROS DO HISTÓRICO ==========
function initFiltrosHistorico() {
    document.querySelectorAll('.filtro-periodo .filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filtro-periodo .filtro-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroPeriodo = this.dataset.periodo;
            carregarHistoricoFiltrado();
        });
    });

    document.querySelectorAll('.filtros-ordenacao .filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filtros-ordenacao .filtro-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroOrdenacao = this.dataset.ordenacao;
            carregarHistoricoFiltrado();
        });
    });
}

async function carregarHistoricoFiltrado() {
    const container = document.querySelector('.historico-lista');
    const emptyContainer = document.querySelector('.empty-historico');
    const loading = document.getElementById('historico-loading');
    
    if (!container) return;

    if (loading) loading.style.display = 'block';
    container.style.opacity = '0.3';

    try {
        const response = await fetch(`buscar_notificacoes.php?periodo=${filtroPeriodo}&ordenacao=${filtroOrdenacao}`);
        const data = await response.json();

        if (data.error) {
            console.error('Erro ao carregar histórico:', data.error);
            return;
        }

        if (data.length === 0) {
            if (emptyContainer) emptyContainer.style.display = 'block';
            container.innerHTML = '';
            if (loading) loading.style.display = 'none';
            container.style.opacity = '1';
            return;
        }

        if (emptyContainer) emptyContainer.style.display = 'none';

        container.innerHTML = data.map(notif => {
            const isPendencia = notif.tipo === 'pendencia';
            const corLabel = isPendencia ? 'pendencia' : 'aviso';
            const icone = isPendencia ? 'fa-exclamation-triangle' : 'fa-info-circle';
            
            // 🔥 VERIFICAR SE É "TODOS OS ALUNOS"
            // Pode vir como 'Todos os alunos' ou 'todos os alunos'
            const isTodosAlunos = notif.alunos_nomes && notif.alunos_nomes.toLowerCase().includes('todos os alunos');
            
            console.log('🔍 Notificação:', notif.id, '| Alunos:', notif.alunos_nomes, '| Total:', notif.total_alunos, '| isTodos:', isTodosAlunos);
            
            return `
                <div class="historico-item">
                    <div class="historico-header">
                        <div class="historico-info">
                            <span class="historico-categoria ${corLabel}">
                                <i class="fas ${icone}"></i>
                                ${isPendencia ? 'Pendência' : 'Aviso'}
                            </span>
                            <span class="historico-data">
                                <i class="far fa-calendar-alt"></i>
                                ${formatarData(notif.criado_em)}
                            </span>
                        </div>
                        <span class="historico-destinatarios">
                            <i class="fas fa-users"></i>
                            ${notif.total_alunos} aluno(s)
                        </span>
                    </div>
                    
                    <div class="historico-mensagem">
                        ${escapeHtml(notif.mensagem)}
                    </div>
                    
                    <div class="historico-alunos">
                        ${isTodosAlunos ? `
                            <span style="display: inline-flex; align-items: center; gap: 6px; background: #eaf4ff; padding: 4px 14px; border-radius: 12px; color: #0b4b9b; font-weight: 600; font-size: 12px;">
                                <i class="fas fa-globe"></i> Enviado para todos os alunos
                            </span>
                        ` : `
                            ${notif.alunos_nomes ? escapeHtml(notif.alunos_nomes) : 'Nenhum aluno'}
                        `}
                    </div>
                </div>
            `;
        }).join('');

        container.style.opacity = '1';

    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    } finally {
        if (loading) loading.style.display = 'none';
        container.style.opacity = '1';
    }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function () {
    if (typeof alunosData !== 'undefined') {
        alunos = alunosData;
    }

    initSidebar();
    initProfileDropdown();
    initDestinatarioTabs();
    initCategoriaTabs();
    initBuscaAluno();
    initRemoverAlunoSelecionado();
    initFiltrosHistorico();
    initPrevenirEnvioDuplicado();

    atualizarCategoriaPorDestinatario();
    carregarHistoricoFiltrado();
});
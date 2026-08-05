// =============================================
// dashboard_adm.js — PESQUISA LOCAL
// =============================================

// ========== VARIÁVEIS GLOBAIS ==========
let alunos = [];
let notificacoes = [];

// ========== COR ÚNICA PARA TODOS OS AVATARES ==========
function getAvatarColor() {
    return '#0b4b9b';
}

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

// ========== ÍCONES COM COR DIFERENCIADA ==========
function getStatusIcon(aluno) {
    const iconReserva = '<i class="fas fa-bookmark" style="color: #0b4b9b; font-size: 14px;" title="Possui reservas"></i>';
    const iconPendencia = '<i class="fas fa-exclamation-circle" style="color: #e67e22; font-size: 14px;" title="Possui empréstimos/pendências"></i>';
    
    if (aluno.tem_reservas && aluno.tem_emprestimos) {
        return iconReserva + ' ' + iconPendencia;
    }
    if (aluno.tem_reservas) {
        return iconReserva;
    }
    if (aluno.tem_emprestimos) {
        return iconPendencia;
    }
    return '';
}

function redirecionarAluno(aluno) {
    const id = aluno.id_aluno;
    const nome = aluno.nome_aluno;
    const temReservas = aluno.tem_reservas || false;
    const temEmprestimos = aluno.tem_emprestimos || false;

    if (temReservas && temEmprestimos) {
        window.location.href = `perfil_aluno.php?id=${id}`;
    } else if (temReservas) {
        window.location.href = `reservas_adm.php?aluno_id=${id}`;
    } else if (temEmprestimos) {
        window.location.href = `pendencias_adm.php?aluno_id=${id}`;
    } else {
        alert(`O aluno ${nome} não possui reservas ou empréstimos ativos.`);
    }
}

// ========== SIDEBAR ==========
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    if (!sidebar || !collapseBtn) return;

    if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }

    collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('adm_sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// ========== DATA/HORA ==========
function renderDate() {
    const el = document.getElementById('welcome-date');
    if (!el) return;
    const now = new Date();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    el.innerHTML = `${now.getDate()} de ${meses[now.getMonth()]}, ${now.getFullYear()}`;
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

// ========== PESQUISA LOCAL ==========
function initSearch() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    let timeoutId;

    input.addEventListener('input', function() {
        const termo = this.value.trim();
        if (termo.length < 1) {
            results.style.display = 'none';
            results.innerHTML = '';
            return;
        }

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const termoLower = termo.toLowerCase();
            const resultados = alunos.filter(a =>
                a.nome_aluno && a.nome_aluno.toLowerCase().startsWith(termoLower)
            ).slice(0, 8);

            if (resultados.length === 0) {
                results.innerHTML = `<div class="search-empty"><i class="fas fa-search"></i> Nenhum aluno encontrado</div>`;
                results.style.display = 'block';
                return;
            }

            results.innerHTML = '';
            resultados.forEach(aluno => {
                const inicial = aluno.nome_aluno.trim().charAt(0).toUpperCase();
                const cor = getAvatarColor();
                const serie = aluno.serie_aluno || 'Aluno';
                const statusIcon = getStatusIcon(aluno);

                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = `
                    <div class="search-avatar" style="background-color: ${cor};">${inicial}</div>
                    <div class="search-info">
                        <div class="search-name">${escapeHtml(aluno.nome_aluno)}</div>
                        <div class="search-detail">${escapeHtml(serie)}</div>
                    </div>
                    <div class="search-status-icon">${statusIcon}</div>
                `;

                div.addEventListener('click', () => {
                    redirecionarAluno(aluno);
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
        }, 200);
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

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    if (typeof alunosData !== 'undefined') {
        alunos = alunosData;
        console.log(`📚 ${alunos.length} alunos carregados.`);
    }
    
    if (typeof notificacoesData !== 'undefined') {
        notificacoes = notificacoesData;
        console.log(`🔔 ${notificacoes.length} notificações carregadas.`);
    }

    initSidebar();
    renderDate();
    initProfileDropdown();
    initNotifications();
    initSearch();
    
    // Renderiza notificações ao carregar
    renderizarDropdownNotificacoes();

    console.log('✅ Dashboard com pesquisa local carregado.');
});
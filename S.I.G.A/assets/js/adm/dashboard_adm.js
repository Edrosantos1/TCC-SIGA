// =============================================
// dashboard_adm.js — PESQUISA + BI
// =============================================

let alunos = [];
let notificacoes = [];

function getAvatarColor() {
    return '#0035ff';
}

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
        const corIcon = isPendencia ? '#e67e22' : '#0035ff';
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

function getStatusIcon(aluno) {
    const iconReserva = '<i class="fas fa-bookmark" style="color: #0035ff; font-size: 14px;" title="Possui reservas"></i>';
    const iconPendencia = '<i class="fas fa-exclamation-circle" style="color: #e67e22; font-size: 14px;" title="Possui empréstimos/pendências"></i>';

    if (aluno.tem_reservas && aluno.tem_emprestimos) return iconReserva + ' ' + iconPendencia;
    if (aluno.tem_reservas) return iconReserva;
    if (aluno.tem_emprestimos) return iconPendencia;
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

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    if (!sidebar || !collapseBtn) return;

    if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }

    // Remove a flag anti-FOUC — a partir daqui o JS controla (com animação)
    document.documentElement.classList.remove('sidebar-collapsed-init');

    collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('adm_sidebarCollapsed', sidebar.classList.contains('collapsed'));

        // 🔄 Redimensiona os gráficos após a transição da sidebar (0.4s)
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 450);
    });
}

function renderDate() {
    const el = document.getElementById('welcome-date-value');
    if (!el) return;
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    el.textContent = `${dia}/${mes}/${now.getFullYear()}`;
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

                div.addEventListener('click', () => redirecionarAluno(aluno));
                div.addEventListener('mouseenter', () => { div.style.background = '#f8f9fa'; });
                div.addEventListener('mouseleave', () => { div.style.background = 'transparent'; });

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

// ========== DASHBOARD BI — GRÁFICOS ==========
function initBICharts() {
    if (typeof ApexCharts === 'undefined') {
        console.warn('⚠ ApexCharts não foi carregado.');
        return;
    }

    (window.adminDashboardCharts || []).forEach(chart => chart.destroy());
    window.adminDashboardCharts = [];

    const isDark    = document.body.classList.contains('tema-escuro');
    const isContras = document.body.classList.contains('tema-alto_contraste');
    const isDarkLike = isDark || isContras;

    const foreColor = isDarkLike ? '#f0f0f0' : '#475569';
    const gridColor = isDarkLike ? '#2a3a5e' : '#e5e9f0';
    const chartTheme = isDarkLike ? 'dark' : 'light';

    const labelsSegmento  = window.labelsSegmento  || [];
    const valoresSegmento = window.valoresSegmento || [];
    const labelsSerie     = window.labelsSerie     || [];
    const valoresSerie    = window.valoresSerie    || [];

    // ---------- DONUT ----------
    const elDonut = document.querySelector('#chartDonut');
    if (elDonut) {
        const temDadosDonut = valoresSegmento.some(v => v > 0);
        const labelsDonut = temDadosDonut ? labelsSegmento : ['Sem dados'];

        const chart = new ApexCharts(elDonut, {
            chart: {
                type: 'donut',
                height: 240,
                foreColor: foreColor,
                events: {
                    dataPointSelection: function(event, ctx, config) {
                        const seg = ctx.w.globals.labels[config.dataPointIndex];
                        if (seg && seg !== 'Outros' && seg !== 'Sem dados') {
                            window.location.href = 'dashboard_adm.php?segmento=' + encodeURIComponent(seg);
                        }
                    }
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%'
                    }
                }
            },
            series: temDadosDonut ? valoresSegmento : [1],
            labels: labelsDonut,
            colors: temDadosDonut ? ['#0035ff', '#60a5fa', '#93c5fd'] : ['#cbd5e1'],
            fill: { type: 'solid', opacity: 1 },
            legend: {
                position: 'bottom',
                labels: { colors: labelsDonut.map(() => foreColor) }
            },
            dataLabels: { enabled: temDadosDonut },
            tooltip: {
                theme: chartTheme,
                style: { fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }
            }
        });
        window.adminDashboardCharts.push(chart);
        chart.render();
    }

    // ---------- BARRAS ----------
    const elBarras = document.querySelector('#chartBarras');
    if (elBarras) {
        const chart = new ApexCharts(elBarras, {
            chart: {
                type: 'bar',
                height: 240,
                toolbar: { show: false },
                foreColor: foreColor
            },
            series: [{ name: 'Pendências', data: valoresSerie }],
            xaxis: {
                categories: labelsSerie,
                labels: { style: { colors: [foreColor] } }
            },
            yaxis: {
                labels: { style: { colors: [foreColor] } }
            },
            grid: { borderColor: gridColor },
            colors: ['#0035ff'],
            fill: { type: 'solid', opacity: 1 },
            plotOptions: {
                bar: { borderRadius: 6, columnWidth: '50%' }
            },
            dataLabels: { enabled: true, style: { colors: [isDarkLike ? foreColor : '#ffffff'] } },
            noData: { text: 'Sem dados', style: { color: foreColor } },
            tooltip: {
                theme: chartTheme,
                style: { fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }
            }
        });
        window.adminDashboardCharts.push(chart);
        chart.render();
    }
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
    renderizarDropdownNotificacoes();
    initBICharts();
    document.addEventListener('admin:appearancechange', initBICharts);

    console.log('✅ Dashboard com pesquisa local + BI carregado.');
});
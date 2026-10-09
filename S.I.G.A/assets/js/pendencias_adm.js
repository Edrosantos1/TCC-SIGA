// ========== ESTADO GLOBAL ==========
let pendencias = [];
let alunos = [];
let filtroAtual = (typeof window.filtroInicialPendencias !== 'undefined' && window.filtroInicialPendencias) ? window.filtroInicialPendencias : 'todos';
let buscaAtual = '';
let ordemAtual = 'recente';
let notificacoes = [];
let devolucaoPendente = null;
let focoAnteriorModal = null;

// ========== HELPERS ==========
const HTML_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text).replace(/[&<>"']/g, c => HTML_ESC[c]);
}

function normalizar(texto) {
    return String(texto ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function destacar(texto, termos) {
    const original = String(texto ?? '');
    if (!termos.length) return escapeHtml(original);

    let norm = '';
    const mapa = [];
    for (let i = 0; i < original.length; i++) {
        const n = original[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (const c of n) { norm += c; mapa.push(i); }
    }

    const faixas = [];
    termos.forEach(t => {
        let pos = norm.indexOf(t);
        while (pos !== -1) {
            faixas.push([mapa[pos], mapa[pos + t.length - 1] + 1]);
            pos = norm.indexOf(t, pos + t.length);
        }
    });
    if (!faixas.length) return escapeHtml(original);

    faixas.sort((a, b) => a[0] - b[0]);
    const unidas = [faixas[0].slice()];
    for (const f of faixas.slice(1)) {
        const ult = unidas[unidas.length - 1];
        if (f[0] <= ult[1]) ult[1] = Math.max(ult[1], f[1]);
        else unidas.push(f.slice());
    }

    let out = '';
    let cursor = 0;
    unidas.forEach(([ini, fim]) => {
        out += escapeHtml(original.slice(cursor, ini)) + '<mark>' + escapeHtml(original.slice(ini, fim)) + '</mark>';
        cursor = fim;
    });
    return out + escapeHtml(original.slice(cursor));
}

function formatarDataBR(dataStr) {
    if (!dataStr) return '-';
    const dataApenas = String(dataStr).split(' ')[0];
    const partes = dataApenas.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
}

function formatarDataRelativa(data) {
    const d = new Date(String(data).replace(' ', 'T'));
    if (isNaN(d)) return '';
    const diff = Math.floor((new Date() - d) / 1000);
    if (diff < 60) return 'Agora pouco';
    if (diff < 3600) return Math.floor(diff / 60) + ' min atrás';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
    if (diff < 172800) return 'Ontem';
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function rotuloDias(p) {
    if (p.status === 'atrasado') {
        const d = p.dias_atraso || 0;
        return { texto: d === 1 ? '1 dia de atraso' : `${d} dias de atraso`, classe: 'aux-atraso' };
    }
    const d = p.dias_restantes;
    if (d === 0) return { texto: 'Vence hoje', classe: 'aux-hoje' };
    if (d === 1) return { texto: 'Amanhã', classe: 'aux-proximo' };
    if (d <= 3)  return { texto: `Em ${d} dias`, classe: 'aux-proximo' };
    return { texto: `Em ${d} dias`, classe: 'aux-ok' };
}

const venceHoje = p => p.status !== 'atrasado' && p.dias_restantes === 0;

// ========== BUSCA DE ALUNO NO TOPO (copiada do dashboard_adm.js) ==========
function getAvatarColor() { return '#0b4b9b'; }

function getStatusIcon(aluno) {
    const iconReserva = '<i class="fas fa-bookmark" style="color: #0b4b9b; font-size: 14px;" title="Possui reservas"></i>';
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

// ========== NOTIFICAÇÕES ==========
function renderizarDropdownNotificacoes() {
    const lista = document.getElementById('notification-list-dropdown');
    if (!lista) return;

    if (!notificacoes || notificacoes.length === 0) {
        lista.innerHTML = `
            <div class="empty-notifications">
                <i class="far fa-bell-slash"></i>
                <p>Nenhuma notificação enviada</p>
            </div>`;
        return;
    }

    lista.innerHTML = notificacoes.slice(0, 10).map(n => {
        const isPendencia = n.tipo === 'pendencia';
        const corIcon = isPendencia ? '#e67e22' : '#0b4b9b';
        const icone = isPendencia ? 'fa-exclamation-triangle' : 'fa-info-circle';
        const label = isPendencia ? 'Pendência' : 'Aviso';
        const total = parseInt(n.total_alunos, 10) || 0;
        const textoAlunos = total === 1 ? '1 aluno' : total + ' alunos';

        return `
            <div class="notification-item">
                <div class="notification-icon" style="color:${corIcon};">
                    <i class="fas ${icone}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">
                        <strong style="color:${corIcon};">${label}</strong><br>
                        ${escapeHtml(n.mensagem)}
                    </div>
                    <div class="notification-footer">
                        <span class="notification-date">${formatarDataRelativa(n.criado_em)}</span>
                        <span class="notification-destinatarios">
                            <i class="fas fa-users"></i> ${textoAlunos}
                        </span>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// ========== FILTRAR / ORDENAR ==========
function filtrarEOrdenar() {
    let lista = [...pendencias];

    if (filtroAtual === 'hoje') lista = lista.filter(venceHoje);
    else if (filtroAtual !== 'todos') lista = lista.filter(p => p.status === filtroAtual);

    const termos = normalizar(buscaAtual).split(/\s+/).filter(Boolean);
    if (termos.length) {
        lista = lista.filter(p => {
            const alvo = normalizar(`${p.aluno} ${p.material}`);
            return termos.every(t => alvo.includes(t));
        });
    }

    if (ordemAtual === 'recente') {
        lista.sort((a, b) => new Date(b.data_emprestimo) - new Date(a.data_emprestimo));
    } else if (ordemAtual === 'antigo') {
        lista.sort((a, b) => new Date(a.data_emprestimo) - new Date(b.data_emprestimo));
    } else if (ordemAtual === 'urgencia') {
        lista.sort((a, b) => {
            const rank = s => s === 'atrasado' ? 0 : 1;
            const r = rank(a.status) - rank(b.status);
            if (r !== 0) return r;
            return new Date(a.data_limite) - new Date(b.data_limite);
        });
    } else if (ordemAtual === 'aluno') {
        lista.sort((a, b) => String(a.aluno).localeCompare(String(b.aluno), 'pt-BR', { sensitivity: 'base' }));
    }

    return { lista, termos };
}

// ========== RENDERIZAÇÃO ==========
function renderizarPendencias() {
    const tbody = document.getElementById('pendencias-tbody');
    const tableWrapper = document.getElementById('table-wrapper');
    if (!tbody) return;

    const { lista, termos } = filtrarEOrdenar();

    atualizarBadges();

    const buscaCountEl = document.getElementById('busca-count');
    if (buscaCountEl) buscaCountEl.textContent = lista.length;

    const info = document.getElementById('resultado-info');
    if (info) {
        info.textContent = lista.length === pendencias.length
            ? ''
            : `Mostrando ${lista.length} de ${pendencias.length}`;
    }

    if (lista.length === 0) {
        tbody.innerHTML = '';
        if (tableWrapper) tableWrapper.style.display = 'none';
        mostrarEmptyState();
        return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = lista.map((p, idx) => {
        const statusIcon = {
            'emprestado': 'fa-check-circle',
            'atrasado': 'fa-exclamation-triangle',
            'devolvido': 'fa-undo-alt'
        }[p.status] || 'fa-circle';

        const statusLabel = p.status === 'emprestado' ? 'No prazo'
            : p.status.charAt(0).toUpperCase() + p.status.slice(1);
        const dataEmp = formatarDataBR(p.data_emprestimo);
        const dataLim = formatarDataBR(p.data_limite);
        const inicial = p.aluno ? p.aluno.trim().charAt(0).toUpperCase() : '?';
        const rotulo = rotuloDias(p);

        const rowClass = p.status === 'atrasado'
            ? 'pendencia-row row-atraso'
            : (venceHoje(p) ? 'pendencia-row row-hoje' : 'pendencia-row');

        const delay = idx < 8 ? `style="animation-delay:${idx * 35}ms"` : '';
        const serie = p.serie ? `<span class="aluno-serie">${escapeHtml(p.serie)}</span>` : '';

        const acoes = (p.status === 'emprestado' || p.status === 'atrasado')
            ? `<button type="button" class="btn-acao btn-devolver" data-id="${escapeHtml(p.id)}" title="Registrar devolução">
                    <i class="fas fa-undo-alt"></i> Devolver
               </button>`
            : `<span class="sem-acao" title="Sem ações disponíveis">—</span>`;

        return `
            <tr class="${rowClass}" data-id="${escapeHtml(p.id)}" ${delay}>
                <td class="col-aluno" data-label="Aluno">
                    <div class="aluno-info">
                        <span class="aluno-avatar" aria-hidden="true">${escapeHtml(inicial)}</span>
                        <div class="aluno-texto">
                            <span class="aluno-nome" title="${escapeHtml(p.aluno)}">${destacar(p.aluno, termos)}</span>
                            ${serie}
                        </div>
                    </div>
                </td>
                <td class="material-nome" data-label="Material">${destacar(p.material, termos)}</td>
                <td class="text-center" data-label="Tipo"><span class="tipo-badge">${escapeHtml(p.tipo || 'Livro')}</span></td>
                <td class="col-data" data-label="Empréstimo">
                    <div class="data-cell">
                        <span class="data-principal">${dataEmp}</span>
                    </div>
                </td>
                <td class="col-data" data-label="Devolução">
                    <div class="data-cell">
                        <span class="data-principal">${dataLim}</span>
                        <span class="data-aux ${rotulo.classe}">${rotulo.texto}</span>
                    </div>
                </td>
                <td class="text-center" data-label="Status">
                    <span class="status-badge status-${escapeHtml(p.status)}">
                        <i class="fas ${statusIcon}"></i> ${statusLabel}
                    </span>
                </td>
                <td class="acoes-cell" data-label="">${acoes}</td>
            </tr>`;
    }).join('');
}

function mostrarEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const title = document.getElementById('empty-title');
    const msg = document.getElementById('empty-message');
    const icon = document.getElementById('empty-icon');
    const btnCatalogo = document.getElementById('empty-catalogo');
    const btnLimpar = document.getElementById('empty-limpar');
    if (!emptyState) return;

    const temBusca = buscaAtual.trim() !== '';
    const temFiltro = filtroAtual !== 'todos' || temBusca;
    const nomesFiltro = { atrasado: 'em atraso', emprestado: 'no prazo', hoje: 'que vencem hoje' };

    if (pendencias.length === 0) {
        title.textContent = 'Tudo em ordem! 🎉';
        msg.textContent = 'Nenhum empréstimo ativo no momento.';
        icon.className = 'fas fa-inbox';
    } else if (temBusca) {
        title.textContent = 'Nenhum resultado';
        msg.textContent = `Nada encontrado para "${buscaAtual.trim()}"` +
            (filtroAtual !== 'todos' ? ` entre os empréstimos ${nomesFiltro[filtroAtual]}.` : '. Confira a grafia ou tente só parte do nome.');
        icon.className = 'fas fa-magnifying-glass';
    } else if (filtroAtual === 'atrasado') {
        title.textContent = 'Nenhum atraso! 🎉';
        msg.textContent = 'Nenhum empréstimo em atraso no momento.';
        icon.className = 'fas fa-circle-check';
    } else {
        title.textContent = 'Nada por aqui';
        msg.textContent = `Nenhum empréstimo ${nomesFiltro[filtroAtual] || ''} no momento.`;
        icon.className = 'fas fa-inbox';
    }

    if (btnCatalogo) btnCatalogo.style.display = temFiltro ? 'none' : 'inline-flex';
    if (btnLimpar) btnLimpar.style.display = temFiltro ? 'inline-flex' : 'none';
    emptyState.style.display = 'block';
}

// ========== MODAL DEVOLUÇÃO ==========
function abrirModalDevolucao(item) {
    const overlay = document.getElementById('modal-devolucao');
    if (!overlay) return;

    devolucaoPendente = item;
    focoAnteriorModal = document.activeElement;

    document.getElementById('modal-material').textContent = item.material;
    document.getElementById('modal-aluno').textContent = item.aluno;

    const rotulo = rotuloDias(item);
    document.getElementById('modal-prazo').textContent = formatarDataBR(item.data_limite);

    const badge = document.getElementById('modal-prazo-badge');
    if (badge) {
        badge.textContent = rotulo.texto;
        badge.className = 'modal-prazo-badge ' + rotulo.classe;
    }

    const btn = document.getElementById('modal-confirmar');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> Confirmar devolução';
    document.getElementById('modal-cancelar').disabled = false;

    overlay.hidden = false;
    document.body.classList.add('modal-aberto');
    document.getElementById('modal-cancelar').focus();
}

function fecharModalDevolucao() {
    const overlay = document.getElementById('modal-devolucao');
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('modal-aberto');
    devolucaoPendente = null;
    if (focoAnteriorModal && document.contains(focoAnteriorModal)) focoAnteriorModal.focus();
}

function enviarDevolucao() {
    if (!devolucaoPendente) return;
    const btn = document.getElementById('modal-confirmar');
    if (btn.disabled) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando…';
    document.getElementById('modal-cancelar').disabled = true;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'atualizar_status_emprestimo.php';

    [['id', devolucaoPendente.id], ['status', 'devolvido']].forEach(([nome, valor]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = nome;
        input.value = valor;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}

function initModalDevolucao() {
    const overlay = document.getElementById('modal-devolucao');
    const tbody = document.getElementById('pendencias-tbody');
    if (!overlay || !tbody) return;

    tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-devolver');
        if (!btn) return;
        const item = pendencias.find(p => String(p.id) === btn.dataset.id);
        if (item) abrirModalDevolucao(item);
    });

    document.getElementById('modal-cancelar').addEventListener('click', fecharModalDevolucao);
    document.getElementById('modal-confirmar').addEventListener('click', enviarDevolucao);

    overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) fecharModalDevolucao();
    });

    document.addEventListener('keydown', (e) => {
        if (overlay.hidden) return;
        if (e.key === 'Escape') { fecharModalDevolucao(); return; }
        if (e.key === 'Tab') {
            const focaveis = overlay.querySelectorAll('button:not([disabled])');
            if (!focaveis.length) return;
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
        }
    });
}

// ========== BADGES ==========
function atualizarBadges() {
    const total = pendencias.length;
    const atrasados = pendencias.filter(p => p.status === 'atrasado').length;
    const emprestados = pendencias.filter(p => p.status === 'emprestado').length;
    const hoje = pendencias.filter(venceHoje).length;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('badge-todos', total);
    set('badge-atrasado', atrasados);
    set('badge-emprestado', emprestados);
    set('badge-hoje', hoje);
    set('pendencias-badge', atrasados);

    const navBadge = document.getElementById('pendencias-badge');
    if (navBadge) navBadge.style.display = atrasados > 0 ? '' : 'none';
}

// ========== FILTROS ==========
function definirFiltro(status) {
    filtroAtual = status;
    document.querySelectorAll('.filtro-tab').forEach(t => {
        const ativo = t.dataset.status === status;
        t.classList.toggle('active', ativo);
        t.setAttribute('aria-selected', ativo ? 'true' : 'false');
    });
    renderizarPendencias();
}

function definirBusca(termo) {
    buscaAtual = termo;
    const buscaAtiva = document.getElementById('filtro-busca-ativa');
    const buscaTermo = document.getElementById('busca-termo');
    if (termo) {
        if (buscaTermo) buscaTermo.textContent = termo;
        if (buscaAtiva) buscaAtiva.style.display = 'flex';
    } else if (buscaAtiva) {
        buscaAtiva.style.display = 'none';
    }
    renderizarPendencias();
}

function limparFiltros() {
    const input = document.getElementById('filtro-tabela');
    if (input) input.value = '';
    buscaAtual = '';
    const buscaAtiva = document.getElementById('filtro-busca-ativa');
    if (buscaAtiva) buscaAtiva.style.display = 'none';
    definirFiltro('todos');
}

function initFiltros() {
    // A BUSCA DA TABELA agora usa #filtro-tabela (não mais #search-input)
    const buscaInput = document.getElementById('filtro-tabela');
    const limparBusca = document.getElementById('limpar-busca');

    document.querySelectorAll('.filtro-tab').forEach(tab => {
        tab.addEventListener('click', () => definirFiltro(tab.dataset.status));
    });

    let timeoutId;
    if (buscaInput) {
        buscaInput.addEventListener('input', function () {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => definirBusca(this.value.trim()), 200);
        });
        buscaInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && this.value) {
                this.value = '';
                definirBusca('');
            }
        });
    }

    if (limparBusca) {
        limparBusca.addEventListener('click', function () {
            if (buscaInput) { buscaInput.value = ''; buscaInput.focus(); }
            definirBusca('');
        });
    }

    const btnLimparVazio = document.getElementById('empty-limpar');
    if (btnLimparVazio) btnLimparVazio.addEventListener('click', limparFiltros);

    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('modal-devolucao');
        const digitando = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
        if (e.key === '/' && !digitando && !(modal && !modal.hidden) && buscaInput) {
            e.preventDefault();
            buscaInput.focus();
        }
    });
}

// ========== ORDENAÇÃO ==========
function initOrdenacao() {
    const btn = document.getElementById('btn-ordenacao');
    const dropdown = document.getElementById('ordenacao-dropdown');
    const wrapper = document.querySelector('.ordenacao-wrapper');
    const items = document.querySelectorAll('.ordenacao-item');
    const label = document.getElementById('ordenacao-label');

    if (!btn || !dropdown) return;

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        wrapper?.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
            wrapper?.classList.remove('active');
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            dropdown.classList.remove('show');
            wrapper?.classList.remove('active');
        }
    });

    items.forEach(item => {
        item.addEventListener('click', function () {
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            ordemAtual = this.dataset.ordem;
            label.textContent = this.textContent.trim();
            dropdown.classList.remove('show');
            wrapper?.classList.remove('active');
            renderizarPendencias();
        });
    });
}

// ========== SIDEBAR ==========
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    if (!sidebar || !collapseBtn) return;

    if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }

    document.documentElement.classList.remove('sidebar-collapsed-init');

    collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('adm_sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// ========== PROFILE ==========
function initProfileDropdown() {
    const btn = document.getElementById('admin-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    if (!btn || !dropdown) return;

    const toggle = (e) => {
        e?.stopPropagation();
        btn.classList.toggle('open');
        dropdown.classList.toggle('show');
    };

    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); }
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
        if (dropdown.classList.contains('show')) renderizarDropdownNotificacoes();
    });

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// ========== TOAST ==========
function criarContainerToast() {
    let c = document.querySelector('.toast-container');
    if (!c) {
        c = document.createElement('div');
        c.className = 'toast-container';
        c.setAttribute('aria-live', 'polite');
        document.body.appendChild(c);
    }
    return c;
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
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function () {
    if (typeof pendenciasData !== 'undefined') pendencias = pendenciasData;
    if (typeof alunosData !== 'undefined') alunos = alunosData;
    if (typeof notificacoesData !== 'undefined') notificacoes = notificacoesData;

    initSidebar();
    initProfileDropdown();
    initNotifications();
    initFiltros();
    initOrdenacao();
    initModalDevolucao();
    initSearch();  // ← busca global de aluno no topo

    document.querySelectorAll('.filtro-tab').forEach(t => {
        const ativo = t.dataset.status === filtroAtual;
        t.classList.toggle('active', ativo);
        t.setAttribute('aria-selected', ativo ? 'true' : 'false');
    });

    renderizarPendencias();
    renderizarDropdownNotificacoes();

    if (typeof msgSucesso !== 'undefined' && msgSucesso) showToast(msgSucesso, 'success');
    if (typeof msgErro !== 'undefined' && msgErro) showToast(msgErro, 'error');
});
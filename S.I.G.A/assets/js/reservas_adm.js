// ========== ESTADO GLOBAL ==========
let reservas = [];
let filtroAtual = (typeof window.filtroInicialReservas !== 'undefined' && window.filtroInicialReservas) ? window.filtroInicialReservas : 'todos';
let buscaAtual = '';
let ordemAtual = 'recente';
let notificacoes = [];
let acaoPendente = null;
let focoAnteriorModal = null;

const STATUS_ATIVOS = ['pendente', 'aprovada'];

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

function formatarData(data) {
    return formatarDataRelativa(data);
}

function capitalizar(texto) {
    const t = String(texto ?? '');
    return t.charAt(0).toUpperCase() + t.slice(1);
}

function diasAteLimite(dataStr) {
    if (!dataStr) return null;
    const [a, m, d] = String(dataStr).split(' ')[0].split('-').map(Number);
    if (!a || !m || !d) return null;
    const limite = new Date(a, m - 1, d);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return Math.round((limite - hoje) / 86400000);
}

function rotuloPrazo(r) {
    if (!STATUS_ATIVOS.includes(r.status)) return null;
    const d = diasAteLimite(r.data_limite);
    if (d === null) return null;
    if (d < 0) {
        const n = Math.abs(d);
        return { texto: n === 1 ? 'Venceu há 1 dia' : `Venceu há ${n} dias`, classe: 'aux-atraso' };
    }
    if (d === 0) return { texto: 'Vence hoje', classe: 'aux-hoje' };
    if (d === 1) return { texto: 'Amanhã', classe: 'aux-proximo' };
    if (d <= 3)  return { texto: `Em ${d} dias`, classe: 'aux-proximo' };
    return { texto: `Em ${d} dias`, classe: 'aux-ok' };
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
    let lista = [...reservas];

    if (filtroAtual !== 'todos') lista = lista.filter(r => r.status === filtroAtual);

    const termos = normalizar(buscaAtual).split(/\s+/).filter(Boolean);
    if (termos.length) {
        lista = lista.filter(r => {
            const alvo = normalizar(`${r.aluno} ${r.material}`);
            return termos.every(t => alvo.includes(t));
        });
    }

    if (ordemAtual === 'recente') {
        lista.sort((a, b) => new Date(b.data_reserva) - new Date(a.data_reserva));
    } else if (ordemAtual === 'antigo') {
        lista.sort((a, b) => new Date(a.data_reserva) - new Date(b.data_reserva));
    } else if (ordemAtual === 'limite') {
        lista.sort((a, b) => new Date(a.data_limite) - new Date(b.data_limite));
    } else if (ordemAtual === 'aluno') {
        lista.sort((a, b) => String(a.aluno).localeCompare(String(b.aluno), 'pt-BR', { sensitivity: 'base' }));
    }

    return { lista, termos };
}

// ========== RENDERIZAÇÃO ==========
function renderizarReservas() {
    const tbody = document.getElementById('reservas-tbody');
    const tableWrapper = document.getElementById('table-wrapper');
    if (!tbody) return;

    const { lista, termos } = filtrarEOrdenar();

    atualizarBadges();

    const buscaCountEl = document.getElementById('busca-count');
    if (buscaCountEl) buscaCountEl.textContent = lista.length;

    const info = document.getElementById('resultado-info');
    if (info) {
        info.textContent = lista.length === reservas.length
            ? ''
            : `Mostrando ${lista.length} de ${reservas.length}`;
    }

    if (lista.length === 0) {
        tbody.innerHTML = '';
        if (tableWrapper) tableWrapper.style.display = 'none';
        mostrarEmptyState();
        atualizarBotoesMassa();
        return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.style.display = 'none';

    const icones = {
        pendente: 'fa-hourglass-half',
        aprovada: 'fa-check-circle',
        cancelada: 'fa-times-circle',
        rejeitada: 'fa-times-circle',
        expirada: 'fa-clock',
        retirada: 'fa-hand-holding-heart'
    };

    tbody.innerHTML = lista.map((r, idx) => {
        const statusIcon = icones[r.status] || 'fa-circle';
        const statusLabel = capitalizar(r.status);
        const dataRes = formatarDataBR(r.data_reserva);
        const dataLim = formatarDataBR(r.data_limite);
        const inicial = r.aluno ? r.aluno.trim().charAt(0).toUpperCase() : '?';
        const rotulo = rotuloPrazo(r);
        const isPendente = r.status === 'pendente';
        const isAprovada = r.status === 'aprovada';

        let rowClass = 'reserva-row';
        if (rotulo && rotulo.classe === 'aux-atraso') rowClass += ' row-vencida';
        else if (rotulo && rotulo.classe === 'aux-hoje') rowClass += ' row-hoje';

        const delay = idx < 8 ? `style="animation-delay:${idx * 35}ms"` : '';
        const serie = r.serie ? `<span class="aluno-serie">${escapeHtml(r.serie)}</span>` : '';
        const auxPrazo = rotulo ? `<span class="data-aux ${rotulo.classe}">${rotulo.texto}</span>` : '';

        const checkboxHtml = isPendente
            ? `<input type="checkbox" class="checkbox-reserva" name="ids[]" value="${escapeHtml(r.id)}" data-id="${escapeHtml(r.id)}" autocomplete="off" aria-label="Selecionar reserva de ${escapeHtml(r.aluno)}">`
            : '';

        let acoesHtml = '<span class="sem-acao" title="Sem ações disponíveis">—</span>';
        if (isPendente) {
            acoesHtml = `
                <div class="acoes-grupo">
                    <button type="button" class="btn-acao btn-aprovar" data-action="aprovar" data-id="${escapeHtml(r.id)}" title="Aprovar reserva">
                        <i class="fas fa-check"></i> Aprovar
                    </button>
                    <button type="button" class="btn-acao btn-rejeitar" data-action="rejeitar" data-id="${escapeHtml(r.id)}" title="Rejeitar reserva">
                        <i class="fas fa-times"></i> Rejeitar
                    </button>
                </div>`;
        } else if (isAprovada) {
            acoesHtml = `
                <button type="button" class="btn-acao btn-retirar" data-action="retirar" data-id="${escapeHtml(r.id)}" title="Confirmar retirada">
                    <i class="fas fa-hand-holding-heart"></i> Confirmar retirada
                </button>`;
        }

        return `
            <tr class="${rowClass}" data-id="${escapeHtml(r.id)}" ${delay}>
                <td class="col-check" data-label="">${checkboxHtml}</td>
                <td class="col-aluno" data-label="Aluno">
                    <div class="aluno-info">
                        <span class="aluno-avatar" aria-hidden="true">${escapeHtml(inicial)}</span>
                        <div class="aluno-texto">
                            <span class="aluno-nome" title="${escapeHtml(r.aluno)}">${destacar(r.aluno, termos)}</span>
                            ${serie}
                        </div>
                    </div>
                </td>
                <td class="material-nome" data-label="Material">${destacar(r.material, termos)}</td>
                <td class="text-center" data-label="Tipo"><span class="tipo-badge">${escapeHtml(r.tipo || 'Livro')}</span></td>
                <td class="col-data" data-label="Reserva">
                    <div class="data-cell"><span class="data-principal">${dataRes}</span></div>
                </td>
                <td class="col-data" data-label="Limite">
                    <div class="data-cell">
                        <span class="data-principal">${dataLim}</span>
                        ${auxPrazo}
                    </div>
                </td>
                <td class="text-center" data-label="Status">
                    <span class="status-badge status-${escapeHtml(r.status)}">
                        <i class="fas ${statusIcon}"></i> ${escapeHtml(statusLabel)}
                    </span>
                </td>
                <td class="acoes-cell" data-label="">${acoesHtml}</td>
            </tr>`;
    }).join('');

    atualizarBotoesMassa();
}

function mostrarEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const title = document.getElementById('empty-title');
    const msg = document.getElementById('empty-message');
    const icon = document.getElementById('empty-icon');
    const btnNova = document.getElementById('empty-nova');
    const btnLimpar = document.getElementById('empty-limpar');
    if (!emptyState) return;

    const temBusca = buscaAtual.trim() !== '';
    const temFiltro = filtroAtual !== 'todos' || temBusca;

    if (reservas.length === 0) {
        title.textContent = 'Nenhuma reserva ainda';
        msg.textContent = 'As solicitações feitas pelos alunos vão aparecer aqui.';
        icon.className = 'fas fa-inbox';
    } else if (temBusca) {
        title.textContent = 'Nenhum resultado';
        msg.textContent = `Nada encontrado para "${buscaAtual.trim()}"` +
            (filtroAtual !== 'todos' ? ` entre as reservas com status "${filtroAtual}".` : '. Confira a grafia ou tente só parte do nome.');
        icon.className = 'fas fa-magnifying-glass';
    } else if (filtroAtual === 'pendente') {
        title.textContent = 'Nada para aprovar! 🎉';
        msg.textContent = 'Não há reservas pendentes no momento.';
        icon.className = 'fas fa-circle-check';
    } else {
        title.textContent = 'Nada por aqui';
        msg.textContent = `Nenhuma reserva com status "${filtroAtual}" no momento.`;
        icon.className = 'fas fa-inbox';
    }

    if (btnNova) btnNova.style.display = (!temFiltro && document.getElementById('btn-nova-reserva')) ? 'inline-flex' : 'none';
    if (btnLimpar) btnLimpar.style.display = temFiltro ? 'inline-flex' : 'none';
    emptyState.style.display = 'block';
}

// ========== BADGES ==========
function atualizarBadges() {
    const conta = s => reservas.filter(r => r.status === s).length;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('badge-todos', reservas.length);
    set('badge-pendente', conta('pendente'));
    set('badge-aprovada', conta('aprovada'));
    set('badge-rejeitada', conta('rejeitada'));
    set('badge-expirada', conta('expirada'));
    set('badge-retirada', conta('retirada'));
}

// ========== AÇÕES EM MASSA ==========
function atualizarBotoesMassa() {
    const marcados = document.querySelectorAll('.checkbox-reserva:checked');
    const todos = document.querySelectorAll('.checkbox-reserva');
    const count = marcados.length;
    const total = todos.length;

    const btnAprovar = document.querySelector('.btn-aprovar-massa');
    const btnRejeitar = document.querySelector('.btn-rejeitar-massa');
    const info = document.getElementById('selecionados-info');
    const barra = document.querySelector('.acoes-massa');

    if (btnAprovar) btnAprovar.disabled = count === 0;
    if (btnRejeitar) btnRejeitar.disabled = count === 0;
    if (info) info.textContent = count > 0
        ? `${count} reserva${count > 1 ? 's' : ''} selecionada${count > 1 ? 's' : ''}`
        : 'Nenhum selecionado';
    if (barra) barra.classList.toggle('tem-selecao', count > 0);

    todos.forEach(cb => {
        const tr = cb.closest('tr');
        if (tr) tr.classList.toggle('row-selecionada', cb.checked);
    });

    const selecionarTodos = document.getElementById('selecionarTodos');
    if (selecionarTodos) {
        if (total === 0) {
            selecionarTodos.checked = false;
            selecionarTodos.disabled = true;
            selecionarTodos.indeterminate = false;
        } else {
            selecionarTodos.disabled = false;
            selecionarTodos.checked = count === total;
            selecionarTodos.indeterminate = count > 0 && count < total;
        }
    }
}

function initAcoesMassa() {
    const tbody = document.getElementById('reservas-tbody');
    const form = document.getElementById('formReservasMassa');

    if (tbody) {
        tbody.addEventListener('change', (e) => {
            if (e.target.classList && e.target.classList.contains('checkbox-reserva')) atualizarBotoesMassa();
        });
    }

    const selecionarTodos = document.getElementById('selecionarTodos');
    if (selecionarTodos) {
        selecionarTodos.addEventListener('change', function () {
            document.querySelectorAll('.checkbox-reserva').forEach(cb => { cb.checked = this.checked; });
            atualizarBotoesMassa();
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const marcados = [...document.querySelectorAll('.checkbox-reserva:checked')];
            if (marcados.length === 0) {
                showToast('Selecione pelo menos uma reserva para continuar.', 'error');
                return;
            }

            let acao = null;
            if (e.submitter && e.submitter.name === 'acao') {
                acao = e.submitter.value;
            } else {
                const ativo = document.activeElement;
                if (ativo && ativo.name === 'acao') acao = ativo.value;
            }
            if (acao !== 'aprovar' && acao !== 'rejeitar') return;

            const itens = marcados
                .map(cb => reservas.find(r => String(r.id) === cb.value))
                .filter(Boolean);
            if (!itens.length) return;

            abrirModalConfirmacao({ acao, itens, massa: true });
        });
    }

    atualizarBotoesMassa();
}

// ========== MODAL CONFIRMAÇÃO ==========
const ACOES_MODAL = {
    aprovar: {
        icone: 'fa-check',
        titulo: n => n > 1 ? `Aprovar ${n} reservas` : 'Aprovar reserva',
        sub: n => n > 1 ? 'Confirme a aprovação das reservas selecionadas.' : 'Confirme a aprovação desta reserva.',
        botao: n => n > 1 ? `Aprovar ${n} reservas` : 'Aprovar reserva',
        botaoIcone: 'fa-check',
        andamento: 'Aprovando…'
    },
    rejeitar: {
        icone: 'fa-times',
        titulo: n => n > 1 ? `Rejeitar ${n} reservas` : 'Rejeitar reserva',
        sub: n => n > 1 ? 'Confirme a rejeição das reservas selecionadas.' : 'Confirme a rejeição desta reserva.',
        botao: n => n > 1 ? `Rejeitar ${n} reservas` : 'Rejeitar reserva',
        botaoIcone: 'fa-times',
        andamento: 'Rejeitando…'
    },
    retirar: {
        icone: 'fa-hand-holding-heart',
        titulo: () => 'Confirmar retirada',
        sub: () => 'Confirme que o aluno está retirando este material.',
        botao: () => 'Confirmar retirada',
        botaoIcone: 'fa-hand-holding-heart',
        andamento: 'Registrando…'
    }
};

function linhaInfo(icone, rotulo, valorHtml) {
    return `
        <div class="cfm-info-row">
            <span class="cfm-info-label"><i class="fas ${icone}"></i> ${rotulo}</span>
            <span class="cfm-info-value">${valorHtml}</span>
        </div>`;
}

function abrirModalConfirmacao(cfg) {
    const overlay = document.getElementById('modal-confirmacao');
    if (!overlay) return;

    const def = ACOES_MODAL[cfg.acao];
    if (!def) return;

    acaoPendente = cfg;
    focoAnteriorModal = document.activeElement;

    const n = cfg.itens.length;
    const box = overlay.querySelector('.cfm-box');
    box.dataset.variante = cfg.acao;

    document.getElementById('cfm-icone').className = 'fas ' + def.icone;
    document.getElementById('cfm-titulo').textContent = def.titulo(n);
    document.getElementById('cfm-subtitulo').textContent = def.sub(n);

    const info = document.getElementById('cfm-info');
    if (cfg.massa && n > 1) {
        const visiveis = cfg.itens.slice(0, 5);
        const extras = n - visiveis.length;
        const lista = visiveis.map(r => `
            <li>
                <strong>${escapeHtml(r.aluno)}</strong>
                <span>${escapeHtml(r.material)}</span>
            </li>`).join('');
        info.innerHTML =
            linhaInfo('fa-layer-group', 'Reservas selecionadas', `${n}`) +
            `<ul class="cfm-lista">${lista}${extras > 0 ? `<li class="cfm-lista-mais">+ ${extras} outra${extras > 1 ? 's' : ''}</li>` : ''}</ul>`;
    } else {
        const r = cfg.itens[0];
        const rotulo = rotuloPrazo(r);
        const badge = rotulo ? `<span class="cfm-prazo-badge ${rotulo.classe}">${rotulo.texto}</span>` : '';
        info.innerHTML =
            linhaInfo('fa-book', 'Material', escapeHtml(r.material)) +
            linhaInfo('fa-user-graduate', 'Aluno', escapeHtml(r.aluno)) +
            linhaInfo('fa-calendar-day', 'Data limite', `<span>${formatarDataBR(r.data_limite)}</span>${badge}`);
    }

    const btn = document.getElementById('cfm-confirmar');
    btn.disabled = false;
    btn.innerHTML = `<i class="fas ${def.botaoIcone}"></i> ${escapeHtml(def.botao(n))}`;
    document.getElementById('cfm-cancelar').disabled = false;

    overlay.hidden = false;
    document.body.classList.add('modal-aberto');
    document.getElementById('cfm-cancelar').focus();
}

function fecharModalConfirmacao() {
    const overlay = document.getElementById('modal-confirmacao');
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('modal-aberto');
    acaoPendente = null;
    if (focoAnteriorModal && document.contains(focoAnteriorModal)) focoAnteriorModal.focus();
}

function enviarFormulario(action, campos) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    campos.forEach(([nome, valor]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = nome;
        input.value = valor;
        form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
}

function confirmarAcaoModal() {
    if (!acaoPendente) return;
    const btn = document.getElementById('cfm-confirmar');
    if (btn.disabled) return;

    const def = ACOES_MODAL[acaoPendente.acao];
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${def.andamento}`;
    document.getElementById('cfm-cancelar').disabled = true;

    const { acao, massa, itens } = acaoPendente;

    if (massa) {
        const form = document.getElementById('formReservasMassa');
        form.querySelectorAll('input[type="hidden"][name="acao"]').forEach(i => i.remove());
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'acao';
        hidden.value = acao;
        form.appendChild(hidden);
        form.submit();
        return;
    }

    const item = itens[0];
    if (acao === 'retirar') {
        enviarFormulario('confirmar_retirada.php', [['id', item.id]]);
    } else {
        enviarFormulario('atualizar_status_reserva.php', [['id', item.id], ['acao', acao]]);
    }
}

window.confirmarAprovacao = function (id) {
    const r = reservas.find(x => String(x.id) === String(id));
    if (r) abrirModalConfirmacao({ acao: 'aprovar', itens: [r], massa: false });
};
window.confirmarRejeicao = function (id) {
    const r = reservas.find(x => String(x.id) === String(id));
    if (r) abrirModalConfirmacao({ acao: 'rejeitar', itens: [r], massa: false });
};
window.confirmarRetirada = function (id) {
    const r = reservas.find(x => String(x.id) === String(id));
    if (r) abrirModalConfirmacao({ acao: 'retirar', itens: [r], massa: false });
};

function initModalConfirmacao() {
    const overlay = document.getElementById('modal-confirmacao');
    if (!overlay) return;

    document.getElementById('cfm-cancelar').addEventListener('click', fecharModalConfirmacao);
    document.getElementById('cfm-confirmar').addEventListener('click', confirmarAcaoModal);

    overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) fecharModalConfirmacao();
    });

    document.addEventListener('keydown', (e) => {
        if (overlay.hidden) return;
        if (e.key === 'Escape') { fecharModalConfirmacao(); return; }
        if (e.key === 'Tab') {
            const focaveis = overlay.querySelectorAll('button:not([disabled])');
            if (!focaveis.length) return;
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
        }
    });

    window.addEventListener('pageshow', (e) => {
        if (e.persisted) fecharModalConfirmacao();
    });
}

// ========== AÇÕES INDIVIDUAIS ==========
function initAcoesReserva() {
    const tbody = document.getElementById('reservas-tbody');
    if (!tbody) return;
    tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn || !tbody.contains(btn)) return;
        const reserva = reservas.find(r => String(r.id) === btn.dataset.id);
        if (!reserva) return;

        const acao = btn.dataset.action;
        if (acao === 'aprovar') window.confirmarAprovacao(reserva.id);
        else if (acao === 'rejeitar') window.confirmarRejeicao(reserva.id);
        else if (acao === 'retirar') window.confirmarRetirada(reserva.id);
    });
}

// ========== FILTROS ==========
function definirFiltro(status) {
    filtroAtual = status;
    document.querySelectorAll('.filtro-tab').forEach(t => {
        const ativo = t.dataset.status === status;
        t.classList.toggle('active', ativo);
        t.setAttribute('aria-selected', ativo ? 'true' : 'false');
    });
    renderizarReservas();
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
    renderizarReservas();
}

function limparFiltros() {
    const input = document.getElementById('search-input');
    if (input) input.value = '';
    buscaAtual = '';
    const buscaAtiva = document.getElementById('filtro-busca-ativa');
    if (buscaAtiva) buscaAtiva.style.display = 'none';
    definirFiltro('todos');
}

function initFiltros() {
    const buscaInput = document.getElementById('search-input');
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

    const btnNovaVazio = document.getElementById('empty-nova');
    const btnNovaTopo = document.getElementById('btn-nova-reserva');
    if (btnNovaVazio && btnNovaTopo) btnNovaVazio.addEventListener('click', () => btnNovaTopo.click());

    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('modal-confirmacao');
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

    const fechar = () => {
        dropdown.classList.remove('show');
        wrapper?.classList.remove('active');
    };

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        wrapper?.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) fechar();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fechar();
    });

    items.forEach(item => {
        item.addEventListener('click', function () {
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            ordemAtual = this.dataset.ordem;
            label.textContent = this.textContent.trim();
            fechar();
            renderizarReservas();
        });
    });
}

// ========== AVISO ==========
function initAviso() {
    const aviso = document.getElementById('avisoArquivamento');
    const fechar = document.getElementById('fechar-aviso');
    if (aviso && fechar) fechar.addEventListener('click', () => { aviso.style.display = 'none'; });
}

// ========== SIDEBAR ==========
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
        document.body.appendChild(c);
    }
    c.setAttribute('aria-live', 'polite');
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
    if (typeof reservasData !== 'undefined') reservas = reservasData;
    if (typeof notificacoesData !== 'undefined') notificacoes = notificacoesData;

    initSidebar();
    initProfileDropdown();
    initNotifications();
    initFiltros();
    initOrdenacao();
    initAviso();
    initModalConfirmacao();
    initAcoesReserva();
    initAcoesMassa();

    // Aplica estado visual das abas já no carregamento
    document.querySelectorAll('.filtro-tab').forEach(t => {
        const ativo = t.dataset.status === filtroAtual;
        t.classList.toggle('active', ativo);
        t.setAttribute('aria-selected', ativo ? 'true' : 'false');
    });

    renderizarReservas();
    renderizarDropdownNotificacoes();
});
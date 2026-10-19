// =============================================
// catalogo_adm.js — Interações do catálogo
// =============================================

(function () {
'use strict';

// ========== VARIÁVEIS ==========
let notificacoes = [];
let alunos = [];
const itensCatalogo = (typeof catalogoData !== 'undefined' && catalogoData.itens) ? catalogoData.itens : {};
let ultimoFoco = null;

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

// ========== BUSCA DE ALUNO NO TOPO (copiada do dashboard_adm.js) ==========
function getAvatarColor() {
    return '#0035ff';
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

// ========== TOASTS ==========
function mostrarToast(mensagem, tipo = 'success') {
    const stack = document.getElementById('cat-toast-stack');
    if (!stack) return;

    const icones = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = 'cat-toast cat-toast-' + (icones[tipo] ? tipo : 'info');
    toast.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    toast.innerHTML = `
        <i class="fas ${icones[tipo] || icones.info}"></i>
        <span>${escapeHtml(mensagem)}</span>
        <button type="button" aria-label="Fechar aviso">&times;</button>
    `;

    const remover = () => {
        toast.classList.add('saindo');
        setTimeout(() => toast.remove(), 250);
    };
    toast.querySelector('button').addEventListener('click', remover);
    stack.appendChild(toast);
    setTimeout(remover, tipo === 'error' ? 8000 : 5000);
}

// ========== RENDERIZAR DROPDOWN DE NOTIFICAÇÕES ==========
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

// ========== MODAIS ==========
function abrirOverlay(overlay, focoInicial) {
    ultimoFoco = document.activeElement;
    overlay.classList.add('aberto');
    document.body.classList.add('cat-modal-aberto');
    const alvo = focoInicial || overlay.querySelector('input:not([type=hidden]), button');
    if (alvo) setTimeout(() => alvo.focus(), 50);
}

function fecharOverlay(overlay) {
    overlay.classList.remove('aberto');
    if (!document.querySelector('.cat-modal-overlay.aberto')) {
        document.body.classList.remove('cat-modal-aberto');
    }
    if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
}

function overlayAberto() {
    return document.querySelector('.cat-modal-overlay.aberto');
}

// ========== PREVIEW DA CAPA ==========
function resolverCapa(valor) {
    valor = (valor || '').trim();
    if (!valor) return '';
    if (/^(https?:)?\/\//i.test(valor)) return valor;
    return '../' + valor.replace(/^\/+/, '');
}

function atualizarPreviewCapa() {
    const preview = document.getElementById('capa-preview');
    const input = document.getElementById('capa_url');
    if (!preview || !input) return;

    const src = resolverCapa(input.value);
    preview.innerHTML = '<i class="fas fa-image"></i>';
    if (!src) return;

    const img = new Image();
    img.alt = 'Pré-visualização da capa';
    img.onload = () => { preview.innerHTML = ''; preview.appendChild(img); };
    img.onerror = () => { preview.innerHTML = '<i class="fas fa-triangle-exclamation" title="Não foi possível carregar a imagem"></i>'; };
    img.src = src;
}

// ========== MODAL NOVO / EDITAR ==========
function mostrarErrosForm(erros) {
    const box = document.getElementById('form-erros');
    if (!box) return;
    if (!erros || !erros.length) {
        box.hidden = true;
        box.innerHTML = '';
        return;
    }
    box.hidden = false;
    box.innerHTML = '<strong><i class="fas fa-exclamation-circle"></i> Corrija antes de salvar:</strong><ul>' +
        erros.map(e => '<li>' + escapeHtml(e) + '</li>').join('') + '</ul>';
}

function preencherForm(d) {
    const set = (id, v) => { document.getElementById(id).value = (v === null || v === undefined) ? '' : v; };
    set('edit_id', d.edit_id || 0);
    set('titulo', d.titulo);
    set('autor', d.autor);
    set('tipo', d.tipo || 'livro');
    set('editora', d.editora);
    set('ano_publicacao', d.ano_publicacao);
    set('isbn', d.isbn);
    set('quantidade', d.quantidade === '' || d.quantidade == null ? 1 : d.quantidade);
    set('localizacao', d.localizacao);
    set('capa_url', d.capa_url);
    set('descricao', d.descricao);
    atualizarPreviewCapa();
}

function abrirModalEdicao(id = 0, dadosForm = null, erros = null) {
    const overlay = document.getElementById('cat-modal-overlay');
    const form = document.getElementById('cat-modal-form');
    const title = document.getElementById('cat-modal-title');
    const btnTxt = document.querySelector('#cat-btn-salvar span');
    if (!overlay || !form) return;

    id = parseInt(id, 10) || 0;
    mostrarErrosForm(erros);

    if (dadosForm) {
        id = parseInt(dadosForm.edit_id, 10) || 0;
        preencherForm(dadosForm);
    } else if (id === 0) {
        form.reset();
        preencherForm({ edit_id: 0, tipo: 'livro', quantidade: 1, destaque: 0 });
    } else {
        const item = itensCatalogo[id];
        if (!item) {
            mostrarToast('Não foi possível carregar este item. Atualize a página.', 'error');
            return;
        }
        preencherForm({
            edit_id: id,
            titulo: item.titulo,
            autor: item.autor,
            tipo: item.tipo,
            editora: item.editora,
            ano_publicacao: item.ano_publicacao,
            isbn: item.isbn,
            quantidade: item.quantidade,
            localizacao: item.localizacao,
            capa_url: item.capa_url,
            descricao: item.descricao,
            destaque: item.destaque
        });
    }

    title.innerHTML = id === 0
        ? '<i class="fas fa-plus-circle"></i> Novo item'
        : '<i class="fas fa-edit"></i> Editar item';
    if (btnTxt) btnTxt.textContent = id === 0 ? 'Cadastrar' : 'Salvar alterações';

    const btn = document.getElementById('cat-btn-salvar');
    if (btn) btn.disabled = false;

    abrirOverlay(overlay, document.getElementById('titulo'));
}

function fecharModal() {
    const overlay = document.getElementById('cat-modal-overlay');
    if (overlay) fecharOverlay(overlay);
}

// ========== MODAL EXCLUIR ==========
function abrirModalExclusao(id) {
    const overlay = document.getElementById('delete-overlay');
    const item = itensCatalogo[id];
    if (!overlay || !item) return;

    document.getElementById('delete-id').value = id;
    document.getElementById('delete-text').innerHTML =
        'Você está prestes a excluir <strong>"' + escapeHtml(item.titulo) + '"</strong>. Esta ação não pode ser desfeita.';

    const aviso = document.getElementById('delete-aviso');
    const confirmar = document.getElementById('delete-confirm');
    const emp = parseInt(item.emp_ativos, 10) || 0;
    const res = parseInt(item.res_ativas, 10) || 0;

    if (emp + res > 0) {
        const partes = [];
        if (emp) partes.push(emp + (emp === 1 ? ' empréstimo ativo' : ' empréstimos ativos'));
        if (res) partes.push(res + (res === 1 ? ' reserva em andamento' : ' reservas em andamento'));
        aviso.hidden = false;
        aviso.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Este item tem ' + partes.join(' e ') +
            '. Finalize ou cancele antes de excluir.';
        confirmar.disabled = true;
    } else {
        aviso.hidden = true;
        aviso.innerHTML = '';
        confirmar.disabled = false;
    }

    abrirOverlay(overlay, confirmar.disabled ? document.getElementById('delete-cancel') : confirmar);
}

function fecharModalExclusao() {
    const overlay = document.getElementById('delete-overlay');
    if (overlay) fecharOverlay(overlay);
}

function excluirItem(id) { abrirModalExclusao(id); }

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    if (typeof notificacoesData !== 'undefined') {
        notificacoes = notificacoesData;
    }
    if (typeof alunosData !== 'undefined') {
        alunos = alunosData;
    }

    if (typeof catalogoData !== 'undefined' && catalogoData.flash) {
        mostrarToast(catalogoData.flash.msg, catalogoData.flash.type);
    }

    document.addEventListener('click', function(e) {
        const novo = e.target.closest('#btn-novo-item, [data-acao="novo"]');
        if (novo) { abrirModalEdicao(0); return; }

        const editar = e.target.closest('[data-acao="editar"]');
        if (editar) { abrirModalEdicao(editar.dataset.id); return; }

        const excluir = e.target.closest('[data-acao="excluir"]');
        if (excluir) { abrirModalExclusao(excluir.dataset.id); return; }

        const card = e.target.closest('.catalogo-card');
        if (card && !e.target.closest('button, form, a')) {
            abrirModalEdicao(card.dataset.id);
        }
    });

    document.addEventListener('keydown', function(e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('catalogo-card')) {
            e.preventDefault();
            abrirModalEdicao(e.target.dataset.id);
        }
    });

    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    bind('cat-modal-close', fecharModal);
    bind('cat-modal-cancel', fecharModal);
    bind('delete-cancel', fecharModalExclusao);

    ['cat-modal-overlay', 'delete-overlay'].forEach(id => {
        const ov = document.getElementById(id);
        if (!ov) return;
        ov.addEventListener('mousedown', function(e) {
            if (e.target === this) fecharOverlay(this);
        });
    });

    document.addEventListener('keydown', function(e) {
        const ov = overlayAberto();
        if (!ov) return;
        if (e.key === 'Escape') {
            fecharOverlay(ov);
            return;
        }
        if (e.key === 'Tab') {
            const foc = Array.from(ov.querySelectorAll('button:not([disabled]), input:not([type=hidden]):not([disabled]), select, textarea, a[href]'))
                .filter(el => el.offsetParent !== null);
            if (!foc.length) return;
            const primeiro = foc[0], ultimo = foc[foc.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
        }
    });

    const capaInput = document.getElementById('capa_url');
    if (capaInput) {
        let t;
        capaInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(atualizarPreviewCapa, 400); });
    }

    const form = document.getElementById('cat-modal-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const erros = [];
            const titulo = document.getElementById('titulo').value.trim();
            const qtd = document.getElementById('quantidade').value;
            const ano = document.getElementById('ano_publicacao').value;
            const anoMax = new Date().getFullYear() + 1;

            if (!titulo) erros.push('Informe o título.');
            if (qtd !== '' && (parseInt(qtd, 10) < 0 || isNaN(parseInt(qtd, 10)))) erros.push('A quantidade deve ser 0 ou mais.');
            if (ano !== '' && (parseInt(ano, 10) < 1000 || parseInt(ano, 10) > anoMax)) erros.push('Ano de publicação inválido.');

            if (erros.length) {
                e.preventDefault();
                mostrarErrosForm(erros);
                document.getElementById('titulo').focus();
                return;
            }
            const btn = document.getElementById('cat-btn-salvar');
            btn.disabled = true;
            btn.querySelector('span').textContent = 'Salvando...';
        });
    }

    const formExcluir = document.getElementById('delete-form');
    if (formExcluir) {
        formExcluir.addEventListener('submit', function() {
            const btn = document.getElementById('delete-confirm');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
        });
    }

    document.querySelectorAll('[data-autosubmit]').forEach(el => {
        el.addEventListener('change', () => document.getElementById('filtros-form').submit());
    });

    if (typeof catalogoData !== 'undefined') {
        if (catalogoData.form) {
            abrirModalEdicao(0, catalogoData.form, catalogoData.erros);
        } else if (catalogoData.abrirEdicao) {
            abrirModalEdicao(catalogoData.abrirEdicao);
        }
    }

    // NOTIFICAÇÕES (SININHO)
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');
    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
            if (notifDropdown.classList.contains('show')) {
                renderizarDropdownNotificacoes();
            }
        });

        document.addEventListener('click', function(e) {
            if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }
        });
    }

    // BUSCA DE ALUNO NO TOPO
    initSearch();
});

// expõe para uso externo
window.abrirModalEdicao = abrirModalEdicao;
window.abrirModalExclusao = abrirModalExclusao;
window.fecharModal = fecharModal;
window.excluirItem = excluirItem;
})();
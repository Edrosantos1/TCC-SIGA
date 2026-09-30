// extrato_adm.js – Extrato de Reservas (SiGA ITJ)
// Sem AJAX: filtros continuam recarregando a página (GET);
// busca e ordenação na tabela acontecem só no navegador.
(function () {
    'use strict';

    // Remove acentos e caixa para comparar texto
    const normalizar = (s) =>
        String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    // ========== SIDEBAR ==========
    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const collapseBtn = document.getElementById('collapseBtn');
        if (!sidebar || !collapseBtn) return;

        collapseBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            try {
                localStorage.setItem('adm_sidebarCollapsed', sidebar.classList.contains('collapsed'));
            } catch (e) { /* storage indisponível */ }
        });

        try {
            if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
                sidebar.classList.add('collapsed');
            }
        } catch (e) { /* storage indisponível */ }
    }

    // ========== TOP HEADER (igual ao do dashboard) ==========
    const dadosHeader = window.extratoHeaderData || {};
    const alunos = Array.isArray(dadosHeader.alunos) ? dadosHeader.alunos : [];
    const notificacoes = Array.isArray(dadosHeader.notificacoes) ? dadosHeader.notificacoes : [];

    function escapeHtml(texto) {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    function formatarData(data) {
        // "2026-09-28 10:00:00" -> formato ISO, para o Safari também entender
        const d = new Date(String(data).replace(' ', 'T'));
        if (Number.isNaN(d.getTime())) return '';
        const diff = Math.floor((new Date() - d) / 1000);

        if (diff < 60) return 'Agora pouco';
        if (diff < 3600) return Math.floor(diff / 60) + ' min atrás';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
        if (diff < 172800) return 'Ontem';
        return d.toLocaleDateString('pt-BR') + ' ' +
            d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

    function renderizarNotificacoes() {
        const lista = document.getElementById('notification-list-dropdown');
        if (!lista) return;

        if (notificacoes.length === 0) {
            lista.innerHTML =
                '<div class="empty-notifications"><i class="far fa-bell-slash"></i>' +
                '<p>Nenhuma notificação enviada</p></div>';
            return;
        }

        lista.innerHTML = notificacoes.slice(0, 10).map((n) => {
            const pendencia = n.tipo === 'pendencia';
            const cor = pendencia ? '#e67e22' : '#0b4b9b';
            const icone = pendencia ? 'fa-exclamation-triangle' : 'fa-info-circle';
            const rotulo = pendencia ? 'Pendência' : 'Aviso';
            const total = parseInt(n.total_alunos, 10) || 0;
            const textoAlunos = total === 1 ? '1 aluno' : total + ' alunos';

            return `
                <div class="notification-item">
                    <div class="notification-icon" style="color: ${cor};"><i class="fas ${icone}"></i></div>
                    <div class="notification-content">
                        <div class="notification-message">
                            <strong style="color: ${cor};">${rotulo}</strong><br>
                            ${escapeHtml(n.mensagem)}
                        </div>
                        <div class="notification-footer">
                            <span class="notification-date">${formatarData(n.criado_em)}</span>
                            <span class="notification-destinatarios"><i class="fas fa-users"></i> ${textoAlunos}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    function initNotificacoes() {
        const btn = document.getElementById('notification-btn');
        const dropdown = document.getElementById('notification-dropdown');
        if (!btn || !dropdown) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            if (dropdown.classList.contains('show')) renderizarNotificacoes();
        });

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    function iconesStatusAluno(a) {
        const reserva = '<i class="fas fa-bookmark" style="color:#0b4b9b;font-size:14px;" title="Possui reservas"></i>';
        const pendencia = '<i class="fas fa-exclamation-circle" style="color:#e67e22;font-size:14px;" title="Possui empréstimos/pendências"></i>';
        if (a.tem_reservas && a.tem_emprestimos) return reserva + ' ' + pendencia;
        if (a.tem_reservas) return reserva;
        if (a.tem_emprestimos) return pendencia;
        return '';
    }

    function irParaAluno(a) {
        const id = encodeURIComponent(a.id_aluno);
        if (a.tem_reservas && a.tem_emprestimos) window.location.href = 'perfil_aluno.php?id=' + id;
        else if (a.tem_reservas) window.location.href = 'reservas_adm.php?aluno_id=' + id;
        else if (a.tem_emprestimos) window.location.href = 'pendencias_adm.php?aluno_id=' + id;
        else alert('O aluno ' + a.nome_aluno + ' não possui reservas ou empréstimos ativos.');
    }

    function initBuscaAlunos() {
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        if (!input || !results) return;

        const fechar = () => { results.style.display = 'none'; results.innerHTML = ''; };
        let timer;

        input.addEventListener('input', () => {
            const termo = normalizar(input.value);
            clearTimeout(timer);
            if (!termo) { fechar(); return; }

            timer = setTimeout(() => {
                const achados = alunos
                    .filter((a) => a.nome_aluno && normalizar(a.nome_aluno).startsWith(termo))
                    .slice(0, 8);

                if (achados.length === 0) {
                    results.innerHTML = '<div class="search-empty"><i class="fas fa-search"></i> Nenhum aluno encontrado</div>';
                    results.style.display = 'block';
                    return;
                }

                results.innerHTML = '';
                achados.forEach((a) => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <div class="search-avatar" style="background-color:#0b4b9b;">${escapeHtml(a.nome_aluno.trim().charAt(0).toUpperCase())}</div>
                        <div class="search-info">
                            <div class="search-name">${escapeHtml(a.nome_aluno)}</div>
                            <div class="search-detail">${escapeHtml(a.serie_aluno || 'Aluno')}</div>
                        </div>
                        <div class="search-status-icon">${iconesStatusAluno(a)}</div>`;
                    item.addEventListener('click', () => irParaAluno(a));
                    results.appendChild(item);
                });
                results.style.display = 'block';
            }, 200);
        });

        input.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !results.contains(e.target)) fechar();
        });
    }

    // ========== FILTROS (envio normal do formulário) ==========
    function initFiltros() {
        const form = document.getElementById('form-filtros');
        if (!form) return;

        const btn = form.querySelector('.btn-filtrar');
        const btnHtml = btn ? btn.innerHTML : '';

        // Envia sozinho ao trocar um select
        form.querySelectorAll('select').forEach((sel) => {
            sel.addEventListener('change', () => {
                if (typeof form.requestSubmit === 'function') form.requestSubmit();
                else form.submit();
            });
        });

        // Estado de "carregando" no botão
        form.addEventListener('submit', () => {
            if (!btn) return;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Filtrando...';
        });

        // Voltar pelo histórico (bfcache) não deixa o botão travado
        window.addEventListener('pageshow', () => {
            if (!btn) return;
            btn.disabled = false;
            btn.innerHTML = btnHtml;
        });

        montarChips(form);
    }

    // Chips dos filtros aplicados, cada um com um "x" que remove só aquele filtro
    function montarChips(form) {
        const box = document.getElementById('filtros-ativos');
        if (!box) return;

        const atuais = new URLSearchParams(window.location.search);
        const campos = [
            { nome: 'mes',      icone: 'fa-calendar-alt' },
            { nome: 'aluno_id', icone: 'fa-user-graduate' },
            { nome: 'status',   icone: 'fa-tag' }
        ];

        box.textContent = '';
        campos.forEach(({ nome, icone }) => {
            const sel = form.elements[nome];
            if (!sel || !sel.value || sel.value === '0') return;

            const rotulo = sel.options[sel.selectedIndex].text.trim();
            const params = new URLSearchParams(atuais);
            params.delete(nome);
            const qs = params.toString();

            const chip = document.createElement('span');
            chip.className = 'chip';

            const i = document.createElement('i');
            i.className = 'fas ' + icone;
            chip.appendChild(i);
            chip.appendChild(document.createTextNode(rotulo));

            const x = document.createElement('a');
            x.href = window.location.pathname + (qs ? '?' + qs : '');
            x.title = 'Remover filtro';
            x.setAttribute('aria-label', 'Remover filtro ' + rotulo);
            x.innerHTML = '<i class="fas fa-times"></i>';
            chip.appendChild(x);

            box.appendChild(chip);
        });
    }

    // ========== TABELA: BUSCA E ORDENAÇÃO NO NAVEGADOR ==========
    function initTabela() {
        const tabela = document.querySelector('.table-extrato');
        if (!tabela) return;

        const tbody = tabela.tBodies[0];
        const linhas = Array.from(tbody.rows);
        const busca = document.getElementById('busca-tabela');
        const contador = document.getElementById('contador');
        const infoBusca = document.getElementById('info-busca');
        const vazio = document.getElementById('busca-vazia');
        const total = linhas.length;

        // Guarda o texto de cada linha já normalizado
        const indice = new Map(linhas.map((tr) => [tr, normalizar(tr.textContent)]));

        function filtrar() {
            const termo = normalizar(busca ? busca.value : '');
            const palavras = termo ? termo.split(/\s+/) : [];
            let visiveis = 0;

            linhas.forEach((tr) => {
                const texto = indice.get(tr);
                const ok = palavras.every((p) => texto.includes(p));
                tr.hidden = !ok;
                if (ok) visiveis++;
            });

            if (contador) contador.textContent = visiveis;
            if (infoBusca) {
                infoBusca.textContent = termo ? '(de ' + total + ' no total)' : '';
            }
            if (vazio) vazio.hidden = visiveis !== 0;
            tabela.style.display = visiveis === 0 ? 'none' : '';
        }

        if (busca) {
            let timer;
            busca.addEventListener('input', () => {
                clearTimeout(timer);
                timer = setTimeout(filtrar, 120);
            });
            busca.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { busca.value = ''; filtrar(); }
            });
        }

        // Ordenação ao clicar (ou Enter/Espaço) no cabeçalho
        const cabecalhos = Array.from(tabela.tHead.rows[0].cells);

        function valorCelula(tr, idx) {
            const td = tr.cells[idx];
            const v = td.dataset.value !== undefined ? td.dataset.value : td.textContent.trim();
            const n = Number(v);
            return v !== '' && !Number.isNaN(n) ? n : normalizar(v);
        }

        function ordenar(idx, th) {
            const atual = th.getAttribute('aria-sort');
            const dir = atual === 'ascending' ? 'descending' : 'ascending';

            cabecalhos.forEach((h) => h.removeAttribute('aria-sort'));
            th.setAttribute('aria-sort', dir);

            const fator = dir === 'ascending' ? 1 : -1;
            const ordenadas = linhas.slice().sort((a, b) => {
                const va = valorCelula(a, idx);
                const vb = valorCelula(b, idx);
                if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * fator;
                return String(va).localeCompare(String(vb), 'pt-BR', { numeric: true }) * fator;
            });

            const frag = document.createDocumentFragment();
            ordenadas.forEach((tr) => frag.appendChild(tr));
            tbody.appendChild(frag);
        }

        cabecalhos.forEach((th, idx) => {
            if (!th.hasAttribute('data-sort')) return;
            th.tabIndex = 0;
            th.addEventListener('click', () => ordenar(idx, th));
            th.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    ordenar(idx, th);
                }
            });
        });
    }

    // ========== IMPRIMIR ==========
    function initImprimir() {
        const btn = document.getElementById('btn-imprimir');
        if (btn) btn.addEventListener('click', () => window.print());
    }

    function init() {
        initSidebar();
        initProfileDropdown();
        initNotificacoes();
        initBuscaAlunos();
        renderizarNotificacoes();
        initFiltros();
        initTabela();
        initImprimir();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
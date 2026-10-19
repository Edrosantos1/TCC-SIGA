/* =============================================
   alertas_ui.js — Sistema de Alertas Customizados
   SiGA ITJ
   ============================================= */

(function () {
    'use strict';

    /* ---------- ESTRUTURA BASE NO DOM ---------- */
    function garantirContainer() {
        let container = document.getElementById('ui-alert-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ui-alert-container';
            container.className = 'ui-alert-container';
            document.body.appendChild(container);
        }
        return container;
    }

    /* ---------- ÍCONES POR TIPO ---------- */
    const ICONES = {
        success: 'fa-check',
        error:   'fa-times',
        warning: 'fa-exclamation',
        info:    'fa-info',
        question:'fa-question'
    };

    const TITULOS = {
        success: 'Sucesso',
        error:   'Erro',
        warning: 'Atenção',
        info:    'Informação',
        question:'Confirmação'
    };

    /* ---------- CRIAR MODAL ---------- */
    function criarModal(opcoes) {
        const {
            tipo = 'info',
            titulo,
            mensagem,
            textoConfirmar = 'OK',
            textoCancelar = 'Cancelar',
            mostrarCancelar = false,
            onConfirm,
            onCancel
        } = opcoes;

        const container = garantirContainer();

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'ui-alert-overlay';

        // Card
        const card = document.createElement('div');
        card.className = `ui-alert-card ui-alert-${tipo}`;
        card.setAttribute('role', 'alertdialog');
        card.setAttribute('aria-modal', 'true');

        const tituloFinal = titulo || TITULOS[tipo] || 'Aviso';

        card.innerHTML = `
            <button type="button" class="ui-alert-close" aria-label="Fechar">
                <i class="fas fa-times"></i>
            </button>
            <div class="ui-alert-icon">
                <i class="fas ${ICONES[tipo] || ICONES.info}"></i>
            </div>
            <h3 class="ui-alert-title">${escapeHtml(tituloFinal)}</h3>
            <p class="ui-alert-message">${escapeHtml(mensagem || '')}</p>
            <div class="ui-alert-actions">
                ${mostrarCancelar ? `<button type="button" class="ui-alert-btn ui-alert-btn-cancel">${escapeHtml(textoCancelar)}</button>` : ''}
                <button type="button" class="ui-alert-btn ui-alert-btn-confirm">${escapeHtml(textoConfirmar)}</button>
            </div>
        `;

        overlay.appendChild(card);
        container.appendChild(overlay);

        // Força reflow para animar
        void overlay.offsetWidth;
        overlay.classList.add('show');

        /* ---------- FECHAR ---------- */
        function fechar(callback) {
            overlay.classList.remove('show');
            overlay.classList.add('hide');
            setTimeout(() => {
                overlay.remove();
                // Remove container se estiver vazio
                const c = document.getElementById('ui-alert-container');
                if (c && c.children.length === 0) c.remove();
            }, 220);
            document.removeEventListener('keydown', onKey);
            if (typeof callback === 'function') callback();
        }

        /* ---------- EVENTOS ---------- */
        card.querySelector('.ui-alert-btn-confirm').addEventListener('click', () => {
            fechar(onConfirm);
        });

        const btnCancel = card.querySelector('.ui-alert-btn-cancel');
        if (btnCancel) btnCancel.addEventListener('click', () => fechar(onCancel));

        card.querySelector('.ui-alert-close').addEventListener('click', () => fechar(onCancel));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar(onCancel);
        });

        function onKey(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                fechar(onCancel);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                fechar(onConfirm);
            }
        }
        document.addEventListener('keydown', onKey);

        // Foco no botão principal
        setTimeout(() => {
            const btn = card.querySelector('.ui-alert-btn-confirm');
            if (btn) btn.focus();
        }, 60);
    }

    /* ---------- ESCAPE HTML ---------- */
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    /* ---------- API PÚBLICA ---------- */

    // Alert customizado
    window.uiAlert = function (mensagem, tipo, titulo) {
        return new Promise((resolve) => {
            criarModal({
                tipo: tipo || 'info',
                titulo: titulo,
                mensagem: mensagem,
                textoConfirmar: 'OK',
                mostrarCancelar: false,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(true)
            });
        });
    };

    // Confirm customizado (retorna Promise<boolean>)
    window.uiConfirm = function (mensagem, opcoes = {}) {
        return new Promise((resolve) => {
            criarModal({
                tipo: opcoes.tipo || 'question',
                titulo: opcoes.titulo,
                mensagem: mensagem,
                textoConfirmar: opcoes.textoConfirmar || 'Confirmar',
                textoCancelar: opcoes.textoCancelar || 'Cancelar',
                mostrarCancelar: true,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    };

    /* ---------- OVERRIDE DO ALERT NATIVO ---------- */
    // Substitui window.alert para usar o modal customizado
    // Usa a heurística: se a mensagem tem "?" ou palavras de confirmação vira question
    window.alert = function (mensagem) {
        let tipo = 'info';
        const msg = String(mensagem || '').toLowerCase();

        if (msg.includes('erro') || msg.includes('falh') || msg.includes('não foi possível')) {
            tipo = 'error';
        } else if (msg.includes('sucesso') || msg.includes('enviad') || msg.includes('cadastrad')) {
            tipo = 'success';
        } else if (msg.includes('atenção') || msg.includes('por favor') || msg.includes('cuidado') || msg.includes('selecione')) {
            tipo = 'warning';
        }

        criarModal({
            tipo,
            mensagem: mensagem,
            textoConfirmar: 'OK',
            mostrarCancelar: false
        });
    };
})();
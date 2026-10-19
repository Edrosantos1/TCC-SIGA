/* =============================================
   configuracoes_aluno.js
   - Pré-visualiza cada escolha na hora (sem precisar salvar)
   - Mantém o card "active" em sincronia com o rádio marcado
   - Botão "Restaurar padrão"
   - Avisa se tentar sair com alterações não salvas
   O que é salvo de verdade continua sendo feito pelo PHP (POST).
   ============================================= */
(function () {
    'use strict';

    var form = document.getElementById('formPreferencias');
    if (!form) return;

    var root = document.documentElement;
    var aviso = document.getElementById('avisoNaoSalvo');
    var btnRestaurar = document.getElementById('btnRestaurar');

    var ATRIBUTO = {
        tamanho_fonte: 'data-fonte',
        tema: 'data-tema',
        daltonismo: 'data-daltonismo',
        espacamento: 'data-espacamento'
    };

    var PADRAO = {
        tamanho_fonte: 'medio',
        tema: 'claro',
        daltonismo: 'normal',
        espacamento: 'normal',
        reduzir_animacoes: false
    };

    function lerFormulario() {
        var dados = {};
        Object.keys(ATRIBUTO).forEach(function (campo) {
            var marcado = form.querySelector('input[name="' + campo + '"]:checked');
            dados[campo] = marcado ? marcado.value : PADRAO[campo];
        });
        dados.reduzir_animacoes = form.elements['reduzir_animacoes'].checked;
        return dados;
    }

    var inicial = JSON.stringify(lerFormulario());

    function aplicarNaPagina(dados) {
        Object.keys(ATRIBUTO).forEach(function (campo) {
            root.setAttribute(ATRIBUTO[campo], dados[campo]);
        });
        root.setAttribute('data-animacoes', dados.reduzir_animacoes ? 'reduzidas' : 'normais');
    }

    function sincronizarCards() {
        form.querySelectorAll('.opcao-card').forEach(function (card) {
            var input = card.querySelector('input[type="radio"]');
            if (input) card.classList.toggle('active', input.checked);
        });
    }

    function atualizarAviso() {
        if (aviso) {
            aviso.hidden = JSON.stringify(lerFormulario()) === inicial;
        }
    }

    function aoMudar() {
        sincronizarCards();
        aplicarNaPagina(lerFormulario());
        atualizarAviso();
    }

    form.addEventListener('change', aoMudar);

    if (btnRestaurar) {
        btnRestaurar.addEventListener('click', function () {
            Object.keys(ATRIBUTO).forEach(function (campo) {
                var alvo = form.querySelector('input[name="' + campo + '"][value="' + PADRAO[campo] + '"]');
                if (alvo) alvo.checked = true;
            });
            form.elements['reduzir_animacoes'].checked = PADRAO.reduzir_animacoes;
            aoMudar();
        });
    }

})();
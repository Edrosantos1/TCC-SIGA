/* =============================================
   configuracoes_user.js
   - Pré-visualiza cada escolha na hora (sem precisar salvar)
   - Mantém o card "active" em sincronia com o rádio marcado
   - Botão "Restaurar padrão"
   - Avisa se tentar sair com alterações não salvas
   O que é salvo de verdade continua sendo feito pelo PHP (POST).
   ============================================= */
// Traduções da página (juntam-se às de painel_user.js, que aplica o idioma)
if (typeof dashboardTranslations !== 'undefined') {
  const configuracoesTranslations = {
  "pt": {
    "cfg_title": "Minhas Preferências",
    "cfg_subtitle": "Ajuste suas preferências de acessibilidade. As mudanças aparecem na hora; clique em salvar para mantê-las.",
    "cfg_font_title": "Tamanho da Fonte",
    "cfg_font_desc": "Altere o tamanho do texto em todo o sistema",
    "opt_small": "Pequeno",
    "opt_medium": "Médio",
    "opt_large": "Grande",
    "cfg_color_title": "Daltonismo",
    "cfg_color_desc": "Ajuste as cores para facilitar a diferença entre tons confundidos",
    "opt_normal": "Normal",
    "opt_protanopia": "Protanopia",
    "opt_deuteranopia": "Deuteranopia",
    "opt_tritanopia": "Tritanopia",
    "cfg_spacing_title": "Espaçamento",
    "cfg_spacing_desc": "Ajuste a densidade da informação na tela",
    "opt_compact": "Compacto",
    "opt_comfortable": "Confortável",
    "cfg_access_title": "Acessibilidade",
    "cfg_access_desc": "Reduza ou desative animações para melhor performance e acessibilidade",
    "cfg_reduce_motion": "Reduzir animações",
    "cfg_unsaved_notice": "Você tem alterações que ainda não foram salvas.",
    "cfg_save": "Salvar Preferências",
    "cfg_restore": "Restaurar padrão",
    "cfg_dialog_title": "Alterações não salvas",
    "cfg_dialog_desc": "Você alterou suas preferências. Deseja aplicar as mudanças antes de sair?",
    "cfg_dialog_save": "Salvar e sair",
    "cfg_dialog_discard": "Sair sem salvar",
    "cfg_dialog_stay": "Continuar editando",
    "flash_saved": "Preferências salvas com sucesso!",
    "flash_error": "Não foi possível salvar suas preferências. Tente novamente.",
    "flash_csrf": "Sessão expirada ou token de segurança inválido. Recarregue a página e tente novamente."
  },
  "en": {
    "cfg_title": "My Preferences",
    "cfg_subtitle": "Adjust your accessibility preferences. Changes appear right away; click save to keep them.",
    "cfg_font_title": "Font Size",
    "cfg_font_desc": "Change the text size across the whole system",
    "opt_small": "Small",
    "opt_medium": "Medium",
    "opt_large": "Large",
    "cfg_color_title": "Color Blindness",
    "cfg_color_desc": "Adjust colors to make confusing shades easier to tell apart",
    "opt_normal": "Normal",
    "opt_protanopia": "Protanopia",
    "opt_deuteranopia": "Deuteranopia",
    "opt_tritanopia": "Tritanopia",
    "cfg_spacing_title": "Spacing",
    "cfg_spacing_desc": "Adjust how dense the information is on screen",
    "opt_compact": "Compact",
    "opt_comfortable": "Comfortable",
    "cfg_access_title": "Accessibility",
    "cfg_access_desc": "Reduce or turn off animations for better performance and accessibility",
    "cfg_reduce_motion": "Reduce animations",
    "cfg_unsaved_notice": "You have changes that have not been saved yet.",
    "cfg_save": "Save Preferences",
    "cfg_restore": "Restore defaults",
    "cfg_dialog_title": "Unsaved changes",
    "cfg_dialog_desc": "You changed your preferences. Do you want to apply the changes before leaving?",
    "cfg_dialog_save": "Save and leave",
    "cfg_dialog_discard": "Leave without saving",
    "cfg_dialog_stay": "Keep editing",
    "flash_saved": "Preferences saved successfully!",
    "flash_error": "Could not save your preferences. Please try again.",
    "flash_csrf": "Session expired or invalid security token. Reload the page and try again."
  },
  "es": {
    "cfg_title": "Mis Preferencias",
    "cfg_subtitle": "Ajusta tus preferencias de accesibilidad. Los cambios se ven al instante; haz clic en guardar para conservarlos.",
    "cfg_font_title": "Tamaño de la Fuente",
    "cfg_font_desc": "Cambia el tamaño del texto en todo el sistema",
    "opt_small": "Pequeño",
    "opt_medium": "Mediano",
    "opt_large": "Grande",
    "cfg_color_title": "Daltonismo",
    "cfg_color_desc": "Ajusta los colores para distinguir mejor los tonos que se confunden",
    "opt_normal": "Normal",
    "opt_protanopia": "Protanopía",
    "opt_deuteranopia": "Deuteranopía",
    "opt_tritanopia": "Tritanopía",
    "cfg_spacing_title": "Espaciado",
    "cfg_spacing_desc": "Ajusta la densidad de la información en pantalla",
    "opt_compact": "Compacto",
    "opt_comfortable": "Cómodo",
    "cfg_access_title": "Accesibilidad",
    "cfg_access_desc": "Reduce o desactiva las animaciones para mejor rendimiento y accesibilidad",
    "cfg_reduce_motion": "Reducir animaciones",
    "cfg_unsaved_notice": "Tienes cambios que aún no se han guardado.",
    "cfg_save": "Guardar Preferencias",
    "cfg_restore": "Restaurar valores predeterminados",
    "cfg_dialog_title": "Cambios sin guardar",
    "cfg_dialog_desc": "Cambiaste tus preferencias. ¿Quieres aplicar los cambios antes de salir?",
    "cfg_dialog_save": "Guardar y salir",
    "cfg_dialog_discard": "Salir sin guardar",
    "cfg_dialog_stay": "Seguir editando",
    "flash_saved": "¡Preferencias guardadas con éxito!",
    "flash_error": "No fue posible guardar tus preferencias. Inténtalo de nuevo.",
    "flash_csrf": "Sesión expirada o token de seguridad inválido. Recarga la página e inténtalo de nuevo."
  }
};
  Object.keys(configuracoesTranslations).forEach((lang) => {
    dashboardTranslations[lang] = Object.assign(dashboardTranslations[lang] || {}, configuracoesTranslations[lang]);
  });
}

(function () {
    'use strict';

    var form = document.getElementById('formPreferencias');
    if (!form) return;

    var root = document.documentElement;
    var aviso = document.getElementById('avisoNaoSalvo');
    var btnRestaurar = document.getElementById('btnRestaurar');

    var ATRIBUTO = {
        tamanho_fonte: 'data-fonte',
        daltonismo: 'data-daltonismo',
        espacamento: 'data-espacamento'
    };

    var PADRAO = {
        tamanho_fonte: 'medio',
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
<?php
/**
 * Carregador de preferências do aluno (SiGA ITJ).
 *
 * Deve ser incluído dentro do <head> de todas as páginas do aluno,
 * depois dos links de stylesheet.
 */
require_once __DIR__ . '/aluno_funcoes_config.php';

$__css = __DIR__ . '/../assets/css/aluno/aluno_preferencias.css';
$__cfg = aluno_config_da_sessao($GLOBALS['conn'] ?? $GLOBALS['conexao'] ?? null);
$__attrs = aluno_config_atributos($__cfg);
?>
<script>
try {
    if (window.matchMedia('(min-width: 901px)').matches && localStorage.getItem('sidebarCollapsed') === 'true') {
        document.documentElement.classList.add('sidebar-collapsed-init');
    }
} catch (e) {}
</script>
<link rel="stylesheet" href="../assets/css/aluno/aluno_preferencias.css?v=<?= @filemtime($__css) ?: 1 ?>">
<link rel="stylesheet" href="../assets/css/aluno/temas_paginas_aluno.css?v=<?= @filemtime(__DIR__ . '/../assets/css/aluno/temas_paginas_aluno.css') ?: 1 ?>">
<script>
(function () {
    var attrs = <?= json_encode($__attrs, JSON_HEX_TAG | JSON_HEX_AMP) ?>;
    try {
        var temaSalvo = localStorage.getItem('siga-tema');
        if (!['light', 'dark', 'contrast', 'claro', 'escuro', 'alto_contraste'].includes(temaSalvo)) {
            temaSalvo = localStorage.getItem('siga-theme');
        }
        var temas = {
            light: 'claro',
            dark: 'escuro',
            contrast: 'alto_contraste',
            claro: 'claro',
            escuro: 'escuro',
            alto_contraste: 'alto_contraste'
        };
        if (temas[temaSalvo]) {
            attrs['data-tema'] = temas[temaSalvo];
            attrs['data-theme'] = {
                claro: 'light',
                escuro: 'dark',
                alto_contraste: 'contrast'
            }[temas[temaSalvo]];
        }
    } catch (e) {}
    for (var k in attrs) {
        document.documentElement.setAttribute(k, attrs[k]);
    }
    document.documentElement.setAttribute('data-suporta-alto-contraste', 'true');
})();
</script>
<script src="../assets/js/shared/tema.js?v=<?= @filemtime(__DIR__ . '/../assets/js/shared/tema.js') ?: 1 ?>" defer></script>

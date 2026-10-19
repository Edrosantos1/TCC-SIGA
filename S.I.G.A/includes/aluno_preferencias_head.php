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
<link rel="stylesheet" href="../assets/css/aluno/aluno_preferencias.css?v=<?= @filemtime($__css) ?: 1 ?>">
<link rel="stylesheet" href="../assets/css/aluno/temas_paginas_aluno.css?v=<?= @filemtime(__DIR__ . '/../assets/css/aluno/temas_paginas_aluno.css') ?: 1 ?>">
<script>
(function () {
    var attrs = <?= json_encode($__attrs, JSON_HEX_TAG | JSON_HEX_AMP) ?>;
    for (var k in attrs) {
        document.documentElement.setAttribute(k, attrs[k]);
    }
})();
</script>

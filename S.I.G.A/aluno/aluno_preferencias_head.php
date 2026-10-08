<?php
/**
 * Coloque esta linha dentro do <head> de TODAS as páginas do aluno,
 * depois dos outros <link rel="stylesheet">:
 *
 *   <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>
 *
 * Ela carrega o CSS das preferências e já marca o <html> com o tema, a fonte etc.
 * antes da página aparecer (sem "piscar" no tema claro).
 */
require_once __DIR__ . '/aluno_functions_config.php';

$__cfg   = aluno_config_da_sessao($GLOBALS['conn'] ?? $GLOBALS['conexao'] ?? null);
$__attrs = aluno_config_atributos($__cfg);
$__css   = __DIR__ . '/../assets/css/aluno_preferencias.css';
?>
<link rel="stylesheet" href="../assets/css/aluno_preferencias.css?v=<?= @filemtime($__css) ?: 1 ?>">
<script>
(function () {
    var attrs = <?= json_encode($__attrs, JSON_HEX_TAG | JSON_HEX_AMP) ?>;
    for (var k in attrs) {
        document.documentElement.setAttribute(k, attrs[k]);
    }
})();
</script>
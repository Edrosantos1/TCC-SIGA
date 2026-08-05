<?php
// =============================================
// aplicar_configuracoes.php
// =============================================

function aplicarConfiguracoes() {
    // Verificar se o admin está logado
    if (!isset($_SESSION['admin_id'])) {
        return '';
    }

    // Identificar conexão
    $db = null;
    if (isset($GLOBALS['conn'])) {
        $db = $GLOBALS['conn'];
    } elseif (isset($GLOBALS['conexao'])) {
        $db = $GLOBALS['conexao'];
    } elseif (isset($GLOBALS['pdo'])) {
        $db = $GLOBALS['pdo'];
    }

    if (!$db) {
        return '';
    }

    // Buscar configurações
    $configuracoes = [];
    try {
        if ($db instanceof mysqli) {
            $result = $db->query("SELECT chave, valor FROM configuracoes");
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $configuracoes[$row['chave']] = $row['valor'];
                }
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->query("SELECT chave, valor FROM configuracoes");
            if ($stmt) {
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $configuracoes[$row['chave']] = $row['valor'];
                }
            }
        }
    } catch (Exception $e) {
        return '';
    }

    // Se não tem configurações, retorna vazio
    if (empty($configuracoes)) {
        return '';
    }

    // Salvar na sessão
    $_SESSION['config'] = $configuracoes;

    // Montar classes
    $classes = [];

    // Tamanho da fonte
    $tamanho = $configuracoes['tamanho_fonte'] ?? 'medio';
    $classes[] = 'fonte-' . $tamanho;

    // Tema
    $tema = $configuracoes['tema'] ?? 'claro';
    $classes[] = 'tema-' . $tema;

    // Daltonismo
    $daltonismo = $configuracoes['daltonismo'] ?? 'normal';
    if ($daltonismo !== 'normal') {
        $classes[] = 'daltonismo-' . $daltonismo;
    }

    // Espaçamento
    $espacamento = $configuracoes['espacamento'] ?? 'normal';
    if ($espacamento !== 'normal') {
        $classes[] = 'espacamento-' . $espacamento;
    }

    // Reduzir animações
    if (($configuracoes['reduzir_animacoes'] ?? '0') == '1') {
        $classes[] = 'reduzir-animacoes';
    }

    $resultado = implode(' ', $classes);

    // 🔥 DEBUG - Verificar no console
    echo '<script>console.log("🔧 Configurações aplicadas:", "' . $resultado . '");</script>';

    return $resultado;
}
?>
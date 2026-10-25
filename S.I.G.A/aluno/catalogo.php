<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/reservas_funcoes.php';
require_once __DIR__ . '/auth/verificar_login.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: auth/login.php');
    exit;
}

siga_expirar_reservas($conexao);

$usuario_id = $_SESSION['usuario_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['visualizar'])) {
    if (!csrf_validar()) {
        http_response_code(403);
        exit('Token CSRF inválido. Recarregue a página e tente novamente.');
    }

    $itemParaAbrir = (int) $_POST['visualizar'];
    if ($itemParaAbrir > 0) {
        $_SESSION['catalogo_item_para_abrir'] = $itemParaAbrir;
    }
    header('Location: catalogo.php', true, 303);
    exit;
}

$itemParaAbrir = (int) ($_SESSION['catalogo_item_para_abrir'] ?? 0);
unset($_SESSION['catalogo_item_para_abrir']);

// Mensagem de feedback guardada na sessão (flash): aparece uma vez e some,
// sem poluir a URL. Gravada por alternar_favorito.php / api/aluno_reservas.php.
$flashCatalogo = null;
if (!empty($_SESSION['flash_catalogo'])) {
    $flashCatalogo = $_SESSION['flash_catalogo'];
    unset($_SESSION['flash_catalogo']);
}
$favoritosStmt = $conn->prepare('SELECT item_id, tipo_item FROM favoritos WHERE usuario_id = ?');
$favoritosStmt->bind_param('i', $usuario_id);
$favoritosStmt->execute();
$favoritosResult = $favoritosStmt->get_result();
$favoritos = [];
while ($favorito = $favoritosResult->fetch_assoc()) {
    $favoritos[$favorito['tipo_item'] . '_' . $favorito['item_id']] = true;
}
$favoritosStmt->close();

$reservasStmt = $conn->prepare(
    "SELECT id_reserva, id_catalogo, status FROM reservas WHERE id_aluno = ? AND status IN ('pendente', 'aprovada')"
);
$reservasStmt->bind_param('i', $usuario_id);
$reservasStmt->execute();
$reservasResult = $reservasStmt->get_result();
$reservasAtivas = [];
while ($reserva = $reservasResult->fetch_assoc()) {
    $reservasAtivas[(string) $reserva['id_catalogo']] = [
        'id_reserva' => (int) $reserva['id_reserva'],
        'status' => $reserva['status'],
    ];
}
$reservasStmt->close();

$sql = "SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();
$primeiroNome = 'Aluno';
if ($row = $result->fetch_assoc()) {
    $nomeCompleto = trim($row['nome_aluno']);
    $partes = explode(' ', $nomeCompleto);
    $primeiroNome = $partes[0] ?: 'Aluno';
}
$stmt->close();

// ========== NOTIFICAÇÕES ==========
$notificacoes = array();
$sql_notif = "
    SELECT n.id_envio, n.titulo, n.mensagem, n.tipo, n.criado_em
    FROM notificacoes n
    WHERE n.id_aluno = ? AND COALESCE(n.lida, 0) = 0
    ORDER BY n.criado_em DESC
    LIMIT 5
";
$stmt_notif = $conn->prepare($sql_notif);
if ($stmt_notif) {
    $stmt_notif->bind_param("i", $usuario_id);
    $stmt_notif->execute();
    $notificacoes = $stmt_notif->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_notif->close();
}

// ========== PAGINAÇÃO E FILTROS ==========
$porPagina = 20;
$paginaAtual = isset($_GET['pagina']) ? max(1, (int)$_GET['pagina']) : 1;
$offset = ($paginaAtual - 1) * $porPagina;

$filtroTipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';
$filtroBusca = isset($_GET['busca']) ? trim($_GET['busca']) : '';

$where = "capa_url IS NOT NULL AND capa_url <> ''"; // só itens com capa
$params = [];
if ($filtroTipo) {
    $where .= " AND tipo = ?";
    $params[] = $filtroTipo;
}
if ($filtroBusca) {
    $where .= " AND (titulo LIKE ? OR autor LIKE ?)";
    $termo = '%' . $filtroBusca . '%';
    $params[] = $termo;
    $params[] = $termo;
}

$countSql = "SELECT COUNT(*) as total FROM catalogo WHERE $where";
$stmt = $conn->prepare($countSql);
if (!$stmt) {
    $total = 0;
} else {
    if (!empty($params)) {
        $types = str_repeat('s', count($params));
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $total = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
}

$totalPaginas = ceil($total / $porPagina);

$sql = "SELECT id_catalogo, titulo, autor, tipo, editora, ano_publicacao, isbn, descricao, quantidade, localizacao, capa_url, "
        . siga_sql_disponiveis('c') . " AS disponiveis
        FROM catalogo c
        WHERE $where 
        ORDER BY titulo ASC 
        LIMIT ? OFFSET ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    $itens = [];
} else {
    $params[] = $porPagina;
    $params[] = $offset;
    $types = str_repeat('s', count($params) - 2) . 'ii';
    $stmt->bind_param($types, ...$params);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $itens = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    } else {
        $itens = [];
    }
    $stmt->close();
}

if ($itemParaAbrir > 0 && !array_filter($itens, static function ($item) use ($itemParaAbrir) {
    return (int) $item['id_catalogo'] === $itemParaAbrir;
})) {
    $itemStmt = $conn->prepare(
        'SELECT c.id_catalogo, c.titulo, c.autor, c.tipo, c.editora, c.ano_publicacao, c.isbn, c.descricao, c.quantidade, c.localizacao, c.capa_url, '
        . siga_sql_disponiveis('c') . ' AS disponiveis FROM catalogo c WHERE c.id_catalogo = ?'
    );
    if ($itemStmt) {
        $itemStmt->bind_param('i', $itemParaAbrir);
        $itemStmt->execute();
        $itemSolicitado = $itemStmt->get_result()->fetch_assoc();
        if ($itemSolicitado) {
            $itens[] = $itemSolicitado;
        }
        $itemStmt->close();
    }
}

$catalogData = [];
foreach ($itens as $row) {
    $capa = $row['capa_url'];
    if (!empty($capa) && strpos($capa, 'http') !== 0 && strpos($capa, '/') !== 0) {
        $capa = '../' . $capa;
    }
    $catalogData[] = [
        'id'          => $row['id_catalogo'],
        'title'       => $row['titulo'],
        'author'      => $row['autor'],
        'type'        => $row['tipo'],
        'year'        => $row['ano_publicacao'],
        'category'    => '',
        'location'    => $row['localizacao'],
        'cover'       => $capa,
        'quantity'    => (int) $row['disponiveis'],
        'available'   => (int) $row['disponiveis'] > 0,
        'description' => $row['descricao'],
    ];
}
$catalogDataJson = json_encode($catalogData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
    <title>Catálogo - SiGA ITJ</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/aluno/painel_aluno.css">
    <link rel="stylesheet" href="../assets/css/aluno/catalogo.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/aluno/aluno_unificado.css">
    <link rel="stylesheet" href="../assets/css/aluno/notificacoes_aluno.css">
    <link rel="stylesheet" href="../assets/css/shared/alertas_ui.css">
    <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>

    <script src="../assets/js/shared/alertas_ui.js"></script>
    <script src="../assets/js/aluno/painel_aluno.js" defer></script>
    <script src="../assets/js/aluno/notificacoes_aluno.js" defer></script>
    <script>
        window.catalogData = <?= $catalogDataJson ?>;
        window.itemParaAbrir = <?= $itemParaAbrir ?>;
        window.favoritosPHP = <?= json_encode($favoritos) ?>;
        window.reservasAtivas = <?= json_encode($reservasAtivas, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
        window.flashMessage = <?= json_encode($flashCatalogo, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>
    <script src="../assets/js/aluno/catalogo.js?v=<?= time() ?>" defer></script>
</head>
<body>
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo"><i class="fas fa-book-reader"></i><span>SiGA ITJ</span></div>
            <button class="collapse-icon" id="collapseBtn" title="Recolher menu" data-i18n-title="collapse_menu"><span></span><span></span></button>
        </div>
        <nav class="sidebar-nav">
            <a href="painel.php" class="nav-item"><i class="fas fa-home"></i><span>Visão Geral</span></a>
            <a href="catalogo.php" class="nav-item active"><i class="fas fa-search"></i><span>Catálogo</span></a>
            <a href="favoritos.php" class="nav-item"><i class="fas fa-heart"></i><span>Meus Favoritos</span></a>
            <a href="emprestimos.php" class="nav-item"><i class="fas fa-book"></i><span>Meus Empréstimos</span></a>
            <a href="reservas.php" class="nav-item"><i class="fas fa-clock"></i><span>Minhas Reservas</span></a>
            <a href="historico.php" class="nav-item"><i class="fas fa-history"></i><span>Histórico</span></a>
            <a href="configuracoes.php" class="nav-item"><i class="fas fa-sliders-h"></i><span>Configurações</span></a>
        </nav>
    </aside>

    <div class="main-content">
        <?php require __DIR__ . '/../includes/aluno_top_header.php'; ?>

        <main class="container catalog-main">

            <!-- ========== HERO ========== -->
            <div class="catalog-hero">
                <div class="catalog-hero-content">
                    <h1 id="catalog-title">Catálogo</h1>
                    <p id="catalog-subtitle">Explore nosso acervo de livros, revistas e TCCs</p>
                </div>
                <div class="catalog-hero-stats">
                    <div class="stat-pill">
                        <span class="stat-pill-num"><?= number_format($total, 0, ',', '.') ?></span>
                        <span class="stat-pill-label"><?= $total == 1 ? 'item no acervo' : 'itens no acervo' ?></span>
                    </div>
                </div>
            </div>

            <!-- ========== FILTROS ========== -->
            <form method="GET" action="catalogo.php" class="catalog-filters" id="catalog-filters">
                <input type="hidden" name="tipo" value="<?= htmlspecialchars($filtroTipo) ?>" id="catalog-filter-type">
                <button type="submit" hidden aria-hidden="true" tabindex="-1"></button>
                <div class="filter-search">
                    <i class="fas fa-search"></i>
                    <input type="text"
                           name="busca"
                           placeholder="Buscar Livros, autores, revistas..."
                           value="<?= htmlspecialchars($filtroBusca) ?>"
                           autocomplete="off">
                </div>

                <div class="filter-chips" role="group" aria-label="Filtrar por tipo" data-i18n-aria="filter_by_type">
                    <button type="submit" name="tipo" value=""
                            class="filter-chip <?= $filtroTipo === '' ? 'active' : '' ?>"
                            aria-pressed="<?= $filtroTipo === '' ? 'true' : 'false' ?>"
                            <?= $filtroTipo === '' ? 'disabled' : '' ?>>
                        <i class="fas fa-layer-group"></i> Todos
                    </button>
                    <button type="submit" name="tipo" value="livro"
                            class="filter-chip <?= $filtroTipo === 'livro' ? 'active' : '' ?>"
                            aria-pressed="<?= $filtroTipo === 'livro' ? 'true' : 'false' ?>"
                            <?= $filtroTipo === 'livro' ? 'disabled' : '' ?>>
                        <i class="fas fa-book"></i> Livros
                    </button>
                    <button type="submit" name="tipo" value="revista"
                            class="filter-chip <?= $filtroTipo === 'revista' ? 'active' : '' ?>"
                            aria-pressed="<?= $filtroTipo === 'revista' ? 'true' : 'false' ?>"
                            <?= $filtroTipo === 'revista' ? 'disabled' : '' ?>>
                        <i class="fas fa-newspaper"></i> Revistas
                    </button>
                    <button type="submit" name="tipo" value="tcc"
                            class="filter-chip <?= $filtroTipo === 'tcc' ? 'active' : '' ?>"
                            aria-pressed="<?= $filtroTipo === 'tcc' ? 'true' : 'false' ?>"
                            <?= $filtroTipo === 'tcc' ? 'disabled' : '' ?>>
                        <i class="fas fa-graduation-cap"></i> TCCs
                    </button>
                </div>

                <div class="filter-actions">
                    <?php if ($filtroTipo || $filtroBusca): ?>
                        <a href="catalogo.php" class="filter-clear" title="Limpar filtros" data-i18n-title="clear_filters">
                            <i class="fas fa-times"></i> <span data-i18n="clear">Limpar</span>
                        </a>
                    <?php endif; ?>
                </div>
            </form>

            <!-- ========== RESULTADOS ========== -->
            <?php if ($filtroTipo || $filtroBusca): ?>
                <div class="filter-summary">
                    <i class="fas fa-info-circle"></i>
                    <?php
                        $resumo = [];
                        $chavesTipo = ['livro' => 'type_book', 'revista' => 'type_magazine', 'tcc' => 'type_tcc'];
                        if ($filtroBusca) $resumo[] = '<span data-i18n="summary_search">busca</span>: "' . htmlspecialchars($filtroBusca) . '"';
                        if ($filtroTipo) $resumo[] = '<span data-i18n="summary_type">tipo</span>: <span data-i18n="' . ($chavesTipo[$filtroTipo] ?? 'type_book') . '">' . htmlspecialchars(ucfirst($filtroTipo)) . '</span>';
                    ?>
                    <span data-i18n="showing">Mostrando</span> <strong><?= $total ?></strong> <span data-i18n="<?= $total == 1 ? 'result_one' : 'result_many' ?>"><?= $total == 1 ? 'resultado' : 'resultados' ?></span> · <?= implode(' · ', $resumo) ?>
                </div>
            <?php endif; ?>

            <!-- ========== GRID ========== -->
            <div class="catalogo-grid" id="catalog-grid"></div>

            <!-- ========== PAGINAÇÃO ========== -->
            <?php if ($totalPaginas > 1): ?>
            <nav class="paginacao" aria-label="Paginação do catálogo" data-i18n-aria="pagination_label">
                <?php if ($paginaAtual > 1): ?>
                    <a href="?pagina=<?= $paginaAtual-1 ?>&tipo=<?= urlencode($filtroTipo) ?>&busca=<?= urlencode($filtroBusca) ?>" class="page-nav">
                        <i class="fas fa-chevron-left"></i> <span data-i18n="prev_page">Anterior</span>
                    </a>
                <?php endif; ?>

                <?php
                $range = 2;
                $start = max(1, $paginaAtual - $range);
                $end = min($totalPaginas, $paginaAtual + $range);
                if ($start > 1): ?>
                    <a href="?pagina=1&tipo=<?= urlencode($filtroTipo) ?>&busca=<?= urlencode($filtroBusca) ?>">1</a>
                    <?php if ($start > 2): ?><span class="page-dots">…</span><?php endif; ?>
                <?php endif; ?>

                <?php for ($i = $start; $i <= $end; $i++): ?>
                    <a href="?pagina=<?= $i ?>&tipo=<?= urlencode($filtroTipo) ?>&busca=<?= urlencode($filtroBusca) ?>"
                       class="<?= $i === $paginaAtual ? 'active' : '' ?>"
                       <?= $i === $paginaAtual ? 'aria-current="page"' : '' ?>>
                        <?= $i ?>
                    </a>
                <?php endfor; ?>

                <?php if ($end < $totalPaginas): ?>
                    <?php if ($end < $totalPaginas - 1): ?><span class="page-dots">…</span><?php endif; ?>
                    <a href="?pagina=<?= $totalPaginas ?>&tipo=<?= urlencode($filtroTipo) ?>&busca=<?= urlencode($filtroBusca) ?>"><?= $totalPaginas ?></a>
                <?php endif; ?>

                <?php if ($paginaAtual < $totalPaginas): ?>
                    <a href="?pagina=<?= $paginaAtual+1 ?>&tipo=<?= urlencode($filtroTipo) ?>&busca=<?= urlencode($filtroBusca) ?>" class="page-nav">
                        <span data-i18n="next_page">Próximo</span> <i class="fas fa-chevron-right"></i>
                    </a>
                <?php endif; ?>
            </nav>
            <?php endif; ?>

            <!-- ========== EMPTY STATE ========== -->
            <div id="catalog-empty" style="display:none;">
                <div class="catalog-empty-inner">
                    <div class="empty-illustration">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3 id="catalog-no-results">Nenhum resultado encontrado</h3>
                    <p data-i18n="no_results_hint">Tente ajustar os filtros ou explorar outra categoria.</p>
                    <a href="catalogo.php" class="empty-cta">
                        <i class="fas fa-undo"></i> <span data-i18n="clear_filters">Limpar filtros</span>
                    </a>
                </div>
            </div>
        </main>
    </div>

    <!-- ========== MODAL ========== -->
    <div class="modal-overlay" id="item-modal-overlay">
        <div class="modal-container">
            <button class="modal-close" id="item-modal-close" aria-label="Fechar" data-i18n-aria="close"><i class="fas fa-times"></i></button>
            <div class="modal-content">
                <div class="modal-cover">
                    <img id="modal-cover-img" src="" alt="Capa" data-i18n-alt="cover_alt">
                    <div class="modal-cover-placeholder" id="modal-cover-placeholder" style="display:none;">
                        <i class="fas fa-book"></i><span>Título</span>
                    </div>
                </div>
                <div class="modal-info">
                    <span class="modal-type-badge" id="modal-type-badge">Livro</span>
                    <h2 id="modal-title">Título</h2>
                    <p id="modal-author">Autor</p>
                    <div class="modal-meta">
                        <span id="modal-year"></span>
                        <span id="modal-location"></span>
                    </div>
                    <p id="modal-type" style="display:none;"></p>
                    <p id="modal-description" class="modal-description">Descrição</p>
                    <p id="modal-availability" class="availability available">Disponível</p>
                    <div class="modal-actions">
                        <button id="modal-favorite-btn" type="button">
                            <i class="far fa-heart" id="modal-favorite-icon"></i>
                            <span id="modal-favorite-text">Favoritar</span>
                        </button>
                        <button id="modal-reserve-btn" type="button" class="btn-primary-action">
                            <i class="fas fa-hand-holding"></i>
                            <span id="modal-reserve-text">Reservar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
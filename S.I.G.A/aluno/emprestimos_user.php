<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/auth/verificar_login_user.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: auth/login_user.php');
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

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

// ========== BUSCAR NOTIFICAÇÕES PARA O SININHO ==========
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

$emprestimos = [];
$stmt_emprestimos = $conn->prepare(
    "SELECT e.id_emprestimo, e.titulo_item, e.data_emprestimo, e.data_devolucao_prevista,
            e.status,
            CASE
                WHEN e.data_devolucao_prevista > DATE_ADD(DATE(e.data_emprestimo), INTERVAL 7 DAY) THEN 1
                ELSE 0
            END AS renovado,
            c.autor, c.capa_url, c.tipo
     FROM emprestimos e
     LEFT JOIN catalogo c ON c.id_catalogo = e.id_catalogo
     WHERE e.id_aluno = ?
     ORDER BY e.data_emprestimo DESC"
);
$stmt_emprestimos->bind_param('i', $usuario_id);
$stmt_emprestimos->execute();
$emprestimos = $stmt_emprestimos->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt_emprestimos->close();

// Capas salvas como 'assets/capas/...' são relativas à raiz do sistema; esta página fica em /aluno/.
foreach ($emprestimos as &$emp) {
    $capa = trim((string) ($emp['capa_url'] ?? ''));
    if ($capa !== '' && !preg_match('#^(https?:)?//#i', $capa) && $capa[0] !== '/' && strpos($capa, 'data:') !== 0) {
        $capa = '../' . $capa;
    }
    $emp['capa_url'] = $capa;
}
unset($emp);

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
  <title>Meus Empréstimos - SiGA ITJ</title>

  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <link rel="stylesheet" href="../assets/css/aluno/painel_user.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/aluno/unificado_user.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/aluno/meus_emprestimos_user.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/shared/alertas_ui.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/aluno/notificacoes_user.css?v=<?= time() ?>">
  <?php include __DIR__ . '/../includes/preferencias_head_user.php'; ?>
  <link rel="stylesheet" href="../assets/css/aluno/controles_visualizacao_escuro_user.css?v=<?= time() ?>">

  <script src="../assets/js/shared/alertas_ui.js"></script>
  <script src="../assets/js/aluno/painel_user.js?v=<?= time() ?>" defer></script>
  <script src="../assets/js/aluno/notificacoes_user.js?v=<?= time() ?>" defer></script>
  <script src="../assets/js/aluno/meus_emprestimos_user.js?v=<?= time() ?>" defer></script>
</head>
<body>

  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-book-reader"></i>
        <span>SiGA ITJ</span>
      </div>
      <button class="collapse-icon" id="collapseBtn" title="Recolher menu" data-i18n-title="collapse_menu">
        <span></span>
        <span></span>
      </button>
    </div>
    <nav class="sidebar-nav">
      <a href="painel_user.php" class="nav-item"><i class="fas fa-home"></i><span>Visão Geral</span></a>
      <a href="catalogo_user.php" class="nav-item"><i class="fas fa-search"></i><span>Catálogo</span></a>
      <a href="favoritos_user.php" class="nav-item"><i class="fas fa-heart"></i><span>Meus Favoritos</span></a>
      <a href="emprestimos_user.php" class="nav-item active"><i class="fas fa-book"></i><span>Meus Empréstimos</span></a>
      <a href="reservas_user.php" class="nav-item"><i class="fas fa-clock"></i><span>Minhas Reservas</span></a>
      <a href="configuracoes_user.php" class="nav-item"><i class="fas fa-sliders-h"></i><span>Configurações</span></a>
    </nav>
  </aside>

  <div class="main-content">
    <?php require __DIR__ . '/../includes/top_header_user.php'; ?>

    <main class="container loans-main">
      <div class="loans-header">
        <h1 id="loans-title" data-i18n="loans_title">Meus Empréstimos</h1>
        <p id="loans-subtitle" data-i18n="loans_subtitle">Acompanhe seus livros, revistas e TCCs emprestados</p>
      </div>

      <div class="loans-tabs" role="tablist">
        <button class="tab-btn active" data-tab="active" id="tab-active" data-i18n="tab_active" role="tab">Ativos</button>
        <button class="tab-btn" data-tab="history" id="tab-history" data-i18n="tab_history" role="tab">Histórico</button>
      </div>

      <div class="loans-toolbar" id="loans-toolbar" hidden>
        <div class="loans-search">
          <i class="fas fa-search"></i>
          <input type="text" id="loans-search-input" data-i18n-placeholder="loans_search_placeholder" placeholder="Buscar nos seus empréstimos..." autocomplete="off">
        </div>

        <div class="loans-chips" role="group" aria-label="Filtrar por tipo">
          <button type="button" class="loan-chip active" data-filter="todos" aria-pressed="true" disabled>
            <span data-i18n="filter_all">Todos</span>
            <span class="chip-count" data-count="todos">0</span>
          </button>
          <button type="button" class="loan-chip" data-filter="livro" aria-pressed="false">
            <span data-i18n="filter_livro">Livros</span>
            <span class="chip-count" data-count="livro">0</span>
          </button>
          <button type="button" class="loan-chip" data-filter="revista" aria-pressed="false">
            <span data-i18n="filter_revista">Revistas</span>
            <span class="chip-count" data-count="revista">0</span>
          </button>
          <button type="button" class="loan-chip" data-filter="tcc" aria-pressed="false">
            <span data-i18n="filter_tcc">TCCs</span>
            <span class="chip-count" data-count="tcc">0</span>
          </button>
        </div>

        <div class="loans-controls-right">
          <div class="loans-sort">
            <i class="fas fa-sort"></i>
            <select id="loans-sort-select" aria-label="Ordenar">
              <option value="recentes" data-i18n="sort_recentes">Mais recentes</option>
              <option value="antigos" data-i18n="sort_antigos">Mais antigos</option>
              <option value="vencimento" data-i18n="sort_vencimento">Vencimento próximo</option>
              <option value="titulo-asc" data-i18n="sort_titulo_asc">Título A-Z</option>
              <option value="titulo-desc" data-i18n="sort_titulo_desc">Título Z-A</option>
            </select>
          </div>

          <div class="loans-view-toggle" role="group" aria-label="Modo de visualização">
            <button type="button" class="active" data-view="grid" data-i18n-title="view_grid" title="Ver em grade" aria-pressed="true">
              <i class="fas fa-th-large"></i><span data-i18n="view_grid_label">Grade</span>
            </button>
            <button type="button" data-view="list" data-i18n-title="view_list" title="Ver em lista" aria-pressed="false">
              <i class="fas fa-list"></i><span data-i18n="view_list_label">Lista</span>
            </button>
          </div>
        </div>
      </div>

      <div class="loans-grid" id="active-loans">
        <?php foreach ($emprestimos as $emprestimo):
            $status = $emprestimo['status'];
            if ($status === 'emprestado'
                && !empty($emprestimo['data_devolucao_prevista'])
                && $emprestimo['data_devolucao_prevista'] < date('Y-m-d')) {
                $status = 'atrasado';
            }

            $isActive = in_array($status, ['emprestado', 'atrasado'], true);
            $isHistory = in_array($status, ['devolvido'], true);
            if (!$isActive && !$isHistory) continue;
            $tipo = $emprestimo['tipo'] ?: 'livro';
            $tipoIcon = ['livro' => 'fa-book', 'revista' => 'fa-newspaper', 'tcc' => 'fa-graduation-cap'][$tipo] ?? 'fa-book';
            $tipoLabel = ['livro' => 'Livro', 'revista' => 'Revista', 'tcc' => 'TCC'][$tipo] ?? 'Livro';
            $statusLabel = match ($status) {
                'emprestado' => 'Ativo', 'atrasado' => 'Atrasado', 'pendente' => 'Aguardando aprovação',
                'devolvido' => 'Devolvido', default => 'Pendente'
            };
            $statusClass = match ($status) {
                'emprestado' => 'active',
                'atrasado' => 'overdue',
                'devolvido' => 'returned',
                default => 'pending'
            };
        ?>
        <article class="loan-card" data-status="<?= htmlspecialchars($statusClass) ?>">
          <div class="loan-cover-wrap">
            <?php if (!empty($emprestimo['capa_url'])): ?>
              <img class="loan-cover" src="<?= htmlspecialchars($emprestimo['capa_url']) ?>" alt="<?= htmlspecialchars($emprestimo['titulo_item']) ?>">
            <?php else: ?>
              <div class="loan-cover-placeholder"><i class="fas <?= $tipoIcon ?>"></i></div>
            <?php endif; ?>
            <span class="loan-type-badge tipo-badge type-<?= htmlspecialchars($tipo) ?>"><i class="fas <?= $tipoIcon ?>"></i> <?= htmlspecialchars($tipoLabel) ?></span>
            <span class="loan-badge status-<?= htmlspecialchars($statusClass) ?>"><?= htmlspecialchars($statusLabel) ?></span>
          </div>
          <div class="loan-body">
            <h4 class="loan-title"><?= htmlspecialchars($emprestimo['titulo_item']) ?></h4>
            <p class="loan-author"><?= htmlspecialchars($emprestimo['autor'] ?: 'Autor não informado') ?></p>
            <div class="loan-dates">
              <span><i class="far fa-clock"></i> <span data-i18n="loan_date_label">Empréstimo:</span> <?= date('d/m/Y', strtotime($emprestimo['data_emprestimo'])) ?></span>
              <?php if (!empty($emprestimo['data_devolucao_prevista'])): ?>
                <span><i class="far fa-calendar-check"></i> <span data-i18n="due_date_label">Vencimento:</span> <?= date('d/m/Y', strtotime($emprestimo['data_devolucao_prevista'])) ?></span>
              <?php endif; ?>
            </div>
          </div>
        </article>
        <?php endforeach; ?>
      </div>
      <div class="loans-grid" id="history-loans" style="display: none;">
        <?php foreach ($emprestimos as $emprestimo):
            if ($emprestimo['status'] !== 'devolvido') continue;
            $tipo = $emprestimo['tipo'] ?: 'livro';
            $tipoIconH = ['livro' => 'fa-book', 'revista' => 'fa-newspaper', 'tcc' => 'fa-graduation-cap'][$tipo] ?? 'fa-book';
            $tipoLabelH = ['livro' => 'Livro', 'revista' => 'Revista', 'tcc' => 'TCC'][$tipo] ?? 'Livro';
        ?>
        <article class="loan-card" data-status="<?= htmlspecialchars($emprestimo['status']) ?>">
          <div class="loan-cover-wrap">
            <?php if (!empty($emprestimo['capa_url'])): ?>
              <img class="loan-cover" src="<?= htmlspecialchars($emprestimo['capa_url']) ?>" alt="<?= htmlspecialchars($emprestimo['titulo_item']) ?>">
            <?php else: ?>
              <div class="loan-cover-placeholder"><i class="fas <?= $tipoIconH ?>"></i></div>
            <?php endif; ?>
            <span class="loan-type-badge tipo-badge type-<?= htmlspecialchars($tipo) ?>"><i class="fas <?= $tipoIconH ?>"></i> <?= htmlspecialchars($tipoLabelH) ?></span>
            <span class="loan-badge status-<?= htmlspecialchars($emprestimo['status']) ?>"><?= htmlspecialchars('Devolvido') ?></span>
          </div>
          <div class="loan-body"><h4 class="loan-title"><?= htmlspecialchars($emprestimo['titulo_item']) ?></h4><p class="loan-author"><?= htmlspecialchars($emprestimo['autor'] ?: 'Autor não informado') ?></p></div>
        </article>
        <?php endforeach; ?>
      </div>

      <div class="loan-no-results" id="loans-no-results" hidden>
        <i class="fas fa-filter"></i>
        <p data-i18n="no_results_title">Nenhum item encontrado</p>
        <p data-i18n="no_results_text">Nenhum empréstimo corresponde aos filtros atuais.</p>
        <button type="button" class="loan-clear-btn" id="loans-clear-filters" data-i18n="clear_filters">Limpar filtros</button>
      </div>
    </main>
  </div>

  <!-- ========== MODAL DE DETALHES ========== -->
  <div class="modal-overlay" id="loan-modal-overlay">
    <div class="modal-container" id="loan-modal">
      <button class="modal-close" id="loan-modal-close" aria-label="Fechar">
        <i class="fas fa-times"></i>
      </button>

      <div class="modal-content" id="loan-modal-content">
        <!-- Conteúdo renderizado via JS -->
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-secondary" id="loan-modal-cancel">Fechar</button>
      </div>
    </div>
  </div>

  <script>
    window.emprestimosData = <?= json_encode($emprestimos, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  </script>
</body>
</html>




<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login_user.php');
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
    WHERE n.id_aluno = ?
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
            e.status, e.renovado, c.autor, c.capa_url, c.tipo
     FROM emprestimos e
     LEFT JOIN catalogo c ON c.id_catalogo = e.id_catalogo
     WHERE e.id_aluno = ?
     ORDER BY e.data_emprestimo DESC"
);
$stmt_emprestimos->bind_param('i', $usuario_id);
$stmt_emprestimos->execute();
$emprestimos = $stmt_emprestimos->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt_emprestimos->close();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meus Empréstimos - SiGA ITJ</title>

  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <link rel="stylesheet" href="../assets/css/dashboard_aluno.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/student_unified.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/meus_emprestimos.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/ui_alerts.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/notificacoes_aluno.css?v=<?= time() ?>">
  <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>

  <script src="../assets/js/ui_alerts.js"></script>
  <script src="../assets/js/dashboard_aluno.js?v=<?= time() ?>" defer></script>
  <script src="../assets/js/notificacoes_aluno.js?v=<?= time() ?>" defer></script>
  <script src="../assets/js/meus_emprestimos.js?v=<?= time() ?>" defer></script>
</head>
<body>

  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-book-reader"></i>
        <span>SiGA ITJ</span>
      </div>
      <button class="collapse-icon" id="collapseBtn" title="Recolher menu">
        <span></span>
        <span></span>
      </button>
    </div>
    <nav class="sidebar-nav">
      <a href="dashboard_aluno.php" class="nav-item"><i class="fas fa-home"></i><span>Visão Geral</span></a>
      <a href="catalogo.php" class="nav-item"><i class="fas fa-search"></i><span>Catálogo</span></a>
      <a href="favoritos.php" class="nav-item"><i class="fas fa-heart"></i><span>Meus Favoritos</span></a>
      <a href="meus_emprestimos.php" class="nav-item active"><i class="fas fa-book"></i><span>Meus Empréstimos</span></a>
      <a href="reservas.php" class="nav-item"><i class="fas fa-clock"></i><span>Minhas Reservas</span></a>
      <a href="historico.php" class="nav-item"><i class="fas fa-history"></i><span>Histórico</span></a>
      <a href="configuracoes_aluno.php" class="nav-item"><i class="fas fa-sliders-h"></i><span>Configurações</span></a>
    </nav>
  </aside>

  <div class="main-content">
    <header class="top-header">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input type="text" id="search-input" placeholder="Buscar livros, autores, revistas..." autocomplete="off">
      </div>

      <div class="header-right">
        <div class="language-wrapper">
          <button class="language-button" aria-label="Selecionar idioma">
            <img src="../assets/Imagens/br.png" class="flag" alt="Bandeira do Brasil">
            <span>PT</span>
            <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>
          </button>
          <ul class="language-list">
            <li data-lang="pt" tabindex="0"><img src="../assets/Imagens/br.png" class="flag" alt="Português"> Português</li>
            <li data-lang="en" tabindex="0"><img src="../assets/Imagens/us.png" class="flag" alt="English"> English</li>
            <li data-lang="es" tabindex="0"><img src="../assets/Imagens/es.png" class="flag" alt="Español"> Español</li>
          </ul>
        </div>

        <div class="user-info">
          <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
          <span class="welcome">Olá, <strong id="user-name"><?= htmlspecialchars($primeiroNome) ?></strong>!</span>
        </div>

        <a href="logout_user.php" class="btn-logout" title="Sair">
          <i class="fas fa-sign-out-alt"></i>
          <span id="logout-text">Sair</span>
        </a>

        <!-- ========== NOTIFICAÇÃO (sininho) ========== -->
        <div class="notification-container">
          <button class="notification-btn" id="notification-btn" title="Notificações">
            <i class="fas fa-bell"></i>
            <?php if (count($notificacoes) > 0): ?>
              <span class="badge"><?= count($notificacoes) ?></span>
            <?php endif; ?>
          </button>
          <div class="notification-dropdown" id="notification-dropdown">
            <div class="notification-header">
              <h4><i class="fas fa-bell"></i> Notificações</h4>
            </div>
            <div class="notification-list" id="notification-list-dropdown"></div>
          </div>
        </div>
      </div>
    </header>

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
          <input type="text" id="loans-search-input" data-i18n-placeholder="search_placeholder" placeholder="Buscar nos seus empréstimos..." autocomplete="off">
        </div>

        <div class="loans-chips" role="group" aria-label="Filtrar por tipo">
          <button type="button" class="loan-chip active" data-filter="todos">
            <span data-i18n="filter_all">Todos</span>
            <span class="chip-count" data-count="todos">0</span>
          </button>
          <button type="button" class="loan-chip" data-filter="livro">
            <span data-i18n="filter_livro">Livros</span>
            <span class="chip-count" data-count="livro">0</span>
          </button>
          <button type="button" class="loan-chip" data-filter="revista">
            <span data-i18n="filter_revista">Revistas</span>
            <span class="chip-count" data-count="revista">0</span>
          </button>
          <button type="button" class="loan-chip" data-filter="tcc">
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

          <div class="loans-view-toggle">
            <button type="button" class="active" data-view="grid" data-i18n-title="view_grid" title="Ver em grade" aria-pressed="true">
              <i class="fas fa-th-large"></i>
            </button>
            <button type="button" data-view="list" data-i18n-title="view_list" title="Ver em lista" aria-pressed="false">
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="loans-grid" id="active-loans">
        <?php foreach ($emprestimos as $emprestimo):
            $status = $emprestimo['status'];
            $isActive = in_array($status, ['emprestado', 'atrasado', 'pendente'], true);
            $isHistory = in_array($status, ['devolvido', 'finalizado', 'recusado'], true);
            if (!$isActive && !$isHistory) continue;
            $tipo = $emprestimo['tipo'] ?: 'livro';
            $tipoIcon = ['livro' => 'fa-book', 'revista' => 'fa-newspaper', 'tcc' => 'fa-graduation-cap'][$tipo] ?? 'fa-book';
            $statusLabel = match ($status) {
                'emprestado' => 'Ativo', 'atrasado' => 'Atrasado', 'pendente' => 'Aguardando aprovação',
                'devolvido', 'finalizado' => 'Devolvido', 'recusado' => 'Recusado', default => 'Pendente'
            };
        ?>
        <article class="loan-card" data-status="<?= htmlspecialchars($status) ?>">
          <div class="loan-cover-wrap">
            <?php if (!empty($emprestimo['capa_url'])): ?>
              <img class="loan-cover" src="<?= htmlspecialchars($emprestimo['capa_url']) ?>" alt="<?= htmlspecialchars($emprestimo['titulo_item']) ?>">
            <?php else: ?>
              <div class="loan-cover-placeholder"><i class="fas <?= $tipoIcon ?>"></i></div>
            <?php endif; ?>
            <span class="loan-badge status-<?= htmlspecialchars($status) ?>"><?= htmlspecialchars($statusLabel) ?></span>
          </div>
          <div class="loan-body">
            <h4 class="loan-title"><?= htmlspecialchars($emprestimo['titulo_item']) ?></h4>
            <p class="loan-author"><?= htmlspecialchars($emprestimo['autor'] ?: 'Autor não informado') ?></p>
            <div class="loan-dates">
              <span><i class="far fa-calendar-alt"></i> Empréstimo: <?= date('d/m/Y', strtotime($emprestimo['data_emprestimo'])) ?></span>
              <?php if (!empty($emprestimo['data_devolucao_prevista'])): ?>
                <span><i class="far fa-calendar-check"></i> Vencimento: <?= date('d/m/Y', strtotime($emprestimo['data_devolucao_prevista'])) ?></span>
              <?php endif; ?>
            </div>
          </div>
        </article>
        <?php endforeach; ?>
      </div>
      <div class="loans-grid" id="history-loans" style="display: none;">
        <?php foreach ($emprestimos as $emprestimo):
            if (!in_array($emprestimo['status'], ['devolvido', 'finalizado', 'recusado'], true)) continue;
            $tipo = $emprestimo['tipo'] ?: 'livro';
        ?>
        <article class="loan-card" data-status="<?= htmlspecialchars($emprestimo['status']) ?>">
          <div class="loan-cover-wrap"><div class="loan-cover-placeholder"><i class="fas fa-book"></i></div><span class="loan-badge status-<?= htmlspecialchars($emprestimo['status']) ?>"><?= htmlspecialchars($emprestimo['status'] === 'recusado' ? 'Recusado' : 'Devolvido') ?></span></div>
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
    window.notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  </script>
</body>
</html>
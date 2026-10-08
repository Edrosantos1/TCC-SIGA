<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login_user.php');
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

// Busca nome do aluno
$sql_nome = "SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?";
$stmt_nome = $conn->prepare($sql_nome);
$stmt_nome->bind_param("i", $usuario_id);
$stmt_nome->execute();
$primeiroNome = 'Aluno';
if ($row = $stmt_nome->get_result()->fetch_assoc()) {
    $primeiroNome = explode(' ', trim($row['nome_aluno']))[0];
}
$stmt_nome->close();

// ========== BUSCAR FAVORITOS ==========
$sql_fav = "
    SELECT f.item_id, f.tipo_item, f.data_favorito,
           c.titulo,
           c.autor AS subtitulo,
           c.capa_url AS capa,
           c.tipo
    FROM favoritos f
    INNER JOIN catalogo c ON f.item_id = c.id_catalogo AND f.tipo_item = c.tipo
    WHERE f.usuario_id = ?
    ORDER BY f.data_favorito DESC
";
$stmt_fav = $conn->prepare($sql_fav);
$stmt_fav->bind_param("i", $usuario_id);
$stmt_fav->execute();
$result_fav = $stmt_fav->get_result();
$favoritos = $result_fav->fetch_all(MYSQLI_ASSOC);
$stmt_fav->close();

$totalFavoritos = count($favoritos);
$contagemTipos = ['livro' => 0, 'revista' => 0, 'tcc' => 0];
foreach ($favoritos as $fav) {
    if (isset($contagemTipos[$fav['tipo']])) {
        $contagemTipos[$fav['tipo']]++;
    }
}

// ========== BUSCAR NOTIFICAÇÕES ==========
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
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meus Favoritos - SiGA ITJ</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/dashboard_aluno.css">
  <link rel="stylesheet" href="../assets/css/catalogo.css">
  <link rel="stylesheet" href="../assets/css/favoritos.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/student_unified.css">
  <link rel="stylesheet" href="../assets/css/notificacoes_aluno.css">
  <link rel="stylesheet" href="../assets/css/ui_alerts.css">
  <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>

  <script src="../assets/js/ui_alerts.js"></script>
  <script src="../assets/js/dashboard_aluno.js" defer></script>
  <script src="../assets/js/notificacoes_aluno.js" defer></script>
  <script src="../assets/js/favoritos.js?v=<?= time() ?>" defer></script>
</head>
<body>

  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo"><i class="fas fa-book-reader"></i><span>SiGA ITJ</span></div>
      <button class="collapse-icon" id="collapseBtn" title="Recolher menu">
        <span></span>
        <span></span>
      </button>
    </div>
    <nav class="sidebar-nav">
      <a href="dashboard_aluno.php" class="nav-item"><i class="fas fa-home"></i><span>Visão Geral</span></a>
      <a href="catalogo.php" class="nav-item"><i class="fas fa-search"></i><span>Catálogo</span></a>
      <a href="favoritos.php" class="nav-item active"><i class="fas fa-heart"></i><span>Meus Favoritos</span></a>
      <a href="meus_emprestimos.php" class="nav-item"><i class="fas fa-book"></i><span>Meus Empréstimos</span></a>
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

    <main class="container catalog-main">
      <!-- HERO -->
      <div class="fav-hero">
        <div class="fav-hero-content">
          <h1 id="favoritos-title" data-i18n="page_title">
            <i class="fas fa-heart"></i> Meus Favoritos
          </h1>
          <p id="favoritos-subtitle" data-i18n="page_subtitle">Seus itens salvos para leitura ou reserva futura.</p>
        </div>
        <?php if ($totalFavoritos > 0): ?>
          <div class="fav-hero-stats">
            <div class="stat-pill">
              <span class="stat-pill-num" id="stat-total"><?= $totalFavoritos ?></span>
              <span class="stat-pill-label"><?= $totalFavoritos == 1 ? 'item salvo' : 'itens salvos' ?></span>
            </div>
          </div>
        <?php endif; ?>
      </div>

      <?php if ($totalFavoritos > 0): ?>
      <!-- TOOLBAR -->
      <div class="fav-toolbar" id="fav-toolbar">
        <div class="fav-search">
          <i class="fas fa-search"></i>
          <input type="text" id="fav-search-input" data-i18n-placeholder="search_placeholder" placeholder="Buscar nos seus favoritos..." autocomplete="off">
        </div>

        <div class="fav-chips" role="group" aria-label="Filtrar por tipo">
          <button type="button" class="fav-chip active" data-filter="todos">
            <i class="fas fa-layer-group"></i>
            <span class="chip-label" data-i18n="filter_all">Todos</span>
            <span class="chip-count"><?= $totalFavoritos ?></span>
          </button>
          <button type="button" class="fav-chip" data-filter="livro">
            <i class="fas fa-book"></i>
            <span class="chip-label" data-i18n="filter_livro">Livros</span>
            <span class="chip-count"><?= $contagemTipos['livro'] ?></span>
          </button>
          <button type="button" class="fav-chip" data-filter="revista">
            <i class="fas fa-newspaper"></i>
            <span class="chip-label" data-i18n="filter_revista">Revistas</span>
            <span class="chip-count"><?= $contagemTipos['revista'] ?></span>
          </button>
          <button type="button" class="fav-chip" data-filter="tcc">
            <i class="fas fa-graduation-cap"></i>
            <span class="chip-label" data-i18n="filter_tcc">TCCs</span>
            <span class="chip-count"><?= $contagemTipos['tcc'] ?></span>
          </button>
        </div>

        <div class="fav-controls-right">
          <div class="fav-sort">
            <i class="fas fa-sort"></i>
            <select id="fav-sort-select" aria-label="Ordenar favoritos">
              <option value="recentes" data-i18n="sort_recentes">Mais recentes</option>
              <option value="antigos" data-i18n="sort_antigos">Mais antigos</option>
              <option value="titulo-asc" data-i18n="sort_titulo_asc">Título A-Z</option>
              <option value="titulo-desc" data-i18n="sort_titulo_desc">Título Z-A</option>
            </select>
          </div>

          <div class="fav-view-toggle" role="group" aria-label="Modo de visualização">
            <button type="button" class="active" data-view="grid" data-i18n-title="view_grid" title="Ver em grade" aria-pressed="true">
              <i class="fas fa-th-large"></i>
            </button>
            <button type="button" data-view="list" data-i18n-title="view_list" title="Ver em lista" aria-pressed="false">
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>
      <?php endif; ?>

      <!-- GRID -->
      <div class="catalog-grid" id="favoritos-grid">
        <?php if ($totalFavoritos > 0): ?>
            <?php foreach ($favoritos as $fav):
                $tipoLabel = ['livro' => 'Livro', 'revista' => 'Revista', 'tcc' => 'TCC'][$fav['tipo']] ?? 'Item';
                $tipoIcone = ['livro' => 'fa-book', 'revista' => 'fa-newspaper', 'tcc' => 'fa-graduation-cap'][$fav['tipo']] ?? 'fa-book';
            ?>
            <article class="catalogo-card favorito-card"
                 data-id="<?= $fav['item_id'] ?>"
                 data-tipo="<?= htmlspecialchars($fav['tipo']) ?>"
                 data-titulo="<?= htmlspecialchars($fav['titulo']) ?>"
                 data-autor="<?= htmlspecialchars($fav['subtitulo'] ?? '') ?>"
                 data-data="<?= !empty($fav['data_favorito']) ? strtotime($fav['data_favorito']) : 0 ?>">

              <span class="fav-type-badge type-<?= $fav['tipo'] ?>">
                <i class="fas <?= $tipoIcone ?>"></i> <?= $tipoLabel ?>
              </span>

              <div class="card-capa">
                 <?php if(!empty($fav['capa'])): ?>
                  <img src="<?= htmlspecialchars($fav['capa']) ?>" alt="Capa de <?= htmlspecialchars($fav['titulo']) ?>" loading="lazy">
                 <?php else: ?>
                  <div class="capa-placeholder" style="background: <?= getCoverColor($fav['item_id']) ?>">
                        <i class="fas <?= $tipoIcone ?>"></i>
                        <span><?= htmlspecialchars($fav['titulo']) ?></span>
                    </div>
                 <?php endif; ?>

                  <form action="toggle_favorito.php" method="POST" class="form-remover-favorito">
                      <input type="hidden" name="item_id" value="<?= $fav['item_id'] ?>">
                      <input type="hidden" name="tipo_item" value="<?= htmlspecialchars($fav['tipo_item']) ?>">
                      <input type="hidden" name="redirect" value="favoritos.php">
                      <button type="submit"
                              class="btn-remover-favorito"
                              data-i18n-title="remove_title"
                              title="Remover dos favoritos"
                              aria-label="Remover <?= htmlspecialchars($fav['titulo']) ?> dos favoritos">
                        <i class="fas fa-heart"></i>
                      </button>
                  </form>
              </div>

              <div class="card-info">
                <h4 title="<?= htmlspecialchars($fav['titulo']) ?>"><?= htmlspecialchars($fav['titulo']) ?></h4>
                <p class="autor"><?= htmlspecialchars($fav['subtitulo'] ?? 'Autor não informado') ?></p>
                <?php if (!empty($fav['data_favorito'])): ?>
                <div class="card-added">
                  <i class="far fa-clock"></i>
                  <span><span data-i18n="added_on">Adicionado em</span> <?= date('d/m/Y', strtotime($fav['data_favorito'])) ?></span>
                </div>
                <?php endif; ?>
              </div>
            </article>
            <?php endforeach; ?>

            <div class="catalog-empty" id="favoritos-no-results" hidden>
                <i class="fas fa-filter"></i>
                <h3 data-i18n="no_results_title">Nenhum item encontrado</h3>
                <p data-i18n="no_results_text">Nenhum favorito corresponde aos filtros atuais.</p>
                <button type="button" id="fav-clear-filters" class="fav-clear-btn" data-i18n="clear_filters">
                  <i class="fas fa-undo"></i> Limpar filtros
                </button>
            </div>
        <?php else: ?>
            <div class="catalog-empty fav-empty">
                <div class="empty-illustration">
                  <i class="far fa-heart"></i>
                </div>
                <h3 data-i18n="empty_favoritos">Você ainda não tem nenhum item nos favoritos</h3>
                <p class="empty-hint">Explore o catálogo e salve livros, revistas e TCCs para encontrar depois.</p>
                <a href="catalogo.php" class="fav-clear-btn empty-cta" data-i18n="explore_catalog">
                  <i class="fas fa-compass"></i> Explorar o Catálogo
                </a>
            </div>
        <?php endif; ?>
      </div>
    </main>
  </div>

  <script>
    window.notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  </script>

  <?php
  function getCoverColor($id) {
      $colors = [
          '#0b4b9b', '#17c8cc', '#6a11cb', '#f7971e', '#e91e63',
          '#11998e', '#4568dc', '#c94b4b', '#134e5e', '#ff6b6b',
          '#4ecdc4', '#45b7d1', '#f9ca24', '#6ab04c', '#eb4d4b'
      ];
      return $colors[$id % count($colors)];
  }
  ?>
</body>
</html>
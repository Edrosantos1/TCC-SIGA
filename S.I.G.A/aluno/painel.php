<?php
require_once __DIR__ . '/../includes/config.php'; 
require_once __DIR__ . '/auth/verificar_login.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: auth/login.php');
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$primeiroNome = 'Aluno';

// Buscar nome do aluno
$sql = "SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?";
$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $nomeCompleto = trim($row['nome_aluno']);
        $partes = explode(' ', $nomeCompleto);
        $primeiroNome = $partes[0] ?: 'Aluno';
    }
    $stmt->close();
}

// ========== BUSCAR NOTIFICAÇÕES PARA O SININHO (ALUNO) ==========
$notificacoes = array();
$sql_notif = "
    SELECT 
        n.id_envio,
        n.titulo,
        n.mensagem,
        n.tipo,
        n.criado_em
    FROM notificacoes n
    WHERE n.id_aluno = ? AND COALESCE(n.lida, 0) = 0
    ORDER BY n.criado_em DESC
    LIMIT 5
";
$stmt_notif = $conn->prepare($sql_notif);
if ($stmt_notif) {
    $stmt_notif->bind_param("i", $usuario_id);
    $stmt_notif->execute();
    $res_notif = $stmt_notif->get_result();
    $notificacoes = $res_notif->fetch_all(MYSQLI_ASSOC);
    $stmt_notif->close();
}

  $emprestimosAtivos = [];
  $stmt_emprestimos = $conn->prepare(
    "SELECT e.id_emprestimo, e.titulo_item, e.data_devolucao_prevista, e.status,
            c.autor, c.tipo, c.capa_url
     FROM emprestimos e
     LEFT JOIN catalogo c ON c.id_catalogo = e.id_catalogo
     WHERE e.id_aluno = ? AND e.status IN ('emprestado', 'atrasado')
     ORDER BY CASE
       WHEN e.status = 'atrasado' OR (e.status = 'emprestado' AND e.data_devolucao_prevista < CURDATE()) THEN 0
       ELSE 1
     END, e.data_devolucao_prevista ASC, e.data_emprestimo DESC
     LIMIT 6"
  );
  if ($stmt_emprestimos) {
    $stmt_emprestimos->bind_param('i', $usuario_id);
    $stmt_emprestimos->execute();
    $emprestimosAtivos = $stmt_emprestimos->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_emprestimos->close();
  }

  $tccs = [];
  $stmt_tccs = $conn->prepare(
    "SELECT id_catalogo, titulo, autor, ano_publicacao, descricao, capa_url
     FROM catalogo
     WHERE tipo = 'tcc'
     ORDER BY ano_publicacao DESC, id_catalogo DESC
     LIMIT 12"
  );
  if ($stmt_tccs) {
    $stmt_tccs->execute();
    $tccs = $stmt_tccs->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_tccs->close();
  }
  foreach ($tccs as &$tcc) {
    if (!empty($tcc['capa_url']) && strpos($tcc['capa_url'], 'http') !== 0 && strpos($tcc['capa_url'], '/') !== 0) {
      $tcc['capa_url'] = '../' . $tcc['capa_url'];
    }
  }
  unset($tcc);

  $favoritosTcc = [];
  $stmt_favoritos = $conn->prepare("SELECT item_id FROM favoritos WHERE usuario_id = ? AND tipo_item = 'tcc'");
  if ($stmt_favoritos) {
    $stmt_favoritos->bind_param('i', $usuario_id);
    $stmt_favoritos->execute();
    foreach ($stmt_favoritos->get_result()->fetch_all(MYSQLI_ASSOC) as $favorito) {
      $favoritosTcc['tcc_' . $favorito['item_id']] = true;
    }
    $stmt_favoritos->close();
  }

  $reservasAtivas = [];
  $stmt_reservas = $conn->prepare(
    "SELECT id_reserva, id_catalogo FROM reservas WHERE id_aluno = ? AND status IN ('pendente', 'aprovada') AND id_catalogo IS NOT NULL"
  );
  if ($stmt_reservas) {
    $stmt_reservas->bind_param('i', $usuario_id);
    $stmt_reservas->execute();
    $reservasAtivas = $stmt_reservas->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt_reservas->close();
  }

  $rankingFavoritos = [];
  $result_ranking = $conn->query(
    "SELECT c.id_catalogo, c.titulo, c.autor, c.tipo, COUNT(f.id) AS total_favoritos
     FROM catalogo c
     INNER JOIN favoritos f ON f.item_id = c.id_catalogo AND f.tipo_item = c.tipo
     GROUP BY c.id_catalogo, c.titulo, c.autor, c.tipo
     ORDER BY total_favoritos DESC, c.titulo ASC
    LIMIT 3"
  );
  if ($result_ranking) {
    $rankingFavoritos = $result_ranking->fetch_all(MYSQLI_ASSOC);
  }

  $mensagemPainel = $_GET['mensagem'] ?? '';
  if ($mensagemPainel === 'Login realizado com sucesso') {
    $mensagemPainel = '';
  }
  $erroPainel = $_GET['error'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
  <title>Dashboard - SiGA ITJ</title>
  
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/aluno/painel_aluno.css">
  <link rel="stylesheet" href="../assets/css/aluno/aluno_unificado.css">
  <link rel="stylesheet" href="../assets/css/aluno/notificacoes_aluno.css">
  <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>
  <script src="../assets/js/aluno/painel_aluno.js" defer></script>
  <script src="../assets/js/aluno/notificacoes_aluno.js" defer></script>

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
    <a href="painel.php" class="nav-item active">
        <i class="fas fa-home"></i><span>Visão Geral</span>
    </a>
    <a href="catalogo.php" class="nav-item">
        <i class="fas fa-search"></i><span>Catálogo</span>
    </a>
    <a href="favoritos.php" class="nav-item">
        <i class="fas fa-heart"></i><span>Meus Favoritos</span>
    </a>
    <a href="emprestimos.php" class="nav-item">
        <i class="fas fa-book"></i><span>Meus Empréstimos</span>
    </a>
    <a href="reservas.php" class="nav-item">
        <i class="fas fa-clock"></i><span>Minhas Reservas</span>
    </a>
    <a href="historico.php" class="nav-item">
        <i class="fas fa-history"></i><span>Histórico</span>
    </a>
    <a href="configuracoes.php" class="nav-item">
      <i class="fas fa-sliders-h"></i><span>Configurações</span>
    </a>
</nav>
  </aside>

  <div class="main-content">

    <?php require __DIR__ . '/../includes/aluno_top_header.php'; ?>

    <main class="dashboard-main">
      <?php if ($mensagemPainel !== '' || $erroPainel !== ''): ?>
        <p class="painel-feedback <?= $erroPainel !== '' ? 'erro' : 'sucesso' ?>" role="status">
          <?= htmlspecialchars($erroPainel !== '' ? $erroPainel : $mensagemPainel, ENT_QUOTES, 'UTF-8') ?>
        </p>
      <?php endif; ?>

      <section class="loans-dashboard-section" aria-labelledby="emprestimos-ativos-title">
        <div class="section-header">
          <h2 id="emprestimos-ativos-title"><i class="fas fa-book-reader"></i> <span data-i18n="loans_active_title">Meus Empréstimos Ativos</span></h2>
          <a href="emprestimos.php" class="ver-tudo-link"><span data-i18n="view_loans">Ver empréstimos</span> <i class="fas fa-arrow-right"></i></a>
        </div>
        <?php if (!empty($emprestimosAtivos)): ?>
          <div class="emprestimos-ativos-lista">
            <?php foreach ($emprestimosAtivos as $emprestimoAtivo): ?>
              <?php
                $statusAtivo = $emprestimoAtivo['status'];
                if ($statusAtivo === 'emprestado' && !empty($emprestimoAtivo['data_devolucao_prevista']) && $emprestimoAtivo['data_devolucao_prevista'] < date('Y-m-d')) {
                    $statusAtivo = 'atrasado';
                }
                $iconeAtivo = ['livro' => 'fa-book', 'revista' => 'fa-newspaper', 'tcc' => 'fa-graduation-cap'][$emprestimoAtivo['tipo'] ?? 'livro'] ?? 'fa-book';
                $capaAtiva = $emprestimoAtivo['capa_url'] ?? '';
                if ($capaAtiva !== '' && strpos($capaAtiva, 'http') !== 0 && strpos($capaAtiva, '/') !== 0) $capaAtiva = '../' . $capaAtiva;
              ?>
              <article class="emprestimo-ativo-item">
                <div class="emprestimo-ativo-capa">
                  <?php if ($capaAtiva !== ''): ?>
                    <img src="<?= htmlspecialchars($capaAtiva, ENT_QUOTES, 'UTF-8') ?>" alt="">
                  <?php else: ?>
                    <i class="fas <?= $iconeAtivo ?>" aria-hidden="true"></i>
                  <?php endif; ?>
                </div>
                <div class="emprestimo-ativo-info">
                  <span class="emprestimo-ativo-status status-<?= htmlspecialchars($statusAtivo, ENT_QUOTES, 'UTF-8') ?>">
                    <?= $statusAtivo === 'atrasado' ? 'Atrasado' : 'Em andamento' ?>
                  </span>
                  <h3><?= htmlspecialchars($emprestimoAtivo['titulo_item'], ENT_QUOTES, 'UTF-8') ?></h3>
                  <p><?= htmlspecialchars($emprestimoAtivo['autor'] ?: 'Autor não informado', ENT_QUOTES, 'UTF-8') ?></p>
                  <?php if (!empty($emprestimoAtivo['data_devolucao_prevista'])): ?>
                    <small><span data-i18n="return_expected">Devolução prevista:</span> <?= date('d/m/Y', strtotime($emprestimoAtivo['data_devolucao_prevista'])) ?></small>
                  <?php endif; ?>
                </div>
              </article>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <p class="painel-vazio" data-i18n="no_active_loans">Você não tem empréstimos ativos no momento.</p>
        <?php endif; ?>
      </section>

      <section class="card-section tcc-section" aria-labelledby="tcc-section-title">
        <div class="section-header">
          <h2 id="tcc-section-title"><i class="fas fa-graduation-cap"></i> Trabalhos de Conclusão de Curso</h2>
          <a href="catalogo.php?tipo=tcc" class="ver-tudo-link"><span data-i18n="tcc_view_all">Ver todos</span> <i class="fas fa-arrow-right"></i></a>
        </div>
        <p id="tcc-section-subtitle" class="tcc-subtitle">Conheça os projetos de outras turmas e inspire-se.</p>
        <?php if (!empty($tccs)): ?>
          <div class="tcc-carousel">
            <button class="tcc-nav-btn" id="tcc-prev" type="button" aria-label="TCCs anteriores" data-i18n-aria="tcc_prev"><i class="fas fa-chevron-left"></i></button>
            <div class="tcc-track-container"><div class="tcc-track" id="tcc-track"></div></div>
            <button class="tcc-nav-btn" id="tcc-next" type="button" aria-label="Próximos TCCs" data-i18n-aria="tcc_next"><i class="fas fa-chevron-right"></i></button>
          </div>
        <?php else: ?>
          <p class="painel-vazio" data-i18n="tcc_empty">Ainda não há TCCs cadastrados no catálogo.</p>
        <?php endif; ?>
      </section>

      <section class="ranking-container" aria-labelledby="ranking-title">
        <div class="section-header">
          <h2 id="ranking-title"><i class="fas fa-trophy"></i> <span data-i18n="ranking_title">Acervos em destaque</span></h2>
          <a href="favoritos.php" class="ver-tudo-link"><span data-i18n="ranking_link">Meus favoritos</span> <i class="fas fa-arrow-right"></i></a>
        </div>
        <?php if (!empty($rankingFavoritos)): ?>
          <ol class="ranking-podium">
            <?php foreach ($rankingFavoritos as $indice => $item): ?>
              <?php $posicaoPodio = ['primeiro', 'segundo', 'terceiro'][$indice] ?? 'terceiro'; ?>
              <li class="ranking-podium-item podium-<?= $posicaoPodio ?>">
                <a class="podium-material" href="catalogo.php" data-catalogo-visualizar="<?= (int) $item['id_catalogo'] ?>">
                  <span class="podium-medal" data-pos="<?= $indice + 1 ?>" aria-label="<?= $indice + 1 ?>º lugar"><i class="fas fa-medal" aria-hidden="true"></i><b><?= $indice + 1 ?></b></span>
                  <strong class="podium-title" title="<?= htmlspecialchars($item['titulo'], ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($item['titulo'], ENT_QUOTES, 'UTF-8') ?></strong>
                  <span class="podium-author"><?= htmlspecialchars($item['autor'] ?: 'Autor não informado', ENT_QUOTES, 'UTF-8') ?></span>
                  <span class="podium-type"><?= htmlspecialchars(ucfirst($item['tipo']), ENT_QUOTES, 'UTF-8') ?></span>
                  <span class="podium-favorites"><i class="fas fa-heart" aria-hidden="true"></i> <?= (int) $item['total_favoritos'] ?> <span data-i18n="favorites_word">favoritos</span></span>
                </a>
                <div class="podium-platform" aria-hidden="true"><span><?= $indice + 1 ?></span></div>
              </li>
            <?php endforeach; ?>
          </ol>
        <?php else: ?>
          <p class="ranking-empty" data-i18n="ranking_empty">O ranking aparece assim que os materiais receberem favoritos.</p>
        <?php endif; ?>
      </section>

      <div class="tcc-modal-overlay" id="tcc-modal-overlay" aria-hidden="true">
        <section class="tcc-modal" role="dialog" aria-modal="true" aria-labelledby="tcc-modal-title">
          <button class="tcc-modal-close" id="tcc-modal-close" type="button" aria-label="Fechar detalhes" data-i18n-aria="tcc_close"><i class="fas fa-times"></i></button>
          <div class="tcc-modal-body">
              <div class="tcc-modal-cover-wrap"><img id="tcc-modal-cover" src="" alt=""></div>
            <div class="tcc-modal-info">
              <span class="tcc-modal-badge"><i class="fas fa-graduation-cap"></i> TCC</span>
              <h3 id="tcc-modal-title"></h3>
              <p class="tcc-modal-meta"><span id="tcc-modal-year"></span> · <span id="tcc-modal-area"></span></p>
              <h4 id="tcc-theme-label">Tema</h4>
              <p id="tcc-modal-theme"></p>
              <h4 id="tcc-members-label">Integrantes</h4>
              <ul id="tcc-modal-members"></ul>
              <div class="tcc-modal-actions">
                <form method="post" action="alternar_favorito.php">
                  <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
                  <input type="hidden" name="item_id" id="tcc-modal-item-id" value="">
                  <input type="hidden" name="tipo_item" value="tcc">
                  <input type="hidden" name="redirect" value="../aluno/painel.php">
                  <button id="tcc-favorite-btn" type="submit"><i id="tcc-favorite-icon" class="far fa-heart"></i><span id="tcc-favorite-text">Favoritar</span></button>
                </form>
                <form method="post" action="../api/aluno_reservas.php">
                  <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
                  <input type="hidden" name="id_catalogo" id="tcc-reserva-item-id" value="">
                  <input type="hidden" name="action" value="">
                  <input type="hidden" name="tipo" value="tcc">
                  <input type="hidden" name="redirect" value="../aluno/painel.php">
                  <button id="tcc-reserve-btn" type="submit"><i class="far fa-bookmark"></i><span id="tcc-reserve-text">Reservar</span></button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

  </div>

  <script>
    window.tccsData = <?= json_encode($tccs, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    window.favoritosPHP = <?= json_encode($favoritosTcc, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    window.reservasData = <?= json_encode($reservasAtivas, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  </script>
</body>
</html>





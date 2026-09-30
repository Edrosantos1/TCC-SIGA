<?php
require_once __DIR__ . '/../includes/config.php'; 
require_once __DIR__ . '/verificar_login.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login_user.php');
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

// 1. Busca todos os itens que ESTE aluno favoritou
$sql_meus_favs = "SELECT item_id, tipo_item FROM favoritos WHERE usuario_id = ?";
$stmt_favs = $conn->prepare($sql_meus_favs);
$stmt_favs->bind_param("i", $usuario_id);
$stmt_favs->execute();
$res_favs = $stmt_favs->get_result();
$meus_favoritos = [];
while ($f = $res_favs->fetch_assoc()) {
    $chave = $f['tipo_item'] . '_' . $f['item_id'];
    $meus_favoritos[$chave] = true;
}
$stmt_favs->close();

// 2. Destaques definidos pelo admin; se ainda não houver, usa os mais favoritados.
$sql_ranking = "
    SELECT c.id_catalogo AS item_id, c.tipo AS tipo_item, COUNT(f.id) as total_favs,
      c.titulo, c.autor AS subtitulo, c.capa_url, c.destaque
    FROM catalogo c
    LEFT JOIN favoritos f ON f.item_id = c.id_catalogo AND f.tipo_item = c.tipo
    GROUP BY c.id_catalogo, c.tipo, c.titulo, c.autor, c.capa_url, c.destaque
    HAVING COUNT(f.id) > 0
    ORDER BY c.destaque DESC, total_favs DESC, c.titulo ASC
    LIMIT 5
";
$res_ranking = $conn->query($sql_ranking);
$ranking_itens = [];
if ($res_ranking) {
    $ranking_itens = $res_ranking->fetch_all(MYSQLI_ASSOC);
}

// 3. Buscar empréstimos ativos para a seção "Meus Empréstimos Ativos"
$emprestimos_ativos = [];
$sql_emprestimo = "
    SELECT e.id_emprestimo, e.titulo_item, e.data_emprestimo, e.data_devolucao_prevista,
      e.status, c.autor, c.capa_url, c.tipo
    FROM emprestimos e
    LEFT JOIN catalogo c ON e.id_catalogo = c.id_catalogo
    WHERE e.id_aluno = ? AND e.status <> 'devolvido' AND (e.status IN ('emprestado', 'atrasado') OR e.status = 'pendente'
      OR (e.data_devolucao_prevista IS NOT NULL AND e.data_devolucao_prevista >= CURDATE()))
    ORDER BY e.data_emprestimo DESC
    LIMIT 5
";
$stmt_emp = $conn->prepare($sql_emprestimo);
$stmt_emp->bind_param("i", $usuario_id);
$stmt_emp->execute();
$res_emp = $stmt_emp->get_result();
$emprestimos_ativos = $res_emp->fetch_all(MYSQLI_ASSOC);
$stmt_emp->close();

// 4. Buscar TCCs (tipo = 'tcc') para o carrossel
$sql_tccs = "SELECT id_catalogo, titulo, autor, ano_publicacao, capa_url, descricao FROM catalogo WHERE tipo = 'tcc' ORDER BY titulo LIMIT 20";
$res_tccs = $conn->query($sql_tccs);
$tccs = [];
if ($res_tccs) {
    $tccs = $res_tccs->fetch_all(MYSQLI_ASSOC);
}

// 5. ========== BUSCAR NOTIFICAÇÕES PARA O SININHO (ALUNO) ==========
$notificacoes = array();
$sql_notif = "
    SELECT 
        n.id_envio,
        n.titulo,
        n.mensagem,
        n.tipo,
        n.criado_em
    FROM notificacoes n
    WHERE n.id_aluno = ?
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
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - SiGA ITJ</title>
  
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/dashboard_aluno.css">
  <link rel="stylesheet" href="../assets/css/student_unified.css">
  <link rel="stylesheet" href="../assets/css/notificacoes_aluno.css">
  <script src="../assets/js/dashboard_aluno.js" defer></script>
  <script src="../assets/js/notificacoes_aluno.js" defer></script>

  <style>
    .card-section {
      background: #ffffff;
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      margin-bottom: 32px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .section-header h2 {
      font-size: 17px;
      font-weight: 600;
      color: #0b4b9b;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-header h2 i {
      color: #e67e22;
    }
    .ver-tudo-link {
      font-size: 13px;
      color: #e67e22;
      text-decoration: none;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: gap 0.2s;
    }
    .ver-tudo-link:hover {
      gap: 8px;
    }
    .ranking-container {
      background: #ffffff;
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      margin-top: 0.5rem;
    }
    .tcc-section .card-section {
      margin-bottom: 0;
    }
  </style>
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
    <a href="dashboard_aluno.php" class="nav-item active">
        <i class="fas fa-home"></i><span>Visão Geral</span>
    </a>
    <a href="catalogo.php" class="nav-item">
        <i class="fas fa-search"></i><span>Catálogo</span>
    </a>
    <a href="favoritos.php" class="nav-item">
        <i class="fas fa-heart"></i><span>Meus Favoritos</span>
    </a>
    <a href="meus_emprestimos.php" class="nav-item">
        <i class="fas fa-book"></i><span>Meus Empréstimos</span>
    </a>
    <a href="reservas.php" class="nav-item">
        <i class="fas fa-clock"></i><span>Minhas Reservas</span>
    </a>
    <a href="historico.php" class="nav-item">
        <i class="fas fa-history"></i><span>Histórico</span>
    </a>
    <a href="configuracoes_aluno.php" class="nav-item">
      <i class="fas fa-sliders-h"></i><span>Configurações</span>
    </a>
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

        <!-- ========== NOTIFICAÇÃO (sininho) - IGUAL AO ADMIN ========== -->
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

      </div>
    </header>

    <main class="container dashboard-main">

      <!-- SEÇÃO: Empréstimos ativos -->
      <section class="last-viewed card-section">
        <div class="section-header">
          <h2><i class="fas fa-book"></i> Meus Empréstimos Ativos</h2>
          <a href="meus_emprestimos.php" class="ver-tudo-link">Ver todos <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="last-viewed-wrapper">

          <?php if ($emprestimos_ativos): ?>
            <?php foreach ($emprestimos_ativos as $emprestimo): ?>
              <a href="meus_emprestimos.php" class="continue-card">
                <img class="book-cover" src="<?= !empty($emprestimo['capa_url']) ? htmlspecialchars($emprestimo['capa_url']) : '../assets/Imagens/capa-exemplo.jpg' ?>" alt="Capa do item emprestado">
                <div class="continue-info">
                  <span class="item-type-badge"><i class="fas fa-book"></i> <?= htmlspecialchars(ucfirst($emprestimo['tipo'] ?? 'material')) ?></span>
                  <h3><?= htmlspecialchars($emprestimo['titulo_item']) ?></h3>
                  <p class="author"><?= htmlspecialchars($emprestimo['autor'] ?? 'Autor não informado') ?></p>
                  <p class="progress-text">Empréstimo ativo • Devolução prevista: <?= $emprestimo['data_devolucao_prevista'] ? date('d/m/Y', strtotime($emprestimo['data_devolucao_prevista'])) : 'Não informada' ?></p>
                  <span class="btn-continue">Ver detalhes →</span>
                </div>
              </a>
            <?php endforeach; ?>
          <?php else: ?>
            <div class="continue-card empty">
              <div class="continue-info">
                <span class="item-type-badge"><i class="fas fa-info-circle"></i> Nenhum empréstimo ativo</span>
                <p>Você não possui empréstimos ativos no momento.</p>
                <a href="catalogo.php" class="btn-continue" style="display: inline-block; margin-top: 10px;">Explorar catálogo</a>
              </div>
            </div>
          <?php endif; ?>

        </div>
      </section>

      <!-- SEÇÃO: Ranking (card) -->
      <section class="card-section">
        <div class="section-header">
          <h2><i class="fas fa-trophy"></i> Acervos em Destaque</h2>
        </div>
        <div class="ranking-container">
          <?php if (!empty($ranking_itens)): ?>
            <ul class="ranking-list">
              <?php foreach ($ranking_itens as $index => $item): ?>
                <?php 
                  $posicao = $index + 1;
                  if ($posicao === 1) $medalha = '🥇';
                  elseif ($posicao === 2) $medalha = '🥈';
                  elseif ($posicao === 3) $medalha = '🥉';
                  else $medalha = "<strong>{$posicao}º</strong>";
                ?>
                <li class="ranking-item">
                  <span class="ranking-medal"><?= $medalha ?></span>
                  <div class="ranking-info">
                    <span class="ranking-title"><?= htmlspecialchars($item['titulo'] ?? 'Sem título') ?></span>
                    <span class="ranking-sub">
                      <?= htmlspecialchars($item['subtitulo'] ?? '') ?> • 
                      <small><?= ucfirst(htmlspecialchars($item['tipo_item'])) ?></small>
                    </span>
                  </div>
                  <div class="ranking-count">
                    <i class="fas fa-heart"></i> <?= $item['total_favs'] ?> <?= $item['total_favs'] == 1 ? 'favorito' : 'favoritos' ?>
                  </div>
                </li>
              <?php endforeach; ?>
            </ul>
          <?php else: ?>
            <p class="ranking-empty">Nenhum item favoritado ainda. Explore o catálogo e favorite seus livros!</p>
          <?php endif; ?>
        </div>
      </section>

      <!-- SEÇÃO: TCCs (card) -->
      <section class="tcc-section card-section">
        <div class="section-header">
          <h2 id="tcc-section-title"><i class="fas fa-graduation-cap"></i> Trabalhos de Conclusão de Curso</h2>
        </div>
        <p class="tcc-subtitle" id="tcc-section-subtitle">Explore os TCCs da nossa escola e inspire-se para o seu projeto</p>

        <div class="tcc-carousel">
          <button class="tcc-nav-btn" id="tcc-prev" aria-label="TCC anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="tcc-track-container">
            <div class="tcc-track" id="tcc-track">
              <?php foreach ($tccs as $tcc): ?>
                <div class="tcc-cover-card" data-id="<?= $tcc['id_catalogo'] ?>">
                  <div class="tcc-cover">
                    <?php if (!empty($tcc['capa_url'])): ?>
                      <img src="<?= htmlspecialchars($tcc['capa_url']) ?>" alt="Capa do TCC">
                    <?php else: ?>
                      <div class="tcc-cover-placeholder"><i class="fas fa-graduation-cap"></i><span><?= htmlspecialchars($tcc['titulo']) ?></span></div>
                    <?php endif; ?>
                  </div>
                  <div class="tcc-cover-year"><?= $tcc['ano_publicacao'] ?: 'Ano não informado' ?></div>
                </div>
              <?php endforeach; ?>
              <?php if (empty($tccs)): ?>
                <div class="tcc-cover-card empty">
                  <p>Nenhum TCC cadastrado ainda.</p>
                </div>
              <?php endif; ?>
            </div>
          </div>
          <button class="tcc-nav-btn" id="tcc-next" aria-label="Próximo TCC">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </section>

    </main>
  </div>

  <!-- Modal de detalhes do TCC -->
  <div class="tcc-modal-overlay" id="tcc-modal-overlay">
    <div class="tcc-modal" role="dialog" aria-modal="true">
      <button class="tcc-modal-close" id="tcc-modal-close" aria-label="Fechar">
        <i class="fas fa-times"></i>
      </button>
      <div class="tcc-modal-body">
        <div class="tcc-modal-cover-wrap">
          <img id="tcc-modal-cover" src="" alt="">
        </div>
        <div class="tcc-modal-info">
          <span class="tcc-modal-badge">
            <i class="fas fa-graduation-cap"></i>
            <span id="tcc-modal-badge-text">TCC</span>
          </span>
          <h3 id="tcc-modal-title"></h3>
          <div class="tcc-modal-meta">
            <span id="tcc-modal-year"></span> · <span id="tcc-modal-area"></span>
          </div>

          <h4 id="tcc-theme-label">Tema</h4>
          <p id="tcc-modal-theme"></p>

          <h4 id="tcc-members-label">Integrantes</h4>
          <ul id="tcc-modal-members"></ul>

          <div class="tcc-modal-actions">
            <form action="toggle_favorito.php" method="POST" id="form-tcc-favorito" style="display:inline-block;">
              <input type="hidden" name="item_id" id="tcc-modal-item-id" value="">
              <input type="hidden" name="tipo_item" value="tcc">
              <input type="hidden" name="redirect" value="dashboard_aluno.php">
              <button type="submit" id="tcc-favorite-btn">
                <i class="far fa-heart" id="tcc-favorite-icon"></i>
                <span id="tcc-favorite-text">Favoritar</span>
              </button>
            </form>

            <button id="tcc-reserve-btn">
              <i class="fas fa-bookmark"></i>
              <span id="tcc-reserve-text">Reservar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.favoritosPHP = <?= json_encode($meus_favoritos) ?>;
    window.tccsData = <?= json_encode($tccs) ?>;
    window.notificacoesData = <?= json_encode($notificacoes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  </script>
</body>
</html>
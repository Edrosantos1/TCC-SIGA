<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/auth/verificar_login.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: auth/login.php');
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

$historico = [];
$stmt_historico = $conn->prepare(
    "SELECT e.id_emprestimo AS id, 'loan' AS tipo, e.id_catalogo, e.titulo_item AS titulo,
            c.autor, c.ano_publicacao AS ano, c.capa_url, DATE(e.data_emprestimo) AS data,
            CASE
                WHEN e.status = 'emprestado' AND e.data_devolucao_prevista < CURDATE() THEN 'overdue'
                WHEN e.status = 'emprestado' THEN 'active'
                WHEN e.status = 'atrasado' THEN 'overdue'
                WHEN e.status = 'devolvido' THEN 'returned'
                ELSE 'pending'
            END AS status,
            e.data_devolucao_prevista AS data_devolucao, NULL AS data_retirada
     FROM emprestimos e LEFT JOIN catalogo c ON c.id_catalogo = e.id_catalogo
     WHERE e.id_aluno = ?
     UNION ALL
     SELECT r.id_reserva AS id, 'reservation' AS tipo, r.id_catalogo, r.titulo_item AS titulo,
            c.autor, c.ano_publicacao AS ano, c.capa_url, DATE(r.data_reserva) AS data,
            r.status, NULL AS data_devolucao, r.data_reserva AS data_retirada
     FROM reservas r LEFT JOIN catalogo c ON c.id_catalogo = r.id_catalogo
     WHERE r.id_aluno = ?
     ORDER BY data DESC, id DESC"
);
$stmt_historico->bind_param('ii', $usuario_id, $usuario_id);
$stmt_historico->execute();
$historico = $stmt_historico->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt_historico->close();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Histórico - SiGA ITJ</title>

  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/aluno/painel_aluno.css">
  <link rel="stylesheet" href="../assets/css/aluno/historico.css">
  <link rel="stylesheet" href="../assets/css/aluno/aluno_unificado.css">
  <link rel="stylesheet" href="../assets/css/aluno/notificacoes_aluno.css">
  <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>

  <script src="../assets/js/aluno/painel_aluno.js" defer></script>
  <script src="../assets/js/aluno/notificacoes_aluno.js" defer></script>
  <script src="../assets/js/aluno/historico.js" defer></script>
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
      <a href="painel.php" class="nav-item"><i class="fas fa-home"></i><span>Visão Geral</span></a>
      <a href="catalogo.php" class="nav-item"><i class="fas fa-search"></i><span>Catálogo</span></a>
      <a href="favoritos.php" class="nav-item"><i class="fas fa-heart"></i><span>Meus Favoritos</span></a>
      <a href="emprestimos.php" class="nav-item"><i class="fas fa-book"></i><span>Meus Empréstimos</span></a>
      <a href="reservas.php" class="nav-item"><i class="fas fa-clock"></i><span>Minhas Reservas</span></a>
      <a href="historico.php" class="nav-item active"><i class="fas fa-history"></i><span>Histórico</span></a>
      <a href="configuracoes.php" class="nav-item"><i class="fas fa-sliders-h"></i><span>Configurações</span></a>
    </nav>
  </aside>

  <div class="main-content">
    <?php require __DIR__ . '/../includes/aluno_top_header.php'; ?>

    <main class="container historico-main">
      <div class="historico-header">
        <h1 id="historico-title">Histórico</h1>
        <p id="historico-subtitle">Consulte todo o histórico de empréstimos e reservas</p>
      </div>

      <div class="historico-filters">
        <div class="filter-group">
          <label for="filter-type" id="filter-type-label">Tipo</label>
          <select id="filter-type">
            <option value="all" id="filter-type-all">Todos</option>
            <option value="loan" id="filter-type-loans">Empréstimos</option>
            <option value="reservation" id="filter-type-reservations">Reservas</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-period" id="filter-period-label">Período</label>
          <select id="filter-period">
            <option value="30" id="filter-period-30">Últimos 30 dias</option>
            <option value="90" id="filter-period-90">Últimos 90 dias</option>
            <option value="180" id="filter-period-180">Últimos 180 dias</option>
            <option value="365" id="filter-period-365">Último ano</option>
            <option value="all" id="filter-period-all">Todo o histórico</option>
          </select>
        </div>

        <div class="filter-group search-filter">
          <input type="text" id="filter-search" placeholder="Buscar no histórico...">
          <button id="filter-search-btn"><i class="fas fa-search"></i></button>
        </div>
      </div>

      <div class="historico-list" id="historico-list"></div>

      <div class="historico-empty" id="historico-empty" style="display: none;">
        <i class="fas fa-history"></i>
        <p id="empty-message">Nenhum registro encontrado no histórico.</p>
      </div>

      <div class="historico-load-more" id="historico-load-more">
        <button id="load-more-btn">Carregar mais</button>
      </div>
    </main>
  </div>

  <div class="modal-overlay" id="historico-modal-overlay">
    <div class="modal-container" id="historico-modal">
      <button class="modal-close" id="historico-modal-close"><i class="fas fa-times"></i></button>
      <div class="modal-content">
        <div class="modal-cover">
          <img id="modal-cover-img" src="" alt="Capa">
          <div class="modal-cover-placeholder" id="modal-cover-placeholder" style="display: none;">
            <i class="fas fa-book"></i>
            <span>Título</span>
          </div>
        </div>
        <div class="modal-info">
          <h2 id="modal-title">Título</h2>
          <p id="modal-author">Autor</p>
          <p id="modal-year">Ano</p>
          <p id="modal-type">Tipo</p>
          <p id="modal-date">Data</p>
          <p id="modal-status" class="status-badge">Status</p>
          <p id="modal-extra" class="extra-info"></p>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.historicoData = <?= json_encode($historico, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  </script>
</body>
</html>












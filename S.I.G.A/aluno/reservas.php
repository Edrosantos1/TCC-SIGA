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

$reservas = [];
$stmt_reservas = $conn->prepare(
    "SELECT r.id_reserva, r.id_catalogo, r.titulo_item, r.data_reserva, r.data_limite, r.status,
            c.autor, c.capa_url, c.tipo
     FROM reservas r
     LEFT JOIN catalogo c ON c.id_catalogo = r.id_catalogo
     WHERE r.id_aluno = ?
     ORDER BY r.data_reserva DESC"
);
$stmt_reservas->bind_param('i', $usuario_id);
$stmt_reservas->execute();
$reservas = $stmt_reservas->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt_reservas->close();

$reservasAtivas    = array_filter($reservas, fn($r) => in_array($r['status'], ['pendente', 'aprovada'], true));
$reservasHistorico = array_filter($reservas, fn($r) => in_array($r['status'], ['rejeitada', 'expirada', 'cancelada', 'retirada'], true));
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
  <title>Minhas Reservas - SiGA ITJ</title>

  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/aluno/painel_aluno.css">
  <link rel="stylesheet" href="../assets/css/aluno/aluno_unificado.css">
  <link rel="stylesheet" href="../assets/css/aluno/reservas.css?v=<?= time() ?>">
  <link rel="stylesheet" href="../assets/css/aluno/notificacoes_aluno.css">
  <link rel="stylesheet" href="../assets/css/shared/alertas_ui.css">
  <?php include __DIR__ . '/../includes/aluno_preferencias_head.php'; ?>

  <script src="../assets/js/shared/alertas_ui.js"></script>
  <script src="../assets/js/aluno/painel_aluno.js" defer></script>
  <script src="../assets/js/aluno/notificacoes_aluno.js" defer></script>
  <script src="../assets/js/aluno/reservas.js?v=<?= time() ?>" defer></script>
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
      <a href="reservas.php" class="nav-item active"><i class="fas fa-clock"></i><span>Minhas Reservas</span></a>
      <a href="historico.php" class="nav-item"><i class="fas fa-history"></i><span>Histórico</span></a>
      <a href="configuracoes.php" class="nav-item"><i class="fas fa-sliders-h"></i><span>Configurações</span></a>
    </nav>
  </aside>

  <div class="main-content">
    <?php require __DIR__ . '/../includes/aluno_top_header.php'; ?>

    <form id="cancel-reserva-form" method="POST" action="../api/aluno_reservas.php" class="hidden-form">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
      <input type="hidden" name="action" value="cancel">
      <input type="hidden" name="id" id="cancel-reserva-id" value="">
      <input type="hidden" name="redirect" value="../aluno/reservas.php">
    </form>

    <main class="container reservas-main">
      <div class="reservas-header">
        <h1 id="reservas-title">Minhas Reservas</h1>
        <p id="reservas-subtitle">Acompanhe suas reservas ativas e histórico</p>
      </div>

      <div class="reservas-toolbar">
        <div class="reservas-tabs" role="tablist" aria-label="Reservas" data-i18n-aria="reservations_tabs">
          <button class="tab-btn active" data-tab="active" id="tab-active" role="tab" aria-selected="true" aria-controls="reservas-active-list">
            <i class="fas fa-hourglass-half"></i>
            <span id="tab-active-label">Ativas</span>
            <span class="tab-badge" id="active-count"><?= count($reservasAtivas) ?></span>
          </button>
          <button class="tab-btn" data-tab="history" id="tab-history" role="tab" aria-selected="false" tabindex="-1" aria-controls="reservas-history-list">
            <i class="fas fa-history"></i>
            <span id="tab-history-label">Histórico</span>
            <span class="tab-badge" id="history-count"><?= count($reservasHistorico) ?></span>
          </button>
        </div>

        <div class="view-toggle" id="view-toggle" role="group" aria-label="Modo de visualização" data-i18n-aria="view_label">
          <button type="button" class="view-btn" data-view="grid" id="view-grid-btn" aria-pressed="true" title="Ver em grade" data-i18n-title="view_grid_title">
            <i class="fas fa-th-large"></i><span id="view-grid-label">Grade</span>
          </button>
          <button type="button" class="view-btn" data-view="list" id="view-list-btn" aria-pressed="false" title="Ver em lista" data-i18n-title="view_list_title">
            <i class="fas fa-list"></i><span id="view-list-label">Lista</span>
          </button>
        </div>
      </div>

      <div class="reservas-list" id="reservas-active-list" data-view="grid" role="tabpanel" aria-labelledby="tab-active">
      </div>
      <div class="reservas-list" id="reservas-history-list" data-view="grid" role="tabpanel" aria-labelledby="tab-history" style="display: none;">
      </div>
      <script>
        (function () {
          var v = 'grid';
          try { if (localStorage.getItem('reservas_view') === 'list') v = 'list'; } catch (e) {}
          document.getElementById('reservas-active-list').dataset.view = v;
          document.getElementById('reservas-history-list').dataset.view = v;
        })();
      </script>

      <div class="reservas-empty" id="reservas-empty" style="display: none;">
        <i class="fas fa-clock"></i>
        <p id="empty-message">Nenhuma reserva encontrada</p>
        <a href="catalogo.php" class="btn-explore" id="empty-cta"><i class="fas fa-search"></i> <span id="empty-cta-label">Explorar catálogo</span></a>
      </div>
    </main>
  </div>

  <script>
    window.reservasData = <?= json_encode($reservas, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  </script>
</body>
</html>







<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$id_aluno = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id_aluno <= 0) {
    header('Location: dashboard_adm.php');
    exit;
}

$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';

$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    header('Location: dashboard_adm.php');
    exit;
}

// ========== BUSCAR NOME DO ALUNO PELO ID ==========
$nome_aluno = 'Aluno';
if ($db instanceof mysqli) {
    $stmt = $db->prepare("SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?");
    $stmt->bind_param('i', $id_aluno);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $nome_aluno = $row['nome_aluno'];
    }
    $stmt->close();
} elseif ($db instanceof PDO) {
    $stmt = $db->prepare("SELECT nome_aluno FROM login_aluno WHERE id_aluno = ?");
    $stmt->execute([$id_aluno]);
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $nome_aluno = $row['nome_aluno'];
    }
}

// Buscar reservas do aluno
$reservas = [];
$sql_reservas = "SELECT id_reserva AS id, titulo_item AS material, data_reserva, data_limite, status 
                 FROM reservas 
                 WHERE id_aluno = ? 
                 ORDER BY data_reserva DESC";
if ($db instanceof mysqli) {
    $stmt = $db->prepare($sql_reservas);
    $stmt->bind_param('i', $id_aluno);
    $stmt->execute();
    $result = $stmt->get_result();
    $reservas = $result->fetch_all(MYSQLI_ASSOC);
} elseif ($db instanceof PDO) {
    $stmt = $db->prepare($sql_reservas);
    $stmt->execute([$id_aluno]);
    $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Buscar empréstimos do aluno
$emprestimos = [];
$sql_emprestimos = "SELECT id_emprestimo AS id, titulo_item AS material, data_emprestimo, data_devolucao_prevista, status 
                    FROM emprestimos 
                    WHERE id_aluno = ? 
                    ORDER BY data_emprestimo DESC";
if ($db instanceof mysqli) {
    $stmt = $db->prepare($sql_emprestimos);
    $stmt->bind_param('i', $id_aluno);
    $stmt->execute();
    $result = $stmt->get_result();
    $emprestimos = $result->fetch_all(MYSQLI_ASSOC);
} elseif ($db instanceof PDO) {
    $stmt = $db->prepare($sql_emprestimos);
    $stmt->execute([$id_aluno]);
    $emprestimos = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil do Aluno — SiGA ITJ</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/perfil_aluno.css?v=<?= time() ?>">
</head>
<body>
    <div class="main-content">
        <a href="dashboard_adm.php" class="btn-voltar">
            <i class="fas fa-arrow-left"></i> Voltar ao Dashboard
        </a>

        <div class="perfil-header">
            <div class="perfil-avatar-grande">
                <?= strtoupper(substr($nome_aluno, 0, 1)) ?>
            </div>
            <div class="perfil-info">
                <h1><?= htmlspecialchars($nome_aluno) ?></h1>
                <p><i class="fas fa-id-card"></i> ID: #<?= $id_aluno ?></p>
            </div>
            <div class="perfil-stats">
                <div class="stat-item">
                    <div class="numero"><?= count($reservas) ?></div>
                    <div class="label">Reservas</div>
                </div>
                <div class="stat-item">
                    <div class="numero"><?= count($emprestimos) ?></div>
                    <div class="label">Empréstimos</div>
                </div>
            </div>
        </div>

        <div class="perfil-tabs">
            <button class="active" onclick="showTab('reservas')">
                <i class="fas fa-bookmark"></i> Reservas (<?= count($reservas) ?>)
            </button>
            <button onclick="showTab('emprestimos')">
                <i class="fas fa-book-open"></i> Empréstimos (<?= count($emprestimos) ?>)
            </button>
        </div>

        <!-- TAB RESERVAS -->
        <div class="tab-content active" id="tab-reservas">
            <?php if (empty($reservas)): ?>
                <div class="empty-state">
                    <h3>Nenhuma reserva</h3>
                    <p>Este aluno não possui reservas ativas.</p>
                </div>
            <?php else: ?>
                <div class="card-section">
                    <div class="table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Data Reserva</th>
                                    <th>Data Limite</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($reservas as $r): ?>
                                <tr>
                                    <td><?= htmlspecialchars($r['material']) ?></td>
                                    <td><?= date('d/m/Y', strtotime($r['data_reserva'])) ?></td>
                                    <td><?= date('d/m/Y', strtotime($r['data_limite'])) ?></td>
                                    <td><span class="status-badge status-<?= $r['status'] ?>"><?= ucfirst($r['status']) ?></span></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <!-- TAB EMPRÉSTIMOS -->
        <div class="tab-content" id="tab-emprestimos">
            <?php if (empty($emprestimos)): ?>
                <div class="empty-state">
                    <h3>Nenhum empréstimo</h3>
                    <p>Este aluno não possui empréstimos ativos.</p>
                </div>
            <?php else: ?>
                <div class="card-section">
                    <div class="table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Data Empréstimo</th>
                                    <th>Devolução Prevista</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($emprestimos as $e): ?>
                                <tr>
                                    <td><?= htmlspecialchars($e['material']) ?></td>
                                    <td><?= date('d/m/Y', strtotime($e['data_emprestimo'])) ?></td>
                                    <td><?= date('d/m/Y', strtotime($e['data_devolucao_prevista'])) ?></td>
                                    <td><span class="status-badge status-<?= $e['status'] ?>"><?= ucfirst($e['status']) ?></span></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script>
        function showTab(tab) {
            document.querySelectorAll('.tab-content').forEach(el => {
                el.classList.remove('active');
            });
            document.querySelectorAll('.perfil-tabs button').forEach(el => {
                el.classList.remove('active');
            });
            document.getElementById('tab-' + tab).classList.add('active');

            const buttons = document.querySelectorAll('.perfil-tabs button');
            const tabNames = {
                'reservas': 'Reservas',
                'emprestimos': 'Empréstimos'
            };
            buttons.forEach(btn => {
                if (btn.textContent.includes(tabNames[tab])) {
                    btn.classList.add('active');
                }
            });
        }
    </script>
</body>
</html>
<?php
require_once __DIR__ . '/../includes/config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo json_encode(['error' => 'Método não permitido.']);
    exit;
}

$termo = trim((string)($_GET['q'] ?? ''));
if (mb_strlen($termo) < 1) {
    echo json_encode([]);
    exit;
}

if (!isset($conn) || !($conn instanceof mysqli)) {
    error_log('Busca de materiais da reserva manual sem conexão mysqli disponível.');
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível buscar materiais no catálogo.']);
    exit;
}

$like = '%' . $termo . '%';
$sql = "
    SELECT c.id_catalogo, c.titulo, c.autor, c.tipo,
           GREATEST(
               COALESCE(c.quantidade, 0)
               - (SELECT COUNT(*) FROM emprestimos e
                  WHERE e.id_catalogo = c.id_catalogo
                    AND e.status IN ('emprestado', 'atrasado', 'devolucao_solicitada'))
               - (SELECT COUNT(*) FROM reservas r
                  WHERE r.id_catalogo = c.id_catalogo
                    AND r.status IN ('pendente', 'aprovada')),
               0
           ) AS disponiveis
    FROM catalogo c
    WHERE c.titulo LIKE ? OR c.autor LIKE ? OR c.isbn LIKE ?
    HAVING disponiveis > 0
    ORDER BY c.titulo
    LIMIT 8
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log('Falha ao preparar busca de materiais para reserva: ' . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível buscar materiais no catálogo.']);
    exit;
}

$stmt->bind_param('sss', $like, $like, $like);
if (!$stmt->execute()) {
    error_log('Falha ao buscar materiais para reserva: ' . $stmt->error);
    $stmt->close();
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível buscar materiais no catálogo.']);
    exit;
}

$materiais = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

echo json_encode($materiais, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

<?php
require_once __DIR__ . '/../includes/config.php';

ini_set('display_errors', 0);
error_reporting(0);

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    jsonResponse(['error' => 'Não autorizado'], 401);
}

$usuario_id = (int)$_SESSION['usuario_id'];
$method = $_SERVER['REQUEST_METHOD'];
$db = $conn;

// ---------- GET: listar reservas do aluno ----------
if ($method === 'GET') {
    $sql = "SELECT r.*, c.titulo, c.autor, c.capa_url 
            FROM reservas r
            LEFT JOIN catalogo c ON r.id_catalogo = c.id_catalogo
            WHERE r.id_aluno = ?
            ORDER BY r.data_reserva DESC";
    $stmt = $db->prepare($sql);
    if (!$stmt) jsonResponse(['error' => 'Erro na preparação da consulta'], 500);
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $reservas = $result->fetch_all(MYSQLI_ASSOC);
    jsonResponse($reservas);
}

// ---------- POST: criar nova reserva ou cancelar ----------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;
    if (!csrf_validar(isset($input['csrf']) && is_string($input['csrf']) ? $input['csrf'] : null)) {
        jsonResponse(['error' => 'Token CSRF inválido. Recarregue a página e tente novamente.'], 403);
    }
    $redirect = $input['redirect'] ?? '../aluno/reservas.php';
    $redirectSeparator = strpos($redirect, '?') === false ? '?' : '&';

    // Ação de cancelamento
    if (isset($input['action']) && $input['action'] === 'cancel') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) jsonResponse(['error' => 'ID inválido'], 400);

        // Verifica se reserva pertence ao aluno e está pendente
        $check = $db->prepare("SELECT status FROM reservas WHERE id_reserva = ? AND id_aluno = ?");
        if (!$check) jsonResponse(['error' => 'Erro na verificação'], 500);
        $check->bind_param('ii', $id, $usuario_id);
        $check->execute();
        $res = $check->get_result()->fetch_assoc();
        if (!$res) jsonResponse(['error' => 'Reserva não encontrada'], 404);
        if (!in_array($res['status'], ['pendente', 'aprovada'], true)) {
            jsonResponse(['error' => 'Esta reserva não pode mais ser cancelada'], 400);
        }

        // Atualiza status para 'cancelada'
        $update = $db->prepare("UPDATE reservas SET status = 'cancelada' WHERE id_reserva = ?");
        if (!$update) jsonResponse(['error' => 'Erro na preparação'], 500);
        $update->bind_param('i', $id);
        if ($update->execute()) {
            if (!str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
                header('Location: ' . $redirect . $redirectSeparator . http_build_query(['mensagem' => 'Reserva cancelada']));
                exit;
            }
            jsonResponse(['success' => true, 'message' => 'Reserva cancelada']);
        } else {
            jsonResponse(['error' => 'Erro ao cancelar: ' . $update->error], 500);
        }
    }

    // Criação de nova reserva (mantido)
    $id_catalogo = (int)($input['id_catalogo'] ?? 0);
    $tipo = trim($input['tipo'] ?? 'livro');
    if ($id_catalogo <= 0) jsonResponse(['error' => 'ID do catálogo inválido'], 400);

    $check = $db->prepare("SELECT id_catalogo, titulo, quantidade FROM catalogo WHERE id_catalogo = ? AND tipo = ?");
    if (!$check) jsonResponse(['error' => 'Erro na verificação do item'], 500);
    $check->bind_param('is', $id_catalogo, $tipo);
    $check->execute();
    $item = $check->get_result()->fetch_assoc();
    if (!$item) jsonResponse(['error' => 'Item não encontrado'], 404);
    if ((int) $item['quantidade'] <= 0) {
        jsonResponse(['error' => 'Este item está indisponível para reserva'], 409);
    }

    $checkRes = $db->prepare("SELECT id_reserva FROM reservas WHERE id_aluno = ? AND id_catalogo = ? AND status IN ('pendente','aprovada')");
    if (!$checkRes) jsonResponse(['error' => 'Erro na verificação de reserva'], 500);
    $checkRes->bind_param('ii', $usuario_id, $id_catalogo);
    $checkRes->execute();
    if ($checkRes->get_result()->num_rows > 0) {
        if (!str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            header('Location: ' . $redirect . $redirectSeparator . http_build_query(['error' => 'Você já possui uma reserva ativa']));
            exit;
        }
        jsonResponse(['error' => 'Você já possui uma reserva ativa para este item'], 409);
    }

    $data_limite = date('Y-m-d', strtotime('+7 days'));
    $insert = $db->prepare("INSERT INTO reservas (id_aluno, id_catalogo, titulo_item, data_reserva, data_limite, status) VALUES (?, ?, ?, NOW(), ?, 'pendente')");
    if (!$insert) jsonResponse(['error' => 'Erro na preparação da inserção'], 500);
    $insert->bind_param('iiss', $usuario_id, $id_catalogo, $item['titulo'], $data_limite);
    if ($insert->execute()) {
        if (!str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            header('Location: ' . $redirect . $redirectSeparator . http_build_query(['mensagem' => 'Reserva criada com sucesso']));
            exit;
        }
        jsonResponse(['success' => true, 'message' => 'Reserva criada com sucesso', 'id' => $insert->insert_id]);
    } else {
        jsonResponse(['error' => 'Erro ao criar reserva: ' . $insert->error], 500);
    }
}

// ---------- DELETE: removido, agora usa POST com action=cancel ----------
// Mantido apenas para compatibilidade (redireciona para POST)
if ($method === 'DELETE') {
    if (!csrf_validar()) {
        jsonResponse(['error' => 'Token CSRF inválido. Recarregue a página e tente novamente.'], 403);
    }

    // Lê o ID da query string
    $id = (int)($_GET['id'] ?? 0);
    // Simula uma requisição POST com action=cancel
    $_POST['action'] = 'cancel';
    $_POST['id'] = $id;
    $method = 'POST';
    // Reexecuta a lógica POST
    // (como estamos dentro do mesmo script, podemos chamar a lógica novamente)
    // Mas para simplificar, redirecionamos via include ou reexecutamos
    // Melhor: copiar o bloco de cancelamento para cá
    if ($id <= 0) jsonResponse(['error' => 'ID inválido'], 400);
    $check = $db->prepare("SELECT status FROM reservas WHERE id_reserva = ? AND id_aluno = ?");
    if (!$check) jsonResponse(['error' => 'Erro na verificação'], 500);
    $check->bind_param('ii', $id, $usuario_id);
    $check->execute();
    $res = $check->get_result()->fetch_assoc();
    if (!$res) jsonResponse(['error' => 'Reserva não encontrada'], 404);
    if ($res['status'] !== 'pendente') {
        jsonResponse(['error' => 'Apenas reservas pendentes podem ser canceladas'], 400);
    }
    $update = $db->prepare("UPDATE reservas SET status = 'cancelada' WHERE id_reserva = ?");
    if (!$update) jsonResponse(['error' => 'Erro na preparação'], 500);
    $update->bind_param('i', $id);
    if ($update->execute()) {
        jsonResponse(['success' => true, 'message' => 'Reserva cancelada']);
    } else {
        jsonResponse(['error' => 'Erro ao cancelar: ' . $update->error], 500);
    }
}

jsonResponse(['error' => 'Método não permitido'], 405);

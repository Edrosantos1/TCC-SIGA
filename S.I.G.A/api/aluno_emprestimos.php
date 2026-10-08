<?php
require_once __DIR__ . '/../includes/config.php';

// Ativa logs de erro para depuração (remova depois)
error_reporting(E_ALL);
ini_set('display_errors', 0);

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Verifica autenticação
if (!isset($_SESSION['usuario_id'])) {
    jsonResponse(['error' => 'Não autorizado'], 401);
}

$usuario_id = (int)$_SESSION['usuario_id'];
$method = $_SERVER['REQUEST_METHOD'];
$db = $conn;

// ---------- GET: listar empréstimos ----------
if ($method === 'GET') {
    $sql = "SELECT 
                e.id_emprestimo AS id,
                e.titulo_item AS title,
                c.autor AS author,
                c.capa_url AS cover,
                c.tipo AS type,
                e.data_emprestimo AS loanDate,
                e.data_devolucao_prevista AS dueDate,
                e.status,
                e.renovado,
                e.data_renovacao
            FROM emprestimos e
            LEFT JOIN catalogo c ON e.id_catalogo = c.id_catalogo
            WHERE e.id_aluno = ?
            ORDER BY e.data_emprestimo DESC";

    $stmt = $db->prepare($sql);
    if (!$stmt) {
        error_log("Erro prepare: " . $db->error);
        jsonResponse(['error' => 'Erro interno no servidor'], 500);
    }

    $stmt->bind_param('i', $usuario_id);
    if (!$stmt->execute()) {
        error_log("Erro execute: " . $stmt->error);
        jsonResponse(['error' => 'Erro ao executar consulta'], 500);
    }

    $result = $stmt->get_result();
    if (!$result) {
        error_log("Erro result: " . $stmt->error);
        jsonResponse(['error' => 'Erro interno no servidor'], 500);
    }
    $loans = [];

    while ($row = $result->fetch_assoc()) {
        // Mapeia status
        if (in_array($row['status'], ['devolvido', 'finalizado'], true)) {
            $row['status'] = 'returned';
        } elseif ($row['status'] === 'atrasado') {
            $row['status'] = 'overdue';
        } elseif (in_array($row['status'], ['pendente', 'retirado'], true)) {
            $row['status'] = 'pending';
        } elseif ($row['status'] === 'recusado') {
            $row['status'] = 'refused';
        } else {
            $row['status'] = 'active';
        }

        // Formata datas
        $row['loanDate'] = $row['loanDate'] ? date('Y-m-d', strtotime($row['loanDate'])) : null;
        $row['dueDate'] = $row['dueDate'] ? date('Y-m-d', strtotime($row['dueDate'])) : null;
        $row['cover'] = $row['cover'] ?: null;
        if ($row['cover'] && !preg_match('/^(https?:\/\/|\/|\.\.\/)/', $row['cover'])) {
            $row['cover'] = '../' . $row['cover'];
        }

        $loans[] = $row;
    }

    jsonResponse(['success' => true, 'data' => $loans]);
}

// ---------- POST: renovar ou devolver ----------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $action = $input['action'] ?? '';
    $id = (int)($input['id'] ?? 0);
    $redirect = isset($input['redirect']) ? $input['redirect'] : 'meus_emprestimos.php';

    if ($id <= 0) {
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST' && !isset($input['ajax'])) {
            header('Location: ' . $redirect . '?erro=ID+invalido');
        }
        jsonResponse(['error' => 'ID inválido'], 400);
    }

    // Verifica se o empréstimo pertence ao aluno
    $check = $db->prepare("SELECT id_emprestimo, status, renovado, data_devolucao_prevista FROM emprestimos WHERE id_emprestimo = ? AND id_aluno = ?");
    $check->bind_param('ii', $id, $usuario_id);
    $check->execute();
    $loan = $check->get_result()->fetch_assoc();

    if (!$loan) {
        jsonResponse(['error' => 'Empréstimo não encontrado'], 404);
    }

    if ($action === 'renew') {
        if ($loan['status'] !== 'emprestado') {
            jsonResponse(['error' => 'Apenas empréstimos ativos podem ser renovados'], 400);
        }
        if ($loan['renovado']) {
            jsonResponse(['error' => 'Este empréstimo já foi renovado'], 400);
        }

        $currentDue = $loan['data_devolucao_prevista'] ?? null;
        $newDue = date('Y-m-d', strtotime(($currentDue ?: date('Y-m-d')) . ' +15 days'));
        $update = $db->prepare("UPDATE emprestimos SET data_devolucao_prevista = ?, renovado = 1, data_renovacao = NOW() WHERE id_emprestimo = ?");
        $update->bind_param('si', $newDue, $id);

        if ($update->execute()) {
            if (isset($_SERVER['CONTENT_TYPE']) && !str_contains($_SERVER['CONTENT_TYPE'], 'application/json')) {
                header('Location: ' . $redirect . '?mensagem=Empr%C3%A9stimo+renovado');
                exit;
            }
            jsonResponse(['success' => true, 'message' => 'Renovado com sucesso', 'new_due' => $newDue]);
        } else {
            error_log("Erro ao renovar: " . $update->error);
            jsonResponse(['error' => 'Erro ao renovar'], 500);
        }
    } elseif ($action === 'return') {
        $update = $db->prepare("UPDATE emprestimos SET status = 'devolvido' WHERE id_emprestimo = ?");
        $update->bind_param('i', $id);

        if ($update->execute()) {
            if (isset($_SERVER['CONTENT_TYPE']) && !str_contains($_SERVER['CONTENT_TYPE'], 'application/json')) {
                header('Location: ' . $redirect . '?mensagem=Item+devolvido');
                exit;
            }
            jsonResponse(['success' => true, 'message' => 'Devolvido com sucesso']);
        } else {
            error_log("Erro ao devolver: " . $update->error);
            jsonResponse(['error' => 'Erro ao devolver'], 500);
        }
    } else {
        jsonResponse(['error' => 'Ação inválida'], 400);
    }
}

jsonResponse(['error' => 'Método não permitido'], 405);
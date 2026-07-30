<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Sessão expirada. Faça login novamente.']);
    exit;
}

// ========== IDENTIFICAR CONEXÃO ==========
$db = null;
if (isset($conn)) {
    $db = $conn;
} elseif (isset($conexao)) {
    $db = $conexao;
} elseif (isset($pdo)) {
    $db = $pdo;
}

if (!$db) {
    echo json_encode(['success' => false, 'message' => 'Sem conexão com o banco de dados.']);
    exit;
}

// ========== LER PAYLOAD ==========
$input = json_decode(file_get_contents('php://input'), true);

$destinatarioTipo = isset($input['destinatario_tipo']) ? $input['destinatario_tipo'] : 'todos'; // 'todos' | 'especifico'
$idAlunoEspecifico = isset($input['id_aluno']) ? $input['id_aluno'] : null;
$categoria = isset($input['categoria']) ? $input['categoria'] : 'aviso'; // 'pendencia' | 'aviso' -> vai para a coluna `tipo`
$mensagem = isset($input['mensagem']) ? trim($input['mensagem']) : '';
$enviarEmail = isset($input['enviar_email']) ? (bool) $input['enviar_email'] : false;

if ($mensagem === '') {
    echo json_encode(['success' => false, 'message' => 'A mensagem não pode estar vazia.']);
    exit;
}

if ($destinatarioTipo === 'especifico' && empty($idAlunoEspecifico)) {
    echo json_encode(['success' => false, 'message' => 'Nenhum aluno específico foi selecionado.']);
    exit;
}

$titulo = $categoria === 'pendencia' ? 'Pendência' : 'Aviso';
$tipo = $categoria; // grava 'pendencia' ou 'aviso' na coluna `tipo`

// ========== DESCOBRIR OS DESTINATÁRIOS ==========
$alunosDestino = array(); // cada item: ['id_aluno' => ..., 'email_aluno' => ...]

try {
    if ($destinatarioTipo === 'todos') {
        $result = $db->query("SELECT id_aluno, email_aluno FROM login_aluno");
        if ($result) {
            $alunosDestino = $result->fetch_all(MYSQLI_ASSOC);
        }
    } else {
        $stmt = $db->prepare("SELECT id_aluno, email_aluno FROM login_aluno WHERE id_aluno = ?");
        $stmt->bind_param('i', $idAlunoEspecifico);
        $stmt->execute();
        $result = $stmt->get_result();
        $alunosDestino = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar destinatários: ' . $e->getMessage()]);
    exit;
}

if (empty($alunosDestino)) {
    echo json_encode(['success' => false, 'message' => 'Nenhum destinatário encontrado.']);
    exit;
}

// ========== GRAVAR NOTIFICAÇÃO(ÕES) NO BANCO ==========
// Tabela `notificacoes`: id, id_aluno, titulo, mensagem, tipo, lida, criado_em
// (criado_em e lida já têm valor padrão no banco, não precisa informar)
try {
    $stmt = $db->prepare("
        INSERT INTO notificacoes (id_aluno, titulo, mensagem, tipo)
        VALUES (?, ?, ?, ?)
    ");

    $sucessos = 0;
    $emailsEnviados = 0;

    foreach ($alunosDestino as $aluno) {
        $stmt->bind_param('isss', $aluno['id_aluno'], $titulo, $mensagem, $tipo);
        if ($stmt->execute()) {
            $sucessos++;

            // ---------- ENVIO DE E-MAIL (placeholder) ----------
            // Substitua este bloco pela sua integração real (PHPMailer, SMTP, etc).
            if ($enviarEmail && !empty($aluno['email_aluno'])) {
                $enviado = @mail(
                    $aluno['email_aluno'],
                    'SiGA ITJ — ' . $titulo,
                    $mensagem,
                    'From: no-reply@sigaitj.com.br'
                );
                if ($enviado) {
                    $emailsEnviados++;
                }
            }
        }
    }

    $stmt->close();

    echo json_encode([
        'success' => true,
        'message' => "Notificação enviada para {$sucessos} aluno(s)." . ($enviarEmail ? " ({$emailsEnviados} e-mail(s) enviado(s))" : ''),
        'total_destinatarios' => $sucessos,
        'total_emails' => $emailsEnviados
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar notificação: ' . $e->getMessage()]);
}
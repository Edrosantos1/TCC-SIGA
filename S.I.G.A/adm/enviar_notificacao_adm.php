<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

// ========== PREVENIR ENVIO DUPLICADO POR TEMPO ==========
if (isset($_SESSION['ultimo_envio']) && time() - $_SESSION['ultimo_envio'] < 5) {
    $_SESSION['msg_erro'] = 'Aguarde alguns segundos antes de enviar novamente.';
    header('Location: notificacoes_adm.php');
    exit;
}
$_SESSION['ultimo_envio'] = time();

$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    $_SESSION['msg_erro'] = 'Erro de conexão com o banco de dados.';
    header('Location: notificacoes_adm.php');
    exit;
}

// ========== RECEBER DADOS DO POST ==========
$destinatarioTipo = isset($_POST['destinatario_tipo']) ? $_POST['destinatario_tipo'] : 'todos';
$idAlunoEspecifico = isset($_POST['id_aluno']) ? intval($_POST['id_aluno']) : 0;
$categoria = isset($_POST['categoria']) ? $_POST['categoria'] : 'aviso';
$mensagem = isset($_POST['mensagem']) ? trim($_POST['mensagem']) : '';
$enviarEmail = isset($_POST['enviar_email']) ? true : false;

// ========== VALIDAÇÕES ==========
if ($mensagem === '') {
    $_SESSION['msg_erro'] = 'A mensagem não pode estar vazia.';
    header('Location: notificacoes_adm.php');
    exit;
}

if ($destinatarioTipo === 'especifico' && $idAlunoEspecifico <= 0) {
    $_SESSION['msg_erro'] = 'Nenhum aluno específico foi selecionado.';
    header('Location: notificacoes_adm.php');
    exit;
}

$titulo = $categoria === 'pendencia' ? 'Pendência' : 'Aviso';
$tipo = $categoria;

// ========== GERAR ID ÚNICO PARA ESTE ENVIO ==========
$id_envio = uniqid() . '_' . time();

// ========== BUSCAR DESTINATÁRIOS ==========
$alunosDestino = array();

try {
    if ($destinatarioTipo === 'todos') {
        $result = $db->query("SELECT id_aluno, email_aluno FROM login_aluno");
        if ($result) {
            if (method_exists($result, 'fetch_all')) {
                $alunosDestino = $result->fetch_all(MYSQLI_ASSOC);
            } else {
                while ($row = $result->fetch_assoc()) {
                    $alunosDestino[] = $row;
                }
            }
        }
    } else {
        $stmt = $db->prepare("SELECT id_aluno, email_aluno FROM login_aluno WHERE id_aluno = ?");
        $stmt->bind_param('i', $idAlunoEspecifico);
        $stmt->execute();
        $result = $stmt->get_result();
        if (method_exists($result, 'fetch_all')) {
            $alunosDestino = $result->fetch_all(MYSQLI_ASSOC);
        } else {
            while ($row = $result->fetch_assoc()) {
                $alunosDestino[] = $row;
            }
        }
        $stmt->close();
    }
} catch (Exception $e) {
    $_SESSION['msg_erro'] = 'Erro ao buscar destinatários: ' . $e->getMessage();
    header('Location: notificacoes_adm.php');
    exit;
}

if (empty($alunosDestino)) {
    $_SESSION['msg_erro'] = 'Nenhum destinatário encontrado.';
    header('Location: notificacoes_adm.php');
    exit;
}

// ========== GRAVAR NOTIFICAÇÕES ==========
try {
    // 🔥 AGORA INCLUI O id_envio
    $stmt = $db->prepare("INSERT INTO notificacoes (id_aluno, titulo, mensagem, tipo, id_envio) VALUES (?, ?, ?, ?, ?)");
    $sucessos = 0;

    foreach ($alunosDestino as $aluno) {
        $stmt->bind_param('issss', $aluno['id_aluno'], $titulo, $mensagem, $tipo, $id_envio);
        if ($stmt->execute()) {
            $sucessos++;
        }
    }
    $stmt->close();

    $_SESSION['msg_sucesso'] = "Notificação enviada para {$sucessos} aluno(s).";
    header('Location: notificacoes_adm.php');
    exit;

} catch (Exception $e) {
    $_SESSION['msg_erro'] = 'Erro ao salvar notificação: ' . $e->getMessage();
    header('Location: notificacoes_adm.php');
    exit;
}
?>
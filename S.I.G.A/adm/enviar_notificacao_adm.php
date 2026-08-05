<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

// Aceitar apenas requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: notificacoes_adm.php');
    exit;
}

// ========== PREVENIR ENVIO DUPLICADO POR TEMPO ==========
if (isset($_SESSION['ultimo_envio']) && (time() - $_SESSION['ultimo_envio']) < 3) {
    $_SESSION['msg_erro'] = 'Aguarde alguns segundos antes de enviar novamente.';
    header('Location: notificacoes_adm.php');
    exit;
}

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

// Atualiza a trava de envio após validação
$_SESSION['ultimo_envio'] = time();

$titulo = ($categoria === 'pendencia') ? 'Pendência' : 'Aviso';
$tipo = $categoria;

// ========== GERAR ID ÚNICO PARA ESTE ENVIO ==========
$id_envio = uniqid('env_') . '_' . time();

// ========== BUSCAR DESTINATÁRIOS (SUPORTE MYSQLI E PDO) ==========
$alunosDestino = array();

try {
    if ($destinatarioTipo === 'todos') {
        $sql = "SELECT id_aluno, email_aluno FROM login_aluno";
        if ($db instanceof mysqli) {
            $result = $db->query($sql);
            if ($result) {
                if (method_exists($result, 'fetch_all')) {
                    $alunosDestino = $result->fetch_all(MYSQLI_ASSOC);
                } else {
                    while ($row = $result->fetch_assoc()) {
                        $alunosDestino[] = $row;
                    }
                }
            }
        } elseif ($db instanceof PDO) {
            $stmt = $db->query($sql);
            $alunosDestino = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } else {
        $sql = "SELECT id_aluno, email_aluno FROM login_aluno WHERE id_aluno = ?";
        if ($db instanceof mysqli) {
            $stmt = $db->prepare($sql);
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
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare($sql);
            $stmt->execute([$idAlunoEspecifico]);
            $alunosDestino = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
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

// ========== GRAVAR NOTIFICAÇÕES (SUPORTE MYSQLI E PDO) ==========
try {
    $sucessos = 0;
    $sqlInsert = "INSERT INTO notificacoes (id_aluno, titulo, mensagem, tipo, id_envio) VALUES (?, ?, ?, ?, ?)";

    if ($db instanceof mysqli) {
        $stmt = $db->prepare($sqlInsert);
        foreach ($alunosDestino as $aluno) {
            $idAluno = intval($aluno['id_aluno']);
            $stmt->bind_param('issss', $idAluno, $titulo, $mensagem, $tipo, $id_envio);
            if ($stmt->execute()) {
                $sucessos++;
            }
        }
        $stmt->close();
    } elseif ($db instanceof PDO) {
        $stmt = $db->prepare($sqlInsert);
        foreach ($alunosDestino as $aluno) {
            $idAluno = intval($aluno['id_aluno']);
            if ($stmt->execute([$idAluno, $titulo, $mensagem, $tipo, $id_envio])) {
                $sucessos++;
            }
        }
    }

    if ($sucessos === 1) {
        $_SESSION['msg_sucesso'] = "Notificação enviada para 1 aluno.";
    } else {
        $_SESSION['msg_sucesso'] = "Notificação enviada para {$sucessos} alunos.";
    }

    header('Location: notificacoes_adm.php');
    exit;

} catch (Exception $e) {
    $_SESSION['msg_erro'] = 'Erro ao salvar notificação: ' . $e->getMessage();
    header('Location: notificacoes_adm.php');
    exit;
}
?>
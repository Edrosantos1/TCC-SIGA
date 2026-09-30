<?php
// arquivar_reservas.php - Script de arquivamento mensal (pode ser chamado via include ou diretamente)

// Se for chamado diretamente, verifica se é admin
if (basename($_SERVER['SCRIPT_FILENAME']) === 'arquivar_reservas.php') {
    session_start();
    if (!isset($_SESSION['admin_id'])) {
        header('Location: login_adm.php');
        exit;
    }
}

// Inclui configuração se não estiver já incluído
if (!defined('CONFIG_LOADED')) {
    require_once __DIR__ . '/../includes/config.php';
}

// Identifica a conexão
$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    if (basename($_SERVER['SCRIPT_FILENAME']) === 'arquivar_reservas.php') {
        $_SESSION['msg_erro'] = 'Erro de conexão com banco.';
        header('Location: reservas_adm.php');
        exit;
    }
    return false;
}

/**
 * Verifica se já passou 1 mês desde o último arquivamento
 */
function verificar_necessidade_arquivamento($db) {
    // Busca a data do último arquivamento
    $sql = "SELECT valor FROM configuracoes WHERE chave = 'ultimo_arquivamento'";
    $ultimo = null;

    if ($db instanceof mysqli) {
        $res = $db->query($sql);
        if ($res && $res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $ultimo = $row['valor'];
        } else {
            // Nunca arquivou – insere uma data antiga
            $ultimo = '2000-01-01';
            $db->query("INSERT INTO configuracoes (chave, valor, descricao) VALUES ('ultimo_arquivamento', '2000-01-01', 'Data do último arquivamento mensal de reservas')");
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->query("SELECT valor FROM configuracoes WHERE chave = 'ultimo_arquivamento'");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $ultimo = $row ? $row['valor'] : '2000-01-01';
        if (!$row) {
            $db->exec("INSERT INTO configuracoes (chave, valor, descricao) VALUES ('ultimo_arquivamento', '2000-01-01', 'Data do último arquivamento mensal de reservas')");
        }
    } else {
        return false;
    }

    $ultimo_ts = strtotime($ultimo);
    $proximo = strtotime('+1 month', $ultimo_ts);
    $agora = time();
    return ($agora >= $proximo);
}

/**
 * Executa o arquivamento: move reservas finalizadas para extrato e remove da tabela principal
 */
function executar_arquivamento($db) {
    $mes = date('Y-m'); // ano-mês atual

    // Busca todas as reservas com status diferente de 'pendente'
    $sql_select = "SELECT id_reserva, id_aluno, id_catalogo, titulo_item, 
                          data_reserva, data_limite, status 
                   FROM reservas 
                   WHERE status != 'pendente'";

    $reservas = [];
    if ($db instanceof mysqli) {
        $result = $db->query($sql_select);
        $reservas = $result->fetch_all(MYSQLI_ASSOC);
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($sql_select);
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        return false;
    }

    if (empty($reservas)) {
        // Nada para arquivar – atualiza a data mesmo assim
        $db->query("UPDATE configuracoes SET valor = CURDATE() WHERE chave = 'ultimo_arquivamento'");
        return true;
    }

    // Inserir no extrato
    $insert_sql = "INSERT INTO extrato_reservas 
                   (id_reserva_original, id_aluno, id_catalogo, titulo_item, 
                    data_reserva, data_limite, status, mes_referencia) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    if ($db instanceof mysqli) {
        $stmt_insert = $db->prepare($insert_sql);
        foreach ($reservas as $r) {
            $stmt_insert->bind_param(
                'iiisssss',
                $r['id_reserva'],
                $r['id_aluno'],
                $r['id_catalogo'],
                $r['titulo_item'],
                $r['data_reserva'],
                $r['data_limite'],
                $r['status'],
                $mes
            );
            $stmt_insert->execute();
        }
        $stmt_insert->close();
    } elseif ($db instanceof PDO) {
        $stmt_insert = $db->prepare($insert_sql);
        foreach ($reservas as $r) {
            $stmt_insert->execute([
                $r['id_reserva'],
                $r['id_aluno'],
                $r['id_catalogo'],
                $r['titulo_item'],
                $r['data_reserva'],
                $r['data_limite'],
                $r['status'],
                $mes
            ]);
        }
    }

    // Remover da tabela principal
    $ids = array_column($reservas, 'id_reserva');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $delete_sql = "DELETE FROM reservas WHERE id_reserva IN ($placeholders)";

    if ($db instanceof mysqli) {
        $stmt_del = $db->prepare($delete_sql);
        $types = str_repeat('i', count($ids));
        $stmt_del->bind_param($types, ...$ids);
        $stmt_del->execute();
        $stmt_del->close();
    } elseif ($db instanceof PDO) {
        $stmt_del = $db->prepare($delete_sql);
        $stmt_del->execute($ids);
    }

    // Atualiza a data do último arquivamento
    $db->query("UPDATE configuracoes SET valor = CURDATE() WHERE chave = 'ultimo_arquivamento'");

    return true;
}

// Se o script for chamado diretamente (via botão), executa e redireciona
if (basename($_SERVER['SCRIPT_FILENAME']) === 'arquivar_reservas.php') {
    $sucesso = executar_arquivamento($db);
    if ($sucesso) {
        $_SESSION['msg_sucesso'] = 'Arquivamento mensal executado com sucesso!';
    } else {
        $_SESSION['msg_erro'] = 'Falha ao executar arquivamento.';
    }
    header('Location: reservas_adm.php');
    exit;
}

// Se for incluído, retorna true se arquivou, false se não arquivou (ou se não precisou)
return executar_arquivamento($db);
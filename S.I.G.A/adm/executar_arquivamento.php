<?php
// executar_arquivamento.php – Script de arquivamento mensal (sem Cron)

require_once __DIR__ . '/../includes/config.php';

$chamado_direto = (basename($_SERVER['SCRIPT_FILENAME']) === 'executar_arquivamento.php');

// Se for chamado diretamente, verifica se é admin
if ($chamado_direto) {
    if (!isset($_SESSION['admin_id'])) {
        header('Location: login_adm.php');
        exit;
    }
}

// Identifica a conexão
$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    if ($chamado_direto) {
        $_SESSION['msg_erro'] = 'Erro de conexão com banco.';
        header('Location: reservas_adm.php');
        exit;
    }
    return false;
}

// ============================================
// FUNÇÃO: Verifica se já passou 1 mês
// ============================================
if (!function_exists('verificar_necessidade_arquivamento')) {
function verificar_necessidade_arquivamento($db) {
    $sql = "SELECT valor FROM configuracoes WHERE chave = 'ultimo_arquivamento'";
    $insert = "INSERT INTO configuracoes (chave, valor, descricao) VALUES ('ultimo_arquivamento', '2000-01-01', 'Data do último arquivamento mensal de reservas')";

    if ($db instanceof mysqli) {
        $res = $db->query($sql);
        if ($res && $res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $ultimo = $row['valor'];
        } else {
            $ultimo = '2000-01-01';
            $db->query($insert);
        }
    } elseif ($db instanceof PDO) {
        $stmt = $db->query($sql);
        $row = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : false;
        $ultimo = $row ? $row['valor'] : '2000-01-01';
        if (!$row) {
            $db->exec($insert);
        }
    } else {
        return false;
    }

    $ultimo_ts = strtotime($ultimo);
    $proximo = strtotime('+1 month', $ultimo_ts);

    return (time() >= $proximo);
}
}

// ============================================
// FUNÇÃO: Executa o arquivamento
// ============================================
if (!function_exists('executar_arquivamento')) {
function executar_arquivamento($db) {
    $mes = date('Y-m');

    // 1. Buscar reservas finalizadas (todos os status exceto 'pendente')
    //    O tipo do item vem do catálogo (reservas não tem coluna tipo_item)
    $sql_select = "SELECT r.id_reserva, r.id_aluno, r.id_catalogo, r.titulo_item,
                          c.tipo AS tipo_item, r.data_reserva, r.data_limite, r.status
                   FROM reservas r
                   LEFT JOIN catalogo c ON c.id_catalogo = r.id_catalogo
                   WHERE r.status != 'pendente'";

    $insert_sql = "INSERT INTO extrato_reservas
                   (id_reserva_original, id_aluno, id_catalogo, titulo_item, tipo_item,
                    data_reserva, data_limite, status, mes_referencia)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $update_sql = "UPDATE configuracoes SET valor = CURDATE() WHERE chave = 'ultimo_arquivamento'";

    try {
        if ($db instanceof mysqli) {
            $db->begin_transaction();

            $result = $db->query($sql_select);
            $reservas = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];

            if (!empty($reservas)) {
                // 2. Inserir no extrato
                $stmt_insert = $db->prepare($insert_sql);
                foreach ($reservas as $r) {
                    $tipo = $r['tipo_item'] ?? 'livro';
                    $stmt_insert->bind_param(
                        'iiissssss',
                        $r['id_reserva'],
                        $r['id_aluno'],
                        $r['id_catalogo'],
                        $r['titulo_item'],
                        $tipo,
                        $r['data_reserva'],
                        $r['data_limite'],
                        $r['status'],
                        $mes
                    );
                    $stmt_insert->execute();
                }
                $stmt_insert->close();

                // 3. Remover da tabela principal
                $ids = array_column($reservas, 'id_reserva');
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $stmt_del = $db->prepare("DELETE FROM reservas WHERE id_reserva IN ($placeholders)");
                $stmt_del->bind_param(str_repeat('i', count($ids)), ...$ids);
                $stmt_del->execute();
                $stmt_del->close();
            }

            // 4. Atualizar data do último arquivamento
            $db->query($update_sql);
            $db->commit();
            return true;

        } elseif ($db instanceof PDO) {
            $db->beginTransaction();

            $stmt = $db->query($sql_select);
            $reservas = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

            if (!empty($reservas)) {
                $stmt_insert = $db->prepare($insert_sql);
                foreach ($reservas as $r) {
                    $stmt_insert->execute([
                        $r['id_reserva'],
                        $r['id_aluno'],
                        $r['id_catalogo'],
                        $r['titulo_item'],
                        $r['tipo_item'] ?? 'livro',
                        $r['data_reserva'],
                        $r['data_limite'],
                        $r['status'],
                        $mes
                    ]);
                }

                $ids = array_column($reservas, 'id_reserva');
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $stmt_del = $db->prepare("DELETE FROM reservas WHERE id_reserva IN ($placeholders)");
                $stmt_del->execute($ids);
            }

            $db->exec($update_sql);
            $db->commit();
            return true;
        }
    } catch (Throwable $e) {
        if ($db instanceof mysqli) {
            @$db->rollback();
        } elseif ($db instanceof PDO && $db->inTransaction()) {
            $db->rollBack();
        }
        error_log('Erro no arquivamento de reservas: ' . $e->getMessage());
        return false;
    }

    return false;
}
}

// ============================================
// EXECUÇÃO
// ============================================
if ($chamado_direto) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_validar()) {
        $_SESSION['msg_erro'] = 'Sessão expirada ou token de segurança inválido. Recarregue a página e tente novamente.';
        header('Location: reservas_adm.php');
        exit;
    }

    if (executar_arquivamento($db)) {
        $_SESSION['msg_sucesso'] = 'Arquivamento mensal executado com sucesso!';
    } else {
        $_SESSION['msg_erro'] = 'Falha ao executar arquivamento.';
    }
    header('Location: reservas_adm.php');
    exit;
}

// O arquivamento só é executado pela ação POST protegida acima.
return false;
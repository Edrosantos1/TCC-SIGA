<?php
// Não inclui o config.php aqui para evitar duplicação/erro 500
// No topo, antes de qualquer coisa
echo "<!-- ARQUIVO INCLUÍDO -->";

$db_cancelar = null;
if (isset($conn)) $db_cancelar = $conn;
elseif (isset($conexao)) $db_cancelar = $conexao;
elseif (isset($pdo)) $db_cancelar = $pdo;

if ($db_cancelar) {
    // Busca reservas pendentes que passaram da data limite
    $query_exp = "SELECT id_reserva, id_aluno, titulo_item FROM reservas 
                  WHERE status IN ('pendente', 'aprovada') AND data_limite < CURDATE()";
    
    $result_exp = $db_cancelar->query($query_exp);

    if ($result_exp && $result_exp->num_rows > 0) {
        while ($row = $result_exp->fetch_assoc()) {
            // Atualiza status para expirada
            $update = $db_cancelar->prepare("UPDATE reservas SET status = 'expirada' WHERE id_reserva = ?");
            if ($update) {
                $update->bind_param("i", $row['id_reserva']);
                if ($update->execute()) {
                    // Notifica o aluno
                    $mensagem = "Sua reserva do item '{$row['titulo_item']}' foi cancelada porque o prazo limite para retirada expirou.";
                    $notif = $db_cancelar->prepare("INSERT INTO notificacoes (id_aluno, titulo, mensagem, tipo) VALUES (?, 'Reserva Expirada', ?, 'aviso')");
                    if ($notif) {
                        $notif->bind_param("is", $row['id_aluno'], $mensagem);
                        $notif->execute();
                        $notif->close();
                    }
                }
                $update->close();
            }
        }
    }
}
?>
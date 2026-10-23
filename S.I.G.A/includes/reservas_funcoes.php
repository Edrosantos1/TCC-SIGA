<?php
/**
 * Funções compartilhadas de reservas (aluno e administrador).
 */

if (!function_exists('siga_formatar_data')) {
    function siga_formatar_data(?string $data): string
    {
        $ts = $data ? strtotime($data) : false;
        return $ts ? date('d/m/Y', $ts) : '';
    }
}

if (!function_exists('siga_notificar_aluno')) {
    /**
     * Cria uma notificação do sistema para o aluno.
     * id_envio fica NULL de propósito: assim ela aparece para o aluno, mas não
     * entra no histórico de "avisos enviados" da bibliotecária.
     */
    function siga_notificar_aluno($db, int $idAluno, string $titulo, string $mensagem, string $tipo = 'aviso'): bool
    {
        if (!($db instanceof mysqli) || $idAluno <= 0) {
            return false;
        }
        if (!in_array($tipo, ['pendencia', 'aviso'], true)) {
            $tipo = 'aviso';
        }

        try {
            $stmt = $db->prepare('INSERT INTO notificacoes (id_aluno, titulo, mensagem, tipo) VALUES (?, ?, ?, ?)');
            if (!$stmt) {
                return false;
            }
            $stmt->bind_param('isss', $idAluno, $titulo, $mensagem, $tipo);
            $ok = $stmt->execute();
            $stmt->close();
            return $ok;
        } catch (Throwable $e) {
            error_log('Falha ao notificar aluno: ' . $e->getMessage());
            return false;
        }
    }
}

if (!function_exists('siga_expirar_reservas')) {
    /**
     * Marca como "expirada" toda reserva pendente ou aprovada cuja data limite já passou,
     * libera o exemplar no estoque e avisa o aluno.
     */
    function siga_expirar_reservas($db): void
    {
        if (!($db instanceof mysqli)) {
            return;
        }

        try {
            $res = $db->query(
                "SELECT id_reserva, id_aluno, titulo_item
                 FROM reservas
                 WHERE status IN ('pendente', 'aprovada')
                   AND data_limite IS NOT NULL
                   AND data_limite < CURDATE()"
            );
            if (!$res || $res->num_rows === 0) {
                return;
            }
            $vencidas = $res->fetch_all(MYSQLI_ASSOC);
            $res->free();

            $stmt = $db->prepare(
                "UPDATE reservas SET status = 'expirada'
                 WHERE id_reserva = ? AND status IN ('pendente', 'aprovada')"
            );
            if (!$stmt) {
                return;
            }

            foreach ($vencidas as $r) {
                $id = (int) $r['id_reserva'];
                $stmt->bind_param('i', $id);
                $stmt->execute();

                // Só avisa quem de fato foi expirado por esta chamada (evita aviso duplicado).
                if ($stmt->affected_rows === 1) {
                    siga_notificar_aluno(
                        $db,
                        (int) $r['id_aluno'],
                        'Reserva expirada',
                        'Sua reserva de “' . $r['titulo_item'] . '” expirou porque o prazo passou. '
                        . 'Se ainda quiser o item, faça uma nova reserva.'
                    );
                }
            }
            $stmt->close();
        } catch (Throwable $e) {
            error_log('Falha ao expirar reservas vencidas: ' . $e->getMessage());
        }
    }
}

if (!function_exists('siga_buscar_reservas_pendentes')) {
    /** Dados (aluno, título, prazo) das reservas pendentes entre os ids informados. */
    function siga_buscar_reservas_pendentes($db, array $ids): array
    {
        $ids = array_values(array_filter(array_map('intval', $ids)));
        if (!($db instanceof mysqli) || !$ids) {
            return [];
        }

        try {
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $db->prepare(
                "SELECT id_reserva, id_aluno, titulo_item, data_limite
                 FROM reservas WHERE id_reserva IN ($ph) AND status = 'pendente'"
            );
            if (!$stmt) {
                return [];
            }
            $stmt->bind_param(str_repeat('i', count($ids)), ...$ids);
            $stmt->execute();
            $linhas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            return $linhas;
        } catch (Throwable $e) {
            error_log('Falha ao buscar reservas pendentes: ' . $e->getMessage());
            return [];
        }
    }
}

if (!function_exists('siga_notificar_decisao_reservas')) {
    /** Avisa os alunos que a reserva foi aprovada ou rejeitada pela bibliotecária. */
    function siga_notificar_decisao_reservas($db, array $reservas, string $status): void
    {
        foreach ($reservas as $r) {
            $titulo = $r['titulo_item'];
            if ($status === 'aprovada') {
                $prazo = siga_formatar_data($r['data_limite'] ?? null);
                siga_notificar_aluno(
                    $db,
                    (int) $r['id_aluno'],
                    'Reserva aprovada',
                    'Sua reserva de “' . $titulo . '” foi aprovada. Retire o item na biblioteca'
                    . ($prazo !== '' ? ' até ' . $prazo : '') . '.'
                );
            } elseif ($status === 'rejeitada') {
                siga_notificar_aluno(
                    $db,
                    (int) $r['id_aluno'],
                    'Reserva não aprovada',
                    'Sua reserva de “' . $titulo . '” não foi aprovada. Em caso de dúvida, procure a biblioteca.'
                );
            }
        }
    }
}

if (!function_exists('siga_sql_disponiveis')) {
    /**
     * Expressão SQL com o número de exemplares realmente disponíveis:
     * quantidade - empréstimos ativos - reservas pendentes/aprovadas (mínimo 0).
     * $alias é o alias da tabela catalogo na consulta.
     */
    function siga_sql_disponiveis(string $alias = 'c'): string
    {
        $a = preg_replace('/[^a-zA-Z0-9_]/', '', $alias);

        return "GREATEST(
                    COALESCE({$a}.quantidade, 0)
                    - (SELECT COUNT(*) FROM emprestimos e_d
                       WHERE e_d.id_catalogo = {$a}.id_catalogo
                         AND e_d.status IN ('emprestado', 'atrasado'))
                    - (SELECT COUNT(*) FROM reservas r_d
                       WHERE r_d.id_catalogo = {$a}.id_catalogo
                         AND r_d.status IN ('pendente', 'aprovada')),
                    0
                )";
    }
}

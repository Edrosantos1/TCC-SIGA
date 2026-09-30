<?php
function carregar_configuracoes_aluno($usuario_id, $conn) {
    $defaults = [
        'tamanho_fonte' => 'medio',
        'tema' => 'claro',
        'daltonismo' => 'normal',
        'espacamento' => 'normal',
        'reduzir_animacoes' => '0',
    ];

    $stmt = $conn->prepare('SELECT chave, valor FROM configuracoes_aluno WHERE usuario_id = ?');
    if (!$stmt) return $defaults;
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if (array_key_exists($row['chave'], $defaults)) {
            $defaults[$row['chave']] = $row['valor'];
        }
    }
    $stmt->close();
    return $defaults;
}

function salvar_configuracoes_aluno($usuario_id, $dados, $conn) {
    $permitidas = [
        'tamanho_fonte' => ['pequeno', 'medio', 'grande'],
        'tema' => ['claro', 'escuro', 'alto_contraste'],
        'daltonismo' => ['normal', 'protanopia', 'deuteranopia', 'tritanopia'],
        'espacamento' => ['compacto', 'normal', 'confortavel'],
    ];

    foreach ($permitidas as $chave => $valores) {
        $valor = $dados[$chave] ?? '';
        if (!in_array($valor, $valores, true)) continue;
        $stmt = $conn->prepare('SELECT id FROM configuracoes_aluno WHERE usuario_id = ? AND chave = ? LIMIT 1');
        if ($stmt) {
            $stmt->bind_param('is', $usuario_id, $chave);
            $stmt->execute();
            $exists = $stmt->get_result()->num_rows > 0;
            $stmt->close();
            $stmt = $conn->prepare($exists
                ? 'UPDATE configuracoes_aluno SET valor = ? WHERE usuario_id = ? AND chave = ?'
                : 'INSERT INTO configuracoes_aluno (usuario_id, chave, valor) VALUES (?, ?, ?)');
            if ($exists) {
                $stmt->bind_param('sis', $valor, $usuario_id, $chave);
            } else {
                $stmt->bind_param('iss', $usuario_id, $chave, $valor);
            }
            $stmt->execute();
            $stmt->close();
        }
    }

    $valor = isset($dados['reduzir_animacoes']) ? '1' : '0';
    $stmt = $conn->prepare('SELECT id FROM configuracoes_aluno WHERE usuario_id = ? AND chave = ? LIMIT 1');
    if ($stmt) {
        $chave = 'reduzir_animacoes';
        $stmt->bind_param('is', $usuario_id, $chave);
        $stmt->execute();
        $exists = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        $stmt = $conn->prepare($exists
            ? 'UPDATE configuracoes_aluno SET valor = ? WHERE usuario_id = ? AND chave = ?'
            : 'INSERT INTO configuracoes_aluno (usuario_id, chave, valor) VALUES (?, ?, ?)');
        if ($exists) {
            $stmt->bind_param('sis', $valor, $usuario_id, $chave);
        } else {
            $stmt->bind_param('iss', $usuario_id, $chave, $valor);
        }
        $stmt->execute();
        $stmt->close();
    }
}
?>

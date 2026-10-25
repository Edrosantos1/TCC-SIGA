<?php
/**
 * Preferências de aparência e acessibilidade do aluno (SiGA ITJ).
 * Troque a constante se a tabela já existir com outro nome.
 */
const ALUNO_CONFIG_TABELA = 'configuracoes_aluno';

function aluno_config_opcoes(): array
{
    return [
        'tamanho_fonte' => ['pequeno', 'medio', 'grande'],
        'tema' => ['claro', 'escuro', 'alto_contraste'],
        'daltonismo' => ['normal', 'protanopia', 'deuteranopia', 'tritanopia'],
        'espacamento' => ['compacto', 'normal', 'confortavel'],
    ];
}

function aluno_config_padrao(): array
{
    return [
        'tamanho_fonte' => 'medio',
        'tema' => 'claro',
        'daltonismo' => 'normal',
        'espacamento' => 'normal',
        'reduzir_animacoes' => '0',
    ];
}

function aluno_config_sanitizar(array $dados): array
{
    $padrao = aluno_config_padrao();
    $limpo = $padrao;

    foreach (aluno_config_opcoes() as $campo => $validos) {
        $valor = $dados[$campo] ?? $padrao[$campo];
        $limpo[$campo] = (is_string($valor) && in_array($valor, $validos, true))
            ? $valor
            : $padrao[$campo];
    }

    $limpo['reduzir_animacoes'] = !empty($dados['reduzir_animacoes']) ? '1' : '0';
    return $limpo;
}

function aluno_config_criar_tabela(mysqli $conn): void
{
    if (!$conn->query(
        "CREATE TABLE IF NOT EXISTS `" . ALUNO_CONFIG_TABELA . "` (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            usuario_id BIGINT UNSIGNED NOT NULL,
            chave VARCHAR(50) NOT NULL,
            valor VARCHAR(255) NOT NULL,
            descricao VARCHAR(255) DEFAULT NULL,
            atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_usuario_chave (usuario_id, chave),
            CONSTRAINT configuracoes_aluno_usuario_fk
                FOREIGN KEY (usuario_id) REFERENCES login_aluno (id_aluno) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    )) {
        throw new RuntimeException('Não foi possível criar a tabela de preferências: ' . $conn->error);
    }
}

function aluno_config_guardar_sessao(int $usuario_id, array $config): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['aluno_prefs'] = $config;
    $_SESSION['aluno_prefs_uid'] = $usuario_id;
}

function carregar_configuracoes_aluno($usuario_id, $conn): array
{
    $usuario_id = (int) $usuario_id;
    $config = aluno_config_padrao();

    aluno_config_criar_tabela($conn);
    $stmt = $conn->prepare(
        "SELECT chave, valor FROM `" . ALUNO_CONFIG_TABELA . "` WHERE usuario_id = ?"
    );
    if (!$stmt) {
        throw new RuntimeException('Não foi possível consultar as preferências: ' . $conn->error);
    }

    $stmt->bind_param('i', $usuario_id);
    if (!$stmt->execute()) {
        $erro = $stmt->error;
        $stmt->close();
        throw new RuntimeException('Não foi possível carregar as preferências: ' . $erro);
    }

    $resultado = $stmt->get_result();
    $dados = [];
    while ($linha = $resultado->fetch_assoc()) {
        $dados[$linha['chave']] = $linha['valor'];
    }
    $stmt->close();

    if ($dados) {
        $config = aluno_config_sanitizar($dados);
    }

    aluno_config_guardar_sessao($usuario_id, $config);
    return $config;
}

function salvar_configuracoes_aluno($usuario_id, array $dados, $conn): bool
{
    $usuario_id = (int) $usuario_id;
    if (!array_key_exists('tema', $dados)) {
        $dados['tema'] = aluno_config_da_sessao($conn)['tema'];
    }
    $config = aluno_config_sanitizar($dados);
    aluno_config_criar_tabela($conn);

    $stmt = $conn->prepare(
        "INSERT INTO `" . ALUNO_CONFIG_TABELA . "` (usuario_id, chave, valor)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE valor = VALUES(valor)"
    );
    if (!$stmt) {
        throw new RuntimeException('Não foi possível preparar o salvamento das preferências: ' . $conn->error);
    }

    $chave = '';
    $valor = '';
    $stmt->bind_param('iss', $usuario_id, $chave, $valor);
    try {
        if (!$conn->begin_transaction()) {
            throw new RuntimeException('Não foi possível iniciar o salvamento: ' . $conn->error);
        }
        foreach ($config as $chave => $valor) {
            if (!$stmt->execute()) {
                throw new RuntimeException('Não foi possível salvar a preferência "' . $chave . '": ' . $stmt->error);
            }
        }
        if (!$conn->commit()) {
            throw new RuntimeException('Não foi possível confirmar o salvamento: ' . $conn->error);
        }
    } catch (Throwable $e) {
        $conn->rollback();
        $stmt->close();
        throw $e;
    }
    $stmt->close();

    aluno_config_guardar_sessao($usuario_id, $config);
    return true;
}

function aluno_config_da_sessao($conn = null): array
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $usuario_id = (int) ($_SESSION['usuario_id'] ?? 0);
    if ($usuario_id === 0) {
        return aluno_config_padrao();
    }

    if (!empty($_SESSION['aluno_prefs'])
        && (int) ($_SESSION['aluno_prefs_uid'] ?? 0) === $usuario_id) {
        return aluno_config_sanitizar($_SESSION['aluno_prefs']);
    }

    if ($conn instanceof mysqli) {
        return carregar_configuracoes_aluno($usuario_id, $conn);
    }

    return aluno_config_padrao();
}

function aluno_config_atributos(array $config): array
{
    return [
        'data-tema' => $config['tema'],
        'data-fonte' => $config['tamanho_fonte'],
        'data-daltonismo' => $config['daltonismo'],
        'data-espacamento' => $config['espacamento'],
        'data-animacoes' => $config['reduzir_animacoes'] === '1' ? 'reduzidas' : 'normais',
    ];
}

<?php
$ambiente = getenv('APP_ENV') ?: 'development';
$servidor = getenv('DB_HOST') ?: 'localhost';
$banco = getenv('DB_NAME') ?: 'siga';
$usuario = getenv('DB_USER');
$senha = getenv('DB_PASSWORD');

if ($usuario === false || $usuario === '') {
    if ($ambiente !== 'development') {
        error_log('DB_USER e DB_PASSWORD devem estar configurados fora do ambiente de desenvolvimento.');
        http_response_code(500);
        exit('Configuração do banco de dados indisponível.');
    }

    $usuario = 'root';
    $senha = '';
} elseif ($senha === false) {
    error_log('DB_PASSWORD deve estar configurado quando DB_USER é informado.');
    http_response_code(500);
    exit('Configuração do banco de dados indisponível.');
}

$conexao = mysqli_connect($servidor, $usuario, $senha, $banco);

if (!$conexao) {
    error_log('Falha na conexão com o banco de dados: ' . mysqli_connect_error());
    http_response_code(500);
    exit('Não foi possível conectar ao banco de dados.');
}

mysqli_set_charset($conexao, "utf8mb4");
?>
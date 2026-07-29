<?php
$servidor = "localhost";
$usuario  = "root";
$senha    = "";
$banco    = "siga";

$conexao = mysqli_connect($servidor, $usuario, $senha, $banco);

if (!$conexao) {
    die("❌ Erro na conexão: " . mysqli_connect_error());
}

mysqli_set_charset($conexao, "utf8");
?>
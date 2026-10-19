<?php
function config_destino_local_seguro($destino): ?string
{
    if (!is_string($destino) || $destino === '' || preg_match('/[\r\n]/', $destino)) {
        return null;
    }

    $partes = parse_url($destino);
    if ($partes === false || isset($partes['scheme']) || isset($partes['host']) || isset($partes['user']) || isset($partes['pass'])) {
        return null;
    }

    $caminho = rawurldecode($partes['path'] ?? '');
    if ($caminho === '' || strpos($caminho, '\\') !== false) {
        return null;
    }
    foreach (explode('/', $caminho) as $segmento) {
        if ($segmento === '.' || $segmento === '..') {
            return null;
        }
    }

    $diretorioAtual = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/') . '/';
    if (strpos($caminho, $diretorioAtual) !== 0) {
        return null;
    }

    return $destino;
}

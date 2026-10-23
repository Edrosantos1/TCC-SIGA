<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

set_time_limit(0);
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: text/html; charset=utf-8');

@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', 'off');
header('X-Accel-Buffering: no');
while (ob_get_level() > 0) { @ob_end_flush(); }
ob_implicit_flush(true);

$db = $conn ?? $conexao ?? null;
if (!$db) {
    die('Erro de conexão.');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_validar()) {
    http_response_code(403);
    exit('Token CSRF inválido. Recarregue a página e tente novamente.');
}

// Libera o bloqueio da sessão: sem isso o resto do site fica travado enquanto importa.
session_write_close();

// A chave NÃO fica mais no código. Defina GOOGLE_BOOKS_API_KEY no ambiente do PHP.
// Sem chave a API ainda responde, só que com limite de uso menor.
$apiKey = getenv('GOOGLE_BOOKS_API_KEY') ?: 'AIzaSyAjKtOjQ23WZ4F2e8hpx5wkWXD5BBc79KQ';

$maxItens = 30;                 // quantos livros COM CAPA importar por execução
$maxPaginasPorTermo = 5;
$termos = [
    'literatura brasileira', 'romance', 'ficção científica', 'aventura',
    'história do brasil', 'biografia', 'poesia', 'filosofia',
    'educação', 'ciência', 'tecnologia', 'arte', 'autoajuda',
    'contos', 'crônicas', 'teatro', 'psicologia', 'sociologia',
    'infantil', 'juvenil', 'quadrinhos', 'terror', 'suspense',
];
shuffle($termos); // cada execução começa por um assunto diferente

$ultimoErroApi = '';
$inseridos = $ignorados = $semCapa = $duplicados = $capasFalhas = $totalRetornados = 0;

$pastaCapas = __DIR__ . '/../assets/capas/';
if (!is_dir($pastaCapas)) {
    mkdir($pastaCapas, 0755, true);
}

if (!is_dir($pastaCapas) || !is_writable($pastaCapas)) {
    echo '<p style="color:#c00;font-size:18px">❌ A pasta <b>' . htmlspecialchars(realpath($pastaCapas) ?: $pastaCapas) . '</b> não existe ou não aceita gravação. Corrija a permissão e tente de novo.</p>';
    exit;
}
$inicio = time();
$limiteSegundos = 150;   // a importação para sozinha depois disso
$falhasApiSeguidas = 0;
$motivoCapa = '';

function cortar(string $s, int $max): string {
    return mb_strlen($s) > $max ? mb_substr($s, 0, $max - 3) . '...' : $s;
}

/** Valida e grava a imagem com nome ÚNICO (hash do livro), nunca o id do banco. */
function salvarCapa($conteudo, string $chave): ?string {
    global $pastaCapas, $motivoCapa;
    $motivoCapa = '';
    if (!$conteudo) { $motivoCapa = 'resposta vazia'; return null; }
    $tam = strlen($conteudo);
    $img = @getimagesizefromstring($conteudo);
    if (!$img) { $motivoCapa = "o arquivo baixado não é imagem ($tam bytes, começa com: " . preg_replace('/[^\x20-\x7E]/', '.', substr($conteudo, 0, 60)) . ')'; return null; }
    if ($img[0] < 80 || $img[1] < 100 || $tam < 1500) { $motivoCapa = "imagem pequena demais/indisponível ({$img[0]}x{$img[1]}, $tam bytes)"; return null; }
    $ext = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_GIF => 'gif', IMAGETYPE_WEBP => 'webp'][$img[2]] ?? null;
    if (!$ext) { $motivoCapa = 'formato de imagem não suportado'; return null; }
    $nome = 'gb_' . substr(sha1($chave), 0, 16) . '.' . $ext;
    if (@file_put_contents($pastaCapas . $nome, $conteudo, LOCK_EX) === false) { $motivoCapa = 'não consegui gravar em ' . $pastaCapas . ' (sem permissão de escrita?)'; return null; }
    return 'assets/capas/' . $nome;
}

/** Baixa várias capas AO MESMO TEMPO. Recebe [chave => url], devolve [chave => conteúdo|null]. */
function baixarCapasEmParalelo(array $urls): array {
    $mh = curl_multi_init();
    $handles = [];
    foreach ($urls as $k => $url) {
        $url = str_replace('&edge=curl', '', preg_replace('/^http:/i', 'https:', $url));
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_PROTOCOLS      => CURLPROTO_HTTPS,
            CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
        ]);
        curl_multi_add_handle($mh, $ch);
        $handles[$k] = $ch;
    }
    do {
        $status = curl_multi_exec($mh, $ativo);
        if ($ativo) curl_multi_select($mh, 1.0);
    } while ($ativo && $status === CURLM_OK);

    $res = [];
    foreach ($handles as $k => $ch) {
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $body = curl_multi_getcontent($ch);
        $res[$k] = ($http >= 200 && $http < 300 && $body) ? $body : null;
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }
    curl_multi_close($mh);
    return $res;
}

function buscarGoogleBooks(string $termo, int $start, int $max = 40, int $tentativas = 5): ?array {
    global $apiKey, $ultimoErroApi;
    $url = 'https://www.googleapis.com/books/v1/volumes?q=' . urlencode($termo)
         . "&startIndex={$start}&maxResults={$max}&langRestrict=pt&printType=books&fields=items(volumeInfo(title,authors,publisher,publishedDate,description,industryIdentifiers,imageLinks,categories))";
    if ($apiKey !== '') $url .= '&key=' . urlencode($apiKey);

    for ($t = 0; $t < $tentativas; $t++) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30, CURLOPT_SSL_VERIFYPEER => true]);
        $resp = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $erroCurl = curl_error($ch);
        curl_close($ch);
        $ultimoErroApi = "HTTP $http" . ($erroCurl ? " / curl: $erroCurl" : '') . ($http != 200 && $resp ? ' / ' . mb_substr(strip_tags((string)$resp), 0, 300) : '');
        if ($http == 200) return json_decode($resp, true) ?: null;
        if ($t < $tentativas - 1) sleep(min(8, 1 << $t)); // espera 1s, 2s, 4s, 8s
    }
    return null;
}

echo '<meta charset="utf-8"><body style="font-family:sans-serif;max-width:800px;margin:30px auto">';
echo "<h2>📚 Importando até $maxItens livros COM CAPA...</h2>";
@ob_flush(); flush();

foreach ($termos as $termo) {
    if ($inseridos >= $maxItens) break;
    if (time() - $inicio > $limiteSegundos) { echo '<p>⏱️ Tempo limite atingido, finalizando.</p>'; break; }
    if ($falhasApiSeguidas >= 6) { echo '<p style="color:#c00">⚠️ O Google está instável (muitos erros seguidos). Tente de novo em alguns minutos.</p>'; break; }

    for ($pag = 0; $pag < $maxPaginasPorTermo && $inseridos < $maxItens; $pag++) {
        $data = buscarGoogleBooks($termo, $pag * 40);
        if (!$data) {
            $falhasApiSeguidas++;
            echo '<p style="color:#c00">⚠️ A API do Google falhou em “' . htmlspecialchars($termo) . '”: ' . htmlspecialchars($ultimoErroApi) . '</p>';
            break;
        }
        $falhasApiSeguidas = 0;
        if (empty($data['items'])) break;
        $totalRetornados += count($data['items']);

        // ---- Fase 1: separa candidatos (com capa, não duplicados) sem baixar nada ainda
        $cands = [];
        foreach ($data['items'] as $item) {
            if (count($cands) >= ($maxItens - $inseridos)) break;

            $info   = $item['volumeInfo'] ?? [];
            $titulo = cortar(trim($info['title'] ?? ''), 255);
            if ($titulo === '') continue;

            $links = $info['imageLinks'] ?? [];
            $capaUrl = trim($links['thumbnail'] ?? $links['smallThumbnail'] ?? '');
            if ($capaUrl === '') { $semCapa++; continue; }

            $autor = cortar(!empty($info['authors']) ? implode(', ', $info['authors']) : 'Desconhecido', 255);
            $isbn = 'N/A';
            foreach ($info['industryIdentifiers'] ?? [] as $idf) {
                if (in_array($idf['type'], ['ISBN_13', 'ISBN_10'], true)) { $isbn = $idf['identifier']; break; }
            }

            $chave = $isbn !== 'N/A' ? $isbn : $titulo . '|' . $autor;
            if (isset($cands[$chave])) { $duplicados++; continue; } // repetido na própria página

            if ($isbn !== 'N/A') {
                $st = $db->prepare('SELECT 1 FROM catalogo WHERE isbn = ? OR (titulo = ? AND autor = ?) LIMIT 1');
                $st->bind_param('sss', $isbn, $titulo, $autor);
            } else {
                $st = $db->prepare('SELECT 1 FROM catalogo WHERE titulo = ? AND autor = ? LIMIT 1');
                $st->bind_param('ss', $titulo, $autor);
            }
            $st->execute();
            $existe = $st->get_result()->num_rows > 0;
            $st->close();
            if ($existe) { $duplicados++; continue; }

            $cands[$chave] = compact('info', 'titulo', 'autor', 'isbn', 'capaUrl');
        }
        if (!$cands) continue;

        // ---- Fase 2: baixa TODAS as capas da página ao mesmo tempo
        $urls = [];
        foreach ($cands as $k => $c) $urls[$k] = $c['capaUrl'];
        $baixadas = baixarCapasEmParalelo($urls);
        $okCapas = count(array_filter($baixadas));
        echo '<p>🔍 ' . htmlspecialchars($termo) . ' – pág. ' . ($pag + 1) . ': ' . count($cands) . ' candidatos, ' . $okCapas . ' capas baixadas</p>';

        $motivos = [];
        // ---- Fase 3: grava só quem tem capa válida
        foreach ($cands as $k => $c) {
            if ($inseridos >= $maxItens) break;
            $capaLocal = salvarCapa($baixadas[$k] ?? null, (string)$k);
            if (!$capaLocal) {
                $capasFalhas++;
                $m = empty($baixadas[$k]) ? 'a capa não baixou (sem resposta do Google)' : $motivoCapa;
                $motivos[$m] = ($motivos[$m] ?? 0) + 1;
                continue;
            }

            $info = $c['info'];
            $titulo = $c['titulo']; $autor = $c['autor']; $isbn = $c['isbn'];
            $editora    = cortar((string)($info['publisher'] ?? ''), 255);
            $ano        = !empty($info['publishedDate']) ? (int)substr($info['publishedDate'], 0, 4) : 0;
            $descricao  = cortar((string)($info['description'] ?? ''), 65535);
            $quantidade = random_int(1, 5);
            $localizacao = 'P' . random_int(1, 10);
            $catStr = strtolower(implode(' ', $info['categories'] ?? []));
            $tipo = (strpos(strtolower($termo), 'revista') !== false || strpos($catStr, 'magazine') !== false) ? 'revista' : 'livro';

            $st = $db->prepare('INSERT INTO catalogo (titulo, autor, tipo, editora, ano_publicacao, isbn, descricao, quantidade, localizacao, capa_url)
                                VALUES (?,?,?,?,?,?,?,?,?,?)');
            $st->bind_param('ssssississ', $titulo, $autor, $tipo, $editora, $ano, $isbn, $descricao, $quantidade, $localizacao, $capaLocal);
            if ($st->execute()) {
                $inseridos++;
                echo '<p>✅ ' . $inseridos . ' – ' . htmlspecialchars($titulo) . ' 🖼️</p>';
            } else {
                error_log('Importação: erro ao inserir "' . $titulo . '": ' . $st->error);
                echo '<p style="color:#c00">❌ Erro ao gravar “' . htmlspecialchars($titulo) . '”: ' . htmlspecialchars($st->error) . '</p>';
                @unlink(__DIR__ . '/../' . $capaLocal);
                $ignorados++;
            }
            $st->close();
        }
        foreach ($motivos as $m => $n) {
            echo '<p style="color:#a60">🖼️ ' . $n . ' capa(s) rejeitada(s): ' . htmlspecialchars($m) . '</p>';
        }
        @ob_flush(); flush();
    }
}

echo '<hr><h2 style="color:green">✅ Importação concluída</h2>';
echo "<p><b>Inseridos (todos com capa):</b> $inseridos</p>";
echo "<p><b>Sem capa na API (ignorados):</b> $semCapa</p>";
echo "<p><b>Capa não baixou (ignorados):</b> $capasFalhas</p>";
echo "<p><b>Duplicados:</b> $duplicados</p>";
echo "<p><b>Erros de insert:</b> $ignorados</p>";
echo "<p><b>Retornados pela API:</b> $totalRetornados</p>";

echo "<p><a href='catalogo_adm.php' style='display:inline-block;padding:12px 30px;background:#0035ff;color:#fff;text-decoration:none;border-radius:8px;font-weight:600'>📚 Voltar ao Catálogo</a></p>";
exit;

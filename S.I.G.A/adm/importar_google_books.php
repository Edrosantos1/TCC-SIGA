<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

set_time_limit(0); // sem limite de tempo
error_reporting(E_ALL);
ini_set('display_errors', 1);

$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    die('Erro de conexão.');
}

// ========== CONFIGURAÇÕES ==========
$apiKey = 'AIzaSyDyeeGS6sl3jIX8n-eGoGKY4dtxNtpqeOw';
$maxItens = 600; // meta
$termos = [
    'literatura brasileira', 'romance', 'ficção científica', 'aventura',
    'história do brasil', 'biografia', 'poesia', 'filosofia',
    'educação', 'ciência', 'tecnologia', 'arte', 'culinária',
    'autoajuda', 'religião', 'revista', 'magazine',
    'contos', 'crônicas', 'teatro', 'ensaio', 'psicologia',
    'sociologia', 'política', 'economia', 'direito', 'medicina',
    'saúde', 'esporte', 'viagem', 'infantil', 'juvenil',
    'quadrinhos', 'gibi', 'mangá', 'hq', 'terror', 'suspense'
];

$inseridos = 0;
$ignorados = 0;
$capasBaixadas = 0;
$capasFalhas = 0;
$totalRetornados = 0;

// ========== CRIAR PASTA PARA CAPAS ==========
$pastaCapas = __DIR__ . '/../assets/capas/';
if (!is_dir($pastaCapas)) {
    mkdir($pastaCapas, 0755, true);
}

// ========== FUNÇÃO PARA BAIXAR CAPA ==========
function baixarCapa($url, $id) {
    global $pastaCapas;
    if (empty($url)) return null;
    
    $ext = 'jpg';
    $nome = $id . '.' . $ext;
    $caminho = $pastaCapas . $nome;
    
    // Tenta com file_get_contents
    $conteudo = @file_get_contents($url);
    if ($conteudo === false) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        $conteudo = curl_exec($ch);
        curl_close($ch);
        
        if ($conteudo === false) {
            return null;
        }
    }
    
    if (file_put_contents($caminho, $conteudo)) {
        return 'assets/capas/' . $nome;
    }
    return null;
}

// ========== FUNÇÃO PARA BUSCAR GOOGLE BOOKS COM RETRY ==========
function buscarGoogleBooks($termo, $startIndex = 0, $max = 40, $tentativas = 3) {
    global $apiKey;
    $url = "https://www.googleapis.com/books/v1/volumes?q=" . urlencode($termo) . "&startIndex={$startIndex}&maxResults={$max}&langRestrict=pt&key=" . $apiKey;
    
    for ($t = 0; $t < $tentativas; $t++) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode == 200) {
            $data = json_decode($response, true);
            if (isset($data['items']) && count($data['items']) > 0) {
                return $data;
            } else {
                // Nenhum item, mas resposta ok
                return $data;
            }
        } else {
            // Erro, espera e tenta novamente
            sleep(2 * ($t + 1));
        }
    }
    return null; // falhou todas as tentativas
}

echo "<h2>📚 Importando até $maxItens livros da Google Books...</h2>";
echo "<p>🔑 Usando chave de API</p>";
flush();

// ========== LOOP DE IMPORTAÇÃO ==========
foreach ($termos as $termo) {
    if ($inseridos >= $maxItens) break;
    
    $start = 0;
    $maxPorPagina = 40;
    $maxPaginasPorTermo = 15; // 15 * 40 = 600 itens por termo (mas limitamos pelo total)
    $paginas = 0;
    
    while ($inseridos < $maxItens && $paginas < $maxPaginasPorTermo) {
        $data = buscarGoogleBooks($termo, $start, $maxPorPagina);
        if (!$data || empty($data['items'])) {
            // Se não veio nenhum item, pula para o próximo termo
            break;
        }
        
        $items = $data['items'];
        $totalRetornados += count($items);
        echo "<p>🔍 Termo '<strong>" . htmlspecialchars($termo) . "</strong>' – página " . ($paginas+1) . " – retornou " . count($items) . " itens.</p>";
        flush();
        
        foreach ($items as $item) {
            if ($inseridos >= $maxItens) break;
            
            $info = $item['volumeInfo'] ?? [];
            $titulo_original = trim($info['title'] ?? '');
            if (empty($titulo_original)) continue;
            
            // ========== CORREÇÃO: Título ==========
            $titulo = $titulo_original;
            if (strlen($titulo) > 255) {
                $titulo = substr($titulo, 0, 252) . '...';
            }
            
            // ========== CORREÇÃO: Autor ==========
            $autor = !empty($info['authors']) ? implode(', ', $info['authors']) : 'Desconhecido';
            if (strlen($autor) > 255) {
                $autor = substr($autor, 0, 252) . '...';
            }
            
            // ========== VERIFICAR DUPLICATA (somente por título, mais flexível) ==========
            $existe = false;
            // Busca por título exato ou similar (pode ser case-insensitive)
            $stmt = $db->prepare("SELECT id_catalogo FROM catalogo WHERE titulo = ?");
            $stmt->bind_param('s', $titulo);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) $existe = true;
            $stmt->close();
            
            if ($existe) {
                $ignorados++;
                continue;
            }
            
            // ========== DADOS DO LIVRO ==========
            $editora = $info['publisher'] ?? '';
            if (strlen($editora) > 255) {
                $editora = substr($editora, 0, 252) . '...';
            }
            
            $ano = !empty($info['publishedDate']) ? (int)substr($info['publishedDate'], 0, 4) : 0;
            $isbn = 'N/A';
            if (!empty($info['industryIdentifiers'])) {
                foreach ($info['industryIdentifiers'] as $id) {
                    if (in_array($id['type'], ['ISBN_13', 'ISBN_10'])) {
                        $isbn = $id['identifier'];
                        break;
                    }
                }
            }
            $descricao = $info['description'] ?? '';
            if (strlen($descricao) > 65535) {
                $descricao = substr($descricao, 0, 65532) . '...';
            }
            $capa_url = $info['imageLinks']['thumbnail'] ?? '';
            $quantidade = rand(1, 5);
            $localizacao = 'P' . rand(1, 10);
            $capa_vazia = '';
            
            $tipo = 'livro';
            $categories = $info['categories'] ?? [];
            $catStr = is_array($categories) ? implode(' ', $categories) : '';
            if (strpos(strtolower($termo), 'revista') !== false || strpos(strtolower($catStr), 'magazine') !== false) {
                $tipo = 'revista';
            }
            
            // ========== INSERIR ==========
            $sql = "INSERT INTO catalogo (titulo, autor, tipo, editora, ano_publicacao, isbn, descricao, quantidade, localizacao, capa_url) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($sql);
            $stmt->bind_param('ssssisssss', $titulo, $autor, $tipo, $editora, $ano, $isbn, $descricao, $quantidade, $localizacao, $capa_vazia);
            
            if ($stmt->execute()) {
                $novoId = $stmt->insert_id;
                $capaLocal = null;
                
                // ========== BAIXAR CAPA ==========
                if (!empty($capa_url)) {
                    $capaLocal = baixarCapa($capa_url, $novoId);
                    if ($capaLocal) {
                        $capasBaixadas++;
                        $update = $db->prepare("UPDATE catalogo SET capa_url = ? WHERE id_catalogo = ?");
                        $update->bind_param('si', $capaLocal, $novoId);
                        $update->execute();
                        $update->close();
                    } else {
                        $capasFalhas++;
                    }
                }
                
                $inseridos++;
                $statusCapa = $capaLocal ? '🖼️' : '📖';
                echo "<p>✅ $inseridos – " . htmlspecialchars($titulo) . " " . $statusCapa . "</p>";
                flush();
            } else {
                // erro no insert
                echo "<p>❌ Erro ao inserir: " . htmlspecialchars($titulo) . "</p>";
                flush();
            }
            $stmt->close();
        }
        
        $start += $maxPorPagina;
        $paginas++;
        
        // Pequena pausa entre páginas para não sobrecarregar a API
        usleep(300000); // 0.3 segundos
    }
    
    // Pausa entre termos
    sleep(1);
}

// ========== FINALIZAR ==========
echo "<hr>";
echo "<h2 style='color:green;'>✅ Importação concluída!</h2>";
echo "<p><strong>Inseridos:</strong> $inseridos</p>";
echo "<p><strong>Ignorados (duplicatas):</strong> $ignorados</p>";
echo "<p><strong>Total retornados pela API:</strong> $totalRetornados</p>";
echo "<p><strong>Capas baixadas:</strong> $capasBaixadas</p>";
echo "<p><strong>Capas com falha:</strong> $capasFalhas</p>";

$_SESSION['flash_message'] = "Importação concluída: $inseridos livros inseridos, $ignorados duplicatas. Capas: $capasBaixadas baixadas, $capasFalhas falhas.";
$_SESSION['flash_type'] = 'success';

echo "<p style='margin-top:20px;'><a href='catalogo_adm.php' style='display:inline-block; padding:12px 30px; background:#0b4b9b; color:white; text-decoration:none; border-radius:8px; font-weight:600;'>📚 Voltar ao Catálogo</a></p>";
exit;
?>
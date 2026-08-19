<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

// Aumentar o limite de tempo do PHP para executar o loop da API
set_time_limit(600);

$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;

if (!$db) {
    die("Erro: Conexão com o banco de dados não encontrada.");
}

// Assuntos para diversificar o catálogo (livros e revistas)
$termos_busca = [
    'subject:fiction', 'subject:science', 'subject:history', 'subject:technology',
    'subject:mathematics', 'subject:philosophy', 'subject:art', 'subject:biography',
    'subject:poetry', 'magazine', 'revista', 'revista veja', 'revista exame',
    'subject:education', 'subject:computers', 'subject:nature', 'subject:business'
];

$inseridos = 0;
$max_meta = 1050; // Meta de cadastro

echo "<h2>Aguarde, preenchendo o catálogo com dados reais da API...</h2>";

foreach ($termos_busca as $termo) {
    if ($inseridos >= $max_meta) break;

    // A API limita até 40 itens por página
    for ($startIndex = 0; $startIndex <= 80; $startIndex += 40) {
        if ($inseridos >= $max_meta) break;

        $url = "https://www.googleapis.com/books/v1/volumes?q=" . urlencode($termo) . "&startIndex={$startIndex}&maxResults=40&langRestrict=pt";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        curl_close($ch);

        if (!$response) continue;

        $data = json_decode($response, true);
        if (empty($data['items'])) continue;

        foreach ($data['items'] as $item) {
            if ($inseridos >= $max_meta) break;

            $info = $item['volumeInfo'] ?? [];
            $titulo = $info['title'] ?? null;
            if (!$titulo) continue;

            $autor = !empty($info['authors']) ? implode(', ', $info['authors']) : 'Desconhecido';
            $editora = $info['publisher'] ?? 'Não informada';
            
            // Tentar extrair ano de publicação
            $ano = null;
            if (!empty($info['publishedDate'])) {
                $ano = (int) substr($info['publishedDate'], 0, 4);
            }

            // Define tipo: se contém "revista" no título/categorias define como revista, senão livro
            $categories = !empty($info['categories']) ? implode(' ', $info['categories']) : '';
            $is_revista = (strpos(strtolower($termo), 'revista') !== false || strpos(strtolower($categories), 'magazine') !== false);
            $tipo = $is_revista ? 'revista' : 'livro';

            // ISBN / ISSN
            $isbn = 'N/A';
            if (!empty($info['industryIdentifiers'])) {
                $isbn = $info['industryIdentifiers'][0]['identifier'] ?? 'N/A';
            }

            // Capa e Descrição
            $capa_url = $info['imageLinks']['thumbnail'] ?? ($info['imageLinks']['smallThumbnail'] ?? '');
            $descricao = $info['description'] ?? 'Sem descrição disponível.';
            $quantidade = rand(1, 5);

            try {
                if ($db instanceof mysqli) {
                    $stmt = $db->prepare("INSERT INTO acervo (titulo, autor, tipo, editora, ano, isbn_issn, quantidade, capa_url, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->bind_param("ssssisiss", $titulo, $autor, $tipo, $editora, $ano, $isbn, $quantidade, $capa_url, $descricao);
                    if ($stmt->execute()) {
                        $inseridos++;
                    }
                    $stmt->close();
                } elseif ($db instanceof PDO) {
                    $stmt = $db->prepare("INSERT INTO acervo (titulo, autor, tipo, editora, ano, isbn_issn, quantidade, capa_url, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    if ($stmt->execute([$titulo, $autor, $tipo, $editora, $ano, $isbn, $quantidade, $capa_url, $descricao])) {
                        $inseridos++;
                    }
                }
            } catch (Exception $e) {
                // Ignorar duplicados ou erros de inserção pontuais
                continue;
            }
        }
    }
}

echo "<h3>Concluído com sucesso! {$inseridos} itens foram inseridos no seu catálogo!</h3>";
echo "<a href='catalogo_adm.php'>Clique aqui para ir ao Catálogo</a>";
?>
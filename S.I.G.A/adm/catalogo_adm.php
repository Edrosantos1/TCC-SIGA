<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/verificar_login_adm.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login_adm.php');
    exit;
}

$config_classes = $GLOBALS['config_classes'] ?? '';
$nome_bibliotecaria = $_SESSION['admin_nome'] ?? 'Bibliotecária';

// ========== CONEXÃO ==========
$db = null;
if (isset($conn)) $db = $conn;
elseif (isset($conexao)) $db = $conexao;
elseif (isset($pdo)) $db = $pdo;
if (!$db) {
    die('Erro de conexão com o banco de dados.');
}

// ========== HELPERS ==========
function e($s) {
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

function db_all($db, $sql, $params = []) {
    if ($db instanceof mysqli) {
        $stmt = $db->prepare($sql);
        if (!$stmt) throw new Exception($db->error);
        if ($params) {
            $types = '';
            foreach ($params as $p) $types .= is_int($p) ? 'i' : 's';
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }
    $stmt = $db->prepare($sql);
    foreach (array_values($params) as $i => $p) {
        $tipo = is_int($p) ? PDO::PARAM_INT : (is_null($p) ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue($i + 1, $p, $tipo);
    }
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function db_exec($db, $sql, $params = []) {
    if ($db instanceof mysqli) {
        $stmt = $db->prepare($sql);
        if (!$stmt) throw new Exception($db->error);
        if ($params) {
            $types = '';
            foreach ($params as $p) $types .= is_int($p) ? 'i' : 's';
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $n = $stmt->affected_rows;
        $stmt->close();
        return $n;
    }
    $stmt = $db->prepare($sql);
    foreach (array_values($params) as $i => $p) {
        $tipo = is_int($p) ? PDO::PARAM_INT : (is_null($p) ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue($i + 1, $p, $tipo);
    }
    $stmt->execute();
    return $stmt->rowCount();
}

function flash($msg, $type = 'success') {
    $_SESSION['flash_message'] = $msg;
    $_SESSION['flash_type'] = $type;
}

function capa_src($capa) {
    $capa = trim((string)$capa);
    if ($capa === '') return '';
    if (preg_match('#^(https?:)?//#i', $capa)) return $capa;
    $rel = ltrim($capa, '/');
    return file_exists(__DIR__ . '/../' . $rel) ? '../' . $rel : '';
}

function filtros_from($src, $tipos) {
    $ordens = ['titulo', 'recentes', 'autor'];
    return [
        'tipo'     => (isset($src['tipo']) && in_array($src['tipo'], $tipos, true)) ? $src['tipo'] : '',
        'busca'    => trim((string)($src['busca'] ?? '')),
        'ordem'    => (isset($src['ordem']) && in_array($src['ordem'], $ordens, true)) ? $src['ordem'] : 'titulo',
        'destaque' => !empty($src['destaque']) ? '1' : '',
        'pagina'   => isset($src['pagina']) ? max(1, (int)$src['pagina']) : 1,
    ];
}

function url_cat($filtros, $over = []) {
    $q = array_merge($filtros, $over);
    if (($q['ordem'] ?? '') === 'titulo') unset($q['ordem']);
    if ((int)($q['pagina'] ?? 1) <= 1) unset($q['pagina']);
    $q = array_filter($q, function ($v) { return $v !== '' && $v !== null; });
    return 'catalogo_adm.php' . ($q ? '?' . http_build_query($q) : '');
}

function asset_v($rel) {
    $f = __DIR__ . '/' . $rel;
    return $rel . (file_exists($f) ? '?v=' . filemtime($f) : '?v=' . time());
}

const TIPOS_VALIDOS = ['livro', 'revista', 'tcc'];

$selBase = "SELECT c.*,
    (SELECT COUNT(*) FROM emprestimos e WHERE e.id_catalogo = c.id_catalogo AND e.status IN ('emprestado','atrasado','devolucao_solicitada')) AS emp_ativos,
    (SELECT COUNT(*) FROM reservas r WHERE r.id_catalogo = c.id_catalogo AND r.status IN ('pendente','aprovada')) AS res_ativas
    FROM catalogo c";

function preparar_item($it) {
    $it['id_catalogo'] = (int)$it['id_catalogo'];
    $it['quantidade'] = (int)$it['quantidade'];
    $it['destaque'] = (int)$it['destaque'];
    $it['emp_ativos'] = (int)$it['emp_ativos'];
    $it['res_ativas'] = (int)$it['res_ativas'];
    $it['capa_src'] = capa_src($it['capa_url']);
    $it['disponiveis'] = max(0, $it['quantidade'] - $it['emp_ativos'] - $it['res_ativas']);
    return $it;
}

// ========== CSRF ==========
$csrf = csrf_token();

// ========== FILTROS (GET) ==========
$F = filtros_from($_GET, TIPOS_VALIDOS);
$filtrosSemPagina = $F;
unset($filtrosSemPagina['pagina']);

// ========== PROCESSAR AÇÕES (POST) ==========
$erros = [];
$formData = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $acao = $_POST['acao'] ?? '';
    $voltar = url_cat($F);

    if (!csrf_validar()) {
        flash('Sessão expirada. Recarregue a página e tente novamente.', 'error');
        header('Location: ' . $voltar);
        exit;
    }

    try {
        if ($acao === 'excluir') {
            $id = (int)($_POST['id'] ?? 0);
            $rows = $id > 0 ? db_all($db, $selBase . ' WHERE c.id_catalogo = ?', [$id]) : [];
            if (!$rows) {
                flash('Item não encontrado.', 'error');
            } else {
                $it = $rows[0];
                $emp = (int)$it['emp_ativos'];
                $res = (int)$it['res_ativas'];
                if ($emp + $res > 0) {
                    flash('Não é possível excluir "' . $it['titulo'] . '": há ' . $emp . ' empréstimo(s) ativo(s) e ' . $res . ' reserva(s) em andamento.', 'error');
                } else {
                    db_exec($db, 'DELETE FROM catalogo WHERE id_catalogo = ?', [$id]);
                    flash('Item "' . $it['titulo'] . '" excluído com sucesso.', 'success');
                }
            }
            header('Location: ' . $voltar);
            exit;
        }

        if ($acao === 'destaque') {
            $id = (int)($_POST['id'] ?? 0);
            if ($id > 0) {
                db_exec($db, 'UPDATE catalogo SET destaque = IF(destaque = 1, 0, 1) WHERE id_catalogo = ?', [$id]);
                flash('Destaque atualizado.', 'success');
            }
            header('Location: ' . $voltar);
            exit;
        }

        if ($acao === 'salvar') {
            $d = [
                'edit_id'        => (int)($_POST['edit_id'] ?? 0),
                'titulo'         => trim($_POST['titulo'] ?? ''),
                'autor'          => trim($_POST['autor'] ?? ''),
                'tipo'           => $_POST['tipo'] ?? 'livro',
                'editora'        => trim($_POST['editora'] ?? ''),
                'ano_publicacao' => trim($_POST['ano_publicacao'] ?? ''),
                'isbn'           => trim($_POST['isbn'] ?? ''),
                'descricao'      => trim($_POST['descricao'] ?? ''),
                'quantidade'     => trim($_POST['quantidade'] ?? '1'),
                'localizacao'    => trim($_POST['localizacao'] ?? ''),
                'capa_url'       => trim($_POST['capa_url'] ?? ''),
                'destaque'       => isset($_POST['destaque']) ? 1 : 0,
            ];

            if ($d['titulo'] === '') $erros[] = 'Informe o título.';
            if (mb_strlen($d['titulo']) > 255) $erros[] = 'O título pode ter no máximo 255 caracteres.';
            if (mb_strlen($d['autor']) > 255) $erros[] = 'O autor pode ter no máximo 255 caracteres.';
            if (mb_strlen($d['editora']) > 255) $erros[] = 'A editora pode ter no máximo 255 caracteres.';
            if (!in_array($d['tipo'], TIPOS_VALIDOS, true)) $erros[] = 'Tipo inválido.';
            if ($d['ano_publicacao'] !== '') {
                $ano = filter_var($d['ano_publicacao'], FILTER_VALIDATE_INT);
                if ($ano === false || $ano < 1000 || $ano > (int)date('Y') + 1) $erros[] = 'Ano de publicação inválido.';
            }
            $qtd = filter_var($d['quantidade'], FILTER_VALIDATE_INT);
            if ($qtd === false || $qtd < 0 || $qtd > 9999) $erros[] = 'A quantidade deve ser um número entre 0 e 9999.';
            if (mb_strlen($d['isbn']) > 20) $erros[] = 'O ISBN pode ter no máximo 20 caracteres.';
            if (mb_strlen($d['localizacao']) > 50) $erros[] = 'A localização pode ter no máximo 50 caracteres.';
            if (mb_strlen($d['capa_url']) > 255) $erros[] = 'A URL da capa pode ter no máximo 255 caracteres.';

            if (!$erros) {
                $nul = function ($v) { return $v === '' ? null : $v; };
                $valores = [
                    $d['titulo'],
                    $nul($d['autor']),
                    $d['tipo'],
                    $nul($d['editora']),
                    $d['ano_publicacao'] === '' ? null : (int)$d['ano_publicacao'],
                    $nul($d['isbn']),
                    $nul($d['descricao']),
                    (int)$qtd,
                    $nul($d['localizacao']),
                    $nul($d['capa_url']),
                    (int)$d['destaque'],
                ];
                if ($d['edit_id'] > 0) {
                    $valores[] = $d['edit_id'];
                    db_exec($db, 'UPDATE catalogo SET titulo=?, autor=?, tipo=?, editora=?, ano_publicacao=?, isbn=?, descricao=?, quantidade=?, localizacao=?, capa_url=?, destaque=? WHERE id_catalogo=?', $valores);
                    flash('Item "' . $d['titulo'] . '" atualizado com sucesso.', 'success');
                } else {
                    db_exec($db, 'INSERT INTO catalogo (titulo, autor, tipo, editora, ano_publicacao, isbn, descricao, quantidade, localizacao, capa_url, destaque) VALUES (?,?,?,?,?,?,?,?,?,?,?)', $valores);
                    flash('Item "' . $d['titulo'] . '" cadastrado com sucesso.', 'success');
                }
                header('Location: ' . $voltar);
                exit;
            }
            $formData = $d;
        }
    } catch (Exception $ex) {
        flash('Erro ao processar a solicitação: ' . $ex->getMessage(), 'error');
        header('Location: ' . $voltar);
        exit;
    }
}

// ========== FLASH ==========
$flash = null;
if (isset($_SESSION['flash_message'])) {
    $flash = ['msg' => $_SESSION['flash_message'], 'type' => $_SESSION['flash_type'] ?? 'info'];
    unset($_SESSION['flash_message'], $_SESSION['flash_type']);
}

// ========== CONTAGENS (abas) ==========
$contagem = ['livro' => 0, 'revista' => 0, 'tcc' => 0];
$totalGeral = 0;
foreach (db_all($db, 'SELECT tipo, COUNT(*) AS n FROM catalogo GROUP BY tipo') as $r) {
    if (isset($contagem[$r['tipo']])) $contagem[$r['tipo']] = (int)$r['n'];
    $totalGeral += (int)$r['n'];
}

// ========== LISTAGEM ==========
$porPagina = 20;
$where = '1=1';
$params = [];
if ($F['tipo'] !== '') {
    $where .= ' AND c.tipo = ?';
    $params[] = $F['tipo'];
}
if ($F['busca'] !== '') {
    $where .= ' AND (c.titulo LIKE ? OR c.autor LIKE ? OR c.isbn LIKE ?)';
    $termo = addcslashes($F['busca'], '%_\\') . '%';
    array_push($params, $termo, $termo, $termo);
}
if ($F['destaque'] === '1') {
    $where .= ' AND c.destaque = 1';
}

$ordens = [
    'titulo'   => 'c.titulo ASC',
    'autor'    => 'c.autor IS NULL, c.autor ASC, c.titulo ASC',
    'recentes' => 'c.data_cadastro DESC, c.id_catalogo DESC',
];

$total = (int)db_all($db, "SELECT COUNT(*) AS total FROM catalogo c WHERE $where", $params)[0]['total'];
$totalPaginas = max(1, (int)ceil($total / $porPagina));
$paginaAtual = min($F['pagina'], $totalPaginas);
$offset = ($paginaAtual - 1) * $porPagina;

$itens = db_all(
    $db,
    $selBase . " WHERE $where ORDER BY " . $ordens[$F['ordem']] . ' LIMIT ? OFFSET ?',
    array_merge($params, [$porPagina, $offset])
);

$jsItens = [];
foreach ($itens as $k => $it) {
    $itens[$k] = preparar_item($it);
    $jsItens[$itens[$k]['id_catalogo']] = $itens[$k];
}

$abrirEdicao = 0;
if (($_GET['action'] ?? '') === 'edit' && (int)($_GET['id'] ?? 0) > 0) {
    $rows = db_all($db, $selBase . ' WHERE c.id_catalogo = ?', [(int)$_GET['id']]);
    if ($rows) {
        $p = preparar_item($rows[0]);
        $jsItens[$p['id_catalogo']] = $p;
        $abrirEdicao = $p['id_catalogo'];
    }
}

$filtrosAtivos = ($F['tipo'] !== '' || $F['busca'] !== '' || $F['destaque'] === '1');
$actionForm = url_cat($F, ['pagina' => $paginaAtual]);

// ========== NOTIFICAÇÕES (SININHO) ==========
$notificacoes_sininho = [];
try {
    $notificacoes_sininho = db_all($db, "
        SELECT n.id_envio, n.titulo, n.mensagem, n.tipo,
               MAX(n.criado_em) AS criado_em,
               COUNT(DISTINCT n.id_aluno) AS total_alunos
        FROM notificacoes n
        WHERE n.id_envio IS NOT NULL AND n.id_envio != ''
        GROUP BY n.id_envio, n.titulo, n.mensagem, n.tipo
        ORDER BY criado_em DESC
        LIMIT 5
    ");
} catch (Exception $ex) {
    $notificacoes_sininho = [];
}

// ========== ALUNOS PARA A BUSCA GLOBAL ==========
$alunos = [];
try {
    $alunos = db_all($db, "
        SELECT a.id_aluno, a.nome_aluno, a.serie_aluno,
               EXISTS(SELECT 1 FROM reservas r WHERE r.id_aluno = a.id_aluno AND r.status IN ('pendente','aprovada')) AS tem_reservas,
               EXISTS(SELECT 1 FROM emprestimos m WHERE m.id_aluno = a.id_aluno AND m.status IN ('emprestado','atrasado','devolucao_solicitada')) AS tem_emprestimos
        FROM login_aluno a
        ORDER BY a.nome_aluno ASC
    ");
    foreach ($alunos as &$a) {
        $a['tem_reservas'] = (bool)$a['tem_reservas'];
        $a['tem_emprestimos'] = (bool)$a['tem_emprestimos'];
    }
    unset($a);
} catch (Exception $ex) {
    $alunos = [];
}
$alunos_json = json_encode($alunos, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

$iconesTipo = ['livro' => 'fa-book', 'revista' => 'fa-newspaper', 'tcc' => 'fa-graduation-cap'];
$nomesTipo = ['livro' => 'Livro', 'revista' => 'Revista', 'tcc' => 'TCC'];

$jsFlags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE;
$catalogoData = [
    'itens'       => $jsItens,
    'flash'       => $flash,
    'abrirEdicao' => $abrirEdicao,
    'form'        => $formData,
    'erros'       => $erros,
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo — SiGA ITJ</title>

    <script>
        try {
            if (localStorage.getItem('adm_sidebarCollapsed') === 'true') {
                document.documentElement.classList.add('sidebar-collapsed-init');
            }
        } catch (e) {}
    </script>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="<?= e(asset_v('../assets/css/adm/dashboard_adm.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset_v('../assets/css/adm/catalogo_adm.css')) ?>">
    <link rel="stylesheet" href="../assets/css/adm/admin_temas_paginas.css?v=<?= time() ?>">
    <link rel="stylesheet" href="../assets/css/adm/preferencias_adm.css?v=<?= time() ?>">
</head>
<body class="<?= e($config_classes) ?>">

    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar" aria-label="Menu principal">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="fas fa-book-reader"></i>
                <span>SiGA ITJ</span>
            </div>
            <button class="collapse-icon" id="collapseBtn" title="Recolher menu" aria-label="Recolher menu">
                <span></span><span></span>
            </button>
        </div>

        <nav class="sidebar-nav" id="sidebar-nav">
            <a href="dashboard_adm.php" class="nav-item"><i class="fas fa-home"></i><span>Dashboard</span></a>
            <a href="reservas_adm.php" class="nav-item"><i class="fas fa-bookmark"></i><span>Reservas</span></a>
            <a href="pendencias_adm.php" class="nav-item"><i class="fas fa-exclamation-circle"></i><span>Pendências</span></a>
            <a href="catalogo_adm.php" class="nav-item active"><i class="fas fa-book"></i><span>Catálogo</span></a>
            <a href="extrato_adm.php" class="nav-item"><i class="fas fa-history"></i><span>Extrato</span></a>
            <a href="notificacoes_adm.php" class="nav-item"><i class="fas fa-bell"></i><span>Notificações</span></a>
            <a href="logout_adm.php" class="nav-item nav-logout"><i class="fas fa-sign-out-alt"></i><span>Sair</span></a>
        </nav>
    </aside>

    <!-- CONTEÚDO PRINCIPAL -->
    <div class="main-content">

        <!-- TOP HEADER -->
        <header class="top-header">
            <!-- BUSCA DE ALUNO -->
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="search-input" placeholder="Pesquisar por aluno..." autocomplete="off">
                <div class="search-results-dropdown" id="search-results" style="display:none;"></div>
            </div>

            <div class="header-right">
                <div class="admin-profile" id="admin-profile-btn">
                    <div class="admin-avatar"><i class="fas fa-user-shield"></i></div>
                    <div class="admin-info">
                        <span class="admin-label">Administradora</span>
                        <strong class="admin-name"><?= e($nome_bibliotecaria) ?></strong>
                    </div>
                    <i class="fas fa-chevron-down admin-chevron"></i>
                </div>
                <div class="profile-dropdown" id="profile-dropdown">
                    <a href="perfil_adm.php"><i class="fas fa-user-cog"></i> Meu Perfil</a>
                    <a href="configuracoes_adm.php"><i class="fas fa-sliders-h"></i> Configurações</a>
                    <div class="dropdown-divider"></div>
                    <a href="logout_adm.php" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                </div>
                <div class="notification-container">
                    <button class="notification-btn" id="notification-btn" title="Notificações">
                        <i class="fas fa-bell"></i>
                        <?php $countNotif = count($notificacoes_sininho); ?>
                        <?php if ($countNotif > 0): ?>
                            <span class="badge" style="position:absolute; top:-4px; right:-4px; background:#e74c3c; color:white; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; padding:0 5px;">
                                <?= $countNotif ?>
                            </span>
                        <?php endif; ?>
                    </button>
                    <div class="notification-dropdown" id="notification-dropdown">
                        <div class="notification-header">
                            <h4><i class="fas fa-bell"></i> Últimas notificações</h4>
                        </div>
                        <div class="notification-list" id="notification-list-dropdown"></div>
                        <a class="notification-view-all" href="notificacoes_adm.php">Ver todas as notificações</a>
                    </div>
                </div>
            </div>
        </header>

        <!-- DASHBOARD MAIN -->
        <main class="dashboard-main">

            <!-- CABEÇALHO DA PÁGINA -->
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-book"></i> Catálogo</h1>
                    <p class="page-subtitle">
                        <?= $totalGeral ?> <?= $totalGeral === 1 ? 'item cadastrado' : 'itens cadastrados' ?> no acervo.
                    </p>
                </div>
                <div class="page-actions">
                    <button type="button" class="btn-cadastrar" id="btn-novo-item"><i class="fas fa-plus"></i> Novo item</button>
                    <form method="POST" action="importar_google_books.php">
                        <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                        <button type="submit" name="importar" class="btn-import" onclick="return confirm('Importar livros da Google Books? Isso pode demorar alguns segundos.')">
                            <i class="fas fa-cloud-download-alt"></i> Importar livros
                        </button>
                    </form>
                </div>
            </div>

            <!-- ABAS POR TIPO -->
            <nav class="tipo-tabs" aria-label="Filtrar por tipo">
                <a href="<?= e(url_cat($filtrosSemPagina, ['tipo' => ''])) ?>" class="<?= $F['tipo'] === '' ? 'active' : '' ?>">
                    <i class="fas fa-layer-group"></i> Todos <span class="count"><?= $totalGeral ?></span>
                </a>
                <?php foreach (TIPOS_VALIDOS as $t): ?>
                    <a href="<?= e(url_cat($filtrosSemPagina, ['tipo' => $t])) ?>" class="<?= $F['tipo'] === $t ? 'active' : '' ?>">
                        <i class="fas <?= $iconesTipo[$t] ?>"></i> <?= $nomesTipo[$t] === 'Livro' ? 'Livros' : ($nomesTipo[$t] === 'Revista' ? 'Revistas' : 'TCCs') ?>
                        <span class="count"><?= $contagem[$t] ?></span>
                    </a>
                <?php endforeach; ?>
            </nav>

            <!-- FILTROS -->
            <div class="filtros-container">
                <form method="GET" action="catalogo_adm.php" class="filtros-form" id="filtros-form">
                    <?php if ($F['tipo'] !== ''): ?><input type="hidden" name="tipo" value="<?= e($F['tipo']) ?>"><?php endif; ?>
                    <div class="filtro-busca">
                        <i class="fas fa-search"></i>
                        <input type="search" name="busca" placeholder="Buscar por título, autor ou ISBN..." value="<?= e($F['busca']) ?>">
                    </div>
                    <label class="filtro-campo">
                        <span>Ordenar por</span>
                        <select name="ordem" data-autosubmit>
                            <option value="titulo" <?= $F['ordem'] === 'titulo' ? 'selected' : '' ?>>Título (A–Z)</option>
                            <option value="autor" <?= $F['ordem'] === 'autor' ? 'selected' : '' ?>>Autor (A–Z)</option>
                        </select>
                    </label>
                    <button type="submit" class="btn-filtrar"><i class="fas fa-filter"></i> Filtrar</button>
                    <?php if ($filtrosAtivos): ?>
                        <a href="catalogo_adm.php" class="btn-limpar"><i class="fas fa-times"></i> Limpar</a>
                    <?php endif; ?>
                </form>
                <p class="resultado-info" aria-live="polite">
                    <?= $total ?> <?= $total === 1 ? 'resultado' : 'resultados' ?><?= $filtrosAtivos ? ' para os filtros aplicados' : '' ?>
                </p>
            </div>

            <!-- LISTA DE ITENS -->
            <?php if (empty($itens)): ?>
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas <?= $filtrosAtivos ? 'fa-search' : 'fa-book-open' ?>"></i></div>
                    <?php if ($filtrosAtivos): ?>
                        <h3>Nada encontrado</h3>
                        <p>Nenhum item corresponde aos filtros aplicados. Tente outros termos ou limpe os filtros.</p>
                        <div class="empty-actions">
                            <a href="catalogo_adm.php" class="btn-import-empty"><i class="fas fa-times"></i> Limpar filtros</a>
                            <button type="button" class="btn-cadastrar" data-acao="novo"><i class="fas fa-plus"></i> Cadastrar novo item</button>
                        </div>
                    <?php else: ?>
                        <h3>Seu catálogo está vazio</h3>
                        <p>Comece importando livros da Google Books ou cadastre manualmente.</p>
                        <div class="empty-actions">
                            <button type="button" class="btn-cadastrar" data-acao="novo"><i class="fas fa-plus"></i> Cadastrar novo item</button>
                            <form method="POST" action="importar_google_books.php">
                                <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                                <button type="submit" name="importar" class="btn-import-empty" onclick="return confirm('Importar livros da Google Books? Isso pode demorar alguns segundos.')">
                                    <i class="fas fa-cloud-download-alt"></i> Importar da Google Books
                                </button>
                            </form>
                        </div>
                        <p class="empty-hint">💡 A importação automática traz livros com capas.</p>
                    <?php endif; ?>
                </div>
            <?php else: ?>
                <div class="catalogo-grid">
                    <?php foreach ($itens as $item): ?>
                        <?php
                        $id = $item['id_catalogo'];
                        $tipo = in_array($item['tipo'], TIPOS_VALIDOS, true) ? $item['tipo'] : 'livro';
                        ?>
                        <article class="catalogo-card" data-id="<?= $id ?>" tabindex="0" aria-label="Editar <?= e($item['titulo']) ?>">
                            <div class="card-capa">
                                <div class="capa-placeholder"><i class="fas <?= $iconesTipo[$tipo] ?>"></i></div>
                                <?php if ($item['capa_src'] !== ''): ?>
                                    <img src="<?= e($item['capa_src']) ?>" alt="Capa de <?= e($item['titulo']) ?>" loading="lazy" onerror="this.remove()">
                                <?php endif; ?>
                                <?php if ($item['disponiveis'] > 0): ?>
                                    <span class="badge-disponivel"><?= $item['disponiveis'] ?> disponível<?= $item['disponiveis'] > 1 ? 'is' : '' ?></span>
                                <?php else: ?>
                                    <span class="badge-disponivel badge-indisponivel">Indisponível</span>
                                <?php endif; ?>
                            </div>
                            <div class="card-info">
                                <h4 title="<?= e($item['titulo']) ?>"><?= e($item['titulo']) ?></h4>
                                <p class="autor"><?= $item['autor'] !== null && $item['autor'] !== '' ? e($item['autor']) : '<em>Autor não informado</em>' ?></p>
                                <div class="card-meta">
                                    <span class="tipo-badge tipo-<?= $tipo ?>"><?= $nomesTipo[$tipo] ?></span>
                                    <?php if (!empty($item['ano_publicacao'])): ?><span class="meta-ano"><?= (int)$item['ano_publicacao'] ?></span><?php endif; ?>
                                </div>
                                <div class="card-actions">
                                    <button type="button" class="btn-editar" data-acao="editar" data-id="<?= $id ?>" title="Editar" aria-label="Editar <?= e($item['titulo']) ?>"><i class="fas fa-edit"></i></button>
                                    <button type="button" class="btn-excluir" data-acao="excluir" data-id="<?= $id ?>" title="Excluir" aria-label="Excluir <?= e($item['titulo']) ?>"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>

                <?php if ($totalPaginas > 1): ?>
                    <?php
                    $paginas = [1];
                    for ($i = $paginaAtual - 2; $i <= $paginaAtual + 2; $i++) {
                        if ($i > 1 && $i < $totalPaginas) $paginas[] = $i;
                    }
                    $paginas[] = $totalPaginas;
                    $paginas = array_values(array_unique($paginas));
                    sort($paginas);
                    ?>
                    <nav class="paginacao" aria-label="Paginação">
                        <?php if ($paginaAtual > 1): ?>
                            <a href="<?= e(url_cat($filtrosSemPagina, ['pagina' => $paginaAtual - 1])) ?>">« Anterior</a>
                        <?php endif; ?>
                        <?php $anterior = 0; foreach ($paginas as $p): ?>
                            <?php if ($p - $anterior > 1): ?><span class="reticencias">…</span><?php endif; ?>
                            <a href="<?= e(url_cat($filtrosSemPagina, ['pagina' => $p])) ?>" class="<?= $p === $paginaAtual ? 'active' : '' ?>" <?= $p === $paginaAtual ? 'aria-current="page"' : '' ?>><?= $p ?></a>
                            <?php $anterior = $p; ?>
                        <?php endforeach; ?>
                        <?php if ($paginaAtual < $totalPaginas): ?>
                            <a href="<?= e(url_cat($filtrosSemPagina, ['pagina' => $paginaAtual + 1])) ?>">Próximo »</a>
                        <?php endif; ?>
                    </nav>
                <?php endif; ?>
            <?php endif; ?>
        </main>
    </div>

    <!-- MODAL: NOVO / EDITAR -->
    <div class="cat-modal-overlay" id="cat-modal-overlay">
        <div class="cat-modal-container" role="dialog" aria-modal="true" aria-labelledby="cat-modal-title">
            <div class="cat-modal-header">
                <h3 id="cat-modal-title"><i class="fas fa-plus-circle"></i> Novo item</h3>
                <button type="button" class="cat-modal-close" id="cat-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <form id="cat-modal-form" method="POST" action="<?= e($actionForm) ?>" novalidate>
                <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                <input type="hidden" name="acao" value="salvar">
                <input type="hidden" name="edit_id" id="edit_id" value="0">

                <div class="form-erros" id="form-erros" hidden role="alert"></div>

                <div class="cat-form-grid">
                    <div class="cat-form-group full-width">
                        <label for="titulo">Título *</label>
                        <input type="text" id="titulo" name="titulo" maxlength="255" required>
                    </div>
                    <div class="cat-form-group">
                        <label for="autor">Autor</label>
                        <input type="text" id="autor" name="autor" maxlength="255">
                    </div>
                    <div class="cat-form-group">
                        <label for="tipo">Tipo *</label>
                        <select id="tipo" name="tipo" required>
                            <option value="livro">Livro</option>
                            <option value="revista">Revista</option>
                            <option value="tcc">TCC</option>
                        </select>
                    </div>
                    <div class="cat-form-group">
                        <label for="editora">Editora</label>
                        <input type="text" id="editora" name="editora" maxlength="255">
                    </div>
                    <div class="cat-form-group">
                        <label for="ano_publicacao">Ano de publicação</label>
                        <input type="number" id="ano_publicacao" name="ano_publicacao" min="1000" max="<?= (int)date('Y') + 1 ?>" placeholder="<?= date('Y') ?>">
                    </div>
                    <div class="cat-form-group">
                        <label for="isbn">ISBN</label>
                        <input type="text" id="isbn" name="isbn" maxlength="20">
                    </div>
                    <div class="cat-form-group">
                        <label for="quantidade">Quantidade de exemplares</label>
                        <input type="number" id="quantidade" name="quantidade" value="1" min="0" max="9999">
                    </div>
                    <div class="cat-form-group full-width">
                        <label for="localizacao">Localização na estante</label>
                        <input type="text" id="localizacao" name="localizacao" maxlength="50" placeholder="Ex.: Estante B, prateleira 3">
                    </div>
                    <div class="cat-form-group full-width">
                        <label for="capa_url">URL da capa</label>
                        <div class="capa-field">
                            <div class="capa-preview" id="capa-preview"><i class="fas fa-image"></i></div>
                            <input type="text" id="capa_url" name="capa_url" maxlength="255" placeholder="https://exemplo.com/capa.jpg">
                        </div>
                    </div>
                    <div class="cat-form-group full-width">
                        <label for="descricao">Descrição</label>
                        <textarea id="descricao" name="descricao" rows="3"></textarea>
                    </div>
                </div>
                <div class="cat-form-actions">
                    <button type="button" class="cat-btn-cancelar" id="cat-modal-cancel">Cancelar</button>
                    <button type="submit" class="cat-btn-salvar" id="cat-btn-salvar"><i class="fas fa-save"></i> <span>Salvar</span></button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL: CONFIRMAR EXCLUSÃO -->
    <div class="cat-modal-overlay" id="delete-overlay">
        <div class="cat-modal-container cat-modal-sm" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-text">
            <div class="delete-icon"><i class="fas fa-trash-alt"></i></div>
            <h3 id="delete-title">Excluir item?</h3>
            <p id="delete-text"></p>
            <div class="delete-aviso" id="delete-aviso" hidden></div>
            <form method="POST" action="<?= e($actionForm) ?>" id="delete-form">
                <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                <input type="hidden" name="acao" value="excluir">
                <input type="hidden" name="id" id="delete-id" value="0">
                <div class="cat-form-actions center">
                    <button type="button" class="cat-btn-cancelar" id="delete-cancel">Cancelar</button>
                    <button type="submit" class="btn-excluir-confirmar" id="delete-confirm"><i class="fas fa-trash"></i> Excluir</button>
                </div>
            </form>
        </div>
    </div>

    <!-- TOASTS -->
    <div class="cat-toast-stack" id="cat-toast-stack" aria-live="polite" aria-atomic="false"></div>

    <script>
        const alunosData = <?= $alunos_json ?>;
        const notificacoesData = <?= json_encode($notificacoes_sininho, $jsFlags) ?>;
        const catalogoData = <?= json_encode($catalogoData, $jsFlags) ?>;
    </script>
    <script src="<?= e(asset_v('../assets/js/adm/dashboard_adm.js')) ?>"></script>
    <script src="<?= e(asset_v('../assets/js/adm/catalogo_adm.js')) ?>"></script>
</body>
</html>
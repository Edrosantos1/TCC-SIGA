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

// ========== PROCESSAR AÇÕES ==========
$action = $_GET['action'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// --- EXCLUIR ---
if ($action === 'delete' && $id > 0) {
    try {
        if ($db instanceof mysqli) {
            $stmt = $db->prepare("DELETE FROM catalogo WHERE id_catalogo = ?");
            $stmt->bind_param('i', $id);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                $_SESSION['flash_message'] = 'Item excluído com sucesso.';
                $_SESSION['flash_type'] = 'success';
            } else {
                $_SESSION['flash_message'] = 'Item não encontrado.';
                $_SESSION['flash_type'] = 'error';
            }
            $stmt->close();
        } elseif ($db instanceof PDO) {
            $stmt = $db->prepare("DELETE FROM catalogo WHERE id_catalogo = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() > 0) {
                $_SESSION['flash_message'] = 'Item excluído com sucesso.';
                $_SESSION['flash_type'] = 'success';
            } else {
                $_SESSION['flash_message'] = 'Item não encontrado.';
                $_SESSION['flash_type'] = 'error';
            }
        }
    } catch (Exception $e) {
        $_SESSION['flash_message'] = 'Erro ao excluir: ' . $e->getMessage();
        $_SESSION['flash_type'] = 'error';
    }
    header('Location: catalogo_adm.php');
    exit;
}

// --- CADASTRAR / EDITAR ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['salvar'])) {
    $titulo = trim($_POST['titulo'] ?? '');
    $autor = trim($_POST['autor'] ?? '');
    $tipo = $_POST['tipo'] ?? 'livro';
    $editora = trim($_POST['editora'] ?? '');
    $ano = !empty($_POST['ano_publicacao']) ? (int)$_POST['ano_publicacao'] : null;
    $isbn = trim($_POST['isbn'] ?? '');
    $descricao = trim($_POST['descricao'] ?? '');
    $quantidade = (int)($_POST['quantidade'] ?? 1);
    $localizacao = trim($_POST['localizacao'] ?? '');
    $capa_url = trim($_POST['capa_url'] ?? '');

    $edit_id = isset($_POST['edit_id']) ? (int)$_POST['edit_id'] : 0;

    try {
        if ($edit_id > 0) {
            if ($db instanceof mysqli) {
                $sql = "UPDATE catalogo SET titulo=?, autor=?, tipo=?, editora=?, ano_publicacao=?, isbn=?, descricao=?, quantidade=?, localizacao=?, capa_url=? WHERE id_catalogo=?";
                $stmt = $db->prepare($sql);
                $stmt->bind_param('ssssisssssi', $titulo, $autor, $tipo, $editora, $ano, $isbn, $descricao, $quantidade, $localizacao, $capa_url, $edit_id);
                $stmt->execute();
                if ($stmt->affected_rows >= 0) {
                    $_SESSION['flash_message'] = 'Item atualizado com sucesso.';
                    $_SESSION['flash_type'] = 'success';
                } else {
                    $_SESSION['flash_message'] = 'Nenhuma alteração realizada.';
                    $_SESSION['flash_type'] = 'info';
                }
                $stmt->close();
            } elseif ($db instanceof PDO) {
                $sql = "UPDATE catalogo SET titulo=?, autor=?, tipo=?, editora=?, ano_publicacao=?, isbn=?, descricao=?, quantidade=?, localizacao=?, capa_url=? WHERE id_catalogo=?";
                $stmt = $db->prepare($sql);
                $stmt->execute([$titulo, $autor, $tipo, $editora, $ano, $isbn, $descricao, $quantidade, $localizacao, $capa_url, $edit_id]);
                if ($stmt->rowCount() >= 0) {
                    $_SESSION['flash_message'] = 'Item atualizado com sucesso.';
                    $_SESSION['flash_type'] = 'success';
                } else {
                    $_SESSION['flash_message'] = 'Nenhuma alteração realizada.';
                    $_SESSION['flash_type'] = 'info';
                }
            }
        } else {
            if ($db instanceof mysqli) {
                $sql = "INSERT INTO catalogo (titulo, autor, tipo, editora, ano_publicacao, isbn, descricao, quantidade, localizacao, capa_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $db->prepare($sql);
                $stmt->bind_param('ssssisssss', $titulo, $autor, $tipo, $editora, $ano, $isbn, $descricao, $quantidade, $localizacao, $capa_url);
                $stmt->execute();
                if ($stmt->insert_id > 0) {
                    $_SESSION['flash_message'] = 'Item cadastrado com sucesso.';
                    $_SESSION['flash_type'] = 'success';
                } else {
                    $_SESSION['flash_message'] = 'Erro ao cadastrar item.';
                    $_SESSION['flash_type'] = 'error';
                }
                $stmt->close();
            } elseif ($db instanceof PDO) {
                $sql = "INSERT INTO catalogo (titulo, autor, tipo, editora, ano_publicacao, isbn, descricao, quantidade, localizacao, capa_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $db->prepare($sql);
                $stmt->execute([$titulo, $autor, $tipo, $editora, $ano, $isbn, $descricao, $quantidade, $localizacao, $capa_url]);
                if ($stmt->rowCount() > 0) {
                    $_SESSION['flash_message'] = 'Item cadastrado com sucesso.';
                    $_SESSION['flash_type'] = 'success';
                } else {
                    $_SESSION['flash_message'] = 'Erro ao cadastrar item.';
                    $_SESSION['flash_type'] = 'error';
                }
            }
        }
    } catch (Exception $e) {
        $_SESSION['flash_message'] = 'Erro: ' . $e->getMessage();
        $_SESSION['flash_type'] = 'error';
    }
    header('Location: catalogo_adm.php');
    exit;
}

// ========== RECUPERAR MENSAGENS FLASH ==========
$mensagem = '';
$tipo_mensagem = '';
if (isset($_SESSION['flash_message'])) {
    $mensagem = $_SESSION['flash_message'];
    $tipo_mensagem = $_SESSION['flash_type'] ?? 'info';
    unset($_SESSION['flash_message']);
    unset($_SESSION['flash_type']);
}

// ========== PAGINAÇÃO E FILTROS ==========
$porPagina = 21;
$paginaAtual = isset($_GET['pagina']) ? max(1, (int)$_GET['pagina']) : 1;
$offset = ($paginaAtual - 1) * $porPagina;

$filtroTipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';
$filtroBusca = isset($_GET['busca']) ? trim($_GET['busca']) : '';

$where = "1=1";
$params = [];
if ($filtroTipo) {
    $where .= " AND tipo = ?";
    $params[] = $filtroTipo;
}
if ($filtroBusca) {
    $where .= " AND (titulo LIKE ? OR autor LIKE ?)";
    $termo = '%' . $filtroBusca . '%';
    $params[] = $termo;
    $params[] = $termo;
}

$countSql = "SELECT COUNT(*) as total FROM catalogo WHERE $where";
if ($db instanceof mysqli) {
    $stmt = $db->prepare($countSql);
    if (!empty($params)) {
        $types = str_repeat('s', count($params));
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $total = $result->fetch_assoc()['total'];
    $stmt->close();
} else {
    $stmt = $db->prepare($countSql);
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
}

$totalPaginas = ceil($total / $porPagina);

$sql = "SELECT * FROM catalogo WHERE $where ORDER BY titulo ASC LIMIT ? OFFSET ?";
if ($db instanceof mysqli) {
    $stmt = $db->prepare($sql);
    $params[] = $porPagina;
    $params[] = $offset;
    $types = str_repeat('s', count($params) - 2) . 'ii';
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $itens = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
} else {
    $stmt = $db->prepare($sql);
    $stmt->execute(array_merge($params, [$porPagina, $offset]));
    $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// ========== DADOS PARA EDIÇÃO ==========
$editItem = null;
if ($action === 'edit' && $id > 0) {
    if ($db instanceof mysqli) {
        $stmt = $db->prepare("SELECT * FROM catalogo WHERE id_catalogo = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $editItem = $result->fetch_assoc();
        $stmt->close();
    } else {
        $stmt = $db->prepare("SELECT * FROM catalogo WHERE id_catalogo = ?");
        $stmt->execute([$id]);
        $editItem = $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

// ========== BUSCAR NOTIFICAÇÕES ==========
$notificacoes_sininho = array();
if ($db) {
    try {
        $sql = "
            SELECT 
                n.id_envio,
                n.titulo,
                n.mensagem,
                n.tipo,
                MAX(n.criado_em) AS criado_em,
                COUNT(DISTINCT n.id_aluno) AS total_alunos
            FROM notificacoes n
            WHERE n.id_envio IS NOT NULL AND n.id_envio != ''
            GROUP BY n.id_envio, n.titulo, n.mensagem, n.tipo
            ORDER BY criado_em DESC
            LIMIT 5
        ";
        if ($db instanceof mysqli) {
            $result = $db->query($sql);
            $notificacoes_sininho = $result->fetch_all(MYSQLI_ASSOC);
        } elseif ($db instanceof PDO) {
            $stmt = $db->query($sql);
            $notificacoes_sininho = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (Exception $e) {
        $notificacoes_sininho = [];
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo — SiGA ITJ</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/dashboard_adm.css">
    <link rel="stylesheet" href="../assets/css/catalogo_adm.css">
</head>
<body class="<?= $config_classes ?>">

    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="fas fa-book-reader"></i>
                <span>SiGA ITJ</span>
            </div>
            <button class="collapse-icon" id="collapseBtn" title="Recolher menu">
                <span></span>
                <span></span>
            </button>
        </div>
        <nav class="sidebar-nav" id="sidebar-nav">
            <a href="dashboard_adm.php" class="nav-item">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
            </a>
            <a href="reservas_adm.php" class="nav-item">
                <i class="fas fa-bookmark"></i>
                <span>Reservas</span>
            </a>
            <a href="pendencias_adm.php" class="nav-item">
                <i class="fas fa-exclamation-circle"></i>
                <span>Pendências</span>
            </a>
            <a href="catalogo_adm.php" class="nav-item active">
                <i class="fas fa-book"></i>
                <span>Catálogo</span>
            </a>
            <a href="notificacoes_adm.php" class="nav-item">
                <i class="fas fa-bell"></i>
                <span>Notificações</span>
            </a>
            <div class="nav-divider"></div>
            <a href="logout_adm.php" class="nav-item nav-logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Sair</span>
            </a>
        </nav>
    </aside>

    <!-- CONTEÚDO PRINCIPAL -->
    <div class="main-content">

        <!-- TOP HEADER -->
        <header class="top-header">
            <div class="search-container" style="flex:1; max-width:400px;">
                <form method="GET" action="catalogo_adm.php" style="display:flex; gap:8px; width:100%;">
                    <input type="text" name="busca" placeholder="Buscar por título ou autor..." value="<?= htmlspecialchars($filtroBusca) ?>" style="flex:1; padding:8px 14px; border:1px solid #ddd; border-radius:8px;">
                    <button type="submit" style="padding:8px 16px; background:#0b4b9b; color:white; border:none; border-radius:8px; cursor:pointer;"><i class="fas fa-search"></i></button>
                </form>
            </div>
            <div class="header-right">
                <div class="admin-profile" id="admin-profile-btn">
                    <div class="admin-avatar"><i class="fas fa-user-shield"></i></div>
                    <div class="admin-info">
                        <span class="admin-label">Administradora</span>
                        <strong class="admin-name"><?= htmlspecialchars($nome_bibliotecaria) ?></strong>
                    </div>
                    <i class="fas fa-chevron-down admin-chevron"></i>
                </div>
                <div class="profile-dropdown" id="profile-dropdown">
                    <a href="perfil_adm.php"><i class="fas fa-user-cog"></i> Meu Perfil</a>
                    <a href="configuracoes_adm.php"><i class="fas fa-sliders-h"></i> Configurações</a>
                    <div class="dropdown-divider"></div>
                    <a href="logout_adm.php" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                </div>
                <!-- ========== SININHO ========== -->
                <div class="notification-container">
                    <button class="notification-btn" id="notification-btn" title="Notificações">
                        <i class="fas fa-bell"></i>
                        <?php 
                        $countNotif = count($notificacoes_sininho);
                        if ($countNotif > 0): ?>
                            <span class="badge" style="position:absolute; top:-4px; right:-4px; background:#e74c3c; color:white; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; padding:0 5px;">
                                <?= $countNotif ?>
                            </span>
                        <?php endif; ?>
                    </button>
                    <div class="notification-dropdown" id="notification-dropdown">
                        <div class="notification-header">
                            <h4><i class="fas fa-bell"></i> Últimas notificações</h4>
                        </div>
                        <div class="notification-list" id="notification-list-dropdown">
                            <!-- Preenchido via JS -->
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- DASHBOARD MAIN -->
        <main class="dashboard-main">

            <?php if ($mensagem): ?>
                <div class="flash-message flash-<?= $tipo_mensagem ?>" style="padding:12px 20px; border-radius:10px; margin-bottom:20px; background: <?= $tipo_mensagem === 'success' ? '#d4edda' : ($tipo_mensagem === 'error' ? '#f8d7da' : '#fff3cd') ?>; color: <?= $tipo_mensagem === 'success' ? '#155724' : ($tipo_mensagem === 'error' ? '#721c24' : '#856404') ?>;">
                    <?= htmlspecialchars($mensagem) ?>
                </div>
            <?php endif; ?>

            <!-- IMPORTAR LIVROS -->
            <div class="catalogo-actions">
                <div class="left">
                    <button class="btn-cadastrar" id="btn-novo-item"><i class="fas fa-plus"></i> Novo Item</button>
                    <form method="POST" action="importar_google_books.php" style="display:inline;">
                        <button type="submit" name="importar" class="btn-import" onclick="return confirm('Importar até 1000 livros da Google Books? Isso pode demorar alguns segundos.')">
                            <i class="fas fa-cloud-download-alt"></i> Importar 1000 livros
                        </button>
                    </form>
                </div>
                <div>
                    <span style="font-size:14px; color:#1e293b;"><strong>Total:</strong> <?= $total ?> itens</span>
                </div>
            </div>

            <!-- FILTROS -->
            <div class="filtros-container">
                <form method="GET" action="catalogo_adm.php" style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; width:100%;">
                    <select name="tipo">
                        <option value="">Todos os tipos</option>
                        <option value="livro" <?= $filtroTipo === 'livro' ? 'selected' : '' ?>>Livro</option>
                        <option value="revista" <?= $filtroTipo === 'revista' ? 'selected' : '' ?>>Revista</option>
                        <option value="tcc" <?= $filtroTipo === 'tcc' ? 'selected' : '' ?>>TCC</option>
                    </select>
                    <input type="text" name="busca" placeholder="Buscar..." value="<?= htmlspecialchars($filtroBusca) ?>">
                    <button type="submit"><i class="fas fa-filter"></i> Filtrar</button>
                    <a href="catalogo_adm.php" style="padding:8px 14px; background:#e9ecef; border-radius:8px; text-decoration:none; color:#333;">Limpar</a>
                </form>
            </div>

            <!-- LISTA DE ITENS -->
            <?php if (empty($itens)): ?>
    <div class="empty-state">
        <div class="empty-icon">
            <i class="fas fa-book-open"></i>
        </div>
        <h3> Seu catálogo está vazio</h3>
        <p>Comece agora mesmo! Importe livros da Google Books ou cadastre manualmente.</p>
        <div class="empty-actions">
            <button class="btn-cadastrar" id="btn-novo-item-empty">
                <i class="fas fa-plus"></i> Cadastrar novo item
            </button>
            <form method="POST" action="importar_google_books.php" style="display:inline;">
                <button type="submit" name="importar" class="btn-import-empty" onclick="return confirm('Importar até 1000 livros da Google Books? Isso pode demorar alguns segundos.')">
                    <i class="fas fa-cloud-download-alt"></i> Importar da Google Books
                </button>
            </form>
        </div>
        <p class="empty-hint">💡 Dica: A importação automática traz livros com capas!</p>
    </div>
<?php endif; ?>
                <div class="catalogo-grid">
                    <?php foreach ($itens as $item): ?>
                        <div class="catalogo-card" data-id="<?= $item['id_catalogo'] ?>">
                            <div class="card-capa">
                                <?php if (!empty($item['capa_url'])): ?>
                                    <?php 
                                    $caminhoCompleto = __DIR__ . '/../' . $item['capa_url'];
                                    ?>
                                    <?php if (file_exists($caminhoCompleto)): ?>
                                        <img src="../<?= htmlspecialchars($item['capa_url']) ?>" alt="Capa" loading="lazy">
                                    <?php else: ?>
                                        <div class="capa-placeholder"><i class="fas fa-book"></i></div>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <div class="capa-placeholder"><i class="fas fa-book"></i></div>
                                <?php endif; ?>
                            </div>
                            <div class="card-info">
                                <h4 title="<?= htmlspecialchars($item['titulo']) ?>"><?= htmlspecialchars($item['titulo']) ?></h4>
                                <p class="autor"><?= htmlspecialchars($item['autor']) ?></p>
                                <span class="tipo-badge tipo-<?= $item['tipo'] ?>"><?= ucfirst($item['tipo']) ?></span>
                                <div class="card-actions">
                                    <button class="btn-editar" onclick="abrirModalEdicao(<?= $item['id_catalogo'] ?>)"><i class="fas fa-edit"></i></button>
                                    <button class="btn-excluir" onclick="excluirItem(<?= $item['id_catalogo'] ?>, '<?= addslashes($item['titulo']) ?>')"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <?php if ($totalPaginas > 1): ?>
                <div class="paginacao">
                    <?php if ($paginaAtual > 1): ?>
                        <a href="?pagina=<?= $paginaAtual-1 ?>&tipo=<?= urlencode($filtroTipo) ?>&busca=<?= urlencode($filtroBusca) ?>">« Anterior</a>
                    <?php endif; ?>
                    <?php for ($i = 1; $i <= $totalPaginas; $i++): ?>
                        <a href="?pagina=<?= $i ?>&tipo=<?= urlencode($filtroTipo) ?>&busca=<?= urlencode($filtroBusca) ?>" class="<?= $i === $paginaAtual ? 'active' : '' ?>"><?= $i ?></a>
                    <?php endfor; ?>
                    <?php if ($paginaAtual < $totalPaginas): ?>
                        <a href="?pagina=<?= $paginaAtual+1 ?>&tipo=<?= urlencode($filtroTipo) ?>&busca=<?= urlencode($filtroBusca) ?>">Próximo »</a>
                    <?php endif; ?>
                </div>
                <?php endif; ?>
        </main>
    </div>

    <!-- MODAL -->
    <div class="modal-overlay" id="modal-overlay" style="display:none;">
        <div class="modal-container">
            <div class="modal-header">
                <h3 id="modal-title"><i class="fas fa-plus-circle"></i> Novo Item</h3>
                <button class="modal-close" id="modal-close">&times;</button>
            </div>
            <form id="modal-form" method="POST">
                <input type="hidden" name="edit_id" id="edit_id" value="0">
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label for="titulo">Título *</label>
                        <input type="text" id="titulo" name="titulo" required>
                    </div>
                    <div class="form-group">
                        <label for="autor">Autor</label>
                        <input type="text" id="autor" name="autor">
                    </div>
                    <div class="form-group">
                        <label for="tipo">Tipo *</label>
                        <select id="tipo" name="tipo" required>
                            <option value="livro">Livro</option>
                            <option value="revista">Revista</option>
                            <option value="tcc">TCC</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editora">Editora</label>
                        <input type="text" id="editora" name="editora">
                    </div>
                    <div class="form-group">
                        <label for="ano_publicacao">Ano</label>
                        <input type="number" id="ano_publicacao" name="ano_publicacao">
                    </div>
                    <div class="form-group">
                        <label for="isbn">ISBN</label>
                        <input type="text" id="isbn" name="isbn">
                    </div>
                    <div class="form-group">
                        <label for="quantidade">Quantidade</label>
                        <input type="number" id="quantidade" name="quantidade" value="1" min="1">
                    </div>
                    <div class="form-group">
                        <label for="localizacao">Localização</label>
                        <input type="text" id="localizacao" name="localizacao">
                    </div>
                    <div class="form-group full-width">
                        <label for="capa_url">URL da Capa</label>
                        <input type="text" id="capa_url" name="capa_url" placeholder="https://exemplo.com/capa.jpg">
                    </div>
                    <div class="form-group full-width">
                        <label for="descricao">Descrição</label>
                        <textarea id="descricao" name="descricao" rows="3"></textarea>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancelar" id="modal-cancel">Cancelar</button>
                    <button type="submit" name="salvar" class="btn-salvar"><i class="fas fa-save"></i> Salvar</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        const notificacoesData = <?= json_encode($notificacoes_sininho, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>
    <script src="../assets/js/dashboard_adm.js"></script>
    <script src="../assets/js/catalogo_adm.js"></script>
</body>
</html>
<?php
$notificacoesTopo = isset($notificacoes) && is_array($notificacoes) ? $notificacoes : [];
$naoLidasTopo = count($notificacoesTopo);
$primeiroNomeTopo = $primeiroNome ?? 'Aluno';
$paginaAtualTopo = basename($_SERVER['SCRIPT_NAME'] ?? 'painel_user.php');
$consultaTopo = (string) ($_SERVER['QUERY_STRING'] ?? '');
$destinoAposLerTopo = $paginaAtualTopo . ($consultaTopo !== '' ? '?' . $consultaTopo : '');

// O sininho mostra e conta só as notificações não lidas: ao marcar tudo como lido, elas somem.
$idAlunoTopo = (int) ($_SESSION['usuario_id'] ?? 0);
if ($idAlunoTopo > 0 && isset($conn) && $conn instanceof mysqli) {
    try {
        $stmtTopo = $conn->prepare(
            'SELECT id, id_envio, titulo, mensagem, tipo, criado_em, COALESCE(lida, 0) AS lida
             FROM notificacoes WHERE id_aluno = ? AND COALESCE(lida, 0) = 0
             ORDER BY criado_em DESC, id DESC LIMIT 10'
        );
        if ($stmtTopo) {
            $stmtTopo->bind_param('i', $idAlunoTopo);
            $stmtTopo->execute();
            $notificacoesTopo = $stmtTopo->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmtTopo->close();
        }

        $stmtContaTopo = $conn->prepare('SELECT COUNT(*) FROM notificacoes WHERE id_aluno = ? AND COALESCE(lida, 0) = 0');
        if ($stmtContaTopo) {
            $stmtContaTopo->bind_param('i', $idAlunoTopo);
            $stmtContaTopo->execute();
            $stmtContaTopo->bind_result($totalNaoLidasTopo);
            $stmtContaTopo->fetch();
            $stmtContaTopo->close();
            $naoLidasTopo = (int) $totalNaoLidasTopo;
        }
    } catch (Throwable $e) {
        error_log('Falha ao carregar notificações do sininho: ' . $e->getMessage());
    }
}
?>
<header class="top-header">
    <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input type="text" id="search-input" placeholder="Buscar Livros, autores, revistas..." autocomplete="off">
    </div>

    <div class="header-right">
        <?php require __DIR__ . '/appearance_controls_user.php'; ?>
        <div class="language-wrapper">
            <button class="language-button" aria-label="Selecionar idioma" data-i18n-aria="language_label">
                <img src="../assets/Imagens/br.png" class="flag" alt="Bandeira do Brasil">
                <span>PT</span>
                <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>
            </button>
            <ul class="language-list">
                <li data-lang="pt" tabindex="0"><img src="../assets/Imagens/br.png" class="flag" alt="Português"> Português</li>
                <li data-lang="en" tabindex="0"><img src="../assets/Imagens/us.png" class="flag" alt="English"> English</li>
                <li data-lang="es" tabindex="0"><img src="../assets/Imagens/es.png" class="flag" alt="Español"> Español</li>
            </ul>
        </div>

        <div class="user-info">
            <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
            <span class="welcome">Olá, <strong id="user-name"><?= htmlspecialchars($primeiroNomeTopo, ENT_QUOTES, 'UTF-8') ?></strong>!</span>
        </div>

        <a href="auth/sair_user.php" class="btn-logout" title="Sair" data-i18n-title="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span id="logout-text">Sair</span>
        </a>

        <div class="notification-container">
            <button class="notification-btn" id="notification-btn" title="Notificações">
                <i class="fas fa-bell"></i>
                <?php if ($naoLidasTopo > 0): ?>
                    <span class="badge"><?= $naoLidasTopo > 99 ? '99+' : $naoLidasTopo ?></span>
                <?php endif; ?>
            </button>
            <div class="notification-dropdown" id="notification-dropdown">
                <div class="notification-header">
                    <h4><i class="fas fa-bell"></i> <span data-i18n="notification_title">Notificações</span></h4>
                </div>
                <div class="notification-list" id="notification-list-dropdown"></div>
                <form id="mark-read-form" class="notification-mark-read-form"<?= $naoLidasTopo > 0 ? '' : ' hidden' ?> action="../api/notificacoes_user.php" method="POST">
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
                    <input type="hidden" name="action" value="mark_all_read">
                    <input type="hidden" name="redirect" value="<?= htmlspecialchars($destinoAposLerTopo, ENT_QUOTES, 'UTF-8') ?>">
                    <button type="submit" class="notification-mark-read-btn" id="mark-read-btn" data-i18n="mark_all_read">Marcar tudo como lido</button>
                </form>
            </div>
        </div>
    </div>
</header>
<script>window.notificacoesData = <?= json_encode($notificacoesTopo, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;</script>
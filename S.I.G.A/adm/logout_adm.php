<?php
require_once __DIR__ . '/../includes/config.php';

if (!isset($_SESSION['admin_id']) && !isset($_SESSION['id_adm'])) {
    header('Location: login_adm.php');
    exit;
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) {
    http_response_code(405);
    header('Allow: GET, POST');
    exit('Método não permitido.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !csrf_validar()) {
    http_response_code(403);
    exit('Token CSRF inválido. Recarregue a página e tente novamente.');
}

$_SESSION = [];
session_destroy();
header('Location: login_adm.php');
exit;

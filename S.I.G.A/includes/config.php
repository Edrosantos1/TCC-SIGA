<?php
date_default_timezone_set('America/Sao_Paulo');

// 1. Segurança Básica (Impede roubo de sessão por JavaScript)
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
$httpsAtivo = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && strtolower((string) $_SERVER['HTTPS']) !== 'off';
ini_set('session.cookie_secure', $httpsAtivo ? '1' : '0');
ini_set('session.use_strict_mode', 1);

// 2. Inicia a sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!function_exists('appCookieOptions')) {
    function appCookieOptions(int $expires): array
    {
        $httpsAtivo = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && strtolower((string) $_SERVER['HTTPS']) !== 'off';
        return [
            'expires' => $expires,
            'path' => '/',
            'secure' => $httpsAtivo,
            'httponly' => true,
            'samesite' => 'Lax',
        ];
    }
}

if (!function_exists('csrf_token')) {
    function csrf_token(): string
    {
        if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token']) || strlen($_SESSION['csrf_token']) !== 64) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf_token'];
    }
}

if (!function_exists('csrf_validar')) {
    function csrf_validar(?string $token = null): bool
    {
        if ($token === null) {
            $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
            $token = $_POST['csrf'] ?? $headerToken;
        }

        return is_string($token)
            && isset($_SESSION['csrf_token'])
            && is_string($_SESSION['csrf_token'])
            && hash_equals($_SESSION['csrf_token'], $token);
    }
}

if (!function_exists('appUrl')) {
    function appUrl(string $path): string
    {
        static $basePath = null;

        if ($basePath === null) {
            $appRoot = str_replace('\\', '/', realpath(__DIR__ . '/..') ?: dirname(__DIR__));
            $documentRoot = str_replace('\\', '/', realpath($_SERVER['DOCUMENT_ROOT'] ?? '') ?: ($_SERVER['DOCUMENT_ROOT'] ?? ''));
            $documentRoot = rtrim($documentRoot, '/');

            if ($documentRoot !== '' && stripos($appRoot, $documentRoot . '/') === 0) {
                $basePath = substr($appRoot, strlen($documentRoot));
            } else {
                $basePath = '/' . basename($appRoot);
            }

            $basePath = rtrim($basePath, '/');
        }

        return $basePath . '/' . ltrim($path, '/');
    }
}

if (!function_exists('redirect_seguro')) {
    /**
     * Aceita apenas destinos do próprio site (caminho relativo ou URL do mesmo host).
     * Qualquer outra coisa volta para o destino padrão (evita redirecionamento aberto).
     */
    function redirect_seguro($url, string $padrao): string
    {
        if (!is_string($url)) {
            return $padrao;
        }
        $url = trim($url);
        if ($url === '' || preg_match('/[\x00-\x1F\x7F\\\\]/', $url) || strncmp($url, '//', 2) === 0) {
            return $padrao;
        }
        if (preg_match('#^[a-z][a-z0-9+.\-]*:#i', $url)) {
            $partes = parse_url($url);
            $hostAtual = strtolower(explode(':', (string) ($_SERVER['HTTP_HOST'] ?? ''))[0]);
            $esquema = strtolower((string) ($partes['scheme'] ?? ''));
            $host = strtolower((string) ($partes['host'] ?? ''));
            if (!in_array($esquema, ['http', 'https'], true) || $host === '' || $host !== $hostAtual) {
                return $padrao;
            }
        }
        return $url;
    }
}

// 3. Controle de Inatividade (1 hora = 3600 segundos)
$tempo_limite = 3600;

// Verifica se tem alguém logado (Aluno ou Admin)
if (isset($_SESSION['usuario_id']) || isset($_SESSION['id_adm']) || isset($_SESSION['admin_id'])) {
    
    // Se ficou inativo por mais de 1 hora, destrói a sessão
    if (isset($_SESSION['ultima_atividade']) && (time() - $_SESSION['ultima_atividade'] > $tempo_limite)) {
        $sessaoAdmin = isset($_SESSION['id_adm']) || isset($_SESSION['admin_id']);
        session_unset();
        session_destroy();
        session_start();
        session_regenerate_id(true);
        if ($sessaoAdmin) {
            $_SESSION['flash_admin_login_error'] = 'Sua sessão administrativa expirou por inatividade.';
            header('Location: ' . appUrl('adm/login_adm.php'));
        } else {
            $_SESSION['flash_login_error'] = [
                'msg' => 'Sua sessão expirou por inatividade.',
                'register' => false,
            ];
            header('Location: ' . appUrl('aluno/auth/login.php'));
        }
        exit;
    }

    // Atualiza a hora do último clique
    $_SESSION['ultima_atividade'] = time();
}

// 4. Conecta com o Banco de Dados
require_once __DIR__ . '/conexao.php';
$conn = $conexao;
?>

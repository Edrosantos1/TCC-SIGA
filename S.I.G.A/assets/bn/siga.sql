-- ============================================================
-- Script completo do banco `siga`
-- ATENÇÃO: Isso APAGARÁ todos os dados existentes!
-- ============================================================

-- Cria o banco se não existir
CREATE DATABASE IF NOT EXISTS `siga` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `siga`;

-- Desativa verificação de chaves estrangeiras para permitir DROP sem ordem
SET FOREIGN_KEY_CHECKS = 0;

-- Remove todas as tabelas existentes (ordem inversa das dependências)
DROP TABLE IF EXISTS `notificacoes`;
DROP TABLE IF EXISTS `favoritos`;
DROP TABLE IF EXISTS `reservas`;
DROP TABLE IF EXISTS `emprestimos`;
DROP TABLE IF EXISTS `catalogo`;
DROP TABLE IF EXISTS `login_aluno`;
DROP TABLE IF EXISTS `login_admin`;
DROP TABLE IF EXISTS `configuracoes`;

-- Reativa verificação
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TABELA: login_admin
-- ============================================================
CREATE TABLE `login_admin` (
  `id_adm` int(11) NOT NULL AUTO_INCREMENT,
  `email_adm` varchar(100) NOT NULL,
  `senha_adm` varchar(255) NOT NULL,
  `nome_adm` varchar(100) DEFAULT 'Administrador',
  PRIMARY KEY (`id_adm`),
  UNIQUE KEY `email_adm` (`email_adm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABELA: login_aluno
-- ============================================================
CREATE TABLE `login_aluno` (
  `id_aluno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome_aluno` varchar(100) NOT NULL,
  `serie_aluno` varchar(50) NOT NULL,
  `email_aluno` varchar(255) NOT NULL,
  `senha_aluno` varchar(255) NOT NULL,
  `relembrar_token` varchar(255) DEFAULT NULL,
  `token_expiracao` datetime DEFAULT NULL,
  PRIMARY KEY (`id_aluno`),
  UNIQUE KEY `email_aluno` (`email_aluno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABELA: catalogo (unificada)
-- ============================================================
CREATE TABLE `catalogo` (
  `id_catalogo` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `tipo` enum('livro','revista','tcc') NOT NULL,
  `editora` varchar(255) DEFAULT NULL,
  `ano_publicacao` int(11) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `quantidade` int(11) DEFAULT 1,
  `localizacao` varchar(50) DEFAULT NULL,
  `capa_url` varchar(255) DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_catalogo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABELA: emprestimos (com id_catalogo)
-- ============================================================
CREATE TABLE `emprestimos` (
  `id_emprestimo` int(11) NOT NULL AUTO_INCREMENT,
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `id_catalogo` int(11) DEFAULT NULL,
  `titulo_item` varchar(255) NOT NULL,
  `data_emprestimo` datetime NOT NULL,
  `data_devolucao_prevista` date DEFAULT NULL,
  `status` enum('emprestado','atrasado','devolvido') DEFAULT 'emprestado',
  PRIMARY KEY (`id_emprestimo`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_catalogo` (`id_catalogo`),
  CONSTRAINT `emprestimos_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE,
  CONSTRAINT `emprestimos_ibfk_2` FOREIGN KEY (`id_catalogo`) REFERENCES `catalogo` (`id_catalogo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Trigger para calcular data de devolução (dias úteis)
DELIMITER $$
CREATE TRIGGER `calcular_data_devolucao_emprestimo_uteis` BEFORE INSERT ON `emprestimos` FOR EACH ROW
BEGIN
    DECLARE data_atual DATE;
    DECLARE dias_adicionados INT DEFAULT 0;
    DECLARE dias_uteis INT DEFAULT 7;
    IF NEW.data_devolucao_prevista IS NULL THEN
        SET data_atual = DATE(NEW.data_emprestimo);
        WHILE dias_adicionados < dias_uteis DO
            SET data_atual = DATE_ADD(data_atual, INTERVAL 1 DAY);
            IF DAYOFWEEK(data_atual) BETWEEN 2 AND 6 THEN
                SET dias_adicionados = dias_adicionados + 1;
            END IF;
        END WHILE;
        SET NEW.data_devolucao_prevista = data_atual;
    END IF;
    IF NEW.status IS NULL THEN
        SET NEW.status = 'emprestado';
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- TABELA: reservas (com id_catalogo)
-- ============================================================
CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL AUTO_INCREMENT,
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `id_catalogo` int(11) DEFAULT NULL,
  `titulo_item` varchar(255) NOT NULL,
  `data_reserva` datetime DEFAULT current_timestamp(),
  `data_limite` date DEFAULT NULL,
  `status` enum('pendente','aprovada','rejeitada','expirada') DEFAULT 'pendente',
  PRIMARY KEY (`id_reserva`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_catalogo` (`id_catalogo`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`id_catalogo`) REFERENCES `catalogo` (`id_catalogo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Trigger para data limite padrão (7 dias)
DELIMITER $$
CREATE TRIGGER `calcular_data_limite_reserva` BEFORE INSERT ON `reservas` FOR EACH ROW
BEGIN
    IF NEW.data_limite IS NULL THEN
        SET NEW.data_limite = DATE_ADD(NEW.data_reserva, INTERVAL 7 DAY);
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- TABELA: favoritos
-- ============================================================
CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` int(11) NOT NULL,
  `tipo_item` enum('livro','revista','tcc') NOT NULL,
  `data_favorito` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_item_unique` (`usuario_id`,`item_id`,`tipo_item`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABELA: notificacoes
-- ============================================================
CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensagem` text NOT NULL,
  `tipo` enum('pendencia','aviso') NOT NULL DEFAULT 'aviso',
  `lida` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_envio` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notificacoes_ibfk_1` (`id_aluno`),
  KEY `idx_id_envio` (`id_envio`),
  CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABELA: configuracoes
-- ============================================================
CREATE TABLE `configuracoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chave` varchar(50) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `chave` (`chave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Admin (email: admin@siga.com, senha: admin123)
INSERT INTO `login_admin` (`email_adm`, `senha_adm`, `nome_adm`) VALUES
('admin@siga.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bibliotecária');

-- Alunos (senha: 123456)
INSERT INTO `login_aluno` (`nome_aluno`, `serie_aluno`, `email_aluno`, `senha_aluno`) VALUES
('Ana Carolina Silva', '3° Ano A', 'ana.silva@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW'),
('Bruno Henrique Santos', '2° Ano B', 'bruno.santos@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW'),
('Carla Fernanda Lima', '1° Ano C', 'carla.lima@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW'),
('Diego Rafael Oliveira', '3° Ano B', 'diego.oliveira@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW'),
('Eduarda Maria Souza', '2° Ano A', 'eduarda.souza@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW');

-- Catálogo
INSERT INTO `catalogo` (`titulo`, `autor`, `tipo`, `editora`, `ano_publicacao`, `quantidade`, `capa_url`) VALUES
('Dom Casmurro', 'Machado de Assis', 'livro', 'Garnier', 1899, 3, 'https://m.media-amazon.com/images/I/71fZ9vLxZoL._AC_UF1000,1000_QL80_.jpg'),
('O Alienista', 'Machado de Assis', 'livro', 'Garnier', 1882, 2, 'https://m.media-amazon.com/images/I/81Rfz3NfLhL._AC_UF1000,1000_QL80_.jpg'),
('Memórias Póstumas de Brás Cubas', 'Machado de Assis', 'livro', 'Garnier', 1881, 1, 'https://m.media-amazon.com/images/I/71QHbQnCzfL._AC_UF1000,1000_QL80_.jpg'),
('Quincas Borba', 'Machado de Assis', 'livro', 'Garnier', 1891, 2, 'https://m.media-amazon.com/images/I/71b7Gt+XJaL._AC_UF1000,1000_QL80_.jpg'),
('O Cortiço', 'Aluísio Azevedo', 'livro', 'Garnier', 1890, 2, 'https://m.media-amazon.com/images/I/81B2yU5F4IL._AC_UF1000,1000_QL80_.jpg'),
('A Moreninha', 'Joaquim Manuel de Macedo', 'livro', 'Garnier', 1844, 1, 'https://m.media-amazon.com/images/I/81BZzrRjE1L._AC_UF1000,1000_QL80_.jpg'),
('Iracema', 'José de Alencar', 'livro', 'Garnier', 1865, 2, 'https://m.media-amazon.com/images/I/81+fJgSMrFL._AC_UF1000,1000_QL80_.jpg'),
('Senhora', 'José de Alencar', 'livro', 'Garnier', 1875, 1, 'https://m.media-amazon.com/images/I/71XyM1RgB2L._AC_UF1000,1000_QL80_.jpg'),
('A Escrava Isaura', 'Bernardo Guimarães', 'livro', 'Garnier', 1875, 2, 'https://m.media-amazon.com/images/I/81aVl7H9GcL._AC_UF1000,1000_QL80_.jpg'),
('O Primo Basílio', 'Eça de Queirós', 'livro', 'Garnier', 1878, 1, 'https://m.media-amazon.com/images/I/81L7KtQv7kL._AC_UF1000,1000_QL80_.jpg');

-- Reservas (exemplo)
INSERT INTO `reservas` (`id_aluno`, `titulo_item`, `data_reserva`, `data_limite`, `status`) VALUES
(1, 'Dom Casmurro', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'rejeitada'),
(2, 'O Alienista', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'aprovada'),
(3, 'Memórias Póstumas de Brás Cubas', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'aprovada'),
(4, 'Quincas Borba', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'rejeitada'),
(5, 'O Cortiço', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'aprovada');

-- Empréstimos (exemplo)
INSERT INTO `emprestimos` (`id_aluno`, `titulo_item`, `data_emprestimo`, `data_devolucao_prevista`, `status`) VALUES
(1, 'Dom Casmurro', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'emprestado'),
(2, 'O Alienista', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 'atrasado'),
(3, 'Memórias Póstumas de Brás Cubas', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 'devolvido'),
(4, 'Quincas Borba', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 'emprestado'),
(5, 'O Cortiço', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), 'devolvido');

-- Configurações padrão
INSERT INTO `configuracoes` (`chave`, `valor`, `descricao`) VALUES
('tamanho_fonte', 'medio', 'Tamanho da fonte: pequeno, medio, grande'),
('tema', 'claro', 'Tema: claro, escuro, alto_contraste'),
('daltonismo', 'normal', 'Tipo de daltonismo: normal, protanopia, deuteranopia, tritanopia'),
('espacamento', 'normal', 'Espaçamento: compacto, normal, confortavel'),
('reduzir_animacoes', '0', 'Reduzir animações: 0=desligado, 1=ligado');

CREATE TABLE configuracoes_aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    chave VARCHAR(50) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_usuario_chave (usuario_id, chave),
    FOREIGN KEY (usuario_id) REFERENCES login_aluno(id_aluno) ON DELETE CASCADE
);
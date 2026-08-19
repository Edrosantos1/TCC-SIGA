-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 19/08/2026 às 02:31
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `siga`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `catalogo`
--

CREATE TABLE `catalogo` (
  `id_catalogo` int(11) NOT NULL,
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
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `catalogo`
--

INSERT INTO `catalogo` (`id_catalogo`, `titulo`, `autor`, `tipo`, `editora`, `ano_publicacao`, `isbn`, `descricao`, `quantidade`, `localizacao`, `capa_url`, `data_cadastro`) VALUES
(1, 'Dom Casmurro', 'Machado de Assis', 'livro', 'Garnier', 1899, NULL, NULL, 3, NULL, 'https://m.media-amazon.com/images/I/71fZ9vLxZoL._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(2, 'O Alienista', 'Machado de Assis', 'livro', 'Garnier', 1882, NULL, NULL, 2, NULL, 'https://m.media-amazon.com/images/I/81Rfz3NfLhL._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(3, 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', 'livro', 'Garnier', 1881, NULL, NULL, 1, NULL, 'https://m.media-amazon.com/images/I/71QHbQnCzfL._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(4, 'Quincas Borba', 'Machado de Assis', 'livro', 'Garnier', 1891, NULL, NULL, 2, NULL, 'https://m.media-amazon.com/images/I/71b7Gt+XJaL._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(5, 'O Cortiço', 'Aluísio Azevedo', 'livro', 'Garnier', 1890, NULL, NULL, 2, NULL, 'https://m.media-amazon.com/images/I/81B2yU5F4IL._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(6, 'A Moreninha', 'Joaquim Manuel de Macedo', 'livro', 'Garnier', 1844, NULL, NULL, 1, NULL, 'https://m.media-amazon.com/images/I/81BZzrRjE1L._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(7, 'Iracema', 'José de Alencar', 'livro', 'Garnier', 1865, NULL, NULL, 2, NULL, 'https://m.media-amazon.com/images/I/81+fJgSMrFL._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(8, 'Senhora', 'José de Alencar', 'livro', 'Garnier', 1875, NULL, NULL, 1, NULL, 'https://m.media-amazon.com/images/I/71XyM1RgB2L._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(9, 'A Escrava Isaura', 'Bernardo Guimarães', 'livro', 'Garnier', 1875, NULL, NULL, 2, NULL, 'https://m.media-amazon.com/images/I/81aVl7H9GcL._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40'),
(10, 'O Primo Basílio', 'Eça de Queirós', 'livro', 'Garnier', 1878, NULL, NULL, 1, NULL, 'https://m.media-amazon.com/images/I/81L7KtQv7kL._AC_UF1000,1000_QL80_.jpg', '2026-08-19 00:14:40');

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes`
--

CREATE TABLE `configuracoes` (
  `id` int(11) NOT NULL,
  `chave` varchar(50) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `configuracoes`
--

INSERT INTO `configuracoes` (`id`, `chave`, `valor`, `descricao`, `atualizado_em`) VALUES
(1, 'tamanho_fonte', 'medio', 'Tamanho da fonte: pequeno, medio, grande', '2026-08-19 00:14:40'),
(2, 'tema', 'claro', 'Tema: claro, escuro, alto_contraste', '2026-08-19 00:14:40'),
(3, 'daltonismo', 'normal', 'Tipo de daltonismo: normal, protanopia, deuteranopia, tritanopia', '2026-08-19 00:14:40'),
(4, 'espacamento', 'normal', 'Espaçamento: compacto, normal, confortavel', '2026-08-19 00:14:40'),
(5, 'reduzir_animacoes', '0', 'Reduzir animações: 0=desligado, 1=ligado', '2026-08-19 00:14:40');

-- --------------------------------------------------------

--
-- Estrutura para tabela `configuracoes_aluno`
--

CREATE TABLE `configuracoes_aluno` (
  `id` int(11) NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `chave` varchar(50) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `emprestimos`
--

CREATE TABLE `emprestimos` (
  `id_emprestimo` int(11) NOT NULL,
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `id_catalogo` int(11) DEFAULT NULL,
  `titulo_item` varchar(255) NOT NULL,
  `data_emprestimo` datetime NOT NULL,
  `data_devolucao_prevista` date DEFAULT NULL,
  `status` enum('emprestado','atrasado','devolvido') DEFAULT 'emprestado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `emprestimos`
--

INSERT INTO `emprestimos` (`id_emprestimo`, `id_aluno`, `id_catalogo`, `titulo_item`, `data_emprestimo`, `data_devolucao_prevista`, `status`) VALUES
(1, 1, NULL, 'Dom Casmurro', '2026-08-18 21:14:40', '2026-08-25', 'emprestado'),
(2, 2, NULL, 'O Alienista', '2026-08-18 21:14:40', '2026-08-23', 'atrasado'),
(3, 3, NULL, 'Memórias Póstumas de Brás Cubas', '2026-08-03 21:14:40', '2026-08-10', 'devolvido'),
(4, 4, NULL, 'Quincas Borba', '2026-08-15 21:14:40', '2026-08-22', 'emprestado'),
(5, 5, NULL, 'O Cortiço', '2026-07-29 21:14:40', '2026-08-05', 'devolvido');

--
-- Acionadores `emprestimos`
--
DELIMITER $$
CREATE TRIGGER `calcular_data_devolucao_emprestimo_uteis` BEFORE INSERT ON `emprestimos` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` int(11) NOT NULL,
  `tipo_item` enum('livro','revista','tcc') NOT NULL,
  `data_favorito` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `login_admin`
--

CREATE TABLE `login_admin` (
  `id_adm` int(11) NOT NULL,
  `email_adm` varchar(100) NOT NULL,
  `senha_adm` varchar(255) NOT NULL,
  `nome_adm` varchar(100) DEFAULT 'Administrador'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `login_admin`
--

INSERT INTO `login_admin` (`id_adm`, `email_adm`, `senha_adm`, `nome_adm`) VALUES
(1, 'adm@gmail.com', '$2y$10$E3U9NFzZM0E9yT3yiQeC4OmrSo2/vrPF.gP/fBiKd9d9R0iO7xFRe', 'admin');

-- --------------------------------------------------------

--
-- Estrutura para tabela `login_aluno`
--

CREATE TABLE `login_aluno` (
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `nome_aluno` varchar(100) NOT NULL,
  `serie_aluno` varchar(50) NOT NULL,
  `email_aluno` varchar(255) NOT NULL,
  `senha_aluno` varchar(255) NOT NULL,
  `relembrar_token` varchar(255) DEFAULT NULL,
  `token_expiracao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `login_aluno`
--

INSERT INTO `login_aluno` (`id_aluno`, `nome_aluno`, `serie_aluno`, `email_aluno`, `senha_aluno`, `relembrar_token`, `token_expiracao`) VALUES
(1, 'Ana Carolina Silva', '3° Ano A', 'ana.silva@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(2, 'Bruno Henrique Santos', '2° Ano B', 'bruno.santos@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(3, 'Carla Fernanda Lima', '1° Ano C', 'carla.lima@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(4, 'Diego Rafael Oliveira', '3° Ano B', 'diego.oliveira@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(5, 'Eduarda Maria Souza', '2° Ano A', 'eduarda.souza@email.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensagem` text NOT NULL,
  `tipo` enum('pendencia','aviso') NOT NULL DEFAULT 'aviso',
  `lida` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_envio` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL,
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `id_catalogo` int(11) DEFAULT NULL,
  `titulo_item` varchar(255) NOT NULL,
  `data_reserva` datetime DEFAULT current_timestamp(),
  `data_limite` date DEFAULT NULL,
  `status` enum('pendente','aprovada','rejeitada','expirada') DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `reservas`
--

INSERT INTO `reservas` (`id_reserva`, `id_aluno`, `id_catalogo`, `titulo_item`, `data_reserva`, `data_limite`, `status`) VALUES
(1, 1, NULL, 'Dom Casmurro', '2026-08-18 21:14:40', '2026-08-25', 'rejeitada'),
(2, 2, NULL, 'O Alienista', '2026-08-18 21:14:40', '2026-08-25', 'aprovada'),
(3, 3, NULL, 'Memórias Póstumas de Brás Cubas', '2026-08-18 21:14:40', '2026-08-25', 'aprovada'),
(4, 4, NULL, 'Quincas Borba', '2026-08-18 21:14:40', '2026-08-25', 'rejeitada'),
(5, 5, NULL, 'O Cortiço', '2026-08-18 21:14:40', '2026-08-25', 'aprovada');

--
-- Acionadores `reservas`
--
DELIMITER $$
CREATE TRIGGER `calcular_data_limite_reserva` BEFORE INSERT ON `reservas` FOR EACH ROW BEGIN
    IF NEW.data_limite IS NULL THEN
        SET NEW.data_limite = DATE_ADD(NEW.data_reserva, INTERVAL 7 DAY);
    END IF;
END
$$
DELIMITER ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `catalogo`
--
ALTER TABLE `catalogo`
  ADD PRIMARY KEY (`id_catalogo`);

--
-- Índices de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chave` (`chave`);

--
-- Índices de tabela `configuracoes_aluno`
--
ALTER TABLE `configuracoes_aluno`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_usuario_chave` (`usuario_id`,`chave`);

--
-- Índices de tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  ADD PRIMARY KEY (`id_emprestimo`),
  ADD KEY `id_aluno` (`id_aluno`),
  ADD KEY `id_catalogo` (`id_catalogo`);

--
-- Índices de tabela `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_item_unique` (`usuario_id`,`item_id`,`tipo_item`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `login_admin`
--
ALTER TABLE `login_admin`
  ADD PRIMARY KEY (`id_adm`),
  ADD UNIQUE KEY `email_adm` (`email_adm`);

--
-- Índices de tabela `login_aluno`
--
ALTER TABLE `login_aluno`
  ADD PRIMARY KEY (`id_aluno`),
  ADD UNIQUE KEY `email_aluno` (`email_aluno`);

--
-- Índices de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notificacoes_ibfk_1` (`id_aluno`),
  ADD KEY `idx_id_envio` (`id_envio`);

--
-- Índices de tabela `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `id_aluno` (`id_aluno`),
  ADD KEY `id_catalogo` (`id_catalogo`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `catalogo`
--
ALTER TABLE `catalogo`
  MODIFY `id_catalogo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `configuracoes_aluno`
--
ALTER TABLE `configuracoes_aluno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  MODIFY `id_emprestimo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `login_admin`
--
ALTER TABLE `login_admin`
  MODIFY `id_adm` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `login_aluno`
--
ALTER TABLE `login_aluno`
  MODIFY `id_aluno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `configuracoes_aluno`
--
ALTER TABLE `configuracoes_aluno`
  ADD CONSTRAINT `configuracoes_aluno_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE;

--
-- Restrições para tabelas `emprestimos`
--
ALTER TABLE `emprestimos`
  ADD CONSTRAINT `emprestimos_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE,
  ADD CONSTRAINT `emprestimos_ibfk_2` FOREIGN KEY (`id_catalogo`) REFERENCES `catalogo` (`id_catalogo`) ON DELETE SET NULL;

--
-- Restrições para tabelas `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE;

--
-- Restrições para tabelas `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE;

--
-- Restrições para tabelas `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`id_catalogo`) REFERENCES `catalogo` (`id_catalogo`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

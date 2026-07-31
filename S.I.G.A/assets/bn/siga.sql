-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 31/07/2026 às 05:39
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
-- Estrutura para tabela `emprestimos`
--

CREATE TABLE `emprestimos` (
  `id_emprestimo` int(11) NOT NULL,
  `id_aluno` int(11) NOT NULL,
  `titulo_item` varchar(255) NOT NULL,
  `data_emprestimo` datetime NOT NULL,
  `data_devolucao_prevista` date NOT NULL,
  `status` enum('emprestado','atrasado','devolvido') DEFAULT 'emprestado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `emprestimos`
--

INSERT INTO `emprestimos` (`id_emprestimo`, `id_aluno`, `titulo_item`, `data_emprestimo`, `data_devolucao_prevista`, `status`) VALUES
(1, 1, 'Banco de Dados Avançado', '2026-07-29 22:46:00', '2026-08-05', 'devolvido'),
(2, 1, 'Engenharia de Software 2ª Edição', '2026-07-14 22:46:00', '2026-07-24', 'devolvido'),
(3, 2, 'Introdução à Programação com Python', '2026-07-30 09:40:02', '2026-08-06', 'devolvido'),
(4, 3, 'Python para Análise de Dados', '2026-07-30 09:48:04', '2026-08-06', 'emprestado'),
(5, 3, 'Machine Learning com Python', '2026-07-27 09:48:04', '2026-08-03', 'atrasado'),
(6, 3, 'SQL para Iniciantes', '2026-07-20 09:48:04', '2026-07-28', 'atrasado'),
(7, 3, 'Matemática - Vol. 1', '2026-07-30 09:56:26', '2026-08-04', 'emprestado'),
(8, 3, 'Português - Gramática', '2026-07-28 09:56:26', '2026-08-02', 'atrasado'),
(9, 4, 'Ciências - Biologia', '2026-07-30 09:56:26', '2026-08-06', 'emprestado'),
(10, 4, 'História do Brasil', '2026-07-25 09:56:26', '2026-08-01', 'atrasado'),
(11, 5, 'Geografia Mundial', '2026-07-30 09:56:26', '2026-08-09', 'devolvido'),
(12, 5, 'Física - Mecânica', '2026-07-27 09:56:26', '2026-08-03', 'devolvido'),
(13, 6, 'Química Orgânica', '2026-07-30 09:56:26', '2026-08-07', 'emprestado'),
(14, 6, 'Inglês - Intermediário', '2026-07-23 09:56:26', '2026-07-30', 'devolvido'),
(15, 7, 'Literatura Brasileira', '2026-07-30 09:56:26', '2026-08-05', 'emprestado'),
(16, 7, 'Filosofia - Ética', '2026-07-26 09:56:26', '2026-08-02', 'atrasado'),
(17, 8, 'Sociologia - Sociedade', '2026-07-30 09:56:26', '2026-08-08', 'emprestado'),
(18, 9, 'Arte - História da Arte', '2026-07-30 09:56:26', '2026-08-03', 'emprestado'),
(19, 9, 'Educação Física', '2026-07-24 09:56:26', '2026-07-31', 'atrasado'),
(20, 10, 'Matemática - Vol. 2', '2026-07-30 09:56:26', '2026-08-04', 'emprestado'),
(21, 11, 'Português - Redação', '2026-07-30 09:56:27', '2026-08-06', 'emprestado'),
(22, 11, 'Ciências - Química', '2026-07-28 09:56:27', '2026-08-04', 'atrasado'),
(23, 12, 'História Antiga', '2026-07-30 09:56:27', '2026-08-09', 'emprestado'),
(24, 12, 'Geografia - Clima', '2026-07-22 09:56:27', '2026-07-29', 'devolvido');

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
(1, 'adm@gmail.com', '$2y$10$Hti4Ki5Ee7.q7YiGxyUikOd2l9A6lxD8IK9mafCr.46JTVPaqn.mC', 'Administrador Principal');

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
(1, 'pedro', '7º ano', 'pedro@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(2, 'Gabriel', '3º ano', 'gabrielzinho67@gmail.com', '$2y$10$xHRV5vZIgOM7AOuP08qyBOiQocn/MUoIuKDkFeOW0gcGIoi.SgERe', NULL, NULL),
(3, 'Mariana Oliveira', '8º ano', 'mariana.oliveira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(4, 'Ana Carolina Silva', '6º ano', 'ana.carolina@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(5, 'Bruno Henrique Santos', '7º ano', 'bruno.henrique@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(6, 'Carla Fernanda Lima', '8º ano', 'carla.fernanda@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(7, 'Daniel Oliveira Souza', '9º ano', 'daniel.oliveira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(8, 'Eduarda Martins Ribeiro', '1º EM', 'eduarda.martins@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(9, 'Felipe Augusto Costa', '2º EM', 'felipe.augusto@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(10, 'Gabriela Ferreira Alves', '3º EM', 'gabriela.ferreira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(11, 'Henrique Gomes Pereira', '6º ano', 'henrique.gomes@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(12, 'Isabela Rocha Mendes', '7º ano', 'isabela.rocha@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(13, 'João Pedro Almeida', '8º ano', 'joao.pedro@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(14, 'Caio', '1º ano', 'caio@gmail.com', '$2y$10$PosgZd2RHafYXwCm7lxkKOUHa9tAXHk4u4PsovafapfCaJ/1ngMrG', NULL, NULL),
(15, 'Luan', '7º ano', 'luan@gmail.com', '$2y$10$6GOJB7O6MSiM68MRwEkki.TEbdRaJMlMMxdS1y7uMOFrmnCHBTd6C', NULL, NULL);

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
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `notificacoes`
--

INSERT INTO `notificacoes` (`id`, `id_aluno`, `titulo`, `mensagem`, `tipo`, `lida`, `criado_em`) VALUES
(1, 3, 'Aviso', 'Bem-vinda ao sistema, Mariana!', 'aviso', 0, '2026-07-30 12:48:04'),
(2, 4, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(3, 5, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(4, 6, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(5, 7, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(6, 8, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(7, 9, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(8, 10, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(9, 2, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(10, 11, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(11, 12, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(12, 13, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(13, 3, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(14, 1, 'Aviso', 'oi', 'aviso', 0, '2026-07-30 14:08:23'),
(15, 4, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(16, 5, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(17, 6, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(18, 7, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(19, 8, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(20, 9, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(21, 10, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(22, 2, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(23, 11, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(24, 12, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(25, 13, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(26, 3, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(27, 1, 'Aviso', 'Ola', 'aviso', 0, '2026-07-30 14:08:41'),
(28, 4, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(29, 5, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(30, 6, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(31, 7, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(32, 8, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(33, 9, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(34, 10, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(35, 2, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(36, 11, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(37, 12, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(38, 13, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(39, 3, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(40, 1, 'Aviso', 'ola', 'aviso', 0, '2026-07-30 14:08:56'),
(41, 4, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(42, 5, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(43, 6, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(44, 7, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(45, 8, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(46, 9, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(47, 10, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(48, 2, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(49, 11, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(50, 12, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(51, 13, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(52, 3, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11'),
(53, 1, 'Aviso', 'Tira', 'aviso', 0, '2026-07-30 14:09:11');

-- --------------------------------------------------------

--
-- Estrutura para tabela `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL,
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `titulo_item` varchar(255) NOT NULL,
  `data_reserva` datetime DEFAULT current_timestamp(),
  `data_limite` date DEFAULT NULL,
  `status` enum('pendente','aprovada','rejeitada','concluida','expirada') DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `reservas`
--

INSERT INTO `reservas` (`id_reserva`, `id_aluno`, `titulo_item`, `data_reserva`, `data_limite`, `status`) VALUES
(1, 1, 'Livro de Banco de Dados', '2026-07-29 22:19:28', '2026-08-15', 'aprovada'),
(2, 1, 'Engenharia de Software', '2026-07-29 22:38:07', '2026-08-05', 'aprovada'),
(3, 2, 'Banco de Dados Avançado', '2026-07-30 09:45:05', '2026-08-14', 'aprovada'),
(4, 3, 'Data Science do Zero', '2026-07-30 09:48:04', '2026-08-14', 'aprovada'),
(5, 3, 'Inteligência Artificial Aplicada', '2026-07-28 09:48:04', '2026-08-11', 'aprovada'),
(6, 3, 'Matemática - Vol. 1', '2026-07-30 09:56:55', '2026-08-09', 'rejeitada'),
(7, 3, 'Português - Gramática', '2026-07-30 09:56:55', '2026-08-14', 'aprovada'),
(8, 4, 'Ciências - Biologia', '2026-07-30 09:56:55', '2026-08-11', 'rejeitada'),
(9, 4, 'História do Brasil', '2026-07-30 09:56:55', '2026-08-07', 'rejeitada'),
(10, 5, 'Geografia Mundial', '2026-07-30 09:56:55', '2026-08-13', 'rejeitada'),
(11, 5, 'Física - Mecânica', '2026-07-30 09:56:55', '2026-08-09', 'aprovada'),
(12, 6, 'Química Orgânica', '2026-07-30 09:56:55', '2026-08-08', 'aprovada'),
(13, 6, 'Inglês - Intermediário', '2026-07-30 09:56:55', '2026-08-10', 'rejeitada'),
(14, 7, 'Literatura Brasileira', '2026-07-30 09:56:55', '2026-08-12', 'aprovada'),
(15, 8, 'Sociologia - Sociedade', '2026-07-30 09:56:55', '2026-08-09', 'aprovada'),
(16, 8, 'Filosofia - Ética', '2026-07-30 09:56:55', '2026-08-06', 'rejeitada'),
(17, 9, 'Arte - História da Arte', '2026-07-30 09:56:55', '2026-08-11', 'rejeitada'),
(18, 10, 'Matemática - Vol. 2', '2026-07-30 09:56:55', '2026-08-07', 'aprovada'),
(19, 10, 'Português - Redação', '2026-07-30 09:56:55', '2026-08-14', 'aprovada'),
(20, 11, 'Ciências - Química', '2026-07-30 09:56:55', '2026-08-08', 'aprovada'),
(21, 11, 'História Antiga', '2026-07-30 09:56:55', '2026-08-13', 'aprovada'),
(22, 12, 'Geografia - Clima', '2026-07-30 09:56:55', '2026-08-10', 'aprovada'),
(23, 1, 'Livro Teste', '2026-07-31 00:10:39', '2026-08-07', 'aprovada');

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
-- Índices de tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  ADD PRIMARY KEY (`id_emprestimo`);

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
  ADD KEY `notificacoes_ibfk_1` (`id_aluno`);

--
-- Índices de tabela `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `id_aluno` (`id_aluno`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  MODIFY `id_emprestimo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de tabela `login_admin`
--
ALTER TABLE `login_admin`
  MODIFY `id_adm` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `login_aluno`
--
ALTER TABLE `login_aluno`
  MODIFY `id_aluno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT de tabela `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE;

--
-- Restrições para tabelas `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

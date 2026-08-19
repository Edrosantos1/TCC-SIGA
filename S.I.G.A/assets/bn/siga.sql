-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 19/08/2026 às 12:34
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 2, NULL, 'O Alienista', '2026-07-15 10:00:00', '2026-07-22', 'atrasado'),
(2, 5, NULL, 'O Cortiço', '2026-07-20 14:30:00', '2026-07-27', 'atrasado'),
(3, 8, NULL, 'Senhora', '2026-07-25 09:15:00', '2026-08-01', 'atrasado'),
(4, 11, NULL, 'O Guarani', '2026-08-01 11:00:00', '2026-08-08', 'atrasado'),
(5, 14, NULL, 'O Quinze', '2026-08-03 16:20:00', '2026-08-10', 'atrasado'),
(6, 17, NULL, 'A Hora da Estrela', '2026-08-05 13:45:00', '2026-08-12', 'atrasado'),
(7, 1, NULL, 'Dom Casmurro', '2026-08-10 10:00:00', '2026-08-17', 'emprestado'),
(8, 4, NULL, 'Quincas Borba', '2026-08-12 16:45:00', '2026-08-19', 'emprestado'),
(9, 7, NULL, 'Iracema', '2026-08-11 08:30:00', '2026-08-18', 'devolvido'),
(10, 10, NULL, 'O Primo Basílio', '2026-08-13 14:00:00', '2026-08-20', 'emprestado'),
(11, 13, NULL, 'Capitães da Areia', '2026-08-14 09:30:00', '2026-08-21', 'emprestado'),
(12, 16, NULL, 'Grande Sertão: Veredas', '2026-08-15 11:15:00', '2026-08-22', 'emprestado'),
(13, 19, NULL, 'Vidas Secas', '2026-08-16 10:45:00', '2026-08-23', 'emprestado'),
(14, 3, NULL, 'Memórias Póstumas de Brás Cubas', '2026-07-01 09:00:00', '2026-07-08', 'devolvido'),
(15, 6, NULL, 'A Moreninha', '2026-07-05 14:20:00', '2026-07-12', 'devolvido'),
(16, 9, NULL, 'A Escrava Isaura', '2026-07-10 11:30:00', '2026-07-17', 'devolvido'),
(17, 12, NULL, 'Vidas Secas', '2026-07-12 08:45:00', '2026-07-19', 'devolvido'),
(18, 15, NULL, 'A Hora da Estrela', '2026-07-15 13:00:00', '2026-07-22', 'devolvido'),
(19, 18, NULL, 'O Cortiço', '2026-07-18 10:15:00', '2026-07-25', 'devolvido'),
(20, 20, NULL, 'Dom Casmurro', '2026-07-20 16:30:00', '2026-07-27', 'devolvido');

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

--
-- Despejando dados para a tabela `favoritos`
--

INSERT INTO `favoritos` (`id`, `usuario_id`, `item_id`, `tipo_item`, `data_favorito`) VALUES
(1, 1, 1, 'livro', '2026-08-15 14:30:00'),
(2, 1, 3, 'livro', '2026-08-16 10:15:00'),
(3, 2, 2, 'livro', '2026-08-10 09:20:00'),
(4, 2, 16, 'livro', '2026-08-12 08:30:00'),
(5, 3, 5, 'livro', '2026-08-11 16:45:00'),
(6, 4, 4, 'livro', '2026-08-12 09:20:00'),
(7, 5, 5, 'livro', '2026-08-13 11:00:00'),
(8, 5, 11, 'livro', '2026-08-13 13:45:00'),
(9, 6, 6, 'livro', '2026-08-14 08:45:00'),
(10, 7, 7, 'livro', '2026-08-11 08:30:00'),
(11, 8, 8, 'livro', '2026-08-14 10:15:00'),
(12, 9, 9, 'livro', '2026-08-14 16:20:00'),
(13, 10, 10, 'livro', '2026-08-13 14:00:00'),
(14, 11, 11, 'livro', '2026-08-15 15:00:00'),
(15, 12, 12, 'livro', '2026-08-16 08:45:00'),
(16, 13, 13, 'livro', '2026-08-14 09:30:00'),
(17, 14, 14, 'livro', '2026-08-16 09:30:00'),
(18, 15, 15, 'livro', '2026-08-15 09:15:00'),
(19, 16, 16, 'livro', '2026-08-15 11:15:00'),
(20, 17, 10, 'livro', '2026-08-17 11:45:00'),
(21, 18, 11, 'livro', '2026-08-18 10:30:00'),
(22, 19, 12, 'livro', '2026-08-16 10:45:00'),
(23, 20, 4, 'livro', '2026-08-16 10:00:00');

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
(1, 'adm@gmail.com', '$2y$10$2T5D853uENnqRohNg017FeQCoKGnarTcaJ1g19alskJo7jyP7abp2', 'Irineu');

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
(1, 'Ana Carolina Silva', '3° Ano A', 'ana.silva@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(2, 'Bruno Henrique Santos', '2° Ano B', 'bruno.santos@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(3, 'Carla Fernanda Lima', '1° Ano C', 'carla.lima@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(4, 'Diego Rafael Oliveira', '3° Ano B', 'diego.oliveira@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(5, 'Eduarda Maria Souza', '2° Ano A', 'eduarda.souza@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(6, 'Fernando Alves Pereira', '3° Ano C', 'fernando.pereira@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(7, 'Gabriela Santos Silva', '2° Ano B', 'gabriela.silva@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(8, 'Henrique Costa Lima', '1° Ano A', 'henrique.lima@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(9, 'Isabela Ferreira Santos', '3° Ano A', 'isabela.santos@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(10, 'João Pedro Almeida', '1° Ano B', 'joao.almeida@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(11, 'Larissa Cristina Rocha', '3° Ano C', 'larissa.rocha@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(12, 'Marcos Vinicius Silva', '2° Ano A', 'marcos.silva@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(13, 'Natália Oliveira Costa', '1° Ano C', 'natalia.costa@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(14, 'Otávio Henrique Santos', '3° Ano B', 'otavio.santos@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(15, 'Patrícia Mendes Lima', '2° Ano C', 'patricia.mendes@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(16, 'Rafael Augusto Souza', '1° Ano A', 'rafael.souza@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(17, 'Sabrina Carvalho Silva', '3° Ano A', 'sabrina.carvalho@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(18, 'Thiago Henrique Rocha', '2° Ano B', 'thiago.rocha@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(19, 'Vitória Beatriz Lima', '1° Ano B', 'vitoria.lima@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(20, 'William Santos Almeida', '3° Ano C', 'william.almeida@escola.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL);

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

--
-- Despejando dados para a tabela `notificacoes`
--

INSERT INTO `notificacoes` (`id`, `id_aluno`, `titulo`, `mensagem`, `tipo`, `lida`, `criado_em`, `id_envio`) VALUES
(1, 2, '📚 Empréstimo em atraso', 'Seu empréstimo do livro \"O Alienista\" está atrasado há 27 dias. Compareça à biblioteca URGENTE.', 'pendencia', 0, '2026-08-18 11:00:00', NULL),
(2, 5, '📚 Empréstimo em atraso', 'Seu empréstimo do livro \"O Cortiço\" está atrasado há 22 dias. Sua situação está crítica.', 'pendencia', 0, '2026-08-18 12:00:00', NULL),
(3, 8, '📚 Empréstimo em atraso', 'Seu empréstimo do livro \"Senhora\" está atrasado há 17 dias. Regularize sua situação.', 'pendencia', 0, '2026-08-18 13:00:00', NULL),
(4, 11, '📚 Empréstimo em atraso', 'Seu empréstimo do livro \"O Guarani\" está atrasado há 10 dias. Devolva imediatamente.', 'pendencia', 0, '2026-08-18 14:00:00', NULL),
(5, 14, '📚 Empréstimo em atraso', 'Seu empréstimo do livro \"O Quinze\" está atrasado há 8 dias. Evite mais multas.', 'pendencia', 0, '2026-08-18 15:00:00', NULL),
(6, 17, '📚 Empréstimo em atraso', 'Seu empréstimo do livro \"A Hora da Estrela\" está atrasado há 6 dias. Devolva o quanto antes.', 'pendencia', 0, '2026-08-18 16:00:00', NULL),
(7, 2, '✅ Reserva aprovada', 'Sua reserva do livro \"Grande Sertão: Veredas\" foi aprovada! Retire até 19/08.', 'aviso', 0, '2026-08-12 11:35:00', NULL),
(8, 8, '✅ Reserva aprovada', 'Sua reserva do livro \"Capitães da Areia\" foi aprovada! Retire até 21/08.', 'aviso', 0, '2026-08-14 13:20:00', NULL),
(9, 14, '✅ Reserva aprovada', 'Sua reserva do livro \"Iracema\" foi aprovada! Retire até 23/08.', 'aviso', 0, '2026-08-16 12:35:00', NULL),
(10, 4, '✅ Reserva aprovada', 'Sua reserva do livro \"Vidas Secas\" foi aprovada! Retire até 24/08.', 'aviso', 1, '2026-08-17 17:05:00', NULL),
(11, 10, '✅ Reserva aprovada', 'Sua reserva do livro \"Senhora\" foi aprovada! Retire até 22/08.', 'aviso', 0, '2026-08-15 12:50:00', NULL),
(12, 15, '✅ Reserva aprovada', 'Sua reserva do livro \"A Moreninha\" foi aprovada! Retire até 22/08.', 'aviso', 0, '2026-08-15 12:20:00', NULL),
(13, 9, '✅ Reserva aprovada', 'Sua reserva do livro \"Memórias Póstumas de Brás Cubas\" foi aprovada!', 'aviso', 1, '2026-08-14 19:25:00', NULL),
(14, 12, '✅ Reserva aprovada', 'Sua reserva do livro \"Capitães da Areia\" foi aprovada! Retire até 23/08.', 'aviso', 0, '2026-08-16 11:50:00', NULL),
(15, 18, '✅ Reserva aprovada', 'Sua reserva do livro \"O Guarani\" foi aprovada! Retire até 25/08.', 'aviso', 0, '2026-08-18 13:35:00', NULL),
(16, 19, '✅ Reserva aprovada', 'Sua reserva do livro \"Iracema\" foi aprovada! Retire até 21/08.', 'aviso', 0, '2026-08-14 16:20:00', NULL),
(17, 1, '⏰ Devolução próxima', 'O livro \"Dom Casmurro\" vence em 17/08. Não se esqueça de devolver!', 'aviso', 1, '2026-08-16 11:00:00', NULL),
(18, 4, '⏰ Devolução próxima', 'O livro \"Quincas Borba\" vence em 19/08. Renove se precisar.', 'aviso', 0, '2026-08-17 11:00:00', NULL),
(19, 7, '⏰ Devolução próxima', 'O livro \"Iracema\" vence em 18/08. Devolva hoje ou renove.', 'aviso', 0, '2026-08-17 11:00:00', NULL),
(20, 10, '⏰ Devolução próxima', 'O livro \"O Primo Basílio\" vence em 20/08. Planeje sua devolução.', 'aviso', 0, '2026-08-18 11:00:00', NULL),
(21, 13, '⏰ Devolução próxima', 'O livro \"Capitães da Areia\" vence em 21/08. Não se esqueça.', 'aviso', 0, '2026-08-18 12:00:00', NULL),
(22, 16, '⏰ Devolução próxima', 'O livro \"Grande Sertão: Veredas\" vence em 22/08.', 'aviso', 0, '2026-08-18 13:00:00', NULL),
(23, 3, '❌ Reserva rejeitada', 'Sua reserva do livro \"O Alienista\" foi rejeitada. Não há exemplares disponíveis.', 'aviso', 1, '2026-08-10 17:25:00', NULL),
(24, 6, '❌ Reserva rejeitada', 'Sua reserva do livro \"Dom Casmurro\" foi rejeitada. Todos os exemplares estão emprestados.', 'aviso', 0, '2026-08-11 14:35:00', NULL),
(25, 6, '❌ Reserva rejeitada', 'Sua reserva do livro \"A Hora da Estrela\" foi rejeitada. Tente outro título.', 'aviso', 0, '2026-08-15 12:35:00', NULL),
(26, 13, '⏰ Reserva expirada', 'Sua reserva do livro \"Quincas Borba\" expirou. Faça uma nova reserva se desejar.', 'aviso', 0, '2026-08-19 03:00:00', NULL),
(27, 1, '📢 Novidades na biblioteca', 'Chegaram novos livros! Confira o catálogo atualizado.', 'aviso', 0, '2026-08-15 11:00:00', NULL),
(28, 5, '📢 Campanha de doação', 'Participe da campanha de doação de livros. Doe um livro, ganhe um marcador!', 'aviso', 0, '2026-08-10 12:00:00', NULL),
(29, 10, '📢 Evento literário', 'Participe do clube do livro na próxima semana. Inscreva-se na biblioteca.', 'aviso', 0, '2026-08-12 13:00:00', NULL),
(30, 15, '📢 Feira do livro', 'Feira do livro acontecerá no mês que vem. Prepare-se!', 'aviso', 0, '2026-08-14 14:00:00', NULL);

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
(1, 20, NULL, 'Quincas Borba', '2026-08-16 10:00:00', '2026-08-23', 'aprovada'),
(2, 12, NULL, 'A Escrava Isaura', '2026-08-17 14:30:00', '2026-08-24', 'aprovada'),
(3, 15, NULL, 'A Moreninha', '2026-08-15 09:15:00', '2026-08-22', 'aprovada'),
(4, 18, NULL, 'O Quinze', '2026-08-18 11:00:00', '2026-08-25', 'aprovada'),
(5, 9, NULL, 'Memórias Póstumas de Brás Cubas', '2026-08-14 16:20:00', '2026-08-21', 'aprovada'),
(6, 2, NULL, 'Grande Sertão: Veredas', '2026-08-12 08:30:00', '2026-08-19', 'aprovada'),
(7, 5, NULL, 'O Guarani', '2026-08-13 13:45:00', '2026-08-20', 'aprovada'),
(8, 8, NULL, 'Capitães da Areia', '2026-08-14 10:15:00', '2026-08-21', 'aprovada'),
(9, 11, NULL, 'Vidas Secas', '2026-08-15 15:00:00', '2026-08-22', 'rejeitada'),
(10, 14, NULL, 'Iracema', '2026-08-16 09:30:00', '2026-08-23', 'aprovada'),
(11, 17, NULL, 'O Primo Basílio', '2026-08-17 11:45:00', '2026-08-24', 'rejeitada'),
(12, 1, NULL, 'A Hora da Estrela', '2026-08-18 08:00:00', '2026-08-25', 'aprovada'),
(13, 4, NULL, 'Vidas Secas', '2026-08-17 14:00:00', '2026-08-24', 'aprovada'),
(14, 7, NULL, 'O Cortiço', '2026-08-16 10:30:00', '2026-08-23', 'aprovada'),
(15, 10, NULL, 'Senhora', '2026-08-15 09:45:00', '2026-08-22', 'aprovada'),
(16, 3, NULL, 'O Alienista', '2026-08-10 14:20:00', '2026-08-17', 'rejeitada'),
(17, 6, NULL, 'Dom Casmurro', '2026-08-11 11:30:00', '2026-08-18', 'rejeitada'),
(18, 13, NULL, 'Quincas Borba', '2026-08-12 16:00:00', '2026-08-19', 'expirada'),
(19, 16, NULL, 'A Moreninha', '2026-08-13 09:00:00', '2026-08-20', 'rejeitada'),
(20, 19, NULL, 'Iracema', '2026-08-14 13:15:00', '2026-08-21', 'aprovada'),
(21, 3, NULL, 'O Primo Basílio', '2026-08-15 15:30:00', '2026-08-22', 'rejeitada'),
(22, 12, NULL, 'Capitães da Areia', '2026-08-16 08:45:00', '2026-08-23', 'aprovada'),
(23, 15, NULL, 'Grande Sertão: Veredas', '2026-08-17 12:00:00', '2026-08-24', 'rejeitada'),
(24, 18, NULL, 'O Guarani', '2026-08-18 10:30:00', '2026-08-25', 'aprovada'),
(25, 3, NULL, 'O Quinze', '2026-08-14 11:00:00', '2026-08-21', 'aprovada'),
(26, 6, NULL, 'A Hora da Estrela', '2026-08-15 09:30:00', '2026-08-22', 'rejeitada'),
(27, 4, NULL, 'Blue Lock cap.11', '2026-08-18 21:49:01', '2026-08-26', 'aprovada');

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
  MODIFY `id_catalogo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `configuracoes_aluno`
--
ALTER TABLE `configuracoes_aluno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  MODIFY `id_emprestimo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `login_admin`
--
ALTER TABLE `login_admin`
  MODIFY `id_adm` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `login_aluno`
--
ALTER TABLE `login_aluno`
  MODIFY `id_aluno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

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

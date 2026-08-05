-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 05/08/2026 às 03:29
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
(1, 1, 'Matemática - Vol. 1', '2026-08-04 19:48:46', '2026-08-11', 'emprestado'),
(2, 2, 'Português - Gramática', '2026-08-04 19:48:46', '2026-08-14', 'emprestado'),
(3, 3, 'Física - Mecânica', '2026-08-04 19:48:46', '2026-08-09', 'atrasado'),
(4, 4, 'Química - Vol. 1', '2026-08-04 19:48:46', '2026-08-12', 'emprestado'),
(5, 5, 'História do Mundo', '2026-08-04 19:48:46', '2026-08-07', 'devolvido'),
(6, 6, 'Geografia - Vol. 1', '2026-08-04 19:48:46', '2026-08-10', 'emprestado'),
(7, 7, 'Inglês - Básico', '2026-08-04 19:48:46', '2026-08-13', 'emprestado'),
(8, 8, 'Literatura - Contos', '2026-08-04 19:48:46', '2026-08-08', 'atrasado'),
(9, 9, 'Filosofia - Antiga', '2026-08-04 19:48:46', '2026-08-11', 'emprestado'),
(10, 10, 'Sociologia - Teoria', '2026-08-04 19:48:46', '2026-08-09', 'emprestado'),
(11, 11, 'Arte - Renascimento', '2026-08-04 19:48:46', '2026-08-14', 'atrasado'),
(12, 12, 'Educação Física - Teoria', '2026-08-04 19:48:46', '2026-08-07', 'devolvido'),
(13, 13, 'Matemática - Vol. 4', '2026-08-04 19:48:46', '2026-08-12', 'emprestado'),
(14, 14, 'Português - Literatura', '2026-08-04 19:48:46', '2026-08-10', 'atrasado'),
(15, 15, 'Física - Eletricidade', '2026-08-04 19:48:46', '2026-08-08', 'emprestado'),
(16, 16, 'Química - Vol. 4', '2026-08-04 19:48:46', '2026-08-11', 'emprestado'),
(17, 17, 'História Moderna', '2026-08-04 19:48:46', '2026-08-13', 'atrasado'),
(18, 18, 'Geografia - Vol. 2', '2026-08-04 19:48:46', '2026-08-09', 'devolvido'),
(19, 19, 'Inglês - Gramática', '2026-08-04 19:48:46', '2026-08-07', 'emprestado'),
(20, 20, 'Literatura - Romance', '2026-08-04 19:48:46', '2026-08-12', 'atrasado'),
(21, 21, 'Filosofia - Moderna', '2026-08-04 19:48:46', '2026-08-10', 'emprestado'),
(22, 22, 'Sociologia - Crítica', '2026-08-04 19:48:46', '2026-08-14', 'emprestado'),
(23, 23, 'Arte - Contemporânea', '2026-08-04 19:48:46', '2026-08-08', 'atrasado'),
(24, 24, 'Educação Física - Prática', '2026-08-04 19:48:46', '2026-08-11', 'emprestado'),
(25, 25, 'Matemática - Trigonometria', '2026-08-04 19:48:46', '2026-08-09', 'emprestado');

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
(1, 'Ana Beatriz Silva', '1º ano', 'ana.beatriz@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(2, 'Bruno Henrique Costa', '2º ano', 'bruno.henrique@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(3, 'Carla Fernanda Lima', '3º ano', 'carla.fernanda@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(4, 'Daniel Oliveira Souza', '1º ano', 'daniel.oliveira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(5, 'Eduarda Martins Ribeiro', '2º ano', 'eduarda.martins@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(6, 'Felipe Augusto Santos', '3º ano', 'felipe.augusto@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(7, 'Gabriela Ferreira Alves', '1º ano', 'gabriela.ferreira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(8, 'Henrique Gomes Pereira', '2º ano', 'henrique.gomes@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(9, 'Isabela Rocha Mendes', '3º ano', 'isabela.rocha@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(10, 'João Pedro Almeida', '1º ano', 'joao.pedro@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(11, 'Larissa Cristina Nunes', '2º ano', 'larissa.cristina@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(12, 'Mateus Carvalho Lima', '3º ano', 'mateus.carvalho@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(13, 'Natália Fernandes Silva', '1º ano', 'natalia.fernandes@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(14, 'Otávio Ribeiro Santos', '2º ano', 'otavio.ribeiro@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(15, 'Patrícia Oliveira Souza', '3º ano', 'patricia.oliveira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(16, 'Rafael Almeida Santos', '1º ano', 'rafael.almeida@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(17, 'Sabrina Lima Costa', '2º ano', 'sabrina.lima@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(18, 'Thiago Pereira Gomes', '3º ano', 'thiago.pereira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(19, 'Vanessa Rodrigues Silva', '1º ano', 'vanessa.rodrigues@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(20, 'Wagner Martins Oliveira', '2º ano', 'wagner.martins@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(21, 'Yasmin Santos Alves', '3º ano', 'yasmin.santos@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(22, 'Alexandre Costa Silva', '1º ano', 'alexandre.costa@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(23, 'Beatriz Fernandes Lima', '2º ano', 'beatriz.fernandes@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(24, 'Caio Henrique Santos', '3º ano', 'caio.henrique@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(25, 'Diana Oliveira Souza', '1º ano', 'diana.oliveira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(26, 'Emanuel Silva Costa', '2º ano', 'emanuel.silva@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(27, 'Fernanda Lima Santos', '3º ano', 'fernanda.lima@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(28, 'Guilherme Almeida Silva', '1º ano', 'guilherme.almeida@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(29, 'Helena Martins Santos', '2º ano', 'helena.martins@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL),
(30, 'Igor Oliveira Costa', '3º ano', 'igor.oliveira@gmail.com', '$2y$10$UjYfAoV0huuduzU1rslgSuzYZHVUh5zJHSjJMUizmTZ8dWif7zmOW', NULL, NULL);

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
(379, 22, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(380, 1, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(381, 23, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(382, 2, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(383, 24, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(384, 3, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(385, 4, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(386, 25, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(387, 5, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(388, 26, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(389, 6, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(390, 27, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(391, 7, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(392, 28, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(393, 29, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(394, 8, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(395, 30, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(396, 9, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(397, 10, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(398, 11, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(399, 12, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(400, 13, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(401, 14, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(402, 15, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(403, 16, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(404, 17, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(405, 18, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(406, 19, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(407, 20, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(408, 21, 'Aviso', 'boa noite', 'aviso', 0, '2026-08-05 01:25:29', '6a7291091dd3c_1785893129'),
(409, 1, 'Aviso', 'bom dia', 'aviso', 0, '2026-08-05 01:27:49', '6a729195aefe8_1785893269'),
(410, 3, 'Aviso', 'vava', 'aviso', 0, '2026-08-05 01:28:02', '6a7291a2e2209_1785893282');

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
(1, 1, 'O Pequeno Príncipe', '2026-08-04 19:48:46', '2026-08-11', 'aprovada'),
(2, 2, 'Dom Casmurro', '2026-08-04 19:48:46', '2026-08-09', 'aprovada'),
(3, 3, 'Física - Vol. 1', '2026-08-04 19:48:46', '2026-08-07', 'pendente'),
(4, 4, 'Matemática - Vol. 2', '2026-08-04 19:48:46', '2026-08-14', 'aprovada'),
(5, 5, 'Química Orgânica', '2026-08-04 19:48:46', '2026-08-12', 'rejeitada'),
(6, 6, 'História do Brasil', '2026-08-04 19:48:46', '2026-08-10', 'pendente'),
(7, 7, 'Geografia Mundial', '2026-08-04 19:48:46', '2026-08-08', 'aprovada'),
(8, 8, 'Inglês - Intermediário', '2026-08-04 19:48:46', '2026-08-13', 'pendente'),
(9, 9, 'Português - Gramática', '2026-08-04 19:48:46', '2026-08-11', 'aprovada'),
(10, 10, 'Biologia - Vol. 1', '2026-08-04 19:48:46', '2026-08-09', 'rejeitada'),
(11, 11, 'Literatura Brasileira', '2026-08-04 19:48:46', '2026-08-12', 'pendente'),
(12, 12, 'Filosofia - Ética', '2026-08-04 19:48:46', '2026-08-07', 'aprovada'),
(13, 13, 'Sociologia - Sociedade', '2026-08-04 19:48:46', '2026-08-10', 'pendente'),
(14, 14, 'Arte - História da Arte', '2026-08-04 19:48:46', '2026-08-14', 'expirada'),
(15, 15, 'Educação Física', '2026-08-04 19:48:46', '2026-08-08', 'aprovada'),
(16, 16, 'Matemática - Vol. 3', '2026-08-04 19:48:46', '2026-08-11', 'pendente'),
(17, 17, 'Química - Vol. 2', '2026-08-04 19:48:46', '2026-08-09', 'aprovada'),
(18, 18, 'História Antiga', '2026-08-04 19:48:46', '2026-08-13', 'rejeitada'),
(19, 19, 'Geografia - Clima', '2026-08-04 19:48:46', '2026-08-10', 'pendente'),
(20, 20, 'Inglês - Avançado', '2026-08-04 19:48:46', '2026-08-07', 'aprovada'),
(21, 21, 'Português - Redação', '2026-08-04 19:48:46', '2026-08-12', 'pendente'),
(22, 22, 'Física - Vol. 2', '2026-08-04 19:48:46', '2026-08-14', 'expirada'),
(23, 23, 'Biologia - Vol. 2', '2026-08-04 19:48:46', '2026-08-08', 'aprovada'),
(24, 24, 'Literatura - Poesia', '2026-08-04 19:48:46', '2026-08-11', 'pendente'),
(25, 25, 'Filosofia - Política', '2026-08-04 19:48:46', '2026-08-09', 'rejeitada'),
(26, 26, 'Sociologia - Cultura', '2026-08-04 19:48:46', '2026-08-13', 'aprovada'),
(27, 27, 'Arte - Pintura', '2026-08-04 19:48:46', '2026-08-10', 'pendente'),
(28, 28, 'Educação Física - Esportes', '2026-08-04 19:48:46', '2026-08-07', 'aprovada'),
(29, 29, 'Matemática - Geometria', '2026-08-04 19:48:46', '2026-08-12', 'pendente'),
(30, 30, 'Química - Vol. 3', '2026-08-04 19:48:46', '2026-08-14', 'aprovada'),
(31, 11, 'dad', '2026-08-04 20:08:27', '2026-08-15', 'rejeitada'),
(32, 4, 'Blue Lock cap.11', '2026-08-04 20:16:44', '2026-08-11', 'aprovada'),
(33, 25, 'dadddd', '2026-08-04 20:17:23', '2026-08-06', 'aprovada');

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
  ADD KEY `notificacoes_ibfk_1` (`id_aluno`),
  ADD KEY `idx_id_envio` (`id_envio`);

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
  MODIFY `id_emprestimo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de tabela `login_admin`
--
ALTER TABLE `login_admin`
  MODIFY `id_adm` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `login_aluno`
--
ALTER TABLE `login_aluno`
  MODIFY `id_aluno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=411;

--
-- AUTO_INCREMENT de tabela `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

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

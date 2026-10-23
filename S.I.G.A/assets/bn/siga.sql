-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 23/10/2026 às 05:00
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
  `destaque` tinyint(1) NOT NULL DEFAULT 0,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `catalogo`
--

INSERT INTO `catalogo` (`id_catalogo`, `titulo`, `autor`, `tipo`, `editora`, `ano_publicacao`, `isbn`, `descricao`, `quantidade`, `localizacao`, `capa_url`, `destaque`, `data_cadastro`) VALUES
(336, 'A literatura brasileira', 'José Aderaldo Castello', 'livro', 'EdUSP', 1999, '853140505X', '', 3, 'P7', 'assets/capas/gb_5e9a7695a06c0b1f.jpg', 0, '2026-10-23 02:58:31'),
(337, 'Historia da literatura brasileira', 'José Veríssimo', 'livro', '', 1916, 'N/A', '', 2, 'P3', 'assets/capas/gb_bc3b3418057068d2.jpg', 0, '2026-10-23 02:58:31'),
(338, 'Literatura brasileira', 'Pedro Julio Barbuda', 'livro', '', 1916, 'N/A', '', 2, 'P4', 'assets/capas/gb_bd1301928b9f5dad.jpg', 0, '2026-10-23 02:58:31'),
(339, 'História da literatura brasileira: Formação e desenvolvimento autonômico da literatura nacional', 'Sílvio Romero', 'livro', '', 1943, 'N/A', '', 4, 'P1', 'assets/capas/gb_f9523c13625240f6.jpg', 0, '2026-10-23 02:58:31'),
(340, 'História concisa da literatura brasileira', 'Alfredo Bosi', 'livro', 'Editora Cultrix', 1994, '8531601894', '\"In totally revised and updated edition by the author, that and professor of Brazilian Literature in the University of Sao Paulo, Cultrix presents to a university public this work again for he devoted, since it came to light in 1970, like the best in its genre. Divided into eight parts respectively dedicated to colonial condition, the Baroque, Arcadia and illustration, to Romanticism, the Pre-Modernism and Modernism and contemporary trends, the Concise History of Brazilian Literature, of each one of these moments an appreciation of their different trends by studying the following of its principal authors, about which provides the reader bibliographic data order besides a critical evaluation. And work that is especially recommended the attention of teachers and students of Brazilian Literature, both at the undergraduate or graduate level.\" --Translation of publisher\'s review.', 1, 'P7', 'assets/capas/gb_f1029d925a952e03.jpg', 0, '2026-10-23 02:58:31'),
(341, 'A literatura brasileira', 'José Aderaldo Castello', 'livro', 'EdUSP', 1999, 'N/A', '', 3, 'P4', 'assets/capas/gb_73ce567815d4298d.jpg', 0, '2026-10-23 02:58:31'),
(342, 'Espaços contemporâneos de Consagração e disseminação da Literatura Brasileira', 'Leni Nobre de Oliveira', 'livro', 'Editora Dialética', 2024, '9786525289403', 'Espaços contemporâneos de Consagração da Literatura Brasileira é um estudo profundo das diversas formas de consagração da Literatura brasileira que antecipa estudos na área de canonização literária, intersemiose e interdisciplinaridade na Literatura. Escrita numa linguagem acessível para professores do Ensino Básico, atende aos acadêmicos pela sua estrutura dinâmica, com vasta coleta de dados que comprovam hipóteses propostas pela autora e contribui decisivamente para o aprofundamento sobre a inclusão de novas formas de percepção do universo literário em suportes multimidiáticos. A obra contém uma arqueologia de indicação de obras em vestibulares, com base em 30 anos de vestibular da Universidade Federal de Minas Gerais e da Pontifícia Universidade Católica de Minas Gerais. Analisa a presença da Literatura em novelas, minisséries e filmes na teledramaturgia, enfocando particularmente a contribuição da Rede Globo na utilização de grandes autores em adaptações para a tela. No campo da poesia, demonstra de modo pertinente o consumo da lírica por meio das letras das músicas das trilhas sonoras dos produtos da TV brasileira, num momento em que o consumo de livros de poesia não se dá somente pela leitura do texto, mas pela audição das músicas. Com ampla pesquisa de campo, em entrevistas a estudantes, a autora analisa o contexto de recepção de obras literárias pelos vestibulandos e abre perspectivas para uma nova abordagem do ensino da Literatura Brasileira em sala de aula.', 2, 'P3', 'assets/capas/gb_69fa24d1e141e5c0.jpg', 0, '2026-10-23 02:58:31'),
(343, 'Compendio de historia da literatura brasileira', 'Sílvio Romero, João Ribeiro', 'livro', '', 1909, 'N/A', '', 1, 'P9', 'assets/capas/gb_b5b8ab3d7f97075d.jpg', 0, '2026-10-23 02:58:31'),
(344, 'História da Literatura Brasileira', 'José Verìssimo', 'livro', 'BoD - Books on Demand', 2024, '9791043106644', '\"História da Literatura Brasileira\" de José Veríssimo é uma obra seminal que examina a evolução da literatura no Brasil desde suas origens até o início do século XX. Publicada em 1916, esta obra é uma das primeiras tentativas de sistematizar e analisar criticamente a produção literária brasileira. José Veríssimo, um dos fundadores da Academia Brasileira de Letras, foi um crítico literário e historiador que desempenhou um papel fundamental na consolidação dos estudos literários no Brasil. \"História da Literatura Brasileira\" de José Veríssimo é uma obra monumental que oferece uma análise abrangente e crítica da evolução da literatura no Brasil. Combinando erudição e clareza, Veríssimo fornece uma visão detalhada dos principais movimentos literários e dos autores que moldaram a literatura brasileira, tornando-se uma leitura essencial para a compreensão do desenvolvimento literário do país.', 3, 'P9', 'assets/capas/gb_25daf45199e73633.jpg', 0, '2026-10-23 02:58:31'),
(345, 'Panorama da literatura brasileira', 'Afrânio Peixoto', 'livro', '', 1940, 'N/A', '', 1, 'P10', 'assets/capas/gb_413d7e45df344ead.jpg', 0, '2026-10-23 02:58:31'),
(346, 'Literatura brasileira ...', 'Alvaro Guerra', 'livro', '', 1923, 'N/A', '', 2, 'P2', 'assets/capas/gb_621e084a5fefb929.jpg', 0, '2026-10-23 02:58:31'),
(347, 'Historia Da Literatura Brasileira', 'José Veríssimo', 'livro', '', 1929, 'N/A', '', 4, 'P4', 'assets/capas/gb_bb5eda275f8b3dec.jpg', 0, '2026-10-23 02:58:31'),
(348, 'ESCREVIVÊNCIAS EM SILVIANO SANTIAGO', 'Pedro Henrique Alves de Medeiros', 'livro', 'Editora CRV', 2023, '9786525148274', 'Esta obra delineia uma leitura crítico-biográfica fronteiriça do projeto homo-bio-ficcional-ensaísta do escritor mineiro Silviano Santiago à luz, sobremaneira, do romance Mil rosas roubadas publicado em 2014. Nesse intento, utilizarei-me, como condição sine qua non de uma teorização outra, oriunda do Sul global, dos biografemas aquilatados em minha própria (auto)biografia intelectual enquanto homem-fronteira, pesquisador e homossexual que existe, (sobre)vive, pensa e escre(vi)ve a partir da fronteira-sul, geoistórico-epistemológica, vertida nos trópicos da América Latina e, em especial, do Brasil. Para tanto, as articulações angariadas se respaldarão, majoritariamente, no que compreendo, na esteira de Edgar Cézar Nolasco, enquanto crítica biográfica fronteiriça imbricada em uma metodologia de caráter bibliográfico. Em linhas gerais, esse recorte teórico outro compreende as aproximações entre as epistemologias do Sul, os estudos descoloniais/fronteiriços e as leituras crítico-biográficas atualmente discutidas no Brasil.', 1, 'P5', 'assets/capas/gb_5a4187cf6938fbfb.jpg', 0, '2026-10-23 02:58:31'),
(349, 'Revista da Academia Brasileira de Letras', 'Academia Brasileira de Letras', 'livro', '', 1929, 'N/A', '', 4, 'P3', 'assets/capas/gb_1b4072f6a8e917a0.jpg', 0, '2026-10-23 02:58:31'),
(350, 'História da literatura brasileira', 'José Veríssimo', 'livro', '', 1998, 'N/A', '', 2, 'P9', 'assets/capas/gb_a418a3f5a8528586.jpg', 0, '2026-10-23 02:58:31'),
(351, 'A Academia brasileira de letras', 'Fernão Neves', 'livro', '', 1940, 'N/A', '', 3, 'P10', 'assets/capas/gb_6fb397685e26c821.jpg', 0, '2026-10-23 02:58:31'),
(352, 'Breve diccionario de autores classicos da literatura brasileira', 'A. C. Chichorro da Gama', 'livro', '', 1921, 'N/A', '', 4, 'P1', 'assets/capas/gb_887bb4ad9f48af68.jpg', 0, '2026-10-23 02:58:31'),
(353, 'História da literatura brasileira', 'Sílvio Romero', 'livro', '', 1943, 'N/A', '', 4, 'P4', 'assets/capas/gb_935e373c5e62965d.jpg', 0, '2026-10-23 02:58:35'),
(354, 'La Littérature portugaise', 'Claude-Henri Frèches', 'livro', 'Presses Universitaires de France', 1970, 'N/A', '', 5, 'P3', 'assets/capas/gb_ab441c5016d1fac7.jpg', 0, '2026-10-23 02:58:35'),
(355, 'O Brasil', 'Associação Comercial de São Paulo. Revista', 'livro', '', 1918, 'N/A', '', 5, 'P5', 'assets/capas/gb_1dc6ca44fb6be436.jpg', 0, '2026-10-23 02:58:35'),
(356, 'Poetas brasileros', 'Enrique Bustamante y Ballivián', 'livro', '', 1922, 'N/A', '', 4, 'P6', 'assets/capas/gb_f938e447675da7cc.jpg', 0, '2026-10-23 02:58:35'),
(357, 'Estudos de literatura brasileira', 'Haroldo Bruno', 'livro', '', 1966, 'N/A', '', 2, 'P3', 'assets/capas/gb_fb7b2d90ce7cc70d.jpg', 0, '2026-10-23 02:58:35'),
(358, 'pt.5. Ultimos contos. pt.6 Excertos de outros livros. pt.7. Avulsos. pt.8. Literatura infantil', 'José Bento Monteiro Lobato', 'livro', '', 1948, 'N/A', '', 1, 'P9', 'assets/capas/gb_3b56ff90f16f14bf.jpg', 0, '2026-10-23 02:58:35'),
(359, 'O Clarim e a oração', 'Desconhecido', 'livro', 'Geração Editorial', 2002, '8575090550', 'No ano em que o clássico \'Os Sertões\' faz cem anos, não poderia haver homenagem melhor do que debater e ampliar o seu entendimento. Para isso, \'O Clarim e a Oração\' traz o olhar sensível, crítico e informativo de expoentes da literatura, da poesia, da história, da sociologia, da crítica literária e da semiótica. Canudos e \'Os Sertões\' vistos pelo olhar de gente como Ariano Suassuna, Roberto Pompeu de Toledo, Augusto de Campos, Benedito Nunes e Gilberto Mendonça Telles, entre outros, fazendo \'a ponte entre \'Os Sertões\' e a realidade social do país\', como afirma o organizador Rinaldo de Fernandes.', 2, 'P1', 'assets/capas/gb_9c94646ebf4c2d6d.jpg', 0, '2026-10-23 02:58:35'),
(360, 'Antologia Brasileira', 'Eugenio Werneck', 'livro', '', 1942, 'N/A', '', 1, 'P9', 'assets/capas/gb_6259d743e5adaa36.jpg', 0, '2026-10-23 02:58:35'),
(361, 'Iniciação à literatura brasileira', 'Antonio Candido', 'livro', 'Todavia', 2023, '9786556924038', 'Iniciação à literatura brasileira foi concebido por Antonio Candido como um resumo da produção literária do país, tendo como público-alvo leitores estrangeiros. Em três capítulos —\"Manifestações literárias\", \"A configuração do sistema literário\" e \"O sistema literário consolidado\"—, Candido sintetiza vasto conhecimento em parágrafos de extrema concisão.', 4, 'P2', 'assets/capas/gb_e744d4f96994b2df.jpg', 0, '2026-10-23 02:58:35'),
(362, 'Estudos brasileiros', 'Ronald de Carvalho', 'livro', '', 1924, 'N/A', '', 1, 'P3', 'assets/capas/gb_c6f7b34c7e694a29.jpg', 0, '2026-10-23 02:58:35'),
(363, 'Revista nacional de literatura y ciencias', 'Daniel Martínez Vigil, Carlos Martínez Vigil, Víctor Pérez Petit, José Enrique Rodó', 'livro', '', 1897, 'N/A', '', 1, 'P10', 'assets/capas/gb_cc4823b0d8daa0ae.jpg', 0, '2026-10-23 02:58:35'),
(364, 'Trovas brasileiras', 'Afrânio Peixoto', 'livro', '', 1944, 'N/A', '', 1, 'P5', 'assets/capas/gb_02803f483f6b7fb6.jpg', 0, '2026-10-23 02:58:35'),
(365, 'La biografia greca', 'Italo Gallo', 'livro', 'Rubbettino Editore', 2005, '884981402X', '', 1, 'P8', 'assets/capas/gb_203f3de616cce3e7.jpg', 0, '2026-10-23 02:59:01');

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
  `status` enum('emprestado','atrasado','devolucao_solicitada','devolvido') DEFAULT 'emprestado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Acionadores `emprestimos`
--
DELIMITER $$
CREATE TRIGGER `calcular_data_devolucao_emprestimo` BEFORE INSERT ON `emprestimos` FOR EACH ROW BEGIN
    IF NEW.data_devolucao_prevista IS NULL THEN
        SET NEW.data_devolucao_prevista = DATE_ADD(DATE(NEW.data_emprestimo), INTERVAL 7 DAY);
    END IF;
    IF NEW.status IS NULL THEN
        SET NEW.status = 'emprestado';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `extrato_reservas`
--

CREATE TABLE `extrato_reservas` (
  `id_extrato` int(11) NOT NULL,
  `id_reserva_original` int(11) DEFAULT NULL,
  `id_aluno` bigint(20) UNSIGNED NOT NULL,
  `id_catalogo` int(11) DEFAULT NULL,
  `titulo_item` varchar(255) NOT NULL,
  `tipo_item` varchar(50) DEFAULT NULL,
  `data_reserva` datetime NOT NULL,
  `data_limite` date DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `data_arquivamento` timestamp NOT NULL DEFAULT current_timestamp(),
  `mes_referencia` char(7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'adm@gmail.com', '$2y$10$0DzluewEFsa8F015rFGWxONMzJmszkdi0hAYLeaFH3vsVRMuaWCAa', 'Administrador de demonstração');

-- --------------------------------------------------------

--
-- Estrutura para tabela `login_admin_tentativas`
--

CREATE TABLE `login_admin_tentativas` (
  `id` int(11) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Pedro', '3º ano', 'pedrosschweitzer@gmail.com', '$2y$10$U8dLqw2uWlF6ob..xzCbbufl/3fuj0kSuzCq30gbG0Hjkv8jlDA5S', '808b7c643da770ae1751d8f30b1f26da82e34a97ed27037a8daeb9324cd32e62', '2026-11-21 23:59:42');

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
  `status` enum('pendente','aprovada','rejeitada','expirada','retirada','cancelada') DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD PRIMARY KEY (`id_catalogo`),
  ADD KEY `idx_catalogo_destaque` (`destaque`);

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
-- Índices de tabela `extrato_reservas`
--
ALTER TABLE `extrato_reservas`
  ADD PRIMARY KEY (`id_extrato`),
  ADD KEY `idx_mes` (`mes_referencia`),
  ADD KEY `idx_aluno` (`id_aluno`);

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
-- Índices de tabela `login_admin_tentativas`
--
ALTER TABLE `login_admin_tentativas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tentativas_ip` (`ip`,`criado_em`),
  ADD KEY `idx_tentativas_email` (`email`,`criado_em`);

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
  MODIFY `id_catalogo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=366;

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
  MODIFY `id_emprestimo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `extrato_reservas`
--
ALTER TABLE `extrato_reservas`
  MODIFY `id_extrato` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de tabela `login_admin_tentativas`
--
ALTER TABLE `login_admin_tentativas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `login_aluno`
--
ALTER TABLE `login_aluno`
  MODIFY `id_aluno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT;

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
-- Restrições para tabelas `extrato_reservas`
--
ALTER TABLE `extrato_reservas`
  ADD CONSTRAINT `extrato_reservas_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `login_aluno` (`id_aluno`) ON DELETE CASCADE;

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

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 08/10/2026 às 16:26
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
(2, 'A Literatura brasileira', NULL, 'livro', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, '2026-09-23 11:32:27'),
(47, 'A poética do recorte', NULL, 'livro', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, '2026-09-23 11:32:27'),
(54, 'A primeira aula', NULL, 'livro', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, '2026-09-23 11:32:27'),
(59, 'A Ficção da Página: Seleção de Ensaios sobre a Literatura Brasileira', NULL, 'livro', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, '2026-09-23 11:32:27'),
(65, 'A nova literatura', NULL, 'livro', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, '2026-09-23 11:32:27'),
(70, 'A Academia brasileira de letras', NULL, 'livro', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, '2026-09-23 11:32:27'),
(102, 'A Maquina Performatica', NULL, 'livro', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, '2026-09-23 11:32:27'),
(115, 'A Escrita da Cidade', NULL, 'livro', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, '2026-09-23 11:32:27'),
(132, 'História da Literatura Brasileira', 'José Verìssimo', 'livro', 'BoD - Books on Demand', 2024, '9791043106644', '\"História da Literatura Brasileira\" de José Veríssimo é uma obra seminal que examina a evolução da literatura no Brasil desde suas origens até o início do século XX. Publicada em 1916, esta obra é uma das primeiras tentativas de sistematizar e analisar criticamente a produção literária brasileira. José Veríssimo, um dos fundadores da Academia Brasileira de Letras, foi um crítico literário e historiador que desempenhou um papel fundamental na consolidação dos estudos literários no Brasil. \"História da Literatura Brasileira\" de José Veríssimo é uma obra monumental que oferece uma análise abrangente e crítica da evolução da literatura no Brasil. Combinando erudição e clareza, Veríssimo fornece uma visão detalhada dos principais movimentos literários e dos autores que moldaram a literatura brasileira, tornando-se uma leitura essencial para a compreensão do desenvolvimento literário do país.', 3, 'P10', 'assets/capas/132.jpg', 0, '2026-09-30 15:36:07'),
(133, 'Literatura brasileira', 'Desconhecido', 'livro', '', 2010, 'N/A', '', 4, 'P8', '', 0, '2026-09-30 15:36:07'),
(134, 'Senhora', 'José de Alencar', 'livro', 'Barsa Literatura', 2024, '9788542221114', 'Senhora\" é uma obra clássica da literatura brasileira, escrita por José de Alencar, que mergulha o leitor em uma narrativa rica e envolvente. Através de suas páginas, você será transportado para o século XIX, onde a história de amor e os dilemas sociais da época se entrelaçam de forma magistral. Este livro, publicado pela Editora Planeta do Brasil LTDA, é uma excelente adição à sua coleção literária. Com um formato físico, ele proporciona uma experiência de leitura tangível, permitindo que você aprecie cada detalhe da obra enquanto desfruta do prazer de folhear suas páginas. Escrito em português, \"Senhora\" é acessível a todos que desejam explorar a profundidade da literatura nacional. A obra não apenas entretém, mas também provoca reflexões sobre o papel da mulher na sociedade, tornando-se uma leitura essencial para quem busca compreender as nuances da cultura brasileira. Adquira \"Senhora\" e permita-se vivenciar uma história que transcende o tempo, enriquecendo sua biblioteca pessoal e sua compreensão da literatura. É uma oportunidade de se conectar com um dos grandes clássicos da literatura brasileira e apreciar a beleza da prosa de Alencar. Aurélia, filha de uma costureira pobre, é apaixonada por Fernando Seixas. Porém, ele prefere ficar com uma moça rica que pode lhe dar um bom futuro. Uma reviravolta faz com que o homem fique à mercê das vontades de Aurélia.', 1, 'P9', 'assets/capas/134.jpg', 0, '2026-09-30 15:36:07'),
(135, 'Insônia', 'Graciliano Ramos', 'livro', 'Editora Record', 2013, '9788501404411', 'Clássico de um dos maiores escritores da literatura brasileira, autor de Vidas secas e S. Bernardo. Esta obra reúne treze contos de Graciliano Ramos, em que estão presentes a secura emotiva e a economia vocabular, características estilísticas do autor, que convivem com a precisão psicológica. Neste livro, Graciliano amplia os cenários em que seus personagens interagem, inserindo-os no mundo da cidade, no qual os dilemas do ser humano são tratados a partir dos medos e inseguranças de seus protagonistas com problemas próprios das urbes, como a violência, a fragilidade dos relacionamentos estabelecidos e o progresso atroz e irreversível do concreto armado.', 2, 'P1', 'assets/capas/135.jpg', 0, '2026-09-30 15:36:08'),
(136, 'Presença da literatura brasileira', 'Antônio Cândido, José Aderaldo Castello', 'livro', '', 2001, 'N/A', '', 1, 'P1', 'assets/capas/136.jpg', 0, '2026-09-30 15:36:08'),
(137, 'Breves estudos de literatura brasileira', 'Cassiano Nunes', 'livro', '', 1969, 'N/A', '', 5, 'P2', 'assets/capas/137.jpg', 0, '2026-09-30 15:36:08'),
(138, 'Representação literária do indígena na literatura brasileira', 'Danglei de Castro Pereira', 'livro', '', 2021, '6556372692', '', 3, 'P8', '', 0, '2026-09-30 15:36:09'),
(139, 'Estudos de literatura brasileira', 'Haroldo Bruno', 'livro', '', 1966, 'N/A', '', 4, 'P10', 'assets/capas/139.jpg', 0, '2026-09-30 15:36:09'),
(140, 'O negro na literatura brasileira', 'Raymond S. Sayers', 'livro', '', 1958, 'N/A', '', 4, 'P8', 'assets/capas/140.jpg', 0, '2026-09-30 15:36:09'),
(141, 'The Cambridge History of Latin American Literature', 'Roberto Gonzalez Echevarría, Enrique Pupo-Walker', 'livro', 'Cambridge University Press', 1996, '0521410355', 'The Cambridge History of Latin American Literature is by far the most comprehensive work of its kind ever written. Its three volumes cover the whole sweep of Latin American literature (including Brazilian) from pre-Colombian times to the present, and contain chapters on Latin American writing in the USA. Volume 3 is devoted partly to the history of Brazilian literature, from the earliest writing through the colonial period and the Portuguese-language traditions of the nineteenth and twentieth centuries; and partly also to an extensive bibliographical section in which annotated reading lists relating to the chapters in all three volumes of The Cambridge History of Latin American Literature are presented. These bibliographies are a unique feature of the History, further enhancing its immense value as a reference work.', 5, 'P7', 'assets/capas/141.jpg', 0, '2026-09-30 15:36:09'),
(142, 'Tempos da literatura brasileira', 'Benjamin Abdala Júnior, Samira Campedelli', 'livro', '', 1985, 'N/A', '', 2, 'P1', 'assets/capas/142.jpg', 0, '2026-09-30 15:36:12'),
(143, 'Literatura brasileira contemporânea', 'Regina Dalcastagnè', 'livro', '', 2012, 'N/A', '', 1, 'P9', 'assets/capas/143.jpg', 0, '2026-09-30 15:36:12'),
(144, 'O romance histórico na literatura brasileira', 'José Antônio Pereira Ribeiro', 'livro', '', 1976, 'N/A', '', 4, 'P7', 'assets/capas/144.jpg', 0, '2026-09-30 15:36:12'),
(145, 'Brasil Na América Latina, O', 'Hartmut Sangmeister, Sérgio Costa, Arbeitsgemeinschaft Deutsche Lateinamerika-Forschung. Symposium', 'livro', 'Annablume', 2007, '8574197629', '', 4, 'P1', 'assets/capas/145.jpg', 0, '2026-09-30 15:36:13'),
(146, 'Catalog of the Latin American Collection', 'University of Texas at Austin. Library. Latin American Collection', 'livro', '', 1969, 'N/A', '', 3, 'P2', 'assets/capas/146.jpg', 0, '2026-09-30 15:36:13'),
(147, 'Estudos de cultura e literatura brasileira', 'Jorge de Sena', 'livro', '', 1988, 'N/A', '', 4, 'P7', 'assets/capas/147.jpg', 0, '2026-09-30 15:36:13'),
(148, 'Origens da literatura brasileira', 'Desconhecido', 'livro', '', 1979, 'N/A', '', 5, 'P9', 'assets/capas/148.jpg', 0, '2026-09-30 15:36:14'),
(149, 'Literatura brasileira ...', 'Alvaro Guerra', 'livro', '', 1923, 'N/A', '', 4, 'P1', 'assets/capas/149.jpg', 0, '2026-09-30 15:36:14'),
(150, 'Bending the Rules in the Quest for an Authentic Female Identity', 'Cristina Santos', 'livro', 'Peter Lang', 2004, '0820469173', 'The narrative style of both Clarice Lispector and Carmen Boullosa is characterized by a postmodern tendency toward an increased reader participation. This is accomplished by a process of liberalizing a pre-established socio-cultural repertoire with respect to female identity. The female protagonists, created by Lispector and Boullosa and examined in this book, struggle to find their true voices and their real life experiences. The resulting literary style of both these authors parallels this struggle, subverting traditional narrative structure and utilizing a dialogue that is particularly suited to describe this feminine process of conscientization.', 3, 'P6', 'assets/capas/150.jpg', 0, '2026-09-30 15:36:14'),
(151, 'Revista da Academia Brasileira de Letras', 'Academia Brasileira de Letras', 'livro', '', 1929, 'N/A', '', 1, 'P2', 'assets/capas/151.jpg', 0, '2026-09-30 15:36:15'),
(152, 'Antologia escolar de literatura brasileira', 'Maria Magaly Trindade Gonçalves, Zélia Maria Thomaz de Aquino', 'livro', '', 1998, 'N/A', 'Antologia Escolar de Literatura Brasileira abarca 500 anos de nosso cânon literário, desde o Descobrimento do Brasil. Reúne poetas e prosadores, a partir de Anchieta, o primeiro de nossos professores a cultivar a palavra artística na escola, até autores modernos e contemporâneos. Livro não efêmero, feito para acompanhar cada aluno, da infância no 1o grau à universidade. Também para ser lido em casa, entre amigos e familiares. Um livro escolar que não exclui os outros livros didáticos, capaz de conviver com os demais, onde cada texto motiva para a leitura de novos textos. Ter a literatuta na memória, pois o instrumental das mais avançadas tecnologias só se realiza com o conhecimento literário, mistérios que se complementam em aventura ou ventura e domínio, a fazer de cada criança ou adolescente o ser humano educado.', 5, 'P4', 'assets/capas/152.jpg', 0, '2026-09-30 15:36:15'),
(153, 'Brazilian Literature', 'David William Foster, Walter Rela', 'livro', 'Scholarly Title', 1990, 'N/A', '', 5, 'P1', 'assets/capas/153.jpg', 0, '2026-09-30 15:36:15'),
(154, 'História da Literatura Brasileira - Vol. III', 'Massaud Moisés', 'livro', 'Editora Cultrix', 2020, '9788531615733', 'Este volume de História da Literatura Brasileira, dedicado ao estudo das correntes do Modernismo, não apenas foi inteiramente revisto como também atualizado, a fim de acompanhar a criação literária das últimas décadas. Massaud Moisés percorreu os momento sem que se pode fragmentar a modernidade entre nós, desde a Semana de Arte Moderna até o fim do século XX: de 1922 a 1928, fase de implantação do ideário modernista; de 1928 a 1945, de consolidação das conquistas renovadoras; e de 1945 em diante, a geração do pós-guerra, chegando a uma análise minuciosa das tendências contemporâneas. O resultado é um panorama das nossas letras a partir dos anos 1920, que se recomenda pela soma de informações recolhidas e pelo balanço crítico, tornando este livro indispensável a todos que desejam uma visão ampla, fecunda e renovadora da nossa modernidade literária nas diversas facetas que veio exibindo ao longo de mais de oito decênios.', 2, 'P6', 'assets/capas/154.jpg', 0, '2026-09-30 15:36:16'),
(155, 'Escritos de literatura brasileira', 'Letícia Malard', 'livro', '', 1981, 'N/A', '', 3, 'P9', 'assets/capas/155.jpg', 0, '2026-09-30 15:36:16'),
(156, 'Catalog', 'University of Texas. Library. Latin American Collection', 'livro', '', 1969, 'N/A', '', 2, 'P10', 'assets/capas/156.jpg', 0, '2026-09-30 15:36:16'),
(157, 'Por uma história da literatura brasileira contemporânea', 'Wellington Furtado Ramos, Erick Vinicius Mathias Leite', 'livro', 'Paco e Littera', 2023, '9788546223749', 'Orientado pelo esforço de construir uma história da literatura brasileira contemporânea, aquela possível a partir de perspectivas teóricas as mais variadas e que se dedicam à maior variedade possível de autores, o volume foi organizado a partir de uma chamada que possibilitasse aos pesquisadores submeterem seus manuscritos desde que comprometidos: com a apresentação de autor e obra; com uma abordagem analítica que considerasse o aspecto formal/linguístico dos textos literários; e com obras localizadas no intervalo de publicação de 1975 a 2021. Assim nasceu a coletânea que o leitor tem em mãos, um convite à leitura das obras dos autores nela tratadas.', 1, 'P3', 'assets/capas/157.jpg', 0, '2026-09-30 15:36:17'),
(158, 'Dictionary Catalog of the University Library, 1919-1962', 'University of California, Los Angeles. Library', 'livro', '', 1963, 'N/A', '', 5, 'P8', 'assets/capas/158.jpg', 0, '2026-09-30 15:36:19'),
(159, 'Listening to the People\'s Voice', 'Mark Dinneen', 'livro', 'Routledge', 1996, 'N/A', 'First published in 1996. Routledge is an imprint of Taylor & Francis, an informa company.', 1, 'P6', 'assets/capas/159.jpg', 0, '2026-09-30 15:36:19'),
(160, 'Brazil', 'Ronald M. Harmon, Bobby J. Chamberlain', 'livro', '', 1975, 'N/A', '', 3, 'P10', 'assets/capas/160.jpg', 0, '2026-09-30 15:36:20'),
(161, 'Vultos e livros: Academia brasileira de letras. 1. serie', 'Arthur Motta', 'livro', '', 1921, 'N/A', '', 1, 'P1', 'assets/capas/161.jpg', 0, '2026-09-30 15:36:20'),
(162, 'A Current Bibliography on African Affairs', 'Desconhecido', 'livro', '', 1987, 'N/A', '', 4, 'P5', 'assets/capas/162.jpg', 0, '2026-09-30 15:36:20'),
(163, 'MLA International Bibliography of Books and Articles on the Modern Languages and Literatures', 'Desconhecido', 'livro', '', 1977, 'N/A', 'Vols. for 1969- include ACTFL annual bibliography of books and articles on pedagogy in foreign languages 1969-', 1, 'P7', 'assets/capas/163.jpg', 0, '2026-09-30 15:36:21'),
(164, 'Monographic Series', 'Library of Congress', 'livro', '', 1974, 'N/A', '', 5, 'P3', 'assets/capas/164.jpg', 0, '2026-09-30 15:36:21'),
(165, 'Cassell\'s Encyclopædia of World Literature: Histories and general articles, Biographies to 1914 A-H', 'Sigfrid Henry Steinberg', 'livro', '', 1954, 'N/A', '', 4, 'P10', 'assets/capas/165.jpg', 0, '2026-09-30 15:36:21'),
(166, 'Veja', 'Desconhecido', 'livro', '', 1990, 'N/A', '', 2, 'P8', 'assets/capas/166.jpg', 0, '2026-09-30 15:36:22'),
(167, 'Pequena historia da literatura brasileira', 'Ronald de Carvalho', 'livro', '', 1925, 'N/A', '', 4, 'P7', 'assets/capas/167.jpg', 0, '2026-09-30 15:36:22'),
(168, 'Charts of Brazilian Literature', 'Joseph Newhall Lincoln', 'livro', '', 1947, 'N/A', '', 1, 'P8', 'assets/capas/168.jpg', 0, '2026-09-30 15:36:22'),
(169, 'Luso-Braz. Rev', 'Desconhecido', 'livro', '', 2001, 'N/A', '', 4, 'P1', 'assets/capas/169.jpg', 0, '2026-09-30 15:36:23'),
(170, 'Science & Society', 'Bernhard Joseph Stern', 'livro', '', 1942, 'N/A', 'Includes section \"Book reviews.\"', 5, 'P10', 'assets/capas/170.jpg', 0, '2026-09-30 15:36:24'),
(171, 'Library of Congress Catalogs', 'Library of Congress', 'livro', '', 1960, 'N/A', '', 5, 'P6', 'assets/capas/171.jpg', 0, '2026-09-30 15:36:24'),
(172, 'Cassell\'s Encyclopædia of World Literature', 'Sigfrid Henry Steinberg', 'livro', '', 1954, 'N/A', '', 4, 'P1', 'assets/capas/172.jpg', 0, '2026-09-30 15:36:24'),
(173, 'Tornar-se outro', 'Maria Cândida Ferreira de Almeida', 'livro', '', 2002, 'N/A', '', 3, 'P10', 'assets/capas/173.jpg', 0, '2026-09-30 15:36:25'),
(174, 'Ariano Suassuna\'s A Pedra Do Reino', 'Candace Adelaide Slater', 'livro', '', 1975, 'N/A', '', 2, 'P2', 'assets/capas/174.jpg', 0, '2026-09-30 15:36:25'),
(175, 'Subject Index of the Modern Works Added to the British Museum Library', 'Desconhecido', 'livro', '', 1956, 'N/A', '', 3, 'P9', 'assets/capas/175.jpg', 0, '2026-09-30 15:36:27'),
(176, 'História da literatura brasileira: Realismo e simbolismo', 'Massaud Moisés', 'livro', '', 2001, '8531606985', '', 3, 'P6', '', 0, '2026-09-30 15:36:28'),
(177, 'Sobre os ombros de gigantes', 'Maria Inês de Moraes Marreco', 'livro', '', 2022, '6500411757', '', 1, 'P6', '', 0, '2026-09-30 15:36:28'),
(178, 'Catalog of the Oliveira Lima Library', 'Oliveira Lima Library', 'livro', 'Boston, Mass : G. K. Hall', 1970, 'N/A', '', 1, 'P5', 'assets/capas/178.jpg', 0, '2026-09-30 15:36:28'),
(179, 'Brazilian Art', 'Brasil. Ministério das Relações Exteriores', 'livro', '', 1976, 'N/A', '\"The purpose of this publication of the ministry of External Relations is to offer to foreign readers a brief profile of Art in Brazil. The text endeavours to point out the principal historical phases and give special emphasis to the highlights of Brazilian culture\"--Pref.', 2, 'P4', 'assets/capas/179.jpg', 0, '2026-09-30 15:36:28'),
(180, 'Obras completas de Castro Alves', 'Castro Alves', 'livro', '', 1938, 'N/A', '', 2, 'P5', 'assets/capas/180.jpg', 0, '2026-09-30 15:36:28'),
(181, 'Poetas brasileros', 'Enrique Bustamante y Ballivián', 'livro', '', 1922, 'N/A', '', 1, 'P5', 'assets/capas/181.jpg', 0, '2026-09-30 15:36:29'),
(182, 'Recent Brazilian Acquisitions of the Latin American Collection of the University of Texas Library', 'University of Texas. Library. Latin American Collection', 'livro', '', 1968, 'N/A', '', 2, 'P3', 'assets/capas/182.jpg', 0, '2026-09-30 15:36:29'),
(183, 'Introdução à literatura brasileira', 'Alceu Amoroso Lima', 'livro', '', 1995, '8522003890', '', 4, 'P3', '', 0, '2026-09-30 15:36:29'),
(184, 'The Hispanic American Historical Review', 'James Alexander Robertson', 'livro', '', 1938, 'N/A', 'Includes \"Bibliographical section\".', 4, 'P8', 'assets/capas/184.jpg', 0, '2026-09-30 15:36:29'),
(185, 'The National Union Catalog, Pre-1956 Imprints', 'Desconhecido', 'livro', '', 1968, 'N/A', '', 2, 'P9', 'assets/capas/185.jpg', 0, '2026-09-30 15:36:30'),
(186, 'Cassell\'s Encyclopaedia of Literature: Histories of the literatures of the world; and general literary subjects ; Biographies of authors who died before 1 August 1914 [A', 'Sigfrid Henry Steinberg', 'livro', '', 1953, 'N/A', '', 1, 'P3', 'assets/capas/186.jpg', 0, '2026-09-30 15:36:30'),
(187, 'Brasil', 'Desconhecido', 'livro', '', 1988, 'N/A', '', 1, 'P7', 'assets/capas/187.jpg', 0, '2026-09-30 15:36:30'),
(188, 'Dictionary Catalog of the Jesse E. Moorland Collection of Negro Life and History, Howard University Library, Washington, D.C.', 'Moorland Foundation', 'livro', '', 1970, 'N/A', '', 2, 'P4', 'assets/capas/188.jpg', 0, '2026-09-30 15:36:30'),
(189, 'Literatura Brasileira em Foco IX', 'Leonardo Davino de Oliveira', 'livro', '', 2022, '6559660982', '', 2, 'P5', '', 0, '2026-09-30 15:36:31'),
(190, 'Duas dezenas de imortais, vivos alguns, outros desaparecidos: Autores desaparecidos (2a dezena): Artur Azevedo, Dantas Barreto, Euclides da Cunha, José Veríssimo, Lauro Müler, Machado de Assis, Osório Duque Estrada, Rui Barbosa, Santos Dumont e Sí...', 'Liberato Bittencourt', 'livro', '', 1935, 'N/A', '', 3, 'P1', 'assets/capas/190.jpg', 0, '2026-09-30 15:36:31'),
(191, 'Escritores são humanos', 'Carlos Costa', 'livro', '', 2023, '6554391584', '', 2, 'P6', '', 0, '2026-09-30 15:36:31'),
(192, 'Espaços possíveis na literatura brasileira contemporânea', 'Desconhecido', 'livro', '', 2015, '8580490324', '', 3, 'P3', '', 0, '2026-09-30 15:36:31'),
(193, 'Biographical Dictionaries and Related Works', 'Robert B. Slocum', 'livro', '', 1986, 'N/A', '', 2, 'P7', 'assets/capas/193.jpg', 0, '2026-09-30 15:36:31'),
(194, 'Literatura brasileira no exterior', 'Alexandre Pilati', 'livro', '', 2024, '8521703597', '', 2, 'P9', '', 0, '2026-09-30 15:36:33'),
(195, 'Diálogos com a literatura brasileira', 'Marco Vasques', 'livro', '', 2004, 'N/A', '', 5, 'P8', 'assets/capas/195.jpg', 0, '2026-09-30 15:36:33'),
(196, 'Subject Catalog', 'Library of Congress', 'livro', '', 0, 'N/A', '', 2, 'P6', 'assets/capas/196.jpg', 0, '2026-09-30 15:36:33'),
(197, 'Literary Cultures of Latin America : a Comparative History: Configurations of literary culture', 'Mario J. Valdés, Djelal Kadir', 'livro', 'Oxford University Press, USA', 2004, 'N/A', 'In three volumes of expert, innovative scholarship, Literary Cultures of Latin America offers a multidisciplinary reference on one of the most distinctive literary cultures in the world. In topically arranged articles written by a team of international scholars, Literary Cultures of Latin America explores the shifting problems that have arisen across national borders, geographic regions, time periods, linguistic systems, and cultural traditions in literary history. Bucking the tradition of focusing almost exclusively on the great canons of literature, this unique reference work casts its net wider, exploring pop culture, sermons, scientific essays, and more. While collaborators are careful to note that these volumes offer only a snapshot of the diverse body of Latin American literature, Literary Cultures of Latin America highlights unique cultural perspectives that have never before received academic attention. Comprised of signed articles each with complete bibliographies, this unique reference also takes into account relevant political, anthropological, economic, geographic, historical, demographic, and sociological research in order to understand the full context of each community\'s literature.', 4, 'P6', 'assets/capas/197.jpg', 0, '2026-09-30 15:36:33'),
(198, 'G.K. Hall Bibliographic Guide to Latin American Studies', 'Benson Latin American Collection', 'livro', '', 2000, 'N/A', '', 5, 'P9', 'assets/capas/198.jpg', 0, '2026-09-30 15:36:34'),
(199, 'Aspectos da literatura brasileira', 'Paulo Roberto Correia de Oliveira', 'livro', '', 2018, '8561817534', '', 5, 'P9', '', 0, '2026-09-30 15:36:34'),
(200, 'Narrativas contemporâneas', 'Gínia Maria Gomes', 'livro', '', 2012, '8588412691', 'Esta obra reúne ensaios críticos centrados em romances e contos publicados, sobretudo, no século XXI. Sumário - Percursos da narrativa contemporânea; Teorias da cidade - do moderno ao pós-moderno; Cidade livre - fundação e memória cultural; Fisiognomia da contemporaneidade em Eles eram muitos cavalos, de Luiz Ruffato; Estraneidade e exclusão na São Petersburgo de O filho da mãe, de Bernardo Carvalho; Os percalços da memória em Leite derramado, de Chico Buarque; A prosa agonizante de Diário de um fescenino - antecedentes e condicionantes; O tempo no romance brasileiro contemporâneo; \'Pobre diabo\' e dissolução em A arte de produzir efeito sem causa, de Lourenço Mutarelli; Paredes do silêncio ou silêncios no escuro? Reflexões sobre o romance de Altair Martins; À sombra da cal, uma leitura de Ricardo Dicke; Entrecruzamento de vozes narrativas em Nove noites; Os (des)caminhos da Galileia - uma leitura do romance de Ronaldo Correia de Brito; Relato de um certo Oriente, de Milton Hatoum - a reconstrução do ser através da memória; Elementos para um estudo enunciativo de Leite derramado, de Chico Buarque.', 3, 'P8', '', 0, '2026-09-30 15:36:34'),
(201, 'Contemporâneos', 'Beatriz Resende', 'livro', '', 2008, '8577340945', 'Em ensaios sobre a produção atual, Beatriz Resende analisa o papel da cidade, da violência e da internet nos novos romances, crônicas e contos. Em \'Contemporâneos - Expressões da Literatura Brasileira no Século XXI\', a autora analisa a obra de escritores como Bernardo Carvalho, Daniel Galera, Cecília Giannetti, Ana Paula Maia, Santiago Nazarian, Joca Terron, Marçal Aquino, Maira Parula, Paloma Vidal, Marcelino Freire e Luiz Schwarcz.', 4, 'P7', '', 0, '2026-09-30 15:36:34'),
(202, 'Post-scripta', 'Silvia Albertazzi, Gabriella Imposti, Donatella Possamai', 'livro', 'Il Poligrafo', 2005, 'N/A', '', 3, 'P2', 'assets/capas/202.jpg', 0, '2026-09-30 15:36:34'),
(203, 'The National union catalog, 1968-1972', 'Desconhecido', 'livro', '', 1973, 'N/A', '', 2, 'P10', 'assets/capas/203.jpg', 0, '2026-09-30 15:36:34'),
(204, 'Estudios latinoamericanos', 'Desconhecido', 'livro', '', 1990, 'N/A', '', 5, 'P2', 'assets/capas/204.jpg', 0, '2026-09-30 15:36:35'),
(205, 'Letras e literatos', 'José Veríssimo', 'livro', '', 1936, 'N/A', '', 3, 'P1', 'assets/capas/205.jpg', 0, '2026-09-30 15:36:35'),
(206, 'O cego e o trapezista', 'Adriano Espínola', 'livro', 'Cepe editora', 2022, '9788578589714', 'Este livro reúne artigos e ensaios de Adriano Espínola, sobre os mais significativos escritores brasileiros, de diversos gêneros, do século XVI ao XXI. O traço em comum entre esses escritores é o fato de expressarem, direta ou indiretamente, a realidade humana, social e geográfica de um país em processo constante de construção e afirmação, em que pese as contradições surgidas devido às influências literárias externas - sobretudo europeias - e as manifestações linguísticas, sociais, afetivas e culturais internas.', 3, 'P7', 'assets/capas/206.jpg', 0, '2026-09-30 15:36:35'),
(207, 'História da literatura brasileira, séculos XVI-XX.', 'Antônio Soares Amora', 'livro', '', 1965, 'N/A', '', 2, 'P9', 'assets/capas/207.jpg', 0, '2026-09-30 15:36:35'),
(208, 'Actes du VIIIe congrès de l\'Association internationale de littérature comparée', 'Béla Köpeczi', 'livro', '', 1980, 'N/A', '', 4, 'P4', 'assets/capas/208.jpg', 0, '2026-09-30 15:36:36'),
(209, 'Actes Du ... Congrès de L\'Association Internationale de Littérature Comparée', 'International Comparative Literature Association. Congress', 'livro', '', 1980, 'N/A', '', 3, 'P4', 'assets/capas/209.jpg', 0, '2026-09-30 15:36:36');

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
(1, 'ultimo_arquivamento', '2026-10-08', 'Data do último arquivamento mensal de reservas', '2026-10-08 12:51:19');

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

--
-- Despejando dados para a tabela `configuracoes_aluno`
--

INSERT INTO `configuracoes_aluno` (`id`, `usuario_id`, `chave`, `valor`, `descricao`, `atualizado_em`) VALUES
(1, 2, 'tamanho_fonte', 'grande', NULL, '2026-09-28 11:10:59'),
(2, 2, 'tema', 'escuro', NULL, '2026-09-28 11:10:59'),
(3, 2, 'daltonismo', 'deuteranopia', NULL, '2026-09-28 11:11:18'),
(4, 2, 'espacamento', 'normal', NULL, '2026-09-28 11:10:59'),
(5, 2, 'reduzir_animacoes', '0', NULL, '2026-09-28 11:10:59');

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
  `status` enum('emprestado','atrasado','devolvido') DEFAULT 'emprestado',
  `renovado` tinyint(1) NOT NULL DEFAULT 0,
  `data_renovacao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `emprestimos`
--

INSERT INTO `emprestimos` (`id_emprestimo`, `id_aluno`, `id_catalogo`, `titulo_item`, `data_emprestimo`, `data_devolucao_prevista`, `status`, `renovado`, `data_renovacao`) VALUES
(1, 1, 102, 'A Maquina Performatica', '2026-09-02 10:31:46', '2026-09-11', 'devolvido', 0, NULL),
(2, 1, 2, 'A Literatura brasileira', '2026-09-02 10:32:45', '2026-09-11', 'devolvido', 0, NULL),
(3, 2, 54, 'A primeira aula', '2026-09-28 08:15:07', '2026-10-07', 'devolvido', 0, NULL),
(4, 2, 59, 'A Ficção da Página: Seleção de Ensaios sobre a Literatura Brasileira', '2026-09-28 08:16:18', '2026-10-07', 'devolvido', 0, NULL),
(5, 2, 47, 'A poética do recorte', '2026-09-30 10:34:46', '2026-10-09', 'devolvido', 0, NULL),
(6, 1, 47, 'A poética do recorte', '2026-09-30 12:32:29', '2026-10-09', 'devolvido', 0, NULL),
(7, 1, 54, 'A primeira aula', '2026-09-30 12:34:10', '2026-10-09', 'devolvido', 0, NULL),
(8, 1, 115, 'A Escrita da Cidade', '2026-09-30 12:35:13', '2026-10-09', 'emprestado', 0, NULL),
(9, 100, 132, 'História da Literatura Brasileira', '2026-10-05 10:09:34', '2026-10-12', 'emprestado', 0, NULL),
(10, 100, 134, 'Senhora', '2026-10-06 10:09:34', '2026-10-13', 'emprestado', 0, NULL),
(11, 101, 135, 'Insônia', '2026-09-23 10:09:34', '2026-09-30', 'atrasado', 0, NULL),
(12, 102, 136, 'Presença da literatura brasileira', '2026-09-26 10:09:34', '2026-10-03', 'atrasado', 0, NULL),
(13, 103, 137, 'Breves estudos de literatura brasileira', '2026-08-29 10:09:34', '2026-09-05', 'devolvido', 0, NULL),
(14, 104, 138, 'Representação literária do indígena', '2026-10-07 10:09:34', '2026-10-14', 'emprestado', 0, NULL),
(15, 104, 139, 'Estudos de literatura brasileira', '2026-10-04 10:09:34', '2026-10-11', 'emprestado', 0, NULL),
(16, 105, 140, 'O negro na literatura brasileira', '2026-10-05 10:09:34', '2026-10-12', 'emprestado', 0, NULL),
(17, 106, 141, 'The Cambridge History', '2026-09-18 10:09:34', '2026-09-25', 'atrasado', 0, NULL),
(18, 107, 142, 'Tempos da literatura brasileira', '2026-09-13 10:09:34', '2026-09-20', 'atrasado', 0, NULL),
(19, 107, 143, 'Literatura brasileira contemporânea', '2026-08-19 10:09:34', '2026-08-26', 'devolvido', 0, NULL),
(20, 108, 144, 'O romance histórico', '2026-10-06 10:09:34', '2026-10-13', 'emprestado', 0, NULL),
(21, 109, 145, 'Brasil Na América Latina', '2026-10-05 10:09:34', '2026-10-12', 'emprestado', 0, NULL),
(22, 110, 146, 'Catalog of the Latin American', '2026-10-07 10:09:34', '2026-10-14', 'emprestado', 0, NULL),
(23, 111, 147, 'Estudos de cultura e literatura', '2026-09-20 10:09:34', '2026-09-27', 'atrasado', 0, NULL),
(24, 111, 148, 'Origens da literatura brasileira', '2026-09-28 10:09:34', '2026-10-05', 'atrasado', 0, NULL),
(25, 110, 149, 'Literatura brasileira ...', '2026-08-09 10:09:34', '2026-08-16', 'devolvido', 0, NULL),
(26, 112, 150, 'Bending the Rules', '2026-10-06 10:09:34', '2026-10-13', 'emprestado', 0, NULL),
(27, 113, 151, 'Revista da Academia Brasileira', '2026-10-04 10:09:34', '2026-10-11', 'emprestado', 0, NULL),
(28, 114, 152, 'Antologia escolar', '2026-10-05 10:09:34', '2026-10-12', 'emprestado', 0, NULL),
(29, 115, 153, 'Brazilian Literature', '2026-09-16 10:09:34', '2026-09-23', 'atrasado', 0, NULL),
(30, 115, 154, 'História da Literatura - Vol III', '2026-09-24 10:09:34', '2026-10-01', 'atrasado', 0, NULL),
(31, 113, 155, 'Escritos de literatura brasileira', '2026-08-24 10:09:34', '2026-08-31', 'devolvido', 0, NULL),
(32, 116, 156, 'Catalog', '2026-10-05 10:09:34', '2026-10-12', 'emprestado', 0, NULL),
(33, 117, 157, 'Por uma história da literatura', '2026-10-06 10:09:34', '2026-10-13', 'emprestado', 0, NULL),
(34, 118, 158, 'Dictionary Catalog', '2026-10-07 10:09:34', '2026-10-14', 'emprestado', 0, NULL),
(35, 119, 159, 'Listening to the People\'s Voice', '2026-10-04 10:09:34', '2026-10-11', 'emprestado', 0, NULL),
(36, 120, 160, 'Brazil', '2026-09-22 10:09:34', '2026-09-29', 'atrasado', 0, NULL),
(37, 120, 161, 'Vultos e livros', '2026-09-08 10:09:34', '2026-09-15', 'atrasado', 0, NULL),
(38, 116, 162, 'A Current Bibliography', '2026-08-14 10:09:34', '2026-08-21', 'devolvido', 0, NULL),
(39, 121, 163, 'MLA International Bibliography', '2026-10-06 10:09:34', '2026-10-13', 'emprestado', 0, NULL),
(40, 122, 164, 'Monographic Series', '2026-10-05 10:09:34', '2026-10-12', 'emprestado', 0, NULL),
(41, 123, 165, 'Cassell\'s Encyclopædia', '2026-10-07 10:09:34', '2026-10-14', 'emprestado', 0, NULL),
(42, 124, 166, 'Veja', '2026-10-04 10:09:34', '2026-10-11', 'emprestado', 0, NULL),
(43, 125, 167, 'Pequena historia da literatura', '2026-09-19 10:09:34', '2026-09-26', 'atrasado', 0, NULL),
(44, 125, 168, 'Charts of Brazilian Literature', '2026-09-27 10:09:34', '2026-10-04', 'atrasado', 0, NULL),
(45, 124, 169, 'Luso-Braz. Rev', '2026-07-30 10:09:34', '2026-08-06', 'devolvido', 0, NULL),
(46, 126, 170, 'Science & Society', '2026-10-06 10:09:34', '2026-10-13', 'emprestado', 0, NULL),
(47, 126, 171, 'Library of Congress Catalogs', '2026-10-05 10:09:34', '2026-10-12', 'emprestado', 0, NULL),
(48, 127, 172, 'Cassell\'s Encyclopædia of World Lit', '2026-10-07 10:09:34', '2026-10-14', 'emprestado', 0, NULL),
(49, 128, 173, 'Tornar-se outro', '2026-10-04 10:09:34', '2026-10-11', 'emprestado', 0, NULL),
(50, 129, 174, 'Ariano Suassuna\'s A Pedra Do Reino', '2026-10-05 10:09:34', '2026-10-12', 'emprestado', 0, NULL),
(51, 130, 175, 'Subject Index of Modern Works', '2026-09-17 10:09:34', '2026-09-24', 'atrasado', 0, NULL),
(52, 131, 176, 'História da literatura brasileira', '2026-09-25 10:09:34', '2026-10-02', 'atrasado', 0, NULL),
(53, 129, 177, 'Sobre os ombros de gigantes', '2026-08-04 10:09:34', '2026-08-11', 'devolvido', 0, NULL),
(54, 104, 180, 'Obras completas de Castro Alves', '2026-10-08 11:21:23', '2026-10-19', 'emprestado', 0, NULL);

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

--
-- Despejando dados para a tabela `extrato_reservas`
--

INSERT INTO `extrato_reservas` (`id_extrato`, `id_reserva_original`, `id_aluno`, `id_catalogo`, `titulo_item`, `tipo_item`, `data_reserva`, `data_limite`, `status`, `data_arquivamento`, `mes_referencia`) VALUES
(1, 1, 1, 59, 'A Ficção da Página: Seleção de Ensaios sobre a Literatura Brasileira', NULL, '2026-09-02 07:44:36', '2026-09-09', '', '2026-09-02 14:09:00', '2026-09'),
(2, 2, 1, 70, 'A Academia brasileira de letras', NULL, '2026-09-02 07:46:18', '2026-09-09', 'rejeitada', '2026-09-02 14:09:00', '2026-09'),
(3, 3, 1, 115, 'A Escrita da Cidade', NULL, '2026-09-02 07:46:19', '2026-09-09', 'rejeitada', '2026-09-02 14:09:00', '2026-09'),
(4, 4, 1, 59, 'A Ficção da Página: Seleção de Ensaios sobre a Literatura Brasileira', NULL, '2026-09-02 07:46:20', '2026-09-09', '', '2026-09-02 14:09:00', '2026-09'),
(5, 5, 1, 2, 'A Literatura brasileira', NULL, '2026-09-02 07:46:20', '2026-09-09', 'retirada', '2026-09-02 14:09:00', '2026-09'),
(6, 6, 1, 102, 'A Maquina Performatica', NULL, '2026-09-02 07:46:22', '2026-09-09', '', '2026-09-02 14:09:00', '2026-09'),
(7, 7, 1, 65, 'A nova literatura', NULL, '2026-09-02 07:46:23', '2026-09-09', '', '2026-09-02 14:09:00', '2026-09'),
(8, 8, 1, 47, 'A poética do recorte', NULL, '2026-09-02 07:46:23', '2026-09-09', 'aprovada', '2026-09-02 14:09:00', '2026-09'),
(9, 9, 1, 54, 'A primeira aula', NULL, '2026-09-02 07:46:24', '2026-09-09', '', '2026-09-02 14:09:00', '2026-09'),
(10, 10, 1, 70, 'A Academia brasileira de letras', NULL, '2026-09-02 08:51:02', '2026-09-09', 'aprovada', '2026-09-02 14:09:00', '2026-09'),
(11, 11, 1, 59, 'A Ficção da Página: Seleção de Ensaios sobre a Literatura Brasileira', NULL, '2026-09-02 09:42:25', '2026-09-09', '', '2026-09-02 14:09:00', '2026-09'),
(12, 12, 1, 59, 'A Ficção da Página: Seleção de Ensaios sobre a Literatura Brasileira', NULL, '2026-09-02 09:49:31', '2026-09-09', 'rejeitada', '2026-09-02 14:09:00', '2026-09'),
(13, 13, 1, 115, 'A Escrita da Cidade', NULL, '2026-09-02 09:49:32', '2026-09-09', 'rejeitada', '2026-09-02 14:09:01', '2026-09'),
(14, 14, 1, 102, 'A Maquina Performatica', NULL, '2026-09-02 09:49:33', '2026-09-09', 'retirada', '2026-09-02 14:09:01', '2026-09'),
(15, 15, 2, 70, 'A Academia brasileira de letras', 'livro', '2026-09-28 08:10:14', '2026-10-05', 'aprovada', '2026-10-08 12:51:19', '2026-10'),
(16, 16, 2, 115, 'A Escrita da Cidade', 'livro', '2026-09-28 08:10:16', '2026-10-05', 'aprovada', '2026-10-08 12:51:19', '2026-10'),
(17, 17, 2, 59, 'A Ficção da Página: Seleção de Ensaios sobre a Literatura Brasileira', 'livro', '2026-09-28 08:12:10', '2026-10-05', 'retirada', '2026-10-08 12:51:19', '2026-10'),
(18, 18, 2, 2, 'A Literatura brasileira', 'livro', '2026-09-28 08:12:11', '2026-10-05', 'rejeitada', '2026-10-08 12:51:19', '2026-10'),
(19, 19, 2, 102, 'A Maquina Performatica', 'livro', '2026-09-28 08:12:15', '2026-10-05', 'rejeitada', '2026-10-08 12:51:19', '2026-10'),
(20, 20, 2, 65, 'A nova literatura', 'livro', '2026-09-28 08:12:16', '2026-10-05', 'rejeitada', '2026-10-08 12:51:19', '2026-10'),
(21, 21, 2, 47, 'A poética do recorte', 'livro', '2026-09-28 08:12:22', '2026-10-05', 'retirada', '2026-10-08 12:51:19', '2026-10'),
(22, 22, 2, 54, 'A primeira aula', 'livro', '2026-09-28 08:12:23', '2026-10-05', 'retirada', '2026-10-08 12:51:19', '2026-10'),
(23, 23, 1, 70, 'A Academia brasileira de letras', 'livro', '2026-09-30 12:30:22', '2026-10-07', 'cancelada', '2026-10-08 12:51:19', '2026-10'),
(24, 24, 1, 115, 'A Escrita da Cidade', 'livro', '2026-09-30 12:30:23', '2026-10-07', 'retirada', '2026-10-08 12:51:19', '2026-10'),
(25, 25, 1, 2, 'A Literatura brasileira', 'livro', '2026-09-30 12:30:25', '2026-10-07', 'rejeitada', '2026-10-08 12:51:19', '2026-10'),
(26, 26, 1, 65, 'A nova literatura', 'livro', '2026-09-30 12:30:28', '2026-10-07', 'rejeitada', '2026-10-08 12:51:19', '2026-10'),
(27, 27, 1, 47, 'A poética do recorte', 'livro', '2026-09-30 12:30:29', '2026-10-07', 'retirada', '2026-10-08 12:51:19', '2026-10'),
(28, 28, 1, 54, 'A primeira aula', 'livro', '2026-09-30 12:30:30', '2026-10-07', 'retirada', '2026-10-08 12:51:19', '2026-10');

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
(2, 2, 59, 'livro', '2026-09-28 13:10:17'),
(3, 2, 115, 'livro', '2026-09-28 13:12:05'),
(4, 2, 70, 'livro', '2026-09-28 13:12:06'),
(5, 2, 2, 'livro', '2026-09-28 13:12:08'),
(6, 1, 70, 'livro', '2026-09-30 17:30:21'),
(7, 1, 115, 'livro', '2026-09-30 17:30:23'),
(8, 1, 59, 'livro', '2026-09-30 17:30:24'),
(9, 1, 102, 'livro', '2026-09-30 17:30:27');

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
(1, 'adm@gmail.com', '$2y$10$2T5D853uENnqRohNg017FeQCoKGnarTcaJ1g19alskJo7jyP7abp2', 'kaka');

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
(1, 'Ricardo Menezes Lourenco Araujo', '3º ano', 'ricardomenezeslourencoaraujo@aluno.itj.g12.br', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(2, 'Pedro Santos Schweitzer', '3º ano', 'pedrosantosschweitzer@aluno.itj.g12.br', '$2y$10$adz.RRTbCqz4X89grJfIOODYeofcbUwoCghUnjBdJLOkVk16alDeC', '14bd0f0393c5bb4a153acc1b6f309a3487ca490b78af652e67d63b89db53347e', '2026-10-28 13:17:20'),
(100, 'Ana Beatriz Silva', '6º ano', 'ana.beatriz@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(101, 'Bruno Carvalho', '6º ano', 'bruno.carvalho@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(102, 'Camila Rocha', '6º ano', 'camila.rocha@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(103, 'Daniel Pereira', '6º ano', 'daniel.pereira@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(104, 'Eduarda Lima', '7º ano', 'eduarda.lima@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(105, 'Felipe Santana', '7º ano', 'felipe.santana@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(106, 'Gabriela Costa', '7º ano', 'gabriela.costa@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(107, 'Henrique Alves', '7º ano', 'henrique.alves@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(108, 'Isabela Martins', '8º ano', 'isabela.martins@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(109, 'João Pedro Souza', '8º ano', 'joaopedro.souza@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(110, 'Larissa Ribeiro', '8º ano', 'larissa.ribeiro@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(111, 'Mateus Fernandes', '8º ano', 'mateus.fernandes@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(112, 'Natália Barbosa', '9º ano', 'natalia.barbosa@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(113, 'Otávio Nunes', '9º ano', 'otavio.nunes@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(114, 'Paula Cardoso', '9º ano', 'paula.cardoso@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(115, 'Rafael Moreira', '9º ano', 'rafael.moreira@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(116, 'Sabrina Correia', '1º ano', 'sabrina.correia@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(117, 'Thiago Moraes', '1º ano', 'thiago.moraes@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(118, 'Vanessa Pinto', '1º ano', 'vanessa.pinto@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(119, 'Wesley Teixeira', '1º ano', 'wesley.teixeira@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(120, 'Yasmin Duarte', '1º ano', 'yasmin.duarte@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(121, 'Alice Monteiro', '2º ano', 'alice.monteiro@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(122, 'Bernardo Farias', '2º ano', 'bernardo.farias@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(123, 'Carolina Lopes', '2º ano', 'carolina.lopes@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(124, 'Davi Machado', '2º ano', 'davi.machado@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(125, 'Elisa Castro', '2º ano', 'elisa.castro@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(126, 'Fernando Ramos', '3º ano', 'fernando.ramos@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(127, 'Giovanna Vieira', '3º ano', 'giovanna.vieira@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(128, 'Hugo Sales', '3º ano', 'hugo.sales@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(129, 'Ingrid Pacheco', '3º ano', 'ingrid.pacheco@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(130, 'Júlia Andrade', '3º ano', 'julia.andrade@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL),
(131, 'Kevin Barros', '3º ano', 'kevin.barros@teste.siga', '$2y$10$dbfCtmqVlNHP7zhDG9hgo.ky941p5A1THXkH5OSL02Q905qwivSAe', NULL, NULL);

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
-- Despejando dados para a tabela `reservas`
--

INSERT INTO `reservas` (`id_reserva`, `id_aluno`, `id_catalogo`, `titulo_item`, `data_reserva`, `data_limite`, `status`) VALUES
(29, 100, 178, 'Catalog of the Oliveira Lima Library', '2026-10-07 10:09:34', '2026-10-14', 'aprovada'),
(30, 102, 179, 'Brazilian Art', '2026-10-06 10:09:34', '2026-10-13', 'pendente'),
(31, 104, 180, 'Obras completas de Castro Alves', '2026-10-07 10:09:34', '2026-10-14', 'retirada'),
(32, 108, 181, 'Poetas brasileros', '2026-10-05 10:09:34', '2026-10-12', 'pendente'),
(33, 112, 182, 'Recent Brazilian Acquisitions', '2026-10-07 10:09:34', '2026-10-14', 'rejeitada'),
(34, 116, 183, 'Introdução à literatura brasileira', '2026-10-06 10:09:34', '2026-10-13', 'pendente'),
(35, 121, 184, 'The Hispanic American Historical Review', '2026-10-07 10:09:34', '2026-10-14', 'pendente'),
(36, 126, 185, 'The National Union Catalog', '2026-10-06 10:09:34', '2026-10-13', 'pendente'),
(37, 101, 186, 'Cassell\'s Encyclopaedia of Literature', '2026-10-03 10:09:34', '2026-10-10', 'aprovada'),
(38, 105, 187, 'Brasil', '2026-10-04 10:09:34', '2026-10-11', 'aprovada'),
(39, 109, 188, 'Dictionary Catalog of the Jesse', '2026-10-02 10:09:34', '2026-10-09', 'aprovada'),
(40, 117, 189, 'Literatura Brasileira em Foco IX', '2026-10-03 10:09:34', '2026-10-10', 'aprovada'),
(41, 127, 190, 'Duas dezenas de imortais', '2026-10-05 10:09:34', '2026-10-12', 'aprovada'),
(42, 103, 191, 'Escritores são humanos', '2026-09-18 10:09:34', '2026-09-25', 'retirada'),
(43, 113, 192, 'Espaços possíveis na literatura', '2026-09-16 10:09:34', '2026-09-23', 'retirada'),
(44, 122, 193, 'Biographical Dictionaries', '2026-09-20 10:09:34', '2026-09-27', 'retirada'),
(45, 128, 194, 'Literatura brasileira no exterior', '2026-09-13 10:09:34', '2026-09-20', 'retirada'),
(46, 106, 195, 'Diálogos com a literatura brasileira', '2026-09-23 10:09:34', '2026-09-30', 'rejeitada'),
(47, 118, 196, 'Subject Catalog', '2026-09-26 10:09:34', '2026-10-03', 'rejeitada'),
(48, 110, 197, 'Literary Cultures of Latin America', '2026-09-28 10:09:34', '2026-10-05', 'cancelada'),
(49, 130, 198, 'G.K. Hall Bibliographic Guide', '2026-09-08 10:09:34', '2026-09-15', 'expirada');

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
  MODIFY `id_catalogo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=210;

--
-- AUTO_INCREMENT de tabela `configuracoes`
--
ALTER TABLE `configuracoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `configuracoes_aluno`
--
ALTER TABLE `configuracoes_aluno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `emprestimos`
--
ALTER TABLE `emprestimos`
  MODIFY `id_emprestimo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT de tabela `extrato_reservas`
--
ALTER TABLE `extrato_reservas`
  MODIFY `id_extrato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `login_admin`
--
ALTER TABLE `login_admin`
  MODIFY `id_adm` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `login_aluno`
--
ALTER TABLE `login_aluno`
  MODIFY `id_aluno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

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

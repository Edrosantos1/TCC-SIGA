-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 25/10/2026 às 15:53
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
(365, 'La biografia greca', 'Italo Gallo', 'livro', 'Rubbettino Editore', 2005, '884981402X', '', 1, 'P8', 'assets/capas/gb_203f3de616cce3e7.jpg', 0, '2026-10-23 02:59:01'),
(366, 'Aventura', 'Gregorio Martínez Sierra', 'livro', '', 1926, 'N/A', '', 4, 'P5', 'assets/capas/gb_37fd87a6c99741a2.jpg', 0, '2026-10-25 14:49:06'),
(367, 'Las aventuras del barón de Münchhausen', 'Gotffried A. Bürguer', 'livro', 'Editorial Verbum', 2018, '9788490747070', 'El escritor y científico Gotffried A. Bürguer se basó en la vida de un personaje real, Karl Friedrich Hieronymus, miembro de una de las familias más antiguas de la baja Sajonia, para escribir este libro. Hieronymus fue un militar nacido en 1720 que participó en varias campañas y, cuando volvió de ellas, se convirtió en el prmer “cantor” de sus propias aventuras, narrando sus hazañas con un toque fantástico e inverosímil. A lo largo de diecisiete capítulos el barón Münchausen cuenta sus aventuras en primera persona como si de un diario de viaje se tratara. El estilo característico de este tipo de narraciones –ceñidas a hechos reales, objetivos y sometidos al racionalismo humano– se ve alterado por acontecimientos tales como cabalgar sobre un caballo cortado por la mitad, visitar una isla de queso rodeada de un mar de leche, bailar en el estómago de una ballena, viajar a la Luna o bajar al infierno con Vulcano.', 4, 'P7', 'assets/capas/gb_6c409ad6d8e67479.jpg', 0, '2026-10-25 14:49:06'),
(368, 'Novelas de aventuras medievales', 'Isabel Lozano Renieblas', 'livro', 'Edition Reichenberger', 2003, '3935004729', '', 1, 'P5', 'assets/capas/gb_e412d7be254d5966.jpg', 0, '2026-10-25 14:49:06'),
(369, 'Obras Completas 1 Sherlock Holmes', 'Arthur Conan Doyle', 'livro', 'Editorial Del Nuevo Extremo', 2008, '9871427018', '', 3, 'P8', 'assets/capas/gb_8d8fbdb0646c93de.jpg', 0, '2026-10-25 14:49:06'),
(370, 'Sherlock Holmes obras completas Tomo 1', 'Arthur Conan Doyle', 'livro', 'Del Nuevo Extremo', 2022, '9789871427369', '\"La vida es infinitamente más extraña que cualquier cosa que pueda inventar la mente humana. No nos atreveríamos a imaginar ciertas cosas que en realidad son de lo más corrientes. Si pudiéramos salir volando por esa ventana, tomados de la mano, sobrevolar esta gran ciudad, levantar con cuidado los tejados y espiar todas las cosas raras que pasan, las extrañas coincidencias, las intrigas, los engaños, los prodigiosos encadenamientos de circunstancias que se extienden de generación en generación y acaban conduciendo a los resultados más extravagantes, nos parecería que las historias de ficción, con sus convencionalismos y sus conclusiones sabidas de antemano, son algo trasnochado e insípido\".', 2, 'P5', 'assets/capas/gb_d28ca6538b9343df.jpg', 0, '2026-10-25 14:49:06'),
(371, 'El cantar de los Nibelungos', 'Anónimo', 'livro', 'LOM Ediciones', 2024, '9789560018939', 'El Cantar de los Nibelungos es un texto clave de la literatura germana, que con sus historias de magia, venganzas y aventuras amorosas despliega todo el sentido de la maravilla de las gestas medievales. El largo poema tiene su origen en la tradición oral, y forma parte de la corriente de composiciones europeas cuya popularidad en su tiempo se evidencia por la existencia de 37 manuscritos de entre los siglos XII y XVI, siendo solo tres los más completos, que datan del siglo XIII. Aunque el autor original permanece anónimo, se acepta que la estructura básica del poema, con sus motivaciones fundamentales, proviene de un único creador. Esta obra fue enriquecida y modificada por los juglares a través de los siglos, manteniendo viva la tradición oral incluso después de las primeras versiones escritas. En este poema, el término nibelungo denomina a un pueblo mítico de enanos poseedores de un enorme tesoro, el famoso tesoro de los nibelungos. Este cantar de gesta reúne muchas de las leyendas existentes sobre los pueblos germánicos, mezcladas con hechos históricos y creencias mitológicas que, por la profundidad de su contenido, complejidad y variedad de personajes, se convirtió en la epopeya nacional alemana, con la misma jerarquía literaria del Cantar de mio Cid en España y el Cantar de Roldán en Francia. En El Cantar de los Nibelungos se narra la gesta de Siegfried, un cazador de dragones, quien valiéndose de ciertos artificios consigue la mano de la princesa Kriemhild. Sin embargo, una torpe indiscreción termina por provocar una horrorosa cadena de venganzas.', 1, 'P6', 'assets/capas/gb_bbe376f2607f15d2.jpg', 0, '2026-10-25 14:49:06'),
(372, 'El fuego de la verdad', 'José Ignacio Munilla', 'livro', 'Nueva Eva', 2024, 'N/A', 'Durante tres años he dedicado una sección del programa que presento en Radio María, Sexto Continente, a comentar una selección de aforismos de Chesterton en torno a las principales cuestiones de la vida. Ahora he querido recoger todas sus intuiciones proféticas y mis comentarios en forma de libro. Espero que te ayuden, querido lector, a comprender mejor por qué está en crisis el pensamiento contemporáneo y por qué nuestra fe tiene más actualidad que nunca. Sabernos hijos de Dios nos sitúa en primera línea de esa batalla por la esperanza, la verdad y el amor que los cristianos estamos llamados a dar. Y para ser capaces de discernir lo que hemos de hacer y los pasos a dar, nos serán de gran ayuda cinco sentidos fundamentales —los sentidos corporales, el sentido sobrenatural, el sentido crítico, el sentido común y el sentido del humor—, que además nos permitirán disfrutar de los dones de Dios ya a este lado de la eternidad.', 2, 'P8', 'assets/capas/gb_dc86fec35ea04b48.jpg', 0, '2026-10-25 14:49:06'),
(373, 'La aventura de los galeotes', 'Serafín Álvarez Quintero, Joaquín Álvarez Quintero', 'livro', '', 1905, 'N/A', '', 4, 'P1', 'assets/capas/gb_2ae7665fd04dd481.jpg', 0, '2026-10-25 14:49:06'),
(374, 'El tiempo y la narración', 'Desconhecido', 'livro', 'Taller Escritura Fuentetaja', 1999, '8495079887', '', 5, 'P9', 'assets/capas/gb_f81ae69c80914648.jpg', 0, '2026-10-25 14:49:06'),
(375, 'Provenzalisches Supplement-Wörterbuch', 'Lévy', 'livro', '', 1894, 'N/A', '', 1, 'P7', 'assets/capas/gb_87d8e6722fecc93d.jpg', 0, '2026-10-25 14:49:06'),
(376, 'Provenzalisches supplement-Wörterbuch', 'Emil Levy', 'livro', '', 1894, 'N/A', '', 5, 'P10', 'assets/capas/gb_8ac153e2da8a7560.jpg', 0, '2026-10-25 14:49:06'),
(377, 'Provenzalisches Supplement-Wörterbuch: Bd. A-C', 'Emil Levy', 'livro', '', 1894, 'N/A', '', 2, 'P6', 'assets/capas/gb_0b1a29c80add1e95.jpg', 0, '2026-10-25 14:49:06'),
(378, 'Las 1633 [i. e. Mil seiscientas treinta y tres] notas ... a la primera edición de El ingenioso hildalgo, reproducida por D. Francisco López Fabra con la foto-tipografía', 'Juan Eugenio Hartzenbusch', 'livro', '', 1874, 'N/A', '', 2, 'P10', 'assets/capas/gb_73408d2119cb1286.jpg', 0, '2026-10-25 14:49:06'),
(379, 'Las 1633 notas puestas por el Exmo. é Ilmo. Sr. D. Juan Eugenio Hartzenbusch a La primera edición del ingenioso hidalgo, reproducida por D. Francisco López Fabra con la foto-tipografía', 'Juan Eugenio Hartzenbusch', 'livro', '', 1874, 'N/A', '', 2, 'P6', 'assets/capas/gb_d6b0e6b5bb8a0386.jpg', 0, '2026-10-25 14:49:06'),
(380, 'Collezione di opere inedite o rare', 'Desconhecido', 'livro', '', 1896, 'N/A', '', 1, 'P2', 'assets/capas/gb_1e60aa3e87f6db6f.jpg', 0, '2026-10-25 14:49:06'),
(381, 'El Quijote de los niños, abreviado por un entusiasta [F. de Castro] de su autor', 'Miguel de Cervantes Saavedra', 'livro', '', 1885, 'N/A', '', 3, 'P8', 'assets/capas/gb_cb44e13502c61530.jpg', 0, '2026-10-25 14:49:06'),
(382, 'Maître Elie\'s Überarbeitung der ältesten französischen Übertragung von Ovid\'s Ars amatoria', 'Alfred Kadler, Aron Sternberg, August Pleines, Ernst Sauerland, Gottfried Keutel, Ovid', 'livro', '', 1886, 'N/A', '', 5, 'P5', 'assets/capas/gb_7feb59c056fc953f.jpg', 0, '2026-10-25 14:49:06'),
(383, 'Aventuras de tres rusos y de tres ingleses en Africa austral', 'Jules Verne', 'livro', '', 1879, 'N/A', '', 5, 'P2', 'assets/capas/gb_59d1b57077f59527.jpg', 0, '2026-10-25 14:49:06'),
(384, 'Lou Trésor dóu Felibrige ou dictionnaire provençal-français', 'Frédéric Mistral', 'livro', '', 1881, 'N/A', '', 5, 'P5', 'assets/capas/gb_76dc12ded140cbcc.jpg', 0, '2026-10-25 14:49:06'),
(385, 'El ingenioso Hidalgo Don Quijote de la Mancha', 'Miguel de Cervantes Saavedra', 'livro', '', 1894, 'N/A', '', 4, 'P8', 'assets/capas/gb_8d14f029e04e521e.jpg', 0, '2026-10-25 14:49:06'),
(386, 'Verdadeira História Da Ficção Científica', 'Adam Roberts', 'livro', 'Editora Seoman', 2018, '9788555030741', 'Numa linguagem acessível e abrangendo uma grande variedade de obras, o crítico e escritor Adam Roberts traça o desenvolvimento da ficção científica desde suas origens até sua atual disseminação na cultura popular, com seus desdobramentos no cinema, música e TV. Apresentando argumentos de que a ficção científica tem suas raízes nas viagens fantásticas da literatura grega, Roberts passa pelas suas inúmeras fases e subgêneros, da Era de Ouro a New Space Opera, para mostrar que essa é uma das grandes culturas literárias do nosso tempo. Além de uma excelente fonte de pesquisa histórica, esta é certamente uma das mais significativas obras da atualidade no campo da ficção científica e a mais completa do gênero em língua portuguesa.', 3, 'P7', 'assets/capas/gb_80631b4d14e71290.jpg', 0, '2026-10-25 14:49:49'),
(387, 'Ficção científica, fantasia e horror no Brasil, 1875 a 1950', 'Roberto de Sousa Causo', 'livro', 'Editora UFMG', 2003, '8570413556', '', 4, 'P3', 'assets/capas/gb_31cad909c0e01826.jpg', 0, '2026-10-25 14:49:49'),
(388, 'Além do Tempo', 'Lucas Praxedes', 'livro', 'Independently Published', 2025, '9798266901926', 'Em \"Além do Tempo: Contos de Ficção Científica\" acompanhamos 10 histórias: \"Meu mundo vazio\" é um pequeno conto que acompanha um protagonista acordando em diferentes corpos todos os dias, em um mundo onde aparentemente só ele existe. Esta história é uma exploração intensa da identidade e da busca pelo entendimento, perfeita para quem busca uma narrativa envolvente e contemplativa. \"A Lua de Kurt\" é um pequeno conto que acompanha um explorador solitário em um ciclo de repetição em uma lua rochosa tentando escapar desse lugar voltando à sua nave. Essa história explora dilemas morais e questões de identidade enquanto Kurt tenta encontrar uma saída dessa situação impossível. O terceiro conto apresenta a jornada de dois robôs, Ral e Ab, em uma missão de exploração em um planeta alienígena. Confrontados por desafios inesperados, os robôs se deparam com questões que desafiam sua compreensão da existência. O enredo gira em torno de sua interação com uma espécie alienígena e como isso influencia suas percepções e decisões. A narrativa reflete sobre temas de identidade, consciência e o desconhecido, explorando a complexidade das relações entre os seres artificiais e seu ambiente. O conto \"Nota do Robô\" narra a jornada de um robô que compartilha suas reflexões íntimas com um colega que já partiu. Ele relata suas experiências durante conflitos interplanetários e sua fuga das batalhas. Em suas reflexões finais, o robô confronta a noção de existência e não existência, ponderando sobre o sentido do próprio ser em um universo repleto de conflitos e mudanças. Em \"Uma Hora Até o Fim do Mundo\" acompanhamos um indivíduo preso num loop no meio de um apocalipse mundial. No conto curto \"A Cidade dos Clones\", acompanhamos um escritor refletindo em uma cidade em que todos os indivíduos são cópias dele de uma forma ou outra. No conto \"O Investigador Zeta\", Bertrand, um investigador em uma cidade do futuro, Nova Zeta, trabalha para a Contract Zeta S.A., analisando dados e casos de crimes relacionados aos produtos da empresa. Em uma cidade totalmente controlada por esse grande conglomerado, Bert tenta solucionar um assassinato. Em \"Detetives da Antivida\", temos um mundo onde o religamento de pessoas se tornou algo comum, Nihil, um Detetive da Antivida, passa seus dias resolvendo casos na antivida, conversando diretamente com as vítimas. Ao mesmo tempo em que ele determina se o indivíduo possui padrão elétrico cerebral suficiente para o processo de reativação, tenta resolver o mistério do que levou o sujeito a estar na antivida. Na história \"Projest: Meu Estranho Deserto\", Projest, um agente da AIIFI, com o poder de manifestar coisas da sua mente no mundo real, trabalha investigando e combatendo fenômenos paranaturais, que acontecem pelo mundo. Nesse universo onde coisas estranhas são comuns, Projest tenta descobrir a origem de todos esses fenômenos. E por fim, o conto \"Os Heróis Relativos\" gira em torno de três personagens numa ilha do Norte do Atlântico. Adam está vivo há mais de 15 mil anos, Rel pode desacelerar o tempo em relação a sua percepção e Mori volta no tempo um minuto toda vez que morre. Diante de uma grande ameaça eles precisam fazer todo o possível para salvar o mundo. Sua opinião faz diferença. Considere deixar uma review na Amazon e o seu conto favorito.', 2, 'P1', 'assets/capas/gb_b83775c8ac412a66.jpg', 0, '2026-10-25 14:49:49'),
(389, 'Amorquia, Piscina Livre e outras histórias', 'André Carneiro', 'livro', 'AVEC Editora', 2023, '9788554471569', 'Para comemorar o centenário de seu nascimento do autor foi feita esta edição que reúne o chamado Ciclo Libertário, com os 2 (dois) romances, \"Amorquia\" e \"Piscina Livre\"; 8 (oito) contos e 3 (três) poemas relacionados do seu universo mais importante, um conjunto de narrativas ambientadas num futuro de fortes traços hedonistas, direcionados para a satisfação e os prazeres sexuais sem qualquer restrição moral ou religiosa. Amorquia (1991) e Piscina Livre (1980) mostram uma provocadora visão do futuro que nos obriga a repensar o presente. Trazem uma narrativa sofisticada e perturbadora, com uma abordagem rara e estilo inovador, sem evitar temas polêmicos. São histórias humanistas, preocupadas com os impactos que a ciência e a tecnologia podem ter sobre a sociedade e a cultura.', 4, 'P3', 'assets/capas/gb_12eea7729f84783e.jpg', 0, '2026-10-25 14:49:49'),
(390, 'El P. José Acosta y su importancia en la literatura científica española', 'José Rodríguez Carracido', 'livro', '', 1899, 'N/A', '', 1, 'P10', 'assets/capas/gb_daca1afd97b412ca.jpg', 0, '2026-10-25 14:49:49'),
(391, 'A cidade e as estrelas', 'Arthur C. Clarke', 'livro', 'Editora Aleph', 2021, '9788576574965', 'De forma magistral, Arthur C. Clarke imagina o futuro distante da humanidade nesta que é considerada uma de suas obras mais visionárias. Ao longo das eras, inúmeras cidades foram erguidas na Terra, mas nenhuma como Diaspar. Por muitos milênios, sua cúpula protetora impediu que a decadência e o perigo do mundo exterior adentrassem suas ruas e muros. Antes de Diaspar, os homens construíram impérios e conquistaram as estrelas. Mas então, como diz a lenda, os Invasores vieram, condenando a humanidade a este último refúgio num planeta onde os oceanos desapareceram e já não existem chances de sobrevivência fora da redoma. Será preciso um homem – um Singular – para romper a inércia sufocante de Diaspar, destruir a lenda e descobrir a verdadeira natureza dos Invasores. Publicado pela primeira vez em 1956, A cidade e as estrelas é uma versão revista, expandida e definitiva de Against the fall of night, um dos primeiros trabalhos de Clarke, publicado originalmente na revista Startling Stories, e é considerado por muitos um dos melhores romances da era de ouro da ficção científica.', 4, 'P4', 'assets/capas/gb_3a268649745633d4.jpg', 0, '2026-10-25 14:49:49'),
(392, 'A vida, o universo e tudo mais', 'Douglas Adams', 'livro', 'Editora Arqueiro', 2010, '9788599296790', 'Após as loucas aventuras vividas com seus estranhos amigos em O Guia do Mochileiro das Galáxias e O Restaurante no Fim do Universo, Arthur Dent ficou cinco anos abandonado na Terra Pré-Histórica. Mesmo depois de tanto tempo, ele ainda acordava todas as manhãs com um grito de horror por estar preso àquela monótona e assustadora rotina. Talvez Arthur até preferisse continuar isolado em sua caverna escura, úmida e fedorenta a encarar a próxima aventura para a qual seria forçosamente arrastado: salvar o Universo dos temíveis robôs xenófobos do planeta Krikkit. Esse é o terceiro volume da \"trilogia de cinco\" de Douglas Adams, um dos mais cultuados escritores de ficção científica de todos os tempos. Seu humor corrosivo e sua habilidade em criar situações improváveis tornam seus livros fundamentais para qualquer um que tenha capacidade de debochar de si mesmo. Usando o planeta Krikkit como paródia da nossa sociedade e das guerras raciais, Adams cria uma história divertida, inteligente e repleta dos mais inusitados significados sobre a vida, o Universo e tudo mais.', 5, 'P4', 'assets/capas/gb_a69ad72f97e0d2cc.jpg', 0, '2026-10-25 14:49:49'),
(393, 'Ajña', 'Cleber Prudente', 'livro', 'Clube de Autores', 2023, 'N/A', 'AJÑA é uma história de ação e ficção científica que mergulha nas profundezas do desejo humano e na complexidade do universo. A história gira em torno de Lorenzo, um jovem atormentado pelo fim de seu relacionamento com Isadora, sua ex-namorada. Incapaz de superar a separação e desejando que ela desapareça de sua vida para sempre, Lorenzo se vê mergulhado em uma trama misteriosa e intrigante. Um encontro inesperado com Anna, uma arqueóloga conhecedora de tradições hindus, que revela a Lorenzo a existência do terceiro olho (Ajña, em sânscrito), e com o cientista Jermaine Johnson, Lorenzo aprende a combinar os princípios da física quântica com a percepção humana. Tal conhecimento permite que uma pessoa altere a realidade através de sua vontade e intenção, tornando possível manifestar fisicamente seus desejos mais profundos. AJÑA é uma história que explora a natureza humana, a busca pelo poder e a responsabilidade oriunda da capacidade de moldar a realidade. Através de elementos de terceiro olho e física quântica, o livro questiona o equilíbrio entre o desejo e as consequências, oferecendo uma reflexão sobre a importância de aceitar as situações que não podemos controlar e encontrar a redenção através do autoconhecimento. Esta é uma continuação do livro Paradoxos, do mesmo autor.', 1, 'P2', 'assets/capas/gb_e2c0229aa3c35b66.jpg', 0, '2026-10-25 14:49:49'),
(394, 'Quando eles vieram', 'Cacá Gontijo', 'livro', 'Gutenberg Editora', 2026, '9788582358696', 'Em um futuro distante, a Terra foi devastada pela Dominação Total da Escuridão, um ataque de seres alienígenas chamados carcons, capazes de se regenerar e transformar cidades inteiras em escuridão viva. A última esperança surge em Arquivo, um jovem de outro planeta com memória perfeita, que volta no tempo para tentar mudar o destino do universo e impedir que a Terra se torne o ponto de partida do caos. Para isso, ele vai se unir a uma Resistência formada por humanos comuns, mas muito corajosos, em uma aventura cheia de viagens espaciais, novas tecnologias e criaturas incríveis. Quando eles vieram é uma ficção científica muito atual, que mistura ação, humor e crítica social para falar de invasão alienígena, tecnologia e escolhas humanas de um jeito próximo dos leitores jovens. Com ritmo acelerado, cenas cinematográficas e uma mitologia própria, o livro vai tirar o fôlego de quem gosta de aventuras espaciais cheias de perigos, personagens marcantes e reviravoltas até a última página. \"Em um gênero ainda pouco explorado pela literatura brasileira, Quando eles vieram abre uma porta importante: convida o leitor a percorrer o universo da ficção científica nacional, enquanto acompanha a luta pela sobrevivência de um pequeno ponto azul perdido entre milhares de galáxias.\" Carlos Saldanha, cineasta e produtor.', 2, 'P5', 'assets/capas/gb_e676fee7b58cf335.jpg', 0, '2026-10-25 14:49:49'),
(395, 'Contos De Ficção Científica', 'Paulo E.f. De Almeida', 'livro', 'Clube de Autores', 2023, 'N/A', 'Contos de Ficção Científica é uma trilogia escrita por Paulo E.F. de Almeida. A Torre de Energia Em um futuro próximo, uma nova fonte de energia é descoberta. A humanidade pensou estar livre dos combustíveis fósseis, porém, na verdade, estavam sendo escravisadas. Nesta aventura, Rodrigo, um físico, descobre um modo de criar energia limpa. Porém, as coisas não saem como planejado e ele procura lutar contra a opressão de um novo governo. Humanidade Após a perda de seus entes queridos, um homem se vê ao encontro de um segredo capaz de destruir a humanidade de uma vez por todas. Ele luta com todas as suas forças para salvar o futuro do planeta. No entanto, há um plano diabólico sendo orquestrado que pode acabar com a civilização de uma maneira horripilante. A aventura se passa em uma realidade alternativa, onde as coisas não são como parecem e é preciso muita coragem e sangue frio para que o futuro da humanidade seja protegido. A chegada de uma espaçonave vinda das estrelas faz com que o homem lute por um futuro melhor, onde o bem mais valioso é a chance de amar. Em busca de Kepler Em Busca de Kepler é um conto de ficção científica escrito por Paulo E.F. de Almeida. A história conta como a humanidade conseguiu se salvar da destruição do planeta Terra e foi em busca de um outro lugar para reconstruir a sua civilização. As espaçonaves do Brasil, China, Estados Unidos, Japão e Inglaterra saem pelo espaço na tentativa de salvar o que restou da população terrena.', 4, 'P1', 'assets/capas/gb_36495b5f05312b60.jpg', 0, '2026-10-25 14:49:49');

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
(1, 'Pedro', '3º ano', 'pedrosschweitzer@gmail.com', '$2y$10$U8dLqw2uWlF6ob..xzCbbufl/3fuj0kSuzCq30gbG0Hjkv8jlDA5S', NULL, NULL);

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
  MODIFY `id_catalogo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=396;

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

CREATE DATABASE IF NOT EXISTS siga;
USE siga;

CREATE TABLE IF NOT EXISTS login_admin (
    id_adm INT AUTO_INCREMENT PRIMARY KEY,
    email_adm VARCHAR(100) NOT NULL UNIQUE,
    senha_adm VARCHAR(255) NOT NULL,
    nome_adm VARCHAR(100) DEFAULT 'Administrador'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_aluno (
    id_aluno BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome_aluno VARCHAR(100) NOT NULL,
    serie_aluno VARCHAR(50) NOT NULL,
    email_aluno VARCHAR(255) NOT NULL UNIQUE,
    senha_aluno VARCHAR(255) NOT NULL,
    relembrar_token VARCHAR(255),
    token_expiracao DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO login_admin (
    id_adm,
    email_adm,
    senha_adm,
    nome_adm
)
VALUES (
    1,
    'adm@gmail.com',
    '$2y$10$Hti4Ki5Ee7.q7YiGxyUikOd2l9A6lxD8IK9mafCr.46JTVPaqn.mC',
    'Administrador Principal'
)
ON DUPLICATE KEY UPDATE
    email_adm = VALUES(email_adm),
    senha_adm = VALUES(senha_adm),
    nome_adm = VALUES(nome_adm);

INSERT INTO login_aluno (
    id_aluno,
    nome_aluno,
    serie_aluno,
    email_aluno,
    senha_aluno,
    relembrar_token,
    token_expiracao
)
VALUES
(
    6,
    'pedro',
    '3º ano',
    'oi@gmail.com',
    '$2y$10$cN.g7WSFyl4kZkJn9oHsdOHRyVDzEgkFMH5HlyrDMIGguUwWNqg7y',
    'ed96561621c47f96ee8a78d6a44cff769890ff55c6579a0b492043387ad20c45',
    '2026-07-01 17:19:23'
),
(
    7,
    'dada',
    '9º ano',
    'dada@gmail.com',
    '$2y$10$u33MXEgjW5O1lPXoK6C24e6a5AwG4nvdSUN/MGxfldDqgAp3LDVYi',
    '0fc212dcd62565d65217f3c3a13b62a1c9e291c049161560f3e91343bb66460a',
    '2026-07-02 13:31:35'
),
(
    8,
    'ola',
    '1º ano',
    'ola@gmail.com',
    '$2y$10$EPrKPC41n3WVUYRSZ5zGnO6iVXUs/4TxnxToHxijKAYVxxVetQygG',
    NULL,
    NULL
)
ON DUPLICATE KEY UPDATE
    nome_aluno = VALUES(nome_aluno),
    serie_aluno = VALUES(serie_aluno),
    senha_aluno = VALUES(senha_aluno),
    relembrar_token = VALUES(relembrar_token),
    token_expiracao = VALUES(token_expiracao);
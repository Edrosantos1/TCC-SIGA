# SiGA ITJ

Sistema de gerenciamento da biblioteca escolar. Este projeto PHP foi preparado para demonstração local com XAMPP.

## Requisitos

- Windows com XAMPP
- PHP 8.2 ou superior, com `mysqli`
- MariaDB/MySQL incluído no XAMPP
- Extensão `curl` do PHP para usar a importação opcional do Google Books

## Instalação local (XAMPP)

1. Copie a pasta do projeto para `C:\xampp\htdocs\S.I.G.A`.
2. No painel do XAMPP, inicie **Apache** e **MySQL**.
3. Acesse `http://localhost/phpmyadmin/` e crie um banco chamado `siga`, com cotejamento `utf8mb4_general_ci`.
4. Selecione o banco `siga`, abra **Importar** e carregue [`assets/bn/siga.sql`](assets/bn/siga.sql).
5. Confira a configuração de conexão em [`includes/conexao.php`](includes/conexao.php). Em ambiente `development`, sem variáveis configuradas, o projeto usa o padrão local `localhost`, banco `siga`, usuário `root` e senha vazia do XAMPP.
6. Abra `http://localhost/S.I.G.A/`.

Se o MySQL local usa outras credenciais, configure as variáveis de ambiente disponíveis para o processo do Apache/PHP antes de iniciá-lo:

| Variável | Exemplo para desenvolvimento local |
|---|---|
| `APP_ENV` | `development` |
| `DB_HOST` | `localhost` |
| `DB_NAME` | `siga` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | (vazia, apenas no XAMPP local padrão) |
| `GOOGLE_BOOKS_API_KEY` | Opcional; necessária apenas para importar itens do Google Books |

No Windows, as variáveis podem ser definidas nas variáveis de ambiente do sistema e o XAMPP/Apache deve ser reiniciado depois. Nunca publique nem versione senhas ou chaves. Para ambientes fora da máquina local, defina `APP_ENV=production` e configure um usuário de banco próprio com privilégios mínimos; `root` sem senha é permitido somente no modo de desenvolvimento.

## Acesso local de demonstração

O dump inicial contém a conta administrativa local `adm@gmail.com` com senha `123` e não inclui contas de alunos. Altere essa senha antes de usar o sistema fora da demonstração local. Cadastre os alunos pela tela de registro ou entre com o Google.

O login administrativo está em `http://localhost/S.I.G.A/adm/login_adm.php`; o acesso do aluno começa pela página inicial.

### Recuperar o acesso administrativo

Para alterar o próprio nome ou senha, use **Meu Perfil**; a troca de senha exige a senha atual e aceita qualquer senha não vazia. Não há recuperação administrativa por e-mail: se a senha for esquecida ou a conta for removida, o programador deve executar o utilitário local abaixo no computador que hospeda o projeto:

```powershell
& 'C:\xampp\php\php.exe' 'C:\xampp\htdocs\S.I.G.A\scripts\redefinir_admin.php'
```

O utilitário solicita e-mail, nome e uma nova senha, pede confirmação e atualiza a conta correspondente ou a recria se ela tiver sido apagada. A senha digitada aparece no terminal, portanto execute-o somente em um computador confiável e entregue a senha ao administrador por um canal privado. O utilitário só funciona pela linha de comando, nunca pelo navegador.

## Integração opcional com Google Books

Para usar **Importar livros**, configure `GOOGLE_BOOKS_API_KEY` no ambiente do PHP. A chave não deve ser inserida no código. Se uma chave antiga foi incluída em cópias anteriores do projeto, revogue-a no Google Cloud Console e crie outra com restrições adequadas.

## Segurança

Consulte [`docs/seguranca.md`](docs/seguranca.md) para detalhes sobre tokens CSRF, sessão, HTTPS, banco de dados e pendências antes de produção.

# Segurança e configuração para demonstração

## Dados de demonstração

O dump `assets/bn/siga.sql` inclui uma conta administrativa fictícia para demonstração local (`adm@gmail.com`, senha `123`) e não contém contas de alunos. Cadastre alunos pela aplicação. A senha administrativa de demonstração é fraca e deve ser alterada antes de qualquer uso fora do ambiente local.

Não reutilize essas credenciais em produção. Altere-as após importar o banco em qualquer ambiente acessível a terceiros.

## Banco de dados

O uso de `root` sem senha existe somente como fallback local quando `APP_ENV` não está definido ou vale `development`. Para outros ambientes, configure `APP_ENV=production`, `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` no ambiente do PHP. Use uma conta própria com privilégios mínimos de leitura e gravação nas tabelas da aplicação; não use `root`.

## HTTPS e cookies

Os cookies de sessão e de lembrança são `HttpOnly` e `SameSite=Lax`; a flag `Secure` é habilitada quando a requisição chega ao PHP por HTTPS. Em produção, sirva a aplicação exclusivamente por HTTPS e configure corretamente o TLS no servidor ou proxy reverso.

## Proteção CSRF

Login e cadastro de aluno e administrador, autenticação Google, além das ações de catálogo, reservas, empréstimos, favoritos, notificações, preferências, perfil e importação usam um token aleatório armazenado na sessão e validado com `hash_equals()`. Recarregue as páginas abertas antes desta atualização; requisições sem token ou com token antigo são recusadas. `SameSite=Lax` permanece como defesa adicional, não como substituto do token.

O arquivamento, o processamento de reservas vencidas e o encerramento de sessão agora são ações explícitas via POST autenticado, em vez de serem acionados por acesso GET à página. O GET de logout somente apresenta a confirmação.

Na tela **Meus Empréstimos**, empréstimos dentro do prazo podem ser renovados uma vez por mais 15 dias. A API rejeita renovações com vencimento anterior à data atual, e o `UPDATE` repete essa condição com `CURDATE()` para evitar corrida entre a validação e a gravação. Atrasos são calculados por data ao montar as respostas/telas: empréstimos `emprestado` vencidos são apresentados como `atrasado` sem alterar o status persistido. A mesma regra é aplicada na API de empréstimos e no histórico.

O aluno pode solicitar a devolução, mas o empréstimo só passa a `devolvido` quando a biblioteca confirma o recebimento em **Pendências**. Até essa confirmação, `devolucao_solicitada` continua contando como exemplar emprestado e pode continuar atrasado.

`catalogo.quantidade` representa o total de exemplares cadastrados, não o estoque disponível. Não se deve incrementar nem decrementar esse total ao emprestar/devolver: a disponibilidade no painel administrativo é calculada subtraindo os empréstimos em aberto e as reservas ativas. A solicitação de devolução permanece nessa contagem; a confirmação administrativa retira o empréstimo da contagem e libera a disponibilidade. Se o banco já foi criado antes desta mudança, execute uma vez:

```sql
ALTER TABLE emprestimos
  MODIFY status ENUM('emprestado', 'atrasado', 'devolucao_solicitada', 'devolvido')
  DEFAULT 'emprestado';
```

Tokens de lembrança antigos armazenados em texto puro não são mais aceitos. Após atualizar a aplicação, quem ainda depender de um token legado deve entrar novamente com a senha para receber um token novo.

## Contas administrativas

O administrador pode alterar o próprio nome e senha autenticado em **Meu Perfil**; a troca exige a senha atual. O login não possui recuperação administrativa por e-mail. Se a senha for esquecida ou a conta for excluída, o programador deve executar `scripts/redefinir_admin.php` localmente pela CLI. O utilitário cria a conta se não existir ou redefine a existente; nunca o exponha pelo servidor web. A senha é digitada no terminal local e deve ser entregue ao administrador por canal privado.

## Integração Google Books

`adm/importar_google_books.php` lê a chave de `GOOGLE_BOOKS_API_KEY`. Configure-a como variável de ambiente do PHP; não a grave no código-fonte. Uma chave anteriormente incluída no código precisa ser revogada/rotacionada no Google Cloud antes de publicar.

## Limitações a resolver antes da produção

- `api/aluno_catalogo.php` responde apenas com registros fictícios estáticos e, por isso, permanece público. Se for conectado ao catálogo real ou passar a retornar dados pessoais, exigir autenticação e autorização apropriadas.
- O contato institucional da página inicial é um aviso de demonstração, não um canal real. Configure o número ou endereço oficial antes da apresentação/publicação.
- Uma chave Google Books que já apareceu em versões anteriores do projeto deve ser revogada no Google Cloud Console e substituída por uma nova chave restrita. A revogação não pode ser feita a partir do código local.

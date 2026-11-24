# API de Controle Financeiro

API REST para registrar e consultar movimentações financeiras pessoais. O projeto foi desenvolvido para a disciplina de Programação Web Back-end. Consulte o [enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html) e as [issues do projeto](https://github.com/kohki-ha/personal-finance-tracker-api/issues).

## Pré-requisitos

- Node.js e npm.
- MySQL 8.0.16 ou superior. Essa versão é necessária para aplicar as restrições `CHECK` do schema.
- Git Bash, PowerShell ou outro terminal para executar os comandos.

## Configuração local

1. Clone o repositório e entre na pasta do projeto:

   ```bash
   git clone https://github.com/kohki-ha/personal-finance-tracker-api.git
   cd personal-finance-tracker-api
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie seu arquivo local de ambiente a partir do modelo. No Git Bash:

   ```bash
   cp .env.example .env
   ```

   No PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Edite `.env` com os dados do seu MySQL. Gere uma chave para `JWT_SECRET` com:

   ```bash
   node -p "require('node:crypto').randomBytes(32).toString('hex')"
   ```

   Exemplo do formato do arquivo (substitua os valores pelos seus):

   ```dotenv
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha_local
   DB_NAME=api_financas
   JWT_SECRET=cole_a_chave_gerada_aqui
   ```

5. Aplique o schema e, em seguida, os dados fictícios de demonstração. No Git Bash ou terminal com o cliente `mysql` no PATH:

   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p api_financas < database/seed.sql
   ```

   Informe a senha do MySQL quando for solicitada. Se sua conta MySQL tiver outro nome, troque `root` pelo usuário configurado em `.env`. O schema cria o banco `api_financas`; o seed cria dois usuários fictícios, categorias, contas, cartões e movimentações de três meses. O seed pode ser aplicado novamente: ele mantém os usuários/cadastros de demonstração e recria somente os lançamentos marcados como `SEED -`.

6. Inicie a API:

   ```bash
   npm start
   ```

   Para desenvolvimento com reinício automático:

   ```bash
   npm run dev
   ```

   A mensagem `API de finanças rodando na porta 3000.` indica que o servidor iniciou. A URL local é `http://localhost:3000`.

## Usuários fictícios do seed

| Nome | E-mail | Senha |
|---|---|---|
| Ana Demonstração | `ana.demo@example.com` | `DemoA2026!` |
| Bruno Demonstração | `bruno.demo@example.com` | `DemoB2026!` |

Use essas contas somente no banco local de demonstração. As senhas são armazenadas no banco como hashes bcrypt. Os exemplos de autenticação, obtenção de IDs e chamadas às rotas estão em [`testes/requisicoes.md`](testes/requisicoes.md).

## Rotas

As rotas de autenticação são `/auth/cadastro`, `/auth/login` e `/auth/me`. Os recursos protegidos usam Bearer JWT: `/categorias`, `/fontes-destinos`, `/lancamentos` e `/relatorios`. Consulte o roteiro de requisições para os métodos, exemplos e status HTTP esperados.

## Estrutura do projeto

```text
server.js       # Configuração do Express e registro das rotas
routes/         # Um router por recurso, com validação da requisição
models/         # Consultas SQL e transações
middleware/     # Autenticação JWT e tratamento de erros
database/       # Conexão MySQL, schema.sql e seed.sql
utils/          # Validações e cálculos puros
testes/         # Exemplos de requisições e respostas esperadas
```

## Segurança e Git

Não compartilhe nem versione seu `.env`: ele contém credenciais locais. O `.gitignore` já exclui `.env` e `node_modules/`. O arquivo `.env.example` contém apenas nomes e valores de exemplo.

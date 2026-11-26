# API de Controle Financeiro

API REST para registrar e consultar movimentações financeiras pessoais. O projeto foi desenvolvido para a disciplina de Programação Web Back-end. Consulte o [enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html) e as [issues do projeto](https://github.com/kohki-ha/personal-finance-tracker-api/issues).

## Pré-requisitos

- Node.js e npm. Express e bcrypt exigem Node.js 18 ou superior. O projeto foi validado com Node.js 24.
- MySQL 8.0.16 ou superior para aplicar as restrições `CHECK`, com o cliente `mysql` disponível no terminal.
- No Windows, use Git Bash para a importação do banco e para o roteiro de requisições.

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

5. Na raiz do projeto, aplique primeiro o schema e depois o seed. No Windows, execute os comandos abaixo no Git Bash.

   ```bash
   mysql --default-character-set=utf8mb4 -u root -p < database/schema.sql
   mysql --default-character-set=utf8mb4 -u root -p api_financas < database/seed.sql
   ```

   Informe a senha do MySQL quando for solicitada. Se sua conta MySQL tiver outro nome, troque `root` pelo usuário configurado em `.env`. O schema cria o banco `api_financas`; o seed cria dois usuários fictícios, categorias, contas, cartões e movimentações de três meses. Reaplicar o seed restaura os nomes e as senhas dos usuários fictícios e a configuração das fontes e dos cartões de demonstração. Também recria os lançamentos desses usuários cuja descrição começa com `SEED -`.

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

Use essas contas no banco local de demonstração. As senhas são armazenadas como hashes bcrypt.

## Primeiro teste

Com a API rodando, faça login com Ana. No Git Bash do Windows, use `curl.exe` no lugar de `curl`.

```bash
curl -i -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana.demo@example.com","senha":"DemoA2026!"}'
```

O login retorna `200` com `token` e `usuario`. Copie o token e envie-o como `Authorization: Bearer <token>` nas chamadas protegidas. O [roteiro de requisições](testes/requisicoes.md) mostra como definir os tokens de Ana e Bruno e testar todas as rotas.

## Rotas

| Recurso | Métodos e caminhos | Acesso |
| --- | --- | --- |
| Autenticação | `POST /auth/cadastro`, `POST /auth/login` | Público |
| Perfil | `GET /auth/me` | Bearer JWT |
| Categorias | `GET /categorias`, `POST /categorias`, `PUT /categorias/:id`, `DELETE /categorias/:id` | Bearer JWT |
| Fontes e destinos | `GET /fontes-destinos`, `POST /fontes-destinos`, `PUT /fontes-destinos/:id`, `DELETE /fontes-destinos/:id` | Bearer JWT |
| Lançamentos | `GET /lancamentos`, `POST /lancamentos`, `GET /lancamentos/:id`, `PUT /lancamentos/:id`, `DELETE /lancamentos/:id` | Bearer JWT |
| Relatórios por período | `GET /relatorios/categorias`, `GET /relatorios/fontes-destinos` | Bearer JWT |
| Previsão de faturas | `GET /relatorios/faturas` | Bearer JWT |
| Saúde financeira | `GET /saude-financeira` | Bearer JWT |

Os relatórios por período exigem `inicio` e `fim` no formato `AAAA-MM-DD`. A previsão de faturas aceita `meses` de 1 a 12, com padrão de 3.

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

## Bônus de saúde financeira

A rota protegida `GET /saude-financeira` devolve indicadores, uma projeção dos três próximos meses civis e dicas educativas.

| Indicador | Cálculo |
| --- | --- |
| `taxaPoupanca` | (Entradas − saídas) ÷ entradas do mês corrente até hoje, pela data do lançamento. Sem entradas, devolve `null`. |
| `comprometimentoCartoes` | Faturas com vencimento nos próximos três meses ÷ renda estimada para os mesmos três meses. Sem renda estimada, devolve `null`. |
| `parcelasFuturas` | Soma em reais das parcelas com vencimento hoje ou depois, inclusive além da janela da projeção. |

As duas taxas são frações, como `0.30` para 30%. A projeção usa a média de entradas e gastos à vista dos três últimos meses completos. Se o primeiro movimento da janela for mais recente, a média começa naquele mês e inclui os meses completos vazios seguintes. Sem movimento nesse histórico, as médias valem zero.

Os gastos parcelados ficam fora da média à vista. A projeção soma cada parcela conhecida uma vez, no mês do vencimento, e calcula o saldo daquele mês como entradas menos saídas.

As dicas apontam falta de histórico, taxa de poupança negativa, comprometimento de pelo menos 30% e o primeiro saldo previsto negativo. Quando há histórico e nenhum saldo projetado é negativo, a resposta informa o resultado. O campo `aviso` indica que as informações são educativas e não constituem recomendação financeira profissional.

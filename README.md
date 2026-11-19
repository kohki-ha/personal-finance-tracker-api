# API de Controle Financeiro

Projeto da disciplina de Programação Web Back-end. [Enunciado](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

As tarefas e o andamento do projeto estão nas [issues do GitHub](https://github.com/kohki-ha/backend-projeto2/issues).

## Preparar o ambiente

1. Tenha Node.js com npm e MySQL 8.0.16 ou superior.
2. Rode `npm ci` para instalar as versões do lockfile.
3. Copie `.env.example` para `.env` caso o arquivo ainda não exista. Preencha as credenciais locais do MySQL e use `node -p "require('node:crypto').randomBytes(32).toString('hex')"` para gerar o valor de `JWT_SECRET`.

Quando o `server.js` estiver disponível, use `npm start` para iniciar a API ou `npm run dev` para trabalhar com reinício automático.

## Estrutura prevista

```text
server.js       # Configuração do Express e registro das rotas

routes/         # Um router por recurso, com validação da requisição

models/         # Consultas SQL e transações

middleware/     # Autenticação JWT

database/       # Conexão MySQL, schema.sql e seed.sql

utils/          # Validação de CPF e cálculos de parcelas e faturas

testes/         # requisicoes.md com exemplos de curl e respostas esperadas
```


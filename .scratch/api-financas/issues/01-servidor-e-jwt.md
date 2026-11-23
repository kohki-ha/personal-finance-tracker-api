# 01 - Subir o Express e proteger as rotas de finanças

**Responsável** Pessoa A\
**Depende de** nenhuma\
**Arquivos principais** `server.js`, `package.json`, arquivos de ambiente, conexão, middleware JWT e routers iniciais

Preparar a base do Express enquanto a Pessoa B trabalha no [schema MySQL](02-schema-mysql.md).

## O que fazer

- Configure CommonJS e os scripts `start` (`node server.js`) e `dev` (`nodemon server.js`). Instale `express`, `mysql2`, `jsonwebtoken`, `express-jwt`, `bcrypt`, `dotenv` e mantenha `nodemon` em `devDependencies`. Qualquer biblioteca adicional exige aprovação prévia da professora. Carregue o `.env` com `dotenv`. Prepare `.env.example` com `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `JWT_SECRET`. Ignore `.env` e `node_modules/`.
- Prepare `database/connection.js` com o pool de promises do `mysql2` e `dateStrings: true`. Use as variáveis `DB_*` do ambiente. Para testar em paralelo à 02, aponte `DB_NAME` para um banco local acessível e consulte `SELECT CAST('2026-01-01' AS DATE) AS data`.
- Monte um Router inicial para cada prefixo da spec. Aplique `express-jwt` com HS256 nos quatro prefixos de recursos protegidos. A issue 03 vai aplicar o mesmo middleware individualmente no `/auth/me`.
- Use `express.json()` e deixe o tratamento de erros por último. Converta `UnauthorizedError` em `401`. Erros seguem o padrão JSON com `erro` e, quando aplicável, `campos`. Registre falhas inesperadas com `console.error` e retorne `500` com mensagem genérica.

## Critérios de aceite

- [ ] A API inicia pelos dois scripts com a configuração local. O teste de conexão roda antes da importação da 02 e retorna a data como string.
- [ ] `GET /categorias` com token ausente, inválido ou expirado recebe `401` em JSON. `GET /rota-inexistente` recebe `404`. Enviar JSON malformado a `POST /auth/cadastro` recebe `400`.
- [ ] Os cinco routers, a proteção dos quatro prefixos de finanças e o tratamento de erros já estão montados em `server.js`. As próximas issues já podem implementar suas rotas nos próprios arquivos.

[Contratos compartilhados](../spec.md#contratos-compartilhados)

[Enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

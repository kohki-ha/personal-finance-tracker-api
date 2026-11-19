# 01 — Subir o Express e proteger as rotas de finanças

**Responsável** Pessoa A  
**Depende de** nenhuma  
**Status** To do  
**Arquivos principais** `server.js`, `package.json`, arquivos de ambiente, conexão, middleware JWT e routers iniciais

Preparar a base do Express enquanto a Pessoa B trabalha no [schema MySQL](02-schema-mysql.md).

## O que fazer

- Configure CommonJS, scripts `npm start` e `npm run dev` e as dependências previstas. Carregue o `.env` com `dotenv`. Prepare `.env.example` com `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `JWT_SECRET`. Ignore `.env` e `node_modules/`.
- Prepare `database/connection.js` com o pool MySQL usando as variáveis acordadas e `dateStrings`. Valide o pool com uma consulta simples usando o nome de um banco local já acessível em `DB_NAME`. Na 03, a Pessoa A verifica pelo pool que os campos `DATE` do schema chegam como strings.
- Monte um Router inicial para cada prefixo da spec. Aplique `express-jwt` com HS256 nos quatro prefixos de recursos protegidos. A issue 03 vai aplicar o mesmo middleware individualmente no `/auth/me`.
- Configure a leitura de JSON, o retorno de rota desconhecida e o tratamento de erros. Token ausente, inválido ou expirado retorna `401` em JSON. Erro inesperado é registrado no servidor e respondido com uma mensagem genérica.

## Critérios de aceite

- [ ] A API inicia pelos dois scripts com a configuração local. A inicialização do Express e a consulta simples podem ser verificadas antes de importar o schema da 02.
- [ ] `GET /categorias` sem token recebe `401` em JSON. `GET /rota-inexistente` recebe `404`. Enviar JSON malformado a `POST /auth/cadastro` recebe `400`.
- [ ] Os cinco routers, a proteção dos quatro prefixos de finanças e o tratamento de erros já estão montados em `server.js`. As próximas issues já podem implementar suas rotas nos próprios arquivos.

[Contratos compartilhados](../spec.md#contratos-compartilhados)

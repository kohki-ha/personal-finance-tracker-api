# 03 - Cadastrar usuário, emitir JWT e consultar o perfil

**Responsável** Pessoa A\
**Depende de** [01](01-servidor-e-jwt.md) para o JWT e o router, [02](02-schema-mysql.md) para as tabelas\
**Arquivos principais** `routes/auth.js`, `models/Usuario.js`, `utils/cpf.js` e `utils/validarAutenticacao.js`

A pessoa se cadastra, recebe categorias e uma conta inicial, faz login e usa o token para consultar o próprio perfil.

## O que fazer

- Em `POST /auth/cadastro`, exija `nome`, `email`, `cpf` e `senha`. Valide o formato do e-mail, os dígitos verificadores do CPF e a senha com pelo menos 8 caracteres, incluindo letra e número. Normalize o e-mail com `trim` e minúsculas e guarde o CPF com 11 dígitos. Use `bcrypt.hash` com custo 10 e respeite o limite de 72 bytes do bcrypt.
- Na classe `Usuario`, grave usuário, categorias padrão e a fonte/destino Conta corrente (tipo `conta`) na mesma transação. Use o `UNIQUE` do MySQL para garantir a unicidade e trate `ER_DUP_ENTRY` das restrições de e-mail e CPF com `409` e o campo correspondente. Retorne `201` com `id`, `nome` e `email`.
- Em `POST /auth/login`, busque pelo e-mail normalizado e verifique a senha com `bcrypt.compare`. Retorne `200` com os dados básicos e o JWT assinado com `JWT_SECRET` em HS256, com `id`, `nome`, `email` e expiração de 1 hora. Aplique o middleware da 01 diretamente em `GET /auth/me` e consulte o perfil pelo `req.auth.id`.

## Critérios de aceite

- [ ] Cadastro válido retorna `201` e grava usuário, categorias padrão e conta. Campo obrigatório ausente, e-mail inválido, CPF com dígito verificador errado e senha fora da regra retornam `400`, indicando o campo.
- [ ] A transação usa uma conexão do pool para todas as gravações e executa rollback se qualquer inserção falhar.
- [ ] E-mail repetido com caixa diferente e CPF repetido com outra máscara retornam `409` e apontam o campo correto.
- [ ] Login válido retorna `200` e um token aceito por `/auth/me`. Senha errada e e-mail desconhecido retornam `401` com a mesma mensagem.
- [ ] `/auth/me` retorna `200` com `id`, `nome` e `email` do dono do token e `401` para token ausente, inválido ou vencido. Nenhuma resposta inclui `senha_hash`.

Pode avançar junto com a [04](04-categorias-e-fontes-destinos.md). As categorias e a conta padrão são gravadas dentro do cadastro de usuário, na mesma transação.

[Enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

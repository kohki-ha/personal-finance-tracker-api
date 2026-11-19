# 03 - Cadastrar usuário, emitir JWT e consultar o perfil

**Responsável** Pessoa A  
**Depende de** [01](01-servidor-e-jwt.md) para o JWT e o router, [02](02-schema-mysql.md) para as tabelas  
**Status** To do  
**Arquivos principais** `routes/auth.js`, `models/Usuario.js` e `utils/cpf.js`

A pessoa se cadastra, recebe categorias e uma conta inicial, faz login e usa o token para consultar o próprio perfil.

## O que fazer

- Implemente `POST /auth/cadastro`. Valide nome, e-mail, CPF com dígitos verificadores e senha de pelo menos 8 caracteres com letras e números. Guarde o e-mail em minúsculas sem espaços nas pontas e o CPF só com dígitos. Use `bcrypt` para o hash.
- Grave usuário, categorias padrão e Conta corrente na mesma transação. Trate a violação de unicidade do banco com `409` e indique o campo. O sucesso retorna `201` com `id`, `nome` e `email`.
- Implemente `POST /auth/login` com busca pelo e-mail normalizado e verificação via `bcrypt.compare`. Retorne o token com validade de 1 hora e os dados básicos. Proteja `GET /auth/me` usando o middleware da 01.

## Critérios de aceite

- [ ] Cadastro válido retorna `201` e grava usuário, categorias padrão e conta. CPF com dígito verificador errado e senha sem letras ou números retornam `400`, com o campo em erro.
- [ ] A transação usa uma conexão do pool para todas as gravações e executa rollback se qualquer inserção falhar.
- [ ] E-mail repetido com caixa diferente e CPF repetido com outra máscara retornam `409` e apontam o campo correto.
- [ ] Login válido retorna `200` e um token aceito por `/auth/me`. Senha errada e e-mail desconhecido retornam `401` com a mesma mensagem.
- [ ] `/auth/me` retorna `401` para token ausente, inválido ou vencido. O hash da senha fica restrito ao banco e ao fluxo interno de verificação.
- [ ] A conexão da 01 devolve campos `DATE` da 02 como strings, para uso na listagem e nas faturas.

Pode avançar junto com a [04](04-categorias-e-fontes-destinos.md). As categorias e a conta padrão são gravadas dentro do cadastro de usuário, na mesma transação.

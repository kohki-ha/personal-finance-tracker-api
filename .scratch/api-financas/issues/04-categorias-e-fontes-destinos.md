# 04 - Gerenciar categorias e fontes/destinos

**Responsável** Pessoa B\
**Depende de** [01](01-servidor-e-jwt.md) para os routers protegidos, [02](02-schema-mysql.md) para as tabelas\
**Arquivos principais** `routes/categorias.js`, `routes/fontesDestinos.js`, `models/Categoria.js` e `models/FonteDestino.js`

O usuário gerencia as categorias que classificam seus lançamentos e as fontes/destinos que representam rendas, contas e cartões.

## O que fazer

- Implemente `GET` e `POST` em `/categorias` e `/fontes-destinos`, e `PUT` e `DELETE` em `/:id` para os dois recursos. As listagens aceitam filtro opcional `tipo`. Valide nome, tipo e ID conforme o recurso.
- Categorias aceitam `entrada` ou `saida` e têm nome único por usuário e tipo. Fontes/destinos aceitam `renda`, `conta` ou `cartao_credito` e têm nome único por usuário. Para cartões, valide dias inteiros de 1 a 31 e limite positivo.
- Filtre as operações pelo usuário autenticado, inclusive na consulta de ID que a [05](05-lancamentos-e-parcelas.md) usa para conferir categoria e fonte/destino. Trate duplicidade de nome com `409`. Ao excluir um registro vinculado, retorne `409` com uma mensagem que explique o vínculo.

## Critérios de aceite

- [ ] Em cada recurso, é possível criar (`201`), listar e filtrar (`200`), atualizar (`200`) e excluir um cadastro sem vínculo (`204`).
- [ ] Categoria repetida no mesmo tipo, fonte/destino com nome repetido e exclusão de item vinculado retornam `409`. Tipo inválido ou cartão com limite ou dias ausentes ou inválidos retorna `400`.
- [ ] Atualização e exclusão retornam `404` para ID inexistente ou de outro usuário. O segundo usuário pode usar os mesmos nomes e só vê os próprios registros.

Enquanto a [03](03-cadastro-e-login.md) estiver em andamento, use [dados e token locais](../spec.md#contratos-compartilhados). Para verificar a exclusão com vínculo, insira um lançamento no banco local.

[Enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

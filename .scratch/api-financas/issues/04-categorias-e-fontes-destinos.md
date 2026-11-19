# 04 - Gerenciar categorias e fontes/destinos

**Responsável** Pessoa B  
**Depende de** [01](01-servidor-e-jwt.md) para os routers protegidos, [02](02-schema-mysql.md) para as tabelas  
**Status** To do  
**Arquivos principais** routers e models de categorias e fontes/destinos

O usuário gerencia as categorias que classificam seus lançamentos e as fontes/destinos que representam rendas, contas e cartões.

## O que fazer

- Implemente `GET` e `POST` em `/categorias` e `/fontes-destinos`, e `PUT` e `DELETE` em `/:id` para os dois recursos. As listagens aceitam filtro opcional `tipo`. Valide nome, tipo e ID conforme o recurso.
- Categorias aceitam `entrada` ou `saida` e têm nome único por usuário e tipo. Fontes/destinos aceitam `renda`, `conta` ou `cartao_credito` e têm nome único por usuário. Para cartões, valide dias inteiros de 1 a 31 e limite positivo.
- Filtre leitura e escrita por usuário. Trate colisões de nome e exclusão com lançamentos vinculados como `409`. Disponibilize nos models uma busca por ID e dono, que a [05](05-lancamentos-e-parcelas.md) usa para validar categoria e fonte/destino. Ao editar um cadastro vinculado, preserve as regras dos lançamentos existentes.

## Critérios de aceite

- [ ] Em cada recurso, é possível criar (`201`), listar e filtrar (`200`), atualizar (`200`) e excluir um cadastro sem vínculo (`204`).
- [ ] Categoria repetida no mesmo tipo, fonte/destino com nome repetido e exclusão de item vinculado retornam `409`. Um cartão sem limite válido ou sem um dos dias retorna `400`.
- [ ] Um segundo usuário pode usar os mesmos nomes e recebe `404` se tentar editar ou apagar o registro de outro usuário. Nenhum dado do primeiro aparece nas listagens do segundo.

Enquanto a [03](03-cadastro-e-login.md) estiver em andamento, use [dados e token locais](../spec.md#contratos-compartilhados). Para verificar a exclusão com vínculo, insira um lançamento no banco local.

# 05 - Registrar, consultar e excluir lançamentos e parcelas

**Responsável** Pessoa B  
**Depende de** [04](04-categorias-e-fontes-destinos.md) para reaproveitar a busca de categoria e fonte/destino por ID e usuário  
**Status** To do  
**Arquivos principais** `routes/lancamentos.js`, `models/Lancamento.js` e cálculo de parcelas em `utils/`

O usuário registra entradas e saídas, consulta seu saldo no período e controla as parcelas de uma compra no cartão.

## O que fazer

1. Comece pelo lançamento simples com `POST /lancamentos` e `GET`, `PUT` e `DELETE` em `/lancamentos/:id`. Valide `tipo`, `descricao`, `valor` positivo, data real em `AAAA-MM-DD`, `categoriaId` e `fonteDestinoId`. Categoria e fonte/destino precisam pertencer ao usuário, e categoria e lançamento precisam ter o mesmo tipo.
2. Em `GET /lancamentos`, aceite os filtros `inicio`, `fim`, `tipo`, `categoriaId`, `fonteDestinoId` e `pagina`. Use o mês corrente como padrão, com 20 itens por página e ordem estável por data e ID. Aplique os mesmos filtros ao resumo e devolva `periodo`, `resumo`, `pagina`, `totalPaginas` e `itens`.
3. Acrescente `parcelas` de 1 a 48 nas saídas de cartão. A partir de duas parcelas, divida em centavos e grave todas em uma operação atômica, com data da compra, UUID comum e numeração de 1 a N. Rejeite compras cujo valor gere alguma parcela de zero centavos. O `PUT` altera o lançamento do ID informado. O `DELETE` exclui o ID ou, com `todasParcelas=true`, todas as parcelas do grupo daquele usuário.

## Critérios de aceite

- [ ] Com uma conta e uma categoria válidas, é possível criar, detalhar, editar e excluir um lançamento simples.
- [ ] Com mais de 20 resultados, as páginas contêm itens diferentes e têm o mesmo resumo para o mesmo filtro. Confira que entrada menos saída é igual ao saldo. Período invertido, data inválida e tipo de categoria incompatível retornam `400`.
- [ ] IDs de outro usuário retornam `404` para consulta, edição e exclusão, inclusive ao tentar excluir um grupo. Um relacionamento alheio também retorna `404`.
- [ ] R$ 100,00 em 3× cria R$ 33,34, R$ 33,33 e R$ 33,33. A edição preserva o grupo e a numeração. A exclusão individual mantém as demais parcelas. A exclusão em grupo remove todas as parcelas restantes.

Pode avançar junto com a [06](06-relatorios-por-periodo.md) ou [07](07-faturas.md). O ponto de integração é o [schema compartilhado](../spec.md#contratos-compartilhados).

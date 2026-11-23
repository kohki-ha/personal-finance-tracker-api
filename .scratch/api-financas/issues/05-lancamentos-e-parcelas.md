# 05 - Registrar, consultar e excluir lançamentos e parcelas

**Responsável** Pessoa B\
**Depende de** [04](04-categorias-e-fontes-destinos.md) para reaproveitar a busca de categoria e fonte/destino por ID e usuário\
**Arquivos principais** `routes/lancamentos.js`, `models/Lancamento.js` e cálculo de parcelas em `utils/`

O usuário registra entradas e saídas, consulta seu saldo no período e controla as parcelas de uma compra no cartão.

## O que fazer

1. Comece pelo lançamento simples com `POST /lancamentos` e `GET`, `PUT` e `DELETE` em `/lancamentos/:id`. Exija `tipo` (`entrada` ou `saida`), `descricao`, `valor` numérico e positivo, `data` real em `AAAA-MM-DD`, `categoriaId` e `fonteDestinoId`. Categoria e fonte/destino precisam existir e pertencer ao usuário (`404`). Categoria e lançamento precisam ter o mesmo tipo (`400`).
2. Em `GET /lancamentos`, aceite os filtros `inicio`, `fim`, `tipo`, `categoriaId`, `fonteDestinoId` e `pagina`. Use o mês corrente como padrão, com 20 itens por página e ordem estável por data e ID. Aplique os mesmos filtros ao resumo e devolva `periodo`, `resumo` (`entradas`, `saidas`, `saldo`), `pagina`, `totalPaginas` e `itens`. Em cada item, inclua `categoria` e `fonteDestino` com ID e nome, `valor` numérico e a posição da parcela quando aplicável (ex.: `1/10`).
3. Em saídas de cartão, aceite `parcelas` como inteiro de 1 a 48. Grave um lançamento por parcela na mesma transação, com a mesma data da compra, um grupo criado com `crypto.randomUUID()` e numeração de 1 a N. Divida o valor em centavos e coloque toda a diferença na primeira parcela. Se alguma parcela ficaria com valor zero, retorne `400`.
4. O `PUT` altera o lançamento do ID informado. Para compras parceladas, aplique a [regra de edição do plano](../spec.md#interpretações-propostas). O `DELETE` exclui o ID ou, com `todasParcelas=true`, as parcelas restantes do grupo daquele usuário.

## Critérios de aceite

- [ ] Com uma conta e uma categoria válidas, é possível criar (`201`), detalhar e editar (`200`) e excluir (`204` sem corpo) um lançamento simples.
- [ ] Com mais de 20 resultados, as páginas contêm itens diferentes e têm o mesmo resumo para o mesmo filtro. Confira que entrada menos saída é igual ao saldo. Período invertido, data inválida e tipo de categoria incompatível retornam `400`.
- [ ] IDs de outro usuário retornam `404` para consulta, edição e exclusão, inclusive ao tentar excluir um grupo. Na criação e na edição, categoria ou fonte/destino inexistente ou alheia também retorna `404`.
- [ ] R$ 100,00 em 3× cria R$ 33,34, R$ 33,33 e R$ 33,33. Em 6×, cria R$ 16,70 na primeira e R$ 16,66 em cada uma das outras. A edição individual preserva os dados compartilhados da compra. A exclusão individual mantém as demais parcelas e a exclusão em grupo remove todas as restantes.

Pode avançar junto com a [06](06-relatorios-por-periodo.md) ou [07](07-faturas.md). O ponto de integração é o [schema compartilhado](../spec.md#contratos-compartilhados).

[Enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

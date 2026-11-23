# 06 - Somar movimentações por categoria e por fonte/destino

**Responsável** Pessoa A\
**Depende de** [01](01-servidor-e-jwt.md) para o router protegido, [02](02-schema-mysql.md) para as consultas\
**Arquivos principais** `routes/relatorios.js` e `models/Relatorio.js`

O usuário consulta quanto entrou e saiu em um intervalo e identifica como as despesas mudaram em relação ao período anterior.

## O que fazer

- Implemente `GET /relatorios/categorias` e `GET /relatorios/fontes-destinos`. Ambos recebem `inicio` e `fim`, datas reais e inclusivas, com início menor ou igual ao fim.
- No relatório por categoria, use `SUM` e `GROUP BY` no MySQL. Devolva `periodo`, `periodoAnterior` e os totais por categoria, agrupados em entradas e saídas. Calcule cada percentual sobre o total do próprio tipo e ordene as saídas do maior para o menor total. Inclua o valor `anterior` e a `variacao` percentual por categoria, conforme a [regra do período anterior](../spec.md#interpretações-propostas).
- No relatório por fonte/destino, mostre as entradas e saídas agrupadas por recurso e calcule o saldo das fontes do tipo `conta`. Filtre ambos os relatórios pelo usuário autenticado. Converta os agregados `DECIMAL` para números antes dos cálculos e da resposta.

## Critérios de aceite

- [ ] Com saídas de R$ 500 no período atual, uma categoria que passou de R$ 100 para R$ 125 tem participação de 25% e variação de 25%. Sem valor anterior, a variação é `null`. Uma categoria com valor apenas no período anterior aparece com total atual zero e variação de -100%.
- [ ] Um mês completo compara com o mês civil anterior. Um intervalo de dois dias compara com os dois dias imediatamente anteriores.
- [ ] Entradas de R$ 500 e saídas de R$ 120 na mesma conta resultam em saldo de R$ 380 em JSON numérico.
- [ ] Datas inválidas, incompletas ou invertidas retornam `400`. Período vazio produz totais zero ou listas vazias conforme a estrutura da rota. Movimentações alheias ficam fora das agregações.

Use lançamentos fictícios no MySQL local enquanto a [05](05-lancamentos-e-parcelas.md) estiver em andamento. Na [09](09-conferir-entrega-e-ensaiar.md), repita o teste com uma compra criada pela API.

[Enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

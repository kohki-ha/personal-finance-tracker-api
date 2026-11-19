# 06 - Somar movimentações por categoria e por fonte/destino

**Responsável** Pessoa A  
**Depende de** [01](01-servidor-e-jwt.md) para o router protegido, [02](02-schema-mysql.md) para as consultas  
**Status** To do  
**Arquivos principais** `routes/relatorios.js` e `models/Relatorio.js`

O usuário consulta quanto entrou e saiu em um intervalo e identifica como as despesas mudaram em relação ao período anterior.

## O que fazer

- Implemente `GET /relatorios/categorias` e `GET /relatorios/fontes-destinos`. Ambos recebem `inicio` e `fim`, datas reais e inclusivas, com início menor ou igual ao fim.
- No relatório por categoria, use `SUM` e `GROUP BY` no MySQL. Mostre totais e percentuais de entradas e saídas e ordene as saídas pelo maior total. Compare os totais por categoria com o [período anterior](../spec.md#interpretações-propostas). Uma categoria que teve gasto somente no período anterior aparece com total atual zero e variação de -100%.
- No relatório por fonte/destino, mostre as entradas e saídas agrupadas por recurso e calcule o saldo das fontes do tipo `conta`. Filtre ambos os relatórios pelo usuário autenticado. Converta valores agregados para números na resposta.

## Critérios de aceite

- [ ] Com saídas de R$ 500 no período atual, uma categoria que passou de R$ 100 para R$ 125 tem participação de 25% e variação de 25%. Uma categoria sem valor anterior tem variação `null`.
- [ ] Um mês completo compara com o mês civil anterior. Um intervalo de dois dias compara com os dois dias imediatamente anteriores.
- [ ] Entradas de R$ 500 e saídas de R$ 120 na mesma conta resultam em saldo de R$ 380 em JSON numérico.
- [ ] Datas inválidas, incompletas ou invertidas retornam `400`. Período vazio produz totais zero ou listas vazias conforme a estrutura da rota. Movimentações alheias ficam fora das agregações.

Use lançamentos fictícios no MySQL local enquanto a [05](05-lancamentos-e-parcelas.md) estiver em andamento. Na [09](09-conferir-entrega-e-ensaiar.md), repita o teste com uma compra criada pela API.

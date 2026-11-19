# 07 — Prever faturas e calcular o limite dos cartões

**Responsável** Pessoa A  
**Depende de** [06](06-relatorios-por-periodo.md) para integrar a rota no router e model de relatórios  
**Status** To do  
**Arquivos principais** `utils/faturas.js`, `routes/relatorios.js` e `models/Relatorio.js`

O usuário consulta a fatura aberta e as próximas de cada cartão e entende quanto do limite está comprometido.

## O que fazer

- Acrescente `GET /relatorios/faturas?meses=3`. Aceite valores inteiros de 1 a 12 e use 3 por padrão. Use as tabelas de cartões e lançamentos da 02 com filtro pelo dono e considere as saídas do cartão.
- Calcule em função pura o fechamento, vencimento e referência por parcela. Compra antes do fechamento entra no ciclo do mês. No dia do fechamento ou depois, entra no ciclo seguinte. Some um mês de ciclo por parcela subsequente. O vencimento cai no mesmo mês se seu dia configurado for maior que o de fechamento. Nos demais casos, cai no mês seguinte. Ajuste dias inexistentes ao último dia do mês e use o mês de vencimento como referência.
- Para cada cartão, devolva a fatura aberta e a janela de futuras, com datas, itens, parcela e total por fatura. Informe limite total, utilizado e disponível. O cálculo do utilizado abrange todas as parcelas ainda a vencer, mesmo fora da janela exibida.

## Critérios de aceite

- [ ] Em um cartão que fecha dia 25 e vence dia 5, uma compra em 24/12 entra na fatura que vence em 05/01. Uma compra em 25/12 em 3× cai nas referências de fevereiro, março e abril.
- [ ] Em fevereiro de um ano comum, o fechamento configurado para dia 31 cai no dia 28. Compra nesse dia vai para o ciclo seguinte.
- [ ] Com limite de R$ 500 e R$ 100 em três parcelas ainda a vencer, o limite utilizado é R$ 100 e o disponível é R$ 400, inclusive com `meses=1` exibindo só a aberta e uma futura. Confira que uma fatura já fechada e ainda a vencer também conta no limite.
- [ ] `meses=0` e `meses=13` retornam `400`. Cartão de outro usuário fica fora da resposta. Cartão sem compras tem faturas zeradas, limite utilizado zero e limite disponível igual ao limite total.

O cálculo pode ser testado com datas fixas antes da 06. Para verificar a rota, use compras fictícias no banco local enquanto a [05](05-lancamentos-e-parcelas.md) estiver em andamento.

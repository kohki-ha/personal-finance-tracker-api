# 10 - Acrescentar indicadores de saúde financeira

**Responsável** Pessoa A, com verificação pela Pessoa B  
**Depende de** [09](09-conferir-entrega-e-ensaiar.md), com a entrega obrigatória pronta  
**Status** To do  
**Escopo** bônus opcional

O usuário recebe indicadores, uma projeção mensal e dicas geradas a partir dos seus dados. Comecem esta issue se houver tempo depois do ensaio da entrega obrigatória.

## O que fazer

- Implemente `GET /saude-financeira`, protegida pelo JWT e filtrada pelo dono. Reaproveite as agregações e os cálculos de fatura existentes.
- Use três indicadores calculáveis com os dados existentes. Taxa de poupança no mês, comprometimento da renda com faturas e total de parcelas futuras são um ponto de partida. Acrescente uma projeção mês a mês e dicas condicionais. Explique as fórmulas no README, incluindo falta de histórico, divisão por zero e como evitar contar a mesma parcela duas vezes na projeção.
- Inclua o aviso educativo exigido e acrescente um exemplo ao arquivo de requisições e ao roteiro da apresentação.

## Critérios de aceite

- [ ] A rota devolve pelo menos três indicadores, projeção mensal, dicas derivadas dos dados e o campo `aviso`, que explica o caráter educativo da resposta.
- [ ] Usuário sem histórico recebe uma resposta válida. Cenários com saldo previsto positivo e negativo produzem resultados diferentes. Os cálculos desconsideram registros de outro usuário.
- [ ] A demonstração completa continua cabendo no limite de 10 minutos.

[Regras do bônus](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

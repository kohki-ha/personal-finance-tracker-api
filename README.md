# API de Controle Financeiro Pessoal

API REST para registrar receitas e despesas, organizar lançamentos por categoria e acompanhar faturas de cartão. A branch `issues` guarda o planejamento da dupla. As entregas de código são integradas na `main`.

[Plano de trabalho](.scratch/api-financas/spec.md) · [Andamento no GitHub](https://github.com/kohki-ha/backend-projeto2/issues) · [Enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

## Divisão do trabalho

**Comecem em paralelo.** A Pessoa A prepara o servidor e a Pessoa B cria o schema do MySQL. Depois que essas duas tarefas entrarem na `main`, cada pessoa segue sua fila.

| Pessoa A | Pessoa B |
| --- | --- |
| [01 - Servidor e JWT](.scratch/api-financas/issues/01-servidor-e-jwt.md) | [02 - Schema MySQL](.scratch/api-financas/issues/02-schema-mysql.md) |
| [03 - Cadastro e login](.scratch/api-financas/issues/03-cadastro-e-login.md) | [04 - Categorias e fontes/destinos](.scratch/api-financas/issues/04-categorias-e-fontes-destinos.md) |
| [06 - Relatórios por período](.scratch/api-financas/issues/06-relatorios-por-periodo.md) | [05 - Lançamentos e parcelas](.scratch/api-financas/issues/05-lancamentos-e-parcelas.md) |
| [07 - Faturas](.scratch/api-financas/issues/07-faturas.md) | [08 - Seed, README e requisições](.scratch/api-financas/issues/08-preparar-entrega.md) |

Cada coluna tem sua própria ordem. Por exemplo, os relatórios podem ser testados com dados de exemplo no MySQL enquanto os lançamentos estão em desenvolvimento. O [plano de trabalho](.scratch/api-financas/spec.md) detalha as dependências e os arquivos compartilhados.

## Da issue ao PR

1. Abra a tarefa, confira as dependências e crie sua branch a partir da `main` atualizada.
2. Antes de abrir o PR, confira os critérios de aceite. Inclua os comandos de `curl` e os resultados quando a tarefa envolver rotas.
3. Vincule o PR à issue correspondente no GitHub para acompanhar a entrega.

## Fechamento em dupla

Com as tarefas obrigatórias integradas, façam juntos a [09 - Conferência e ensaio](.scratch/api-financas/issues/09-conferir-entrega-e-ensaiar.md). A [10 - Saúde financeira](.scratch/api-financas/issues/10-saude-financeira.md) fica como bônus após o ensaio da entrega obrigatória.

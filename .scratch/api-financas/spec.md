# API de Controle Financeiro

API REST de controle financeiro pessoal, com os requisitos RF1 a RF9. A entrega inclui o repositório Git, os scripts SQL, o README e comandos para testar todas as rotas. A apresentação tem até 10 minutos. Saúde financeira é bônus. [Enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

## Ordem de trabalho

| Issue | Quem faz | Depende de |
|---|---|---|
| [01 Servidor e JWT](issues/01-servidor-e-jwt.md) | Pessoa A | Nenhuma |
| [02 Schema MySQL](issues/02-schema-mysql.md) | Pessoa B | Nenhuma |
| [03 Cadastro e login](issues/03-cadastro-e-login.md) | Pessoa A | 01 e 02 |
| [04 Categorias e fontes/destinos](issues/04-categorias-e-fontes-destinos.md) | Pessoa B | 01 e 02 |
| [05 Lançamentos e parcelas](issues/05-lancamentos-e-parcelas.md) | Pessoa B | 04 |
| [06 Relatórios por período](issues/06-relatorios-por-periodo.md) | Pessoa A | 01 e 02 |
| [07 Faturas](issues/07-faturas.md) | Pessoa A | 06 para integrar a rota. O cálculo pode ser feito antes. |
| [08 Seed, README e requisições](issues/08-preparar-entrega.md) | Pessoa B | 01 e 02 para começar. 03 e 05 para validar login e gravação. |
| [09 Conferir a entrega e ensaiar](issues/09-conferir-entrega-e-ensaiar.md) | Dupla | 07 e 08 |
| [10 Saúde financeira, bônus](issues/10-saude-financeira.md) | Pessoa A, com teste da Pessoa B | 09 |

**Fila sugerida.** Pessoa A faz 01 → 03 → 06 → 07. Pessoa B faz 02 → 04 → 05 → 08. As duas filas avançam no ritmo de cada pessoa. A 03 e a 04 podem rodar em paralelo, e a 05 pode avançar enquanto a 06 ou a 07 estiver em andamento. Se a Pessoa B tiver tempo antes de terminar a 05, já pode preparar o seed e o README da 08. A dupla se reúne na 09, quando a API e os exemplos estiverem na `main`.

## Como evitar conflito

- Criem a branch de cada issue a partir da `main` atualizada quando os pré-requisitos para começar estiverem integrados. Na 08, isso permite preparar o seed e a documentação após 01 e 02, enquanto 03 e 05 liberam as verificações finais. Façam commits incrementais com a autoria de cada integrante.
- A Pessoa A monta os cinco routers em `server.js` na 01. Depois, cada pessoa trabalha no router do recurso da sua issue. A Pessoa B cuida de `database/schema.sql`. Se uma rota precisar de ajuste no schema, combinem a mudança e integrem o SQL primeiro.
- Cada pessoa usa seu próprio MySQL local e seu `.env`. Para testar isolamento, usem dois usuários no mesmo banco de teste e alternem os tokens.
- Nas issues de rotas, anotem o `curl` e o resultado observado na própria issue ou no PR. A Pessoa B reúne os exemplos em `testes/requisicoes.md` na 08. Acompanhem o andamento com `To do`, `In progress` e `Done` nas [issues do GitHub](https://github.com/kohki-ha/personal-finance-tracker-api/issues).

## Contratos compartilhados

- Node.js com CommonJS, Express, `mysql2`, `jsonwebtoken`, `express-jwt`, `bcrypt`, `dotenv` e `nodemon`. Um Router por recurso, validação na rota, SQL das operações em classes de `models/` com parâmetros `?` e funções puras em `utils/` para CPF, centavos e datas. Cada rota chama os métodos do modelo e monta a resposta. A conexão usa o pool de promises do `mysql2`, com datas SQL devolvidas como strings. Cada transação usa uma conexão do pool do início ao fim.
- O banco segue os nomes da seção 11.4.1. Prestem atenção ao contrato entre os relatórios e os lançamentos: `lancamentos.data` guarda a data da compra para todas as parcelas. `parcela_atual`, `total_parcelas` e `grupo_parcelamento` identificam a posição e a compra. Cartões têm `dia_fechamento`, `dia_vencimento` e `limite`. Os relatórios consultam essas tabelas pelos métodos de `Relatorio`.
- Os prefixos dos routers são `/auth`, `/categorias`, `/fontes-destinos`, `/lancamentos` e `/relatorios`. `POST /auth/cadastro` e `POST /auth/login` são públicos. `GET /auth/me` e as rotas dos outros quatro routers exigem Bearer JWT, com o ID em `req.auth.id`. Consultas, alterações e exclusões usam esse ID como filtro. Relacionamentos informados em um lançamento também são conferidos pelo dono.
- Erros em JSON com `erro` e, quando o erro identificar campos, `campos`. Use `400` para dados inválidos, `401` para credencial ou token inválido ou ausente, `404` para recurso inexistente ou alheio, `409` para duplicidade ou exclusão com vínculo e `500` para falha inesperada. Criações retornam `201`, consultas e atualizações `200`, e exclusões `204` sem corpo.
- Use os nomes de campos do enunciado. Nos lançamentos, o corpo usa `categoriaId`, `fonteDestinoId` e, na compra parcelada, `parcelas`. Nas fontes/destinos, o corpo usa `dia_fechamento` e `dia_vencimento` para cartão. Datas da API são `AAAA-MM-DD` e valores monetários são números no JSON. O total dos relatórios por período considera a data da compra. O relatório de faturas distribui as parcelas entre ciclos de cartão.
- Se a 03 já estiver pronta, usem o token do login real. Para testar uma rota protegida antes disso, criem um usuário fictício no MySQL local e assinem no terminal um token de curta duração com `jsonwebtoken`, o `JWT_SECRET` local e o `id` desse usuário. Nos relatórios, insiram os lançamentos de exemplo diretamente no banco local enquanto a 05 estiver em andamento. A 09 repete o fluxo com os dados criados pela API.

## Interpretações propostas

- **Período anterior.** Para um mês civil completo, comparar com o mês civil anterior, seguindo o exemplo do enunciado. Para intervalos parciais ou com mais de um mês, usar o intervalo imediatamente anterior com o mesmo número de dias. Quando o total anterior for zero, devolver `variacao: null`. Confirmem a comparação com a professora se houver orientação diferente.
- **Edição de parcela.** O `PUT` altera apenas o lançamento do ID informado. Em uma compra parcelada, preserve o tipo de saída, a data da compra, o cartão, o grupo, a posição e o total de parcelas. Assim, editar uma parcela não desloca a compra entre cartões ou ciclos de fatura.
- **Janela de faturas.** `meses` conta as faturas futuras além da aberta. Considere aberto o ciclo que fecha depois da data da consulta, já que o dia do fechamento inicia o ciclo seguinte para compras. O limite utilizado também inclui faturas que já fecharam e vencem no dia da consulta ou depois.

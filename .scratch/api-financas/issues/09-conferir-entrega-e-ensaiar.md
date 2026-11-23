# 09 - Reproduzir a entrega e ensaiar a apresentação

**Responsáveis** Pessoa A e Pessoa B\
**Depende de** [07](07-faturas.md) e [08](08-preparar-entrega.md) integradas na `main`

A dupla consegue demonstrar a API instalada do zero e explicar como o Express, o JWT, as regras de negócio e o MySQL trabalham juntos.

## O que fazer

- A Pessoa B segue o README a partir de um clone limpo e executa os comandos de cadastro, login e CRUD. A Pessoa A roda os três relatórios, confere valores numéricos, totais e ciclos e verifica com a dupla o checklist da seção 11.12. Ajustem o código ou os exemplos que divergirem.
- Ensaiem com dois usuários e uma compra em 3×. Planejem a data e o fechamento do cartão para que as três parcelas apareçam na janela de faturas no dia da apresentação.
- Mostrem a estrutura de pastas, o `schema.sql`, uma classe de modelo, um arquivo de rotas e o middleware JWT. Dividam a fala e reservem parte dos 10 minutos para cada bloco do roteiro. Os dois integrantes precisam conseguir explicar qualquer trecho entregue, incluindo transações, filtro por dono e cálculo de faturas. Se o bônus entrar na entrega, incluam a rota no ensaio.

## Critérios de aceite

- [ ] O roteiro comprova cadastro e duplicidades normalizadas (`409`), login, uma chamada sem token (`401` em JSON) e leitura, edição e exclusão alheias (`404`). O lançamento usado no teste de isolamento continua disponível para seu dono.
- [ ] A demonstração inclui CRUD dos três recursos, uma validação que falha, a compra parcelada e os três relatórios. Os valores das parcelas fecham a compra e cada parcela aparece na fatura prevista.
- [ ] O ensaio inclui criação do banco com schema e seed, `npm install` e `npm run dev`, além da explicação de código pelos dois integrantes. Dura no máximo 10 minutos.
- [ ] O histórico do repositório mostra commits incrementais dos dois integrantes. O link da entrega abre o repositório com o código e a documentação utilizados na demonstração.

[Critérios da apresentação](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

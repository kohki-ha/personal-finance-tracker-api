# 09 — Reproduzir a entrega e ensaiar a apresentação

**Responsáveis** Pessoa A e Pessoa B  
**Depende de** [07](07-faturas.md) e [08](08-preparar-entrega.md) integradas na `main`  
**Status** To do

A dupla consegue demonstrar a API instalada do zero e explicar como o Express, o JWT, as regras de negócio e o MySQL trabalham juntos.

## O que fazer

- A Pessoa B segue o README a partir de um clone limpo e executa os comandos de cadastro, login e CRUD. A Pessoa A roda os três relatórios com a compra criada no roteiro e confere os totais e ciclos. Ajustem o código ou os exemplos que divergirem.
- Ensaiem com dois usuários e uma compra em 3×. Planejem a data e o fechamento do cartão para que as três parcelas apareçam na janela de faturas no dia da apresentação.
- Reservem cerca de dois minutos para estrutura e inicialização, dois para cadastro, login e isolamento, dois para CRUD e validação e três para parcelamento e relatórios. Dividam a fala. Ambas as pessoas devem conseguir explicar a transação, o filtro por dono e o cálculo de faturas.

## Critérios de aceite

- [ ] O roteiro comprova cadastro e duplicidades normalizadas (`409`), login, uma chamada sem token (`401`) e leitura, edição e exclusão alheias (`404`). O lançamento usado no teste de isolamento continua disponível para seu dono.
- [ ] A demonstração inclui CRUD dos três recursos, uma validação que falha, a compra parcelada e os três relatórios. Os valores das parcelas fecham a compra e cada parcela aparece na fatura prevista.
- [ ] O ensaio inclui criação do banco com schema e seed, `npm install` e `npm run dev`, além da explicação de código pelos dois integrantes. Dura no máximo 10 minutos.
- [ ] O histórico do repositório mostra commits incrementais dos dois integrantes. O link da entrega abre o repositório com o código e a documentação utilizados na demonstração.

[Critérios da apresentação](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

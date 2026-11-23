# 08 - Preparar dados de exemplo, README e requisições

**Responsável** Pessoa B\
**Para começar** [01](01-servidor-e-jwt.md) e [02](02-schema-mysql.md), para usar a configuração e as tabelas reais\
**Para concluir** [03](03-cadastro-e-login.md) e [05](05-lancamentos-e-parcelas.md), para validar o login dos usuários do seed e os comandos de escrita\
**Arquivos principais** `database/seed.sql`, `README.md` e `testes/requisicoes.md`

Uma pessoa que acabou de clonar o projeto consegue subir a API, carregar dados de exemplo e reproduzir as requisições.

## O que fazer

- Crie `database/seed.sql` com pelo menos dois usuários fictícios, senhas com hash de bcrypt e três meses de lançamentos. Inclua categorias, contas, pelo menos um cartão de crédito e uma compra parcelada no próprio seed. Use esses dados para testar relatórios e isolamento.
- Complete o README com pré-requisitos, configuração do `.env`, aplicação de `schema.sql` seguida de `seed.sql`, instalação com `npm install`, scripts e credenciais fictícias de demonstração.
- Complete `testes/requisicoes.md` com a ordem dos comandos, os status esperados e como obter os tokens e IDs usados nos exemplos. Reaproveite as requisições de cada issue. Se alguma rota de relatório ainda estiver em implementação, prepare o comando pelo contrato. A conferência da resposta acontece na 09.

## Critérios de aceite

- [ ] O seed aplica após o schema em um banco vazio e cria pelo menos dois usuários, três meses de movimentações, um cartão e uma compra parcelada associada ao cartão. Os dois usuários de demonstração conseguem fazer login.
- [ ] O README permite subir a API local sem instruções passadas por fora. O Git ignora `.env` e `node_modules/` e inclui `.env.example`.
- [ ] O roteiro contém exemplos para as 19 rotas obrigatórias, duplicidade de e-mail e de CPF em requisições distintas, `401` sem token ou com token vencido e `404` ao ler, editar e excluir lançamento de outro usuário. Inclui a criação de uma compra parcelada pela API para consultar nos três relatórios no ensaio da [09](09-conferir-entrega-e-ensaiar.md).

O seed e o README podem começar antes da 05. A finalização pode avançar enquanto a Pessoa A conclui a [07](07-faturas.md).

[Enunciado da disciplina](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

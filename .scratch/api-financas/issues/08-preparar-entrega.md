# 08 - Preparar dados de exemplo, README e requisições

**Responsável** Pessoa B  
**Para começar** [01](01-servidor-e-jwt.md) e [02](02-schema-mysql.md), para usar a configuração e as tabelas reais  
**Para concluir** [03](03-cadastro-e-login.md) e [05](05-lancamentos-e-parcelas.md), para validar o login dos usuários do seed e os comandos de escrita  
**Status** To do  
**Arquivos principais** `database/seed.sql`, `README.md` e `testes/requisicoes.md`

Uma pessoa que acabou de clonar o projeto consegue subir a API, carregar dados de exemplo e reproduzir as requisições.

## O que fazer

- Crie `database/seed.sql` com dois usuários fictícios, hashes das senhas de demonstração, categorias, conta, cartão e movimentações para testar os relatórios e o isolamento. Use os dados do seed para os exemplos já preparados e uma compra criada durante o ensaio para mostrar as próximas faturas.
- Complete o README com pré-requisitos, configuração do `.env`, aplicação de `schema.sql` e `seed.sql`, dependências, scripts e credenciais fictícias para demonstração.
- Complete `testes/requisicoes.md` com a ordem dos comandos, os status esperados e como obter os tokens e IDs usados nos exemplos. Reaproveite as requisições de cada issue. Se alguma rota de relatório ainda estiver em implementação, prepare o comando pelo contrato. A conferência da resposta acontece na 09.

## Critérios de aceite

- [ ] O seed aplica em um banco vazio após o schema. Os dois usuários do seed conseguem fazer login.
- [ ] O README permite subir a API local sem instruções passadas por fora. O Git ignora `.env` e `node_modules/` e inclui `.env.example`.
- [ ] O roteiro contém exemplos para as 19 rotas obrigatórias, duplicidade de e-mail e de CPF em requisições distintas, `401` sem token, `404` com o segundo usuário e uma compra parcelada para consultar nos três relatórios.

O seed e o README podem começar antes da 05. A finalização pode avançar enquanto a Pessoa A conclui a [07](07-faturas.md).

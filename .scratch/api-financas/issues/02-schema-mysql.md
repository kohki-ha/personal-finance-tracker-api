# 02 - Criar o banco e validar as restrições

**Responsável** Pessoa B  
**Depende de** nenhuma  
**Status** To do  
**Arquivo principal** `database/schema.sql`

Criar as tabelas que os dois integrantes vão usar no MySQL local. Pode avançar em paralelo à [01](01-servidor-e-jwt.md).

## O que fazer

- Crie `database/schema.sql` seguindo as quatro tabelas e os relacionamentos da seção 11.4.1. Mantenha os nomes, chaves estrangeiras, restrições de unicidade, `CHECK` e índice por usuário e data dos lançamentos.
- Use `DECIMAL(12,2)` para dinheiro e `DATE` para a data da compra. Mantenha os campos do cartão e do parcelamento previstos no enunciado. A dupla trabalha com esse esquema desde o início.
- Use o cliente MySQL para importar o arquivo no banco local. Registre o comando que funcionou para reaproveitá-lo no README da [08](08-preparar-entrega.md).

## Critérios de aceite

- [ ] O schema cria o banco do zero em MySQL 8.0.16 ou superior. Outro integrante consegue repetir a importação.
- [ ] O banco rejeita CPF e e-mail repetidos, dia de cartão fora de 1 a 31, parcela maior que o total de parcelas e lançamento com valor zero, negativo ou referência inexistente.
- [ ] A chave estrangeira bloqueia a exclusão de categoria ou fonte/destino usada por lançamento.

[Modelo de dados no enunciado](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

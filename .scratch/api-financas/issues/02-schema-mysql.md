# 02 - Criar o banco e validar as restrições

**Responsável** Pessoa B\
**Depende de** nenhuma\
**Arquivo principal** `database/schema.sql`

Criar as tabelas que os dois integrantes vão usar no MySQL local. Pode avançar em paralelo à [01](01-servidor-e-jwt.md).

## O que fazer

- Crie `database/schema.sql` seguindo as quatro tabelas e os relacionamentos da seção 11.4.1. Mantenha as colunas, chaves estrangeiras, restrições `UNIQUE` e `CHECK` e o índice de lançamentos por usuário e data. Preserve os nomes `uq_usuarios_email` e `uq_usuarios_cpf`, usados no cadastro da 03.
- Use `DECIMAL(12,2)` para dinheiro e `DATE` para a data da compra. Mantenha os campos do cartão e do parcelamento previstos no enunciado. A dupla trabalha com esse esquema desde o início.
- Importe o arquivo no MySQL local com `mysql -u root -p < database/schema.sql`, trocando `root` pelo usuário local se necessário. A [08](08-preparar-entrega.md) complementa essa instrução do README com a importação do seed.

## Critérios de aceite

- [ ] O schema cria o banco do zero em MySQL 8.0.16 ou superior. Outro integrante consegue repetir a importação.
- [ ] O banco rejeita CPF e e-mail repetidos. Rejeita categoria com mesmo usuário, nome e tipo e fonte/destino com mesmo usuário e nome. Outro usuário pode usar os mesmos nomes.
- [ ] O banco rejeita cartão sem fechamento, vencimento ou limite, com dia fora de 1 a 31 ou limite menor ou igual a zero. Também rejeita valor de lançamento menor ou igual a zero, referência inexistente, total de parcelas fora de 1 a 48 ou parcela atual fora de 1 a N.
- [ ] A chave estrangeira bloqueia a exclusão de categoria ou fonte/destino usada por lançamento.

[Modelo de dados no enunciado](https://costasilvati.github.io/IntroNodeJS/projeto-api-financas.html)

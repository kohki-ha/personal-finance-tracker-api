# Roteiro de requisições da API

Este roteiro usa Git Bash e `curl.exe`, funciona em Windows e usa os usuários fictícios de `database/seed.sql`. Os exemplos que criam ou alteram dados devem ser executados no banco local de demonstração. `curl -i` mostra o status HTTP junto com a resposta JSON.

## 1. Preparar ambiente e tokens

Na raiz do projeto, configure `.env`, aplique `database/schema.sql` e depois `database/seed.sql`, instale as dependências e inicie a API conforme o [README](../README.md). Em outro terminal, defina as variáveis e faça login como Ana:

```bash
BASE_URL=http://localhost:3000
EMAIL_A=ana.demo@example.com
SENHA_A='DemoA2026!'
EMAIL_B=bruno.demo@example.com
SENHA_B='DemoB2026!'

curl.exe -i -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_A\",\"senha\":\"$SENHA_A\"}"
```

O login retorna `200` com `token` e `usuario`. Copie o valor de `token` da resposta e defina-o no Git Bash; não inclua as aspas da resposta:

```bash
TOKEN_A='cole_aqui_o_token_de_Ana'
```

Repita o login de Bruno e copie o token dele:

```bash
curl.exe -i -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_B\",\"senha\":\"$SENHA_B\"}"

TOKEN_B='cole_aqui_o_token_de_Bruno'
```

Os tokens têm validade de uma hora. Para obter IDs usados abaixo, consulte primeiro as listas com `GET /categorias`, `GET /fontes-destinos` e `GET /lancamentos`; copie da resposta os IDs do usuário autenticado. Ana e Bruno têm dados independentes, então use sempre os IDs do usuário cujo token está no comando.

```bash
curl.exe -i "$BASE_URL/categorias" -H "Authorization: Bearer $TOKEN_A"
curl.exe -i "$BASE_URL/fontes-destinos" -H "Authorization: Bearer $TOKEN_A"
curl.exe -i "$BASE_URL/lancamentos" -H "Authorization: Bearer $TOKEN_A"
curl.exe -i "$BASE_URL/lancamentos" -H "Authorization: Bearer $TOKEN_B"
```

Anote os IDs de Ana para uma categoria `entrada`, como `Salário`, uma categoria `saida`, como `Alimentação`, e para o cartão `Cartão Visa Demo`. Anote também o ID de uma parcela de Bruno cuja descrição seja `SEED - Compra parcelada - mochila` (por exemplo, `1/3`) para testar o isolamento de um grupo. Os exemplos usam os nomes abaixo; os IDs são gerados pelo MySQL e podem mudar entre bancos.

```bash
CATEGORIA_ENTRADA_A=cole_o_id_da_categoria_Salario
CATEGORIA_SAIDA_A=cole_o_id_da_categoria_Alimentacao
CARTAO_A=cole_o_id_do_Cartao_Visa_Demo
ID_LANCAMENTO_BRUNO=cole_o_id_de_um_lancamento_de_Bruno
```

## 2. Cadastro e autenticação

### 1. Cadastrar usuário — `POST /auth/cadastro` (`201`)

O exemplo cria uma conta temporária para permitir também os testes de duplicidade. Use um e-mail e CPF ainda não utilizados no seu banco.

```bash
curl.exe -i -X POST "$BASE_URL/auth/cadastro" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Usuário de roteiro","email":"roteiro.unico@example.com","cpf":"10000000019","senha":"Roteiro123"}'
```

A resposta `201` contém `id`, `nome` e `email`, mas nunca `senha_hash`.

### Duplicidade de e-mail (`409`, campo `email`)

O CPF abaixo é válido e diferente do usado no cadastro anterior, isolando o teste de e-mail duplicado:

```bash
curl.exe -i -X POST "$BASE_URL/auth/cadastro" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Outro usuário","email":"ROTEIRO.UNICO@EXAMPLE.COM","cpf":"10000000108","senha":"Roteiro123"}'
```

### Duplicidade de CPF (`409`, campo `cpf`)

Use outro e-mail e mantenha o CPF cadastrado na primeira requisição:

```bash
curl.exe -i -X POST "$BASE_URL/auth/cadastro" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Outro usuário","email":"roteiro.outro@example.com","cpf":"100.000.000-19","senha":"Roteiro123"}'
```

### 2. Login — `POST /auth/login` (`200` ou `401`)

Use os comandos de login da seção anterior. Senha errada ou e-mail desconhecido deve retornar `401` com a mesma mensagem genérica.

### 3. Perfil — `GET /auth/me` (`200` ou `401`)

Com token válido, a resposta `200` contém apenas o perfil básico de Ana.

```bash
curl.exe -i "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN_A"
```

Sem token, o resultado deve ser `401`:

```bash
curl.exe -i "$BASE_URL/auth/me"
```

Para criar um token já vencido usando o segredo local, rode:

```bash
TOKEN_VENCIDO=$(node -e 'require("dotenv").config({quiet:true}); const jwt=require("jsonwebtoken"); console.log(jwt.sign({id:1},process.env.JWT_SECRET,{expiresIn:-1}))')
curl.exe -i "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN_VENCIDO"
```

O resultado também deve ser `401`. O ID do token não precisa corresponder a uma conta existente: a expiração é verificada antes da consulta.

## 3. Categorias

### 4. Listar categorias — `GET /categorias` (`200`)

```bash
curl.exe -i "$BASE_URL/categorias" -H "Authorization: Bearer $TOKEN_A"
curl.exe -i "$BASE_URL/categorias?tipo=saida" -H "Authorization: Bearer $TOKEN_A"
```

### 5. Criar categoria — `POST /categorias` (`201`)

```bash
curl.exe -i -X POST "$BASE_URL/categorias" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d '{"nome":"Categoria roteiro","tipo":"saida"}'
```

Copie o `id` retornado para `ID_CATEGORIA_TESTE`.

```bash
ID_CATEGORIA_TESTE=cole_o_id_retornado
```

### 6. Atualizar categoria — `PUT /categorias/:id` (`200`)

```bash
curl.exe -i -X PUT "$BASE_URL/categorias/$ID_CATEGORIA_TESTE" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d '{"nome":"Categoria roteiro atualizada","tipo":"saida"}'
```

### 7. Excluir categoria — `DELETE /categorias/:id` (`204`, sem corpo)

```bash
curl.exe -i -X DELETE "$BASE_URL/categorias/$ID_CATEGORIA_TESTE" \
  -H "Authorization: Bearer $TOKEN_A"
```

## 4. Fontes e destinos

### 8. Listar fontes/destinos — `GET /fontes-destinos` (`200`)

```bash
curl.exe -i "$BASE_URL/fontes-destinos" -H "Authorization: Bearer $TOKEN_A"
curl.exe -i "$BASE_URL/fontes-destinos?tipo=cartao_credito" -H "Authorization: Bearer $TOKEN_A"
```

### 9. Criar fonte/destino — `POST /fontes-destinos` (`201`)

```bash
curl.exe -i -X POST "$BASE_URL/fontes-destinos" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d '{"nome":"Conta roteiro","tipo":"conta"}'
```

Copie o `id` retornado para `ID_FONTE_TESTE`.

```bash
ID_FONTE_TESTE=cole_o_id_retornado
```

### 10. Atualizar fonte/destino — `PUT /fontes-destinos/:id` (`200`)

```bash
curl.exe -i -X PUT "$BASE_URL/fontes-destinos/$ID_FONTE_TESTE" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d '{"nome":"Conta roteiro atualizada","tipo":"conta"}'
```

### 11. Excluir fonte/destino — `DELETE /fontes-destinos/:id` (`204`, sem corpo)

```bash
curl.exe -i -X DELETE "$BASE_URL/fontes-destinos/$ID_FONTE_TESTE" \
  -H "Authorization: Bearer $TOKEN_A"
```

## 5. Lançamentos e parcelas

Para usar a data de hoje no Git Bash:

```bash
DATA_HOJE=$(node -e 'const d=new Date(); console.log(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`)')
INICIO=$(node -e 'const d=new Date(); const x=new Date(d.getFullYear(),d.getMonth()-2,1); console.log(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`)')
```

### 12. Listar lançamentos — `GET /lancamentos` (`200`)

Sem filtros, a API usa o mês atual e retorna até 20 itens por página. Os filtros aceitos são `inicio`, `fim`, `tipo`, `categoriaId`, `fonteDestinoId` e `pagina`.

```bash
curl.exe -i "$BASE_URL/lancamentos" -H "Authorization: Bearer $TOKEN_A"
curl.exe -i "$BASE_URL/lancamentos?inicio=$INICIO&fim=$DATA_HOJE&tipo=saida&pagina=1" \
  -H "Authorization: Bearer $TOKEN_A"
```

### 13. Criar lançamento simples — `POST /lancamentos` (`201`)

```bash
curl.exe -i -X POST "$BASE_URL/lancamentos" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d "{\"tipo\":\"saida\",\"descricao\":\"Compra de teste\",\"valor\":75.50,\"data\":\"$DATA_HOJE\",\"categoriaId\":$CATEGORIA_SAIDA_A,\"fonteDestinoId\":$CARTAO_A}"
```

Copie o `id` retornado para `ID_LANCAMENTO_TESTE`.

```bash
ID_LANCAMENTO_TESTE=cole_o_id_retornado
```

### 14. Consultar lançamento — `GET /lancamentos/:id` (`200`)

```bash
curl.exe -i "$BASE_URL/lancamentos/$ID_LANCAMENTO_TESTE" \
  -H "Authorization: Bearer $TOKEN_A"
```

### 15. Atualizar lançamento — `PUT /lancamentos/:id` (`200`)

```bash
curl.exe -i -X PUT "$BASE_URL/lancamentos/$ID_LANCAMENTO_TESTE" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d "{\"tipo\":\"saida\",\"descricao\":\"Compra atualizada\",\"valor\":80.00,\"data\":\"$DATA_HOJE\",\"categoriaId\":$CATEGORIA_SAIDA_A,\"fonteDestinoId\":$CARTAO_A}"
```

### 16. Excluir lançamento — `DELETE /lancamentos/:id` (`204`, sem corpo)

```bash
curl.exe -i -X DELETE "$BASE_URL/lancamentos/$ID_LANCAMENTO_TESTE" \
  -H "Authorization: Bearer $TOKEN_A"
```

### Criar compra parcelada pela API (`201`)

Crie esta compra e **mantenha os registros** para consultar em todos os relatórios abaixo. A resposta contém os IDs de cada parcela e a posição (`1/3`, `2/3`, `3/3`).

```bash
curl.exe -i -X POST "$BASE_URL/lancamentos" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d "{\"tipo\":\"saida\",\"descricao\":\"Compra parcelada do roteiro\",\"valor\":900.00,\"data\":\"$DATA_HOJE\",\"categoriaId\":$CATEGORIA_SAIDA_A,\"fonteDestinoId\":$CARTAO_A,\"parcelas\":3}"
```

### Saída com categoria de entrada (`400`, campo `categoriaId`)

```bash
curl.exe -i -X POST "$BASE_URL/lancamentos" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d "{\"tipo\":\"saida\",\"descricao\":\"Compra parcelada do roteiro\",\"valor\":900.00,\"data\":\"$DATA_HOJE\",\"categoriaId\":$CATEGORIA_ENTRADA_A,\"fonteDestinoId\":$CARTAO_A,\"parcelas\":3}"
```

### Isolamento: IDs de Bruno com o token de Ana (`404`)

Use `ID_LANCAMENTO_BRUNO` obtido na listagem de Bruno e IDs válidos de Ana no corpo do `PUT`. As quatro respostas abaixo devem ser `404`, inclusive a exclusão em grupo.

```bash
curl.exe -i "$BASE_URL/lancamentos/$ID_LANCAMENTO_BRUNO" \
  -H "Authorization: Bearer $TOKEN_A"

curl.exe -i -X PUT "$BASE_URL/lancamentos/$ID_LANCAMENTO_BRUNO" \
  -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" \
  -d "{\"tipo\":\"saida\",\"descricao\":\"Tentativa alheia\",\"valor\":10.00,\"data\":\"$DATA_HOJE\",\"categoriaId\":$CATEGORIA_SAIDA_A,\"fonteDestinoId\":$CARTAO_A}"

curl.exe -i -X DELETE "$BASE_URL/lancamentos/$ID_LANCAMENTO_BRUNO" \
  -H "Authorization: Bearer $TOKEN_A"

curl.exe -i -X DELETE "$BASE_URL/lancamentos/$ID_LANCAMENTO_BRUNO?todasParcelas=true" \
  -H "Authorization: Bearer $TOKEN_A"
```

## 6. Relatórios

Os relatórios de categorias e fontes/destinos pertencem à issue 06; faturas pertence à issue 07. Se alguma dessas rotas ainda não tiver sido integrada à `main`, deixe o comando preparado e repita-o quando a rota estiver disponível. Com as issues integradas, cada chamada válida retorna `200`.

O intervalo `INICIO` a `DATA_HOJE`, calculado na seção de lançamentos, inclui os três meses do seed.

### 17. Relatório por categoria — `GET /relatorios/categorias` (`200`)

```bash
curl.exe -i "$BASE_URL/relatorios/categorias?inicio=$INICIO&fim=$DATA_HOJE" \
  -H "Authorization: Bearer $TOKEN_A"
```

### 18. Relatório por fonte/destino — `GET /relatorios/fontes-destinos` (`200`)

```bash
curl.exe -i "$BASE_URL/relatorios/fontes-destinos?inicio=$INICIO&fim=$DATA_HOJE" \
  -H "Authorization: Bearer $TOKEN_A"
```

### 19. Faturas e limite — `GET /relatorios/faturas?meses=3` (`200`)

```bash
curl.exe -i "$BASE_URL/relatorios/faturas?meses=3" \
  -H "Authorization: Bearer $TOKEN_A"
```

## Limpar o usuário temporário do teste de cadastro

Se executou o cadastro de `roteiro.unico@example.com`, remova essa conta de demonstração pelo MySQL depois dos testes. A exclusão da conta remove seus dados dependentes pelo `ON DELETE CASCADE`.

```bash
mysql -u root -p api_financas -e "DELETE FROM usuarios WHERE email = 'roteiro.unico@example.com';"
```

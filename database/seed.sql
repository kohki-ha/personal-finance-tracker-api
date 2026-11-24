USE api_financas;

-- Contas fictícias para demonstração local. Senhas: DemoA2026! e DemoB2026!
INSERT INTO usuarios (nome, email, cpf, senha_hash)
VALUES
  ('Ana Demonstração', 'ana.demo@example.com', '10000000280', '$2b$10$qi.8qho.YddN5X8fpPoice0.XFoAoXx22xT2Oe8bmgu2HEJEUwZ.e'),
  ('Bruno Demonstração', 'bruno.demo@example.com', '10000000361', '$2b$10$aATfFrRDNk90nobXz5/b6uA5TSX//b3WE19wYXhG2JIGdQi32puj2')
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  senha_hash = VALUES(senha_hash);

SET @ana_id = (SELECT id FROM usuarios WHERE email = 'ana.demo@example.com');
SET @bruno_id = (SELECT id FROM usuarios WHERE email = 'bruno.demo@example.com');

-- Categorias iniciais dos dois usuários.
INSERT INTO categorias (usuario_id, nome, tipo) VALUES
  (@ana_id, 'Salário', 'entrada'),
  (@ana_id, 'Outras entradas', 'entrada'),
  (@ana_id, 'Moradia', 'saida'),
  (@ana_id, 'Alimentação', 'saida'),
  (@ana_id, 'Mobilidade', 'saida'),
  (@ana_id, 'Lazer', 'saida'),
  (@bruno_id, 'Salário', 'entrada'),
  (@bruno_id, 'Outras entradas', 'entrada'),
  (@bruno_id, 'Moradia', 'saida'),
  (@bruno_id, 'Alimentação', 'saida'),
  (@bruno_id, 'Mobilidade', 'saida'),
  (@bruno_id, 'Lazer', 'saida')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- Fontes, contas e cartões. Os cartões fecham no dia 25 e vencem no dia 5.
INSERT INTO fontes_destinos (usuario_id, nome, tipo, dia_fechamento, dia_vencimento, limite) VALUES
  (@ana_id, 'Empresa', 'renda', NULL, NULL, NULL),
  (@ana_id, 'Conta corrente', 'conta', NULL, NULL, NULL),
  (@ana_id, 'Cartão Visa Demo', 'cartao_credito', 25, 5, 5000.00),
  (@bruno_id, 'Empresa', 'renda', NULL, NULL, NULL),
  (@bruno_id, 'Conta corrente', 'conta', NULL, NULL, NULL),
  (@bruno_id, 'Cartão Visa Demo', 'cartao_credito', 25, 5, 3500.00)
ON DUPLICATE KEY UPDATE
  tipo = VALUES(tipo),
  dia_fechamento = VALUES(dia_fechamento),
  dia_vencimento = VALUES(dia_vencimento),
  limite = VALUES(limite);

-- IDs e datas são obtidos pelos nomes para o seed não depender de AUTO_INCREMENT fixo.
SET @ana_salario = (SELECT id FROM categorias WHERE usuario_id = @ana_id AND nome = 'Salário' AND tipo = 'entrada');
SET @ana_moradia = (SELECT id FROM categorias WHERE usuario_id = @ana_id AND nome = 'Moradia' AND tipo = 'saida');
SET @ana_alimentacao = (SELECT id FROM categorias WHERE usuario_id = @ana_id AND nome = 'Alimentação' AND tipo = 'saida');
SET @ana_mobilidade = (SELECT id FROM categorias WHERE usuario_id = @ana_id AND nome = 'Mobilidade' AND tipo = 'saida');
SET @ana_empresa = (SELECT id FROM fontes_destinos WHERE usuario_id = @ana_id AND nome = 'Empresa');
SET @ana_conta = (SELECT id FROM fontes_destinos WHERE usuario_id = @ana_id AND nome = 'Conta corrente');
SET @ana_cartao = (SELECT id FROM fontes_destinos WHERE usuario_id = @ana_id AND nome = 'Cartão Visa Demo');

SET @bruno_salario = (SELECT id FROM categorias WHERE usuario_id = @bruno_id AND nome = 'Salário' AND tipo = 'entrada');
SET @bruno_moradia = (SELECT id FROM categorias WHERE usuario_id = @bruno_id AND nome = 'Moradia' AND tipo = 'saida');
SET @bruno_alimentacao = (SELECT id FROM categorias WHERE usuario_id = @bruno_id AND nome = 'Alimentação' AND tipo = 'saida');
SET @bruno_mobilidade = (SELECT id FROM categorias WHERE usuario_id = @bruno_id AND nome = 'Mobilidade' AND tipo = 'saida');
SET @bruno_empresa = (SELECT id FROM fontes_destinos WHERE usuario_id = @bruno_id AND nome = 'Empresa');
SET @bruno_conta = (SELECT id FROM fontes_destinos WHERE usuario_id = @bruno_id AND nome = 'Conta corrente');
SET @bruno_cartao = (SELECT id FROM fontes_destinos WHERE usuario_id = @bruno_id AND nome = 'Cartão Visa Demo');

SET @inicio_mes_atual = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01');
SET @data_mes_anterior_2 = DATE_ADD(DATE_SUB(@inicio_mes_atual, INTERVAL 2 MONTH), INTERVAL 5 DAY);
SET @data_mes_anterior_1 = DATE_ADD(DATE_SUB(@inicio_mes_atual, INTERVAL 1 MONTH), INTERVAL 10 DAY);
SET @data_mes_atual = CURRENT_DATE;

-- Em uma nova execução, substitui apenas os lançamentos de demonstração.
DELETE FROM lancamentos
WHERE usuario_id IN (@ana_id, @bruno_id)
  AND descricao LIKE 'SEED -%';

INSERT INTO lancamentos
  (usuario_id, tipo, descricao, valor, data, categoria_id, fonte_destino_id,
   parcela_atual, total_parcelas, grupo_parcelamento)
VALUES
  (@ana_id, 'entrada', 'SEED - Salário - mês -2', 4800.00, @data_mes_anterior_2, @ana_salario, @ana_empresa, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Moradia - mês -2', 1450.00, @data_mes_anterior_2, @ana_moradia, @ana_conta, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Alimentação - mês -2', 520.00, @data_mes_anterior_2, @ana_alimentacao, @ana_cartao, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Mobilidade - mês -2', 180.00, @data_mes_anterior_2, @ana_mobilidade, @ana_conta, 1, 1, NULL),
  (@ana_id, 'entrada', 'SEED - Salário - mês -1', 4800.00, @data_mes_anterior_1, @ana_salario, @ana_empresa, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Moradia - mês -1', 1450.00, @data_mes_anterior_1, @ana_moradia, @ana_conta, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Alimentação - mês -1', 610.00, @data_mes_anterior_1, @ana_alimentacao, @ana_cartao, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Mobilidade - mês -1', 200.00, @data_mes_anterior_1, @ana_mobilidade, @ana_conta, 1, 1, NULL),
  (@ana_id, 'entrada', 'SEED - Salário - mês atual', 4800.00, @data_mes_atual, @ana_salario, @ana_empresa, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Moradia - mês atual', 1450.00, @data_mes_atual, @ana_moradia, @ana_conta, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Alimentação - mês atual', 580.00, @data_mes_atual, @ana_alimentacao, @ana_cartao, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Mobilidade - mês atual', 190.00, @data_mes_atual, @ana_mobilidade, @ana_conta, 1, 1, NULL),
  (@ana_id, 'saida', 'SEED - Compra parcelada - fone', 300.00, @data_mes_atual, @ana_alimentacao, @ana_cartao, 1, 3, '11111111-1111-4111-8111-111111111111'),
  (@ana_id, 'saida', 'SEED - Compra parcelada - fone', 300.00, @data_mes_atual, @ana_alimentacao, @ana_cartao, 2, 3, '11111111-1111-4111-8111-111111111111'),
  (@ana_id, 'saida', 'SEED - Compra parcelada - fone', 299.99, @data_mes_atual, @ana_alimentacao, @ana_cartao, 3, 3, '11111111-1111-4111-8111-111111111111'),

  (@bruno_id, 'entrada', 'SEED - Salário - mês -2', 3600.00, @data_mes_anterior_2, @bruno_salario, @bruno_empresa, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Moradia - mês -2', 1100.00, @data_mes_anterior_2, @bruno_moradia, @bruno_conta, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Alimentação - mês -2', 410.00, @data_mes_anterior_2, @bruno_alimentacao, @bruno_cartao, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Mobilidade - mês -2', 150.00, @data_mes_anterior_2, @bruno_mobilidade, @bruno_conta, 1, 1, NULL),
  (@bruno_id, 'entrada', 'SEED - Salário - mês -1', 3600.00, @data_mes_anterior_1, @bruno_salario, @bruno_empresa, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Moradia - mês -1', 1100.00, @data_mes_anterior_1, @bruno_moradia, @bruno_conta, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Alimentação - mês -1', 460.00, @data_mes_anterior_1, @bruno_alimentacao, @bruno_cartao, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Mobilidade - mês -1', 160.00, @data_mes_anterior_1, @bruno_mobilidade, @bruno_conta, 1, 1, NULL),
  (@bruno_id, 'entrada', 'SEED - Salário - mês atual', 3600.00, @data_mes_atual, @bruno_salario, @bruno_empresa, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Moradia - mês atual', 1100.00, @data_mes_atual, @bruno_moradia, @bruno_conta, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Alimentação - mês atual', 430.00, @data_mes_atual, @bruno_alimentacao, @bruno_cartao, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Mobilidade - mês atual', 155.00, @data_mes_atual, @bruno_mobilidade, @bruno_conta, 1, 1, NULL),
  (@bruno_id, 'saida', 'SEED - Compra parcelada - mochila', 150.00, @data_mes_atual, @bruno_alimentacao, @bruno_cartao, 1, 3, '22222222-2222-4222-8222-222222222222'),
  (@bruno_id, 'saida', 'SEED - Compra parcelada - mochila', 150.00, @data_mes_atual, @bruno_alimentacao, @bruno_cartao, 2, 3, '22222222-2222-4222-8222-222222222222'),
  (@bruno_id, 'saida', 'SEED - Compra parcelada - mochila', 149.99, @data_mes_atual, @bruno_alimentacao, @bruno_cartao, 3, 3, '22222222-2222-4222-8222-222222222222');

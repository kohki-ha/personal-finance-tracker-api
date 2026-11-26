const express = require('express');
const { valorMonetarioValido } = require('../utils/valorMonetario');
const Lancamento = require('../models/Lancamento');
const FonteDestino = require('../models/FonteDestino');
const { dataIsoValida, periodoDoMesAtual } = require('../utils/data');
const { dividirEmCentavos } = require('../utils/parcelas');

const router = express.Router();
const tiposLancamento = ['entrada', 'saida'];
const porPagina = 20;

router.get('/', listar);
router.get('/:id', buscarPorId);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);

async function listar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;
  const campos = {};
  const padrao = periodoDoMesAtual();
  const inicio = req.query.inicio ?? padrao.inicio;
  const fim = req.query.fim ?? padrao.fim;
  const tipo = req.query.tipo;
  const categoriaId = req.query.categoriaId === undefined ? undefined : validarId(req.query.categoriaId);
  const fonteDestinoId = req.query.fonteDestinoId === undefined ? undefined : validarId(req.query.fonteDestinoId);
  const pagina = req.query.pagina === undefined ? 1 : validarId(req.query.pagina);

  if (!dataIsoValida(inicio)) campos.inicio = 'Informe uma data válida no formato AAAA-MM-DD.';
  if (!dataIsoValida(fim)) campos.fim = 'Informe uma data válida no formato AAAA-MM-DD.';
  else if (dataIsoValida(inicio) && fim < inicio) campos.fim = 'A data final deve ser igual ou posterior à inicial.';
  if (tipo !== undefined && !tiposLancamento.includes(tipo)) campos.tipo = 'Use entrada ou saida.';
  if (req.query.categoriaId !== undefined && !categoriaId) campos.categoriaId = 'Informe um ID inteiro positivo.';
  if (req.query.fonteDestinoId !== undefined && !fonteDestinoId) campos.fonteDestinoId = 'Informe um ID inteiro positivo.';
  if (!pagina) campos.pagina = 'Informe um número inteiro positivo.';
  if (Object.keys(campos).length) return dadosInvalidos(res, campos);

  const filtros = { inicio, fim, tipo, categoriaId, fonteDestinoId, pagina, porPagina };
  const [itens, total, resumo] = await Promise.all([
    Lancamento.listar(usuarioId, filtros),
    Lancamento.contar(usuarioId, filtros),
    Lancamento.resumir(usuarioId, filtros),
  ]);
  return res.status(200).json({
    periodo: { inicio, fim },
    resumo,
    pagina,
    totalPaginas: Math.ceil(total / porPagina),
    itens,
  });
}

async function buscarPorId(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;
  const id = validarId(req.params.id);
  if (!id) return dadosInvalidos(res, { id: 'Informe um ID inteiro positivo.' });
  const lancamento = await Lancamento.buscarPorId(id, usuarioId);
  if (!lancamento) return res.status(404).json({ erro: 'Lançamento não encontrado.' });
  return res.status(200).json(lancamento);
}

async function criar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;
  const { dados, campos } = validarLancamento(req.body);
  if (Object.keys(campos).length) return dadosInvalidos(res, campos);

  const parcelas = req.body.parcelas === undefined ? 1 : req.body.parcelas;
  if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > 48) {
    return dadosInvalidos(res, { parcelas: 'Informe um número inteiro entre 1 e 48.' });
  }
  const valores = dividirEmCentavos(dados.valor, parcelas);
  if (valores.some((valor) => valor <= 0)) {
    return dadosInvalidos(res, { parcelas: 'O valor não pode gerar parcelas menores que R$ 0,01.' });
  }

  const grupoId = parcelas > 1 ? Lancamento.gerarGrupoId() : null;
  const lancamentos = await Lancamento.criar(usuarioId, dados, valores, grupoId);
  if (lancamentos?.vinculoAusente) return res.status(404).json({ erro: lancamentos.vinculoAusente });
  if (lancamentos?.campos) return dadosInvalidos(res, lancamentos.campos);
  if (parcelas === 1) return res.status(201).json(lancamentos[0]);
  return res.status(201).json({ grupoParcelamento: grupoId, lancamentos });
}

async function atualizar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;
  const id = validarId(req.params.id);
  if (!id) return dadosInvalidos(res, { id: 'Informe um ID inteiro positivo.' });
  const atual = await Lancamento.buscarDadosEdicao(id, usuarioId);
  if (!atual) return res.status(404).json({ erro: 'Lançamento não encontrado.' });

  const { dados, campos } = validarLancamento(req.body);
  if (Object.keys(campos).length) return dadosInvalidos(res, campos);
  if (atual.grupo_parcelamento) {
    const camposImutaveis = {};
    if (dados.tipo !== atual.tipo) camposImutaveis.tipo = 'Preserve o tipo da compra parcelada.';
    if (dados.data !== atual.data) camposImutaveis.data = 'Preserve a data da compra parcelada.';
    if (dados.fonteDestinoId !== atual.fonte_destino_id) {
      const fonte = await FonteDestino.buscarPorId(dados.fonteDestinoId, usuarioId);
      if (!fonte) return res.status(404).json({ erro: 'Fonte ou destino não encontrado.' });
      camposImutaveis.fonteDestinoId = 'Preserve o cartão da compra parcelada.';
    }
    if (req.body.parcelas !== undefined || req.body.parcela_atual !== undefined
      || req.body.total_parcelas !== undefined || req.body.grupo_parcelamento !== undefined) {
      camposImutaveis.parcelas = 'A edição não altera o parcelamento.';
    }
    if (Object.keys(camposImutaveis).length) return dadosInvalidos(res, camposImutaveis);
  }
  const lancamento = await Lancamento.atualizar(id, usuarioId, dados, atual);
  if (lancamento?.vinculoAusente) return res.status(404).json({ erro: lancamento.vinculoAusente });
  if (lancamento?.campos) return dadosInvalidos(res, lancamento.campos);
  if (!lancamento) return res.status(404).json({ erro: 'Lançamento não encontrado.' });
  return res.status(200).json(lancamento);
}

async function excluir(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;
  const id = validarId(req.params.id);
  if (!id) return dadosInvalidos(res, { id: 'Informe um ID inteiro positivo.' });
  if (req.query.todasParcelas !== undefined && !['true', 'false'].includes(req.query.todasParcelas)) {
    return dadosInvalidos(res, { todasParcelas: 'Use true ou false.' });
  }
  const excluido = await Lancamento.excluir(id, usuarioId, req.query.todasParcelas === 'true');
  if (!excluido) return res.status(404).json({ erro: 'Lançamento não encontrado.' });
  return res.status(204).end();
}

function validarLancamento(corpoRecebido) {
  const campos = {};
  const corpo = corpoRecebido && typeof corpoRecebido === 'object' && !Array.isArray(corpoRecebido)
    ? corpoRecebido
    : {};
  const tipo = corpo.tipo;
  const descricao = typeof corpo.descricao === 'string' ? corpo.descricao.trim() : '';
  const data = corpo.data;
  const categoriaId = validarId(corpo.categoriaId);
  const fonteDestinoId = validarId(corpo.fonteDestinoId);
  const valor = corpo.valor;

  if (!tiposLancamento.includes(tipo)) campos.tipo = 'Use entrada ou saida.';
  if (!descricao) campos.descricao = 'Informe uma descrição.';
  else if (descricao.length > 120) campos.descricao = 'Use no máximo 120 caracteres.';
  if (!valorMonetarioValido(valor)) {
    campos.valor = 'Informe um valor entre R$ 0,01 e R$ 9.999.999.999,99 com até duas casas decimais.';
  }
  if (!dataIsoValida(data)) campos.data = 'Informe uma data válida no formato AAAA-MM-DD.';
  if (!categoriaId) campos.categoriaId = 'Informe um ID inteiro positivo.';
  if (!fonteDestinoId) campos.fonteDestinoId = 'Informe um ID inteiro positivo.';
  return { dados: { tipo, descricao, valor, data, categoriaId, fonteDestinoId }, campos };
}

function validarId(valor) {
  if (typeof valor !== 'string' && typeof valor !== 'number') return undefined;
  if (!/^\d+$/.test(String(valor))) return undefined;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function obterUsuarioId(req, res) {
  const id = req.auth?.id;
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(401).json({ erro: 'Usuário não autenticado.' });
    return undefined;
  }
  return id;
}

function dadosInvalidos(res, campos) {
  return res.status(400).json({ erro: 'Dados inválidos.', campos });
}

module.exports = router;

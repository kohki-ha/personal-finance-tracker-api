const express = require('express');
const FonteDestino = require('../models/FonteDestino');

const router = express.Router();
const tiposPermitidos = ['renda', 'conta', 'cartao_credito'];

router.get('/', listar);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);

async function listar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;

  const { tipo } = req.query;
  if (tipo !== undefined && !tiposPermitidos.includes(tipo)) {
    return dadosInvalidos(res, { tipo: 'Use renda, conta ou cartao_credito.' });
  }

  const fontesDestinos = await FonteDestino.listar(usuarioId, tipo);
  return res.status(200).json(fontesDestinos);
}

async function criar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;

  const { dados, campos } = validarFonteDestino(req.body);
  if (Object.keys(campos).length > 0) return dadosInvalidos(res, campos);

  try {
    const fonteDestino = await FonteDestino.criar(usuarioId, dados);
    return res.status(201).json(fonteDestino);
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe uma fonte ou destino com esse nome.' });
    }
    throw erro;
  }
}

async function atualizar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;
  const id = validarId(req.params.id);
  if (!id) return dadosInvalidos(res, { id: 'Informe um ID inteiro positivo.' });

  const { dados, campos } = validarFonteDestino(req.body);
  if (Object.keys(campos).length > 0) return dadosInvalidos(res, campos);

  try {
    const fonteDestino = await FonteDestino.atualizar(id, usuarioId, dados);
    if (!fonteDestino) return res.status(404).json({ erro: 'Fonte ou destino não encontrado.' });
    return res.status(200).json(fonteDestino);
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe uma fonte ou destino com esse nome.' });
    }
    throw erro;
  }
}

async function excluir(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;
  const id = validarId(req.params.id);
  if (!id) return dadosInvalidos(res, { id: 'Informe um ID inteiro positivo.' });

  try {
    const excluida = await FonteDestino.excluir(id, usuarioId);
    if (!excluida) return res.status(404).json({ erro: 'Fonte ou destino não encontrado.' });
    return res.status(204).end();
  } catch (erro) {
    if (erro.code === 'ER_ROW_IS_REFERENCED_2' || erro.code === 'ER_ROW_IS_REFERENCED_3') {
      return res.status(409).json({
        erro: 'Não é possível excluir uma fonte ou destino vinculada a um lançamento.',
      });
    }
    throw erro;
  }
}

function validarFonteDestino(corpoRecebido) {
  const campos = {};
  const corpo = corpoRecebido && typeof corpoRecebido === 'object' && !Array.isArray(corpoRecebido)
    ? corpoRecebido
    : {};
  const nome = typeof corpo.nome === 'string' ? corpo.nome.trim() : '';
  const tipo = corpo.tipo;

  if (!nome) campos.nome = 'Informe um nome.';
  else if (nome.length > 60) campos.nome = 'Use no máximo 60 caracteres.';
  if (!tiposPermitidos.includes(tipo)) {
    campos.tipo = 'Use renda, conta ou cartao_credito.';
  }

  let diaFechamento = null;
  let diaVencimento = null;
  let limite = null;

  if (tipo === 'cartao_credito') {
    diaFechamento = corpo.dia_fechamento;
    diaVencimento = corpo.dia_vencimento;
    limite = corpo.limite;

    if (!Number.isInteger(diaFechamento) || diaFechamento < 1 || diaFechamento > 31) {
      campos.dia_fechamento = 'Informe um dia inteiro entre 1 e 31.';
    }
    if (!Number.isInteger(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
      campos.dia_vencimento = 'Informe um dia inteiro entre 1 e 31.';
    }
    if (typeof limite !== 'number' || !Number.isFinite(limite) || limite <= 0) {
      campos.limite = 'Informe um limite numérico maior que zero.';
    }
  }

  return {
    dados: { nome, tipo, diaFechamento, diaVencimento, limite },
    campos,
  };
}

function validarId(valor) {
  if (!/^\d+$/.test(valor)) return undefined;
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

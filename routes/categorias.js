const express = require('express');
const Categoria = require('../models/Categoria');

const router = express.Router();

router.get('/', listar);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);

async function listar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;

  const { tipo } = req.query;
  if (tipo !== undefined && !['entrada', 'saida'].includes(tipo)) {
    return dadosInvalidos(res, { tipo: 'Use entrada ou saida.' });
  }

  const categorias = await Categoria.listar(usuarioId, tipo);
  return res.status(200).json(categorias);
}

async function criar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;

  const { nome, tipo, campos } = validarCategoria(req.body);
  if (Object.keys(campos).length > 0) return dadosInvalidos(res, campos);

  try {
    const categoria = await Categoria.criar(usuarioId, { nome, tipo });
    return res.status(201).json(categoria);
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe uma categoria com esse nome e tipo.' });
    }
    throw erro;
  }
}

async function atualizar(req, res) {
  const usuarioId = obterUsuarioId(req, res);
  if (!usuarioId) return;
  const id = validarId(req.params.id);
  if (!id) return dadosInvalidos(res, { id: 'Informe um ID inteiro positivo.' });

  const { nome, tipo, campos } = validarCategoria(req.body);
  if (Object.keys(campos).length > 0) return dadosInvalidos(res, campos);

  try {
    const categoria = await Categoria.atualizar(id, usuarioId, { nome, tipo });
    if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });
    return res.status(200).json(categoria);
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe uma categoria com esse nome e tipo.' });
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
    const excluida = await Categoria.excluir(id, usuarioId);
    if (!excluida) return res.status(404).json({ erro: 'Categoria não encontrada.' });
    return res.status(204).end();
  } catch (erro) {
    if (erro.code === 'ER_ROW_IS_REFERENCED_2' || erro.code === 'ER_ROW_IS_REFERENCED_3') {
      return res.status(409).json({
        erro: 'Não é possível excluir uma categoria vinculada a um lançamento.',
      });
    }
    throw erro;
  }
}

function validarCategoria(dados) {
  const campos = {};
  const corpo = dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : {};
  const nome = typeof corpo.nome === 'string' ? corpo.nome.trim() : '';
  const tipo = corpo.tipo;

  if (!nome) campos.nome = 'Informe um nome.';
  else if (nome.length > 60) campos.nome = 'Use no máximo 60 caracteres.';
  if (!['entrada', 'saida'].includes(tipo)) campos.tipo = 'Use entrada ou saida.';

  return { nome, tipo, campos };
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

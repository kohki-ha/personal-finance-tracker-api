const express = require('express');
const Relatorio = require('../models/Relatorio');
const { dataIsoValida, calcularPeriodoAnterior } = require('../utils/data');

const router = express.Router();

router.get('/categorias', async (req, res) => {
  const filtros = validarFiltros(req, res);
  if (!filtros) return;
  const { usuarioId, periodo } = filtros;
  const periodoAnterior = calcularPeriodoAnterior(periodo);
  return res.status(200).json(await Relatorio.porCategoria(usuarioId, periodo, periodoAnterior));
});

router.get('/fontes-destinos', async (req, res) => {
  const filtros = validarFiltros(req, res);
  if (!filtros) return;
  const { usuarioId, periodo } = filtros;
  return res.status(200).json(await Relatorio.porFonteDestino(usuarioId, periodo));
});

function validarFiltros(req, res) {
  const usuarioId = req.auth?.id;
  if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
    res.status(401).json({ erro: 'Usuário não autenticado.' });
    return undefined;
  }
  const { inicio, fim } = req.query;
  const campos = {};
  if (!dataIsoValida(inicio)) campos.inicio = 'Informe uma data válida no formato AAAA-MM-DD.';
  if (!dataIsoValida(fim)) campos.fim = 'Informe uma data válida no formato AAAA-MM-DD.';
  if (Object.keys(campos).length === 0 && inicio > fim) {
    campos.fim = 'A data final deve ser igual ou posterior à inicial.';
  }
  if (Object.keys(campos).length > 0) {
    res.status(400).json({ erro: 'Dados inválidos.', campos });
    return undefined;
  }
  return { usuarioId, periodo: { inicio, fim } };
}

module.exports = router;

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

router.get('/faturas', async (req, res) => {
  const usuarioId = identificarUsuario(req, res);
  if (!usuarioId) return;
  const { meses = '3' } = req.query;
  if (typeof meses !== 'string' || /\D/.test(meses) || Number(meses) < 1 || Number(meses) > 12) {
    return res.status(400).json({
      erro: 'Dados inválidos.',
      campos: { meses: 'Informe um número inteiro entre 1 e 12.' },
    });
  }

  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return res.status(200).json(await Relatorio.porFatura(usuarioId, `${ano}-${mes}-${dia}`, Number(meses)));
});

function identificarUsuario(req, res) {
  const usuarioId = req.auth?.id;
  if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
    res.status(401).json({ erro: 'Usuário não autenticado.' });
    return undefined;
  }
  return usuarioId;
}

function validarFiltros(req, res) {
  const usuarioId = identificarUsuario(req, res);
  if (!usuarioId) return undefined;
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

const express = require('express');
const Relatorio = require('../models/Relatorio');
const { dataLocal } = require('../utils/data');

const router = express.Router();

router.get('/', async (req, res) => {
  const usuarioId = req.auth?.id;
  if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }
  return res.status(200).json(await Relatorio.porSaudeFinanceira(usuarioId, dataLocal()));
});

module.exports = router;

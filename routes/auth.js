const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const protegerRota = require('../middleware/auth');
const { cpfValido } = require('../utils/cpf');

const router = express.Router();
const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const formatoCpf = /^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;
const camposDuplicados = {
  uq_usuarios_email: 'email',
  uq_usuarios_cpf: 'cpf',
};

function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function dadosInvalidos(res, campos) {
  return res.status(400).json({ erro: 'Dados inválidos.', campos });
}

router.post('/cadastro', async (req, res) => {
  const corpo = req.body || {};
  const nome = typeof corpo.nome === 'string' ? corpo.nome.trim() : '';
  const email = normalizarEmail(corpo.email);
  const cpfInformado = typeof corpo.cpf === 'string' ? corpo.cpf.trim() : '';
  const cpf = cpfInformado.replace(/\D/g, '');
  const { senha } = corpo;
  const campos = {};

  if (!nome || nome.length > 120) {
    campos.nome = 'Informe um nome com até 120 caracteres.';
  }
  if (!formatoEmail.test(email) || email.length > 160) {
    campos.email = 'Informe um e-mail válido com até 160 caracteres.';
  }
  if (!formatoCpf.test(cpfInformado) || !cpfValido(cpf)) {
    campos.cpf = 'Informe um CPF válido.';
  }
  if (typeof senha !== 'string' || senha.length < 8
    || !/\p{L}/u.test(senha) || !/\d/.test(senha) || Buffer.byteLength(senha) > 72) {
    campos.senha = 'Use pelo menos 8 caracteres, incluindo uma letra e um número, e até 72 bytes.';
  }
  if (Object.keys(campos).length > 0) return dadosInvalidos(res, campos);

  const senhaHash = await bcrypt.hash(senha, 10);
  try {
    const usuario = await Usuario.cadastrar({ nome, email, cpf, senhaHash });
    return res.status(201).json(usuario);
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      const chave = erro.sqlMessage?.match(/for key ['`](?:[^'`]*\.)?(uq_usuarios_email|uq_usuarios_cpf)['`]/)?.[1];
      const campo = camposDuplicados[chave];
      if (campo) {
        return res.status(409).json({
          erro: 'Usuário já cadastrado.',
          campos: { [campo]: campo === 'email' ? 'E-mail já cadastrado.' : 'CPF já cadastrado.' },
        });
      }
    }
    throw erro;
  }
});

router.post('/login', async (req, res) => {
  const { email: emailInformado, senha } = req.body || {};
  const email = normalizarEmail(emailInformado);
  const campos = {};

  if (!formatoEmail.test(email) || email.length > 160) campos.email = 'Informe um e-mail válido.';
  if (typeof senha !== 'string' || !senha || Buffer.byteLength(senha) > 72) {
    campos.senha = 'Informe uma senha de até 72 bytes.';
  }
  if (Object.keys(campos).length > 0) return dadosInvalidos(res, campos);

  const registro = await Usuario.buscarPorEmail(email);
  if (!registro || !(await bcrypt.compare(senha, registro.senha_hash))) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  const usuario = { id: registro.id, nome: registro.nome, email: registro.email };
  const token = jwt.sign(usuario, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

  return res.status(200).json({ token, usuario });
});

router.get('/me', protegerRota, async (req, res) => {
  const id = req.auth?.id;
  const usuario = Number.isInteger(id) && id > 0 ? await Usuario.buscarPorId(id) : undefined;
  if (!usuario) return res.status(401).json({ erro: 'Usuário não autenticado.' });
  return res.status(200).json(usuario);
});

module.exports = router;

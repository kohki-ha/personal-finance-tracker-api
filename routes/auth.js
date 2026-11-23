const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const protegerRota = require('../middleware/auth');
const { validarCadastro, validarLogin } = require('../utils/validarAutenticacao');

const router = express.Router();

router.post('/cadastro', cadastrar);
router.post('/login', fazerLogin);
router.get('/me', protegerRota, consultarPerfil);

async function cadastrar(req, res) {
  const { nome, email, cpf, senha, campos } = validarCadastro(req.body);
  if (Object.keys(campos).length > 0) return dadosInvalidos(res, campos);

  const senhaHash = await bcrypt.hash(senha, 10);
  try {
    const usuario = await Usuario.cadastrar({ nome, email, cpf, senhaHash });
    return res.status(201).json(usuario);
  } catch (erro) {
    const campo = Usuario.identificarCampoDuplicado(erro);
    if (!campo) throw erro;

    return res.status(409).json({
      erro: 'Usuário já cadastrado.',
      campos: { [campo]: campo === 'email' ? 'E-mail já cadastrado.' : 'CPF já cadastrado.' },
    });
  }
}

async function fazerLogin(req, res) {
  const { email, senha, campos } = validarLogin(req.body);
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
}

async function consultarPerfil(req, res) {
  const id = req.auth?.id;
  const usuario = Number.isInteger(id) && id > 0
    ? await Usuario.buscarPorId(id)
    : undefined;
  if (!usuario) return res.status(401).json({ erro: 'Usuário não autenticado.' });
  return res.status(200).json(usuario);
}

function dadosInvalidos(res, campos) {
  return res.status(400).json({ erro: 'Dados inválidos.', campos });
}

module.exports = router;

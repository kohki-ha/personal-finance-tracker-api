const { cpfValido } = require('./cpf');

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const formatoCpf = /^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

function validarCadastro(corpo) {
  const dados = corpo || {};
  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const email = normalizarEmail(dados.email);
  const cpfInformado = typeof dados.cpf === 'string' ? dados.cpf.trim() : '';
  const cpf = cpfInformado.replace(/\D/g, '');
  const { senha } = dados;
  const campos = {};

  if (!nome || nome.length > 120) {
    campos.nome = 'Informe um nome com até 120 caracteres.';
  }
  if (!emailValido(email)) {
    campos.email = 'Informe um e-mail válido com até 160 caracteres.';
  }
  if (!formatoCpf.test(cpfInformado) || !cpfValido(cpf)) {
    campos.cpf = 'Informe um CPF válido.';
  }
  if (!senhaAceitaPeloBcrypt(senha) || [...senha].length < 8
    || !/\p{L}/u.test(senha) || !/\d/.test(senha)) {
    campos.senha = 'Use pelo menos 8 caracteres, incluindo uma letra e um número, e até 72 bytes.';
  }

  return { nome, email, cpf, senha, campos };
}

function validarLogin(corpo) {
  const { email: emailInformado, senha } = corpo || {};
  const email = normalizarEmail(emailInformado);
  const campos = {};

  if (!emailValido(email)) campos.email = 'Informe um e-mail válido.';
  if (!senhaAceitaPeloBcrypt(senha)) {
    campos.senha = 'Informe uma senha de até 72 bytes.';
  }

  return { email, senha, campos };
}

function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function emailValido(email) {
  return email.length <= 160 && formatoEmail.test(email);
}

function senhaAceitaPeloBcrypt(senha) {
  return typeof senha === 'string' && senha.length > 0 && Buffer.byteLength(senha) <= 72;
}

module.exports = { validarCadastro, validarLogin };

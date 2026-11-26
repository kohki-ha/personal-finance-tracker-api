function valorMonetarioValido(valor) {
  return typeof valor === 'number' && Number.isFinite(valor)
    && valor >= 0.01 && valor <= 9999999999.99
    && Math.round(valor * 100) / 100 === valor;
}

module.exports = { valorMonetarioValido };

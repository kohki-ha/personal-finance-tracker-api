function dividirEmCentavos(valor, quantidade) {
  const centavos = Math.round(valor * 100);
  const base = Math.floor(centavos / quantidade);
  const resto = centavos % quantidade;
  return Array.from({ length: quantidade }, (_, indice) => (base + (indice === 0 ? resto : 0)) / 100);
}

module.exports = { dividirEmCentavos };

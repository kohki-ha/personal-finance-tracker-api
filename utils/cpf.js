function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;

  function digitoVerificador(tamanho) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  }

  return digitoVerificador(9) === Number(cpf[9])
    && digitoVerificador(10) === Number(cpf[10]);
}

module.exports = { cpfValido };

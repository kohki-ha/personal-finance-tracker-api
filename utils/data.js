function dataIsoValida(valor) {
  if (typeof valor !== 'string') return false;

  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!partes) return false;

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  if (ano < 1000 || ano > 9999 || mes < 1 || mes > 12) return false;

  const bissexto = ano % 400 === 0 || (ano % 4 === 0 && ano % 100 !== 0);
  const diasPorMes = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dia >= 1 && dia <= diasPorMes[mes - 1];
}

function periodoDoMesAtual(hoje = new Date()) {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const mesFormatado = String(mes).padStart(2, '0');

  return {
    inicio: `${ano}-${mesFormatado}-01`,
    fim: `${ano}-${mesFormatado}-${String(ultimoDia).padStart(2, '0')}`,
  };
}

module.exports = { dataIsoValida, periodoDoMesAtual };

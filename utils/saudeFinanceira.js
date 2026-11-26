const { calcularFatura } = require('./faturas');

const toCentavos = (valor) => Math.round(Number(valor) * 100);
const razao = (valor, base) => base > 0 ? Number((valor / base).toFixed(4)) : null;

function mesesDaAnalise(hoje) {
  const [ano, mes] = hoje.split('-').map(Number);
  const referencia = (deslocamento) =>
    new Date(Date.UTC(ano, mes - 1 + deslocamento, 1)).toISOString().split('T')[0].slice(0, 7);
  return {
    historico: [-3, -2, -1].map(referencia),
    futuros: [1, 2, 3].map(referencia),
  };
}

function analisarSaudeFinanceira(hoje, linhas, cartoes) {
  const { historico, futuros } = mesesDaAnalise(hoje);
  const porMes = new Map(linhas.map((linha) => [linha.mes, linha]));
  const atual = porMes.get(hoje.slice(0, 7));
  const entradasAtuais = toCentavos(atual?.entradas ?? 0);
  const taxaPoupanca = razao(entradasAtuais - toCentavos(atual?.saidas ?? 0), entradasAtuais);

  const primeiroMes = historico.findIndex((mes) => porMes.has(mes));
  const mesesComHistorico = primeiroMes < 0 ? [] : historico.slice(primeiroMes);
  const media = (campo) => mesesComHistorico.length === 0 ? 0 : Math.round(
    mesesComHistorico.reduce((soma, mes) => soma + toCentavos(porMes.get(mes)?.[campo] ?? 0), 0)
      / mesesComHistorico.length,
  );
  const renda = media('entradas');
  const gastosAVista = media('saidas_avista');
  const parcelasPorMes = new Map(futuros.map((mes) => [mes, 0]));
  let totalFaturas = 0;
  let parcelasFuturas = 0;
  for (const { cartao, lancamentos } of cartoes) {
    for (const lancamento of lancamentos) {
      const { referencia, vencimento } = calcularFatura(lancamento.data, cartao, lancamento.parcela_atual);
      const valor = toCentavos(lancamento.valor);
      const naProjecao = parcelasPorMes.has(referencia);
      if (naProjecao) totalFaturas += valor;
      if (lancamento.total_parcelas > 1 && vencimento >= hoje) {
        parcelasFuturas += valor;
        if (naProjecao) parcelasPorMes.set(referencia, parcelasPorMes.get(referencia) + valor);
      }
    }
  }

  const comprometimentoCartoes = razao(totalFaturas, renda * futuros.length);
  const projecao = futuros.map((mes) => {
    const saidas = gastosAVista + parcelasPorMes.get(mes);
    return { mes, entradas: renda / 100, saidas: saidas / 100, saldoPrevisto: (renda - saidas) / 100 };
  });
  const dicas = [];
  if (mesesComHistorico.length === 0) dicas.push('Histórico insuficiente para estimar receitas e gastos à vista.');
  if (taxaPoupanca < 0) dicas.push('Neste mês, as saídas superaram as entradas.');
  if (renda > 0 && totalFaturas * 10 >= renda * futuros.length * 3) {
    dicas.push('As faturas previstas representam pelo menos 30% da renda estimada para os próximos três meses.');
  }
  const primeiroNegativo = projecao.find(({ saldoPrevisto }) => saldoPrevisto < 0);
  if (primeiroNegativo) dicas.push(`Saldo previsto negativo em ${primeiroNegativo.mes}. Confira os gastos e as parcelas desse mês.`);
  else if (mesesComHistorico.length > 0) dicas.push('Todos os saldos mensais projetados são iguais ou superiores a zero.');

  return {
    aviso: 'Informações educativas. Não constituem recomendação financeira profissional.',
    indicadores: { taxaPoupanca, comprometimentoCartoes, parcelasFuturas: parcelasFuturas / 100 },
    projecao,
    dicas,
  };
}

module.exports = { mesesDaAnalise, analisarSaudeFinanceira };

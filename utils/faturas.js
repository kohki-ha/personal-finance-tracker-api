function ultimoDia(ano, mes) {
  return new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
}

function dataDoCiclo(ano, mes, dia) {
  const data = new Date(Date.UTC(ano, mes, Math.min(dia, ultimoDia(ano, mes))));
  return data.toISOString().split('T')[0];
}

function calcularFatura(dataCompra, cartao, parcela = 1) {
  const [ano, mes, dia] = dataCompra.split('-').map(Number);
  const mesCompra = mes - 1;
  const diaFechamento = Math.min(cartao.dia_fechamento, ultimoDia(ano, mesCompra));
  const mesFechamento = mesCompra + (dia >= diaFechamento ? 1 : 0) + parcela - 1;
  const mesVencimento = mesFechamento + (cartao.dia_vencimento > cartao.dia_fechamento ? 0 : 1);
  const fechamento = dataDoCiclo(ano, mesFechamento, cartao.dia_fechamento);
  const vencimento = dataDoCiclo(ano, mesVencimento, cartao.dia_vencimento);
  return { referencia: vencimento.slice(0, 7), fechamento, vencimento };
}

function preverFaturas(cartao, lancamentos, hoje, meses) {
  const faturas = new Map();
  for (let ciclo = 1; ciclo <= meses + 1; ciclo += 1) {
    const datas = calcularFatura(hoje, cartao, ciclo);
    faturas.set(datas.referencia, { ...datas, lancamentos: [], centavos: 0 });
  }

  let utilizado = 0;
  for (const lancamento of lancamentos) {
    const ciclo = calcularFatura(lancamento.data, cartao, lancamento.parcela_atual);
    const centavos = Math.round(Number(lancamento.valor) * 100);
    if (ciclo.vencimento >= hoje) utilizado += centavos;

    const fatura = faturas.get(ciclo.referencia);
    if (fatura) {
      fatura.centavos += centavos;
      fatura.lancamentos.push({
        id: lancamento.id,
        descricao: lancamento.descricao,
        data: lancamento.data,
        valor: centavos / 100,
        parcela: `${lancamento.parcela_atual}/${lancamento.total_parcelas}`,
      });
    }
  }

  const limite = Math.round(Number(cartao.limite) * 100);
  const [faturaAberta, ...faturasFuturas] = Array.from(
    faturas.values(),
    ({ centavos, ...fatura }) => ({ ...fatura, total: centavos / 100 }),
  );
  return {
    id: cartao.id,
    nome: cartao.nome,
    limiteTotal: limite / 100,
    limiteUtilizado: utilizado / 100,
    limiteDisponivel: (limite - utilizado) / 100,
    faturaAberta,
    faturasFuturas,
  };
}

module.exports = { calcularFatura, preverFaturas };

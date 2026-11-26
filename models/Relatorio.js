const pool = require('../database/connection');

class Relatorio {
  async porCategoria(usuarioId, periodo, periodoAnterior) {
    const [linhas] = await pool.execute(
      `SELECT c.id, c.nome, l.tipo,
              SUM(CASE WHEN l.data >= ? THEN l.valor ELSE 0 END) AS total,
              SUM(CASE WHEN l.data < ? THEN l.valor ELSE 0 END) AS anterior
       FROM lancamentos l
       JOIN categorias c ON c.id = l.categoria_id AND c.usuario_id = l.usuario_id
       WHERE l.usuario_id = ? AND l.data BETWEEN ? AND ?
       GROUP BY c.id, c.nome, l.tipo
       ORDER BY total DESC, c.id ASC`,
      [periodo.inicio, periodo.inicio, usuarioId,
        periodoAnterior.inicio < '1000-01-01' ? '1000-01-01' : periodoAnterior.inicio, periodo.fim],
    );
    return {
      periodo,
      periodoAnterior,
      saidas: resumirCategorias(linhas, 'saida'),
      entradas: resumirCategorias(linhas, 'entrada'),
    };
  }

  async porFonteDestino(usuarioId, periodo) {
    const [linhas] = await pool.execute(
      `SELECT f.id, f.nome, f.tipo,
              SUM(CASE WHEN l.tipo = 'entrada' THEN l.valor ELSE 0 END) AS entradas,
              SUM(CASE WHEN l.tipo = 'saida' THEN l.valor ELSE 0 END) AS saidas
       FROM lancamentos l
       JOIN fontes_destinos f ON f.id = l.fonte_destino_id AND f.usuario_id = l.usuario_id
       WHERE l.usuario_id = ? AND l.data BETWEEN ? AND ?
       GROUP BY f.id, f.nome, f.tipo
       ORDER BY f.id`,
      [usuarioId, periodo.inicio, periodo.fim],
    );
    const fontesDestinos = linhas.map(({ id, nome, tipo, entradas, saidas }) => {
      const fonte = { id, nome, tipo, entradas: Number(entradas), saidas: Number(saidas) };
      if (tipo === 'conta') fonte.saldo = arredondar(fonte.entradas - fonte.saidas);
      return fonte;
    });
    return { periodo, fontesDestinos };
  }
}

function resumirCategorias(linhas, tipo) {
  const categorias = linhas.filter((linha) => linha.tipo === tipo).map(({ id, nome, total, anterior }) => ({
    id, nome, total: Number(total), anterior: Number(anterior),
  }));
  const total = arredondar(categorias.reduce((soma, categoria) => soma + categoria.total, 0));
  return {
    total,
    categorias: categorias.map((categoria) => ({
      ...categoria,
      percentual: total === 0 ? 0 : arredondar(categoria.total / total * 100),
      variacao: categoria.anterior === 0 ? null
        : arredondar((categoria.total - categoria.anterior) / categoria.anterior * 100),
    })),
  };
}

function arredondar(valor) {
  return Number(valor.toFixed(2));
}

module.exports = new Relatorio();

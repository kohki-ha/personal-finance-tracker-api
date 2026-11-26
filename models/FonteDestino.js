const pool = require('../database/connection');
const emTransacao = require('../database/transacao');

class FonteDestino {
  async listar(usuarioId, tipo) {
    const filtroTipo = tipo ? ' AND tipo = ?' : '';
    const parametros = tipo ? [usuarioId, tipo] : [usuarioId];
    const [fontesDestinos] = await pool.execute(
      `SELECT id, nome, tipo, dia_fechamento, dia_vencimento, limite
       FROM fontes_destinos WHERE usuario_id = ?${filtroTipo} ORDER BY id`,
      parametros,
    );
    return fontesDestinos.map(formatarFonte);
  }

  async buscarPorId(id, usuarioId, conexao = pool) {
    const [fontesDestinos] = await conexao.execute(
      `SELECT id, nome, tipo, dia_fechamento, dia_vencimento, limite
       FROM fontes_destinos WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId],
    );
    return fontesDestinos[0] && formatarFonte(fontesDestinos[0]);
  }

  async criar(usuarioId, { nome, tipo, diaFechamento, diaVencimento, limite }) {
    const [resultado] = await pool.execute(
      `INSERT INTO fontes_destinos
       (usuario_id, nome, tipo, dia_fechamento, dia_vencimento, limite)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioId, nome, tipo, diaFechamento, diaVencimento, limite],
    );
    return this.buscarPorId(resultado.insertId, usuarioId);
  }

  async atualizar(id, usuarioId, { nome, tipo, diaFechamento, diaVencimento, limite }) {
    return emTransacao(async (conexao) => {
      const [[atual]] = await conexao.execute(
        'SELECT tipo FROM fontes_destinos WHERE id = ? AND usuario_id = ? FOR UPDATE',
        [id, usuarioId],
      );
      if (!atual) return undefined;
      if ((atual.tipo === 'cartao_credito') !== (tipo === 'cartao_credito')) {
        const [[vinculo]] = await conexao.execute(
          `SELECT id FROM lancamentos WHERE fonte_destino_id = ? AND usuario_id = ? AND tipo = 'saida' LIMIT 1`,
          [id, usuarioId],
        );
        if (vinculo) return { conflito: true };
      }
      await conexao.execute(
        `UPDATE fontes_destinos
         SET nome = ?, tipo = ?, dia_fechamento = ?, dia_vencimento = ?, limite = ?
         WHERE id = ? AND usuario_id = ?`,
        [nome, tipo, diaFechamento, diaVencimento, limite, id, usuarioId],
      );
      return this.buscarPorId(id, usuarioId, conexao);
    });
  }

  async excluir(id, usuarioId) {
    const [resultado] = await pool.execute(
      'DELETE FROM fontes_destinos WHERE id = ? AND usuario_id = ?',
      [id, usuarioId],
    );
    return resultado.affectedRows > 0;
  }
}

function formatarFonte(fonte) {
  return { ...fonte, limite: fonte.limite === null ? null : Number(fonte.limite) };
}

module.exports = new FonteDestino();

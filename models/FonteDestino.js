const pool = require('../database/connection');

class FonteDestino {
  async listar(usuarioId, tipo) {
    const filtroTipo = tipo ? ' AND tipo = ?' : '';
    const parametros = tipo ? [usuarioId, tipo] : [usuarioId];
    const [fontesDestinos] = await pool.execute(
      `SELECT id, nome, tipo, dia_fechamento, dia_vencimento, limite
       FROM fontes_destinos WHERE usuario_id = ?${filtroTipo} ORDER BY id`,
      parametros,
    );
    return fontesDestinos;
  }

  async buscarPorId(id, usuarioId) {
    const [fontesDestinos] = await pool.execute(
      `SELECT id, nome, tipo, dia_fechamento, dia_vencimento, limite
       FROM fontes_destinos WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId],
    );
    return fontesDestinos[0];
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
    await pool.execute(
      `UPDATE fontes_destinos
       SET nome = ?, tipo = ?, dia_fechamento = ?, dia_vencimento = ?, limite = ?
       WHERE id = ? AND usuario_id = ?`,
      [nome, tipo, diaFechamento, diaVencimento, limite, id, usuarioId],
    );
    return this.buscarPorId(id, usuarioId);
  }

  async excluir(id, usuarioId) {
    const [resultado] = await pool.execute(
      'DELETE FROM fontes_destinos WHERE id = ? AND usuario_id = ?',
      [id, usuarioId],
    );
    return resultado.affectedRows > 0;
  }
}

module.exports = new FonteDestino();

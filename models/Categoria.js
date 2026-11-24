const pool = require('../database/connection');

class Categoria {
  async listar(usuarioId, tipo) {
    const filtroTipo = tipo ? ' AND tipo = ?' : '';
    const parametros = tipo ? [usuarioId, tipo] : [usuarioId];
    const [categorias] = await pool.execute(
      `SELECT id, nome, tipo FROM categorias WHERE usuario_id = ?${filtroTipo} ORDER BY id`,
      parametros,
    );
    return categorias;
  }

  async buscarPorId(id, usuarioId) {
    const [categorias] = await pool.execute(
      'SELECT id, nome, tipo FROM categorias WHERE id = ? AND usuario_id = ?',
      [id, usuarioId],
    );
    return categorias[0];
  }

  async criar(usuarioId, { nome, tipo }) {
    const [resultado] = await pool.execute(
      'INSERT INTO categorias (usuario_id, nome, tipo) VALUES (?, ?, ?)',
      [usuarioId, nome, tipo],
    );
    return this.buscarPorId(resultado.insertId, usuarioId);
  }

  async atualizar(id, usuarioId, { nome, tipo }) {
    await pool.execute(
      'UPDATE categorias SET nome = ?, tipo = ? WHERE id = ? AND usuario_id = ?',
      [nome, tipo, id, usuarioId],
    );
    return this.buscarPorId(id, usuarioId);
  }

  async excluir(id, usuarioId) {
    const [resultado] = await pool.execute(
      'DELETE FROM categorias WHERE id = ? AND usuario_id = ?',
      [id, usuarioId],
    );
    return resultado.affectedRows > 0;
  }
}

module.exports = new Categoria();

const pool = require('../database/connection');
const emTransacao = require('../database/transacao');

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

  async buscarPorId(id, usuarioId, conexao = pool) {
    const [categorias] = await conexao.execute(
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
    return emTransacao(async (conexao) => {
      const [[atual]] = await conexao.execute(
        'SELECT tipo FROM categorias WHERE id = ? AND usuario_id = ? FOR UPDATE',
        [id, usuarioId],
      );
      if (!atual) return undefined;
      if (atual.tipo !== tipo) {
        const [[vinculo]] = await conexao.execute(
          `SELECT id FROM lancamentos WHERE categoria_id = ? AND usuario_id = ? AND tipo <> ? LIMIT 1`,
          [id, usuarioId, tipo],
        );
        if (vinculo) return { conflito: true };
      }
      await conexao.execute(
        'UPDATE categorias SET nome = ?, tipo = ? WHERE id = ? AND usuario_id = ?',
        [nome, tipo, id, usuarioId],
      );
      return this.buscarPorId(id, usuarioId, conexao);
    });
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

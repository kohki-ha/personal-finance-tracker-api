const crypto = require('node:crypto');
const pool = require('../database/connection');

const CAMPOS_FILTRO = `l.usuario_id = ? AND l.data BETWEEN ? AND ?`;

class Lancamento {
  gerarGrupoId() {
    return crypto.randomUUID();
  }

  async listar(usuarioId, filtros) {
    const where = this.montarWhere(usuarioId, filtros);
    const [itens] = await pool.execute(
      `SELECT l.id, l.tipo, l.descricao, l.valor, l.data, l.parcela_atual,
              l.total_parcelas, l.grupo_parcelamento,
              c.id AS categoria_id, c.nome AS categoria_nome,
              f.id AS fonte_destino_id, f.nome AS fonte_destino_nome
       FROM lancamentos l
       JOIN categorias c ON c.id = l.categoria_id AND c.usuario_id = l.usuario_id
       JOIN fontes_destinos f ON f.id = l.fonte_destino_id AND f.usuario_id = l.usuario_id
       WHERE ${where.sql}
       ORDER BY l.data DESC, l.id DESC LIMIT ? OFFSET ?`,
      [...where.parametros, filtros.porPagina, (filtros.pagina - 1) * filtros.porPagina],
    );
    return itens.map(formatarLancamento);
  }

  async contar(usuarioId, filtros) {
    const where = this.montarWhere(usuarioId, filtros);
    const [[resultado]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM lancamentos l WHERE ${where.sql}`,
      where.parametros,
    );
    return resultado.total;
  }

  async resumir(usuarioId, filtros) {
    const where = this.montarWhere(usuarioId, filtros);
    const [[resultado]] = await pool.execute(
      `SELECT COALESCE(SUM(CASE WHEN l.tipo = 'entrada' THEN l.valor ELSE 0 END), 0) AS entradas,
              COALESCE(SUM(CASE WHEN l.tipo = 'saida' THEN l.valor ELSE 0 END), 0) AS saidas
       FROM lancamentos l WHERE ${where.sql}`,
      where.parametros,
    );
    const entradas = Number(resultado.entradas);
    const saidas = Number(resultado.saidas);
    return { entradas, saidas, saldo: Number((entradas - saidas).toFixed(2)) };
  }

  async buscarPorId(id, usuarioId) {
    const [itens] = await pool.execute(
      `SELECT l.id, l.tipo, l.descricao, l.valor, l.data, l.parcela_atual,
              l.total_parcelas, l.grupo_parcelamento,
              c.id AS categoria_id, c.nome AS categoria_nome,
              f.id AS fonte_destino_id, f.nome AS fonte_destino_nome
       FROM lancamentos l
       JOIN categorias c ON c.id = l.categoria_id AND c.usuario_id = l.usuario_id
       JOIN fontes_destinos f ON f.id = l.fonte_destino_id AND f.usuario_id = l.usuario_id
       WHERE l.id = ? AND l.usuario_id = ?`,
      [id, usuarioId],
    );
    return itens[0] ? formatarLancamento(itens[0]) : undefined;
  }

  async buscarDadosEdicao(id, usuarioId) {
    const [itens] = await pool.execute(
      `SELECT tipo, data, fonte_destino_id, grupo_parcelamento
       FROM lancamentos WHERE id = ? AND usuario_id = ?`,
      [id, usuarioId],
    );
    return itens[0];
  }

  async criar(usuarioId, dados, valores, grupoId = null) {
    const conexao = await pool.getConnection();
    try {
      await conexao.beginTransaction();
      const ids = [];
      for (let indice = 0; indice < valores.length; indice += 1) {
        const [resultado] = await conexao.execute(
          `INSERT INTO lancamentos
           (usuario_id, tipo, descricao, valor, data, categoria_id, fonte_destino_id,
            parcela_atual, total_parcelas, grupo_parcelamento)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [usuarioId, dados.tipo, dados.descricao, valores[indice], dados.data,
            dados.categoriaId, dados.fonteDestinoId, indice + 1, valores.length, grupoId],
        );
        ids.push(resultado.insertId);
      }
      await conexao.commit();
      return Promise.all(ids.map((id) => this.buscarPorId(id, usuarioId)));
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async atualizar(id, usuarioId, dados, atual) {
    const parcelado = Boolean(atual.grupo_parcelamento);
    const tipo = parcelado ? atual.tipo : dados.tipo;
    const data = parcelado ? atual.data : dados.data;
    const fonteDestinoId = parcelado ? atual.fonte_destino_id : dados.fonteDestinoId;
    const [resultado] = await pool.execute(
      `UPDATE lancamentos
       SET tipo = ?, descricao = ?, valor = ?, data = ?, categoria_id = ?, fonte_destino_id = ?
       WHERE id = ? AND usuario_id = ?`,
      [tipo, dados.descricao, dados.valor, data, dados.categoriaId, fonteDestinoId, id, usuarioId],
    );
    if (!resultado.affectedRows) return undefined;
    return this.buscarPorId(id, usuarioId);
  }

  async excluir(id, usuarioId, todasParcelas) {
    const conexao = await pool.getConnection();
    try {
      await conexao.beginTransaction();
      const [linhas] = await conexao.execute(
        'SELECT id, grupo_parcelamento, parcela_atual FROM lancamentos WHERE id = ? AND usuario_id = ? FOR UPDATE',
        [id, usuarioId],
      );
      if (!linhas[0]) {
        await conexao.rollback();
        return false;
      }
      const lancamento = linhas[0];
      if (todasParcelas && lancamento.grupo_parcelamento) {
        await conexao.execute(
          `DELETE FROM lancamentos
           WHERE usuario_id = ? AND grupo_parcelamento = ? AND parcela_atual >= ?`,
          [usuarioId, lancamento.grupo_parcelamento, lancamento.parcela_atual],
        );
      } else {
        await conexao.execute('DELETE FROM lancamentos WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
      }
      await conexao.commit();
      return true;
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  montarWhere(usuarioId, filtros) {
    const condicoes = [CAMPOS_FILTRO];
    const parametros = [usuarioId, filtros.inicio, filtros.fim];
    if (filtros.tipo) { condicoes.push('l.tipo = ?'); parametros.push(filtros.tipo); }
    if (filtros.categoriaId) { condicoes.push('l.categoria_id = ?'); parametros.push(filtros.categoriaId); }
    if (filtros.fonteDestinoId) { condicoes.push('l.fonte_destino_id = ?'); parametros.push(filtros.fonteDestinoId); }
    return { sql: condicoes.join(' AND '), parametros };
  }
}

function formatarLancamento(linha) {
  return {
    id: linha.id,
    tipo: linha.tipo,
    descricao: linha.descricao,
    valor: Number(linha.valor),
    data: linha.data,
    categoria: { id: linha.categoria_id, nome: linha.categoria_nome },
    fonteDestino: { id: linha.fonte_destino_id, nome: linha.fonte_destino_nome },
    parcela: linha.total_parcelas > 1 ? `${linha.parcela_atual}/${linha.total_parcelas}` : null,
  };
}

module.exports = new Lancamento();

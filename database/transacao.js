const pool = require('./connection');

async function emTransacao(executar) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const resultado = await executar(conexao);
    await conexao.commit();
    return resultado;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = emTransacao;

const pool = require('../database/connection');

const categoriasPadrao = [
  ['Salário', 'entrada'],
  ['Outras entradas', 'entrada'],
  ['Alimentação', 'saida'],
  ['Moradia', 'saida'],
  ['Saúde', 'saida'],
  ['Mobilidade', 'saida'],
  ['Lazer', 'saida'],
  ['Educação', 'saida'],
  ['Outras saídas', 'saida'],
];

async function cadastrar({ nome, email, cpf, senhaHash }) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [resultado] = await conexao.execute(
      'INSERT INTO usuarios (nome, email, cpf, senha_hash) VALUES (?, ?, ?, ?)',
      [nome, email, cpf, senhaHash],
    );
    const id = resultado.insertId;

    await conexao.query(
      'INSERT INTO categorias (usuario_id, nome, tipo) VALUES ?',
      [categoriasPadrao.map(([categoria, tipo]) => [id, categoria, tipo])],
    );
    await conexao.execute(
      'INSERT INTO fontes_destinos (usuario_id, nome, tipo) VALUES (?, ?, ?)',
      [id, 'Conta corrente', 'conta'],
    );

    await conexao.commit();
    return { id, nome, email };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = { cadastrar };

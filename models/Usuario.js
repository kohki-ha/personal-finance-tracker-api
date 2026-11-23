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

const camposDuplicados = {
  uq_usuarios_email: 'email',
  uq_usuarios_cpf: 'cpf',
};

class Usuario {
  async cadastrar({ nome, email, cpf, senhaHash }) {
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

  async buscarPorEmail(email) {
    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?',
      [email],
    );
    return usuarios[0];
  }

  async buscarPorId(id) {
    const [usuarios] = await pool.execute(
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      [id],
    );
    return usuarios[0];
  }

  identificarCampoDuplicado(erro) {
    if (erro.code !== 'ER_DUP_ENTRY') return undefined;

    const chave = erro.sqlMessage?.match(/['`]([\w.]+)['`]$/)?.[1];
    const restricao = chave?.split('.').pop();
    return Object.hasOwn(camposDuplicados, restricao) ? camposDuplicados[restricao] : undefined;
  }
}

module.exports = new Usuario();

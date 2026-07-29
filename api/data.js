// GET  /api/data                -> devolve dados públicos pra visitantes; dados completos só se for admin de verdade
// POST /api/data { chave, valor, acao, detalhes }  -> grava uma coleção (exige sessão de admin) e registra log
const { getDB, saveDB, registrarLog, ehAdmin } = require('../lib/db');
const { validarSessao } = require('../lib/session');

// Coleções que qualquer visitante pode ler (necessário pra loja e os rankings funcionarem sem login)
const COLECOES_PUBLICAS_LEITURA = ['produtos', 'categorias', 'cupons', 'config_loja', 'kills', 'doadores'];
// Coleções só de admin (leitura e escrita)
const COLECOES_ADMIN = ['pedidos', 'admins', 'logs', 'config_loja', 'produtos', 'categorias', 'cupons'];

module.exports = async function handler(req, res) {
  try {
    const data = await getDB();

    if (req.method === 'GET') {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const discordId = validarSessao(token);
      const isAdmin = discordId ? await ehAdmin(data, discordId) : false;

      if (isAdmin) {
        // admin confirmado de verdade (não só "tem sessão"): recebe tudo, inclusive pedidos/logs/admins
        return res.status(200).json(data);
      }
      // qualquer outra pessoa (visitante ou jogador comum logado): só o necessário pra loja/rankings/perfil
      const publico = {};
      COLECOES_PUBLICAS_LEITURA.forEach(function(c) { publico[c] = data[c]; });
      return res.status(200).json(publico);
    }

    if (req.method === 'POST') {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const discordId = validarSessao(token);
      if (!discordId) return res.status(401).json({ error: 'sessão inválida, faça login novamente' });
      const isAdmin = await ehAdmin(data, discordId);
      if (!isAdmin) return res.status(403).json({ error: 'apenas admins podem salvar dados' });

      const { chave, valor, acao, detalhes, quem_nome } = req.body;
      if (COLECOES_ADMIN.indexOf(chave) === -1) return res.status(400).json({ error: 'coleção inválida' });

      data[chave] = valor;
      if (acao) registrarLog(data, discordId, quem_nome, acao, detalhes);
      await saveDB(data);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro interno' });
  }
};

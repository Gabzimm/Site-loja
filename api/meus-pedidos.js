// GET /api/meus-pedidos
// Devolve só os pedidos do jogador logado (identificado pela sessão), com os itens
// de cada compra — usado no perfil.html. Nunca devolve pedidos de outras pessoas.
const { getDB } = require('../lib/db');
const { validarSessao } = require('../lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const discordId = validarSessao(token);
  if (!discordId) return res.status(401).json({ error: 'faça login novamente' });

  try {
    const data = await getDB();
    const meusPedidos = data.pedidos
      .filter(function(p) { return p.discord_id === discordId; })
      .sort(function(a, b) { return new Date(b.data) - new Date(a.data); });
    return res.status(200).json({ pedidos: meusPedidos });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro interno' });
  }
};

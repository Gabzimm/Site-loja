// GET /api/kills-data
// Endpoint público (somente leitura) usado pelo site (perfil.html, rankings.html)
// pra mostrar kills/mortes de jogadores e clãs, e pra saber quais clãs
// ainda existem de verdade (o bot reescreve essa lista a cada 1 minuto).

const { getDB } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  try {
    const data = await getDB();
    const kills = data.kills || { jogadores: [], clans: [], atualizado_em: null };
    return res.status(200).json(kills);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro interno' });
  }
};

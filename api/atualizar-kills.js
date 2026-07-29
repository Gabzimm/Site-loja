// POST /api/atualizar-kills
// Chamado pelo BOT (não por navegador), a cada 1 minuto, com o total ATUAL
// (não incremento) de kills/mortes de cada jogador e de cada clã.
// Protegido por uma senha própria do bot (não é sessão de admin do site).
//
// Body esperado:
// {
//   "jogadores": [ { "discord_id": "123", "nome": "Fulano", "kills": 342, "mortes": 120, "clan": "Fênix" } ],
//   "clans": [ { "nome": "Fênix", "kills": 900, "mortes": 400, "membros": 5 } ]
// }
const { getDB, saveDB } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const segredoRecebido = req.headers['x-sync-secret'];
  if (!segredoRecebido || segredoRecebido !== process.env.KILLS_SYNC_SECRET) {
    return res.status(401).json({ error: 'segredo inválido' });
  }

  try {
    const { jogadores, clans } = req.body;
    if (!Array.isArray(jogadores) || !Array.isArray(clans)) {
      return res.status(400).json({ error: 'formato inválido: jogadores e clans precisam ser listas' });
    }

    const data = await getDB();
    data.kills = {
      jogadores: jogadores, // substitui o total inteiro (não soma) — o bot já manda o valor certo
      clans: clans,
      atualizado_em: new Date().toISOString()
    };
    await saveDB(data);

    return res.status(200).json({ ok: true, jogadores: jogadores.length, clans: clans.length });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro interno' });
  }
};

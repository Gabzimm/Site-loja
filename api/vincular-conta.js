// POST /api/vincular-conta { acao: 'vincular'|'desvincular', discord_id, uuid, nick }
//   -> chamado pelo plugin Java (DiscordVinculador) quando alguém vincula/desvincula
// GET  /api/vincular-conta
//   -> chamado pelo bot Python (kills_sync) pra saber uuid <-> discord_id de todo mundo
// Os dois exigem o header x-sync-secret (mesma senha usada em /api/atualizar-kills).
const { getDB, saveDB } = require('../lib/db');

module.exports = async function handler(req, res) {
  const segredoRecebido = req.headers['x-sync-secret'];
  if (segredoRecebido !== process.env.KILLS_SYNC_SECRET) {
    return res.status(401).json({ error: 'não autorizado' });
  }

  try {
    if (req.method === 'GET') {
      const data = await getDB();
      return res.status(200).json(data.vinculos);
    }

    if (req.method === 'POST') {
      const { acao, discord_id, uuid, nick } = req.body;
      if (!discord_id) return res.status(400).json({ error: 'discord_id obrigatório' });

      const data = await getDB();

      if (acao === 'desvincular') {
        delete data.vinculos[discord_id];
      } else {
        // 'vincular' (padrão) — upsert
        data.vinculos[discord_id] = {
          uuid: uuid,
          nick: nick,
          vinculado_em: new Date().toISOString()
        };
      }

      await saveDB(data);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro interno' });
  }
};

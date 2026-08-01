// GET  /api/vip-clan-solicitacoes           -> devolve as solicitações pendentes
// POST /api/vip-clan-solicitacoes { id, status, mensagem } -> bot reporta o resultado
// Protegido pelo mesmo x-sync-secret usado em /api/atualizar-kills.
const { getDB, saveDB } = require('../lib/db');

module.exports = async function handler(req, res) {
  const segredoRecebido = req.headers['x-sync-secret'];
  if (segredoRecebido !== process.env.KILLS_SYNC_SECRET) {
    return res.status(401).json({ error: 'não autorizado' });
  }

  try {
    if (req.method === 'GET') {
      const data = await getDB();
      const pendentes = data.solicitacoes_vip_clan.filter(function(s) { return s.status === 'pendente'; });
      return res.status(200).json(pendentes);
    }

    if (req.method === 'POST') {
      const { id, status, mensagem } = req.body;
      if (!id || !status) return res.status(400).json({ error: 'id e status obrigatórios' });

      const data = await getDB();
      const solicitacao = data.solicitacoes_vip_clan.find(function(s) { return s.id === id; });
      if (!solicitacao) return res.status(404).json({ error: 'solicitação não encontrada' });

      solicitacao.status = status; // 'aplicado' | 'token_invalido' | 'erro'
      solicitacao.mensagem = mensagem || null;
      solicitacao.processado_em = new Date().toISOString();

      await saveDB(data);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro interno' });
  }
};

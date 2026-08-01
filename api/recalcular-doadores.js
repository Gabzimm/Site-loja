// POST /api/recalcular-doadores
// Só admin. Reconstrói a lista de doadores do zero, a partir de TODOS os
// pedidos já confirmados — corrige o histórico de antes do atualizarDoador existir.
const { getDB, saveDB } = require('../lib/db');
const { validarSessao } = require('../lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const discordId = validarSessao(token);
  if (!discordId) return res.status(401).json({ error: 'sessão inválida' });

  try {
    const data = await getDB();
    if (data.admins.indexOf(discordId) === -1) return res.status(403).json({ error: 'só admin' });

    const doadoresPorId = {};
    data.pedidos.filter(function(p) { return p.status === 'confirmado'; }).forEach(function(p) {
      if (!p.discord_id) return;
      if (!doadoresPorId[p.discord_id]) {
        doadoresPorId[p.discord_id] = { discord_id: p.discord_id, nome: p.cliente, total: 0 };
      }
      doadoresPorId[p.discord_id].nome = p.cliente || doadoresPorId[p.discord_id].nome;
      doadoresPorId[p.discord_id].total += Number(p.valor || 0);
    });

    data.doadores = Object.values(doadoresPorId);
    await saveDB(data);

    return res.status(200).json({ ok: true, doadores: data.doadores.length });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro interno' });
  }
};

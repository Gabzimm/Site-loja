// GET /api/cotacao?valor=123.45
// Devolve o valor em EUR pra mostrar na tela quando a pessoa clica em "MBY".
const { converterBRLparaEUR } = require('./_cambio');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });
  const valor = parseFloat(req.query.valor);
  if (!valor || valor <= 0) return res.status(400).json({ error: 'valor inválido' });
  const { valorEUR, taxa } = await converterBRLparaEUR(valor);
  return res.status(200).json({ valorEUR: valorEUR, taxa: taxa });
};

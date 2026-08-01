// POST /api/stripe-webhook
// Precisa do corpo cru (raw body) pra validar a assinatura, por isso desligamos
// o bodyParser padrão da Vercel aqui embaixo.
const crypto = require('crypto');
const { getDB, saveDB, notificarDiscord, atualizarDoador, criarSolicitacoesVipClan } = require('../lib/db');
const { processarVipsDoPedido } = require('../lib/discord');

module.exports.config = { api: { bodyParser: false } };

function lerCorpoCru(req) {
  return new Promise(function(resolve, reject) {
    let dados = '';
    req.on('data', function(chunk) { dados += chunk; });
    req.on('end', function() { resolve(dados); });
    req.on('error', reject);
  });
}

function validarAssinatura(corpoCru, header, secret) {
  const partes = header.split(',').reduce(function(acc, p) {
    const [k, v] = p.split('=');
    acc[k] = v;
    return acc;
  }, {});
  const payload = partes.t + '.' + corpoCru;
  const esperado = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return esperado === partes.v1;
}

module.exports = async function handler(req, res) {
  try {
    const corpoCru = await lerCorpoCru(req);
    const assinaturaValida = validarAssinatura(
      corpoCru,
      req.headers['stripe-signature'] || '',
      process.env.STRIPE_WEBHOOK_SECRET
    );
    if (!assinaturaValida) return res.status(400).json({ error: 'assinatura inválida' });

    const evento = JSON.parse(corpoCru);
    if (evento.type !== 'checkout.session.completed') return res.status(200).json({ ok: true });

    const session = evento.data.object;
    const pedidoId = session.client_reference_id;

    const data = await getDB();
    const pedido = data.pedidos.find(function(p) { return String(p.id) === String(pedidoId); });
    if (!pedido || pedido.status === 'confirmado') return res.status(200).json({ ok: true });

    pedido.status = 'confirmado';
    // pedido.pagamento já foi definido como "MBY" em create-payment.js
    pedido.gateway = 'stripe';
    pedido.transacao_id = session.payment_intent;

    if (pedido.cupom) {
      const c = data.cupons.find(function(x) { return x.codigo === pedido.cupom; });
      if (c) c.usos++;
    }

    atualizarDoador(data, pedido.discord_id, pedido.cliente, pedido.valor); // usa o valor em BRL, mesma base dos outros métodos
    criarSolicitacoesVipClan(data, pedido, data.produtos);

    await saveDB(data);

    await processarVipsDoPedido(pedido, data.produtos); // dá o cargo VIP e manda a DM, se for o caso

    await notificarDiscord('✅ Pagamento confirmado (Stripe)', [
      ['Pedido', '#' + pedido.id],
      ['Cliente', pedido.cliente],
      ['Valor', 'R$ ' + Number(pedido.valor).toFixed(2)],
      ['Discord ID', pedido.discord_id]
    ]);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'erro ao processar webhook' });
  }
};

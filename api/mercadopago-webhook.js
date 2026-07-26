// POST /api/mercadopago-webhook
// O Mercado Pago chama essa URL sozinho quando o status de um pagamento muda.
const { getDB, saveDB, notificarDiscord } = require('./_db');

const NOMES_METODO = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito'
};

module.exports = async function handler(req, res) {
  try {
    const paymentId = (req.query && req.query['data.id']) || (req.body && req.body.data && req.body.data.id);
    if (!paymentId) return res.status(200).json({ ok: true }); // MP manda outros tipos de evento também, ignora

    const pagResp = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
      headers: { Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN }
    });
    if (!pagResp.ok) return res.status(200).json({ ok: true });
    const pagamento = await pagResp.json();

    if (pagamento.status !== 'approved') return res.status(200).json({ ok: true });

    const data = await getDB();
    const pedido = data.pedidos.find(function(p) { return String(p.id) === String(pagamento.external_reference); });
    if (!pedido || pedido.status === 'confirmado') return res.status(200).json({ ok: true });

    pedido.status = 'confirmado';
    // pedido.pagamento já foi preenchido em create-payment.js (PIX/Cartão de Crédito/Débito) na hora do checkout
    pedido.gateway = 'mercadopago';
    pedido.transacao_id = String(pagamento.id);

    if (pedido.cupom) {
      const c = data.cupons.find(function(x) { return x.codigo === pedido.cupom; });
      if (c) c.usos++;
    }

    await saveDB(data);

    await notificarDiscord('✅ Pagamento confirmado', [
      ['Pedido', '#' + pedido.id],
      ['Cliente', pedido.cliente],
      ['Valor', 'R$ ' + Number(pedido.valor).toFixed(2)],
      ['Método', pedido.pagamento],
      ['Discord ID', pedido.discord_id]
    ]);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: true }); // sempre 200 pro MP não ficar retentando indefinidamente
  }
};

// POST /api/create-payment
// body: { discord_id, nome, itens: [{nome, preco, quantidade}], cupom, gateway }
// gateway: 'mercadopago' (Pix + Cartão Crédito/Débito) ou 'stripe' (cartão internacional)
// Cria o pedido como "pendente_pagamento" no banco e devolve a URL de checkout.
const { getDB, saveDB } = require('../lib/db');
const { converterBRLparaEUR } = require('../lib/cambio');

// Mapeia a opção que a pessoa vê e clica -> gateway real
const MAPA_METODOS = {
  mercadopago: { gateway: 'mercadopago', nomeExibicao: null }, // a própria página do MP mostra Pix/Crédito/Débito/Boleto/etc
  mby: { gateway: 'stripe', nomeExibicao: 'MBY' }
};

function gerarId(data) {
  const ids = data.pedidos.map(function(p) { return p.id; });
  return ids.length ? Math.max.apply(null, ids) + 1 : 1;
}

function calcularTotal(itens, cupom, cupons) {
  const subtotal = itens.reduce(function(t, i) { return t + i.preco * i.quantidade; }, 0);
  if (!cupom) return subtotal;
  const c = cupons.find(function(x) { return x.codigo === cupom && x.ativo && x.usos < x.limite; });
  if (!c) return subtotal;
  const desconto = c.tipo === 'porcentagem' ? subtotal * (c.valor / 100) : Math.min(c.valor, subtotal);
  return Math.max(0, subtotal - desconto);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  try {
    const { discord_id, nome, itens, cupom, metodo, tokenClan } = req.body; // metodo: 'mercadopago' | 'mby'
    if (!discord_id || !itens || !itens.length) return res.status(400).json({ error: 'dados incompletos' });
    const info = MAPA_METODOS[metodo];
    if (!info) return res.status(400).json({ error: 'método de pagamento inválido' });

    const data = await getDB();
    const total = calcularTotal(itens, cupom, data.cupons);
    const pedidoId = gerarId(data);

    const pedido = {
      id: pedidoId,
      discord_id: discord_id,
      cliente: nome,
      itens: itens,
      valor: total,
      cupom: cupom || null,
      tokenClan: tokenClan || null,
      data: new Date().toISOString(),
      status: 'pendente_pagamento',
      pagamento: info.gateway === 'mercadopago' ? null : info.nomeExibicao, // no MP só sabemos o método de verdade depois do webhook
      gateway: info.gateway,
      transacao_id: null
    };
    data.pedidos.push(pedido);
    await saveDB(data);

    const SITE_URL = process.env.SITE_URL; // ex: https://reycraft-hc.shop

    if (info.gateway === 'mercadopago') {
      // Não restringe mais o tipo de pagamento — deixa o próprio Mercado Pago mostrar a tela
      // completa dele (Pix, Cartões, Boleto, PicPay, Saldo, etc.), sem exigir login,
      // igual acontece em outras lojas (Blaze, por exemplo).
      const prefResp = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN
        },
        body: JSON.stringify({
          items: itens.map(function(i) {
            return { title: i.nome, quantity: i.quantidade, unit_price: Number(i.preco), currency_id: 'BRL' };
          }),
          external_reference: String(pedidoId),
          back_urls: {
            success: SITE_URL + '/carrinho.html?status=sucesso',
            failure: SITE_URL + '/carrinho.html?status=falha',
            pending: SITE_URL + '/carrinho.html?status=pendente'
          },
          auto_return: 'approved',
          notification_url: SITE_URL + '/api/mercadopago-webhook'
        })
      });
      const pref = await prefResp.json();
      console.log(JSON.stringify({
        id: pref.id,
        collector_id: pref.collector_id,
        payment_methods: pref.payment_methods
      }, null, 2));
      if (!prefResp.ok) {
        console.error('Erro ao criar preferência MP:', JSON.stringify(pref));
        return res.status(500).json({ error: 'Não foi possível gerar o pagamento. Tente novamente.' });
      }
      return res.status(200).json({ tipo: 'redirect', url: pref.init_point });
    }

    if (info.gateway === 'stripe') {
      // MBY: converte o total de BRL pra EUR e cobra na Stripe em Euro
      const { valorEUR, taxa } = await converterBRLparaEUR(total);
      pedido.valor_eur = valorEUR;
      pedido.taxa_cambio = taxa;
      await saveDB(data);

      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('client_reference_id', String(pedidoId));
      params.append('success_url', SITE_URL + '/carrinho.html?status=sucesso');
      params.append('cancel_url', SITE_URL + '/carrinho.html?status=falha');
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][product_data][name]', 'Pedido #' + pedidoId + ' (MBY)');
      params.append('line_items[0][price_data][unit_amount]', Math.round(valorEUR * 100));
      params.append('line_items[0][quantity]', 1);

      const sessionResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY
        },
        body: params
      });
      const session = await sessionResp.json();
      return res.status(200).json({ tipo: 'redirect', url: session.url });
    }

    return res.status(400).json({ error: 'gateway inválido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro ao criar pagamento' });
  }
};

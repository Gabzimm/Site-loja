// ========================================================
// db.js — helper interno usado pelas outras funções da /api
// NÃO é uma rota pública. Concentra o único ponto do projeto
// que conhece o token do Upstash Redis.
//
// Trocamos do JSONBin pro Upstash Redis porque o plano grátis do
// JSONBin não aguenta o volume de requisições do bot (sincroniza a
// cada 1 minuto = mais de 1.400 chamadas/dia só nisso).
// ========================================================

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const CHAVE = 'reycraft_db'; // uma chave só, guardando o JSON inteiro (mesmo formato de antes)

async function redisComando(comando) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + REDIS_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(comando)
  });
  if (!r.ok) throw new Error('Falha no Redis: ' + r.status);
  const json = await r.json();
  if (json.error) throw new Error('Erro do Redis: ' + json.error);
  return json.result;
}

async function getDB() {
  const bruto = await redisComando(['GET', CHAVE]);
  const data = bruto ? JSON.parse(bruto) : {};
  // Garante que todas as coleções existem, mesmo em banco novo/vazio
  data.produtos = data.produtos || [];
  data.categorias = data.categorias || [];
  data.cupons = data.cupons || [];
  data.pedidos = data.pedidos || [];
  data.admins = (data.admins && data.admins.length > 0) ? data.admins : ['1213819385576300595'];
  data.config_loja = data.config_loja || {};
  data.logs = data.logs || [];
  data.kills = data.kills || { jogadores: [], clans: [], atualizado_em: null };
  data.doadores = data.doadores || [];
  data.vinculos = data.vinculos || {}; // { discord_id: { uuid, nick, vinculado_em } }
  data.solicitacoes_vip_clan = data.solicitacoes_vip_clan || []; // fila que o bot processa (aumentar limite do clã)
  return data;
}

async function saveDB(data) {
  await redisComando(['SET', CHAVE, JSON.stringify(data)]);
  return true;
}

// Adiciona uma entrada no log de auditoria (quem fez o quê, quando)
function registrarLog(data, quemId, quemNome, acao, detalhes) {
  data.logs.unshift({
    quem_id: quemId,
    quem_nome: quemNome || quemId,
    acao: acao,
    detalhes: detalhes || '',
    data: new Date().toISOString()
  });
  if (data.logs.length > 500) data.logs = data.logs.slice(0, 500);
}

// Envia mensagem pro webhook do Discord (agora só roda no servidor)
async function notificarDiscord(titulo, campos) {
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!WEBHOOK_URL) return;
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: titulo,
        fields: campos.map(function(c) { return { name: c[0], value: String(c[1]) }; }),
        color: 0x10B981
      }]
    })
  });
}

// Valida se um Discord ID é admin, consultando o próprio banco
async function ehAdmin(data, discordId) {
  return data.admins.indexOf(discordId) !== -1;
}

// Atualiza o placar público de "quem gastou quanto"
function atualizarDoador(data, discordId, nome, valorConfirmado) {
  var doador = data.doadores.find(function(d) { return d.discord_id === discordId; });
  if (!doador) {
    doador = { discord_id: discordId, nome: nome, total: 0 };
    data.doadores.push(doador);
  }
  doador.nome = nome || doador.nome;
  doador.total += Number(valorConfirmado || 0);
}

// Verifica os itens de um pedido confirmado: se algum for VIP de Clã, cria uma
// "solicitação" pra fila que o bot Python vai buscar e processar.
function criarSolicitacoesVipClan(data, pedido, produtos) {
  if (!pedido.itens || !pedido.itens.length) return;

  pedido.itens.forEach(function(item) {
    if (!item.id) return;
    const produto = produtos.find(function(p) { return p.id === item.id; });
    if (!produto || !produto.ehVipClan) return;

    data.solicitacoes_vip_clan.push({
      id: (data.solicitacoes_vip_clan.length ? Math.max.apply(null, data.solicitacoes_vip_clan.map(function(s) { return s.id; })) : 0) + 1,
      pedido_id: pedido.id,
      discord_id: pedido.discord_id,
      cliente: pedido.cliente,
      token_clan: (pedido.tokenClan || '').toUpperCase(),
      limite_adicional: produto.vipClanLimiteAdicional || 0,
      vip_vinculado_id: produto.vipClanVinculadoId || null,
      produto_nome: produto.nome,
      status: 'pendente',
      criado_em: new Date().toISOString(),
      processado_em: null,
      mensagem: null
    });
  });
}

module.exports = { getDB, saveDB, registrarLog, notificarDiscord, ehAdmin, atualizarDoador, criarSolicitacoesVipClan };

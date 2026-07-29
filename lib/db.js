// ========================================================
// _db.js — helper interno usado pelas outras funções da /api
// NÃO é uma rota pública. Concentra o único ponto do projeto
// que conhece a Master Key do JSONBin.
// ========================================================

const JSONBIN_URL = process.env.JSONBIN_URL; // ex: https://api.jsonbin.io/v3/b/xxxxxxxx
const JSONBIN_KEY = process.env.JSONBIN_KEY; // X-Master-Key, só existe no servidor agora

async function getDB() {
  const r = await fetch(JSONBIN_URL + '/latest', {
    headers: { 'X-Master-Key': JSONBIN_KEY }
  });
  if (!r.ok) throw new Error('Falha ao ler JSONBin: ' + r.status);
  const json = await r.json();
  const data = json.record || {};
  // Garante que todas as coleções existem, mesmo em bin novo/vazio
  data.produtos = data.produtos || [];
  data.categorias = data.categorias || [];
  data.cupons = data.cupons || [];
  data.pedidos = data.pedidos || [];
  data.admins = data.admins || ['1213819385576300595'];
  data.config_loja = data.config_loja || {};
  data.logs = data.logs || [];
  data.kills = data.kills || { jogadores: [], clans: [], atualizado_em: null };
  data.doadores = data.doadores || [];
  return data;
}

async function saveDB(data) {
  const r = await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY
    },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Falha ao salvar JSONBin: ' + r.status);
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
  // mantém só os últimos 500 registros pra não crescer infinito
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

// Atualiza o placar público de "quem gastou quanto" — usado nos rankings (TOP Donaters)
// e no mini-perfil público. Não expõe pedido nenhum, só o total acumulado.
function atualizarDoador(data, discordId, nome, valorConfirmado) {
  var doador = data.doadores.find(function(d) { return d.discord_id === discordId; });
  if (!doador) {
    doador = { discord_id: discordId, nome: nome, total: 0 };
    data.doadores.push(doador);
  }
  doador.nome = nome || doador.nome; // mantém sempre o nome mais recente
  doador.total += Number(valorConfirmado || 0);
}

module.exports = { getDB, saveDB, registrarLog, notificarDiscord, ehAdmin, atualizarDoador };

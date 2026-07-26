// ========================================================
// db.js — agora fala só com /api/data (nosso backend).
// Nenhuma chave secreta existe mais nesse arquivo.
// ========================================================

function tokenAdmin() {
  return localStorage.getItem('admin_sessao') || '';
}

// Busca os dados do backend e atualiza o localStorage (cache local pra renderizar rápido)
function sincronizarLocalStorage() {
  var headers = {};
  if (tokenAdmin()) headers['Authorization'] = 'Bearer ' + tokenAdmin();
  return fetch('/api/data', { headers: headers })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      Object.keys(data).forEach(function(chave) {
        localStorage.setItem(chave, JSON.stringify(data[chave]));
      });
      return data;
    })
    .catch(function(e) { console.error('Erro ao sincronizar:', e); });
}

// Salva UMA coleção (produtos, categorias, cupons, pedidos, admins) no backend.
// acao/detalhes são opcionais — quando enviados, viram uma entrada no log de auditoria.
function enviarParaBin(chave, valor, acao, detalhes) {
  if (!tokenAdmin()) return Promise.resolve(); // sem sessão de admin, não escreve
  var usuario = JSON.parse(localStorage.getItem('usuario_discord') || 'null');
  return fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + tokenAdmin()
    },
    body: JSON.stringify({
      chave: chave,
      valor: valor,
      acao: acao,
      detalhes: detalhes,
      quem_nome: usuario ? (usuario.global_name || usuario.username) : null
    })
  }).then(function(r) {
    if (r.status === 401) {
      alert('Sua sessão expirou, faça login novamente.');
      localStorage.removeItem('admin_sessao');
      window.location.href = 'login.html';
    }
    return r.json();
  });
}

// Descobre o clã do usuário via backend (sem expor bot token)
function buscarClan(discordId) {
  return fetch('/api/clan-lookup?discord_id=' + encodeURIComponent(discordId))
    .then(function(r) { return r.json(); })
    .then(function(d) { return d.clan; })
    .catch(function() { return 'Sem Clã'; });
}

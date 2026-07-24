// ========== CONFIGURAÇÃO DO WEBHOOK ==========
var WEBHOOK_URL = 'https://discord.com/api/webhooks/1529978977433944075/qXWlHM-KXy_tDonaHfWAHEJ5j8AONfQ0gkjJCYWzLCH8vAzNqVSD9jtyE9rOsRv_PJ36';

// ========== ENVIAR REGISTRO DE COMPRA ==========
function enviarRegistroCompra(dados) {
    var embed = {
        title: "REGISTRAR_COMPRA",
        fields: [
            { name: "discord_id", value: dados.discord_id },
            { name: "valor", value: dados.valor.toString() },
            { name: "produto", value: dados.produto },
            { name: "nome", value: dados.nome },
            { name: "clan", value: dados.clan || "Sem Clan" },
            { name: "pagamento", value: dados.pagamento || "N/A" },
            { name: "cupom", value: dados.cupom || "Nenhum" }
        ]
    };
    
    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    }).then(function(r) {
        if (!r.ok) throw new Error('Erro no webhook');
        return r.json();
    });
}

// ========== CONFIRMAR PEDIDO ==========
function enviarConfirmacaoPedido(discord_id, pedido_id) {
    var embed = {
        title: "CONFIRMAR_PEDIDO",
        fields: [
            { name: "discord_id", value: discord_id },
            { name: "pedido_id", value: pedido_id.toString() }
        ]
    };
    
    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    }).then(function(r) { return r.ok; });
}

// ========== SOLICITAR DADOS DO USUÁRIO ==========
function solicitarDadosUsuario(discord_id) {
    var embed = {
        title: "SOLICITAR_DADOS",
        fields: [{ name: "discord_id", value: discord_id }]
    };
    
    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    }).then(function(r) { return r.ok; });
}

// ========== SOLICITAR RANKING ==========
function solicitarRanking(tipo) {
    var embed = {
        title: "SOLICITAR_RANKING",
        fields: [{ name: "tipo", value: tipo }]
    };
    
    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    }).then(function(r) { return r.ok; });
}

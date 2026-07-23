// ========== CONFIGURAÇÃO ==========
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1529978977433944075/qXWlHM-KXy_tDonaHfWAHEJ5j8AONfQ0gkjJCYWzLCH8vAzNqVSD9jtyE9rOsRv_PJ36';

// ========== FUNÇÕES PARA O SITE ==========
function enviarRegistroCompra(dados) {
    const embed = {
        title: "REGISTRAR_COMPRA",
        fields: [
            { name: "discord_id", value: dados.discord_id },
            { name: "valor", value: dados.valor.toString() },
            { name: "produto", value: dados.produto },
            { name: "nome", value: dados.nome },
            { name: "clan", value: dados.clan || "Sem Clan" }
        ]
    };
    
    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    }).then(r => r.ok);
}

function enviarConfirmacaoPedido(discord_id, pedido_id) {
    const embed = {
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
    }).then(r => r.ok);
}

function solicitarDadosUsuario(discord_id) {
    const embed = {
        title: "SOLICITAR_DADOS",
        fields: [
            { name: "discord_id", value: discord_id }
        ]
    };
    
    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    }).then(r => r.ok);
}

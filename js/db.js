// ========== BANCO DE DADOS CENTRALIZADO - JSONBin ==========
var JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6a63b1ddf5f4af5e29bcc812';
var JSONBIN_KEY = '$2a$10$DHEm2oWljLi.pnkhaPJXOey/Y1q8/OHsNPUZSquJ0OB8NhAeR6.Fa';
var dadosCache = null;

// Carregar todos os dados
function carregarDados() {
    return fetch(JSONBIN_URL + '/latest', {
        headers: { 'X-Master-Key': JSONBIN_KEY }
    })
    .then(function(r) { 
        if (!r.ok) throw new Error('Erro ao carregar');
        return r.json(); 
    })
    .then(function(data) { 
        dadosCache = data.record;
        return data.record; 
    });
}

// Salvar todos os dados
function salvarDados(dados) {
    dadosCache = dados;
    return fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_KEY 
        },
        body: JSON.stringify(dados)
    }).then(function(r) { return r.json(); });
}

// Sincronizar localStorage com a Bin
function sincronizarLocalStorage() {
    return carregarDados().then(function(dados) {
        if (dados.produtos) localStorage.setItem('produtos', JSON.stringify(dados.produtos));
        if (dados.categorias) localStorage.setItem('categorias', JSON.stringify(dados.categorias));
        if (dados.cupons) localStorage.setItem('cupons', JSON.stringify(dados.cupons));
        if (dados.pedidos) localStorage.setItem('pedidos', JSON.stringify(dados.pedidos));
        if (dados.admins) localStorage.setItem('admins', JSON.stringify(dados.admins));
        if (dados.config_loja) localStorage.setItem('config_loja', JSON.stringify(dados.config_loja));
        return dados;
    });
}

// Enviar localStorage para a Bin
function enviarParaBin() {
    var dados = {
        produtos: JSON.parse(localStorage.getItem('produtos') || '[]'),
        categorias: JSON.parse(localStorage.getItem('categorias') || '[]'),
        cupons: JSON.parse(localStorage.getItem('cupons') || '[]'),
        pedidos: JSON.parse(localStorage.getItem('pedidos') || '[]'),
        admins: JSON.parse(localStorage.getItem('admins') || '["1213819385576300595"]'),
        config_loja: JSON.parse(localStorage.getItem('config_loja') || '{}')
    };
    return salvarDados(dados);
}

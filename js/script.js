// ========== APLICAR CONFIGURAÇÕES SALVAS ==========
(function() {
    var config = JSON.parse(localStorage.getItem('config_loja'));
    
    if (config) {
        var root = document.documentElement;
        
        // Aplicar cores
        root.style.setProperty('--roxo', config.corRoxo);
        root.style.setProperty('--roxo-escuro', config.corRoxo + 'cc');
        root.style.setProperty('--roxo-claro', config.corRoxo + '99');
        root.style.setProperty('--verde', config.corVerde);
        root.style.setProperty('--verde-escuro', config.corVerde + 'cc');
        root.style.setProperty('--verde-claro', config.corVerde + '99');
        root.style.setProperty('--amarelo', config.corAmarelo);
        root.style.setProperty('--amarelo-escuro', config.corAmarelo + 'cc');
        root.style.setProperty('--amarelo-claro', config.corAmarelo + '99');
        
        // Aplicar favicon
        if (config.favicon) {
            var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/png';
            link.href = config.favicon;
            if (!document.querySelector("link[rel*='icon']")) {
                document.head.appendChild(link);
            }
        }
        
        // Aplicar imagem de fundo
        if (config.bgImagem) {
            var fundoDiv = document.getElementById('fundo-personalizado');
            if (!fundoDiv) {
                fundoDiv = document.createElement('div');
                fundoDiv.id = 'fundo-personalizado';
                document.body.insertBefore(fundoDiv, document.body.firstChild);
            }
            
            var opacidade = (config.bgOpacidade || 50) / 100;
            fundoDiv.style.backgroundImage = 'url(' + config.bgImagem + ')';
            fundoDiv.style.backgroundSize = config.bgModo || 'cover';
            fundoDiv.style.backgroundPosition = config.bgPosicao || 'center';
            fundoDiv.style.backgroundRepeat = config.bgModo === 'repeat' ? 'repeat' : 'no-repeat';
            fundoDiv.style.opacity = opacidade;
        }
    }
})();

// ========== PRODUTOS ==========
var produtos = JSON.parse(localStorage.getItem('produtos')) || [];

// ========== CARRINHO ==========
var carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContador();
}

function adicionarAoCarrinho(id) {
    var produto = produtos.find(function(p) { return p.id === id; });
    var itemNoCarrinho = carrinho.find(function(item) { return item.id === id; });
    
    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade++;
    } else {
        carrinho.push({ 
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            emoji: produto.emoji,
            quantidade: 1 
        });
    }
    
    salvarCarrinho();
    alert(produto.nome + ' adicionado ao carrinho! 🛒');
}

function atualizarContador() {
    var total = 0;
    carrinho.forEach(function(item) {
        total += item.quantidade;
    });
    var contador = document.getElementById('contador-carrinho');
    if (contador) contador.textContent = '(' + total + ')';
}

function renderizarProdutos() {
    var container = document.getElementById('lista-produtos');
    if (!container) return;
    
    if (produtos.length === 0) {
        container.innerHTML = '<div class="loja-vazia" style="grid-column: 1 / -1;"><div class="icone">📦</div><h2>Loja Vazia</h2><p>O administrador ainda não adicionou produtos.</p><p style="margin-top: 0.5rem;">Volte em breve! 🚀</p></div>';
        return;
    }
    
    var html = '';
    produtos.forEach(function(produto) {
        html += '<div class="produto-card">';
        html += '<div class="produto-imagem">' + (produto.emoji || '📦') + '</div>';
        html += '<h3 class="produto-nome">' + produto.nome + '</h3>';
        html += '<p class="produto-descricao">' + (produto.descricao || '') + '</p>';
        html += '<div class="produto-preco">R$ ' + parseFloat(produto.preco).toFixed(2) + '</div>';
        html += '<button class="btn-comprar" onclick="adicionarAoCarrinho(' + produto.id + ')">🛒 Comprar</button>';
        html += '</div>';
    });
    container.innerHTML = html;
}

renderizarProdutos();
atualizarContador();

window.addEventListener('storage', function(e) {
    if (e.key === 'produtos') {
        produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        renderizarProdutos();
    }
});

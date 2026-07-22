// ========== APLICAR CONFIGURAÇÕES SALVAS ==========
(function() {
    const cores = JSON.parse(localStorage.getItem('cores_tema'));
    if (cores) {
        const root = document.documentElement;
        root.style.setProperty('--roxo', cores.roxo);
        root.style.setProperty('--roxo-escuro', cores.roxo + 'cc');
        root.style.setProperty('--verde', cores.verde);
        root.style.setProperty('--verde-escuro', cores.verde + 'cc');
        root.style.setProperty('--amarelo', cores.amarelo);
        
        // Favicon
        if (cores.favicon) {
            let link = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = cores.favicon;
        }
        
        // Imagem de fundo
        if (cores.bgImagem) {
            document.body.classList.add('com-fundo');
            const overlay = document.createElement('div');
            overlay.style.cssText = 
                'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; ' +
                'background-image: url(' + cores.bgImagem + '); ' +
                'background-size: ' + cores.bgModo + '; ' +
                'background-position: ' + cores.bgPosicao + '; ' +
                'background-repeat: ' + (cores.bgModo === 'repeat' ? 'repeat' : 'no-repeat') + '; ' +
                'opacity: ' + (cores.bgOpacidade / 100) + ';';
            document.body.appendChild(overlay);
        }
    }
})();

// ========== CONFIGURAÇÃO ==========
const API_URL = 'http://SEU_IP:5000/api';

// ========== PRODUTOS ==========
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

// ========== CARRINHO ==========
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContador();
}

function adicionarAoCarrinho(id) {
    const produto = produtos.find(p => p.id === id);
    const itemNoCarrinho = carrinho.find(item => item.id === id);
    
    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade++;
    } else {
        carrinho.push({ ...produto, quantidade: 1 });
    }
    
    salvarCarrinho();
    alert(produto.nome + ' adicionado ao carrinho! 🛒');
}

function atualizarContador() {
    const total = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
    const contador = document.getElementById('contador-carrinho');
    if (contador) contador.textContent = '(' + total + ')';
}

function renderizarProdutos() {
    const container = document.getElementById('lista-produtos');
    if (!container) return;
    
    if (produtos.length === 0) {
        container.innerHTML = '<div class="loja-vazia" style="grid-column: 1 / -1;"><div class="icone">📦</div><h2>Loja Vazia</h2><p>O administrador ainda não adicionou produtos.</p><p style="margin-top: 0.5rem;">Volte em breve! 🚀</p></div>';
        return;
    }
    
    let html = '';
    produtos.forEach(function(produto) {
        html += '<div class="produto-card">';
        html += '<div class="produto-imagem">' + (produto.emoji || '📦') + '</div>';
        html += '<h3 class="produto-nome">' + produto.nome + '</h3>';
        html += '<p class="produto-descricao">' + (produto.descricao || '') + '</p>';
        html += '<div class="produto-preco">R$ ' + produto.preco.toFixed(2) + '</div>';
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

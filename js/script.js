// ========== CONFIGURAÇÃO ==========
const API_URL = 'http://SEU_IP:5000/api'; // Depois configuramos

// ========== PRODUTOS (Exemplo) ==========
const produtos = [
    {
        id: 1,
        nome: "VIP Mensal",
        preco: 29.90,
        emoji: "👑",
        descricao: "Acesso VIP por 30 dias"
    },
    {
        id: 2,
        nome: "VIP Vitalício",
        preco: 149.90,
        emoji: "💎",
        descricao: "VIP para sempre!"
    },
    {
        id: 3,
        nome: "Cash 1000",
        preco: 9.90,
        emoji: "💰",
        descricao: "1000 de cash no servidor"
    },
    {
        id: 4,
        nome: "Kit Iniciante",
        preco: 49.90,
        emoji: "🎒",
        descricao: "Kit completo para começar"
    },
    {
        id: 5,
        nome: "Cargo Colorido",
        preco: 19.90,
        emoji: "🌈",
        descricao: "Cargo com cor personalizada"
    },
    {
        id: 6,
        nome: "Montaria Especial",
        preco: 79.90,
        emoji: "🐉",
        descricao: "Montaria exclusiva"
    }
];

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
    alert(`${produto.nome} adicionado ao carrinho! 🛒`);
}

function atualizarContador() {
    const total = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
    const contador = document.getElementById('contador-carrinho');
    if (contador) contador.textContent = `(${total})`;
}

// ========== RENDERIZAR PRODUTOS ==========
function renderizarProdutos() {
    const container = document.getElementById('lista-produtos');
    if (!container) return;
    
    container.innerHTML = produtos.map(produto => `
        <div class="produto-card">
            <div class="produto-imagem">${produto.emoji}</div>
            <h3 class="produto-nome">${produto.nome}</h3>
            <p>${produto.descricao}</p>
            <div class="produto-preco">R$ ${produto.preco.toFixed(2)}</div>
            <button class="btn-comprar" onclick="adicionarAoCarrinho(${produto.id})">
                🛒 Comprar
            </button>
        </div>
    `).join('');
}

// ========== INICIAR ==========
renderizarProdutos();
atualizarContador();

// ========== VERIFICAR LOGIN ==========
if (!localStorage.getItem('admin_logado')) {
    window.location.href = 'login.html';
}

function sair() {
    localStorage.removeItem('admin_logado');
    window.location.href = 'login.html';
}

// ========== PRODUTOS ==========
let produtos = JSON.parse(localStorage.getItem('produtos')) || [
    { id: 1, nome: "VIP Mensal", preco: 29.90, emoji: "👑", descricao: "Acesso VIP por 30 dias" },
    { id: 2, nome: "VIP Vitalício", preco: 149.90, emoji: "💎", descricao: "VIP para sempre!" }
];

function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
    renderizarTabela();
}

function mostrarForm(id = null) {
    document.getElementById('form-produto').classList.add('ativo');
    if (id) {
        const produto = produtos.find(p => p.id === id);
        document.getElementById('nome-produto').value = produto.nome;
        document.getElementById('preco-produto').value = produto.preco;
        document.getElementById('emoji-produto').value = produto.emoji;
        document.getElementById('descricao-produto').value = produto.descricao;
        document.getElementById('form-produto').dataset.editId = id;
    }
}

function fecharForm() {
    document.getElementById('form-produto').classList.remove('ativo');
    limparForm();
}

function limparForm() {
    document.getElementById('nome-produto').value = '';
    document.getElementById('preco-produto').value = '';
    document.getElementById('emoji-produto').value = '';
    document.getElementById('descricao-produto').value = '';
}

function salvarProduto() {
    const nome = document.getElementById('nome-produto').value;
    const preco = parseFloat(document.getElementById('preco-produto').value);
    const emoji = document.getElementById('emoji-produto').value;
    const descricao = document.getElementById('descricao-produto').value;
    
    if (!nome || !preco) {
        alert('Preencha nome e preço!');
        return;
    }
    
    const editId = document.getElementById('form-produto').dataset.editId;
    
    if (editId) {
        const index = produtos.findIndex(p => p.id === parseInt(editId));
        produtos[index] = { ...produtos[index], nome, preco, emoji, descricao };
    } else {
        const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
        produtos.push({ id: novoId, nome, preco, emoji, descricao });
    }
    
    salvarProdutos();
    fecharForm();
    alert('Produto salvo com sucesso! ✅');
}

function removerProduto(id) {
    if (confirm('Tem certeza que deseja remover este produto?')) {
        produtos = produtos.filter(p => p.id !== id);
        salvarProdutos();
    }
}

function editarProduto(id) {
    mostrarForm(id);
}

function renderizarTabela() {
    const tbody = document.getElementById('lista-produtos-admin');
    if (!tbody) return;
    
    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td>${produto.emoji} ${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>
                <button class="btn-editar" onclick="editarProduto(${produto.id})">✏️ Editar</button>
                <button class="btn-remover" onclick="removerProduto(${produto.id})">🗑️ Remover</button>
            </td>
        </tr>
    `).join('');
}

renderizarTabela();

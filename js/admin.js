// ========== VERIFICAR LOGIN ==========
if (!localStorage.getItem('admin_logado')) {
    window.location.href = 'login.html';
}

function sair() {
    localStorage.removeItem('admin_logado');
    window.location.href = 'login.html';
}

// ========== MODAL DE CONFIRMAÇÃO ==========
function mostrarConfirmacao(mensagem, icone, onConfirmar, tipoBotao = 'remover') {
    let modal = document.getElementById('modal-confirmacao');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-confirmacao';
        modal.className = 'modal-confirmacao';
        modal.innerHTML = `
            <div class="modal-confirmacao-box">
                <div class="modal-confirmacao-icone" id="modal-icone"></div>
                <h3 id="modal-titulo">Confirmação</h3>
                <p id="modal-mensagem"></p>
                <div class="modal-confirmacao-botoes">
                    <button class="btn-cancelar" onclick="fecharConfirmacao()">Cancelar</button>
                    <button class="btn-confirmar-acao" id="btn-confirmar-acao">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('modal-icone').textContent = icone;
    document.getElementById('modal-mensagem').textContent = mensagem;
    
    const btnConfirmar = document.getElementById('btn-confirmar-acao');
    btnConfirmar.className = 'btn-confirmar-acao';
    
    if (tipoBotao === 'remover') {
        btnConfirmar.classList.add('btn-remover-confirmar');
        btnConfirmar.textContent = '🗑️ Remover';
    } else if (tipoBotao === 'salvar') {
        btnConfirmar.classList.add('btn-salvar-confirmar');
        btnConfirmar.textContent = '💾 Salvar';
    }
    
    btnConfirmar.onclick = () => {
        fecharConfirmacao();
        onConfirmar();
    };

    modal.classList.add('ativo');
}

function fecharConfirmacao() {
    const modal = document.getElementById('modal-confirmacao');
    if (modal) modal.classList.remove('ativo');
}

// ========== PRODUTOS ==========
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

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
        document.getElementById('emoji-produto').value = produto.emoji || '';
        document.getElementById('descricao-produto').value = produto.descricao || '';
        document.getElementById('form-produto').dataset.editId = id;
        document.getElementById('form-titulo').textContent = '✏️ Editar Produto';
    } else {
        document.getElementById('form-titulo').textContent = '➕ Novo Produto';
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
    delete document.getElementById('form-produto').dataset.editId;
}

function salvarProduto() {
    const nome = document.getElementById('nome-produto').value.trim();
    const preco = parseFloat(document.getElementById('preco-produto').value);
    const emoji = document.getElementById('emoji-produto').value.trim();
    const descricao = document.getElementById('descricao-produto').value.trim();
    
    if (!nome || !preco) {
        alert('⚠️ Preencha nome e preço!');
        return;
    }
    
    const editId = document.getElementById('form-produto').dataset.editId;
    
    mostrarConfirmacao(
        editId ? `Salvar alterações em "${nome}"?` : `Adicionar "${nome}" à loja por R$ ${preco.toFixed(2)}?`,
        editId ? '✏️' : '➕',
        () => {
            if (editId) {
                const index = produtos.findIndex(p => p.id === parseInt(editId));
                produtos[index] = { ...produtos[index], nome, preco, emoji, descricao };
            } else {
                const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
                produtos.push({ id: novoId, nome, preco, emoji, descricao });
            }
            salvarProdutos();
            fecharForm();
        },
        'salvar'
    );
}

function removerProduto(id) {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
        mostrarConfirmacao(
            `Tem certeza que deseja remover "${produto.nome}"?\n\nEsta ação não pode ser desfeita!`,
            '⚠️',
            () => {
                produtos = produtos.filter(p => p.id !== id);
                salvarProdutos();
            },
            'remover'
        );
    }
}

function editarProduto(id) {
    mostrarForm(id);
}

function renderizarTabela() {
    const tbody = document.getElementById('lista-produtos-admin');
    if (!tbody) return;
    
    if (produtos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 3rem; color: var(--texto-cinza);">📦 Nenhum produto cadastrado</td></tr>`;
        return;
    }
    
    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td>${produto.emoji || '📦'} ${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>
                <button class="btn-editar" onclick="editarProduto(${produto.id})">✏️ Editar</button>
                <button class="btn-remover" onclick="removerProduto(${produto.id})">🗑️ Remover</button>
            </td>
        </tr>
    `).join('');
}

renderizarTabela();

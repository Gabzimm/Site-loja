// ========== VERIFICAR LOGIN ==========
if (!localStorage.getItem('admin_logado')) {
    window.location.href = 'login.html';
}

function sair() {
    localStorage.removeItem('admin_logado');
    window.location.href = 'login.html';
}

// ========== MODAL DE CONFIRMAÇÃO ==========
function mostrarConfirmacao(mensagem, icone, onConfirmar, tipoBotao) {
    tipoBotao = tipoBotao || 'remover';
    var modal = document.getElementById('modal-confirmacao');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-confirmacao';
        modal.className = 'modal-confirmacao';
        modal.innerHTML = '<div class="modal-confirmacao-box"><div class="modal-confirmacao-icone" id="modal-icone"></div><h3 id="modal-titulo">Confirmação</h3><p id="modal-mensagem"></p><div class="modal-confirmacao-botoes"><button class="btn-cancelar" onclick="fecharConfirmacao()">Cancelar</button><button class="btn-confirmar-acao" id="btn-confirmar-acao">Confirmar</button></div></div>';
        document.body.appendChild(modal);
    }
    document.getElementById('modal-icone').textContent = icone;
    document.getElementById('modal-mensagem').textContent = mensagem;
    var btnConfirmar = document.getElementById('btn-confirmar-acao');
    btnConfirmar.className = 'btn-confirmar-acao';
    if (tipoBotao === 'remover') {
        btnConfirmar.classList.add('btn-remover-confirmar');
        btnConfirmar.textContent = '🗑️ Remover';
    } else {
        btnConfirmar.classList.add('btn-salvar-confirmar');
        btnConfirmar.textContent = '💾 Salvar';
    }
    btnConfirmar.onclick = function() {
        fecharConfirmacao();
        onConfirmar();
    };
    modal.classList.add('ativo');
}

function fecharConfirmacao() {
    var modal = document.getElementById('modal-confirmacao');
    if (modal) modal.classList.remove('ativo');
}

// ========== PRODUTOS ==========
var produtos = JSON.parse(localStorage.getItem('produtos')) || [];
var imagemTemporaria = null;

function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
    renderizarTabela();
}

function mostrarForm(id) {
    document.getElementById('form-produto').classList.add('ativo');
    limparForm();
    
    if (id) {
        var produto = produtos.find(function(p) { return p.id === id; });
        document.getElementById('nome-produto').value = produto.nome;
        document.getElementById('preco-produto').value = produto.preco;
        document.getElementById('emoji-produto').value = produto.emoji || '';
        document.getElementById('descricao-produto').value = produto.descricao || '';
        document.getElementById('url-imagem').value = produto.imagem || '';
        document.getElementById('form-produto').dataset.editId = id;
        document.getElementById('form-titulo').textContent = '✏️ Editar Produto';
        
        if (produto.imagem) {
            document.getElementById('preview-imagem').src = produto.imagem;
            document.getElementById('preview-imagem').classList.add('ativo');
            document.getElementById('btn-remover-imagem').classList.add('ativo');
        }
    } else {
        document.getElementById('form-titulo').textContent = '➕ Novo Produto';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    document.getElementById('url-imagem').value = '';
    document.getElementById('preview-imagem').classList.remove('ativo');
    document.getElementById('btn-remover-imagem').classList.remove('ativo');
    document.getElementById('input-imagem').value = '';
    imagemTemporaria = null;
    delete document.getElementById('form-produto').dataset.editId;
}

function previewImagem(input) {
    var file = input.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ Imagem muito grande! Máximo 5MB.');
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-imagem').src = e.target.result;
            document.getElementById('preview-imagem').classList.add('ativo');
            document.getElementById('btn-remover-imagem').classList.add('ativo');
            imagemTemporaria = e.target.result;
            document.getElementById('url-imagem').value = '';
        };
        reader.readAsDataURL(file);
    }
}

function previewUrl(url) {
    if (url) {
        document.getElementById('preview-imagem').src = url;
        document.getElementById('preview-imagem').classList.add('ativo');
        document.getElementById('btn-remover-imagem').classList.add('ativo');
        imagemTemporaria = url;
        document.getElementById('input-imagem').value = '';
    } else {
        document.getElementById('preview-imagem').classList.remove('ativo');
        document.getElementById('btn-remover-imagem').classList.remove('ativo');
        imagemTemporaria = null;
    }
}

function removerImagem() {
    document.getElementById('preview-imagem').classList.remove('ativo');
    document.getElementById('btn-remover-imagem').classList.remove('ativo');
    document.getElementById('url-imagem').value = '';
    document.getElementById('input-imagem').value = '';
    imagemTemporaria = null;
}

function salvarProduto() {
    var nome = document.getElementById('nome-produto').value.trim();
    var preco = parseFloat(document.getElementById('preco-produto').value);
    var emoji = document.getElementById('emoji-produto').value.trim();
    var descricao = document.getElementById('descricao-produto').value.trim();
    var urlImagem = document.getElementById('url-imagem').value.trim();
    var imagem = imagemTemporaria || urlImagem || '';
    
    if (!nome || !preco) {
        alert('⚠️ Preencha nome e preço!');
        return;
    }
    
    var editId = document.getElementById('form-produto').dataset.editId;
    
    mostrarConfirmacao(
        editId ? 'Salvar alterações em "' + nome + '"?' : 'Adicionar "' + nome + '" à loja por R$ ' + preco.toFixed(2) + '?',
        editId ? '✏️' : '➕',
        function() {
            if (editId) {
                var index = produtos.findIndex(function(p) { return p.id === parseInt(editId); });
                produtos[index] = { 
                    id: produtos[index].id, 
                    nome: nome, 
                    preco: preco, 
                    emoji: emoji, 
                    descricao: descricao,
                    imagem: imagem
                };
            } else {
                var novoId = produtos.length > 0 ? Math.max.apply(null, produtos.map(function(p) { return p.id; })) + 1 : 1;
                produtos.push({ 
                    id: novoId, 
                    nome: nome, 
                    preco: preco, 
                    emoji: emoji, 
                    descricao: descricao,
                    imagem: imagem
                });
            }
            salvarProdutos();
            fecharForm();
        },
        'salvar'
    );
}

function removerProduto(id) {
    var produto = produtos.find(function(p) { return p.id === id; });
    if (produto) {
        mostrarConfirmacao(
            'Tem certeza que deseja remover "' + produto.nome + '"?\n\nEsta ação não pode ser desfeita!',
            '⚠️',
            function() {
                produtos = produtos.filter(function(p) { return p.id !== id; });
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
    var tbody = document.getElementById('lista-produtos-admin');
    if (!tbody) return;
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 3rem; color: var(--texto-cinza);">📦 Nenhum produto cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.map(function(produto) {
        var imgCell = produto.imagem 
            ? '<img src="' + produto.imagem + '" class="mini-imagem" alt="' + produto.nome + '">'
            : '<div class="mini-imagem" style="display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">' + (produto.emoji || '📦') + '</div>';
        
        return '<tr>' +
            '<td>' + imgCell + '</td>' +
            '<td>' + produto.nome + '</td>' +
            '<td>R$ ' + parseFloat(produto.preco).toFixed(2) + '</td>' +
            '<td>' +
                '<button class="btn-editar" onclick="editarProduto(' + produto.id + ')">✏️ Editar</button>' +
                '<button class="btn-remover" onclick="removerProduto(' + produto.id + ')">🗑️ Remover</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

renderizarTabela();

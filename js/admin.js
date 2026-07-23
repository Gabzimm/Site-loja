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

// Carregar categorias no select
function carregarCategoriasNoSelect() {
    var select = document.getElementById('categoria-produto');
    if (!select) return;
    
    var categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    select.innerHTML = '<option value="">Nenhuma</option>';
    categorias.forEach(function(cat) {
        select.innerHTML += '<option value="' + cat.nome + '">' + (cat.emoji || '📂') + ' ' + cat.nome + '</option>';
    });
}

function mostrarForm(id) {
    document.getElementById('form-produto').classList.add('ativo');
    limparForm();
    carregarCategoriasNoSelect();
    
    if (id) {
        var produto = produtos.find(function(p) { return p.id === id; });
        document.getElementById('nome-produto').value = produto.nome;
        document.getElementById('preco-produto').value = produto.preco;
        document.getElementById('preco-promo').value = produto.precoPromo || '';
        document.getElementById('emoji-produto').value = produto.emoji || '';
        document.getElementById('descricao-produto').value = produto.descricao || '';
        document.getElementById('url-imagem').value = produto.imagem || '';
        document.getElementById('categoria-produto').value = produto.categoria || '';
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
    document.getElementById('preco-promo').value = '';
    document.getElementById('emoji-produto').value = '';
    document.getElementById('descricao-produto').value = '';
    document.getElementById('url-imagem').value = '';
    document.getElementById('categoria-produto').value = '';
    document.getElementById('preview-imagem').classList.remove('ativo');
    document.getElementById('btn-remover-imagem').classList.remove('ativo');
    document.getElementById('input-imagem').value = '';
    imagemTemporaria = null;
    delete document.getElementById('form-produto').dataset.editId;
}

function previewImagem(input) {
    var file = input.files[0];
    if (file) {
        if (file.size > 200 * 1024) {
            alert('⚠️ Imagem muito grande! Use URL externa (Imgur, ImgBB).');
            input.value = '';
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
    var precoPromo = parseFloat(document.getElementById('preco-promo').value) || null;
    var emoji = document.getElementById('emoji-produto').value.trim();
    var descricao = document.getElementById('descricao-produto').value.trim();
    var urlImagem = document.getElementById('url-imagem').value.trim();
    var categoria = document.getElementById('categoria-produto').value;
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
                    precoPromo: precoPromo,
                    emoji: emoji, 
                    descricao: descricao,
                    imagem: imagem,
                    categoria: categoria
                };
            } else {
                var novoId = produtos.length > 0 ? Math.max.apply(null, produtos.map(function(p) { return p.id; })) + 1 : 1;
                produtos.push({ 
                    id: novoId, 
                    nome: nome, 
                    preco: preco,
                    precoPromo: precoPromo,
                    emoji: emoji, 
                    descricao: descricao,
                    imagem: imagem,
                    categoria: categoria
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

// ========== MUDAR CATEGORIA RÁPIDO ==========
function mudarCategoria(produtoId) {
    var produto = produtos.find(function(p) { return p.id === produtoId; });
    if (!produto) return;
    
    var categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    
    if (categorias.length === 0) {
        alert('⚠️ Nenhuma categoria cadastrada!\nVá em 📂 Categorias primeiro.');
        return;
    }
    
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;';
    
    var opcoes = categorias.map(function(cat) {
        var selecionado = produto.categoria === cat.nome ? 'style="border-color:var(--verde);background:rgba(16,185,129,0.1);"' : '';
        return '<div ' + selecionado + ' onclick="selecionarCategoria(' + produtoId + ', \'' + cat.nome.replace(/'/g, "\\'") + '\')" style="background:var(--fundo);padding:1rem;border-radius:8px;cursor:pointer;margin-bottom:0.5rem;border:2px solid #333;transition:all 0.3s;">' +
            (cat.emoji || '📂') + ' <strong>' + cat.nome + '</strong>' +
            (cat.descricao ? '<br><small style="color:var(--texto-cinza);">' + cat.descricao + '</small>' : '') +
        '</div>';
    }).join('');
    
    modal.innerHTML = 
        '<div style="background:var(--card);padding:2rem;border-radius:15px;border:2px solid var(--roxo);max-width:500px;width:90%;max-height:80vh;overflow-y:auto;">' +
            '<h3 style="color:var(--amarelo);margin-bottom:1rem;">📂 Categoria para: ' + produto.nome + '</h3>' +
            '<p style="color:var(--texto-cinza);margin-bottom:1rem;">Selecione uma categoria:</p>' +
            '<div onclick="selecionarCategoria(' + produtoId + ', \'\')" style="background:var(--fundo);padding:1rem;border-radius:8px;cursor:pointer;margin-bottom:0.5rem;border:2px solid #333;text-align:center;color:var(--texto-cinza);">🗑️ Remover categoria</div>' +
            opcoes +
            '<button onclick="fecharModalCat()" style="background:#64748b;color:white;padding:0.8rem;border:none;border-radius:8px;width:100%;margin-top:1rem;cursor:pointer;">Cancelar</button>' +
        '</div>';
    
    modal.id = 'modal-categoria-rapido';
    document.body.appendChild(modal);
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
}

function selecionarCategoria(produtoId, categoriaNome) {
    var produto = produtos.find(function(p) { return p.id === produtoId; });
    if (produto) {
        produto.categoria = categoriaNome || '';
        salvarProdutos();
        
        var txt = document.getElementById('cat-txt-' + produtoId);
        if (txt) txt.textContent = categoriaNome || '—';
        
        fecharModalCat();
    }
}

function fecharModalCat() {
    var modal = document.getElementById('modal-categoria-rapido');
    if (modal) modal.remove();
}

// ========== RENDERIZAR TABELA ==========
function renderizarTabela() {
    var tbody = document.getElementById('lista-produtos-admin');
    if (!tbody) return;
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--texto-cinza);">📦 Nenhum produto cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.map(function(produto) {
        var imgCell = produto.imagem 
            ? '<img src="' + produto.imagem + '" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" alt="">'
            : '<div style="width:50px;height:50px;background:var(--fundo);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">' + (produto.emoji || '📦') + '</div>';
        
        var precoCell = 'R$ ' + Number(produto.preco).toFixed(2);
        if (produto.precoPromo && Number(produto.precoPromo) < Number(produto.preco)) {
            precoCell = '<span style="text-decoration:line-through;color:var(--texto-cinza);">R$ ' + Number(produto.preco).toFixed(2) + '</span> <span style="color:#ef4444;font-weight:bold;">R$ ' + Number(produto.precoPromo).toFixed(2) + '</span>';
        }
        
        var catAtual = produto.categoria || '—';
        
        return '<tr>' +
            '<td>' + imgCell + '</td>' +
            '<td>' + produto.nome + '</td>' +
            '<td>' + precoCell + '</td>' +
            '<td>' +
                '<span id="cat-txt-' + produto.id + '">' + catAtual + '</span>' +
                ' <button onclick="mudarCategoria(' + produto.id + ')" style="background:var(--roxo);color:white;border:none;padding:0.2rem 0.5rem;border-radius:5px;cursor:pointer;font-size:0.8rem;" title="Alterar categoria">📂</button>' +
            '</td>' +
            '<td>' +
                '<button class="btn-editar" onclick="editarProduto(' + produto.id + ')">✏️ Editar</button>' +
                '<button class="btn-remover" onclick="removerProduto(' + produto.id + ')">🗑️ Remover</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

renderizarTabela();

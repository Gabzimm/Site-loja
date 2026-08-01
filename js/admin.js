// ========== VERIFICAR LOGIN (sessão real, não mais um "true" fixo) ==========
if (!localStorage.getItem('admin_sessao')) {
    window.location.href = 'login.html';
}

function sair() {
    localStorage.removeItem('admin_sessao');
    window.location.href = 'login.html';
}

// ========== MODAL DE CONFIRMAÇÃO ========== (sem mudanças)
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

// ========== VIP: mostrar/esconder campo do cargo ==========
function alternarCampoVip() {
    var marcado = document.getElementById('eh-vip').checked;
    document.getElementById('campo-cargo-vip').classList.toggle('ativo', marcado);
}

// ========== VIP DE CLÃ: mostrar/esconder campos + popular lista de VIPs vinculáveis ==========
function alternarCampoVipClan() {
    var marcado = document.getElementById('eh-vip-clan').checked;
    document.getElementById('campo-vip-clan').classList.toggle('ativo', marcado);
    if (marcado) popularVipsVinculaveis();
}

function popularVipsVinculaveis(idAtual) {
    var select = document.getElementById('vip-clan-vinculado');
    var valorAtual = select.value;
    select.innerHTML = '<option value="">Não, não tem VIP vinculado</option>';
    produtos.filter(function(p) { return p.cargoVipId && p.id !== idAtual; }).forEach(function(p) {
        select.innerHTML += '<option value="' + p.id + '">' + p.nome + '</option>';
    });
    select.value = valorAtual;
}

// ========== PRODUTOS ==========
var produtos = JSON.parse(localStorage.getItem('produtos')) || [];
var imagemTemporaria = null;

// Sincroniza com o backend antes de renderizar (antes essa página não fazia isso)
sincronizarLocalStorage().then(function() {
    produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    renderizarTabela();
    carregarCategoriasNoSelect();
});

function salvarProdutos(acao, detalhes) {
    localStorage.setItem('produtos', JSON.stringify(produtos));
    enviarParaBin('produtos', produtos, acao, detalhes);
    renderizarTabela();
}

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
        document.getElementById('destaque-produto').value = produto.destaque === false ? 'nao' : 'sim';
        document.getElementById('eh-vip').checked = !!produto.cargoVipId;
        document.getElementById('cargo-vip-id').value = produto.cargoVipId || '';
        alternarCampoVip();
        document.getElementById('eh-vip-clan').checked = !!produto.ehVipClan;
        popularVipsVinculaveis(produto.id);
        document.getElementById('vip-clan-vinculado').value = produto.vipClanVinculadoId || '';
        document.getElementById('vip-clan-limite').value = produto.vipClanLimiteAdicional || '';
        alternarCampoVipClan();
        document.getElementById('form-produto').dataset.editId = id;
        document.getElementById('form-titulo').textContent = '✏️ Editar Produto';
        if (produto.imagem) {
            document.getElementById('preview-imagem').src = produto.imagem;
            document.getElementById('preview-imagem').classList.add('ativo');
            document.getElementById('btn-remover-imagem').classList.add('ativo');
        }
    } else {
        document.getElementById('destaque-produto').value = 'sim';
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
    document.getElementById('destaque-produto').value = 'sim';
    document.getElementById('eh-vip').checked = false;
    document.getElementById('cargo-vip-id').value = '';
    document.getElementById('campo-cargo-vip').classList.remove('ativo');
    document.getElementById('eh-vip-clan').checked = false;
    document.getElementById('vip-clan-vinculado').value = '';
    document.getElementById('vip-clan-limite').value = '';
    document.getElementById('campo-vip-clan').classList.remove('ativo');
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
    var destaque = document.getElementById('destaque-produto').value === 'sim';
    var imagem = imagemTemporaria || urlImagem || '';
    var ehVip = document.getElementById('eh-vip').checked;
    var cargoVipId = document.getElementById('cargo-vip-id').value.trim();
    var ehVipClan = document.getElementById('eh-vip-clan').checked;
    var vipClanVinculadoId = document.getElementById('vip-clan-vinculado').value ? parseInt(document.getElementById('vip-clan-vinculado').value) : null;
    var vipClanLimiteAdicional = document.getElementById('vip-clan-limite').value ? parseInt(document.getElementById('vip-clan-limite').value) : null;

    if (!nome || !preco) {
        alert('⚠️ Preencha nome e preço!');
        return;
    }

    if (ehVip && !cargoVipId) {
        alert('⚠️ Produto marcado como VIP precisa do ID do Cargo do Discord! Preencha o campo "ID do Cargo do VIP".');
        return;
    }
    if (!ehVip) cargoVipId = ''; // se desmarcou, não concede cargo nenhum

    if (ehVipClan && (!vipClanLimiteAdicional || vipClanLimiteAdicional <= 0)) {
        alert('⚠️ VIP de Clã precisa do limite de membros a adicionar! Preencha só com números.');
        return;
    }
    if (!ehVipClan) { vipClanVinculadoId = null; vipClanLimiteAdicional = null; }

    var editId = document.getElementById('form-produto').dataset.editId;

    mostrarConfirmacao(
        editId ? 'Salvar alterações em "' + nome + '"?' : 'Adicionar "' + nome + '" à loja por R$ ' + preco.toFixed(2) + '?',
        editId ? '✏️' : '➕',
        function() {
            if (editId) {
                var index = produtos.findIndex(function(p) { return p.id === parseInt(editId); });
                produtos[index] = {
                    id: produtos[index].id, nome: nome, preco: preco, precoPromo: precoPromo,
                    emoji: emoji, descricao: descricao, imagem: imagem, categoria: categoria, destaque: destaque,
                    cargoVipId: cargoVipId, ehVipClan: ehVipClan, vipClanVinculadoId: vipClanVinculadoId, vipClanLimiteAdicional: vipClanLimiteAdicional
                };
                salvarProdutos('Editou produto', nome);
            } else {
                var novoId = produtos.length > 0 ? Math.max.apply(null, produtos.map(function(p) { return p.id; })) + 1 : 1;
                produtos.push({
                    id: novoId, nome: nome, preco: preco, precoPromo: precoPromo,
                    emoji: emoji, descricao: descricao, imagem: imagem, categoria: categoria, destaque: destaque,
                    cargoVipId: cargoVipId, ehVipClan: ehVipClan, vipClanVinculadoId: vipClanVinculadoId, vipClanLimiteAdicional: vipClanLimiteAdicional
                });
                salvarProdutos('Criou produto', nome);
            }
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
                salvarProdutos('Removeu produto', produto.nome);
            },
            'remover'
        );
    }
}

function editarProduto(id) { mostrarForm(id); }

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
        localStorage.setItem('produtos', JSON.stringify(produtos));
        enviarParaBin('produtos', produtos, 'Mudou categoria', produto.nome + ' → ' + (categoriaNome || 'sem categoria'));
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--texto-cinza);">📦 Nenhum produto cadastrado</td></tr>';
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
        var destaqueBadge = produto.destaque !== false ? ' <span class="badge-destaque">⭐</span>' : '—';
        var vipBadge = produto.cargoVipId ? ' <span class="badge-vip">🎖️ VIP</span>' : '';
        var vipClanBadge = produto.ehVipClan ? ' <span class="badge-vip" style="background:var(--amarelo);color:#000;">🏰 +' + (produto.vipClanLimiteAdicional || 0) + ' Clã</span>' : '';
        return '<tr>' +
            '<td>' + imgCell + '</td>' +
            '<td>' + produto.nome + vipBadge + vipClanBadge + '</td>' +
            '<td>' + precoCell + '</td>' +
            '<td><span id="cat-txt-' + produto.id + '">' + catAtual + '</span> <button onclick="mudarCategoria(' + produto.id + ')" style="background:var(--roxo);color:white;border:none;padding:0.2rem 0.5rem;border-radius:5px;cursor:pointer;font-size:0.8rem;">📂</button></td>' +
            '<td>' + destaqueBadge + '</td>' +
            '<td>' +
                '<button class="btn-editar" onclick="editarProduto(' + produto.id + ')">✏️ Editar</button>' +
                '<button class="btn-remover" onclick="removerProduto(' + produto.id + ')">🗑️ Remover</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

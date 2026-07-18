// Lógica de Orçamentos com Isolamento por Usuário

let itens = [];
let orcamentos = [];
let midias = [];
let usuarioAutenticado = null;

// Inicializar com dados do usuário
function inicializarOrcamentos() {
    usuarioAutenticado = obterUsuarioAutenticado();
    
    if (!usuarioAutenticado) {
        window.location.href = 'index.html';
        return;
    }
    
    carregarDados();
}

// Carregar dados do usuário
function carregarDados() {
    const usuarioId = usuarioAutenticado.id;
    const orcamentosArmazenados = localStorage.getItem('orcamentos_' + usuarioId);
    
    if (orcamentosArmazenados) {
        orcamentos = JSON.parse(orcamentosArmazenados);
    } else {
        orcamentos = [];
    }
}

// Salvar dados no localStorage (isolado por usuário)
function salvarDados() {
    const usuarioId = usuarioAutenticado.id;
    localStorage.setItem('orcamentos_' + usuarioId, JSON.stringify(orcamentos));
}

// Adicionar item ao orçamento
function adicionarItem() {
    const quantidade = parseInt(document.getElementById('itemQuantidade').value);
    const descricao = document.getElementById('itemDescricao').value;
    const valor = parseFloat(document.getElementById('itemValor').value);
    
    if (!descricao || !valor) {
        alert('Preencha todos os campos do item!');
        return;
    }
    
    const item = {
        id: Date.now(),
        quantidade: quantidade,
        descricao: descricao,
        valor: valor,
        subtotal: quantidade * valor
    };
    
    itens.push(item);
    atualizarTabela();
    limparFormItem();
}

// Remover item do orçamento
function removerItem(itemId) {
    itens = itens.filter(item => item.id !== itemId);
    atualizarTabela();
}

// Atualizar tabela de itens
function atualizarTabela() {
    const corpoTabela = document.getElementById('corpoTabela');
    if (!corpoTabela) return;
    
    corpoTabela.innerHTML = '';
    
    itens.forEach(item => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${item.quantidade}</td>
            <td>${item.descricao}</td>
            <td>R$ ${item.valor.toFixed(2)}</td>
            <td>R$ ${item.subtotal.toFixed(2)}</td>
            <td><button class="btn-remover-item" onclick="removerItem(${item.id})">Remover</button></td>
        `;
        corpoTabela.appendChild(linha);
    });
    
    atualizarTotal();
}

// Calcular e atualizar total
function atualizarTotal() {
    const total = itens.reduce((sum, item) => sum + item.subtotal, 0);
    const elemento = document.getElementById('valorTotal');
    if (elemento) {
        elemento.textContent = total.toFixed(2);
    }
}

// Limpar formulário de item
function limparFormItem() {
    document.getElementById('itemQuantidade').value = '1';
    document.getElementById('itemDescricao').value = '';
    document.getElementById('itemValor').value = '';
    document.getElementById('itemQuantidade').focus();
}

// Limpar todo o orçamento
function limparOrcamento() {
    if (confirm('Tem certeza que deseja limpar todo o orçamento?')) {
        itens = [];
        midias = [];
        const formCliente = document.getElementById('formCliente');
        if (formCliente) formCliente.reset();
        const midiaLista = document.getElementById('midiaLista');
        if (midiaLista) midiaLista.innerHTML = '';
        atualizarTabela();
    }
}

// Salvar orçamento
function salvarOrcamento() {
    const clienteNome = document.getElementById('clienteNome').value;
    const clienteEmail = document.getElementById('clienteEmail').value;
    const clienteTelefone = document.getElementById('clienteTelefone').value;
    const clienteEndereco = document.getElementById('clienteEndereco').value;
    const clienteCidade = document.getElementById('clienteCidade').value;
    const dataOrcamento = document.getElementById('dataOrcamento').value;
    const total = itens.reduce((sum, item) => sum + item.subtotal, 0);
    
    if (!clienteNome || !clienteEmail || !clienteTelefone || itens.length === 0) {
        alert('Preencha os dados do cliente e adicione pelo menos um item!');
        return;
    }
    
    const orcamento = {
        id: Date.now(),
        usuarioId: usuarioAutenticado.id,
        data: new Date().toLocaleString('pt-BR'),
        cliente: {
            nome: clienteNome,
            email: clienteEmail,
            telefone: clienteTelefone,
            endereco: clienteEndereco,
            cidade: clienteCidade
        },
        dataOrcamento: dataOrcamento,
        itens: JSON.parse(JSON.stringify(itens)),
        total: total,
        midias: [...midias],
        status: 'novo'
    };
    
    orcamentos.push(orcamento);
    salvarDados();
    
    alert('Orçamento salvo com sucesso!');
    limparOrcamento();
    carregarOrcamentos();
}

// Carregar orçamentos salvos
function carregarOrcamentos() {
    const listaOrcamentos = document.getElementById('listaOrcamentos');
    if (!listaOrcamentos) return;
    
    listaOrcamentos.innerHTML = '';
    
    if (orcamentos.length === 0) {
        listaOrcamentos.innerHTML = '<p style="text-align: center; color: #999;">Nenhum orçamento salvo ainda.</p>';
        return;
    }
    
    orcamentos.forEach(orcamento => {
        const card = document.createElement('div');
        card.className = 'card-orcamento';
        card.innerHTML = `
            <h4>📋 ${orcamento.cliente.nome}</h4>
            <p><strong>Email:</strong> ${orcamento.cliente.email}</p>
            <p><strong>Telefone:</strong> ${orcamento.cliente.telefone}</p>
            <p><strong>Itens:</strong> ${orcamento.itens.length}</p>
            <p><strong>Data:</strong> ${orcamento.data}</p>
            <div class="valor">R$ ${orcamento.total.toFixed(2)}</div>
            <div class="card-orcamento-acoes">
                <button class="btn-visualizar" onclick="editarOrcamento(${orcamento.id})">Editar</button>
                <button class="btn-visualizar" onclick="visualizarOrcamento(${orcamento.id})">Visualizar</button>
                <button class="btn-deletar" onclick="deletarOrcamentoConfirm(${orcamento.id})">Deletar</button>
            </div>
        `;
        listaOrcamentos.appendChild(card);
    });
}

// Editar orçamento
function editarOrcamento(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    // Carregar dados no formulário
    document.getElementById('clienteNome').value = orcamento.cliente.nome;
    document.getElementById('clienteEmail').value = orcamento.cliente.email;
    document.getElementById('clienteTelefone').value = orcamento.cliente.telefone;
    document.getElementById('clienteEndereco').value = orcamento.cliente.endereco;
    document.getElementById('clienteCidade').value = orcamento.cliente.cidade;
    document.getElementById('dataOrcamento').value = orcamento.dataOrcamento;
    
    // Carregar itens
    itens = JSON.parse(JSON.stringify(orcamento.itens));
    midias = JSON.parse(JSON.stringify(orcamento.midias));
    
    atualizarTabela();
    
    // Renderizar mídias
    const midiaLista = document.getElementById('midiaLista');
    if (midiaLista) {
        midiaLista.innerHTML = '';
        midias.forEach(m => adicionarMidiaAoDOM(m));
    }
    
    // Mudar botão de salvar para atualizar
    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.textContent = 'Atualizar Orçamento';
    btnSalvar.onclick = () => atualizarOrcamento(orcamentoId);
    
    // Scroll para o topo
    window.scrollTo(0, 0);
}

// Atualizar orçamento existente
function atualizarOrcamento(orcamentoId) {
    const index = orcamentos.findIndex(o => o.id === orcamentoId);
    if (index !== -1) {
        const clienteNome = document.getElementById('clienteNome').value;
        const clienteEmail = document.getElementById('clienteEmail').value;
        const clienteTelefone = document.getElementById('clienteTelefone').value;
        const clienteEndereco = document.getElementById('clienteEndereco').value;
        const clienteCidade = document.getElementById('clienteCidade').value;
        const dataOrcamento = document.getElementById('dataOrcamento').value;
        const total = itens.reduce((sum, item) => sum + item.subtotal, 0);
        
        orcamentos[index].cliente.nome = clienteNome;
        orcamentos[index].cliente.email = clienteEmail;
        orcamentos[index].cliente.telefone = clienteTelefone;
        orcamentos[index].cliente.endereco = clienteEndereco;
        orcamentos[index].cliente.cidade = clienteCidade;
        orcamentos[index].dataOrcamento = dataOrcamento;
        orcamentos[index].itens = JSON.parse(JSON.stringify(itens));
        orcamentos[index].total = total;
        orcamentos[index].midias = [...midias];
        orcamentos[index].dataUltimaEdicao = new Date().toLocaleString('pt-BR');
        
        salvarDados();
        alert('Orçamento atualizado com sucesso!');
        limparOrcamento();
        
        // Resetar botão
        document.getElementById('btnSalvar').textContent = 'Salvar Orçamento';
        document.getElementById('btnSalvar').onclick = salvarOrcamento;
        
        carregarOrcamentos();
    }
}

// Visualizar orçamento detalhado
function visualizarOrcamento(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    let detalhes = `ORÇAMENTO\n\n`;
    detalhes += `Cliente: ${orcamento.cliente.nome}\n`;
    detalhes += `Email: ${orcamento.cliente.email}\n`;
    detalhes += `Telefone: ${orcamento.cliente.telefone}\n`;
    detalhes += `Endereço: ${orcamento.cliente.endereco}, ${orcamento.cliente.cidade}\n`;
    detalhes += `Data do Orçamento: ${orcamento.dataOrcamento}\n`;
    detalhes += `Data de Criação: ${orcamento.data}\n\n`;
    detalhes += `ITENS:\n`;
    detalhes += `${'Qnt'.padEnd(6)}${'Descrição'.padEnd(40)}${'Valor'.padEnd(12)}${'Subtotal'.padEnd(12)}\n`;
    detalhes += `-`.repeat(70) + `\n`;
    
    orcamento.itens.forEach(item => {
        detalhes += `${String(item.quantidade).padEnd(6)}${item.descricao.substring(0, 40).padEnd(40)}R$ ${item.valor.toFixed(2).padEnd(10)}R$ ${item.subtotal.toFixed(2).padEnd(10)}\n`;
    });
    
    detalhes += `-`.repeat(70) + `\n`;
    detalhes += `TOTAL: R$ ${orcamento.total.toFixed(2)}\n`;
    
    alert(detalhes);
}

// Deletar orçamento
function deletarOrcamentoConfirm(orcamentoId) {
    if (confirm('Tem certeza que deseja deletar este orçamento?')) {
        orcamentos = orcamentos.filter(o => o.id !== orcamentoId);
        salvarDados();
        carregarOrcamentos();
        alert('Orçamento deletado com sucesso!');
    }
}

// Gerar PDF do orçamento
function gerarPDF() {
    const clienteNome = document.getElementById('clienteNome').value;
    const clienteEmail = document.getElementById('clienteEmail').value;
    const clienteTelefone = document.getElementById('clienteTelefone').value;
    const clienteEndereco = document.getElementById('clienteEndereco').value;
    const clienteCidade = document.getElementById('clienteCidade').value;
    const dataOrcamento = document.getElementById('dataOrcamento').value;
    
    if (!clienteNome || itens.length === 0) {
        alert('Preencha os dados do cliente e adicione pelo menos um item para gerar PDF!');
        return;
    }
    
    const total = itens.reduce((sum, item) => sum + item.subtotal, 0);
    
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Orçamento</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }
                .cliente-info { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                .cliente-info h3 { margin: 0 0 10px 0; color: #667eea; }
                .cliente-info p { margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #667eea; color: white; padding: 10px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #ddd; }
                .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ORÇAMENTO</h1>
                <p>Cast Serviços Técnicos</p>
            </div>
            
            <div class="cliente-info">
                <h3>DADOS DO CLIENTE</h3>
                <p><strong>Nome:</strong> ${clienteNome}</p>
                <p><strong>Email:</strong> ${clienteEmail}</p>
                <p><strong>Telefone:</strong> ${clienteTelefone}</p>
                <p><strong>Endereço:</strong> ${clienteEndereco}, ${clienteCidade}</p>
                <p><strong>Data do Orçamento:</strong> ${dataOrcamento}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Quantidade</th>
                        <th>Descrição</th>
                        <th>Valor Unitário</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    itens.forEach(item => {
        html += `
            <tr>
                <td>${item.quantidade}</td>
                <td>${item.descricao}</td>
                <td>R$ ${item.valor.toFixed(2)}</td>
                <td>R$ ${item.subtotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
            
            <div class="total">
                VALOR TOTAL: R$ ${total.toFixed(2)}
            </div>
        </body>
        </html>
    `;
    
    const janelaImpressao = window.open('', '', 'height=600,width=800');
    janelaImpressao.document.write(html);
    janelaImpressao.document.close();
    janelaImpressao.print();
}

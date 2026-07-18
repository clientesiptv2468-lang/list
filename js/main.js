// Script Principal - Inicialização e Event Listeners

// Evento de adicionar item
if (document.getElementById('btnAdicionarItem')) {
    document.getElementById('btnAdicionarItem').addEventListener('click', adicionarItem);
    
    // Permitir adicionar item com Enter
    document.getElementById('itemValor').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adicionarItem();
        }
    });
}

// Evento de limpar orçamento
if (document.getElementById('btnLimpar')) {
    document.getElementById('btnLimpar').addEventListener('click', limparOrcamento);
}

// Evento de gerar PDF
if (document.getElementById('btnPDF')) {
    document.getElementById('btnPDF').addEventListener('click', gerarPDF);
}

// Upload de mídia (Fotos e Vídeos)
if (document.getElementById('uploadArea')) {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', function() {
        const arquivos = Array.from(this.files);
        
        arquivos.forEach(arquivo => {
            // Validar tipo de arquivo
            if (!arquivo.type.startsWith('image/') && !arquivo.type.startsWith('video/')) {
                alert('Por favor, selecione apenas imagens ou vídeos!');
                return;
            }
            
            // Ler arquivo e armazenar
            const reader = new FileReader();
            reader.onload = function(e) {
                const midia = {
                    id: Date.now() + Math.random(),
                    tipo: arquivo.type.startsWith('image/') ? 'imagem' : 'video',
                    nome: arquivo.name,
                    dados: e.target.result
                };
                
                midias.push(midia);
                adicionarMidiaAoDOM(midia);
            };
            reader.readAsDataURL(arquivo);
        });
    });
}

// Adicionar mídia ao DOM
function adicionarMidiaAoDOM(midia) {
    const container = document.getElementById('midiaLista');
    const div = document.createElement('div');
    div.className = 'midia-item';
    div.id = 'midia-' + midia.id;
    
    if (midia.tipo === 'imagem') {
        div.innerHTML = `
            <img src="${midia.dados}" alt="${midia.nome}">
            <button class="btn-remover-midia" onclick="removerMidia(${midia.id})">✕</button>
        `;
    } else {
        div.innerHTML = `
            <video controls style="width: 100%; height: 150px;">
                <source src="${midia.dados}" type="${midia.tipo}">
            </video>
            <button class="btn-remover-midia" onclick="removerMidia(${midia.id})">✕</button>
        `;
    }
    
    container.appendChild(div);
}

// Remover mídia
function removerMidia(midiaId) {
    const elemento = document.getElementById('midia-' + midiaId);
    if (elemento) {
        elemento.remove();
        midias = midias.filter(m => m.id !== midiaId);
    }
}

// Permitir drag and drop para upload de arquivos
if (document.getElementById('uploadArea')) {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.backgroundColor = '#f5f2fb';
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.backgroundColor = '#faf9fc';
        });
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
    });
}

// Definir data de hoje como padrão
if (document.getElementById('dataOrcamento')) {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataOrcamento').value = hoje;
}

// Inicialização
if (document.getElementById('listaOrcamentos')) {
    window.addEventListener('load', function() {
        carregarOrcamentos();
    });
}

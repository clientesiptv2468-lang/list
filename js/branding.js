// Sistema de Personalização e Branding

// Cores padrão (azul + cinza prateado)
const coresPadrao = {
    primaria: '#0066cc',
    secundaria: '#7a7a7a',
    texto: '#333333',
    fundo: '#f5f5f5'
};

// Obter configurações de branding
function obterConfigBranding() {
    const config = localStorage.getItem('config_branding');
    if (config) {
        return JSON.parse(config);
    }
    // Padrão na primeira vez
    return {
        nomeEmpresa: 'CAST',
        nomeApp: 'ORÇAMENTO EXPRESSO',
        email: 'contato@castservicos.com',
        telefone: '(11) 0000-0000',
        endereco: '',
        logo: null,
        corPrimaria: coresPadrao.primaria,
        corSecundaria: coresPadrao.secundaria,
        corPainelPDF: coresPadrao.primaria
    };
}

// Salvar configurações de branding
function salvarConfigBranding(config) {
    localStorage.setItem('config_branding', JSON.stringify(config));
    aplicarTema();
    return { sucesso: true, mensagem: 'Configurações salvas com sucesso!' };
}

// Aplicar tema CSS dinâmico
function aplicarTema() {
    const config = obterConfigBranding();
    
    // Criar ou atualizar estilo dinâmico
    let style = document.getElementById('branding-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'branding-style';
        document.head.appendChild(style);
    }
    
    style.innerHTML = `
        :root {
            --cor-primaria: ${config.corPrimaria};
            --cor-secundaria: ${config.corSecundaria};
        }
        
        .header {
            background: linear-gradient(135deg, ${config.corPrimaria} 0%, ${config.corSecundaria} 100%) !important;
        }
        
        .login-body {
            background: linear-gradient(135deg, ${config.corPrimaria} 0%, ${config.corSecundaria} 100%) !important;
        }
        
        .btn-login:hover {
            box-shadow: 0 5px 15px rgba(0, 102, 204, 0.4);
        }
        
        .btn-primario {
            background: linear-gradient(135deg, ${config.corPrimaria} 0%, ${config.corSecundaria} 100%) !important;
        }
        
        .login-title {
            color: ${config.corPrimaria} !important;
        }
        
        section h2 {
            color: ${config.corPrimaria} !important;
            border-bottom-color: ${config.corPrimaria} !important;
        }
        
        .total-section {
            background: linear-gradient(135deg, ${config.corPrimaria} 0%, ${config.corSecundaria} 100%) !important;
        }
        
        .tabela-itens thead {
            background-color: ${config.corPrimaria} !important;
        }
        
        .btn-adicionar {
            background-color: ${config.corPrimaria} !important;
        }
        
        .btn-adicionar:hover {
            background-color: ${config.corSecundaria} !important;
        }
    `;
}

// Obter logo como Data URL
function obterLogo() {
    const config = obterConfigBranding();
    return config.logo;
}

// Salvar logo
function salvarLogo(dataUrl) {
    const config = obterConfigBranding();
    config.logo = dataUrl;
    salvarConfigBranding(config);
}

// Renderizar logo no header
function renderizarLogo() {
    const config = obterConfigBranding();
    const logo = document.querySelector('.logo-empresa');
    
    if (logo && config.logo) {
        logo.innerHTML = `<img src="${config.logo}" style="height: 40px; margin-right: 10px;"> ${config.nomeEmpresa}`;
    }
}

// Atualizar título do app
function atualizarTituloApp() {
    const config = obterConfigBranding();
    const titulo = document.querySelector('.login-title');
    if (titulo) {
        titulo.textContent = config.nomeApp;
    }
}

// Inicializar branding
function inicializarBranding() {
    aplicarTema();
    renderizarLogo();
    atualizarTituloApp();
}

// Executar ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarBranding);
} else {
    inicializarBranding();
}

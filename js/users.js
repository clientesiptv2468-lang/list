// Sistema de Gerenciamento de Usuários (Admin)

// Gerar senha aleatória
function gerarSenhaAleatoria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let senha = '';
    for (let i = 0; i < 12; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
}

// Gerar ID único
function gerarId() {
    return 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Criar novo usuário
function criarNovoUsuario(nome, email) {
    const usuarios = localStorage.getItem('usuarios_sistema');
    const usuariosArray = usuarios ? JSON.parse(usuarios) : [];
    
    // Verificar se email já existe
    if (usuariosArray.some(u => u.email === email)) {
        return { sucesso: false, erro: 'Email já cadastrado!' };
    }
    
    const senhaGerada = gerarSenhaAleatoria();
    const novoUsuario = {
        id: gerarId(),
        nome: nome,
        email: email,
        senha: senhaGerada,
        papel: 'usuario',
        ativo: true,
        senhaAlterada: false,
        dataCriacao: new Date().toLocaleString('pt-BR'),
        dataUltimaAlteracao: null
    };
    
    usuariosArray.push(novoUsuario);
    localStorage.setItem('usuarios_sistema', JSON.stringify(usuariosArray));
    
    return { sucesso: true, usuario: novoUsuario };
}

// Listar todos os usuários
function listarUsuarios() {
    const usuarios = localStorage.getItem('usuarios_sistema');
    return usuarios ? JSON.parse(usuarios) : [];
}

// Atualizar status do usuário
function atualizarStatusUsuario(usuarioId, ativo) {
    const usuarios = localStorage.getItem('usuarios_sistema');
    const usuariosArray = usuarios ? JSON.parse(usuarios) : [];
    
    const index = usuariosArray.findIndex(u => u.id === usuarioId);
    if (index !== -1) {
        usuariosArray[index].ativo = ativo;
        localStorage.setItem('usuarios_sistema', JSON.stringify(usuariosArray));
        return { sucesso: true };
    }
    return { sucesso: false, erro: 'Usuário não encontrado' };
}

// Deletar usuário
function deletarUsuario(usuarioId) {
    const usuarios = localStorage.getItem('usuarios_sistema');
    let usuariosArray = usuarios ? JSON.parse(usuarios) : [];
    
    usuariosArray = usuariosArray.filter(u => u.id !== usuarioId);
    localStorage.setItem('usuarios_sistema', JSON.stringify(usuariosArray));
    
    // Deletar orçamentos do usuário
    const orcamentos = localStorage.getItem('orcamentos_' + usuarioId);
    if (orcamentos) {
        localStorage.removeItem('orcamentos_' + usuarioId);
    }
    
    return { sucesso: true };
}

// Resetar senha do usuário
function resetarSenhaUsuario(usuarioId) {
    const usuarios = localStorage.getItem('usuarios_sistema');
    const usuariosArray = usuarios ? JSON.parse(usuarios) : [];
    
    const index = usuariosArray.findIndex(u => u.id === usuarioId);
    if (index !== -1) {
        const novaSenha = gerarSenhaAleatoria();
        usuariosArray[index].senha = novaSenha;
        usuariosArray[index].senhaAlterada = false;
        usuariosArray[index].dataUltimaAlteracao = new Date().toLocaleString('pt-BR');
        localStorage.setItem('usuarios_sistema', JSON.stringify(usuariosArray));
        return { sucesso: true, novaSenha };
    }
    return { sucesso: false, erro: 'Usuário não encontrado' };
}

// Renderizar tabela de usuários
function renderizarUsuarios() {
    const usuarios = listarUsuarios();
    const container = document.getElementById('tabelaUsuariosBody');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (usuarios.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum usuário cadastrado</td></tr>';
        return;
    }
    
    usuarios.forEach(usuario => {
        const linha = document.createElement('tr');
        const statusBadge = usuario.ativo ? 
            '<span style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Ativo</span>' :
            '<span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Inativo</span>';
        
        const senhaStatus = usuario.senhaAlterada ? 
            '<span style="color: #4caf50;">✓ Alterada</span>' :
            '<span style="color: #ff9800;">⚠ Padrão</span>';
        
        linha.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td><code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${usuario.senha}</code></td>
            <td>${senhaStatus}</td>
            <td>${statusBadge}</td>
            <td>
                <button onclick="toggleStatusUsuario('${usuario.id}', ${!usuario.ativo})" class="btn-small" style="background: ${usuario.ativo ? '#f44336' : '#4caf50'};">
                    ${usuario.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button onclick="resetarSenha('${usuario.id}')" class="btn-small" style="background: #ff9800;">Reset Senha</button>
                <button onclick="deletarUsuarioConfirm('${usuario.id}', '${usuario.nome}')" class="btn-small" style="background: #f44336;">Deletar</button>
            </td>
        `;
        container.appendChild(linha);
    });
}

// Toggle status do usuário
function toggleStatusUsuario(usuarioId, novoStatus) {
    atualizarStatusUsuario(usuarioId, novoStatus);
    renderizarUsuarios();
}

// Deletar usuário com confirmação
function deletarUsuarioConfirm(usuarioId, nome) {
    if (confirm(`Tem certeza que deseja deletar ${nome}? Todos seus orçamentos também serão deletados!`)) {
        deletarUsuario(usuarioId);
        renderizarUsuarios();
        alert('Usuário deletado com sucesso!');
    }
}

// Resetar senha com confirmação
function resetarSenha(usuarioId) {
    const usuario = listarUsuarios().find(u => u.id === usuarioId);
    const resultado = resetarSenhaUsuario(usuarioId);
    
    if (resultado.sucesso) {
        alert(`Senha resetada para ${usuario.nome}!\n\nNova senha: ${resultado.novaSenha}`);
        renderizarUsuarios();
    }
}

// Evento de adicionar novo usuário
if (document.getElementById('formNovoUsuario')) {
    document.getElementById('formNovoUsuario').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nomeUsuario').value;
        const email = document.getElementById('emailUsuario').value;
        
        const resultado = criarNovoUsuario(nome, email);
        
        if (resultado.sucesso) {
            alert(`Usuário criado com sucesso!\n\nEmail: ${resultado.usuario.email}\nSenha: ${resultado.usuario.senha}`);
            this.reset();
            renderizarUsuarios();
        } else {
            alert('Erro: ' + resultado.erro);
        }
    });
}

// Exportar usuários como JSON
function exportarUsuarios() {
    const usuarios = listarUsuarios();
    const dataStr = JSON.stringify(usuarios, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios_' + new Date().getTime() + '.json';
    link.click();
}

// Importar usuários de JSON
function importarUsuarios(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const usuarios = JSON.parse(e.target.result);
            if (Array.isArray(usuarios)) {
                localStorage.setItem('usuarios_sistema', JSON.stringify(usuarios));
                alert('Usuários importados com sucesso!');
                renderizarUsuarios();
            } else {
                alert('Formato de arquivo inválido!');
            }
        } catch (erro) {
            alert('Erro ao importar arquivo: ' + erro.message);
        }
    };
    reader.readAsText(arquivo);
}

// Inicializar
if (document.getElementById('tabelaUsuariosBody')) {
    renderizarUsuarios();
}

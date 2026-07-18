// Sistema de Autenticação Segura com Isolamento de Dados

// Obter todos os usuários do localStorage
function obterTodosUsuarios() {
    const usuarios = localStorage.getItem('usuarios_sistema');
    return usuarios ? JSON.parse(usuarios) : [];
}

// Obter usuário por ID
function obterUsuarioPorId(usuarioId) {
    const usuarios = obterTodosUsuarios();
    return usuarios.find(u => u.id === usuarioId);
}

// Verificar autenticação
function verificarAutenticacao() {
    const usuarioAutenticado = sessionStorage.getItem('usuarioAutenticado');
    return usuarioAutenticado !== null;
}

// Obter usuário autenticado
function obterUsuarioAutenticado() {
    const usuarioId = sessionStorage.getItem('usuarioAutenticado');
    if (!usuarioId) return null;
    return obterUsuarioPorId(usuarioId);
}

// Fazer login
function fazerLoginSeguro(email, senha) {
    const usuarios = obterTodosUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha && u.ativo);
    
    if (usuario) {
        sessionStorage.setItem('usuarioAutenticado', usuario.id);
        sessionStorage.setItem('usuarioEmail', usuario.email);
        return { sucesso: true, usuario };
    }
    return { sucesso: false, erro: 'Email ou senha inválidos!' };
}

// Fazer logout
function fazerLogout() {
    sessionStorage.removeItem('usuarioAutenticado');
    sessionStorage.removeItem('usuarioEmail');
    sessionStorage.removeItem('senhaAlterada');
    window.location.href = 'index.html';
}

// Alterar senha do usuário
function alterarSenhaUsuario(senhaAtual, novaSenha) {
    const usuario = obterUsuarioAutenticado();
    if (!usuario) {
        return { sucesso: false, erro: 'Usuário não autenticado' };
    }

    if (usuario.senha !== senhaAtual) {
        return { sucesso: false, erro: 'Senha atual incorreta!' };
    }

    const usuarios = obterTodosUsuarios();
    const index = usuarios.findIndex(u => u.id === usuario.id);
    
    if (index !== -1) {
        usuarios[index].senha = novaSenha;
        usuarios[index].senhaAlterada = true;
        usuarios[index].dataUltimaAlteracao = new Date().toLocaleString('pt-BR');
        localStorage.setItem('usuarios_sistema', JSON.stringify(usuarios));
        sessionStorage.setItem('senhaAlterada', 'true');
        return { sucesso: true, mensagem: 'Senha alterada com sucesso!' };
    }
    return { sucesso: false, erro: 'Erro ao alterar senha' };
}

// Evento de submit do formulário de login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const mensagemErro = document.getElementById('mensagemErro');
        
        const resultado = fazerLoginSeguro(email, senha);
        
        if (resultado.sucesso) {
            if (!resultado.usuario.senhaAlterada) {
                // Primeira vez - exigir mudança de senha
                sessionStorage.setItem('primeiroLogin', 'true');
            }
            window.location.href = 'dashboard.html';
        } else {
            mensagemErro.textContent = resultado.erro;
            mensagemErro.classList.add('visible');
            document.getElementById('senha').value = '';
        }
    });
}

// Verificar autenticação no dashboard
if (document.getElementById('btnSair')) {
    if (!verificarAutenticacao()) {
        window.location.href = 'index.html';
    } else {
        const usuario = obterUsuarioAutenticado();
        if (usuario) {
            document.getElementById('usuarioNome').textContent = 'Usuário: ' + usuario.nome;
            document.getElementById('btnSair').addEventListener('click', fazerLogout);
        }
    }
}

// Verificar autenticação no admin
if (document.getElementById('abaUsuarios')) {
    if (!verificarAutenticacao()) {
        window.location.href = 'index.html';
    } else {
        const usuario = obterUsuarioAutenticado();
        if (!usuario || usuario.papel !== 'admin') {
            window.location.href = 'dashboard.html';
        }
    }
}

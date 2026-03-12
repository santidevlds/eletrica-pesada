document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inicia os ícones
    lucide.createIcons();

    // 2. Configuração do Supabase (COLOQUE SUAS CHAVES AQUI!)
    const SUPABASE_URL = 'https://awijcwyoejcnmgjaiqtk.supabase.co'; 
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aWpjd3lvZWpjbm1namFpcXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzU2NjYsImV4cCI6MjA4ODg1MTY2Nn0.6MNvTaQkT8oYR88hR9u4xqt-BgD_DJrydaiHVGdRb98'; 
    
    let supabase;
    try {
        if(SUPABASE_URL.startsWith('http')) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        } else {
            console.warn("Aviso: Chaves do Supabase não configuradas.");
        }
    } catch (error) {
        console.error("Erro ao iniciar Supabase:", error);
    }

    // 3. Verifica se já está logado
    async function checarSessao() {
        if(!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.location.href = 'index.html';
        }
    }
    checarSessao();

    // 4. Mapeamento de Elementos (Telas e Links)
    const boxLogin = document.getElementById('box-login');
    const boxRegistro = document.getElementById('box-registro');
    const linkIrRegistro = document.getElementById('link-ir-registro');
    const linkIrLogin = document.getElementById('link-ir-login');
    const tituloTela = document.getElementById('titulo-tela');

    // Trocar para a tela de Registro
    linkIrRegistro.addEventListener('click', () => {
        boxLogin.style.display = 'none';
        boxRegistro.style.display = 'block';
        tituloTela.innerText = "Criar Nova Conta";
    });

    // Trocar para a tela de Login
    linkIrLogin.addEventListener('click', () => {
        boxRegistro.style.display = 'none';
        boxLogin.style.display = 'block';
        tituloTela.innerText = "Acesso ao Sistema";
    });

    // 5. Lógica de Login
    const btnEntrar = document.getElementById('btnEntrar');
    const msgLogin = document.getElementById('msg-login');

    btnEntrar.addEventListener('click', async () => {
        if(!supabase) return msgLogin.innerText = "Banco de dados não configurado.";
        
        const email = document.getElementById('email-login').value.trim();
        const password = document.getElementById('senha-login').value.trim();
        
        if(!email || !password) return msgLogin.innerText = "Preencha e-mail e senha.";

        msgLogin.innerText = "Autenticando...";
        btnEntrar.disabled = true;

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            msgLogin.innerText = "Erro: " + error.message;
            btnEntrar.disabled = false;
        } else {
            msgLogin.innerText = "Sucesso! Entrando...";
            window.location.href = 'index.html';
        }
    });

    // 6. Lógica de Cadastro (Registro)
    const btnCadastrar = document.getElementById('btnCadastrar');
    const msgReg = document.getElementById('msg-reg');

    btnCadastrar.addEventListener('click', async () => {
        if(!supabase) return msgReg.innerText = "Banco de dados não configurado.";

        const email = document.getElementById('email-reg').value.trim();
        const password = document.getElementById('senha-reg').value.trim();
        
        if(!email || password.length < 6) {
            return msgReg.innerText = "Insira um e-mail válido e senha de no mínimo 6 caracteres.";
        }

        msgReg.innerText = "Criando conta...";
        btnCadastrar.disabled = true;

        const { data, error } = await supabase.auth.signUp({ email, password });
        
        if (error) {
            msgReg.innerText = "Erro: " + error.message;
            btnCadastrar.disabled = false;
        } else {
            // Como desativamos a confirmação de e-mail no painel, o Supabase 
            // já loga o usuário automaticamente. Basta redirecionar!
            msgReg.innerText = "Conta criada! Entrando no sistema...";
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000); // Aguarda 1 segundinho pra pessoa ler a mensagem
        }
    });
});
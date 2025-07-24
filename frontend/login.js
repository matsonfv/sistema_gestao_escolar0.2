document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const username = usernameInput.value; // Pode ser e-mail ou o nome de usuário
            const password = passwordInput.value;

            // Recupera as credenciais do usuário registrado do localStorage
            const storedUser = localStorage.getItem('registeredUser');
            let authenticated = false;

            if (storedUser) {
                const user = JSON.parse(storedUser);
                // Verifica se o username/email OU o nome E a senha correspondem
                if ((username === user.email || username === user.name) && password === user.password) {
                    authenticated = true;
                }
            } else {
                // Fallback para credenciais hardcoded se nenhum usuário estiver registrado
                if (username === 'admin' && password === 'admin123') {
                    authenticated = true;
                }
            }

            if (authenticated) {
                alert('Login bem-sucedido! Redirecionando para o painel.');
                window.location.href = 'index.html'; // Redireciona para a página principal da aplicação
            } else {
                alert('Credenciais inválidas. Verifique seu e-mail/usuário e senha.');
            }
        });
    }
});
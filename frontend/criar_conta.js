document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            const nameInput = document.getElementById('register-name');
            const emailInput = document.getElementById('register-email');
            const passwordInput = document.getElementById('register-password');
            const confirmPasswordInput = document.getElementById('register-confirm-password');

            const name = nameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (password !== confirmPassword) {
                alert('As senhas não coincidem. Por favor, tente novamente.');
                return;
            }

            // Em uma aplicação real, você enviaria esses dados para um servidor.
            // Para esta demonstração, vamos armazená-los no localStorage.
            const user = {
                name: name,
                email: email,
                password: password // ATENÇÃO: Em produção, nunca armazene senhas em texto puro! Use hash e salt.
            };

            // Armazena os dados do usuário no localStorage. Usamos 'registeredUser' como chave.
            localStorage.setItem('registeredUser', JSON.stringify(user));
            
            alert('Conta criada com sucesso! Você será redirecionado para a página de login.');
            window.location.href = 'login.html'; // Redireciona para a página de login
        });
    }
});
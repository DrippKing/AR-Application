document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const submitButton = registerForm.querySelector('button[type="submit"]');

      if (!name || !email || !password) {
        alert('Por favor, completa todos los campos.');
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Creando cuenta...';

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombre: name, correo: email, password }),
        });

        const data = await response.json();

        if (data.success) {
          alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
          window.location.href = '/login';
        } else {
          alert(`Error al registrar: ${data.message}`);
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Crear cuenta';
      }
    });
  }
});
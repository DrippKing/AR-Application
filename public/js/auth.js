document.addEventListener('DOMContentLoaded', async () => {
  const profileBtn = document.getElementById('profile-btn');
  const loginForm = document.getElementById('login-form');

  // Lógica para el botón de perfil (presente en varias páginas)
  if (profileBtn) {
    const userId = localStorage.getItem('worldscan_userId');

    if (userId) {
      // Si el usuario está logueado, buscamos su nombre para mostrarlo en el botón.
      try {
        const response = await fetch(`/api/user/${userId}`);
        const data = await response.json();
        if (data.success) {
          // Usamos el primer nombre para que no sea tan largo.
          profileBtn.textContent = data.user.nombre.split(' ')[0];
        }
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
        profileBtn.textContent = 'Perfil'; // Fallback en caso de error
      }
    } else {
      // Si no hay usuario, el botón dirá "Iniciar Sesión".
      profileBtn.textContent = 'Iniciar Sesión';
    }

    profileBtn.addEventListener('click', () => {
      // Si hay un ID de usuario, redirige al perfil. Si no, a la página de login.
      window.location.href = userId ? '/profile' : '/login';
    });
  }

  // Nueva lógica para la página de login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Previene el envío real del formulario

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const submitButton = loginForm.querySelector('button[type="submit"]');

      submitButton.disabled = true;
      submitButton.textContent = 'Verificando...';

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
          // Guardamos el ID del usuario en localStorage
          localStorage.setItem('worldscan_userId', data.user.id);
          alert(`¡Bienvenido, ${data.user.nombre}! Redirigiendo a tu perfil.`);
          window.location.href = '/profile';
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        alert('Error de conexión. No se pudo contactar al servidor.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Ingresar';
      }
    });
  }
});

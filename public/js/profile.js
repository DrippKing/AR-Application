document.addEventListener('DOMContentLoaded', async () => {
  // Obtener elementos del DOM
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profilePoints = document.getElementById('profile-points');
  const profileInitials = document.getElementById('profile-initials');
  const logoutBtn = document.getElementById('logout-btn');

  // 1. Verificar si hay un usuario logueado
  const userId = localStorage.getItem('worldscan_userId');

  if (!userId) {
    // Si no hay ID, no debería estar aquí. Redirigir a login.
    alert('No has iniciado sesión. Redirigiendo...');
    window.location.href = '/login';
    return;
  }

  // 2. Obtener los datos del usuario desde el servidor
  try {
    const response = await fetch(`/api/user/${userId}`);
    const data = await response.json();

    if (data.success) {
      const user = data.user;

      // 3. Rellenar la página con la información real
      profileName.textContent = user.nombre;
      profileEmail.textContent = user.correo;
      profilePoints.textContent = user.points;

      // Calcular iniciales para el avatar
      const initials = user.nombre
        .split(' ')
        .map(name => name[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      profileInitials.textContent = initials;

    } else {
      // El servidor no encontró al usuario (ID inválido, etc.)
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    alert('Hubo un problema al cargar tu perfil. Por favor, intenta iniciar sesión de nuevo.');
    localStorage.removeItem('worldscan_userId'); // Limpiar ID inválido
    window.location.href = '/login';
  }

  // 4. Lógica para cerrar sesión
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('worldscan_userId');
    alert('Has cerrado la sesión.');
    window.location.href = '/home';
  });
});
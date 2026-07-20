document.addEventListener('DOMContentLoaded', () => {
  const authPanel = document.getElementById('auth-panel');
  const authLoggedOut = document.getElementById('auth-logged-out');
  const authLoggedIn = document.getElementById('auth-logged-in');
  const authMessage = document.getElementById('auth-message');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const logoutBtn = document.getElementById('logout-btn');

  const tabs = Array.from(document.querySelectorAll('.auth-tab'));
  const views = {
    login: loginForm,
    register: registerForm,
  };

  function setMessage(text, type = '') {
    if (!authMessage) return;
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`.trim();
  }

  function showAuthView(viewName) {
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.authView === viewName);
    });

    Object.entries(views).forEach(([name, form]) => {
      form.classList.toggle('auth-hidden', name !== viewName);
    });
  }

  function renderAuthState(user) {
    if (!authLoggedOut || !authLoggedIn || !profileName || !profileEmail) return;

    if (user) {
      authLoggedOut.classList.add('auth-hidden');
      authLoggedIn.classList.remove('auth-hidden');
      profileName.textContent = user.nombre || 'Usuario';
      profileEmail.textContent = user.correo || '';
      setMessage('Sesión activa', 'success');
    } else {
      authLoggedOut.classList.remove('auth-hidden');
      authLoggedIn.classList.add('auth-hidden');
      setMessage('', '');
    }
  }

  function saveUser(user) {
    localStorage.setItem('worldscanUser', JSON.stringify(user));
  }

  function loadUser() {
    try {
      const raw = localStorage.getItem('worldscanUser');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function clearUser() {
    localStorage.removeItem('worldscanUser');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showAuthView(tab.dataset.authView));
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(loginForm));

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || 'No se pudo iniciar sesión.', 'error');
        return;
      }

      saveUser(data.user);
      renderAuthState(data.user);
      loginForm.reset();
    } catch (error) {
      setMessage('Error de conexión con el servidor.', 'error');
    }
  });

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(registerForm));

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || 'No se pudo crear la cuenta.', 'error');
        return;
      }

      saveUser(data.user);
      renderAuthState(data.user);
      registerForm.reset();
    } catch (error) {
      setMessage('Error de conexión con el servidor.', 'error');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    clearUser();
    renderAuthState(null);
  });

  const savedUser = loadUser();
  renderAuthState(savedUser);
  showAuthView(savedUser ? 'login' : 'login');
});

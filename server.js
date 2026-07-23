const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3001;
const htmlDir = path.join(__dirname, 'public', 'html');

function sendHtmlPage(res, pageName) {
    const filePath = path.join(htmlDir, `${pageName}.html`);
    // fs.existsSync es síncrono, es mejor usar res.sendFile que maneja errores y streaming.
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Página no encontrada');
        }
    });
}

// 1. Cargar Base de Datos Local (JSON)
const dbPath = path.join(__dirname, 'database.json');
let db = { paises: [], trivias: [], usuarios: [] };

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
    console.log('✅ Base de datos JSON conectada exitosamente.');
} catch (error) {
    console.error('❌ Error al cargar database.json:', error.message);
    console.log('Asegúrate de que el archivo database.json existe en la raíz del proyecto.');
}

// 2. Servir archivos estáticos (CSS, JS, Assets) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Middleware para parsear JSON en el body de las peticiones POST
app.use(express.json());

// 2. Servir archivos estáticos (HTML, CSS, JS, Assets)
app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get(['/home', '/home.html'], (req, res) => {
    sendHtmlPage(res, 'home');
});

app.get(['/scanner', '/scanner.html'], (req, res) => {
    sendHtmlPage(res, 'scanner');
});

app.get(['/store', '/store.html'], (req, res) => {
    sendHtmlPage(res, 'store');
});

app.get(['/rewards', '/rewards.html'], (req, res) => {
    sendHtmlPage(res, 'rewards');
});

app.get(['/filtros', '/filtros.html'], (req, res) => {
    sendHtmlPage(res, 'filtros');
});

app.get('/html/:page.html', (req, res) => {
    sendHtmlPage(res, req.params.page);
});

// Ruta corregida para servir los parciales de los modales.
// Ahora acepta el nombre completo del archivo (ej: 'modal-video.html')
app.get('/html/partials/:partialName', (req, res) => {
    const partialName = req.params.partialName;
    // Asegurarnos de que no se intente acceder a archivos fuera del directorio 'partials'
    if (partialName.includes('..')) {
        return res.status(400).send('Nombre de archivo inválido');
    }
    const filePath = path.join(htmlDir, 'partials', partialName);
    res.sendFile(filePath, (err) => { if (err) res.status(404).send('Parcial no encontrado'); });
});

app.get(['/profile', '/profile.html'], (req, res) => {
    sendHtmlPage(res, 'profile');
});

app.get(['/login', '/login.html'], (req, res) => {
    sendHtmlPage(res, 'login');
});

app.get(['/login', '/login.html'], (req, res) => {
    sendHtmlPage(res, 'login');
});

app.get('/html', (req, res) => {
    res.redirect('/home');
});

// 3. API Endpoints (Para que el Frontend consuma datos)

// Obtener información general de un país por su código (ej: MEX)
app.get('/api/pais/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    
    // Buscamos el país en nuestro array cargado en memoria
    const pais = db.paises.find(p => p.codigo === codigo);
    
    if (!pais) {
        return res.status(404).json({ message: 'País no encontrado' });
    }
    res.json(pais);
});

// Obtener trivia de un país
app.get('/api/trivia/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    
    // Filtramos las trivias que coincidan con el código de país
    const triviasDelPais = db.trivias.filter(t => t.pais_codigo === codigo);
    res.json(triviasDelPais);
});

// Obtener lista completa de países / productos para la tienda
app.get('/api/paises', (req, res) => {
    res.json(db.paises);
});

// Endpoint para autenticar usuarios
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos.' });
    }

    const user = db.usuarios.find(u => u.correo.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    // Si las credenciales son correctas, enviamos los datos del usuario (sin la contraseña)
    res.json({
        success: true,
        user: { id: user.id, nombre: user.nombre, correo: user.correo, points: user.Points }
    });
});

// Endpoint para obtener datos de un usuario por su ID
app.get('/api/user/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: 'ID de usuario inválido.' });
    }

    const user = db.usuarios.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // Devolvemos los datos del usuario, EXCLUYENDO la contraseña por seguridad.
    res.json({ success: true, user: { id: user.id, nombre: user.nombre, correo: user.correo, points: user.Points } });
});

// Endpoint para añadir puntos a un usuario
app.post('/api/user/add-points', (req, res) => {
    const { userId, pointsToAdd } = req.body;

    if (!userId || !pointsToAdd) {
        return res.status(400).json({ success: false, message: 'Se requiere ID de usuario y puntos a añadir.' });
    }

    const userIndex = db.usuarios.findIndex(u => u.id === parseInt(userId, 10));

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // Actualizar los puntos del usuario
    db.usuarios[userIndex].Points += parseInt(pointsToAdd, 10);

    // Guardar la base de datos actualizada en el archivo
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

    // Devolver el usuario actualizado (sin la contraseña)
    const { password, ...userWithoutPassword } = db.usuarios[userIndex];
    res.json({ success: true, user: userWithoutPassword });
});

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
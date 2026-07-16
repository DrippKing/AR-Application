const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// 1. Cargar Base de Datos Local (JSON)
const dbPath = path.join(__dirname, 'db.json');
let db = { paises: [], trivias: [] };

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
    console.log('✅ Base de datos JSON conectada exitosamente.');
} catch (error) {
    console.error('❌ Error al cargar db.json:', error.message);
    console.log('Asegúrate de que el archivo db.json existe en la raíz del proyecto.');
}

// 2. Servir archivos estáticos (HTML, CSS, JS, Assets)
app.use(express.static(path.join(__dirname, 'public')));

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

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
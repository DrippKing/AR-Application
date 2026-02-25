const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// 1. Configuración de la Base de Datos
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // CAMBIAR POR TU USUARIO
    password: 'root',      // CAMBIAR POR TU CONTRASEÑA
    database: 'mundial_ar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificación inicial de conexión (opcional, pero útil para debug)
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err);
    } else {
        console.log('✅ Conectado a MySQL (Pool activo)');
        connection.release(); // Liberamos la conexión para que el pool la use
    }
});

// 2. Servir archivos estáticos (HTML, CSS, JS, Assets)
app.use(express.static(path.join(__dirname, 'public')));

// 3. API Endpoints (Para que el Frontend consuma datos)

// Obtener información general de un país por su código (ej: MEX)
app.get('/api/pais/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const sql = `
        SELECT p.*, e.nombre as estadio_nombre, e.ciudad as estadio_ciudad, e.capacidad 
        FROM paises p 
        LEFT JOIN estadios e ON p.id = e.pais_id 
        WHERE p.codigo = ?`;

    db.query(sql, [codigo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'País no encontrado' });
        res.json(results[0]);
    });
});

// Obtener trivia de un país
app.get('/api/trivia/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const sql = `
        SELECT t.id, t.pregunta, t.opciones, t.respuesta_correcta 
        FROM trivias t
        JOIN paises p ON t.pais_id = p.id
        WHERE p.codigo = ?`;

    db.query(sql, [codigo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Parsear las opciones que vienen como string JSON desde MySQL
        const triviaLimpia = results.map(row => {
            try {
                return { ...row, opciones: JSON.parse(row.opciones) };
            } catch (e) {
                console.error(`⚠️ Error parseando JSON en trivia (ID: ${row.id}):`, row.opciones);
                // Fallback: Si falla el JSON, intentamos separar por comas o devolver array vacío
                const opcionesFallback = row.opciones && typeof row.opciones === 'string' ? row.opciones.split(',') : [];
                return { ...row, opciones: opcionesFallback };
            }
        });
        res.json(triviaLimpia);
    });
});

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
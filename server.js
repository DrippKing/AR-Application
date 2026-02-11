const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir archivos estáticos (HTML, CSS, JS, Modelos 3D, .mind files)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API opcional para datos en tiempo real
app.get('/api/info-pais/:pais', (req, res) => {
    const datos = {
        'colombia': { grupo: 'C', estadio: 'Azteca (CDMX)', partidos: 'vs Uzbekistán' },
        'coreadelsur': { grupo: 'A', estadio: 'CDMX, GDL y MTY', partidos: 'Fase de Grupos' },
        'espana': { grupo: 'B', estadio: 'Akron (GDL)', partidos: 'vs Uruguay' },
        'japon': { grupo: 'D', estadio: 'BBVA (MTY)', partidos: 'Fase de Grupos' },
        'mexico': { grupo: 'A', estadio: 'Azteca (CDMX) y Akron (GDL)', partidos: '3 partidos (Fase de Grupos)' },
        'paisesbajos': { grupo: 'E', estadio: 'BBVA (MTY)', partidos: 'Fase de Grupos' },
        'sudafrica': { grupo: 'A', estadio: 'Azteca (CDMX)', partidos: 'Inauguración vs México' },
        'tunez': { grupo: 'F', estadio: 'BBVA (MTY)', partidos: 'Fase de Grupos' },
        'uruguay': { grupo: 'B', estadio: 'Akron (GDL)', partidos: 'vs España' },
        'uzbekistan': { grupo: 'C', estadio: 'Azteca (CDMX)', partidos: 'vs Colombia' }
    };
    res.json(datos[req.params.pais] || { error: 'País no encontrado' });
});

app.listen(PORT, () => {
    console.log(`Servidor AR corriendo en http://localhost:${PORT}`);
    // NOTA: Para probar AR en el móvil, necesitas HTTPS o usar localhost con cable USB.
});

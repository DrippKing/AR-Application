// --- HACK DE ALTA RESOLUCIÓN (S25 Ultra Fix) ---
// Interceptamos la petición de cámara para forzar Full HD
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const originalGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(constraints) {
        if (constraints && constraints.video) {
            if (typeof constraints.video === 'boolean') {
                constraints.video = { width: { ideal: 1920 }, height: { ideal: 1080 } };
            } else {
                constraints.video.width = { ideal: 1920 };
                constraints.video.height = { ideal: 1080 };
            }
            console.log("🔧 Hack Resolución: Forzando 1080p...");
        }
        return originalGUM(constraints);
    };
}

// --- DATOS DE PAÍSES ---
const countries = [
    { id: 'colombia', name: 'Colombia', color: 'yellow' },
    { id: 'coreadelsur', name: 'Corea del Sur', color: 'white' },
    { id: 'espana', name: 'España', color: 'red' },
    { id: 'japon', name: 'Japón', color: 'white' },
    { id: 'mexico', name: 'México', color: 'green' },
    { id: 'paisesbajos', name: 'Países Bajos', color: 'orange' },
    { id: 'sudafrica', name: 'Sudáfrica', color: 'yellow' },
    { id: 'tunez', name: 'Túnez', color: 'red' },
    { id: 'uruguay', name: 'Uruguay', color: 'blue' },
    { id: 'uzbekistan', name: 'Uzbekistán', color: 'blue' }
];

const scene = document.getElementById('ar-scene');
const statusText = document.getElementById('status-text');

// --- GENERACIÓN AUTOMÁTICA DE TARGETS ---
// Creamos un <a-entity> para cada país en la lista
countries.forEach((country, index) => {
    const entity = document.createElement('a-entity');
    entity.setAttribute('mindar-image-target', `targetIndex: ${index}`);
    
    // Plano de color (Clickable)
    const plane = document.createElement('a-plane');
    plane.setAttribute('class', 'clickable');
    plane.setAttribute('color', country.color);
    plane.setAttribute('opacity', '0.6');
    plane.setAttribute('height', '0.55');
    plane.setAttribute('width', '1');
    
    // Texto con el nombre
    const text = document.createElement('a-text');
    text.setAttribute('value', country.name.toUpperCase());
    text.setAttribute('align', 'center');
    text.setAttribute('position', '0 0 0.1');

    // Eventos
    entity.addEventListener('targetFound', () => {
        statusText.innerText = `Cargando datos de ${country.name}...`;
        fetch(`/api/info-pais/${country.id}`)
            .then(res => res.json())
            .then(data => {
                statusText.innerText = `${country.name.toUpperCase()}: ${data.estadio}`;
            });
    });
    
    entity.addEventListener('targetLost', () => {
        statusText.innerText = "Apunta a una bandera...";
    });

    // Click para abrir Google
    plane.addEventListener('click', () => {
        window.open(`https://www.google.com/search?q=seleccion+${country.id}+mundial+2026`, '_blank');
    });

    entity.appendChild(plane);
    entity.appendChild(text);
    scene.appendChild(entity);
});
// Arrancar MindAR con el archivo maestro de targets
scene.setAttribute('mindar-image', `imageTargetSrc: ./assets/targets.mind; uiError: yes; uiLoading: yes;`);

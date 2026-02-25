// Función para pedir datos a MySQL a través de nuestro servidor
async function cargarDatosDesdeBD(codigoPais) {
    console.log(`📡 Conectando a BD para buscar: ${codigoPais}...`);

    // LIMPIEZA: Borrar datos anteriores para no confundir al usuario
    const videoTitle = document.getElementById('video-title');
    const estadioTitle = document.getElementById('estadio-title');
    const estadioDesc = document.querySelector('#modal-estadio p');

    if (videoTitle) videoTitle.innerText = "Cargando información...";
    if (estadioTitle) estadioTitle.innerText = "Buscando estadio...";
    if (estadioDesc) estadioDesc.innerText = "";

    try {
        // 1. Pedir información general (País + Estadio)
        const respuesta = await fetch(`/api/pais/${codigoPais}`);
        
        if (!respuesta.ok) throw new Error('País no encontrado en BD');
        
        const datos = await respuesta.json();
        console.log("✅ Datos recibidos:", datos);

        // 2. Actualizar la Interfaz (DOM) con los datos reales
        
        // Actualizar Título del Video
        if (videoTitle) videoTitle.innerText = `Video oficial — ${datos.nombre}`;

        // Actualizar Info del Estadio
        
        if (estadioTitle) {
            estadioTitle.innerText = datos.estadio_nombre ? `🏟 ${datos.estadio_nombre}` : '🏟 Estadio no disponible';
        }
        if (estadioDesc) {
            const ciudad = datos.estadio_ciudad || 'N/A';
            const capacidad = datos.capacidad ? datos.capacidad.toLocaleString() : 'N/A';
            estadioDesc.innerText = `Ciudad: ${ciudad} | Capacidad: ${capacidad} espectadores.`;
        }

        // 3. Pedir Trivia (Opcional, si ya tienes la lógica de trivia lista)
        const respTrivia = await fetch(`/api/trivia/${codigoPais}`);
        if (respTrivia.ok) {
            const triviaData = await respTrivia.json();
            console.log("✅ Trivia cargada:", triviaData);
            // Si tienes una función para iniciar trivia, llámala aquí:
            // iniciarJuegoTrivia(triviaData);
        }

        return datos; // Devolvemos los datos para usarlos en script.js

    } catch (error) {
        console.error("❌ Error cargando datos:", error);
        if (estadioTitle) estadioTitle.innerText = "Error de conexión";
        if (estadioDesc) estadioDesc.innerText = "No se pudo obtener la información. Revisa la consola del navegador (F12).";
        return null; // Notifica al script principal que la carga falló.
    }
}

// Hacemos la función global para usarla en otros scripts
window.cargarDatosDesdeBD = cargarDatosDesdeBD;
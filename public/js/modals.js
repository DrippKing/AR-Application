// =====================================================
// modals.js — WorldScan 2026
// Motor para cargar y gestionar modales dinámicamente
// - Carga parciales HTML bajo demanda
// - Inicializa el script correspondiente a cada modal
// =====================================================

(function () {
  "use strict";

  const modalContainer = document.getElementById("modal-container");

  /**
   * Carga el contenido HTML de un modal desde la carpeta /partials/
   * y lo inyecta en el DOM.
   * @param {string} modalName - El nombre del modal (ej: 'video', 'trivia').
   * @param {object | null} currentCountry - El objeto del país actual detectado.
   */
  async function loadAndShowModal(modalName, currentCountry) {
    if (!modalContainer) return;

    const url = `/html/partials/${modalName}.html`; // ej: /html/partials/modal-video.html

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`No se pudo cargar el modal: ${response.statusText}`);
      }
      const htmlContent = await response.text();

      modalContainer.innerHTML = `<div id="${modalName}" class="modal">${htmlContent}</div>`;

      const newModal = document.getElementById(modalName);
      if (newModal) {
        newModal.addEventListener("click", (e) => {
          if (e.target === newModal) closeAllModals();
        });
        newModal.querySelector('[data-close]')?.addEventListener('click', closeAllModals);
      }

      // Lógica de inicialización post-carga
      if (modalName === 'modal-video') window.VideoPlayer?.initialize(currentCountry);
      if (modalName === 'modal-trivia' && currentCountry) {
        // Obtener las preguntas de la API y luego iniciar la trivia
        fetch(`/api/trivia/${currentCountry.code}`)
          .then(res => res.json())
          .then(triviaQuestions => window.Trivia?.start(currentCountry.code, triviaQuestions))
          .catch(err => console.error('Error al cargar preguntas de trivia:', err));
      }
      if (modalName === 'modal-stats') window.Stats?.render(currentCountry ? currentCountry.id : undefined);
      if (modalName === 'modal-estadio') window.Stadium?.render(currentCountry ? currentCountry.id : undefined);

    } catch (error) {
      console.error("Error al cargar el modal:", error);
      modalContainer.innerHTML = `<div class="modal"><div class="modal-card"><p>Error al cargar el contenido. Intenta de nuevo.</p><button class="primary-btn" onclick="window.ModalManager.closeAll()">Cerrar</button></div></div>`;
    }
  }

  /**
   * Cierra todos los modales eliminando el contenido del contenedor.
   */
  function closeAllModals() {
    if (modalContainer) modalContainer.innerHTML = "";
  }

  /**
   * Verifica si hay algún modal visible en la pantalla.
   * @returns {boolean}
   */
  function hasVisibleModal() {
    return modalContainer && modalContainer.innerHTML !== "";
  }

  // Exponer la API al objeto window para que otros scripts puedan usarla
  window.ModalManager = {
    load: loadAndShowModal,
    closeAll: closeAllModals,
    isVisible: hasVisibleModal,
  };

  // Listener global para la tecla 'Escape'
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
  });
})();
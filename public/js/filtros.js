// =====================================================
// WorldScan 2026 — script.js (COMPLETO)
// - MindAR targets
// - HUD aparece al detectar bandera
// - Modales abren/cierran
// - Video + filtros (solo UI): toggle "active"
//   (NO aplica filtros reales todavía; solo pinta el botón)
// =====================================================


// --- HACK DE ALTA RESOLUCIÓN (S25 Ultra Fix) ---
// Interceptamos la petición de cámara para forzar Full HD
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  const originalGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function (constraints) {
    if (constraints && constraints.video) {
      if (typeof constraints.video === "boolean") {
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
  { id: "colombia", name: "Colombia", color: "yellow" },
  { id: "coreadelsur", name: "Corea del Sur", color: "white" },
  { id: "espana", name: "España", color: "red" },
  { id: "japon", name: "Japón", color: "white" },
  { id: "mexico", name: "México", color: "green" },
  { id: "paisesbajos", name: "Países Bajos", color: "orange" },
  { id: "sudafrica", name: "Sudáfrica", color: "yellow" },
  { id: "tunez", name: "Túnez", color: "red" },
  { id: "uruguay", name: "Uruguay", color: "blue" },
  { id: "uzbekistan", name: "Uzbekistán", color: "blue" },
];

const scene = document.getElementById("ar-scene");
const statusText = document.getElementById("status-text");

// --- HUD + MODALES ---
const hud = document.getElementById("hud");
const modals = Array.from(document.querySelectorAll(".modal"));

// Video UI
const videoTitle = document.querySelector("#modal-video .video-title");
const filterButtons = Array.from(document.querySelectorAll("#modal-video .filter-chip"));
const videoPreview = document.getElementById("video-preview");

let currentCountry = null;

function setStatus(msg) {
  if (statusText) statusText.innerText = msg;
}

function showHUD() {
  if (hud) hud.classList.remove("hidden");
}

function hideHUD() {
  if (hud) hud.classList.add("hidden");
}

function closeAllModals() {
  modals.forEach((m) => m.classList.add("hidden"));
}

function openModalById(id) {
  closeAllModals();
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("hidden");
}

// Estado inicial seguro
hideHUD();
closeAllModals();


// --- HUD -> abrir modales ---
if (hud) {
  hud.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-modal]");
    if (!btn) return;

    const modalId = btn.getAttribute("data-modal");
    if (!modalId) return;

    openModalById(modalId);
  });
}


// --- Cerrar modales (X / botón Listo) ---
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) {
    closeAllModals();
  }
});

// Cerrar modal al tocar afuera del card
modals.forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAllModals();
  });
});

// Cerrar con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllModals();
});


// =====================================================
// VIDEO + FILTROS (solo UI visual)
// - Al presionar un filtro: se marca como activo
// - Cambia el texto de "Video oficial — País detectado"
// - NO aplica filtros reales aún (solo apariencia)
// =====================================================
function setActiveFilter(filterName) {
  filterButtons.forEach((b) => b.classList.remove("active"));
  const btn = filterButtons.find((b) => b.dataset.filter === filterName);
  if (btn) btn.classList.add("active");
}

let currentSingleFilter = null;
function applySingleFilterUI(name, intensity) {
  if (!videoPreview) return;
  if (name === "blur") {
    videoPreview.style.filter = `blur(${(intensity / 100) * 8}px)`;
  } else if (name === "color") {
    const sat = 1 + (intensity / 100) * 1.5;
    const con = 1 + (intensity / 100) * 0.5;
    const hue = (intensity / 100) * -45;
    videoPreview.style.filter = `saturate(${sat}) contrast(${con}) hue-rotate(${hue}deg)`;
  } else if (name === "pixel") {
    videoPreview.style.filter = `contrast(1.5) blur(${Math.max(1, (intensity/100)*4)}px)`;
  } else if (name === "thermal") {
    videoPreview.style.filter = `invert(1) hue-rotate(${(intensity/100)*180}deg) saturate(2)`;
  }
}

// Click filtros: solo activar/desactivar visual
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isActive = btn.classList.contains("active");
    filterButtons.forEach((b) => b.classList.remove("active"));
    if (!isActive) btn.classList.add("active");

    const customControls = document.getElementById("custom-filter-controls");
    const singleControl = document.getElementById("single-filter-control");
    const singleSlider = document.getElementById("slide-single");
    
    if (isActive) {
      if (customControls) customControls.classList.add("hidden");
      if (singleControl) singleControl.classList.add("hidden");
      if (videoPreview) videoPreview.style.filter = "none";
      currentSingleFilter = null;
      return;
    }

    currentSingleFilter = null;
    const name = btn.dataset.filter;
    
    if (name === "custom") {
      if (singleControl) singleControl.classList.add("hidden");
      if (customControls) customControls.classList.remove("hidden");
      applyCustomFilterUI(); 
    } else {
      if (customControls) customControls.classList.add("hidden");
      if (singleControl) singleControl.classList.remove("hidden");
      
      currentSingleFilter = name;
      if (singleSlider) {
          singleSlider.value = 50;
          applySingleFilterUI(name, 50);
      }
    }

    // Opcional: pausar/rewind para que se note que "hizo algo" (visual)
    if (videoPreview) {
      try {
        videoPreview.currentTime = 0;
        // No forzamos play porque en móvil puede bloquear autoplay
      } catch (_) {}
    }
  });
});

const singleSlider = document.getElementById("slide-single");
if (singleSlider) {
  singleSlider.addEventListener("input", (e) => {
    if (currentSingleFilter) applySingleFilterUI(currentSingleFilter, e.target.value);
  });
}

// --- Lógica del filtro en tiempo real para la maqueta ---
function applyCustomFilterUI() {
  if (!videoPreview) return;
  const blur = document.getElementById("slide-blur").value;
  const contrast = document.getElementById("slide-contrast").value;
  const saturate = document.getElementById("slide-saturate").value;
  const brightness = document.getElementById("slide-brightness").value;
  const hue = document.getElementById("slide-hue").value;

  videoPreview.style.filter = `blur(${blur}px) contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%) hue-rotate(${hue}deg)`;
}

const customSliders = document.querySelectorAll("#custom-filter-controls input[type='range']");
customSliders.forEach(slider => {
  slider.addEventListener("input", applyCustomFilterUI);
});

// --- Actualizar UI del video según país detectado ---
function updateVideoUIForCountry(country) {
  if (!country) return;

  if (videoTitle) {
    videoTitle.textContent = `Video oficial — ${country.name}`;
  }

  // Si luego agregas rutas reales por país, aquí es donde se setea:
  // videoPreview.src = `./assets/videos/${country.id}.mp4`;
  // Por ahora dejamos demo.mp4 como maqueta.
}


// =====================================================
// MindAR: generación automática de targets
// =====================================================
countries.forEach((country, index) => {
  const entity = document.createElement("a-entity");
  entity.setAttribute("mindar-image-target", `targetIndex: ${index}`);

  // Plano clickable
  const plane = document.createElement("a-plane");
  plane.setAttribute("class", "clickable");
  plane.setAttribute("color", country.color);
  plane.setAttribute("opacity", "0.6");
  plane.setAttribute("height", "0.55");
  plane.setAttribute("width", "1");

  // Texto
  const text = document.createElement("a-text");
  text.setAttribute("value", country.name.toUpperCase());
  text.setAttribute("align", "center");
  text.setAttribute("position", "0 0 0.1");

  // Eventos MindAR
  entity.addEventListener("targetFound", () => {
    currentCountry = country;

    showHUD();
    setStatus(`Cargando datos de ${country.name}...`);

    // Actualiza UI del video (título) aunque sea maqueta
    updateVideoUIForCountry(country);

    // Si hay backend: trae info de estadio
    fetch(`/api/info-pais/${country.id}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(`${country.name.toUpperCase()}: ${data.estadio}`);
      })
      .catch(() => {
        setStatus(`${country.name.toUpperCase()} detectado ✅`);
      });
  });

  entity.addEventListener("targetLost", () => {
    currentCountry = null;

    hideHUD();
    closeAllModals();
    setStatus("Apunta a una bandera...");
  });

  // Mantengo tu click a Google
  plane.addEventListener("click", () => {
    window.open(
      `https://www.google.com/search?q=seleccion+${country.id}+mundial+2026`,
      "_blank"
    );
  });

  entity.appendChild(plane);
  entity.appendChild(text);
  scene.appendChild(entity);
});

// Arrancar MindAR con targets
scene.setAttribute(
  "mindar-image",
  `imageTargetSrc: ./assets/targets.mind; uiError: yes; uiLoading: yes;`
);

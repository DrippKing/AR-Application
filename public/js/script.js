// =====================================================
// WorldScan 2026 — script.js (COMPLETO)
// - MindAR targets
// - HUD aparece al detectar bandera
// - Modales abren/cierran
// - Video + Acervo funcional (cambia src y título)
// - Filtros permitidos (FE) funcionales a nivel demo:
//    * Desenfoque: CSS filter (blur)
//    * Ajuste de color: CSS filter (saturate + contrast + hue-rotate)  ✅ (no es "exposición")
//    * Pixelado / Térmica / Custom: overlays visuales (NO filtros prohibidos)
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

// =====================================================
// FIX 100vh en móviles (evita saltos por barra del navegador)
// - Crea/actualiza la variable CSS --vh
// =====================================================
function setVhVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// Set inicial
setVhVar();

// Recalcular cuando cambie el tamaño (rotación / UI del navegador)
window.addEventListener("resize", setVhVar);

// iOS a veces dispara "orientationchange" aparte
window.addEventListener("orientationchange", () => {
  // pequeño delay para que el alto final se estabilice
  setTimeout(setVhVar, 150);
});


// --- DATOS DE PAÍSES ---
const countries = [
  { id: "colombia", name: "Colombia", color: "yellow", code: "COL" },
  { id: "coreadelsur", name: "Corea del Sur", color: "white", code: "KOR" },
  { id: "espana", name: "España", color: "red", code: "ESP" },
  { id: "japon", name: "Japón", color: "white", code: "JPN" },
  { id: "mexico", name: "México", color: "green", code: "MEX" },
  { id: "paisesbajos", name: "Países Bajos", color: "orange", code: "NED" },
  { id: "sudafrica", name: "Sudáfrica", color: "yellow", code: "RSA" },
  { id: "tunez", name: "Túnez", color: "red", code: "TUN" },
  { id: "uruguay", name: "Uruguay", color: "blue", code: "URU" },
  { id: "uzbekistan", name: "Uzbekistán", color: "blue", code: "UZB" },
];

const scene = document.getElementById("ar-scene");
const statusText = document.getElementById("status-text");

// --- HUD + MODALES ---
const hud = document.getElementById("hud");
const modals = Array.from(document.querySelectorAll(".modal"));

// Video editor UI
const videoModal = document.getElementById("modal-video");
const videoTitle = document.querySelector("#modal-video .video-title");
const videoPreview = document.getElementById("video-preview");
const videoItems = Array.from(document.querySelectorAll("#modal-video .video-item"));
const filterButtons = Array.from(document.querySelectorAll("#modal-video .filter-chip"));
const playerShell = document.querySelector("#modal-video .player-shell");

let currentCountry = null;

// Helpers para evitar que truene si status-text está comentado en el HTML
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
  if (!modal) return;

  modal.classList.remove("hidden");

  // ✅ reset de scroll (card y modal)
  const card = modal.querySelector(".modal-card");
  if (card) card.scrollTop = 0;
  modal.scrollTop = 0;
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

    // ✅ HOOK: iniciar trivia cuando se abre el modal
    if (modalId === "modal-trivia") {
      const countryId = currentCountry ? currentCountry.id : null;

      // Si trivia.js todavía no cargó, no truenes
      if (window.Trivia && typeof window.Trivia.start === "function") {
        window.Trivia.start(countryId);
      }
    }
  });
}



// --- Cerrar modales (X / botón Cerrar) ---
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
// VIDEO + ACERVO (funcional)
// =====================================================
function setActiveVideoItem(activeBtn) {
  videoItems.forEach((b) => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function setVideoSource(src, titleText) {
  if (!videoPreview) return;

  if (titleText && videoTitle) videoTitle.textContent = titleText;

  // Si el item no tiene src (placeholder), no hacemos nada
  if (!src) return;

  // Cambiar fuente y recargar
  videoPreview.src = src;
  try {
    videoPreview.load();
  } catch (_) {}

  // No forzamos autoplay para no pelear con políticas móviles.
}

if (videoItems.length) {
  videoItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src");
      const title = btn.getAttribute("data-title") || "Video oficial";
      setActiveVideoItem(btn);
      setVideoSource(src, title);
    });
  });
}


// =====================================================
// FILTROS (FE) — demo funcional sin usar prohibidos
// - Blur: blur()
// - Color: saturate/contrast/hue-rotate (no exposure)
// - Pixel / Thermal / Custom: overlay visual en player-shell
// =====================================================

// Crea overlay si no existe
function ensureOverlay() {
  if (!playerShell) return null;

  let overlay = playerShell.querySelector(".fx-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "fx-overlay";
    // estilos inline mínimos para que funcione aunque no tengas CSS extra
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity .12s ease";
    overlay.style.mixBlendMode = "overlay";
    overlay.style.borderRadius = "16px";
    playerShell.appendChild(overlay);
  }
  return overlay;
}

function clearVisualFX() {
  // Resetea filtros CSS del video
  if (videoPreview) videoPreview.style.filter = "none";

  // Resetea overlay
  const overlay = ensureOverlay();
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.background = "transparent";
    overlay.style.backgroundImage = "none";
    overlay.style.filter = "none";
    overlay.style.mixBlendMode = "overlay";
  }
}

function setOverlayPixel() {
  const overlay = ensureOverlay();
  if (!overlay) return;

  // Patrón de pixeles (UI demo)
  overlay.style.opacity = "0.55";
  overlay.style.mixBlendMode = "multiply";
  overlay.style.backgroundImage =
    "linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)";
  overlay.style.backgroundSize = "10px 10px";
  overlay.style.filter = "none";
}

function setOverlayThermal() {
  const overlay = ensureOverlay();
  if (!overlay) return;

  // Gradiente tipo térmica (UI demo)
  overlay.style.opacity = "0.42";
  overlay.style.mixBlendMode = "screen";
  overlay.style.background =
    "linear-gradient(90deg, rgba(0,0,255,0.65), rgba(0,255,255,0.55), rgba(0,255,0,0.55), rgba(255,255,0,0.55), rgba(255,120,0,0.55), rgba(255,0,0,0.55))";
}

function setOverlayCustom() {
  const overlay = ensureOverlay();
  if (!overlay) return;

  // "Pastel suave" (UI demo)
  overlay.style.opacity = "0.30";
  overlay.style.mixBlendMode = "soft-light";
  overlay.style.background =
    "radial-gradient(circle at 20% 30%, rgba(255,192,203,0.55), transparent 55%), radial-gradient(circle at 75% 40%, rgba(173,216,230,0.55), transparent 55%), radial-gradient(circle at 55% 80%, rgba(152,251,152,0.45), transparent 60%)";
}

function setCssBlur() {
  if (!videoPreview) return;
  videoPreview.style.filter = "blur(2px)";
}

function setCssColorAdjust() {
  if (!videoPreview) return;
  // Ajuste de color sin tocar exposición: saturación + contraste + hue
  videoPreview.style.filter = "saturate(1.25) contrast(1.08) hue-rotate(-6deg)";
}

// UI: activar chip
function setActiveFilterButton(activeBtn) {
  filterButtons.forEach((b) => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

// Click en filtros
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.filter;

    // Toggle: si ya estaba activo, apaga todo
    const wasActive = btn.classList.contains("active");
    if (wasActive) {
      setActiveFilterButton(null);
      clearVisualFX();
      return;
    }

    setActiveFilterButton(btn);
    clearVisualFX();

    // Aplicar demo visual
    if (name === "blur") setCssBlur();
    if (name === "color") setCssColorAdjust();
    if (name === "pixel") setOverlayPixel();
    if (name === "thermal") setOverlayThermal();
    if (name === "custom") setOverlayCustom();
  });
});


// =====================================================
// Actualizar UI del video según país detectado
// (solo cambia texto; el video se selecciona desde el acervo)
// =====================================================
function updateVideoUIForCountry(country) {
  if (!country) return;
  if (videoTitle) videoTitle.textContent = `Video oficial — ${country.name}`;
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

    updateVideoUIForCountry(country);

    // Conectar con la Base de Datos
    if (window.cargarDatosDesdeBD && country.code) {
      window.cargarDatosDesdeBD(country.code).then((datos) => {
        if (datos) {
          const estadioNombre = datos.estadio_nombre || 'Info no encontrada';
          setStatus(`${country.name.toUpperCase()}: ${estadioNombre} (BD)`);
        } else {
          setStatus(`Error al cargar datos de ${country.name}`);
        }
      });
    }
  });

  entity.addEventListener("targetLost", () => {
  currentCountry = null;

  hideHUD();
  closeAllModals();
  setStatus("Apunta a una bandera...");

  // ✅ opcional: limpiar estado de trivia
  if (window.Trivia && typeof window.Trivia.reset === "function") {
    window.Trivia.reset();
  }
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

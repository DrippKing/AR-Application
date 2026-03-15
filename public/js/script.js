// =====================================================
// WorldScan 2026 — script.js (ACTUALIZADO)
// - MindAR targets
// - HUD aparece al detectar bandera
// - Modales abren/cierran
// - Video + Acervo funcional
// - Filtros permitidos FE
// - Pelota 3D GLB aparece en AR por target
// - Tap para girar
// - Botón HUD para rebote
// - Partículas overlay (GIF)
// - Textura distinta según bandera escaneada
// =====================================================

// --- HACK DE ALTA RESOLUCIÓN (S25 Ultra Fix) ---
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
// FIX 100vh en móviles
// =====================================================
function setVhVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
setVhVar();
window.addEventListener("resize", setVhVar);
window.addEventListener("orientationchange", () => {
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
const arAnimationBtn = document.getElementById("btn-ar-animation");
const starsFx = document.getElementById("fx-stars");

// Video editor UI
const videoModal = document.getElementById("modal-video");
const videoTitle = document.querySelector("#modal-video .video-title");
const videoPreview = document.getElementById("video-preview");
const videoItems = Array.from(document.querySelectorAll("#modal-video .video-item"));
const filterButtons = Array.from(document.querySelectorAll("#modal-video .filter-chip"));
const playerShell = document.querySelector("#modal-video .player-shell");

let currentCountry = null;
let currentBall = null;
let currentTargetEntity = null;
let starsTimeout = null;

// Mapa de rutas de texturas por país
const flagTextures = {
  colombia: "./assets/img/Colombia.jpg",
  coreadelsur: "./assets/img/Corea_del_Sur.jpg",
  espana: "./assets/img/España.jpg",
  japon: "./assets/img/Japon.jpg",
  mexico: "./assets/img/Mexico.jpg",
  paisesbajos: "./assets/img/Paises_Bajos.jpg",
  sudafrica: "./assets/img/Sudafrica.jpg",
  tunez: "./assets/img/Tunez.jpg",
  uruguay: "./assets/img/Uruguay.jpg",
  uzbekistan: "./assets/img/Uzbekistan.jpg",
};

// Cache de texturas para no recargar a cada rato
const textureCache = {};

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

  const card = modal.querySelector(".modal-card");
  if (card) card.scrollTop = 0;
  modal.scrollTop = 0;
}

hideHUD();
closeAllModals();

// =====================================================
// Partículas overlay (GIF)
// =====================================================
function playStarsFX(duration = 2000) {
  if (!starsFx) return;

  starsFx.classList.remove("show");

  // Reinicia el GIF forzando recarga visual
  const currentSrc = starsFx.getAttribute("src");
  starsFx.setAttribute("src", "");
  starsFx.offsetHeight; // reflow
  starsFx.setAttribute("src", currentSrc);

  requestAnimationFrame(() => {
    starsFx.classList.add("show");
  });

  clearTimeout(starsTimeout);
  starsTimeout = setTimeout(() => {
    starsFx.classList.remove("show");
  }, duration);
}

// =====================================================
// HUD -> abrir modales
// =====================================================
if (hud) {
  hud.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-modal]");
    if (!btn) return;

    const modalId = btn.getAttribute("data-modal");
    if (!modalId) return;

    openModalById(modalId);

    if (modalId === "modal-trivia") {
      const countryId = currentCountry ? currentCountry.id : null;
      if (window.Trivia && typeof window.Trivia.start === "function") {
        window.Trivia.start(countryId);
      }
    }
  });
}

// Botón especial para animación AR
if (arAnimationBtn) {
  arAnimationBtn.addEventListener("click", () => {
    if (!currentBall || !currentCountry) {
      alert("Primero escanea una bandera para activar la animación AR.");
      return;
    }

    triggerBounce(currentBall);
    playStarsFX(2000);
  });
}

// =====================================================
// Cerrar modales
// =====================================================
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) {
    closeAllModals();
  }
});

modals.forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAllModals();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllModals();
});

// =====================================================
// VIDEO + ACERVO
// =====================================================
function setActiveVideoItem(activeBtn) {
  videoItems.forEach((b) => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function setVideoSource(src, titleText) {
  if (!videoPreview) return;

  if (titleText && videoTitle) videoTitle.textContent = titleText;
  if (!src) return;

  videoPreview.src = src;
  try {
    videoPreview.load();
  } catch (_) {}
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
// FILTROS (FE)
// =====================================================
function ensureOverlay() {
  if (!playerShell) return null;

  let overlay = playerShell.querySelector(".fx-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "fx-overlay";
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
  if (videoPreview) videoPreview.style.filter = "none";

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

  overlay.style.opacity = "0.42";
  overlay.style.mixBlendMode = "screen";
  overlay.style.background =
    "linear-gradient(90deg, rgba(0,0,255,0.65), rgba(0,255,255,0.55), rgba(0,255,0,0.55), rgba(255,255,0,0.55), rgba(255,120,0,0.55), rgba(255,0,0,0.55))";
}

function setOverlayCustom() {
  const overlay = ensureOverlay();
  if (!overlay) return;

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
  videoPreview.style.filter = "saturate(1.25) contrast(1.08) hue-rotate(-6deg)";
}

function setActiveFilterButton(activeBtn) {
  filterButtons.forEach((b) => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.filter;
    const wasActive = btn.classList.contains("active");

    if (wasActive) {
      setActiveFilterButton(null);
      clearVisualFX();
      return;
    }

    setActiveFilterButton(btn);
    clearVisualFX();

    if (name === "blur") setCssBlur();
    if (name === "color") setCssColorAdjust();
    if (name === "pixel") setOverlayPixel();
    if (name === "thermal") setOverlayThermal();
    if (name === "custom") setOverlayCustom();
  });
});

function updateVideoUIForCountry(country) {
  if (!country) return;
  if (videoTitle) videoTitle.textContent = `Video oficial — ${country.name}`;
}

// =====================================================
// Utilidades AR
// =====================================================
function stopBounce(ball) {
  if (!ball) return;
  ball.removeAttribute("animation__bounceUp");
  ball.removeAttribute("animation__bounceDown");
}

function triggerBounce(ball) {
  if (!ball) return;

  stopBounce(ball);

  ball.setAttribute("position", "0 0.25 0.15");

  ball.setAttribute(
    "animation__bounceUp",
    "property: position; from: 0 0.25 0.15; to: 0 0.48 0.15; dur: 320; easing: easeOutQuad; startEvents: doBounceUp"
  );

  ball.setAttribute(
    "animation__bounceDown",
    "property: position; from: 0 0.48 0.15; to: 0 0.25 0.15; dur: 380; easing: easeInQuad; startEvents: doBounceDown"
  );

  const onBounceUpComplete = () => {
    ball.emit("doBounceDown");
  };

  const onBounceDownComplete = () => {
    ball.removeEventListener("animationcomplete__bounceUp", onBounceUpComplete);
    ball.removeEventListener("animationcomplete__bounceDown", onBounceDownComplete);
  };

  ball.addEventListener("animationcomplete__bounceUp", onBounceUpComplete);
  ball.addEventListener("animationcomplete__bounceDown", onBounceDownComplete);

  ball.emit("doBounceUp");
}

function toggleSpin(ball) {
  if (!ball) return;

  if (ball.hasAttribute("animation__spin")) {
    ball.removeAttribute("animation__spin");
    return;
  }

  ball.setAttribute(
    "animation__spin",
    "property: rotation; to: 0 360 0; loop: true; dur: 1200; easing: linear"
  );
}

function loadTexture(path) {
  return new Promise((resolve, reject) => {
    if (textureCache[path]) {
      resolve(textureCache[path]);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (texture) => {
        texture.flipY = false;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
        textureCache[path] = texture;
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

async function applyCountryTexture(ball, countryId) {
  if (!ball || !countryId) return;

  const texturePath = flagTextures[countryId];
  if (!texturePath) return;

  try {
    const texture = await loadTexture(texturePath);

    const applyToMesh = () => {
      const object3D = ball.getObject3D("mesh");
      if (!object3D) return;

      object3D.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.map = texture;
          node.material.color = new THREE.Color(0xffffff);
          node.material.needsUpdate = true;
        }
      });
    };

    if (ball.getObject3D("mesh")) {
      applyToMesh();
    } else {
      ball.addEventListener("model-loaded", applyToMesh, { once: true });
    }
  } catch (error) {
    console.warn("No se pudo aplicar textura al balón:", texturePath, error);
  }
}

// =====================================================
// MindAR: generación automática de targets
// =====================================================
if (!scene) {
  console.warn("No se encontró #ar-scene");
} else {
  scene.addEventListener("loaded", () => {
    console.log("✅ A-Frame scene loaded. Creando targets...");

    countries.forEach((country, index) => {
      const entity = document.createElement("a-entity");
      entity.setAttribute("mindar-image-target", `targetIndex: ${index}`);

      const plane = document.createElement("a-plane");
      plane.setAttribute("class", "clickable");
      plane.setAttribute("color", country.color);
      plane.setAttribute("opacity", "0.6");
      plane.setAttribute("height", "0.55");
      plane.setAttribute("width", "1");

      const text = document.createElement("a-text");
      text.setAttribute("value", country.name.toUpperCase());
      text.setAttribute("align", "center");
      text.setAttribute("position", "0 -0.45 0.1");
      text.setAttribute("color", "#FFFFFF");
      text.setAttribute("width", "2");

      const ball = document.createElement("a-entity");
      ball.setAttribute("gltf-model", "#soccerBallGLB");
      ball.setAttribute("position", "0 0.25 0.15");
      ball.setAttribute("scale", "0.35 0.35 0.35");
      ball.setAttribute("rotation", "0 0 0");
      ball.setAttribute("class", "clickable");

      ball.addEventListener("click", (e) => {
        if (typeof e.stopPropagation === "function") e.stopPropagation();
        toggleSpin(ball);
      });

      entity.addEventListener("targetFound", async () => {
        currentCountry = country;
        currentBall = ball;
        currentTargetEntity = entity;

        showHUD();
        setStatus(`Cargando datos de ${country.name}...`);
        updateVideoUIForCountry(country);

        await applyCountryTexture(ball, country.id);
        playStarsFX(1800);

        if (window.cargarDatosDesdeBD && country.code) {
          window.cargarDatosDesdeBD(country.code).then((datos) => {
            const estadioNombre = datos?.estadio_nombre || "Info no encontrada";
            setStatus(`${country.name.toUpperCase()}: ${estadioNombre} (BD)`);
          });
        }
      });

      entity.addEventListener("targetLost", () => {
        if (currentTargetEntity === entity) {
          currentCountry = null;
          currentBall = null;
          currentTargetEntity = null;
        }

        hideHUD();
        closeAllModals();
        setStatus("Apunta a una bandera...");

        stopBounce(ball);

        if (window.Trivia && typeof window.Trivia.reset === "function") {
          window.Trivia.reset();
        }
      });

      plane.addEventListener("click", () => {
        window.open(
          `https://www.google.com/search?q=seleccion+${country.id}+mundial+2026`,
          "_blank"
        );
      });

      entity.appendChild(plane);
      entity.appendChild(text);
      entity.appendChild(ball);
      scene.appendChild(entity);
    });
  });
}
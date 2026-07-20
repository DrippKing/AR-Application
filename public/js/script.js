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

      // 👉 Inyectar el ID del lente seleccionado por el usuario
      const savedCamId = localStorage.getItem("worldscan_cam_id");
      if (savedCamId) {
        constraints.video.deviceId = { exact: savedCamId };
        console.log("📸 Forzando uso de lente ID:", savedCamId);
      }

      console.log("� Hack Resolución: Forzando 1080p...");
    }
    
    // Atrapamos la promesa original sin romperla
    return originalGUM(constraints).then(stream => {
      // Guardamos la pista de video para aplicarle controles avanzados
      window.currentVideoTrack = stream.getVideoTracks()[0];
      setTimeout(setupCameraControls, 1000); // Esperar a que la cámara inicie
      return stream;
    });
  };
}

// Función para controlar zoom y exposición
function setupCameraControls() {
  const track = window.currentVideoTrack;
  if (!track) return;

  try {
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();
    
    // --- ZOOM LOGICO ---
    const zoomContainer = document.getElementById("zoom-container");
    const zoomSlider = document.getElementById("zoom-slider");

    if (capabilities.zoom && zoomContainer && zoomSlider) {
      zoomContainer.classList.remove("hidden");
      
      zoomSlider.min = capabilities.zoom.min;
      zoomSlider.max = capabilities.zoom.max;
      zoomSlider.step = capabilities.zoom.step || 0.1;
      zoomSlider.value = settings.zoom || 1;

      zoomSlider.addEventListener("input", async (e) => {
        await track.applyConstraints({
          advanced: [{ zoom: parseFloat(e.target.value) }]
        }).catch(err => console.warn("Error aplicando zoom:", err));
      });
    }

    // --- EXPOSICIÓN ---
    const expContainer = document.getElementById("exposure-container");
    const expSlider = document.getElementById("exposure-slider");

    // Verificamos si el navegador expone la compensación de exposición
    if (capabilities.exposureCompensation && expContainer && expSlider) {
      expContainer.classList.remove("hidden");
      
      const minExposure = capabilities.exposureCompensation.min;

      expSlider.min = minExposure;
      expSlider.max = capabilities.exposureCompensation.max;
      expSlider.step = capabilities.exposureCompensation.step || 0.1;
      
      // Forzar al mínimo al arrancar para no quemar imágenes de pantallas
      expSlider.value = minExposure;
      track.applyConstraints({
        advanced: [{ exposureCompensation: minExposure }]
      }).catch(err => console.warn("Error aplicando exposición inicial:", err));

      expSlider.addEventListener("input", async (e) => {
        await track.applyConstraints({
          advanced: [{ exposureCompensation: parseFloat(e.target.value) }]
        }).catch(err => console.warn("Error aplicando exposición:", err));
      });
    }
  } catch (e) {
    console.warn("No se pudieron leer las capacidades de la cámara:", e);
  }
}

// =====================================================
// COMPONENTE AR: Drag-to-Rotate (Con inercia y World Space)
// =====================================================
AFRAME.registerComponent('simple-drag-rotator', {
  schema: {
    sensitivity: { type: 'number', default: 1.5 },
    friction: { type: 'number', default: 0.98 } // Desaceleración: 1 = nunca se detiene, 0 = se detiene al soltar
  },

  init: function () {
    this.isDragging = false;
    this.previousPointerPosition = { x: 0, y: 0 };
    this.needsPointerReset = false;
    this.spinVelocity = { x: 0, y: 0 }; // Guarda la velocidad y dirección del último deslizamiento

    // Bind 'this' para preservar el contexto en los listeners
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    // Listeners iniciales sobre el objeto
    this.el.addEventListener('mousedown', this.onMouseDown);
    this.el.addEventListener('touchstart', this.onMouseDown);
  },

  remove: function () {
    // Limpieza completa de listeners para evitar fugas de memoria
    this.el.removeEventListener('mousedown', this.onMouseDown);
    this.el.removeEventListener('touchstart', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onMouseMove, { passive: false });
    window.removeEventListener('touchend', this.onMouseUp);
  },

  onMouseDown: function (evt) {
    // Detiene la propagación para que no interfiera con el raycaster de A-Frame
    this.isDragging = true;
    this.spinVelocity = { x: 0, y: 0 }; // Detiene cualquier giro inercial previo al volver a tocar
    
    const pointer = this.getPointerPosition(evt);
    if (pointer) {
      this.previousPointerPosition = { x: pointer.x, y: pointer.y };
      this.needsPointerReset = false;
    } else {
      // Si no logramos leer la coordenada de A-Frame al tocar, 
      // forzamos a que el primer movimiento fije el punto de partida.
      this.needsPointerReset = true;
    }

    // Añadimos listeners a 'window' para capturar el arrastre fuera del objeto
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('touchmove', this.onMouseMove, { passive: false });
    window.addEventListener('touchend', this.onMouseUp);
  },

  onMouseMove: function (evt) {
    if (!this.isDragging) return;
    
    // Previene el scroll de la página, que rompe el tracking de AR
    if (evt.cancelable) {
      evt.preventDefault();
    }

    const pointer = this.getPointerPosition(evt);
    if (!pointer) return;

    // Si es el primer movimiento tras tocar, sincronizamos la posición y evitamos rotar
    if (this.needsPointerReset || this.previousPointerPosition.x === undefined) {
      this.previousPointerPosition = { x: pointer.x, y: pointer.y };
      this.needsPointerReset = false;
      return; 
    }

    const deltaX = pointer.x - this.previousPointerPosition.x;
    const deltaY = pointer.y - this.previousPointerPosition.y;

    // ¡CLAVE! Prevenir cálculos corruptos (NaN) que hacen desaparecer el modelo 3D
    if (isNaN(deltaX) || isNaN(deltaY)) return;

    // Guardar la velocidad para que la función tick() sepa hacia dónde y qué tan rápido girarlo
    this.spinVelocity = { x: deltaX, y: deltaY };

    // Convertir el movimiento a radianes
    const angleY = deltaX * (Math.PI / 180) * this.data.sensitivity;
    const angleX = deltaY * (Math.PI / 180) * this.data.sensitivity;

    // Rotar sobre los ejes fijos del mundo (World Space) para evitar controles invertidos (Gimbal Lock)
    this.el.object3D.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), angleY); // Giro horizontal
    this.el.object3D.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), angleX); // Giro vertical

    this.previousPointerPosition = { x: pointer.x, y: pointer.y };
  },

  onMouseUp: function () {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onMouseMove, { passive: false });
    window.removeEventListener('touchend', this.onMouseUp);
  },
  
  tick: function () {
    // Si el usuario está tocando la pantalla, dejamos que onMouseMove controle el giro
    if (this.isDragging) return;

    // Si la velocidad es mínima, nos detenemos para ahorrar batería
    if (Math.abs(this.spinVelocity.x) < 0.05 && Math.abs(this.spinVelocity.y) < 0.05) return;

    // Girar el objeto usando la velocidad residual
    const angleY = this.spinVelocity.x * (Math.PI / 180) * this.data.sensitivity;
    const angleX = this.spinVelocity.y * (Math.PI / 180) * this.data.sensitivity;

    this.el.object3D.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), angleY);
    this.el.object3D.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), angleX);

    // Aplicar fricción (desacelerar poco a poco)
    this.spinVelocity.x *= this.data.friction;
    this.spinVelocity.y *= this.data.friction;
  },

  getPointerPosition: function(evt) {
    if (evt.touches && evt.touches.length > 0) {
      return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    } else if (evt.clientX !== undefined && evt.clientY !== undefined) {
      return { x: evt.clientX, y: evt.clientY };
    } else if (evt.detail && evt.detail.mouseEvent) {
      // ¡CLAVE! A-Frame esconde las coordenadas aquí
      const mEvt = evt.detail.mouseEvent;
      if (mEvt.touches && mEvt.touches.length > 0) {
        return { x: mEvt.touches[0].clientX, y: mEvt.touches[0].clientY };
      } else if (mEvt.clientX !== undefined && mEvt.clientY !== undefined) {
        return { x: mEvt.clientX, y: mEvt.clientY };
      }
    }
    return null; // Fallback seguro
  }
});

// =====================================================
// COMPONENTE AR: Físicas de rebote (Gravedad e Inercia)
// =====================================================
AFRAME.registerComponent('ball-physics', {
  schema: {
    gravity: { type: 'number', default: 0.010 }, // Fuerza con la que cae
    jumpStrength: { type: 'number', default: 0.10 }, // Fuerza del golpe hacia arriba
    bounceDamping: { type: 'number', default: 0.65 }, // Reducimos elasticidad para que pare pronto
    maxHeight: { type: 'number', default: 2.0 } // Altura máxima permitida (acumulable)
  },

  init: function () {
    this.velocityY = 0;
    this.isBouncing = false;
    this.groundY = 0; // El nivel del "suelo virtual"
  },

  jump: function () {
    let pos = this.el.object3D.position;
    // Si la pelota ya superó la altura máxima, no saltar más
    if (pos.y >= this.data.maxHeight) return false;
    
    this.isBouncing = true;
    this.velocityY = this.data.jumpStrength; // Impulso instantáneo hacia arriba
    
    // Retornamos true si el salto fue ejecutado
    return true;
  },

  reset: function () {
    this.isBouncing = false;
    this.velocityY = 0;
    this.el.object3D.position.y = this.groundY;
    this.el.emit('bounce-stopped'); // Avisamos al exterior que el balón ya no se mueve
  },

  tick: function () {
    if (!this.isBouncing) return;

    let pos = this.el.object3D.position;
    
    pos.y += this.velocityY;
    this.velocityY -= this.data.gravity; // Aplicar gravedad constante

    // Obliga al balón a caer si sobrepasa la altura máxima permitida (Techo virtual)
    if (pos.y >= this.data.maxHeight) {
      pos.y = this.data.maxHeight;
      if (this.velocityY > 0) {
        this.velocityY = 0; // Pierde el impulso hacia arriba, empezará a caer instantáneamente
      }
      this.el.emit('max-height-reached'); // Avisa al botón para que se desactive
    }

    // Colisión con el piso virtual
    if (pos.y <= this.groundY) {
      pos.y = this.groundY;
      
      // Rebote invirtiendo la velocidad pero perdiendo energía
      this.velocityY = -this.velocityY * this.data.bounceDamping;

      // Aumentamos el umbral a 0.04 para evitar micro-rebotes infinitos
      if (Math.abs(this.velocityY) < 0.04) {
        this.reset();
      }
    }
  }
});

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
const arAnimationBtn = document.getElementById("btn-ar-animation");
const starsFx = document.getElementById("fx-stars");

// Video editor UI
// Estas variables ahora se deben buscar DESPUÉS de cargar el modal
/* const videoTitle = document.querySelector("#modal-video .video-title");
const videoPreview = document.getElementById("video-preview");
const videoItems = Array.from(document.querySelectorAll("#modal-video .video-item"));
const filterButtons = Array.from(document.querySelectorAll("#modal-video .filter-chip"));
const playerShell = document.querySelector("#modal-video .player-shell");

let currentCountry = null;
let currentBall = null;
let currentTargetEntity = null;
let starsTimeout = null; */

let currentCountry = null;

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
/*   if (hud) hud.classList.add("hidden");
 */}

hideHUD();
if (window.ModalManager) {
  window.ModalManager.closeAll();
}

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
    const btn = e.target.closest("[data-modal-name]");
    if (!btn) return;

    const name = btn.dataset.modalName; // HTML: data-modal-name -> JS: dataset.modalName
    if (!name) return;

    // Usamos el nuevo ModalManager
    window.ModalManager.load(name, currentCountry);
  });
}

// =====================================================
// Cerrar modales
// =====================================================
// La lógica de cierre ahora está centralizada en modals.js

// =====================================================
// VIDEO + ACERVO
// =====================================================
window.VideoPlayer = {
  initialize: function(currentCountry) {
  // Esta función se llama DESPUÉS de que el modal de video se inyecta en el DOM
  const videoTitle = document.querySelector("#modal-video .video-title");
  const videoItems = Array.from(document.querySelectorAll("#modal-video .video-item"));
  const filterButtons = Array.from(document.querySelectorAll("#modal-video .filter-chip"));

function setActiveVideoItem(activeBtn) {
  videoItems.forEach((b) => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function setVideoSource(src, titleText) {
  const videoPreview = document.getElementById("video-preview");
  if (!videoPreview) return;

  if (titleText && videoTitle) videoTitle.textContent = titleText;
  if (!src) return;

  videoPreview.src = src;
  try { videoPreview.load(); } catch (_) {}
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

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      handleFilterClick(btn, filterButtons);
    });
  });

  const singleSlider = document.getElementById("slide-single");
  if (singleSlider) {
    singleSlider.addEventListener("input", (e) => {
      if (currentSingleFilter) applySingleFilter(currentSingleFilter, e.target.value);
    });
  }

  const customSliders = document.querySelectorAll("#custom-filter-controls input[type='range']");
  customSliders.forEach(slider => {
    slider.addEventListener("input", applyCustomFilter);
  });

  updateVideoUIForCountry(currentCountry);
  }
};

// =====================================================
// FILTROS (FE)
// =====================================================
let currentSingleFilter = null;

function ensureOverlay() {
  const playerShell = document.querySelector("#modal-video .player-shell");
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
  const videoPreview = document.getElementById("video-preview");
  if (videoPreview) {
    videoPreview.style.filter = "none";
  }

  const overlay = ensureOverlay();
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.background = "transparent";
    overlay.style.backgroundImage = "none";
    overlay.style.filter = "none";
    overlay.style.mixBlendMode = "overlay";
  }
}

function setOverlayPixel(intensity = 50) {
  const videoPreview = document.getElementById("video-preview");
  if (videoPreview) {
    videoPreview.style.filter = "url(#pixelate-effect)";
    const morph = document.getElementById("pixel-morph");
    if (morph) {
      const radius = Math.max(1, Math.floor((intensity / 100) * 8)); 
      morph.setAttribute("radius", radius);
    }
  }
}

function setOverlayThermal(intensity = 50) {
  const overlay = ensureOverlay();
  if (!overlay) return;

  const op = 0.2 + (intensity / 100) * 0.6; // Opacidad entre 0.2 y 0.8
  overlay.style.opacity = op.toString();
  overlay.style.mixBlendMode = "screen";
  overlay.style.background =
    "linear-gradient(90deg, rgba(0,0,255,0.65), rgba(0,255,255,0.55), rgba(0,255,0,0.55), rgba(255,255,0,0.55), rgba(255,120,0,0.55), rgba(255,0,0,0.55))";
}

function setCssBlur(intensity = 50) {
  const videoPreview = document.getElementById("video-preview");
  if (!videoPreview) return;
  const blurVal = (intensity / 100) * 8; // De 0px a 8px
  videoPreview.style.filter = `blur(${blurVal}px)`;
}

function setCssColorAdjust(intensity = 50) {
  const videoPreview = document.getElementById("video-preview");
  if (!videoPreview) return;
  const sat = 1 + (intensity / 100) * 1.5; 
  const con = 1 + (intensity / 100) * 0.5; 
  const hue = (intensity / 100) * -45;
  videoPreview.style.filter = `saturate(${sat}) contrast(${con}) hue-rotate(${hue}deg)`;
}

function handleFilterClick(btn, filterButtons) {
    const name = btn.dataset.filter;
    const wasActive = btn.classList.contains("active");

    const customControls = document.getElementById("custom-filter-controls");
    const singleControl = document.getElementById("single-filter-control");
    const singleSlider = document.getElementById("slide-single");

function applySingleFilter(name, intensity) {
  if (name === "blur") setCssBlur(intensity);
  if (name === "color") setCssColorAdjust(intensity);
  if (name === "pixel") setOverlayPixel(intensity);
  if (name === "thermal") setOverlayThermal(intensity);
}

    if (wasActive) {
      setActiveFilterButton(null);
      clearVisualFX();
      if (customControls) customControls.classList.add("hidden");
      if (singleControl) singleControl.classList.add("hidden");
      currentSingleFilter = null;
      return;
    }

    setActiveFilterButton(btn);
    clearVisualFX();
    currentSingleFilter = null;

    if (name === "custom") {
      if (singleControl) singleControl.classList.add("hidden");
      if (customControls) customControls.classList.remove("hidden");
      applyCustomFilter(); // Iniciar con los valores actuales de los sliders
    } else {
      if (customControls) customControls.classList.add("hidden");
      if (singleControl) singleControl.classList.remove("hidden");
      
      currentSingleFilter = name;
      if (singleSlider) {
         singleSlider.value = 50; // Reiniciar siempre al 50%
         applySingleFilter(name, 50);
      }
    }
}

function applyCustomFilter() {
  const videoPreview = document.getElementById("video-preview");
  if (!videoPreview) return;
  const blur = document.getElementById("slide-blur").value;
  const contrast = document.getElementById("slide-contrast").value;
  const saturate = document.getElementById("slide-saturate").value;
  const brightness = document.getElementById("slide-brightness").value;
  const hue = document.getElementById("slide-hue").value;

  videoPreview.style.filter = `blur(${blur}px) contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%) hue-rotate(${hue}deg)`;
}

function setActiveFilterButton(activeBtn) {
  // Es posible que filterButtons no esté definido si el modal no se ha cargado.
  const filterButtons = Array.from(document.querySelectorAll("#modal-video .filter-chip"));
  filterButtons.forEach((b) => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function updateVideoUIForCountry(country) {
  if (!country) return;
  const videoTitle = document.querySelector("#modal-video .video-title");
  if (videoTitle) videoTitle.textContent = `Video oficial — ${country.name}`;
}

// =====================================================
// Utilidades AR
// =====================================================
function stopBounce(ball) {
  if (!ball) return;
  const physics = ball.components['ball-physics'];
  if (physics) physics.reset();
}

function triggerBounce(ball) {
  if (!ball) return;

  const physics = ball.components['ball-physics'];
  if (physics) {
    physics.jump(); 
    
    // Si tras tocarlo estimamos que el siguiente fotograma cruzará el límite, bloqueamos preventivamente
    const pos = ball.object3D.position;
    if (pos.y + physics.data.jumpStrength >= physics.data.maxHeight && arAnimationBtn) {
      arAnimationBtn.disabled = true;
    }
  }
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

      const ball = document.createElement("a-entity");
      ball.setAttribute("gltf-model", "#soccerBallGLB");
      ball.setAttribute("position", "0 0 0");
      ball.setAttribute("scale", "0.35 0.35 0.35");
      ball.setAttribute("rotation", "0 0 0");
      ball.setAttribute("class", "clickable");

      // Asignamos el nuevo componente para arrastrar y rotar
      ball.setAttribute('simple-drag-rotator', '');
      
      // Asignamos el nuevo componente de físicas (rebote)
      ball.setAttribute('ball-physics', '');
      ball.addEventListener('bounce-stopped', () => {
        if (arAnimationBtn) arAnimationBtn.disabled = false; // Reactiva el botón cuando el balón se detiene por completo
      });
      
      // Apagar el botón si el balón choca contra el techo invisible por inercia
      ball.addEventListener('max-height-reached', () => {
        if (arAnimationBtn) arAnimationBtn.disabled = true;
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

            // 👉 ACTUALIZAR VIDEO OFICIAL CON LOS DATOS DE DB.JSON
            if (datos && datos.video_url) {
              setVideoSource(datos.video_url, `Video oficial — ${datos.nombre}`);
              
              // Actualizar también la información del botón en el Acervo (Sidebar)
              const officialVideoBtn = document.querySelector(".video-item");
              if (officialVideoBtn) {
                officialVideoBtn.setAttribute("data-src", datos.video_url);
                officialVideoBtn.setAttribute("data-title", `Video oficial — ${datos.nombre}`);
                
                const metaSub = officialVideoBtn.querySelector(".meta-sub");
                if (metaSub) {
                  metaSub.textContent = datos.video_url.split('/').pop(); 
                }
              }
            }
          });
        }
      });

      entity.addEventListener("targetLost", () => {
        const shouldPreserveUI = window.ModalManager.isVisible();

        if (currentTargetEntity === entity) {
          if (!shouldPreserveUI) {
            currentCountry = null;
            currentBall = null;
            currentTargetEntity = null;
          }

          if (!shouldPreserveUI) {
            hideHUD();
            window.ModalManager.closeAll();
            setStatus("Apunta a una bandera...");

            stopBounce(ball);

            if (window.Trivia && typeof window.Trivia.reset === "function") {
              window.Trivia.reset();
            }
          } else {
            setStatus(`${currentCountry?.name || "País"} · seguimiento perdido, menú abierto`);
          }
        }
      });

      entity.appendChild(ball);
      scene.appendChild(entity);
    });
  });
}

// =====================================================
// DETECCIÓN Y SELECTOR DE MÚLTIPLES LENTES (CÁMARAS)
// =====================================================
async function loadCameraSelector() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.warn("La API enumerateDevices no está soportada.");
    return;
  }

  try {
    // Leemos todos los dispositivos de hardware
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filtramos SOLO los lentes traseros (ignoramos "front", "frontal" o "user")
    const videoDevices = devices.filter(d => {
      if (d.kind !== "videoinput") return false;
      const label = d.label.toLowerCase();
      return !label.includes("front") && !label.includes("frontal") && !label.includes("user");
    });
    
    const selectorEl = document.getElementById("camera-selector");
    const listEl = document.getElementById("camera-list");
    const currentCamId = localStorage.getItem("worldscan_cam_id");

    if (videoDevices.length > 0 && selectorEl && listEl) {
      listEl.innerHTML = ""; // Limpiar

      videoDevices.forEach((cam, index) => {
        const btn = document.createElement("button");
        btn.className = "secondary-btn camera-btn"; // Usamos la clase correcta para botones de texto

        // Si el lente tiene un nombre real se lo ponemos, si no le damos un genérico
        let camName = cam.label || `Lente ${index + 1}`;
        btn.textContent = camName;

        // Resaltar en verde la cámara que esté seleccionada
        if (currentCamId === cam.deviceId) {
          btn.classList.add("active-cam");
          btn.textContent = `✅ ${camName}`;
        }

        // Al hacer clic, guardar el lente y recargar la página para que MindAR lo tome
        btn.addEventListener("click", () => {
          localStorage.setItem("worldscan_cam_id", cam.deviceId);
          window.location.reload(); 
        });

        listEl.appendChild(btn);
      });

      // Mostrar botón de ajustes y agregar evento de abrir/cerrar
      const settingsBtn = document.getElementById("btn-camera-settings");
      if (settingsBtn) {
        settingsBtn.classList.remove("hidden");
        settingsBtn.onclick = () => selectorEl.classList.toggle("hidden");
      }
    }
  } catch (err) {
    console.error("❌ Error al obtener las cámaras:", err);
  }
}

// Esperamos 2 segundos para dar tiempo a que el navegador pida permiso de cámara,
// así los nombres de los lentes no salen vacíos.
setTimeout(loadCameraSelector, 2000);
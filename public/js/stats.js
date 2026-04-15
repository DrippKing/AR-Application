// =====================================================
// stats.js
// Render dinámico del modal de estadísticas
// Requiere: window.STATS_DB
//
// Uso esperado:
//   window.Stats.render(countryId);
//   window.Stats.reset();
//
// Ventaja:
// - Si tu modal actual todavía no tiene #stats-content, lo crea.
// - Si no hay país detectado, muestra un estado vacío.
// - Si falta info de un país, no truena.
// =====================================================

(function () {
  function getModalElements() {
    const modal = document.getElementById("modal-stats");
    if (!modal) return null;

    const card = modal.querySelector(".modal-card");
    if (!card) return null;

    let content = document.getElementById("stats-content");

    // Si todavía no existe el contenedor dinámico, lo creamos
    if (!content) {
      content = document.createElement("div");
      content.id = "stats-content";
      content.className = "stats-content";

      // Intenta insertarlo después del <h2> si existe
      const title = card.querySelector("#stats-title");
      if (title) {
        title.insertAdjacentElement("afterend", content);
      } else {
        card.appendChild(content);
      }

      // Oculta placeholder viejo si existe
      const oldParagraphs = card.querySelectorAll("p, .modal-note");
      oldParagraphs.forEach((el) => {
        if (!el.closest("#stats-content")) {
          el.style.display = "none";
        }
      });
    }

    return { modal, card, content };
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderEmptyState(message = "Escanea una bandera para ver estadísticas.") {
    const els = getModalElements();
    if (!els) return;

    els.content.innerHTML = `
      <div class="stats-empty">
        <div class="stats-empty-icon">📊</div>
        <h3 class="stats-empty-title">Sin selección activa</h3>
        <p class="stats-empty-text">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function playerCard(player) {
    return `
      <article class="stats-card player-card">
        <div class="stats-card-top">
          <span class="stats-chip">Jugador destacado</span>
        </div>
        <h4 class="stats-player-name">${escapeHtml(player.name)}</h4>
        <div class="stats-player-role">${escapeHtml(player.role)}</div>
        <div class="stats-player-club">${escapeHtml(player.club)}</div>
        <p class="stats-player-note">${escapeHtml(player.note)}</p>
      </article>
    `;
  }

  function stadiumCard(stadium) {
    return `
      <article class="stats-card stadium-card">
        <div class="stats-card-top">
          <span class="stats-chip">Estadio emblemático</span>
        </div>
        <h4 class="stats-stadium-name">${escapeHtml(stadium.name)}</h4>
        <div class="stats-stadium-meta">
          <span>📍 ${escapeHtml(stadium.city)}</span>
          <span>👥 ${escapeHtml(stadium.capacity)}</span>
        </div>
        <p class="stats-stadium-note">${escapeHtml(stadium.note)}</p>
      </article>
    `;
  }

  function cupsCard(worldCups, label) {
    const cups = Number(worldCups) || 0;

    return `
      <article class="stats-card cups-card">
        <div class="stats-card-top">
          <span class="stats-chip">Historial mundialista</span>
        </div>

        <div class="stats-cups-number">${cups}</div>
        <div class="stats-cups-label">${escapeHtml(label || "Copas del Mundo")}</div>

        <div class="stats-cups-visual" aria-hidden="true">
          ${Array.from({ length: Math.max(cups, 1) })
            .map((_, i) => `<span class="stats-cup-icon ${i < cups ? "is-earned" : "is-empty"}">🏆</span>`)
            .join("")}
        </div>

        <p class="stats-cups-note">
          ${
            cups > 0
              ? `Este país ha conquistado ${cups} ${cups === 1 ? "título mundial" : "títulos mundiales"}.`
              : "Este país no ha ganado una Copa del Mundo masculina absoluta."
          }
        </p>
      </article>
    `;
  }

  function render(countryId) {
    const els = getModalElements();
    if (!els) return;

    if (!countryId) {
      renderEmptyState("Escanea una bandera para desbloquear estadísticas específicas del país.");
      return;
    }

    const db = window.STATS_DB || {};
    const countryData = db[countryId];

    if (!countryData) {
      renderEmptyState("No se encontró información estadística para este país.");
      return;
    }

    const players = Array.isArray(countryData.players) ? countryData.players : [];
    const stadium = countryData.stadium || null;
    const worldCups = countryData.worldCups ?? 0;
    const cupsLabel = countryData.cupsLabel || "Copas del Mundo";

    els.content.innerHTML = `
      <section class="stats-head">
        <div class="stats-badge">📊 Estadísticas por país</div>
        <h3 class="stats-country-title">${escapeHtml(countryData.countryLabel || countryId)}</h3>
        <p class="stats-country-sub">
          Resumen de los jugadores destacados, su estadio emblemático e historial mundialista.
        </p>
      </section>

      <section class="stats-section">
        <div class="stats-section-head">
          <h4 class="stats-section-title">Jugadores destacados actuales</h4>
          <p class="stats-section-sub">resumen del talento más reconocible del país.</p>
        </div>
        <div class="stats-grid players-grid">
          ${players.length ? players.map(playerCard).join("") : `
            <div class="stats-empty-inline">No hay jugadores cargados para este país.</div>
          `}
        </div>
      </section>

      <section class="stats-section">
        <div class="stats-section-head">
          <h4 class="stats-section-title">Estadio emblemático</h4>
          <p class="stats-section-sub">Una sede representativa del fútbol nacional.</p>
        </div>
        <div class="stats-grid stadium-grid">
          ${stadium ? stadiumCard(stadium) : `<div class="stats-empty-inline">No hay estadio cargado para este país.</div>`}
        </div>
      </section>

      <section class="stats-section">
        <div class="stats-section-head">
          <h4 class="stats-section-title">Copas del Mundo ganadas</h4>
          <p class="stats-section-sub">.</p>
        </div>
        <div class="stats-grid cups-grid">
          ${cupsCard(worldCups, cupsLabel)}
        </div>
      </section>
    `;
  }

  function reset() {
    renderEmptyState();
  }

  window.Stats = {
    render,
    reset
  };

  // Estado inicial seguro
  document.addEventListener("DOMContentLoaded", () => {
    renderEmptyState();
  });
})();
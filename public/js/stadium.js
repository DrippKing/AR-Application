// =====================================================
// stadium.js
// Render dinámico del modal de estadio
// Requiere: window.STADIUM_DB
//
// Uso esperado:
//   window.Stadium.render(countryId);
//   window.Stadium.reset();
//
// Ventajas:
// - Si no existe #stadium-content, lo crea.
// - Si no hay país detectado, muestra estado vacío.
// - Si falta info, no rompe la app.
// =====================================================

(function () {
  function getModalElements() {
    const modal = document.getElementById("modal-estadio");
    if (!modal) return null;

    const card = modal.querySelector(".modal-card");
    if (!card) return null;

    let content = document.getElementById("stadium-content");

    if (!content) {
      content = document.createElement("div");
      content.id = "stadium-content";
      content.className = "stadium-content";

      const title = card.querySelector("#estadio-title");
      if (title) {
        title.insertAdjacentElement("afterend", content);
      } else {
        card.appendChild(content);
      }

      const oldParagraphs = card.querySelectorAll("p, .modal-note");
      oldParagraphs.forEach((el) => {
        if (!el.closest("#stadium-content")) {
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

  function renderEmptyState(message = "Escanea una bandera para ver la información del estadio.") {
    const els = getModalElements();
    if (!els) return;

    els.content.innerHTML = `
      <div class="stadium-empty">
        <div class="stadium-empty-icon">🏟</div>
        <h3 class="stadium-empty-title">Sin selección activa</h3>
        <p class="stadium-empty-text">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function quickInfoCard(label, value, accentClass = "") {
    return `
      <article class="stadium-mini-card ${accentClass}">
        <span class="stadium-mini-label">${escapeHtml(label)}</span>
        <strong class="stadium-mini-value">${escapeHtml(value)}</strong>
      </article>
    `;
  }

  function render(countryId) {
    const els = getModalElements();
    if (!els) return;

    if (!countryId) {
      renderEmptyState("Escanea una bandera para desbloquear información detallada del estadio.");
      return;
    }

    const db = window.STADIUM_DB || {};
    const countryData = db[countryId];

    if (!countryData || !countryData.stadium) {
      renderEmptyState("No se encontró información del estadio para este país.");
      return;
    }

    const countryLabel = countryData.countryLabel || countryId;
    const stadium = countryData.stadium;

    els.content.innerHTML = `
      <section class="stadium-head">
        <div class="stadium-badge">🏟 Estadio por país</div>
        <h3 class="stadium-main-title">${escapeHtml(stadium.name)}</h3>
        <p class="stadium-main-sub">
          ${escapeHtml(countryLabel)} · ${escapeHtml(stadium.city)}
        </p>
        <p class="stadium-main-note">${escapeHtml(stadium.note)}</p>
      </section>

      <section class="stadium-info-grid">
        ${quickInfoCard("Ciudad", stadium.city, "accent-blue")}
        ${quickInfoCard("Capacidad", stadium.capacity, "accent-cyan")}
        ${quickInfoCard("Inauguración", stadium.opened, "accent-green")}
        ${quickInfoCard("Uso principal", stadium.home, "accent-blue")}
      </section>

      <section class="stadium-section">
        <div class="stadium-section-head">
          <h4 class="stadium-section-title">Perfil general</h4>
          <p class="stadium-section-sub">resumen y función principal dentro del fútbol nacional.</p>
        </div>

        <article class="stadium-profile-card">
          <div class="stadium-profile-row">
            <span class="stadium-profile-label">Tipo</span>
            <span class="stadium-profile-value">${escapeHtml(stadium.type)}</span>
          </div>

          <div class="stadium-profile-row">
            <span class="stadium-profile-label">Uso principal</span>
            <span class="stadium-profile-value">${escapeHtml(stadium.home)}</span>
          </div>

          <div class="stadium-profile-row">
            <span class="stadium-profile-label">Ubicación</span>
            <span class="stadium-profile-value">${escapeHtml(stadium.city)}</span>
          </div>
        </article>
      </section>

      <section class="stadium-section">
        <div class="stadium-section-head">
          <h4 class="stadium-section-title">Historia e importancia</h4>
          
        </div>

        <article class="stadium-history-card">
          <p class="stadium-history-text">${escapeHtml(stadium.history)}</p>
        </article>
      </section>

      <section class="stadium-section">
        <div class="stadium-section-head">
          <h4 class="stadium-section-title">Dato destacado</h4>
          <p class="stadium-section-sub">esto hace especial a este recinto dentro del país.</p>
        </div>

        <article class="stadium-highlight-card">
          <div class="stadium-highlight-icon">⭐</div>
          <p class="stadium-highlight-text">${escapeHtml(stadium.highlight)}</p>
        </article>
      </section>
    `;
  }

  function reset() {
    renderEmptyState();
  }

  window.Stadium = {
    render,
    reset
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderEmptyState();
  });
})();
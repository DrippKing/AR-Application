/* =====================================================
   trivia.js — WorldScan 2026
   Motor de Trivia por país (usa window.TRIVIA_DB)
   - start(countryId)
   - reset()
   - render pregunta/opciones
   - validar respuesta + score + feedback
   - siguiente
   - resultado final + jugar de nuevo
   ===================================================== */

(function () {
  "use strict";

  // -----------------------------
  // Helpers DOM
  // -----------------------------
  const $ = (id) => document.getElementById(id);

  // -----------------------------
  // Estado
  // -----------------------------
  let countryId = null;
  let questions = [];
  let idx = 0;
  let score = 0;
  let locked = false;      // evita doble respuesta

  // Objeto para cachear los elementos del DOM una vez encontrados
  let UIElements = {};
  let hasAllUI = false;

  // Esta función busca los elementos del DOM y los guarda.
  // Se llamará solo cuando se inicie la trivia.
  function cacheUI() {
    UIElements = {
      title: $("trivia-title"),
      progressText: $("trivia-progress-text"),
      barFill: $("trivia-bar-fill"),
      scoreValue: $("trivia-score-value"),
      empty: $("trivia-empty"),
      qwrap: $("trivia-qwrap"),
      question: $("trivia-question"),
      answers: $("trivia-answers"),
      feedback: $("trivia-feedback"),
      next: $("trivia-next"),
      restart: $("trivia-restart"),
      restart2: $("trivia-restart-2"),
      result: $("trivia-result"),
      resultText: $("trivia-result-text"),
    };
    // Verificamos que los elementos esenciales existan
    hasAllUI = !!(UIElements.qwrap && UIElements.empty && UIElements.result);
  }

  // -----------------------------
  // Utilidades
  // -----------------------------
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function setHidden(el, hidden) {
    if (!el) return;
    el.classList.toggle("hidden", !!hidden);
  }

  function setText(el, txt) {
    if (!el) return;
    el.textContent = txt;
  }

  function clearNode(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function setFeedback(type, msg) {
    if (!UIElements.feedback) return;
    UIElements.feedback.classList.remove("ok", "bad");
    if (type) UIElements.feedback.classList.add(type);
    UIElements.feedback.textContent = msg || "";
  }

  function setScore(val) {
    score = val;
    if (UIElements.scoreValue) UIElements.scoreValue.textContent = String(score);
  }

  function setProgress(i, total) {
    const safeTotal = Math.max(1, total);
    const safeI = clamp(i, 0, safeTotal);
    if (UIElements.progressText) UIElements.progressText.textContent = `Pregunta ${safeI}/${safeTotal}`;
    if (UIElements.barFill) UIElements.barFill.style.width = `${Math.round((safeI / safeTotal) * 100)}%`;
  }

  function disableAnswers(disabled) {
    if (!UIElements.answers) return;
    const btns = UIElements.answers.querySelectorAll("button.trivia-answer");
    btns.forEach((b) => (b.disabled = !!disabled));
  }

  // -----------------------------
  // Render principal
  // -----------------------------
  function render() {
    if (!hasAllUI) {
      console.warn("Trivia UI no encontrada. El modal no se ha cargado correctamente.");
      return;
    }

    // Título
    if (UIElements.title) {
      const name = countryId ? countryId.toUpperCase() : "PAÍS";
      UIElements.title.textContent = `Trivia — ${name}`;
    }

    // Si no hay país o no hay preguntas
    const total = questions.length;
    if (!countryId || total === 0) {
      setHidden(elEmpty, false);
      setHidden(elQwrap, true);
      setHidden(UIElements.result, true);

      setProgress(0, 5);
      setScore(0);
      setFeedback(null, "");
      if (UIElements.next) UIElements.next.disabled = true;
      return;
    }

    // Si ya terminó
    if (idx >= total) {
      showResult();
      return;
    }

    // Mostrar pregunta
    setHidden(UIElements.empty, true);
    setHidden(UIElements.result, true);
    setHidden(UIElements.qwrap, false);

    const qObj = questions[idx];
    setText(UIElements.question, qObj.pregunta);

    clearNode(UIElements.answers);
    setFeedback(null, "");
    locked = false;

    // Progreso y score
    setProgress(idx + 1, total);
    if (UIElements.next) UIElements.next.disabled = true;

    // Render opciones
    qObj.opciones.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trivia-answer";
      btn.dataset.idx = String(i);
      btn.textContent = opt;

      btn.addEventListener("click", () => onAnswer(i));
      UIElements.answers.appendChild(btn);
    });
  }

  function onAnswer(chosenIdx) {
    if (!questions.length) return;
    if (locked) return;

    locked = true;

    const qObj = questions[idx];
    const correctIdx = qObj.respuesta_correcta;

    const buttons = UIElements.answers.querySelectorAll("button.trivia-answer");
    buttons.forEach((b) => b.disabled = true);

    // marcar correcto/incorrecto visual
    buttons.forEach((b) => {
      const i = Number(b.dataset.idx);
      if (i === correctIdx) b.classList.add("correct");
      if (i === chosenIdx && i !== correctIdx) b.classList.add("wrong");
    });

    const isCorrect = chosenIdx === correctIdx;

    if (isCorrect) {
      // Sumar los puntos de la pregunta actual al score total
      const pointsWon = qObj.points || 100; // Usar 100 como fallback si no hay puntos definidos
      setScore(score + pointsWon);
      setFeedback("ok", "✅ Correcto");
      awardPoints(pointsWon); // Guardar los puntos en la BD
    } else {
      const correctText = qObj.opciones[correctIdx] ?? "la opción correcta";
      setFeedback("bad", `❌ Incorrecto — Respuesta: ${correctText}`);
    }

    if (UIElements.next) UIElements.next.disabled = false;
  }

  async function awardPoints(pointsToAdd) {
    const userId = localStorage.getItem('worldscan_userId');
    if (!userId || !pointsToAdd) return;

    try {
      await fetch('/api/user/add-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pointsToAdd }),
      });
      console.log(`🏆 Puntos guardados: ${pointsToAdd} para el usuario ${userId}`);
    } catch (error) {
      console.error('Error al guardar los puntos en la base de datos:', error);
    }
  }

  function next() {
    if (!questions.length) return;
    if (idx >= questions.length) return;

    idx += 1;
    render();
  }

  function showResult() {
    setHidden(UIElements.empty, true);
    setHidden(UIElements.qwrap, true);
    setHidden(UIElements.result, false);

    const total = questions.length || 5;
    setProgress(total, total);

    // Mensaje final con el total de puntos ganados
    const msg = `Felicidades, ganaste ${score.toLocaleString()} puntos`;
    if (UIElements.resultText) UIElements.resultText.textContent = msg;

    if (UIElements.next) UIElements.next.disabled = true;
    setFeedback(null, "");
  }

  function restart() {
    if (!countryId) {
      reset();
      return;
    }
    idx = 0;
    setScore(0);
    render();
  }

  // -----------------------------
  // API pública
  // -----------------------------
  function start(newCountryId, newQuestions = []) {
    // 1. Buscar y cachear los elementos del DOM del modal de trivia
    cacheUI();
    if (!hasAllUI) return; // Si no se encontraron, no continuar.

    // 2. Asignar listeners a los botones (solo una vez)
    UIElements.next.addEventListener("click", next);
    UIElements.restart.addEventListener("click", restart);
    if (UIElements.restart2) {
      UIElements.restart2.addEventListener("click", restart);
    }

    // Si viene null -> modo “escanea una bandera”
    countryId = newCountryId || null;

    questions = Array.isArray(newQuestions) ? newQuestions : [];

    idx = 0;
    setScore(0);

    render();
  }

  function reset() {
    countryId = null;
    questions = [];
    idx = 0;
    setScore(0);
    render();
  }
  // Exponer API global
  window.Trivia = {
    start,
    reset,
    restart
  };
})();

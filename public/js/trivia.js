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

  const elTitle = $("trivia-title");
  const elProgressText = $("trivia-progress-text");
  const elBarFill = $("trivia-bar-fill");
  const elScoreValue = $("trivia-score-value");

  const elEmpty = $("trivia-empty");
  const elQwrap = $("trivia-qwrap");
  const elQuestion = $("trivia-question");
  const elAnswers = $("trivia-answers");
  const elFeedback = $("trivia-feedback");

  const elNext = $("trivia-next");
  const elRestart = $("trivia-restart");
  const elRestart2 = $("trivia-restart-2");

  const elResult = $("trivia-result");
  const elResultText = $("trivia-result-text");

  // Si el HTML aún no está actualizado, evitamos romper.
  const requiredEls = [
    elProgressText, elBarFill, elScoreValue,
    elEmpty, elQwrap, elQuestion, elAnswers, elFeedback,
    elNext, elRestart, elResult, elResultText
  ];
  const hasAllUI = requiredEls.every(Boolean);

  // -----------------------------
  // Estado
  // -----------------------------
  let countryId = null;
  let questions = [];
  let idx = 0;
  let score = 0;
  let locked = false;      // evita doble respuesta
  let lastWasCorrect = null;

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
    if (!elFeedback) return;
    elFeedback.classList.remove("ok", "bad");
    if (type) elFeedback.classList.add(type);
    elFeedback.textContent = msg || "";
  }

  function setScore(val) {
    score = val;
    if (elScoreValue) elScoreValue.textContent = String(score);
  }

  function setProgress(i, total) {
    const safeTotal = Math.max(1, total);
    const safeI = clamp(i, 0, safeTotal);
    if (elProgressText) elProgressText.textContent = `Pregunta ${safeI}/${safeTotal}`;
    if (elBarFill) elBarFill.style.width = `${Math.round((safeI / safeTotal) * 100)}%`;
  }

  function disableAnswers(disabled) {
    if (!elAnswers) return;
    const btns = elAnswers.querySelectorAll("button.trivia-answer");
    btns.forEach((b) => (b.disabled = !!disabled));
  }

  // -----------------------------
  // Render principal
  // -----------------------------
  function render() {
    if (!hasAllUI) return;

    // Título
    if (elTitle) {
      const name = countryId ? countryId.toUpperCase() : "PAÍS";
      elTitle.textContent = `Trivia — ${name}`;
    }

    // Si no hay país o no hay preguntas
    const total = questions.length;
    if (!countryId || total === 0) {
      setHidden(elEmpty, false);
      setHidden(elQwrap, true);
      setHidden(elResult, true);

      setProgress(0, 5);
      setScore(0);
      setFeedback(null, "");
      if (elNext) elNext.disabled = true;
      return;
    }

    // Si ya terminó
    if (idx >= total) {
      showResult();
      return;
    }

    // Mostrar pregunta
    setHidden(elEmpty, true);
    setHidden(elResult, true);
    setHidden(elQwrap, false);

    const qObj = questions[idx];
    setText(elQuestion, qObj.q);

    clearNode(elAnswers);
    setFeedback(null, "");
    locked = false;
    lastWasCorrect = null;

    // Progreso y score
    setProgress(idx + 1, total);
    if (elNext) elNext.disabled = true;

    // Render opciones
    qObj.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trivia-answer";
      btn.dataset.idx = String(i);
      btn.textContent = opt;

      btn.addEventListener("click", () => onAnswer(i));
      elAnswers.appendChild(btn);
    });
  }

  function onAnswer(chosenIdx) {
    if (!questions.length) return;
    if (locked) return;

    locked = true;

    const qObj = questions[idx];
    const correctIdx = qObj.correct;

    const buttons = elAnswers.querySelectorAll("button.trivia-answer");
    buttons.forEach((b) => b.disabled = true);

    // marcar correcto/incorrecto visual
    buttons.forEach((b) => {
      const i = Number(b.dataset.idx);
      if (i === correctIdx) b.classList.add("correct");
      if (i === chosenIdx && i !== correctIdx) b.classList.add("wrong");
    });

    const isCorrect = chosenIdx === correctIdx;
    lastWasCorrect = isCorrect;

    if (isCorrect) {
      setScore(score + 1);
      setFeedback("ok", "✅ Correcto");
    } else {
      const correctText = qObj.options[correctIdx] ?? "la opción correcta";
      setFeedback("bad", `❌ Incorrecto — Respuesta: ${correctText}`);
    }

    if (elNext) elNext.disabled = false;
  }

  function next() {
    if (!questions.length) return;
    if (idx >= questions.length) return;

    idx += 1;
    render();
  }

  function showResult() {
    setHidden(elEmpty, true);
    setHidden(elQwrap, true);
    setHidden(elResult, false);

    const total = questions.length || 5;
    setProgress(total, total);

    const msg = `Obtuviste ${score}/${total}`;
    if (elResultText) elResultText.textContent = msg;

    if (elNext) elNext.disabled = true;
    setFeedback(null, "");
  }

  function restart() {
    if (!countryId || !window.TRIVIA_DB) {
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
  function start(newCountryId) {
    if (!hasAllUI) return;

    // Si viene null -> modo “escanea una bandera”
    countryId = newCountryId || null;

    const db = window.TRIVIA_DB || {};
    questions = countryId && Array.isArray(db[countryId]) ? db[countryId].slice() : [];

    idx = 0;
    setScore(0);

    render();
  }

  function reset() {
    countryId = null;
    questions = [];
    idx = 0;
    setScore(0);
    if (hasAllUI) render();
  }

  // -----------------------------
  // Listeners UI
  // -----------------------------
  if (hasAllUI) {
    // siguiente
    elNext.addEventListener("click", () => next());

    // reiniciar (dos botones)
    elRestart.addEventListener("click", () => restart());
    if (elRestart2) elRestart2.addEventListener("click", () => restart());
  }

  // Exponer API global
  window.Trivia = {
    start,
    reset,
    restart
  };
})();

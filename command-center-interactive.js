/* Cancer Command Center — interactive analysis "files":
   flip to peek, collect all seven, with a magnetic tilt + pick-up drag.
   Vanilla JS, no dependencies. Accessible + motion-safe. */
(function () {
  "use strict";

  var root = document.getElementById("analysis-files");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll(".cc-file-card"));
  if (!cards.length) return;

  var countEl = root.querySelector("[data-collected-count]");
  var tray = root.querySelector(".cc-files-tray");
  var hintEl = root.querySelector(".cc-tray-hint");
  var heroCta = document.querySelector(".cc-hero-copy .cc-live-link:not(.secondary)");
  var TOTAL = cards.length;
  var hintDefault = hintEl ? hintEl.textContent : "";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fancyPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var allowMotion = fancyPointer && !reduceMotion;

  /* ---- flip ---- */
  function flip(card, force) {
    var next = typeof force === "boolean" ? force : !card.classList.contains("is-flipped");
    card.classList.toggle("is-flipped", next);
    card.setAttribute("aria-pressed", next ? "true" : "false");
  }

  /* ---- collect ---- */
  function recount() {
    var n = root.querySelectorAll(".cc-file-card.is-collected").length;
    if (countEl) countEl.textContent = String(n);
    var done = n === TOTAL;
    if (tray) tray.classList.toggle("all-collected", done);
    if (hintEl) hintEl.textContent = done
      ? "All seven collected — your report is ready to run."
      : hintDefault;
    if (heroCta) {
      heroCta.classList.toggle("is-ready", done);
      if (done) {
        // restart the pulse
        heroCta.style.animation = "none";
        // eslint-disable-next-line no-unused-expressions
        heroCta.offsetWidth;
        heroCta.style.animation = "";
      }
    }
  }

  function collect(card, btn) {
    var next = !card.classList.contains("is-collected");
    card.classList.toggle("is-collected", next);
    btn.setAttribute("aria-pressed", next ? "true" : "false");
    btn.textContent = next ? "Added ✓" : "Add to report";
    recount();
  }

  /* ---- per-card wiring ---- */
  cards.forEach(function (card) {
    var dragState = null;
    var lastDragEnd = 0;

    var btn = card.querySelector(".cc-collect-btn");
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        collect(card, btn);
      });
      btn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    }

    // Click anywhere on the card flips it (unless a drag just happened).
    card.addEventListener("click", function () {
      if (Date.now() - lastDragEnd < 250) return;
      flip(card);
    });

    // Keyboard: Enter / Space flip.
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        flip(card);
      }
    });

    if (!allowMotion) return;

    function setVars(tx, ty, rx, ry) {
      card.style.setProperty("--tx", tx);
      card.style.setProperty("--ty", ty);
      card.style.setProperty("--rx", rx);
      card.style.setProperty("--ry", ry);
    }
    function reset() {
      card.style.transition = "";
      setVars("0px", "0px", "0deg", "0deg");
    }

    // Magnetic tilt on hover (when not pressed).
    card.addEventListener("pointermove", function (e) {
      if (dragState || e.pointerType !== "mouse") return;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = "none";
      setVars("0px", (-py * 6).toFixed(2) + "px", (-py * 9).toFixed(2) + "deg", (px * 11).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", function () {
      if (dragState) return;
      reset();
    });

    // Pick-up drag.
    card.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragState = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    });
    card.addEventListener("pointermove", function (e) {
      if (!dragState || e.pointerId !== dragState.id) return;
      var dx = e.clientX - dragState.x0;
      var dy = e.clientY - dragState.y0;
      if (!dragState.moved && Math.hypot(dx, dy) > 6) {
        dragState.moved = true;
        card.classList.add("is-dragging");
        try { card.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (dragState.moved) {
        setVars(dx.toFixed(1) + "px", dy.toFixed(1) + "px",
          (Math.max(-12, Math.min(12, -dy * 0.18))).toFixed(2) + "deg",
          (Math.max(-14, Math.min(14, dx * 0.2))).toFixed(2) + "deg");
      }
    });
    function endDrag(e) {
      if (!dragState || (e && e.pointerId !== dragState.id)) return;
      if (dragState.moved) {
        lastDragEnd = Date.now();       // suppress the flip click that follows
        card.classList.remove("is-dragging");
        card.style.transition = "";     // spring back via CSS transition
        setVars("0px", "0px", "0deg", "0deg");
      }
      dragState = null;
    }
    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);
  });

  recount();
})();

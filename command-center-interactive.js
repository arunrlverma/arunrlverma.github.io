/* Cancer Command Center — interactive analysis "files":
   flip to peek inside, with a magnetic tilt + pick-up drag.
   Vanilla JS, no dependencies. Accessible + motion-safe. */
(function () {
  "use strict";

  var root = document.getElementById("analysis-files");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll(".cc-file-card"));
  if (!cards.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fancyPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var allowMotion = fancyPointer && !reduceMotion;

  function flip(card) {
    var next = !card.classList.contains("is-flipped");
    card.classList.toggle("is-flipped", next);
    card.setAttribute("aria-pressed", next ? "true" : "false");
  }

  cards.forEach(function (card) {
    var dragState = null;
    var lastDragEnd = 0;

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
})();

/* Scroll-reveal + iframe skeleton (v5). Reduced-motion safe; no-JS shows all. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // iframe skeleton: cross-fade out when the sample report finishes loading
  var frame = document.querySelector(".cc-report-frame");
  if (frame) {
    var wrap = frame.closest(".cc-report-frame-wrap");
    var done = function () { if (wrap) wrap.classList.add("loaded"); };
    frame.addEventListener("load", done);
    // fallbacks: cached frames may have loaded before this ran
    if (frame.contentDocument && frame.contentDocument.readyState === "complete") done();
    setTimeout(done, 4000);
  }

  if (reduce) return; // leave everything visible, no scroll motion

  document.body.classList.add("cc-motion");

  var targets = document.querySelectorAll(".reveal, .reveal-grid");
  if (!targets.length || !("IntersectionObserver" in window)) {
    // no observer support: reveal everything so nothing stays hidden
    targets.forEach(function (el) { el.classList.add("is-in-view"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in-view");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });
})();

/* Persistent scroll CTA: show after the hero, hide through the full ending. */
(function () {
  "use strict";
  var bar = document.getElementById("sticky-cta");
  if (!bar || !("IntersectionObserver" in window)) return;
  var hero = document.querySelector(".cc-site-hero");
  var endings = Array.from(document.querySelectorAll(".cc-final-cta, .story-handoff"));
  var endingStates = endings.map(function () { return false; });
  var pastHero = false, atEnd = false;
  function update() { bar.classList.toggle("show", pastHero && !atEnd); }
  if (hero) new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting; update(); }, { threshold: 0 }).observe(hero);
  endings.forEach(function (ending, index) {
    new IntersectionObserver(function (entries) {
      endingStates[index] = entries[0].isIntersecting;
      atEnd = endingStates.some(Boolean);
      update();
    }, { threshold: 0 }).observe(ending);
  });
})();

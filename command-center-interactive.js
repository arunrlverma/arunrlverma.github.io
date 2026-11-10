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

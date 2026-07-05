// Progressive enhancements shared across long pages.
(function () {
  // Back-to-top control — appears after scrolling, respects reduced motion.
  var btn = document.createElement("button");
  btn.className = "to-top";
  btn.type = "button";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "↑";
  document.body.appendChild(btn);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  var ticking = false;
  function update() {
    btn.classList.toggle("show", window.scrollY > 700);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// Progressive enhancements shared across long, scroll-heavy pages.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // One compact, keyboard-safe mobile navigation shared by every page.
  var header = document.querySelector(".site-header");
  var primaryNav = header && header.querySelector("nav[aria-label='Primary navigation']");
  if (header && primaryNav) {
    primaryNav.id = primaryNav.id || "primary-navigation";
    var activeLink = primaryNav.querySelector("a.active");
    if (activeLink) activeLink.setAttribute("aria-current", "page");

    var navToggle = document.createElement("button");
    navToggle.className = "nav-toggle";
    navToggle.type = "button";
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-controls", primaryNav.id);
    navToggle.setAttribute("aria-label", "Open navigation");
    navToggle.title = "Open navigation";
    navToggle.innerHTML = [
      '<svg class="nav-icon nav-icon-menu" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path></svg>',
      '<svg class="nav-icon nav-icon-close" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>'
    ].join("");
    header.insertBefore(navToggle, primaryNav);
    header.classList.add("nav-enhanced");

    function navIsOpen() {
      return header.classList.contains("nav-open");
    }

    function setNavOpen(open, restoreFocus) {
      header.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      navToggle.title = open ? "Close navigation" : "Open navigation";
      document.body.classList.toggle("nav-menu-open", open);

      if (open) {
        var firstLink = primaryNav.querySelector("a");
        if (firstLink) firstLink.focus({ preventScroll: true });
      } else if (restoreFocus) {
        navToggle.focus();
      }
    }

    navToggle.addEventListener("click", function () {
      setNavOpen(!navIsOpen(), false);
    });

    primaryNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNavOpen(false, false);
    });

    document.addEventListener("keydown", function (event) {
      if (!navIsOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setNavOpen(false, true);
        return;
      }
      if (event.key !== "Tab") return;

      var focusable = [navToggle].concat(Array.from(primaryNav.querySelectorAll("a[href]")));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (!focusable.includes(document.activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (navIsOpen() && !header.contains(event.target)) setNavOpen(false, false);
    });

    var mobileNavQuery = window.matchMedia("(max-width: 880px)");
    function closeNavOnDesktop(event) {
      if (!event.matches && navIsOpen()) setNavOpen(false, false);
    }
    if (mobileNavQuery.addEventListener) mobileNavQuery.addEventListener("change", closeNavOnDesktop);
    else mobileNavQuery.addListener(closeNavOnDesktop);
  }

  // Thin scroll-progress rail — orientation on long pages.
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  // Back-to-top control — appears after scrolling.
  var btn = document.createElement("button");
  btn.className = "to-top";
  btn.type = "button";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "↑";
  document.body.appendChild(btn);
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  var ticking = false;
  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var y = window.scrollY || doc.scrollTop;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    btn.classList.toggle("show", y > 700);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
})();

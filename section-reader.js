// Active-section orientation for the long editorial pages.
(function () {
  var readers = Array.from(document.querySelectorAll("[data-section-reader]"));
  if (!readers.length) return;

  readers.forEach(function (reader) {
    var toggle = reader.querySelector(".section-reader-toggle");
    var menu = reader.querySelector(".section-reader-links");
    var current = reader.querySelector("[data-section-current]");
    var position = reader.querySelector("[data-section-position]");
    var links = Array.from(menu ? menu.querySelectorAll("a[href^='#']") : []);
    var items = links.map(function (link) {
      var id = decodeURIComponent(link.getAttribute("href").slice(1));
      return { link: link, target: document.getElementById(id) };
    }).filter(function (item) { return item.target; });

    if (!toggle || !menu || !items.length) return;

    reader.classList.add("is-enhanced");
    toggle.setAttribute("aria-label", "Open section menu");
    toggle.title = "Open section menu";

    function setOpen(open, restoreFocus) {
      reader.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close section menu" : "Open section menu");
      toggle.title = open ? "Close section menu" : "Open section menu";

      if (open) {
        window.requestAnimationFrame(function () {
          items[0].link.focus({ preventScroll: true });
        });
      } else if (restoreFocus) {
        toggle.focus({ preventScroll: true });
      }
    }

    function setActive(index) {
      var active = items[index] || items[0];
      items.forEach(function (item) {
        if (item === active) item.link.setAttribute("aria-current", "location");
        else item.link.removeAttribute("aria-current");
      });
      current.textContent = active.link.dataset.sectionLabel || active.link.textContent.trim();
      position.textContent = (items.indexOf(active) + 1) + " of " + items.length;
    }

    var ticking = false;
    function updateActiveSection() {
      var headerOffset = window.innerWidth <= 880 ? 128 : 136;
      var activeIndex = 0;

      items.forEach(function (item, index) {
        if (item.target.getBoundingClientRect().top <= headerOffset) activeIndex = index;
      });

      var doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
        activeIndex = items.length - 1;
      }

      setActive(activeIndex);
      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    }

    toggle.addEventListener("click", function () {
      setOpen(!reader.classList.contains("is-open"), false);
    });

    items.forEach(function (item) {
      item.link.addEventListener("click", function () {
        setOpen(false, false);
        window.setTimeout(requestUpdate, 80);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && reader.classList.contains("is-open")) {
        event.preventDefault();
        setOpen(false, true);
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (reader.classList.contains("is-open") && !reader.contains(event.target)) {
        setOpen(false, false);
      }
    });

    var compactQuery = window.matchMedia("(max-width: 880px)");
    function closeOnDesktop(event) {
      if (!event.matches) setOpen(false, false);
      requestUpdate();
    }
    if (compactQuery.addEventListener) compactQuery.addEventListener("change", closeOnDesktop);
    else compactQuery.addListener(closeOnDesktop);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("hashchange", requestUpdate);
    requestUpdate();
  });
})();

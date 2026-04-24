const categoryLabels = {
  diagnosis: "Diagnosis",
  imaging: "Imaging",
  treatment: "Treatment",
  data: "Data",
  labs: "Labs",
  personal: "Personal"
};

const state = {
  events: [],
  filter: "all",
  activeIndex: 0,
  activeVisualIndex: 0,
  activeStageMediaIndex: 0,
  activeVisualKey: "",
  flownSources: new Set(),
  stackSources: [],
  pendingFlySource: "",
  initialFlyDelayUsed: false
};

const list = document.querySelector("#timeline-list");
const stageDate = document.querySelector("#stage-date");
const stageCategory = document.querySelector("#stage-category");
const stageMedia = document.querySelector("#stage-media");
const stagePicker = document.querySelector("#stage-picker");
const stageCaption = document.querySelector("#stage-caption");

function readableDate(value) {
  if (value === "before") return "Before";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function eventDate(event) {
  return event.displayDate || readableDate(event.date);
}

function eventMatches(event) {
  return state.filter === "all" || event.category === state.filter;
}

function mediaMarkup(media) {
  if (!media) {
    return `<div class="empty-artifact">No image yet</div>`;
  }
  if (media.type === "video") {
    return `
      <video src="${media.src}" ${media.poster ? `poster="${media.poster}"` : ""} muted loop playsinline controls></video>
    `;
  }
  return `<img class="${media.fit === "contain" ? "fit-contain" : ""}" src="${media.src}" alt="${media.caption || "Timeline artifact"}">`;
}

function mediaPreview(media) {
  if (!media) return "";
  if (media.type === "video") return media.poster || "";
  return media.src;
}

function isGeneratedIllustration(media) {
  const src = mediaPreview(media) || media?.src || "";
  return src.split("/").pop()?.startsWith("illus-");
}

function isStageMedia(media, event) {
  if (!mediaPreview(media)) return false;
  if (event?.layout === "finale") return true;
  if (event?.stageAnchor === true) return true;
  return true;
}

function allStageMediaForEvent(event) {
  return (event?.media || []).filter((media) => isStageMedia(media, event));
}

function seenStageSourcesBefore(eventIndex) {
  const seen = new Set();
  state.events.forEach((event, index) => {
    if (index >= eventIndex || !eventMatches(event)) return;
    allStageMediaForEvent(event).forEach((media) => {
      const src = mediaPreview(media);
      if (src) seen.add(src);
    });
  });
  return seen;
}

function stageMediaForEvent(event, eventIndex) {
  if (!Number.isFinite(eventIndex)) return allStageMediaForEvent(event);
  const seen = seenStageSourcesBefore(eventIndex);
  return allStageMediaForEvent(event).filter((media) => !seen.has(mediaPreview(media)));
}

function stageMediaIndexForEvent(event, requestedIndex = 0, eventIndex = 0) {
  const mediaItems = event?.media || [];
  const seen = seenStageSourcesBefore(eventIndex);
  const requestedMedia = mediaItems[requestedIndex];
  if (
    !Number.isFinite(requestedIndex) ||
    !isStageMedia(requestedMedia, event) ||
    seen.has(mediaPreview(requestedMedia))
  ) {
    return 0;
  }
  return mediaItems
    .slice(0, requestedIndex + 1)
    .filter((media) => isStageMedia(media, event) && !seen.has(mediaPreview(media)))
    .length - 1;
}

function nearestVisualIndex(activeIndex) {
  for (let index = activeIndex; index >= 0; index -= 1) {
    const event = state.events[index];
    if (!event || !eventMatches(event)) continue;
    if (stageMediaForEvent(event, index).length) return index;
  }
  return activeIndex;
}

const stackOffsets = [
  { x: 0, y: 0, r: -1.2, s: 1, z: 40 },
  { x: 34, y: 22, r: 4.8, s: 0.982, z: 39 },
  { x: -36, y: 30, r: -6.4, s: 0.966, z: 38 },
  { x: 52, y: 46, r: 8.1, s: 0.95, z: 37 },
  { x: -55, y: 58, r: -9.8, s: 0.934, z: 36 },
  { x: 62, y: 70, r: 11.2, s: 0.918, z: 35 },
  { x: -65, y: 82, r: -12.4, s: 0.902, z: 34 },
  { x: 70, y: 93, r: 13.6, s: 0.886, z: 33 },
  { x: -72, y: 104, r: -14.5, s: 0.87, z: 32 }
];

function collectStoryStack(activeIndex, selectedMediaIndex = 0) {
  const visualIndex = nearestVisualIndex(activeIndex);
  const visualEvent = state.events[visualIndex];
  const visualMedia = stageMediaForEvent(visualEvent, visualIndex);
  const selected = visualMedia[selectedMediaIndex] || visualMedia[0];
  const previous = [];
  const seen = new Set();
  let activeLayer = selected ? {
    ...selected,
    src: mediaPreview(selected),
    videoSrc: selected.type === "video" ? selected.src : "",
    eventTitle: visualEvent.title,
    eventDate: eventDate(visualEvent),
    isActive: true
  } : null;

  if (activeLayer?.src) {
    seen.add(activeLayer.src);
  }

  state.events.forEach((event, eventIndex) => {
    if (eventIndex > visualIndex || !eventMatches(event)) return;
    if (eventIndex === visualIndex) return;
    const eventMedia = stageMediaForEvent(event, eventIndex);
    const representative = eventMedia.find((media) => media.type !== "video");
    if (!representative) return;
    const src = mediaPreview(representative);
    if (!src || seen.has(src)) return;
    seen.add(src);
    previous.push({
      ...representative,
      src,
      videoSrc: representative.type === "video" ? representative.src : "",
      eventTitle: event.title,
      eventDate: eventDate(event),
      isActive: false
    });
  });

  return [
    activeLayer,
    ...previous.slice(-8).reverse()
  ].filter(Boolean);
}

function stageLayerMediaMarkup(item, index) {
  if (item.type === "video" && index === 0 && item.videoSrc) {
    return `
      <video src="${item.videoSrc}" ${item.poster ? `poster="${item.poster}"` : ""} autoplay muted loop playsinline controls></video>
    `;
  }
  return `<img src="${item.src}" alt="${item.caption || item.eventTitle || "Timeline artifact"}">`;
}

function createStackLayer(item) {
  const figure = document.createElement("figure");
  figure.className = [
    "story-layer",
    item.type === "video" ? "video-layer" : "",
    item.fit === "contain" ? "fit-contain" : ""
  ].filter(Boolean).join(" ");
  figure.dataset.source = item.src;
  figure.setAttribute("data-label", item.eventDate || "");
  figure.innerHTML = stageLayerMediaMarkup(item, 0);
  return figure;
}

function triggerFlyIn(layer, source, entryX, entryY) {
  if (!layer || !source || state.flownSources.has(source)) return;
  layer.style.setProperty("--entry-x", entryX);
  layer.style.setProperty("--entry-y", entryY);
  layer.classList.remove("fly-in");
  state.pendingFlySource = source;

  const delay = state.initialFlyDelayUsed ? 0 : 180;
  state.initialFlyDelayUsed = true;

  window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (state.pendingFlySource !== source || state.flownSources.has(source) || !document.body.contains(layer)) return;
        void layer.offsetWidth;
        layer.classList.add("fly-in");
        state.flownSources.add(source);
        layer.addEventListener("animationend", () => {
          layer.classList.remove("fly-in");
        }, { once: true });
      });
    });
  }, delay);
}

function layerForSource(container, source) {
  return Array.from(container.querySelectorAll(".story-layer"))
    .find((layer) => layer.dataset.source === source);
}

function applyStackOffsets(container) {
  const layers = Array.from(container.querySelectorAll(".story-layer"));
  container.style.setProperty("--stack-count", layers.length);
  layers.forEach((layer, index) => {
    const offset = stackOffsets[index] || stackOffsets[stackOffsets.length - 1];
    layer.style.setProperty("--x", `${offset.x}px`);
    layer.style.setProperty("--y", `${offset.y}px`);
    layer.style.setProperty("--r", `${offset.r}deg`);
    layer.style.setProperty("--s", offset.s);
    layer.style.setProperty("--z", offset.z);
  });
}

function ensureStoryStackElement() {
  let stack = stageMedia.querySelector(".scroll-photo-stack");
  if (stack) return stack;
  stageMedia.innerHTML = "";
  stack = document.createElement("div");
  stack.className = "scroll-photo-stack";
  stack.setAttribute("role", "button");
  stack.tabIndex = 0;
  stack.setAttribute("aria-label", "Rotate stacked photos");
  stageMedia.appendChild(stack);
  return stack;
}

function updateStoryStack(activeIndex, mediaIndex = 0) {
  const layers = collectStoryStack(activeIndex, mediaIndex);
  if (!layers.length) {
    stageMedia.innerHTML = `<div class="empty-artifact">No image yet</div>`;
    state.stackSources = [];
    return;
  }

  const stack = ensureStoryStackElement();
  const activeLayer = layers[0];
  const entryX = activeIndex % 2 === 0 ? "-72vw" : "72vw";
  const entryY = activeIndex % 3 === 0 ? "-10vh" : "14vh";
  const desiredSources = layers
    .map((item) => item.src)
    .filter(Boolean)
    .slice(0, stackOffsets.length);

  layers.slice().reverse().forEach((item) => {
    if (layerForSource(stack, item.src)) return;
    const layer = createStackLayer(item);
    layer.style.setProperty("--entry-x", entryX);
    layer.style.setProperty("--entry-y", entryY);
    layer.style.setProperty("--delay", "0ms");
    stack.appendChild(layer);
  });

  state.stackSources = desiredSources;

  Array.from(stack.querySelectorAll(".story-layer")).forEach((layer) => {
    if (!state.stackSources.includes(layer.dataset.source)) {
      layer.remove();
    }
  });

  state.stackSources.forEach((source) => {
    const layer = layerForSource(stack, source);
    if (layer) stack.appendChild(layer);
  });

  applyStackOffsets(stack);
  triggerFlyIn(layerForSource(stack, activeLayer.src), activeLayer.src, entryX, entryY);
}

function stagePickerMarkup(mediaItems, selectedIndex = 0, eventIndex = 0) {
  if (mediaItems.length <= 1) return "";
  return `
    <div class="stage-choice-row">
      ${mediaItems.map((media, index) => {
        const preview = mediaPreview(media);
        return `
          <button class="stage-choice ${index === selectedIndex ? "active" : ""}" data-stage-event="${eventIndex}" data-stage-media="${index}" aria-label="Show artifact ${index + 1}">
            <img src="${preview}" alt="">
            ${media.type === "video" ? `<span class="play-mark">Play</span>` : ""}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function stackedMediaMarkup(mediaItems, selectedIndex = 0) {
  const selected = mediaItems[selectedIndex] || mediaItems[0];
  if (!selected || selected.type === "video") {
    return mediaMarkup(selected);
  }
  const images = [
    selected,
    ...mediaItems.filter((item, index) => index !== selectedIndex && item.type === "image")
  ].slice(0, 4);
  if (images.length <= 1) {
    return mediaMarkup(selected);
  }
  return `
    <div class="photo-stack">
      ${images.map((item) => `
        <figure class="photo-layer ${item.fit === "contain" ? "fit-contain" : ""}">
          <img src="${item.src}" alt="${item.caption || "Timeline artifact"}">
        </figure>
      `).join("")}
    </div>
  `;
}

function linksMarkup(links) {
  if (!links?.length) return "";
  return `
    <div class="event-links">
      ${links.map((link) => `
        <a href="${link.href}" target="_blank" rel="noreferrer">${link.label}</a>
      `).join("")}
    </div>
  `;
}

function eventCalloutMarkup(event) {
  if (!event.callout) return "";
  const media = event.media?.[event.callout.mediaIndex];
  const preview = mediaPreview(media);
  return `
    <aside class="event-callout">
      ${preview ? `<img src="${preview}" alt="${media?.caption || event.callout.title || "Timeline artifact"}">` : ""}
      <div>
        <b>${event.callout.title || ""}</b>
        <p>${event.callout.body || ""}</p>
      </div>
    </aside>
  `;
}

function finaleMarkup(event) {
  if (!event.media?.length) return "";
  return `
    <div class="finale-showcase" aria-label="Triangle product screenshots">
      ${event.media.map((media) => `
        <figure class="finale-screen">
          <img src="${media.src}" alt="${media.caption || "Triangle product screenshot"}">
        </figure>
      `).join("")}
    </div>
  `;
}

function setActive(index, mediaIndex = 0, mediaIndexIsStageIndex = false) {
  const event = state.events[index];
  if (!event) return;
  state.activeIndex = index;

  document.querySelectorAll(".timeline-card").forEach((card) => {
    card.classList.toggle("active", Number(card.dataset.index) === index);
  });

  const visualIndex = nearestVisualIndex(index);
  const visualEvent = state.events[visualIndex] || event;
  const visualMedia = stageMediaForEvent(visualEvent, visualIndex);
  const requestedStageIndex = mediaIndexIsStageIndex
    ? Math.max(0, Math.min(mediaIndex, visualMedia.length - 1))
    : (visualIndex === index ? stageMediaIndexForEvent(event, mediaIndex, index) : state.activeStageMediaIndex);
  const selectedStageIndex = Math.max(0, Math.min(requestedStageIndex, Math.max(visualMedia.length - 1, 0)));
  const media = visualMedia[selectedStageIndex] || visualMedia[0];
  const visualKey = `${state.filter}:${visualIndex}:${selectedStageIndex}:${mediaPreview(media)}`;

  if (visualKey === state.activeVisualKey) return;
  state.activeVisualKey = visualKey;
  state.activeVisualIndex = visualIndex;
  state.activeStageMediaIndex = selectedStageIndex;

  stageDate.textContent = eventDate(visualEvent);
  stageCategory.textContent = categoryLabels[visualEvent.category] || visualEvent.category || "Story";
  stageMedia.classList.add("stack-wrap");
  stageMedia.classList.add("story-stack-wrap");
  stageMedia.classList.toggle("wide-stack-wrap", visualEvent.layout === "finale");
  updateStoryStack(visualIndex, selectedStageIndex);
  stagePicker.innerHTML = stagePickerMarkup(visualMedia, selectedStageIndex, visualIndex);
  stageCaption.textContent = visualEvent.layout === "finale" ? "" : media?.caption || visualEvent.summary;
}

function renderTimeline() {
  list.innerHTML = "";
  state.activeVisualKey = "";
  state.stackSources = [];
  stageMedia.innerHTML = "";
  const visible = state.events.filter(eventMatches);
  visible.forEach((event) => {
    const originalIndex = state.events.indexOf(event);
    const card = document.createElement("article");
    card.className = `timeline-card ${event.category || ""} ${event.layout || ""}`;
    card.dataset.index = String(originalIndex);
    card.innerHTML = `
      <button class="node" data-event="${originalIndex}" aria-label="Select ${event.title}"></button>
      <div class="card-date">${eventDate(event)}</div>
      <div class="card-body">
        <div class="eyebrow">${event.eyebrow || categoryLabels[event.category] || "Event"}</div>
        <h2>${event.title}</h2>
        <p class="summary">${event.summary}</p>
        <p>${event.body || ""}</p>
        ${eventCalloutMarkup(event)}
        ${event.facts ? `<ul class="fact-list">${event.facts.map((fact) => `<li>${fact}</li>`).join("")}</ul>` : ""}
        ${linksMarkup(event.links)}
        ${event.layout === "finale" ? finaleMarkup(event) : ""}
        ${event.layout !== "finale" && event.media?.length > 1 ? `<div class="thumb-strip">${event.media.map((item, i) => `
          <button class="thumb" data-event="${originalIndex}" data-media="${i}" aria-label="Show artifact ${i + 1}">
            ${item.type === "video" ? `<span>Video</span>` : `<img src="${item.src}" alt="">`}
          </button>
        `).join("")}</div>` : ""}
      </div>
    `;
    list.appendChild(card);
  });

  bindScrollSpy();
  const firstVisible = visible[0] ? state.events.indexOf(visible[0]) : 0;
  setActive(firstVisible);
  scheduleScrollSpy();
}

let scrollSpyFrame = 0;
let scrollSpyBound = false;

function activationLineY() {
  return Math.min(window.innerHeight * 0.48, 460);
}

function activeIndexAtActivationLine() {
  const cards = Array.from(document.querySelectorAll(".timeline-card"));
  if (!cards.length) return state.activeIndex;

  const lineY = activationLineY();
  let lastPassed = cards[0];

  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    if (rect.top <= lineY && rect.bottom >= lineY) {
      return Number(card.dataset.index);
    }
    if (rect.top <= lineY) {
      lastPassed = card;
    }
  }

  return Number(lastPassed.dataset.index);
}

function updateActiveFromScroll() {
  scrollSpyFrame = 0;
  const nextIndex = activeIndexAtActivationLine();
  if (Number.isFinite(nextIndex) && nextIndex !== state.activeIndex) {
    setActive(nextIndex);
  }
}

function scheduleScrollSpy() {
  if (scrollSpyFrame) return;
  scrollSpyFrame = requestAnimationFrame(updateActiveFromScroll);
}

function bindScrollSpy() {
  if (scrollSpyBound) return;
  scrollSpyBound = true;
  window.addEventListener("scroll", scheduleScrollSpy, { passive: true });
  window.addEventListener("resize", scheduleScrollSpy);
}

document.addEventListener("click", (event) => {
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    state.filter = filter.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.classList.toggle("active", button === filter);
    });
    renderTimeline();
    return;
  }

  const node = event.target.closest(".node[data-event]");
  if (node) {
    setActive(Number(node.dataset.event));
    node.closest(".timeline-card")?.scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }

  const thumb = event.target.closest(".thumb");
  if (thumb) {
    const eventIndex = Number(thumb.dataset.event);
    const mediaIndex = Number(thumb.dataset.media);
    const item = state.events[eventIndex]?.media?.[mediaIndex];
    if (!item) return;
    setActive(eventIndex, mediaIndex);
    return;
  }

  const stageChoice = event.target.closest(".stage-choice");
  if (stageChoice) {
    setActive(Number(stageChoice.dataset.stageEvent), Number(stageChoice.dataset.stageMedia), true);
    return;
  }

  const stack = event.target.closest(".scroll-photo-stack");
  if (stack && !event.target.closest("video")) {
    const visualIndex = state.activeVisualIndex;
    const visualEvent = state.events[visualIndex];
    const visualMedia = stageMediaForEvent(visualEvent, visualIndex);
    if (visualMedia.length > 1) {
      const nextIndex = (state.activeStageMediaIndex + 1) % visualMedia.length;
      setActive(visualIndex, nextIndex, true);
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (!event.target.closest(".scroll-photo-stack")) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  const visualIndex = state.activeVisualIndex;
  const visualEvent = state.events[visualIndex];
  const visualMedia = stageMediaForEvent(visualEvent, visualIndex);
  if (visualMedia.length > 1) {
    const nextIndex = (state.activeStageMediaIndex + 1) % visualMedia.length;
    setActive(visualIndex, nextIndex, true);
  }
});

fetch("assets/data/timeline.json?v=20260424-portrait-camino")
  .then((response) => response.json())
  .then((events) => {
    state.events = events;
    renderTimeline();
  });

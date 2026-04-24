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
  activeVisualKey: ""
};

const list = document.querySelector("#timeline-list");
const stageDate = document.querySelector("#stage-date");
const stageCategory = document.querySelector("#stage-category");
const stageMedia = document.querySelector("#stage-media");
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

function isStageMedia(media, event) {
  if (!mediaPreview(media)) return false;
  if (event?.layout === "finale") return true;
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
  { x: 0, y: 0, r: -1.4, s: 1, z: 30 },
  { x: 17, y: 14, r: 4.2, s: 0.985, z: 29 },
  { x: -18, y: 20, r: -5.7, s: 0.97, z: 28 },
  { x: 28, y: 28, r: 7.4, s: 0.955, z: 27 },
  { x: -29, y: 36, r: -8.1, s: 0.94, z: 26 },
  { x: 37, y: 44, r: 9.2, s: 0.925, z: 25 },
  { x: -38, y: 52, r: -10.5, s: 0.91, z: 24 },
  { x: 44, y: 60, r: 11.6, s: 0.895, z: 23 },
  { x: -46, y: 68, r: -12.5, s: 0.88, z: 22 }
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
    eventTitle: visualEvent.title,
    isActive: true
  } : null;

  if (activeLayer?.src) {
    seen.add(activeLayer.src);
  }

  state.events.forEach((event, eventIndex) => {
    if (eventIndex > visualIndex || !eventMatches(event)) return;
    allStageMediaForEvent(event).forEach((media) => {
      const src = mediaPreview(media);
      if (!src || seen.has(src)) return;
      seen.add(src);
      previous.push({
        ...media,
        src,
        eventTitle: event.title,
        isActive: false
      });
    });
  });

  return [
    activeLayer,
    ...previous.slice(-8).reverse()
  ].filter(Boolean);
}

function growingStoryStackMarkup(activeIndex, mediaIndex = 0) {
  const layers = collectStoryStack(activeIndex, mediaIndex);
  if (!layers.length) return `<div class="empty-artifact">No image yet</div>`;
  const entryX = activeIndex % 2 === 0 ? "-72vw" : "72vw";
  const entryY = activeIndex % 3 === 0 ? "-10vh" : "14vh";
  return `
    <div class="scroll-photo-stack" style="--stack-count:${layers.length}">
      ${layers.map((item, index) => {
        const offset = stackOffsets[index] || stackOffsets[stackOffsets.length - 1];
        return `
          <figure class="story-layer ${item.fit === "contain" ? "fit-contain" : ""}" style="--x:${offset.x}px; --y:${offset.y}px; --r:${offset.r}deg; --s:${offset.s}; --z:${offset.z}; --entry-x:${entryX}; --entry-y:${entryY};">
            <img src="${item.src}" alt="${item.caption || item.eventTitle || "Timeline artifact"}">
          </figure>
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

function setActive(index, mediaIndex = 0) {
  const event = state.events[index];
  if (!event) return;
  state.activeIndex = index;

  document.querySelectorAll(".timeline-card").forEach((card) => {
    card.classList.toggle("active", Number(card.dataset.index) === index);
  });

  const visualIndex = nearestVisualIndex(index);
  const visualEvent = state.events[visualIndex] || event;
  const selectedStageIndex = visualIndex === index ? stageMediaIndexForEvent(event, mediaIndex, index) : 0;
  const visualMedia = stageMediaForEvent(visualEvent, visualIndex);
  const media = visualMedia[selectedStageIndex] || visualMedia[0];
  const visualKey = `${state.filter}:${visualIndex}:${mediaPreview(media)}`;

  if (visualKey === state.activeVisualKey) return;
  state.activeVisualKey = visualKey;

  stageDate.textContent = eventDate(visualEvent);
  stageCategory.textContent = categoryLabels[visualEvent.category] || visualEvent.category || "Story";
  stageMedia.classList.add("stack-wrap");
  stageMedia.classList.add("story-stack-wrap");
  stageMedia.classList.toggle("wide-stack-wrap", visualEvent.layout === "finale");
  stageMedia.innerHTML = growingStoryStackMarkup(visualIndex, selectedStageIndex);
  stageCaption.textContent = visualEvent.layout === "finale" ? "" : media?.caption || visualEvent.summary;
}

function renderTimeline() {
  list.innerHTML = "";
  state.activeVisualKey = "";
  const visible = state.events.filter(eventMatches);
  visible.forEach((event) => {
    const originalIndex = state.events.indexOf(event);
    const card = document.createElement("article");
    card.className = `timeline-card ${event.category || ""} ${event.layout || ""}`;
    card.dataset.index = String(originalIndex);
    card.innerHTML = `
      <div class="node"></div>
      <div class="card-date">${eventDate(event)}</div>
      <div class="card-body">
        <div class="eyebrow">${event.eyebrow || categoryLabels[event.category] || "Event"}</div>
        <h2>${event.title}</h2>
        <p class="summary">${event.summary}</p>
        <p>${event.body || ""}</p>
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

  observeCards();
  const firstVisible = visible[0] ? state.events.indexOf(visible[0]) : 0;
  setActive(firstVisible);
}

let observer;
function observeCards() {
  observer?.disconnect();
  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) {
      setActive(Number(visible[0].target.dataset.index));
    }
  }, {
    rootMargin: "-25% 0px -45% 0px",
    threshold: [0.2, 0.45, 0.7]
  });
  document.querySelectorAll(".timeline-card").forEach((card) => observer.observe(card));
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

  const thumb = event.target.closest(".thumb");
  if (thumb) {
    const eventIndex = Number(thumb.dataset.event);
    const mediaIndex = Number(thumb.dataset.media);
    const item = state.events[eventIndex]?.media?.[mediaIndex];
    if (!item) return;
    setActive(eventIndex, mediaIndex);
  }
});

fetch("assets/data/timeline.json")
  .then((response) => response.json())
  .then((events) => {
    state.events = events;
    renderTimeline();
  });

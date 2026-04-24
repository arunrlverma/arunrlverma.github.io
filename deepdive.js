const variantList = document.querySelector("#variant-list");
const variantDetail = document.querySelector("#variant-detail");
const geneticsBoard = document.querySelector("#genetics-board");
const geneticsDetail = document.querySelector("#genetics-detail");

const geneticsItems = [
  {
    id: "idh1",
    group: "tumor",
    label: "Tumor",
    gene: "IDH1",
    title: "IDH1 R132C",
    summary: "The defining tumor mutation and the reason IDH inhibition is central to the story.",
    changed: "Tumor cells carry the R132C change in IDH1.",
    why: "This changes tumor metabolism and creates the treatment logic for IDH inhibitors like ivosidenib and vorasidenib."
  },
  {
    id: "atrx",
    group: "tumor",
    label: "Tumor",
    gene: "ATRX",
    title: "ATRX alteration / loss",
    summary: "Part of the astrocytoma-supportive molecular pattern.",
    changed: "Records describe ATRX alteration and loss of expression.",
    why: "ATRX loss helps place the tumor in the IDH-mutant astrocytoma biology lane."
  },
  {
    id: "tp53",
    group: "boundary",
    label: "Boundary",
    gene: "TP53",
    title: "TP53 needs careful separation",
    summary: "TP53 appears in tumor records, with germline-versus-somatic context that should not be blurred.",
    changed: "Tumor reports include TP53 alteration; one source also raised germline TP53 / Li-Fraumeni language.",
    why: "Inherited TP53 and tumor TP53 mean very different things, so the public explainer should keep that boundary visible."
  },
  {
    id: "mgmt",
    group: "biomarker",
    label: "Biomarker",
    gene: "MGMT",
    title: "MGMT methylated",
    summary: "MGMT promoter methylation is reported.",
    changed: "The relevant clinical phrase is MGMT promoter methylated.",
    why: "In glioma, MGMT methylation is commonly discussed as part of alkylator-sensitivity context."
  },
  {
    id: "hla",
    group: "inherited",
    label: "Inherited",
    gene: "HLA",
    title: "HLA presentation context",
    summary: "Inherited HLA type shapes which tumor peptides can be presented to T cells.",
    changed: "The report includes class I HLA alleles used for neoantigen scoring.",
    why: "For a personal neoantigen vaccine, HLA is the bridge between tumor mutations and what immune cells can see."
  },
  {
    id: "pgx",
    group: "inherited",
    label: "Inherited",
    gene: "PGx",
    title: "Medication genetics context",
    summary: "Pharmacogenomic context belongs on the inherited side of the map.",
    changed: "The run includes PGx coverage limits and medication-relevant markers.",
    why: "This is separate from the tumor: it is about how my body may process medications, not what changed in the cancer."
  }
];

function detailMarkup(item) {
  return `
    <div class="eyebrow">${item.type}</div>
    <h3>${item.gene} ${item.finding}</h3>
    <p class="detail-role">${item.role}</p>
    <dl class="variant-facts">
      <div>
        <dt>Confidence</dt>
        <dd>${item.confidence}</dd>
      </div>
      <div>
        <dt>Reported value</dt>
        <dd>${item.vaf}</dd>
      </div>
      <div>
        <dt>Sources</dt>
        <dd>${item.source}</dd>
      </div>
    </dl>
    <div class="detail-columns">
      <section>
        <h4>Biology</h4>
        <p>${item.biology}</p>
      </section>
      <section>
        <h4>Treatment lens</h4>
        <p>${item.treatment}</p>
      </section>
      <section>
        <h4>Vaccine lens</h4>
        <p>${item.vaccine}</p>
      </section>
    </div>
  `;
}

function setVariant(items, id) {
  const item = items.find((entry) => entry.id === id) || items[0];
  if (!item) return;
  document.querySelectorAll(".variant-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.variant === item.id);
  });
  variantDetail.innerHTML = detailMarkup(item);
}

fetch("assets/data/variants.json")
  .then((response) => response.json())
  .then((items) => {
    variantList.innerHTML = items.map((item) => `
      <button class="variant-button" data-variant="${item.id}">
        <span>${item.gene}</span>
        <strong>${item.finding}</strong>
        <small>${item.type}</small>
      </button>
    `).join("");
    variantList.addEventListener("click", (event) => {
      const button = event.target.closest(".variant-button");
      if (!button) return;
      setVariant(items, button.dataset.variant);
    });
    setVariant(items, items[0]?.id);
  });

function geneticsDetailMarkup(item) {
  return `
    <div class="eyebrow">${item.label}</div>
    <h3>${item.title}</h3>
    <p>${item.summary}</p>
    <dl class="genetics-facts">
      <div>
        <dt>What changed</dt>
        <dd>${item.changed}</dd>
      </div>
      <div>
        <dt>Why it matters</dt>
        <dd>${item.why}</dd>
      </div>
    </dl>
  `;
}

function setGeneticsItem(items, id) {
  const item = items.find((entry) => entry.id === id) || items[0];
  if (!item || !geneticsDetail) return;
  document.querySelectorAll(".genetics-tile").forEach((button) => {
    button.classList.toggle("active", button.dataset.genetics === item.id);
  });
  geneticsDetail.innerHTML = geneticsDetailMarkup(item);
}

function renderGenetics(filter = "all") {
  if (!geneticsBoard) return;
  const filtered = geneticsItems.filter((item) => filter === "all" || item.group === filter);
  geneticsBoard.innerHTML = filtered.map((item) => `
    <button class="genetics-tile ${item.group}" data-genetics="${item.id}">
      <span>${item.label}</span>
      <strong>${item.gene}</strong>
      <small>${item.summary}</small>
    </button>
  `).join("");
  setGeneticsItem(filtered, filtered[0]?.id);
}

document.addEventListener("click", (event) => {
  const filterButton = event.target.closest("[data-genetics-filter]");
  if (filterButton) {
    const filter = filterButton.dataset.geneticsFilter;
    document.querySelectorAll("[data-genetics-filter]").forEach((button) => {
      button.classList.toggle("active", button === filterButton);
    });
    renderGenetics(filter);
    return;
  }

  const geneticsTile = event.target.closest(".genetics-tile");
  if (geneticsTile) {
    setGeneticsItem(geneticsItems, geneticsTile.dataset.genetics);
  }
});

renderGenetics();

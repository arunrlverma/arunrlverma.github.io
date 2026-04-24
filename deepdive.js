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
    summary: "The tumor mutation that explains why IDH inhibition matters in my case.",
    changed: "My tumor cells carry the R132C change in IDH1.",
    why: "This changes tumor metabolism, including production of 2-HG, and is why IDH inhibitors like ivosidenib and vorasidenib became part of the discussion."
  },
  {
    id: "atrx",
    group: "tumor",
    label: "Tumor",
    gene: "ATRX",
    title: "ATRX alteration / loss",
    summary: "One of the findings that helps explain the tumor pattern.",
    changed: "My records describe ATRX alteration and loss of expression.",
    why: "ATRX loss is one of the clues that fits with IDH-mutant astrocytoma."
  },
  {
    id: "tp53",
    group: "boundary",
    label: "Boundary",
    gene: "TP53",
    title: "TP53 needs careful separation",
    summary: "TP53 shows up in my records, but inherited TP53 and tumor-only TP53 are not the same thing.",
    changed: "Tumor reports include TP53 alteration; one source also raised germline TP53 / Li-Fraumeni language.",
    why: "That distinction matters a lot, so I do not want this page to blur it."
  },
  {
    id: "mgmt",
    group: "biomarker",
    label: "Biomarker",
    gene: "MGMT",
    title: "MGMT needs reconciliation",
    summary: "MGMT promoter status is discrepant across records.",
    changed: "Some reports say MGMT promoter methylated, while another source text says MGMT-promoter unmethylated.",
    why: "Because MGMT can matter in glioma treatment discussions, I want to show the discrepancy rather than pretend it is settled."
  },
  {
    id: "hla",
    group: "inherited",
    label: "Inherited",
    gene: "HLA",
    title: "What my immune system can see",
    summary: "My HLA type affects which tumor peptides can be shown to T cells.",
    changed: "My data includes class I HLA alleles used for neoantigen scoring.",
    why: "For a personalized neoantigen vaccine, HLA is the bridge between tumor mutations and what immune cells can notice."
  },
  {
    id: "pgx",
    group: "inherited",
    label: "Inherited",
    gene: "PGx",
    title: "Medication genetics",
    summary: "This is about how my body may process medications, not what changed in the tumor.",
    changed: "My data includes PGx coverage limits and medication-relevant markers.",
    why: "I keep this separate from the tumor genetics because inherited medication-processing clues answer a different question."
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

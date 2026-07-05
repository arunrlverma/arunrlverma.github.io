const variantList = document.querySelector("#variant-list");
const variantDetail = document.querySelector("#variant-detail");

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

fetch("assets/data/variants.json?v=20260424-tumor-data")
  .then((response) => {
    if (!response.ok) throw new Error(`Variant data request failed: ${response.status}`);
    return response.json();
  })
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
  })
  .catch((error) => {
    console.error(error);
    variantList.innerHTML = `<p role="alert" style="margin:24px 0;padding:18px 20px;border:1px solid rgba(37,37,35,.16);border-radius:14px;background:#fffdf8;color:#252523;font-size:15px;line-height:1.5;">The variant data couldn't load right now. Please refresh, or reach me at <a href="mailto:verma.arun@gmail.com">verma.arun@gmail.com</a>.</p>`;
  });

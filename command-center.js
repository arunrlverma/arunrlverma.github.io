const pipelineNodes = [
  {
    id: "setup",
    group: "Start",
    title: "Set up workspace",
    status: "complete",
    summary: "Create the private AWS workspace with Cognito auth, encrypted S3, Aurora metadata, Step Functions, and Batch.",
    inputs: ["AWS account", "CDK stack", "Budget guardrail", "Private repo"],
    outputs: ["Cognito user pool", "private S3 buckets", "Aurora metadata", "Step Functions + Batch"],
    command: "npm run cdk:deploy",
    codePath: "infra/lib/ccc-dev-stack.ts",
    code: `new CancerCommandCenterStack(app, "CccDevStack", {\n  stageName: "dev",\n  env: { region: "us-west-2" },\n});\n`,
  },
  {
    id: "patient",
    group: "Start",
    title: "Create patient case",
    status: "ready",
    summary: "Enter diagnosis context and create the private case record before uploads or compute begin.",
    inputs: ["Cancer type", "Tumor location", "Medication list", "Known biomarkers"],
    outputs: ["patient_context.json", "safety settings", "report preferences"],
    command: "save patient context",
    codePath: "apps/api/src/ccc_api/handler.py",
    code: `case = create_case({\n  "label": patient_label,\n  "cancerType": cancer_type,\n})\n`,
  },
  {
    id: "data",
    group: "Input",
    title: "Upload data",
    status: "ready",
    summary: "Attach tumor DNA, matched normal DNA, tumor RNA, VCF, RNA quantification, or outside reports.",
    inputs: ["Tumor DNA", "Normal DNA", "Tumor RNA", "Somatic VCF", "RNA quant.sf"],
    outputs: ["sample manifest", "raw S3 object", "upload audit state"],
    command: "POST /cases/{case_id}/samples",
    codePath: "apps/api/src/ccc_api/handler.py",
    code: `plan = create_sample(case_id, sample_manifest)\nupload_to_presigned_s3(plan.uploadUrl)\ncomplete_sample(plan.sampleId)\n`,
  },
  {
    id: "qc",
    group: "Run",
    title: "Check data quality",
    status: "auto",
    summary: "Inspect uploaded files, classify raw versus parseable inputs, and create QC readiness artifacts.",
    inputs: ["Uploaded sample manifest", "S3 object metadata", "File preview"],
    outputs: ["qc-summary.json", "qc_manifest.json", "format/readiness warnings"],
    command: "python -m triangle_runner run-step --step qc",
    codePath: "pipeline/triangle_runner/runner.py",
    code: `summary = classify_uploaded_samples(samples)\nwrite_json("qc-summary.json", summary)\n`,
  },
  {
    id: "variants",
    group: "Run",
    title: "Build variant artifacts",
    status: "auto",
    summary: "Parse uploaded VCF or JSON variant files into Triangle mutation artifacts; raw sequencing is gated until callers are mounted.",
    inputs: ["Somatic VCF", "Variant JSON", "or raw tumor/normal DNA"],
    outputs: ["variants-summary.json", "variants.json", "stage1_all_mutations.json"],
    command: "python -m triangle_runner run-step --step variants",
    codePath: "pipeline/triangle_runner/runner.py",
    code: `variants = parse_variant_payload(uploaded_vcf_or_json)\nwrite_json("stage1_all_mutations.json", variants)\n`,
  },
  {
    id: "rna",
    group: "Run",
    title: "Build RNA artifacts",
    status: "auto",
    summary: "Parse uploaded RNA quantification or expression JSON into Triangle RNA artifacts; raw RNA is gated until STAR/Salmon is mounted.",
    inputs: ["quant.sf", "expression JSON", "or raw tumor RNA"],
    outputs: ["rna-summary.json", "rna-expression.json"],
    command: "python -m triangle_runner run-step --step rna",
    codePath: "pipeline/triangle_runner/runner.py",
    code: `expression = parse_rna_payload(quant_or_json)\nwrite_json("rna-expression.json", expression)\n`,
  },
  {
    id: "neoantigens",
    group: "Run",
    title: "Build neoantigen artifacts",
    status: "review",
    summary: "Seed neoantigen artifacts from variants and gate full HLA/MHC scoring until that backend is mounted.",
    inputs: ["variants.json", "HLA typing", "peptide scoring backend"],
    outputs: ["neoantigen-summary.json", "neoantigen-candidates.json"],
    command: "python -m triangle_runner run-step --step neoantigens",
    codePath: "pipeline/triangle_runner/runner.py",
    code: `seeds = build_candidate_seeds(variants)\nrequire_backend("HLA + MHC scoring")\n`,
  },
  {
    id: "package",
    group: "Run",
    title: "Build action package",
    status: "review",
    summary: "Collapse stage artifacts into vaccine, drug, supplement, and trial readiness overlays.",
    inputs: ["QC", "Variants", "RNA", "Neoantigens"],
    outputs: ["action-overlays.json"],
    command: "python -m triangle_runner run-step --step package",
    codePath: "pipeline/triangle_runner/runner.py",
    code: `overlays = build_action_overlays(qc, variants, rna, neoantigens)\nwrite_json("action-overlays.json", overlays)\n`,
  },
  {
    id: "reports",
    group: "Report",
    title: "Generate reports",
    status: "ready",
    summary: "Export a report index and HTML report from the staged Triangle artifacts.",
    inputs: ["All analysis artifacts", "Review gates", "Safety flags"],
    outputs: ["report-index.json", "triangle-report.html"],
    command: "python -m triangle_runner run-step --step final_reports",
    codePath: "pipeline/triangle_runner/runner.py",
    code: `report_index = build_report_index(stage_artifacts)\nrender_html_report(report_index)\n`,
  },
];

const reportOverlays = [
  {
    id: "vaccine",
    label: "Vaccine",
    status: "research",
    title: "Personal vaccine packet",
    summary: "A clinician-facing summary of HLA typing, expressed mutations, peptide candidates, and manufacturing-ready questions.",
    metrics: ["HLA context", "ranked peptides", "RNA support"],
    includes: ["Candidate ranking", "class I and class II context", "self-similarity checks", "vendor discussion packet"],
  },
  {
    id: "drugs",
    label: "Drugs",
    status: "review",
    title: "Repurposed drug hypotheses",
    summary: "A pathway-first view of drugs that may fit the tumor biology, separated from weak association-only evidence.",
    metrics: ["driver pathways", "target overlap", "safety flags"],
    includes: ["Mutated-gene targets", "pathway-level targets", "mechanistic evidence", "interaction cautions"],
  },
  {
    id: "supplements",
    label: "Supplements",
    status: "caution",
    title: "Supplement evidence check",
    summary: "A conservative screen of supplements against tumor context, medication interactions, BBB plausibility, and literature support.",
    metrics: ["tumor overlay", "drug interactions", "source links"],
    includes: ["Helpful hypotheses", "caution / avoid list", "claim-level evidence", "oncologist review notes"],
  },
  {
    id: "trials",
    label: "Trials",
    status: "match",
    title: "Clinical trial shortlist",
    summary: "A practical trial-matching packet based on cancer type, biomarkers, treatment history, geography, and eligibility criteria.",
    metrics: ["biomarker fit", "eligibility notes", "NCT links"],
    includes: ["Trial shortlist", "inclusion / exclusion summary", "questions for trial sites", "contact-ready export"],
  },
];

let activeNode = pipelineNodes[0];
let activeTab = "overview";

function statusClass(status) {
  return status === "complete" ? "complete" : status === "review" ? "review" : "ready";
}

function renderGraph() {
  const graph = document.querySelector("#pipeline-graph");
  const groups = [...new Set(pipelineNodes.map((node) => node.group))];
  graph.innerHTML = groups.map((group) => {
    const nodes = pipelineNodes.filter((node) => node.group === group);
    return `
      <div class="cc-lane">
        <div class="cc-lane-label">${group}</div>
        <div class="cc-lane-nodes">
          ${nodes.map((node) => `
            <button class="cc-node ${statusClass(node.status)} ${node.id === activeNode.id ? "active" : ""}" data-node="${node.id}" type="button">
              <span>${node.status}</span>
              <strong>${node.title}</strong>
              <small>${node.summary}</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function listMarkup(items) {
  return `<ul class="cc-detail-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderDetailBody() {
  const body = document.querySelector("#detail-body");
  if (activeTab === "overview") {
    body.innerHTML = `
      <div class="cc-runline"><span>Action</span><code>${activeNode.command}</code></div>
      <div class="cc-runline"><span>Code</span><code>${activeNode.codePath}</code></div>
    `;
  } else if (activeTab === "inputs") {
    body.innerHTML = listMarkup(activeNode.inputs);
  } else if (activeTab === "code") {
    body.innerHTML = `<pre class="cc-code"><code>${activeNode.code}</code></pre>`;
  } else {
    body.innerHTML = listMarkup(activeNode.outputs);
  }
}

function renderDetail() {
  document.querySelector("#detail-status").textContent = activeNode.status;
  document.querySelector("#detail-status").className = `cc-pill ${statusClass(activeNode.status)}`;
  document.querySelector("#detail-title").textContent = activeNode.title;
  document.querySelector("#detail-summary").textContent = activeNode.summary;
  document.querySelector("#run-node").textContent = activeNode.status === "review" ? "Open review" : "Run step";
  document.querySelectorAll(".cc-tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === activeTab);
  });
  renderDetailBody();
}

function setNode(id) {
  activeNode = pipelineNodes.find((node) => node.id === id) || pipelineNodes[0];
  activeTab = "overview";
  renderGraph();
  renderDetail();
}

function renderReports(activeId = "vaccine") {
  const grid = document.querySelector("#report-grid");
  const detail = document.querySelector("#report-detail");
  const active = reportOverlays.find((item) => item.id === activeId) || reportOverlays[0];
  grid.innerHTML = reportOverlays.map((item) => `
    <button class="cc-report-card ${item.id === active.id ? "active" : ""}" data-report="${item.id}" type="button">
      <span>${item.status}</span>
      <strong>${item.label}</strong>
      <small>${item.title}</small>
    </button>
  `).join("");
  detail.innerHTML = `
    <div>
      <div class="kicker">${active.label}</div>
      <h3>${active.title}</h3>
      <p>${active.summary}</p>
    </div>
    <div class="cc-report-columns">
      <section>
        <h4>Checks</h4>
        ${listMarkup(active.metrics)}
      </section>
      <section>
        <h4>Includes</h4>
        ${listMarkup(active.includes)}
      </section>
    </div>
  `;
}

document.querySelector("#pipeline-graph").addEventListener("click", (event) => {
  const button = event.target.closest(".cc-node");
  if (!button) return;
  setNode(button.dataset.node);
});

document.querySelector(".cc-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tab]");
  if (!button) return;
  activeTab = button.dataset.tab;
  renderDetail();
});

document.querySelector("#report-grid").addEventListener("click", (event) => {
  const button = event.target.closest(".cc-report-card");
  if (!button) return;
  renderReports(button.dataset.report);
});

renderGraph();
renderDetail();
renderReports();

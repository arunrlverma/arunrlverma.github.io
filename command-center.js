const pipelineNodes = [
  {
    id: "upload",
    group: "Input",
    title: "Upload and checksum",
    status: "ready",
    summary: "Batch FASTQ/BAM/CRAM uploads, detect MD5 sidecars, attach checksums to matching samples, and show upload progress.",
    inputs: ["Tumor DNA", "Normal DNA", "Tumor RNA", "MD5 sidecars"],
    outputs: ["sample manifest", "raw S3 objects", "upload audit state"],
    artifacts: ["sample manifest", "checksum attachment log"],
    logs: ["upload: multipart session created", "upload: sidecars attached to samples", "upload: completed files become runnable"],
    command: "POST /cases/{case_id}/samples",
    codePath: "apps/api/src/ccc_api/handler.py",
    code: `plan = create_sample(case_id, sample_manifest)\nparts = create_multipart_urls(plan)\ncomplete_sample(plan.sampleId, parts)\n`,
  },
  {
    id: "preflight",
    group: "Input",
    title: "Preflight",
    status: "ready",
    summary: "Validate the case, uploaded inputs, reference manifest, tool manifest, and run budget before compute starts.",
    inputs: ["run-input.json", "sample manifest", "reference manifest"],
    outputs: ["preflight_manifest.json", "blocking warnings"],
    artifacts: ["preflight manifest"],
    logs: ["preflight: checking uploaded samples", "preflight: checking references", "preflight: run may proceed"],
    command: "python -m triangle_runner run-step --step preflight",
    codePath: "pipeline/triangle_runner/runner.py",
    code: `validate_inputs(run_input)\nvalidate_references(reference_manifest)\nwrite_manifest("preflight_manifest.json")\n`,
  },
  {
    id: "wes",
    group: "Compute",
    title: "WES backbone",
    status: "ready",
    summary: "Run BWA-MEM2, BQSR, Mutect2, MuSE, HaplotypeCaller, and VEP-backed variant enrichment from the notebook adapters.",
    inputs: ["tumor FASTQ", "normal FASTQ", "GRCh38", "known-sites VCFs"],
    outputs: ["somatic VCFs", "germline VCF", "stage1_all_mutations.json"],
    artifacts: ["variants-summary.json", "somatic.vep.txt", "germline.phased.vcf.gz"],
    logs: ["variants: bwa_mem2 alignment", "variants: BQSR recalibration", "variant_annotation: VEP and enrichment ready"],
    command: "python -m triangle_runner run-step --step variants",
    codePath: "workers/bwa_mem2_worker.py",
    code: `run_bwa_mem2_local(tumor_fastqs)\nrun_bqsr_worker(tumor_bam, normal_bam)\nrun_mutect2_and_muse()\n`,
  },
  {
    id: "rna",
    group: "Compute",
    title: "RNA analysis",
    status: "ready",
    summary: "Run STAR, Salmon, Arriba, expression overlays, subtype context, and review-gated RNA-only variant rescue.",
    inputs: ["RNA FASTQ", "GENCODE", "STAR index", "somatic variants"],
    outputs: ["gene_tpm.json", "fusions.tsv", "rna_only_variants.json"],
    artifacts: ["rna-summary.json", "arriba-fusions.tsv", "rna_only_variants.json"],
    logs: ["rna: STAR alignment", "rna: Salmon quantification", "finalize: RNA-only rescue review artifact"],
    command: "python -m triangle_runner run-step --step rna",
    codePath: "workers/star_worker.py",
    code: `run_star(rna_fastqs)\nrun_salmon_quant()\nrun_arriba_fusions()\n`,
  },
  {
    id: "biomarkers",
    group: "Compute",
    title: "Biomarkers, CNV, SV, HLA",
    status: "ready",
    summary: "Compute TMB/MSI, PureCN/FACETS copy-number context, Manta/dysgu structural variants, HLA typing, PGx, and HLA-LOH.",
    inputs: ["BAMs", "somatic VCF", "normal VCF", "RNA BAM"],
    outputs: ["tmb.json", "msi.json", "cnv_profile.json", "hla_loh.json"],
    artifacts: ["biomarkers-summary.json", "cnv-summary.json", "hla-loh-summary.json", "pharmcat-report.json"],
    logs: ["biomarkers: TMB/MSI ready", "cnv: PureCN/FACETS ready", "hla_loh: LOHHLA rows validated"],
    command: "python -m triangle_runner run-step --step hla_loh",
    codePath: "workers/lohhla_worker.py",
    code: `hla = run_hla_callers()\nloh = run_lohhla(tumor_bam, normal_bam, hla)\nwrite_json("hla-loh.json", loh)\n`,
  },
  {
    id: "neoantigen",
    group: "Vaccine",
    title: "Neoantigen scoring",
    status: "ready",
    summary: "Generate mutation and frameshift peptides, score class I/class II binding, run PRIME/TCR, splicing, safety, and candidate ranking.",
    inputs: ["VEP missense rows", "frameshift rows", "HLA alleles", "RNA expression"],
    outputs: ["neoantigens_v5_all.json", "prime_results.json", "vaccine_candidates.json"],
    artifacts: ["neoantigen-summary.json", "neoantigens_v5_all.json", "vaccine_candidates.json"],
    logs: ["neoantigens: generated peptides", "neoantigens: class I and class II scoring", "neoantigens: PRIME and splicing integrated"],
    command: "python -m triangle_runner run-step --step neoantigens",
    codePath: "pipeline/triangle_runner/neoantigen.py",
    code: `peptides = build_point_and_frameshift_peptides(vep)\nscore_mhc_binding(peptides, hla)\nintegrate_prime_and_splicing()\n`,
  },
  {
    id: "therapeutics",
    group: "Report",
    title: "Therapeutics and supplements",
    status: "review",
    summary: "Map mutations to pathways, drugs, clinical trials, metabolic vulnerabilities, supplement strategy, and claim-level consensus.",
    inputs: ["variant_pathogenicity.json", "pathway_enrichment.json", "research provider keys"],
    outputs: ["stage6_ranked.json", "clinical_trials.json", "supplement_consensus.json"],
    artifacts: ["metabolic_vulnerabilities.json", "supplement_direction_rules.json", "supplement_consensus.json"],
    logs: ["finalize: generate_vulnerabilities", "finalize: supplement_full_matcher", "finalize: supplement_consensus"],
    command: "python scripts/finish_pipeline.py",
    codePath: "health/pharma/comprehensive/generate_vulnerabilities.py",
    code: `generate_vulnerabilities()\nsupplement_full_matcher()\nsupplement_consensus()\n`,
  },
  {
    id: "reports",
    group: "Report",
    title: "Final reports",
    status: "ready",
    summary: "Export Triangle HTML reports, a package manifest, source manifests, progress logs, and downloadable artifacts for review.",
    inputs: ["all step artifacts", "pipeline_qc.json", "notebook-native-stages.json"],
    outputs: ["triangle-unified-report-v2.html", "report-index.json", "final_reports_manifest.json"],
    artifacts: ["Triangle HTML report", "report index", "notebook parity report", "package manifest"],
    logs: ["triangle_finalize: report ready", "package: overlays ready", "final_reports: report-index published"],
    command: "python -m triangle_runner run-step --step final_reports",
    codePath: "pipeline/triangle_runner/runner.py",
    code: `report_index = build_report_index(stage_artifacts)\nrender_html_report(report_index)\npublish_download_cards()\n`,
  },
];

const modulePhases = [
  {
    title: "Step 0 Upload",
    tint: "input",
    summary: "File choice, multipart upload, checksum sidecars, resumable progress.",
    modules: ["sample upload", "MD5 sidecars", "run input manifest", "preflight"],
  },
  {
    title: "Align / QC",
    tint: "align",
    summary: "Raw sequencing becomes aligned and quality-reviewed artifacts.",
    modules: ["fastp optional", "bwa_mem2", "STAR", "Salmon", "Arriba", "BQSR", "qc_worker"],
  },
  {
    title: "Variants",
    tint: "variant",
    summary: "Somatic and germline evidence with caller consensus and annotation.",
    modules: ["Mutect2", "MuSE", "HaplotypeCaller", "VEP", "stage1_extract_mutations", "somatic_consensus", "germline_panel_screen"],
  },
  {
    title: "RNA",
    tint: "rna",
    summary: "Expression, fusions, subtype, cell-surface overlays, and RNA-only rescue.",
    modules: ["differential_expression", "rna_validation", "tumor_subtype", "rna_expression_annotation", "rna_variant_discovery", "cell_surface_target_profile"],
  },
  {
    title: "Biomarkers / HLA",
    tint: "hla",
    summary: "TMB, MSI, copy number, structural variants, HLA typing, PGx, HLA-LOH.",
    modules: ["TMB", "MSI", "CNV", "PureCN", "FACETS", "Manta", "sv_annotation", "OptiType", "arcasHLA", "LOHHLA", "PharmCAT"],
  },
  {
    title: "Neoantigen",
    tint: "neo",
    summary: "Mutation peptides, class I/II scoring, PRIME/TCR, splicing, SLP design.",
    modules: ["neoantigen_gold_v2", "classII_arcasHLA", "PRIME", "MixMHCpred", "splicing", "tcr_fitness", "SLP design", "flanking optimizer"],
  },
  {
    title: "Therapeutics",
    tint: "therapy",
    summary: "Pathways, drugs, trials, vulnerabilities, supplements, and consensus review.",
    modules: ["pathway_enrichment", "approved_drug_sweep", "evidence_ranking", "clinical_trial_match", "generate_vulnerabilities", "supplement_full_matcher", "supplement_consensus"],
  },
  {
    title: "Reports",
    tint: "report",
    summary: "Native Triangle reports and download cards from validated artifacts.",
    modules: ["pipeline_qc", "notebook parity", "triangle_finalize", "package", "final_reports", "download cards", "live logs"],
  },
];

const reportOverlays = [
  {
    id: "triangle",
    label: "Latest Report",
    status: "download",
    title: "Triangle HTML report",
    summary: "The main clinician-review HTML output generated from the native Triangle finalization step.",
    metrics: ["native report", "run manifest", "QC guardrails"],
    includes: ["Latest report button", "Triangle v2 HTML", "pipeline_qc.json"],
    artifacts: [{ label: "Open sample report", href: "assets/downloads/triangle-unified-report.html" }],
  },
  {
    id: "vaccine",
    label: "Vaccine",
    status: "review",
    title: "Personal vaccine packet",
    summary: "HLA typing, expressed mutations, peptide/MHC hypotheses, PRIME/TCR and splicing context, and manufacturing questions.",
    metrics: ["HLA context", "ranked peptides", "RNA support"],
    includes: ["Candidate ranking", "class I and class II context", "self-similarity checks", "vendor discussion packet"],
    artifacts: [{ label: "Monitoring JSON", href: "assets/downloads/vaccine-monitoring-summary.json" }],
  },
  {
    id: "therapeutics",
    label: "Therapeutics",
    status: "review",
    title: "Drugs, pathways, and trials",
    summary: "A pathway-first view of drugs and trials, separated from weak association-only evidence.",
    metrics: ["driver pathways", "target overlap", "trial fit"],
    includes: ["Pathway hypotheses", "drug evidence tiers", "clinical trial shortlist"],
    artifacts: [{ label: "Variant summary", href: "assets/downloads/variant-summary.json" }],
  },
  {
    id: "supplements",
    label: "Supplements",
    status: "caution",
    title: "Supplement evidence check",
    summary: "A conservative screen against tumor context, medication interactions, BBB plausibility, and claim-level citations.",
    metrics: ["vulnerabilities", "direction rules", "source links"],
    includes: ["Helpful hypotheses", "caution / avoid list", "claim-level evidence", "oncologist review notes"],
    artifacts: [{ label: "Researcher README", href: "assets/downloads/researcher-readme.md" }],
  },
];

let activeNode = pipelineNodes[0];
let activeTab = "overview";
let logIndex = 0;

function statusClass(status) {
  if (status === "ready" || status === "complete") return "complete";
  if (status === "review") return "review";
  return "ready";
}

function listMarkup(items) {
  return `<ul class="cc-detail-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function artifactMarkup(items) {
  if (!items.length) return listMarkup(["No public artifact linked for this card."]);
  return `<div class="cc-artifact-buttons">${items.map((item) => {
    if (typeof item === "string") return `<span class="cc-artifact-chip">${item}</span>`;
    return `<a class="cc-artifact-chip link" href="${item.href}" target="_blank" rel="noopener">${item.label}</a>`;
  }).join("")}</div>`;
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

function renderDetailBody() {
  const body = document.querySelector("#detail-body");
  if (activeTab === "overview") {
    body.innerHTML = `
      <div class="cc-runline"><span>Action</span><code>${activeNode.command}</code></div>
      <div class="cc-runline"><span>Code</span><code>${activeNode.codePath}</code></div>
      <div class="cc-runline"><span>Download cards</span>${artifactMarkup(activeNode.artifacts)}</div>
    `;
  } else if (activeTab === "inputs") {
    body.innerHTML = listMarkup(activeNode.inputs);
  } else if (activeTab === "outputs") {
    body.innerHTML = listMarkup(activeNode.outputs);
  } else if (activeTab === "logs") {
    body.innerHTML = `
      <div class="cc-terminal" role="log" aria-label="Representative run logs">
        ${activeNode.logs.map((line, index) => `
          <div class="cc-terminal-line"><time>0${index}:0${index + 2}</time><span>${line}</span></div>
        `).join("")}
      </div>
    `;
  } else if (activeTab === "artifacts") {
    body.innerHTML = artifactMarkup(activeNode.artifacts);
  } else {
    body.innerHTML = `<pre class="cc-code"><code>${activeNode.code}</code></pre>`;
  }
}

function renderDetail() {
  document.querySelector("#detail-status").textContent = activeNode.status;
  document.querySelector("#detail-status").className = `cc-pill ${statusClass(activeNode.status)}`;
  document.querySelector("#detail-title").textContent = activeNode.title;
  document.querySelector("#detail-summary").textContent = activeNode.summary;
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
  renderLiveLog();
}

function renderLiveLog() {
  const log = document.querySelector("#live-log-strip");
  const lines = activeNode.logs;
  const line = lines[logIndex % lines.length];
  log.innerHTML = `
    <span class="cc-live-dot"></span>
    <strong>${activeNode.title}</strong>
    <code>${line}</code>
  `;
  logIndex += 1;
}

function renderModuleMap() {
  const target = document.querySelector("#module-map");
  target.innerHTML = modulePhases.map((phase) => `
    <article class="cc-phase-card ${phase.tint}">
      <span>${phase.title}</span>
      <h3>${phase.title}</h3>
      <p>${phase.summary}</p>
      <div class="cc-module-chips">
        ${phase.modules.map((module) => `<b>${module}</b>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderReports(activeId = "triangle") {
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
      ${artifactMarkup(active.artifacts)}
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
renderModuleMap();
renderReports();
renderLiveLog();
setInterval(renderLiveLog, 2400);

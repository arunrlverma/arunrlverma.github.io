# Arun Personal Site

Minimal static prototype for a personal cancer timeline, visual cancer deepdive, and contact page.

## Run Locally

```bash
cd /Users/ai/code/arun-personal-site
python3 -m http.server 4173
```

Open:

```text
http://127.0.0.1:4173/
```

## Structure

- `index.html` — scroll-driven timeline.
- `deepdive.html` — visual cancer explainer scaffold.
- `contact.html` — simple contact page.
- `assets/data/timeline.json` — timeline content model.
- `assets/media/` — web-friendly media converted from HEIC/MOV/MP4.
- `assets/originals/` — original media copies.
- `CNAME` — GitHub Pages custom domain (`arunverma.io`).

## Publish Notes

This site is ready for GitHub Pages from the repository root. The raw `assets/originals/`
folder is intentionally gitignored so only the web-optimized media is published.

For `arunverma.io`, configure GitHub Pages to serve from the main branch root, then point
the GoDaddy apex DNS records to GitHub Pages and set `www` as a CNAME to the Pages host.

## Content Notes

Many captions are placeholders marked "Caption to refine." The EXIF-derived dates were used where available, but a few JPGs had no embedded capture date and should be manually placed later.

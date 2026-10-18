# PDF Template Studio — scoped open-source pilot

Upstream: https://github.com/pdfme/pdfme
License: MIT. Build the minimal Designer+Generator, not the official playground with Sentry.
Status: feature-branch proof only; no VESA App Centre registration or public deployment.
Pinned npm packages: @pdfme/common, @pdfme/ui, @pdfme/generator, @pdfme/schemas (all explicit v6 pin resolved by npm).
Data: sample/synthetic records only. Templates generated and downloaded in the user's browser. No provider or network service.
Frozen: Existing 22 apps and their calculations, saved copy formats, login, branding and service workers.
CI proof: compile offline Vite dist, audit runtime external URLs and all required local assets; perform Chromium editing/generation/offline proof before release.
Rollback: delete isolated pilot branch. Never force push main.

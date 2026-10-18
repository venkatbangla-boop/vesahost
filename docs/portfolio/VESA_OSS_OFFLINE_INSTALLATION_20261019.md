# VESA Open Source Pilot Installations — 2026-10-19

## Authorization and scope

Owner requested installing evaluated open-source tools for personal, offline, non-commercial demonstration. Existing 20 VESA apps remain frozen; no credentials or production records are added. This file is an engineering checkpoint, not release approval.

## Gate A: Marker Lab — isolated

- Upstream: https://github.com/Jack000/SVGnest
- Pinned commit: `1248dc21efd3f90d1aa52ba5785e27e5217ed2c9`
- License: MIT — original `vendor/LICENSE.txt` retained.
- Branch: `feature/oss-marker-lab-20261019`
- Adapter: `apps/marker-lab/index.html`, `assets/marker-lab.css`, `src/workspace-controller.js`
- Offline scope: `apps/marker-lab/service-worker.js`; local vendor HTML, fonts, images, scripts and worker.
- Vendor import: `.github/workflows/oss-marker-lab.yml`. Automated source and asset import succeeded on feature branch.
- Browser gate: `.github/workflows/oss-marker-lab-browser.yml` and `apps/marker-lab/tests/browser-workflow.cjs`.
- Release state: **NOT REGISTERED / NOT LIVE** until browser offline proof, native-device/manual audit, third-party JS review, local save/export inspection, and complete VESA app-centre regression succeed.
- Limitation: generic vector nesting does not implement apparel grainline, nap, stripe/check matching, cut direction, size ratios or factory marker CAD signoff. It must never replace factory cutting specifications.

## Gate B: Artwork/CAD Studio — deferred until upstream build proof

- Upstream: https://github.com/SVG-Edit/svgedit
- Recorded upstream commit: `c44f061d2f9a626d2771cc931298af5a45522d87`
- Important correction: repository's package.json declares a **multi-license** dependency combination (MIT/Apache/ISC/LGPL-3.0-or-later/X11); do not assume the entire packaged software is only MIT. Audit all bundled license notices before importing.
- Needs offline Vite built distribution, local fonts/assets and runtime network audit.
- Do not copy unbuilt upstream modules into a public route.

## Gate C: PDF Template Studio — deferred until upstream build proof

- Upstream: https://github.com/pdfme/pdfme
- Recorded commit: `ffc18cde052a080b284a555224a26d0dc2923c1f`
- MIT main package; React/Ant Design dependent visual editor, multi-package build.
- Do not copy the public playground as-is: playground declares external telemetry/Sentry integration; build a minimal local UI using audited `@pdfme/ui`, `@pdfme/generator`, `@pdfme/schemas` assets with analytics disabled and no runtime network.
- Test exported PDF integrity, multi-page templates, mobile interactions, local copies and offline behavior.

## Release requirements

1. Read `AGENTS.md`, platform unified UX and free-only contracts.
2. Verify upstream commit and all transitive licenses.
3. Vendor actual pinned assets; no CDN/API at runtime.
4. Use only the shared VESA header, preferences and app-centre card ownership.
5. Run functional, 320/390/1440 Chromium, language, data/export, offline-reload, web-worker, accessibility and existing TNA/PPM/AQL regression gates.
6. Register apps one at a time only after evidence-backed acceptance.
7. Promote guarded and non-force to `main`, verify exact served public asset bytes; do not claim live otherwise.
8. Rollback: revert isolated app and catalogue changes; preserve existing app schema and browser-local data.

## Ownership structure

The platform owns the global shell, auth convenience, translations and catalogue. Each new `apps/<slug>/` folder owns its embedded third-party runtime adapter, local resources, domain-specific UI, worker scope and tests. Third-party vendored source cannot mutate existing 20 app engines or app data.
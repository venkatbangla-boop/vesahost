# VESA 360 — Open-source 22-app release record

**Date:** 2026-10-19
**Scope:** Personal synthetic-data showcase; no commercial production CAD or server-side data
**Release stage:** Automated acceptance PASS; main/Pages and exact public-byte verification required separately before claiming LIVE

## Accepted application additions

1. `/apps/marker-lab/` — SVGnest MIT licensed offline visual nesting experiment, pinned source `Jack000/SVGnest@1248dc21efd3f90d1aa52ba5785e27e5217ed2c9`. Not a factory-approved garment marker; grainline/nap/checks/stripe/cutting allowances are NOT enforced.
2. `/apps/artwork-cad-studio/` — SVG-Edit offline vector artwork editor, pinned upstream `SVG-Edit/svgedit@c44f061d2f9a626d2771cc931298af5a45522d87`. Multi-license combination declared (MIT, Apache-2.0, ISC, LGPL-3.0-or-later, X11). Relevant upstream license metadata retained at `vendor/LICENSE-MIT.txt` and `vendor/licenseInfo.json`. Not apparel pattern CAD or buyer approval.

## Frozen boundaries

- Original 19 garment workflows and 20th Chess game retain previous domain source, calculations, record schemas, export structures, login/theme/storage choices and business approval rules.
- Shared UI changes are restricted to app catalogue, discovery category, four user-language card labels, App Centre count 22, app-centre cache/version isolation and corresponding tests.
- Each experimental editor has its own app folder and service-worker scope. No paid runtime CDN, API, server database, cloud login or transfer of order records is intended.
- GitHub Pages is PUBLIC, local static authentication is not secure, and original 19-app **human UAT remains PARTIAL**.

## Automated release gates

- Marker MIT import and offline asset gate: [#39159262399](https://github.com/venkatbangla-boop/vesahost/actions/runs/39159262399) PASS.
- Marker 390px Chromium/offline: [#39159354550](https://github.com/venkatbangla-boop/vesahost/actions/runs/39159354550) PASS.
- SVG pinned source build/license: [#39159846077](https://github.com/venkatbangla-boop/vesahost/actions/runs/39159846077) PASS.
- SVG vendor + offline manifest: [#39160322115](https://github.com/venkatbangla-boop/vesahost/actions/runs/39160322115) PASS, 320 assets.
- SVG 390px Chromium/offline and original engine regressions: [#39160529690](https://github.com/venkatbangla-boop/vesahost/actions/runs/39160529690) PASS.
- Combined two-feature merge: [#39160816623](https://github.com/venkatbangla-boop/vesahost/actions/runs/39160816623) PASS.
- Combined 22-app App Centre across 320/360/390/768/1024/1280/1440, both editors 390px offline, TNA/PPM/AQL source and domain regressions: [#39160890846](https://github.com/venkatbangla-boop/vesahost/actions/runs/39160890846) PASS, tested branch head `2869cb91f7d7fd8a10efffddc934c4a3e7411579`.

## Deployment conditions and rollback

- Baseline main before release review: `57db0ee080cc98f825e40e51df4d5d69e6080709`.
- Source integration branch: `feature/oss-22-apps-integration-20261019`.
- Promote ONLY if current main still matches expected SHA and source is fast-forward, force disabled.
- Confirm GitHub Pages deployment conclusion SUCCESS at exact resulting main SHA and compare actual HTTPS responses for `/apps/`, `/apps/marker-lab/`, `/apps/artwork-cad-studio/` with committed release files before stating public LIVE.
- Rollback must be a revert commit (never force-rewrite released history); preserve browser saved records and upstream license notices.
- Pending: owner's real-device manual UAT, interactive SVG tool editing/export acceptance, assistive-technology checks, and full historical 19-app human sign-off.

**Verdict:** Automated CI accepted; final public verification and human UAT are independent gates.

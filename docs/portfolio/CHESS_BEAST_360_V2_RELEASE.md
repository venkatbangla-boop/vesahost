# Chess Beast 360 V2 - release evidence

Date: 2026-10-18. Chess Beast 360 is the optional 20th App Centre tile; original 19 garment apps remain unchanged. Powered by EGENVA. Personal showcase using synthetic data.

## Baseline, release and precise evidence

- Original baseline main: 19006a99581fab338165c30873bac2553f42b459.
- Audited feature branch: feature/chess-beast-v2-20261018; non-force fast-forward promoted 47 commits to main at 7f8b6767110bfbc8da014e1a36bdf92ede37e973.
- Chess acceptance: https://github.com/venkatbangla-boop/vesahost/actions/runs/39128051952 (both jobs SUCCESS on above SHA).
- Original 19-app sibling QA: same run, 19 routes, 38 cases, 334 screenshots, zero issue sessions; PPM/AQL/TNA baseline Node checks PASS.
- Main Chess acceptance: https://github.com/venkatbangla-boop/vesahost/actions/runs/39128412696 (SUCCESS).
- GitHub Pages deployment: https://github.com/venkatbangla-boop/vesahost/actions/runs/39128412665 (SUCCESS, deployed source 7f8b6767110bfbc8da014e1a36bdf92ede37e973; environment URL http://vesaent.com/).
- Independent exact public HTTP bytes and live Chromium gameplay: tests/chess-beast-live.cjs, .github/workflows/chess-beast-live.yml. Deployment success alone does not prove CDN byte identity. Check that separate job before claiming public HTTP PASS.

## Implemented and automated PASS

- Real cancellable background AI Web Worker for gameplay, AI-vs-AI, Hint/Analysis and Hand & Brain; pause/reset/new match cancel obsolete tasks.
- Standard chess and Chess960 legal castling, rook-file FEN rights, Chess960 UCI saves, promotions, en passant, undo and shared Worker engine parity.
- Dark board-first responsive design, large touch board, pointer drag, keyboard focus navigation, smooth 138-188ms move animation, reduce-motion preference, clear AI-thinking status.
- Beginner-friendly first-run setting and qualitative practice difficulty. Numerical chess ELO claims were removed; no independent ELO calibration was performed.
- Saved vault with safe text rendering, backward compatibility, paused resume, old rewind state, local-only storage.
- Scoped offline service worker with five precached Chess assets (Worker, CSS, UI JS, HTML); actual offline AI and resumed saved game PASS.
- Real Chromium 320/390/768/1440 viewport geometry/screenshot QA, Chromium and WebKit AI, 10-ply AI-vs-AI, mobile drag/keyboard, Hand & Brain, Chess960, saved games, reset/hint/analysis and 19 sibling routes PASS.

## Limitations and verdict

- CHESS V2: automated engineering ACCEPTED; GitHub Pages deployment SUCCESS at tested source SHA.
- Independently measured Android/iOS hardware performance, human chess play testing, exhaustive Chess960 edge cases cross-checked against a second rules engine, and human UAT remain UNVERIFIED.
- Chess has English, Tamil, Hindi and Spanish in its original interface. Full Bengali translation is not claimed.
- Original 19-app VESA final report remains PARTIAL for pending human/native device UAT, regardless of Chess implementation tests.

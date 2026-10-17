# G4-W1 APP-01 Packing — Exact Feature Discoverability Audit and Patch Scope

Baseline: \`main\` \`a91f4dbc0248b298afd0f7f2aaa0e101ef023ab3\`.
Authority: \`blueprints/APP-01_packing-container.md\`, \`docs/portfolio/02_PLATFORM_STRUCTURE_CONTRACT.md\`, \`docs/platform/VESA_UNIFIED_UI_CONTRACT.md\`, \`apps/packing-container/tests/domain.test.cjs\`, \`apps/packing-container/tests/browser-workflow.cjs\`.
User requirement: a premium, friendly complete app rather than empty-looking Home cards; all original domain/rules and saved copies must be preserved. Public company homepage is OUT OF SCOPE.

## Direct source evidence and ownership

| Path | Current owner & call direction | Scope decision |
|---|---|---|
| \`apps/packing-container/index.html\` | Single HTML app: \`PackingWorkspace.render()\` owns entry screen and 8 active tabs: summary, order, cartons, packs, containers, loads, reports, revision. \`this.main.addEventListener('click')\` delegates \`[data-action]\` to \`action(name,key)\`; existing \`practice\` loads \`PackingMath.sample()\`, never persists | **In scope: Home-only discovery interface and safe practice-section action; freeze Math/Store/Report code exactly.** |
| \`apps/packing-container/tests/browser-workflow.cjs\` | Browser contract for carton balance, scenario, frozen snapshots, print XLSX, saved-copy and root shell | Watched / run unchanged |
| \`apps/packing-container/tests/domain.test.cjs\` | Pure PackingMath, PackingStore, PackingReport and legacy/synthetic input proof | Frozen / run unchanged |
| New \`apps/packing-container/tests/feature-discovery-browser.cjs\` | Isolated synthetic 8-section navigation, mobile/desktop screenshots, zero storage mutation | In scope — test only |
| \`service-worker.js\` | Root static cache-first for APP-01 HTML and other original 15. Previous cache v88 could indefinitely serve pre-change APP-01 HTML | In scope ONLY for expected root cache version bump; original public site files/assets not edited |
| \`tests/personal-demo-release.cjs\` | Existing root cache/version test | In scope only for matching new version assertion |
| New \`.github/workflows/vesa-packing-g4-discovery.yml\` | Real Chromium test and original APP-01 sibling regression | In scope — CI only |
| \`docs/portfolio/17_PACKING_HOME_DISCOVERY_AUDIT.md\` and progress/resume trackers | Exact scope/proof/next action | In scope — docs only |

## Observed UX defect

The entry screen currently shows four general actions and saved records. It does **not visibly enumerate the 8 real functional modules** until a user first clicks New or Practice, although the engine, XLSX workbook and report stage exist. The same Home screen repeats a large "NON-COMMERCIAL PERSONAL DEMO" block on every render. This is a usability/discoverability issue, not missing PackingMath functionality. APP-01's 8 buttons already exist in the opened editor, and earlier browser tests prove carton and load math. Users should see true functional scope immediately.

## Locked one-patch plan

1. Replace the obstructive repeated warning block with the existing concise browser-local/needs-approval note (already translated as \`COPY[lang].privacy\`). Preserve the actual \`SCENE\` physical fit and real record status warnings, never say loading is approved.
2. On HOME ONLY render eight translated button/card choices labeled with EXISTING tab labels. Each opens \`PackingMath.sample()\` in the selected working section. A clear synthetic practice label is visible; the buttons must never create, save, modify or freeze real records.
3. Keep 4 languages and accessible 44px+ targets, readable cards, 320/390/1440 screen widths, and avoid horizontal overflow. No new wizard/database/integration/business engine.
4. Bump the root cache version so returning browsers receive updated APP-01 HTML; change no other root assets or homepage code.
5. Run original APP-01 Math/store and 2 browser suites, cross-app at least one sibling and shared UI test; inspect screenshots, prove local-storage key unchanged; verify Pages before marking release.

**Frozen:** \`PackingMath\`, \`PackingStore\`, \`PackingReport\`, APP-01 source-version/portability, PPM/AQL/TNA/Costing, all business calculations, other apps and the public homepage. Never synthesize official container specs.

**Rollback:** revert APP-01 UI/section-action delta and root worker version assertion to the preceding accepted main. No old browser saved state is touched.

**Audit gate verdict:** \`accepted\` for a narrow UI-discoverability patch ONLY. Any additional packing algorithms, pallet packing or loadability validation are \`conditional\` on source-approved dimensions/business policy. Separate human review remains NOT TESTED.

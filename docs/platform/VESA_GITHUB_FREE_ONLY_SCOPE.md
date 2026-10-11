# VESA 360 - GitHub Free Only Scope Contract

**Decision:** Use only the existing VS Code/local computer, Git/GitHub Free features, and browser-native storage. No separate cloud account, paid hosting, backend service, commercial database, email/SMS provider, or additional cloud-storage subscription is approved. This contract takes precedence over older documents ONLY when they request those excluded services; do not silently override frozen TNA/PPM/AQL business rules.

**Status:** Scope-change instruction for the existing local project. This document is not evidence that a source patch, deployment, Git push, or data migration has happened.

## 1. Existing program, preserved in full for what can run locally

- **TNA 360:** Garment TNA templates, critical path, calendars, baseline/forecast/actual dates, LC and material status, production capacity, scenarios, Gantt, portfolio, report export, browser saved records and manually transferable saved copies.
- **PPM 360:** All 168 frozen checkpoint identities and profile applicability, action follow-up, approval/measurement/change review, decisions and signatures, reports, browser save/reopen/restore, multilingual guidance.
- **AQL 360:** Frozen sampling tables and Ac/Re criteria, inspection stages, defect scoring, reinspection, evidence, CAPA, analytical/report views, portable backups, local recovery and offline behavior. Do not invent buyer rules, carton randomization, or evidence.
- **One VESA UX:** Existing website, browser-visible login, App Centre, one header/menu system, English/Bengali/Hindi/Tamil help, themes, mobile and desktop, and future-app registration by application descriptor. Independent domain engines remain separate.

## 2. Approved platform tools

- Local VS Code and existing Codex access; do not assume that Codex itself is provided free by GitHub.
- Git version control, local commits/branches/tags, GitHub Free repositories, issues and pull requests.
- GitHub Pages for static builds/previews ONLY if their specific use complies with GitHub's Pages terms. It cannot be portrayed as an approved hosting route for a commercial SaaS product.
- Optional GitHub Actions, standard runners, and only within free entitlements, without billable runner sizes or overage. Prefer simple local Node/browser tests when Actions is unnecessary. No paid third-party CI.
- HTML/CSS/JavaScript, browser IndexedDB/localStorage, versioned client-side saved-copy exports/imports, PDF via client-side/browser print, Excel files locally, optional service-worker offline caching.
- Existing VESA domain and existing DNS arrangement; no requested DNS edits or new provider accounts.

## 2A. Verified GitHub Free capacity and the actual `main` repository (2026-10-11)

- The accessible GitHub `main` repository `venkatbangla-boop/vesahost` is **public**, and its custom-domain `CNAME` reads `vesaent.com`.
- The GitHub repository API reports approximately **25,949 KiB (~25.34 MiB)** as repository size. An independent sum of its 121 `main` tree files is **27,628,586 bytes (~26.35 MiB)**. These are different measurements (repository metadata vs tracked files), not an audit of the user's newer, local unpushed branch or a verified published Pages artifact.
- Its largest individual file is `apps/aql/index.html`, approximately **11.15 MiB**. That is well below the ordinary Git 100 MiB single-file hard block, though it is heavy for initial mobile loading and worth performance testing.
- Official GitHub Pages limits: published site **up to 1 GB**; Pages source repository **recommended up to 1 GB**; site bandwidth **soft limit 100 GB per month**; builds **soft limit 10/hour** (standard publishing). Git issues a warning for Git-tracked files over **50 MiB**, and blocks individual regular Git files over **100 MiB**. These are different limits, not a free database-storage allocation.
- The current tracked-file size is approximately **2.6% of the 1 GB published-site ceiling** if used as a rough comparison. **The local development branch may be larger and must be independently measured before any release.** There is no fixed per-user application-record quota on GitHub Pages because real records should never be sent there.
- Most importantly, GitHub Pages' official terms prohibit use as free hosting for an **online business, e-commerce or commercial SaaS**. The fact that a static browser-only app technically loads does not certify the intended real-world VESA business use as compliant. Maintain development/local previews and assess the actual use against those terms before any public business release. GitHub Pages' HTTPS is transport encryption, not user authentication.

Official documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits and https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github.

## 2B. Why the original dashboard shows 55%

- Uploaded original dashboard gate counts: **TNA 9/13 (~69%)**, **PPM 9/11 (~82%)**, **AQL 3/13 (~23%)**, **Shared UX 3/10 (30%)**. Weighted 30/30/30/10 overall is approximately **55%**.
- The original blueprint included provider-dependent gates (for example, TNA G09, PPM P-G09 and AQL A-G10). These explain **some**, not all, of the low percentage. Incomplete AQL sampling/workflow/browser acceptance and shared visual gates also account for substantial pending work.
- **Illustration only:** if only those three entire cloud-only gates were declared out of active scope while all other gates stayed eligible, the same accepted counts would yield approximately **60%** (TNA 9/12, PPM 9/10, AQL 3/12, Shared 3/10). This is **not** a verified new dashboard value. TNA G10, PPM P-G10 and release gates mix local and remote requirements; they require documented subdivision before any scope-score formula is finalized.
- Never inflate the percentage by deleting tests, history or requirements. Keep historical and Free-Only percentages separately, and independently verify the updated eligible denominators from the local Git branch.

## 3. EXCLUDED / DEFERRED NOW (not required for current free-only completion)

1. AWS/Azure/GCP/Cloudflare hosting; separately purchased VPS, hosting, GPU, or cloud storage.
2. Firebase/Supabase/Postgres or other remote application database; managed identity and tenant server.
3. Server-side login, enterprise roles, verified identity, authenticated multi-user access, tenant isolation, or API-based sharing.
4. Automatic cross-device cloud synchronization and background centralized order/inspection/meeting databases.
5. Real-time co-editing and simultaneous multi-user conflict resolution over a remote service.
6. Email/SMS/WhatsApp/push delivery via outside providers, unattended server schedules and webhook processors.
7. Paid integrations, paid GitHub runners/Codespaces, external automation platforms or third-party software subscriptions.
8. Native signed Android/Windows packages unless independently proven possible using existing free/local tooling and requested later.
9. Creation of services/tna-api, external secret stores, paid API infrastructure, or placeholder provider implementations that are not needed.
10. Production commercial SaaS release claims on GitHub Pages.

An already written optional adapter/contract may remain dormant if keeping it is safer than deleting it. Do not load, advertise, or require it in the free-only product. Archive its requirement as DEFERRED BY SCOPE; do not delete prior audit evidence or accepted commits.

## 4. User-facing reality and data safety

- The existing VESA browser login is a LOCAL CONVENIENCE FEATURE, not secure server-side authentication. GitHub Pages raw files are publicly retrievable. Never label it secure access or a protected buyer/factory portal.
- Data saved in IndexedDB/localStorage stays in that browser/profile/device unless the user exports and transfers a saved copy. It is vulnerable to browser cleanup, device loss and private-mode expiration. Display a readable periodic "Download Saved Copy" reminder and a tested "Open Saved Copy" flow.
- Do not put any real buyer details, customer order records, customer signatures, employee data, secrets, API tokens or exported live records into a public GitHub repository, Actions logs, issues, test fixtures or public Pages.
- Manual saved-copy transfer is allowed; the user must deliberately select and import files. Do not silently write application records to GitHub APIs, create background uploads or embed GitHub tokens in browser code.
- Alerts can be computed and displayed when a user opens/uses an app; do not claim background emails or push reminders.
- Cross-app references can use explicitly entered record IDs, user-approved export/import and compatible local contracts. They may NOT pretend to sync live across devices or automatically authorize GO/ACCEPT/SHIP.
- Preserve old saved-copy decoding/round-trip, autosave, data partitioning and offline update behavior. Never clear or reset existing browser records to simplify a UI change.

## 5. Specific checkpoint disposition to be audited, not automatically accepted

| Area | Active free-only work | Defer / exclude | Protect |
|---|---|---|---|
| TNA G09 | Retain tested local/offline contracts without requiring a provider | Genuine secure cloud backend, identity, central storage | G00-G08 accepted evidence |
| TNA G10 | Manual/local PPM and AQL references and in-app due notices | External notifications, cross-device sync | Independent date sources and frozen plans |
| TNA G11 | Finish all local/browser regression and restore tests | Provider-only integration proof | Real critical-path and scheduling math |
| TNA G12 | Local release readiness and transparent limitations report | Public commercial SaaS deployment or unauthorized main push | No fake live readiness |
| PPM P-G09 | Keep dormant tested contract only where safe | Server roles, provider calls, two-account cloud tests | All 168 checkpoints, decisions, signatures, records |
| PPM P-G10 | Local free-only acceptance against true PPM feature requirements | Provider proof and public release | P-G00 through P-G08 prior evidence |
| AQL A-G03-A-G09 | Complete sampling/stage/evidence/save/report/local-reference evidence | Live cloud lookup or paid integrations | Ac/Re and sampling rules; incomplete policy remains pending |
| AQL A-G10 | No mandatory work in free-only scope | Server collaboration/roles/approval service | No claim of verified remote identity |
| AQL A-G11 | Full local/browser/offline regression | Provider-only integration tests | Inspection quality and saved copies |
| AQL A-G12 | Local acceptance/readiness review | Unauthorized public release | No false inspector approval |
| Shared U-G03-U-G09 | Common shell, menu, responsiveness, accessibility, app registry and independent regression | Server-dependent single sign-on | Existing local auth and domain isolation |

## 6. Progress: preserve two separately labeled baselines

- **Historical full-program baseline:** Retain the last documented overall 55%, TNA 69%, PPM 82%, AQL 23%, Shared UX 30% as an evidence snapshot, not a live truth if the local branch advances.
- **Current GitHub-Free-only scope:** Reconcile every original gate/subrequirement against the actual code, tests, and this contract. Mark provider-only components `DEFERRED_BY_SCOPE` rather than `ACCEPTED`; do not delete requirements or count them as completed.
- Record a current free-only verified percentage with explicit denominator and fixed weights (TNA 30%, PPM 30%, AQL 30%, Shared UX 10%). Re-normalize each app only across the independently testable active free-only subrequirements. Document the eligibility map and keep it stable after acceptance. If not yet audited, show "Not yet recalculated" instead of an invented number.
- Preserve the original full-program progress figure separately for historical comparison. Never write 100% merely because paid or unavailable features were removed.
- Keep `VESA_PROGRESS.md` as the one dashboard: historical scope, current free-only percentage, remaining work, actual last tested SHA, current checkpoint, blockers that remain relevant, deferred list and exact NEXT ACTION.

## 7. Safe execution order / change control

1. First inspect the actual local feature branch, dirty files, existing progress and specs. Verify the previous accepted commits/tests before changing scope.
2. Create an explicit file-level impact map and reversible patch groups. Do not touch unrelated website code, PPM/AQL acceptance engines, service-worker caches, saved-copy formats or browser databases without a named necessity and tests.
3. Record this contract under `docs/platform/VESA_GITHUB_FREE_ONLY_SCOPE.md`. Add one brief reference to it in root `AGENTS.md` without overwriting existing instructions. Do not overwrite the old master blueprint; annotate external dependencies as deferred.
4. Update all three app trackers, shared-UX tracker and the master dashboard to separate free-only eligible work from deferred remote-service work; document all reweighting and evidence.
5. Hide or remove from normal screens any misleading nonworking "Cloud Sync", "Live Team", "Server Approval" or external notification actions ONLY after a file-level audit and reversible UI patch. Preserve unrelated user-visible functionality and data.
6. Continue testable TNA, PPM, AQL and shared VESA UX tasks, then run full browser/mobile/offline/saved-copy/report regression.
7. Commit each verified patch group locally. Do not push, merge to main, publish, alter DNS, provision services or incur costs without express approval.
8. Record a final **Free-Only Local Acceptance** verdict, known limitations and a responsible GitHub Pages policy/hosting decision. Do not claim secure multi-user commercial production readiness.

## 8. Future apps

Keep one extensible App Centre and shared UI. Add new app folders only on a real approved requirement. New apps must reuse the VESA shell and local saved-copy discipline; they must not create undeclared backend/hosting dependencies.

## 9. Official limit and policy references

- GitHub Pages limits and acceptable uses: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- GitHub Free repository capabilities: https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories
- GitHub Actions free allowances and billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions

**Approval boundary:** The user approves planning and safe locally verifiable work under this scope. This is NOT authorization to push public code, change production hosting, deploy, use sensitive customer data or buy services.

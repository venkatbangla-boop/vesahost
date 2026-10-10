# 01 — AQL 360 Repository Audit, Full Functional Blueprint & Gap Register

**Product:** VESA Enterprise Inc. — Inspection Quality Centre 360 (AQL). **Repo:** `venkatbangla-boop/vesahost` `main` (2026-10-10 documentation snapshot). **Route:** `/apps/aql/`. **Handover state:** `draft-only`; this packet does NOT modify production application. **Goal:** Rework AQL into the same consistent, novice-friendly VESA interface as PPM/TNA without weakening inspection decisions.

## Direct repo evidence
- Actual `apps/aql/index.html` blob SHA `b733dc700fce47aa04f1cd3f64c5e8f286d65512`, approximately **11.69 MB** (GitHub blob inspected, source and tail), has many inline style/script blocks, SVG/evidence/logo bytes, AQL domain classes and late patch wrappers. Main app uses a dark `sidebar`, its own `.topbar`, a dynamically inserted `#aqlReleaseMenu`, late `.aql-release-menu` and `#vesa-uniform-aql-shell` CSS. The mobile override includes `top:0` for menu at <=700px. This is structural, not merely a color inconsistency.
- Existing app constructor `InspectionApp` renders `Setup -> Samples -> Inspect -> Measure -> Pack & site -> Review` navigation; `StageCatalog` additionally defines incoming, fabric-roll, IPC, cutting, inline, endline, prefinal, final, rework, reinspection, loading, production monitoring and supplier audit workflows.
- Existing domain owners include `SamplingEngine`, `AllocationEngine`, `MeasurementEngine`, `ResultEngine`, `PlanApproval`, `PackingEngine`, `ReinspectionService`, `StageDecision`, `FabricInspectionEngine`, `InlineQualityEngine`, `PreFinalReadinessEngine`, `FinalAQLInspectionEngine`, `StageWorkspace`, `StageReport` and other Master45/46/50 features.
- Existing persistence/evidence owners include `StorageIO`, `LocalRepository`, `SaveSafety`, `PortableInspection`, `CompanionReport`, `ConnectedSyncAdapter`; AQL service worker caches scoped app shell. Original multi-step project, import/export and report mechanisms are substantial and should not be thrown away.
- `apps/aql/ENGINEERING.md`, `AQL_RELEASE_STATUS.md`, `GAP_MATRIX.md` describe earlier 35-area gap work, selected fixes and partially validated features. `apps/aql/tests/release-contract.cjs` is a narrow release static contract; tests need stronger browser/engine coverage.
- `UI_CONSISTENCY.md` records earlier menu CSS unification attempt; PPM still uses a different `#fileMenu` and layout. Shared platform files include `js/auth.js`, `js/preferences.js`, `/apps/` catalog, root `css/style.css`.
- AQL `service-worker.js` currently changes named cache and deletes old AQL caches on activation, unlike PPM's more conservative old-client asset retention; examine whether an update can strand old tabs. **Risk for testing**, not proof of actual data loss.
- The current live domain HTML and screenshot rendering could not be opened directly from this handover's browser environment. The latest code **was** inspected via GitHub blob; real mobile screenshots and authenticated browser acceptance remain G00 work.

## Audit findings
| ID | Actual issue/risk | Target behavior | Priority |
|---|---|---|---|
| A-A01 | AQL sidebar + topbar + sticky `#aqlReleaseMenu` differ from PPM shell | One shared VESA shell, one nav model, at most one sticky region | Critical |
| A-A02 | Multiple late CSS and prototype menu/relabel patches in one large HTML | Replace patch stacking with owned adapters after parity tests | Critical |
| A-A03 | Large monolithic source can cause slow edits/releases and stale asset problems | Incremental extraction only after locked baseline tests; coherent offline packaging | High |
| A-A04 | Sampling and decision engines already carry exact legacy table behavior | Golden tests first, no policy change by redesign | Critical |
| A-A05 | Several 35-area audit entries historically partial | Verify gaps with real code/fixtures instead of marking completed from old notes | High |
| A-A06 | Local inspection and browser login not secure inter-company SaaS | Accurate local-mode labels; server-only shared auth/data claims | Critical |
| A-A07 | Records/evidence and reinspection history must survive UI migration | No destructive import/storage/cache actions | Critical |
| A-A08 | Nontechnical screens still carry tool/menu terminology and nested actions | Guided workflows and plain language | High |
| A-A09 | Report layouts/partial photo readiness vary by inspection stage | Consistent family report styling; stage-specific substance | High |

**Decision:** `draft-only` implementation. Codex must independently inspect checkout, record exact impact files, capture existing results and obtain code-change gate before editing.

## User/audience views
Factory QC, external inspector/inspection agency, buyer quality, merchandising agent, quality manager, production manager, factory leadership, warehouse/loading and audit roles. Common AQL record, tailored dashboard/report when actually supported by identity permissions. Simple 6-step entry journey and advanced 13-stage workflows; progressive disclosure avoids overwhelming beginners while expert paths remain reachable.

## Original 35-area gap continuity (mapped from repository, all must be reviewed)
| AQL area | Existing / target policy |
|---|---|
| 01 Inspection-type routing and results | preserve exact stage/status and buyer policy |
| 02 Fabric roll quality | preserve roll identity / point calculation |
| 03 Laboratory test records | preserve fail/pending and evidence; external lab sync optional |
| 04 Shade/colour management | preserve lot/roll/approval grouping |
| 05 Incoming material/accessory inspection | preserve identity, lot, QC disposition |
| 06 Cutting quality | preserve panel/pair/lot/shade/quantity checks |
| 07 Inline quality control | preserve frequency/operation findings |
| 08 Endline quality | preserve separate endline counts and disposition |
| 09 IPC/pilot/first production | preserve first output gate and reference |
| 10 Pre-final readiness | preserve stage prerequisites and pending evidence |
| 11 100% screening/rework | never erase original failed findings |
| 12 Final readiness | preserve sampling/approval gates |
| 13 Loading supervision | container/carton/seal evidence and reconciliation |
| 14 Production monitoring | output, balance, quality trend, process risk |
| 15 Supplier audit / QMS | preserve critical audit issue guard |
| 16 Master data | atomic import and sanitized IDs |
| 17 Buyer profiles / instructions | versioned reference/authority validation |
| 18 Order journey | linked identities with incomplete data guard |
| 19 CAPA | root cause/action/verification/reinspection links |
| 20 Sync packs | strict import and no partial master commit |
| 21 Offline names/signatures vs roles | no pretend authenticated signatures |
| 22 Competency / training | missing stages safe handling |
| 23 Equipment/calibration | evidence/status and due dates |
| 24 Needle/metal control | required traceability when buyer/market applies |
| 25 Compliance / destination rules | buyer/legal reference, not fabricated certification |
| 26 Packing & barcode | approved packing ratio, master cartons and labels |
| 27 Sample custody | sealed/approved reference and handover history |
| 28 Factory acknowledgement | explicit denied/pending receipt not complete |
| 29 Analytics dashboards | counts traceable to record basis |
| 30 Counting-basis analytics | defect/piece/lot denominator explicit |
| 31 Stage reports | separate stage outcome and verification evidence |
| 32 Friendly menu/copy | no developer/file-format terms in normal screens |
| 33 Native wrappers | optional APK/Windows future, not present |
| 34 Regression tests | deep numeric/browser/roundtrip tests beyond smoke |
| 35 Real factory pilot | required user/field verification, not completed here |

## Feature register for end-to-end rework (60 IDs, status evidence required)
### Inspection setup and sampling
- [ ] A01 Keep new/continue/open/practice/open saved copy home actions.
- [ ] A02 Buyer, factory, PO, style, destination, quantities, sizes, colorways, inspection type.
- [ ] A03 Buyer/manual approved reference, inspection standard/edition/criteria version.
- [ ] A04 Stage routing, exact inspector responsibility and applicable processes.
- [ ] A05 Lot formation/grouping combined, style, color, size or buyer-specific basis.
- [ ] A06 SamplingEngine lot code, level, plan, supported AQL cells and count checks.
- [ ] A07 Critical/Major/Minor buyer rule, counting basis and approved Ac/Re evidence.
- [ ] A08 Sampling allocation by color/size/carton/lot; quantity reconciliation.
- [ ] A09 Random carton selection methodology with reproducible seed, provenance and manual override history.
- [ ] A10 Buyer custom plan/tightened/reduced/100%-inspection only with explicit validated criteria.
- [ ] A11 Sampling plan reviewer, approval identity/time, version and source reference.
- [ ] A12 Unsupplied or unsupported table cells never auto-accepted.

### Quality capture and all stages
- [ ] A13 Fabric rolls: 4-point/effective method only when authorized, length/width/points/grade/lot traceability.
- [ ] A14 Lab tests: required list, report/lot, failed/pending hold handling.
- [ ] A15 Shade/dye lot and colour segregation, approved shade-band reference.
- [ ] A16 Incoming accessories/fabric inspection and quarantine/release record.
- [ ] A17 IPC/pilot release with first output/approved sample/measurement.
- [ ] A18 Cutting and panel QC quantity, ply, pairing, fusing, shade issues.
- [ ] A19 Inline defect containment, operation trend, repair and follow-up.
- [ ] A20 Endline inspection separate from inline; quantities and repeat issue.
- [ ] A21 Pre-final readiness and required packing/measurement/lab/needle controls.
- [ ] A22 Final Random Inspection independent sampling result and blocking rules.
- [ ] A23 Full screening / rework evidence; original findings immutable.
- [ ] A24 Reinspection as new linked event with history and independent sampling criteria.
- [ ] A25 Loading/container, barcode/carton/quantity/seal and handover evidence.
- [ ] A26 Production monitoring stage, risks and quality trends.
- [ ] A27 Supplier quality audit, CAPA and critical audit failure handling.
- [ ] A28 Equipment/calibration, needle/metal control applicability and evidence.
- [ ] A29 Sample custody, reference approval and traceability.
- [ ] A30 Factory acknowledgement / approvals and rejection handling.

### Evidence and decisions
- [ ] A31 Defect finding IDs, count, severity, photo, location, linked sample and lot.
- [ ] A32 Measurement POM/spec/unit/tolerance/actual and pass/hold rules only if specified.
- [ ] A33 Evidence capture original vs preview, compression/limits, file integrity.
- [ ] A34 Final decision reason tree shows pending/failed/unsupported inputs.
- [ ] A35 Original observations persist after rework/reinspection and report reissues.
- [ ] A36 CAPA root cause/correction/prevention/owner/due/verification chain.
- [ ] A37 Atomic master/profile/sync-pack import; malformed input safe.
- [ ] A38 Stage/policy change invalidates stale release where governing rules require.

### UX, persistence, reports and platform
- [ ] A39 Exact `VESA-UNIFORM-UI-v1` shell/menu parity with PPM/TNA.
- [ ] A40 One sticky/frozen nav only; no independent AQL sidebar + topbar + release menu stack.
- [ ] A41 Readable mobile forms/cards/filters 320–1440px without clipped inputs.
- [ ] A42 Guided beginner mode and expert detail available without changing policy.
- [ ] A43 English/Bengali/Hindi/Tamil authored guidance, stable raw data.
- [ ] A44 Task words Save Now / Make Another Copy / Download/Open Saved Copy / Reports.
- [ ] A45 Local autosave, last-saved truth, drafts and storage safety warnings.
- [ ] A46 Portable reopen and versioned import, quarantine unsupported copy.
- [ ] A47 Offline cache/version upgrade compatible with old open windows.
- [ ] A48 Download/print/share fallback; 15 report types if source-backed.
- [ ] A49 Photo evidence, labels, charts, fonts and long tables visible in PDF.
- [ ] A50 Progress + analytics denominator correctness and traceability.
- [ ] A51 Login/App Centre return and visible user preferences consistent with PPM.
- [ ] A52 Do not add duplicate theme/language selectors in app header.
- [ ] A53 Keyboard, screen reader, zoom, phone portrait/landscape, performance.
- [ ] A54 Strong executable numeric/decision/restore regression beyond release smoke.
- [ ] A55 Robust nontechnical failure/recovery guidance for quota/corrupt data.
- [ ] A56 Optional secure identity/tenant authorization with backend (external gate).
- [ ] A57 Verified PPM reference and TNA milestone links; no cross-app store hacks.
- [ ] A58 True server audit/notification/sync only on provisioned authorized service.
- [ ] A59 Safe practice/demo separation and no production report watermark confusion.
- [ ] A60 Full factory/inspector acceptance evidence, user approval before deployment.

## Rework boundaries
**In scope:** unify UI, clarify steps, address demonstrable unsafe edge cases with tests, strengthen acceptance/export/recovery, maintain original 35 areas. **Frozen until independent policy review:** numerical AQL chart/Ac/Re, buyer contracts, switching schemes, legal/market claims, original failed inspections. **Out of scope without setup:** secure SaaS, provider notifications, native signing, unapproved legal certification. **Never mark historical partial entries as completed simply because their source exists.**

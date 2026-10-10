# 03 — PPM Engines, Calculation Rules, Frozen Contracts & Data-Safe Refactor

## Engines discovered and ownership
| Owner | Current file | Must prove |
|---|---|---|
| `RelevanceEngine` | `core.js` | Product-specific applicability; intentional N/A vs hidden controls |
| `CoverageEngine` | `core.js` | Completed/applicable counts; no misleading percentage |
| `ValidationEngine` | `core.js` | GO/CONDITIONAL GO/HOLD, unmet requirements and evidence |
| `ApprovalRegister` | `planning-services.js` | Explicit required approvals; date/approver/reference proof |
| `MeasurementCheck` | `planning-services.js` | Numeric parse and units, lower/upper tolerance, inclusive bounds |
| `ChangeReviewEngine` | `planning-services.js` | Controlled baseline, material-change diff and signoff invalidation |
| `PpmRepository` | `core.js` | Local persistence, current user's namespace, failure handling |
| `BackupCodec`, `RecoveryRepository`, `RecordHistory` | `record-services.js` | Strict versioned import, atomic restore, bounded undo/recovery |
| `V5Workspace`, `MeetingControls` | `workspace.js`, `planning-panel.js` | One owner for mutation/save/menu/event listeners |
| `ReportService` | `report-service.js` | Reports derive from one frozen record snapshot, no extra business decisions |

## Freeze-before-improve procedure
1. Capture baseline commit and synthetic PPM V4/V5 copies; list all 168 checkpoint tuples (`id`, `section`, `critical`, `label`, relevance rule) and profile IDs.
2. Snapshot deterministic inputs/outputs for representative `RelevanceEngine`, `CoverageEngine`, `ValidationEngine`, required approvals, measurements, signatures, reports and locked records.
3. Capture offline opening, save, saved-copy export/open and failed-store user-facing behavior in a browser before UI movement.
4. Build regression assertions against frozen owners, not duplicate implementations. Identify historical intentional quirks; don't silently 'correct' buyer policy.
5. Prove visual refactor has zero domain diff. Every domain improvement requires an explicit separate green test and migration proof.

## Existing key logic expectations
- **Readiness:** a required critical failure or pending selected approval cannot silently produce a clear GO. `CONDITIONAL GO` cannot be used as a magic waiver; existing conditions and recorded permission/conditions apply. HOLD remains possible and reportable.
- **Approval:** required selected approvals need Approved + who + when + reference/proof (as enforced by existing `ApprovalRegister`). `Not needed` requires explanation where existing rules do so. A buyer email isn't verified cryptographically in local mode.
- **Measurements:** use explicit `cm` or `in`, exact buyer spec and entered tolerance; actual inside inclusive `[spec - tolMinus, spec + tolPlus]` with proper floating-point handling. Do not insert buyer tolerance or convert units invisibly. Invalid/blank = `Not checked` / `Check entries`, never PASS.
- **Change review:** after baseline and signature, revised controlled fields, custom checkpoint text or photo revision invalidate stale release/signatures as required. An approval from an old tech pack must not carry into a new revision silently.
- **Completion:** `OK`, `ACTION`, `PENDING`, `N/A` remain machine-readable. A display progress percentage should distinguish applicable completed, not-applicable and unreviewed; show denominator, never claim 100% on zero-applicable denominator.
- **Training:** fictional sample must be isolated and clearly marked. Never overwrite a real record while practicing.
- **Actions:** retain issue owner, due date, evidence/status; completing an action is not automatic buyer approval.

## Safe new intelligence (explanations, not unapproved release rules)
- **Readiness explanation panel:** show each blocking checkpoint, underlying data, responsible role, required proof and 'What should I do next?'. Do not modify existing release result.
- **Document revision mismatch warning:** compare entered techpack/BOM/spec revisions; warn on inconsistent pairings with source reference, never invent the correct revision.
- **Sample approval register:** track dates/comments/rejected/resubmitted/validity per revision; block only when requirement is explicitly enabled or already gated in baseline.
- **Meeting follow-up dashboard:** owner-wise pending actions, aging in calendar vs working days **with explicit calendar source**, future due dates and escalation suggestions.
- **Risk and priority indicator:** based on documented incomplete required items and known due dates; not a replacement for official GO/HOLD gate.
- **Photo/evidence audit:** stable record linkage, hashed/reference IDs if useful, no unverified authenticity claims.
- **Read-only cross-app flags:** show linked TNA/AQL summaries only with verified ID/version and user confirmation; no cross-app localStorage hacks.

## Compatibility scenarios that MUST pass
| Test | Input | Expected safe result |
|---|---|---|
| M01 | 168 checkpoint definitions compared before/after style changes | Exact parity unless separate approved migration |
| M02 | All product profile option IDs and applicability | No unexplained changes |
| M03 | PPM V4/schema 1 copy | Migration/restore without information loss |
| M04 | PPM V5/schema 2 copy | Successful current import and complete round-trip |
| M05 | Future unsupported schema | Helpful rejection without record mutation |
| M06 | Duplicate/invalid IDs, malformed dates, oversized backup | Reject safely; preserve current draft |
| M07 | Required approval pending, rejected or missing who/date/proof | GO prevented according to frozen validator |
| M08 | Buyer custom waiver / Not needed without reason | No silent approval |
| M09 | Missing/non-numeric tolerance; asymmetric plus/minus | No inferred PASS; exact lower/upper and inclusive boundaries |
| M10 | New critical custom checkpoint after finalized GO | Signatures/release invalidated per change policy |
| M11 | Locked record, keyboard shortcuts, hidden input | No unauthorized mutation |
| M12 | Simultaneous edits while autosave in flight | Last acknowledged generation survives reopen |
| M13 | IndexedDB unavailable/quota full | Explicit warning, safe portable-copy flow, no false saved state |
| M14 | Service worker update while two older tabs open | No asset version mix, no automatic unsaved-data loss |
| M15 | Bengali/Tamil/Hindi text and proof photos in PDF and backup | No glyph loss, clipping or corruption |
| M16 | Report generation with GO/Conditional/HOLD | Same decision/rationale as record validator |

## Recovery and rollout
Keep prior backups and current databases untouched. Stage migration as decode+validate+preview+write new record, never destructive overwrite. If PPM controller is refactored, wrap and delegate to legacy domain owners while tests pass; never duplicate validator. Version service worker and all referenced scripts coherently, retain old window asset support. On failure, roll back code commit, **not customer data**. Freeze public homepage/auth/AQL/TNA behavior for every PPM-only patch.

## Commands to discover/run locally
Inspect actual commands and dependencies; examples from current source: `node apps/ppm/tests/regression.cjs`, `node apps/ppm/tests/planning.cjs`, `node apps/ppm/tests/update.cjs`, syntax checks with `node --check`, browser tests at 320/390/768/1280/1440, PDF visual review, `git diff --check`. These tests are *not* claimed executed in this handover.

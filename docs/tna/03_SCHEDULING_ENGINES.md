# 03 — Deterministic Scheduling, Critical Path, Production & Recovery Engines

**Rule 0:** every derived date must be reproducible from explicit inputs, calendar, constraints and engine version. Never fill an empty user field with a fabricated assumption. Incomplete input → `Needs Information` plus list of missing items.

## 1. Engine ownership and canonical pipeline

| Owner/class | Inputs | Outputs | Forbidden behavior |
|---|---|---|---|
| `CalendarEngine` | Date-only, working-week pattern, exception dates, holiday/shift policy | Workday counts, next/previous working date, date shift | Arbitrary local timezone conversion or guessed holidays |
| `GraphValidator` | Activities, relation edges and constraint types | Valid DAG, errors and warnings | Repairing cycles silently |
| `ScheduleEngine` | Valid DAG, durations, calendars, anchors, fixed/soft dates | Early/late dates, feasible/unknown state, constraint violations | Mutating actuals/approved baseline |
| `CriticalPathEngine` | Schedule & deadline | Total/free float, controlling chain(s), near-critical flags | Treating any overdue row as critical |
| `ApprovalEngine` | Authenticated decision events, reviewer rules, prerequisites | Valid approved/pending/rejected/waived gate state | Auto-approval based on deadline passage |
| `CommercialLeadEngine` | Explicit LC/contract anchor, lead days/basis, ex-factory target | Contract maturity date and discrepancies | Assuming LC = PO = B2B LC |
| `MaterialEngine` | Bookings, supplier lead, delivery & QC events | Earliest usable materials, shortage/blockers | Auto-releasing failed QC material |
| `CapacityEngine` | Qty, actuals, verified rates or SMV/efficiency, calendar, lines | Required working days, projected stage finish, bottlenecks | Inventing daily production output |
| `ForecastEngine` | Dependency schedule, actuals, capacity, gate state | Updated stage/order/lot forecast and confidence explanation | Changing signed target dates |
| `RiskEngine` | Due/forecast/float, gate state, threshold config | On-track/risk/delayed/blocked/unknown with reasons | Undocumented status thresholds |
| `ScenarioEngine` | Immutable base plan + clearly labeled candidate changes | Side-by-side options, date/cost/resource impact | Mutating live order from preview |
| `QuantityEngine` | Inputs/outputs/rejects/reworks/shipments | Conserved lot/order balances, warnings | Double counting passed/reworked units |
| `NotificationRuleEngine` | Dated triggers, rights, deduplication policy | In-app/scheduled alerts | Pretending to send email/push without a provider |
| `PortfolioEngine` | Authorized order summaries, resource calendars | Multiple-order rollups and capacity conflicts | Summarizing other tenants' private orders |

All calculations are pure (or pure with explicit snapshot/time injection). Views consume one normalized calculation result object containing validation, provenance and explanations.

## 2. Date and calendar contract

- Internally distinguish **civil date** (`YYYY-MM-DD`) from timestamp (`2026-10-10T10:40:00+06:00`); do not parse ambiguous `10/11/26` without asking/selecting locale mapping.
- Default calendar must be **selected and confirmed** by user; factory working week can differ by country/site, and holidays must come from confirmed entries/imports. Provide presets as editable suggestions marked "not confirmed", never hidden facts.
- Configurable weekly days, named holiday exceptions, ad-hoc shutdown, planned overtime, supplier vs factory calendar, calendar/working-day duration basis. Calendars have stable IDs and revision history.
- An activity has explicit scheduling granularity (`day` initially). Display dates without time zone drift; storage is date-only. An actual completion timestamp may coexist with actual completion date.
- **Inclusive day-level convention:** a work task of `N >= 1` working days starting on a workday uses that day as day 1 and has the Nth workday as its inclusive finish. FS + 0 means a successor starts on the next available workday after the predecessor's inclusive finish. SS + 0 may start the same workday; FF + 0 may finish on the same day. A zero-duration milestone is a boundary event on its date, not a phantom workday; explicitly define same-day milestone handoff with `milestoneEvent: start-of-day|end-of-day` and test it. Never embed an undocumented +1 off-by-one rule in calculation code.
- For approved same-day start after a gate event, use a documented milestone handoff constraint or a dated fixed-start release, never a covert negative lead.
- Lag duration/calendar basis are explicit; negative lead is allowed only with a user-confirmed overlap policy and safety checks. No negative activity durations.
- Calculate late/project dates relative to the configured required milestone (ex-factory, ETD or DC date); don't confuse these contractual endpoints.
- Avoid implicit "today" in forecasts: inject `asOfDate` so tests are deterministic and historical reports reproducible.

## 3. Dependency and schedule constraints

Relationships to support, all audited by tests:

- **FS — Finish to Start:** successor may start after predecessor finish subject to calendar/handoff/lag.
- **SS — Start to Start:** successor may start relative to predecessor start.
- **FF — Finish to Finish:** successor finish may not precede predecessor finish plus lag.
- **SF — Start to Finish:** successor finish constrained by predecessor start; uncommon but permitted if validated. If the chosen scheduling approach cannot support SF correctly, keep explicit `unsupported-constraint` rather than silently treating it as FS; SF is a full-scope requirement before final acceptance.

A task may have multiple dependencies and multiple successor paths. Reject duplicate/missing/self/cyclic task edges before committing. Guard against impossible date constraints, empty/negative durations, out-of-range dates and fixed-date conflicts.

**Scheduling pass:** normalize & validate graph → resolve calendars → derive early feasible starts/finishes from anchors/actual constraints → compare hard/soft deadlines → compute late boundaries from constrained delivery milestone → compute float → identify critical chains → emit warnings/conflict provenance. Use topological ordering and memoization; avoid recursion depth failure on large graphs. If mixed SS/FF/SF means a simple path-length CPM formula is invalid, use a mathematically sound generalized precedence/constraint solver or an explicitly supported restricted solver with tests. Do not produce incorrect criticality from a naive longest-path shortcut.

**Hard dates** (signed ex-factory, a locked actual, verified material arrival) cannot be pushed automatically. **Soft dates** (targets and possible vendor estimates) can be recomputed only as forecast, with flags. The required shipment date is a constraint, not a fact about feasibility.

## 4. Critical path / float

- **Earliest feasible start/finish:** computed from actuals, dependencies and configured calendar.
- **Latest start/finish:** latest activity boundaries consistent with the delivery milestone and all required constraints.
- **Total float:** latest feasible minus earliest feasible start/finish, in the relevant configured workday/calendar convention; report the calculation basis. Critical when float is effectively zero under the supported discrete-day convention. Negative float indicates required endpoint cannot be met without schedule changes.
- **Free float:** postponement allowed before affecting immediate successor(s). Multiple calendars complicate this: compute using feasible date shifts, not raw UTC millisecond subtraction.
- **Near critical:** explicit configurable buffer threshold (e.g. user-configured 2 workdays, not a secretly fixed default).
- **Overdue:** as-of date after applicable current target without verified completion, independent of whether activity is critical.
- **Critical chain trace:** list predecessor/successor activities and endpoint explaining why this route controls completion. Multiple equal-length critical chains possible.
- **Partial data:** show `CPM unavailable: missing duration for FP06` rather than a red path invented from defaults.
- **Negative float vs missed commitment:** distinguish forecast slip, signed contractual miss, change-approved delivery date, and unapproved extension request.

### Worked acceptance fixture CPM-01

Calendar Monday–Friday, no holidays, as-of before work. All tasks have working-day duration and FS links:

- A = 2 days, starts Monday **2026-10-12**, finishes Tuesday **2026-10-13**.
- B = 3 days, after A, starts Wed **2026-10-14**, finishes Fri **2026-10-16**.
- C = 2 days, after A, starts Wed **2026-10-14**, finishes Thu **2026-10-15**.
- D = 1 day, after both B and C, starts Mon **2026-10-19**, finishes Mon **2026-10-19**.
- With milestone delivery Mon **2026-10-19**, A→B→D is the controlling path, C has **1 working day** of routing float under this simple same-calendar fixture.
- Add a nonworking Thursday **2026-10-15**: B now finishes Mon **2026-10-19**, D Tue **2026-10-20**. Required delivery still Oct 19 ⇒ expected slip **1 working day**. The test must show this is not achieved by changing the baseline.

Test these exact dates and prevent timezone-dependent differences on users' machines.

## 5. Backward vs forward planning

**Backward:** start from explicitly chosen required ex-factory or other project endpoint. Subtract tasks and configured workdays/dependencies; flag latest permissible dates for approvals/fabric/trims/production. Required inputs missing ⇒ no false complete plan.

**Forward:** from actual LC, sample submission, material availability, forecast capacity, gate status and calendar, determine earliest feasible dates; show planned vs forecast for every task.

**Feasibility:** compare calculated earliest feasible endpoint with buyer committed endpoint; if late, compute amount and controlling tasks. Forward and backward computations must reconcile at the same agreed constraints and calendars.

When PO, LC and buyer target conflict, **show all commitments** and the mismatch; never choose one silently. User may explicitly mark source of contractual lead time `LC-open`, `PO-confirmed`, `deposit-received`, `other dated event` and select working/calendar basis. Contractual date from source event + agreed days is a calculation, not buyer approval of a revised target.

## 6. Quantities, production capacity and daily tracking

### 6.1 Simple verified-rate mode

- Required stage balance `max(0, plannedQty - acceptedCompletedQty)` using specified acceptance rules.
- Stage days `ceil(balance / verifiedDailyOutput)` for strictly positive `dailyOutput` and configured available workdays; if output is missing, 0 or invalid, show `Needs Information`.
- For example: order 18,000 pcs, completed 3,000 pcs, confirmed output 1,500 pcs/day => **10 production working days** remaining, *before* stage concurrency, weekends, hold or upstream dependencies.
- Do not apply `ceil` to an intermediate ratio before aggregating multi-line output unless the scheduling policy requires it.

### 6.2 SMV/SAM and efficiency mode (optional, evidence-backed)

For a manufacturing stage with fixed operators and known standards:

`grossUnitsPerDay = (operators * netAvailableMinutesPerOperatorPerDay * efficiencyFraction) / standardMinutesPerUnit`

Use floor for expected complete units if model specifies integer units; explain paid breaks/downtime allowance and do not count operators twice. Example: 25 operators × 480 net minutes × 0.70 / 12 SMV = **700 pcs/day**. This formula is meaningful only if all four inputs and the model's assumptions are verified. Track changing efficiency as dated entries, not a universal percentage.

### 6.3 Stage routing and WIP

- Cutting → sewing → wash/process when applicable → finishing → packing → inspection/dispatch may overlap by lots. Follow material-release and capacity constraints, not an arbitrary serial 1-stage-at-a-time assumption.
- Support `lotQty`, input vs output, line allocation, stage transfer lag, rework, rejects, wastage, shortage; no negative remaining quantity unless validated excess allowance is explicitly documented.
- Aggregate only comparable units (pieces vs sets must be converted by an explicit ratio). Quantity ledger invariants must hold at each stage and across shipment lots.
- Shared lines across multiple orders cannot be allocated beyond confirmed available capacity; surface a conflict, offer an adjusted scenario, do not silently double-book.
- Supplier/material shortages constrain stage starts only if required material is relevant for that lot/task.

### 6.4 Rolling forecast

At each new actual event, recompute from immutable actuals and current verified capacity; preserve previous forecast in history with timestamp/engine version. Display a forecast-confidence warning when rate is based on too little history. Do not call probabilistic risk precise unless data supports it.

## 7. Approval and material impact logic

- Submit date, buyer/local-office decision date, comments received, rework/resubmit duration and proof are distinct tasks/events.
- Gate is complete only after status is `approved` or authorized `waived` AND selected evidence/actor requirements are met.
- A rejected sample starts a new controlled loop/revision; system may suggest provisional rework lead time as **blank editable estimate**, never preset as buyer fact.
- Fabric in-house ≠ fabric QC passed ≠ fabric issued for cutting. Likewise trims in-house ≠ approved for sewing/packing.
- Master LC and fabric/trims B2B LC are separate commercial dependencies. LC opening may be a contractual anchor without necessarily blocking every factory process; business rule determines the dependency.
- If buyer/local-office delegated approval policy is unknown, mark gate as needing authorized confirmation.

## 8. Risk engine / delay cause explanation

Risk status precedence: invalid/missing essential data ⇒ `needs-information`; hard unfulfilled mandatory gate ⇒ `blocked`; verified missed current due date or forecast beyond required commitment ⇒ `delayed`; otherwise near-critical/low configurable float ⇒ `at-risk`; otherwise `on-track` if enough evidence exists.

Be careful: an order can have both a blocked task and a delivery forecast-late; show both reasons, avoid a single opaque color. Explain in plain language, e.g. "PP sample approval is pending; cutting cannot start until confirmed. Forecast is 3 working days later than required ex-factory based on the entered factory calendar." If needed inputs are missing, say that instead.

No claims of causal blame (buyer/factory/supplier) unless task responsibility and evidence establish the relevant party. Keep `Owner`, `Currently Waiting For`, `Reason` and `Approved Recovery Owner` distinct.

## 9. Recovery scenario engine

Each simulation is a fork of a specific confirmed plan revision with user-defined changes:

- Additional sewing line capacity, overtime or efficiency improvement.
- Alternate supplier or expedited verified material delivery.
- Safe overlap of sample/trims/fabric processes when technically permitted.
- Alternate subcontract line or split lots after user approval.
- Revised sequence/start dates that respect approvals, inspection gates and material readiness.
- Buyer-approved deadline revision kept distinct from internal potential recovery.

For each scenario: show changed inputs, changed critical chain, forecast days gained/lost, constraint violations, changed resource loads and any cost **only if the user entered a valid cost model**. Comparing scenarios must not mutate live baseline; Apply Scenario requires explicit confirmation, actor and revision reason. If an action is not actually feasible or violates a required gate, flag it as unsafe/not possible.

## 10. Shipment & multi-PO logic

- Required ex-factory, packing completion, final inspection booking/result, document submission, carrier booking, actual ex-factory, ETD and ETA are separate. Do not assume transit times or promise ETA without carrier/booking evidence or explicit user estimate.
- Final inspection `pass` cannot be inferred from completion of inspection date. If linked AQL record has no verified decision, show pending reference.
- Support shipping lots by PO, style, color/size and factory with totals: `allocatedQty <= orderedQty` (subject to documented tolerance); `shippedQty <= permitted passed/packedQty` where business policy requires; remain open until relevant lots close.
- Multiproject dashboard calculates metrics only over accessible records. Do not average unlike KPIs; define numerator/denominator (e.g. on-time orders count / orders with known committed & actual/forecast dates).

## 11. Recalculation triggers / deterministic execution

Trigger controlled recomputation when any affecting field changes: dates, duration, dependency, calendar, actual, approval status, capacity, lot split, constraint or scenario. Batch rapid UI edits/debounce at UI layer; underlying engine pure and synchronous or cancellable worker for large plans. Use immutable input snapshot ID and discard stale results. Never let an old asynchronous forecast overwrite newer edits.

Store derived output provenance: `engineVersion`, `inputRevision`, `computedAt`, `calendarRevision`, `warnings`, `missingInputs`, `constraintViolations` and source task IDs.

## 12. Required test fixtures and assertions

| Test ID | Input / condition | Required proof |
|---|---|---|
| CAL-01 | Working M–F, shift +1 from Fri | Returns Monday; exact date semantics |
| CAL-02 | Holiday / site shutdown | Skips unavailable workday |
| CAL-03 | Different supplier vs factory calendars | No cross-calendar date corruption |
| CAL-04 | ISO date/timezone and DST | Same civil plan date across browsers/timezones |
| CAL-05 | Leap year, year-end, zero-day milestone | No off-by-one errors |
| GPH-01 | A→B→D and A→C→D | Both paths, B controlling, C float 1 (CPM-01) |
| GPH-02 | Cycle/self/missing reference | Reject input atomically, preserve saved schedule |
| GPH-03 | FS, SS, FF, SF, lag and allowed lead | Compare against hand-computed dates |
| GPH-04 | Two equal critical routes | Both identified |
| GPH-05 | Conflicting fixed/required date | Negative float/violation explained |
| GPH-06 | Missing duration/calendar | Needs Information, never guessed |
| GPH-07 | Milestone same-day handoff | Explicit event semantics proven |
| GPH-08 | Late noncritical task with float | Overdue distinct from critical |
| GPH-09 | Mixed calendars / multi-predecessor | Correct generalized precedence behavior |
| COM-01 | PO date before LC, 60 calendar vs work days | Correct explicit anchor, no implicit switching |
| COM-02 | Master LC vs fabric/trims B2B LC | Distinct independent milestones |
| APR-01 | Submitted but unapproved sample | Downstream gate remains blocked |
| APR-02 | Approved delegated local office | Only if authorization recorded |
| APR-03 | Rejection/resubmission/waiver | Revision and traceable decision |
| CAP-01 | 18,000 – 3,000 @1,500/day | 10 working days, no fabricated rate |
| CAP-02 | 25×480×0.7/12 | 700 pcs/day under explicit example inputs |
| CAP-03 | Missing output, 0 rate, negative quantity | Error/unknown state, no NaN or fake end date |
| CAP-04 | Shared line capacity overallocated | Warning and no double-book |
| CAP-05 | Overlapping lots and WIP, rework | Quantity conservation, no 2× counting |
| SHP-01 | 2 partial lots | No whole-order shipped until total confirmed |
| SHP-02 | Final inspection not passed | Release not auto-approved |
| SCN-01 | Change output in preview | Forecast differs, live baseline unchanged |
| SCN-02 | Confirm scenario | New revision reason + audit, old baseline preserved |
| RSK-01 | Missing due date | Needs Information, not green |
| RSK-02 | Forecast late and blocked gate | Both risks explained |
| PERF-01 | 2,000 tasks / multiple orders | Stable results, no recursion or stale state |

Testing must include at least one manually computed full garment-order TNA with dates for knit + woven + imported fabric + wash/denim + partial shipment. Keep fixture input in tests; no silently invented default capacities. Unit tests alone do not prove browser export, storage or cloud authorization—see tracker.

## 13. Output contract shared with UI/reports

```text
ScheduleResult
  inputRecordId, inputRevision, asOfDate, engineVersion
  validity: valid | incomplete | invalid
  missingInputs[], errors[], warnings[]
  taskResults[id]: earlyStart, earlyFinish, lateStart, lateFinish,
                   floatDays, freeFloatDays, isCritical, isNearCritical,
                   isOverdue, risk, explanation[], blockingPredecessors[]
  project: selectedDeadlineType, requiredDate, forecastDate,
           workingDaysEarlyOrLate, criticalPaths[][], scheduleConfidence
  capacity: stageSummaries[], overAllocations[], lotSummaries[]
  generatedAt, calendarRevisions[]
```

Use plain, safe, nontechnical wording in UI. Every visible number/date in the report should trace to data and a reproducible calculation. An unavailable result remains `—` with a reason, not `0` or `Approved`.

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..', '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const bootstrap = read('apps/tna/src/bootstrap.js');
const css = read('apps/tna/assets/tna.css');
const domain = require('../src/domain.js');
const scheduling = require('../src/scheduling.js');
const operations = require('../src/operations.js');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

for (const fragment of [
  'function workspaceData(plan)',
  'function workspacePanel(plan)',
  'function portfolioPanel(records)',
  'function readinessPanel(plan)',
  'Materials & Commercial',
  'No material records entered; material readiness remains needs-information.',
  'No approval submissions entered; approvals cannot be assumed.',
  'Production & Capacity',
  'Verified daily output is missing; capacity remains needs-information.',
  'Shipment & Readiness',
  'final inspection pass is required before release.',
  'Due today',
  'Overdue',
  'Next 7 days',
  'Critical path',
  'Accessible TNA timeline table',
  'No hidden current-date assumption is used',
  'Portfolio is browser-local until authenticated backend storage is provisioned',
  'data-filter-owner',
  'data-filter-stage',
  'Active timeline filter:',
  'Accessible TNA timeline table filtered view',
  'data-clear-filters',
  'aria-pressed',
  'Local multi-PO portfolio proof',
  'PO references',
  'function openTaskEdit(taskId)',
  'class TnaLocalEditPersistence',
  'TnaLocalEditPersistence.commit(result.plan,state.currentPlan)',
  'tnaStatusSaveError',
  'class GarmentTnaFollowupEditor',
  'tnaFollowupEdit',
  'GarmentTnaFollowupEditor.bind(taskId)',
  'Editable garment TNA activity sheet',
  'tna-master-activities',
  'tna-sheet-scroll',
  'GarmentTnaActivityView.renderCells(plan,task,state.language)',
  'task.dates?.currentTargetFinish||task.dates?.baselineFinish',
  'task.dates?.forecastFinish',
  'task.dates?.actualFinish',
  'task.delayReason||',
  'this.lateCalendarDays(task,language)',
  'this.approvalSource(plan,task,language)',
  'this.recordedNote(plan,task)',
  'Calendar days late',
  'Approval / source',
  'Recorded note',
  'data-edit-task',
  'Save activity edit',
  'data-workspace-view',
  'Timeline (Gantt)',
  'Today / Next 7 Days',
  'Critical Only',
  'Table view keeps all calculated date and risk details in text form.',
  'Practice example is isolated from real production records and cannot be saved as a production TNA.',
  'Practice example is isolated and cannot be saved into real production records.',
  'Practice example cannot be exported as business evidence.',
]) {
  assert(bootstrap.includes(fragment), `G06 workspace UI missing: ${fragment}`);
}

for (const fragment of ['.tna-workspace-grid', '.tna-dashboard-grid', '.tna-gantt', '.tna-timeline-table', '.tna-readiness-grid', '.tna-readiness-card', '.tna-readiness-list', '.tna-mini-btn', '.tna-activity-table', '.tna-sheet-scroll', '.tna-portfolio-table', '@media(max-width:1050px)', '@media(max-width:850px)', '@media(max-width:540px)']) {
  assert(css.includes(fragment), `G06 responsive workspace CSS missing: ${fragment}`);
}

// The new complete follow-up sheet is primary; the original calculated timeline
// remains an optional view. These assertions protect presentation ownership only.
const orderMasterAt = bootstrap.indexOf('${orderMasterPanel(plan)}');
const sheetAt = bootstrap.indexOf('class="tna-master-activities"');
const schedulingAt = bootstrap.indexOf('${schedulePanel(plan)}');
assert(orderMasterAt !== -1 && sheetAt > orderMasterAt && schedulingAt > sheetAt,
  'Garment sheet must follow Order Master and precede specialist dashboards.');
assert(!bootstrap.includes('plan.tasks.slice(0,12)'),
  'Activity edit access cannot silently exclude the remaining template tasks.');
assert(css.includes('.tna-sheet-scroll .tna-activity-table{min-width:0;display:grid;gap:10px'),
  'Mobile should render complete localized activity cards.');
assert(css.includes('.tna-sheet-scroll .tna-activity-table{min-width:1700px'),
  'Twelve source-backed follow-up columns must retain their mobile scroll width.');
assert(css.includes('.tna-sheet-scroll{max-width:100%;overflow-x:auto'),
  'Narrow screens must scroll inside the sheet instead of overflowing the page.');

const plan = domain.createPlan({
  templateId: 'knit', buyerName: 'Buyer', factoryName: 'Factory', styleNo: 'STYLE-G06', poNumber: 'PO-G06', totalQty: 1000,
  orderConfirmedOn: '2026-10-12', buyerRequiredExFactory: '2026-12-15'
}, { ownerUserId: 'admin@vesa' });
const result = scheduling.schedule(plan.tasks, plan.edges, { calendar: plan.calendars[0], startDate: '2026-10-12', requiredDate: '2026-12-15', asOfDate: '2026-10-12', nearCriticalDays: 3 });
assert(result.validity === 'valid', 'G06 fixture schedule should be valid for dashboard/timeline.');
assert(result.project.criticalPaths.length >= 1, 'G06 fixture should expose critical path data for dashboard.');
assert(Object.keys(result.taskResults).length === plan.tasks.length, 'G06 fixture should provide timeline date data for every task.');

const material = operations.materialReadiness({});
assert(material.status === 'needs-information', 'G06 material readiness must fail closed without in-house/QC evidence.');
const approval = operations.approvalState({});
assert(approval.status === 'needs-information', 'G06 approval state must fail closed without submission/decision evidence.');
const capacity = operations.verifiedRateDays({ plannedQty: 1000, completedQty: 0, verifiedDailyOutput: null });
assert(capacity.status === 'needs-information', 'G06 capacity must require a verified daily output.');
const shipment = operations.shipmentSummary(1000, [], { status: 'not-entered' });
assert(shipment.remainingQty === 1000 && shipment.ok === true, 'G06 shipment summary should keep remaining quantity explicit without lots.');
const taskEdit = domain.updateTaskStatus(plan, plan.tasks[0].taskId, 'completed', { actualDate: '2026-10-20', actorId: 'admin@vesa' });
assert(taskEdit.ok && taskEdit.plan.tasks[0].dates.actualFinish === '2026-10-20', 'G06 activity edit should use the domain update engine and preserve actual finish separately.');

console.log('TNA G06 workspace contract checks passed');

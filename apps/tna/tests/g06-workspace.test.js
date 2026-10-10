const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..', '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const bootstrap = read('apps/tna/src/bootstrap.js');
const css = read('apps/tna/assets/tna.css');
const domain = require('../src/domain.js');
const scheduling = require('../src/scheduling.js');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

for (const fragment of [
  'function workspaceData(plan)',
  'function workspacePanel(plan)',
  'function portfolioPanel(records)',
  'Due today',
  'Overdue',
  'Next 7 days',
  'Critical path',
  'Accessible TNA timeline table',
  'No hidden current-date assumption is used',
  'Portfolio is browser-local until authenticated backend storage is provisioned',
  'data-filter-owner',
  'data-filter-stage'
]) {
  assert(bootstrap.includes(fragment), `G06 workspace UI missing: ${fragment}`);
}

for (const fragment of ['.tna-workspace-grid', '.tna-dashboard-grid', '.tna-gantt', '.tna-timeline-table', '@media(max-width:850px)', '@media(max-width:540px)']) {
  assert(css.includes(fragment), `G06 responsive workspace CSS missing: ${fragment}`);
}

const plan = domain.createPlan({
  templateId: 'knit', buyerName: 'Buyer', factoryName: 'Factory', styleNo: 'STYLE-G06', poNumber: 'PO-G06', totalQty: 1000,
  orderConfirmedOn: '2026-10-12', buyerRequiredExFactory: '2026-12-15'
}, { ownerUserId: 'admin@vesa' });
const result = scheduling.schedule(plan.tasks, plan.edges, { calendar: plan.calendars[0], startDate: '2026-10-12', requiredDate: '2026-12-15', asOfDate: '2026-10-12', nearCriticalDays: 3 });
assert(result.validity === 'valid', 'G06 fixture schedule should be valid for dashboard/timeline.');
assert(result.project.criticalPaths.length >= 1, 'G06 fixture should expose critical path data for dashboard.');
assert(Object.keys(result.taskResults).length === plan.tasks.length, 'G06 fixture should provide timeline date data for every task.');

console.log('TNA G06 workspace contract checks passed');

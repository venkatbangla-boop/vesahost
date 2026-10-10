const fs = require('fs');
const assert = require('assert/strict');
const vm = require('vm');

const htmlPath = 'apps/aql/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const serviceWorker = fs.readFileSync('apps/aql/service-worker.js', 'utf8');

function fail(message) {
  throw new Error(message);
}

function expect(condition, message) {
  if (!condition) fail(message);
}

function expectThrow(action, message) {
  let thrown = false;
  try {
    action();
  } catch (error) {
    thrown = true;
    if (message && !String(error.message).includes(message)) {
      fail(`Expected error containing "${message}", received "${error.message}"`);
    }
  }
  expect(thrown, 'Expected the operation to reject malformed input.');
}

function classSource(name) {
  const start = html.indexOf(`class ${name}`);
  expect(start >= 0, `Source class ${name} is missing.`);
  const next = html.indexOf('class ', start + name.length + 6);
  return html.slice(start, next < 0 ? html.length : next);
}

// The runner evaluates only pure, already shipped domain owners. It deliberately does
// not load the DOM coordinator, storage adapter, network code or generated assets.
const domainSource = [
  'DomainValue',
  'MeasurementNumber',
  'SamplingEngine',
  'AllocationEngine',
  'MeasurementEngine',
  'PackingEngine',
  'TestValidity',
  'ResultEngine',
  'StageDecision',
  'PortableInspection',
].map(classSource).join('\n');

let randomState = 0;
const sandbox = {
  Blob,
  console,
  crypto: {
    getRandomValues(array) {
      for (let i = 0; i < array.length; i += 1) {
        array[i] = (randomState * 1103515245 + 12345) >>> 0;
        randomState += 1;
      }
      return array;
    },
  },
  MeasurementBridge: { derive: () => ({ rows: [] }) },
  ShipmentResult: { append: () => {} },
  InsightGuard: { append: () => {}, authorityIssues: () => [] },
  CompanionGuard: { append: () => {} },
  CartonIdentity: { key: carton => `${carton.po || ''}|${carton.item || ''}|${carton.number || ''}` },
};
vm.runInNewContext(`${domainSource}\nthis.__exports = { DomainValue, MeasurementNumber, SamplingEngine, AllocationEngine, MeasurementEngine, PackingEngine, TestValidity, ResultEngine, StageDecision, PortableInspection };`, sandbox, { filename: htmlPath });

const {
  DomainValue,
  MeasurementNumber,
  SamplingEngine,
  AllocationEngine,
  MeasurementEngine,
  PackingEngine,
  TestValidity,
  ResultEngine,
  StageDecision,
  PortableInspection,
} = sandbox.__exports;

function baseProject(overrides = {}) {
  return {
    info: { buyer: 'Buyer', factory: 'Factory', inspector: 'Inspector', date: '2026-10-10', production: '100', packed: '100' },
    rules: {
      groupBy: 'combined', basis: 'occurrences', unitClass: 'highest', level: 'III', plan: 'reference',
      major: '6.5', minor: '6.5', critical: 0, confirmed: true, reference: 'FIXTURE-REF',
      requireReadiness: false, minProduction: 100, minPacked: 80, measurementRequired: false,
      measurementRule: 'any', maxOOT: 0, additional: 3, requirePhotos: false, optionalFailBlocks: false,
      requireFactorySign: false, custom: {}, severityOverrides: {},
    },
    orders: [{ id: 'L1', po: 'PO-1', item: 'STYLE-1', color: 'Navy', size: 'M', qty: 8, orderQty: 8, allocated: 3, checked: 3 }],
    checks: [], defects: [], measurements: [], tests: [], cartons: [], equipment: [], documents: [], assets: [],
    capa: [], reinspection: [], migrationWarnings: [], scope: { modules: { measurements: { mode: 'excluded' } } },
    ...overrides,
  };
}

function evaluate(overrides) {
  return ResultEngine.evaluate(baseProject(overrides));
}

function referenceRules(level = 'III', major = '6.5', minor = '6.5') {
  return { groupBy: 'combined', basis: 'occurrences', unitClass: 'highest', level, plan: 'reference', major, minor, critical: 0, confirmed: true, reference: 'FIXTURE-REF', custom: {} };
}

function planFor(lot, level, major = '6.5', minor = '6.5') {
  return SamplingEngine.plan({ key: 'ALL', lot, lines: [] }, referenceRules(level, major, minor));
}

function portableRoundTrip(value) {
  return JSON.parse(JSON.stringify(value));
}

const fixtures = [
  ['Q01', () => {
    const expectedCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R'];
    const expectedSizes = [2, 3, 5, 8, 13, 20, 32, 50, 80, 125, 200, 315, 500, 800, 1250, 2000];
    const expectedAqls = ['0.65', '1.0', '1.5', '2.5', '4.0', '6.5'];
    const expectedAc = {
      A: [null, null, null, null, null, null], B: [null, null, null, null, null, 0],
      C: [null, null, null, null, 0, 0], D: [null, null, 0, 0, 1, 1],
      E: [null, 0, 0, 1, 1, 2], F: [0, 0, 1, 1, 2, 3],
      G: [0, 1, 1, 2, 3, 5], H: [1, 1, 2, 3, 5, 7],
      J: [1, 2, 3, 5, 7, 10], K: [2, 3, 5, 7, 10, 14],
      L: [3, 5, 7, 10, 14, 21], M: [5, 7, 10, 14, 21, null],
      N: [7, 10, 14, 21, null, null], P: [10, 14, 21, null, null, null],
      Q: [14, 21, null, null, null, null], R: [21, null, null, null, null, null],
    };
    expect(JSON.stringify(SamplingEngine.CODES) === JSON.stringify(expectedCodes), 'Q01 code fixture differs');
    expect(JSON.stringify(SamplingEngine.SIZES) === JSON.stringify(expectedSizes), 'Q01 sample-size fixture differs');
    expect(JSON.stringify(SamplingEngine.AQLS) === JSON.stringify(expectedAqls), 'Q01 AQL fixture differs');
    expect(JSON.stringify(SamplingEngine.AC) === JSON.stringify(expectedAc), 'Q01 Ac fixture differs');
    for (const [upper, sequence] of SamplingEngine.LOTS) {
      const lot = Number.isFinite(upper) ? upper : 500001;
      for (const [levelIndex, level] of SamplingEngine.LEVELS.entries()) {
        const expectedCode = sequence[levelIndex];
        const result = planFor(lot, level);
        expect(result.code === expectedCode, `Q01: lot ${lot}, ${level} code ${result.code} != ${expectedCode}`);
        expect(result.n === expectedSizes[expectedCodes.indexOf(expectedCode)], `Q01: lot ${lot}, ${level} sample mismatch`);
        for (const [aqlIndex, aql] of expectedAqls.entries()) {
          const cell = expectedAc[expectedCode][aqlIndex];
          const oneCell = planFor(lot, level, aql, aql);
          if (cell === null) expect(oneCell.issues.some(x => x.includes('unsupported')), `Q01 null cell ${expectedCode}/${aql} did not remain unsupported`);
          else expect(oneCell.major === cell && oneCell.minor === cell, `Q01 Ac mismatch ${expectedCode}/${aql}`);
        }
      }
    }
  }],
  ['Q02', () => {
    for (const code of SamplingEngine.CODES) {
      const sequenceIndex = SamplingEngine.LOTS.findIndex(([, sequence]) => sequence.includes(code));
      const [upper, sequence] = SamplingEngine.LOTS[sequenceIndex];
      const level = SamplingEngine.LEVELS[sequence.indexOf(code)];
      const lot = Number.isFinite(upper) ? upper : 500001;
      const aql = SamplingEngine.AQLS[SamplingEngine.AC[code].findIndex(value => value === null)];
      if (!aql) continue;
      const result = planFor(lot, level, aql, aql);
      expect(result.issues.some(x => x.includes('unsupported')), `Q02 null cell ${code}/${aql} calculated a usable plan`);
    }
    const unavailable = SamplingEngine.plan({ key: 'ALL', lot: 8, lines: [] }, { ...referenceRules(), plan: 'tightened', custom: {} });
    expect(unavailable.issues.length > 0 && unavailable.n === 0, 'Q02 unavailable tightened plan was not blocked');
  }],
  ['Q03', () => {
    let previous = 0;
    for (const [upper, sequence] of SamplingEngine.LOTS) {
      const lower = previous + 1;
      const representatives = Number.isFinite(upper) ? [lower, upper] : [lower];
      for (const lot of representatives) {
        const result = planFor(lot, 'III');
        expect(result.code === sequence[6], `Q03 boundary lot ${lot} returned ${result.code}, expected ${sequence[6]}`);
      }
      if (Number.isFinite(upper)) previous = upper;
    }
  }],
  ['Q04', () => {
    for (const lot of [0, -1, 1.5, '1.5', 'not-a-lot', '']) {
      const result = planFor(lot, 'III');
      expect(result.issues.length > 0, `Q04 invalid lot ${String(lot)} was accepted`);
    }
  }],
  ['Q05', () => {
    const p = { rules: { groupBy: 'color' }, orders: [
      { id: 'L1', color: 'Navy', qty: 8 }, { id: 'L2', color: '', qty: 8 }, { id: 'L3', color: 'Navy', qty: 4 },
    ] };
    const groups = SamplingEngine.groups(p);
    expect(JSON.stringify(groups.map(group => group.key)) === JSON.stringify(['Navy', '']), 'Q05 grouping fixture differs');
    expect(groups.find(group => group.key === '').label === 'Missing group', 'Q05 missing group identifier was hidden');
    expect(html.includes('A lot-group identifier is missing.'), 'Q05 ResultEngine missing-group guard is absent');
  }],
  ['Q06', () => {
    expect(JSON.stringify(AllocationEngine.distribute([{ qty: 3 }, { qty: 2 }], 3)) === JSON.stringify([2, 1]), 'Q06 largest-remainder allocation differs');
    expectThrow(() => AllocationEngine.distribute([{ qty: 2 }], 3), 'Sample exceeds available lot');
    const result = evaluate({ orders: [{ ...baseProject().orders[0], allocated: 2, checked: 0 }] });
    expect(result.result === 'PENDING' && result.pending.some(x => x.text.includes('allocated 2 / required 3')), 'Q06 allocation remainder was not pending');
  }],
  ['Q07', () => {
    const result = evaluate({ orders: [{ ...baseProject().orders[0], allocated: 3, checked: 2 }] });
    expect(result.result === 'PENDING' && result.pending.some(x => x.text.includes('checked 2 / required 3')), 'Q07 incomplete checked quantity was not pending');
  }],
  ['Q08', () => {
    const result = evaluate({ defects: [{ id: 'D1', lineId: 'L1', name: 'Critical hole', severity: 'Critical', qty: 1, sampleId: '' }] });
    expect(result.result === 'NOT CONFORMED' && result.failures.some(x => x.text.includes('workmanship acceptance limit exceeded')), 'Q08 critical policy did not fail');
  }],
  ['Q09', () => {
    const rules = referenceRules('III', '1.5', '6.5');
    const order = { ...baseProject().orders[0], qty: 90, allocated: 20, checked: 20 };
    const atAc = evaluate({ rules, orders: [order], defects: [{ id: 'D1', lineId: 'L1', name: 'Major at Ac', severity: 'Major', qty: 1, sampleId: '' }] });
    const atRe = evaluate({ rules, orders: [order], defects: [{ id: 'D1', lineId: 'L1', name: 'Major at Re', severity: 'Major', qty: 2, sampleId: '' }] });
    expect(atAc.result === 'CONFORMED', `Q09 Ac boundary was not accepted: ${atAc.result}`);
    expect(atRe.result === 'NOT CONFORMED', `Q09 Re boundary was not rejected: ${atRe.result}`);
  }],
  ['Q10', () => {
    const p = { rules: { basis: 'units', unitClass: 'highest' }, orders: [{ id: 'L1', item: 'STYLE', color: 'Navy', size: 'M', checked: 1 }], defects: [
      { lineId: 'L1', severity: 'Minor', qty: 1, sampleId: 'PIECE-1' }, { lineId: 'L1', severity: 'Major', qty: 1, sampleId: 'PIECE-1' },
    ] };
    const result = SamplingEngine.counts(p, { lines: p.orders });
    expect(result.Major === 1 && result.Minor === 0 && result.issues.length === 0, 'Q10 highest-severity defective-piece basis was not applied');
    p.rules.unitClass = 'each';
    const each = SamplingEngine.counts(p, { lines: p.orders });
    expect(each.Major === 1 && each.Minor === 1, 'Q10 each-defect basis was not applied');
  }],
  ['Q11', () => {
    const p = { rules: { basis: 'units', unitClass: 'highest' }, orders: [
      { id: 'L1', item: 'STYLE-A', color: 'Navy', size: 'M', checked: 1 }, { id: 'L2', item: 'STYLE-B', color: 'Navy', size: 'M', checked: 1 },
    ], defects: [{ lineId: 'L1', severity: 'Major', qty: 1, sampleId: 'DUP-1' }, { lineId: 'L2', severity: 'Minor', qty: 1, sampleId: 'DUP-1' }] };
    const result = SamplingEngine.counts(p, { lines: p.orders });
    expect(result.issues.some(x => x.includes('conflicting variants')), 'Q11 duplicate physical identity was not flagged');
    expect(html.includes('Carton identifiers must be unique in this project.'), 'Q11 duplicate carton guard is absent');
  }],
  ['Q12', () => {
    const result = StageDecision.roll({ length: 100, widthStart: 160, widthMiddle: 160, widthEnd: 160, limit: 10, method: 'Buyer 4-point method', basis: '100 m²', defects: '10,slub,2,4\n20,spot,1,12' });
    expect(result.issues.length === 0 && result.points === 16 && result.density === 10 && result.fail === false, 'Q12 fabric roll arithmetic or boundary failed');
    expect(html.includes('no universal 40-point rule is assumed'), 'Q12 buyer-defined method warning is absent');
  }],
  ['Q13', () => {
    const result = evaluate({ tests: [{ id: 'T1', name: 'Required lab test', mode: 'numeric', actual: '', min: 1, max: 5, required: true }] });
    expect(result.result === 'PENDING' && result.pending.some(x => x.text.includes('required test incomplete')), 'Q13 pending required test did not block completion');
  }],
  ['Q14', () => {
    const source = { defects: [{ id: 'D1', name: 'Hole', status: 'Original' }], capa: [{ id: 'C1', status: 'Open' }], reinspection: [{ id: 'R1', status: 'Pending' }] };
    const reopened = portableRoundTrip(source);
    assert.deepEqual(reopened, source);
    expect(html.includes('Original defect is retained.') && html.includes('Reinspection verification pending'), 'Q14 historical failure/reinspection safeguards are absent');
  }],
  ['Q15', () => {
    expect(html.includes('critical finding cannot pass without closure evidence'), 'Q15 critical supplier audit guard is absent');
    expect(html.includes('findings were not received'), 'Q15 denied acknowledgement guard is absent');
  }],
  ['Q16', () => {
    expect(html.includes('Nothing was replaced.') && html.includes('Duplicate embedded file identities.'), 'Q16 atomic portable validation contract is absent');
    expect(html.includes("raw.format!=='VESA360-SYNC-PACK'"), 'Q16 sync-pack identity guard is absent');
  }],
  ['Q17', () => {
    expectThrow(() => PortableInspection.checkBudget({ assets: [{ size: 200 * 1024 * 1024 + 1 }] }), '200 MB portable-project limit');
    expectThrow(() => PortableInspection.assertEncoded('0123456789', 5), '280 MB reopen limit');
  }],
  ['Q18', () => {
    expect(html.includes('Persistent storage') && html.includes('Work retained in this tab only'), 'Q18 save-rescue messaging is absent');
    expect(html.includes('saveSafety'), 'Q18 storage failure safety owner is absent');
  }],
  ['Q19', () => {
    expect(serviceWorker.includes('self.skipWaiting()') && serviceWorker.includes('self.clients.claim()'), 'Q19 service-worker upgrade lifecycle is incomplete');
    expect(serviceWorker.includes("key.startsWith('vesa-aql-') && key !== CACHE"), 'Q19 stale AQL cache cleanup is absent');
  }],
  ['Q20', () => {
    const states = [evaluate({}), evaluate({ defects: [{ id: 'D1', lineId: 'L1', name: 'Critical', severity: 'Critical', qty: 1, sampleId: '' }] }), evaluate({ orders: [] })];
    expect(states[0].result === 'CONFORMED' && states[1].result === 'NOT CONFORMED' && states[2].result === 'PENDING', 'Q20 Pass/Fail/Pending source decisions diverged');
    expect(html.includes("['buyer','Standard buyer report']") && html.includes("['exceptions','Exception-focused report']"), 'Q20 report presets are incomplete');
  }],
  ['Q21', () => {
    const ids = ['C1', 'C2', 'C3', 'C4', 'C5'];
    randomState = 0;
    const first = AllocationEngine.random(ids, 3);
    randomState = 0;
    const second = AllocationEngine.random(ids, 3);
    expect(JSON.stringify(first) === JSON.stringify(second), 'Q21 deterministic selection differed');
    expect(new Set(first).size === 3 && first.every(id => ids.includes(id)), 'Q21 selection was not reproducible without replacement');
    expect(html.includes('Random cartons selected'), 'Q21 selection history action is absent');
  }],
  ['Q22', () => {
    const result = evaluate({ orders: [] });
    expect(result.result === 'PENDING' && !JSON.stringify(result).includes('Infinity') && !JSON.stringify(result).includes('NaN'), 'Q22 missing denominator did not remain Needs Data');
  }],
  ['Q23', () => {
    const note = `${'বাংলা Hindi हिंदी Tamil தமிழ் English '.repeat(500)}long-note`;
    const source = { info: { publicNote: note }, assets: [{ id: 'A1', name: 'signature-and-photo.png', size: 12 }], languageLabels: ['English', 'Bengali', 'Hindi', 'Tamil'] };
    const reopened = portableRoundTrip(source);
    assert.deepEqual(reopened, source);
    for (const label of source.languageLabels) expect(html.includes(label), `Q23 ${label} label is absent`);
  }],
  ['Q24', () => {
    const before = { plan: planFor(90, 'III', '1.5', '6.5'), result: evaluate({}) };
    const portable = portableRoundTrip({ semantic: before, ui: { menu: 'Home/File/Edit/View/Tools/Help', theme: 'current' } });
    expect(JSON.stringify(portable.semantic) === JSON.stringify(before), 'Q24 portable semantic result changed');
    expect(html.includes('aql-release-menu') && html.includes('AQL_RELEASE_PATCH_2026_10_09'), 'Q24 shared menu/header contract is absent');
  }],
];

const seen = new Set();
for (const [id, test] of fixtures) {
  expect(!seen.has(id), `Duplicate fixture identity ${id}`);
  seen.add(id);
  test();
  console.log(`${id} PASS`);
}

expect(seen.size === 24, `Expected 24 fixtures, received ${seen.size}`);
console.log(`AQL A-G00 deterministic baseline passed: ${seen.size}/24 fixtures plus portable round-trip invariants`);

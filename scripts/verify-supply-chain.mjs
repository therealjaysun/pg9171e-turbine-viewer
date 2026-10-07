import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import {
  supplyForPart, quadrantFor, quadrants, isCostOpportunity, heatColor, heatColors,
  ratingNames, frameworkSource,
} from '../src/supply-chain/index.js';

// The selectable roster is independent of the research dispatchers. Changes in
// geometry or data must deliberately update coverage, not silently add fallbacks.
const numbered = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}`);
const halves = prefix => [`${prefix}-upper`, `${prefix}-lower`];
const expectedIds = [
  ...numbered('compressor-rotor', 17), ...numbered('compressor-stator', 17),
  'compressor-stub-shafts', 'compressor-exit-guides',
  ...halves('compressor-casing-forward'), ...halves('compressor-casing-aft'),
  ...halves('compressor-casing-discharge'), ...halves('inlet-casing'),
  'inlet-guide-vanes', 'igv-actuator',
  ...halves('combustion-wrapper'), 'compressor-discharge-inner-barrel',
  ...numbered('combustor', 14), ...numbered('combustor-liner', 14),
  ...numbered('transition', 14), 'combustor-crossfire-manifolds',
  ...numbered('turbine-wheel', 3), ...numbered('turbine-nozzle', 3),
  'turbine-spacers-studs', ...halves('turbine-shell'),
  'exhaust-frame-struts', ...halves('exhaust-diffuser'), 'exhaust-turning-vanes',
  'shaft', ...numbered('bearing', 3), 'base-frame',
];
const researchDate = '2026-10-06';
const scoreFields = ['cost', 'criticality', 'supplyRisk', 'businessImpact'];
const textFields = [
  'family', 'title', 'scope', 'costBasis', 'criticalityBasis', 'riskBasis',
  'impactBasis', 'strategy', 'priceEvidence',
];

function text(value, label) {
  assert.ok(typeof value === 'string' && value.trim(), `${label}: expected nonempty text`);
}

function httpsUrl(value, label) {
  text(value, label);
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', `${label}: must use HTTPS`);
  assert.ok(url.hostname.includes('.'), `${label}: expected a public source hostname`);
  assert.equal(url.username + url.password, '', `${label}: credentials must not be embedded`);
  url.hash = '';
  return url.href;
}

function verifyDecisions() {
  // Explicit boundary fixtures detect swapped axes, wrong cutoff and accidental
  // dependence on cost or operational criticality instead of business impact.
  const cases = [
    { businessImpact: 1, supplyRisk: 1, expected: 'routine' },
    { businessImpact: 2, supplyRisk: 2, expected: 'routine' },
    { businessImpact: 2, supplyRisk: 3, expected: 'bottleneck' },
    { businessImpact: 1, supplyRisk: 5, expected: 'bottleneck' },
    { businessImpact: 3, supplyRisk: 2, expected: 'leverage' },
    { businessImpact: 5, supplyRisk: 1, expected: 'leverage' },
    { businessImpact: 3, supplyRisk: 3, expected: 'strategic' },
    { businessImpact: 5, supplyRisk: 5, expected: 'strategic' },
  ];
  for (const { expected, ...ratings } of cases) {
    for (const [cost, criticality] of [[1, 5], [5, 1]]) {
      assert.equal(quadrantFor({ ...ratings, cost, criticality }), expected,
        `Kraljic axes/cutoff: ${JSON.stringify(ratings)}`);
    }
  }
  assert.deepEqual(Object.keys(quadrants).sort(), ['bottleneck', 'leverage', 'routine', 'strategic']);
  for (const [id, quadrant] of Object.entries(quadrants)) {
    for (const field of ['title', 'caption', 'axes']) text(quadrant[field], `${id}.${field}`);
  }
  text(frameworkSource.label, 'framework source label');
  httpsUrl(frameworkSource.url, 'framework source URL');

  // A low-risk supplier market is deliberately NOT a proxy for low criticality.
  for (const cost of [1, 2, 3, 4, 5]) {
    for (const criticality of [1, 2, 3, 4, 5]) {
      const expected = [4, 5].includes(cost) && [1, 2].includes(criticality);
      for (const [supplyRisk, businessImpact] of [[1, 5], [5, 1]]) {
        assert.equal(isCostOpportunity({ cost, criticality, supplyRisk, businessImpact }), expected,
          `opportunity boundary cost=${cost}, criticality=${criticality}`);
      }
    }
  }
}

function verifyHeatColors() {
  assert.equal(heatColors.length, 5, 'five cost/criticality bands are required');
  assert.equal(new Set(heatColors).size, 5, 'heat-map bands must be distinguishable');
  assert.equal(ratingNames.length, 5);
  for (const color of heatColors) assert.match(color, /^#[\da-f]{6}$/i, 'valid hex heat color');
  for (const name of ratingNames) text(name, 'rating label');
  for (const score of [1, 2, 3, 4, 5]) {
    const record = Object.freeze({ cost: score, criticality: 6 - score });
    assert.equal(heatColor(record, 'cost'), heatColors[score - 1]);
    assert.equal(heatColor(record, 'criticality'), heatColors[5 - score]);
  }

  // null is the viewer's sentinel for restoring original materials. Switching
  // modes must be stateless; missing data must not leave a stale heat-map tint.
  const record = Object.freeze({ cost: 2, criticality: 5 });
  const modes = ['cost', 'criticality', 'off', 'cost', 'unknown', 'criticality', undefined];
  const expected = [heatColors[1], heatColors[4], null, heatColors[1], null, heatColors[4], null];
  assert.deepEqual(modes.map(mode => heatColor(record, mode)), expected);
  for (const mode of ['original', 'supplyRisk', 'businessImpact', '', null, 1, {}]) {
    assert.equal(heatColor(record, mode), null, `unsupported heat-map mode ${String(mode)}`);
  }
  for (const invalid of [null, undefined, {}, { cost: 0 }, { cost: 6 }, { cost: 1.5 }, { cost: NaN }, { cost: '3' }]) {
    assert.equal(heatColor(invalid, 'cost'), null, `invalid color input ${JSON.stringify(invalid)}`);
  }
  assert.equal(heatColor({ cost: 3 }, 'criticality'), null, 'missing selected metric restores material');
}

export function verifySupplyChain(parts) {
  assert.equal(expectedIds.length, 110, 'research roster must contain all 110 selections');
  assert.equal(new Set(expectedIds).size, 110, 'research roster has duplicate IDs');
  const actualIds = parts.map(part => part.id);
  assert.equal(new Set(actualIds).size, actualIds.length, 'model part IDs must be unique');
  assert.deepEqual([...actualIds].sort(), [...expectedIds].sort(), 'model and research scope have drifted');
  const sources = new Set();
  const families = new Set();
  const opportunities = [];
  for (const part of parts) {
    const record = supplyForPart(part);
    assert.ok(record && typeof record === 'object', `${part.id}: supply-chain record missing`);
    for (const field of textFields) text(record[field], `${part.id}.${field}`);
    for (const field of scoreFields) {
      assert.ok(Number.isInteger(record[field]) && record[field] >= 1 && record[field] <= 5,
        `${part.id}.${field}: must be an integer from 1 to 5`);
    }
    assert.equal(record.researchedOn, researchDate, `${part.id}: research date differs from evidence ledger`);
    assert.match(record.priceEvidence, /^Quote required\./, `${part.id}: unverified cost must remain explicitly quote-only`);
    for (const field of ['suppliers', 'limitations']) {
      assert.ok(Array.isArray(record[field]) && record[field].length, `${part.id}.${field}: missing entries`);
      for (const entry of record[field]) text(entry, `${part.id}.${field}`);
    }
    assert.ok(Array.isArray(record.references) && record.references.length, `${part.id}: missing evidence`);
    const recordSources = new Set();
    for (const reference of record.references) {
      text(reference.label, `${part.id}: reference label`);
      text(reference.scope, `${part.id}: reference applicability`);
      assert.notEqual(reference.scope, reference.label, `${part.id}: source title is not an applicability explanation`);
      const url = httpsUrl(reference.url, `${part.id}: reference URL`);
      assert.ok(!recordSources.has(url), `${part.id}: duplicate reference ${url}`);
      recordSources.add(url);
      sources.add(url);
    }
    families.add(record.family);
    assert.ok(Object.hasOwn(quadrants, quadrantFor(record)), `${part.id}: unknown Kraljic quadrant`);
    assert.equal(heatColor(record, 'cost'), heatColors[record.cost - 1], `${part.id}: cost color`);
    assert.equal(heatColor(record, 'criticality'), heatColors[record.criticality - 1], `${part.id}: criticality color`);
    if (isCostOpportunity(record)) opportunities.push(part.id);
  }

  const invalidIds = [
    '', 'unknown', 'toString', 'constructor', '__proto__', 'exhaust-diffuser',
    'inlet-casing-middle', 'compressor-casing-middle-upper',
    'compressor-casing-forward-middle', 'combustion-wrapper-middle',
    'turbine-shell-middle', 'exhaust-diffuser-middle',
    ...expectedIds.map(id => `${id}-extra`),
    ...[...families].filter(id => !expectedIds.includes(id)),
  ];
  for (const [prefix, max] of [
    ['compressor-rotor', 17], ['compressor-stator', 17],
    ['combustor', 14], ['combustor-liner', 14], ['transition', 14],
    ['turbine-wheel', 3], ['turbine-nozzle', 3], ['bearing', 3],
  ]) {
    for (const suffix of ['-1', '0', String(max + 1), '999', '01', '1.5', '1e0', '1x', ' 1', '1 ']) {
      invalidIds.push(`${prefix}-${suffix}`);
    }
  }
  for (const id of new Set(invalidIds)) {
    assert.equal(supplyForPart({ id }), null, `${id}: unknown selection must not receive family fallback data`);
  }
  for (const input of [undefined, null, {}, { id: undefined }, { id: null }, { id: 1 }, { id: false }]) {
    assert.equal(supplyForPart(input), null, 'missing/nonstring IDs must not receive research data');
  }
  assert.deepEqual(opportunities, [], 'ratings contradict the researched finding: no expensive/low-criticality selection');
  verifyDecisions();
  verifyHeatColors();
  console.log(`Supply-chain verification: ${parts.length} selections, ${families.size} families, ${sources.size} distinct scoped sources; no expensive/low-criticality match.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { buildAssembly } = await import('../src/model/assembly.js');
  verifySupplyChain(buildAssembly().parts);
}

import assert from 'node:assert/strict';
import { assemblyEducation, educationForPart, educationForSystem } from '../src/education/index.js';
import { manufacturingForPart, manufacturingOverview } from '../src/education/manufacturing.js';

export function verifyManufacturing(parts, systems) {
  const sources = new Set();
  const partIds = new Set(parts.map(part => part.id));
  function text(value, label) {
    assert.ok(typeof value === 'string' && value.trim(), label);
  }
  function record(notes, label) {
    assert.ok(notes, `${label}: manufacturing notes missing`);
    text(notes.scope, `${label}: evidence scope missing`);
    assert.ok(notes.route?.length >= 3, `${label}: incomplete production route`);
    assert.ok(notes.checks?.length >= 2, `${label}: incomplete quality checks`);
    assert.ok(notes.limitations?.length, `${label}: missing evidence limits`);
    for (const limit of notes.limitations) text(limit, `${label}: empty limitation`);
    for (const field of ['route', 'checks']) {
      for (const entry of notes[field]) {
        text(entry.title, `${label}: missing ${field} title`);
        text(entry.text, `${label}: missing ${entry.title} text`);
        assert.ok(entry.sources?.length, `${label}: uncited ${entry.title}`);
        assert.equal(new Set(entry.sources).size, entry.sources.length, `${label}: duplicate citation`);
        for (const key of entry.sources) {
          const reference = notes.references[key];
          assert.ok(reference, `${label}: unresolved citation ${key}`);
          text(reference.label, `${label}: missing source label`);
          const url = new URL(reference.url);
          assert.equal(url.protocol, 'https:', `${label}: insecure reference`);
          url.hash = '';
          sources.add(url.href);
        }
      }
    }
  }
  function overview(notes, label) {
    assert.ok(notes?.families?.length, `${label}: missing manufacturing overview`);
    text(notes.scope, `${label}: overview scope missing`);
    for (const family of notes.families) {
      text(family.title, `${label}: unnamed manufacturing family`);
      assert.ok(partIds.has(family.partId), `${label}: nonexistent representative ${family.partId}`);
      if (label !== 'assembly') assert.equal(parts.find(part => part.id === family.partId).system, label);
      record(family.record, `${label}/${family.partId}`);
    }
  }
  for (const part of parts) record(educationForPart(part).manufacturing, part.id);
  for (const system of systems) overview(educationForSystem(system.id).manufacturing, system.id);
  overview(assemblyEducation.manufacturing, 'assembly');
  for (const id of ['unrecognized', 'compressor-rotor-0', 'compressor-rotor-18', 'turbine-wheel-4', 'combustor-15', 'bearing-4']) {
    assert.equal(manufacturingForPart({ id, system: 'unknown' }), null, `${id}: must not receive invented coverage`);
  }
  assert.equal(manufacturingOverview('unknown'), null);
  console.log(`Manufacturing coverage: ${parts.length} components, ${systems.length} systems, ${sources.size} distinct cited sources.`);
}

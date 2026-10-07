import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildAssembly, systems } from '../src/model/assembly.js';
import { assemblyEducation, educationForPart, educationForSystem } from '../src/education/index.js';
import './verify-channels.mjs';
import './verify-section-caps.mjs';
import {verifyAssembledMaterialVoids} from './verify-topology.mjs';
import {verifyHotSection} from './verify-hot-section.mjs';
import {verifyMechanics} from './verify-mechanics.mjs';
import {verifyCompressor} from './verify-compressor.mjs';
import {verifyCombustion} from './verify-combustion.mjs';
import {verifyExhaust} from './verify-exhaust.mjs';
import {verifyWallBoundaries} from './verify-wall-boundaries.mjs';
import { verifyManufacturing } from './verify-manufacturing.mjs';
import { verifySupplyChain } from './verify-supply-chain.mjs';

const model = buildAssembly();
const byId = new Map(model.parts.map(part => [part.id, part]));
const knownSystems = new Set(systems.map(system => system.id));
verifyManufacturing(model.parts, systems);
verifySupplyChain(model.parts);
verifyHotSection(model);
verifyMechanics(model);
verifyCompressor(model);
verifyCombustion(model);
verifyExhaust(model);
verifyWallBoundaries(model);
verifyAssembledMaterialVoids(model);
const geometries = new Set();
let meshCount = 0;
let instanceCount = 0;

function assertLesson(lesson, label) {
  assert.ok(lesson, `${label}: educational content missing`);
  for (const field of ['summary', 'keyIdea']) assert.ok(typeof lesson[field] === 'string' && lesson[field].trim(), `${label}: missing ${field}`);
  for (const field of ['operation', 'design', 'watch']) {
    assert.ok(Array.isArray(lesson[field]) && lesson[field].length, `${label}: missing ${field} section`);
    assert.ok(lesson[field].every(text => typeof text === 'string' && text.trim()), `${label}: empty ${field} entry`);
  }
  assert.ok(lesson.references.length, `${label}: missing educational references`);
  for (const reference of lesson.references) {
    assert.ok(reference.label, `${label}: missing reference label`);
    assert.equal(new URL(reference.url).protocol, 'https:', `${label}: reference must use HTTPS`);
  }
}

assertLesson(assemblyEducation, 'Complete assembly');
for (const part of model.parts) assertLesson(educationForPart(part), part.id);
for (const system of systems) {
  const lesson = educationForSystem(system.id, model.parts);
  assert.notEqual(lesson, assemblyEducation, `${system.id}: needs its own assembly overview`);
  assertLesson(lesson, system.id);
}
assert.equal(educationForPart({ id: 'unrecognized', system: 'unknown' }), null, 'Unknown components must not masquerade as part-specific lessons');
console.log(`Educational coverage: ${model.parts.length} parts, ${systems.length} systems and complete assembly.`);

function finite(values, label) {
  for (const value of values) assert.ok(Number.isFinite(value), `${label}: nonfinite value`);
}

function namedPart(id) {
  assert.ok(byId.has(id), `Missing selectable part: ${id}`);
  return byId.get(id);
}

// Airfoil rows are instanced closed custom meshes; fasteners use primitive geometry.
function airfoilRows(part) {
  const rows = [];
  part.group.traverse(object => {
    if (object.isInstancedMesh && (object.geometry.userData.airfoil || object.userData.csgAirfoil)) {
      object.geometry.computeBoundingBox();
      rows.push(object);
    }
  });
  return rows;
}

function assertAirfoilTriangles(part, row) {
  const positions = row.geometry.getAttribute('position');
  const normals = row.geometry.getAttribute('normal');
  const indices = row.geometry.index;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3();
  const edges = new Map();
  const bounds = row.geometry.boundingBox;
  let rootCaps = 0, tipCaps = 0;
  const cooled=Boolean(row.userData.csgAirfoil);
  if(!cooled) assert.ok(indices, `${part.id}: parametric airfoil must be indexed`);
  const count=indices?.count ?? positions.count;
  for (let i = 0; i < count; i += 3) {
    const face = indices ? [indices.getX(i), indices.getX(i + 1), indices.getX(i + 2)] : [i,i+1,i+2];
    a.fromBufferAttribute(positions, face[0]);
    b.fromBufferAttribute(positions, face[1]);
    c.fromBufferAttribute(positions, face[2]);
    const faceNormal = ab.subVectors(b, a).cross(ac.subVectors(c, a));
    assert.ok(faceNormal.lengthSq() > 1e-22, `${part.id}: collapsed airfoil triangle ${i / 3} would produce an invalid STL facet`);
    if (a.y === b.y && b.y === c.y) {
      if (a.y === bounds.min.y) {
        rootCaps++;
        assert.ok(faceNormal.y < 0, `${part.id}: root cap triangle faces into the blade`);
      } else if (a.y === bounds.max.y) {
        tipCaps++;
        assert.ok(faceNormal.y > 0, `${part.id}: tip cap triangle faces into the blade`);
      }
    }
    for (let side = 0; side < 3; side++) {
      const from = face[side], to = face[(side + 1) % 3];
      const key = `${Math.min(from, to)}:${Math.max(from, to)}`;
      const edge = edges.get(key) || {count: 0, direction: 0};
      edge.count++;
      edge.direction += from < to ? 1 : -1;
      edges.set(key, edge);
    }
  }
  assert.ok(rootCaps > 0 && tipCaps > 0, `${part.id}: airfoil ends must be capped`);
  if(!cooled) for (const edge of edges.values()) assert.ok(edge.count === 2 && edge.direction === 0, `${part.id}: airfoil has an open or inconsistently wound edge`);
  assert.ok(normals && normals.count === positions.count, `${part.id}: airfoil normals missing`);
  for (let i = 0; i < normals.count; i++) {
    const length = a.fromBufferAttribute(normals, i).length();
    assert.ok(Math.abs(length - 1) < 0.001, `${part.id}: airfoil vertex ${i} has an unusable normal`);
  }
}

function numberedParts(prefix) {
  return model.parts
    .filter(part => new RegExp(`^${prefix}-[0-9]+$`).test(part.id))
    .sort((a, b) => Number(a.id.split('-').at(-1)) - Number(b.id.split('-').at(-1)));
}

function assertSeries(prefix, expected, system) {
  const parts = numberedParts(prefix);
  assert.equal(parts.length, expected, `${prefix}: component count`);
  parts.forEach((part, index) => {
    assert.equal(part.id, `${prefix}-${index + 1}`, `${prefix}: missing or repeated stage`);
    assert.equal(part.system, system, `${part.id}: incorrect subsystem`);
  });
  return parts;
}

assert.ok(model.root.isGroup, 'Assembly must have a Three.js root group');
assert.equal(byId.size, model.parts.length, 'Selectable part IDs must be unique');
assert.equal(model.root.children.length, model.parts.length, 'Every root assembly must be selectable');
assert.equal(new Set(model.rotors).size, model.rotors.length, 'Rotor animation list has duplicate groups');

for (const part of model.parts) {
  assert.ok(part.id && part.name && part.description, 'Part identification and description are required');
  assert.ok(knownSystems.has(part.system), `${part.id}: unknown subsystem`);
  assert.equal(part.group.parent, model.root, `${part.id}: part detached from assembly`);
  assert.equal(part.group.userData.partId, part.id, `${part.id}: picking identity mismatch`);
  finite(part.origin.toArray(), `${part.id} origin`);
  finite(part.offset.toArray(), `${part.id} explosion offset`);
  part.group.traverse(object => {
    finite(object.matrixWorld.elements, `${part.id} transform`);
    if (!object.isMesh) return;
    meshCount++;
    instanceCount += object.isInstancedMesh ? object.count : 1;
    assert.equal(object.userData.partId, part.id, `${part.id}: mesh missing picking identity`);
    if (object.isInstancedMesh) {
      assert.ok(object.count > 0, `${part.id}: empty instanced mesh`);
      finite(object.instanceMatrix.array, `${part.id} instance transform`);
    }
    geometries.add(object.geometry);
  });
}

for (const geometry of geometries) {
  const positions = geometry.getAttribute('position');
  assert.ok(positions && positions.count > 0, 'Mesh has no vertices');
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    finite(attribute.array, `${geometry.type} ${name}`);
  }
  if (geometry.index) {
    assert.equal(geometry.index.count % 3, 0, 'Incomplete indexed triangle');
    for (const index of geometry.index.array) assert.ok(index >= 0 && index < positions.count, 'Triangle index outside vertex buffer');
  }
  geometry.computeBoundingBox();
  finite(geometry.boundingBox.min.toArray(), 'Mesh lower bounds');
  finite(geometry.boundingBox.max.toArray(), 'Mesh upper bounds');
  assert.ok(geometry.boundingBox.getSize(new THREE.Vector3()).length() > 0, 'Zero-size geometry');
}

const compressorRotors = assertSeries('compressor-rotor', 17, 'compressor');
const compressorStators = assertSeries('compressor-stator', 17, 'compressor');
const turbineWheels = assertSeries('turbine-wheel', 3, 'turbine');
const combustors = assertSeries('combustor', 14, 'combustion');
const liners = assertSeries('combustor-liner', 14, 'combustion');
const transitions = assertSeries('transition', 14, 'combustion');
assertSeries('bearing', 3, 'bearings');

for (const part of model.parts) for (const row of airfoilRows(part)) assertAirfoilTriangles(part, row);

for (const [parts, expectedRowCount] of [[compressorRotors, 1], [compressorStators, 1], [turbineWheels, 1]]) {
  let lastX = -Infinity;
  for (const part of parts) {
    const rows = airfoilRows(part);
    assert.equal(rows.length, expectedRowCount, `${part.id}: airfoil row missing or duplicated`);
    const transform = new THREE.Matrix4();
    rows[0].getMatrixAt(0, transform);
    const x = new THREE.Vector3().setFromMatrixPosition(transform).x + rows[0].position.x;
    assert.ok(x > lastX, `${part.id}: rows must progress downstream`);
    lastX = x;
  }
}

const igvs = airfoilRows(namedPart('inlet-guide-vanes'));
assert.equal(igvs.length, 1, 'IGVs must contain one airfoil row');
assert.equal(igvs[0].count, 64, 'Video: 64 variable inlet guide vanes');
assert.equal(airfoilRows(namedPart('compressor-exit-guides')).length, 2, 'Video: two exit-guide-vane rows');
for (const wheel of turbineWheels) assert.equal(airfoilRows(wheel)[0].count, 92, `${wheel.id}: video specifies 92 buckets`);
for (const [index, expected] of [36, 48, 64].entries()) {
  assert.equal(airfoilRows(namedPart(`turbine-nozzle-${index + 1}`))[0].count, expected, `Turbine nozzle ${index + 1} vane count`);
}
assert.equal(airfoilRows(namedPart('exhaust-frame-struts'))[0].count, 10, 'Video: ten exhaust-frame struts');

for (const rotor of model.rotors) assert.equal(rotor.userData.kind, 'rotor', `${rotor.name}: stationary group marked for rotation`);
for (const part of [...compressorRotors, ...turbineWheels]) assert.ok(model.rotors.includes(part.group), `${part.id}: rotor is not animated`);
for (const part of [...compressorStators, ...combustors, ...liners, ...transitions]) assert.ok(!model.rotors.includes(part.group), `${part.id}: stationary part rotates`);

const assembled = new THREE.Box3().setFromObject(model.root);
const assembledSize = assembled.getSize(new THREE.Vector3());
assert.ok(assembledSize.x > 10 && assembledSize.x < 13, 'Assembled axial envelope must remain in reconstructed metre scale');
assert.ok(assembledSize.y > 3 && assembledSize.y < 6, 'Assembled height outside expected reconstruction envelope');
assert.ok(assembledSize.z > 3 && assembledSize.z < 6, 'Assembled width outside expected reconstruction envelope');

// Exercise the same documented part-origin/offset contract used by the viewer.
for (const part of model.parts) part.group.position.copy(part.origin).add(part.offset);
model.root.updateMatrixWorld(true);
const exploded = new THREE.Box3().setFromObject(model.root);
const explodedSize = exploded.getSize(new THREE.Vector3());
finite([...exploded.min.toArray(), ...exploded.max.toArray()], 'Exploded bounds');
assert.ok(explodedSize.x > assembledSize.x + 1, 'Exploded assembly does not separate axially');
assert.ok(explodedSize.y > assembledSize.y + 1, 'Exploded assembly does not lift the casing halves');
for (const part of model.parts) part.group.position.copy(part.origin);
model.root.updateMatrixWorld(true);
const restored = new THREE.Box3().setFromObject(model.root);
assert.ok(restored.min.distanceTo(assembled.min) < 1e-8 && restored.max.distanceTo(assembled.max) < 1e-8, 'Assembly cannot be restored after explosion');

const firstCompressorRow = airfoilRows(compressorRotors[0])[0];
const tipRadius = firstCompressorRow.geometry.boundingBox.max.y;
assert.ok(Math.abs(tipRadius - 1.08075) < 0.0001, 'GE GER3434D compressor tip diameter reference drifted');

function dimensions(box) {
  return box.getSize(new THREE.Vector3()).toArray().map(number => Number(number.toFixed(3)));
}

console.log(`Model verification passed: ${model.parts.length} selectable parts, ${model.rotors.length} rotating groups, ${meshCount} mesh objects, ${instanceCount} rendered mesh instances.`);
console.log('Verified source counts: 17 compressor rotor/stator rows, 64 IGVs, 2 EGV rows, 14 combustors/liners/transitions, 3 x 92 turbine buckets, 36/48/64 nozzle vanes, 3 bearings, 10 exhaust struts.');
console.log(`Bounds in metres [length, height, width]: assembled ${JSON.stringify(dimensions(assembled))}; exploded ${JSON.stringify(dimensions(exploded))}.`);

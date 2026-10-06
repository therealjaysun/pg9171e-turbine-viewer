import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createSectionCaps} from '../src/section-caps.js';
import {hollowRod, material} from '../src/model/helpers.js';

const root = new THREE.Group();
const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const parts = [];
function part(id, system = 'test') {
  const group = new THREE.Group();
  root.add(group);
  const record = {id, name: id, system, kind: 'casing', group};
  parts.push(record);
  return group;
}

const annulus = part('annulus');
hollowRod(annulus, [-1, 0, 0], [1, 0, 0], 1, 0.6, material(0x999999), 64);
const support = part('support', 'supports');
support.add(new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), material(0xff0000)));
const instancedPart = part('instances');
const nested = new THREE.Group();
instancedPart.add(nested);
const instances = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), material(0x888888), 3);
nested.add(instances);
const matrix = new THREE.Matrix4();
instances.setMatrixAt(0, matrix.makeTranslation(0, 2, 0));
instances.setMatrixAt(1, matrix.makeTranslation(3, 2, 0));
instances.setMatrixAt(2, matrix.makeTranslation(-3, 2, 0));
instances.instanceMatrix.needsUpdate = true;
root.updateMatrixWorld(true);
const sourceMaterial = instances.material;
const sourceMatrices = instances.instanceMatrix.array.slice();
const caps = createSectionCaps({parts, plane});
function update(options) {root.updateMatrixWorld(true);caps.update(options);}
function pickAt(y, z, x = 4) {
  return caps.pick(new THREE.Raycaster(new THREE.Vector3(x, y, z), new THREE.Vector3(-1, 0, 0)));
}
update();
assert.equal(caps.diagnostics().activeParts, 2);
assert.equal(caps.diagnostics().activeInstances, 2, 'Only crossing instances should reach the stencil buffer');
assert.equal(caps.group.parent, null, 'Helpers must not be added to source/export hierarchy');
assert.equal(pickAt(0.8, 0)?.object.userData.partId, 'annulus');
assert.equal(pickAt(0, 0), null, 'The bore must remain unpickable');
assert.equal(pickAt(1.2, 0), null, 'The cap bounding rectangle must not be pickable');
assert.equal(pickAt(2, 0)?.object.userData.partId, 'instances');
assert.equal(instances.material, sourceMaterial);
assert.deepEqual(instances.instanceMatrix.array, sourceMatrices, 'Culling must not alter source instances');
assert.ok(caps.group.children.filter(object => object.userData.isSectionCap).every(cap => cap.material.transparent === false));
assert.ok(caps.group.children.filter(object => object.isInstancedMesh).every(proxy => proxy.count === 1));

instancedPart.visible = false;
update();
plane.constant = -3;
update();
instancedPart.visible = true;
update();
assert.equal(pickAt(2, 0)?.object.userData.partId, 'instances', 'Showing a part after a hidden plane change must rebuild its crossing instances');
plane.constant = 0;
update();

const pass = caps.group.children.filter(object => object.visible).sort((a, b) => a.renderOrder - b.renderOrder);
let stencilStarted = false, clearCount = 0;
for (const object of pass) {
  if (object.userData.isSectionCap) {
    assert.ok(stencilStarted, 'A cap requires preceding stencil passes');
    object.onAfterRender({clearStencil: () => clearCount++});
    stencilStarted = false;
  } else stencilStarted = true;
}
assert.equal(clearCount, 2, 'Each part must clear stencil before the next part');

for (const normal of [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)]) {
  plane.normal.copy(normal);
  update();
  assert.equal(pickAt(0, 0), null);
  assert.equal(pickAt(0.8, 0)?.object.userData.partId, 'annulus');
}
annulus.scale.x = -1;
update();
assert.equal(pickAt(0, 0), null, 'Mirroring cannot fill the bore');
assert.equal(pickAt(0.8, 0)?.object.userData.partId, 'annulus');

nested.rotation.z = Math.PI / 2;
update();
assert.equal(caps.diagnostics().activeInstances, 1, 'Nested rotor rotation updates instance culling');
nested.rotation.z = 0;
instancedPart.position.x = 3;
update();
assert.equal(pickAt(2, 0)?.object.userData.partId, 'instances', 'Exploded parent transforms must reach filtered instances');
instancedPart.visible = false;
update();
assert.equal(pickAt(2, 0), null, 'Hidden parts cannot be picked');

update({style: 'xray'});
const annulusCap = caps.group.children.find(object => object.userData.partId === 'annulus');
assert.equal(annulusCap.material.transparent, false, 'Xray cap must remain interleaved with its stencil passes');
assert.equal(annulusCap.material.blending, THREE.CustomBlending);
assert.equal(annulusCap.material.depthWrite, false);
update({style: 'cad', selected: 'annulus'});
assert.equal(annulusCap.material.blending, THREE.NoBlending);
assert.equal(annulusCap.material.depthWrite, true);
assert.ok(annulusCap.material.emissive.getHex() !== 0);
update({style: 'wire'});
assert.equal(caps.group.visible, false);
assert.equal(pickAt(0.8, 0), null);
update({enabled: false});
assert.equal(pickAt(0.8, 0), null);

update();
plane.constant = 10;
update();
assert.equal(caps.diagnostics().activeParts, 0, 'An outside section plane must not draw or pick caps');
assert.equal(pickAt(0.8, 0), null);
caps.dispose();
assert.equal(caps.group.children.length, 0);
assert.equal(instances.geometry.attributes.position.count, 24, 'Disposing helpers must preserve model geometry');
console.log('Section caps: bounded winding passes, cavity-aware picking, instance culling, transforms, styles and visibility verified.');

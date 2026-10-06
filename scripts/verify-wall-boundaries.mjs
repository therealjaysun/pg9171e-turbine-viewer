import assert from 'node:assert/strict';
import * as THREE from 'three';
import {piercedSleeve} from '../src/model/hot-channels.js';
import {auditGeometry} from './audit-topology.mjs';

export function verifyWallBoundaries(model) {
  const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
  const sleeve = piercedSleeve(new THREE.Group(), {x0: 0, x1: 1, radius: .287, thickness: .018,
    holes: [{x: .35, angle: 1, bore: .03}], material});
  const fixture = auditGeometry(sleeve.geometry);
  assert.ok(fixture.closed, 'A rolled pierced sleeve must not retain internal developed-edge seam walls');
  assert.equal(fixture.duplicateTriangles, 0, 'A rolled sleeve must not contain coincident seam faces');
  assert.ok(fixture.signedVolume > 0, 'Pierced sleeve material must face outward');
  const ray = new THREE.Raycaster(), direction = new THREE.Vector3(0, -Math.cos(1), -Math.sin(1));
  sleeve.updateMatrixWorld(true);
  ray.set(new THREE.Vector3(.35, .32 * Math.cos(1), .32 * Math.sin(1)), direction);
  ray.near = 0; ray.far = .07;
  assert.equal(ray.intersectObject(sleeve).length, 0, 'Rolled sleeve repair must preserve the real port');
  ray.ray.origin.x = .50;
  assert.ok(ray.intersectObject(sleeve).length >= 2, 'Port probe must be bounded by intact inner and outer material skins');
  ray.set(new THREE.Vector3(-.1, 0, 0), new THREE.Vector3(1, 0, 0)); ray.far = 1.2;
  assert.equal(ray.intersectObject(sleeve).length, 0, 'Rolled sleeve repair must not fill the axial flow cavity');
  sleeve.geometry.dispose(); material.dispose();

  const corrected = new Set(['inlet-casing-upper', 'inlet-casing-lower', 'combustor-1', 'combustor-liner-1',
    'transition-1', 'exhaust-diffuser-upper', 'exhaust-diffuser-lower', 'exhaust-turning-vanes']);
  let checked = 0;
  for (const part of model.parts.filter(part => corrected.has(part.id))) {
    part.group.traverse(object => {
      if (!object.isMesh) return;
      const result = auditGeometry(object.geometry);
      assert.ok(result.closed, `${part.id}/${object.name}: repaired material boundary is not closed and consistently wound`);
      assert.ok(result.signedVolume > 0, `${part.id}/${object.name}: material surface winding is inverted`);
      assert.equal(result.duplicateTriangles, 0, `${part.id}/${object.name}: duplicate boundary faces`);
      checked++;
    });
  }
  assert.ok(checked > 0, 'Corrected material-boundary meshes must exist');
  console.log(`Material boundary regressions verified: ${checked} representative meshes plus a pierced-sleeve bore/skin fixture.`);
}

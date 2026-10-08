import assert from 'node:assert/strict';
import * as THREE from 'three';

// Probe the generated material, including both sides of repeated-part seams.
export function verifyHotHardware(model) {
  const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
  const ray = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0.173, 0.067, 1).normalize(), 1e-7);
  let probes = 0;
  function inside(geometry, point, angle = 0) {
    const proxy = new THREE.Mesh(geometry, material);
    proxy.rotation.x = angle; proxy.updateMatrixWorld(true);
    ray.ray.origin.copy(point);
    const hits = ray.intersectObject(proxy);
    const distances = hits.map(hit => hit.distance).filter((d, i, all) => i === 0 || d - all[i - 1] > 1e-6);
    return distances.length % 2 === 1;
  }
  function check(geometry, point, expected, label, angle = 0) {
    assert.equal(inside(geometry, new THREE.Vector3(...point), angle), expected, label); probes++;
  }
  function rows(id, predicate) {
    const result = [];
    model.parts.find(part => part.id === id).group.traverse(object => {
      if (object.isInstancedMesh && predicate(object.geometry.userData)) result.push(object);
    });
    return result;
  }
  try {
    for (const stage of [1, 2, 3]) {
      const id = `turbine-wheel-${stage}`, root = [0.755, 0.745, 0.725][stage - 1];
      const halfPitch = root * Math.sin(Math.PI / 92);
      const faces = rows(id, data => data.attachmentFace);
      assert.equal(faces.length, 2, `${id}: both attachment ends exist`);
      for (const face of faces) {
        assert.equal(face.count, 92, `${id}: attachments repeat with every bucket`);
        const x = face.geometry.userData.attachmentFace.face * 0.125;
        check(face.geometry, [x, root - 0.04, 0], true, `${id}: shank retains metal`);
        check(face.geometry, [x, root - 0.04, halfPitch * 0.7], false, `${id}: recess beside shank stays open`);
        check(face.geometry, [x, root - 0.096, halfPitch * 0.70], true, `${id}: root tang retains metal`);
        check(face.geometry, [x, root - 0.107, halfPitch * 0.70], false, `${id}: root tang relief stays open`);
        assert.equal(face.geometry.userData.attachmentFace.fullDepthSocket, false, 'Partial attachment detail must remain explicit');
      }
      const platforms = rows(id, data => data.bucketBand === 'bucket-platform');
      assert.equal(platforms.length, 1); assert.equal(platforms[0].count, 92);
      const r = root + 0.003, angle = Math.PI / 92;
      const seam = [0, r * Math.cos(angle), r * Math.sin(angle)];
      check(platforms[0].geometry, seam, false, `${id}: platform seam is not filled`);
      check(platforms[0].geometry, seam, false, `${id}: neighbor does not fill platform seam`, 2 * angle);
      check(platforms[0].geometry, [-0.08, r, 0], true, `${id}: adjacent platform retains metal`);
    }
    for (const stage of [1, 2, 3]) {
      const id = `turbine-nozzle-${stage}`, count = stage === 1 ? 18 : 16;
      const inner = rows(id, data => data.nozzleInnerPlatform);
      assert.equal(inner.length, 1); assert.equal(inner[0].count, count);
      const r = [0.753, 0.743, 0.723][stage - 1] - 0.015, angle = Math.PI / count;
      check(inner[0].geometry, [0, r * Math.cos(angle), r * Math.sin(angle)], true, `${id}: inner platform retains metal`);
      check(inner[0].geometry, [0, r, 0], false, `${id}: inner platform split remains open`);
      check(inner[0].geometry, [0, r, 0], false, `${id}: neighbor preserves inner platform split`, -2 * angle);
      if (stage === 3) continue;
      const outer = rows(id, data => data.nozzlePlatform)[0];
      const tip = stage === 1 ? 1.111 : 1.231;
      for (const x of [-0.110, 0.175]) {
        check(outer.geometry, [x, (tip + 0.084) * Math.cos(angle), (tip + 0.084) * Math.sin(angle)], true,
          `${id}: mounting rail has a retaining lip`);
        check(outer.geometry, [x, (tip + 0.070) * Math.cos(angle), (tip + 0.070) * Math.sin(angle)], false,
          `${id}: mounting rail undercut remains open`);
      }
      for (const cover of rows(id, data => data.impingementCover)) {
        cover.geometry.computeBoundingBox();
        assert.ok(cover.geometry.boundingBox.min.x > -0.100 && cover.geometry.boundingBox.max.x < 0.165,
          `${id}: impingement cover must fit between mounting rails`);
      }
    }
  } finally { material.dispose(); }
  console.log(`Hot-section hardware: ${probes} material/void probes verify attachment tangs, shanks, platform seams and mounting-rail undercuts.`);
}

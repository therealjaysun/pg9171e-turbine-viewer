import assert from 'node:assert/strict';
import * as THREE from 'three';

export function verifyHotSection(model) {
  const byId = new Map(model.parts.map(part => [part.id, part]));
  const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
  const direction = new THREE.Vector3(0.173, 0.067, 1).normalize();
  let passageSamples = 0;
  let minimumAxialGap = Infinity;

  function inside(mesh, point) {
    const hits = new THREE.Raycaster(new THREE.Vector3(...point), direction, 1e-7).intersectObject(mesh);
    const distances = hits.map(hit => hit.distance).filter((value, i, all) => i === 0 || value - all[i - 1] > 1e-6);
    return distances.length % 2 === 1;
  }

  function rowFor(id) {
    let row;
    byId.get(id).group.traverse(object => {
      if (object.isInstancedMesh && (object.geometry.userData.airfoil || object.userData.csgAirfoil)) row = object;
    });
    assert.ok(row, `${id}: missing airfoil row`);
    return row;
  }

  function rowBounds(row) {
    row.geometry.computeBoundingBox();
    const transform = new THREE.Matrix4();
    row.getMatrixAt(0, transform);
    transform.premultiply(row.matrixWorld);
    return row.geometry.boundingBox.clone().applyMatrix4(transform);
  }

  model.root.updateMatrixWorld(true);
  for (const stage of [1, 2, 3]) {
    const rotor = rowFor(`turbine-wheel-${stage}`);
    const nozzle = rowFor(`turbine-nozzle-${stage}`);
    const gap = rowBounds(rotor).min.x - rowBounds(nozzle).max.x;
    assert.ok(gap > 0.02, `Turbine stage ${stage}: nozzle and bucket rows interfere (${gap})`);
    minimumAxialGap = Math.min(minimumAxialGap, gap);
    for (const row of [rotor, nozzle]) {
      const paths = row.geometry.userData.coolingPaths;
      assert.equal(paths?.length ?? 0, stage < 3 ? 3 : 0, `Turbine stage ${stage}: cooling passage count`);
      if (!paths) continue;
      const probe = new THREE.Mesh(row.geometry, material);
      probe.updateMatrixWorld(true);
      for (const path of paths) {
        for (const point of path.points.slice(1, -1)) {
          assert.equal(inside(probe, point), false, `Turbine stage ${stage}: cooling channel is filled`);
          const wallPoint = [point[0] + path.radius * 1.7, point[1], point[2]];
          assert.equal(inside(probe, wallPoint), true, `Turbine stage ${stage}: cooling channel lacks its surrounding wall`);
          passageSamples++;
        }
      }
    }
    const clearance = byId.get(`turbine-wheel-${stage}`).group.userData.clearances;
    assert.ok(clearance.stationaryShroudInnerRadius - clearance.tipSealOuterRadius >= 0.0079,
      `Turbine stage ${stage}: stationary shroud rubs rotating tip seal`);
  }

  for (let number = 1; number <= 14; number++) {
    const liner = byId.get(`combustor-liner-${number}`).group.userData.channels;
    assert.equal(liner.dilutionBores, 3);
    assert.equal(liner.capAirPassages, 7);
    const transition = byId.get(`transition-${number}`).group.userData.channels;
    assert.ok(transition.inletInnerRadius - transition.linerOuterRadius >= 0.0029,
      `Transition ${number}: liner slip joint interferes`);
    assert.ok(transition.outletOuterRadius > transition.outletInnerRadius,
      `Transition ${number}: reversed outlet annulus`);
  }
  material.dispose();
  console.log(`Hot-section checks: ${passageSamples} actual cooling-bore/wall probes; minimum nozzle/bucket axial gap ${(minimumAxialGap * 1000).toFixed(2)} mm.`);
}

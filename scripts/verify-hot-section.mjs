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
    const wheel = byId.get(`turbine-wheel-${stage}`).group;
    assert.equal(wheel.userData.coolingFeedPaths?.length ?? 0, stage < 3 ? 6 : 0,
      `Turbine stage ${stage}: inferred wheel-to-root feeds`);
    const collectors = [];
    wheel.traverse(object => {
      if (object.geometry?.userData.rootCollector) collectors.push(object);
    });
    assert.equal(collectors.length, stage < 3 ? 1 : 0, `Turbine stage ${stage}: cooled root collector`);
    if (collectors.length) {
      assert.equal(collectors[0].count, rotor.count, `Turbine stage ${stage}: root collector pitch must match buckets`);
      assert.equal(collectors[0].geometry.userData.rootCollector.individualBucketPlenumsSimplified, true,
        `Turbine stage ${stage}: simplified root architecture must remain identified`);
      assert.match(rotor.geometry.userData.coolingReference, /replacement.*not exact/i,
        `Turbine stage ${stage}: replacement-reference pattern must not claim OEM dimensional fidelity`);
    }
    const gap = rowBounds(rotor).min.x - rowBounds(nozzle).max.x;
    assert.ok(gap > 0.02, `Turbine stage ${stage}: nozzle and bucket rows interfere (${gap})`);
    minimumAxialGap = Math.min(minimumAxialGap, gap);
    for (const row of [rotor, nozzle]) {
      const paths = row.geometry.userData.coolingPaths;
      assert.equal(paths?.length ?? 0, row === rotor ? [0, 11, 6, 0][stage] : 0, `Turbine stage ${stage}: bucket cooling passage count`);
      if (!paths) continue;
      const probe = new THREE.Mesh(row.geometry, material);
      probe.updateMatrixWorld(true);
      for (const path of paths) {
        for (let sample = 1; sample < path.points.length - 1; sample++) {
          const point = path.points[sample];
          assert.equal(inside(probe, point), false, `Turbine stage ${stage}: cooling channel is filled`);
          const wallPoint = path.wallPoints[sample];
          assert.equal(inside(probe, wallPoint), true, `Turbine stage ${stage}: cooling channel lacks its surrounding wall`);
          passageSamples++;
        }
      }
    }
    const nozzleData = nozzle.geometry.userData;
    assert.equal(Boolean(nozzleData.nozzleCavity), stage < 3, `Turbine stage ${stage}: nozzle cooling topology`);
    if (nozzleData.nozzleCavity) {
      const probe = new THREE.Mesh(nozzle.geometry, material); probe.updateMatrixWorld(true);
      for (const sample of nozzleData.cavitySamples) {
        assert.equal(inside(probe, sample.center), false, `Nozzle ${stage}: hollow partition is filled`);
        assert.equal(inside(probe, sample.wall), true, `Nozzle ${stage}: hollow partition breaks through its wall`);
        passageSamples++;
      }
      assert.equal(nozzleData.trailingPorts.length, 11);
      for (const points of nozzleData.trailingPorts) for (const point of points.slice(1, -1)) {
        assert.equal(inside(probe, point), false, `Nozzle ${stage}: trailing-edge port is plugged`);
        passageSamples++;
      }
      let platforms = 0, covers = 0;
      const supplyMeshes = [];
      let supplyPaths;
      byId.get(`turbine-nozzle-${stage}`).group.traverse(object => {
        const platform = object.geometry?.userData.nozzlePlatform;
        const cover = object.geometry?.userData.impingementCover;
        if (!platform && !cover) return;
        const local = new THREE.Mesh(object.geometry, material); local.updateMatrixWorld(true);
        supplyMeshes.push(local);
        if (platform) {
          platforms++;
          supplyPaths = platform.feedPaths;
          for (const point of platform.openings) {
            assert.equal(inside(local, point), false, `Nozzle ${stage}: outer platform plugs its hollow partition`);
            passageSamples++;
          }
          assert.equal(inside(local, platform.wall), true, `Nozzle ${stage}: platform wall missing`);
        }
        if (cover) {
          covers++;
          for (const point of cover.holeCenters) {
            assert.equal(inside(local, point), false, `Nozzle ${stage}: impingement cover port is plugged`);
            passageSamples++;
          }
        }
      });
      assert.equal(platforms, 1, `Nozzle ${stage}: missing segmented outer platform`);
      assert.equal(covers, stage === 1 ? 1 : 0, `Nozzle ${stage}: impingement cover configuration`);
      for (const path of supplyPaths) for (const point of path.points) {
        for (const surface of supplyMeshes) assert.equal(inside(surface, point), false,
          `Nozzle ${stage}: cover-to-platform feed interface is obstructed`);
        const bladeLocal = new THREE.Vector3(...point).applyAxisAngle(new THREE.Vector3(1, 0, 0), -path.angle).toArray();
        assert.equal(inside(probe, bladeLocal), false, `Nozzle ${stage}: platform-to-airfoil cavity interface is obstructed`);
        passageSamples++;
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

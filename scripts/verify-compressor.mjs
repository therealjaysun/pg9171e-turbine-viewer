import assert from 'node:assert/strict';
import * as THREE from 'three';

const TAU = Math.PI * 2;

function tagged(model, role) {
  const result = [];
  for (const part of model.parts) part.group.traverse(object => {
    if (object.userData.auditRole === role) result.push({part, object});
  });
  return result;
}

function rowVertices(object) {
  const points = [], matrix = new THREE.Matrix4(), point = new THREE.Vector3();
  const positions = object.geometry.attributes.position;
  for (let i = 0; i < object.count; i++) {
    object.getMatrixAt(i, matrix);
    matrix.premultiply(object.matrixWorld);
    for (let j = 0; j < positions.count; j++) {
      points.push(point.fromBufferAttribute(positions, j).applyMatrix4(matrix).clone());
    }
  }
  return points;
}

// Intersect the actual revolved wall profile at X, including carrier/bleed grooves.
function profileBoreAt(profile, x) {
  let radius = Infinity;
  for (let i = 0; i < profile.length - 1; i++) {
    const [x0, r0] = profile[i], [x1, r1] = profile[i + 1];
    if (Math.abs(x1 - x0) < 1e-10 || x < Math.min(x0, x1) || x > Math.max(x0, x1)) continue;
    radius = Math.min(radius, r0 + (r1 - r0) * (x - x0) / (x1 - x0));
  }
  return radius;
}

function radialRay(x, angle, radius, length) {
  return new THREE.Raycaster(new THREE.Vector3(x, radius * Math.cos(angle), radius * Math.sin(angle)),
    new THREE.Vector3(0, -Math.cos(angle), -Math.sin(angle)), 0, length);
}

export function verifyCompressor(model) {
  model.root.updateMatrixWorld(true);
  const airfoils = ['compressor-igv-airfoil', 'compressor-rotor-airfoil', 'compressor-stator-airfoil', 'compressor-egv-airfoil']
    .flatMap(role => tagged(model, role)).map(row => ({...row, points: rowVertices(row.object)}));
  assert.equal(airfoils.length, 37, 'Compressor must retain IGV + 17 rotor + 17 stator + two EGV rows');
  for (const row of airfoils) {
    row.minX = Math.min(...row.points.map(point => point.x));
    row.maxX = Math.max(...row.points.map(point => point.x));
  }
  airfoils.sort((a, b) => a.minX - b.minX);
  let axialGap = Infinity, angularGap = Infinity;
  for (let i = 1; i < airfoils.length; i++) {
    const before = airfoils[i - 1], after = airfoils[i];
    const gap = after.minX - before.maxX;
    assert.ok(gap > 0.004, `${before.part.id} / ${after.part.id}: rotating/stationary airfoil envelopes overlap or lack reconstructed separation (${gap} m)`);
    axialGap = Math.min(axialGap, gap);
  }
  for (const {part, object} of airfoils) {
    const position = object.geometry.attributes.position, angles = [];
    for (let i = 0; i < position.count; i++) angles.push(Math.atan2(position.getZ(i), position.getY(i)));
    const gap = TAU / object.count - (Math.max(...angles) - Math.min(...angles));
    assert.ok(gap > 0.005, `${part.id}: adjacent blades have overlapping angular envelopes`);
    angularGap = Math.min(angularGap, gap);
  }

  const walls = tagged(model, 'compressor-casing-wall').filter(({object}) => object.userData.half === 'upper');
  assert.equal(walls.length, 3, 'Missing compressor wall profiles');
  let rotorWallGap = Infinity, statorWallGap = Infinity;
  for (const {part, object, points} of airfoils) {
    if (object.userData.auditRole === 'compressor-igv-airfoil') continue;
    for (const point of points) {
      const bore = Math.min(...walls.map(({object: wall}) => profileBoreAt(wall.geometry.userData.profile, point.x)));
      assert.ok(Number.isFinite(bore), `${part.id}: airfoil escaped the compressor casing's axial envelope`);
      const gap = bore - Math.hypot(point.y, point.z);
      assert.ok(gap > 0.002, `${part.id}: airfoil penetrates the axisymmetric casing envelope (${gap} m)`);
      if (object.userData.auditRole === 'compressor-rotor-airfoil') rotorWallGap = Math.min(rotorWallGap, gap);
      else statorWallGap = Math.min(statorWallGap, gap);
    }
  }

  const drums = tagged(model, 'compressor-drum-rim').sort((a, b) => a.object.userData.station - b.object.userData.station);
  assert.equal(drums.length, 17, 'Missing wheel/spacer drum segments');
  for (let i = 1; i < drums.length; i++) {
    const before = drums[i - 1].object.userData, after = drums[i].object.userData;
    assert.ok(Math.abs(before.right - after.left) < 1e-8 && Math.abs(before.rightRadius - after.leftRadius) < 1e-8,
      `${drums[i].part.id}: discontinuous spacer drum joint`);
  }

  const wheelWebs = tagged(model, 'compressor-wheel-web');
  assert.equal(wheelWebs.length, 17, 'Missing compressor wheel webs');
  let boltBores = 0;
  for (const {part, object} of wheelWebs) {
    const x = object.userData.station;
    for (let i = 0; i < 16; i++) {
      const angle = TAU * i / 16;
      for (const offset of [[0, 0], [0.026, 0], [-0.026, 0], [0, 0.026], [0, -0.026]]) {
        const ray = new THREE.Raycaster(new THREE.Vector3(x - 0.08, 0.48 * Math.cos(angle) + offset[0], 0.48 * Math.sin(angle) + offset[1]),
          new THREE.Vector3(1, 0, 0), 0, 0.16);
        assert.equal(ray.intersectObject(object, false).length, 0, `${part.id}: tie-bolt bore ${i + 1} is blocked or clips the bolt envelope`);
      }
      boltBores++;
    }
    const solidProbe = new THREE.Raycaster(new THREE.Vector3(x - 0.08, 0.38, 0), new THREE.Vector3(1, 0, 0), 0, 0.16);
    assert.ok(solidProbe.intersectObject(object, false).length > 0, `${part.id}: web material disappeared around the bores`);
  }

  let bleedBores = 0;
  for (const {part, object} of tagged(model, 'compressor-casing-wall')) {
    for (const port of object.userData.ports || []) {
      for (const offset of [0, -port.bore * 0.5, port.bore * 0.5]) {
        const ray = radialRay(port.station + offset, port.angle, 1.70, 0.70);
        assert.equal(ray.intersectObject(part.group, true).length, 0, `${part.id}: bleed duct has a hidden cap or solid casing wall`);
      }
      assert.ok(radialRay(port.station + port.bore * 1.4, port.angle, 1.70, 0.8).intersectObject(object, false).length > 0,
        `${part.id}: bleed aperture unexpectedly removed surrounding wall`);
      bleedBores++;
    }
  }
  assert.equal(bleedBores, 6, 'Missing cooling/surge bleed apertures');

  const igvHosts = [...tagged(model, 'compressor-igv-stem-support'), ...tagged(model, 'compressor-inlet-bellmouth')].map(({object}) => object);
  assert.equal(igvHosts.length, 3, 'Missing IGV stem support and split bellmouth');
  for (let i = 0; i < 64; i++) {
    const ray = radialRay(-4.19, TAU * i / 64, 1.4, 0.32);
    assert.equal(ray.intersectObjects(igvHosts, false).length, 0, `IGV stem ${i + 1} intersects an undrilled casing/support wall`);
  }
  assert.equal(tagged(model, 'compressor-igv-inner-segment').length, 16, 'Video: sixteen IGV inner support segments');

  const metrics = {axialGapMm: axialGap * 1000, rotorWallGapMm: rotorWallGap * 1000,
    statorWallGapMm: statorWallGap * 1000, adjacentBladeGapDeg: angularGap * 180 / Math.PI, boltBores, bleedBores, igvBores: 64};
  console.log('Compressor mesh-clearance and open-channel checks passed:', JSON.stringify(metrics));
  return metrics;
}

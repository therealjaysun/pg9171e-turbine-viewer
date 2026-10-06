import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MeshBVH} from 'three-mesh-bvh';

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

function insideProfile(profile, x, radius) {
  let inside = false;
  for (let i = 0, j = profile.length - 1; i < profile.length; j = i++) {
    const [xi, ri] = profile[i], [xj, rj] = profile[j];
    if ((ri > radius) !== (rj > radius) && x < (xj - xi) * (radius - ri) / (rj - ri) + xi) inside = !inside;
  }
  return inside;
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

  const platforms = tagged(model, 'compressor-blade-platforms');
  assert.equal(platforms.length, 17, 'Every wheel needs the visible platform/dovetail profile');
  for (const {part, object} of platforms) {
    assert.equal(object.userData.dovetail, true, `${part.id}: platform lost its dovetail root`);
    const drum = drums.find(entry => entry.part.id === part.id).object;
    const profile = object.geometry.userData.profile;
    assert.ok(profile.length > 10, `${part.id}: dovetail was replaced by a rectangular block`);
    for (let i = 1; i < profile.length; i++) {
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const x = object.userData.station + profile[i - 1][0] * (1 - t) + profile[i][0] * t;
        const radius = profile[i - 1][1] * (1 - t) + profile[i][1] * t;
        assert.equal(insideProfile(drum.geometry.userData.profile, x, radius), false, `${part.id}: dovetail intersects its wheel-rim seat`);
      }
    }
  }
  const squareBases = tagged(model, 'compressor-stator-dovetail-bases');
  assert.equal(squareBases.length, 9, 'Video: final nine stator stages need individual square-based roots');
  for (const {part, object} of squareBases) {
    assert.equal(object.userData.squareBase, true, `${part.id}: missing square-based dovetail`);
    for (const point of rowVertices(object)) {
      const bore = Math.min(...walls.map(({object: wall}) => profileBoreAt(wall.geometry.userData.profile, point.x)));
      assert.ok(bore - Math.hypot(point.y, point.z) > 0.001, `${part.id}: square root intersects casing recess`);
    }
  }
  const pinions = tagged(model, 'compressor-igv-pinion-gears')[0]?.object;
  const rack = tagged(model, 'compressor-igv-rack-teeth')[0]?.object;
  assert.equal(pinions?.count, 64, 'Each IGV needs its fine-tooth pinion');
  assert.equal(pinions.userData.toothCountInferred, true, 'Do not present rendered tooth count as video-established');
  assert.equal(rack?.count, 768, 'Missing reconstructed fine-tooth annular rack');
  assert.equal(tagged(model, 'compressor-igv-stem-caps')[0]?.object.count, 64, 'Missing stepped stem caps');
  const gearTree = new MeshBVH(pinions.geometry, {indirect: true});
  const gearMatrix = new THREE.Matrix4(), toothMatrix = new THREE.Matrix4();
  pinions.getMatrixAt(0, gearMatrix);
  gearMatrix.premultiply(pinions.matrixWorld).invert();
  for (let i = -6; i <= 6; i++) {
    rack.getMatrixAt((i + rack.count) % rack.count, toothMatrix);
    toothMatrix.premultiply(rack.matrixWorld).premultiply(gearMatrix);
    assert.equal(gearTree.intersectsGeometry(rack.geometry, toothMatrix), false, 'IGV rack tooth intersects a pinion tooth');
  }

  const metrics = {axialGapMm: axialGap * 1000, rotorWallGapMm: rotorWallGap * 1000,
    statorWallGapMm: statorWallGap * 1000, adjacentBladeGapDeg: angularGap * 180 / Math.PI, boltBores, bleedBores, igvBores: 64,
    profiledRotorRoots: platforms.length, squareStatorRootRows: squareBases.length, pinionRackMeshProbes: 13};
  console.log('Compressor mesh-clearance and open-channel checks passed:', JSON.stringify(metrics));
  return metrics;
}

import * as THREE from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {TAU, mesh, lathe, bladeGeometry} from './helpers.js';
import {subtractGeometry} from './csg.js';

const sleeveCache = new Map();

// Tessellate in the developed circumferential coordinate before rolling the plate.
// Subdivision shares edge midpoints, so drilled walls do not leave T-junctions.
function refineCircumference(geometry, maxArc) {
  const welded = mergeVertices(geometry, 1e-7);
  const source = welded.getAttribute('position');
  const positions = Array.from({length: source.count}, (_, i) => [source.getX(i), source.getY(i), source.getZ(i)]);
  let triangles = Array.from(welded.index.array);
  for (let pass = 0; pass < 12; pass++) {
    const midpoints = new Map(), result = [];
    const midpoint = (a, b) => {
      if (Math.abs(positions[a][1] - positions[b][1]) <= maxArc) return null;
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (!midpoints.has(key)) {
        midpoints.set(key, positions.length);
        positions.push(positions[a].map((v, i) => (v + positions[b][i]) / 2));
      }
      return midpoints.get(key);
    };
    for (let i = 0; i < triangles.length; i += 3) {
      const [a, b, c] = triangles.slice(i, i + 3);
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
      const mask = (ab === null ? 0 : 1) | (bc === null ? 0 : 2) | (ca === null ? 0 : 4);
      if (mask === 0) result.push(a, b, c);
      else if (mask === 1) result.push(a, ab, c, ab, b, c);
      else if (mask === 2) result.push(b, bc, a, bc, c, a);
      else if (mask === 4) result.push(c, ca, b, ca, a, b);
      else if (mask === 3) result.push(b, bc, ab, a, ab, c, ab, bc, c);
      else if (mask === 5) result.push(a, ab, ca, ab, b, c, ab, c, ca);
      else if (mask === 6) result.push(c, ca, bc, a, b, ca, b, bc, ca);
      else result.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
    }
    triangles = result;
    if (!midpoints.size) break;
  }
  welded.dispose();
  geometry.dispose();
  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.Float32BufferAttribute(positions.flat(), 3));
  result.setIndex(triangles);
  return result;
}

export function piercedSleeve(parent, {x0, x1, radius, thickness, holes = [], material}) {
  if (!holes.length) return lathe(parent, [[x0, radius], [x1, radius], [x1, radius - thickness],
    [x0, radius - thickness], [x0, radius]], material, 64);
  const key = JSON.stringify({x0, x1, radius, thickness, holes});
  if (sleeveCache.has(key)) return mesh(parent, sleeveCache.get(key).clone(), material);
  // A seam away from every port avoids splitting a bore across the developed plate.
  let seam = 0.071;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (holes.every(hole => {
      const delta = ((hole.angle - seam) % TAU + TAU) % TAU;
      return delta * radius > hole.bore * 1.05 && (TAU - delta) * radius > hole.bore * 1.05;
    })) break;
    seam += 0.087;
  }
  const shape = new THREE.Shape();
  shape.moveTo(x0, 0); shape.lineTo(x1, 0); shape.lineTo(x1, TAU * radius); shape.lineTo(x0, TAU * radius); shape.closePath();
  for (const hole of holes) {
    const arc = (((hole.angle - seam) % TAU + TAU) % TAU) * radius;
    const path = new THREE.Path();
    path.absellipse(hole.x, arc, hole.bore, hole.bore, 0, TAU, true);
    shape.holes.push(path);
  }
  const geometry = refineCircumference(new THREE.ExtrudeGeometry(shape, {depth: thickness, bevelEnabled: false, curveSegments: 10}), radius * 0.16);
  const p = geometry.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const angle = p.getY(i) / radius + seam, r = radius - p.getZ(i);
    p.setXYZ(i, p.getX(i), r * Math.cos(angle), r * Math.sin(angle));
  }
  geometry.computeVertexNormals();
  sleeveCache.set(key, geometry.clone());
  const result = mesh(parent, geometry, material);
  result.userData.channel = {type: 'pierced-sleeve', boreCount: holes.length, holes, radius, thickness, x0, x1};
  return result;
}

function airfoilPoint(params, u, fraction) {
  const c = params.chord * (1 - 0.3 * fraction), angle = params.twist * (1 - 0.48 * fraction);
  const a = (u - 0.5) * c, b = params.camber * c * Math.sin(Math.PI * u);
  return [a * Math.cos(angle) - b * Math.sin(angle) + params.sweep * fraction,
    params.root + (params.tip - params.root) * fraction,
    a * Math.sin(angle) + b * Math.cos(angle) + (params.lean || 0) * fraction];
}

function coolingBore(params, u, radius) {
  const n = 12, spans = 18, positions = [], indices = [];
  for (let j = 0; j <= spans; j++) {
    const f = -0.025 + j / spans * 1.05;
    const p = airfoilPoint(params, u, f);
    for (let k = 0; k < n; k++) positions.push(p[0] + radius * Math.cos(k * TAU / n), p[1], p[2] + radius * Math.sin(k * TAU / n));
  }
  for (let j = 0; j < spans; j++) for (let k = 0; k < n; k++) {
    const a = j * n + k, b = j * n + (k + 1) % n;
    indices.push(a, b + n, b, a, a + n, b + n);
  }
  for (const j of [0, spans]) {
    const p = airfoilPoint(params, u, -0.025 + j / spans * 1.05), center = positions.length / 3;
    positions.push(...p);
    for (let k = 0; k < n; k++) {
      const a = j * n + k, b = j * n + (k + 1) % n;
      indices.push(center, j ? b : a, j ? a : b);
    }
  }
  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  result.setIndex(indices); result.computeVertexNormals();
  return result;
}

export function cooledBladeRow(parent, x, count, params, material, phase = 0) {
  const original = bladeGeometry(params);
  const cutters = [0.25, 0.50, 0.72].map(u => coolingBore(params, u, 0.0028));
  const geometry = subtractGeometry(original, cutters);
  original.dispose(); cutters.forEach(c => c.dispose());
  geometry.userData = {csg: true, coolingPassages: 3, passageRadius: 0.0028, illustrative: true,
    coolingPaths: [0.25, 0.50, 0.72].map(u => ({radius: 0.0028,
      points: [0, 0.25, 0.50, 0.75, 1].map(f => airfoilPoint(params, u, f))}))};
  const result = new THREE.InstancedMesh(geometry, material, count);
  result.userData = {csgAirfoil: true, coolingPassages: 3};
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    dummy.position.set(x, 0, 0); dummy.rotation.set(phase + i * TAU / count, 0, 0); dummy.updateMatrix(); result.setMatrixAt(i, dummy.matrix);
  }
  result.castShadow = true; result.receiveShadow = true; parent.add(result);
  return result;
}

export function hollowRod(parent, from, to, outer, inner, material, segments = 24) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const delta = b.clone().sub(a), length = delta.length();
  const result = lathe(parent, [[0, outer], [length, outer], [length, inner], [0, inner], [0, outer]], material, segments);
  result.position.copy(a);
  result.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), delta.normalize());
  result.userData.channel = {type: 'open-tube', innerRadius: inner, outerRadius: outer, length};
  return result;
}

export function piercedPlate(parent, {x0, x1, outer, inner = 0, holes = [], half = 'full', slope = 0, slopeRadius = 0, material}) {
  const shape = new THREE.Shape();
  if (half === 'full') shape.absarc(0, 0, outer, 0, TAU, false);
  else {
    const begin = half === 'upper' ? -Math.PI / 2 : Math.PI / 2;
    shape.absarc(0, 0, outer, begin, begin + Math.PI, false);
    shape.lineTo(inner * Math.cos(begin + Math.PI), inner * Math.sin(begin + Math.PI));
    shape.absarc(0, 0, inner, begin + Math.PI, begin, true);
    shape.closePath();
  }
  if (inner && half === 'full') {
    const path = new THREE.Path(); path.absarc(0, 0, inner, 0, TAU, true); shape.holes.push(path);
  }
  for (const hole of holes) {
    if (half !== 'full' && (hole.y > 0) !== (half === 'upper')) continue;
    const path = new THREE.Path();
    path.absellipse(hole.y, hole.z, hole.radiusY ?? hole.radius, hole.radiusZ ?? hole.radius, 0, TAU, true, hole.angle || 0);
    shape.holes.push(path);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {depth: x1 - x0, bevelEnabled: false, curveSegments: 20});
  const p = geometry.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const y = p.getX(i), z = p.getY(i);
    p.setXYZ(i, x0 + p.getZ(i) + slope * (Math.hypot(y, z) - slopeRadius), y, z);
  }
  geometry.computeVertexNormals();
  const result = mesh(parent, geometry, material);
  result.userData.channel = {type: 'pierced-plate', holes: holes.length, x0, x1};
  return result;
}

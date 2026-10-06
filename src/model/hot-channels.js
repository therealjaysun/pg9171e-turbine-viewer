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
  const developed = new THREE.ExtrudeGeometry(shape, {depth: thickness, bevelEnabled: false, curveSegments: 10});
  const developedPositions = developed.getAttribute('position'), indices = [], circumference = TAU * radius;
  // Rolling joins the two developed edges; their original sidewalls would become
  // coincident internal faces, not part of the material's boundary.
  for (let i = 0; i < developedPositions.count; i += 3) {
    const ys = [0, 1, 2].map(j => developedPositions.getY(i + j));
    if (ys.every(y => Math.abs(y) < 1e-6) || ys.every(y => Math.abs(y - circumference) < 1e-6)) continue;
    indices.push(i, i + 1, i + 2);
  }
  developed.setIndex(indices);
  const geometry = refineCircumference(developed, radius * 0.16);
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

function nozzleCavity(params) {
  const positions = [], indices = [], steps = 16;
  const fractions = [0.025, 0.25, 0.5, 0.75, 1, 1.35];
  for (const f of fractions) {
    const c = params.chord * (1 - 0.3 * f), angle = params.twist * (1 - 0.48 * f);
    for (let side = 0; side < 2; side++) for (let i = side ? 1 : 0; i <= (side ? steps - 1 : steps); i++) {
      const t = side ? 1 - i / steps : i / steps, u = 0.12 + t * 0.76;
      const half = 5 * params.thickness * c * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u ** 2 + 0.2843 * u ** 3 - 0.1036 * u ** 4);
      const p = airfoilPoint(params, u, f);
      const offset = (side ? -1 : 1) * half * 0.48 * Math.sqrt(Math.max(0, Math.sin(Math.PI * t)));
      positions.push(p[0] - offset * Math.sin(angle), p[1], p[2] + offset * Math.cos(angle));
    }
  }
  const row = steps * 2;
  for (let j = 0; j < fractions.length - 1; j++) for (let k = 0; k < row; k++) {
    const a = j * row + k, b = j * row + (k + 1) % row;
    indices.push(a, b, a + row, b, b + row, a + row);
  }
  for (const j of [0, fractions.length - 1]) {
    const base = j * row;
    const contour = Array.from({length: row}, (_, i) => new THREE.Vector2(positions[(base + i) * 3], positions[(base + i) * 3 + 2]));
    for (const triangle of THREE.ShapeUtils.triangulateShape(contour, [])) {
      const [a, b, c] = triangle.map(i => base + i);
      const pa = new THREE.Vector3().fromArray(positions, a * 3), pb = new THREE.Vector3().fromArray(positions, b * 3), pc = new THREE.Vector3().fromArray(positions, c * 3);
      const correct = (pb.sub(pa).cross(pc.sub(pa)).y > 0) === (j > 0);
      indices.push(a, correct ? b : c, correct ? c : b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function cappedPort(params, fraction, radius) {
  const points = Array.from({length: 7}, (_, i) => new THREE.Vector3(...airfoilPoint(params, 0.62 + i * 0.46 / 6, fraction)));
  const path = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(path, 16, radius, 10, false);
  const positions = Array.from(geometry.attributes.position.array), indices = Array.from(geometry.index.array);
  for (const end of [0, 16]) {
    const point = path.getPointAt(end / 16), tangent = path.getTangentAt(end / 16).multiplyScalar(end ? 1 : -1);
    const center = positions.length / 3; positions.push(...point.toArray());
    for (let k = 0; k < 10; k++) {
      const a = end * 11 + k, b = a + 1;
      const pa = new THREE.Vector3().fromArray(positions, a * 3), pb = new THREE.Vector3().fromArray(positions, b * 3);
      const correct = pa.sub(point).cross(pb.sub(point)).dot(tangent) > 0;
      indices.push(center, correct ? a : b, correct ? b : a);
    }
  }
  geometry.dispose();
  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  result.setIndex(indices); result.computeVertexNormals();
  return {geometry: result, points: points.map(p => p.toArray())};
}

function radialInstances(parent, geometry, material, x, count, phase = 0) {
  const result = new THREE.InstancedMesh(geometry, material, count), dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    dummy.position.set(x, 0, 0); dummy.rotation.set(phase + i * TAU / count, 0, 0); dummy.updateMatrix();
    result.setMatrixAt(i, dummy.matrix);
  }
  result.castShadow = true; result.receiveShadow = true; parent.add(result); return result;
}

function stabilizeNozzleCsg(source, minimumEdge) {
  // Collapse micron-scale CSG intersection edges before Float32 millimetre export.
  // Neighbor faces share the replacement vertex; this does not punch out slivers.
  const positionsOnly = source.clone(); positionsOnly.deleteAttribute('normal');
  const geometry = mergeVertices(positionsOnly, 1e-7); positionsOnly.dispose();
  const p = geometry.attributes.position, parents = Array.from({length: p.count}, (_, i) => i);
  const root = i => { while (parents[i] !== i) { parents[i] = parents[parents[i]]; i = parents[i]; } return i; };
  for (let i = 0; i < geometry.index.count; i += 3) {
    const ids = [0, 1, 2].map(j => geometry.index.getX(i + j));
    for (let j = 0; j < 3; j++) {
      const a = ids[j], b = ids[(j + 1) % 3];
      if (Math.hypot(p.getX(a) - p.getX(b), p.getY(a) - p.getY(b), p.getZ(a) - p.getZ(b)) < minimumEdge) parents[root(b)] = root(a);
    }
  }
  const indices = [], faces = new Map(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < geometry.index.count; i += 3) {
    const ids = [0, 1, 2].map(j => root(geometry.index.getX(i + j)));
    if (new Set(ids).size < 3) continue;
    a.fromBufferAttribute(p, ids[0]); b.fromBufferAttribute(p, ids[1]); c.fromBufferAttribute(p, ids[2]);
    if (b.sub(a).cross(c.sub(a)).lengthSq() <= 1e-22) continue;
    const sorted = [...ids].sort((a,b)=>a-b), key = sorted.join(':');
    const orientation = ids.indexOf(sorted[1]) === (ids.indexOf(sorted[0])+1)%3 ? 1 : -1;
    const prior = faces.get(key);
    // Edge collapse can leave an opposed pair forming a zero-thickness fin.
    if (prior) {
      if (prior.orientation !== orientation) faces.delete(key);
    } else faces.set(key,{ids,orientation});
  }
  for (const {ids} of faces.values()) indices.push(...ids);
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const compact = geometry.toNonIndexed();
  geometry.dispose(); source.dispose(); return compact;
}

// The video shows hollow nozzle partitions and trailing-edge exits, unlike bucket bores.
// Wall thickness, internal cavity contour and the 11-hole count are illustrative.
export function cooledNozzleRow(parent, x, count, params, material, minimumEdge = 0.00001) {
  const original = bladeGeometry(params), cavity = nozzleCavity(params);
  const ports = Array.from({length: 11}, (_, i) => cappedPort(params, 0.10 + i * 0.08, 0.0017));
  const geometry = stabilizeNozzleCsg(subtractGeometry(original, [cavity, ...ports.map(port => port.geometry)]), minimumEdge);
  original.dispose(); cavity.dispose(); ports.forEach(port => port.geometry.dispose());
  geometry.userData = {airfoil: true, csg: true, illustrative: true, nozzleCavity: true, minimumEdge,
    cavitySamples: [0.25, 0.50, 0.75].map(f => {
      const center = airfoilPoint(params, 0.4, f), c = params.chord * (1 - 0.3 * f), angle = params.twist * (1 - 0.48 * f);
      const u = 0.4, half = 5 * params.thickness * c * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u ** 2 + 0.2843 * u ** 3 - 0.1036 * u ** 4);
      return {center, wall: [center[0] - 0.80 * half * Math.sin(angle), center[1], center[2] + 0.80 * half * Math.cos(angle)]};
    }), trailingPorts: ports.map(port => port.points)};
  const row = radialInstances(parent, geometry, material, x, count, TAU / count / 2);
  row.userData = {csgAirfoil: true, nozzleCavity: true};
  return row;
}

export function nozzleOuterPlatform(parent, x, params, vaneCount, segmentCount, material, coverMaterial, hasImpingementCover) {
  const segmentAngle = TAU / segmentCount, vaneAngle = TAU / vaneCount, perSegment = vaneCount / segmentCount;
  const holder = new THREE.Group();
  const base = lathe(holder, [[-0.14, params.tip - 0.004], [-0.14, params.tip + 0.062],
    [0.205, params.tip + 0.062], [0.205, params.tip - 0.004], [-0.14, params.tip - 0.004]], material, 12,
  -Math.PI / 2 + 0.004, segmentAngle - 0.008);
  const cavities = Array.from({length: perSegment}, (_, i) => nozzleCavity(params).rotateX((i + 0.5) * vaneAngle));
  const platform = subtractGeometry(base.geometry, cavities);
  base.geometry.dispose(); cavities.forEach(cavity => cavity.dispose());
  platform.userData.nozzlePlatform = {
    openings: Array.from({length: perSegment}, (_, i) => new THREE.Vector3(...airfoilPoint(params, 0.4, 1.1)).applyAxisAngle(new THREE.Vector3(1, 0, 0), (i + 0.5) * vaneAngle).toArray()),
    wall: [-0.13, (params.tip + 0.03) * Math.cos(segmentAngle / 2), (params.tip + 0.03) * Math.sin(segmentAngle / 2)],
    feedPaths: Array.from({length: perSegment}, (_, i) => (hasImpingementCover ? [0.25, 0.4, 0.55, 0.7] : [0.4]).map(u => {
      const angle = (i + 0.5) * vaneAngle, end = 1 + 0.07 / (params.tip - params.root);
      return {angle, points: Array.from({length: 25}, (_, j) => new THREE.Vector3(...airfoilPoint(params, u, 0.90 + j / 24 * (end - 0.90)))
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), angle).toArray())};
    })).flat(),
  };
  radialInstances(parent, platform, material, x, segmentCount).userData.nozzlePlatform = true;
  if (!hasImpingementCover) return;
  const cover = lathe(holder, [[-0.08, params.tip + 0.063], [-0.08, params.tip + 0.069],
    [0.22, params.tip + 0.069], [0.22, params.tip + 0.063], [-0.08, params.tip + 0.063]], coverMaterial, 12,
  -Math.PI / 2 + 0.018, segmentAngle - 0.036);
  const holes = [], holeCenters = [];
  for (let i = 0; i < perSegment; i++) for (const u of [0.25, 0.40, 0.55, 0.70]) {
    const f = 1 + 0.066 / (params.tip - params.root), point = airfoilPoint(params, u, f);
    const bore = new THREE.CylinderGeometry(0.0025, 0.0025, 0.065, 10);
    bore.translate(...point).rotateX((i + 0.5) * vaneAngle); holes.push(bore);
    holeCenters.push(new THREE.Vector3(...point).applyAxisAngle(new THREE.Vector3(1, 0, 0), (i + 0.5) * vaneAngle).toArray());
  }
  const perforated = subtractGeometry(cover.geometry, holes);
  cover.geometry.dispose(); holes.forEach(hole => hole.dispose());
  perforated.userData.impingementCover = {holeCenters, radius: 0.0025};
  radialInstances(parent, perforated, coverMaterial, x, segmentCount).userData.impingementCover = true;
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

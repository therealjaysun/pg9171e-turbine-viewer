import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {
  TAU, palette, material, part, mesh, cylinder, lathe, ring, box, tube, rod,
  bolts, bladeRow, splitCasing as openSplitCasing,
} from './helpers.js';

const CANT = 13 * Math.PI / 180;
const CAN_COUNT = 14;
const CANT_COS = Math.cos(CANT);
const CANT_SIN = Math.sin(CANT);

function radial(x, radius, angle) {
  return [x, Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function canFrame(parent, angle, x = -0.08, radius = 1.75) {
  const group = new THREE.Group();
  group.position.set(...radial(x, radius, angle));
  group.quaternion.setFromUnitVectors(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(CANT_COS, -CANT_SIN * Math.cos(angle), -CANT_SIN * Math.sin(angle)),
  );
  parent.add(group);
  return group;
}

function hollowTube(parent, x0, x1, radius, thickness, mat, segments = 40) {
  return lathe(parent, [[x0, radius], [x1, radius], [x1, radius - thickness],
    [x0, radius - thickness], [x0, radius]], mat, segments);
}

function splitCasing(parent, profile, mat, {half = 'full'} = {}) {
  const shell = openSplitCasing(parent, profile, mat, {half});
  if (half === 'full') return shell;
  for (const side of [-1, 1]) {
    const shape = new THREE.Shape();
    profile.forEach(([x, radius], index) => {
      if (index === 0) shape.moveTo(x, side * radius);
      else shape.lineTo(x, side * radius);
    });
    shape.closePath();
    const face = new THREE.ShapeGeometry(shape);
    face.rotateX(half === 'upper' ? Math.PI / 2 : -Math.PI / 2);
    mesh(parent, face, mat);
  }
  return shell;
}

function port(parent, x, radius, angle, bore, dark, rim) {
  const p = radial(x, radius, angle);
  const end = radial(x, radius + 0.012, angle);
  const socket = rod(parent, p, end, bore * 1.27, rim, 12);
  const hole = rod(parent, end, radial(x, radius + 0.014, angle), bore, dark, 16);
  return [socket, hole];
}

// Loft a hollow round inlet into one fourteenth of the annular nozzle entrance.
function transitionGeometry(angle) {
  const n = 48;
  const stations = [
    [0.864, 1.532, 0], [1.06, 1.47, 0.19], [1.29, 1.30, 0.48],
    [1.51, 1.095, 0.8], [1.73, 0.928, 1],
  ];
  const positions = [], indices = [];
  for (let skin = 0; skin < 2; skin++) {
    const inset = skin * 0.014;
    for (const [x, centerR, blend] of stations) {
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU;
        const c = Math.cos(a), s = Math.sin(a);
        const circleR = c * (0.236 - inset);
        const circleT = s * (0.236 - inset);
        const sectorR = Math.sign(c) * Math.pow(Math.abs(c), 0.28) * (0.171 - inset);
        const sectorAngle = Math.sign(s) * Math.pow(Math.abs(s), 0.28) * (TAU / CAN_COUNT / 2 - 0.009 - inset * 0.6);
        const rr = centerR + circleR * (1 - blend) + sectorR * blend;
        const tangential = circleT * (1 - blend);
        const theta = angle + sectorAngle * blend;
        positions.push(
          x + circleR * CANT_SIN * (1 - blend),
          rr * Math.cos(theta) - tangential * Math.sin(angle),
          rr * Math.sin(theta) + tangential * Math.cos(angle),
        );
      }
    }
  }
  const len = stations.length, skinOffset = len * n;
  for (let skin = 0; skin < 2; skin++) {
    const offset = skin * skinOffset;
    for (let j = 0; j < len - 1; j++) for (let k = 0; k < n; k++) {
      const a = offset + j * n + k, b = offset + j * n + (k + 1) % n;
      const c = a + n, d = b + n;
      if (skin === 0) indices.push(a, b, c, b, d, c);
      else indices.push(a, c, b, b, c, d);
    }
  }
  for (const row of [0, len - 1]) for (let k = 0; k < n; k++) {
    const a = row * n + k, b = row * n + (k + 1) % n;
    const c = a + skinOffset, d = b + skinOffset;
    if (row === 0) indices.push(a, c, b, b, c, d);
    else indices.push(a, b, c, b, d, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function casingFlanges(parent, xs, radii, half, mat, fastener) {
  for (let j = 0; j < xs.length; j++) {
    splitCasing(parent, [[xs[j] - 0.035, radii[j] - 0.075],
      [xs[j] - 0.035, radii[j] + 0.065], [xs[j] + 0.035, radii[j] + 0.065],
      [xs[j] + 0.035, radii[j] - 0.075], [xs[j] - 0.035, radii[j] - 0.075]], mat, {half});
    for (let i = 0; i < 16; i++) {
      const angle = (half === 'upper' ? -Math.PI / 2 : Math.PI / 2) + (i + 0.5) * Math.PI / 16;
      const point = radial(xs[j] - 0.055, radii[j] + 0.021, angle);
      rod(parent, point, [point[0] + 0.11, point[1], point[2]], 0.023, fastener, 6);
    }
  }
}

function addJointRails(parent, x0, x1, radius, half, mat, boltMat) {
  const y = half === 'upper' ? 0.039 : -0.039;
  const [r0, r1] = Array.isArray(radius) ? radius : [radius, radius];
  for (const side of [-1, 1]) {
    const rail = box(parent, [Math.hypot(x1 - x0, r1 - r0), 0.075, 0.15],
      [(x1 + x0) / 2, y, side * (r0 + r1) / 2], mat);
    rail.rotation.y = -side * Math.atan2(r1 - r0, x1 - x0);
    for (let x = x0 + 0.075; x < x1 - 0.04; x += 0.16) {
      const r = r0 + (r1 - r0) * (x - x0) / (x1 - x0);
      rod(parent, [x, y - 0.025, side * r], [x, y + 0.063, side * r], 0.027, boltMat, 6);
    }
  }
}

function turbineShroud(parent, x, radius, chord, count, mat) {
  for (let j = 0; j < count; j++) {
    lathe(parent, [[x - chord / 2, radius - 0.025], [x - chord / 2, radius + 0.018],
      [x + chord / 2, radius + 0.018], [x + chord / 2, radius - 0.025],
      [x - chord / 2, radius - 0.025]], mat, 6, j * TAU / count + 0.004, TAU / count - 0.008);
  }
}

function mergePartMeshes(group) {
  group.updateWorldMatrix(true, true);
  const inverse = group.matrixWorld.clone().invert();
  const buckets = new Map();
  group.traverse(object => {
    if (!object.isMesh || object.isInstancedMesh || Array.isArray(object.material)) return;
    const key = object.material.uuid;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(object);
  });
  for (const objects of buckets.values()) {
    if (objects.length < 2) continue;
    const geometries = objects.map(object => {
      const geometry = object.geometry.clone();
      geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld));
      for (const name of Object.keys(geometry.attributes)) {
        if (name !== 'position' && name !== 'normal') geometry.deleteAttribute(name);
      }
      return geometry;
    });
    const hasIndexed = geometries.some(geometry => Boolean(geometry.index));
    const hasNonIndexed = geometries.some(geometry => !geometry.index);
    const compatible = hasIndexed && hasNonIndexed
      ? geometries.map(geometry => geometry.index ? geometry.toNonIndexed() : geometry)
      : geometries;
    const combined = mergeGeometries(compatible, false);
    if (combined) {
      const result = mesh(group, combined, objects[0].material);
      result.name = `${group.name} surfaces`;
      for (const object of objects) {
        object.removeFromParent();
        object.geometry.dispose();
      }
    }
    for (const geometry of new Set([...geometries, ...compatible])) geometry.dispose();
  }
}

export function buildHotSection(ctx) {
  const firstPart = ctx.parts.length;
  const mats = {
    casing: material(palette.casing, 0.49, 0.43),
    chamber: material(palette.combustion, 0.6, 0.36),
    liner: material(palette.liner, 0.72, 0.33),
    coating: material(0xd4cbc0, 0.27, 0.56),
    steel: material(palette.steel, 0.76, 0.29),
    dark: material(palette.dark, 0.61, 0.44),
    bolt: material(palette.bolt, 0.71, 0.35),
    fuel: material(palette.fuel, 0.65, 0.31),
    turbine: material(palette.turbine, 0.74, 0.31),
    stator: material(0x9dabb0, 0.69, 0.37),
    exhaust: material(palette.exhaust, 0.59, 0.45),
  };
  const rotors = [];

  for (const half of ['upper', 'lower']) {
    const wrapper = part(ctx, {
      id: `combustion-wrapper-${half}`, name: `Combustion wrapper / ${half}`,
      system: 'combustion', kind: 'casing', sourceTime: 660,
      description: 'Horizontally split pressure plenum surrounding the fourteen DLN1 combustion assemblies. Its forward face is canted 13 degrees.',
      facts: [['Construction', 'Horizontally split'], ['Forward face', '13 deg'], ['Chambers', '14']],
      explode: [0, half === 'upper' ? 2.3 : -1.0, 0],
    });
    splitCasing(wrapper, [[-0.04, 1.23], [-0.23, 2.04], [-0.10, 2.10],
      [0.42, 2.10], [0.86, 1.96], [1.41, 1.69], [1.77, 1.33],
      [1.77, 1.25], [1.40, 1.59], [0.82, 1.86], [0.37, 2.00],
      [-0.08, 2.00], [0.04, 1.23], [-0.04, 1.23]], mats.casing, {half});
    casingFlanges(wrapper, [-0.13, 1.77], [2.04, 1.31], half, mats.casing, mats.bolt);
    addJointRails(wrapper, -0.10, 0.54, 2.085, half, mats.casing, mats.bolt);
    for (const z of [-1, 1]) {
      const lug = box(wrapper, [0.22, 0.17, 0.18], [0.40, half === 'upper' ? 1.63 : -1.63, z * 1.15], mats.casing);
      lug.rotation.x = z * (half === 'upper' ? 0.55 : -0.55);
    }
  }

  const discharge = part(ctx, {
    id: 'compressor-discharge-inner-barrel', name: 'Discharge diffuser and inner barrel',
    system: 'combustion', kind: 'stator', sourceTime: 374,
    description: 'The expanding compressor discharge passage feeds the reverse-flow combustion plenum. Twelve radial struts support the inner barrel and turbine nozzle support region.',
    facts: [['Support struts', '12'], ['Flow', 'Diffusion to wrapper']], explode: [0, 0, -0.5],
  });
  lathe(discharge, [[-0.18, 0.81], [0.12, 0.75], [0.58, 0.59],
    [1.16, 0.55], [1.57, 0.70], [1.65, 0.75], [1.65, 0.69],
    [1.13, 0.48], [0.52, 0.52], [0.08, 0.68], [-0.18, 0.75], [-0.18, 0.81]], mats.stator, 72);
  lathe(discharge, [[-0.20, 1.045], [0.15, 1.10], [0.45, 1.165],
    [0.70, 1.25], [0.76, 1.25], [0.76, 1.295], [0.42, 1.205],
    [0.10, 1.14], [-0.20, 1.095], [-0.20, 1.045]], mats.stator, 72);
  ring(discharge, 0.44, 1.235, 0.11, 0.09, mats.steel, 72);
  for (let i = 0; i < 12; i++) {
    const angle = i * TAU / 12;
    const vane = box(discharge, [0.32, 0.55, 0.055], radial(0.44, 0.885, angle), mats.stator);
    vane.rotation.x = angle;
  }
  ring(discharge, 1.60, 0.80, 0.11, 0.16, mats.steel, 64);
  bolts(discharge, 1.665, 0.76, 24, 0.025, mats.bolt);

  for (let i = 0; i < CAN_COUNT; i++) {
    const angle = i * TAU / CAN_COUNT;
    const number = i + 1;
    const vector = [0, Math.cos(angle) * 1.05, Math.sin(angle) * 1.05];
    const can = part(ctx, {
      id: `combustor-${number}`, name: `DLN1 combustor ${String(number).padStart(2, '0')}`,
      system: 'combustion', kind: 'casing', sourceTime: 564,
      description: 'One of fourteen reverse-flow can-annular chambers, canted inward toward the first turbine nozzle. Six primary fuel nozzles surround a secondary center nozzle.',
      facts: [['Chamber', `${number} / 14`], ['Cant', '13 deg'], ['Primary nozzles', '6'], ['Secondary nozzle', '1']],
      explode: vector,
    });
    const frame = canFrame(can, angle);
    hollowTube(frame, -0.16, 0.945, 0.287, 0.022, mats.chamber);
    cylinder(frame, -0.225, -0.17, 0.32, 0.32, mats.steel, 40);
    ring(frame, -0.155, 0.329, 0.063, 0.07, mats.steel, 40);
    ring(frame, 0.745, 0.314, 0.055, 0.06, mats.chamber, 40);
    bolts(frame, -0.265, 0.292, 12, 0.022, mats.bolt);
    ring(frame, 0.84, 0.30, 0.035, 0.034, mats.steel, 40);
    for (let k = 0; k < 6; k++) {
      const phi = k * TAU / 6;
      const nozzle = new THREE.Group();
      nozzle.position.set(0, Math.cos(phi) * 0.167, Math.sin(phi) * 0.167);
      frame.add(nozzle);
      cylinder(nozzle, -0.31, 0.055, 0.043, 0.035, mats.fuel, 16);
      ring(nozzle, -0.30, 0.063, 0.034, 0.026, mats.steel, 20);
      cylinder(nozzle, -0.349, -0.31, 0.036, 0.036, mats.bolt, 6);
      tube(frame, [[-0.31, Math.cos(phi) * 0.17, Math.sin(phi) * 0.17],
        [-0.40, Math.cos(phi) * 0.18, Math.sin(phi) * 0.18],
        [-0.45, Math.cos(phi) * 0.105, Math.sin(phi) * 0.105]], 0.009, mats.steel, 8);
    }
    cylinder(frame, -0.46, 0.65, 0.049, 0.031, mats.steel, 24);
    ring(frame, -0.345, 0.084, 0.043, 0.03, mats.chamber, 24);
    bolts(frame, -0.372, 0.065, 6, 0.012, mats.bolt);
    tube(frame, [[-0.42, 0, 0], [-0.50, 0.08, 0], [-0.46, 0.37, 0]], 0.021, mats.fuel, 12);
    port(frame, 0.12, 0.289, Math.PI / 2, 0.049, mats.dark, mats.steel);
    port(frame, 0.12, 0.289, -Math.PI / 2, 0.049, mats.dark, mats.steel);

    if ([11, 12].includes(number)) {
      rod(frame, [0.03, 0.24, 0], [-0.03, 0.46, 0], 0.029, mats.steel);
      rod(frame, [-0.03, 0.46, 0], [-0.065, 0.54, 0], 0.031, mats.dark);
    }
    if ([14, 1, 2, 3].includes(number)) {
      rod(frame, [-0.03, 0.22, 0.1], [-0.16, 0.39, 0.17], 0.026, mats.dark);
      rod(frame, [-0.4, 0, 0.06], [-0.53, 0, 0.06], 0.023, mats.dark);
    }

    const liner = part(ctx, {
      id: `combustor-liner-${number}`, name: `Combustion liner ${String(number).padStart(2, '0')}`,
      system: 'combustion', kind: 'detail', sourceTime: 736,
      description: 'DLN1 liner with multi-nozzle cap, Venturi, cooling rings and three downstream dilution ports. The aft end slips into the transition piece to accommodate expansion.',
      facts: [['Cooling', 'Film and impingement'], ['Dilution ports', '3'], ['Liner support', '3 forward stops']],
      explode: [0.08, vector[1] * 1.13, vector[2] * 1.13],
    });
    const linerFrame = canFrame(liner, angle);
    hollowTube(linerFrame, 0.01, 0.97, 0.237, 0.012, mats.liner, 40);
    for (let j = 0; j < 24; j++) ring(linerFrame, 0.045 + j * 0.0365, 0.246, 0.013, 0.021, mats.steel, 32);
    ring(linerFrame, 0.02, 0.242, 0.044, 0.055, mats.steel, 32);
    lathe(linerFrame, [[0.27, 0.231], [0.365, 0.162], [0.45, 0.141],
      [0.59, 0.218], [0.60, 0.229], [0.46, 0.157], [0.373, 0.178],
      [0.29, 0.231]], mats.coating, 32);
    for (let j = 0; j < 3; j++) {
      port(linerFrame, 0.80, 0.243, j * TAU / 3, 0.040, mats.dark, mats.steel);
      box(linerFrame, [0.09, 0.047, 0.05], radial(0.047, 0.25, j * TAU / 3), mats.bolt).rotation.x = j * TAU / 3;
    }
    for (let j = 0; j < 6; j++) {
      port(linerFrame, 0.125, 0.244, j * TAU / 6 + 0.25, 0.022, mats.dark, mats.steel);
      port(linerFrame, 0.198, 0.244, j * TAU / 6, 0.017, mats.dark, mats.steel);
    }
    ring(linerFrame, 0.945, 0.247, 0.06, 0.025, mats.steel, 40);

    const transition = part(ctx, {
      id: `transition-${number}`, name: `Transition piece ${String(number).padStart(2, '0')}`,
      system: 'combustion', kind: 'detail', sourceTime: 1214,
      description: 'Curved round-to-sector duct joining one combustion liner to one fourteenth of the first-stage nozzle entrance. Includes inlet slip collar and aft support bracket.',
      facts: [['Quantity', '14'], ['Outlet', '1/14 of nozzle annulus'], ['Inner surface', 'Thermal barrier coating']],
      explode: [0.18, vector[1] * 0.62, vector[2] * 0.62],
    });
    mesh(transition, transitionGeometry(angle), mats.chamber);
    const collar = canFrame(transition, angle);
    ring(collar, 0.975, 0.259, 0.07, 0.035, mats.steel, 40);
    const lug = box(transition, [0.12, 0.10, 0.085], radial(1.65, 1.17, angle), mats.steel);
    lug.rotation.x = angle;
    rod(transition, radial(1.63, 1.16, angle), radial(1.70, 1.24, angle), 0.03, mats.bolt, 6);
    lathe(transition, [[1.705, 0.752], [1.76, 0.752], [1.76, 0.785],
      [1.705, 0.785], [1.705, 0.752]], mats.steel, 8, angle - Math.PI / 2 - TAU / 28, TAU / 14 - 0.018);
    lathe(transition, [[1.705, 1.07], [1.76, 1.07], [1.76, 1.109],
      [1.705, 1.109], [1.705, 1.07]], mats.steel, 8, angle - Math.PI / 2 - TAU / 28, TAU / 14 - 0.018);
  }

  const services = part(ctx, {
    id: 'combustor-crossfire-manifolds', name: 'Crossfire tubes and fuel manifolds',
    system: 'combustion', kind: 'detail', sourceTime: 898,
    description: 'Adjacent chambers are linked by male/female crossfire tubes and outer sleeves. Common fuel manifolds distribute fuel to all fourteen end covers.',
    facts: [['Crossfire connections', '14'], ['Ignition', 'Chambers 11 and 12'], ['Flame sensing', '14, 1, 2 and 3']],
    explode: [-0.25, 0, 0],
  });
  for (let i = 0; i < CAN_COUNT; i++) {
    const a = i * TAU / CAN_COUNT, b = (i + 1) * TAU / CAN_COUNT;
    rod(services, radial(0.05, 1.72, a), radial(0.05, 1.72, b), 0.053, mats.steel, 16);
    const center = (a + b) / 2;
    const mid = radial(0.05, 1.72 * Math.cos(Math.PI / CAN_COUNT), center);
    const tangent = new THREE.Vector3(0, -Math.sin(center), Math.cos(center));
    rod(services, new THREE.Vector3(...mid).addScaledVector(tangent, -0.035).toArray(),
      new THREE.Vector3(...mid).addScaledVector(tangent, 0.035).toArray(), 0.073, mats.bolt, 16);
    tube(services, [radial(-0.50, 2.09, a), radial(-0.48, 1.99, a),
      radial(-0.48, 1.82, a), radial(-0.44, 1.75, a)], 0.021, mats.fuel, 12);
  }
  ring(services, -0.50, 2.10, 0.035, 0.035, mats.fuel, 96);
  ring(services, -0.40, 2.10, 0.026, 0.026, mats.steel, 96);

  const stageCenters = [2.00, 2.52, 3.04];
  const tips = [1.085, 1.205, 1.325];
  const roots = [0.745, 0.735, 0.715];
  const chords = [0.19, 0.205, 0.235];
  const vaneCounts = [36, 48, 64];
  const nozzleTimes = [1498, 1628, 1765];
  const bladeTimes = [1872, 2004, 2122];
  for (let stage = 0; stage < 3; stage++) {
    const x = stageCenters[stage], tip = tips[stage], root = roots[stage];
    const rotor = part(ctx, {
      id: `turbine-wheel-${stage + 1}`, name: `Turbine stage ${stage + 1} / 92 buckets`,
      system: 'turbine', kind: 'rotor', sourceTime: bladeTimes[stage],
      description: stage === 0
        ? 'First turbine wheel with 92 thermal-barrier-coated, internally cooled buckets. Axial-entry dovetails attach the bucket shanks to the wheel rim.'
        : `Stage ${stage + 1} carries 92 interlocking tip-shrouded buckets with axial-entry dovetails and twist locks. ${stage === 1 ? 'The buckets are internally air cooled.' : 'The third-stage buckets are not internally air cooled.'}`,
      facts: [['Buckets', '92'], ['Tip', stage === 0 ? 'Unshrouded' : 'Interlocking shroud'],
        ['Cooling', stage < 2 ? 'Internal air cooling' : 'Uncooled']],
      explode: [0.38 + stage * 0.66, 0, 0],
    });
    lathe(rotor, [[x - 0.19, 0.24], [x - 0.16, 0.42], [x - 0.11, 0.64],
      [x - 0.10, root - 0.04], [x + 0.10, root - 0.04], [x + 0.10, 0.62],
      [x + 0.16, 0.42], [x + 0.19, 0.24], [x - 0.19, 0.24]], mats.dark, 80);
    ring(rotor, x, root + 0.019, 0.215, 0.07, mats.turbine, 92);
    bladeRow(rotor, x, 92, {root: root + 0.01, tip, chord: chords[stage],
      twist: 0.59 - stage * 0.045, sweep: 0.028, thickness: 0.15, camber: 0.19, lean: 0.025},
    stage === 0 ? mats.coating : mats.turbine, 0.012);
    bolts(rotor, x - 0.17, 0.475, 12, 0.045, mats.bolt, Math.PI / 12);
    if (stage > 0) {
      turbineShroud(rotor, x + 0.02, tip + 0.014, chords[stage] * 0.91, 92, mats.turbine);
      ring(rotor, x - 0.035, tip + 0.04, 0.014, 0.032, mats.steel, 92);
      ring(rotor, x + 0.065, tip + 0.04, 0.014, 0.032, mats.steel, 92);
    }
    for (let j = 0; j < 92; j++) {
      const angle = j / 92 * TAU;
      const lock = box(rotor, [0.017, 0.055, 0.02], radial(x - 0.117, root - 0.035, angle), mats.steel);
      lock.rotation.x = angle;
    }
    rotors.push(rotor);

    const nozzle = part(ctx, {
      id: `turbine-nozzle-${stage + 1}`, name: `Nozzle stage ${stage + 1} / ${vaneCounts[stage]} vanes`,
      system: 'turbine', kind: 'stator', sourceTime: nozzleTimes[stage],
      description: `Stationary nozzle ring with ${stage === 0 ? '18 twin-vane' : stage === 1 ? '16 triple-vane' : '16 four-vane'} cast segments. It accelerates and turns the hot gas before the rotating bucket row.`,
      facts: [['Vanes', String(vaneCounts[stage])], ['Segments', stage === 0 ? '18 x 2' : stage === 1 ? '16 x 3' : '16 x 4'],
        ['Cooling', stage < 2 ? 'Compressor discharge air' : 'Uncooled']],
      explode: [stage * 0.66 + 0.08, 0.72, 0],
    });
    const nozzleX = x - 0.265;
    bladeRow(nozzle, nozzleX, vaneCounts[stage], {root: root + 0.006, tip: tip + 0.016,
      chord: stage === 0 ? 0.245 : 0.29, twist: -0.59, sweep: 0.10, thickness: 0.12,
      camber: -0.18, lean: -0.024}, stage === 0 ? mats.coating : mats.stator);
    turbineShroud(nozzle, nozzleX, tip + 0.047, 0.24, stage === 0 ? 18 : 16, mats.stator);
    ring(nozzle, nozzleX, root + 0.008, 0.25, 0.063, mats.stator, 80);
    if (stage > 0) {
      ring(nozzle, nozzleX + 0.04, root - 0.015, 0.11, 0.24, mats.stator, 80);
      for (let k = 0; k < 4; k++) ring(nozzle, nozzleX - 0.01 + k * 0.029, root - 0.22,
        0.012, 0.034, mats.bolt, 64);
    }
  }

  const wheelSpacers = part(ctx, {
    id: 'turbine-spacers-studs', name: 'Wheel spacers and 12 through-studs',
    system: 'turbine', kind: 'rotor', sourceTime: 1821,
    description: 'Two wheel spacers establish the spacing of three turbine wheels. Twelve through-studs clamp the turbine rotor assembly.',
    facts: [['Wheel spacers', '2'], ['Through-studs', '12']], explode: [0.55, -0.6, 0],
  });
  for (const x of [2.265, 2.785]) {
    lathe(wheelSpacers, [[x - 0.14, 0.26], [x - 0.12, 0.54], [x - 0.06, 0.61],
      [x + 0.06, 0.61], [x + 0.12, 0.54], [x + 0.14, 0.26], [x - 0.14, 0.26]], mats.dark, 64);
    for (let k = 0; k < 4; k++) ring(wheelSpacers, x - 0.043 + k * 0.026, 0.629, 0.011, 0.03, mats.steel, 64);
  }
  for (let i = 0; i < 12; i++) rod(wheelSpacers,
    radial(1.69, 0.475, i * TAU / 12 + Math.PI / 12),
    radial(3.27, 0.475, i * TAU / 12 + Math.PI / 12), 0.027, mats.steel);
  rotors.push(wheelSpacers);

  for (const half of ['upper', 'lower']) {
    const casing = part(ctx, {
      id: `turbine-shell-${half}`, name: `Turbine shell / ${half}`,
      system: 'turbine', kind: 'casing', sourceTime: 1373,
      description: 'Split turbine shell supporting the three stationary nozzle rows and segmented shrouds. Its outer cooling passages limit shell distortion.',
      facts: [['Turbine stages', '3'], ['Construction', 'Horizontal split'], ['Cooling', 'External air passages']],
      explode: [0.25, half === 'upper' ? 2.05 : -0.8, 0],
    });
    splitCasing(casing, [[1.70, 1.26], [1.70, 1.36], [2.12, 1.36], [2.57, 1.47],
      [3.19, 1.60], [3.37, 1.60], [3.37, 1.48], [3.18, 1.48],
      [2.55, 1.35], [2.1, 1.25], [1.70, 1.26]], mats.casing, {half});
    casingFlanges(casing, [1.73, 3.33], [1.37, 1.60], half, mats.casing, mats.bolt);
    for (let j = 0; j < 7; j++) {
      const x = 1.89 + j * 0.205;
      const radius = 1.36 + Math.max(0, x - 2.10) * 0.217;
      splitCasing(casing, [[x - 0.022, radius - 0.008], [x - 0.022, radius + 0.04],
        [x + 0.022, radius + 0.04], [x + 0.022, radius - 0.008], [x - 0.022, radius - 0.008]], mats.steel, {half});
    }
    addJointRails(casing, 1.76, 3.33, [1.36, 1.60], half, mats.casing, mats.bolt);
    if (half === 'lower') {
      rod(casing, [2.0, -0.20, -1.3], [2.0, -0.20, -1.75], 0.11, mats.casing, 24);
      rod(casing, [2.0, -0.20, 1.3], [2.0, -0.20, 1.75], 0.11, mats.casing, 24);
    }
  }

  const exhaustFrame = part(ctx, {
    id: 'exhaust-frame-struts', name: 'Exhaust frame / 10 radial struts',
    system: 'exhaust', kind: 'stator', sourceTime: 2411,
    description: 'Ten structural radial struts link the exhaust outer cylinder to the inner cylinder that supports bearing 3. Airfoil fairings shield the struts from hot exhaust.',
    facts: [['Radial struts', '10'], ['Bearing', 'No. 3'], ['Cooling supply ports', '4']],
    explode: [1.9, 0, 0],
  });
  lathe(exhaustFrame, [[3.33, 0.70], [3.53, 0.63], [4.10, 0.56],
    [4.60, 0.59], [4.63, 0.53], [4.08, 0.50], [3.53, 0.57],
    [3.33, 0.64], [3.33, 0.70]], mats.exhaust, 72);
  bladeRow(exhaustFrame, 3.97, 10, {root: 0.56, tip: 1.64, chord: 0.43,
    twist: 0, sweep: 0.13, thickness: 0.19, camber: 0.015}, mats.exhaust, Math.PI / 10);
  ring(exhaustFrame, 3.45, 1.57, 0.11, 0.12, mats.exhaust);
  ring(exhaustFrame, 4.36, 1.75, 0.12, 0.12, mats.exhaust);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * TAU / 4;
    rod(exhaustFrame, radial(3.70, 1.62, a), radial(3.70, 1.89, a), 0.105, mats.exhaust, 24);
    rod(exhaustFrame, radial(3.70, 1.88, a), radial(3.70, 1.93, a), 0.151, mats.steel, 24);
  }

  for (const half of ['upper', 'lower']) {
    const exhaustShell = part(ctx, {
      id: `exhaust-diffuser-${half}`, name: `Exhaust diffuser / ${half}`,
      system: 'exhaust', kind: 'casing', sourceTime: 2561,
      description: 'The divergent annular exhaust passage slows the turbine exit flow. Split inner and outer fabricated surfaces allow access to the exhaust frame and bearing area.',
      facts: [['Passage', 'Divergent annular diffuser'], ['Exit flow', 'Axial to radial']],
      explode: [2.0, half === 'upper' ? 1.5 : -0.65, 0],
    });
    splitCasing(exhaustShell, [[3.35, 1.52], [3.35, 1.61], [4.28, 1.81],
      [4.79, 1.90], [5.12, 1.94], [5.12, 1.86], [4.76, 1.82],
      [4.24, 1.73], [3.35, 1.52]], mats.exhaust, {half});
    casingFlanges(exhaustShell, [3.37, 4.43], [1.61, 1.85], half, mats.exhaust, mats.bolt);
    addJointRails(exhaustShell, 3.44, 5.06, [1.63, 1.94], half, mats.exhaust, mats.bolt);
  }

  const turning = part(ctx, {
    id: 'exhaust-turning-vanes', name: 'Exhaust turning vanes / 5 rings',
    system: 'exhaust', kind: 'stator', sourceTime: 2585,
    description: 'Five concentric turning vanes at the aft diffuser turn exhaust from the axial direction into the radial exhaust plenum. The center remains open for the generator load coupling.',
    facts: [['Turning vanes', '5'], ['Flow deflection', 'Axial to radial'], ['Center', 'Load coupling tunnel']],
    explode: [2.6, 0, 0],
  });
  for (let i = 0; i < 5; i++) {
    const radius = 0.69 + i * 0.225;
    const x = 4.42 + i * 0.11;
    lathe(turning, [[x, radius], [x + 0.19, radius + 0.006], [x + 0.34, radius + 0.065],
      [x + 0.43, radius + 0.17], [x + 0.455, radius + 0.33],
      [x + 0.426, radius + 0.33], [x + 0.40, radius + 0.18],
      [x + 0.32, radius + 0.09], [x + 0.18, radius + 0.035],
      [x, radius + 0.028], [x, radius]], mats.steel, 96);
  }
  for (const record of ctx.parts.slice(firstPart)) mergePartMeshes(record.group);
  return {rotors};
}

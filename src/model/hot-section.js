import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {
  TAU, palette, material, part, mesh, lathe, ring, box, rod,
  bolts, bladeRow, splitCasing, hollowTube,
} from './helpers.js';
import {piercedSleeve, piercedPlate, hollowRod, cooledBladeRow, cooledNozzleRow, nozzleOuterPlatform} from './hot-channels.js';
import {subtractGeometry} from './csg.js';

const CANT = 13 * Math.PI / 180;
const CAN_COUNT = 14;
const CANT_COS = Math.cos(CANT);
const CANT_SIN = Math.sin(CANT);

function radial(x, radius, angle) {
  return [x, Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function studBores(object, x0, x1) {
  const cutters = Array.from({length: 12}, (_, i) => {
    const a = i * TAU / 12 + Math.PI / 12;
    const geometry = new THREE.CylinderGeometry(0.030, 0.030, x1 - x0, 16);
    geometry.rotateZ(-Math.PI / 2);
    geometry.translate((x0 + x1) / 2, Math.cos(a) * 0.475, Math.sin(a) * 0.475);
    return geometry;
  });
  const original = object.geometry;
  object.geometry = subtractGeometry(original, cutters);
  original.dispose(); cutters.forEach(g => g.dispose());
}

function canFrame(parent, angle, x = -0.08, radius = 1.75) {
  const group = new THREE.Group();
  group.position.set(...radial(x, radius, angle));
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
    new THREE.Vector3(CANT_COS, -CANT_SIN * Math.cos(angle), -CANT_SIN * Math.sin(angle)),
    new THREE.Vector3(CANT_SIN, CANT_COS * Math.cos(angle), CANT_COS * Math.sin(angle)),
    new THREE.Vector3(0, -Math.sin(angle), Math.cos(angle)),
  ));
  parent.add(group);
  return group;
}

function port(parent, x, radius, angle, bore, rim) {
  return hollowRod(parent, radial(x, radius - 0.003, angle),
    radial(x, radius + 0.018, angle), bore + 0.008, bore, rim);
}

// Loft a hollow round inlet into one fourteenth of the annular nozzle entrance.
function transitionGeometry(angle) {
  const n = 48;
  const stations = [
    [0.825, 1.541, 0], [0.873, 1.530, 0], [1.04, 1.47, 0.12], [1.21, 1.30, 0.44],
    [1.43, 1.095, 0.80], [1.59, 0.928, 1],
  ];
  const positions = [], indices = [];
  for (let skin = 0; skin < 2; skin++) {
    const inset = skin * 0.014;
    for (const [x, centerR, blend] of stations) {
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU;
        const c = Math.cos(a), s = Math.sin(a);
        const circleR = c * (0.254 - inset);
        const circleT = s * (0.254 - inset);
        const sectorR = Math.sign(c) * Math.pow(Math.abs(c), 0.28) * (0.171 - inset);
        const sectorAngle = Math.sign(s) * Math.pow(Math.abs(s), 0.28) * (TAU / CAN_COUNT / 2 - 0.009 - inset * 0.6);
        const rr = centerR + circleR * (1 - blend) + sectorR * blend;
        const tangential = circleT * (1 - blend);
        const theta = angle + sectorAngle * blend;
        positions.push(
          x + circleR * CANT_SIN * (1 - blend),
          (rr - circleR * (1 - CANT_COS) * (1 - blend)) * Math.cos(theta) - tangential * Math.sin(angle),
          (rr - circleR * (1 - CANT_COS) * (1 - blend)) * Math.sin(theta) + tangential * Math.cos(angle),
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
    splitCasing(wrapper, [[-0.16, 2.10], [0.42, 2.10], [0.86, 1.96],
      [1.41, 1.69], [1.70, 1.36], [1.70, 1.26], [1.40, 1.59],
      [0.82, 1.86], [0.37, 2.00], [-0.16, 2.00], [-0.16, 2.10]], mats.casing, {half});
    piercedPlate(wrapper, {x0: 0.003, x1: 0.080, outer: 2.10, inner: 1.23,
      slope: -Math.tan(CANT), slopeRadius: 1.23, half, material: mats.casing,
      holes: Array.from({length: CAN_COUNT}, (_, i) => {
        const a = i * TAU / CAN_COUNT;
        return {y: 1.75 * Math.cos(a), z: 1.75 * Math.sin(a), radiusY: 0.302 / CANT_COS, radiusZ: 0.302, angle: a};
      })});
    wrapper.userData.channels = {coverBores: 7, coverBoreRadius: 0.302, sleeveRadius: 0.287};
    casingFlanges(wrapper, [-0.13, 1.70], [2.14, 1.36], half, mats.casing, mats.bolt);
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
  lathe(discharge, [[-0.20, 0.799], [0.12, 0.75], [0.58, 0.59],
    [1.16, 0.55], [1.57, 0.70], [1.65, 0.742], [1.65, 0.69],
    [1.13, 0.48], [0.52, 0.52], [0.08, 0.68], [-0.20, 0.784], [-0.20, 0.799]], mats.stator, 72);
  lathe(discharge, [[-0.20, 0.95875], [0.15, 1.10], [0.45, 1.165],
    [0.70, 1.23], [0.76, 1.23], [0.76, 1.255], [0.42, 1.205],
    [0.10, 1.14], [-0.20, 1.00875], [-0.20, 0.95875]], mats.stator, 72);
  ring(discharge, 0.44, 1.235, 0.11, 0.09, mats.steel, 72);
  for (let i = 0; i < 12; i++) {
    const angle = i * TAU / 12;
    const vane = box(discharge, [0.32, 0.55, 0.055], radial(0.44, 0.885, angle), mats.stator);
    vane.rotation.x = angle;
  }
  ring(discharge, 1.58, 0.746, 0.07, 0.11, mats.steel, 64);
  bolts(discharge, 1.62, 0.710, 24, 0.025, mats.bolt);
  discharge.userData.channels = {inletX: -0.20, inletOuterRadius: 0.95875, inletInnerRadius: 0.799,
    struts: 12, bearingBarrelMinimumBore: 0.48, nozzleSupportOuterRadius: 0.746};

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
    const crossfireHoles = [Math.PI / 2, -Math.PI / 2].map(a => ({x: 0.14, angle: a, bore: 0.055}));
    const admissionHoles = [0.65, 0.715, 0.78, 0.845].flatMap((x, row) =>
      Array.from({length: 12}, (_, j) => ({x, angle: (j + 0.5 * (row % 2)) * TAU / 12, bore: 0.022})));
    const sleeve = piercedSleeve(frame, {x0: -0.16, x1: 0.90, radius: 0.287, thickness: 0.018,
      holes: [...crossfireHoles, ...admissionHoles], material: mats.chamber});
    // The source shows an aft perforated, tapered air-entry sleeve at 12:21.
    const sleevePositions = sleeve.geometry.getAttribute('position');
    for (let v = 0; v < sleevePositions.count; v++) {
      const x = sleevePositions.getX(v), y = sleevePositions.getY(v), z = sleevePositions.getZ(v);
      const radius = Math.hypot(y, z), reduction = 0.027 * THREE.MathUtils.clamp((x - 0.745) / 0.155, 0, 1);
      sleevePositions.setXYZ(v, x, y * (radius - reduction) / radius, z * (radius - reduction) / radius);
    }
    sleeve.geometry.computeVertexNormals();
    const capHoles = Array.from({length: 6}, (_, j) => ({y: Math.cos(j * TAU / 6) * 0.167, z: Math.sin(j * TAU / 6) * 0.167, radius: 0.045}));
    piercedPlate(frame, {x0: -0.225, x1: -0.17, outer: 0.32, holes: [...capHoles, {y: 0, z: 0, radius: 0.052}], material: mats.steel});
    ring(frame, -0.155, 0.329, 0.063, 0.07, mats.steel, 40);
    bolts(frame, -0.265, 0.292, 12, 0.022, mats.bolt);
    ring(frame, 0.888, 0.263, 0.018, 0.019, mats.steel, 40);
    for (let k = 0; k < 6; k++) {
      const phi = k * TAU / 6;
      const nozzle = new THREE.Group();
      nozzle.position.set(0, Math.cos(phi) * 0.167, Math.sin(phi) * 0.167);
      frame.add(nozzle);
      lathe(nozzle, [[-0.31, 0.043], [0.055, 0.035], [0.055, 0.021], [-0.31, 0.029], [-0.31, 0.043]], mats.fuel, 24);
      ring(nozzle, -0.30, 0.063, 0.034, 0.026, mats.steel, 20);
      lathe(nozzle, [[-0.349, 0.036], [-0.31, 0.036], [-0.31, 0.024], [-0.349, 0.024], [-0.349, 0.036]], mats.bolt, 6);
      hollowTube(frame, [[-0.31, Math.cos(phi) * 0.17, Math.sin(phi) * 0.17],
        [-0.40, Math.cos(phi) * 0.18, Math.sin(phi) * 0.18],
        [-0.45, Math.cos(phi) * 0.105, Math.sin(phi) * 0.105]], 0.009, 0.003, mats.steel, 12);
    }
    lathe(frame, [[-0.46, 0.049], [0.60, 0.036], [0.65, 0.031], [0.65, 0.019],
      [0.60, 0.024], [-0.46, 0.037], [-0.46, 0.049]], mats.steel, 32);
    ring(frame, -0.345, 0.084, 0.043, 0.03, mats.chamber, 24);
    bolts(frame, -0.372, 0.065, 6, 0.012, mats.bolt);
    hollowTube(frame, [[-0.42, 0, 0], [-0.50, 0.08, 0], [-0.46, 0.37, 0]], 0.021, 0.006, mats.fuel, 16);
    port(frame, 0.14, 0.287, Math.PI / 2, 0.055, mats.steel);
    port(frame, 0.14, 0.287, -Math.PI / 2, 0.055, mats.steel);
    can.userData.channels = {sleeveInnerRadius: 0.269, linerOuterRadius: 0.246, airJacketRadialGap: 0.023,
      coverPenetrations: 7, crossfireBores: 2, sleeveAdmissionHoles: admissionHoles, admissionPatternEstimated: true};

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
    const linerHoles = [
      ...[Math.PI / 2, -Math.PI / 2].map(a => ({x: 0.14, angle: a, bore: 0.049})),
      ...Array.from({length: 3}, (_, j) => ({x: 0.80, angle: j * TAU / 3, bore: 0.040})),
      ...Array.from({length: 6}, (_, j) => ({x: 0.215, angle: j * TAU / 6 + 0.25, bore: 0.021})),
      ...Array.from({length: 6}, (_, j) => ({x: 0.275, angle: j * TAU / 6, bore: 0.016})),
    ];
    const slots = Array.from({length: 10}, (_, j) => 0.055 + j * 0.0365)
      .filter(x => linerHoles.every(h => Math.abs(h.x - x) > h.bore + 0.02));
    let from = 0.01;
    for (const end of [...slots, 0.97]) {
      piercedSleeve(linerFrame, {x0: from, x1: end, radius: 0.237, thickness: 0.012,
        holes: linerHoles.filter(h => h.x > from && h.x < end), material: mats.liner});
      if (end < 0.97) {
        // The open upstream lip feeds the real annular gap through the liner wall.
        lathe(linerFrame, [[end - 0.010, 0.246], [end + 0.011, 0.246],
          [end + 0.011, 0.236], [end + 0.008, 0.236], [end + 0.008, 0.240],
          [end - 0.010, 0.240], [end - 0.010, 0.246]], mats.steel, 48);
      }
      from = end + 0.003;
    }
    piercedPlate(linerFrame, {x0: 0.015, x1: 0.029, outer: 0.225, holes: [
      ...Array.from({length: 6}, (_, j) => ({y: Math.cos(j * TAU / 6) * 0.167, z: Math.sin(j * TAU / 6) * 0.167, radius: 0.052})),
      {y: 0, z: 0, radius: 0.060}], material: mats.coating});
    ring(linerFrame, 0.02, 0.242, 0.044, 0.055, mats.steel, 32);
    lathe(linerFrame, [[0.37, 0.231], [0.455, 0.158], [0.535, 0.231],
      [0.535, 0.219], [0.455, 0.146], [0.37, 0.219], [0.37, 0.231]], mats.coating, 48);
    for (let j = 0; j < 3; j++) {
      port(linerFrame, 0.80, 0.237, j * TAU / 3, 0.040, mats.steel);
      box(linerFrame, [0.09, 0.047, 0.05], radial(0.047, 0.25, j * TAU / 3), mats.bolt).rotation.x = j * TAU / 3;
    }
    for (let j = 0; j < 6; j++) {
      port(linerFrame, 0.215, 0.237, j * TAU / 6 + 0.25, 0.021, mats.steel);
      port(linerFrame, 0.275, 0.237, j * TAU / 6, 0.016, mats.steel);
    }
    for (const a of [Math.PI / 2, -Math.PI / 2]) port(linerFrame, 0.14, 0.237, a, 0.049, mats.steel);
    ring(linerFrame, 0.922, 0.240, 0.012, 0.015, mats.steel, 64);
    for (let finger = 0; finger < 96; finger++) {
      lathe(linerFrame, [[0.925, 0.238], [0.942, 0.240], [0.974, 0.240],
        [0.974, 0.237], [0.942, 0.237], [0.925, 0.235], [0.925, 0.238]],
      mats.steel, 2, finger * TAU / 96, TAU / 96 - 0.0015);
    }
    liner.userData.channels = {dilutionBores: 3, meteringBores: 12, crossfireBores: 2, capAirPassages: 7,
      filmSlots: slots.length, filmSlotWidth: 0.003, filmLipGap: 0.003, throatRadius: 0.146,
      filmSlotStations: slots, smoothAftStart: 0.535, sealFingers: 96, sealFingerCountEstimated: true};

    const transition = part(ctx, {
      id: `transition-${number}`, name: `Transition piece ${String(number).padStart(2, '0')}`,
      system: 'combustion', kind: 'detail', sourceTime: 1214,
      description: 'Curved round-to-sector duct joining one combustion liner to one fourteenth of the first-stage nozzle entrance. Includes inlet slip collar and aft support bracket.',
      facts: [['Quantity', '14'], ['Outlet', '1/14 of nozzle annulus'], ['Inner surface', 'Thermal barrier coating']],
      explode: [0.18, vector[1] * 0.62, vector[2] * 0.62],
    });
    mesh(transition, transitionGeometry(angle), mats.chamber);
    const collar = canFrame(transition, angle);
    ring(collar, 0.93, 0.268, 0.07, 0.027, mats.steel, 40);
    transition.userData.channels = {inletInnerRadius: 0.240, linerOuterRadius: 0.237, slipRadialGap: 0.003,
      outletX: 1.59, outletInnerRadius: 0.771, outletOuterRadius: 1.085};
    const lug = box(transition, [0.12, 0.10, 0.085], radial(1.51, 1.17, angle), mats.steel);
    lug.rotation.x = angle;
    rod(transition, radial(1.49, 1.16, angle), radial(1.56, 1.24, angle), 0.03, mats.bolt, 6);
    lathe(transition, [[1.565, 0.752], [1.61, 0.752], [1.61, 0.768],
      [1.565, 0.768], [1.565, 0.752]].reverse(), mats.steel, 8, angle - Math.PI / 2 - TAU / 28, TAU / 14 - 0.018);
    lathe(transition, [[1.565, 1.088], [1.61, 1.088], [1.61, 1.109],
      [1.565, 1.109], [1.565, 1.088]].reverse(), mats.steel, 8, angle - Math.PI / 2 - TAU / 28, TAU / 14 - 0.018);
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
    const crossfireX = -0.08 + 0.14 * CANT_COS, crossfireR = 1.75 - 0.14 * CANT_SIN;
    const point = (angle, tangentDistance) => new THREE.Vector3(...radial(crossfireX, crossfireR, angle))
      .add(new THREE.Vector3(0, -Math.sin(angle), Math.cos(angle)).multiplyScalar(tangentDistance));
    const start = point(a, 0.225), end = point(b, -0.225);
    hollowRod(services, start.toArray(), end.toArray(), 0.043, 0.036, mats.steel);
    hollowRod(services, point(a, 0.286).toArray(), point(b, -0.286).toArray(), 0.066, 0.054, mats.chamber);
    const center = (a + b) / 2;
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const tangent = end.clone().sub(start).normalize();
    hollowRod(services, mid.clone().addScaledVector(tangent, -0.035).toArray(),
      mid.clone().addScaledVector(tangent, 0.035).toArray(), 0.076, 0.066, mats.bolt);
    hollowTube(services, [radial(-0.50, 2.09, a), radial(-0.48, 1.99, a),
      radial(-0.48, 1.82, a), radial(-0.44, 1.75, a)], 0.021, 0.006, mats.fuel, 16);
  }
  hollowTube(services, Array.from({length: 49}, (_, j) => radial(-0.50, 2.10, j * TAU / 48)), 0.021, 0.006, mats.fuel, 96);
  hollowTube(services, Array.from({length: 49}, (_, j) => radial(-0.40, 2.10, j * TAU / 48)), 0.016, 0.005, mats.steel, 96);
  services.userData.channels = {crossfireTubes: 14, innerTubeBore: 0.036, outerTubeBore: 0.054};

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
    const wheelHub = lathe(rotor, [[x - 0.16, 0.24], [x - 0.16, 0.42], [x - 0.11, 0.64],
      [x - 0.10, root - 0.04], [x + 0.10, root - 0.04], [x + 0.10, 0.62],
      [x + 0.16, 0.42], [x + 0.16, 0.24], [x - 0.16, 0.24]], mats.dark, 80);
    studBores(wheelHub, x - 0.23, x + 0.23);
    ring(rotor, x, root + 0.019, 0.215, 0.07, mats.turbine, 92);
    const rotorBlades = stage < 2 ? cooledBladeRow : bladeRow;
    rotorBlades(rotor, x, 92, {root: root + 0.01, tip, chord: chords[stage],
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
    rotor.userData.clearances = {airfoilTip: tip, tipSealOuterRadius: stage ? tip + 0.04 : tip,
      stationaryShroudInnerRadius: stage ? tip + 0.048 : tip + 0.012};
    rotor.userData.channels = {coolingPassagesPerBucket: stage < 2 ? 3 : 0, topology: 'Representative spanwise passages, not OEM drill pattern'};

    const nozzle = part(ctx, {
      id: `turbine-nozzle-${stage + 1}`, name: `Nozzle stage ${stage + 1} / ${vaneCounts[stage]} vanes`,
      system: 'turbine', kind: 'stator', sourceTime: nozzleTimes[stage],
      description: `Stationary nozzle ring with ${stage === 0 ? '18 twin-vane' : stage === 1 ? '16 triple-vane' : '16 four-vane'} cast segments. It accelerates and turns the hot gas before the rotating bucket row.`,
      facts: [['Vanes', String(vaneCounts[stage])], ['Segments', stage === 0 ? '18 x 2' : stage === 1 ? '16 x 3' : '16 x 4'],
        ['Cooling', stage < 2 ? 'Compressor discharge air' : 'Uncooled']],
      explode: [stage * 0.66 + 0.08, 0.72, 0],
    });
    const nozzleX = x - [0.290, 0.315, 0.330][stage];
    const nozzleParams = {root: root + 0.006, tip: tip + 0.026,
      chord: stage === 0 ? 0.245 : 0.29, twist: -0.59, sweep: 0.10, thickness: 0.12,
      camber: -0.18, lean: -0.024};
    // Only the first-row Boolean mesh has the 20-micrometre numerical fin.
    // Keep the second row's stable 10-micrometre cleanup to avoid new slivers.
    if (stage < 2) cooledNozzleRow(nozzle, nozzleX, vaneCounts[stage], nozzleParams,
      stage === 0 ? mats.coating : mats.stator, stage === 0 ? 0.00002 : 0.00001);
    else bladeRow(nozzle, nozzleX, vaneCounts[stage], nozzleParams, mats.stator);
    if (stage < 2) nozzleOuterPlatform(nozzle, nozzleX, nozzleParams, vaneCounts[stage], stage ? 16 : 18,
      mats.stator, mats.steel, stage === 0);
    else turbineShroud(nozzle, nozzleX, tip + 0.047, 0.24, 16, mats.stator);
    ring(nozzle, nozzleX, root + 0.008, stage === 0 ? 0.20 : 0.14, 0.063, mats.stator, 80);
    if (stage > 0) {
      ring(nozzle, nozzleX + 0.025, root - 0.015, 0.14, root - 0.015 - 0.643, mats.stator, 80);
      for (let k = 0; k < 4; k++) ring(nozzle, nozzleX - 0.01 + k * 0.029, 0.649,
        0.009, 0.012, mats.bolt, 64);
    }
    nozzle.userData.clearances = {centerX: nozzleX, rotorCenterX: x, estimatedAirfoilAxialGap: [0.0293, 0.0305, 0.0301][stage]};
    nozzle.userData.channels = {hollowPartitions: stage < 2, trailingEdgePortsPerVane: stage < 2 ? 11 : 0,
      impingementCover: stage === 0, topology: stage < 2 ? 'Hollow cavity and trailing-edge exits; inferred cavity contour and hole count' : 'Uncooled'};
  }

  const wheelSpacers = part(ctx, {
    id: 'turbine-spacers-studs', name: 'Wheel spacers and 12 through-studs',
    system: 'turbine', kind: 'rotor', sourceTime: 1821,
    description: 'Two wheel spacers establish the spacing of three turbine wheels. Twelve through-studs clamp the turbine rotor assembly.',
    facts: [['Wheel spacers', '2'], ['Through-studs', '12']], explode: [0.55, -0.6, 0],
  });
  for (const x of [2.26, 2.78]) {
    const spacer = lathe(wheelSpacers, [[x - 0.10, 0.26], [x - 0.10, 0.42], [x - 0.065, 0.61],
      [x + 0.065, 0.61], [x + 0.10, 0.42], [x + 0.10, 0.26], [x - 0.10, 0.26]], mats.dark, 64);
    studBores(spacer, x - 0.17, x + 0.17);
    for (let k = 0; k < 4; k++) ring(wheelSpacers, x - 0.043 + k * 0.026, 0.629, 0.011, 0.03, mats.steel, 64);
  }
  for (let i = 0; i < 12; i++) rod(wheelSpacers,
    radial(1.69, 0.475, i * TAU / 12 + Math.PI / 12),
    radial(3.27, 0.475, i * TAU / 12 + Math.PI / 12), 0.027, mats.steel);
  rotors.push(wheelSpacers);
  wheelSpacers.userData.clearances = {spacerSealOuterRadius: 0.629, diaphragmToothInnerRadius: 0.637,
    radialSealGap: 0.008, throughStudRadius: 0.027, studBoreRadius: 0.030,
    spacerCenters: [2.26, 2.78], spacerAxialHalfLength: 0.10, wheelAxialHalfLength: 0.16};

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
    for (let stage = 0; stage < 3; stage++) {
      const x = stageCenters[stage], inner = tips[stage] + (stage ? 0.048 : 0.012);
      const count = stage ? 16 : 18;
      const begin = half === 'upper' ? Math.PI : 0;
      // Stationary tip shrouds belong to the shell, not the rotating bucket band.
      for (let segment = 0; segment < count / 2; segment++) {
        lathe(casing, [[x - 0.075, inner], [x - 0.075, inner + 0.050],
          [x + 0.15, inner + 0.050], [x + 0.15, inner], [x - 0.075, inner]],
        stage === 0 ? mats.coating : mats.stator, 10, begin + segment * TAU / count + 0.003, TAU / count - 0.006);
      }
      splitCasing(casing, [[x - 0.060, inner + 0.048], [x - 0.060, inner + 0.11],
        [x - 0.033, inner + 0.11], [x - 0.033, inner + 0.048], [x - 0.060, inner + 0.048]], mats.steel, {half});
    }
    casing.userData.clearances = {stationaryTipShrouds: 3, stageTipGaps: [0.012, 0.008, 0.008]};
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
  const fairings = bladeRow(exhaustFrame, 3.97, 10, {root: 0.56, tip: 1.71, chord: 0.43,
    twist: 0, sweep: 0.13, thickness: 0.19, camber: 0.015}, mats.exhaust, Math.PI / 10);
  const fairingFrom = new THREE.Vector3(-0.025, 0.53, 0.0064), fairingTo = new THREE.Vector3(0.118, 1.74, 0.0045);
  const fairingAxis = fairingTo.clone().sub(fairingFrom);
  const fairingCutter = new THREE.CylinderGeometry(0.024, 0.024, fairingAxis.length(), 20);
  fairingCutter.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), fairingAxis.clone().normalize()));
  fairingCutter.translate(...fairingFrom.clone().add(fairingTo).multiplyScalar(0.5).toArray());
  const originalFairing = fairings.geometry;
  fairings.geometry = subtractGeometry(originalFairing, [fairingCutter]);
  fairings.geometry.userData.csg = true; fairings.userData.csgAirfoil = true;
  originalFairing.dispose(); fairingCutter.dispose();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 10 + i * TAU / 10;
    const from = fairingFrom.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), a).add(new THREE.Vector3(3.97, 0, 0));
    const to = fairingTo.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), a).add(new THREE.Vector3(3.97, 0, 0));
    hollowRod(exhaustFrame, from.toArray(), to.toArray(), 0.017, 0.010, mats.dark);
  }
  ring(exhaustFrame, 3.45, 1.64, 0.11, 0.08, mats.exhaust);
  ring(exhaustFrame, 4.36, 1.915, 0.12, 0.085, mats.exhaust);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * TAU / 4;
    hollowRod(exhaustFrame, radial(3.70, 1.62, a), radial(3.70, 1.89, a), 0.105, 0.077, mats.exhaust);
    hollowRod(exhaustFrame, radial(3.70, 1.88, a), radial(3.70, 1.93, a), 0.151, 0.077, mats.steel);
  }
  exhaustFrame.userData.channels = {coolingSupplyPorts: 4, supplyBoreRadius: 0.077, radialStruts: 10};

  for (const half of ['upper', 'lower']) {
    const exhaustShell = part(ctx, {
      id: `exhaust-diffuser-${half}`, name: `Exhaust diffuser / ${half}`,
      system: 'exhaust', kind: 'casing', sourceTime: 2561,
      description: 'The divergent annular exhaust passage slows the turbine exit flow. Split inner and outer fabricated surfaces allow access to the exhaust frame and bearing area.',
      facts: [['Passage', 'Divergent annular diffuser'], ['Exit flow', 'Axial to radial']],
      explode: [2.0, half === 'upper' ? 1.5 : -0.65, 0],
    });
    const shell = splitCasing(exhaustShell, [[3.35, 1.52], [3.35, 1.61], [4.28, 1.81],
      [4.55, 1.94], [4.72, 2.13], [4.82, 2.38], [4.90, 2.38],
      [4.797, 2.10], [4.60, 1.87], [4.30, 1.726], [3.35, 1.52]], mats.exhaust, {half});
    const sockets = [];
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * TAU / 4;
      if ((Math.cos(a) > 0) !== (half === 'upper')) continue;
      const cutter = new THREE.CylinderGeometry(0.079, 0.079, 0.44, 24);
      const direction = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
      cutter.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction));
      cutter.translate(...radial(3.70, 1.73, a));
      sockets.push(cutter);
    }
    const original = shell.geometry; shell.geometry = subtractGeometry(original, sockets);
    original.dispose(); sockets.forEach(g => g.dispose());
    casingFlanges(exhaustShell, [3.37, 4.43], [1.61, 1.85], half, mats.exhaust, mats.bolt);
    addJointRails(exhaustShell, 3.44, 4.30, [1.63, 1.82], half, mats.exhaust, mats.bolt);
    exhaustShell.userData.channels = {coolingSupplyBores: 2, boreRadius: 0.079, radialOutlet: true};
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
    const x = 4.86 - i * 0.11;
    lathe(turning, [[x, radius], [x + 0.19, radius + 0.006], [x + 0.34, radius + 0.065],
      [x + 0.43, radius + 0.17], [x + 0.455, radius + 0.33],
      [x + 0.426, radius + 0.33], [x + 0.40, radius + 0.18],
      [x + 0.32, radius + 0.09], [x + 0.18, radius + 0.035],
      [x, radius + 0.028], [x, radius]].reverse(), mats.steel, 96);
  }
  turning.userData.clearances = {turningRings: 5, axialStagger: -0.11, radialPitch: 0.225,
    centerTunnelRadius: 0.69, outletRadii: [1.02, 1.245, 1.47, 1.695, 1.92]};
  for (const record of ctx.parts.slice(firstPart)) mergePartMeshes(record.group);
  return {rotors};
}

import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {
  TAU, palette, material, part, mesh, cylinder, lathe, ring, box,
  rod, hollowTube, bolts, bladeRow, splitCasing,
} from './helpers.js';
import {subtractGeometry} from './csg.js';

const FIRST_STAGE = -3.92;
const LAST_STAGE = -0.68;
const STAGE_PITCH = (LAST_STAGE - FIRST_STAGE) / 16;
const TIP_RADIUS = 1.08075;

const rootAt = x => 0.665 + 0.101 * (x - FIRST_STAGE) / (LAST_STAGE - FIRST_STAGE);
const drumAt = x => rootAt(x) - 0.018;
function passageAt(x) {
  if (x <= LAST_STAGE) return TIP_RADIUS + 0.018 - 0.183 * (x - FIRST_STAGE) / (LAST_STAGE - FIRST_STAGE);
  return TIP_RADIUS - 0.183 + 0.018 + 0.043 * (x - LAST_STAGE) / (-0.20 - LAST_STAGE);
}

function mark(object, auditRole, data = {}) {
  object.name = auditRole;
  Object.assign(object.userData, {auditRole, ...data});
  return object;
}

function instances(parent, geometry, mat, placements) {
  const result = new THREE.InstancedMesh(geometry, mat, placements.length);
  const transform = new THREE.Object3D();
  placements.forEach(({position, rotation = [0, 0, 0], scale = [1, 1, 1]}, i) => {
    transform.position.set(...position);
    transform.rotation.set(...rotation);
    transform.scale.set(...scale);
    transform.updateMatrix();
    result.setMatrixAt(i, transform.matrix);
  });
  result.castShadow = true;
  result.receiveShadow = true;
  parent.add(result);
  return result;
}

function halfBolts(parent, x, radius, half, mat) {
  const placements = [];
  const direction = half === 'upper' ? 1 : -1;
  for (let i = 0; i < 20; i++) {
    const angle = Math.PI * (i + 0.5) / 20;
    placements.push({position: [x, direction * radius * Math.sin(angle), radius * Math.cos(angle)], rotation: [0, 0, Math.PI / 2]});
  }
  instances(parent, new THREE.CylinderGeometry(0.028, 0.028, 0.04, 6), mat, placements);
}

function splitRails(parent, x0, x1, r0, r1, half, mat, boltMaterial) {
  const sign = half === 'upper' ? 1 : -1;
  const length = x1 - x0;
  const placements = [];
  for (const side of [-1, 1]) {
    const rail = box(parent, [length, 0.085, 0.17], [(x0 + x1) / 2, sign * 0.047, side * (r0 + r1) / 2], mat);
    rail.rotation.y = -side * Math.atan2(r1 - r0, length);
    for (let i = 0; i < Math.ceil(length / 0.17); i++) {
      const t = (i + 0.5) / Math.ceil(length / 0.17);
      placements.push({position: [x0 + length * t, sign * 0.105, side * (r0 + (r1 - r0) * t)]});
    }
  }
  instances(parent, new THREE.CylinderGeometry(0.032, 0.032, 0.035, 6), boltMaterial, placements);
}

function casingProfile(x0, x1, r0, r1) {
  const inside = [[x0, passageAt(x0)]];
  for (const [left, right, depth] of [[-3.145, -3.035, 0.060], [-1.946, -1.84, 0.060]]) {
    if (left <= x0 || right >= x1) continue;
    inside.push([left, passageAt(left)], [left, passageAt(left) + depth],
      [right, passageAt(right) + depth], [right, passageAt(right)]);
  }
  for (let i = 0; i < 17; i++) {
    const x = FIRST_STAGE + STAGE_PITCH * i + 0.112;
    if (x - 0.028 <= x0 || x + 0.028 >= x1) continue;
    inside.push([x - 0.028, passageAt(x - 0.028)], [x - 0.028, passageAt(x) + 0.028],
      [x + 0.028, passageAt(x) + 0.028], [x + 0.028, passageAt(x + 0.028)]);
  }
  if (x0 < LAST_STAGE && x1 > LAST_STAGE) inside.push([LAST_STAGE, passageAt(LAST_STAGE)]);
  for (const x of [-0.435, -0.29]) {
    if (x < x0 || x > x1) continue;
    inside.push([x - 0.026, passageAt(x - 0.026)], [x - 0.026, passageAt(x) + 0.026],
      [x + 0.026, passageAt(x) + 0.026], [x + 0.026, passageAt(x + 0.026)]);
  }
  inside.push([x1, passageAt(x1)]);
  inside.sort((a, b) => a[0] - b[0]);
  return [
    [x0, passageAt(x0)], [x0, r0 + 0.11], [x0 + 0.07, r0 + 0.11],
    [x0 + 0.09, r0], [x1 - 0.09, r1], [x1 - 0.07, r1 + 0.11],
    [x1, r1 + 0.11], ...inside.reverse(),
  ];
}

function radialFrame(x, radius, angle) {
  const flange = new THREE.Group();
  flange.position.set(x, radius * Math.cos(angle), radius * Math.sin(angle));
  flange.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, Math.cos(angle), Math.sin(angle)));
  return flange;
}

function bleedCut(x, angle, bore) {
  const geometry = new THREE.CylinderGeometry(bore, bore, 1.0, 48, 1);
  const frame = radialFrame(x, 1.2, angle);
  geometry.rotateZ(-Math.PI / 2);
  frame.updateMatrix();
  geometry.applyMatrix4(frame.matrix);
  return geometry;
}

function addBleedPort(parent, x, angle, radius, mat, boltMaterial, size = 0.095) {
  const bore = size * 0.7;
  const flange = radialFrame(x, radius, angle);
  mark(lathe(flange, [[0, bore], [0, size], [0.228, size], [0.228, size * 1.62],
    [0.275, size * 1.62], [0.275, bore], [0, bore]], mat, 48), 'compressor-bleed-duct', {bore, angle, station: x});
  bolts(flange, 0.294, size * 1.25, 6, 0.018, boltMaterial);
  parent.add(flange);
}

function wheelWeb(parent, x, radius, mat) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, TAU, false);
  for (const [y, z, r] of [[0, 0, 0.215], ...Array.from({length: 16}, (_, i) =>
    [0.48 * Math.cos(TAU * i / 16), 0.48 * Math.sin(TAU * i / 16), 0.029])]) {
    const hole = new THREE.Path();
    hole.absarc(y, z, r, 0, TAU, true);
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {depth: 0.07, bevelEnabled: false, curveSegments: 16});
  geometry.rotateY(Math.PI / 2);
  // In the rotated sketch plane, local X becomes -Z and local Y becomes Y.
  geometry.rotateX(Math.PI / 2);
  geometry.translate(x - 0.035, 0, 0);
  return mark(mesh(parent, geometry, mat), 'compressor-wheel-web', {station: x, tieBoltHoles: 16, tieBoltBore: 0.029});
}

function annularSegments(parent, x, radius, width, thickness, count, phase, mat, auditRole) {
  const arc = TAU / count - 0.002;
  const prototype = lathe(new THREE.Group(), [[-width / 2, radius - thickness], [-width / 2, radius],
    [width / 2, radius], [width / 2, radius - thickness], [-width / 2, radius - thickness]],
  mat, 12, -Math.PI / 2 - arc / 2, arc);
  return mark(instances(parent, prototype.geometry, mat,
    Array.from({length: count}, (_, i) => ({position: [x, 0, 0], rotation: [phase + TAU * i / count, 0, 0]}))),
  auditRole, {station: x, count});
}

export function buildCompressor(ctx) {
  const steel = material(palette.steel, 0.82, 0.31);
  const diskSteel = material(0x7e949c, 0.78, 0.36);
  const bladeSteel = material(palette.compressor, 0.83, 0.27);
  const statorSteel = material(palette.stator, 0.72, 0.38);
  const shellMaterial = material(palette.casing, 0.58, 0.48);
  const inletMaterial = material(palette.inlet, 0.56, 0.44);
  const darkSteel = material(palette.dark, 0.72, 0.37);
  const boltMaterial = material(palette.bolt, 0.75, 0.35);
  const bronze = material(0xb5a271, 0.7, 0.4);
  const rotors = [];

  const assembly = part(ctx, {
    id: 'compressor-stub-shafts', name: 'Compressor stub shafts & tie bolts', system: 'compressor', kind: 'rotor',
    description: 'Two stub shafts and sixteen axial tie bolts clamp the seventeen compressor wheels. The forward stub includes the thrust collar, journal, auxiliary drive flange and speed ring.',
    facts: [['Construction', '15 wheels + 2 integral stub-shaft wheels'], ['Tie bolts', '16'], ['Forward journal', '400 mm diameter (BHEL reference)'], ['Speed ring', '60 teeth']],
    explode: [-1.0, -0.12, 0], sourceTime: 98,
  });
  rotors.push(assembly);
  mark(cylinder(assembly, -5.75, -4.52, 0.2, 0.2, steel, 64), 'compressor-forward-journal', {radius: 0.2});
  lathe(assembly, [[-4.52, 0.19], [-4.52, 0.20], [-4.31, 0.42], [-4.105, 0.545],
    [-4.023, drumAt(-4.023)], [FIRST_STAGE - 0.035, 0.620], [FIRST_STAGE - 0.035, 0.19], [-4.52, 0.19]], diskSteel, 72);
  ring(assembly, -5.64, 0.32, 0.09, 0.16, steel);
  bolts(assembly, -5.70, 0.265, 12, 0.029, boltMaterial);
  mark(ring(assembly, -5.22, 0.335, 0.075, 0.145, steel), 'compressor-thrust-runner', {station: -5.22, width: 0.075, radius: 0.335});
  ring(assembly, -5.50, 0.356, 0.045, 0.17, darkSteel);
  instances(assembly, new THREE.BoxGeometry(0.057, 0.032, 0.017), steel,
    Array.from({length: 60}, (_, i) => {
      const angle = TAU * i / 60;
      return {position: [-5.50, 0.361 * Math.cos(angle), 0.361 * Math.sin(angle)], rotation: [angle, 0, 0]};
    }));
  cylinder(assembly, LAST_STAGE + STAGE_PITCH / 2, -0.37, drumAt(LAST_STAGE + STAGE_PITCH / 2), 0.38, diskSteel);
  cylinder(assembly, -0.37, 0.14, 0.30, 0.22, steel);
  ring(assembly, 0.095, 0.4, 0.095, 0.2, steel);
  bolts(assembly, 0.151, 0.328, 16, 0.03, boltMaterial);
  for (let i = 0; i < 9; i++) ring(assembly, -0.365 + i * 0.033, 0.321, 0.012, 0.03, steel);
  for (let i = 0; i < 16; i++) {
    const angle = TAU * i / 16;
    rod(assembly, [FIRST_STAGE - 0.035, 0.48 * Math.cos(angle), 0.48 * Math.sin(angle)], [LAST_STAGE + 0.035, 0.48 * Math.cos(angle), 0.48 * Math.sin(angle)], 0.025, steel);
  }
  bolts(assembly, FIRST_STAGE - 0.055, 0.48, 16, 0.041, boltMaterial);
  bolts(assembly, LAST_STAGE + 0.055, 0.48, 16, 0.041, boltMaterial);
  for (let i = 0; i < 16; i++) {
    const angle = TAU * (i + 0.5) / 16;
    const vane = box(assembly, [0.044, 0.20, 0.012], [-0.782, 0.53 * Math.cos(angle), 0.53 * Math.sin(angle)], diskSteel);
    vane.rotation.x = angle;
    mark(vane, 'compressor-aft-cooling-fan', {bladeCountEstimated: true});
  }

  for (let i = 0; i < 17; i++) {
    const stage = i + 1;
    const ratio = i / 16;
    const x = FIRST_STAGE + STAGE_PITCH * i;
    const root = rootAt(x);
    const tip = TIP_RADIUS - 0.183 * ratio;
    const count = 48 + 4 * Math.floor(i / 2);
    const rotor = part(ctx, {
      id: `compressor-rotor-${stage}`, name: `Compressor rotor · stage ${String(stage).padStart(2, '0')}`, system: 'compressor', kind: 'rotor',
      description: 'Cambered rotor airfoils accelerate the air. The annular wheel web has sixteen actual tie-bolt bores; rim and spacer lands form a continuous rotor drum. Airfoil profiles, axial clearances and per-row blade counts remain reconstructed estimates.',
      facts: [['Stage', `${stage} of 17`], ['Row', 'Rotating'], ['Blade count', `${count} rendered / estimated`], ['Assembly', stage === 1 ? 'Forward stub integral wheel' : stage === 17 ? 'Aft stub integral wheel' : 'Individual wheel and spacers']],
      explode: [-2.4 + ratio * 2.5, 0, 0], sourceTime: 98,
    });
    wheelWeb(rotor, x, root - 0.045, diskSteel);
    const left = x - STAGE_PITCH / 2, right = x + STAGE_PITCH / 2;
    mark(lathe(rotor, [[left, root - 0.045], [left, drumAt(left)], [x - 0.048, drumAt(x - 0.048)],
      [x - 0.044, root - 0.021], [x + 0.044, root - 0.021], [x + 0.048, drumAt(x + 0.048)],
      [right, drumAt(right)], [right, root - 0.045], [left, root - 0.045]], diskSteel, 72),
    'compressor-drum-rim', {station: x, left, right, leftRadius: drumAt(left), rightRadius: drumAt(right)});
    annularSegments(rotor, x, root, 0.098, 0.028, count, i * 0.015, steel, 'compressor-blade-platforms');
    mark(bladeRow(rotor, x, count, {root, tip, chord: 0.123 - ratio * 0.020, twist: 0.68 - ratio * 0.15, sweep: 0.015, thickness: 0.095, camber: 0.07, lean: 0.018}, bladeSteel, i * 0.015),
      'compressor-rotor-airfoil', {stage, station: x});
    rotors.push(rotor);

    const stator = part(ctx, {
      id: `compressor-stator-${stage}`, name: `Compressor stator · stage ${String(stage).padStart(2, '0')}`, system: 'compressor', kind: 'stator',
      description: 'The stationary airfoils turn the compressor flow and recover pressure between rotor rows. First-eight-stage vanes use carrier ring segments; later rows mount directly in casing grooves.',
      facts: [['Stage', `${stage} of 17`], ['Row', 'Stationary'], ['Airfoil geometry', 'Reconstructed'], ['Mounting', stage <= 8 ? 'Dovetails in carrier ring segments' : 'Square-base dovetails in casing grooves']],
      explode: [-2.4 + ratio * 2.5 + 0.035, 0.0, 0], sourceTime: 520,
    });
    const sx = x + 0.112, outer = passageAt(sx);
    mark(bladeRow(stator, sx, count + 6, {root: drumAt(sx) + 0.012, tip: outer - 0.007, chord: 0.093 - ratio * 0.014, twist: -0.64, sweep: -0.006, thickness: 0.085, camber: -0.06}, statorSteel, 0.031),
      'compressor-stator-airfoil', {stage, station: sx, nominalDrumGap: 0.012});
    annularSegments(stator, sx, outer + 0.027, 0.054, 0.036, stage <= 8 ? 8 : count + 6, 0.031,
      statorSteel, stage <= 8 ? 'compressor-stator-carrier' : 'compressor-stator-dovetail-bases');
  }

  const exitGuides = part(ctx, {
    id: 'compressor-exit-guides', name: 'Exit guide vanes · EGV 1 & 2', system: 'compressor', kind: 'stator',
    description: 'Two stationary exit-guide-vane rows follow the seventeenth stage and remove residual swirl before the discharge diffuser.',
    facts: [['Rows', '2'], ['Location', 'After compressor stage 17'], ['Geometry', 'Reconstructed shrouded vanes']],
    explode: [0.6, 0, 0], sourceTime: 548,
  });
  for (const [i, x] of [-0.435, -0.29].entries()) {
    const inner = 0.777 + 0.022 * (x + 0.525) / 0.325 + 0.004, outer = passageAt(x);
    mark(bladeRow(exitGuides, x, 80, {root: inner, tip: outer - 0.007, chord: 0.092, twist: -0.2, sweep: 0.005, thickness: 0.08, camber: 0.03}, statorSteel),
      'compressor-egv-airfoil', {row: i + 1, station: x});
    ring(exitGuides, x, outer + 0.025, 0.050, 0.034, statorSteel);
    ring(exitGuides, x, inner + 0.004, 0.062, 0.026, darkSteel);
  }
  mark(lathe(exitGuides, [[-0.525, 0.765], [-0.525, 0.777], [-0.20, 0.799],
    [-0.20, 0.784], [-0.525, 0.765]], darkSteel), 'compressor-egv-inner-diffuser');

  const casingSections = [
    {key: 'forward', title: 'Forward compressor casing', x0: -4.10, x1: -3.17, r0: 1.22, r1: 1.176, stages: '1-4', time: 306, distance: -1.9},
    {key: 'aft', title: 'Aft compressor casing', x0: -3.17, x1: -1.95, r0: 1.176, r1: 1.107, stages: '5-10', time: 332, distance: -0.7},
    {key: 'discharge', title: 'Compressor discharge casing', x0: -1.95, x1: -0.20, r0: 1.107, r1: 1.064, stages: '11-17 + EGV 1/2', time: 372, distance: 0.6},
  ];
  for (const section of casingSections) {
    for (const half of ['upper', 'lower']) {
      const sign = half === 'upper' ? 1 : -1;
      const shell = part(ctx, {
        id: `compressor-casing-${section.key}-${half}`, name: `${section.title} · ${half}`, system: 'compressor', kind: 'casing',
        description: 'Horizontally split, flange-bolted casing with a tapered internal gas path, fitted stator-carrier recesses and open cooling/surge bleed ports. The fitted reconstruction removes gross component overlaps; it does not specify OEM running clearances.',
        facts: [['Stator stages', section.stages], ['Split', 'Horizontal'], ['Shell dimensions', 'Reconstructed from source proportions']],
        explode: [section.distance, sign * 1.75, 0], sourceTime: section.time,
      });
      const profile = casingProfile(section.x0, section.x1, section.r0, section.r1);
      const body = mark(splitCasing(shell, profile, shellMaterial, {half}), 'compressor-casing-wall', {section: section.key, half});
      const ports = section.key === 'aft'
        ? [-Math.PI / 4, Math.PI / 4].map(angle => ({x: -3.06, angle: angle + (half === 'upper' ? 0 : Math.PI), radius: 1.174, size: 0.095}))
        : section.key === 'discharge'
          ? [{x: -1.90, angle: half === 'upper' ? 0.55 : Math.PI + 0.55, radius: 1.106, size: 0.13}]
          : [];
      if (ports.length) {
        body.geometry = subtractGeometry(body.geometry, ports.map(({x, angle, size}) => bleedCut(x, angle, size * 0.7)));
        body.userData.ports = ports.map(({x, angle, size}) => ({station: x, angle, bore: size * 0.7}));
      }
      splitRails(shell, section.x0 + 0.08, section.x1 - 0.08, section.r0 + 0.028, section.r1 + 0.028, half, shellMaterial, boltMaterial);
      halfBolts(shell, section.x0 - 0.019, section.r0 + 0.055, half, boltMaterial);
      halfBolts(shell, section.x1 + 0.019, section.r1 + 0.055, half, boltMaterial);
      for (let j = 0; j < 3; j++) {
        const x = section.x0 + (section.x1 - section.x0) * (j + 1) / 4;
        const radius = section.r0 + (section.r1 - section.r0) * (j + 1) / 4;
        const ribProfile = [[x - 0.022, radius], [x - 0.022, radius + 0.043], [x + 0.022, radius + 0.043], [x + 0.022, radius], [x - 0.022, radius]];
        splitCasing(shell, ribProfile, shellMaterial, {half});
      }
      for (const {x, angle, radius, size} of ports) addBleedPort(shell, x, angle, radius, inletMaterial, boltMaterial, size);
      if (section.key === 'forward' && half === 'lower') {
        for (const side of [-1, 1]) {
          rod(shell, [-3.83, -0.19, side * 1.15], [-3.83, -0.19, side * 1.53], 0.12, darkSteel, 24);
          box(shell, [0.35, 0.28, 0.16], [-3.84, -0.2, side * 1.22], shellMaterial);
        }
      }
      for (let j = 0; j < 2; j++) {
        const x = section.x0 + (j + 0.7) * (section.x1 - section.x0) / 2.4;
        const a = half === 'upper' ? 0.82 : Math.PI + 0.82;
        const radius = (section.r0 + section.r1) / 2;
        rod(shell, [x, radius * Math.cos(a), radius * Math.sin(a)], [x, (radius + 0.085) * Math.cos(a), (radius + 0.085) * Math.sin(a)], 0.042, boltMaterial, 6);
      }
    }
  }

  const guideVanes = part(ctx, {
    id: 'inlet-guide-vanes', name: '64 variable inlet guide vanes', system: 'inlet', kind: 'stator',
    description: 'Sixty-four inlet guide vanes meter compressor airflow. Pinion gears on the vane stems engage the circumferential control ring, moved by a hydraulic actuator.',
    facts: [['Vanes', '64'], ['Opening range', '34-84 degrees'], ['Inner supports', '16 segments, four vanes each'], ['Geometry', 'Reconstructed at an intermediate opening']],
    explode: [-2.8, 0, 0], sourceTime: 244,
  });
  mark(bladeRow(guideVanes, -4.19, 64, {root: 0.575, tip: 1.105, chord: 0.170, twist: -0.28, sweep: 0.010, thickness: 0.09, camber: 0.035}, steel),
    'compressor-igv-airfoil', {station: -4.19});
  for (let i = 0; i < 16; i++) {
    mark(lathe(guideVanes, [[-4.28, 0.558], [-4.28, 0.584], [-4.10, 0.584], [-4.10, 0.558], [-4.28, 0.558]],
      darkSteel, 12, TAU * i / 16 + 0.0015, TAU / 16 - 0.003), 'compressor-igv-inner-segment', {segment: i + 1});
  }
  const igvStemCuts = mergeGeometries(Array.from({length: 64}, (_, i) => bleedCut(-4.19, TAU * i / 64, 0.014)), false);
  const outerSeat = ring(guideVanes, -4.19, 1.149, 0.120, 0.047, inletMaterial);
  outerSeat.geometry = subtractGeometry(outerSeat.geometry, [igvStemCuts]);
  mark(outerSeat, 'compressor-igv-stem-support', {boreCount: 64, stemRadius: 0.012, boreRadius: 0.014});
  ring(guideVanes, -4.19, 1.279, 0.062, 0.046, bronze);
  ring(guideVanes, -4.21, 1.309, 0.058, 0.03, steel);
  const stems = [], pinions = [], teeth = [];
  for (let i = 0; i < 64; i++) {
    const angle = TAU * i / 64;
    const rotation = [angle, 0, 0];
    stems.push({position: [-4.19, 1.162 * Math.cos(angle), 1.162 * Math.sin(angle)], rotation});
    pinions.push({position: [-4.19, 1.233 * Math.cos(angle), 1.233 * Math.sin(angle)], rotation});
    for (let tooth = 0; tooth < 7; tooth++) {
      const t = TAU * tooth / 7;
      const tangent = Math.sin(t) * 0.054;
      teeth.push({position: [-4.19 + Math.cos(t) * 0.054, 1.233 * Math.cos(angle) - tangent * Math.sin(angle), 1.233 * Math.sin(angle) + tangent * Math.cos(angle)], rotation: [angle, t, 0]});
    }
  }
  instances(guideVanes, new THREE.CylinderGeometry(0.012, 0.012, 0.20, 8), steel, stems);
  instances(guideVanes, new THREE.CylinderGeometry(0.052, 0.052, 0.037, 14), bronze, pinions);
  instances(guideVanes, new THREE.BoxGeometry(0.024, 0.039, 0.021), bronze, teeth);
  bolts(guideVanes, -4.298, 0.572, 16, 0.016, boltMaterial);

  const actuator = part(ctx, {
    id: 'igv-actuator', name: 'IGV hydraulic actuator & linkage', system: 'inlet', kind: 'detail',
    description: 'Hydraulic actuator and short tangential linkage position the inlet-guide-vane control ring. The linkage layout is a visual reconstruction.',
    facts: [['Actuation', 'Hydraulic'], ['Driven assembly', 'IGV control ring']], explode: [-2.4, -0.5, 1.0], sourceTime: 291,
  });
  rod(actuator, [-4.05, -0.42, 1.25], [-3.65, -0.95, 1.25], 0.088, inletMaterial, 24);
  rod(actuator, [-4.05, -0.42, 1.25], [-4.25, -0.15, 1.25], 0.035, steel, 16);
  box(actuator, [0.14, 0.16, 0.2], [-4.20, -0.19, 1.25], steel);
  box(actuator, [0.3, 0.15, 0.22], [-3.64, -0.99, 1.25], shellMaterial);
  const mountAngle = Math.atan2(1.25, -0.99);
  const mount = box(actuator, [0.25, 0.42, 0.10], [-3.64, 1.41 * Math.cos(mountAngle), 1.41 * Math.sin(mountAngle)], shellMaterial);
  mount.rotation.x = mountAngle;
  for (const z of [1.29, 1.34]) hollowTube(actuator, [[-3.68, -0.82, z], [-3.47, -0.77, z], [-3.4, -1.12, z]], 0.016, 0.004, darkSteel, 16);

  for (const half of ['upper', 'lower']) {
    const sign = half === 'upper' ? 1 : -1;
    const inlet = part(ctx, {
      id: `inlet-casing-${half}`, name: `Radial inlet casing · ${half}`, system: 'inlet', kind: 'casing',
      description: 'Industrial radial-inlet collector, internal bellmouth and bearing support structure. Air enters around the inlet casing and turns downstream into the axial compressor.',
      facts: [['Inlet type', 'Radial collector'], ['Supports', 'No. 1 bearing and variable IGVs'], ['Envelope', 'Reconstructed from section references']],
      explode: [-3.1, sign * 1.6, 0], sourceTime: 244,
    });
    const frontPlate = [[-5.21, 0.465], [-5.21, 1.38], [-5.10, 1.38], [-5.10, 0.465], [-5.21, 0.465]];
    mark(splitCasing(inlet, frontPlate, inletMaterial, {half}), 'compressor-inlet-front-plate', {bore: 0.465});
    const turningWall = [[-5.1, 0.94], [-4.96, 0.84], [-4.78, 0.71], [-4.55, 0.62], [-4.28, 0.584],
      [-4.28, 0.558], [-4.56, 0.57], [-4.8, 0.655], [-4.99, 0.79], [-5.1, 0.88], [-5.1, 0.94]];
    mark(splitCasing(inlet, turningWall, steel, {half}), 'compressor-inlet-inner-turning-wall');
    const lip = [[-4.78, 1.37], [-4.60, 1.31], [-4.45, 1.21], [-4.33, 1.12],
      [-4.253, 1.107], [-4.253, 1.152], [-4.127, 1.152], [-4.127, 1.109], [-4.10, passageAt(-4.10)],
      [-4.10, 1.22], [-4.31, 1.22], [-4.44, 1.29], [-4.60, 1.39], [-4.77, 1.44], [-4.78, 1.37]];
    const bellmouth = splitCasing(inlet, lip, inletMaterial, {half});
    bellmouth.geometry = subtractGeometry(bellmouth.geometry, [igvStemCuts]);
    mark(bellmouth, 'compressor-inlet-bellmouth', {stemBores: 64});
    for (const side of [-1, 1]) for (const offset of [Math.PI / 8, 3 * Math.PI / 8]) {
      const angle = side * offset + (half === 'upper' ? 0 : Math.PI);
      const rib = box(inlet, [0.28, 0.20, 0.038], [-4.59, 1.39 * Math.cos(angle), 1.39 * Math.sin(angle)], inletMaterial);
      rib.rotation.x = angle;
      mark(rib, 'compressor-inlet-external-rib', {populationEstimated: true});
    }
    halfBolts(inlet, -5.232, 1.305, half, boltMaterial);
    splitRails(inlet, -5.2, -4.15, 1.35, 1.26, half, inletMaterial, boltMaterial);
    for (const side of [-1, 1]) {
      const angle = half === 'upper' ? side * Math.PI / 4 : Math.PI + side * Math.PI / 4;
      const r0 = 0.438, r1 = 1.38;
      const strut = box(inlet, [0.165, r1 - r0, 0.046],
        [-4.88, (r0 + r1) / 2 * Math.cos(angle), (r0 + r1) / 2 * Math.sin(angle)], inletMaterial);
      strut.rotation.x = angle;
      mark(strut, 'compressor-inlet-bearing-strap', {innerRadius: r0, outerRadius: r1});
    }
    if (half === 'lower') {
      box(inlet, [0.29, 0.29, 0.57], [-5.02, -1.40, 0], inletMaterial);
      hollowTube(inlet, [[-5.03, -1.44, 0], [-5.03, -1.62, 0], [-4.77, -1.62, 0]], 0.044, 0.008, darkSteel, 16);
    }
  }

  return {rotors};
}

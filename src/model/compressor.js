import * as THREE from 'three';
import {
  TAU, palette, material, part, mesh, cylinder, lathe, ring, box,
  rod, tube, bolts, bladeRow, splitCasing,
} from './helpers.js';

const FIRST_STAGE = -3.92;
const LAST_STAGE = -0.68;
const STAGE_PITCH = (LAST_STAGE - FIRST_STAGE) / 16;
const TIP_RADIUS = 1.08075;

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

function splitFaces(parent, profile, mat) {
  for (const side of [-1, 1]) {
    const shape = new THREE.Shape(profile.map(([x, radius]) => new THREE.Vector2(x, side * radius)));
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(Math.PI / 2);
    mesh(parent, geometry, mat);
  }
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
  return [
    [x0, r0 - 0.08], [x0, r0 + 0.11], [x0 + 0.07, r0 + 0.11],
    [x0 + 0.09, r0], [x1 - 0.09, r1], [x1 - 0.07, r1 + 0.11],
    [x1, r1 + 0.11], [x1, r1 - 0.08], [x0, r0 - 0.08],
  ];
}

function addBleedPort(parent, x, angle, radius, mat, boltMaterial, size = 0.095) {
  const from = [x, radius * Math.cos(angle), radius * Math.sin(angle)];
  const to = [x, (radius + 0.25) * Math.cos(angle), (radius + 0.25) * Math.sin(angle)];
  rod(parent, from, to, size, mat, 20);
  const flange = new THREE.Group();
  flange.position.set(...to);
  flange.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, Math.cos(angle), Math.sin(angle)));
  ring(flange, 0, size * 1.62, 0.047, size * 0.7, mat, 32);
  bolts(flange, 0.029, size * 1.25, 6, 0.018, boltMaterial);
  parent.add(flange);
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
  cylinder(assembly, -5.33, -4.52, 0.2, 0.2, steel, 64);
  cylinder(assembly, -4.52, -4.05, 0.22, 0.62, diskSteel, 64);
  ring(assembly, -5.2, 0.32, 0.09, 0.16, steel);
  bolts(assembly, -5.25, 0.265, 12, 0.029, boltMaterial);
  ring(assembly, -4.74, 0.335, 0.075, 0.145, steel);
  for (const x of [-5.02, -4.94, -4.62]) ring(assembly, x, 0.225, 0.021, 0.034, darkSteel);
  ring(assembly, -5.14, 0.356, 0.045, 0.07, darkSteel);
  instances(assembly, new THREE.BoxGeometry(0.057, 0.032, 0.017), steel,
    Array.from({length: 60}, (_, i) => {
      const angle = TAU * i / 60;
      return {position: [-5.14, 0.361 * Math.cos(angle), 0.361 * Math.sin(angle)], rotation: [angle, 0, 0]};
    }));
  cylinder(assembly, -0.61, -0.37, 0.75, 0.38, diskSteel);
  cylinder(assembly, -0.37, 0.14, 0.30, 0.22, steel);
  ring(assembly, 0.095, 0.4, 0.095, 0.2, steel);
  bolts(assembly, 0.151, 0.328, 16, 0.03, boltMaterial);
  for (let i = 0; i < 9; i++) ring(assembly, -0.365 + i * 0.033, 0.321, 0.012, 0.03, steel);
  for (let i = 0; i < 16; i++) {
    const angle = TAU * i / 16;
    rod(assembly, [-4.07, 0.48 * Math.cos(angle), 0.48 * Math.sin(angle)], [-0.52, 0.48 * Math.cos(angle), 0.48 * Math.sin(angle)], 0.025, steel);
  }
  bolts(assembly, -4.08, 0.48, 16, 0.041, boltMaterial);
  bolts(assembly, -0.53, 0.48, 16, 0.041, boltMaterial);

  for (let i = 0; i < 17; i++) {
    const stage = i + 1;
    const ratio = i / 16;
    const x = FIRST_STAGE + STAGE_PITCH * i;
    const root = 0.665 + 0.101 * ratio;
    const tip = TIP_RADIUS - 0.183 * ratio;
    const count = 48 + 4 * Math.floor(i / 2);
    const rotor = part(ctx, {
      id: `compressor-rotor-${stage}`, name: `Compressor rotor · stage ${String(stage).padStart(2, '0')}`, system: 'compressor', kind: 'rotor',
      description: 'Cambered rotor airfoils accelerate the air. Individually modeled disk, blade platforms and spacer lands reproduce the visible assembly; airfoil profiles and per-row blade counts are approximate.',
      facts: [['Stage', `${stage} of 17`], ['Row', 'Rotating'], ['Blade count', `${count} rendered / estimated`], ['Assembly', stage === 1 ? 'Forward stub integral wheel' : stage === 17 ? 'Aft stub integral wheel' : 'Individual wheel and spacers']],
      explode: [-2.4 + ratio * 2.5, 0, 0], sourceTime: 98,
    });
    lathe(rotor, [[x - 0.07, 0.215], [x - 0.07, root - 0.11], [x - 0.045, root - 0.03], [x - 0.045, root], [x + 0.047, root], [x + 0.047, root - 0.03], [x + 0.075, root - 0.11], [x + 0.075, 0.215], [x - 0.07, 0.215]], diskSteel, 72);
    ring(rotor, x, root + 0.012, 0.118, 0.025, steel, 72);
    ring(rotor, x + 0.09, root - 0.014, 0.038, 0.035, steel, 72);
    bladeRow(rotor, x, count, {root, tip, chord: 0.186 - ratio * 0.045, twist: 0.68 - ratio * 0.15, sweep: 0.027, thickness: 0.095, camber: 0.07, lean: 0.032}, bladeSteel, i * 0.015);
    rotors.push(rotor);

    const stator = part(ctx, {
      id: `compressor-stator-${stage}`, name: `Compressor stator · stage ${String(stage).padStart(2, '0')}`, system: 'compressor', kind: 'stator',
      description: 'The stationary airfoils turn the compressor flow and recover pressure between rotor rows. First-eight-stage vanes use carrier ring segments; later rows mount directly in casing grooves.',
      facts: [['Stage', `${stage} of 17`], ['Row', 'Stationary'], ['Airfoil geometry', 'Reconstructed'], ['Mounting', stage <= 8 ? 'Dovetails in carrier ring segments' : 'Square-base dovetails in casing grooves']],
      explode: [-2.4 + ratio * 2.5 + 0.035, 0.0, 0], sourceTime: 520,
    });
    bladeRow(stator, x + 0.112, count + 6, {root: root + 0.04, tip: tip + 0.045, chord: 0.151 - ratio * 0.025, twist: -0.64, sweep: -0.01, thickness: 0.085, camber: -0.06}, statorSteel, 0.031);
    ring(stator, x + 0.112, tip + 0.075, 0.068, 0.037, statorSteel, 72);
    if (stage === 17) ring(stator, x + 0.112, root + 0.065, 0.077, 0.033, darkSteel, 72);
  }

  const exitGuides = part(ctx, {
    id: 'compressor-exit-guides', name: 'Exit guide vanes · EGV 1 & 2', system: 'compressor', kind: 'stator',
    description: 'Two stationary exit-guide-vane rows follow the seventeenth stage and remove residual swirl before the discharge diffuser.',
    facts: [['Rows', '2'], ['Location', 'After compressor stage 17'], ['Geometry', 'Reconstructed shrouded vanes']],
    explode: [0.6, 0, 0], sourceTime: 548,
  });
  for (const x of [-0.435, -0.29]) {
    bladeRow(exitGuides, x, 80, {root: 0.785, tip: 0.943, chord: 0.13, twist: -0.2, thickness: 0.08, camber: 0.03}, statorSteel);
    ring(exitGuides, x, 0.967, 0.058, 0.032, statorSteel);
    ring(exitGuides, x, 0.803, 0.064, 0.03, darkSteel);
  }

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
        description: 'Horizontally split, flange-bolted casing. Annular wall geometry includes radial end flanges and the machined horizontal joint.',
        facts: [['Stator stages', section.stages], ['Split', 'Horizontal'], ['Shell dimensions', 'Reconstructed from source proportions']],
        explode: [section.distance, sign * 1.75, 0], sourceTime: section.time,
      });
      const profile = casingProfile(section.x0, section.x1, section.r0, section.r1);
      splitCasing(shell, profile, shellMaterial, {half});
      splitFaces(shell, profile, shellMaterial);
      splitRails(shell, section.x0 + 0.08, section.x1 - 0.08, section.r0 + 0.028, section.r1 + 0.028, half, shellMaterial, boltMaterial);
      halfBolts(shell, section.x0 - 0.019, section.r0 + 0.055, half, boltMaterial);
      halfBolts(shell, section.x1 + 0.019, section.r1 + 0.055, half, boltMaterial);
      for (let j = 0; j < 3; j++) {
        const x = section.x0 + (section.x1 - section.x0) * (j + 1) / 4;
        const radius = section.r0 + (section.r1 - section.r0) * (j + 1) / 4;
        const ribProfile = [[x - 0.022, radius], [x - 0.022, radius + 0.043], [x + 0.022, radius + 0.043], [x + 0.022, radius], [x - 0.022, radius]];
        splitCasing(shell, ribProfile, shellMaterial, {half});
      }
      if (section.key === 'aft') {
        for (const angle of [-Math.PI / 4, Math.PI / 4]) {
          addBleedPort(shell, -3.06, angle + (half === 'upper' ? 0 : Math.PI), 1.174, inletMaterial, boltMaterial);
        }
      }
      if (section.key === 'discharge') addBleedPort(shell, -1.90, half === 'upper' ? 0.55 : Math.PI + 0.55, 1.106, inletMaterial, boltMaterial, 0.13);
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
  bladeRow(guideVanes, -4.19, 64, {root: 0.575, tip: 1.105, chord: 0.205, twist: -0.48, thickness: 0.09, camber: 0.035}, steel);
  ring(guideVanes, -4.19, 0.603, 0.25, 0.075, darkSteel);
  ring(guideVanes, -4.19, 1.148, 0.235, 0.035, inletMaterial);
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
  bolts(guideVanes, -4.32, 0.574, 16, 0.022, boltMaterial);

  const actuator = part(ctx, {
    id: 'igv-actuator', name: 'IGV hydraulic actuator & linkage', system: 'inlet', kind: 'detail',
    description: 'Hydraulic actuator and short tangential linkage position the inlet-guide-vane control ring. The linkage layout is a visual reconstruction.',
    facts: [['Actuation', 'Hydraulic'], ['Driven assembly', 'IGV control ring']], explode: [-2.4, -0.5, 1.0], sourceTime: 291,
  });
  rod(actuator, [-4.05, -0.42, 1.25], [-3.65, -0.95, 1.25], 0.088, inletMaterial, 24);
  rod(actuator, [-4.05, -0.42, 1.25], [-4.25, -0.15, 1.25], 0.035, steel, 16);
  box(actuator, [0.14, 0.16, 0.2], [-4.20, -0.19, 1.25], steel);
  box(actuator, [0.3, 0.15, 0.22], [-3.64, -0.99, 1.25], shellMaterial);
  tube(actuator, [[-3.68, -0.82, 1.31], [-3.47, -0.77, 1.31], [-3.4, -1.12, 1.31]], 0.016, darkSteel, 16);

  for (const half of ['upper', 'lower']) {
    const sign = half === 'upper' ? 1 : -1;
    const inlet = part(ctx, {
      id: `inlet-casing-${half}`, name: `Radial inlet casing · ${half}`, system: 'inlet', kind: 'casing',
      description: 'Industrial radial-inlet collector, internal bellmouth and bearing support structure. Air enters around the inlet casing and turns downstream into the axial compressor.',
      facts: [['Inlet type', 'Radial collector'], ['Supports', 'No. 1 bearing and variable IGVs'], ['Envelope', 'Reconstructed from section references']],
      explode: [-3.1, sign * 1.6, 0], sourceTime: 244,
    });
    const frontPlate = [[-5.21, 0.27], [-5.21, 1.38], [-5.10, 1.38], [-5.10, 0.29], [-5.21, 0.27]];
    splitCasing(inlet, frontPlate, inletMaterial, {half});
    splitFaces(inlet, frontPlate, inletMaterial);
    const turningWall = [[-5.1, 0.94], [-4.96, 0.84], [-4.78, 0.71], [-4.55, 0.62], [-4.28, 0.575], [-4.28, 0.53], [-4.56, 0.57], [-4.8, 0.655], [-4.99, 0.79], [-5.1, 0.88], [-5.1, 0.94]];
    splitCasing(inlet, turningWall, steel, {half});
    splitFaces(inlet, turningWall, steel);
    const lip = [[-4.78, 1.37], [-4.60, 1.31], [-4.45, 1.21], [-4.33, 1.12], [-4.10, 1.12], [-4.10, 1.22], [-4.31, 1.22], [-4.44, 1.29], [-4.60, 1.39], [-4.77, 1.44], [-4.78, 1.37]];
    splitCasing(inlet, lip, inletMaterial, {half});
    splitFaces(inlet, lip, inletMaterial);
    halfBolts(inlet, -5.232, 1.305, half, boltMaterial);
    splitRails(inlet, -5.2, -4.15, 1.35, 1.26, half, inletMaterial, boltMaterial);
    for (const side of [-1, 1]) {
      const strut = box(inlet, [0.66, 0.10, 0.67], [-4.88, sign * 0.35, side * 0.99], inletMaterial);
      strut.rotation.x = side * sign * 0.34;
    }
    if (half === 'lower') {
      box(inlet, [0.29, 0.29, 0.57], [-5.02, -1.40, 0], inletMaterial);
      tube(inlet, [[-5.03, -1.44, 0], [-5.03, -1.62, 0], [-4.77, -1.62, 0]], 0.044, darkSteel, 16);
    }
  }

  return {rotors};
}

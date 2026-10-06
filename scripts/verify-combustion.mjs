import assert from 'node:assert/strict';
import * as THREE from 'three';

const TAU = Math.PI * 2, cant = 13 * Math.PI / 180;
const cosine = Math.cos(cant), sine = Math.sin(cant);

function canPoint(angle, [x, y, z]) {
  const radius = 1.75 - sine * x + cosine * y;
  return new THREE.Vector3(-0.08 + cosine * x + sine * y,
    radius * Math.cos(angle) - z * Math.sin(angle),
    radius * Math.sin(angle) + z * Math.cos(angle));
}

export function verifyCombustion(model) {
  const parts = new Map(model.parts.map(record => [record.id, record.group]));
  const raycaster = new THREE.Raycaster();
  const check = (groups, from, to, expectedOpen, label) => {
    const vector = to.clone().sub(from), length = vector.length();
    raycaster.set(from, vector.normalize()); raycaster.near = 1e-6; raycaster.far = length - 1e-6;
    const hits = raycaster.intersectObjects(groups, true);
    assert.equal(hits.length === 0, expectedOpen, `${label}: ${expectedOpen ? 'blocked passage' : 'missing adjacent wall'}`);
  };
  for (const group of parts.values()) group.updateWorldMatrix(true, true);
  let voidChecks = 0, wallChecks = 0;
  for (let number = 1; number <= 14; number++) {
    const angle = (number - 1) * TAU / 14;
    const liner = parts.get(`combustor-liner-${number}`), can = parts.get(`combustor-${number}`);
    const radialTest = (group, x, phi, from, to, open, label) => {
      check([group], canPoint(angle, [x, from * Math.cos(phi), from * Math.sin(phi)]),
        canPoint(angle, [x, to * Math.cos(phi), to * Math.sin(phi)]), open, `${number}: ${label}`);
      if (open) voidChecks++; else wallChecks++;
    };
    for (let j = 0; j < 3; j++) {
      radialTest(liner, 0.80, j * TAU / 3, 0.266, 0.211, true, 'dilution bore');
      radialTest(liner, 0.80, j * TAU / 3 + 0.30, 0.266, 0.211, false, 'dilution adjacent wall');
    }
    for (let j = 0; j < 6; j++) {
      radialTest(liner, 0.215, j * TAU / 6 + 0.25, 0.266, 0.211, true, 'primary metering bore');
      radialTest(liner, 0.275, j * TAU / 6, 0.266, 0.211, true, 'aft metering bore');
    }
    for (const phi of [-Math.PI / 2, Math.PI / 2]) {
      radialTest(liner, 0.14, phi, 0.266, 0.211, true, 'liner crossfire bore');
      radialTest(can, 0.14, phi, 0.313, 0.252, true, 'sleeve crossfire bore');
    }
    const capCenters = [[0, 0], ...Array.from({length: 6}, (_, j) => [0.167 * Math.cos(j * TAU / 6), 0.167 * Math.sin(j * TAU / 6)])];
    for (const [y, z] of capCenters) {
      check([liner], canPoint(angle, [-0.005, y, z]), canPoint(angle, [0.060, y, z]), true, `${number}: cap passage`);
      voidChecks++;
    }
    const filmPoint = (x, r) => canPoint(angle, [x, r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6)]);
    check([liner], filmPoint(0.044, 0.2385), filmPoint(0.0565, 0.2385), true, `${number}: cooling lip inlet`);
    check([liner], filmPoint(0.0565, 0.2385), filmPoint(0.0565, 0.220), true, `${number}: cooling slot exit`);
    voidChecks += 2;
    for (let j = 0; j < 4; j++) {
      const phi = j * TAU / 4;
      check([can, liner], canPoint(angle, [0.34, 0.255 * Math.cos(phi), 0.255 * Math.sin(phi)]),
        canPoint(angle, [0.69, 0.255 * Math.cos(phi), 0.255 * Math.sin(phi)]), true, `${number}: reverse-flow air jacket`);
      voidChecks++;
    }
    const wrapper = parts.get(`combustion-wrapper-${Math.cos(angle) > 0 ? 'upper' : 'lower'}`);
    check([wrapper], canPoint(angle, [-0.11, 0, 0]), canPoint(angle, [0.11, 0, 0]), true, `${number}: wrapper cover opening`);
    voidChecks++;
    const stations = [[0.825, 1.541], [0.873, 1.530], [1.04, 1.47], [1.21, 1.30], [1.43, 1.095], [1.59, 0.928]];
    for (let j = 1; j < stations.length; j++) {
      const point = ([x, radius]) => new THREE.Vector3(x, radius * Math.cos(angle), radius * Math.sin(angle));
      check([parts.get(`transition-${number}`)], point(stations[j - 1]), point(stations[j]), true, `${number}: transition centerline segment ${j}`);
      voidChecks++;
    }
    const next = number % 14 + 1, nextAngle = number * TAU / 14;
    const start = canPoint(angle, [0.14, 0, 0.225]), end = canPoint(nextAngle, [0.14, 0, -0.225]);
    const direction = end.clone().sub(start).normalize();
    check([can, liner, parts.get(`combustor-${next}`), parts.get(`combustor-liner-${next}`), parts.get('combustor-crossfire-manifolds')],
      start.clone().addScaledVector(direction, -0.030), end.clone().addScaledVector(direction, 0.030), true,
      `${number}: crossfire flame-transfer connection to ${next}`);
    voidChecks++;
  }
  assert.equal(parts.get('combustor-liner-1').userData.channels.dilutionBores, 3);
  console.log(`Combustion passages verified: ${voidChecks} actual open-path probes and ${wallChecks} adjacent-wall probes across all 14 assemblies.`);
}

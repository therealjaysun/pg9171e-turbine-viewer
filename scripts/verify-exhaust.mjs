import assert from 'node:assert/strict';
import * as THREE from 'three';

export function verifyExhaust(model) {
  const records = model.parts.filter(part => part.system === 'exhaust');
  const groups = records.map(part => part.group);
  groups.forEach(group => group.updateWorldMatrix(true, true));
  const raycaster = new THREE.Raycaster();
  let paths = 0;
  const clear = (from, to, label) => {
    const vector = to.clone().sub(from);
    raycaster.far = vector.length() - 1e-6; raycaster.near = 1e-6; raycaster.set(from, vector.normalize());
    assert.equal(raycaster.intersectObjects(groups, true).length, 0, label);
    paths++;
  };
  const radial = (x, radius, angle) => new THREE.Vector3(x, radius * Math.cos(angle), radius * Math.sin(angle));
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + i * Math.PI / 2;
    clear(radial(3.70, 1.95, angle), radial(3.70, 1.57, angle), `Exhaust supply port ${i + 1} is blocked`);
  }
  // Center paths between consecutive turning rings follow their actual sampled
  // profile offsets. Their outlets must remain open beyond the diffuser turn.
  const profile = [[0, 0.014], [0.19, 0.0205], [0.34, 0.078], [0.43, 0.180], [0.455, 0.330]];
  for (let channel = 0; channel < 4; channel++) {
    const radius = 0.69 + (channel + 0.5) * 0.225, x = 4.86 - (channel + 0.5) * 0.11;
    for (let sector = 0; sector < 10; sector++) {
      const angle = sector * Math.PI / 5;
      const points = [radial(3.40, radius + profile[0][1], angle),
        ...profile.map(([dx, dr]) => radial(x + dx, radius + dr, angle)),
        radial(x + 0.455, 2.43, angle)];
      for (let j = 1; j < points.length; j++) clear(points[j - 1], points[j], `Exhaust turning channel ${channel + 1}, sector ${sector + 1}, segment ${j} is blocked`);
    }
  }
  console.log(`Exhaust passages verified: ${paths} supply-bore and nested-turn flow-path probes.`);
}

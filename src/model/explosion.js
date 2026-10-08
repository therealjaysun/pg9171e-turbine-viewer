import * as THREE from 'three';

/** Two inspection layers, measured from immutable assembled transforms. */
export function createExplosionController(model) {
  const rest = new WeakMap(), moves = [], fans = [];
  model.root.updateMatrixWorld(true);
  model.root.traverse(object => {
    rest.set(object, {matrix: object.matrix.clone(), position: object.position.clone(),
      instances: object.isInstancedMesh ? object.instanceMatrix.array.slice() : null});
    const motion = object.userData.explosion;
    if (motion) moves.push({object, assembly: new THREE.Vector3(...(motion.assembly || [0,0,0])),
      detail: new THREE.Vector3(...(motion.detail || [0,0,0]))});
    if (object.userData.explodeSegments) {
      const {count, distance} = object.userData.explodeSegments;
      const offsets = Array.from({length: object.count}, (_, i) => {
        const segment = Math.floor(i * count / object.count);
        const angle = (segment + .5) * Math.PI * 2 / count;
        return new THREE.Vector3(0, Math.cos(angle) * distance, Math.sin(angle) * distance);
      });
      fans.push({object, offsets});
    }
  });
  const matrix = new THREE.Matrix4();
  let lastDetail = 0;
  return {
    rest,
    apply(assembly, detail = 0) {
      assembly = THREE.MathUtils.clamp(assembly, 0, 1);
      detail = THREE.MathUtils.clamp(detail, 0, 1);
      for (const part of model.parts) part.group.position.copy(part.origin).addScaledVector(part.offset, assembly);
      for (const move of moves) {
        // Part-level detail augments its primary offset; child groups use their own origin.
        if (!move.object.userData.isPart) move.object.position.copy(rest.get(move.object).position);
        move.object.position.addScaledVector(move.assembly, assembly).addScaledVector(move.detail, detail);
      }
      if (detail !== lastDetail) for (const {object, offsets} of fans) {
        const source = rest.get(object).instances;
        for (let i = 0; i < object.count; i++) {
          matrix.fromArray(source, i * 16);
          matrix.elements[13] += offsets[i].y * detail;
          matrix.elements[14] += offsets[i].z * detail;
          object.setMatrixAt(i, matrix);
        }
        object.instanceMatrix.needsUpdate = true;
        object.computeBoundingBox(); object.computeBoundingSphere();
      }
      lastDetail = detail;
      model.root.updateMatrixWorld(true);
    },
    diagnostics: {movingGroups: moves.length, segmentedRows: fans.length},
  };
}

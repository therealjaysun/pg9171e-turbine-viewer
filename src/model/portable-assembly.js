import * as THREE from 'three';

// Both export paths use the same rest transforms, including children and instances.
export function portableAssembly(assembly, {current = false, restoreMaterial} = {}) {
  const root = new THREE.Group(); root.name = 'PG9171E DLN1 reconstructed assembly';
  assembly.root.updateMatrixWorld(true);
  for (const part of assembly.parts) {
    if (current && !part.group.visible) continue;
    const group = new THREE.Group(); group.name = part.name;
    group.userData = {component: part.id, system: part.system, sourceTime: part.sourceTime,
      geometry: 'Reconstructed; dimensions estimated'};
    const visit = (object, parentMatrix) => {
      const snapshot = assembly.explosion.rest.get(object);
      const local = new THREE.Matrix4().multiplyMatrices(parentMatrix, current ? object.matrix : snapshot.matrix);
      if (object.isMesh) {
        const material = object.material.clone();
        material.clippingPlanes = []; material.wireframe = false; material.transparent = false;
        material.opacity = 1; material.depthWrite = true; material.emissive?.set(0);
        restoreMaterial?.(material, object.material);
        const add = matrix => {
          const mesh = new THREE.Mesh(object.geometry, material); mesh.name = object.name || part.name;
          mesh.matrix.copy(matrix); mesh.matrixAutoUpdate = false; group.add(mesh);
        };
        if (object.isInstancedMesh) for (let i = 0; i < object.count; i++) {
          const instance = new THREE.Matrix4();
          if (current) object.getMatrixAt(i, instance); else instance.fromArray(snapshot.instances, i * 16);
          add(new THREE.Matrix4().multiplyMatrices(local, instance));
        } else add(local);
      }
      // Ignore display-only edges/overlays added after the model was built.
      for (const child of object.children) if (assembly.explosion.rest.has(child)) visit(child, local);
    };
    visit(part.group, new THREE.Matrix4()); root.add(group);
  }
  root.updateMatrixWorld(true); return root;
}

import * as THREE from 'three';

const UP = new THREE.Vector3(0, 0, 1);
const PICK_DIRECTION = new THREE.Vector3(0.8127, 0.3391, 0.4773).normalize();
const PICK_EPSILON = 1e-7;

function visibleInHierarchy(object) {
  for (let current = object; current; current = current.parent) if (!current.visible) return false;
  return true;
}

function stencilMaterial(plane, side, operation) {
  return new THREE.MeshBasicMaterial({
    side, depthTest: false, depthWrite: false, colorWrite: false,
    clippingPlanes: [plane], stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc,
    stencilFail: operation, stencilZFail: operation, stencilZPass: operation,
  });
}

function proxyMesh(source, material) {
  const proxy = source.isInstancedMesh
    ? new THREE.InstancedMesh(source.geometry, material, source.count)
    : new THREE.Mesh(source.geometry, material);
  proxy.matrixAutoUpdate = false;
  proxy.frustumCulled = false;
  proxy.raycast = source.isInstancedMesh ? THREE.InstancedMesh.prototype.raycast : THREE.Mesh.prototype.raycast;
  proxy.userData.isSectionHelper = true;
  return proxy;
}

// Per-part winding stencils fill material, including overlapping solids, without
// filling bores. The source geometry and export hierarchy are never modified.
// Based on Three.js r180's webgl_clipping_stencil rendering sequence.
export function createSectionCaps({parts, plane}) {
  const group = new THREE.Group();
  group.name = 'Section cut faces (display only)';
  group.userData.isSectionHelper = true;
  // All stencil/cap passes must remain in one opaque render list, after surfaces.
  group.renderOrder = 1;
  const backMaterial = stencilMaterial(plane, THREE.BackSide, THREE.IncrementWrapStencilOp);
  const frontMaterial = stencilMaterial(plane, THREE.FrontSide, THREE.DecrementWrapStencilOp);
  const pickMaterial = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
  const planeGeometry = new THREE.PlaneGeometry(1, 1);
  const matrix = new THREE.Matrix4(), combined = new THREE.Matrix4();
  const box = new THREE.Box3(), center = new THREE.Vector3(), size = new THREE.Vector3();
  const inverseRotation = new THREE.Quaternion(), corner = new THREE.Vector3();
  const planeBounds = new THREE.Box3();
  const previousPlane = new THREE.Plane(new THREE.Vector3(), Infinity);
  let active = false;
  let excludedMeshes = 0;
  let statistics = {activeParts: 0, activeMeshes: 0, activeInstances: 0, stencilTriangles: 0};

  const records = parts.filter(part => part.system !== 'supports').map((part, index) => {
    const sources = [];
    const order = index * 3;
    part.group.traverse(source => {
      if (!source.isMesh || source.userData.isSectionHelper) return;
      if (source.userData.sectionCap === false || source.geometry.userData.sectionCap === false) {
        excludedMeshes++;
        return;
      }
      source.geometry.computeBoundingBox();
      const back = proxyMesh(source, backMaterial), front = proxyMesh(source, frontMaterial);
      if (source.isInstancedMesh) front.instanceMatrix = back.instanceMatrix;
      back.renderOrder = order;
      front.renderOrder = order + 1;
      group.add(back, front);
      sources.push({source, back, front, bounds: new THREE.Box3(), matrix: new THREE.Matrix4(), version: -1, count: -1, valid: false});
    });
    const baseColor = sources[0]?.source.material.color?.clone() ?? new THREE.Color(0xa6b6ac);
    const material = new THREE.MeshStandardMaterial({
      color: baseColor.clone().lerp(new THREE.Color(0xe4ddc9), 0.28),
      metalness: 0.08, roughness: 0.85, side: THREE.DoubleSide,
      stencilWrite: true, stencilRef: 0, stencilFunc: THREE.NotEqualStencilFunc,
      stencilFail: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp,
      stencilZPass: THREE.ReplaceStencilOp,
    });
    const cap = new THREE.Mesh(planeGeometry, material);
    cap.name = `${part.name} cut face`;
    cap.userData = {partId: part.id, system: part.system, isSectionCap: true, isSectionHelper: true};
    cap.renderOrder = order + 2;
    cap.frustumCulled = false;
    cap.onAfterRender = renderer => renderer.clearStencil();
    // Selection is validated against source volumes in pick(), never this rectangle.
    cap.raycast = () => {};
    group.add(cap);
    return {part, sources, cap, baseColor, bounds: new THREE.Box3()};
  });

  function syncSource(record, planeChanged) {
    const {source, back, front} = record;
    if (!visibleInHierarchy(source)) {
      record.valid = false;
      back.visible = front.visible = false;
      return false;
    }
    const changed = planeChanged || !record.valid || !record.matrix.equals(source.matrixWorld)
      || record.version !== source.instanceMatrix?.version || record.count !== source.count;
    if (changed) {
      record.valid = true;
      record.matrix.copy(source.matrixWorld);
      record.version = source.instanceMatrix?.version;
      record.count = source.count;
      record.bounds.makeEmpty();
      back.matrix.copy(source.matrixWorld);
      front.matrix.copy(source.matrixWorld);
      if (source.isInstancedMesh) {
        let count = 0;
        for (let i = 0; i < source.count; i++) {
          source.getMatrixAt(i, matrix);
          combined.multiplyMatrices(source.matrixWorld, matrix);
          box.copy(source.geometry.boundingBox).applyMatrix4(combined);
          if (!box.intersectsPlane(plane)) continue;
          record.bounds.union(box);
          back.setMatrixAt(count++, matrix);
        }
        back.count = front.count = count;
        back.instanceMatrix.needsUpdate = true;
        back.boundingSphere = front.boundingSphere = null;
      } else {
        box.copy(source.geometry.boundingBox).applyMatrix4(source.matrixWorld);
        if (box.intersectsPlane(plane)) record.bounds.copy(box);
      }
    }
    back.visible = front.visible = !record.bounds.isEmpty();
    return back.visible;
  }

  function update({enabled = true, style = 'shaded', selected = null, selectedSystem = null} = {}) {
    active = enabled && style !== 'wire';
    group.visible = active;
    statistics = {activeParts: 0, activeMeshes: 0, activeInstances: 0, stencilTriangles: 0};
    if (!active) return;
    const planeChanged = !previousPlane.equals(plane);
    previousPlane.copy(plane);
    for (const record of records) {
      const {part, cap, bounds} = record;
      bounds.makeEmpty();
      for (const sourceRecord of record.sources) {
        if (!syncSource(sourceRecord, planeChanged)) continue;
        bounds.union(sourceRecord.bounds);
        statistics.activeMeshes++;
        const {source, back} = sourceRecord;
        const count = source.isInstancedMesh ? back.count : 1;
        statistics.activeInstances += count;
        statistics.stencilTriangles += 2 * count * (source.geometry.index?.count ?? source.geometry.attributes.position.count) / 3;
      }
      cap.visible = !bounds.isEmpty();
      if (!cap.visible) continue;
      statistics.activeParts++;
      bounds.getCenter(center);
      plane.projectPoint(center, cap.position);
      cap.quaternion.setFromUnitVectors(UP, plane.normal);
      inverseRotation.copy(cap.quaternion).invert();
      planeBounds.makeEmpty();
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
        corner.set(x, y, z).sub(cap.position).applyQuaternion(inverseRotation);
        planeBounds.expandByPoint(corner);
      }
      planeBounds.getSize(size);
      cap.scale.set(Math.max(size.x, 1e-6) + 1e-5, Math.max(size.y, 1e-6) + 1e-5, 1);
      const material = cap.material;
      material.color.copy(record.baseColor).lerp(new THREE.Color(style === 'cad' ? 0xdadfd7 : 0xe4ddc9), style === 'cad' ? 0.65 : 0.28);
      material.emissive.set(selected === part.id || selectedSystem === part.system ? 0x316843 : 0);
      material.emissiveIntensity = 0.24;
      const translucent = style === 'xray' && (part.kind === 'casing' || part.kind === 'support');
      // Custom blending retains opaque-list order; transparent:true would separate
      // caps from their stencil pass and accidentally cap the next component.
      material.blending = translucent ? THREE.CustomBlending : THREE.NoBlending;
      material.blendSrc = THREE.SrcAlphaFactor;
      material.blendDst = THREE.OneMinusSrcAlphaFactor;
      material.blendEquation = THREE.AddEquation;
      material.opacity = translucent ? 0.18 : 1;
      material.depthWrite = !translucent;
    }
    group.updateMatrixWorld(true);
  }

  const pickRay = new THREE.Raycaster();
  const hitPoint = new THREE.Vector3(), normal = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();
  function containsPoint(record, point) {
    pickRay.set(point.clone().addScaledVector(PICK_DIRECTION, PICK_EPSILON), PICK_DIRECTION);
    pickRay.near = 0;
    pickRay.far = Infinity;
    let winding = 0;
    for (const sourceRecord of record.sources) {
      const {back, bounds} = sourceRecord;
      if (!back.visible || !bounds.containsPoint(point)) continue;
      const hits = [];
      const originalMaterial = back.material;
      back.material = pickMaterial;
      try { back.raycast(pickRay, hits); } finally { back.material = originalMaterial; }
      for (const hit of hits) {
        combined.copy(back.matrixWorld);
        if (back.isInstancedMesh) {
          back.getMatrixAt(hit.instanceId, matrix);
          combined.multiply(matrix);
        }
        normalMatrix.getNormalMatrix(combined);
        const direction = normal.copy(hit.face.normal).applyMatrix3(normalMatrix).dot(PICK_DIRECTION);
        if (Math.abs(direction) > 1e-10) winding += Math.sign(direction);
      }
    }
    return winding !== 0;
  }

  function pick(raycaster) {
    if (!active || !raycaster.ray.intersectPlane(plane, hitPoint)) return null;
    const distance = raycaster.ray.origin.distanceTo(hitPoint);
    if (distance < raycaster.near || distance > raycaster.far) return null;
    // Coplanar overlapping caps use LessEqualDepth; the last rendered part wins.
    for (let index = records.length - 1; index >= 0; index--) {
      const record = records[index];
      if (!record.cap.visible || !record.bounds.containsPoint(hitPoint) || !containsPoint(record, hitPoint)) continue;
      return {distance, point: hitPoint.clone(), object: record.cap};
    }
    return null;
  }

  function dispose() {
    group.removeFromParent();
    planeGeometry.dispose();
    backMaterial.dispose();
    frontMaterial.dispose();
    pickMaterial.dispose();
    for (const record of records) {
      record.cap.material.dispose();
      for (const {back, front} of record.sources) {
        if (back.isInstancedMesh) { back.dispose(); front.dispose(); }
      }
    }
    group.clear();
  }

  return {group, update, pick, dispose, diagnostics: () => ({enabled: active, excludedMeshes, ...statistics})};
}

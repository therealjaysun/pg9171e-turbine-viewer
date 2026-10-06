import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildAssembly } from '../src/model/assembly.js';

// Three's browser exporter uses FileReader for Blob conversion.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) { this.read(blob, false); }
  readAsDataURL(blob) { this.read(blob, true); }
  async read(blob, dataURL) {
    try {
      const buffer = await blob.arrayBuffer();
      this.result = dataURL ? `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}` : buffer;
      this.onloadend?.({target: this});
    } catch (error) {
      this.error = error;
      if (this.onerror) this.onerror({target: this});
      else throw error;
    }
  }
};

function portableAssembly(assembly) {
  const root = new THREE.Group();
  root.name = 'PG9171E DLN1 reconstructed assembly';
  assembly.root.updateMatrixWorld(true);
  const inverse = new THREE.Matrix4(), instance = new THREE.Matrix4();
  for (const part of assembly.parts) {
    const group = new THREE.Group();
    group.name = part.name;
    group.userData = {
      component: part.id, system: part.system, sourceTime: part.sourceTime,
      geometry: 'Reconstructed; dimensions estimated',
    };
    inverse.copy(part.group.matrixWorld).invert();
    group.matrix.makeTranslation(...part.origin.toArray());
    group.matrixAutoUpdate = false;
    part.group.traverse(object => {
      if (!object.isMesh) return;
      const material = object.material.clone();
      material.clippingPlanes = [];
      material.wireframe = false;
      material.transparent = false;
      material.opacity = 1;
      material.depthWrite = true;
      material.emissive.set(0);
      const local = new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld);
      const add = transform => {
        const mesh = new THREE.Mesh(object.geometry, material);
        mesh.name = object.name || part.name;
        mesh.matrix.copy(transform);
        mesh.matrixAutoUpdate = false;
        group.add(mesh);
      };
      if (object.isInstancedMesh) {
        for (let i = 0; i < object.count; i++) {
          object.getMatrixAt(i, instance);
          add(new THREE.Matrix4().multiplyMatrices(local, instance));
        }
      } else add(local);
    });
    root.add(group);
  }
  root.updateMatrixWorld(true);
  return root;
}

function assertBounds(actual, expected, tolerance, label) {
  assert.ok(actual.min.distanceTo(expected.min) < tolerance, `${label}: lower bounds differ`);
  assert.ok(actual.max.distanceTo(expected.max) < tolerance, `${label}: upper bounds differ`);
}

async function validateGLB(buffer, assembly, expectedBounds) {
  assert.equal(buffer.readUInt32LE(0), 0x46546c67, 'GLB magic');
  assert.equal(buffer.readUInt32LE(4), 2, 'GLB version');
  assert.equal(buffer.readUInt32LE(8), buffer.length, 'GLB file length');
  const jsonLength = buffer.readUInt32LE(12);
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a, 'GLB JSON chunk');
  const json = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8'));
  const binaryOffset = 20 + jsonLength;
  assert.equal(buffer.readUInt32LE(binaryOffset + 4), 0x004e4942, 'GLB binary chunk');
  assert.equal(binaryOffset + 8 + buffer.readUInt32LE(binaryOffset), buffer.length, 'GLB binary length');
  assert.ok(json.materials.length > 0, 'GLB contains materials');
  for (const view of json.bufferViews) {
    assert.equal(view.buffer, 0, 'GLB uses embedded buffer');
    assert.ok((view.byteOffset || 0) + view.byteLength <= json.buffers[0].byteLength, 'GLB buffer view bounds');
  }
  const loaded = await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), '');
  const root = loaded.scene.children[0];
  assert.equal(root.children.length, 110, 'GLB retains 110 named assembly groups');
  const ids = new Set(assembly.parts.map(part => part.id));
  let meshes = 0, triangles = 0;
  for (const group of root.children) {
    assert.ok(group.name && ids.delete(group.userData.component), 'GLB retains unique component identities');
    assert.ok(group.children.length > 0, 'GLB component has geometry');
  }
  assert.equal(ids.size, 0, 'GLB retains every source component');
  root.traverse(object => {
    if (!object.isMesh) return;
    meshes++;
    const geometry = object.geometry;
    triangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3;
    assert.ok(object.material, 'GLB mesh has a material');
    for (const value of geometry.attributes.position.array) assert.ok(Number.isFinite(value), 'GLB finite coordinates');
  });
  assertBounds(new THREE.Box3().setFromObject(root), expectedBounds, 1e-5, 'GLB metre scale');
  return {meshes, triangles, materials: json.materials.length};
}

function validateSTL(buffer, expectedBounds, expectedTriangles) {
  const triangles = buffer.readUInt32LE(80);
  assert.equal(buffer.length, 84 + triangles * 50, 'Binary STL file length');
  assert.equal(triangles, expectedTriangles, 'STL and GLB triangle counts match');
  const bounds = new THREE.Box3();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3();
  for (let i = 0; i < triangles; i++) {
    const start = 84 + i * 50;
    const normalLength = Math.hypot(buffer.readFloatLE(start), buffer.readFloatLE(start + 4), buffer.readFloatLE(start + 8));
    assert.ok(Math.abs(normalLength - 1) < 0.001, `STL triangle ${i}: invalid normal`);
    for (const [vertex, point] of [a, b, c].entries()) {
      const offset = start + 12 + vertex * 12;
      point.set(buffer.readFloatLE(offset), buffer.readFloatLE(offset + 4), buffer.readFloatLE(offset + 8));
      assert.ok(point.toArray().every(Number.isFinite), `STL triangle ${i}: nonfinite coordinate`);
      bounds.expandByPoint(point);
    }
    assert.ok(ab.subVectors(b, a).cross(ac.subVectors(c, a)).lengthSq() > 1e-10, `STL triangle ${i}: degenerate face`);
  }
  const millimetres = expectedBounds.clone();
  millimetres.min.multiplyScalar(1000);
  millimetres.max.multiplyScalar(1000);
  assertBounds(bounds, millimetres, 0.1, 'STL millimetre scale');
  return bounds.getSize(new THREE.Vector3()).toArray().map(value => Number(value.toFixed(3)));
}

const assembly = buildAssembly();
const exported = portableAssembly(assembly);
const bounds = new THREE.Box3().setFromObject(assembly.root);
assertBounds(new THREE.Box3().setFromObject(exported), bounds, 1e-8, 'Portable assembly');
const glb = Buffer.from(await new GLTFExporter().parseAsync(exported, {binary: true, onlyVisible: true}));
const glbSummary = await validateGLB(glb, assembly, bounds);
exported.scale.setScalar(1000);
exported.updateMatrixWorld(true);
const stlView = new STLExporter().parse(exported, {binary: true});
const stl = Buffer.from(stlView.buffer, stlView.byteOffset, stlView.byteLength);
const sizeMM = validateSTL(stl, bounds, glbSummary.triangles);

const directory = new URL('../exports/', import.meta.url);
const glbPath = new URL('pg9171e.glb', directory);
const stlPath = new URL('pg9171e-mm.stl', directory);
await mkdir(directory, {recursive: true});
await writeFile(glbPath, glb);
await writeFile(stlPath, stl);
assert.ok(glb.equals(await readFile(glbPath)), 'Saved GLB matches verified bytes');
assert.ok(stl.equals(await readFile(stlPath)), 'Saved STL matches verified bytes');
console.log(`Exported and verified 110 part groups, ${glbSummary.meshes} meshes, ${glbSummary.materials} materials and ${glbSummary.triangles} triangles.`);
console.log(`GLB: ${(glb.length / 1e6).toFixed(2)} MB; STL: ${(stl.length / 1e6).toFixed(2)} MB; zero degenerate STL faces.`);
console.log(`STL bounds in millimetres [length, height, width]: ${JSON.stringify(sizeMM)}.`);

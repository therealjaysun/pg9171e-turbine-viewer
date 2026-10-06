import * as THREE from 'three';
import {buildAssembly} from '../src/model/assembly.js';
import {createSectionCaps} from '../src/section-caps.js';

const results = [];
const renderer = new THREE.WebGLRenderer({stencil: true, antialias: false, preserveDrawingBuffer: true});
renderer.localClippingEnabled = true;
renderer.setClearColor(0x18232e);
document.body.appendChild(renderer.domElement);
const gl = renderer.getContext(), pixel = new Uint8Array(4);
const model = buildAssembly();
model.root.updateMatrixWorld(true);
const byId = new Map(model.parts.map(part => [part.id, part]));
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 3));

function assert(condition, label) {
  results.push({label, passed: Boolean(condition)});
  if (!condition) throw new Error(label);
}

function checkSections(parts, plane, target, direction, halfHeight, size, samples) {
  const [width, height] = size, aspect = width / height;
  renderer.setSize(width, height);
  const camera = new THREE.OrthographicCamera(-halfHeight * aspect, halfHeight * aspect, halfHeight, -halfHeight, 0.01, 30);
  camera.up.set(0, Math.abs(direction.y) > 0.9 ? 0 : 1, Math.abs(direction.y) > 0.9 ? 1 : 0);
  camera.position.copy(target).addScaledVector(direction, 10);
  camera.lookAt(target); camera.updateMatrixWorld(true);
  const caps = createSectionCaps({parts, plane});
  scene.add(caps.group);
  // Render only actual-model section caps so a farther wall inside a curved
  // bore cannot be confused with metal filling the section plane itself.
  try {
    for (const style of ['shaded', 'cad']) {
      caps.update({enabled: true, style}); renderer.render(scene, camera);
      for (const sample of samples) {
        const point = new THREE.Vector3(...sample.point), projected = point.clone().project(camera);
        const x = Math.round((projected.x + 1) * width / 2), y = Math.round((projected.y + 1) * height / 2);
        assert(x >= 0 && x < width && y >= 0 && y < height, `${sample.label}: sample framed at ${width}px`);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        const background = [24, 35, 46].every((value, index) => Math.abs(pixel[index] - value) <= 1);
        assert(background === sample.void, `${sample.label}: ${style} ${width}px ${sample.void ? 'void remains open' : 'metal stays filled'}`);
      }
    }
  } finally {caps.dispose();}
}

try {
  assert(gl.getContextAttributes().stencil, 'WebGL stencil available');
  for (const stage of [1, 2]) {
    let row;
    byId.get(`turbine-wheel-${stage}`).group.traverse(object => {
      if (object.userData.csgAirfoil) row = object;
    });
    const paths = row.geometry.userData.coolingPaths;
    assert(paths.length === (stage === 1 ? 11 : 6), `Stage ${stage}: replacement-reference passage population`);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(row.geometry, row.material)); group.updateMatrixWorld(true);
    const part = {id: 'bucket', name: 'Bucket', system: 'turbine', kind: 'rotor', group};
    const y = paths[0].points[2][1], target = new THREE.Vector3(0.012, y, 0.025);
    const samples = paths.flatMap((path, i) => [
      {point: path.points[2], void: true, label: `Stage ${stage} bore ${i + 1}`},
      {point: path.wallPoints[2], void: false, label: `Stage ${stage} bore ${i + 1} wall`},
    ]);
    for (const size of [[640, 420], [320, 320]]) checkSections([part],
      new THREE.Plane(new THREE.Vector3(0, -1, 0), y), target, new THREE.Vector3(0, 1, 0), 0.08, size, samples);
  }
  const parts = ['shaft', 'turbine-spacers-studs', 'turbine-wheel-1', 'turbine-wheel-2', 'turbine-wheel-3'].map(id => byId.get(id));
  const samples = [
    {point: [1.1, 0.02, 0], void: true, label: 'Forward shaft bore'},
    {point: [1.1, 0.18, 0], void: false, label: 'Forward shaft wall'},
    {point: [2, 0, 0], void: true, label: 'First wheel center'},
    {point: [2, 0.35, 0], void: false, label: 'First wheel web'},
    {point: [2.26, 0, 0], void: true, label: 'First spacer center'},
    {point: [2.52, 0, 0], void: true, label: 'Second wheel center'},
    {point: [3.04, 0, 0], void: true, label: 'Third wheel center'},
    {point: [3.4, 0.04, 0], void: true, label: 'Inferred aft pocket'},
    {point: [4.08, 0.10, 0], void: false, label: 'Solid rear journal'},
  ];
  for (const size of [[960, 360], [320, 320]]) checkSections(parts,
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), new THREE.Vector3(2.95, 0, 0),
    new THREE.Vector3(0, 0, 1), size[0] === 320 ? 3.0 : 1.15, size, samples);
  window.__rotorCoolingTests = {passed: true, assertions: results.length, results};
} catch (error) {
  window.__rotorCoolingTests = {passed: false, assertions: results.length, error: error.message, results};
}
const {results: details, ...summary} = window.__rotorCoolingTests;
document.getElementById('results').textContent = JSON.stringify({...summary, failed: details.filter(result => !result.passed)}, null, 2);

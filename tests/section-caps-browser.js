import * as THREE from 'three';
import {createSectionCaps} from '../src/section-caps.js';
import {hollowRod} from '../src/model/helpers.js';

const renderer = new THREE.WebGLRenderer({stencil: true, antialias: false, preserveDrawingBuffer: true});
renderer.setSize(240, 240);
renderer.setClearColor(0x18232e);
renderer.localClippingEnabled = true;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 3));
let camera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 30);
const material = new THREE.MeshStandardMaterial({color: 0xbf764f, side: THREE.DoubleSide});
const axis = new THREE.Vector3(), sample = new THREE.Vector3();
const results = [];
const pixel = new Uint8Array(4);
const gl = renderer.getContext();
function assert(condition, label) {
  results.push({label, passed: Boolean(condition)});
  if (!condition) throw new Error(label);
}
function pixelAt(point) {
  sample.copy(point).project(camera);
  const x = Math.round((sample.x + 1) * 120), y = Math.round((sample.y + 1) * 120);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return [...pixel];
}
function isBackground(point) {
  const color = pixelAt(point);
  return color.slice(0, 3).every((value, i) => Math.abs(value - [24, 35, 46][i]) <= 1);
}
function setup(parts, plane) {
  for (const part of parts) part.group.updateMatrixWorld(true);
  const caps = createSectionCaps({parts, plane});
  scene.add(caps.group);
  camera.up.set(0, 1, 0);
  if (Math.abs(plane.normal.y) > 0.9) camera.up.set(0, 0, 1);
  camera.position.copy(plane.normal).multiplyScalar(-10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  function render(options = {}) {
    for (const part of parts) part.group.updateMatrixWorld(true);
    caps.update({enabled: true, ...options});
    renderer.render(scene, camera);
  }
  return {caps, render};
}
function part(group, id = 'fixture', kind = 'casing') {
  return {group, id, name: id, system: 'fixture', kind};
}
try {
  assert(gl.getContextAttributes().stencil, 'WebGL stencil buffer available');
  for (const component of ['x', 'y', 'z']) for (const flip of [-1, 1]) {
    axis.set(0, 0, 0); axis[component] = 1;
    const group = new THREE.Group();
    hollowRod(group, axis.clone().multiplyScalar(-1).toArray(), axis.toArray(), 1, 0.45, material, 96);
    const plane = new THREE.Plane(axis.clone().multiplyScalar(flip), 0);
    const {caps, render} = setup([part(group)], plane);
    const metal = new THREE.Vector3(); metal[component === 'x' ? 'y' : 'x'] = 0.7;
    render();
    assert(!isBackground(metal), `${component}/${flip}: cut material filled`);
    assert(isBackground(new THREE.Vector3()), `${component}/${flip}: bore stays open`);
    const ray = new THREE.Raycaster(metal.clone().addScaledVector(plane.normal, -10), plane.normal);
    assert(caps.pick(ray)?.object.userData.partId === 'fixture', `${component}/${flip}: metal selectable`);
    ray.set(plane.normal.clone().multiplyScalar(-10), plane.normal);
    assert(caps.pick(ray) === null, `${component}/${flip}: bore not selectable`);
    render({enabled: false});
    assert(isBackground(metal), `${component}/${flip}: fill toggle hides cap`);
    render({style: 'wire'});
    assert(isBackground(metal), `${component}/${flip}: wireframe has no fill`);
    render({style: 'cad'});
    assert(!isBackground(metal) && isBackground(new THREE.Vector3()), `${component}/${flip}: CAD preserves bore`);
    render({style: 'xray'});
    assert(!isBackground(metal) && isBackground(new THREE.Vector3()), `${component}/${flip}: X-ray preserves bore`);
    group.visible = false; render();
    assert(isBackground(metal) && caps.diagnostics().activeParts === 0, `${component}/${flip}: hidden part has no cap`);
    group.visible = true; plane.constant = 3; render();
    assert(isBackground(metal) && caps.diagnostics().activeParts === 0, `${component}/${flip}: remote plane has no cap`);
    caps.dispose();
    group.children[0].geometry.dispose();
  }
  const group = new THREE.Group();
  for (const x of [-0.3, 0.3]) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 2), material);
    cube.position.x = x; group.add(cube);
  }
  let fixture = setup([part(group)], new THREE.Plane(new THREE.Vector3(0, 0, -1), 0));
  fixture.render();
  assert(!isBackground(new THREE.Vector3()), 'Overlapping solids keep their union filled');
  group.scale.x = -1; fixture.render();
  assert(!isBackground(new THREE.Vector3()), 'Mirrored transforms keep filled material');
  group.position.x = 1; fixture.render();
  assert(!isBackground(new THREE.Vector3(1, 0, 0)) && isBackground(new THREE.Vector3(-0.5, 0, 0)), 'Moved part follows its section');
  fixture.caps.dispose();
  const instances = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 0.8, 1), material, 3);
  instances.setMatrixAt(0, new THREE.Matrix4().makeTranslation(-1, 0, 0));
  instances.setMatrixAt(1, new THREE.Matrix4().makeTranslation(1, 0, 0));
  instances.setMatrixAt(2, new THREE.Matrix4().makeTranslation(0, 0, -3));
  const instanceGroup = new THREE.Group(); instanceGroup.add(instances);
  const instancePlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  fixture = setup([part(instanceGroup)], instancePlane);
  fixture.render();
  assert(!isBackground(new THREE.Vector3(-1, 0, 0)) && !isBackground(new THREE.Vector3(1, 0, 0)), 'Both crossing instances filled');
  assert(isBackground(new THREE.Vector3()), 'Non-crossing instance does not create a cap');
  assert(fixture.caps.diagnostics().activeInstances === 2, 'Instance plane culling selects exactly two instances');
  instanceGroup.visible = false; fixture.render();
  instancePlane.constant = -3; fixture.render();
  instanceGroup.visible = true; fixture.render();
  assert(fixture.caps.diagnostics().activeInstances === 1, 'Hidden plane changes invalidate cached instance culling');
  assert(!isBackground(new THREE.Vector3(0, 0, -3)) && isBackground(new THREE.Vector3(1, 0, -3)), 'Restored part uses the new cut instead of stale cap pixels');
  assert(fixture.caps.pick(new THREE.Raycaster(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, -1)))?.object.userData.partId === 'fixture', 'Restored part cap picking follows the hidden plane change');
  fixture.caps.dispose();
  // Stencil state must not leak from one selectable part into another.
  const left = new THREE.Group(), right = new THREE.Group();
  hollowRod(left, [-1, 0, -1], [-1, 0, 1], 0.8, 0.35, material, 64);
  right.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 1), material)); right.position.x = 1;
  fixture = setup([part(left, 'left'), part(right, 'right')], new THREE.Plane(new THREE.Vector3(0, 0, -1), 0));
  fixture.render();
  assert(isBackground(new THREE.Vector3(-1, 0, 0)) && !isBackground(new THREE.Vector3(1, 0, 0)), 'Per-part stencil reset preserves neighboring bore');
  fixture.caps.dispose();

  // Exercise the main-viewer hit merge with actual clipped source surfaces.
  function renderedHit(parts, caps, point, plane) {
    const ray = new THREE.Raycaster();
    const screen = point.clone().project(camera);
    ray.setFromCamera(new THREE.Vector2(screen.x, screen.y), camera);
    const hits = ray.intersectObjects(parts.filter(p => p.group.visible).map(p => p.group), true);
    let hit = hits.find(h => h.object.isMesh && (h.object.userData.system === 'supports' || plane.distanceToPoint(h.point) >= -1e-7));
    const capHit = caps.pick(ray);
    if (capHit && (!hit || capHit.distance < hit.distance)) hit = capHit;
    return hit;
  }
  for (const projection of ['orthographic', 'perspective']) {
    camera = projection === 'perspective'
      ? new THREE.PerspectiveCamera(30, 1, 0.1, 30)
      : new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 30);
    const retained = new THREE.Group();
    const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    const sourceMaterial = material.clone();
    sourceMaterial.clippingPlanes = [clip];
    const sleeve = hollowRod(retained, [0, 0, -1], [0, 0, 1], 1, 0.45, sourceMaterial, 96);
    sleeve.userData = {partId: 'retained', system: 'fixture'};
    const parts = [part(retained, 'retained')];
    scene.add(retained);
    fixture = setup(parts, clip);
    // Make the retained source visually distinguishable from the captured cap color.
    sourceMaterial.color.set(0xc82626);
    const metal = new THREE.Vector3(0.7, 0, 0);
    fixture.render();
    const cappedPixel = pixelAt(metal);
    const removedHit = renderedHit(parts, fixture.caps, metal, clip);
    assert(removedHit?.object.userData.isSectionCap && removedHit.object.userData.partId === 'retained', `${projection}: exposed cap wins nearest-hit selection`);
    fixture.render({enabled: false});
    const uncappedPixel = pixelAt(metal);
    assert(cappedPixel.slice(0, 3).some((value, i) => Math.abs(value - uncappedPixel[i]) > 15), `${projection}: cap draws over farther retained surface`);
    fixture.render();
    assert(isBackground(new THREE.Vector3()), `${projection}: source and cap preserve the open bore`);

    camera.position.set(0, 0, -10); camera.lookAt(0, 0, 0); camera.updateMatrixWorld(true);
    fixture.render();
    const retainedPixel = pixelAt(metal);
    const retainedHit = renderedHit(parts, fixture.caps, metal, clip);
    assert(retainedHit?.object === sleeve && !retainedHit.object.userData.isSectionCap, `${projection}: nearer uncut surface wins selection`);
    fixture.render({enabled: false});
    assert(pixelAt(metal).every((value, i) => value === retainedPixel[i]), `${projection}: cap does not overwrite the nearer retained surface`);

    camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0); camera.updateMatrixWorld(true);
    clip.constant = 0.3;
    metal.z = 0.3;
    fixture.render();
    const offsetHit = renderedHit(parts, fixture.caps, metal, clip);
    assert(offsetHit?.object.userData.isSectionCap && Math.abs(offsetHit.point.z - 0.3) < 1e-6, `${projection}: nonzero section offset moves visible and selectable cap`);

    const blocker = new THREE.Group();
    const blockerMaterial = new THREE.MeshBasicMaterial({color: 0x1d64cb});
    const blockerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), blockerMaterial);
    blockerMesh.position.set(0.7, 0, 2);
    blockerMesh.userData = {partId: 'blocker', system: 'supports'};
    blocker.add(blockerMesh); scene.add(blocker); blocker.updateMatrixWorld(true);
    const blockedPoint = new THREE.Vector3(0.7, 0, 2);
    fixture.render();
    const blockedPixel = pixelAt(blockedPoint);
    const blockedHit = renderedHit([...parts, {group: blocker}], fixture.caps, blockedPoint, clip);
    assert(blockedHit?.object === blockerMesh, `${projection}: uncut support in front occludes cap selection`);
    fixture.render({enabled: false});
    assert(pixelAt(blockedPoint).every((value, i) => value === blockedPixel[i]), `${projection}: uncut support occludes cap pixels`);
    scene.remove(blocker, retained);
    fixture.caps.dispose();
    sleeve.geometry.dispose(); sourceMaterial.dispose(); blockerMesh.geometry.dispose(); blockerMaterial.dispose();
  }

  camera = new THREE.OrthographicCamera(-2.5, 2.5, 2.5, -2.5, 0.1, 30);
  const overlapParts = ['first', 'last'].map((id, i) => {
    const group = new THREE.Group();
    const ownMaterial = new THREE.MeshStandardMaterial({color: i ? 0x3d9964 : 0xcb5140});
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), ownMaterial));
    return part(group, id);
  });
  fixture = setup(overlapParts, new THREE.Plane(new THREE.Vector3(0, 0, -1), 0));
  fixture.render();
  const lastPixel = pixelAt(new THREE.Vector3());
  const overlapRay = new THREE.Raycaster(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, -1));
  assert(fixture.caps.pick(overlapRay)?.object.userData.partId === 'last', 'Coplanar overlapping parts select the last drawn cap');
  overlapParts[0].group.visible = false; fixture.render();
  assert(pixelAt(new THREE.Vector3()).every((value, i) => value === lastPixel[i]), 'Coplanar cap picking matches the final visible part color');
  fixture.caps.dispose();
  window.__sectionCapTestResults = {passed: true, assertions: results.length, results};
} catch (error) {
  window.__sectionCapTestResults = {passed: false, assertions: results.length, results, error: error.message};
  console.error(error);
}
document.getElementById('results').textContent = JSON.stringify(window.__sectionCapTestResults, null, 2);

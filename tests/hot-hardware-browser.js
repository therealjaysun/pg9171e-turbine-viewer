import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {buildAssembly} from '../src/model/assembly.js';

const model = buildAssembly(), views = [];
const specs = [
  {id: 'turbine-wheel-2', title: 'Stage 2 bucket', caption: 'Platform seam · shank · attachment end faces', vanes: 1},
  {id: 'turbine-nozzle-1', title: 'Stage 1 nozzle segment', caption: 'Mounting rails · cover · inner platform', vanes: 2},
  {id: 'turbine-nozzle-2', title: 'Stage 2 nozzle segment', caption: 'Mounting rails · cavity entries · seal lands', vanes: 3},
];
for (const spec of specs) {
  const article = document.createElement('article');
  const heading = document.createElement('h2'); heading.textContent = spec.title;
  article.appendChild(heading); document.getElementById('views').appendChild(article);
  const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0xf1f4f0);
  article.appendChild(renderer.domElement);
  const caption = document.createElement('p'); caption.textContent = spec.caption; article.appendChild(caption);
  const scene = new THREE.Scene(), group = new THREE.Group(); scene.add(group);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x75897e, 2.5));
  const light = new THREE.DirectionalLight(0xffffff, 3.2); light.position.set(-3, 4, 3); scene.add(light);
  const part = model.parts.find(part => part.id === spec.id);
  part.group.traverse(object => {
    if (!object.isInstancedMesh) return;
    const data = object.geometry.userData;
    const airfoil = Boolean(object.userData.csgAirfoil);
    if (!airfoil && !data.bucketBand && !data.attachmentFace && !data.nozzlePlatform && !data.nozzleInnerPlatform && !data.impingementCover) return;
    const count = airfoil ? spec.vanes : 1;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(object.geometry, object.material.clone());
      // Geometry is already expressed at its station radius. Keep nozzle vane
      // angular positions inside segment zero; bucket geometry is centered at 0.
      if (airfoil && spec.vanes > 1) mesh.rotation.x = (i + 0.5) * Math.PI * 2 / object.count;
      group.add(mesh);
    }
  });
  const bounds = new THREE.Box3().setFromObject(group), center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3()), extent = Math.max(size.x, size.y, size.z);
  const camera = new THREE.PerspectiveCamera(34, 0.9, 0.001, 10);
  camera.position.copy(center).addScaledVector(new THREE.Vector3(-1.8, 0.9, 2.6).normalize(), extent * 2.6);
  const controls = new OrbitControls(camera, renderer.domElement); controls.target.copy(center); controls.update();
  const resize = () => {
    const width = article.clientWidth - 24, height = width / 0.9;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  controls.addEventListener('change', () => renderer.render(scene, camera));
  new ResizeObserver(resize).observe(article); resize();
  views.push({renderer, scene, camera, spec});
}
document.getElementById('results').textContent = 'Ready · three isolated samples from the assembly geometry.';
document.getElementById('save').onclick = () => {
  const canvas = document.createElement('canvas'); canvas.width = 1560; canvas.height = 730;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#f4f6f3'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#263f38'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('R06 · Photo-informed hot-section hardware', 24, 38);
  views.forEach(({renderer, scene, camera, spec}, i) => {
    renderer.render(scene, camera); ctx.drawImage(renderer.domElement, 24 + i * 512, 95, 488, 542);
    ctx.font = 'bold 20px sans-serif'; ctx.fillText(spec.title, 24 + i * 512, 78);
    ctx.font = '15px sans-serif'; ctx.fillText(spec.caption, 24 + i * 512, 665);
  });
  ctx.font = '16px sans-serif'; ctx.fillText('Estimated dimensions. Attachment end detail only; full-depth sockets and individual cooling plenums remain simplified.', 24, 707);
  const link = document.createElement('a'); link.download = 'psm-hot-section-detail.png'; link.href = canvas.toDataURL('image/png'); link.click();
};

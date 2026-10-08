import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {buildAssembly} from '../src/model/assembly.js';

const model=buildAssembly(), views=[];
model.explosion.apply(0,1);
const specs=[
  {title:'Combustor · canted axial separation',ids:['combustor-1','combustor-liner-1','transition-1'],direction:[-.4,.6,2],caption:'Fuel nozzle pack → end cover → liner → sleeve → transition'},
  {title:'Turbine bucket pack · axial withdrawal',ids:['turbine-wheel-2'],direction:[-.65,.4,2],caption:'Platforms, shanks, airfoils and tip hardware stay together'},
  {title:'Nozzle segments · radial separation',ids:['turbine-nozzle-1'],direction:[-3,.3,.4],caption:'18 cast segments · each carries two vanes and its platforms'},
  {title:'Bearing 3 · radial pads and axial seals',ids:['bearing-3'],direction:[-1.3,.7,2],caption:'Split housing · five pads with pivots · seal and retainer rings'},
];
for(const spec of specs) {
  const article=document.createElement('article'), heading=document.createElement('h2');
  heading.textContent=spec.title;article.appendChild(heading);document.getElementById('views').appendChild(article);
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf1f4f0);article.appendChild(renderer.domElement);
  const caption=document.createElement('p');caption.textContent=spec.caption;article.appendChild(caption);
  const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
  scene.add(new THREE.HemisphereLight(0xffffff,0x75897e,2.5));
  const light=new THREE.DirectionalLight(0xffffff,3.2);light.position.set(-3,4,3);scene.add(light);
  for(const id of spec.ids) group.add(model.parts.find(part=>part.id===id).group.clone(true));
  const bounds=new THREE.Box3().setFromObject(group),center=bounds.getCenter(new THREE.Vector3());
  const size=bounds.getSize(new THREE.Vector3());
  const direction=new THREE.Vector3(...spec.direction).normalize();
  const right=new THREE.Vector3().crossVectors(direction,new THREE.Vector3(0,1,0)).normalize();
  const up=new THREE.Vector3().crossVectors(right,direction).normalize();
  let halfWidth=0,halfHeight=0,depth=0;
  for(const x of [-1,1]) for(const y of [-1,1]) for(const z of [-1,1]) {
    const corner=new THREE.Vector3(x*size.x/2,y*size.y/2,z*size.z/2);
    halfWidth=Math.max(halfWidth,Math.abs(corner.dot(right)));
    halfHeight=Math.max(halfHeight,Math.abs(corner.dot(up)));
    depth=Math.max(depth,Math.abs(corner.dot(direction)));
  }
  const camera=new THREE.PerspectiveCamera(34,1.7,.001,100);
  const distance=Math.max(halfWidth/1.7,halfHeight)/Math.tan(17*Math.PI/180)*1.1+depth*.5;
  camera.position.copy(center).addScaledVector(direction,distance);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(center);controls.update();
  const resize=()=>{const width=article.clientWidth-24;renderer.setSize(width,width/1.7,false);renderer.render(scene,camera);};
  controls.addEventListener('change',()=>renderer.render(scene,camera));new ResizeObserver(resize).observe(article);resize();
  views.push({renderer,scene,camera,spec});
}
document.getElementById('results').textContent='Ready · four nested assemblies from the same geometry and motion controller as the viewer.';
document.getElementById('save').onclick=()=>{
  const canvas=document.createElement('canvas');canvas.width=1560;canvas.height=1120;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#f4f6f3';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#263f38';ctx.font='bold 28px sans-serif';ctx.fillText('Directional explosion · nested subassemblies',24,40);
  views.forEach(({renderer,scene,camera,spec},i)=>{
    const x=24+(i%2)*768,y=86+Math.floor(i/2)*493;
    const originalSize=renderer.getSize(new THREE.Vector2()),pixelRatio=renderer.getPixelRatio();
    renderer.setPixelRatio(1);renderer.setSize(744,438,false);renderer.render(scene,camera);
    ctx.drawImage(renderer.domElement,x,y+28,744,438);
    renderer.setPixelRatio(pixelRatio);renderer.setSize(originalSize.x,originalSize.y,false);renderer.render(scene,camera);
    ctx.font='bold 21px sans-serif';ctx.fillText(spec.title,x,y+12);
    ctx.font='16px sans-serif';ctx.fillText(spec.caption,x,y+489);
  });
  ctx.font='17px sans-serif';ctx.fillText('Estimated inspection positions. Geometry is restored exactly at zero separation; this is not a service procedure.',24,1100);
  const link=document.createElement('a');link.download='directional-exploded-subassemblies.png';link.href=canvas.toDataURL('image/png');link.click();
};

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { createIcons, icons } from 'lucide';
import { buildAssembly, systems } from './model/assembly.js';
import { createSectionCaps } from './section-caps.js';
import './style.css';
import { createEducationPanel } from './education/panel.js';
import { supplyForPart, heatColor } from './supply-chain/index.js';

const $ = id => document.getElementById(id);
const icon = name => `<i data-lucide="${name}"></i>`;
const refreshIcons = () => createIcons({icons,attrs:{'stroke-width':1.6}});
const state = {view:'section',style:'shaded',explode:0,targetExplode:0,sectionAxis:'z',sectionPosition:0,sectionFlip:1,sectionFill:true,selected:null,selectedSystem:null,isolatedPart:null,hidden:new Set(),casings:true,rotors:true,supports:true,labels:true,flow:false,spinning:false,explodeAnimating:false,orthographic:false};
const originalInspector=$('inspector').innerHTML;
const container=$('canvas-container');
const viewport=$('viewport');
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,stencil:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
renderer.setClearColor(0xedf0ed);
renderer.localClippingEnabled=true;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
container.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label','Interactive PG9171E gas turbine model');
renderer.domElement.setAttribute('role','img');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xedf0ed);
const environment=new RoomEnvironment();
const pmrem=new THREE.PMREMGenerator(renderer);
const env=pmrem.fromScene(environment,.04);
scene.environment=env.texture;
scene.environmentIntensity=.63;
environment.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xf6faf1,0x6c7a72,1.2));
const key=new THREE.DirectionalLight(0xfff9ed,2.0);
key.position.set(-4,9,7);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:40});
key.shadow.normalBias=.018;key.shadow.bias=-.00015;scene.add(key);
const rim=new THREE.DirectionalLight(0xd7e6ee,1.5);rim.position.set(5,3,-7);scene.add(rim);
const fill=new THREE.DirectionalLight(0xffffff,.75);fill.position.set(-7,0,2);scene.add(fill);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x61735c,opacity:.15}));
ground.rotation.x=-Math.PI/2;ground.position.y=-2.56;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(80,80,0xb6c3b1,0xc9d2c4);grid.position.y=-2.55;grid.material.transparent=true;grid.material.opacity=.22;scene.add(grid);

const perspective=new THREE.PerspectiveCamera(34,1,.02,300);
const orthographic=new THREE.OrthographicCamera(-10,10,10,-10,.02,300);
let camera=perspective;
let controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.5;controls.maxDistance=100;controls.maxPolarAngle=Math.PI*.94;
let cameraTween=null,orthoScale=7;
let assembly, educationPanel, sectionCaps, materialRecords=[], edgeRecords=[], meshes=[], labels=[], lastTime=0, frame=0;
let supplyRecords = new Map(), heatmap = 'none', cameraFocusParts;
const sectionPlane=new THREE.Plane(new THREE.Vector3(0,0,-1),0);
const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
const targetBox=new THREE.Box3();
const tempVec=new THREE.Vector3();
const selectionBox=new THREE.Box3Helper(new THREE.Box3(),0x5b9670);selectionBox.visible=false;scene.add(selectionBox);

function resize() {
  const width=container.clientWidth,height=container.clientHeight;
  renderer.setSize(width,height,false);perspective.aspect=width/height;perspective.updateProjectionMatrix();
  const aspect=width/height;orthographic.left=-orthoScale*aspect;orthographic.right=orthoScale*aspect;orthographic.top=orthoScale;orthographic.bottom=-orthoScale;orthographic.updateProjectionMatrix();
}
let resizeFitTimer;
new ResizeObserver(()=>{resize();if(assembly){clearTimeout(resizeFitTimer);resizeFitTimer=setTimeout(()=>fitCamera(null,false,cameraFocusParts),180);}}).observe(container);

function boundsFor(parts=assembly.parts) {
  const b=new THREE.Box3();
  for(const p of parts)if(p.group.visible)b.expandByObject(p.group);
  return b.isEmpty()?new THREE.Box3(new THREE.Vector3(-5,-2,-2),new THREE.Vector3(5,2,2)):b;
}

function fitCamera(direction,immediate=false,parts) {
  cameraFocusParts = parts;
  assembly.root.updateMatrixWorld(true);
  const bounds=boundsFor(parts);const center=bounds.getCenter(new THREE.Vector3());const size=bounds.getSize(new THREE.Vector3());
  const dir=direction?new THREE.Vector3(...direction).normalize():camera.position.clone().sub(controls.target).normalize();
  const forward=dir.clone().negate();const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).normalize();
  if(right.lengthSq()<.001)right.set(1,0,0);
  const up=new THREE.Vector3().crossVectors(right,forward).normalize();
  let halfWidth=0,halfHeight=0,depth=0;
  for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){const v=new THREE.Vector3(x*size.x/2,y*size.y/2,z*size.z/2);halfWidth=Math.max(halfWidth,Math.abs(v.dot(right)));halfHeight=Math.max(halfHeight,Math.abs(v.dot(up)));depth=Math.max(depth,Math.abs(v.dot(dir)));}
  const aspect=container.clientWidth/container.clientHeight;
  const usableHeight=container.clientWidth<600?.62:.76,usableWidth=container.clientWidth<600?.76:.95;
  const tangent=Math.tan(THREE.MathUtils.degToRad(perspective.fov/2));
  const distance=Math.max(halfHeight/(tangent*usableHeight),halfWidth/(tangent*aspect*usableWidth))+depth*.4;
  orthoScale=Math.max(halfHeight/usableHeight,halfWidth/(aspect*usableWidth));orthographic.zoom=1;resize();
  const next=center.clone().addScaledVector(dir,distance);
  if(immediate){camera.position.copy(next);controls.target.copy(center);controls.update();}
  else cameraTween={from:camera.position.clone(),to:next,fromTarget:controls.target.clone(),toTarget:center,start:performance.now()};
}

function switchProjection() {
  state.orthographic=!state.orthographic;
  const prior=camera;camera=state.orthographic?orthographic:perspective;
  camera.position.copy(prior.position);camera.quaternion.copy(prior.quaternion);
  const target=controls.target.clone();controls.dispose();controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.5;controls.maxDistance=100;
  $('projection').setAttribute('aria-pressed',String(state.orthographic));
  $('projection').title=state.orthographic?'Perspective projection':'Orthographic projection';
  $('projection').setAttribute('aria-label',$('projection').title);
  fitCamera(null,true);
}

function createEdges(object) {
  const base=new THREE.EdgesGeometry(object.geometry,32);
  let geometry=base;
  if(object.isInstancedMesh) {
    const source=base.attributes.position,positions=new Float32Array(source.array.length*object.count),matrix=new THREE.Matrix4(),v=new THREE.Vector3();
    for(let i=0;i<object.count;i++){object.getMatrixAt(i,matrix);for(let j=0;j<source.count;j++){v.fromBufferAttribute(source,j).applyMatrix4(matrix);const k=i*source.array.length+j*3;positions[k]=v.x;positions[k+1]=v.y;positions[k+2]=v.z;}}
    geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));base.dispose();
  }
  const edgeMat=new THREE.LineBasicMaterial({color:0x334c48,transparent:true,opacity:.36,depthWrite:false});
  const lines=new THREE.LineSegments(geometry,edgeMat);lines.visible=false;lines.userData.isEdge=true;object.add(lines);edgeRecords.push({object:lines,material:edgeMat,system:object.userData.system});
}

function prepareMaterials() {
  for(const p of assembly.parts) {
    const localMaterials=new Map();
    p.group.traverse(object=>{
      if(!object.isMesh)return;
      meshes.push(object);
      const src=object.material;
      if(!localMaterials.has(src.uuid)) {
        const mat=src.clone();localMaterials.set(src.uuid,mat);
        materialRecords.push({mat,base:mat.color.clone(),metalness:mat.metalness,roughness:mat.roughness,kind:p.kind,id:p.id,system:p.system});
      }
      object.material=localMaterials.get(src.uuid);
    });
  }
}

let edgeBuildIndex=0,edgesBuilding=false;
function buildEdgesIncrementally() {
  if(edgesBuilding||edgeBuildIndex===meshes.length)return;
  edgesBuilding=true;
  const batch=()=>{
    const started=performance.now();
    while(edgeBuildIndex<meshes.length&&performance.now()-started<10){
      createEdges(meshes[edgeBuildIndex++]);
      const edge=edgeRecords.at(-1);
      edge.object.visible=state.style==='cad';
      edge.material.clippingPlanes=state.view==='section'&&edge.system!=='supports'?[sectionPlane]:[];
    }
    if(edgeBuildIndex<meshes.length)requestAnimationFrame(batch);
    else edgesBuilding=false;
  };
  requestAnimationFrame(batch);
}
function applyStyle() {
  if(state.style==='cad')buildEdgesIncrementally();
  for(const m of materialRecords) {
    const selected=state.selected===m.id||state.selectedSystem===m.system;
    m.mat.color.copy(m.base);m.mat.emissive.set(selected?0x316843:0);m.mat.emissiveIntensity=selected?.24:0;
    m.mat.wireframe=state.style==='wire';m.mat.transparent=false;m.mat.opacity=1;m.mat.depthWrite=true;
    m.mat.metalness=m.metalness;m.mat.roughness=m.roughness;
    if(state.style==='cad'){m.mat.color.lerp(new THREE.Color(0xc5c9c2),.72);m.mat.metalness=.12;m.mat.roughness=.75;}
    if(state.style==='wire'){m.mat.color.set(selected?0x388056:0x527064);m.mat.metalness=0;}
    if(state.style==='xray'&&(m.kind==='casing'||m.kind==='support')){m.mat.transparent=true;m.mat.opacity=.15;m.mat.depthWrite=false;}
    const heat = heatColor(supplyRecords.get(m.id), heatmap);
    if(heat){m.mat.color.set(heat);m.mat.metalness=.05;m.mat.roughness=.85;}
    m.mat.needsUpdate=true;
  }
  for(const edge of edgeRecords)edge.object.visible=state.style==='cad';
  applySection();
}

function applySection() {
  const axis=state.sectionAxis;const normal=new THREE.Vector3();normal[axis]=-state.sectionFlip;
  const extent=axis==='x'?7:3;
  sectionPlane.normal.copy(normal);sectionPlane.constant=state.sectionPosition/100*extent*state.sectionFlip;
  for(const m of materialRecords){m.mat.clippingPlanes=state.view==='section'&&m.system!=='supports'?[sectionPlane]:[];m.mat.clipShadows=true;}
  for(const e of edgeRecords)e.material.clippingPlanes=state.view==='section'&&e.system!=='supports'?[sectionPlane]:[];
  $('section-fill').disabled=state.view!=='section'||state.style==='wire';
}

function updateSectionCaps() {
  assembly.root.updateMatrixWorld(true);
  sectionCaps.update({enabled:state.view==='section'&&state.sectionFill,style:state.style,selected:state.selected,selectedSystem:state.selectedSystem,colors:heatmapColors});
}

let heatmapColors = null;
function setHeatmap(mode) {
  heatmap = mode;
  heatmapColors = mode === 'none' ? null : new Map([...supplyRecords].map(([id, record])=>[id,heatColor(record,mode)]));
  $('heatmap-key').hidden = mode === 'none';
  $('heatmap-key').querySelector('b').textContent = mode === 'cost' ? 'Relative replacement cost' : 'Operational criticality';
  applyStyle();
}

function navigateToSupplyPart(id) {
  const part = assembly.parts.find(p=>p.id===id);
  if(!part)return;
  state.hidden.delete(part.system);
  if(state.isolatedPart!==id)state.isolatedPart=null;
  if(part.kind==='casing'){state.casings=true;$('casings').checked=true;}
  if(part.kind==='rotor'){state.rotors=true;$('rotors').checked=true;}
  if(part.system==='supports'){state.supports=true;$('supports').checked=true;}
  applyVisibility();
  selectPart(id);
  educationPanel.showSupply();
  const list = $('parts-'+part.system);
  list.hidden=false;
  const expand=document.querySelector('[data-expand="'+part.system+'"]');
  expand.setAttribute('aria-expanded','true');expand.parentElement.classList.add('expanded');
  fitCamera(null,false,[part]);
  $('learning-title').focus({preventScroll:true});
}

function applyVisibility() {
  for(const p of assembly.parts)p.group.visible=(!state.isolatedPart||state.isolatedPart===p.id)&&!state.hidden.has(p.system)&&(state.casings||p.kind!=='casing')&&(state.rotors||p.kind!=='rotor')&&(state.supports||p.system!=='supports');
  document.querySelectorAll('.system-row').forEach(row=>{row.classList.toggle('off',state.hidden.has(row.dataset.system));const btn=row.querySelector('[data-eye]');btn.innerHTML=icon(state.hidden.has(row.dataset.system)?'eye-off':'eye');btn.setAttribute('aria-pressed',String(!state.hidden.has(row.dataset.system)));});
  if(state.selected&&!assembly.parts.find(p=>p.id===state.selected)?.group.visible)selectPart(null);
  flowGroup.visible=state.flow&&state.view!=='exploded'&&!state.isolatedPart&&state.hidden.size===0;
  refreshIcons();
}

function setView(view) {
  state.view=view;state.explodeAnimating=false;$('explode-play').innerHTML=icon('play');
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view));});
  $('section-controls').hidden=view!=='section';$('explode-controls').hidden=view!=='exploded';
  const titles={assembled:['ASSEMBLY 01','PG9171E gas turbine','Complete casing and auxiliary details'],section:['SECTION A-A','The complete flow path','Longitudinal section'],exploded:['EXPLODED ASSEMBLY','Inside the Frame 9E','Component separation']};
  [$('view-code').textContent,$('view-title').textContent,$('view-subtitle').textContent]=titles[view];
  state.targetExplode=view==='exploded'?Number($('explode-amount').value)/100:0;
  applySection();
  flowGroup.visible=state.flow&&view!=='exploded'&&!state.isolatedPart&&state.hidden.size===0;
  setTimeout(()=>fitCamera(null),550);
}

function renderTree() {
  $('assembly-tree').innerHTML=systems.map(s=>{
    const parts=assembly.parts.filter(p=>p.system===s.id);
    return `<div class="system-row" data-system="${s.id}"><button class="icon-btn" data-expand="${s.id}" aria-label="Expand ${s.name}" aria-expanded="false"><i data-lucide="chevron-right" class="chevron"></i></button><button class="system-select" data-select-system="${s.id}"><i class="system-color" style="background:${s.color}"></i><span>${s.name}</span><span class="count">${String(parts.length).padStart(2,'0')}</span></button><button class="icon-btn" data-eye="${s.id}" title="Toggle ${s.name}" aria-label="Toggle ${s.name}" aria-pressed="true">${icon('eye')}</button></div><div class="part-list" id="parts-${s.id}" hidden>${parts.map(p=>`<button class="part-button" data-part="${p.id}" title="${p.name}">${p.name}</button>`).join('')}</div>`;
  }).join('');
  $('part-count').textContent=`${assembly.parts.length} PARTS`;
  $('assembly-tree').addEventListener('click',event=>{
    const expand=event.target.closest('[data-expand]'),eye=event.target.closest('[data-eye]'),sys=event.target.closest('[data-select-system]'),part=event.target.closest('[data-part]');
    if(expand){const list=$(`parts-${expand.dataset.expand}`);list.hidden=!list.hidden;expand.setAttribute('aria-expanded',String(!list.hidden));expand.parentElement.classList.toggle('expanded',!list.hidden);}
    if(eye){const id=eye.dataset.eye;state.hidden.has(id)?state.hidden.delete(id):state.hidden.add(id);applyVisibility();}
    if(sys)selectSystem(sys.dataset.selectSystem);
    if(part)selectPart(part.dataset.part);
  });
}

function selectPart(id) {
  if(!id)cameraFocusParts=undefined;
  state.selected=id;state.selectedSystem=null;
  const p=assembly.parts.find(p=>p.id===id);
  educationPanel.selectPart(p);
  document.querySelectorAll('.part-button').forEach(b=>b.classList.toggle('active',b.dataset.part===id));
  document.querySelectorAll('.system-row').forEach(b=>b.classList.remove('selected'));
  $('selection-tag').hidden=!p;
  if(!p){$('inspector').innerHTML=originalInspector;$('selection-status').textContent='PG9171E / COMPLETE ASSEMBLY';selectionBox.visible=false;}
  else {
    $('selection-tag').querySelector('span').textContent=p.name;
    $('selection-status').textContent=p.name.toUpperCase();
    $('inspector').innerHTML=`<div class="section-heading"><h2>Selected component</h2></div><h3>${p.name}</h3><p>${p.description||'Reconstructed component geometry.'}</p><dl>${(p.facts||[]).map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="inspector-actions"><button id="focus-part">${icon('scan')}Focus</button><button id="isolate-part">${icon('focus')}Isolate</button>${p.sourceTime?`<a href="https://www.youtube.com/watch?v=4r1-IMMS73s&t=${p.sourceTime}s" target="_blank" rel="noreferrer">${icon('external-link')}Source</a>`:''}</div>`;
    $('focus-part').onclick=()=>fitCamera(null,false,[p]);
    $('isolate-part').onclick=()=>{state.isolatedPart=p.id;applyVisibility();fitCamera(null,false,[p]);toast('Selected component isolated');};
    selectionBox.visible=true;
  }
  applyStyle();refreshIcons();
}

function selectSystem(id) {
  selectPart(null);state.selectedSystem=id;
  const s=systems.find(s=>s.id===id),parts=assembly.parts.filter(p=>p.system===id);
  educationPanel.selectSystem(id);
  document.querySelector(`[data-system="${id}"]`).classList.add('selected');
  $('inspector').innerHTML=`<div class="section-heading"><h2>Selected assembly</h2></div><h3>${s.name}</h3><dl><div><dt>Selectable components</dt><dd>${parts.length}</dd></div><div><dt>Model status</dt><dd>Reconstructed</dd></div></dl><div class="inspector-actions"><button id="focus-system">${icon('scan')}Focus</button><button id="isolate-system">${icon('focus')}Isolate</button></div>`;
  $('focus-system').onclick=()=>fitCamera(null,false,parts);
  $('isolate-system').onclick=()=>{state.isolatedPart=null;state.hidden=new Set(systems.filter(s=>s.id!==id).map(s=>s.id));applyVisibility();fitCamera(null,false,parts);};
  $('selection-status').textContent=s.name.toUpperCase();applyStyle();refreshIcons();
}

const flowGroup=new THREE.Group();flowGroup.visible=false;scene.add(flowGroup);
const flowCurves=[];
function buildFlow() {
  const colors=[0x618d9b,0xc3a468,0xaf866a];
  const positions=new Float32Array(420*3),colorData=new Float32Array(420*3);
  for(let can=0;can<14;can++){
    const a=can*Math.PI*2/14;
    const radial=(x,r)=>new THREE.Vector3(x,r*Math.cos(a),r*Math.sin(a));
    flowCurves.push(new THREE.CatmullRomCurve3([radial(-5.1,1.65),radial(-4.25,.95),radial(-2.5,.92),radial(-.4,.86),radial(.3,1.15),radial(.3,1.65),radial(-.12,1.73),radial(.6,1.58),radial(1.55,1.1),radial(2.6,1.1),radial(3.6,1.2),radial(4.9,1.6),radial(5.2,2.1)]));
    for(let j=0;j<30;j++){const color=new THREE.Color(colors[j<12?0:j<20?1:2]);color.toArray(colorData,(can*30+j)*3);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colorData,3));
  const points=new THREE.Points(geo,new THREE.PointsMaterial({size:.045,vertexColors:true,transparent:true,opacity:.85,depthWrite:false}));points.name='Illustrative flow paths';flowGroup.add(points);
}

function buildLabels() {
  const definitions=[
    ['inlet','01','RADIAL INLET',[-4.8,1.65,0]],
    ['compressor','02','17-STAGE COMPRESSOR',[-2.7,1.45,0]],
    ['combustion','03','DLN1 COMBUSTION',[.7,2.35,0]],
    ['turbine','04','3-STAGE TURBINE',[2.65,1.85,0]],
    ['exhaust','05','EXHAUST DIFFUSER',[4.5,2.3,0]],
  ];
  labels=definitions.map(([system,number,text,point])=>{const el=document.createElement('div');el.className='model-label';el.innerHTML=`<span class="label-index">${number}</span>${text}`;$('label-layer').appendChild(el);return {system,el,point:new THREE.Vector3(...point)};});
}

function updateLabels() {
  const width=container.clientWidth,height=container.clientHeight;let rects=[];
  for(const label of labels) {
    const visible=state.labels&&!state.isolatedPart&&!state.hidden.has(label.system)&&!state.selected&&(width>620||label.system==='compressor'||label.system==='combustion');
    label.el.hidden=!visible;if(!visible)continue;
    tempVec.copy(label.point);tempVec.y+=state.explode*1.7;if(label.system==='compressor')tempVec.x-=state.explode;if(label.system==='exhaust')tempVec.x+=state.explode*1.6;
    tempVec.project(camera);let x=(tempVec.x*.5+.5)*width,y=(-tempVec.y*.5+.5)*height;
    const w=label.el.offsetWidth;const h=label.el.offsetHeight;
    x=THREE.MathUtils.clamp(x,w/2+10,width-w/2-55);y=Math.max(y,151);
    for(const r of rects)if(Math.abs(x-r.x)<(w+r.w)/2+10&&Math.abs(y-r.y)<h+8)y=r.y+h+12;
    label.el.style.left=`${x}px`;label.el.style.top=`${y}px`;label.el.hidden=tempVec.z>1||y>height-156;
    rects.push({x,y,w});
  }
}

let pointerDown=null;
renderer.domElement.addEventListener('pointerdown',e=>{pointerDown=[e.clientX,e.clientY];cameraTween=null;});
renderer.domElement.addEventListener('pointerup',e=>{
  if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>5)return;
  const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  updateSectionCaps();
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(assembly.parts.filter(p=>p.group.visible).map(p=>p.group),true);
  let hit=hits.find(h=>h.object.isMesh&&!h.object.userData.isEdge&&(state.view!=='section'||h.object.userData.system==='supports'||sectionPlane.distanceToPoint(h.point)>=-1e-7));
  const capHit=sectionCaps.pick(raycaster);
  if(capHit&&(!hit||capHit.distance<hit.distance))hit=capHit;
  selectPart(hit?.object.userData.partId||null);
});

function toast(message) {$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3200);}
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}

// Expand instances for portable exports and retain the named part hierarchy.
function exportAssembly(current) {
  const root=new THREE.Group();root.name='PG9171E DLN1 reconstructed assembly';
  assembly.root.updateMatrixWorld(true);
  const inverse=new THREE.Matrix4();const instance=new THREE.Matrix4();
  for(const p of assembly.parts) {
    if(current&&!p.group.visible)continue;
    const group=new THREE.Group();group.name=p.name;group.userData={component:p.id,system:p.system,sourceTime:p.sourceTime,geometry:'Reconstructed; dimensions estimated'};
    inverse.copy(p.group.matrixWorld).invert();
    if(current)group.matrix.copy(p.group.matrixWorld);else group.matrix.makeTranslation(...p.origin.toArray());
    group.matrixAutoUpdate=false;
    p.group.traverse(o=>{
      if(!o.isMesh)return;
      const mat=o.material.clone();mat.clippingPlanes=[];mat.wireframe=false;mat.transparent=false;mat.opacity=1;mat.depthWrite=true;mat.emissive.set(0);
      const source=materialRecords.find(m=>m.mat===o.material);if(source){mat.color.copy(source.base);mat.metalness=source.metalness;mat.roughness=source.roughness;}
      const local=new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld);
      const add=transform=>{const m=new THREE.Mesh(o.geometry,mat);m.name=o.name||p.name;m.matrix.copy(transform);m.matrixAutoUpdate=false;group.add(m);};
      if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);add(new THREE.Matrix4().multiplyMatrices(local,instance));}}
      else add(local);
    });root.add(group);
  }
  root.updateMatrixWorld(true);return root;
}

async function exportModel(format) {
  const buttons=document.querySelectorAll('[data-export]');buttons.forEach(b=>b.disabled=true);$('export-status').textContent='Preparing geometry...';
  await new Promise(resolve=>setTimeout(resolve,50));
  let exported;
  try {
    exported=exportAssembly($('export-scope').value==='current');
    if(format==='glb') {
      const binary=await new GLTFExporter().parseAsync(exported,{binary:true,onlyVisible:true});
      download(new Blob([binary],{type:'model/gltf-binary'}),'pg9171e-reconstruction.glb');
      $('export-status').textContent=`GLB exported (${(binary.byteLength/1e6).toFixed(1)} MB).`;
    } else {
      exported.scale.setScalar(1000);exported.updateMatrixWorld(true);
      const binary=new STLExporter().parse(exported,{binary:true});
      download(new Blob([binary],{type:'application/octet-stream'}),'pg9171e-reconstruction-mm.stl');
      $('export-status').textContent=`STL exported in millimetres (${(binary.byteLength/1e6).toFixed(1)} MB).`;
    }
  }catch(error){$('export-status').textContent=`Export failed: ${error.message}`;console.error(error);}
  finally{buttons.forEach(b=>b.disabled=false);const mats=new Set();exported?.traverse(o=>{if(o.isMesh)mats.add(o.material);});mats.forEach(m=>m.dispose());}
}

function bindControls() {
  document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>setView(button.dataset.view));
  $('render-style').onchange=e=>{state.style=e.target.value;applyStyle();};
  for(const name of ['casings','rotors','supports','labels','flow'])$(name).onchange=e=>{state[name]=e.target.checked;applyVisibility();};
  $('section-axis').onchange=e=>{state.sectionAxis=e.target.value;state.sectionPosition=0;$('section-position').value=0;$('section-value').textContent='0%';$('view-subtitle').textContent=e.target.options[e.target.selectedIndex].text+' section';applySection();};
  $('section-position').oninput=e=>{state.sectionPosition=Number(e.target.value);$('section-value').textContent=`${e.target.value}%`;applySection();};
  $('section-flip').onclick=()=>{state.sectionFlip*=-1;applySection();};
  $('section-fill').onchange=e=>{state.sectionFill=e.target.checked;};
  $('explode-amount').oninput=e=>{state.targetExplode=Number(e.target.value)/100;$('explode-value').textContent=`${e.target.value}%`;state.explodeAnimating=false;};
  $('explode-amount').onchange=()=>setTimeout(()=>fitCamera(null),400);
  $('explode-play').onclick=()=>{state.explodeAnimating=!state.explodeAnimating;$('explode-play').innerHTML=icon(state.explodeAnimating?'pause':'play');refreshIcons();};
  $('rotate-play').onclick=()=>{state.spinning=!state.spinning;$('rotate-play').setAttribute('aria-pressed',String(state.spinning));$('rotate-play').setAttribute('aria-label',state.spinning?'Pause rotor':'Animate rotor');$('rotate-play').innerHTML=icon(state.spinning?'pause':'play');$('motion-label').textContent=state.spinning?'Inspection speed':'Rotor stopped';refreshIcons();};
  $('projection').onclick=switchProjection;
  $('fit-view').onclick=()=>fitCamera(null);
  $('reset-view').onclick=()=>{selectPart(null);state.sectionPosition=0;state.sectionAxis='z';state.sectionFlip=1;$('section-position').value=0;$('section-value').textContent='0%';$('section-axis').value='z';applySection();fitCamera([-.28,.32,1]);};
  document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>fitCamera({iso:[-.28,.32,1],side:[0,.02,1],top:[0,1,.001],end:[-1,.01,.01]}[b.dataset.camera]));
  $('show-all').onclick=()=>{state.hidden.clear();state.isolatedPart=null;state.casings=true;state.rotors=true;state.supports=true;for(const id of ['casings','rotors','supports'])$(id).checked=true;applyVisibility();selectPart(null);fitCamera(null);};
  $('clear-selection').onclick=()=>selectPart(null);
  $('reference-open').onclick=()=>$('references-dialog').showModal();
  $('export-open').onclick=()=>$('export-dialog').showModal();
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
  for(const dialog of document.querySelectorAll('dialog'))dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};
  document.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>exportModel(b.dataset.export));
  $('menu-toggle').onclick=()=>$('assembly-panel').classList.toggle('open');
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('app').requestFullscreen();}catch{toast('Full screen is unavailable in this browser.');}};
  $('screenshot').onclick=()=>{updateSectionCaps();renderer.render(scene,camera);renderer.domElement.toBlob(blob=>{if(blob)download(blob,`pg9171e-${state.view}.png`);},'image/png');};
}

function animate(time) {
  const dt=Math.min((time-lastTime)/1000,.05)||0;lastTime=time;frame++;
  if(state.explodeAnimating){state.targetExplode=(Math.sin(time*.0004)+1)*.4;const value=Math.round(state.targetExplode*100);$('explode-amount').value=value;$('explode-value').textContent=`${value}%`;}
  const prev=state.explode;state.explode=THREE.MathUtils.damp(state.explode,state.targetExplode,7,dt);
  if(Math.abs(state.explode-prev)>.00001)for(const p of assembly.parts)p.group.position.copy(p.origin).addScaledVector(p.offset,state.explode);
  if(state.spinning)for(const r of assembly.rotors)r.rotation.x-=dt*.42;
  if(cameraTween){const t=Math.min((time-cameraTween.start)/650,1),eased=1-(1-t)**3;camera.position.lerpVectors(cameraTween.from,cameraTween.to,eased);controls.target.lerpVectors(cameraTween.fromTarget,cameraTween.toTarget,eased);if(t===1)cameraTween=null;}
  if(state.flow){const pos=flowGroup.children[0].geometry.attributes.position;for(let i=0;i<14;i++)for(let j=0;j<30;j++){const t=(j/30+time*.000035)%1;flowCurves[i].getPointAt(t,tempVec);pos.setXYZ(i*30+j,tempVec.x,tempVec.y,tempVec.z);}pos.needsUpdate=true;}
  controls.update();
  if(state.selected&&selectionBox.visible){const p=assembly.parts.find(p=>p.id===state.selected);selectionBox.box.setFromObject(p.group);}
  updateLabels();updateSectionCaps();renderer.render(scene,camera);
  if(frame%60===0){
    $('mesh-status').textContent=`${(renderer.info.render.triangles/1000).toFixed(0)}k TRIANGLES`;
    renderer.domElement.dataset.diagnostics=JSON.stringify(window.__turbineDiagnostics());
  }
  requestAnimationFrame(animate);
}

try {
  assembly=buildAssembly();supplyRecords=new Map(assembly.parts.map(p=>[p.id,supplyForPart(p)]));educationPanel=createEducationPanel({systems,parts:assembly.parts,onNavigate:navigateToSupplyPart,onHeatmap:setHeatmap});scene.add(assembly.root);prepareMaterials();sectionCaps=createSectionCaps({parts:assembly.parts,plane:sectionPlane});scene.add(sectionCaps.group);buildLabels();buildFlow();renderTree();bindControls();applyStyle();resize();fitCamera([-.28,.32,1],true);refreshIcons();$('loading').hidden=true;
  // Read-only diagnostics expose meaningful model and renderer state for verification.
  window.__turbineDiagnostics=()=>({selected:state.selected,heatmap,cameraTarget:controls.target.toArray(),focusedPartIds:cameraFocusParts?.map(p=>p.id)||[],heatColors:Object.fromEntries(assembly.parts.map(p=>[p.id,materialRecords.find(m=>m.id===p.id)?.mat.color.getHexString()])),parts:assembly.parts.length,view:state.view,style:state.style,explosion:state.explode,spinning:state.spinning,visibleParts:assembly.parts.filter(p=>p.group.visible).length,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,canvas:[renderer.domElement.width,renderer.domElement.height],camera:camera.position.toArray(),partIds:assembly.parts.map(p=>p.id),rotorAngle:assembly.rotors[0].rotation.x,sectionCaps:sectionCaps.diagnostics()});
  requestAnimationFrame(animate);
}catch(error){console.error(error);$('loading').innerHTML=`<span>Unable to build the turbine model.</span><span>${error.message}</span>`;}

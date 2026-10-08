import assert from 'node:assert/strict';
import * as THREE from 'three';
import {portableAssembly} from '../src/model/portable-assembly.js';

export function verifyExplosion(model) {
  const parts = new Map(model.parts.map(part => [part.id, part]));
  const part = id => parts.get(id).group;
  const close = (a,b,label) => assert.ok(a.distanceTo(b)<1e-6,label);
  const position = object => object.getWorldPosition(new THREE.Vector3());
  const originals = new Map();
  model.root.traverse(object => originals.set(object, {matrix:object.matrix.clone(),
    instances:object.isInstancedMesh ? object.instanceMatrix.array.slice() : null}));
  const baseline = portableAssembly(model);
  const meshes = root => {const result=[];root.traverse(o=>{if(o.isMesh) result.push(o);});return result;};

  for (const p of model.parts) {
    assert.ok(p.offset.x===0 || (p.offset.y===0 && p.offset.z===0), `${p.id}: primary motion must be axial or radial`);
    if (/(?:casing|wrapper|shell)-(?:upper|lower)$/.test(p.id)) {
      assert.equal(p.offset.x,0,`${p.id}: split casing must not slide axially`);
      assert.equal(Math.sign(p.offset.y),p.id.endsWith('upper')?1:-1,`${p.id}: casing opens outward`);
    }
  }
  model.explosion.apply(1,0);
  for (let i=1;i<=14;i++) {
    close(position(part(`combustor-${i}`)),position(part(`combustor-liner-${i}`)),`Can ${i}: liner stays with housing in primary explosion`);
    close(position(part(`combustor-${i}`)),position(part(`transition-${i}`)),`Can ${i}: transition stays with housing in primary explosion`);
  }
  for (let i=1;i<=3;i++) {
    const wheel=parts.get(`turbine-wheel-${i}`),nozzle=parts.get(`turbine-nozzle-${i}`);
    close(wheel.group.position,new THREE.Vector3(1.2+(i-1)*1.4,0,0),`Wheel ${i}: axial stack`);
    close(nozzle.group.position,new THREE.Vector3(.7+(i-1)*1.4,0,0),`Nozzle ${i}: axial stack`);
  }

  model.explosion.apply(1,1);
  for (let stage=1;stage<=3;stage++) {
    const group=part(`turbine-nozzle-${stage}`), count=stage===1?18:16;
    const matrix=new THREE.Matrix4();
    group.traverse(object=>{
      if (!object.userData.explodeSegments) return;
      for(let i=0;i<object.count;i++) {
        object.getMatrixAt(i,matrix);
        const prior=new THREE.Matrix4().fromArray(originals.get(object).instances,i*16);
        const delta=new THREE.Vector3().setFromMatrixPosition(matrix).sub(new THREE.Vector3().setFromMatrixPosition(prior));
        const angle=(Math.floor(i*count/object.count)+.5)*Math.PI*2/count;
        close(delta,new THREE.Vector3(0,.55*Math.cos(angle),.55*Math.sin(angle)),`Stage ${stage}: cast segment ${i} stays together radially`);
      }
      assert.ok(object.boundingSphere.radius>object.geometry.boundingSphere.radius, 'Fan bounds expand for picking and camera fit');
    });
    const pack=part(`turbine-wheel-${stage}`).children.find(o=>o.name.startsWith('Axial-entry'));
    close(pack.position,new THREE.Vector3(-.45,0,0),'Bucket pack follows axial-entry direction');
  }
  for(let i=1;i<=14;i++) {
    const frame=part(`combustor-${i}`).children.find(o=>o.children.some(c=>c.name==='Combustor end cover and fasteners'));
    const cover=frame.children.find(o=>o.name==='Combustor end cover and fasteners');
    const injectors=frame.children.find(o=>o.name.startsWith('Six primary'));
    const axis=new THREE.Vector3(1,0,0).applyQuaternion(frame.quaternion);
    close(position(cover).sub(position(frame)),axis.clone().multiplyScalar(-2.1),'Cover withdraws along canted can axis');
    close(position(injectors).sub(position(frame)),axis.clone().multiplyScalar(-3.15),'Fuel nozzle pack withdraws along canted can axis');
  }

  // Complete/assembled export must ignore both explosion layers and rotor phase.
  for (const rotor of model.rotors) rotor.rotation.x=.63;
  model.root.updateMatrixWorld(true);
  const restoredExport=portableAssembly(model),before=meshes(baseline),after=meshes(restoredExport);
  assert.equal(after.length,before.length,'Export retains all physical mesh instances');
  for(let i=0;i<before.length;i++) {
    assert.deepEqual(after[i].matrixWorld.elements,before[i].matrixWorld.elements,'Assembled export restores nested and instance transforms');
    assert.equal(after[i].geometry,before[i].geometry,'Explosion does not mutate geometry');
  }
  const selected=part('turbine-nozzle-1');
  const visibility=model.parts.map(p=>p.group.visible);
  for(const p of model.parts) p.group.visible=p.group===selected;
  const current=portableAssembly(model,{current:true});
  assert.equal(current.children.length,1,'Current-state export respects isolation');
  const expectedBounds=new THREE.Box3().setFromObject(selected),exportBounds=new THREE.Box3().setFromObject(current);
  close(expectedBounds.min,exportBounds.min,'Current export retains exploded lower bounds');
  close(expectedBounds.max,exportBounds.max,'Current export retains exploded upper bounds');
  model.parts.forEach((p,i)=>p.group.visible=visibility[i]);
  for(const rotor of model.rotors) rotor.rotation.set(0,0,0);

  for(let i=0;i<20;i++) {model.explosion.apply(.23,.79);model.explosion.apply(1,1);model.explosion.apply(0,0);}
  for(const [object,original] of originals) {
    assert.deepEqual(object.matrix.elements,original.matrix.elements,`${object.name}: exact rest transform after repeated cycles`);
    if(original.instances) assert.deepEqual(object.instanceMatrix.array,original.instances,'No instance drift');
  }
  for(const root of [baseline,restoredExport,current]) for(const material of new Set(meshes(root).map(o=>o.material))) material.dispose();
  console.log(`Exploded view verified: ${model.explosion.diagnostics.movingGroups} nested groups; axial/radial directions, coherent segments, rest/current exports and 20 drift-free cycles.`);
}

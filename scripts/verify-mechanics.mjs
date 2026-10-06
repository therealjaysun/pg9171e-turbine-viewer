import assert from 'node:assert/strict';
import * as THREE from 'three';

export function verifyMechanics(model) {
  const byId=new Map(model.parts.map(part=>[part.id,part]));
  const meshes=(id,predicate)=>{
    const result=[];
    assert.ok(byId.has(id),`Missing mechanical part ${id}`);
    byId.get(id).group.traverse(object=>{if(object.isMesh&&predicate(object))result.push(object);});
    return result;
  };
  const role=(id,name)=>meshes(id,object=>object.userData.geometryRole===name);
  const shaft=role('shaft','rotor-shaft');
  const forwardJournal=meshes('compressor-stub-shafts',object=>object.userData.auditRole==='compressor-forward-journal');
  assert.equal(shaft.length,1,'The turbine core must be a single continuous revolved shaft');
  assert.equal(forwardJournal.length,1,'The front journal must remain part of the compressor rotor');
  const ray=new THREE.Raycaster(),position=new THREE.Vector3();
  const radiusCache=new Map();
  function shaftRadius(x,front=false) {
    const key=`${front}:${x.toFixed(7)}`;
    if(radiusCache.has(key))return radiusCache.get(key);
    ray.set(new THREE.Vector3(x,1,0),new THREE.Vector3(0,-1,0));ray.near=0;ray.far=1;
    const hits=ray.intersectObjects(front?forwardJournal:shaft);
    assert.ok(hits.length,`The shaft has an unmodeled span at X=${x}`);
    const radius=hits[0].point.y;
    assert.ok(radius>.19,`Unexpected shaft constriction at X=${x}`);
    radiusCache.set(key,radius);return radius;
  }
  for(const x of [.15,.64,1.10,1.565,1.80,2.16,2.52,2.88,3.35,4.08,5.59])shaftRadius(x);
  for(const [x,expected] of [[1.10,.23378],[4.08,.198105]])
    assert.ok(Math.abs(shaftRadius(x)-expected)<1e-5,`Source journal anchor changed at X=${x}`);

  const summary=[];
  for(const [number,x] of [[1,-4.85],[2,1.10],[3,4.08]]) {
    const id=`bearing-${number}`;
    const journals=role(id,number===3?'journal-pad':'journal-liner');
    assert.equal(journals.length,number===3?5:2,`${id}: incorrect journal construction`);
    const seals=role(id,'stationary-seal');
    assert.ok(seals.length>=12,`${id}: stationary seal rows missing`);
    assert.ok(!model.rotors.includes(byId.get(id).group),`${id}: a bearing must not rotate`);
    const minimum=objects=>{
      let gap=Infinity;
      for(const object of objects) {
        const vertices=object.geometry.attributes.position;
        for(let i=0;i<vertices.count;i++) {
          position.fromBufferAttribute(vertices,i).applyMatrix4(object.matrixWorld);
          gap=Math.min(gap,Math.hypot(position.y,position.z)-shaftRadius(position.x,number===1));
        }
      }
      return gap;
    };
    const journalGap=minimum(journals),sealGap=minimum(seals);
    assert.ok(journalGap>.0029&&journalGap<.0031,`${id}: journal gap is ${journalGap} m`);
    assert.ok(sealGap>.0029,`${id}: seal/shaft interference, gap ${sealGap} m`);
    const housing=role(id,'bearing-housing');
    assert.equal(housing.length,2,`${id}: housing must have two halves`);
    ray.set(new THREE.Vector3(x,-.5,0),new THREE.Vector3(0,1,0));ray.near=0;ray.far=.19;
    assert.equal(ray.intersectObjects(housing).length,0,`${id}: housing oil drain is blocked`);
    ray.set(new THREE.Vector3(x+.10,-.5,0),new THREE.Vector3(0,1,0));
    assert.ok(ray.intersectObjects(housing).length,`${id}: drain check requires an intact adjacent wall`);
    summary.push(`${id}: journal ${(journalGap*1000).toFixed(3)} mm, seal ${(sealGap*1000).toFixed(3)} mm`);
  }

  const runner=meshes('compressor-stub-shafts',object=>object.userData.auditRole==='compressor-thrust-runner');
  assert.equal(runner.length,1,'Thrust runner must belong only to the compressor rotor');
  const runnerBounds=new THREE.Box3().setFromObject(runner[0]);
  const pads=role('bearing-1','thrust-pad');
  assert.equal(pads.length,16,'Eight representative pads are rendered on each thrust face');
  for(const pad of pads) {
    const bounds=new THREE.Box3().setFromObject(pad);
    const gap=bounds.max.x<runnerBounds.min.x?runnerBounds.min.x-bounds.max.x:bounds.min.x-runnerBounds.max.x;
    assert.ok(gap>.0039&&gap<.0041,`Stationary thrust pad overlaps or misses its runner: ${gap} m`);
  }
  ray.set(new THREE.Vector3(-5.22,0,0),new THREE.Vector3(0,1,0));ray.near=0;ray.far=.5;
  const housingHit=ray.intersectObjects(role('bearing-1','bearing-housing'))[0];
  assert.ok(housingHit,'The thrust runner must be enclosed by a housing');
  assert.ok(housingHit.point.y-runnerBounds.max.y>.0149,'The thrust runner clips its housing bore');

  const retainer=meshes('bearing-3',object=>object.name.includes('retainer with through oil passages'));
  assert.equal(retainer.length,1,'Rear pad retainer with lubrication openings is missing');
  for(const [origin,direction] of [[[4.08,-.4,0],[0,1,0]],[[4.01,0,.4],[0,0,-1]]]) {
    ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));ray.near=0;ray.far=.18;
    assert.equal(ray.intersectObjects(retainer).length,0,'Rear retainer oil passage is blocked');
  }
  assert.equal(role('base-frame','trunnion-seat').length,4,'The base needs four trunnion saddles');
  assert.equal(role('base-frame','base-column').length,4,'The saddles need four connected support columns');
  console.log(`Mechanical interfaces: ${summary.join('; ')}; thrust faces 4 mm; oil bores open. All gaps illustrative.`);
}

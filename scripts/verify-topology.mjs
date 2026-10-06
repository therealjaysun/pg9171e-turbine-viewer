import assert from 'node:assert/strict';
import * as THREE from 'three';
import { auditGeometry } from './audit-topology.mjs';
import { hollowRod, hollowTube, lathe, TAU } from '../src/model/helpers.js';
import { cooledNozzleRow } from '../src/model/hot-channels.js';

function assertFloat32Facets(geometry,matrix,label) {
  const positions=geometry.attributes.position,index=geometry.index;
  const count=index?.count ?? positions.count;
  const triangle=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
  const ab=new THREE.Vector3(),ac=new THREE.Vector3();
  for(let j=0;j<count;j+=3) {
    for(let k=0;k<3;k++) {
      const p=triangle[k].fromBufferAttribute(positions,index?index.getX(j+k):j+k).applyMatrix4(matrix).multiplyScalar(1000);
      p.set(Math.fround(p.x),Math.fround(p.y),Math.fround(p.z));
    }
    assert.ok(ab.subVectors(triangle[1],triangle[0]).cross(ac.subVectors(triangle[2],triangle[0])).lengthSq()>1e-10,
      `${label}, facet ${j/3}: Float32 millimetre export must retain triangle area.`);
  }
  return count/3;
}

export function verifyAssembledMaterialVoids(model) {
  model.root.updateMatrixWorld(true);
  const testMaterial=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
  const records=[],instanceMatrix=new THREE.Matrix4();
  const direction=new THREE.Vector3(.173,.067,1).normalize();
  const ray=new THREE.Raycaster(new THREE.Vector3(),direction,1e-7);
  for(const part of model.parts)part.group.traverse(object=>{
    if(!object.isMesh)return;
    object.geometry.computeBoundingBox();
    const count=object.isInstancedMesh?object.count:1;
    for(let instance=0;instance<count;instance++) {
      const matrix=object.matrixWorld.clone();
      if(object.isInstancedMesh){object.getMatrixAt(instance,instanceMatrix);matrix.multiply(instanceMatrix);}
      const proxy=new THREE.Mesh(object.geometry,testMaterial);
      proxy.matrixAutoUpdate=false;proxy.matrix.copy(matrix);proxy.matrixWorld.copy(matrix);
      records.push({proxy,partId:part.id,box:object.geometry.boundingBox.clone().applyMatrix4(matrix),
        localDirection:direction.clone().transformDirection(matrix.clone().invert()),
        label:`${part.id}/${object.name||'mesh'}${object.isInstancedMesh?`[${instance}]`:''}`});
    }
  });
  function materialAt(point) {
    ray.ray.origin.copy(point);
    for(const record of records) {
      if(!record.box.containsPoint(point))continue;
      const hits=ray.intersectObject(record.proxy,false);
      let winding=0,lastDistance=-Infinity,signs=new Set();
      for(const hit of hits) {
        if(hit.distance-lastDistance>1e-7){lastDistance=hit.distance;signs=new Set();}
        const facing=hit.face.normal.dot(record.localDirection);
        const sign=Math.abs(facing)<1e-10?0:Math.sign(facing);
        if(sign && !signs.has(sign)){signs.add(sign);winding+=sign;}
      }
      // Nonzero signed winding handles overlapping positive material bodies in
      // merged geometry; treating the whole assembly as odd/even would not.
      if(winding!==0)return record.label;
    }
    return null;
  }
  let voidSamples=0,wallSamples=0,exportFacets=0;
  function assertVoid(point,label) {
    const blocker=materialAt(point);
    assert.equal(blocker,null,`${label}: assembled passage blocked by ${blocker} at ${point.toArray().join(',')}`);
    voidSamples++;
  }
  function assertMaterial(point,label) {
    assert.ok(materialAt(point),`${label}: surrounding material is missing at ${point.toArray().join(',')}`);
    wallSamples++;
  }
  try {
    // Explicit stations include both mating faces and the previously filled
    // wheel-stack core, independently of a part's claimed channel metadata.
    for(const x of [.15,.5,1.1,1.58,1.75,1.9,2,2.16,2.26,2.42,2.52,2.68,2.78,2.94,3.04,3.18,3.21,3.38,3.55,3.615]) {
      for(const [y,z] of [[0,0],[.06,.025]])assertVoid(new THREE.Vector3(x,y,z),'Wheel-shaft and rotor-stack core');
    }
    for(const x of [3.635,3.70,4.08])assertMaterial(new THREE.Vector3(x,.02,.01),'Aft pocket floor and solid rear journal');
    for(const stage of [1,2]) {
      const part=model.parts.find(part=>part.id===`turbine-wheel-${stage}`),rows=[],collectors=[];
      part.group.traverse(object=>{
        if(object.geometry?.userData.coolingPaths)rows.push(object);
        if(object.geometry?.userData.rootCollector)collectors.push(object);
      });
      assert.equal(rows.length,1,`Bucket stage ${stage}: expected one cooled row.`);
      assert.equal(collectors.length,1,`Bucket stage ${stage}: expected a pierced root collector.`);
      const row=rows[0],paths=row.geometry.userData.coolingPaths,transform=new THREE.Matrix4();
      assert.equal(paths.length,stage===1?11:6,`Bucket stage ${stage}: replacement-reference passage count.`);
      assert.equal(row.count,92,`Bucket stage ${stage}: assembled interface coverage must include all buckets.`);
      for(let instance=0;instance<row.count;instance++) {
        row.getMatrixAt(instance,transform);transform.premultiply(row.matrixWorld);
        for(const [pathIndex,path] of paths.entries()) {
          assert.ok(path.assembledPoints.length>=9,'Cooling probes must span the root collector to the discharge.');
          for(const [pointIndex,point] of path.assembledPoints.entries()) {
            // All repeated interfaces are checked; identical midspan walls only
            // need the representative instance already checked in local tests.
            if(instance!==0 && pointIndex>=4 && pointIndex<=6)continue;
            assertVoid(new THREE.Vector3(...point).applyMatrix4(transform),`Bucket ${stage}/${instance}, cooling path ${pathIndex}`);
          }
          if(instance===0)for(const point of path.wallPoints.slice(1,-1))
            assertMaterial(new THREE.Vector3(...point).applyMatrix4(transform),`Bucket ${stage}, cooling path ${pathIndex} wall`);
        }
      }
      const collector=collectors[0],dimensions=collector.geometry.userData.rootCollector;
      collector.getMatrixAt(0,transform);transform.premultiply(collector.matrixWorld);
      assertMaterial(new THREE.Vector3(-.10,(dimensions.low+dimensions.high)/2,0).applyMatrix4(transform),`Bucket ${stage} collector end wall`);
      assert.equal(part.group.userData.coolingFeedPaths.length,6,`Bucket stage ${stage}: radial wheel feed count.`);
      for(const [pathIndex,path] of part.group.userData.coolingFeedPaths.entries()) {
        // Feed/spacer points are recorded in the unrecentered assembly frame.
        for(const point of path.points)assertVoid(new THREE.Vector3(...point),`Wheel ${stage}, radial feed ${pathIndex}`);
        const wall=new THREE.Vector3(...path.points[Math.floor(path.points.length/2)]);
        wall.y-=Math.sin(path.angle)*path.radius*1.7;wall.z+=Math.cos(path.angle)*path.radius*1.7;
        assertMaterial(wall,`Wheel ${stage}, radial feed ${pathIndex} wall`);
      }
    }
    const spacerPaths=model.parts.find(part=>part.id==='turbine-spacers-studs').group.userData.coolingFacePaths;
    assert.equal(spacerPaths.length,18,'Two spacer forward faces and first-spacer aft face must have six inferred grooves each.');
    for(const [pathIndex,path] of spacerPaths.entries()) {
      for(const point of path.points)assertVoid(new THREE.Vector3(...point),`Spacer face groove ${pathIndex}`);
      const wall=new THREE.Vector3(...path.points[4]);
      wall.y-=Math.sin(path.angle)*path.width*1.2;wall.z+=Math.cos(path.angle)*path.width*1.2;
      assertMaterial(wall,`Spacer face groove ${pathIndex} wall`);
    }
    for(const record of records)if(['shaft','turbine-wheel-1','turbine-wheel-2','turbine-spacers-studs'].includes(record.partId))
      exportFacets+=assertFloat32Facets(record.proxy.geometry,record.proxy.matrixWorld,record.label);
    console.log(`Assembled material-union probes: ${voidSamples} void samples and ${wallSamples} solid controls across all ${records.length} mesh instances; ${exportFacets} rotor/shaft Float32-mm facets verified.`);
  } finally {testMaterial.dispose();}
}

const group=new THREE.Group(),mat=new THREE.MeshBasicMaterial();
const cube=new THREE.BoxGeometry(1,1,1);
const cubeAudit=auditGeometry(cube);
assert.equal(cubeAudit.closed,true,'Duplicated hard-normal vertices must not be reported as leaks.');
assert.ok(Math.abs(cubeAudit.signedVolume-1)<1e-9,'Outward cube winding must yield positive volume.');

const openCube=cube.clone();openCube.setIndex([...openCube.index.array].slice(6));
assert.equal(auditGeometry(openCube).boundaryEdges,4,'Removing one cube side must expose its four-edge boundary.');

const reversed=cube.clone(),reverseIndex=[...reversed.index.array];
for(let i=0;i<reverseIndex.length;i+=3)[reverseIndex[i+1],reverseIndex[i+2]]=[reverseIndex[i+2],reverseIndex[i+1]];
reversed.setIndex(reverseIndex);
assert.equal(auditGeometry(reversed).closed,true,'A wholly inside-out cube is closed, not a leak.');
assert.ok(auditGeometry(reversed).signedVolume<0,'Inside-out closed material must be detectable by volume.');

const inconsistent=cube.clone(),inconsistentIndex=[...inconsistent.index.array];
[inconsistentIndex[1],inconsistentIndex[2]]=[inconsistentIndex[2],inconsistentIndex[1]];
inconsistent.setIndex(inconsistentIndex);
assert.equal(auditGeometry(inconsistent).windingEdges,3,'One reversed facet must expose three winding disagreements.');

const duplicated=cube.clone();duplicated.setIndex([...cube.index.array,...cube.index.array.slice(0,3)]);
assert.equal(auditGeometry(duplicated).duplicateTriangles,1,'Coincident duplicate facets must not be hidden by welding.');
assert.equal(auditGeometry(duplicated).nonManifoldEdges,3,'A duplicate facet must expose valence-three edges.');
assert.throws(()=>auditGeometry(cube,{tolerance:0}),/positive finite/);

// Split one side of a shared edge without retriangulating its neighbor.
const tJunction=cube.toNonIndexed(),p=tJunction.attributes.position;
const positions=[...p.array],a=new THREE.Vector3().fromBufferAttribute(p,0),b=new THREE.Vector3().fromBufferAttribute(p,1);
const midpoint=a.add(b).multiplyScalar(.5);positions.push(...midpoint.toArray());
const middle=positions.length/3-1,index=[0,middle,2,middle,1,2,...Array.from({length:p.count-3},(_,i)=>i+3)];
tJunction.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));tJunction.setIndex(index);
const splitAudit=auditGeometry(tJunction);
assert.ok(splitAudit.raw.boundaryEdges>0,'Fixture must contain a true triangulation T-junction.');
assert.equal(splitAudit.closed,true,'T-junction edge segmentation must not be labeled a geometric leak.');
assert.equal(splitAudit.tJunctionSplits,1);

for(const object of [
  hollowRod(group,[0,0,0],[1,0,0],.1,.06,mat),
  hollowTube(group,[[0,0,0],[.3,.1,0],[.6,.1,.2]],.04,.01,mat,24),
  hollowTube(group,Array.from({length:33},(_,i)=>[0,Math.cos(i*TAU/32),Math.sin(i*TAU/32)]),.04,.01,mat,96),
  lathe(group,[[0,.5],[0,.6],[1,.6],[1,.5],[0,.5]],mat,32,0,Math.PI),
]) {
  const audit=auditGeometry(object.geometry);
  assert.equal(audit.closed,true,`${object.geometry.type}: hollow material walls must be closed and consistently wound.`);
  assert.equal(audit.duplicateTriangles,0,'Hollow material must not retain duplicate seam faces.');
  assert.ok(audit.signedVolume>0,'Hollow material walls need positive oriented volume.');
}
const loop=group.children[2];
assert.equal(loop.userData.channel.closed,true,'Repeated terminal control point must form a periodic tube.');
assert.ok(loop.geometry.boundingBox===null,'Topology auditing must not mutate source geometry.');

const ray=new THREE.Raycaster(new THREE.Vector3(-1,0,0),new THREE.Vector3(1,0,0));
group.children[0].updateMatrixWorld(true);
assert.equal(ray.intersectObject(group.children[0]).length,0,'Closing material boundaries must not fill a straight tube lumen.');
group.children[2].updateMatrixWorld(true);
assert.equal(ray.intersectObject(group.children[2]).length,0,'Periodic manifold must retain its central opening.');

for(const stage of [0,1]) {
  const row=cooledNozzleRow(new THREE.Group(),[1.710,2.205][stage],[36,48][stage],{root:[.751,.741][stage],tip:[1.111,1.231][stage],
    chord:[.245,.29][stage],twist:-.59,sweep:.10,thickness:.12,camber:-.18,lean:-.024},mat,[.00002,.00001][stage]);
  const audit=auditGeometry(row.geometry);
  assert.equal(audit.closed,true,`Cooled nozzle ${stage+1}: CSG cleanup must leave a closed, consistently wound boundary.`);
  assert.equal(audit.duplicateTriangles,0,`Cooled nozzle ${stage+1}: collapsed CSG edges must not retain zero-thickness fins.`);
  assert.equal(audit.degenerateTriangles,0,`Cooled nozzle ${stage+1}: raw triangles must not collapse.`);
  const instance=new THREE.Matrix4();
  for(let i=0;i<row.count;i++) {
    row.getMatrixAt(i,instance);
    assertFloat32Facets(row.geometry,instance,`Cooled nozzle ${stage+1}, instance ${i}`);
  }
}
console.log('Topology fixtures: welded seams, missing wall, reversed winding, duplicate facet, CSG T-junction, split casing, hollow passages, and cooled nozzle boundaries/Float32-mm facets passed.');

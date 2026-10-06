import assert from 'node:assert/strict';
import * as THREE from 'three';
import { auditGeometry } from './audit-topology.mjs';
import { hollowRod, hollowTube, lathe, TAU } from '../src/model/helpers.js';
import { cooledNozzleRow } from '../src/model/hot-channels.js';

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
  const instance=new THREE.Matrix4(),positions=row.geometry.attributes.position;
  const triangle=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
  const ab=new THREE.Vector3(),ac=new THREE.Vector3();
  for(let i=0;i<row.count;i++) {
    row.getMatrixAt(i,instance);
    for(let j=0;j<positions.count;j+=3) {
      for(let k=0;k<3;k++) {
        const p=triangle[k].fromBufferAttribute(positions,j+k).applyMatrix4(instance).multiplyScalar(1000);
        p.set(Math.fround(p.x),Math.fround(p.y),Math.fround(p.z));
      }
      assert.ok(ab.subVectors(triangle[1],triangle[0]).cross(ac.subVectors(triangle[2],triangle[0])).lengthSq()>1e-10,
        `Cooled nozzle ${stage+1}, instance ${i}, facet ${j/3}: Float32 millimetre export must retain triangle area.`);
    }
  }
}
console.log('Topology fixtures: welded seams, missing wall, reversed winding, duplicate facet, CSG T-junction, split casing, hollow passages, and cooled nozzle boundaries/Float32-mm facets passed.');

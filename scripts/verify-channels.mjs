import assert from 'node:assert/strict';
import * as THREE from 'three';
import { lathe, hollowRod, hollowTube } from '../src/model/helpers.js';
import { subtractGeometry } from '../src/model/csg.js';
import { bucketCoolingPattern } from '../src/model/hot-channels.js';

function closedSurface(geometry, label) {
  const p=geometry.attributes.position,index=geometry.index,edges=new Map();
  const vertices=Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(','));
  const count=index?.count ?? p.count;
  for(let i=0;i<count;i+=3) {
    const face=[0,1,2].map(j=>vertices[index?index.getX(i+j):i+j]);
    assert.equal(new Set(face).size,3,`${label}: collapsed face`);
    for(let j=0;j<3;j++) {
      const a=face[j],b=face[(j+1)%3],key=a<b?`${a}|${b}`:`${b}|${a}`;
      const edge=edges.get(key)||{count:0,direction:0};edge.count++;edge.direction+=a<b?1:-1;edges.set(key,edge);
    }
  }
  for(const edge of edges.values())assert.ok(edge.count===2&&edge.direction===0,`${label}: open or inconsistently wound wall`);
}

function rayHits(object, origin, direction, far) {
  object.updateMatrixWorld(true);
  return new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction).normalize(),0,far).intersectObject(object,false);
}

export function verifyChannelTools() {
  for (const [stage, count] of [[1, 11], [2, 6], [3, 0]]) {
    const pattern = bucketCoolingPattern(stage);
    assert.equal(pattern.length, count, `Stage ${stage}: replacement-reference cooling count`);
    for (let i = 0; i < pattern.length; i++) {
      assert.ok(pattern[i].radius > 0 && pattern[i].radius < 0.003, `Stage ${stage}: inferred bore radius`);
      assert.ok(pattern[i].u > 0 && pattern[i].u < 1, `Stage ${stage}: passage must lie inside the chord`);
      if (i) assert.ok(pattern[i].u > pattern[i - 1].u, `Stage ${stage}: passages must remain distinct`);
    }
  }
  const group=new THREE.Group(),mat=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
  const half=lathe(group,[[0,.8],[0,1],[1,1],[1,.8],[0,.8]],mat,32,0,Math.PI);
  closedSurface(half.geometry,'Split annular casing');
  const shaft=lathe(group,[[0,0],[0,.2],[1,.2],[1,0]],mat,32);
  closedSurface(shaft.geometry,'Axis-ended shaft');
  const pipe=hollowRod(group,[0,0,0],[1,0,0],.2,.12,mat,24);
  closedSurface(pipe.geometry,'Straight pipe walls');
  assert.equal(rayHits(pipe,[-.1,0,0],[1,0,0],1.2).length,0,'Straight pipe bore must remain open');
  assert.ok(rayHits(pipe,[-.1,.16,0],[1,0,0],1.2).length>=2,'Straight pipe needs annular end walls');
  const bent=hollowTube(group,[[0,0,0],[1,0,0],[2,.4,0]],.16,.035,mat,24);
  closedSurface(bent.geometry,'Curved pipe walls');
  const cutter=new THREE.CylinderGeometry(.10,.10,1,16);cutter.translate(.5,-.9,0);
  assert.ok(rayHits(half,[.5,-1.25,0],[0,1,0],.60).length>0,'Uncut shell must obstruct radial probe');
  const cutGeometry=subtractGeometry(half.geometry,[cutter]),cut=new THREE.Mesh(cutGeometry,mat);
  assert.equal(rayHits(cut,[.5,-1.25,0],[0,1,0],.60).length,0,'Boolean port must penetrate both shell skins');
  assert.ok(rayHits(cut,[.8,-1.25,0],[0,1,0],.60).length>0,'Port must not remove adjacent wall');
  assert.ok(cutGeometry.attributes.position.count<half.geometry.attributes.position.count*20,'CSG buffers must be compact');
  assert.equal(cutGeometry.drawRange.start,0,'Export geometry must start at first vertex');
  assert.equal(cutGeometry.drawRange.count,Infinity,'Export geometry must not rely on hidden draw ranges');
  for(const object of group.children)object.geometry.dispose();cutter.dispose();cutGeometry.dispose();mat.dispose();
  console.log('Channel tools verified: closed split faces, hollow straight/curved pipes and through-wall bores.');
}

verifyChannelTools();

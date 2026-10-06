import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

const evaluator=new Evaluator();
evaluator.attributes=['position','normal'];
evaluator.useGroups=false;
evaluator.useCDTClipping=true;
const brushMaterial=new THREE.MeshBasicMaterial();

// CSG buffers may include unused capacity outside drawRange. Compact for exports.
function compactGeometry(source) {
  const count=source.index?.count ?? source.attributes.position.count;
  const start=source.drawRange.start,end=Math.min(count,start+source.drawRange.count);
  const positions=[],normals=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  const position=source.attributes.position,normal=source.attributes.normal;
  for(let i=start;i+2<end;i+=3) {
    const ids=[0,1,2].map(j=>source.index?source.index.getX(i+j):i+j);
    a.fromBufferAttribute(position,ids[0]);b.fromBufferAttribute(position,ids[1]);c.fromBufferAttribute(position,ids[2]);
    if(b.sub(a).cross(c.sub(a)).lengthSq()<1e-22)continue;
    for(const id of ids){positions.push(position.getX(id),position.getY(id),position.getZ(id));normals.push(normal.getX(id),normal.getY(id),normal.getZ(id));}
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.normalizeNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

export function subtractGeometry(baseGeometry, cutters) {
  let brush=new Brush(baseGeometry.clone(),brushMaterial);brush.geometry.clearGroups();brush.updateMatrixWorld(true);
  try {
    for(const cutterGeometry of cutters) {
      const cutter=new Brush(cutterGeometry.clone(),brushMaterial);cutter.geometry.clearGroups();cutter.updateMatrixWorld(true);
      let next;
      try { next=evaluator.evaluate(brush,cutter,SUBTRACTION); }
      finally { cutter.geometry.dispose(); }
      brush.geometry.dispose();brush=next;
    }
    const result=compactGeometry(brush.geometry);
    result.userData={...baseGeometry.userData,booleanCuts:cutters.length};
    return result;
  } finally { brush.geometry.dispose(); }
}

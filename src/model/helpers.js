import * as THREE from 'three';

export const TAU = Math.PI * 2;
export const palette = {
  casing: 0xa8b9b6, inlet: 0x758c91, steel: 0xb9c6cc, dark: 0x48565d,
  compressor: 0x98b7bc, stator: 0x879ba5, combustion: 0xb8a180,
  liner: 0x8f7d68, turbine: 0xb7a99a, exhaust: 0xa6acaa,
  bolt: 0x57666c, fuel: 0xb1ac7a, base: 0x4e6564,
};

export function material(color, metalness = 0.62, roughness = 0.38) {
  return new THREE.MeshStandardMaterial({color, metalness, roughness, side: THREE.DoubleSide});
}

export function part(ctx, options) {
  const group = new THREE.Group();
  group.name = options.name;
  group.userData = { ...options, partId: options.id, isPart: true };
  const record = { ...options, group, origin: new THREE.Vector3(), offset: new THREE.Vector3(...(options.explode || [0,0,0])) };
  ctx.parts.push(record);
  ctx.root.add(group);
  return group;
}

export function mesh(parent, geometry, mat, position = [0,0,0]) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

export function cylinder(parent, x0, x1, radius0, radius1, mat, segments = 64) {
  const geometry = new THREE.CylinderGeometry(radius1, radius0, x1-x0, segments, 1);
  geometry.rotateZ(-Math.PI/2);
  return mesh(parent, geometry, mat, [(x0+x1)/2,0,0]);
}

// Revolved profile around X. Closed paths produce true annular walls and flanges.
export function lathe(parent, profile, mat, segments = 96, start = 0, sweep = TAU) {
  const geometry = new THREE.LatheGeometry(profile.map(([x,r])=>new THREE.Vector2(r,x)), segments, start, sweep);
  geometry.rotateZ(-Math.PI/2);
  return mesh(parent, geometry, mat);
}

export function ring(parent, x, radius, width, thickness, mat, segments=96) {
  return lathe(parent, [[x-width/2,radius-thickness],[x-width/2,radius],[x+width/2,radius],[x+width/2,radius-thickness],[x-width/2,radius-thickness]],mat,segments);
}

export function box(parent, size, position, mat) {
  return mesh(parent,new THREE.BoxGeometry(...size),mat,position);
}

export function tube(parent, points, radius, mat, segments = 32) {
  const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return mesh(parent,new THREE.TubeGeometry(curve,segments,radius,8,false),mat);
}

export function rod(parent, from, to, radius, mat, segments=12) {
  const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
  const obj=mesh(parent,new THREE.CylinderGeometry(radius,radius,start.distanceTo(end),segments),mat);
  obj.position.copy(start).add(end).multiplyScalar(.5);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());
  return obj;
}

export function bolts(parent, x, radius, count, size, mat, phase=0) {
  const geo=new THREE.CylinderGeometry(size,size,size*.9,6); geo.rotateZ(-Math.PI/2);
  const objects=new THREE.InstancedMesh(geo,mat,count);
  const dummy=new THREE.Object3D();
  for(let i=0;i<count;i++) {const a=phase+i*TAU/count;dummy.position.set(x,Math.cos(a)*radius,Math.sin(a)*radius);dummy.updateMatrix();objects.setMatrixAt(i,dummy.matrix);}
  objects.castShadow=true;parent.add(objects);return objects;
}

// A closed, cambered airfoil loft with tapered chord and spanwise twist.
export function bladeGeometry({root=0.6, tip=1.2, chord=.2, twist=.35, sweep=.04, thickness=.075, camber=.055, lean=0}) {
  const positions=[], indices=[], n=12, spans=4;
  for(let j=0;j<=spans;j++) {
    const f=j/spans, c=chord*(1-.3*f), angle=twist*(1-.48*f);
    for(let s=0;s<2;s++) for(let i=s===0?0:1;i<=(s===0?n:n-1);i++) {
      const u=s===0?i/n:1-i/n;
      const half=5*thickness*c*(.2969*Math.sqrt(u)-.126*u-.3516*u*u+.2843*u*u*u-.1036*u*u*u*u);
      const a=(u-.5)*c, b=camber*c*Math.sin(Math.PI*u)+(s===0?half:-half);
      positions.push(a*Math.cos(angle)-b*Math.sin(angle)+sweep*f,root+(tip-root)*f,a*Math.sin(angle)+b*Math.cos(angle)+lean*f);
    }
  }
  const row=2*n;
  for(let j=0;j<spans;j++) for(let i=0;i<row;i++) {const a=j*row+i,b=j*row+(i+1)%row,c=a+row,d=b+row;indices.push(a,b,c,b,d,c);}
  // Cambered profiles are concave, so end caps need polygon triangulation.
  for(const end of [0,spans]) {
    const offset=end*row;
    const contour=Array.from({length:row},(_,i)=>new THREE.Vector2(positions[(offset+i)*3],positions[(offset+i)*3+2]));
    for(const [a,b,c] of THREE.ShapeUtils.triangulateShape(contour,[])) {
      const pa=new THREE.Vector3().fromArray(positions,(offset+a)*3),pb=new THREE.Vector3().fromArray(positions,(offset+b)*3),pc=new THREE.Vector3().fromArray(positions,(offset+c)*3);
      const normalY=pb.sub(pa).cross(pc.sub(pa)).y;
      const forward=end===spans?normalY>0:normalY<0;
      indices.push(offset+a,offset+(forward?b:c),offset+(forward?c:b));
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}

export function bladeRow(parent, x, count, params, mat, phase=0) {
  const objects=new THREE.InstancedMesh(bladeGeometry(params),mat,count);
  const dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){dummy.position.set(x,0,0);dummy.rotation.set(phase+i*TAU/count,0,0);dummy.updateMatrix();objects.setMatrixAt(i,dummy.matrix);}
  objects.castShadow=true;objects.receiveShadow=true;parent.add(objects);return objects;
}

export function splitCasing(parent, profile, mat, {half='full'}={}) {
  const start=half==='lower'?0:Math.PI;
  return lathe(parent, profile,mat,96,half==='full'?0:start,half==='full'?TAU:Math.PI);
}

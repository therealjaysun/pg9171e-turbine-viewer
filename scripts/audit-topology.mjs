import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { buildAssembly } from '../src/model/assembly.js';

function distanceSquared(a, b) {
  return (a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
}

function pointTree(ids, points, depth = 0) {
  if (!ids.length) return null;
  const axis = depth % 3;
  ids.sort((a,b)=>points[a][axis]-points[b][axis]);
  const middle = ids.length >> 1;
  return {id:ids[middle],axis,left:pointTree(ids.slice(0,middle),points,depth+1),right:pointTree(ids.slice(middle+1),points,depth+1)};
}

function rangeQuery(tree, points, low, high, result) {
  if (!tree) return;
  const p = points[tree.id], axis = tree.axis;
  if (p.every((v,i)=>v>=low[i] && v<=high[i])) result.push(tree.id);
  if (low[axis] <= p[axis]) rangeQuery(tree.left,points,low,high,result);
  if (high[axis] >= p[axis]) rangeQuery(tree.right,points,low,high,result);
}

function addEdge(edges, a, b, weight = 1, direction) {
  if (a === b) return;
  const key = a < b ? `${a}:${b}` : `${b}:${a}`;
  const edge = edges.get(key) || {a:Math.min(a,b),b:Math.max(a,b),count:0,direction:0};
  edge.count += weight;
  edge.direction += direction ?? (a < b ? weight : -weight);
  edges.set(key,edge);
}

function edgeStats(edges) {
  let boundaryEdges=0,nonManifoldEdges=0,windingEdges=0;
  for(const e of edges.values()) {
    if(e.count===1) boundaryEdges++;
    else if(e.count!==2) nonManifoldEdges++;
    else if(e.direction!==0) windingEdges++;
  }
  return {boundaryEdges,nonManifoldEdges,windingEdges};
}

// Audit positional topology rather than indexed topology: UV/normal seams duplicate
// vertices, and Boolean output can use several short edges opposite one long edge.
export function auditGeometry(geometry, {tolerance=1e-6, includeEdges=false}={}) {
  if(!Number.isFinite(tolerance) || tolerance<=0)throw new Error('Topology weld tolerance must be a positive finite number.');
  const positions=geometry.getAttribute('position'), source=geometry.index;
  const points=[],vertexIds=new Uint32Array(positions.count),grid=new Map();
  const toleranceSquared=tolerance*tolerance;
  for(let i=0;i<positions.count;i++) {
    const p=[positions.getX(i),positions.getY(i),positions.getZ(i)];
    const cell=p.map(v=>Math.floor(v/tolerance));
    let match=-1;
    for(let x=-1;x<=1 && match<0;x++)for(let y=-1;y<=1 && match<0;y++)for(let z=-1;z<=1 && match<0;z++) {
      const candidates=grid.get(`${cell[0]+x}:${cell[1]+y}:${cell[2]+z}`) || [];
      for(const candidate of candidates)if(distanceSquared(points[candidate],p)<=toleranceSquared){match=candidate;break;}
    }
    if(match<0) {
      match=points.length;points.push(p);
      const key=cell.join(':');
      if(!grid.has(key))grid.set(key,[]);
      grid.get(key).push(match);
    }
    vertexIds[i]=match;
  }
  const edges=new Map(),faces=new Map();
  const count=source?.count ?? positions.count;
  let degenerateTriangles=0,weldCollapsedTriangles=0,duplicateTriangles=0,signedVolume=0;
  for(let i=0;i<count;i+=3) {
    const indices=source?[source.getX(i),source.getX(i+1),source.getX(i+2)]:[i,i+1,i+2];
    const [a,b,c]=indices.map(id=>[positions.getX(id),positions.getY(id),positions.getZ(id)]);
    const ab=b.map((v,j)=>v-a[j]),ac=c.map((v,j)=>v-a[j]);
    const normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
    if(normal.reduce((sum,v)=>sum+v*v,0)<=1e-22){degenerateTriangles++;continue;}
    signedVolume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
    const ids=indices.map(id=>vertexIds[id]);
    if(new Set(ids).size<3){weldCollapsedTriangles++;continue;}
    const key=[...ids].sort((a,b)=>a-b).join(':');
    if(faces.has(key))duplicateTriangles++;
    faces.set(key,true);
    for(let j=0;j<3;j++)addEdge(edges,ids[j],ids[(j+1)%3]);
  }
  const raw=edgeStats(edges);
  const boundaryVertices=new Set();
  for(const e of edges.values())if(e.count===1){boundaryVertices.add(e.a);boundaryVertices.add(e.b);}
  const tree=pointTree([...boundaryVertices],points),normalized=new Map();
  let tJunctionSplits=0;
  for(const e of edges.values()) {
    if(e.count!==1) {addEdge(normalized,e.a,e.b,e.count,e.direction);continue;}
    const a=points[e.a],b=points[e.b],delta=b.map((v,i)=>v-a[i]);
    const lengthSquared=distanceSquared(a,b),length=Math.sqrt(lengthSquared);
    const candidates=[];
    rangeQuery(tree,points,a.map((v,i)=>Math.min(v,b[i])-tolerance),a.map((v,i)=>Math.max(v,b[i])+tolerance),candidates);
    const cuts=[{id:e.a,t:0},{id:e.b,t:1}];
    for(const id of candidates) {
      if(id===e.a || id===e.b)continue;
      const p=points[id],t=p.reduce((sum,v,i)=>sum+(v-a[i])*delta[i],0)/lengthSquared;
      if(t<=tolerance/length || t>=1-tolerance/length)continue;
      if(distanceSquared(p,a.map((v,i)=>v+t*delta[i]))<=toleranceSquared)cuts.push({id,t});
    }
    cuts.sort((a,b)=>a.t-b.t);
    tJunctionSplits+=cuts.length-2;
    for(let i=0;i<cuts.length-1;i++) {
      const from=cuts[i].id,to=cuts[i+1].id;
      addEdge(normalized,from,to,1,e.direction*(from<to?1:-1));
    }
  }
  const result={triangles:count/3,vertices:points.length,degenerateTriangles,weldCollapsedTriangles,duplicateTriangles,signedVolume,raw,tJunctionSplits,...edgeStats(normalized)};
  result.closed=result.boundaryEdges===0 && result.nonManifoldEdges===0 && result.windingEdges===0;
  if(includeEdges)result.edges=[...normalized.values()].filter(e=>e.count!==2 || e.direction!==0).map(e=>({...e,from:points[e.a],to:points[e.b]}));
  return result;
}

export function auditAssembly(model, options={}) {
  const geometries=new Map();
  for(const part of model.parts) {
    let meshIndex=0;
    part.group.traverse(object=>{
      if(!object.isMesh)return;
      const use={part:part.id,name:object.name||`mesh-${meshIndex}`,role:object.userData.geometryRole||null,instances:object.isInstancedMesh?object.count:1};
      meshIndex++;
      if(!geometries.has(object.geometry))geometries.set(object.geometry,{geometry:object.geometry,uses:[]});
      geometries.get(object.geometry).uses.push(use);
    });
  }
  const results=[...geometries.values()].map(({geometry,uses},index)=>({index,type:geometry.type,uses,...auditGeometry(geometry,options)}));
  const failures=results.filter(r=>!r.closed || r.degenerateTriangles || r.duplicateTriangles || r.signedVolume<=0);
  const totals={};
  for(const key of ['triangles','boundaryEdges','nonManifoldEdges','windingEdges','degenerateTriangles','weldCollapsedTriangles','duplicateTriangles','tJunctionSplits'])totals[key]=results.reduce((sum,r)=>sum+r[key],0);
  const partResults=model.parts.map(part=>{
    const meshes=results.filter(r=>r.uses.some(use=>use.part===part.id));
    return {id:part.id,system:part.system,geometries:meshes.map(r=>r.index),passed:!meshes.some(r=>failures.includes(r))};
  });
  return {tolerance:options.tolerance??1e-6,parts:model.parts.length,uniqueGeometries:results.length,closed:results.filter(r=>r.closed).length,passed:failures.length===0,totals,partResults,results};
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const tolerance=Number(process.argv.find(arg=>arg.startsWith('--tolerance='))?.split('=')[1]??1e-6);
  const report=auditAssembly(buildAssembly(),{tolerance,includeEdges:process.argv.includes('--edges')});
  if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
  else {
    console.log(`Topology audit: ${report.parts} parts; ${report.closed}/${report.uniqueGeometries} unique geometries have closed, consistently wound material boundaries at ${tolerance} m tolerance.`);
    console.log(JSON.stringify(report.totals));
    for(const r of report.results)if(!r.closed || r.degenerateTriangles || r.weldCollapsedTriangles || r.duplicateTriangles || r.signedVolume<0) {
      console.log(JSON.stringify({index:r.index,uses:r.uses,triangles:r.triangles,raw:r.raw,splits:r.tJunctionSplits,boundary:r.boundaryEdges,nonManifold:r.nonManifoldEdges,winding:r.windingEdges,degenerate:r.degenerateTriangles,weldCollapsed:r.weldCollapsedTriangles,duplicates:r.duplicateTriangles,volume:r.signedVolume}));
    }
  }
  if(process.argv.includes('--check') && !report.passed)process.exitCode=1;
}

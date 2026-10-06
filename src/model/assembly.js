import * as THREE from 'three';
import { buildCompressor } from './compressor.js';
import { buildHotSection } from './hot-section.js';
import { part, material, palette, cylinder, ring, box, bolts, rod, lathe, TAU } from './helpers.js';

export const systems = [
  {id:'inlet',name:'Inlet & guide vanes',color:'#78918d'},
  {id:'compressor',name:'Axial compressor',color:'#7a9da6'},
  {id:'combustion',name:'Combustion system',color:'#b89b70'},
  {id:'turbine',name:'Turbine stages',color:'#a18571'},
  {id:'exhaust',name:'Exhaust assembly',color:'#8b9a92'},
  {id:'bearings',name:'Bearings & shaft',color:'#a49c71'},
  {id:'supports',name:'Base & supports',color:'#698371'},
];

function buildBearings(ctx) {
  const steel=material(palette.steel), housing=material(palette.casing,.5,.48), bronze=material(0xb3a575,.7,.33), bolt=material(palette.bolt);
  const shaft=part(ctx,{id:'shaft',name:'Connecting shaft & hot-end coupling',system:'bearings',kind:'rotor',explode:[0,0,0],sourceTime:180,description:'Single common shaft joins the compressor to the turbine. The output coupling is at the hot exhaust end.',facts:[['Configuration','Single shaft'],['Operating speed','3,000 rpm'],['Drive','Hot end']]});
  cylinder(shaft,.05,1.8,.215,.235,steel);
  cylinder(shaft,3.35,5.7,.22,.198,steel);
  cylinder(shaft,5.6,5.8,.43,.43,steel);
  bolts(shaft,5.82,.35,16,.033,bolt);
  for(let j=0;j<12;j++) ring(shaft,1.22+j*.034,.266,.018,.028,steel);
  for(const [i,x,r] of [[1,-4.85,.20],[2,1.1,.234],[3,4.08,.198]]) {
    const bearing=part(ctx,{id:`bearing-${i}`,name:`Bearing ${i}${i===1?' & thrust collar':''}`,system:'bearings',kind:'detail',explode:[i===1?-1.1:i===3?1.3:0,-.4,0],sourceTime:i===1?2680:i===2?3100:3326,description:i===1?'Forward journal bearing with active and inactive thrust faces.':'Journal bearing within the stationary inner barrel. Clearances and pad profiles are illustrative.',facts:[['Location',i===1?'Inlet':i===2?'Between rotors':'Exhaust frame'],['Type',i===3?'Five tilting pads':'Journal'],['Geometry','Estimated housing']]});
    ring(bearing,x,.40,.32,.10,housing);ring(bearing,x-.18,.43,.045,.12,steel);ring(bearing,x+.18,.43,.045,.12,steel);
    const count=i===3?5:4;
    for(let j=0;j<count;j++) {const a=j*TAU/count+.05;lathe(bearing,[[x-.14,r+.012],[x-.14,r+.09],[x+.14,r+.09],[x+.14,r+.012],[x-.14,r+.012]],bronze,16,a,TAU/count-.10);}
    bolts(bearing,x-.207,.368,12,.021,bolt);bolts(bearing,x+.207,.368,12,.021,bolt);
    box(bearing,[.52,.13,.76],[x,-.36,0],housing);
    if(i===1){ring(bearing,x+.30,.345,.06,.135,bronze);ring(bearing,x+.40,.345,.06,.135,steel);}
  }
  return shaft;
}

function buildSupports(ctx) {
  const base=material(palette.base,.42,.63), foot=material(0x7d8b80,.5,.53), bolt=material(palette.bolt);
  const group=part(ctx,{id:'base-frame',name:'Turbine base frame',system:'supports',kind:'support',explode:[0,-1.0,0],description:'Open steel support frame with transverse members and mounting pads. The support envelope is inferred, not a foundation drawing.',facts:[['Model envelope','Estimated'],['Units','Metres']]});
  for(const z of [-1.42,1.42]) {box(group,[11.4,.12,.27],[.1,-2.08,z],base);box(group,[11.4,.12,.27],[.1,-2.42,z],base);box(group,[11.4,.35,.09],[.1,-2.25,z],base);}
  for(const x of [-5,-3.4,-1.7,.1,1.9,3.6,5.5]){box(group,[.14,.30,3.1],[x,-2.25,0],base);for(const z of [-1.6,1.6])box(group,[.65,.12,.60],[x,-2.47,z],foot);}
  for(const [x,width,r] of [[-4.65,.42,1.4],[-2.6,.28,1.15],[1.5,.5,1.7],[3.8,.55,1.7]]) {
    for(const z of [-.9,.9]){box(group,[width,.7,.3],[x,-1.67,z],foot);box(group,[width+.26,.14,.75],[x,-2.01,z],foot);rod(group,[x,-1.5,z],[x,-.92,Math.sign(z)*r],.085,foot);}
  }
}

export function buildAssembly() {
  const ctx={root:new THREE.Group(),parts:[]};ctx.root.name='PG9171E reconstructed assembly';
  const comp=buildCompressor(ctx), hot=buildHotSection(ctx);const shaft=buildBearings(ctx);buildSupports(ctx);
  ctx.rotors=[...(comp?.rotors||[]),...(hot?.rotors||[]),shaft];
  for(const p of ctx.parts) {
    p.origin.copy(p.group.position);
    p.group.traverse(o=>{if(o.isMesh){o.userData.partId=p.id;o.userData.kind=p.kind;o.userData.system=p.system;o.name ||= p.name;}});
  }
  ctx.root.updateMatrixWorld(true);
  return ctx;
}

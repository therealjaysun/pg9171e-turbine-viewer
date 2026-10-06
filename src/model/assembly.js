import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildCompressor } from './compressor.js';
import { buildHotSection } from './hot-section.js';
import { part, material, palette, ring, box, bolts, rod, lathe, hollowRod, TAU } from './helpers.js';
import { subtractGeometry } from './csg.js';

export const systems = [
  {id:'inlet',name:'Inlet & guide vanes',color:'#78918d'},
  {id:'compressor',name:'Axial compressor',color:'#7a9da6'},
  {id:'combustion',name:'Combustion system',color:'#b89b70'},
  {id:'turbine',name:'Turbine stages',color:'#a18571'},
  {id:'exhaust',name:'Exhaust assembly',color:'#8b9a92'},
  {id:'bearings',name:'Bearings & shaft',color:'#a49c71'},
  {id:'supports',name:'Base & supports',color:'#698371'},
];

// Source journal diameters are scale anchors. All running gaps are enlarged,
// educational geometry, not clearances for assembly or service work.
export const mechanicsDimensions = {
  shaftProfile: [[.14,.22],[.22,.22],[.30,.23378],[1.58,.23378],[1.64,.24],
    [3.23,.24],[3.38,.22],[3.70,.198105],[5.60,.198105],[5.60,.43],[5.80,.43]],
  bearings: [
    {number:1,x:-4.85,radius:.2,length:.267,start:-5.44,end:-4.555,housingRadius:.438},
    {number:2,x:1.10,radius:.23378,length:.39852,start:.64,end:1.565,housingRadius:.438},
    {number:3,x:4.08,radius:.198105,length:.26772,start:3.70,end:4.46,housingRadius:.438},
  ],
  journalGap: .003,
  sealGap: .005,
  thrust: {center:-5.22,width:.075,radius:.335,padGap:.004,padInnerRadius:.235,padOuterRadius:.332},
  mounts: [
    {x:-3.83,y:-.19,z:1.40,trunnionRadius:.12,seatRadius:.122},
    {x:2.00,y:-.20,z:1.64,trunnionRadius:.11,seatRadius:.112},
  ],
};

function named(object, name, role) {
  object.name=name;
  if(role) object.userData.geometryRole=role;
  return object;
}

function bearingHousing(parent, station, mat, boltMat) {
  const {number,x,start,end}=station;
  const ports=[
    {x,angle:Math.PI,radius:.035,name:'Oil drain'},
    {x:x-.07,angle:Math.PI/2,radius:.026,name:'Oil feed'},
    {x:x+.07,angle:0,radius:number===2?.040:.024,name:number===2?'Concentric sealing-air and vent port':'Sealing-air port'},
  ];
  const cutters=ports.map(port=>{
    const geometry=new THREE.CylinderGeometry(port.radius,port.radius,.22,16);
    geometry.rotateX(port.angle);
    geometry.translate(port.x,.38*Math.cos(port.angle),.38*Math.sin(port.angle));
    return geometry;
  });
  const combinedCuts=mergeGeometries(cutters,false);
  for(const [half,startAngle] of [['lower',0],['upper',Math.PI]]) {
    const shell=lathe(parent,[[start,.350],[start,.438],[start+.035,.438],
      [start+.055,.410],[end-.055,.410],[end-.035,.438],[end,.438],
      [end,.350],[start,.350]],mat,32,startAngle,Math.PI);
    named(shell,`Bearing ${number} ${half} split housing with through ports`,'bearing-housing');
    const source=shell.geometry;
    shell.geometry=subtractGeometry(source,[combinedCuts]);
    source.dispose();
  }
  for(const geometry of cutters) geometry.dispose();
  combinedCuts.dispose();
  for(const port of ports) {
    const from=[port.x,.332*Math.cos(port.angle),.332*Math.sin(port.angle)];
    const to=[port.x,.448*Math.cos(port.angle),.448*Math.sin(port.angle)];
    named(hollowRod(parent,from,to,port.radius+.006,port.radius,mat,24),
      `Bearing ${number} ${port.name.toLowerCase()} open passage`,'bearing-passage');
    if(number===2&&port.angle===0) {
      named(hollowRod(parent,from,to,.018,.012,mat,20),'Bearing 2 sealing-air tube within vent annulus','bearing-passage');
    }
  }
  bolts(parent,start-.011,.397,12,.017,boltMat);
  bolts(parent,end+.011,.397,12,.017,boltMat);
}

function journalLiner(parent,station,mat,supportMat) {
  const {number,x,radius,length}=station;
  const inner=radius+mechanicsDimensions.journalGap;
  const outer=radius+.072;
  for(const [half,angle] of [['lower',.010],['upper',Math.PI+.010]]) {
    const liner=lathe(parent,[[x-length/2,inner],[x-length/2,outer],
      [x+length/2,outer],[x+length/2,inner],[x-length/2,inner]],mat,48,angle,Math.PI-.020);
    // The No. 1 liner is elliptical. The exaggerated two-lobe film is visible
    // without prescribing a true bearing clearance or loaded shaft position.
    if(number===1) {
      const positions=liner.geometry.getAttribute('position');
      for(let i=0;i<positions.count;i++) {
        const y=positions.getY(i),z=positions.getZ(i);
        if(Math.hypot(y,z)<inner+.0001) positions.setZ(i,z*(inner+.002)/inner);
      }
      positions.needsUpdate=true;liner.geometry.computeVertexNormals();
    }
    named(liner,`Bearing ${number} ${half} ${number===1?'elliptical ':''}journal liner`,'journal-liner');
  }
  for(const end of [-1,1]) {
    named(ring(parent,x+end*(length/2+.010),.350,.020,.350-outer,supportMat),
      `Bearing ${number} liner retaining land`,'bearing-retainer');
  }
}

function labyrinth(parent,x,journalRadius,mat,label,{brush=false}={}) {
  const radius=journalRadius+mechanicsDimensions.sealGap;
  named(ring(parent,x,.350,.075,.350-(journalRadius+.07),mat,64),`${label} carrier`,'seal-carrier');
  for(const sign of [-1,1]) for(let tooth=0;tooth<3;tooth++) {
    named(ring(parent,x+sign*(.012+tooth*.009),journalRadius+.074,.004,
      journalRadius+.074-radius,mat,64),`${label} stationary labyrinth tooth`,'stationary-seal');
  }
  if(brush) named(ring(parent,x,.350,.012,.350-(journalRadius+.003),mat,64),
    `${label} brush-seal annulus (bristles simplified)`,'stationary-seal');
}

function thrustPads(parent,mat,steel) {
  const {center,width,padGap,padInnerRadius,padOuterRadius}=mechanicsDimensions.thrust;
  for(const [side,label] of [[-1,'Active equalizing'],[1,'Inactive non-equalizing']]) {
    const face=center+side*(width/2+padGap);
    const back=face+side*.024;
    const low=Math.min(face,back),high=Math.max(face,back);
    const baseX=back+side*(side===-1?.042:.022);
    named(ring(parent,baseX,.350,.024,.350-padInnerRadius,steel),`${label} thrust base ring`,'thrust-base');
    for(let i=0;i<8;i++) {
      const a=i*TAU/8+.045;
      named(lathe(parent,[[low,padInnerRadius],[low,padOuterRadius],[high,padOuterRadius],
        [high,padInnerRadius],[low,padInnerRadius]],mat,12,a,TAU/8-.09),
      `${label} thrust pad ${i+1} (population illustrative)`,'thrust-pad');
      const angle=a+(TAU/8-.09)/2;
      const y=-Math.sin(angle)*.286,z=Math.cos(angle)*.286;
      named(rod(parent,[back,y,z],[baseX-side*.012,y,z],.018,steel),`${label} pad pivot`,'thrust-pivot');
      if(side===-1) {
        const plate=box(parent,[.015,.018,.125],[back-.019,y,z],steel);
        plate.rotation.x=angle;named(plate,'Active thrust equalizing plate (representative)','thrust-equalizer');
      }
    }
  }
}

function tiltingJournal(parent,station,mat,steel) {
  const {x,radius,length}=station;
  const inner=radius+mechanicsDimensions.journalGap,outer=radius+.067;
  const retainer=ring(parent,x,.322,length+.046,.045,steel,64);
  const passages=[{x:x-.07,angle:Math.PI/2,radius:.026},{x,angle:Math.PI,radius:.035}].map(port=>{
    const cutter=new THREE.CylinderGeometry(port.radius,port.radius,.14,16);
    cutter.rotateX(port.angle);cutter.translate(port.x,.30*Math.cos(port.angle),.30*Math.sin(port.angle));
    return cutter;
  });
  const cuts=mergeGeometries(passages,false),uncut=retainer.geometry;
  retainer.geometry=subtractGeometry(uncut,[cuts]);
  uncut.dispose();cuts.dispose();for(const passage of passages) passage.dispose();
  named(retainer,'Bearing 3 tilting-pad retainer with through oil passages','bearing-retainer');
  for(let i=0;i<5;i++) {
    const angle=i*TAU/5+.06;
    named(lathe(parent,[[x-length/2,inner],[x-length/2,outer],[x+length/2,outer],
      [x+length/2,inner],[x-length/2,inner]],mat,16,angle,TAU/5-.12),
    `Bearing 3 tilting pad ${i+1}`,'journal-pad');
    const center=angle+(TAU/5-.12)/2;
    const radial=r=>[x,-Math.sin(center)*r,Math.cos(center)*r];
    named(rod(parent,radial(outer),radial(.284),.021,steel),'Bearing 3 pad pivot pin','journal-pivot');
    for(const side of [-1,1]) {
      const phi=center+side*.36;
      const y=-Math.sin(phi)*.274,z=Math.cos(phi)*.274;
      named(rod(parent,[x-.108,y,z],[x+.108,y,z],.010,steel),'Bearing 3 pad retaining pin','journal-pin');
    }
  }
  for(const end of [-1,1]) named(ring(parent,x+end*(length/2+.036),.350,.025,.043,steel),
    'Bearing 3 retainer locating shoulder','bearing-retainer');
}

function buildBearings(ctx) {
  const steel=material(palette.steel),housing=material(palette.casing,.5,.48),
    babbitt=material(0xc7c3ad,.68,.36),bolt=material(palette.bolt);
  const shaft=part(ctx,{id:'shaft',name:'Connecting shaft & hot-end coupling',system:'bearings',kind:'rotor',explode:[0,0,0],sourceTime:1821,
    description:'Continuous compressor-to-turbine connection, forward turbine journal, wheel-bore core and aft load shaft. Smooth journals pass through stationary bearing seals; the output coupling is at the hot exhaust end. The core and rotor interfaces are reconstructed, not OEM joint details.',
    facts:[['Configuration','Single shaft'],['Operating speed','3,000 rpm'],['Drive','Hot end'],['Journal anchors','467.56 / 396.21 mm diameter']]});
  const profile=mechanicsDimensions.shaftProfile;
  named(lathe(shaft,[[profile[0][0],0],...profile,[profile.at(-1)[0],0]],steel),
    'Continuous turbine rotor core and smooth journals','rotor-shaft');
  bolts(shaft,5.817,.35,16,.026,bolt);
  for(const station of mechanicsDimensions.bearings) {
    const {number,x,radius}=station;
    const bearing=part(ctx,{id:`bearing-${number}`,name:`Bearing ${number}${number===1?' / journal and thrust':''}`,
      system:'bearings',kind:'detail',explode:[number===1?-1.1:number===3?1.3:0,-.4,0],
      sourceTime:number===1?2632:number===2?3066:3251,
      description:number===1?'Split elliptical journal liner and stationary active/inactive thrust pads. The thrust runner belongs to the rotating compressor stub shaft. Open lubrication and sealing-air ports and stationary labyrinth teeth are represented; their sizes and clearances are illustrative.':
        number===2?'Split journal liner inside the discharge barrel, with separated outer air seals, inner oil-control labyrinths, vent and concentric sealing-air connection. Journal size is anchored to the BHEL forward turbine journal; oil-circuit routing is partial.':
          'Five stationary tilting journal pads in a retaining ring, with pivot and retaining pins, oil-control labyrinths and open service ports inside the exhaust frame. Pad profiles and running gaps are illustrative.',
      facts:[['Location',number===1?'Inlet':number===2?'Between rotors':'Exhaust frame'],
        ['Type',number===1?'Elliptical journal + thrust':number===2?'Split journal liner':'Five tilting pads'],
        ['Journal diameter',`${(radius*2000).toFixed(2)} mm reference`],['Running clearances','Enlarged / illustrative']]});
    bearingHousing(bearing,station,housing,bolt);
    if(number<3) journalLiner(bearing,station,babbitt,steel);
    else tiltingJournal(bearing,station,babbitt,steel);
    if(number===1) {
      thrustPads(bearing,babbitt,steel);
      for(const sealX of [-5.395,-4.595]) labyrinth(bearing,sealX,radius,steel,'Bearing 1 oil-control seal');
    } else if(number===2) {
      for(const sealX of [.695,1.525]) labyrinth(bearing,sealX,radius,bolt,'Bearing 2 outer air seal',{brush:true});
      for(const sealX of [.810,1.410]) labyrinth(bearing,sealX,radius,steel,'Bearing 2 oil-control seal');
    } else {
      for(const sealX of [3.760,4.400]) labyrinth(bearing,sealX,radius,steel,'Bearing 3 oil-control seal');
      named(ring(bearing,3.695,.438,.018,.438-(radius+.008),steel),'Bearing 3 forward air deflector','stationary-seal');
    }
    if(number>1) {
      const supportRadius=number===2?.483:.50;
      for(const side of [-1,1]) named(rod(bearing,[x,0,side*.405],[x,0,side*supportRadius],.033,steel),
        `Bearing ${number} housing locating strap`,'bearing-support');
    }
  }
  return shaft;
}

function buildSupports(ctx) {
  const base=material(palette.base,.42,.63), foot=material(0x7d8b80,.5,.53), bolt=material(palette.bolt);
  const group=part(ctx,{id:'base-frame',name:'Turbine base frame',system:'supports',kind:'support',explode:[0,-1.0,0],sourceTime:306,description:'Open steel frame with two paired trunnion-support stations aligned to the forward compressor casing and turbine shell. Saddles replace the unsupported diagonal mounting rods. The frame, saddle proportions and thermal-motion allowances are inferred, not an installation or foundation drawing.',facts:[['Support stations','Forward casing + turbine shell'],['Model envelope','Estimated'],['Units','Metres']]});
  for(const z of [-1.42,1.42]) {box(group,[11.4,.12,.27],[.1,-2.08,z],base);box(group,[11.4,.12,.27],[.1,-2.42,z],base);box(group,[11.4,.35,.09],[.1,-2.25,z],base);}
  for(const x of [-5,-3.4,-1.7,.1,1.9,3.6,5.5]){box(group,[.14,.30,3.1],[x,-2.25,0],base);for(const z of [-1.6,1.6])box(group,[.65,.12,.60],[x,-2.47,z],foot);}
  for(const mount of mechanicsDimensions.mounts) {
    const {x,y,z,seatRadius}=mount;
    for(const side of [-1,1]) {
      const centerZ=side*z;
      const seat=new THREE.Group();seat.position.set(x,y,centerZ);seat.rotation.y=Math.PI/2;group.add(seat);
      named(lathe(seat,[[-.11,seatRadius],[-.11,seatRadius+.055],[.11,seatRadius+.055],
        [.11,seatRadius],[-.11,seatRadius]],foot,32,0,Math.PI),
      'Lower trunnion saddle with open running seat','trunnion-seat');
      const top=y-seatRadius-.055;
      const bottom=-2.02;
      named(box(group,[.30,top-bottom,.22],[x,(top+bottom)/2,centerZ],foot),'Trunnion support column','base-column');
      box(group,[.62,.14,.58],[x,-2.02,centerZ],foot);
    }
    box(group,[.14,.26,3.64],[x,-2.25,0],base);
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

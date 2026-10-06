import { compressorEducation } from './compressor.js';
import { hotSectionEducation } from './hot-section.js';

const video = seconds => ({ label: `Training video: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, url: `https://www.youtube.com/watch?v=4r1-IMMS73s&t=${seconds}s` });
const bearingReference = { label: 'Kingsbury: hydrodynamic bearing principles', url: 'https://www.kingsbury.com/hydrodynamic-bearings/' };
const designReference = { label: 'GE: heavy-duty turbine design philosophy', url: 'https://www.tfd.chalmers.se/~thgr/gasturbiner/Material_for_generating_slides/pdf_documents/GeGasTurbineDesignPhilosophy.pdf' };

const shaft = {
  summary: 'The mechanical link between the compressor, turbine and driven load.',
  keyIdea: 'The turbine must power its own compressor before any useful shaft power is available to the generator.',
  operation: [
    'The compressor and three turbine stages share one rotating train. Gas expanding through the turbine creates torque, which travels through the rotor to drive the compressor and the load coupled at the hot exhaust end.',
    'This PG9171E arrangement operates at a nominal 3,000 rpm. At steady speed, turbine torque balances the compressor demand, driven-load demand and mechanical losses. Rotation in this viewer is slowed for inspection.'
  ],
  design: [
    'Torsional strength and rotor dynamics matter together: a shaft must transmit torque while keeping bending and torsional vibration within acceptable limits.',
    'Couplings and bolted joints must preserve alignment and transfer load without unwanted slip. Rotor balance depends on the entire assembled train, not only individual wheels.',
    'Axial thermal growth has to be accommodated without losing blade, seal or bearing clearances. The rotor uses separate forward and aft wheel shafts with three wheels and two spacers, not a solid bar passing through the complete turbine stack.',
    'The forward axial opening and built-up construction follow the video. Internal shaft contours and cavity termination are reconstructed, not recovered OEM dimensions. Compressor extraction plumbing and the complete internal cooling circuit remain unresolved.'
  ],
  watch: [
    'Shaft vibration is interpreted with speed, load, phase and bearing information. A vibration change alone does not uniquely identify imbalance, misalignment or a rub.',
    'Turning gear and start-up procedures manage the thermal state of a real rotor. This visualization does not reproduce thermal bow or critical-speed behavior.',
    'Rotor inspection and life assessment use the installed unit\'s service history and OEM criteria; apparent model dimensions cannot establish fitness for service.'
  ],
  references: [video(1826), video(1846), designReference, {label: 'GE Vernova: 9E family', url: 'https://www.gevernova.com/gas-power/products/gas-turbines/9e'}]
};

function bearingEducation(number) {
  const details = {
    1: {
      summary: 'The inlet-end radial support and the rotor train\'s axial locating station.',
      keyIdea: 'Journal support controls radial position; the thrust faces control axial position. These are different jobs.',
      operation: 'Bearing No. 1 supports the compressor inlet end. Its active and inactive thrust-bearing faces react forces in opposing axial directions, locating the rotor relative to stationary parts.',
      design: 'The thrust collar and pads must carry the net axial load while maintaining an oil film and the specified axial freedom. This is not a rigid clamp around the rotor.',
      watch: 'Axial position and thrust-bearing condition matter alongside journal vibration. Incorrect axial location can affect internal running clearances throughout the machine.',
      time: 2612
    },
    2: {
      summary: 'The intermediate journal support between the compressor and turbine rotor sections.',
      keyIdea: 'A long rotor needs intermediate support, but that support must remain aligned as the surrounding machine heats up.',
      operation: 'Bearing No. 2 carries radial load near the junction of the compressor and turbine. Its stationary support transfers that load into the surrounding structure while the shaft turns inside.',
      design: 'Support stiffness and alignment influence the vibration modes of the rotor train. Nearby hot structure makes thermal growth, sealing and oil management important design concerns.',
      watch: 'Trends in journal vibration and bearing temperature help identify changes. Interpretation requires operating conditions and other measurements, not just an isolated alarm value.',
      time: 3066
    },
    3: {
      summary: 'The exhaust-end radial support, shown with five tilting journal pads.',
      keyIdea: 'Tilting pads are stationary bearing surfaces that make tiny angular adjustments; they do not rotate with the shaft.',
      operation: 'Bearing No. 3 supports the turbine exhaust end inside the exhaust structure. The video identifies a five-pad tilting journal arrangement at this location.',
      design: 'Individual pivoted pads develop load-carrying oil wedges. Their geometry influences stability, film thickness and heat generation; the enlarged modeled pads are illustrative.',
      watch: 'Pad temperature, vibration and oil-system condition are useful complementary observations. Exhaust-end thermal conditions also make insulation, seals and drainage important.',
      time: 3251
    }
  }[number];
  return {
    summary: details.summary,
    keyIdea: details.keyIdea,
    operation: [details.operation, 'In normal hydrodynamic operation, shaft motion draws lubricant into a converging gap. Pressure developed in that oil film supports the journal rather than relying on dry metal-to-metal contact.'],
    design: [details.design, 'Oil viscosity, clearance, loading and speed jointly determine film behavior. Oil delivery also removes heat; simply supplying oil does not guarantee an adequate film under every condition.'],
    watch: [details.watch, 'Start-up, coast-down and loss of lubrication require the installed machine\'s prescribed protections and procedures. Only partial oil and sealing passages are shown; external routing, instrumentation and true operating clearances are not modeled.'],
    references: [video(details.time), bearingReference]
  };
}

const base = {
  summary: 'The structural load path from turbine supports to the foundation.',
  keyIdea: 'The foundation and support system are part of rotor alignment, not just a platform beneath the machine.',
  operation: ['The base and mounting structures carry machine weight and transmit operating loads into the foundation. They locate stationary housings so the rotor, seals and gas-path components remain correctly aligned.'],
  design: [
    'Stiffness and load distribution must limit distortion of the casing and bearing supports. Foundation behavior can influence the complete machine\'s vibration response.',
    'Mounting arrangements must control position while accommodating thermal expansion. Rigidly restraining every point can create large thermal loads.',
    'The open frame, crossmembers and feet shown here are inferred support geometry. They do not document the actual installation\'s anchors, sliding supports or foundation details.'
  ],
  watch: [
    'Alignment checks consider the machine and driven equipment together, including changes between cold and operating conditions.',
    'Loose fasteners, damaged grout, corrosion or support movement can change the load path. Inspection methods and acceptance limits belong to the installation documentation.'
  ],
  references: [designReference]
};

export const assemblyEducation = {
  summary: 'A single-shaft, heavy-duty gas turbine with 17 compressor stages, 14 combustion chambers and three turbine stages.',
  keyIdea: 'Compression, combustion and expansion form one continuous flow path. Shaft work links the turbine back to the compressor.',
  operation: [
    'Air enters the inlet, passes through variable guide vanes and is compressed by alternating rotating and stationary blade rows. Compressed air feeds the reverse-flow can-annular combustion system.',
    'Fuel releases heat in 14 chambers. Transition pieces deliver hot gas into three turbine stages, where expansion supplies both compressor power and useful output. The exhaust diffuser then slows and redirects the outgoing flow.'
  ],
  design: [
    'Efficiency is a system balance: aerodynamic losses, cooling-air demand, leakage, combustion behavior and mechanical losses all matter.',
    'High temperature improves the potential for useful work but increases material, cooling and life-management demands.',
    'This reconstruction follows the video\'s PG9171E / DLN1 arrangement. Blade profiles, lengths, clearances and many external details are estimates, not OEM CAD.'
  ],
  watch: [
    'Operating condition affects every subsystem. Load, ambient temperature, inlet condition and fuel properties influence the machine\'s response.',
    'Temperature, pressure, vibration and emissions trends provide different pieces of evidence; none should be interpreted without the relevant operating context.',
    'These lessons explain engineering principles, not operating instructions or maintenance acceptance limits.'
  ],
  references: [video(98), designReference]
};

const systemLessons = {
  inlet: {
    summary: 'The inlet delivers air to the compressor; variable guide vanes establish its entry angle and regulate flow.',
    keyIdea: 'The first compressor rotor inherits the cleanliness, pressure and flow direction delivered by the inlet.',
    operation: ['The radial inlet collector and bellmouth turn incoming air into the axial compressor passage. At its downstream end, 64 variable guide vanes pivot together through a geared control ring and hydraulic actuator. Their setting changes the conditions seen by the first moving blade row. The upstream filter house and ductwork are outside this model.'],
    design: [
      'The turning passage and internal supports must coexist with the airflow. Their shapes influence pressure loss and how uniformly air reaches the guide vanes.',
      'The common ring coordinates vane motion, while stems and inner supports carry local aerodynamic loads. Position, geometry and mechanical condition all affect the achieved inlet setting.'
    ],
    watch: [
      'Water, dust and other contaminants can contribute to compressor degradation. GE identifies these as important concerns for the 9E family.',
      'The guide vanes pivot but do not spin with the rotor. Their illustrated setting is an example, not a control schedule for an installed unit.'
    ],
    references: [video(244), video(277), { label: 'GE Vernova: 9E compressor durability', url: 'https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-advanced-compressor' }]
  },
  compressor: {
    summary: 'Seventeen rotor-stator stages progressively raise air pressure before combustion.',
    keyIdea: 'Rotors add shaft work; stationary rows recover static pressure and prepare the flow for the next rotating row.',
    operation: ['The common shaft drives 17 rotating blade rows, each followed by a fixed stator row. Pressure can rise within both rows, but only the rotor adds mechanical energy. Two extra exit-guide rows follow stage 17 before the discharge diffuser. Extracted air also serves cooling, sealing and transient compressor-flow management.'],
    design: [
      'As air becomes denser, a smaller annular flow area can carry it at a useful axial velocity. This explains the decreasing blade span along the illustrated compressor.',
      'Adjacent stages must work together across changing conditions. Blade profiles, inlet-guide setting and bleed arrangements influence both efficiency and stable operation.'
    ],
    watch: [
      'Surface deposits and profile damage affect aerodynamic performance. A change in one row also changes the air delivered to subsequent rows.',
      'The model establishes the 17-stage architecture and known attachments. Exact airfoils, stage pressure ratios, blade populations and clearances are not verified.'
    ],
    references: [video(44), video(332), video(548), { label: 'DOE / NETL: axial-compressor aerodynamics', url: 'https://www.netl.doe.gov/sites/default/files/gas-turbine-handbook/2-0.pdf' }]
  },
  combustion: {
    summary: 'Fourteen reverse-flow chambers add heat to compressed air and deliver hot gas to the turbine.',
    keyIdea: 'The combustion system must release heat while controlling flame stability, emissions and the temperature pattern entering the turbine.',
    operation: ['Compressor-discharge air enters the surrounding wrapper and travels upstream around the liners before joining the reverse-flow combustion process. Each DLN1 chamber has six primary fuel nozzles around a central secondary nozzle. Crossfire tubes connect neighboring chambers, and individual transition pieces deliver the hot gas into sectors of the first turbine nozzle.'],
    design: [
      'Liners establish the flame region while cooling and dilution air protect hardware and shape the outlet flow. Transition pieces change the passage from a circular chamber toward the turbine annulus.',
      'DLN1 uses different combustion modes as conditions change. Fuel distribution and air mixing must balance low emissions with a stable flame and acceptable dynamic pressure.'
    ],
    watch: [
      'A normal average exhaust temperature can coexist with uneven local temperatures. Flow distribution and the temperature pattern matter as well as the overall heat release.',
      'This is the video\'s 14-chamber DLN1 arrangement. Other combustor upgrades and fuel systems can have different internals and operating behavior.'
    ],
    references: [video(564), video(979), video(1214), { label: 'DOE / NETL: lean premixed combustion and DLN1', url: 'https://netl.doe.gov/sites/default/files/gas-turbine-handbook/3-2-1-2.pdf' }]
  },
  turbine: {
    summary: 'Three nozzle-and-bucket stages extract shaft work from the expanding combustion gas.',
    keyIdea: 'Stationary nozzles direct the gas; rotating buckets change its angular momentum and produce shaft torque.',
    operation: ['Hot gas passes alternately through three stationary nozzle rows and three rotating bucket rows. Each rotor wheel transfers work to the common shaft, supplying the compressor and the driven load. The downstream passages expand as the gas pressure and density fall. This model follows the video\'s three-stage configuration.'],
    design: [
      'Cooling, coatings, seals and blade geometry serve different purposes. Cooling protects metal; seals limit flow bypass; the airfoil shape establishes aerodynamic loading.',
      'The rows are not identical: the video shows unshrouded first-stage buckets, interlocking tip shrouds on stages 2 and 3, internal cooling in stages 1 and 2, and internally uncooled stage-3 buckets.'
    ],
    watch: [
      'An internally uncooled bucket still experiences heat, centrifugal load and vibration. Surrounding wheelspaces can have their own cooling flows.',
      'Thermal cycling, sustained hot loading, cooling-flow condition and leakage all influence component life and performance. This geometry does not calculate those effects.'
    ],
    references: [video(1318), video(1872), video(2004), video(2122), designReference]
  },
  exhaust: {
    summary: 'The diffuser, frame and turning vanes collect and redirect gas leaving the turbine.',
    keyIdea: 'The exhaust combines pressure recovery, flow turning and structural support for the rear bearing.',
    operation: ['After the final turbine row, the divergent annular diffuser slows the gas and recovers some static pressure. Ten radial struts connect the exhaust frame\'s inner and outer structure, supporting bearing No. 3. Five downstream turning vanes redirect the axial flow toward the radial exhaust plenum while leaving the central load-coupling tunnel open.'],
    design: [
      'Aerodynamic fairings protect the structural struts and shape the surrounding flow. Load-carrying structure and gas-path surfaces perform related but distinct jobs.',
      'Diffuser expansion and turning must avoid excessive separation and loss. Cooling and insulation also limit heat transfer toward the bearing and coupling region.'
    ],
    watch: [
      'Static pressure recovery does not add energy: the stationary diffuser converts part of the outgoing flow speed into pressure.',
      'Downstream exhaust conditions affect the expansion available through the turbine. The viewer does not model the external duct, stack or heat-recovery equipment.'
    ],
    references: [video(2411), video(2569), video(2585), designReference]
  },
  bearings: {
    summary: 'Three bearing stations support the common rotor, while the No. 1 thrust arrangement controls axial position.',
    keyIdea: 'Shaft torque, radial support and axial location are separate mechanical duties.',
    operation: ['Bearing No. 1 sits in the inlet casing, No. 2 in the compressor-discharge inner cylinder, and No. 3 in the exhaust frame. Journal bearings support radial loads through a lubricating oil film. The No. 1 thrust faces react opposing axial loads, and No. 3 uses five tilting journal pads. The shaft transmits turbine torque to the compressor and hot-end output coupling.'],
    design: [
      'During hydrodynamic operation, relative surface motion develops pressure in converging oil gaps. Viscosity, speed, load and clearance jointly determine the supporting film.',
      'Bearing alignment and support stiffness influence rotor behavior. Seals, oil delivery and drainage manage the lubricant while surrounding structures change temperature.'
    ],
    watch: [
      'Tilting pads remain attached to the stationary bearing structure; their small angular motion helps establish the oil wedge. They do not rotate around the shaft.',
      'Vibration, axial position, temperature and oil condition provide complementary evidence. The visual model does not reproduce actual clearances or rotor dynamic response.'
    ],
    references: [video(2612), video(3066), video(3251), bearingReference]
  },
  supports: {
    summary: base.summary,
    keyIdea: base.keyIdea,
    operation: base.operation,
    design: [
      'The base, mounting structures and foundation share machine weight and operating loads. Their stiffness and load distribution influence casing and bearing alignment.',
      'The supports must locate the machine while accommodating thermal expansion. The illustrated open frame and feet are inferred geometry, not installation or foundation drawings.'
    ],
    watch: [
      'Support movement and distortion can affect the rotor indirectly by moving stationary bearing housings, seals or casings.',
      'Cold alignment, operating alignment and the driven-equipment connection belong to the complete installation. Actual anchors, grout and permitted support motion are not defined here.'
    ],
    references: base.references
  }
};

export function educationForPart(part) {
  const lesson = compressorEducation(part) || hotSectionEducation(part);
  if (lesson) return lesson;
  if (part.id === 'shaft') return shaft;
  if (/^bearing-[123]$/.test(part.id)) return bearingEducation(Number(part.id.at(-1)));
  if (part.id === 'base-frame') return base;
  return null;
}

export function educationForSystem(id) {
  return systemLessons[id] || assemblyEducation;
}

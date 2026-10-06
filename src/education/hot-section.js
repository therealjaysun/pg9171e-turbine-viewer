const references = {
  buckets: {
    label: 'Sulzer: PG9171E-compatible bucket cooling specifications',
    url: 'https://www.sulzer.com/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentbuckets_en_e10255_5_2014_web.pdf?sc_lang=en',
  },
  family: {
    label: 'GE Vernova: 9E family and four-stage 9E.04 distinction',
    url: 'https://www.gevernova.com/gas-power/products/gas-turbines/9e',
  },
  dln: {
    label: 'DOE / NETL: Lean premixed combustion and DLN1',
    url: 'https://netl.doe.gov/sites/default/files/gas-turbine-handbook/3-2-1-2.pdf',
  },
  maintenance: {
    label: 'GE GER-3620P: Operating and maintenance considerations',
    url: 'https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/ger-3620p-heavy-duty-gas-turbine-operating-and-maintenance-considerations.pdf',
  },
  flow: {
    label: 'Sulzer: Combustion and cooling flow integrity',
    url: 'https://www.sulzer.com/en/campaign/more-go-with-better-flow',
  },
  life: {
    label: 'Sulzer: Rotor life and damage mechanisms',
    url: 'https://www.sulzer.com/en/shared/services/lifetime-assessments',
  },
};

function lesson(part, content, sources = []) {
  const seconds = part.sourceTime || 0;
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return {
    ...content,
    references: [
      {label: `Training video: ${time}`, url: `https://www.youtube.com/watch?v=4r1-IMMS73s&t=${seconds}s`},
      ...sources.map(source => references[source]),
    ],
  };
}

const wheels = {
  1: {
    summary: 'The first rotating turbine row takes work from the hottest gas entering the rotor. Its 92 buckets drive the common shaft through their wheel.',
    keyIdea: 'A bucket produces torque by changing the gas angular momentum; its cooling system protects metal while the gas stays hot enough to do useful work.',
    operation: [
      'The upstream stationary nozzle accelerates and angles the gas. Aerodynamic forces on the moving bucket then transfer energy to the wheel, compressor and generator.',
      'In the video configuration, rotor cooling air reaches root plenums through the first spacer, passes along internal bucket passages, and leaves at the recessed tip.',
    ],
    design: [
      'This row has unshrouded tips and an external thermal barrier coating. It differs from the interlocking tip shrouds on stages 2 and 3.',
      'Axial-entry, multiple-tang dovetails carry the bucket load into the wheel; shanks separate this attachment from the main hot-gas stream. The video describes D-key retention for this row.',
      'The engineering compromise is to keep the bucket cool and tip leakage small while accommodating changing rotor and casing dimensions during heating.',
      'The airfoil is metal surrounding cooling passages, not an empty thin shell. This reconstruction uses eleven spanwise passages inspired by a PG9171E-compatible Sulzer replacement bucket; the original video does not establish that exact population. Passage sizes are estimated, a common collector stands in for individual root plenums, and internal turbulators are not reproduced.',
    ],
    watch: [
      'Cooling-passage obstruction can raise local metal temperature even when bulk operating conditions appear unchanged.',
      'Thermal fatigue and creep are distinct: repeated temperature changes and sustained hot loading consume life differently.',
    ],
  },
  2: {
    summary: 'The second wheel extracts more shaft work from gas already expanded through the first stage. Like the other wheels, it carries 92 buckets.',
    keyIdea: 'The rotating tip shroud serves both as part of a leakage seal and as an interlocking connection between neighboring buckets.',
    operation: [
      'The second stationary nozzle redirects the first-stage discharge so it approaches this moving row at a useful angle.',
      'Cooling air passes from the aft face of the first wheel spacer into the bucket shank plenum, through spanwise passages, and out at the tip.',
    ],
    design: [
      'Interlocking tip shrouds damp bucket vibration. Their cutter teeth run beside stationary honeycomb to form a controlled tip seal.',
      'Unlike stage 1, this row combines internal cooling with tip shrouds. Axial-entry dovetails transfer load, while the video identifies twist locks as the axial retention arrangement.',
      'Tip shrouds improve sealing and vibration behavior but add rotating material at a large radius. This makes both aerodynamic performance and mechanical integrity relevant to their shape.',
      'Six spanwise passages are based on a PG9171E-compatible replacement reference, not a recovered OEM drawing. Their placement, diameters and tip outlets are reconstructed; a common collector stands in for individual shank plenums. A section between the narrow passages can correctly look solid.',
    ],
    watch: [
      'Flow integrity matters across the whole bucket set; one restricted cooling path can overheat a single bucket.',
      'Tip contacts, seal teeth and shroud condition connect vibration behavior with leakage performance.',
    ],
  },
  3: {
    summary: 'The last of the three turbine wheels extracts the remaining designed share of shaft work before the flow enters the exhaust assembly.',
    keyIdea: 'Uncooled means no internal bucket cooling passages in this configuration, not that the whole wheel and surrounding cavities need no cooling.',
    operation: [
      'Its 92 buckets follow the third stationary nozzle. The gas has already expanded through two stages and occupies a larger flow passage.',
      'The training video identifies these buckets as internally uncooled, with interlocking tip shrouds and twist-lock retention like the second stage.',
    ],
    design: [
      'The longer downstream airfoils accommodate expanding gas. Their precise twist and profile must match the local flow; the displayed profiles are reconstructed rather than OEM airfoil definitions.',
      'Tip-shroud cutter teeth and the stationary seal system limit gas bypassing the useful airfoil passage.',
      'The bucket shank and adjacent diaphragm separate the wheel attachment from the main gas stream. The third-stage aft wheelspace receives cooling from the exhaust-frame system in the video.',
    ],
    watch: [
      'An uncooled blade still experiences centrifugal loading, vibration, oxidation and thermal cycling.',
      'Life assessment considers fatigue, corrosion and creep, not operating hours alone.',
    ],
  },
};

const nozzles = {
  1: {
    summary: 'The first turbine nozzle receives the flow from all fourteen transition pieces and prepares it for the first bucket row.',
    keyIdea: 'Here, nozzle means stationary airfoil row. It accelerates and turns the hot gas; it is not a fuel injector.',
    operation: [
      'Eighteen cast segments, each carrying two vanes, form a 36-vane annulus. Expansion through their passages converts part of the gas pressure energy into velocity.',
      'The video describes hollow vanes cooled by compressor discharge air entering through impingement plates and leaving through trailing-edge holes.',
    ],
    design: [
      'The segmented ring can accommodate thermal growth while maintaining the nozzle entrance around the rotor. Its retaining ring is supported and centered within the turbine shell.',
      'Seals at the transition pieces, nozzle sidewalls and retaining structure control unintended paths into the gas stream.',
      'Cooling is an allocation problem: excess nozzle cooling consumes air needed elsewhere; insufficient flow sacrifices metal protection. Flow-metering features are therefore as important as the visible airfoil shape.',
    ],
    watch: [
      'The first nozzle faces the highest turbine gas temperatures; coating condition and thermal distress matter.',
      'A reconstructed vane contour cannot establish the real nozzle throat area or cooling-air demand.',
    ],
  },
  2: {
    summary: 'The second nozzle expands and reorients the first wheel discharge before the gas reaches the second rotating row.',
    keyIdea: 'This stationary assembly manages both the main gas stream and cooling/sealing flows near the rotor.',
    operation: [
      'Sixteen three-vane segments make 48 stationary vanes. Their inner diaphragms help separate the hot gas path from the wheelspace.',
      'Compressor discharge air reaches this nozzle through the first-stage shroud. Some leaves through vane trailing-edge holes; some feeds the first-stage aft wheelspace via diaphragm tubes.',
    ],
    design: [
      'Outer hooks support the segments between neighboring stationary shrouds. Pins control circumferential position while the arrangement accommodates thermal growth.',
      'The diaphragm labyrinth and brush seal meter cooling flow beside the first wheel spacer, limiting exchange between adjacent wheelspaces.',
      'Sealing tightly improves control of secondary airflow, but the seal geometry must tolerate rotor motion and growth. Those actual clearances are not represented by the exploded spacing.',
    ],
    watch: [
      'Nozzle deflection can reduce axial clearance to neighboring rotating parts.',
      'This row is air cooled; it should not be confused with the uncooled third nozzle.',
    ],
  },
  3: {
    summary: 'The third nozzle sets the gas direction entering the final wheel. It completes the sequence of three stationary rows alternating with three moving rows.',
    keyIdea: 'A stationary nozzle can carry substantial gas bending loads even though it does not rotate.',
    operation: [
      'Sixteen four-vane segments give 64 vanes. They expand the second wheel discharge and guide it into the last bucket row.',
      'In the video configuration this nozzle is not air cooled. Its inner diaphragm still helps isolate the rotor region from the hot mainstream.',
    ],
    design: [
      'The second- and third-stage stationary shrouds support this nozzle. Radial pins engage axial slots to locate the segments circumferentially.',
      'More vanes in this row does not by itself mean more power. Airfoil loading, passage area, flow angle and the matching rotor all determine its aerodynamic role.',
      'Segmentation and supported sidewalls must manage differential expansion without allowing the nozzle to lose its alignment with the moving row.',
    ],
    watch: [
      'Gas bending loads and heat can cause downstream deflection and reduced rotor clearance.',
      'The absence of internal cooling does not remove the need to manage diaphragm sealing and thermal movement.',
    ],
  },
};

export function hotSectionEducation(part) {
  if (!['combustion', 'turbine', 'exhaust'].includes(part.system)) return null;
  const id = part.id;

  if (id.startsWith('combustion-wrapper-')) return lesson(part, {
    summary: 'The wrapper is the pressure enclosure and air plenum around the fourteen combustion assemblies. It is supported between the compressor discharge casing and turbine shell.',
    keyIdea: 'Reverse flow describes the air route: compressor discharge air moves upstream around the liners before the combustion gas travels downstream to the turbine.',
    operation: [
      'The wrapper collects compressor delivery air and supplies the surrounding chamber flow sleeves. Each sleeve then establishes the air jacket needed by its liner.',
      'The video shows fourteen chamber-cover openings on a forward face inclined 13 degrees from vertical. The model interprets this orientation geometrically.',
    ],
    design: [
      'A horizontally split enclosure provides access while its joints and covers complete the pressure boundary.',
      'Air distribution matters because combustion, liner cooling and downstream cooling circuits all draw from compressed-air supplies. The wrapper and its connections must support predictable flow to each chamber.',
      'The hot flame is contained inside the liners. The surrounding compressed air and nested hardware give the outer enclosure a different thermal environment from the flame-facing surfaces.',
    ],
    watch: [
      'Casing joints, supports and fasteners are structural inspection concerns.',
      'The wrapper is distinct from the removable liners and individual chamber covers housed within it.',
    ],
  }, ['maintenance']);

  if (id === 'compressor-discharge-inner-barrel') return lesson(part, {
    summary: 'This assembly connects the compressor delivery region to the combustion plenum and supports the inner structure near bearing 2 and the first nozzle.',
    keyIdea: 'A diffuser recovers static pressure by slowing a flow. It adds no shaft work and does not create additional total pressure.',
    operation: [
      'The inner and outer discharge cylinders define an expanding passage. Some compressor-exit kinetic energy becomes static pressure before the air enters the wrapper.',
      'Twelve struts connect these cylinders. Their arrangement also leaves spaces for the transition pieces passing toward the turbine.',
    ],
    design: [
      'The passage must distribute air while the structure locates heavy, closely spaced rotating and stationary assemblies.',
      'The inner barrel extends forward around the bearing region. The video describes labyrinth, honeycomb and brush sealing at the compressor aft shaft to limit discharge-air leakage toward that region.',
      'The first nozzle support is attached at the aft inner cylinder, so structural movement here affects downstream alignment as well as the compressor discharge passage.',
    ],
    watch: [
      'Strut cracking, inner-barrel condition and attachment integrity are relevant inspection topics.',
      'A visible gap in the exploded model is a viewing aid, not an operating seal clearance.',
    ],
  }, ['maintenance']);

  if (/^combustor-\d+$/.test(id)) {
    const number = Number(id.split('-').at(-1));
    const instrumentation = [11, 12].includes(number)
      ? `Chamber ${number} carries a spark plug in the video. Crossfire tubes propagate ignition to its neighbors.`
      : [14, 1, 2, 3].includes(number)
        ? `Chamber ${number} is one of the video's four flame-monitoring locations, with observation of the primary and secondary zones.`
        : `Chamber ${number} is ignited through the interconnected crossfire system; the video places spark plugs on chambers 11 and 12.`;
    return lesson(part, {
      summary: `Chamber ${String(number).padStart(2, '0')} is one of fourteen can-annular DLN1 combustion assemblies. This selection includes its cover, flow sleeve and fuel-nozzle arrangement.`,
      keyIdea: 'Fuel staging changes where mixing and burning occur as operating conditions change.',
      operation: [
        'Six primary nozzles surround one central secondary nozzle. The two nozzle circuits supply the two DLN1 combustion zones.',
        'DLN1 progresses through primary, lean-lean, secondary-transfer and premix modes. During premix operation, the upstream zone prepares a lean mixture while the flame is in the downstream zone.',
        instrumentation,
      ],
      design: [
        'The flow sleeve brings air upstream around the liner. The cover supports the internals and routes fuel through dedicated passages; it is not itself the flame-facing liner.',
        'Lean premixing reduces local flame temperature and NOx formation, but flame stability and fuel-air distribution constrain how lean the system can run.',
      ],
      watch: [
        'Fuel-passage blockage or uneven flow can change the temperature pattern between chambers.',
        'Mode boundaries and fuel splits depend on the installed controls and hardware; the model provides no operating setpoints.',
      ],
    }, ['dln', 'flow']);
  }

  if (id.startsWith('combustor-liner-')) return lesson(part, {
    summary: 'The liner contains the mixing and burning zones. Its cap, body and Venturi organize the internal airflow while the surrounding sleeve supplies cooling and combustion air.',
    keyIdea: 'The liner controls where the air goes: air for burning, air for wall protection, and air for downstream dilution have different jobs.',
    operation: [
      'Primary air enters near the gas tips and metering holes; secondary air enters through the centerbody. Three downstream dilution holes are identified in the video.',
      'Cooling rings lay an air film along the liner wall. The cap also uses backside impingement cooling, and the Venturi has backside impingement cooling.',
    ],
    design: [
      'Flame-facing surfaces have a thermal barrier coating in the source configuration. Coating and airflow work together to protect the underlying metal.',
      'Three forward stops locate the liner while its aft end fits into the transition piece. This allows thermal expansion without fixing both ends rigidly.',
      'Changing the effective area of a cooling or mixing feature changes how air is apportioned, so apparent hole size alone is not a sufficient design specification.',
    ],
    watch: [
      'Coating loss, cooling blockage, wear and cracking are key liner condition concerns.',
      'The displayed cooling rings and holes illustrate these functions; their dimensions are estimated.',
    ],
  }, ['flow', 'maintenance']);

  if (id.startsWith('transition-')) return lesson(part, {
    summary: 'Each transition piece carries the gas from one circular combustion liner into one fourteenth of the first nozzle annulus.',
    keyIdea: 'Fourteen separate flame tubes must deliver a continuous annular gas stream without exposing the surrounding structure to that stream.',
    operation: [
      'The curved duct changes both the direction and cross-sectional shape of the flow between the outward chamber and the turbine entrance.',
      'The source describes thermal barrier coating inside the duct and compressor discharge air supplied to cooling holes near its aft end.',
    ],
    design: [
      'Inner, outer and side seals control air leakage around the nozzle entrance. The forward liner connection accommodates movement, while mounting features locate the duct.',
      'The aft bracket attaches at the first-nozzle retaining structure; a forward support clamp is associated with the compressor discharge casing.',
      'A design implication of this curved, heated duct is that supports and seals must preserve the gas path while the metal expands. Its round-to-sector shape is more than packaging: it connects two different flow arrangements.',
    ],
    watch: [
      'Coating condition, wear and cracks are relevant transition-piece inspection concerns.',
      'The modeled loft is a visual reconstruction; its area distribution cannot be used to infer an OEM pressure-loss characteristic.',
    ],
  }, ['maintenance']);

  if (id === 'combustor-crossfire-manifolds') return lesson(part, {
    summary: 'This selection combines two different services: crossfire tubes connect neighboring combustion zones, while fuel manifolds supply the chamber nozzles.',
    keyIdea: 'The ignition path and the fuel-supply path are separate networks even though both run around the combustion assembly.',
    operation: [
      'Crossfire tubes carry flame between adjacent liners after ignition begins in chambers 11 and 12. All fourteen chambers are interconnected in the source arrangement.',
      'The inner male/female flame-transfer tubes sit inside outer connecting tubes joining the chamber covers. Packing, flanges and retainers locate and seal the outer connections.',
      'Fuel distribution feeds the six primary nozzles and the central secondary nozzle at each chamber; their roles depend on the DLN1 operating mode.',
    ],
    design: [
      'The inner connection must transfer ignition while neighboring chambers undergo thermal movement. The outer connection belongs to the surrounding pressure enclosure.',
      'Multiple primary and secondary fuel paths must remain distinct so the controls can stage fuel between the combustion zones.',
    ],
    watch: [
      'Crossfire tubes and retainers are inspection items because they form the inter-chamber ignition connection.',
      'The simplified circular manifolds show routing relationships, not an installation-ready piping layout.',
    ],
  }, ['dln', 'maintenance']);

  if (id.startsWith('turbine-wheel-')) {
    const stage = Number(id.split('-').at(-1));
    return wheels[stage] ? lesson(part, wheels[stage], stage < 3 ? ['buckets', 'family', 'life'] : ['family', 'life']) : null;
  }

  if (id.startsWith('turbine-nozzle-')) {
    const stage = Number(id.split('-').at(-1));
    return nozzles[stage] ? lesson(part, nozzles[stage], stage === 1 ? ['flow', 'maintenance'] : ['maintenance']) : null;
  }

  if (id === 'turbine-spacers-studs') return lesson(part, {
    summary: 'Two spacers establish the axial separation of the three turbine wheels. Twelve through-studs clamp the rotor stack described in the training video.',
    keyIdea: 'The spaces between wheels are engineered cooling and sealing regions, not empty gaps.',
    operation: [
      'The first spacer separates wheels 1 and 2 and supplies cooling paths on both faces. The second separates wheels 2 and 3 and includes forward cooling features.',
      'Sealing lands on spacer outer surfaces face the stationary diaphragm seals. These interfaces regulate flow between adjacent wheelspaces.',
    ],
    design: [
      'Axial positioning must keep each wheel correctly related to its neighboring stationary nozzles as the assembled rotor heats and rotates.',
      'The clamped stack joins forward shaft, wheels, spacers and aft shaft into a common rotating assembly. Stud geometry and joint behavior cannot be assessed from this visual reconstruction.',
      'Cooling passages must reach the intended bucket and wheelspace regions while diaphragm seals limit unwanted interchange between those regions.',
      'The wheel and spacer webs remain substantial metal around central openings, stud holes and radial cooling routes. The modeled passage envelopes illustrate this construction; they are not OEM bore contours or a validated compressor-to-bucket flow network.',
    ],
    watch: [
      'Fretting, corrosion and fatigue are possible rotor-life concerns even where surfaces are shielded from the main hot flow.',
      'Exploded offsets make the stack readable; they do not describe a rotor disassembly or stud-tensioning procedure.',
    ],
  }, ['life']);

  if (id.startsWith('turbine-shell-')) return lesson(part, {
    summary: 'The turbine shell locates the stationary nozzle rows and shrouds around all three rotating wheels.',
    keyIdea: 'Keeping the shell dimensionally stable is part of controlling the small gaps that govern leakage and rotor contact.',
    operation: [
      'The bucket tips run beside stationary shroud segments rather than directly against the outer shell. These segments restrict tip leakage.',
      'Stages 2 and 3 pair their rotating tip-shroud teeth with stationary seal features and honeycomb, while the first stage uses a different unshrouded bucket-tip arrangement.',
    ],
    design: [
      'The shell supports radial and axial positioning. Segmented hardware, insulation and cooling reduce direct heat transfer from the gas path.',
      'The video describes external shell cooling passages fed from the exhaust-frame cooling circuit, with metering orifices controlling airflow.',
      'Cold clearances must account for how both rotor and stationary parts expand. A nominally smaller gap is only beneficial if contact and distortion remain controlled through operating transients.',
    ],
    watch: [
      'Shell cracks, shroud-hook condition and evidence of rubbing affect support and clearance integrity.',
      'The colored shell geometry shows its structural envelope, not detailed insulation or validated thermal expansion.',
    ],
  }, ['maintenance']);

  if (id === 'exhaust-frame-struts') return lesson(part, {
    summary: 'Ten radial struts connect the exhaust outer structure to the inner cylinder carrying bearing 3, just downstream of the turbine.',
    keyIdea: 'The exhaust frame must hold a rotor bearing accurately while standing inside a hot exhaust environment.',
    operation: [
      'Airfoil-shaped fairings cover the structural struts. The inner and outer diffuser surfaces similarly shield the frame from direct exposure to the exhaust.',
      'The video describes forced cooling air supplied through four ports. It flows around the frame and struts, with portions reaching the shell, aft wheelspace and bearing-3 region.',
    ],
    design: [
      'The aerodynamic fairing and the load-carrying strut perform different jobs. The former shapes the flow and thermal exposure; the latter keeps the inner bearing support connected to the outer frame.',
      'Temperature stability limits movement of the bearing center. This ties a seemingly downstream exhaust component directly to rotor alignment.',
      'Insulation protects frame areas in the exhaust plenum. Cooling and shielding are therefore structural design features as well as temperature protection.',
    ],
    watch: [
      'Cooling-path integrity matters because uneven heating can disturb support alignment.',
      'The strut outlines do not reveal every internal cooling passage or bearing-support connection.',
    ],
  });

  if (id.startsWith('exhaust-diffuser-')) return lesson(part, {
    summary: 'The annular exhaust diffuser slows the gas leaving the third turbine wheel before the aft turning section directs it into the radial plenum.',
    keyIdea: 'Pressure recovery means trading some flow velocity for static pressure; the diffuser contains no compressor rotor and adds no power.',
    operation: [
      'An expanding passage between inner and outer surfaces reduces exhaust velocity. The turbine gas remains hot after its useful expansion through the wheels.',
      'The downstream assembly then turns this axial stream outward around the central load-coupling tunnel.',
    ],
    design: [
      'The video shows a fabricated inner cylinder and divergent outer cylinder, attached at the exhaust frame.',
      'The inner boundary protects the coupling tunnel and bearing region through insulation. Passage shape and structural temperature management must coexist in this compact volume.',
      'The visible outer shell is only one boundary of an annular passage. Its shape should be read together with the inner frame and aft turning vanes to understand the full flow route.',
    ],
    watch: [
      'Heat and vibration can cause sheet-metal or weld cracks; erosion and distortion also matter.',
      'The CAD view communicates the arrangement, but it does not calculate pressure recovery or exhaust backpressure.',
    ],
  }, ['maintenance']);

  if (id === 'exhaust-turning-vanes') return lesson(part, {
    summary: 'Five concentric turning vanes guide the exhaust from the turbine axis outward into the radial exhaust plenum.',
    keyIdea: 'These rings turn an existing flow. They are stationary exhaust guides, not another turbine stage.',
    operation: [
      'After the annular diffuser slows the exhaust, curved passages change its direction from axial to radial.',
      'The central opening remains available for the hot-end load coupling between turbine and generator. Gas therefore travels around this tunnel rather than through its center.',
    ],
    design: [
      'Splitting the turn into several guided passages distributes the change in direction across the annulus. Their actual contours must fit both the exhaust route and the central mechanical connection.',
      'The gas-facing surfaces live downstream of the power-producing turbine but still see exhaust heat. Inner insulation reduces heat reaching the coupling tunnel and bearing-3 area.',
      'The model follows the five-vane radial-turning arrangement in the video. Other gas-turbine exhaust designs can discharge axially; that is a different configuration.',
    ],
    watch: [
      'Surface distortion changes passage geometry; cracks and loose hardware are exhaust inspection concerns.',
      'The illustrated bends and separations are reconstructed, not validated aerodynamic design dimensions.',
    ],
  }, ['maintenance']);

  return null;
}

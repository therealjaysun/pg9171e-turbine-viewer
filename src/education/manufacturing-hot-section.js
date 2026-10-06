const references = {
  hotBuckets: {
    label: 'Sulzer: PG9171E-compatible replacement buckets, E10255, pp. 1-2',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentbuckets_en_e10255_5_2014_web.pdf',
  },
  hotCombustion: {
    label: 'Sulzer: PG9171E-compatible liners and transitions, E10256, pp. 1-2',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentcombustioncomponents_en_e10256_5_2014_web.pdf',
  },
  hotParts: {
    label: 'Sulzer: PG9171E-compatible combustion-part manufacture, E10257, p. 1',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentnewpartsmanufacturing_en_e10257_5_2014_web.pdf',
  },
  hotNozzles: {
    label: 'Sulzer: PG9171E-compatible nozzle segments, E10258, pp. 1-2',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentnozzles_en_e10258_5_2014_web.pdf',
  },
  hotShrouds: {
    label: 'Sulzer: PG9171E-compatible stationary shrouds, E10259, pp. 1-2',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentshroudblocks_en_e10259_5_2014_web.pdf',
  },
  hotGeMaterials: {
    label: 'GE GER-3569G: manufacturing, pp. 2-3, 16-23 (archival transcription)',
    url: 'https://doczz.net/doc/7547341/ger-3569g---advanced-gas-turbine-materials-and-coatings',
  },
  hotGeRotor: {
    label: 'GE GER-3434D: rotor quality, printed p. 7 (university PDF mirror)',
    url: 'https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL23/General%20Electric%20Gas%20turbine%20Power%20Generator%20philosophy%201994.pdf#page=9',
  },
  hotCasting: {
    label: 'PCC Structurals: investment-casting workflow and inspection',
    url: 'https://www.pccstructurals.com/processes/investment-casting.html',
  },
  hotCores: {
    label: 'CPP: wax patterns and ceramic cores for internal casting features',
    url: 'https://www.cppcorp.com/core-wax-technologies',
  },
  hotCoreRemoval: {
    label: 'Howmet US5296308A: removable ceramic cores, Background and Description',
    url: 'https://patents.google.com/patent/US5296308A/en',
  },
  hotFlow: {
    label: 'Sulzer: fuel-nozzle, bucket and liner flow-test principles (service context)',
    url: 'https://www.sulzer.com/en/campaign/more-go-with-better-flow',
  },
  hotInspection: {
    label: 'Thomassen: hot-section inspection, fitting and repair-shop capabilities',
    url: 'https://thomassen-me.com/repairs/',
  },
  hotHastelloy: {
    label: 'Haynes International: HASTELLOY X sheet fabrication and welding',
    url: 'https://haynesintl.com/en/alloys/alloy-portfolio/high-temperature-alloys/hastelloy-x/',
  },
  hotNimonic: {
    label: 'Special Metals: NIMONIC 263, heat treatment and fabrication, pp. 1, 10-11',
    url: 'https://www.specialmetals.com/documents/technical-bulletins/nimonic-alloy-263.pdf',
  },
  hotFuelPatent: {
    label: 'GE US20070131796A1: fabricated and drilled secondary-nozzle examples',
    url: 'https://patents.google.com/patent/US20070131796A1/en',
  },
  hotCrossfirePatent: {
    label: 'GE US20070151260A1: crossfire-tube assembly embodiment, Figs. 1-2',
    url: 'https://patents.google.com/patent/US20070151260A1/en',
  },
  hotCasingPatent: {
    label: 'GE US8979488B2: conventional sand-cast casings, Background',
    url: 'https://patents.google.com/patent/US8979488B2/en',
  },
  hotFramePatent: {
    label: 'GE US20170370283A1: welded exhaust-frame embodiment, Fig. 2',
    url: 'https://patents.google.com/patent/US20170370283A1/en',
  },
  hotBhel: {
    label: 'BHEL: Frame 9E-inclusive machining and assembly scope, PDF pp. 33-34',
    url: 'https://www.bhel.com/sites/default/files/unskilled%20operations%20in%20GT%20areas%20for%202012-13.pdf#page=33',
  },
  hotMachining: {
    label: 'Sheffield Forgemasters: large-component turning, boring and milling',
    url: 'https://sheffieldforgemasters.com/whatwedo/machining/',
  },
  hotDiffuser: {
    label: 'Schock: 7E-family stainless diffuser fabrication and match machining',
    url: 'https://www.schock-mfg.com/gas-turbine-exhaust-diffuser',
  },
  hotGeExhaust: {
    label: 'GE GER-4610: 9E exhaust upgrades, pp. 20-21 (archival transcription)',
    url: 'https://www.scribd.com/document/347898930/Ger-4610',
  },
};

function note(title, text, ...sources) {
  return { title, text, sources };
}

function record(scope, route, checks, limitations) {
  const keys = [...new Set([...route, ...checks].flatMap(item => item.sources))];
  return {
    scope, route, checks, limitations,
    references: Object.fromEntries(keys.map(key => [key, references[key]])),
  };
}

const castingCheck = note('Casting soundness and dimensions',
  'PCC lists radiography and dimensional metrology for investment castings. These are representative ways to check hidden defects and finished shape, not this unit\'s acceptance specification.', 'hotCasting');
const fitCheck = note('Interface fit',
  'Thomassen uses dedicated fixtures to check hot-section interfaces and clearances. This is a service-shop example of why matching parts must be checked together.', 'hotInspection');
const penetrantCheck = note('Surface integrity',
  'Visual and dye-penetrant inspection are documented hot-section shop methods. Their presence here does not establish a particular factory inspection plan or allowable defect size.', 'hotInspection');
const rotorCheck = note('Forging and rotor quality',
  'GE describes ultrasonic inspection and spin-proof testing in its heavy-duty rotor quality system. A visually solid mesh cannot demonstrate either material integrity or overspeed capability.', 'hotGeRotor');
const coreExplanation = note('A core is temporary tooling',
  'Where passages are cast, a ceramic core occupies the future void and is removed after solidification. The finished airfoil retains load-bearing metal around empty passages, not a permanent ceramic blade core.', 'hotCores', 'hotCoreRemoval');

const wrapper = record(
  'Documented Frame 9E-inclusive shop operations for the combustion pressure wrapper. Its exact blank-making route and alloy are not established by the available sources.',
  [
    note('Matched casing machining', 'BHEL lists combustion-wrapper machining for a turbine family including Frame 9E.', 'hotBhel'),
    note('Assembly in the casing train', 'Its shop scope includes casing alignment and flange-bolted assembly, beyond producing individual outer shapes.', 'hotBhel'),
    note('Clean and prepare hardware', 'The wrapper operations include cleaning and preserving fasteners and support plates during machining and assembly.', 'hotBhel'),
  ],
  [
    note('Alignment emphasis', 'Casing alignment is explicitly a shop operation; numerical acceptance limits require the unit drawings.', 'hotBhel'),
    note('Hardware cleanliness', 'The documented cleaning and preservation tasks make fastener condition a useful assembly checkpoint, not merely cosmetic finishing.', 'hotBhel'),
  ],
  ['Do not infer a particular cast-iron or steel grade, weld route, wall allowance, or proof pressure from the rendered wrapper.'],
);

const innerBarrel = record(
  'Representative GE heavy-duty inner-barrel manufacture, not a recovered PG9171E production drawing.',
  [
    note('Cast the blank', 'GE lists inner barrels among sand-cast stationary parts. Casting establishes the large annular body; the exact material grade remains unit-dependent.', 'hotGeMaterials'),
    note('Machine the interfaces', 'Large-component boring, turning and milling are established supplier operations. Applied here as a representative route, they establish annular surfaces and attachment datums after casting.', 'hotMachining'),
    note('Fit within the discharge assembly', 'BHEL documents discharge-casing machining and alignment; the barrel interfaces belong within that assembly context.', 'hotBhel'),
  ],
  [
    note('Foundry quality', 'GE describes visual and ultrasonic checks for stationary castings, with radiographic qualification of casting processes. These are family-level practices, not an as-built certificate.', 'hotGeMaterials'),
    note('Concentric interfaces', 'Boring and finish machining provide controlled cylindrical datums. Dimensional verification should follow the relevant drawing, not dimensions extracted from this reconstruction.', 'hotMachining'),
  ],
  ['The cited sources do not establish the inner barrel\'s alloy, exact core arrangement, machining allowances or original tolerances.'],
);

const combustor = record(
  'PG9171E-compatible combustion-hardware manufacture, supplemented by a clearly separate GE secondary-fuel-nozzle patent example. The clickable can combines several independently made items.',
  [
    note('Sheet-metal subassemblies', 'Sulzer describes its compatible combustion parts as predominantly thin-sheet components made with preforms and fitting jigs; the range includes flow sleeves and fuel hardware.', 'hotParts'),
    note('Machine fuel passages separately', 'A GE patent contrasts multi-part secondary nozzles with an alternative containing machined concentric passages and gun-drilled bores. It demonstrates a possible manufacturing route, not the nozzle installed here.', 'hotFuelPatent'),
    note('Join and fit the fuel hardware', 'That patented alternative combines furnace brazing and circular welds, then bolts into the combustion end cover. These are distinct operations from forming the outer sleeve.', 'hotFuelPatent'),
  ],
  [
    note('Fuel-flow calibration', 'Sulzer describes bench-testing fuel nozzles to verify delivered flow. Appearance alone cannot establish the required metering or distribution.', 'hotFlow'),
    fitCheck,
  ],
  ['No serial-specific can, cover, swirler or fuel-manifold alloy and joining schedule was found. The patent is an embodiment, not proof that this DLN1 set used its drilled design.', 'The educational geometry groups the pressure sleeve, cover and nozzles; they are not one homogeneous casting.'],
);

const liner = record(
  'A documented PG9171E-compatible replacement route, with alloy-maker guidance and GE family context. It does not identify every historical DLN1 liner revision.',
  [
    note('Form the hot-wall sheet', 'Sulzer specifies cold-rolled HASTELLOY X for its compatible liner. Haynes identifies this as a nickel-chromium-iron-molybdenum alloy suitable for sheet fabrication.', 'hotCombustion', 'hotHastelloy'),
    note('Build the cooling structure', 'GE describes slot-cooled liners assembled by brazing and welding. The holes and overlapping cooling features are functional fabricated details, not evidence of a solid cast can.', 'hotGeMaterials'),
    note('Control joining and cleanliness', 'Haynes documents GTAW and other welding options for X alloy and emphasizes contaminant-free joint preparation. The actual weld procedure and forming/annealing sequence require the approved part specification.', 'hotHastelloy'),
    note('Protect the finished surfaces', 'Sulzer applies internal thermal-barrier coating to the liner and cap, with wear-resistant hardfacing at spring seals.', 'hotCombustion'),
  ],
  [
    note('Cooling-flow consistency', 'Sulzer warns that coating removal and reapplication can change liner flow area. Flow verification matters after finishing, not only before coating.', 'hotFlow'),
    penetrantCheck,
    fitCheck,
  ],
  ['Replacement material and coating details are not proof of this video unit\'s installed revision. No sheet gauge, braze filler or weld schedule is inferred.'],
);

const transition = record(
  'Sulzer\'s PG9171E-compatible transition-piece route, supplemented by the alloy producer\'s fabrication guidance.',
  [
    note('Hot-form the duct', 'The replacement brochure specifies hot pressing in NIMONIC C263 to produce the transition from a round combustor outlet to the turbine-entry sector.', 'hotCombustion'),
    note('Join the formed components', 'Special Metals documents TIG and MIG welding of alloy 263. This is a material capability, not a claim about the exact seam layout or welding method of the represented transition.', 'hotNimonic'),
    note('Restore the specified alloy condition', 'Alloy 263 is normally solution treated and age hardened. The supplier relates processing to product form and prior fabrication; an arbitrary heat cycle cannot be inferred from shape.', 'hotNimonic'),
    note('Coat and finish wear interfaces', 'Sulzer describes internal thermal-barrier coating and inlet-mouth hardfacing, with separate sealing hardware in the replacement assembly.', 'hotCombustion'),
  ],
  [fitCheck, penetrantCheck],
  ['The model does not establish sheet thickness, local forming strain, seam positions, heat-treatment recipe or installed coating revision.'],
);

const crossfire = record(
  'Separate crossfire and fuel-distribution hardware. A GE patented crossfire variant illustrates fabrication; it is not asserted to be the exact telescoping tube shown in the video.',
  [
    note('Make separate combustion hardware', 'Sulzer lists crossfire tubes, retainers and fuel-related pieces within its compatible manufactured parts, using preforms and fitting jigs for the combustion range.', 'hotParts'),
    note('Join a compliant tube assembly', 'In the GE patent embodiment, bellows ends are welded to flanges and overlapping heat sleeves are attached at one end. The arrangement separates sealing compliance from the hot inner path.', 'hotCrossfirePatent'),
    note('Assemble sealing interfaces', 'The same example uses flange connections and gasket seating. It demonstrates why tube joints and seals are separate manufacturing and assembly features.', 'hotCrossfirePatent'),
  ],
  [
    fitCheck,
    note('Joining and sealing emphasis', 'The patented construction makes flange welds, sleeve attachments and gasket seats explicit inspection targets; it supplies no acceptance limits for the modeled legacy tubes.', 'hotCrossfirePatent'),
  ],
  ['The external fuel manifold is not a crossfire tube. Its alloy, tube-forming route, joining process and test pressure are unverified here.', 'Do not add the patent\'s bellows or weld pattern to the legacy CAD solely because the manufacturing example uses them.'],
);

function wheel(stage) {
  const cooled = stage < 3;
  const alloy = cooled ? 'EEQ-111, a nickel superalloy described as equivalent to GTD-111' : 'INCONEL 738LC';
  const coatings = {
    1: 'The replacement uses external LPPS MCrAlY, internal aluminide and optional airfoil thermal-barrier coating.',
    2: 'The replacement uses external LPPS CoNiCrAlY and aluminide inside cooling holes.',
    3: 'Optional cutter teeth are listed. No stage-3 protective coating is specified or inferred.',
  };
  return record(
    `Stage ${stage} combines two different manufactured products: a forged wheel/hub and separately investment-cast buckets. Wheel practice is GE-family evidence; bucket details describe a PG9171E-compatible replacement.`,
    [
      note('Forge the wheel, not the buckets', 'GE describes individually forged wheels and spacers in a bolted rotor; CrMoV steels serve many heavy-duty units. The wheel is not an airfoil casting or an entirely empty shell.', 'hotGeMaterials'),
      note('Investment-cast each bucket', `Sulzer investment-casts stage ${stage} in ${alloy}. Wax-and-ceramic tooling forms the casting.`, 'hotBuckets', 'hotCasting'),
      cooled ? coreExplanation : note('Keep the uncooled distinction', 'The model\'s uncooled stage 3 does not inherit the arrays specified for stages 1 and 2.', 'hotBuckets'),
      note('Finish attachment surfaces', 'GE describes machining and shot-peening bucket dovetails. The attachment is a finished mechanical interface between separate bucket and wheel, not a welded continuation of the wheel.', 'hotGeMaterials'),
      note('Apply the specified surface system', coatings[stage], 'hotBuckets'),
    ],
    [
      rotorCheck,
      castingCheck,
      cooled ? note('Verify open and consistent passages', `Reference: ${stage === 1 ? '11 holes, eight turbulated in the airfoil' : 'six holes'}. Flow testing checks blockage and set uniformity; reconstructed bores are not shop dimensions.`, 'hotBuckets', 'hotFlow') : fitCheck,
    ],
    [
      cooled
        ? 'Casting cores are removable tooling, not permanent solid blade cores. Exact PG9171E passage production (cast, drilled or combined), grain structure, alloy revision and dimensions require the applicable bucket drawing.'
        : 'This stage is represented without internal bucket cooling. Its exact solidification method, grain structure, alloy revision and attachment dimensions require the applicable bucket drawing.',
      'The model\'s central bore, radial feeds and common root collector are educational reconstructions, not validated manufacturing features or structural calculations.',
    ],
  );
}

function nozzle(stage) {
  const details = {
    1: ['FSX-414 cobalt alloy in two-vane segments', 'Internal impingement, trailing-edge film discharge and shroud cooling are specified for this replacement.', 'Uncoated is the supplier\'s standard; thermal-barrier coating is an option.'],
    2: ['EEQ-222 nickel alloy, described as similar to GTD-222, in three-vane segments', 'The supplier\'s long-chord replacement has internal impingement and trailing-edge cooling.', 'The supplier specifies an external aluminide diffusion coating.'],
    3: ['EEQ-222 nickel alloy in four-vane segments', 'The stage-3 core layout is unverified. Absence of visible cooling outlets alone cannot establish internal solidity.', 'The supplier specifies no protective coating for this stage.'],
  }[stage];
  return record(
    `Stage-${stage} stationary nozzle manufacture based on a PG9171E-compatible replacement. General casting methods explain the process without establishing this unit's OEM routing.`,
    [
      note('Cast a vane segment', `Sulzer investment-casts ${details[0]}. These stationary segments are not rotating buckets.`, 'hotNozzles'),
      stage < 3 ? note('Create the internal air path', `${details[1]} Ceramic cores are one established way to form internal casting passages; they are removed after casting.`, 'hotNozzles', 'hotCores', 'hotCoreRemoval') : note('Respect the stage-specific interior', details[1], 'hotNozzles'),
      note('Finish and gauge the segment', 'Investment-casting suppliers describe heat treatment and dimensional metrology after casting. Hot-section fitting fixtures then relate the finished segment to its neighbors and supports.', 'hotCasting', 'hotInspection'),
      note('Select the stage-specific finish', details[2], 'hotNozzles'),
    ],
    [castingCheck, fitCheck, penetrantCheck],
    ['Compatible-replacement alloys, segment counts and finishes are not universal for all legacy 9E units. Optional brush seals and other supplier upgrades are not treated as original video hardware.', 'No cooling-core geometry, casting wall allowance, joint clearance or coating thickness is certified by this model.'],
  );
}

const spacers = record(
  'GE-family forged spacer and bolted-rotor practice. The through-studs are a separate fastener product; their exact alloy and thread-making route are not established.',
  [
    note('Forge and heat treat spacer stock', 'GE describes individually forged spacers. Its low-alloy rotor steels are quenched and tempered; grade-specific processing cannot be replaced by the recipe for a nickel-alloy bucket.', 'hotGeMaterials'),
    note('Machine annular faces and bores', 'Large-component turning, boring and milling provide a representative route for spacer geometry and mating interfaces. The illustrated cooling grooves are inferred, not approved machining details.', 'hotMachining'),
    note('Build the bolted stack', 'GE\'s heavy-duty rotor construction joins separate wheels, spacers and shafts by bolting. Assembly is distinct from producing any one forging.', 'hotGeMaterials'),
  ],
  [rotorCheck, note('Finished dimensions', 'Finish-machining capability includes bores and mating faces. Inspect these to the actual rotor drawing before assembly; the viewer supplies no interference-fit or preload acceptance values.', 'hotMachining')],
  ['The reconstructed 12-stud arrangement is not a fastener manufacturing specification. Stud material, thread rolling versus cutting, heat treatment and tightening procedure remain unresolved.'],
);

const shell = record(
  'Two distinct product families share this selection: a large turbine casing and separate stationary shroud blocks. Casing evidence is GE-family; shroud materials describe compatible replacements.',
  [
    note('Cast the casing blank', 'GE\'s casing-patent background describes conventional sand-cast casings. Its later lost-foam proposal is not asserted to be the manufacturing route for this legacy turbine shell.', 'hotCasingPatent'),
    note('Machine the casing', 'Joint faces, holes and locating features require finish machining. BHEL includes turbine-shell machining in its Frame 9E scope.', 'hotCasingPatent', 'hotBhel'),
    note('Produce separate shroud blocks', 'Sulzer investment-casts its replacement shrouds: stage 1 in HR-120, stage 2 in AISI 310 and stage 3 in AISI 410. These are not the casing material.', 'hotShrouds'),
    note('Finish the rubbing surfaces', 'Its stage-1 shroud has an abradable gas-path layer; stages 2 and 3 use honeycomb. These sacrificial surfaces are different from a structural shell or bucket coating.', 'hotShrouds'),
  ],
  [
    note('Check the assembled casing', 'BHEL describes aligning and flange-bolting the shell, discharge casing and exhaust frame.', 'hotBhel'),
    fitCheck,
    castingCheck,
  ],
  ['The exact casing grade, stress-relief cycle and honeycomb attachment method are unverified. No shroud clearance or coating-thickness tolerance is taken from the reconstructed geometry.'],
);

const exhaustFrame = record(
  'A GE patent illustrates welded exhaust-frame construction; BHEL confirms Frame 9E-inclusive exhaust-frame machining and assembly. The patent is not identification of this legacy unit.',
  [
    note('Make separate frame members', 'The GE embodiment has inner and outer casings joined by radial struts. These are separate structural members, not one homogeneous sheet or a solid block filling the exhaust annulus.', 'hotFramePatent'),
    note('Weld strut-to-casing joints', 'Its struts join the casings with perimeter welds. The document discusses thermal stresses at those joints; its proposed stress-relief features are not assumed to exist in the video.', 'hotFramePatent'),
    note('Machine and assemble the frame', 'BHEL lists exhaust-frame machining, cleaning and assembly, including Frame 9E.', 'hotBhel'),
  ],
  [
    note('Weld-region inspection emphasis', 'The patent identifies strut-joint thermal stress as a durability concern. Joint geometry and weld condition therefore merit attention, without implying a particular NDT acceptance standard.', 'hotFramePatent'),
    note('Casing alignment', 'BHEL treats shell-to-exhaust-frame alignment as a distinct assembly operation.', 'hotBhel'),
  ],
  ['The frame alloy, strut blank-making route, weld procedure and post-weld heat treatment are not established. Do not transfer an F-class or patented upgrade bill of materials to this PG9171E.'],
);

const diffuser = record(
  'Representative split-diffuser fabrication from a 7E-family supplier, with GE-authored 9E upgrade information. It is deliberately not an exact legacy 9E shop traveler.',
  [
    note('Fabricate the metal duct', 'Schock describes stainless-steel, one- or two-piece exhaust diffusers and welded construction for its 7E-family products. This is a comparable manufacturing example, not a 9E alloy identification.', 'hotDiffuser'),
    note('Machine after welding', 'That supplier match-machines split diffuser interfaces after weld-out. The sequence addresses fit after fabrication has introduced distortion.', 'hotDiffuser'),
    note('Fit supports and thermal interfaces', 'GE\'s 9E upgrade describes changes to ring supports, washers and welded pipe collars to reduce thermal mismatch. Such details are revision-specific, not universal additions to the model.', 'hotGeExhaust'),
  ],
  [
    note('Matched joint fit', 'Schock identifies machined flanges and interface shims as measures for fitted, gas-tight joints. A visually closed seam does not demonstrate leakage performance.', 'hotDiffuser'),
    note('Upgrade envelope', 'GE warns that newer 9B/E aft diffusers may not fit older plenums. Confirm the actual interface envelope before treating a replacement design as interchangeable.', 'hotGeExhaust'),
  ],
  ['The diffuser grade, sheet gauge, forming tooling, welding sequence, insulation and seal revision cannot be recovered reliably from the exterior model.'],
);

const turningVanes = record(
  'GE-authored 9E CHROEM aft-diffuser upgrade construction, not evidence that the illustrated legacy turbine received that upgrade.',
  [
    note('Build a supported vane assembly', 'GE\'s 9E aft-diffuser upgrade revises the vane-row supports and structural ribs; the model\'s rings are simplified.', 'hotGeExhaust'),
    note('Join the support hardware', 'That revision uses pipe gussets between vane rows for stiffness, not continuous welding of every vane to every support.', 'hotGeExhaust'),
    note('Provide thermal compliance', 'Thinner washers and welded pipe collars address thermal mismatch. The attachment detail remains drawing-specific.', 'hotGeExhaust'),
  ],
  [
    note('Crack-sensitive interfaces', 'GE identifies weld-related cracking and thermal mismatch as inspection concerns at these supports.', 'hotGeExhaust'),
    note('Fabrication complexity', 'Schock\'s separate 7E-family design reduces the number of welded parts. This demonstrates that weld layout is design-specific, not a universal property of radial exhaust vanes.', 'hotDiffuser'),
  ],
  ['Neither the exact vane-stock grade nor its forming dies, weld sizes and inspection limits are established. A later upgrade is not the ground truth for the video unit.'],
);

export function hotSectionManufacturing(part) {
  const id = part?.id;
  if (typeof id !== 'string') return null;
  if (/^combustion-wrapper-(upper|lower)$/.test(id)) return wrapper;
  if (id === 'compressor-discharge-inner-barrel') return innerBarrel;
  if (/^combustor-(?:[1-9]|1[0-4])$/.test(id)) return combustor;
  if (/^combustor-liner-(?:[1-9]|1[0-4])$/.test(id)) return liner;
  if (/^transition-(?:[1-9]|1[0-4])$/.test(id)) return transition;
  if (id === 'combustor-crossfire-manifolds') return crossfire;
  const wheelMatch = /^turbine-wheel-([1-3])$/.exec(id);
  if (wheelMatch) return wheel(Number(wheelMatch[1]));
  const nozzleMatch = /^turbine-nozzle-([1-3])$/.exec(id);
  if (nozzleMatch) return nozzle(Number(nozzleMatch[1]));
  if (id === 'turbine-spacers-studs') return spacers;
  if (/^turbine-shell-(upper|lower)$/.test(id)) return shell;
  if (id === 'exhaust-frame-struts') return exhaustFrame;
  if (/^exhaust-diffuser-(upper|lower)$/.test(id)) return diffuser;
  if (id === 'exhaust-turning-vanes') return turningVanes;
  return null;
}

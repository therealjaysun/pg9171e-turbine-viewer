const references = {
  geRotor: {
    label: 'GE Vernova: rotor manufacture, teardown, inspection and balancing (B/E/F fleet)',
    url: 'https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension',
  },
  forge: {
    label: 'Sheffield Forgemasters: open-die forging of solid and hollow components',
    url: 'https://sheffieldforgemasters.com/whatwedo/forge/',
  },
  powerSteel: {
    label: 'Sheffield Forgemasters: power-generation shafts and alloy-steel processing',
    url: 'https://sheffieldforgemasters.com/industry/power-generation/',
  },
  machining: {
    label: 'Sheffield Forgemasters: rough/finish turning, boring, milling and grinding',
    url: 'https://sheffieldforgemasters.com/whatwedo/machining/',
  },
  materialTests: {
    label: 'Sheffield Forgemasters: mechanical and metallurgical testing',
    url: 'https://sheffieldforgemasters.com/whatwedo/testing/',
  },
  bearingGuide: {
    label: 'Kingsbury: hydrodynamic bearing parts, fits and alignment, printed pp. 5-11',
    url: 'https://www.kingsbury.com/pdf/universe_brochure.pdf#page=5',
  },
  bearingShop: {
    label: 'Kingsbury: bearing manufacturing and repair, PDF pp. 3-7',
    url: 'https://kingsbury.com/wp-content/uploads/Repair_Service_YClr.pdf#page=3',
  },
  babbitt: {
    label: 'Washington Iron Works: babbitt casting, groove machining and bond inspection',
    url: 'https://washingtonironworks.com/bearing-inspection-and-manufacturing-2/',
  },
  framePatent: {
    label: 'Nuovo Pignone: US20190085729A1, background on welded turbomachinery bases',
    url: 'https://patents.google.com/patent/US20190085729A1/en',
  },
  frameShop: {
    label: 'Fabri-Tek Engineers: fabricated and machined equipment-base workflow',
    url: 'https://fabritekengineers.com/machined-baseframe',
  },
  geCasings: {
    label: 'GE GER-3434D: heavy-duty casing materials, printed pp. 1-2 (university mirror)',
    url: 'https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL23/General%20Electric%20Gas%20turbine%20Power%20Generator%20philosophy%201994.pdf#page=3',
  },
  ironProduction: {
    label: 'Dueker: grey/ductile-iron patterns, moulds, cores and aftertreatment',
    url: 'https://www.dueker.de/en/custom-casting/production/',
  },
  ironProcess: {
    label: 'ULDALL: sand-core cavities, pouring, cleaning and machining',
    url: 'https://www.uldall.dk/en/the-casting-process',
  },
  ironQuality: {
    label: 'ULDALL: cast-iron material control and inspection methods',
    url: 'https://www.uldall.dk/en/about-uldall/facts',
  },
  igvMaterial: {
    label: 'GE: US7753653B2, conventional IGV material in Background and Fig. 1',
    url: 'https://patents.google.com/patent/US7753653B2/en',
  },
  vaneMachining: {
    label: 'DMG MORI / Leistritz: aerospace guide-vane machining, 02-2018, pp. 18-20',
    url: 'https://en.dmgmori.com/resource/blob/311112/089db5641b610f20b6b44181ee3861b6/j182en-data.pdf#page=18',
  },
  geIgv: {
    label: 'GE Vernova: 9E IGV undercut and optional compressor finishing upgrades',
    url: 'https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-advanced-compressor',
  },
  cylinderProduction: {
    label: 'HPS: hydraulic-cylinder stock, machining, welding and assembly',
    url: 'https://hpsystems.com.tr/en/teknik-kaynaklar/uretim-akisi/',
  },
  cylinderTests: {
    label: 'HPS: hydraulic-cylinder acceptance, leakage, stroke and surface checks',
    url: 'https://hpsystems.com.tr/en/teknik-kaynaklar/rehber/basinc-testi/',
  },
};

function record(scope, route, checks, limitations) {
  const keys = [...new Set([...route, ...checks].flatMap(item => item.sources))];
  return {
    scope, route, checks, limitations,
    references: Object.fromEntries(keys.map(key => [key, references[key]])),
  };
}

const shaft = record(
  'Representative manufacture of large forged wheel shafts, combined with GE B/E/F rotor quality practices. The exact PG9171E shaft alloy and shop routing are not established.',
  [
    { title: 'Steel and forging stock', text: 'Power-generation shaft suppliers use controlled alloy-steel production. An open-die press progressively shapes a heated ingot; hollow as well as solid forgings are possible. This does not establish whether this unit\'s cavities began in a hollow forging or were bored later.', sources: ['powerSteel', 'forge'] },
    { title: 'Heat treatment and material condition', text: 'Heat treatment is part of the supplier\'s power-component manufacturing capability. Its purpose here is a specified material condition, not simply a hard surface. The appropriate cycle depends on the approved alloy, section size and property requirements.', sources: ['powerSteel', 'materialTests'] },
    { title: 'Rough and finish machining', text: 'Large lathes, mills and deep-hole boring equipment establish the rotational surfaces, mating faces and internal features. Rough machining leaves a component ready for subsequent finishing; finished geometry and surface condition are separate requirements.', sources: ['machining'] },
    { title: 'Stack assembly and balance', text: 'GE describes controlled wheel stacking and rotor balancing for its heavy-duty fleet. These operations qualify the assembled rotor as well as the individual components; visual symmetry in a model is not evidence of balance.', sources: ['geRotor'] },
  ],
  [
    { title: 'Material properties', text: 'Supplier test programmes use mechanical tests and metallography, including strength, toughness, hardness and grain examination. Results must be associated with the required material condition.', sources: ['materialTests'] },
    { title: 'Hidden and surface flaws', text: 'GE lists ultrasonic, eddy-current, magnetic-particle and fluorescent-penetrant methods in rotor life assessment. Method and coverage depend on the component and defect being sought; they are not interchangeable visual checks.', sources: ['geRotor'] },
    { title: 'Journals and mating datums', text: 'Journal smoothness, cylindrical form and alignment to the shaft axis matter to the oil film. Machined faces, fits and the complete rotor balance also require their own acceptance measurements.', sources: ['bearingGuide', 'machining', 'geRotor'] },
  ],
  [
    'The modeled forward bore, aft blind pocket and stud-flange details are inferred envelopes, not machining drawings. The complete compressor-to-bucket air circuit is not recovered.',
    'No alloy designation, heat-treatment cycle, balance grade, repair allowance or inspection acceptance limit is supplied for the video unit.',
  ],
);

const bearingRoute = [
  { title: 'Backing and bearing metal', text: 'A hydrodynamic pad commonly has a steel body with a metallurgically bonded, softer high-tin babbitt face. The lining is not a loose insert; other backing materials exist.', sources: ['bearingGuide'] },
  { title: 'Apply the lining', text: 'Kingsbury documents spin-casting for babbitt bearings. Washington Iron Works describes centrifugal casting for cylindrical shells and static casting for other configurations. Its repair route cleans and re-tins a sound backing before recasting; this is a repair example, not the proven original 9E process.', sources: ['bearingShop', 'babbitt'] },
  { title: 'Machine the working surfaces', text: 'Turning, milling and grinding produce the specified bearing surfaces. Oil grooves, thrust faces and retention features are machined to the bearing design, rather than treating every bore as a plain circular hole.', sources: ['bearingShop', 'babbitt'] },
];

const bearingChecks = [
  { title: 'Lining bond and surface condition', text: 'Ultrasonic bond inspection checks the lining-to-backing interface. Visual and dimensional inspection complement it; a smooth-looking lining alone cannot demonstrate a sound bond.', sources: ['babbitt'] },
  { title: 'Traceable dimensions', text: 'Kingsbury records incoming measurements and checks at defined repair milestones. Housing, pad and journal measurements must refer to the applicable drawing, not the intentionally enlarged clearances in this viewer.', sources: ['bearingShop'] },
];

function bearing(number) {
  const focus = {
    1: { title: 'Fit the journal and thrust stack', text: 'For the illustrated inlet bearing, distinguish the journal liner from the thrust assembly. In equalizing thrust designs, pivoted shoes and leveling plates accommodate manufacturing variation; collar flatness and squareness are important.', sources: ['bearingGuide'] },
    2: { title: 'Preserve the specified bore profile', text: 'For a fixed-profile journal bearing, the working bore may intentionally be non-circular. The specified profile, radial clearance and housing alignment are manufacturing targets, not defects to remove by making the liner uniformly round.', sources: ['bearingGuide'] },
    3: { title: 'Fit separate pads and pivots', text: 'Tilting-journal pads require their designed curvature and freedom to pivot. The backing, bearing face and pivot form an assembly; locking the pad rigidly would change its behavior.', sources: ['bearingGuide'] },
  }[number];
  return record(
    `Bearing No. ${number}: general hydrodynamic-bearing manufacturing and refurbishment practice. Supplier examples explain the illustrated bearing family; they do not identify the original GE/BHEL bearing supplier.`,
    [...bearingRoute, focus],
    bearingChecks,
    [
      'Backing alloy, babbitt specification, lining thickness and production tolerances for this installed unit are unverified.',
      'Bearing housings, seals and support geometry are simplified. These notes are not a rebabbitting procedure or an operating-clearance specification.',
    ],
  );
}

const baseFrame = record(
  'Representative welded and machined equipment-base construction. The displayed open frame and feet are inferred supports, not a recovered PG9171E foundation or skid design.',
  [
    { title: 'Select structural stock', text: 'Fabricators select plate, sections, pads and stiffeners from the approved load and mounting drawings. Material certificates identify the purchased stock.', sources: ['frameShop'] },
    { title: 'Cut, fit and weld', text: 'Plates and sections are cut and fitted into the frame before welding and stiffening. Nuovo Pignone\'s patent background describes conventional turbomachinery bases assembled from welded beams; it does not identify this 9E base.', sources: ['frameShop', 'framePatent'] },
    { title: 'Machine mounting datums', text: 'After fabrication, mounting pads, faces, slots and holes are machined to the equipment drawing and alignment datums.', sources: ['frameShop'] },
    { title: 'Surface protection and release', text: 'The specified primer, paint or coating protects the fabrication. Conventional open beam structures also need access to internal surfaces during painting, a manufacturing concern identified in the patent background.', sources: ['frameShop', 'framePatent'] },
  ],
  [
    { title: 'Weld inspection', text: 'Visual weld inspection and any specified nondestructive examination are documented. The inspection scope is set for the actual fabrication rather than inferred from the rendered weld-free surfaces.', sources: ['frameShop'] },
    { title: 'Flatness and mounting geometry', text: 'Final checks include mounting-face flatness, pad geometry and hole positions. Material, dimensional, weld and coating records form the fabrication handover.', sources: ['frameShop'] },
  ],
  [
    'No weld sizes, structural-steel grade, stress-relief cycle, anchors or foundation loads are specified by this reconstruction.',
    'The patent\'s proposed filled sandwich base is a separate embodiment; it is not asserted to be used here.',
  ],
);

const inletCasing = record(
  'Representative cast-iron casing route. GE documents grey and nodular iron within its heavy-duty casing family; the exact material and casting process of this PG9171E inlet have not been verified.',
  [
    { title: 'Material and foundry tooling', text: 'The GE family reference supports iron as a casing material category, not a specific grade for this inlet. In a representative iron foundry, patterns, gating and feeding features are prepared for the approved casting geometry.', sources: ['geCasings', 'ironProduction'] },
    { title: 'Mould the passage', text: 'Sand moulds establish the exterior. Where enclosed cavities require them, separate sand cores occupy the future voids during pouring. This explains how a hollow casting can be produced without first making a solid block.', sources: ['ironProcess'] },
    { title: 'Pour, release and clean', text: 'After iron solidifies, the casting is separated from the sand, cleaned and ground. Further treatment is specified for the selected material and application; a particular heat-treatment cycle is not assumed for this inlet.', sources: ['ironProcess', 'ironProduction'] },
    { title: 'Machine and protect', text: 'Machining and surface treatment turn the raw casting into an assembly-ready component. Split joints, bolt features and bearing-support interfaces in this model illustrate why raw cast surfaces and finished mating surfaces have different roles.', sources: ['ironProcess', 'ironProduction'] },
  ],
  [
    { title: 'Material and casting integrity', text: 'ULDALL describes melt analysis and, for ductile iron, control of graphite-forming treatment. Depending on the component, microscopy, magnetic-particle testing or ultrasonic inspection supplements material-property certification.', sources: ['ironQuality'] },
    { title: 'Tooling and finished geometry', text: 'Foundry pattern accuracy is checked during production, and the casting is made to agreed specifications. The model\'s split flanges and support openings are useful inspection landmarks, but their rendered sizes are not acceptance values.', sources: ['ironProduction'] },
  ],
  [
    'The upper and lower halves share a process family, but the actual mould division, core arrangement, machining fixtures and coatings are not known.',
    'A visible dark cavity is an airflow or access volume, not evidence of casting porosity. No pressure-test requirement is inferred for the inlet.',
  ],
);

const inletGuideVanes = record(
  'Metallic variable-guide-vane manufacture: GE-specific material/durability context plus a separately identified aerospace machining example. No complete PG9171E IGV shop routing has been recovered.',
  [
    { title: 'Confirm the vane configuration', text: 'GE\'s conventional-IGV patent background identifies GTD 450 precipitation-hardened stainless steel. This establishes a documented GE material family, not the alloy or heat-treatment condition of every 9E vintage.', sources: ['igvMaterial'] },
    { title: 'Machine the airfoil', text: 'DMG MORI documents Leistritz producing aerospace guide vanes with five-axis milling and controlled workholding. It is a manufacturing analogue for a precise airfoil, not evidence that this 9E vane was milled from the same blank type.', sources: ['vaneMachining'] },
    { title: 'Finish the spindle transition', text: 'GE\'s 9E upgrade changes the IGV undercut near the bushing to reduce crack risk. The transition between the spindle and airfoil is therefore a functional feature whose contour matters, not merely a cosmetic fillet.', sources: ['geIgv'] },
    { title: 'Apply only the specified surface route', text: 'GE lists optional ultrafinish and slurry coating within its 9E compressor upgrade package. Optional package features must not be treated as mandatory coatings on every IGV or as proof of the video unit\'s finish.', sources: ['geIgv'] },
  ],
  [
    { title: 'Profile and machining repeatability', text: 'The Leistritz case uses in-process measurement and tool-wear compensation to keep vane geometry within its own production requirements. Those tolerances and sampling rules are not transferred to the 9E model.', sources: ['vaneMachining'] },
    { title: 'Spindle, bushing region and trailing edge', text: 'GE identifies spindle wear, corrosion pitting and associated fatigue in conventional vanes; its 9E upgrade also addresses bushing-region and trailing-edge cracking. These identify inspection-sensitive regions, not acceptance limits.', sources: ['igvMaterial', 'geIgv'] },
  ],
  [
    'The GE patent proposes a composite vane, but only its conventional metallic-vane background is used here. The composite embodiment is not asserted to be fitted to a 9E.',
    'The initial blank process, exact alloy, rack/pinion production route, vane setting fixtures and final surface specification of this unit remain unknown.',
  ],
);

const igvActuator = record(
  'Representative hydraulic-cylinder production and acceptance checks from HPS, not identification of the PG9171E actuator manufacturer or model.',
  [
    { title: 'Tube, rod and seal stock', text: 'HPS sources certified honed tube and hard-chrome-plated rod. Seal materials are selected for the application\'s fluid, temperature and pressure rather than by appearance alone.', sources: ['cylinderProduction'] },
    { title: 'Machine the pressure parts', text: 'Tube and rod are cut to length. Turning, milling and drilling form the rod, body, head and cap features; the bore and rod surface are controlled working surfaces for the seals.', sources: ['cylinderProduction', 'cylinderTests'] },
    { title: 'Join the body features', text: 'In HPS\'s welded-cylinder route, body, cap, ports and flanges are joined by qualified MIG/TIG welding. This is one cylinder construction method, not proof that the modeled 9E actuator uses welded rather than tied or threaded closures.', sources: ['cylinderProduction'] },
    { title: 'Assemble and bench-test', text: 'The piston, rod, gland and selected seal set are assembled into the body, followed by acceptance testing. Manufacturing the cylinder and setting the turbine\'s vane-control linkage are distinct tasks.', sources: ['cylinderProduction', 'cylinderTests'] },
  ],
  [
    { title: 'Stroke, leakage and holding', text: 'HPS cycles the full stroke, verifies port function, checks internal bypass and external leakage, and assesses holding drift on a test bench. Test pressure and allowed leakage must come from the actual actuator specification.', sources: ['cylinderTests'] },
    { title: 'Sealing surfaces and records', text: 'Incoming rod coating and bore geometry/finish are checked before the pressure test. Material certificates and the cylinder test report provide separate traceability for the stock and the completed assembly.', sources: ['cylinderTests'] },
  ],
  [
    'Cylinder alloy, plating specification, seal compounds, joint design, working pressure and acceptance criteria are not recovered for this unit.',
    'The model simplifies cylinder internals, feedback, hydraulic controls and linkage adjustment. These notes are not an actuator repair or IGV calibration procedure.',
  ],
);

const records = {
  shaft,
  'bearing-1': bearing(1),
  'bearing-2': bearing(2),
  'bearing-3': bearing(3),
  'base-frame': baseFrame,
  'inlet-casing-upper': inletCasing,
  'inlet-casing-lower': inletCasing,
  'inlet-guide-vanes': inletGuideVanes,
  'igv-actuator': igvActuator,
};

export function mechanicsManufacturing(part) {
  return Object.hasOwn(records, part?.id) ? records[part.id] : null;
}

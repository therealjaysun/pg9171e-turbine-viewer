const references = {
  geCompressorDesign: {
    label: 'GE GER-3434D: compressor construction, printed pp. 1-2 and 6-7 (university mirror)',
    url: 'https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL23/General%20Electric%20Gas%20turbine%20Power%20Generator%20philosophy%201994.pdf#page=8',
  },
  geCompressorUpgrade: {
    label: 'GE Vernova: optional 9E compressor machining and surface upgrades',
    url: 'https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-advanced-compressor',
  },
  geRotorProcesses: {
    label: 'GE Vernova: heavy-duty rotor forging, inspection and assembly',
    url: 'https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension',
  },
  cblade: {
    label: 'C*Blade: compressor airfoils, forging, heat treatment, milling and inspection',
    url: 'https://www.cblade.it/',
  },
  corrtech: {
    label: 'Corrtech Energy: Frame 3-9 compressor parts and blade polishing',
    url: 'https://www.corrtechenergy.com/manufacturing',
  },
  steelProduction: {
    label: 'Sheffield Forgemasters: representative power-component steel and forging',
    url: 'https://sheffieldforgemasters.com/industry/power-generation/',
  },
  largeMachining: {
    label: 'Sheffield Forgemasters: turning, boring, milling and finish machining',
    url: 'https://sheffieldforgemasters.com/whatwedo/machining/',
  },
  rotorReassembly: {
    label: 'Sulzer: gas-turbine rotor inspection, concentricity and balancing workflow',
    url: 'https://www.sulzer.com/en/shared/about-us/annual-report-2016-story-core-competencies',
  },
  ironCasting: {
    label: 'ULDALL: representative sand-moulded iron casting process',
    url: 'https://www.uldall.dk/en/the-casting-process',
  },
  ironQuality: {
    label: 'ULDALL: iron casting materials, finishing and inspection',
    url: 'https://www.uldall.dk/en/about-uldall/facts',
  },
  geInspection: {
    label: 'GE GER-3620P: major-inspection checks, PDF pp. 30-31',
    url: 'https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/ger-3620p-heavy-duty-gas-turbine-operating-and-maintenance-considerations.pdf#page=30',
  },
};

function record(scope, route, checks, limitations) {
  const keys = [...new Set([...route, ...checks].flatMap(item => item.sources))];
  return {
    scope, route, checks, limitations,
    references: Object.fromEntries(keys.map(key => [key, references[key]])),
  };
}

const airfoilBlank = {
  title: 'Forge and heat-treat the airfoil blank',
  text: 'Representative supplier route: prepare a stainless-steel billet, heat it, then closed-die forge the blade or vane. C*Blade integrates heat treatment before final delivery; the alloy-specific cycle is not published for this turbine.',
  sources: ['cblade'],
};
const airfoilMachining = {
  title: 'Finish the airfoil and attachment',
  text: 'Five-axis milling produces the aerodynamic contour. Root and attachment geometry must also match the drawing; C*Blade shows compressor dovetails and ring-mounted stator interfaces. This is component-family evidence, not an identified factory route for each stage.',
  sources: ['cblade'],
};
const airfoilFinish = {
  title: 'Control the finished surface',
  text: 'Corrtech documents polishing in compressor-blade production for GE-designed fleets. GE separately offers optional ultrafinish and GECC-1 slurry coating for the 9E; neither option is assumed on the video unit.',
  sources: ['corrtech', 'geCompressorUpgrade'],
};
const airfoilInspection = {
  title: 'Profile and material quality',
  text: 'CMM measurement, nondestructive testing and metallurgical tests complement one another in the supplier route. A correct-looking airfoil does not establish its internal integrity or material condition.',
  sources: ['cblade'],
};
const flowpathInspection = {
  title: 'Installed clearances and surface condition',
  text: 'GE major inspections examine compressor rotor and stator tip clearances, rubbing, foreign-object damage, corrosion pitting and cracks. These service checks identify important interfaces, but do not supply factory acceptance tolerances.',
  sources: ['geInspection'],
};
const rotorInspection = {
  title: 'Concentricity, runout and balance',
  text: 'Sulzer documents individual-disk concentricity and balancing, followed by section runout checks and dynamic balancing after reassembly. This is a documented service workflow, not the original GE production traveler.',
  sources: ['rotorReassembly'],
};

function rotor(stage) {
  return record(
    `Compressor rotor stage ${stage}: representative separate-blade and forged-wheel manufacture. GE fleet construction is documented; this stage's original shop routing is not.`,
    [
      { title: 'Produce the wheel stock', text: 'GE describes low-alloy-steel compressor wheels and controlled rotor forging. Grain quality and material integrity are part of the manufacturing requirement, not properties recoverable from the mesh.', sources: ['geCompressorDesign', 'geRotorProcesses'] },
      airfoilBlank,
      airfoilMachining,
      airfoilFinish,
      { title: 'Machine and stack the wheels', text: 'Turning, boring and milling are representative large-forging operations. GE documents a built-up compressor with axial tie bolts and bore-side rabbet fits that locate the wheels radially; their fit is a separate manufacturing requirement from blade profile.', sources: ['largeMachining', 'geCompressorDesign'] },
    ],
    [airfoilInspection, rotorInspection, flowpathInspection],
    [
      'No stage-specific blade alloy, wheel grade, heat-treatment cycle, root tolerance or coating thickness is established. A supplier example is not evidence of who made this unit.',
      stage === 1 || stage === 17
        ? 'This model associates the end wheel with a stub shaft. Separate selectable meshes do not imply separate forgings, welds or physical joints.'
        : 'Blade counts, root profiles and wheel dimensions remain reconstructed; the mesh is not a production drawing or a balance-qualified rotor.',
    ],
  );
}

function stator(stage) {
  return record(
    `Compressor stator stage ${stage}: representative forged-and-machined vane manufacture. ${stage <= 8 ? 'The model shows a segmented carrier.' : 'The model shows direct casing-groove mounting.'} Neither mounting depiction identifies an OEM shop routing.`,
    [airfoilBlank, airfoilMachining, airfoilFinish],
    [airfoilInspection, flowpathInspection],
    [
      'The same process family is presented for all seventeen rows; material, tooling and finishing may differ by stage, vintage and upgrade configuration.',
      'Carrier alloy, retention details and machining tolerances are unverified. The illustrated mounting geometry is not evidence of casting, welding or brazing at that interface.',
    ],
  );
}

const exitGuides = record(
  'EGV 1 and 2: a representative compressor-vane route applied to the reconstructed exit-guide assembly. Exact EGV blank production and support-ring joining have not been established.',
  [
    airfoilBlank,
    airfoilMachining,
    { title: 'Finish the airfoils', text: 'The supplier examples establish finish-machining and polishing capability for compressor airfoils. They do not establish a coating, polishing specification or heat treatment for these particular exit-guide rows.', sources: ['cblade', 'corrtech'] },
  ],
  [
    airfoilInspection,
    { title: 'Inspect supports and installed fit', text: 'GE includes compressor discharge-case hooks and the inner barrel in major inspections. For this reconstruction, these are useful interface checks around the exit assembly; no EGV joint acceptance standard is inferred.', sources: ['geInspection'] },
  ],
  [
    'The displayed two rows and inner/outer supports are geometry context, not proof of a one-piece casting, a brazed vane ring or a welded assembly.',
    'The forged-vane route is an educational analogue. Confirm the actual EGV part drawing before choosing stock, tooling, joining or repair processes.',
  ],
);

const stubShafts = record(
  'Compressor stub shafts and tie bolts: representative large-shaft production plus documented GE built-up-rotor assembly. Original stock specifications and bolt production details are unknown.',
  [
    { title: 'Forge the shaft stock', text: 'Power-generation suppliers produce alloy-steel shafts through controlled steelmaking and forging. This explains the stock family, without identifying this unit\'s steel grade or whether a bore started in hollow stock.', sources: ['steelProduction'] },
    { title: 'Establish the material condition', text: 'Heat treatment accompanies power-component production. Its schedule must come from the approved material and part requirements; no furnace temperature, soak duration or quench medium is inferred here.', sources: ['steelProduction'] },
    { title: 'Machine journals and mating features', text: 'Rough and finish turning, boring, milling and grinding are available for large forgings. Applied to this model, the relevant drawing datums would include journals, thrust faces, coupling faces and locating fits.', sources: ['largeMachining'] },
    { title: 'Qualify bolting and assemble', text: 'GE describes separate rotor-bolting specifications, controlled wheel stacking and balancing. Bolts are qualified components, not interchangeable lengths of shaft stock; the rendered smooth rods omit their manufacturing detail.', sources: ['geRotorProcesses'] },
  ],
  [
    { title: 'Rotor flaw inspection', text: 'GE rotor assessments use ultrasonic, eddy-current, magnetic-particle and fluorescent-penetrant methods. Applicable methods and acceptance criteria depend on the actual component.', sources: ['geRotorProcesses'] },
    rotorInspection,
  ],
  [
    'The model groups end shafts, tie bolts, journal, thrust runner and other hardware for selection; it is not a bill of manufacturing blanks or joining operations.',
    'No thread-rolling method, bolt preload, balance grade, fit interference, repair allowance or heat-treatment cycle is specified.',
  ],
);

const casingRoute = [
  { title: 'Specify the casting and stock material', text: 'GE documents grey and nodular iron in its heavy-duty casing family. That supports a cast-casing explanation, but not a particular iron grade for each compressor or discharge section.', sources: ['geCompressorDesign'] },
  { title: 'Form the mould and internal spaces', text: 'In ULDALL\'s representative iron-foundry route, a pattern forms the sand mould and separate sand cores define enclosed cavities where required. Core layout is a manufacturing design, not something established by the cutaway view.', sources: ['ironCasting'] },
  { title: 'Pour, release and clean', text: 'After pouring and solidification, the casting is separated from its sand and cleaned. This is an example foundry sequence; the actual casing\'s moulding process and any thermal treatment remain unverified.', sources: ['ironCasting'] },
  { title: 'Machine and protect the finished casing', text: 'Machining and surface treatment can follow casting. For this model, split faces, flange holes, stator seats and port interfaces illustrate surfaces needing drawing-controlled finishing; the rendered wall is not an as-cast tolerance envelope.', sources: ['ironQuality'] },
];
const casingChecks = [
  { title: 'Casting material and integrity', text: 'An iron foundry can combine melt analysis, mechanical-property certification, microscopy and specified magnetic-particle or ultrasonic examinations. Which checks apply depends on the agreed component requirements.', sources: ['ironQuality'] },
  { title: 'Assembled casing geometry', text: 'GE calls for radial/axial clearance comparisons and checks for casing cracks, erosion, hook wear and flange slippage. Correct support during opening matters to alignment; use unit-specific instructions, not viewer dimensions.', sources: ['geInspection'] },
];

function casing(section, half) {
  return record(
    `${section[0].toUpperCase() + section.slice(1)} compressor casing, ${half} half: representative cast-and-machined casing route, with GE heavy-duty inspection context.`,
    casingRoute,
    casingChecks,
    [
      'Material grade, foundry core arrangement, stress-relief schedule, fixtures and surface protection for this casing are not verified. The same family explanation does not mean all six halves use identical material.',
      'Bleed passages, flange bolts and stator seats are simplified. No casting repair, pressure-test value or operational clearance is authorized by this reconstruction.',
    ],
  );
}

export function compressorManufacturing(part) {
  const id = part?.id;
  if (typeof id !== 'string') return null;
  if (id === 'compressor-stub-shafts') return stubShafts;
  if (id === 'compressor-exit-guides') return exitGuides;
  const row = /^compressor-(rotor|stator)-([1-9]|1[0-7])$/.exec(id);
  if (row) return row[1] === 'rotor' ? rotor(Number(row[2])) : stator(Number(row[2]));
  const shell = /^compressor-casing-(forward|aft|discharge)-(upper|lower)$/.exec(id);
  return shell ? casing(shell[1], shell[2]) : null;
}

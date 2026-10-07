// Evidence and rating methodology: docs/supply-chain-compressor.md.
// Scores are analyst judgments for the selected replacement scope, not quotations.
const sources = {
  upgrade: {
    label: 'GE Vernova — 9E advanced compressor upgrade',
    url: 'https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-advanced-compressor',
    scope: '9E-specific reliability, blades, stator rings, IGVs and aft-stub upgrades; no price.',
  },
  rotor: {
    label: 'GE Vernova — rotor life management and extension',
    url: 'https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension',
    scope: 'B/E/F rotor manufacturing and inspection; 9E service options. Whole-rotor cost symbols are not component prices.',
  },
  maintenance: {
    label: 'GE GER-3620P — operating and maintenance considerations, pp. 26, 30–31',
    url: 'https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/ger-3620p-heavy-duty-gas-turbine-operating-and-maintenance-considerations.pdf#page=26',
    scope: 'OEM fleet inspection priorities for compressor airfoils, cases, IGV mechanisms and alignment; no failure probabilities.',
  },
  corrtech: {
    label: 'Corrtech Energy — compressor parts manufacturing',
    url: 'https://www.corrtechenergy.com/manufacturing',
    scope: 'Supplier lists Frame 3–9 rotor/stator blade kits, ring segments, IGVs and spacers. Exact PG9171E qualification remains to be checked.',
  },
  cblade: {
    label: 'C*Blade — compressor airfoil manufacturing',
    url: 'https://www.cblade.it/',
    scope: 'General forged/machined compressor blade, vane and IGV capability; not proof of 9E part approval.',
  },
  hanwha: {
    label: 'Hanwha Power / PSM — rotor services',
    url: 'https://www.psm.com/services/rotor-services',
    scope: 'Explicit 9E rotor-service coverage with disassembly, balancing and repair. Some own-design blade offerings are F-class only.',
  },
  ethos: {
    label: 'EthosEnergy — heavy-duty gas-turbine services',
    url: 'https://ethosenergy.com/services/heavy-duty-gas-turbines',
    scope: 'Explicit 9E fleet support and rotor overhaul/manufacturing service categories; exact part availability requires inquiry.',
  },
  igvRack: {
    label: 'GE GEA35266 — IGV rack and control rings',
    url: 'https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/services/outage-services/IGV-Rack-and-Control-Rings-Fact-Sheet-GEA35266-July-2023.pdf',
    scope: 'Includes 9E; wear/backlash consequences and recommendation to hold rack/control-ring safety stock.',
  },
  igvRfq: {
    label: 'DEWA RFQ 2012504159 — 9E IGV spares (20 Aug 2025)',
    url: 'https://www.dewa.gov.ae/api/RfxDownload/Get/2012504159',
    scope: 'Actual 9E washers/bushings procurement with part-number/document requirements. Blank price columns; not a full IGV-set quote.',
  },
  actuator: {
    label: 'Woodward 26346K — IGV actuators for 9E turbines, pp. 9, 41–43',
    url: 'https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26346_K.pdf#page=9',
    scope: '9E-specific electrohydraulic actuator design and service routes. Not proof of the modeled unit’s installed make.',
  },
  inletBhel: {
    label: 'BHEL NIT 6913 — Frame-9E inlet-casing machining, clause 7',
    url: 'https://www.bhel.com/sites/default/files/HB160-GT-CORRIGENDUM-NIT_6913.pdf',
    scope: 'OEM machine-proveout specification identifies 9E inlet upper/lower castings and joint/bore machining; search-indexed PDF text, live fetch timed out.',
  },
  dischargeBhel: {
    label: 'BHEL NIT 6912 — Frame-9E discharge-casing machining, PDF p. 19',
    url: 'https://www.bhel.com/sites/default/files/HB200-GT-CORRIGENDUM-NIT_6912.pdf#page=19',
    scope: 'OEM machine-proveout specification identifies 9E discharge upper/lower castings and machining. Neither finished-part quote nor this unit’s drawing.',
  },
  egvBhel: {
    label: 'BHEL R9AYS00056 — 9E S17 / EGV ring machining (2025; document mirror)',
    url: 'https://docs.primetenders.com/documents/tender/2025/11/15/9396218891274449979/TechnocommercialbidR9AYS00056.pdf',
    scope: 'BHEL-authored tender mirrored by PrimeTenders: finish machining, runout inspection and BHEL-supplied job material. Not a finished-part price.',
  },
  uprate: {
    label: 'GE GER-3928C — MS9001 uprates, printed p. 8 (document mirror)',
    url: 'https://studylib.net/doc/28021204/ger-3928c-uprate-options-ms9001-heavy-duty-gas-turbine',
    scope: 'GE-authored 2008 paper, mirrored text: MS9001E S17/EGV stall-related distress and shrouded redesign. OEM PDF URLs now redirect.',
  },
  ppcShaft: {
    label: 'PPC / Lavrion — PG9171E aft-stub-shaft procurement specification',
    url: 'https://eprocurement.dei.gr/media/12066/d_903070.pdf',
    scope: 'Official search-indexed specification: new aft shaft excludes S17 blades; non-OEM reverse engineering permitted with engineering and material/NDT documentation. Live PDF fetch failed.',
  },
  bhelAward: {
    label: 'BHEL — May 2014 contracts, p. 37',
    url: 'https://tenders.bhel.com/sites/default/files/MAY_.pdf#page=37',
    scope: 'Historical EGV-2 manufacturing contract value; missing frame, quantity and material scope prevents unit-price use.',
  },
};

const assessmentLimit = 'Provisional scores use engineering scope and published supplier capabilities. No plant spend, outage margin, approved-vendor list, spare stock or current RFQ is available.';
const quote = 'Quote required. No verified current price for this complete replacement scope was found; the cost score is an analyst-assessed relative index.';
function record(family, title, scope, scores, bases, strategy, suppliers, references, limitations = [], priceEvidence = quote) {
  return {
    family, title, scope, researchedOn: '2026-10-06',
    cost: scores[0], criticality: scores[1], supplyRisk: scores[2], businessImpact: scores[3],
    costBasis: bases[0], criticalityBasis: bases[1], riskBasis: bases[2], impactBasis: bases[3],
    strategy, suppliers, references: references.map(key => sources[key]),
    limitations: [assessmentLimit, ...limitations], priceEvidence,
  };
}

const rotorRow = record(
  'compressor-rotor-row', 'Compressor wheel and blade row',
  'One stage: its wheel, blade row and associated spacer features; not one blade or a complete seventeen-stage rotor.',
  [4, 5, 4, 5],
  [
    'Relative cost 4: a precision wheel plus a full airfoil row combines substantial material, attachment machining and rotor integration. GE rotor processes and C*Blade airfoil manufacturing support the complexity judgment; no stage price is inferred.',
    'Criticality 5: failure of rotating hardware can damage downstream stages and stop the unit. GE treats rotor integrity as a core maintenance concern; this score rates consequence, not likelihood.',
    'Supply risk 4: GE and independent 9E service routes exist (Hanwha, EthosEnergy), but qualified wheel geometry, life records and balanced assembly constrain substitution. Corrtech blade capability does not establish complete-wheel interchangeability.',
    'Business impact 5: replacement can involve extensive rotor work and loss of generation. This is a restoration-burden proxy, without plant-specific revenue or annual spend.',
  ],
  'Strategic: plan rotor work with qualified partners; compare approved repair, reblading and replacement scopes; reserve compatible outage support and verify life records.',
  ['GE Vernova — OEM rotor supply/service', 'Hanwha Power / PSM — 9E rotor-service candidate', 'EthosEnergy — 9E rotor-service candidate', 'Corrtech Energy — Frame 9 blade-kit candidate; wheel scope unverified'],
  ['rotor', 'upgrade', 'cblade', 'corrtech', 'hanwha', 'ethos'],
  ['Stage-specific prices, alloys and failure rates are not established. Equal scores across rows avoid invented stage precision.', 'Stages 1 and 17 are integral with the model’s stub-shaft wheels. Their geometry overlaps the separate shaft selection; scores and scopes must not be summed as a bill of materials.'],
);

const statorRow = record(
  'compressor-stator-row', 'Compressor stator vane row',
  'One complete stationary row and the support/retention features included in that model selection.',
  [3, 4, 3, 4],
  [
    'Relative cost 3: a matched row needs shaped airfoils, attachments and inspection, without the large rotating wheel. Corrtech documents stator kits/ring segments and C*Blade documents vane production; this is a scope comparison, not a market quote.',
    'Criticality 4: vane damage or loss can impair the compressor and require shutdown. GE GER-3620P calls for inspection of cracking, rubs, corrosion and clearances; stationary hardware remains operationally important.',
    'Supply risk 3: multiple manufacturer/service capabilities are visible, but exact row, vintage, attachment and coating qualification still restrict procurement. Generic Frame 9 listings are insufficient for interchangeability.',
    'Business impact 4: a row repair can become significant outage work with material performance consequences; the site’s financial exposure is unknown.',
  ],
  'Strategic: qualify alternate row suppliers against drawings, retention and material requirements; bundle matched-row demand for competition and inspect before the outage.',
  ['GE Vernova — OEM compressor upgrades/service', 'Corrtech Energy — Frame 9 stator-kit candidate', 'C*Blade — compressor-vane manufacturing capability; 9E approval unverified'],
  ['maintenance', 'upgrade', 'corrtech', 'cblade'],
  ['Stages 1–8 show carriers and stages 9–17 show casing-groove mounting in the reconstruction; that distinction does not establish a quoted price premium.'],
);

const exitGuides = record(
  'compressor-exit-guides', 'Two-row exit-guide assembly',
  'Both EGV rows plus the displayed supports. This selection is larger than a single stator row.',
  [4, 4, 4, 4],
  [
    'Relative cost 4: two fitted vane rows and shrouded/support geometry imply greater replacement scope than one row. BHEL’s S17/EGV machining tender documents finish-machining and runout control, but supplies no finished-assembly price.',
    'Criticality 4: the GE MS9001 paper associates EGV distress with aerodynamic stall and describes shrouded improvements. A stationary exit assembly is not a low-consequence accessory.',
    'Supply risk 4: geometry and configuration must match the compressor exit; an airfoil maker’s general capability is not proof of a qualified two-row 9E assembly.',
    'Business impact 4: restoring the exit flowpath requires matched hardware and outage coordination; this is a provisional financial-impact proxy.',
  ],
  'Strategic: verify the unit’s S17/EGV configuration before sourcing; obtain OEM and qualified specialist proposals for complete matched scope and engineering review.',
  ['GE Vernova — MS9001 compressor-exit upgrade route', 'BHEL — documented 9E EGV manufacturing/procurement route; confirm unit applicability'],
  ['uprate', 'egvBhel', 'bhelAward'],
  ['GE paper and BHEL tender are transparently labeled document mirrors. The specific model supports are reconstructed.', 'BHEL manufacturing award totals omit sufficient frame, quantity and scope detail; they are not used as EGV unit prices.'],
);

const stubShafts = record(
  'compressor-shafts-bolting', 'Compressor stub shafts and tie-bolt group',
  'Two end-shaft assemblies and sixteen modeled tie bolts; not an individual bolt quote.',
  [5, 5, 5, 5],
  [
    'Relative cost 5: the grouped scope combines major shaft stock, journals, locating interfaces and qualified rotor bolting. GE’s documented forging/assembly controls support a very-high relative replacement tier.',
    'Criticality 5: loss of the shaft or clamping integrity threatens the whole rotating assembly, an engineering consequence judgment consistent with GE’s rotor-integrity emphasis.',
    'Supply risk 5: PPC’s exact PG9171E shaft tender allows non-OEM manufacture but requires documented engineering, material and inspection. This grouped shaft/bolting scope remains constrained by rotor-stack compatibility; high risk does not imply sole sourcing.',
    'Business impact 5: the group supports the entire compressor rotor and can drive major shop work and extended loss of generation; no outage duration is claimed.',
  ],
  'Strategic: manage shaft and bolting life with a qualified rotor partner; compare engineered repair and replacement, trace every critical item, and align procurement with planned rotor work.',
  ['GE Vernova — OEM rotor life management', 'Hanwha Power / PSM — 9E rotor inspection/repair candidate', 'EthosEnergy — 9E rotor overhaul candidate'],
  ['rotor', 'upgrade', 'hanwha', 'ethos', 'ppcShaft'],
  ['Not all illustrated hardware is one purchased assembly. End wheels overlap the rotor-stage selections; do not total the indices.', 'A publicly found eighteen-piece marriage-coupling bolt RFQ is a different scope from these sixteen compressor tie bolts and is not used as their price evidence.'],
);

const igv = record(
  'inlet-guide-vane-set', 'Variable inlet-guide-vane set',
  'All 64 modeled vanes plus the displayed rings, pinions and supporting hardware; actuator is a separate selection.',
  [4, 4, 3, 4],
  [
    'Relative cost 4: a complete matched vane set and gearing/supports carry far more replacement scope than a washer or one vane. Corrtech lists Frame 9 IGVs; DEWA’s smaller IGV-spares RFQ cannot price the complete set.',
    'Criticality 4: GE’s rack/control-ring factsheet links excess backlash to vibration and cracking. Airflow control and mechanical integrity make the set operationally important.',
    'Supply risk 3: OEM and independent vane capabilities exist, while exact geometry, hardware and documentation constrain qualification. DEWA’s 9E RFQ requires matching part numbers and certified drawings.',
    'Business impact 4: full-set work combines material spend with airflow-control availability and outage effort; actual financial exposure remains unmeasured.',
  ],
  'Strategic: qualify matched vanes and hardware as a system, check wear before outage planning, and assess rack/control-ring safety stock as GE recommends.',
  ['GE Vernova — 9E IGV upgrade and rack/control-ring route', 'Corrtech Energy — Frame 9 IGV candidate', 'C*Blade — IGV manufacturing capability; 9E qualification unverified'],
  ['igvRack', 'igvRfq', 'corrtech', 'cblade', 'upgrade'],
  ['64 is the modeled set count. The DEWA RFQ quantities concern individual hardware spares, not a vane-set count.', 'No complete matched-set price or available stock was verified.'],
  'Quote required. DEWA RFQ 2012504159 is a real 2025 9E hardware procurement, but its price fields are blank and its washers/bushings are not this whole vane set.',
);

const actuator = record(
  'igv-actuator', 'IGV actuator and linkage',
  'One electrohydraulic actuator assembly and the reconstructed linkage; not a generic hydraulic cylinder or seal kit.',
  [3, 4, 3, 4],
  [
    'Relative cost 3: Woodward’s 9E unit combines actuator, control valve and position feedback, justifying a specialized assembly tier. It is smaller replacement scope than the complete vane set.',
    'Criticality 4: the Woodward manual describes precise positioning and trip closure. Failure can interrupt required IGV control; redundant electrical features do not make the complete actuator noncritical.',
    'Supply risk 3: Woodward has an authorized support network and repair/exchange options, but stroke, interface and configuration must match. Their availability conditions are not a guaranteed lead time.',
    'Business impact 4: a comparatively modest-sized item can constrain unit availability; its provisional business-impact score therefore exceeds a simple size or material proxy.',
  ],
  'Strategic: verify the installed nameplate/configuration, evaluate a compatible exchange spare and authorized repair, and include linkage calibration in the approved service scope.',
  ['Woodward — documented 9E actuator family and authorized service network', 'GE Vernova / turbine packager — installed-system compatibility review'],
  ['actuator', 'maintenance'],
  ['The illustration does not identify its installed actuator supplier. Woodward is a documented compatible-family candidate, not an as-built attribution.', 'Published general service options are conditional; no numerical delivery promise or repair price is assigned.'],
);

function casing(section, half) {
  const inlet = section === 'inlet';
  const discharge = section === 'discharge';
  return record(
    `compressor-${section}-casing`, `${section[0].toUpperCase() + section.slice(1)} casing — ${half} half`,
    `One ${half} casing half with its modeled integral features; not both halves or a complete compressor casing train.`,
    [discharge ? 5 : 4, discharge ? 5 : 4, 4, discharge ? 5 : 4],
    [
      discharge
        ? 'Relative cost 5: this model groups a large discharge structure with multiple flowpath/support interfaces. BHEL documents 9E discharge casting and large-machine joint/bore finishing; the top tier is analyst judgment, not its tender price.'
        : `Relative cost 4: a large ${inlet ? 'inlet collector/support' : 'flowpath'} casing needs controlled casting geometry and matched machining. BHEL’s 9E casing work provides a relevant manufacturing benchmark, not a price for this exact half.`,
      discharge
        ? 'Criticality 5: the discharge structure joins and supports major assemblies; significant structural damage can prevent unit operation. GE includes its struts, hooks and inner barrel in inspection scope.'
        : `Criticality 4: the ${inlet ? 'inlet includes bearing support and flow guidance' : 'case locates stationary rows and controls flowpath clearances'}. Damage can require shutdown; a casing half is not decorative cladding. GE inspection guidance supports checking structural condition and alignment.`,
      'Supply risk 4: unit-matched casting, split faces and bore geometry require specialist tooling, drawings and acceptance. Multiple repair shops do not establish ready-made interchangeable halves.',
      discharge
        ? 'Business impact 5: replacement affects several major interfaces and substantial restoration work. This financial-impact proxy requires validation against the site’s outage economics.'
        : 'Business impact 4: replacement involves substantial handling and fit/alignment work, creating meaningful outage exposure in addition to the part’s material cost.',
    ],
    'Strategic: inspect and assess approved repair before replacement; preserve drawing and dimensional records, qualify the casting/machining route, and plan matched-half fit and outage logistics.',
    ['GE Vernova — OEM inspection/service route', `BHEL — documented 9E ${inlet ? 'inlet' : 'discharge'} casing manufacture benchmark; exact replacement eligibility requires confirmation`],
    ['maintenance', inlet ? 'inletBhel' : 'dischargeBhel'],
    [
      'Upper/lower halves can require matched machining and assessment; independent dots do not prove interchangeable procurement units.',
      inlet || discharge
        ? 'BHEL identifies ductile iron for its named proveout drawing, not necessarily this specific turbine’s material certificate.'
        : 'No forward/aft-specific casting quote was recovered. The BHEL discharge specification is a clearly labeled adjacent-family machining analogue.',
    ],
  );
}

export function compressorSupply(part) {
  const id = part?.id;
  if (typeof id !== 'string') return null;
  if (id === 'compressor-stub-shafts') return stubShafts;
  if (id === 'compressor-exit-guides') return exitGuides;
  if (id === 'inlet-guide-vanes') return igv;
  if (id === 'igv-actuator') return actuator;
  const row = /^compressor-(rotor|stator)-([1-9]|1[0-7])$/.exec(id);
  if (row) {
    const stage = Number(row[2]);
    const base = row[1] === 'rotor' ? rotorRow : statorRow;
    return {
      ...base,
      title: `${base.title} — stage ${stage}`,
      scope: `Stage ${stage} of 17. ${base.scope}`,
      ...(row[1] === 'stator' && stage === 17 ? {
        references: [...base.references, sources.uprate, sources.egvBhel],
        limitations: [...base.limitations, 'GE’s MS9001 paper specifically discusses S17/EGV shrouded redesign. Confirm vintage and upgrade status before sourcing.'],
      } : {}),
    };
  }
  const inlet = /^inlet-casing-(upper|lower)$/.exec(id);
  if (inlet) return casing('inlet', inlet[1]);
  const shell = /^compressor-casing-(forward|aft|discharge)-(upper|lower)$/.exec(id);
  return shell ? casing(shell[1], shell[2]) : null;
}

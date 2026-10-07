// Research checked 2026-10-06. Scores are analyst assessments, never quotations.
// Scope follows the clickable assembly, which can contain multiple purchased items.
const refs = {
  ge9e: {
    label: 'GE Vernova — 9E parts and services',
    url: 'https://www.gevernova.com/gas-power/products/gas-turbines/9e',
    scope: 'OEM 9E support route; current 9E.04 upgrade details are not the modeled three-stage PG9171E bill of materials.',
  },
  maintenance: {
    label: 'GE Vernova — GER-3620P maintenance considerations (2021)',
    url: 'https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/ger-3620p-heavy-duty-gas-turbine-operating-and-maintenance-considerations.pdf',
    scope: 'GE heavy-duty family evidence: casing support, combustion/hot-gas-path inspections and spare-parts planning. Unit-specific limits still require the applicable manual.',
  },
  rotor: {
    label: 'GE Vernova — rotor life management and extension',
    url: 'https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension',
    scope: 'B/E/F rotor inspection, wheel/bolting capabilities and repair/exchange alternatives; qualitative cost symbols are not dollar prices.',
  },
  parts: {
    label: 'Sulzer — PG9171E-compatible new parts (2019)',
    url: 'https://www.sulzer.com/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentnewpartsmanufacturing_en_e10257_5_2014_web.pdf?la=en',
    scope: 'Explicit PG9171E-compatible product families and specialized combustion fabrication; not proof of the installed DLN1 revision.',
  },
  combustion: {
    label: 'Sulzer — PG9171E-compatible liners and transitions (2020)',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentcombustioncomponents_en_e10256_5_2014_web.pdf',
    scope: 'Replacement liner and transition materials, forming, coating and seals. No published price.',
  },
  buckets: {
    label: 'Sulzer — PG9171E-compatible stage 1–3 buckets (2019)',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentbuckets_en_e10255_5_2014_web.pdf',
    scope: 'Bucket kits and stage-specific casting, cooling and coating. Does not include a rotor wheel.',
  },
  nozzles: {
    label: 'Sulzer — PG9171E-compatible stage 1–3 nozzles (2019)',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentnozzles_en_e10258_5_2014_web.pdf',
    scope: 'Stationary nozzle segment materials, segment design and finishes; replacement specification, not an as-built certificate.',
  },
  shrouds: {
    label: 'Sulzer — PG9171E-compatible shroud blocks (2019)',
    url: 'https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentshroudblocks_en_e10259_5_2014_web.pdf',
    scope: 'Separate shroud-block alloys and abradable/honeycomb surfaces; does not price or specify the structural turbine shell.',
  },
  bhel: {
    label: 'BHEL — Frame 9E-inclusive assembly scope (19 June 2012)',
    url: 'https://www.bhel.com/sites/default/files/unskilled%20operations%20in%20GT%20areas%20for%202012-13.pdf#page=33',
    scope: 'Historical manufacturer document covering casing, wrapper and shell machining/handling/alignment; labor tender, not replacement-part pricing.',
  },
  ppc: {
    label: 'PPC — Lavrion PG9171E rotor procurement specification',
    url: 'https://eprocurement.dei.gr/media/18510/dplp-903231-teliko.pdf#page=52',
    scope: 'Tender POPD-903231, technical specification pp. 1–6: rotor incidents, component traceability, tie rods and balancing. Historical project requirements, not universal lead times.',
  },
  doosan: {
    label: 'Doosan Turbomachinery Services — Frame 9 repairs',
    url: 'https://www.doosanturbo.com/engines/ge-frame-9/',
    scope: 'Supplier-declared MS9001E repair capability, including DLN1, fuel nozzles, sleeves, liners, transitions and stage 1–3 hot-section parts. Repair capability is not new-part approval.',
  },
  hanwha: {
    label: 'Hanwha Power / PSM — 9E aftermarket components',
    url: 'https://www.psm.com/products/b-e-class-frames/9e',
    scope: '9171E hot-section supply and combustion upgrades; set-wise compatibility is stated. Upgrades require engineering review and are not automatically like-for-like DLN1 spares.',
  },
  ethos: {
    label: 'EthosEnergy — B/E-class rotor alternatives',
    url: 'https://careers.ethosenergy.com/services/heavy-duty-gas-turbines/rotor-life-extension',
    scope: 'Supplier-declared Frame 9E life-extension and rotor replacement capability, read from indexed primary content. Exact wheel availability requires an inquiry.',
  },
  ntpc: {
    label: 'NTPC — PG9171E combustion refurbishment tender (22 October 2019)',
    url: 'https://ntpctender.ntpc.co.in/uploads/job_30386.html',
    scope: 'Tender 9900183708 establishes specialized repair qualification. Financial eligibility thresholds and tender fees are not component prices.',
  },
  iraq: {
    label: 'Iraqi Ministry of Electricity — E3G-010 refurbishment tender (October 2018)',
    url: 'https://www.iraqiembassy.us/sites/default/files/documents/Binder1_9.pdf#page=50',
    scope: 'Historical USD 761,560 estimated total for mixed Frame 9E refurbishment sets; neither an awarded contract nor a per-part or new-replacement price.',
  },
  flow: {
    label: 'MD&A — 7EA/9E DLN1 fuel-nozzle flow experience',
    url: 'https://www.mdaturbines.com/es/resources/experts/pat-murphy/',
    scope: 'Primary supplier interview about 7EA/9E DLN1 flow matching, read from indexed content; no price or complete-can supply claim.',
  },
  crossfire: {
    label: 'WWGTP — supplied Frame 9E crossfire tubes',
    url: 'https://www.wwgtp.com/recently-supplied/',
    scope: 'Supplier evidence for Frame 9E crossfire tubes only; no evidence for the complete fuel-manifold assembly.',
  },
  dewa: {
    label: 'DEWA — 9E shell flange hardware RFQ (26 August 2024)',
    url: 'https://www.dewa.gov.ae/api/RfxDownload/Get/2012403939',
    scope: 'RFQ 2012403939 seeks GE part-number and material documentation for flange hardware. Blank price columns; not shell pricing.',
  },
};

const record = (data, keys) => ({
  ...data,
  references: keys.map(key => refs[key]),
  researchedOn: '2026-10-06',
});
const quote = 'Quote required. No applicable public new-replacement unit price was verified.';
const bundlePrice = `${quote} Iraq E3G-010 prices only a historical mixed refurbishment package; it cannot be allocated to this selection.`;
const combustionSuppliers = [
  'GE Vernova — OEM 9E parts/service inquiry',
  'Sulzer — compatible combustion replacement capability; confirm DLN1 revision',
  'Doosan Turbomachinery Services — MS9001E/DLN1 repair capability',
  'Hanwha Power (PSM) — engineered 9171E combustion alternatives',
];
const combustionRisk = 'Analyst assessment: Sulzer and Doosan show an aftermarket, but NTPC requires relevant operating experience and plant-specific repair technology. Revision, cooling and fit qualification keep supply risk elevated.';
const combustionImpact = 'Analyst procurement proxy: repeated demand across 14 chambers and recurring overhaul sets can create significant lifecycle spend. No plant purchase history or measured profit impact is available.';

const wrapper = record({
  family: 'combustion-wrapper',
  title: 'Combustion pressure-wrapper half',
  scope: 'One upper or lower pressure-wrapper half and its modeled flanges; excludes the 14 individual combustor assemblies.',
  cost: 4, criticality: 5, supplyRisk: 4, businessImpact: 4,
  costBasis: 'Analyst relative replacement score: a large fitted pressure structure with extensive interfaces. BHEL documents wrapper machining and handling in its Frame 9E-inclusive assembly work.',
  criticalityBasis: 'Analyst consequence assessment: loss of pressure-boundary integrity or chamber alignment can prevent safe operation. This wrapper is functional pressure hardware, not a cosmetic enclosure.',
  riskBasis: 'Analyst assessment: serial-specific interfaces and matched-half fit constrain substitution. GE provides the OEM support route; BHEL evidence is historical manufacturing capability, not a current stocked spare.',
  impactBasis: 'Analyst procurement proxy: infrequent demand, but replacing a large custom half is a substantial capital purchase. This is separate from the severity of a pressure-boundary failure.',
  strategy: 'Strategic: arrange OEM/qualified casing engineering, retain dimensional records, evaluate qualified repair against a matched replacement, and agree acceptance and fit checks before ordering.',
  suppliers: ['GE Vernova — OEM 9E casing inquiry', 'BHEL — historical 9E assembly/machining capability; current supply scope unverified'],
  limitations: ['Exact wrapper alloy, original drawing, mating-half condition and current supplier availability were not established.', 'A machining or labor contract does not price a new wrapper.'],
  priceEvidence: `${quote} BHEL publishes assembly-labor scope only; its tender amounts are not wrapper values.`,
}, ['bhel', 'ge9e', 'maintenance']);

const barrel = record({
  family: 'discharge-diffuser-inner-barrel',
  title: 'Discharge diffuser and inner barrel',
  scope: 'The complete selected discharge passage, 12 modeled struts and inner barrel; excludes the external combustion wrapper.',
  cost: 4, criticality: 4, supplyRisk: 4, businessImpact: 4,
  costBasis: 'Analyst relative replacement score: a large fitted annular assembly with support and flow interfaces. BHEL documents discharge-casing machining and alignment, not an itemized inner-barrel price.',
  criticalityBasis: 'Analyst consequence assessment: distortion or cracking can disrupt support and gas-path clearances. GE GER-3620P identifies discharge struts and inner-barrel attachments as inspection targets.',
  riskBasis: 'Analyst assessment: geometry, alignment and attachment compatibility make this a specialist engineered order. A general repair capability does not prove a new PG9171E barrel is available.',
  impactBasis: 'Analyst procurement proxy: high custom replacement burden, despite low routine ordering frequency. No lifecycle purchase quantities are known.',
  strategy: 'Strategic: inspect the existing assembly early, obtain a drawing-specific repair/replacement proposal, and verify concentricity and interfaces as part of the outage plan.',
  suppliers: ['GE Vernova — OEM 9E discharge assembly inquiry', 'BHEL — documented discharge-assembly machining/alignment; new barrel supply unverified'],
  limitations: ['The selected mesh groups diffuser and barrel functions and is not a supplier bill of materials.', 'Exact inner-barrel revision, material, repairability and lead time remain unverified.'],
  priceEvidence: `${quote} Public casing work scopes do not establish a complete diffuser/barrel replacement price.`,
}, ['maintenance', 'bhel', 'ge9e']);

const combustor = record({
  family: 'dln1-combustor-hardware',
  title: 'DLN1 cover, fuel nozzles and flow sleeve',
  scope: 'One selected can: cover, sleeve, six primary fuel nozzles and one secondary nozzle, plus modeled fittings. Excludes its separately selected liner and transition.',
  cost: 3, criticality: 4, supplyRisk: 3, businessImpact: 4,
  costBasis: 'Analyst relative replacement score: multiple fabricated and precision fuel-metering items in one selection. Sulzer lists fuel nozzles and sleeves; MD&A documents 9E DLN1 flow matching.',
  criticalityBasis: 'Analyst consequence assessment: fuel maldistribution, leakage or unstable combustion can force a shutdown or damage the hot section; a replaceable nozzle is not operationally noncritical.',
  riskBasis: combustionRisk,
  impactBasis: combustionImpact,
  strategy: 'Strategic: compete qualified repair and new hardware on equivalent scope; preserve nozzle flow-match records, confirm the fuel/DLN revision, and plan a compatible spare set before disassembly.',
  suppliers: [...combustionSuppliers, 'MD&A — 9E DLN1 fuel-nozzle service capability only'],
  limitations: ['No supplier source confirms this entire grouped can as one purchasable item.', 'A LEC or other upgrade needs combustion-system qualification; it is not assumed interchangeable with one legacy DLN1 can.'],
  priceEvidence: bundlePrice,
}, ['parts', 'flow', 'doosan', 'ntpc', 'hanwha', 'iraq', 'maintenance']);

const liner = record({
  family: 'combustion-liner',
  title: 'Individual combustion liner',
  scope: 'One liner/cap assembly out of 14; excludes fuel-nozzle/cover hardware and the separately modeled transition.',
  cost: 3, criticality: 4, supplyRisk: 3, businessImpact: 4,
  costBasis: 'Analyst relative replacement score: formed superalloy sheet, cooling features, seals and coating. Sulzer specifies HASTELLOY X and internal thermal-barrier coating for its compatible liner.',
  criticalityBasis: 'Analyst consequence assessment: a failed hot wall or cooling feature can expose adjacent hardware and disturb turbine inlet temperature. Thin sheet does not imply low operational consequence.',
  riskBasis: combustionRisk,
  impactBasis: combustionImpact,
  strategy: 'Strategic: maintain a qualified exchange/repair set; compare new and repaired liners by remaining life, fit, cooling flow and coating acceptance, not only quoted price.',
  suppliers: combustionSuppliers,
  limitations: ['Sulzer describes a compatible replacement; installed DLN1 revision and condition are unknown.', 'Fourteen plotted dots are fourteen modeled liners, not fourteen independent supplier quotations.'],
  priceEvidence: bundlePrice,
}, ['combustion', 'ntpc', 'doosan', 'hanwha', 'iraq', 'maintenance']);

const transition = record({
  family: 'combustion-transition',
  title: 'Individual transition piece',
  scope: 'One hot-gas transition duct out of 14, with modeled sealing/support interfaces; excludes its liner and stage-1 nozzle set.',
  cost: 3, criticality: 4, supplyRisk: 3, businessImpact: 4,
  costBasis: 'Analyst relative replacement score: specialized formed duct and sealed interfaces. Sulzer identifies hot-pressed NIMONIC C263, internal thermal-barrier coating and inlet hardfacing for its replacement.',
  criticalityBasis: 'Analyst consequence assessment: cracking, loss of sealing or misalignment can expose surrounding hardware and disturb first-stage admission. Individual replaceability does not reduce that consequence.',
  riskBasis: combustionRisk,
  impactBasis: combustionImpact,
  strategy: 'Strategic: qualify repair and alternative manufacture against the exact transition revision; manage seals and supports together and compare repaired life with new-part lifecycle cost.',
  suppliers: combustionSuppliers,
  limitations: ['Compatibility must cover DLN/non-DLN length and the installed seal/support revision.', 'A customs shipment value or mixed refurbishment estimate is not a new transition-piece purchase price.'],
  priceEvidence: bundlePrice,
}, ['combustion', 'ntpc', 'doosan', 'hanwha', 'iraq', 'maintenance']);

const crossfire = record({
  family: 'crossfire-and-fuel-manifolds',
  title: 'Crossfire tubes and common fuel manifolds',
  scope: 'The complete grouped mesh: 14 crossfire links and outer sleeves plus common fuel-distribution piping. Not the price of one tube.',
  cost: 2, criticality: 4, supplyRisk: 3, businessImpact: 2,
  costBasis: 'Analyst relative replacement score: a smaller hardware/piping package than a capital airfoil or rotor set. Sulzer and WWGTP document crossfire supply, but neither prices this combined manifold group.',
  criticalityBasis: 'Analyst consequence assessment: crossfire supports ignition propagation and the fuel manifold serves all cans. Ignition failure or fuel leakage can stop operation despite modest procurement spend.',
  riskBasis: 'Analyst assessment: alternative tube suppliers exist, but fit, seals and fuel-manifold interfaces remain unit-specific. Public crossfire supply evidence does not establish complete manifold availability.',
  impactBasis: 'Analyst procurement proxy: lower expected spend share than rotor/airfoil packages, assessed without purchasing data. This low sourcing-axis score does not mean low operational or safety consequence.',
  strategy: 'Bottleneck: hold qualified tubes, retainers and seals; verify manifold drawing and leak-test requirements; prequalify an alternative before shortages and avoid speculative substitutions.',
  suppliers: ['GE Vernova — OEM 9E fuel/crossfire hardware inquiry', 'Sulzer — PG9171E-compatible crossfire tubes/retainers', 'WWGTP — supplied Frame 9E crossfire tubes; manifold capability unverified'],
  limitations: ['Crossfire and external fuel piping are distinct purchases grouped by the model.', 'Manifold metallurgy, test specification, price and vendor qualification are unresolved; cost/impact scores have low confidence.'],
  priceEvidence: `${quote} Crossfire product listings contain no verified price for all links plus the common fuel manifolds.`,
}, ['parts', 'crossfire', 'ge9e', 'maintenance']);

const wheelDetails = {
  1: 'Sulzer describes cooled EEQ-111 investment-cast first-stage buckets with external/internal coatings and optional TBC.',
  2: 'Sulzer describes cooled EEQ-111 second-stage buckets; coating and tip-shroud/knife-edge compatibility matter.',
  3: 'Sulzer describes IN738LC third-stage buckets with optional cutter teeth; this model represents the row as uncooled.',
};
const wheels = Object.fromEntries([1, 2, 3].map(stage => [stage, record({
  family: `turbine-wheel-stage-${stage}`,
  title: `Stage ${stage} wheel and 92 buckets`,
  scope: `One stage-${stage} wheel/hub plus all 92 modeled buckets and attachment hardware; not one bucket and not the complete three-stage turbine rotor.`,
  cost: 5, criticality: 5, supplyRisk: 5, businessImpact: 5,
  costBasis: `Analyst relative replacement score: a precision wheel plus a full airfoil row. ${wheelDetails[stage]} A bucket-kit quotation alone cannot value this assembly.`,
  criticalityBasis: 'Analyst consequence assessment: rotating structural failure can damage the machine and end generation. PPC documents cracked rotor-disk incidents on actual PG9171E units; the severity is independent of blade cooling complexity.',
  riskBasis: 'Analyst assessment: wheel life history, material certification, attachment fit and rotor balance constrain substitution. GE and EthosEnergy offer rotor routes; Sulzer/Hanwha bucket supply does not prove wheel interchangeability.',
  impactBasis: 'Analyst procurement proxy: a complete precision wheel and 92-airfoil set sits among the largest individual capital scopes in this viewer. Actual spend and lost-generation economics are not supplied.',
  strategy: `Strategic: agree a rotor life/repair/exchange plan with qualified specialists; tender the wheel and stage-${stage} bucket set as explicit scopes, preserving life records, balancing and attachment acceptance.`,
  suppliers: ['GE Vernova — OEM rotor and bucket options', 'EthosEnergy — Frame 9E rotor life-extension/replacement capability', 'Sulzer — PG9171E bucket kits; wheel supply not established', 'Hanwha Power — 9E bucket sets and rotor services; exact wheel supply requires confirmation', 'Doosan Turbomachinery Services — MS9001E bucket repair'],
  limitations: ['No blade-only, bucket-kit or full-unit-rotor price is treated as the price of this grouped selection.', `Stage ${stage} replacement material/geometry may differ by installed upgrade; the mesh is not an approved rotor drawing.`],
  priceEvidence: `${quote} GE publishes qualitative rotor-cost tiers only. PPC has a project specification, and Iraq has bucket refurbishment in a mixed package; neither prices this wheel-plus-92-bucket scope.`,
}, ['buckets', 'rotor', 'ppc', 'ethos', 'hanwha', 'doosan', 'iraq'])]));

const nozzleDetails = {
  1: ['18 two-vane segments / 36 modeled vanes', 'Sulzer specifies FSX-414, impingement/film cooling and optional TBC.', 4],
  2: ['16 three-vane segments / 48 modeled vanes', 'Sulzer specifies EEQ-222, internal cooling and aluminide coating; its brush seal is a replacement option.', 3],
  3: ['16 four-vane segments / 64 modeled vanes', 'Sulzer specifies EEQ-222 and no standard protective coating for its third-stage replacement.', 3],
};
const nozzles = Object.fromEntries([1, 2, 3].map(stage => {
  const [scope, detail, risk] = nozzleDetails[stage];
  return [stage, record({
    family: `turbine-nozzle-stage-${stage}`,
    title: `Stage ${stage} stationary nozzle set`,
    scope: `One complete stage-${stage} stationary row: ${scope}; not one vane or casting segment. Excludes the rotating wheel and separate casing shrouds.`,
    cost: 4, criticality: 4, supplyRisk: risk, businessImpact: 4,
    costBasis: `Analyst relative replacement score for the complete cast-segment set. ${detail} Full-row quantity and specialist finishing drive the assessment.`,
    criticalityBasis: `Analyst consequence assessment: stage-${stage} nozzle damage can distort gas admission, reduce performance and release material into downstream hardware. Being stationary does not make the set noncritical.`,
    riskBasis: stage === 1
      ? 'Analyst assessment: first-stage thermal exposure, cooling and compatible segment fit merit higher qualification scrutiny. Sulzer/Hanwha supply and Doosan repair provide alternatives, but no interchangeable stock position is verified.'
      : 'Analyst assessment: Sulzer/Hanwha offer stage-specific sets and Doosan offers repair. Alloy, segment geometry, seals and adjacent-part compatibility still prevent treating these as commodity castings.',
    impactBasis: 'Analyst procurement proxy: a complete capital nozzle set with recurring repair/replacement decisions has high purchasing significance. It is not a measured share of site profit or annual spend.',
    strategy: `Strategic: compare a qualified repaired stage-${stage} set with new alternatives, confirm set-wise compatibility and remaining repair life, and reserve the needed set before the outage.`,
    suppliers: ['GE Vernova — OEM 9E nozzle inquiry', 'Sulzer — PG9171E-compatible nozzle kits', 'Hanwha Power — 9E stage-specific nozzle sets', 'Doosan Turbomachinery Services — MS9001E nozzle repair'],
    limitations: ['Segment counts follow this model; the plant drawing and installed revision determine the order quantity.', 'Supplier alloy/finish details describe replacement designs and do not prove the original turbine configuration.'],
    priceEvidence: bundlePrice,
  }, ['nozzles', 'hanwha', 'doosan', 'iraq', 'maintenance'])];
}));

const spacers = record({
  family: 'turbine-spacers-and-studs',
  title: 'Two wheel spacers and 12 through-studs',
  scope: 'Both modeled spacers, all 12 through-studs and end nuts as one selected group. Not a standard fastener pack.',
  cost: 3, criticality: 5, supplyRisk: 4, businessImpact: 3,
  costBasis: 'Analyst relative replacement score: precision rotor interfaces and controlled bolting add procurement burden beyond raw steel or commercial studs. GE describes specialized rotor bolting; PPC treats turbine tie rods as a separate procurement.',
  criticalityBasis: 'Analyst consequence assessment: the spacers and clamping system preserve the rotating stack. Loss of fit or preload can compromise rotor integrity even when their purchase cost is below the bucket assemblies.',
  riskBasis: 'Analyst assessment: exact material, dimensional traceability and preload method constrain replacement. PPC requires documented tie-rod elongation and assembled-rotor balancing; a generic bolt supplier is not an equivalent source.',
  impactBasis: 'Analyst procurement proxy: lower material scope than a bladed wheel, but specialist replacement and rotor-shop integration give it material purchasing significance. Criticality is assessed separately.',
  strategy: 'Strategic: purchase a traceable rotor-specific spacer/bolting scope through a qualified rotor specialist, retain assembly records and coordinate replacement with rotor inspection and balance.',
  suppliers: ['GE Vernova — OEM rotor and bolting capability', 'EthosEnergy — Frame 9E rotor program; exact spacer/stud supply must be confirmed'],
  limitations: ['The 12-stud count is from the reconstruction, not a universally applicable 9E procurement specification.', 'No exact spacer price, alloy or interchangeability evidence was found.'],
  priceEvidence: `${quote} PPC identifies a turbine tie-rod set but does not publish a priced line for this two-spacer/12-stud group.`,
}, ['rotor', 'ppc', 'ethos']);

const shell = record({
  family: 'turbine-shell-and-shrouds',
  title: 'Turbine shell half and stationary shrouds',
  scope: 'One upper or lower structural shell half plus its modeled stage 1–3 stationary shroud blocks; excludes separate nozzle rows and rotating bucket tip shrouds.',
  cost: 4, criticality: 5, supplyRisk: 4, businessImpact: 4,
  costBasis: 'Analyst relative replacement score: large precision casing plus multiple shroud blocks. BHEL documents shell machining/alignment; Sulzer documents separate coated/honeycomb replacement shrouds.',
  criticalityBasis: 'Analyst consequence assessment: structural distortion or failed shroud retention can compromise gas-path clearance and cause contact or debris damage. GE identifies shell hooks and shroud interfaces for inspection.',
  riskBasis: 'Analyst assessment: matched casing geometry and clearance control limit substitution. Competitive shroud supply is documented, but it does not establish an interchangeable complete shell half.',
  impactBasis: 'Analyst procurement proxy: a custom casing half plus staged shrouds is a high-value capital scope, even though casing renewal is infrequent. No actual procurement spend was supplied.',
  strategy: 'Strategic: separate shell repair/replacement from shroud-set sourcing in the RFQ, preserve matched-half and clearance records, and compare qualified refurbishment with new components.',
  suppliers: ['GE Vernova — OEM 9E shell/shroud inquiry', 'BHEL — historical shell machining/alignment capability', 'Sulzer — compatible shroud blocks; complete shell supply not established', 'Doosan Turbomachinery Services — MS9001E shroud repair'],
  limitations: ['Shroud coating or flange-hardware prices cannot value a structural shell half.', 'The model groups structurally different parts; shell material, fit and actual shroud quantities require the plant drawings.'],
  priceEvidence: `${quote} DEWA 2012403939 is an unpriced shell-flange-hardware RFQ. BHEL labor and Iraq shroud-refurbishment scopes do not price this combined replacement.`,
}, ['bhel', 'shrouds', 'maintenance', 'ge9e', 'doosan', 'dewa', 'iraq']);

export function hotSectionSupply(part) {
  const id = part?.id;
  if (typeof id !== 'string') return null;
  if (/^combustion-wrapper-(upper|lower)$/.test(id)) return wrapper;
  if (id === 'compressor-discharge-inner-barrel') return barrel;
  if (/^combustor-(?:[1-9]|1[0-4])$/.test(id)) return combustor;
  if (/^combustor-liner-(?:[1-9]|1[0-4])$/.test(id)) return liner;
  if (/^transition-(?:[1-9]|1[0-4])$/.test(id)) return transition;
  if (id === 'combustor-crossfire-manifolds') return crossfire;
  const wheel = /^turbine-wheel-([1-3])$/.exec(id);
  if (wheel) return wheels[Number(wheel[1])];
  const nozzle = /^turbine-nozzle-([1-3])$/.exec(id);
  if (nozzle) return nozzles[Number(nozzle[1])];
  if (id === 'turbine-spacers-studs') return spacers;
  if (/^turbine-shell-(upper|lower)$/.test(id)) return shell;
  return null;
}

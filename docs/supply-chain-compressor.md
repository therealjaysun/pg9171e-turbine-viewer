# Inlet and compressor supply-chain research

Research date: 2026-10-06. Scope: GE Frame 9E / PG9171E educational reconstruction. Implementation: `src/supply-chain/research-compressor.js`, export `compressorSupply(part)`. Shared definitions: [supply-chain method](supply-chain-method.md).

This research separates what a manufacturer or buyer published from an analyst's ranking. It is neither an as-built bill of materials nor a procurement quotation. Published capabilities identify candidates to investigate, not approved suppliers for this serial-numbered machine.

## Coverage and scoring unit

The module maps 46 selectable components: 17 rotor rows, 17 stator rows, one two-row EGV selection, the stub-shaft/tie-bolt group, six compressor casing halves, two inlet casing halves, the 64-vane IGV set, and one actuator/linkage selection. Invalid IDs, rows outside 1–17, and absent IDs return `null`.

| Selection | Cost | Operational criticality | Supply risk | Business impact | Assessment unit |
| --- | ---: | ---: | ---: | ---: | --- |
| Rotor stages 1–17 | 4 | 5 | 4 | 5 | One wheel plus its complete blade row |
| Stator stages 1–17 | 3 | 4 | 3 | 4 | One stationary row and shown support features |
| EGV 1 & 2 | 4 | 4 | 4 | 4 | Both exit rows and displayed supports |
| Stub shafts / tie bolts | 5 | 5 | 5 | 5 | Two shaft assemblies and sixteen tie bolts |
| IGV set | 4 | 4 | 3 | 4 | All 64 vanes, rings/gearing and shown supports |
| IGV actuator / linkage | 3 | 4 | 3 | 4 | One configured control actuator, not a plain cylinder |
| Inlet casing upper / lower | 4 | 4 | 4 | 4 | One structural casing half |
| Forward casing upper / lower | 4 | 4 | 4 | 4 | One structural casing half |
| Aft casing upper / lower | 4 | 4 | 4 | 4 | One structural casing half |
| Discharge casing upper / lower | 5 | 5 | 4 | 5 | One large discharge half and modeled integral interfaces |

Cost is an ordinal replacement-scope index: 1 low specialized content, 2 modest, 3 substantial specialized fabrication/machining, 4 high precision or large set, 5 very high major-assembly content. It is not a dollar range and cannot be added or multiplied into one. The basis is hardware scope, production/qualification work and fit requirements, without embedding an assumed outage loss into the cost score.

Criticality assesses the consequence of functional/structural failure, not its frequency: 1–2 genuinely limited operational consequence; 3 a material local effect; 4 unit-availability/performance consequence; 5 major rotating/structural consequence. These are engineering judgments, not quantified failure modes and effects analysis.

Supply risk considers qualification difficulty, documented alternatives and interchangeability; 3 marks the high side of the displayed Kraljic division. A list of aftermarket firms does not prove that each can deliver an approved finished part. Business impact combines replacement scope and plausible restoration burden as a provisional proxy for profit impact. It does not substitute for measured annual spend, revenue at risk or plant margins. Its high side also starts at 3.

Consequently these selections are provisionally **strategic** in Kraljic: high business impact and meaningful supply constraints. No selected inlet/compressor component is credibly classified as expensive and operationally noncritical. The model concentrates on functional internal hardware. Forcing a low-criticality or leverage result would confuse easy sourcing with harmless failure.

Stage 1 and 17 wheels are integral with stub shafts in the model. The separate selection groups overlap physical scope. Casing halves may require matched machining. These visual groups must not be summed as independent purchased items. Repeated stages share family evidence: public sources do not justify seventeen different prices or failure probabilities.

## Claim-to-source ledger

| Source | Verified claim used | Evidence limit / use in rating |
| --- | --- | --- |
| [GE Vernova, 9E Advanced Compressor](https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-advanced-compressor) | Direct 9E offering covers compressor airfoils, IGVs, stage-1 stator rings and aft-stub improvements. Installation involves major-inspection access. | Reliability and service context; no component quote. Published installation duration is not a manufacturing lead time. |
| [GE Vernova, Rotor Life Management](https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension) | Rotor forging, bolting, wheel assembly, inspection and 9E service options are documented. | Supports specialist qualification/major-assembly analysis. Current material examples are not assigned to the reconstruction. Whole-rotor dollar-symbol tiers cannot be decomposed into wheel or bolt prices. |
| [GE GER-3620P, PDF pp. 26, 30–31](https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/ger-3620p-heavy-duty-gas-turbine-operating-and-maintenance-considerations.pdf#page=26) | Inspection scope includes compressor blades, case condition/clearances, IGV mechanisms and calibration, and discharge structures. | OEM fleet source corroborates relevance of condition and alignment; scores and financial consequences remain analyst inference. |
| [Corrtech Energy, Manufacturing](https://www.corrtechenergy.com/manufacturing) | Lists Frame 3–9 rotor/stator blade kits, ring segments, IGVs and rotor spacers. | A real manufacturing alternative to investigate. Does not establish wheel manufacture, current stock, a complete EGV assembly or serial-specific approval. |
| [C*Blade](https://www.cblade.it/), Gas Turbine Compressor Blades, gallery and process sections | Documents compressor airfoil manufacture, front-stage focus and vane/IGV geometries. | General capability and production-complexity evidence; no verified 9E contract. |
| [Hanwha Power / PSM, Rotor Services](https://www.psm.com/services/rotor-services) | Explicit 9E coverage with rotor disassembly, inspection, repair, assembly and balance services. | Candidate service route. Own-design blading is explicitly associated with selected F-class frames, not assumed to cover the 9E. |
| [EthosEnergy, Heavy Duty Gas Turbines](https://ethosenergy.com/services/heavy-duty-gas-turbines) | Names 9E fleet support and rotor services/manufacturing categories. | Additional service candidate, without assuming all new 9E shaft/disc part numbers are available. Marketing superlatives and interchangeability claims are not treated as independent certification. |
| [GE GEA35266, IGV Rack & Control Rings](https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/services/outage-services/IGV-Rack-and-Control-Rings-Fact-Sheet-GEA35266-July-2023.pdf) | Includes 9E, explains backlash/wear-related cracking, and recommends rack/control-ring safety stock. | Direct support for IGV criticality and stocking strategy; no stock level, cost or promised delivery inferred. |
| [DEWA RFQ 2012504159](https://www.dewa.gov.ae/api/RfxDownload/Get/2012504159), 20 Aug 2025 | Official 9E IGV washers/bushings procurement requests matching GE part numbers and certified documents. | Demonstrates part identity and documentation constraints. Price fields are empty and hardware quantities are not the vane count. |
| [Woodward 26346K](https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26346_K.pdf#page=9), pp. 9, 41–43 | Direct 9E actuator family; position control, closure function, electrohydraulic/feedback content and support routes. | Supports treating the unit as configured controls hardware. Service exchange is conditional on availability; installed make and current prices remain unverified. |
| [BHEL NIT 6913](https://www.bhel.com/sites/default/files/HB160-GT-CORRIGENDUM-NIT_6913.pdf), clause 7 | Names Frame-9E inlet casing drawings and upper/lower castings; describes joint/bore machining. | Official search-indexed source text was reviewed, but live PDF fetch timed out. This is a machine proveout specification, not a casing sale. Material applies to its named drawing. |
| [BHEL NIT 6912](https://www.bhel.com/sites/default/files/HB200-GT-CORRIGENDUM-NIT_6912.pdf#page=19), PDF p. 19 | Names Frame-9E discharge-casing upper/lower castings and relevant machining operations. | Full PDF inspected. Manufacturing benchmark for discharge; only adjacent-family analogue for forward/aft cases. No claim every half shares this drawing or material. |
| [BHEL R9AYS00056](https://docs.primetenders.com/documents/tender/2025/11/15/9396218891274449979/TechnocommercialbidR9AYS00056.pdf), 12 Nov 2025, annexure A | Explicit 9E S17/EGV ring finish-machining job, with runout inspection and job material supplied by BHEL. | Primary BHEL-authored document on a third-party mirror, labeled as such. Subcontract work is not finished new-part acquisition; requested time is not end-to-end delivery. |
| [GE GER-3928C](https://studylib.net/doc/28021204/ger-3928c-uprate-options-ms9001-heavy-duty-gas-turbine), printed p. 8 | MS9001E exit-vane stall distress and S17/EGV shrouded redesign are discussed. | GE-authored 2008 paper read through an explicitly labeled mirror; both checked official PDF paths redirect to the resource index. Supports failure-mode context without claiming this unit's upgrade status. |
| [PPC / Lavrion, aft-stub-shaft specification](https://eprocurement.dei.gr/media/12066/d_903070.pdf) | Exact PG9171E procurement permits non-OEM manufacture with documented engineering and material/inspection controls; excludes S17 blades. | Official search-indexed text reviewed; live PDF fetch failed. Confirms a qualification-intensive competitive route, not sole sourcing or a complete rotor-group price. |
| [BHEL May 2014 award register](https://tenders.bhel.com/sites/default/files/MAY_.pdf#page=37), p. 37 | A historical EGV-2 manufacturing award exists, contract R914K00033. | Public value is real, but frame, quantity and material scope are missing. It is explicitly excluded as a replacement-price observation. |

## Price search and rejected comparisons

Searches covered OEM/supplier parts pages, `9E compressor rotor price`, `9E IGV cost`, `Frame 9E compressor contract blades`, DEWA procurement, BHEL awards, NTPC tenders and DERC filings. No current applicable finished-part quotation was verified for any of the 46 selections. Therefore every record says **Quote required** and exposes the limits of its relative score.

- PPC's exact PG9171E shaft specification excludes the seventeenth-stage blades and concerns one aft shaft. It cannot price both stub shafts, sixteen tie bolts and other shown hardware.
- DEWA's official 2025 IGV procurement is an unpriced RFQ, not an awarded order. Its per-piece bushings/washers cannot value 64 vanes and the actuation ring.
- [DEWA RFQ 2012504015](https://www.dewa.gov.ae/api/RfxDownload/Get/2012504015) specifies an eighteen-piece compressor-to-turbine marriage-coupling stud set. It is neither priced nor the sixteen axial compressor tie bolts in the model.
- BHEL May 2014 p. 37 records INR 192,970 for EGV-2 manufacturing, but does not state frame, quantity or material inclusion. [BHEL November 2016 p. 42](https://tenders.bhel.com/sites/default/files/November.pdf#page=42) contains other small vane-related award values without sufficient procurement-unit detail. No value was converted, inflated or presented as a new 9E assembly cost.
- BHEL's 2025 machining tender explicitly uses free-issued material. Its example shows why a machining contract value, even with a relevant component name, can omit most finished-part content.
- Third-party customs listings mix repair/re-import, whole blade kits and declared shipment values. Marketplace listings included pre-owned full rotors with negotiable prices and even inconsistent 9E/9F descriptions. They were excluded from quantitative cost estimation and supplier qualification.
- A search result headed as GE spare-part prices actually describes an Atlas Copco SCF-6 auxiliary compressor quotation from 2008. It is unrelated to this main axial compressor and excluded.
- DERC search results concerned bundled spares/planning; the retrieved large PDF could not be inspected completely and no line-price inference was made. Broad multicontract service announcements also cannot price a particular row.

## Procurement conclusions

A practical next step is a structured RFQ per actual part number and replacement unit, separating new, repaired and exchange options; material inclusion; documentation; warranty; transport; field installation; and balance/calibration work. This is a recommended future procurement step, not a claim that suppliers have already been contacted.

Rotor rows and the shaft group merit planned partner capacity and traceable life-history review. Vane rows have visible alternative manufacturing routes, allowing competition among qualified candidates, while their operational consequence remains substantial. The IGV mechanism has an unusually concrete OEM stocking recommendation. The actuator has a documented service network and exchange option, but compatibility checks remain essential. Casings require unit-matched drawings and geometry; adjacent-case examples do not establish easy substitutability.

Actual annual spend, outage margin, spare inventory and approved alternates could move these Kraljic positions. The current source base supports provisional strategic treatment and no expensive/noncritical finding, rather than unsupported certainty about prices or purchasing leverage.

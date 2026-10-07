# Combustion and turbine supply-chain research

Researched **2026-10-06** for the three-stage PG9171E / Frame 9E reconstruction.
This ledger supports `src/supply-chain/research-hot-section.js`. It covers 55
selectable IDs in 14 assessment records when individual turbine stages are counted
separately. Repeated cans share evidence, not independent price quotations.
Exhaust components are covered by the mechanics research.

## What the scores mean

All four scores are **analyst assessments on a 1–5 ordinal scale**, not published
supplier ratings. No applicable new-replacement price was verified for a complete
selected assembly. The cost field therefore says **Quote required** and uses a
relative replacement-cost score, with no conversion to currency or implied ratio.

- **Cost** compares the hardware procurement burden of one complete clickable
  selection. It excludes installation labor, transport, duties, downtime and fuel.
  A bucket price is not a 92-bucket-and-wheel price; a shroud coating price is not
  a shell-half price. Scores cannot be summed into a turbine budget.
- **Operational criticality** concerns the consequence of a failed component.
  Scores 1–2 mean genuinely low operational consequences; all components researched
  here score 4 or 5. That reflects their function and credible failure modes, not
  a numerical reliability calculation or certified FMEA.
- **Supply risk** considers specialist manufacture, traceability, fit, revision
  compatibility and qualified alternatives. Multiple advertised vendors do not
  automatically make a part easy to substitute.
- **Profit / business impact** is a procurement proxy for capital scope and
  plausible recurring family spend. It is separate from operational criticality.
  No plant spend ledger, failure probabilities, generation margin, inventory or
  supplier performance data was supplied. Repeated combustion-family demand is
  considered here, while the cost score remains per selected assembly.

For the application's Kraljic view, scores 1–2 are the low side and 3–5 the high
side. These research records support sourcing discussions, not autonomous purchase
orders or a claim that a named supplier is approved for this plant.

## Component assessments and evidence mapping

Scores below are **cost / operational criticality / supply risk / procurement
business impact**. Sources are linked in the ledger below. Numbers and scope in
the selection column come from `src/model/hot-section.js`, not a procurement BOM.

| Selectable family | Exact costed scope and scores | Evidence, reasoning and sourcing treatment |
| --- | --- | --- |
| `combustion-wrapper-upper/lower` (2 IDs) | One pressure-wrapper half; **4 / 5 / 4 / 4** | BHEL's Frame 9E-inclusive work establishes large wrapper machining/handling. GE provides the OEM support route. Assessment: large custom interfaces and pressure containment justify high cost, fit risk and consequence. Seek qualified casing repair or a matched replacement. Original alloy and present vendor availability remain unknown. |
| `compressor-discharge-inner-barrel` | Selected diffuser, inner barrel and 12 struts; **4 / 4 / 4 / 4** | GE GER-3620P identifies discharge-strut and barrel inspection; BHEL establishes discharge-assembly alignment work. Assessment: support/clearance consequences and custom interfaces justify specialist sourcing. Evidence is not a new-barrel quotation or serial-specific geometry. |
| `combustor-1…14` (14 IDs) | Cover, sleeve, six primary nozzles, secondary nozzle and fittings for **one** can; excludes separately selected liner/transition; **3 / 4 / 3 / 4** | Sulzer identifies the combustion-hardware supply families; MD&A describes 9E DLN1 nozzle flow matching; Doosan lists DLN1 repair. Assessment: fuel-system performance and 14-can recurring demand justify strategic treatment. Hanwha combustion upgrades require system qualification rather than presumed single-can interchangeability. |
| `combustor-liner-1…14` (14 IDs) | One liner/cap assembly; **3 / 4 / 3 / 4** | Sulzer's replacement uses formed HASTELLOY X and internal thermal-barrier coating. NTPC procurement demonstrates that relevant operating experience and plant-specific refurbishment technology matter. Assessment: critical hot-wall service with qualified repair/new alternatives. Evaluate an exchange set and remaining repair life. |
| `transition-1…14` (14 IDs) | One transition duct and its represented interfaces; **3 / 4 / 3 / 4** | Sulzer documents hot-pressed C263, coating and wear treatment. Assessment: hot-gas routing and mating interfaces justify consequence 4; per-piece cost is below complete airfoil/rotor sets, but repeated family demand matters. Confirm combustion revision, seals and supports. |
| `combustor-crossfire-manifolds` | All 14 links/sleeves **and** common fuel piping; **2 / 4 / 3 / 2** | Sulzer and WWGTP support crossfire sourcing, not complete manifold supply. Assessment: lower procurement-spend proxy but significant ignition/fuel-leak consequence. **Bottleneck** treatment: qualified spare tubes/seals and an established manifold repair/supply route. Cost and impact confidence are lower because the model groups distinct products. |
| `turbine-wheel-1` | One wheel plus 92 stage-1 buckets; **5 / 5 / 5 / 5** | Sulzer's bucket reference describes cooled EEQ-111 with coating options. GE rotor services and the PPC specification establish a different engineering scope for the wheel. Assessment: rotor integrity and full-row procurement dominate; blade-only prices cannot value this group. |
| `turbine-wheel-2` | One wheel plus 92 stage-2 buckets; **5 / 5 / 5 / 5** | Sulzer identifies cooled second-stage buckets with coating and tip/knife-edge variants. Assessment: matching the stage, shroud system and rotor interfaces matters even when the score matches stage 1. Preserve balancing and life records. |
| `turbine-wheel-3` | One wheel plus 92 stage-3 buckets; **5 / 5 / 5 / 5** | Sulzer identifies IN738LC buckets; this model represents an uncooled row. Assessment: simpler bucket cooling does not turn a complete rotating assembly into a low-cost or low-consequence purchase. Verify legacy versus advanced-aero revision. |
| `turbine-nozzle-1` | Full ring: 18 two-vane segments / 36 modeled vanes; **4 / 4 / 4 / 4** | Sulzer: FSX-414, cooling and optional TBC. Hanwha offers stage-specific alternatives. Assessment: first-stage thermal exposure and compatible cooling/fit warrant higher supply-risk scrutiny. Tender an accepted complete set, with repairability reviewed. |
| `turbine-nozzle-2` | Full ring: 16 three-vane segments / 48 modeled vanes; **4 / 4 / 3 / 4** | Sulzer: EEQ-222, cooling and aluminide; replacement brush-seal option. Assessment: competitive manufacture/repair exists, but seal and adjacent-stage compatibility still constrain substitution. The set cost is not a one-segment cost. |
| `turbine-nozzle-3` | Full ring: 16 four-vane segments / 64 modeled vanes; **4 / 4 / 3 / 4** | Sulzer: EEQ-222 without its standard protective coating. Assessment: a full precision cast row remains a capital purchase. Do not infer low consequence from the absence of a coating or assume an upgraded geometry is individually interchangeable. |
| `turbine-spacers-studs` | Both spacers, 12 through-studs and nuts; **3 / 5 / 4 / 3** | GE describes specialized rotor bolting; PPC explicitly procures turbine tie rods. Assessment: high structural consequence with a smaller hardware scope than the bladed wheels. This is rotor-specific hardware, not commodity studs. |
| `turbine-shell-upper/lower` (2 IDs) | One structural shell half plus its stage 1–3 stationary shrouds; **4 / 5 / 4 / 4** | BHEL establishes shell machining/alignment; Sulzer establishes a distinct shroud replacement market. Assessment: shell fit/retention and clearances dominate the grouped selection. Obtain separate shell and shroud line items, preserving their different specifications. |

The 14 records are predominantly **Strategic**: specialist parts with substantial
capital or recurring procurement significance. The grouped crossfire/manifold
selection is **Bottleneck**, because the procurement-impact estimate is lower
while compatibility risk remains elevated. Its operational criticality is still
4. None is assessed as an expensive, operationally noncritical opportunity
(`cost >= 4` and `criticality <= 2`). That is a result of this model's scope;
ordinary plant supplies and administrative purchases are largely absent.

There are credible **cost-reduction investigations** despite that result:
qualified refurbishment versus new parts; repaired spare-set exchange; competition
among compatible manufacturers; and separating grouped shell/shroud or
wheel/bucket scopes in an RFQ. They should be evaluated using actual quotations,
remaining life and outage requirements. No savings percentage is established here.

## Public price investigation

The search covered OEM and manufacturer catalogs, exact-frame tenders, buyer RFQs,
repair awards, and potential historical transaction leads. The following outcomes
explain why the UI does not manufacture dollar prices:

| Evidence searched/read | Result and permitted interpretation |
| --- | --- |
| Sulzer's five exact-PG9171E brochures; GE 9E parts and rotor pages; Hanwha 9E; Doosan repair pages | Product/capability evidence without applicable priced hardware lines. GE's rotor options use qualitative cost symbols; they are not currency ranges and cannot calibrate a wheel-and-bucket purchase. |
| [Iraqi Ministry of Electricity, tender E3G-010](https://www.iraqiembassy.us/sites/default/files/documents/Binder1_9.pdf#page=50), advertisement October 2018, printed p. 48 / PDF index 49 | **USD 761,560 estimated total**, not an award. Mixed refurbishment includes multiple sets of cap/liners, transitions, fuel-oil nozzles, stage 1–3 nozzle and blade kits, a stage-1 shroud kit and a flow-sleeve set. It includes restoration/replacement of missing or unrepairable items and consumables. No component-level allocation; no new-part price. Scope differs from the modeled DLN1 can. The specified project delivery period is not a general market lead time. |
| [Wood Group primary announcement, 1 July 2008](https://media.corporate-ir.net/media_files/irol/13/138840/press/edison010708.pdf) | Approximately **USD 3 million across three repair contracts**: 9E hot-path work at six Edison sites, Frame 9 DLN nozzle work, and LM2500/LM6000 accessory/nozzle work. It mixes machines and service scopes, so no number is assigned to a model part. |
| [NTPC tender 9900183708, 22 October 2019](https://ntpctender.ntpc.co.in/uploads/job_30386.html) | PG9171E combustion refurbishment scope with supplier qualification. Monetary figures on the notice are eligibility thresholds, tender fee and bid security; none is a part quotation or an award. |
| [NTPC historical stage 1/2 bucket RLA/refurbishment notice](https://ntpctender.ntpc.co.in/uploads/job_15933.html) | Search-indexed scope found; direct page extraction failed. No price used. |
| [PPC POPD-903231 rotor tender](https://eprocurement.dei.gr/media/18510/dplp-903231-teliko.pdf) | Exact PG9171E rotor project, with blank offer forms and detailed technical work. Insurance values, guarantees and project deadlines are not component prices. It does not separately price each selected bladed wheel. The specification refers to support through the end of 2024, so it is historical, despite recent search indexing. |
| [DEWA RFQ 2012403939, 26 August 2024](https://www.dewa.gov.ae/api/RfxDownload/Get/2012403939) | 9E turbine-shell flange hardware, documentation requirements, blank price columns. Does not establish shell or shroud cost. |
| [BPDB Chandpur capital-spares repair tender](https://misc.bpdb.gov.bd/storage/tender/tender_20783_1.pdf) | Primary search index identifies PG9171E fuel nozzles, liners, transitions, nozzles and shrouds. Full extraction failed; no pricing claim depends on it. |
| BHEL R9AZS00039 / 2026_BHEL_64119_1 | An aggregator reports a 2026 financial bid for coating 48 stage-1 shrouds. Searches on BHEL and its official procurement portal did not retrieve the primary award/bid. The amount is excluded; in any event coating supplied shrouds would not price a shell replacement. |
| Customs aggregators and an uploaded Engro Qadirpur valuation | These search leads contain apparent transition/bucket/nozzle values. Condition, shipment versus repair value and authentication were unresolved; the uploaded valuation describes present-market accounting estimates, not current new purchase prices. None is used to assign cost. |

Representative search strings included `9E buckets USD`, `9E transition pieces
price`, `9E combustion liner cost tender`, `9E nozzle estimated cost tender`,
`9E turbine rotor million contract`, `PG9171E hot gas path parts cost repair price`,
and exact tender references. This is a documented unsuccessful unit-price search,
not a claim that suppliers never publish or provide prices.

## Primary source ledger

Each reference object in the module carries the applicable scope boundary.

| Source | Claim supported and location |
| --- | --- |
| [GE Vernova, 9E product/parts page](https://www.gevernova.com/gas-power/products/gas-turbines/9e) | OEM service/parts access. Current 9E.04 is a different four-stage configuration; its upgrade specification is not assigned to this legacy three-stage model. |
| [GE Vernova GER-3620P, 2021](https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/ger-3620p-heavy-duty-gas-turbine-operating-and-maintenance-considerations.pdf) | Printed casing section around pp. 15–16 and maintenance/parts-planning sections around pp. 21–28: structural interfaces, inspection priorities and need for outage spares. General heavy-duty family guidance, with many 7E illustrations, not a serial-specific 9E manual. |
| [GE Vernova rotor life management](https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension) | Rotor condition assessment and alternative repair/exchange programs, including the 9E; specialized wheel and bolting capability. |
| [Sulzer E10257, December 2019](https://www.sulzer.com/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentnewpartsmanufacturing_en_e10257_5_2014_web.pdf?la=en) | PG9171E-compatible combustion and capital-part families; specialized fit/tooling. No promise of availability or approval for this plant. |
| [Sulzer E10256, January 2020](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentcombustioncomponents_en_e10256_5_2014_web.pdf) | Replacement liner and transition manufacturing/material/surface differences. Used to assess procurement complexity, not infer this unit's original BOM. |
| [Sulzer E10255, December 2019](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentbuckets_en_e10255_5_2014_web.pdf) | Stage-specific bucket kit characteristics; this brochure provides no forged-wheel supply or price evidence. Stage-1 TBC remains optional per its table. |
| [Sulzer E10258, December 2019](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentnozzles_en_e10258_5_2014_web.pdf) | Nozzle segment groupings, materials and finish differences. The complete modeled row quantities are from the application, not inferred supplier order quantities. |
| [Sulzer E10259, December 2019](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentshroudblocks_en_e10259_5_2014_web.pdf) | Separate stage-1 abradable and stage-2/3 honeycomb shroud products. These are not the structural casing. |
| [BHEL HY/GT/AGM/OT-01/2012-13](https://www.bhel.com/sites/default/files/unskilled%20operations%20in%20GT%20areas%20for%202012-13.pdf#page=33) | PDF indices 32–33: Frame 9E-inclusive wrapper, discharge casing and shell handling, machining support and alignment. The tender is for labor/support work. |
| [PPC POPD-903231](https://eprocurement.dei.gr/media/18510/dplp-903231-teliko.pdf#page=52) | Technical specification pp. 1–6: documented PG9171E rotor incidents, traceable spare manufacture, turbine tie rods and reassembly/balancing. It supports specialist qualification, not applying this project's acceptance limits to other units. |
| [Doosan, Frame 9 services](https://www.doosanturbo.com/engines/ge-frame-9/) | Supplier's MS9001E/DLN1 repair list, including combustion hardware and all three bucket/nozzle/shroud stages. No new-part supply claim is inferred. |
| [Hanwha Power / PSM, 9E solutions](https://www.psm.com/products/b-e-class-frames/9e) | 9171E combustion alternatives, stage-specific hot-path supply and rotor services. Explicit set-wise compatibility supports checking entire configurations. Current name used on the primary page; historical brochures say PSM/Thomassen. |
| [EthosEnergy, rotor life extension](https://careers.ethosenergy.com/services/heavy-duty-gas-turbines/rotor-life-extension) | Indexed primary content expressly includes Frame 9E in its B/E-class programs. Direct extraction was intermittent. Capability is a candidate inquiry route, not a statement that each individual wheel is in stock. |
| [MD&A interview with Pat Murphy](https://www.mdaturbines.com/es/resources/experts/pat-murphy/) | Indexed primary interview discusses 7EA/9E DLN1 fuel-nozzle flow matching. Used only for fuel-service qualification context. |
| [WWGTP recently supplied parts](https://www.wwgtp.com/recently-supplied/) | The supplier lists delivered Frame 9E crossfire tubes. The example does not establish compatibility, price or supply of the whole fuel-manifold group. |

## Boundaries and verification

Supplier names indicate advertised or documented capabilities, never an approved
vendor list. A repair shop, licensee, new-part manufacturer and stock reseller have
different roles. Crossfire tubes, nozzles, liners, transitions and shrouds can be
purchased separately even where the mesh combines them. Budgeting must return to
an itemized plant BOM and quote scope.

No source gives the model's scores. Consequence, relative cost and sourcing
strategy are the researcher's assessment from these functions and supply routes.
The magnitude of failure risk, current capacity, country-of-origin exposure,
export availability, lead time and actual site inventories remain unknown.
There is no fabricated price, lead-time range or absolute savings estimate.

The module uses bounded ID matching and returns `null` for unknown or out-of-range
IDs, including exhaust selections. Each supported record includes all four
integer scores, cost/consequence/risk/impact rationales, explicit scope, strategy,
candidate suppliers, limitations, dated research and HTTPS references. Integration
tests should verify complete model coverage together with the other research
modules; this research changes no geometry or operating limits.

# Exhaust, shafts, bearings and base: supply-chain evidence

Research checked **6 October 2026**. This covers nine selectable parts in eight families. The scope was read from `src/model/assembly.js`, `src/model/hot-section.js`, the existing education records and `docs/manufacturing-mechanics.md` before searching. None of the scores is an OEM rating or supplier quotation.

## Findings and scoring basis

No component in this scope meets **cost ≥4 and operational criticality ≤2**. The base and exhaust structure are not decorative: the model places bearing 3 in the exhaust frame and carries the machine through the base supports. Fabrication availability does not establish low failure consequence. The turning rings have a lower consequence than rotor parts, but still require controlled exhaust geometry; they receive criticality 3 and cost 3, not an invented low-criticality saving.

Cost means **relative new replacement burden of the selected group**, excluding labor, freight, taxes, plant downtime and civil work. Bands are 1 low, 2 modest, 3 substantial specialist manufacture, 4 high large/precision assemblies, 5 very high rotor/hot-gas assembly burden. They are ordinal and cannot be summed into a turbine budget or converted into dollars.

Operational criticality measures the consequence of part failure. Kraljic business impact separately considers procurement/capital exposure, ability to restore generation, installation and asset consequences. Supply risk considers qualification barriers, geometry/material specificity, revision compatibility and demonstrated sourcing routes. Missing site spend, spare inventories, duty cycles and lead times make all three strategic assessments provisional. For the app's quadrant split, scores 1–2 are low and 3–5 are high. The evidence does not justify moving items just to populate all four quadrants.

| Selected ID / scope | Cost | Operational criticality | Supply risk | Business impact | Procurement treatment |
| --- | ---: | ---: | ---: | ---: | --- |
| `exhaust-frame-struts`: complete modeled structural frame and ten struts/fairings | 4 | 5 | 4 | 4 | Strategic: qualify structural/thermal interfaces and a repair or replacement route |
| `exhaust-diffuser-upper`: one modeled inner/outer diffuser half | 4 | 4 | 3 | 4 | Strategic: compare qualified fabrication, repair and compatible redesign |
| `exhaust-diffuser-lower`: the other modeled diffuser half | 4 | 4 | 3 | 4 | Same family; no assumption of identical quoted prices |
| `exhaust-turning-vanes`: all five stationary rings | 3 | 3 | 3 | 3 | Strategic: inspect, qualify fabrication and evaluate engineered redesign |
| `shaft`: two wheel shafts and modeled coupling/flange features | 5 | 5 | 5 | 5 | Strategic: rotor lifecycle, material pedigree, spare/exchange and integration plan |
| `bearing-1`: housed journal + thrust assembly | 3 | 5 | 3 | 4 | Strategic: qualified repair and an inspected spare |
| `bearing-2`: housed journal, seals and connections | 3 | 5 | 3 | 4 | Strategic: liner/thermocouple geometry and repair route |
| `bearing-3`: housed tilting-pad journal group | 3 | 5 | 3 | 4 | Strategic: pad/pivot fit plus exhaust-frame interfaces |
| `base-frame`: welded structure, columns and saddles | 3 | 5 | 3 | 4 | Strategic: approved design followed by competitive qualified fabrication |

These are group-level classifications. A quote for one pad, a liner, seal, strut fairing or ring cannot be substituted for the selected assembly's cost. Similarly, the two wheel shafts do not represent the complete turbine/compressor rotor or the full separate generator coupling.

## Component research and analytical conclusions

### Exhaust frame, diffuser halves and turning rings

[GE Vernova's actual 9E upgrade](https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-exhaust-system-upgrade) addresses cycling-related deterioration through coordinated changes to the frame, diffuser and plenum. Its modern diffuser removes turning vanes as part of that engineered package. This supports configuration-specific sourcing, not removing existing legacy rings without redesign. The page has no price; its installation figure is not a factory procurement lead time.

The [BHEL Paradip tender of 17 March 2011](https://tenders.bhel.com/sites/default/files/1452%20Tech%20spec.pdf), PDF p.46, lists an 8,500 kg complete Frame 9E diffuser and a separate 2,850 kg load-coupling shipment with hardware. This confirms substantial handling scale, not the mass of either modeled half or a cost-per-kilogram estimate. The tender concerns erection/testing and related project work, not a sale price for the component.

[Matrix TurboGen](https://matrixturbogen.com/components-spare-parts) advertises exhaust frames, diffusers and plenums for Frame 9E through manufacturing associates. [EthosEnergy's 9E page](https://ethosenergy.com/frame-9e-gas-turbine-solutions) lists exhaust frames among parts offerings. These establish candidate inquiry routes only. No bidder was contacted; inventory, specific drawings, approval and current delivery were not checked. The analytical risk difference is that the frame also locates a rotor bearing, whereas diffuser fabrication has a somewhat broader process base. All require fit and thermal validation.

Historical corroboration: Timothy Ginter's GE Energy **GER-4610 (March 2012)** has indexed 9E-specific discussion of diffuser cracking, turning-ring stiffening and cooling configuration. The [official indexed PDF URL](https://www.gevernova.com/content/dam/gepower-pgdp/global/en_US/documents/technical/ger/ger-4610-exhaust-system-upgrade-options-for-hdgt.pdf) redirected to the resource library when opened. A [mirror](https://manuals.plus/m/fea701f94fafb366ee60531b60387b800596550c4342d6d001972f822ddb1aa5) reproduces the document, but its conversion is not relied on for numerical design requirements. The current OEM page is the app's direct source.

### Wheel shafts and hot-end coupling features

[PPC's POPD-903231 procurement](https://eprocurement.dei.gr/media/18510/dplp-903231-teliko.pdf), PDF pp.52–57, specifically includes manufacture of a **PG9171E turbine forward stub shaft**, separately from a compressor aft stub shaft and rotor hardware. Its scope includes manufacturing drawings, material/heat-treatment controls, inspection hold points and rotor fit/balance work. The technical text anticipates support until the end of 2024; a publication date was not established from the document. Its historical delivery requirements apply to that contract and are not today's shaft lead time.

[GE rotor life management](https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension) includes 9E and describes shaft/wheel inspection and rotor manufacturing controls. Its cost symbols are comparative marketing, not prices. [Sheffield Forgemasters](https://sheffieldforgemasters.com/industry/power-generation/) demonstrates an upstream chain of power-generation shaft forging, heat treatment and machining. This is general capability; no GE9E supplier approval or unit alloy follows from it. The cost-5 assessment reflects the two selected rotor forgings' manufacture and qualification burden. The impact-5 assessment reflects major asset and restoration exposure; neither is a currency estimate.

PPC's separate [aft compressor stub-shaft tender](https://eprocurement.dei.gr/media/12066/d_903070.pdf) also surfaced during searches. Its part is outside this selected wheel-shaft group and was not used as a price proxy. Full-rotor replacement and the BHEL separate load coupling likewise have different boundaries.

### Bearings 1, 2 and 3

[DEWA RFQ 2412401957, dated 19 December 2024](https://www.dewa.gov.ae/api/RfxDownload/Get/2412401957), PDF pp.1–4, explicitly covers Frame 9E bearings 1 (journal/thrust), 2 and 3. It calls for rebabbitting and restoration to GE geometry with documented procedures. Bearing 2 receives specific thermocouple-hole controls. Bidder warranty and delivery are requested, and price fields are blank. This is evidence of a real repair procurement route, not an award or the price of a new complete housing.

[Kingsbury's general hydrodynamic-bearing guide](https://www.kingsbury.com/pdf/universe_brochure.pdf), especially PDF pp.5–13 and 15–18, supports journal/thrust roles, fluid-film requirements and failure mechanisms. [Its repair-shop brochure](https://kingsbury.com/wp-content/uploads/Repair_Service_YClr.pdf), PDF pp.2–5, documents cross-manufacturer babbitt repair, casting and precision machining. Neither proves Kingsbury supplied the modeled machine. A source publication date was not found for either brochure.

All bearings receive cost 3 for the selected complete custom stationary assembly; this does not assert equal actual prices or erase the additional thrust mechanisms at bearing 1. Each receives criticality 5 because loss of rotor support/location can cause major damage. Impact 4 reflects the far larger asset and generation exposed than the bearing purchase alone. Risk 3 recognizes a repair market while retaining qualification constraints on fits, lining and interfaces.

The [DEWA September 2024 bearing-2 packing RFQ](https://www.dewa.gov.ae/api/RfxDownload/Get/2012404331) is for gland packing, not the complete bearing. It was excluded from costing. Listings of bearing part numbers without verified quotes were also insufficient.

### Base and support structure

The [background to Nuovo Pignone's US20190085729A1](https://patents.google.com/patent/US20190085729A1/en), published 21 March 2019, describes conventional gas-turbine bases as structural assemblies requiring load capacity, bending and torsional resistance, with fabrication and coating burdens. Its proposed sandwich construction is **not** assigned to this turbine. [Fabri-Tek's baseframe workflow](https://fabritekengineers.com/machined-baseframe) shows generic welding, machining and inspection capability, not a verified Frame 9E supply relationship.

[ACQUIP's alignment service](https://acquip.com/gas-turbine-alignment-3/) explicitly lists Frame 9E and measures casing deformation, bearing elevations and rotor alignment. This supports using an alignment specialist as a candidate service route, not calling it a base manufacturer. Cost 3 recognizes accessible heavy-fabrication processes with substantial engineering. Criticality 5 recognizes what the structure supports. Risk 3 accounts for required approved design and foundation/datum compatibility. Impact 4 considers disruptive replacement work and generation exposure even if the part is bought rarely.

## Price search and exclusions

Primary-source searches included `GE Frame 9E turbine journal bearing supply tender price`, `9E shaft tender`, `9E exhaust contract price`, `9E exhaust diffuser price`, `9E turning vanes cost`, `turbine base 9E tender cost price`, and targeted searches on DEWA, BHEL and PPC procurement domains. The review found real scopes and engineering controls, but **no applicable verified public monetary price for any complete selected group**.

| Evidence found | What can be used | Why it cannot supply this app's part price |
| --- | --- | --- |
| DEWA 2024 bearing RFQ | All three bearings have an actual restoration procurement route | Blank prices; refurbishment scope; not a new housed assembly |
| PPC rotor tender | Actual PG9171E turbine forward shaft and controlled rotor work | Mixed mandatory/optional supplies and services; no verified group award price |
| BHEL 2011 erection tender | Actual 9E shipment scope and logistical scale | Shipping mass, bid security and tender-document fees are not equipment prices |
| [EthosEnergy Trapani announcement, 13 Nov 2024](https://careers.ethosenergy.com/news-and-events/multimillion-euro-asset-integrity-project-at-unique-power-plant-sees-ep-produzione-team-up-with-ethosenergy) | A supplier reports a substantial retrofit of customized 9B-to-9E units | Mixed exhaust and auxiliary work; no component allocations; direct fetch failed, indexed announcement only |
| Trade-data aggregators / reseller asking-price listings | Leads for further buyer due diligence only | No primary invoice, exact part/configuration, condition or scope validation |
| Uploaded proposals and mirrored training/sales specifications | Search leads | Provenance, terms and matching unit scope not sufficient for prices |

No cost was inferred from tender deposit, total rotor insurance value, whole-plant output, installed turbine price or the number of visual meshes. There are no invented USD amounts, savings percentages or delivery ranges. The result is **Quote required** for every item.

## Claim-to-source ledger and limitations

| Claim in data | Main evidence | Boundary |
| --- | --- | --- |
| Exhaust degradation matters to reliability | GE current 9E upgrade | OEM family evidence; not a unit condition inspection |
| Turning-ring removal can be an upgrade | GE current 9E upgrade | Coordinated redesign, not standalone deletion |
| Diffuser has large fabrication/logistics burden | BHEL PDF p.46 plus modeled group scope | Complete shipment at another project; analyst relative cost for each half |
| Independent exhaust sourcing candidates exist | Matrix TurboGen; EthosEnergy 9E page | Self-described capability; no approval, stock or contract validation |
| Turbine forward shaft has actual PG9171E procurement precedent | PPC PDF pp.52–57 | Does not establish the aft shaft/coupling group price |
| Rotor shaft qualification is specialized | GE rotor services; PPC; Sheffield general capabilities | No drawing tolerances or specific metallurgy prescribed here |
| Each 9E bearing has a restoration route | DEWA PDF pp.1–4 | Refurbishment only; no unit prices |
| Bearing failure can expose the rotor | Kingsbury family guide and modeled support role | Engineering consequence assessment, not failure probability |
| Base must preserve structural support | Nuovo Pignone background; modeled support role | Not a recovered PG9171E installation drawing |
| Alignment is a specific service capability | ACQUIP explicitly lists 9E | Not base manufacture or proof of the modeled geometry |

Manufacturer/supplier pages without a stated publication date were accessed on the research date. The EthosEnergy 9E page was available through its indexed primary-source text, but direct browser retrieval returned an internal fetch error; its candidate capability claims should be reconfirmed during qualification. Search-engine crawl/publication metadata was not treated as a document's historical publication date. Numerical scores and procurement strategies are analytical judgments derived from these scopes, not claims made by the cited authors. Before purchasing, the owner needs serial/revision-specific drawings, actual condition, qualified supplier responses, labor/logistics boundaries, demand/spare history and plant financial assumptions.

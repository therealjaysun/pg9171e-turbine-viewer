# Mechanical Manufacturing Evidence

Research checked 2026-10-06. Module: `src/education/manufacturing-mechanics.js`.
This is manufacturing education, not the PG9171E production traveller, repair instructions, or a bill of certified materials. All route/check entries carry local source keys; each returned record includes only the references it uses. No geometry changes accompany this module.

## Component Coverage

| Model IDs | Route scope | What is not established |
| --- | --- | --- |
| `shaft` | Large forged wheel-shaft family; GE heavy-duty rotor QA | Unit alloy, blank/bore sequence, heat treatment, machining tolerances, balance criteria |
| `bearing-1` | Babbitt journal plus equalizing-thrust manufacturing concepts | Original supplier, housing stock/process, exact lining and fits |
| `bearing-2` | Babbitt fixed-profile journal manufacture | Unit-specific bore profile tolerances and shell construction |
| `bearing-3` | Babbitt tilting-journal pad manufacture | Unit-specific pad/pivot details and clearances |
| `base-frame` | Representative welded/machined equipment base | Actual PG9171E skid, weld design, foundation and anchor system |
| `inlet-casing-upper`, `inlet-casing-lower` | Representative iron-casting route, separately qualified GE material family | Exact inlet alloy, mould/core arrangement, finishing and coating |
| `inlet-guide-vanes` | GE material/durability context; clearly labeled aerospace machining analogue | Unit blank process, alloy condition, rack gearing and finishing route |
| `igv-actuator` | HPS representative hydraulic-cylinder manufacture | Installed supplier, closure design, pressure, seals and linkage calibration |

## Evidence Ledger

Source claims below are paraphrased. The sources describe their own products/processes or OEM research; no supplier relationship with the video unit is implied.

| Key | Primary source and locator | Supported use and boundary |
| --- | --- | --- |
| `geRotor` | [GE Vernova, rotor life management](https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension), sections OEM expertise, forging, wheel stacking/balancing and inspection | B/E/F manufacturing/service context, shaft/wheel teardown and multiple NDE methods. Includes 9E service eligibility; not a specific new-shaft manufacturing recipe. |
| `forge` | [Sheffield Forgemasters, Forge](https://sheffieldforgemasters.com/whatwedo/forge/), forging capabilities and furnaces | Open-die processing of solid/hollow steel forgings. Does not establish how this rotor's cavity originated. |
| `powerSteel` | [Sheffield Forgemasters, Power Generation](https://sheffieldforgemasters.com/industry/power-generation/), specialist steel and manufacturing capabilities | Alloy-steel shaft/component manufacturing and heat treatment. Listed supercritical-turbine grades are intentionally not assigned to GE9E. |
| `machining` | [Sheffield Forgemasters, Machining](https://sheffieldforgemasters.com/whatwedo/machining/), capabilities, machinery examples, rough machining | General large-forging rough/finish operations and deep-hole equipment. Application to modeled journal/flange/bore surfaces is an engineering explanation, not a recovered routing. |
| `materialTests` | [Sheffield Forgemasters, Testing](https://sheffieldforgemasters.com/whatwedo/testing/), mechanical and metallurgical sections | Material-property and microstructural tests. No numerical acceptance criteria transferred. |
| `bearingGuide` | [Kingsbury, A General Guide to Hydrodynamic Bearings](https://www.kingsbury.com/pdf/universe_brochure.pdf), printed pp. 5, 7-11; PDF pp. 5, 7-11 | Fixed-profile bores; lining/body/pivot construction; thrust equalization; surface geometry and clearance. This is bearing-family instruction, not confirmation of Kingsbury manufacture for the PG9171E. |
| `bearingShop` | [Kingsbury, Expert Bearing Repair & Large Scale Machine Shop](https://kingsbury.com/wp-content/uploads/Repair_Service_YClr.pdf), PDF pp. 3-7, especially p. 5 | Spin-casting capability, milling/turning/grinding, inspection and recorded quality milestones. Manufacturing and refurbishment are distinguished. |
| `babbitt` | [Washington Iron Works, Bearing Inspection & Manufacturing](https://washingtonironworks.com/bearing-inspection-and-manufacturing-2/), casting, rebabbitting, UT and groove sections | Cylindrical centrifugal-casting example, lining-bond checks and machined oil features. Clean/re-tin/recast sequence is explicitly a repair example. Supplier promotional absolute-quality language is not adopted. |
| `framePatent` | [Nuovo Pignone, US20190085729A1](https://patents.google.com/patent/US20190085729A1/en), Background | Conventional welded-beam bases and access for painting. The invention is a filled sandwich base; neither that embodiment nor its size ranges are asserted for PG9171E. |
| `frameShop` | [Fabri-Tek Engineers, Machined Baseframes](https://fabritekengineers.com/machined-baseframe), workflow and inspection sections | Supplier example: stock, fabrication, mounting-face machining, inspection and coating records. No OEM procurement relationship is claimed. |
| `geCasings` | [GE, GER-3434D, Brandt and Wesorick](https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL23/General%20Electric%20Gas%20turbine%20Power%20Generator%20philosophy%201994.pdf), printed pp. 1-2 / PDF pp. 3-4 | Grey/nodular iron in the heavy-duty casing family. GE-authored paper on a university mirror; not a PG9171E inlet material certificate. |
| `ironProduction` | [Dueker, Custom Casting Production](https://www.dueker.de/en/custom-casting/production/), pattern, core and aftertreatment sections | General grey/ductile-iron foundry workflow; material/application-dependent aftertreatment. No pressure testing or exact heat treatment imposed on the inlet. |
| `ironProcess` | [ULDALL, The Casting Process](https://www.uldall.dk/en/the-casting-process), sand core through machining sections | Cavities made with sand cores, pouring, release, cleaning and machining. Example route, not proof that every open half-casing surface needs a core. |
| `ironQuality` | [ULDALL, Facts](https://www.uldall.dk/en/about-uldall/facts), quality-control FAQ | Melt/microstructure control and specification-dependent iron-casting NDE. |
| `igvMaterial` | [GE, US7753653B2](https://patents.google.com/patent/US7753653B2/en), Background and conventional Fig. 1 | Conventional metallic IGV material and distress regions only. Composite manufacturing is an exemplary patent embodiment and is not presented as an installed 9E design. |
| `vaneMachining` | [DMG MORI, Technology Excellence 02-2018](https://en.dmgmori.com/resource/blob/311112/089db5641b610f20b6b44181ee3861b6/j182en-data.pdf), Leistritz customer story, printed pp. 18-20 | Aerospace guide-vane five-axis production, tool wear and in-process measurement. Supplier-authored case with named manufacturing staff; not industrial 9E IGV process proof. Web-indexed article text was available; the full PDF exceeded the browser fetch size limit. |
| `geIgv` | [GE Vernova, 9E Advanced Compressor](https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-advanced-compressor), How we get you there | Actual 9E upgrade context: IGV undercut and crack-sensitive regions. Optional package surface treatments are not assigned to all IGVs. |
| `cylinderProduction` | [HPS, Production Flow](https://hpsystems.com.tr/en/teknik-kaynaklar/uretim-akisi/), stock and five-stage process | Supplier's honed tube/plated rod, machining, welded features and assembly. Welded-cylinder construction is illustrative, not identified from the video. |
| `cylinderTests` | [HPS, Cylinder Acceptance Testing](https://hpsystems.com.tr/en/teknik-kaynaklar/rehber/basinc-testi/), procedure, documentation and upstream checks | Stroke, bypass, leakage, holding and sealing-surface checks. Supplier pressure multipliers, grades, coating thickness and bore tolerances are deliberately not reused as GE requirements. |

## Attribution Limits

- Source-specific alloys, furnace temperatures, finish values and tolerances were not imported as OEM specifications.
- No proposed patent embodiment is equated with production use; the two patent citations support their explicitly identified background discussion only.
- The source video establishes visible component architecture elsewhere in the project. It does not establish foundry stock, metallurgical treatment or manufacturing inspection history.
- The records explain the selected part family. They do not claim to cover every represented small fastener, seal, pipe, gear, support or sensor.

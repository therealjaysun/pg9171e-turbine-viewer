# Compressor Manufacturing Evidence

Reviewed 2026-10-06. These notes explain component-family manufacture, not an OEM shop traveler. They do not change geometry or certify any part for manufacture, repair or service.

## Coverage

`compressorManufacturing(part)` in `src/education/manufacturing-compressor.js` needs only `part.id`. It covers 42 selections:

- `compressor-rotor-1` through `compressor-rotor-17`.
- `compressor-stator-1` through `compressor-stator-17`.
- `compressor-stub-shafts` and `compressor-exit-guides`.
- `compressor-casing-forward-upper`, `compressor-casing-forward-lower`.
- `compressor-casing-aft-upper`, `compressor-casing-aft-lower`.
- `compressor-casing-discharge-upper`, `compressor-casing-discharge-lower`.

Inlet casings, inlet guide vanes and the actuator belong to the mechanics module. Discharge inner-barrel geometry belongs to the hot-section module. Repeated rows share a manufacturing family; the file does not invent seventeen distinct process plans.

## Evidence Ledger

All citations are primary author/manufacturer publications. The one university-hosted document is GE-authored and explicitly labeled as a mirror. Sources were read, not inferred from search titles. Source keys match the panel records.

| Key | Source and location | Evidence boundary |
| --- | --- | --- |
| `geCompressorDesign` | [GE GER-3434D, printed pp. 1-2, 6-7](https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL23/General%20Electric%20Gas%20turbine%20Power%20Generator%20philosophy%201994.pdf#page=8) | OEM family construction, not serial-specific metallurgy or dimensions. |
| `geCompressorUpgrade` | [GE Vernova 9E Advanced Compressor Upgrade, feature list](https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-advanced-compressor) | Confirmed 9E upgrade options; not proof of their installation in the animation. |
| `geRotorProcesses` | [GE Vernova rotor life management, OEM expertise](https://www.gevernova.com/gas-power/services/gas-turbines/rotor-life-extension) | B/E/F manufacturing and service context; no exact compressor shaft or bolt specification. |
| `cblade` | [C*Blade, Gas Turbine Compressor Blades / Product Gallery / Integrated Manufacturing](https://www.cblade.it/) | Supplier's airfoil production example, especially front stages. No claim it supplied this turbine. |
| `corrtech` | [Corrtech Energy, Manufacturing / Facilities / Product Gallery](https://www.corrtechenergy.com/manufacturing) | Compressor parts for GE-designed Frame 3-9 fleets and blade polishing; not an EGV-specific process sheet. |
| `steelProduction` | [Sheffield Forgemasters, Power Generation](https://sheffieldforgemasters.com/industry/power-generation/) | General large power-component supplier practice, not a GE license or a PG9171E alloy assignment. |
| `largeMachining` | [Sheffield Forgemasters, Machining](https://sheffieldforgemasters.com/whatwedo/machining/) | Available large-forging operations. Mapping them to visible datums is educational interpretation. |
| `rotorReassembly` | [Sulzer, Core Competencies, rotor repair workflow](https://www.sulzer.com/en/shared/about-us/annual-report-2016-story-core-competencies) | Service/reassembly checks are labeled as such, not substituted for original factory qualification. |
| `ironCasting` | [ULDALL, The Casting Process](https://www.uldall.dk/en/the-casting-process) | Representative iron foundry sequence, not the casing supplier or original pattern/core design. |
| `ironQuality` | [ULDALL, Facts, manufacturing and quality FAQs](https://www.uldall.dk/en/about-uldall/facts) | Conditional inspection/finishing capabilities; no prescribed NDT acceptance class. |
| `geInspection` | [GE GER-3620P, PDF pp. 30-31](https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/ger-3620p-heavy-duty-gas-turbine-operating-and-maintenance-considerations.pdf#page=30) | Service inspection priorities, not factory tolerances or repair authorization. |

## Deliberate Limits

- The source video and existing model establish visual selection context. Neither exposes a manufacturing bill of materials, heat-treatment certificate, tooling plan or inspection release.
- Forged-and-machined airfoils are presented as a representative supplier route. This is not proof that every late-stage vane or EGV on this unit began as a forging.
- The model's stages 1-8 carrier arrangement and stages 9-17 casing-groove arrangement only change the scope description. They do not justify unsupported root dimensions, attachment machining methods, joining claims or retention details.
- EGV support rings are not labeled welded, brazed or integrally cast. No source recovered here establishes that joint for this video unit.
- The casting explanation is conditional at section level: the general GE iron-casing reference is not enough to assign a grade to every compressor/discharge half.
- Current rotor-bolting materials, optional 9E coatings, supplier capacities and unrelated-frame numerical tolerances are deliberately not transferred to this reconstruction.
- Every route/check has source keys resolving to its returned reference map. Unknown IDs, out-of-range stages and missing IDs return `null` for the aggregator.

Several historical GE PDF URLs redirected to a generic resource index, including attempted GER-3569G/GER-3808C/GER-3928C links. They are not used as citations. A Goltens case study was also excluded because its description mixed frame terminology with HP/IP staging, making the exact hardware ambiguous.

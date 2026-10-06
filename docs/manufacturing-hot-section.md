# Hot-Section Manufacturing Evidence

Research checked on 2026-10-06. This ledger supports
`src/education/manufacturing-hot-section.js`; it does not certify the geometry,
describe a serial-number-specific factory traveler, or supply a repair procedure.
The video establishes visible assembly context, not hidden metallurgy or shop
processes. Every displayed route/check has explicit source keys.

## Coverage

The function accepts `{ id, system }` without needing geometry. It returns `null`
for unknown IDs, including out-of-range can and stage numbers. There are 59
covered IDs across 13 families, with separate stage variants for buckets/nozzles.

| ID or bounded family | Count | Manufacturing distinction |
| --- | ---: | --- |
| `combustion-wrapper-upper/lower` | 2 | Documented shop operations; blank route and alloy unresolved |
| `compressor-discharge-inner-barrel` | 1 | GE-family cast stationary part; representative machining |
| `combustor-1` ... `combustor-14` | 14 | Sleeve/cover versus separately manufactured fuel hardware |
| `combustor-liner-1` ... `combustor-liner-14` | 14 | Formed hot-wall sheet, cooling construction and surface protection |
| `transition-1` ... `transition-14` | 14 | Compatible replacement and alloy-producer process guidance |
| `combustor-crossfire-manifolds` | 1 | Crossfire example does not establish fuel-manifold manufacture |
| `turbine-wheel-1/2/3` | 3 | Forged wheel/hub versus separate cast buckets; stage-specific notes |
| `turbine-nozzle-1/2/3` | 3 | Stationary segment castings; stage-specific materials and finishes |
| `turbine-spacers-studs` | 1 | Forged spacers versus separately made fasteners |
| `turbine-shell-upper/lower` | 2 | Large casing versus separate shroud blocks |
| `exhaust-frame-struts` | 1 | Structural frame members, joints and casing alignment |
| `exhaust-diffuser-upper/lower` | 2 | Comparable fabrication and qualified 9E upgrade details |
| `exhaust-turning-vanes` | 1 | Qualified 9E upgrade support construction, not assumed as-built |

## Interpretation Rules

- **Compatible replacement** means the supplier explicitly offers the part for
  PG9171E. It does not mean GE used that alloy, coating or process in the video.
- **GE-family** means the original author describes heavy-duty turbine practice,
  sometimes spanning several frame classes. F-class examples are not silently
  transferred to 9E.
- **Material capability** explains what the alloy producer documents. It is not
  evidence of a particular component's weld schedule or heat-treatment history.
- **Patent embodiment** is a documented possible design/process, not evidence of
  manufacture, installation or fleet-wide adoption. Patent background statements
  are identified separately from proposed inventions.
- **Representative inspection** names documented shop methods, frequently from
  service/refurbishment. It is not a claim that every new part received every
  method, or that a particular defect is acceptable.
- **Unknown** is intentional. We have not filled evidence gaps with invented
  grades, tolerances, heat cycles, weld sizes, pressures or process sequences.

## Source Ledger

Printed page numbers are distinguished from zero-based PDF indices below.
Linked source labels in the UI carry the same scope boundaries.

| Key | Primary author / location | Evidence used and boundary |
| --- | --- | --- |
| `hotBuckets` | [Sulzer E10255, footer 12.2019](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentbuckets_en_e10255_5_2014_web.pdf), PDF indices 0-1 | PG9171E-compatible bucket specification, including stage differences. This is replacement evidence, not an original GE bill of materials. |
| `hotCombustion` | [Sulzer E10256, footer 1.2020](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentcombustioncomponents_en_e10256_5_2014_web.pdf), indices 0-1 | Replacement liner/transition forming, materials and surface treatments. No claim that all DLN1 generations share this construction. |
| `hotParts` | [Sulzer E10257, footer 12.2019](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentnewpartsmanufacturing_en_e10257_5_2014_web.pdf), index 0 | Compatible combustion-hardware product range and tooling/fit context. Does not identify the alloy of each sleeve, cover or manifold. |
| `hotNozzles` | [Sulzer E10258, footer 12.2019](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentnozzles_en_e10258_5_2014_web.pdf), indices 0-1 | Stage-specific replacement nozzle specifications. Optional upgrades are not treated as original equipment. |
| `hotShrouds` | [Sulzer E10259, footer 12.2019](https://www.sulzer.com/en/-/media/files/services/spare-parts/brochures/ge_ms9001e_equivalentshroudblocks_en_e10259_5_2014_web.pdf), indices 0-1 | Separate replacement shroud-block materials and gas-path finishes; not turbine-casing metallurgy. |
| `hotGeMaterials` | P. W. Schilke, GE, [GER-3569G, August 2004, archival transcription](https://doczz.net/doc/7547341/ger-3569g---advanced-gas-turbine-materials-and-coatings), printed pp. 2-3, 16-23 | Narrow GE-family manufacturing claims. Original GE-author attribution retained; third-party archival transcription is not a current GE-controlled specification. |
| `hotGeRotor` | D. E. Brandt / R. R. Wesorick, GE, [GER-3434D, 1994, university-hosted PDF](https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL23/General%20Electric%20Gas%20turbine%20Power%20Generator%20philosophy%201994.pdf#page=9), printed p. 7 / index 8 | Original GE-authored rotor quality discussion. Not an inspection certificate for this reconstructed rotor. |
| `hotCasting` | [PCC Structurals: Investment Casting](https://www.pccstructurals.com/processes/investment-casting.html), process and inspection sections | General supplier casting workflow and quality methods. PCC is not identified as this turbine's casting supplier. |
| `hotCores` | [CPP: Core and Wax Technologies](https://www.cppcorp.com/core-wax-technologies), opening explanation | General tooling function; modern core-production innovations are not assigned to legacy 9E parts. |
| `hotCoreRemoval` | Howmet, [US5296308A](https://patents.google.com/patent/US5296308A/en), Background and detailed shell/core-removal description | Supports the distinction between removable ceramic tooling and the finished metal passage walls. Its patented wall-control design is not asserted to exist here. |
| `hotFlow` | [Sulzer: More Go With Better Flow](https://www.sulzer.com/en/campaign/more-go-with-better-flow), nozzle/bucket/liner discussion | Service-context flow-test principles, not factory acceptance values. |
| `hotInspection` | [Thomassen: Repairs](https://thomassen-me.com/repairs/), inspection and workshop capabilities | Service-shop fitting, surface examination and metrology examples. No inferred new-part inspection standard. |
| `hotHastelloy` | [Haynes International: HASTELLOY X](https://haynesintl.com/en/alloys/alloy-portfolio/high-temperature-alloys/hastelloy-x/), Principal Features, Welding and Base Metal Preparation | Alloy-producer fabrication capabilities. No claim that a particular welding option was used on the modeled liner. |
| `hotNimonic` | [Special Metals: NIMONIC 263](https://www.specialmetals.com/documents/technical-bulletins/nimonic-alloy-263.pdf), printed pp. 1, 10-11 / indices 0, 9-10 | Material-specific treatment and fabrication context; no numerical shop recipe is reproduced. |
| `hotFuelPatent` | GE, [US20070131796A1](https://patents.google.com/patent/US20070131796A1/en), Background, Figs. 1-5 and Detailed Description | Contrasts existing assembled secondary nozzles with a drilled alternative. Does not identify the video unit's nozzle revision. |
| `hotCrossfirePatent` | GE, [US20070151260A1](https://patents.google.com/patent/US20070151260A1/en), Figs. 1-2 and Detailed Description | A particular compliant crossfire construction. Neither proof of legacy male/female tube construction nor evidence about external fuel piping. |
| `hotCasingPatent` | GE, [US8979488B2](https://patents.google.com/patent/US8979488B2/en), Background | Conventional casing route only. The patent's proposed lost-foam process is not presented as legacy 9E production history. |
| `hotFramePatent` | GE, [US20170370283A1](https://patents.google.com/patent/US20170370283A1/en), Fig. 2 and Detailed Description | Exhaust-frame member/joint example and stress concerns. Does not establish the PG9171E alloy or an installed stress-relief feature. |
| `hotBhel` | [BHEL tender HY/GT/AGM/OT-01/2012-13, 19 June 2012](https://www.bhel.com/sites/default/files/unskilled%20operations%20in%20GT%20areas%20for%202012-13.pdf#page=33), PDF indices 32-33 | Supporting shop tasks explicitly include Frame 9E. Not a detailed manufacturing or QA specification. |
| `hotMachining` | [Sheffield Forgemasters: Machining](https://sheffieldforgemasters.com/whatwedo/machining/), machining capability | Comparable large-component shop methods, not evidence of supplier identity or original datums. |
| `hotDiffuser` | [Schock: Gas Turbine Exhaust Diffuser](https://www.schock-mfg.com/gas-turbine-exhaust-diffuser), stainless construction and machined-interface sections | Supplier's 7E-family products. Search-indexed primary page was readable; direct extraction intermittently failed. Used only as a qualified comparable route, never a 9E material specification. |
| `hotGeExhaust` | Timothy Ginter, GE, [GER-4610, 2012, archival transcription](https://www.scribd.com/document/347898930/Ger-4610), printed pp. 20-21, Figs. 27-30 | Original GE-authored 9E CHROEM upgrade discussion. Not proof that the video unit has the upgrade; host is an archive, not GE. |

## Important Resolutions

### Casting Core, Blade and Rotor Center

The temporary ceramic tool occupies a future passage. Its removal does not remove
all the airfoil metal. Conversely, a closed exterior is not evidence that the
interior has no passages. The notes keep the common manufacturing explanation
conditional because the exact hole-making route for the represented buckets is
unverified. The combined wheel selection must not encourage users to mistake an
investment-cast bucket for a forged wheel or to assume their alloys are identical.

The model's wheel cavities, cooling feeds and collector dimensions remain
reconstructions. Neither these manufacturing notes nor a successful mesh test
establish fatigue life, burst strength or conformity with an OEM drawing.

### Stage and Revision Boundaries

The bucket brochure's stage-1 narrative describes TBC, while its table calls it
optional; the UI retains the optional qualification. Other stage differences
follow the detailed product entries, not inference from a table omission.

Sulzer's nozzle and shroud information concerns compatible products. It must not
be used to identify historical GE grain structure, establish a hidden stage-3
nozzle cavity, or turn an optional seal upgrade into ground-truth geometry.

The alloy producer is authoritative for C263 processing terminology. A replacement
brochure's shorthand classification is not used to contradict the producer's
solution-treatment/age-hardening guidance.

### Exhaust and Evidence Gaps

The GE exhaust reference discusses a later upgrade, while the fabrication supplier
example is for a neighboring frame family. These have useful but different scopes.
Neither licenses retrofitting their details into the model without video or
unit-specific evidence. The original wrapper blank, some fuel hardware, stud
production, and numerous joining details remain unverified.

Legacy official GER URLs redirected to general resource pages during research.
The two archival transcriptions are labeled as such in both UI and ledger; the
university-hosted GER-3434D remains an original PDF. No third-party commentary is
used as independent proof of an OEM manufacturing claim.

## Validation

- All 59 supported IDs yield 3-5 route steps, 2-3 inspection notes and 1-2 limits.
- Every route/check source key resolves to a labeled HTTPS reference.
- Unknown IDs return `null`, with no system-wide fallback that could mislabel a
  newly added component.
- Root integration owns the combined manufacturing tests and panel rendering.
  This module does not alter geometry, material shaders, export behavior or CAD.

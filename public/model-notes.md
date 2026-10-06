# PG9171E / Frame 9E Reconstruction Notes

This is an independently reconstructed, educational 3D assembly of the three-stage GE MS9001E / PG9171E configuration with DLN1 combustion shown in the supplied video. It is not an OEM CAD release, a dimensional inspection model, or a manufacturing-verified design. Do not use it to specify clearances, fabricate replacement parts, perform lifting, or predict structural/thermal performance.

The browser model is a detailed visualization mesh. The accompanying `pg9171e.scad` is a separate, simplified parametric solid reconstruction in millimetres. The SCAD is editable; its simplified surfaces are not identical to the browser mesh. STL and GLB are polygonal representations, not STEP boundary representations or original CAD feature history.

## Sources

1. [Oil Gas World: the user-supplied training video](https://www.youtube.com/watch?v=4r1-IMMS73s&t=822s). Title displayed by YouTube: "Gas Turbine | Gas Turbine Working | Gas Turbine Overhauling | Gas Turbine Maintenanc Gas Turbine Rep". The introduction explicitly identifies the turbine as PG9171E. The supplied 13:42 location is within the combustion-liner description. Geometry was interpreted from displayed training illustrations and the automatically generated English transcript; transcription and diagram fidelity are not equivalent to an OEM drawing.
2. [GE GER-3434D, *GE Gas Turbine Design Philosophy*, Table 2](https://www.tfd.chalmers.se/~thgr/gasturbiner/Material_for_generating_slides/pdf_documents/GeGasTurbineDesignPhilosophy.pdf). The MS9001E compressor tip diameter is 85.1 in / 2161.5 mm, with 3000 rpm nominal speed. This is the principal radial scale anchor. [Alternative university mirror](https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL23/General%20Electric%20Gas%20turbine%20Power%20Generator%20philosophy%201994.pdf).
3. [BHEL rotor drawings for dynamic balancing, pages 4 and 5](https://www.bhel.com/sites/default/files/ROTOR%20DRAWING%206934.pdf). Frame-9E compressor and turbine rotor drawings provide journal and balancing-support dimensions. These are reference anchors; the separate balancing spans must not be added and presented as installed turbine bearing spacing.
4. [Baker Hughes Frame 9/1E](https://www.bakerhughes.com/gas-turbines/frame-technology/frame-91e). Confirms the single-shaft, hot-end-drive, 17-stage compressor, 14 reverse-flow combustors, and three turbine stages. Current product configurations and ratings are not necessarily those of the historical PG9171E video.
5. [Baker Hughes Frame 9/1E brochure](https://qa.bakerhughes.com/sites/bakerhughes/files/2021-06/BakerHughes_Frame91E_Overview-060121.pdf). Lists a typical power-generation GT skid of 10.7 x 5.0 x 4.8 m. This is a package dimension, not an OEM flange-to-flange casing envelope; it is used only as an order-of-magnitude check.
6. [Texas A&M Turbomachinery Laboratory, *LNG Turbomachinery*, 2011, page 11, Figure 18](https://turbolab.tamu.edu/wp-content/uploads/2018/08/Tutorial-04.pdf). Published by the symposium, with GE Oil & Gas co-authorship. Provides a Frame 9E section drawing showing the radial inlet, compressor, can-annular combustion zone, hot-end drive, and exhaust arrangement.

## Video Evidence

Timestamps link to the original video. Counts are taken from narration; quantities described as estimates below are not supplied by the narration.

| Feature | Evidence | Reconstruction |
| --- | --- | --- |
| Single shaft and rotation | [00:18](https://www.youtube.com/watch?v=4r1-IMMS73s&t=18s) | 3000 rpm nominal; counterclockwise looking downstream. Viewer motion is deliberately slowed for inspection. |
| Compressor rotor | [01:38](https://www.youtube.com/watch?v=4r1-IMMS73s&t=98s) | 17 rotor rows; 15 intermediate wheels and two stub-shaft wheel portions; 16 tiebolts. |
| Forward speed ring | [02:29](https://www.youtube.com/watch?v=4r1-IMMS73s&t=149s) | Narrated 60-tooth speed-sensing ring. Fine tooth and seal details are simplified. |
| Variable inlet guide vanes | [04:16](https://www.youtube.com/watch?v=4r1-IMMS73s&t=256s) | 64 vanes; narrated operating angle 34 to 84 degrees. |
| Compressor casings | [05:06](https://www.youtube.com/watch?v=4r1-IMMS73s&t=306s), [05:32](https://www.youtube.com/watch?v=4r1-IMMS73s&t=332s), [06:29](https://www.youtube.com/watch?v=4r1-IMMS73s&t=389s) | Forward casing rows 1-4; aft casing 5-10; discharge casing 11-17 and two exit-guide-vane rows. |
| Discharge support | [06:40](https://www.youtube.com/watch?v=4r1-IMMS73s&t=400s) | Inner and outer cylinders joined by 12 struts. |
| Combustion architecture | [09:24](https://www.youtube.com/watch?v=4r1-IMMS73s&t=564s) | 14 reverse-flow DLN1 can-annular combustors, numbered counterclockwise downstream from the vertical centreline. |
| Combustion wrapper | [11:21](https://www.youtube.com/watch?v=4r1-IMMS73s&t=681s) | Narrated front-face inclination 13 degrees from vertical; the reconstruction uses a 13-degree can-axis inclination as a geometric interpretation of the cover orientation. |
| Liner construction | [12:59](https://www.youtube.com/watch?v=4r1-IMMS73s&t=779s), [13:58](https://www.youtube.com/watch?v=4r1-IMMS73s&t=838s) | Liner body, cap assembly and venturi; three aft dilution holes. Cooling-ring and metering-hole patterns are representative. |
| Crossfire connection | [14:58](https://www.youtube.com/watch?v=4r1-IMMS73s&t=898s) | All cans interconnected; inner flame-transfer tubes inside outer connecting tubes. |
| Fuel nozzles | [16:19](https://www.youtube.com/watch?v=4r1-IMMS73s&t=979s) | Six primary nozzles around a central secondary nozzle per can. |
| Ignition and flame detection | [18:47](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1127s), [19:25](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1165s) | Video DLN1 arrangement: spark plugs on cans 11 and 12; detectors on cans 14, 1, 2, 3. Standard-combustion references may differ. |
| Transition pieces | [20:14](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1214s) | 14 individual round-to-sector ducts feed 14 equal sectors at the first-stage nozzle. Duct lofts are reconstructed. |
| Turbine stages | [21:58](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1318s) | Three stationary nozzle rows alternating with three rotor bucket rows. This is not the later four-stage 9EMax / 9E.04 upgrade. |
| Turbine nozzle populations | [24:58](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1498s), [27:18](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1638s), [29:36](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1776s) | 18 x 2 = 36 first-stage vanes; 16 x 3 = 48 second-stage vanes; 16 x 4 = 64 third-stage vanes. |
| Turbine rotor construction | [30:21](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1821s) | Forward shaft, three wheels, two spacers and aft shaft; 12 studs. |
| Turbine bucket populations | [31:12](https://www.youtube.com/watch?v=4r1-IMMS73s&t=1872s), [33:24](https://www.youtube.com/watch?v=4r1-IMMS73s&t=2004s), [35:22](https://www.youtube.com/watch?v=4r1-IMMS73s&t=2122s) | 92 buckets on each wheel. Second- and third-stage bucket tips are shrouded. |
| Exhaust frame | [40:11](https://www.youtube.com/watch?v=4r1-IMMS73s&t=2411s) | 10 radial struts between inner and outer cylinders. |
| Exhaust diffuser | [42:49](https://www.youtube.com/watch?v=4r1-IMMS73s&t=2569s), [43:05](https://www.youtube.com/watch?v=4r1-IMMS73s&t=2585s) | Divergent outer cylinder and five turning vanes at the aft end to turn axial flow toward the exhaust plenum. |
| Bearing arrangement | [43:32](https://www.youtube.com/watch?v=4r1-IMMS73s&t=2612s), [51:06](https://www.youtube.com/watch?v=4r1-IMMS73s&t=3066s), [54:11](https://www.youtube.com/watch?v=4r1-IMMS73s&t=3251s) | Three installed bearing stations: inlet, discharge inner barrel, exhaust frame. No. 1 includes thrust bearings; No. 3 has five tilting pads. |

## Dimensional Anchors and Limits

| Quantity | Published value | Treatment |
| --- | --- | --- |
| MS9001E compressor maximum tip diameter | 2161.5 mm | Used as a radial anchor, not a verified diameter for every row. |
| BHEL compressor forward journal | Diameter 400.00 mm; length 267.00 mm | Identifies scale near the forward shaft; component representation is simplified. |
| BHEL compressor aft journal | Diameter 426.70 mm; length 163.00 mm | Balancing-drawing reference, not an additional installed engine bearing. |
| BHEL compressor balancing span | 3482 mm | Separate rotor setup; not asserted to be the installed bearing span. |
| BHEL turbine forward journal | Diameter 467.56 mm; length 398.52 mm | Reference dimensional anchor. |
| BHEL turbine aft journal | Diameter 396.21 mm; length 267.72 mm | Reference dimensional anchor. |
| BHEL turbine balancing span | 4400 mm | Separate rotor setup; not combined with compressor span. |
| BHEL rotor masses | Compressor 28,000 kg; turbine 25,000 kg | Reference only. The solid reconstruction does not reproduce material distribution or mass. |

The browser coordinates are metres with X downstream, Y upward and Z toward the initial camera. The SCAD uses the same axes in millimetres. Approximate station intervals are inlet -5250 to -4000 mm, compressor -4000 to -400 mm, combustion -250 to 2000 mm, turbine wheel centres 2000 / 2520 / 3040 mm, and exhaust 3400 to 5200 mm. These are reconstruction coordinates, not source dimensions. Combustor centre radius 1750 mm is also estimated.

The remaining profiles, axial stations, wall thicknesses, flange diameters, bolt positions, turbine blade radii, compressor blade population by row, airfoil camber and twist, combustor diameters and internal details are visual estimates. Fasteners, piping, holes, cooling passages, seals, mounts and instrumentation are simplified or omitted. Mechanical interference and minimum clearances have not been validated. Exploded separations are chosen to expose components and do not prescribe a maintenance procedure.

## Editable Solid Source

In `pg9171e.scad`, `exploded` is a 0-1 separation control, `cutaway` removes upper shell halves, and `show_casings`, `show_stators`, `show_base` and `component` control visibility. `component` accepts `all`, `inlet`, `compressor`, `combustion`, `turbine`, `exhaust` or `bearings` for separate solid export. Exact known populations remain present; reducing `$fn` changes tessellation only. The compressor rotor and stator blade populations are marked as estimated in the source.

Verification on 2026-10-06: the source parsed and generated the complete default assembly with an OpenSCAD WebAssembly compiler using the Manifold backend. Compilation exited successfully without source warnings; the solid renderer reported `Status: NoError` and 2,123,086 facets. This verifies that the reconstructed solids can be evaluated, not that they match OEM dimensions, clearances or service requirements. The temporary compiler was kept outside the project; no OpenSCAD desktop installation is required to use the browser viewer.

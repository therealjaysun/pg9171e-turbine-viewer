# Mechanical Geometry Audit

This audit covers the five selectable shaft, bearing and base parts. Video narration is the architectural reference; its automatically generated transcript does not provide usable running clearances. The BHEL balancing drawings provide journal scale anchors, not installed bearing spacing. All gaps and housing dimensions below are reconstruction choices, deliberately enlarged for viewing.

| Part ID | Video evidence | Defect and refinement | Remaining uncertainty |
| --- | --- | --- | --- |
| `shaft` | 30:21 forward shaft, three wheels, two spacers, aft shaft; 53:04 No. 2 runs on the turbine forward shaft; 54:11 aft bearing | Removed the missing 1.80-3.35 m core span. A continuous revolved core now meets the compressor stub at X=0.14 m, reaches the 0.24 m turbine wheel bores, and continues through the rear journal to the coupling. No. 2 and No. 3 journals are smooth and constant-radius over their bearing spans; removed the previous unsupported, rotating seal-tooth rings. | The rendered core is continuous for clarity; actual rotor joints, cooling bores, bolt holes, interference fits and stiffness are not recovered. Diameters 467.56 and 396.21 mm are source anchors; installed axial stations are estimates. |
| `bearing-1` | 43:49 inlet mounting; 44:13 elliptical journal plus loaded/unloaded thrust bearings; 44:21 stationary labyrinth teeth against smooth shaft; 45:41 split liner; 46:36 integrated rotating thrust runner; 47:18 active equalizing pads; 49:57 inactive non-equalizing pads | Replaced the incorrect four-pad radial bearing and displaced thrust rings with two elliptical liner halves and separate stationary sector thrust pads. The compressor-owned runner is at X=-5.22 m; journal center remains -4.85 m. Stationary labyrinths run on the smooth shaft outside the thrust and journal zones. Split housing has real through oil-feed, drain and sealing-air ports, with open tubular connections. Narrow horizontal liner-edge grooves communicate with the surrounding oil space. | Eight pads per thrust face are illustrative, not a confirmed population. Equalizing mechanism is representative; internal oil galleries, floating/back-up seals and detailed lower drain-slot shape remain simplified. |
| `bearing-2` | 51:06 location and split housing; 51:41 outer labyrinths; 52:00 brushes; 52:07 vented cavity; 52:27 inner oil-control seals; 52:36 concentric air supply; 53:00 split journal | Replaced four radial pads with a split journal liner. Four separated seal stations distinguish outer air-control and inner oil-control duties. Added open vent annulus around an inner sealing-air tube, oil feed and drain bores, and locating straps to the inner barrel. Smooth 467.56 mm reference journal extends through all seal stations. | Brush bristles are represented by an annular envelope. Axial tube routing, galleries and asymmetric housing detail are incomplete. Enlarged bearing and brush gaps are not service values. |
| `bearing-3` | 54:11 exhaust location; 54:25 tilting-pad journal; 54:36 stationary seals; 55:15 forward deflector; 55:26 retainer and five pads; 55:50 two pins and pivot | Retained the correct population of five, but added closed pad sectors, a retainer, individual pivot/retaining pins and a forward deflector. Housing and retainer have through oil passages; bearing seals are stationary. Locating straps now reach the exhaust inner-barrel bore. | Pivot shapes, pad arcs, tilt/eccentricity, feed distribution and insulation are representative. The viewer does not simulate an oil film or loaded rotor position. |
| `base-frame` | 05:06 forward compressor casing trunnions; 23:17 turbine casing attachment to base | Removed four sets of diagonal rods terminating away from their casings. Two paired column-and-saddle stations now align with the compressor and turbine trunnions at X=-3.83 and 2.00 m. The base is kept clear of the lower combustion zone. | The complete installation base, foundation anchors, sliding/restraint arrangements and thermal movement allowances are not established by the video. The frame remains an inferred educational support. |

## Interface Checks

Geometry vertex measurements on the assembled model, in metres unless stated otherwise:

- No. 1 journal: 400.00 mm reference diameter, 267.00 mm reference length; minimum rendered radial gap approximately 3.000 mm, enlarged to 5.000 mm at the elliptical liner's horizontal axis.
- No. 2 journal: 467.56 mm reference diameter, 398.52 mm reference length; minimum rendered radial gap approximately 3.000 mm.
- No. 3 journal: 396.21 mm reference diameter, 267.72 mm reference length; five pads, minimum rendered radial gap approximately 3.000 mm.
- Stationary labyrinth teeth have approximately 5.000 mm minimum radial shaft clearance. No. 2's representative brush envelopes have approximately 3.000 mm clearance. These intentionally visible gaps are not OEM seal clearances.
- Both thrust pad faces are approximately 4.000 mm clear of the 75 mm wide rotating runner. The runner radius is 0.335 m; housing bore radius is 0.350 m, leaving 15 mm of radial envelope clearance.
- No. 1 housing flange radius is 0.438 m, below the revised 0.465 m inlet front-plate bore. The former inlet-wall/rotating-speed-ring conflict is removed by placing the speed ring ahead of the housing.
- No. 2 and No. 3 central housings stay inside their surrounding barrel bore envelopes. Locating straps intentionally meet those stationary barrel surfaces.
- Compressor and turbine trunnion saddle clearances are 2 mm radially in the inferred base geometry. Saddle contact and fastener attachment are intentional interfaces, not running-part interferences.
- Ray tests along all three housing drain centerlines pass through without intersecting the housing. Control rays 100 mm away intersect the intact wall. These test true openings, not black surface disks.

The controls above are selected mechanical-interface checks, not an exhaustive all-triangle collision certification. Small pipes terminate at the housing boundary; the external lubrication plant is outside the model. Structural strength, oil-film performance, tolerances and thermal deformation are not calculated.

## Runtime

Merging three disjoint housing-port cutters per half and using 32 circumferential segments per half reduced the complete assembly build from about 26 seconds to about 5.5 seconds in the initial local Node benchmark. After shared CSG refinements, a subsequent complete build including the rear retainer bores took about 3.0 seconds. Boolean cuts remain actual mesh bores at the selected tessellation.

## Simplified OpenSCAD Synchronization

The separate `public/pg9171e.scad` model now uses the browser reconstruction's compressor row stations and radial anchors, three bearing stations, smooth continuous turbine core, relocated thrust runner, inlet bearing opening and trunnion-support positions. The formerly solid inlet core was replaced with an annular turning wall. Compressor wheel webs have actual tie-bolt bores. The combustion representation now includes open liners, cap passages, dilution and crossfire holes, hollow crossfire links and individual hollow round-to-sector transition lofts. Turbine wheels and spacers use non-overlapping abutting axial boundaries; source bucket/nozzle populations remain unchanged. The exhaust turning passage remains open around the load shaft.

This remains a separately simplified solid source. It does not duplicate the browser's exact airfoils, liner film slots, wrapper details, nozzle cooling passages, pad pivots, oil galleries or small hardware. Source compilation establishes valid CSG, not dimensional identity with either the browser mesh or the OEM machine.

## Sources

- [User-supplied training video, bearing section](https://www.youtube.com/watch?v=4r1-IMMS73s&t=2612s)
- [BHEL rotor balancing drawings](https://www.bhel.com/sites/default/files/ROTOR%20DRAWING%206934.pdf)
- [Reconstruction source notes](../public/model-notes.md)

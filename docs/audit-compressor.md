# Inlet and Compressor Geometry Audit

Reviewed 2026-10-06. Scope: all 46 selectable inlet/compressor parts in the browser mesh. This is a bounded reconstruction review, not an assertion that the model is indistinguishable from OEM geometry. The source is a rendered training animation, not a dimensioned production model.

## Reference Checks

The supplied [PG9171E training video](https://www.youtube.com/watch?v=4r1-IMMS73s) was opened and inspected visually in the browser during this pass, in addition to reading its transcript. Paused frames were approximately:

- **03:24:** forward stub/wheel, individual blade root/platform, tie-bolt holes, and inter-wheel spacer lands. Added actual wheel-web bores and separate visible blade-platform segments.
- **04:10:** annular IGV row and radial-inlet bellmouth. Removed gross annular seat overlaps and the inlet-plate/forward-bearing conflict.
- **04:30:** vane stems through the inlet casing, external pinions, casing stiffening ribs, and inner support segments. Added actual stem bores, sixteen support segments, and representative external ribs.
- **05:10:** forward split casing with its first four stationary rows and side trunnion. Preserved the four-row ownership and trunnion arrangement.
- **05:42:** aft casing and the circumferential extraction groove at its forward face. Added a recessed annular extraction channel connected to four hollow outlets.
- **08:46:** stator airfoil and carrier segment inserted in the casing groove. Added segment boundaries for rows 1-8 and fitted carrier recesses.
- **09:11:** direct-mounted later stationary rows and the two shrouded exit-guide rows. Added separate later-row mounting bases and connected the EGV inner flow wall to the discharge diffuser.

The narration supplies 17 rotor rows, 17 stationary rows, sixteen tie bolts, 64 IGVs, sixteen IGV inner segments, and two EGV rows. Exact per-row blade populations, carrier-segment populations, axial stations, airfoil sections, support dimensions, and clearances remain inferred. Eight carrier segments per early stator row and eight external inlet ribs are **visual representations**, not source-verified populations.

## Refinement Loops

1. **Assembly envelope:** narrowed and repositioned reconstructed airfoil sections within the existing row stations; eliminated axial-envelope and same-row angular-envelope intersections. Connected the formerly discontinuous drum lands. Coordinated the relocated thrust runner, speed ring, smooth forward journal, and inlet-plate bore with the separate bearing audit.
2. **Open passages:** machined sixteen actual bores in every wheel web, opened six bleed passages through both the casing and pipe walls, and opened all 64 IGV stem paths through both the support ring and split bellmouth. Added annular bleed channels, EGV inner flow wall, and hollow hydraulic/drain tubing.
3. **Source-visible detail:** added individual rotor blade platforms, early stator carrier segments, later stator mounting bases, sixteen IGV inner segments, inlet ribs, and a connected actuator bracket. Rechecked every source-known population and the existing compressor/discharge interface.

## Numerical Checks

`scripts/verify-compressor.mjs` exports `verifyCompressor(model)` and checks the assembled mesh, rather than only authored station parameters. It transforms vertices for every airfoil instance, checks the actual revolved casing profiles (including grooves), and ray-tests new apertures with surviving-wall controls.

| Check | Result |
| --- | --- |
| Minimum axial gap between successive IGV/rotor/stator/EGV airfoil envelopes | 5.511 mm |
| Minimum rotor-airfoil to casing-profile radial gap | 14.371 mm |
| Minimum stationary-airfoil to casing-profile radial gap | 4.077 mm |
| Minimum angular gap between neighboring blades in one row | 0.482 degrees |
| Wheel tie-bolt bores | 272 open; five probes per bore include the bolt envelope |
| Cooling/surge bleed paths | Six open through the full owning casing/duct assembly |
| IGV stem bores | 64 open through the support and both bellmouth halves |
| IGV inner support segments | Sixteen |
| Inter-wheel drum joints | Sixteen consecutive joints match in X and radius |

These gaps are deliberate **visualization clearances**, not OEM running or assembly tolerances. Vertex-envelope checks conservatively establish separation for the modeled airfoil rows; they are not a comprehensive Boolean collision audit of every screw, gear tooth, fillet, seal, bearing, or hot operating state.

## Part-by-Part Register

Every row below was reviewed against its source feature family and the new mechanical checks. Repeated row geometry is parameterized; the video does not provide a unique measured profile for each stage.

| Part ID | Evidence | Result and Remaining Limit |
| --- | --- | --- |
| `compressor-stub-shafts` | 01:38-03:08; visual 03:24 | Smooth extended forward journal; thrust runner and speed ring separated from bearing housing; tie bolts fit real bores; added aft cooling-fan vanes. Fan population and detailed shaft profiles remain estimated. |
| `compressor-rotor-1` | 01:38; 03:22; visual 03:24 | Integral-wheel representation retained; web bores, separate platforms and connected rim; row-envelope checks pass. Airfoil/dovetail profile estimated. |
| `compressor-rotor-2` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-3` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-4` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-5` | 01:38; 03:30; 05:40 | Wheel web bores, platforms, connected spacer lands and clearance below extraction groove. Exact airfoil and count estimated. |
| `compressor-rotor-6` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-7` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-8` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-9` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-10` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-11` | 01:38; 03:30; 05:56 | Wheel web bores, platforms, connected spacer lands and clearance below surge-extraction groove. Exact airfoil and count estimated. |
| `compressor-rotor-12` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-13` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-14` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-15` | 01:38; 03:30 | Wheel web bores, separate platforms and connected spacer lands; row-envelope checks pass. Exact airfoil and count estimated. |
| `compressor-rotor-16` | 01:38; 02:42; 03:30 | Wheel web bores, platforms and connected rim around inner aft-fan region; row-envelope checks pass. Rotor-internal cooling distribution remains schematic. |
| `compressor-rotor-17` | 01:38; 03:38 | Integral aft-wheel representation retained; web bores and platforms; connected rim to aft stub. Detailed fan/shaft blend remains estimated. |
| `compressor-stator-1` | 05:06; 08:40-08:56; visual 08:46 | Separate carrier segments fitted in casing recess; smaller airfoil envelope and free-tip/drum clearance. Segment population/profile estimated. |
| `compressor-stator-2` | 05:06; 08:40-08:56 | Separate carrier segments fitted in casing recess; smaller airfoil envelope and free-tip/drum clearance. Segment population/profile estimated. |
| `compressor-stator-3` | 05:06; 08:40-08:56 | Separate carrier segments fitted in casing recess; smaller airfoil envelope and free-tip/drum clearance. Segment population/profile estimated. |
| `compressor-stator-4` | 05:06; 08:40-08:56 | Separate carrier segments fitted in casing recess; forward-casing ownership retained. Segment population/profile estimated. |
| `compressor-stator-5` | 05:32; 08:40-08:56 | Separate carrier segments fitted in casing recess; aft-casing ownership and bleed-channel separation retained. Segment population/profile estimated. |
| `compressor-stator-6` | 05:32; 08:40-08:56 | Separate carrier segments fitted in casing recess; smaller airfoil envelope and free-tip/drum clearance. Segment population/profile estimated. |
| `compressor-stator-7` | 05:32; 08:40-08:56 | Separate carrier segments fitted in casing recess; smaller airfoil envelope and free-tip/drum clearance. Segment population/profile estimated. |
| `compressor-stator-8` | 05:32; 08:40-08:56 | Last segmented-carrier row retained; fitted casing recess and row separation. Segment population/profile estimated. |
| `compressor-stator-9` | 05:32; 08:59-09:06; visual 09:11 | Individual mounting bases replace continuous carrier; fitted casing groove and row separation. Root locking detail simplified. |
| `compressor-stator-10` | 05:32; 08:59-09:06 | Individual mounting bases in aft casing; fitted groove and row separation. Root locking detail simplified. |
| `compressor-stator-11` | 06:29; 08:59-09:06 | Individual mounting bases in discharge casing; fitted groove and row separation. Root locking detail simplified. |
| `compressor-stator-12` | 06:29; 08:59-09:06 | Individual mounting bases in discharge casing; fitted groove and row separation. Root locking detail simplified. |
| `compressor-stator-13` | 06:29; 08:59-09:06 | Individual mounting bases in discharge casing; fitted groove and row separation. Root locking detail simplified. |
| `compressor-stator-14` | 06:29; 08:59-09:06 | Individual mounting bases in discharge casing; fitted groove and row separation. Root locking detail simplified. |
| `compressor-stator-15` | 06:29; 08:59-09:06 | Individual mounting bases in discharge casing; fitted groove and row separation. Root locking detail simplified. |
| `compressor-stator-16` | 06:29; 08:59-09:06 | Individual mounting bases in discharge casing; fitted groove and row separation. Root locking detail simplified. |
| `compressor-stator-17` | 06:29; 08:59-09:06 | Individual mounting bases; last-row separation from EGV entry corrected. Root locking detail simplified. |
| `compressor-exit-guides` | 09:08; visual 09:11 | Two separate nonintersecting rows, fitted inner/outer bands and continuous inner diffuser wall. Exit interface at X=-0.20 m has radii 0.799/0.95875 m, coordinated with the hot section. Profiles/counts estimated. |
| `compressor-casing-forward-upper` | 05:06; visual 05:10 | Actual tapered flow bore and four carrier seats; closed horizontal/end faces. Bolt threads and local casting fillets remain simplified. |
| `compressor-casing-forward-lower` | 05:06; 05:15; visual 05:10 | Same flow-bore correction; retained lower trunnions and joint flanges. Lifting features are not rated geometry. |
| `compressor-casing-aft-upper` | 05:32-05:49; visual 05:42 | Tapered bore, carrier seats, annular extraction channel and two true through-wall hollow outlets. Casting/port dimensions estimated. |
| `compressor-casing-aft-lower` | 05:32-05:51 | Matching tapered bore, carrier seats, extraction channel and two true through-wall outlets. Casting/port dimensions estimated. |
| `compressor-casing-discharge-upper` | 05:56; 06:29 | Tapered/expanding bore, seven later stator seats, EGV seats and open surge outlet. Downstream shared cylinder is audited with the hot section. |
| `compressor-casing-discharge-lower` | 05:56; 06:29 | Matching internal bore and seats, open surge outlet and closed split faces. Local casting ribs/fasteners remain representative. |
| `inlet-guide-vanes` | 04:04-04:59; visual 04:10/04:30 | 64 nonintersecting blades, 64 actual stem bores and sixteen separate inner segments; housing seat fits bellmouth. Pinion-to-ring tooth conjugacy is not modeled. |
| `igv-actuator` | 04:51; visual 04:30 context | Added physical casing-to-cylinder mounting bracket and two hollow hydraulic tubes. Internal piston, control plumbing and kinematics remain schematic. |
| `inlet-casing-upper` | 04:04; visual 04:10/04:30; 43:49 | Enlarged front bore clears stationary bearing housing; fitted IGV recess and real stem bores; slimmer bearing straps and exterior ribs. Exact strap/rib populations and collector contours remain inferred. |
| `inlet-casing-lower` | 04:04; visual 04:10/04:30; 43:49 | Matching open annular collector, fitted IGV seat and stem bores; slimmer straps and hollow drain. Collector/drain connection detail remains schematic. |

## Remaining Differences

The rendered blade platforms suggest dovetail attachments but do not reproduce measured load-bearing dovetail flank angles, staking, fillets or contact conditions. Airfoil throat distributions, cooling-fan internals, IGV gear conjugacy, threads, full control hydraulics and sub-millimetre fits are not recovered from the video. Adjacent casing mating surfaces and attachment overlaps represent intended joints, not Boolean-fused manufacturing solids. This audit concerns the browser/GLB/STL mesh; the separate simplified OpenSCAD source is not an identical feature model.

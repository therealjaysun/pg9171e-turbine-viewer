# Hot-Section Geometry Audit

This records the R02 baseline. See [the subsequent direct video comparison](video-check-turbine.md) and [combustion comparison](video-check-combustion.md) for R03 corrections and additional visible differences.

Audit date: 2026-10-06. Scope: all 59 selectable combustion, turbine and exhaust parts. Part IDs are unchanged.

## Evidence and Limits

Base source: [PG9171E training video](https://www.youtube.com/watch?v=4r1-IMMS73s). The automatically generated transcript was reviewed for the entire combustion, turbine and exhaust descriptions. Direct video frames were inspected at 13:45 (liner / secondary-air section), 20:40 (transition-piece longitudinal cutaway), 25:18 (hollow first-stage nozzle partitions), and 43:08 (five nested exhaust-turning vanes).

This is a visual reconstruction, not a claim of dimensional equality with OEM CAD. The video establishes architecture, counts, open passages and relative arrangement, but does not establish blade coordinates, exact port diameters, seal gaps, shank plenums, transition loft sections, cooling-hole populations or minimum running clearances. All numerical gaps below are model checks, not service limits. No claim that there are "no differences" is justified by this source.

The three 5.6 mm-diameter spanwise bores in each represented cooled airfoil are illustrative topology. The video establishes longitudinal/spanwise cooling, not this bore count or diameter. These are genuine open CSG passages; the model does not reproduce the OEM airfoil cooling network, impingement plates, trailing-edge drilling or shank feed-plenum machining. Stage 3 remains uncooled. Exact dovetails, honeycomb and cooling microfeatures remain simplified.

## Corrections and Numeric Checks

- The discharge passage now starts exactly at the compressor EGV outlet, X = -0.200 m: outer gas-path radius 0.95875 m, inner gas-path radius 0.799 m, inner barrel bore 0.784 m. This removes the former 20 mm axial gap and 86.25 mm outer-wall step. The aft diffuser lip is limited to radius 1.255 m so it no longer cuts into the combustor flow sleeves.
- Each wrapper half has seven genuine cover openings. Reconstructed cover-opening radius 302 mm exceeds the 287 mm sleeve radius; the front flange inner radius is 2065 mm, outside the can envelope. Holes follow the interpreted 13-degree front face.
- All 14 can frames now use a complete axial/radial/tangential basis. Side ports on every can consequently face the adjacent cans rather than remaining tied to the global Z direction.
- Flow-sleeve bore radius 269 mm versus maximum liner cooling-lip radius 246 mm leaves a 23 mm radial reverse-flow air jacket. End-cover nozzles pass through seven actual cover bores. Fuel feed tubes now have hollow walls rather than solid cross-sections.
- Each liner has three open dilution bores, twelve representative open metering bores, two open crossfire bores and seven cap passages. Cooling-ring lips bridge actual 3 mm axial liner slots, with a 3 mm radial passage below the lip. Rings are omitted around large ports so they do not seal those openings.
- Passage probes exposed the forward Venturi rim covering the aft metering row; its forward attachment now begins at local X = 0.310 m, beyond the row's 0.291 m aft bore edge.
- Each transition inlet is a true 240 mm-radius internal passage around a 237 mm liner body, with a constant-round slip region before the loft begins. The 3 mm body clearance is reconstructed; the spring-seal lip intentionally contacts the inlet. Outlet ends were moved from X = 1.730 m to 1.590 m. Outlet seals remain outside the gas-path annulus.
- Nozzle centers are X = 1.710 / 2.205 / 2.710 m. Airfoil bounding-envelope axial gaps ahead of bucket rows are approximately 29.3 / 30.5 / 30.1 mm. These replace stage-2/3 axial blade-envelope intersections; no claim is made that these are GE running dimensions.
- Stationary bucket-tip shrouds are now distinct from the rotating bucket tip bands. Reconstructed radial tip gaps are 12 / 8 / 8 mm. Actual honeycomb and knife-tooth detailed profiles are not reproduced.
- Stage-2/3 diaphragm teeth now have a 637 mm minimum bore against 629 mm spacer seal lands, leaving an 8 mm radial model gap. The previous teeth extended into the spacer solids.
- Wheel and spacer bodies now have twelve actual 30 mm-radius through-bores around the twelve 27 mm-radius studs, leaving a 3 mm model radial gap.
- The wheel hub ends are flat annular faces at +/-160 mm from each wheel center. Spacers at X = 2.260 / 2.780 m extend +/-100 mm, meeting those wheel faces at 2.160 / 2.360 and 2.680 / 2.880 m. This replaces intersecting tapered wheel/spacer end solids with intentional mating faces.
- The exhaust supply sockets and the matching diffuser-wall holes are genuinely open. The ten aerodynamic fairings contain bores around smaller structural tubes. The outer diffuser turns toward a radial outlet instead of cutting across the aft turning rings. Turning-ring axial stagger is -110 mm per outward ring at 225 mm radial pitch, matching the nested direction seen at 43:08.
- Exhaust flow-path probes exposed two support rings projecting into the gas annulus. Their minimum bores are now 1.560 m at X = 3.450 m and 1.830 m at X = 4.360 m, outside the checked flow paths. Fairing tips extend to radius 1.710 m to meet the outer shell rather than ending in free space.

## Every Selectable Part

Repeated instances were audited individually by ID for population, radial placement, shared revised geometry and special instrumentation. C = revised cover/sleeve/nozzles and correctly oriented crossfire ports; L = revised pierced liner, seven-passage cap and cooling slots; T = revised round-to-sector open transition, slip joint and outlet location. These are identical manufactured families, not 42 unrelated designs.

| Part ID | Video evidence | Audit result / remaining limit |
| --- | --- | --- |
| `combustion-wrapper-upper` | 11:21-11:38 | Fixed: seven cover openings and front-flange clearance; split shell retained. Exact casting contours estimated. |
| `combustion-wrapper-lower` | 11:21-11:38 | Fixed: seven cover openings and front-flange clearance; split shell retained. Exact casting contours estimated. |
| `compressor-discharge-inner-barrel` | 06:29-06:40 | Fixed: continuous EGV entry, clearance from sleeves and first-nozzle support; twelve struts retained. Strut section estimated. |
| `combustor-1` | 11:44-12:14; 16:19; 19:25 | C; primary/secondary detector placement retained. Sensor internals simplified. |
| `combustor-liner-1` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-1` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-2` | 11:44-12:14; 16:19; 19:25 | C; primary/secondary detector placement retained. Sensor internals simplified. |
| `combustor-liner-2` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-2` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-3` | 11:44-12:14; 16:19; 19:25 | C; primary/secondary detector placement retained. Sensor internals simplified. |
| `combustor-liner-3` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-3` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-4` | 11:44-12:14; 16:19 | C; no ignition/detector assembly on this can, consistent with narration. |
| `combustor-liner-4` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-4` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-5` | 11:44-12:14; 16:19 | C; no ignition/detector assembly on this can, consistent with narration. |
| `combustor-liner-5` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-5` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-6` | 11:44-12:14; 16:19 | C; no ignition/detector assembly on this can, consistent with narration. |
| `combustor-liner-6` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-6` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-7` | 11:44-12:14; 16:19 | C; no ignition/detector assembly on this can, consistent with narration. |
| `combustor-liner-7` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-7` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-8` | 11:44-12:14; 16:19 | C; no ignition/detector assembly on this can, consistent with narration. |
| `combustor-liner-8` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-8` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-9` | 11:44-12:14; 16:19 | C; no ignition/detector assembly on this can, consistent with narration. |
| `combustor-liner-9` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-9` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-10` | 11:44-12:14; 16:19 | C; no ignition/detector assembly on this can, consistent with narration. |
| `combustor-liner-10` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-10` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-11` | 11:44-12:14; 16:19; 18:47 | C; spark plug retained on specified can. Ball-joint/igniter internals simplified. |
| `combustor-liner-11` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-11` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-12` | 11:44-12:14; 16:19; 18:47 | C; spark plug retained on specified can. Ball-joint/igniter internals simplified. |
| `combustor-liner-12` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-12` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-13` | 11:44-12:14; 16:19 | C; no ignition/detector assembly on this can, consistent with narration. |
| `combustor-liner-13` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-13` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-14` | 11:44-12:14; 16:19; 19:25 | C; primary/secondary detector placement retained. Sensor internals simplified. |
| `combustor-liner-14` | 12:16-14:53 | L; three dilution holes retained, hole diameters inferred. |
| `transition-14` | 20:14-21:51 | T; bracket retained, cooling vent plate simplified. |
| `combustor-crossfire-manifolds` | 14:58-16:05; 16:37 | Fixed: fourteen open inner flame tubes with open surrounding sleeves, correctly oriented port endpoints and hollow fuel tubing. Main-manifold branch drilling remains simplified. |
| `turbine-wheel-1` | 31:12-32:50 | Fixed: open illustrative spanwise cooling bores, twelve stud holes, stationary-shroud clearance. 92 unshrouded buckets retained; exact shanks/dovetails unresolved. |
| `turbine-nozzle-1` | 24:58-26:44 | Fixed: open illustrative spanwise cooling bores and transition/rotor separation. 18 twin-vane segments retained; OEM cavity and impingement plate unresolved. |
| `turbine-wheel-2` | 33:24-34:58 | Fixed: open illustrative cooling bores, twelve stud holes and shroud clearance. 92 shrouded buckets retained; tip-seal profile simplified. |
| `turbine-nozzle-2` | 27:18-29:21 | Fixed: rotor separation, cooled passages and diaphragm/spacer clearance. 16 triple-vane segments retained; OEM cavity unresolved. |
| `turbine-wheel-3` | 35:22-35:47 | Fixed: twelve stud holes and stationary-shroud clearance. 92 uncooled shrouded buckets retained; dovetail/tooth geometry simplified. |
| `turbine-nozzle-3` | 29:36-30:11 | Fixed: rotor separation and diaphragm/spacer clearance. 16 four-vane uncooled segments retained; exact casting profile estimated. |
| `turbine-spacers-studs` | 30:21; 32:54-33:14; 35:01-35:19 | Fixed: twelve through-bores in each spacer and 8 mm clearance from stationary diaphragm teeth. Two spacers / twelve studs retained; cooling-face slots not fully reconstructed. |
| `turbine-shell-upper` | 22:53-24:55 | Fixed: missing stationary tip-shroud segments added with positive reconstructed running gaps. External cooling ribs retained; actual cooling-passage cross-section unresolved. |
| `turbine-shell-lower` | 22:53-24:55 | Fixed: missing stationary tip-shroud segments added with positive reconstructed running gaps. Trunnions retained; actual cooling-passage cross-section unresolved. |
| `exhaust-frame-struts` | 40:11-42:24 | Fixed: ten bored fairings enclosing smaller structural tubes; four hollow supply sockets. Bearing-3 support cylinder retained; internal distribution ducting estimated. |
| `exhaust-diffuser-upper` | 42:49-43:12 | Fixed: two supply-socket wall bores and outward-turning shell that clears the nested vanes. Split construction retained; exact exhaust-plenum boundary omitted. |
| `exhaust-diffuser-lower` | 42:49-43:12 | Fixed: two supply-socket wall bores and outward-turning shell that clears the nested vanes. Split construction retained; exact exhaust-plenum boundary omitted. |
| `exhaust-turning-vanes` | 43:05-43:12 | Fixed: reverse axial stagger so inner rings terminate farther downstream, not through adjacent ring passages. Five rings and 690 mm-radius coupling tunnel retained; curvature inferred. |

## Verification

The model verifier passes all 110 selectable component IDs and the video-derived counts after these changes. `verify-combustion.mjs` passes 546 actual open-path ray probes plus 42 adjacent-wall probes across all fourteen assemblies, including the entire neighbor-to-neighbor crossfire connection. `verify-exhaust.mjs` passes 244 supply-bore and nested-turn flow-path probes. The root hot-section verifier additionally checks actual cooled-airfoil voids and nozzle/bucket axial bounds. Standalone hot-section generation was measured at approximately one second in Node before the final hollow-pipe additions. The geometry uses repeat caches and instanced airfoils; no animated construction or hidden solid discs are used to imitate the pierced liner ports. These checks are not a universal collision certificate and do not resolve source-invisible OEM detail.

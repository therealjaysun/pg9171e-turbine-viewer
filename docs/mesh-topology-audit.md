# Material-boundary audit

This pass addresses the distinction between missing model walls and the shell-like
appearance caused by uncapped display clipping. It does not convert the viewer to
B-rep CAD, fill working passages, or claim dimensional equivalence to OEM geometry.

## Scope and method

`node scripts/audit-topology.mjs --check` examines every source triangle geometry
referenced by all 110 selectable parts. Repeated mesh instances share the source
geometry audit; instance placement and clearances remain the responsibility of the
existing assembly tests. `--json` includes per-part results and detailed mesh uses;
`--edges` adds coordinates for any remaining defective edges.

The diagnostic weld joins positions within 0.000001 m (one micrometre), including
duplicate vertices at normal/UV seams. This is appropriate to Float32 coordinates
several metres from the model origin and is much smaller than modeled wall
thicknesses and illustrative mechanical gaps. The source geometry is not changed.

For unmatched triangle edges, the audit subdivides the *edge accounting* at
collinear boundary vertices within the same tolerance. This distinguishes a
geometrically closed Boolean surface with a triangulation T-junction from a real
open material boundary. It does not fill gaps, invent faces, or suppress boundary
loops. Both raw and normalized edge counts remain in the JSON report.

The checks include boundary-edge valence, non-manifold edges, inconsistent adjacent
winding, duplicate facets, near-zero-area original triangles (the existing
1e-22 squared-cross-product threshold), and signed mesh volume. A wholly reversed
closed object is detected by negative volume; positive total volume alone is not
proof that every disconnected shell or cavity has correct orientation.

## Repairs

| Component | Observed defect | Repair |
| --- | --- | --- |
| Inlet bellmouth halves | Reversed revolved input profile confused subsequent Boolean port subtraction. Each half had 6,032 boundary edges and 220 winding disagreements. | Corrected profile orientation before constructing the ported shell. |
| Combustor flow sleeves and liners | Rolled extrusions retained their two coincident, internal seam walls. | Removed only the developed-coordinate seam faces before rolling. Drilled hole walls and open-bore end annuli remain. |
| Transition aft seal rims | Reversed revolved profiles caused 16 winding disagreements per merged transition geometry. | Corrected both rim profiles. The open transition flow passage remains. |
| Two fuel-manifold loops | A closed curve was constructed as an open tube with coincident annular end walls. | Use a periodic curve/frame and join both material skins continuously, with no artificial terminal lips. Open-ended pipes still retain their real annular lips. |
| Exhaust diffuser halves | The sectional profile crossed itself through the aft turning region. | Corrected the finite-thickness turn contours while preserving the inlet and maximum envelope. |
| Exhaust turning vanes | Closed but inside-out material boundaries, with negative signed volume. | Corrected the revolved profile orientation. |
| Cooled nozzle stages 1 and 2 | Existing Boolean edge collapse retained opposite duplicate facets and a four-triangle, near-zero-thickness fin. | Cancel opposed coincident facets. Bound the numerical edge cleanup to sub-20-micrometre edges in stage 1; retain the prior 10-micrometre threshold in stage 2, since applying the larger threshold there creates Float32-mm export slivers. Neither cavity nor trailing-port openings is filled. |

The nozzle cleanup changes representative vane material volume by approximately
0.0002% for stage 1 relative to the previous result. Stage 2 retains its prior
oriented volume after opposed-facet removal. This is numerical mesh stabilization,
not a claim about real nozzle cooling geometry. The existing cooling-path probes
remain separate regression checks.

## Rotor-cooling refinement

The subsequent research-based geometry pass was checked independently with the
same topology criteria, without loosening tolerances or filling working voids:

- The former continuous filled turbine core is replaced by separate forward and
  aft wheel shafts. The forward shaft has a finite-wall axial bore; the aft hub
  has an inferred blind pocket and explicit floor before the solid rear journal.
  Integral mating flanges retain twelve real through-stud bores each.
- The three wheels and two spacers retain an open central bore. Six inferred
  radial feeds in each of the first two wheels reach pierced, circumferential root
  collectors. These are simplified common galleries, not recovered individual
  OEM bucket plenums.
- The first and second bucket rows use replacement-reference 11/6-hole counts,
  with inferred hole sizes and routes. Matching passages continue through the
  root bands and second-stage shroud/seal bands. Stage 3 remains uncooled.
- Eighteen inferred spacer-face grooves connect their sampled entrances and
  exits to the modeled voids. These are on both faces of the first spacer and the
  forward face of the second spacer.

The compressor-side supply connection is not recovered. A clear modeled partial
path is not verification of the turbine's complete cooling circuit, real pressure
distribution, or manufacturing geometry.

## Result

- 110 selectable parts covered; 826 of 826 unique geometry objects pass.
- 2,566,514 source triangles examined before instance expansion.
- Zero normalized open edges, non-manifold edges, or winding disagreements.
- Zero duplicate facets or original triangles below the area threshold.
- Every geometry has positive total signed volume.
- 22 edge subdivisions reconcile Boolean triangulation T-junctions.
- 34 original triangles collapse only under the diagnostic one-micrometre weld:
  16 in each bellmouth and two in the first-stage outer nozzle platform. These are
  reported rather than presented as literal zero-area source facets.

`node scripts/verify-topology.mjs` tests a closed box with duplicated normal-seam
vertices, a deliberately missing wall, reversed whole-mesh and single-facet
winding, duplicate facets, a synthetic T-junction, a split casing, open and periodic
hollow tubes, preserved open lumens, and both cooled nozzle boundaries. Every facet
of all 84 nozzle instances is also tested after actual station/angle transforms and
Float32 millimetre conversion, using the strict STL export area threshold.

`verifyAssembledMaterialVoids(model)`, called by the model verification, additionally
checks the actual union of all 7,826 mesh instances. It does not trust the existence
of a channel label as evidence of a void. Bounds select candidate material bodies;
signed ray intersections then test their material winding individually, preserving
the meaning of overlapping material bodies and hollow internal skins.

This independent assembled check passes 12,001 void samples and 86 solid controls.
It covers the shaft/stack core, the aft-pocket floor, every cooled bucket's
collector/root and tip/shroud/seal interfaces, all radial wheel feeds and all
spacer-face grooves. The representative full interior blade paths and their
neighboring material walls are included. First-stage probes reach the tip gap;
second-stage probes extend beyond the pierced seal at span fraction 1.09 while
remaining below the stationary shroud. A further 1,640,224 transformed rotor,
spacer and shaft facets pass the same Float32-mm area threshold as binary STL
export, in addition to the independent nozzle fixtures.

## Limits

This is a tolerance-qualified **mesh-boundary** result. It is not a complete
self-intersection test, an exhaustive test of collisions between components, a
Boolean union of the assembly, or an exact indexed-manifold export guarantee.
The assembled probes are sampled checks of known routes, not an exhaustive
collision or computational-fluid-dynamics test.
The T-junction normalization exists in the audit, not as a remeshing operation on
the export. Casings, liners, cooling passages and ducts intentionally retain their
voids. The independent simplified OpenSCAD model is unchanged by these browser
mesh repairs.

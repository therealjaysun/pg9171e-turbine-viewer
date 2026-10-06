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

## Result

- 110 selectable parts covered; 823 of 823 unique geometry objects pass.
- 2,551,244 source triangles examined before instance expansion.
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

## Limits

This is a tolerance-qualified **mesh-boundary** result. It is not a complete
self-intersection test, an exhaustive test of collisions between components, a
Boolean union of the assembly, or an exact indexed-manifold export guarantee.
The T-junction normalization exists in the audit, not as a remeshing operation on
the export. Casings, liners, cooling passages and ducts intentionally retain their
voids. The independent simplified OpenSCAD model is unchanged by these browser
mesh repairs.

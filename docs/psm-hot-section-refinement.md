# R06: PSM photo-informed hot-section detail

Reviewed 2026-10-07 against the [Hanwha Power / PSM 9E page](https://www.psm.com/products/b-e-class-frames/9e), the model source and the earlier [direct video comparison](video-check-turbine.md).

## Evidence and scope

The bucket photograph exposes the platform, shank and multi-tang attachment. The nozzle photographs expose platform edges, stepped mounting features and the inner support assembly. These details help refine the existing three-stage reconstruction, but the page covers multiple replacement configurations. The photographs do not establish the exact hardware of the video unit.

Some image alt labels are mismatched: the image labeled as a first-stage nozzle displays combustion piping, and later labels are shifted. Identification here uses visible hardware and the image filenames, not the alt label alone. Photographs were inspected on the page; source images are not copied into this repository.

## Geometry changes

- All three bucket rows now have individually repeated platforms with visible seams and forward/aft attachment end faces. Narrow shanks and a representative three-tang outline replace the plain external band silhouette at the attachment ends.
- The cooled rows retain their shared internal collector below the new platforms. New platform surfaces are pierced with the same cooling cutters as the existing buckets, including neighboring passage intersections.
- First- and second-stage nozzle outer platforms have integral stepped mounting rails. The first-stage impingement covers fit between the rails; their existing feed holes remain open.
- All three nozzle inner-platform rings are segmented at their existing segment population, with recessed undersides and seal lands. The third-stage segmentation follows the video's four-vane architecture; its exact shape is an inference, not established by the PSM first-/second-stage pictures.

Geometry remains instanced and belongs to the existing 110 selectable parts. No LEC combustion conversion, advanced-aero airfoil substitution, scalloped tip-shroud upgrade or casing redesign is included. The separate simplified OpenSCAD file is unchanged.

## Explicit approximations

The attachment faces extend only at the two axial ends; they do not reproduce a complete full-depth dovetail and mating wheel socket. The existing internal annular support/collector remains simplified. The three-tang population, platform gaps, shank widths, rail sizes and all fits are modeling choices. New mounting rails are visible support features, not a recovered casing-interface design. The stage-2 diaphragm cooling network remains incomplete. These are visualization meshes, not fabrication geometry.

The part guides and exported group descriptions continue to identify reconstructed geometry. PSM is linked in the affected Design guides; no photograph-derived dimension is presented as an OEM measurement.

## Verification

- `npm run verify`: existing assembled cooling/void checks plus 50 new actual-material probes for attachment tangs and reliefs, shanks, platform seams, mounting-rail undercuts and cover fit.
- `npm run verify:topology`: all 837 unique mesh geometries have closed, consistently wound boundaries at the existing 1 μm diagnostic tolerance. Zero raw degenerate or duplicate triangles. The existing 32 tolerance-collapsed bellmouth triangles remain reported separately.
- `node scripts/export-model.mjs`: 110 groups, 8,703 mesh instances and 5,954,683 triangles; GLB round-trip scale/bounds and STL facet checks pass. GLB 73.69 MB; STL 297.73 MB; zero degenerate STL faces.
- `/tests/hot-hardware.html`: interactive isolated samples use the actual assembly geometry for one stage-2 bucket and first-/second-stage nozzle segments. This is a local inspection fixture, not a production route. It deliberately shows the simplified open-sided collector and attachment end construction.
- Browser regressions: 347 cooling-section assertions (desktop/mobile, shaded/CAD) and 89 section-cap assertions pass. The viewer's isolated wheel and the three hardware samples were inspected visually; the comparison image is saved in `exports/psm-hot-section-detail.png`.
- `npm run build` passes with Vite's existing large-bundle advisory.

The audit checks individual material boundaries and selected assembled passages, not every intersection or an engineering fit.

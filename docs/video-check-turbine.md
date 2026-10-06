# Direct Video Check: Turbine and Exhaust

Date: 2026-10-06. Source: [Oil Gas World reference video](https://www.youtube.com/watch?v=4r1-IMMS73s).

This is a fresh browser-frame inspection, not a claim that earlier notes or the
transcript prove a visual match. The times below were displayed by the paused
YouTube player. No source media was downloaded. The source itself is a training
animation, not dimensioned OEM manufacturing CAD.

## Frames Inspected

| Displayed time | Direct visual observation | Comparison and action |
| --- | --- | --- |
| 22:07 | Separate stationary nozzle and rotating bucket rings are shown. | The model preserves separate rows. Counts are corroborated by narration, not counted from this frame. |
| 25:14, 25:19 | A first-stage nozzle segment has two airfoils, inner/outer curved platforms, mounting features and a trailing-edge line of small holes. | The twin-vane segmentation is represented. Exact mounting hooks and rails remain simplified. The statement that the partitions are hollow is narrated; these views do not expose the complete internal cavity. |
| 25:24 | The outer platform has a broad perforated impingement plate; arrows leave the airfoil trailing edge. | Replaced the former three longitudinal nozzle bores with hollow partitions and real trailing-edge exits. Added pierced outer platforms and perforated first-stage cover plates. The cover hole pattern is representative, not copied hole-for-hole. |
| 28:55 | A second-stage segment has three airfoils. Three large airfoil-shaped entries are visible on its outer platform. The diaphragm below the inner platform has three circular cooling outlets. | Added airfoil-shaped outer entries and hollow partitions. The diaphragm outlet tubes and their internal distribution manifold are not yet reproduced. |
| 31:56, 32:01 | First-stage bucket assembly has tall shanks, platforms, multiple-tang axial roots and a recessed-looking tip. | Model bucket roots, shanks and tip recess remain substantially simplified. Longitudinal cooling passages and their exit at the recessed tip are explained by narration; an exact internal hole count is not visible. R05 uses eleven/six passage populations from a compatible replacement reference, with inferred diameters and a common root collector, not exact video/OEM internals. |
| 33:14 | First wheel spacer shows radial face cooling slots between the stud holes, with circumferential seal lands on its rim. | R05 adds radial face grooves on both first-spacer faces and the second-spacer forward face. The groove population, width, depth and detailed route are illustrative. |
| 34:25 | Second-stage bucket ring has tall shanks and interlocking tip-shroud features. | Model has tip shrouds but simplifies shanks, interlocks and twist locks. Spanwise cooling flow is narrated; the exact internal drill pattern is not established from this frame. |
| 40:16 | Exhaust structure shows ten broad radial structural struts, an outer cylinder and a bearing-supporting inner cylinder. | Count and general arrangement agree. Model structural members within the fairings are much simpler and thinner. |
| 42:04 | Section view visibly separates the thick structural outer wall from the inner diffuser skin, leaving a cooling annulus; fairing passages connect toward the inner cylinder. | The model's exhaust shell and fairing cooling representation remain simplified. A complete separate structural-cylinder/diffuser-skin cooling annulus is not reproduced. |
| 43:08 | Five nested curved turning vanes turn from the axial channel toward a radial outlet. | Model has the same qualitative nested turning-ring arrangement. Exact curvature, thickness and supports remain inferred. |

## Corrections in This Pass

- First- and second-stage nozzle vanes no longer reuse bucket-style spanwise bores.
- Their internal voids follow a broad cambered airfoil cavity and communicate with
  eleven real trailing-edge ports per vane. Eleven, the port diameter, the cavity
  contour and wall thickness are modeling choices, not source measurements.
- Segmented outer platforms have airfoil-shaped openings into the cavities.
  First-stage platforms carry perforated covers; second-stage entries remain open
  as in the inspected frame.
- The first-stage cover uses four feed holes per airfoil, eight per twin-vane
  segment. The source plate visibly has a denser pattern. This reduced pattern
  is an explicit visualization simplification, not an OEM count.
- Outer platform extents and stationary bucket-shroud leading support positions
  were separated to prevent new overlap at the nozzle/shroud interface.
- Third-stage nozzle and bucket rows remain uncooled.

## Verification

`scripts/verify-hot-section.mjs` checks the actual mesh voids, not only metadata:
bucket bore centers and retained walls; nozzle cavity centers and retained walls;
trailing-edge port paths; platform openings; cover perforations; and 25 samples
along each first-/second-stage cover/platform/airfoil feed route.

The bounded hot-section check passes 422 actual void/wall samples, including 275
assembled feed-route samples. The minimum nozzle-to-bucket airfoil axial gap is
29.31 mm in this illustrative model. These are model checks, not OEM clearance
specifications or proof of manufacturing validity.

The first-stage ring was also inspected directly in the local viewer in assembled
and close orbital views. The full ring renders; segmentation and cover surfaces
are present. Tiny ports are clearest at close inspection. The complete rendering
still does not match every source silhouette or construction detail.

## Residual Limits

There are visible, documented differences. In particular, nozzle support hooks,
stage-two diaphragm plumbing, spacer cooling slots, bucket roots/shanks,
stage-two/three tip interlocks and the exhaust double-wall cooling arrangement
remain simplified or incomplete. No claim of "no differences" is justified.

Detailed internal cavity contours are not visible in the inspected video frames.
The new cavities encode the supported flow topology while retaining an explicit
inferred-geometry limitation. Exact replication requires dimensioned drawings or
an authorized OEM model.

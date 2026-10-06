# Fresh video check: inlet and compressor

Date: 2026-10-06. This is a new visual inspection of the supplied YouTube
player, not a restatement of the R02 audit or a transcript-only check.

Source: [Oil Gas World reference video](https://www.youtube.com/watch?v=4r1-IMMS73s).
Frames were paused and inspected in the browser. The times below were visible
in the player. No reference video or frames are distributed with this project.

## Observations and corrections

| Observed time | What the image establishes | Comparison and action | Confidence |
| --- | --- | --- | --- |
| [1:44](https://www.youtube.com/watch?v=4r1-IMMS73s&t=104s) | Exploded compressor wheels, forward and aft stub shafts, and through-bolts. | Existing overall architecture is consistent. The image is not a dimensioned wheel drawing. No dimensional change justified. | High for architecture; low for dimensions. |
| [3:24](https://www.youtube.com/watch?v=4r1-IMMS73s&t=204s) | A detached rotor blade has a distinct platform and a narrower neck/flared dovetail below it; the neighboring wheel shows bolt holes. | R02 platform sectors were simple rectangular sections. Added stepped platform/neck/dovetail profiles to all 17 rotor rows and corresponding non-intersecting undercut wheel-rim seats. | High for missing shape; profile dimensions inferred. |
| [4:09](https://www.youtube.com/watch?v=4r1-IMMS73s&t=249s) | Radial inlet collector, curved turning surfaces, annular IGV row and central bearing opening. | Existing radial-inlet arrangement is consistent at the architecture level. Curvature, wall thickness, casting ribs and fastener details are not established exactly. | Medium for broad silhouette. |
| [4:39](https://www.youtube.com/watch?v=4r1-IMMS73s&t=279s) | Fine-toothed pinions on the radial vane stems engage a toothed annular control member; stepped circular stem caps are visible. | R02 had seven coarse box teeth per pinion, smooth control rings and no stepped caps. Replaced these with 32-tooth profiled, bored pinions, a fine-tooth annular rack and stepped bored caps. Repositioned the rack axially so it no longer passes through pinion bodies. | High for the mismatch. Rendered 32/768 tooth populations are inferred, not counted from the video. |
| [5:09](https://www.youtube.com/watch?v=4r1-IMMS73s&t=309s) | Lower forward casing with four vane rows, horizontal split faces and an external circular support feature. | Four-row section and split construction retained. Detailed casting shape and exact fastener locations remain simplified. | High for arrangement; medium for silhouette. |
| [5:39](https://www.youtube.com/watch?v=4r1-IMMS73s&t=339s) | Aft casing with multiple vane rows and substantial external ribs/recesses. | The six-row aft section is retained. Current generic ribs do not reproduce every visible casting recess. No unsupported dimensions were inferred from this perspective image. | Medium. |
| [5:59](https://www.youtube.com/watch?v=4r1-IMMS73s&t=359s) | End-on casing view shows a circumferential extraction recess around the upstream edge. | Existing circumferential bleed recess and open ducts retained. Exact port angles and groove dimensions remain estimates. | Medium. |
| [6:19](https://www.youtube.com/watch?v=4r1-IMMS73s&t=379s) and [8:39](https://www.youtube.com/watch?v=4r1-IMMS73s&t=519s) | Discharge structure has a substantial outer barrel, inner cylinder and connecting structural members; the aft inner cylinder has an annular interface. | Broad architecture is present across the compressor and hot-section modules. These frames do not establish every hidden passage or casting contour. | Medium. |
| [8:54](https://www.youtube.com/watch?v=4r1-IMMS73s&t=534s) | An early stator carrier segment with several vanes is shown removed from its casing seat. | Existing first-eight-stage carrier segments retained. Segment population and detailed attachment profiles remain approximations. | High for carrier concept. |
| [9:04](https://www.youtube.com/watch?v=4r1-IMMS73s&t=544s) | A late-stage stator blade is lifted from an individual square-based root. | R02 still used simple annular sectors for these roots. Replaced the final nine rows with individual flat-sided square-base/dovetail sections, within the existing casing pockets. | High for mismatch; cross-section dimensions inferred. |
| [9:19](https://www.youtube.com/watch?v=4r1-IMMS73s&t=559s) | The discharge end contains downstream guide rows before the diffuser passage. | Existing two EGV rows and downstream inner diffuser retained. Airfoil shapes and annular dimensions are not established exactly. | Medium. |

## Verification of the bounded changes

- Original stage stations, 17 rotor/stator pairs, 64 IGVs, two EGV rows and
  established gas-path clearances remain unchanged.
- Root-profile samples are tested against their wheel-rim seats to detect
  attachment interference. Late-stator root vertices are checked against the
  actual casing-recess profile.
- Triangle-level BVH intersection checks cover a pinion and its neighboring
  rack teeth. Circumferential repetition gives all 64 pinions the same relation.
- Existing axial-row, rotor/casing, tie-bolt bore, bleed-duct and IGV-stem-bore
  checks remain required.
- A local browser comparison of the isolated revised IGV assembly showed the
  smaller profiled gears and stepped stem caps. This checks the correction is
  rendered, not that its inferred tooth counts equal the source.

## Remaining limitations

This inspection found genuine residual differences after R02. It does not
support a claim of "no differences" or exact OEM CAD. Blade aerofoils, individual
root dimensions, gear tooth counts/law, casting contours, wall thickness,
fastener patterns, seal details and operating clearances are still reconstructed.
The displayed running and attachment clearances are illustrative, not service
limits. The annular rack/pinion arrangement is a static visual reconstruction,
not a kinematically certified gear set. The OpenSCAD simplification does not
contain these mesh-level root/gear details.

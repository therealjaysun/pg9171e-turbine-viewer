# Directional exploded-view plan and implementation

The viewer previously added arbitrary diagonal offsets to several axial rows and
split housings. Material merging also collapsed can hardware and exhaust rings,
preventing those assemblies from opening internally.

The implementation separates two inspection operations while retaining all 110
selectable parts and the assembled R06 mesh surfaces:

| Assembly | Assembly separation | Subassembly separation |
| --- | --- | --- |
| Compressor and turbine rows | Along shaft X, preserving row order | EGV rows separate axially; bucket packs withdraw axially from wheels |
| Split inlet, compressor, combustion and exhaust casings | Upper/lower halves move radially along ±Y | Fixed hardware remains with its casing |
| Fourteen combustor families | Can, liner and transition share the same outward YZ translation | Fuel nozzle pack, end cover and liner withdraw along the 13° can axis; transition separates aft along that axis |
| Turbine nozzles | Whole rows separate axially | Each 2/3/4-vane segment fans outward radially, taking platforms and covers with it; diaphragms and labyrinth rings separate axially |
| Shafts, spacers and tie bolts | Forward/aft sections and spacers follow the axial stack | Shaft sections, tie bolts and through-studs separate axially |
| Bearings | Along X with their journal stations | Split housing/liners and tilting pads move radially; seal, thrust and retainer packets move axially |
| Exhaust turning vanes | Ring assembly moves aft along X | Five nested rings separate further along X |

The two sliders are independent. Use Assembly first for the whole-machine
inspection, then Subassemblies; Focus and Isolate make the internal view easier
to read. An isolated assembly can use the internal slider with Assembly at zero.
Changing either slider preserves the current camera focus. Assembled and Section
views reset both motion layers, while remembering the slider settings.

Motion groups carry parent-coordinate translations. Can-local translations are
transformed by their canted frame. The mesh merger respects those groups;
instanced nozzle rows share a segment-center displacement with the matching
platforms. The controller always derives transforms from captured rest matrices.
It refreshes instance bounds for selection and camera fitting. CAD edge buffers
follow the instance matrices, and labels follow actual component offsets.

Both browser and command-line mesh exports use a shared portable-assembly builder.
Complete/assembled exports read the original child/instance transforms and rotor
phase without moving the live scene. Current-state exports retain separation,
rotation and part visibility. The separate simplified OpenSCAD model is unchanged.

These offsets illustrate component relationships. They do not claim collision-free
extraction paths, tooling access or a validated maintenance sequence. Merged
continuous collectors, cooling channels and integral cast features remain together;
individual buckets are displayed as an axial pack rather than inventing radial
extraction for their axial-entry roots. Source dimensions and fidelity limits
remain those of the reconstruction.

## Verification

`npm run verify` checks pure axial/radial primary directions, shared combustor
translations, canted cover/nozzle withdrawal, coherent nozzle segments, axial
bucket packs, complete/current exports and 20 drift-free restoration cycles.
Existing geometry, cooling passages, clearances and cavity probes also run.
`npm run verify:topology` audits material boundaries; `node scripts/export-model.mjs`
round-trips the assembled GLB and validates STL facets. The local
`/tests/exploded-assemblies.html` fixture shows four actual nested assemblies.

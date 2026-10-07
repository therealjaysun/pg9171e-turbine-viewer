# Supply-chain research and scoring method

Research date: **2026-10-06**. Scope: the legacy three-stage PG9171E / Frame 9E reconstruction's 110 selectable groups, not a procurement bill of materials. Three parallel research streams cover [inlet/compressor](supply-chain-compressor.md), [combustion/turbine](supply-chain-hot-section.md), and [mechanics/exhaust/supports](supply-chain-mechanics.md). Repeated identical chambers, casing halves and rows share family evidence. Stage-specific differences are retained where sources support them.

## What the numbers mean

All four 1–5 ratings are **analyst assessments**, not ratings published by GE, measured failure probabilities, quotations, or plant financial forecasts. They support a first sourcing discussion; there is no installed-unit part-number register, purchasing history, vendor qualification list, stock policy, outage cost or annual demand dataset here.

| Rating | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| Relative replacement cost | Low content | Modest specialized content | Substantial fabrication / machining | Large or precision component / set | Major rotor / hot-section assembly |
| Operational criticality | Negligible operational effect | Limited, manageable consequence | Material performance / outage consequence | Significant outage or secondary-damage potential | Rotor integrity, support or containment consequence |
| Supply risk | Readily substitutable | Several qualified routes assumed | Specialist qualification / configuration constraint | Few feasible, heavily engineered routes | Major proprietary / rotor integration constraint |
| Profit / business impact | Small procurement exposure | Limited procurement exposure | Material procurement / availability exposure | Major capital / recurring outage exposure | Major rotor / plant availability exposure |

Cost considers replacing the **named selectable group** (for example a wheel plus 92 buckets, not one bucket). It excludes installation, freight, duties and lost generation; those costs require a project-specific quotation. The ordinal scale is not linear and cannot be added, averaged into dollars or treated as a parts budget. Some meshes overlap procurement boundaries, notably compressor end wheels and stub shafts. Upper/lower visual halves do not imply two separately sold articles.

Price research prioritizes actual OEM/supplier offers and utility procurement documents. Unpriced RFQs establish requirements, not prices. Historical bundled repair budgets, labor-only subcontract values, auction/surplus stock, coatings, modern four-stage upgrades and complete power-plant cost estimates cannot establish a new replacement price for a modeled group. The UI therefore states **Quote required** wherever no comparable price was verified, and explains the evidence at the part level. Historical contextual figures, if present in a research ledger, are not inputs to the heat map.

## Kraljic sourcing grid

The horizontal axis is **supply risk**, increasing rightwards; the vertical axis is **profit / business impact**, increasing upwards. The latter is a provisional procurement-and-availability proxy, with a rationale per family. It is separate from both the cost heat map and operational criticality. Scores 1–2 are low; 3–5 are high. This cutoff is an application convention, not an OEM threshold. Empty quadrants are allowed.

| Quadrant | Impact | Risk | Typical sourcing approach |
| --- | --- | --- | --- |
| Leverage | High | Low | Compete qualified offers and consolidate demand |
| Strategic | High | High | Develop partnerships and plan continuity |
| Non-critical (routine) | Low | Low | Simplify buying and standardize |
| Bottleneck | Low | High | Secure availability and qualify alternatives |

These categories follow the [CIPS explanation of the Kraljic matrix](https://www.cips.org/intelligence-hub/supplier-relationship-management/kraljic-matrix), adapted from Peter Kraljic's 1983 framework. A quadrant's procurement label does not establish the consequence of component failure. In particular, a low-cost fuel-distribution or actuation item can merit a bottleneck strategy while remaining operationally important.

The expanded grid groups dots by quadrant. Position **within** a quadrant carries no additional quantitative meaning, avoiding artificial precision and overlapping identical family scores. Every dot has its own part identifier and navigation action; repeated components are never combined into an unselectable cluster.

## Expensive, low-criticality screen

The screen uses **cost ≥4 and operational criticality ≤2**. It evaluates all researched selectable groups, independent of the Kraljic quadrant. The research does not justify calling any currently modeled group a low-criticality, high-cost item. This is a provisional screening result, not proof that a plant has no savings opportunities. Commodity consumables and much balance-of-plant hardware are outside the model. Repair-versus-replace quotations, qualified alternate suppliers and shared spares are more defensible next investigations than removing modeled hardware.

## Evidence discipline

Per-family notes describe what each source establishes and its applicability. Supplier capability claims identify candidates for qualification, not approved interchangeable vendors or guaranteed stock. Technical references justify engineering scope and manufacturing burden; translating those facts into scores is explicitly our inference. Unit configuration, service condition, metallurgy, drawings, delivery windows, remaining life and warranty need confirmation before procurement. No new delivery-time or savings claims are inferred from marketing language.

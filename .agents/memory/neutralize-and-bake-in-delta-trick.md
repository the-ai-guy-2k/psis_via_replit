---
name: Neutralize-and-bake-in delta trick
description: How to add a new subtractive/additive factor to an aggregate that's computed as sum(per-item value) without touching the aggregation code.
---

When an aggregate is computed as a simple `sum()` over per-item fields (e.g. `inningDelta = sum(entry.delta)`), and a new factor needs to affect that aggregate (e.g. runs scored should subtract from the inning delta) without double-counting against an existing categorical tally (e.g. good/bad counts), fold the new factor directly into the per-item field for just the items it applies to, and zero out the fields that would otherwise conflict.

**Why:** Keeping the aggregation function (`sum(delta)`) untouched avoids introducing a second code path / special case at the read layer, and keeps the "derive everything from raw entries" architecture intact — there's only one source of truth (the per-entry `delta`) instead of an aggregate formula plus per-entry categorical counts that both need to be interpreted together correctly.

**How to apply:** When a new outcome type needs to affect an aggregate delta/score without being "good" or "bad" in the usual categorical sense, set that outcome's own good/bad-style counts to 0 and bake the full effect into its own `delta` field (e.g. `delta = -runsScored`). Verify against a couple of worked examples by hand (e.g. Good=5,Bad=2,Runs=1 → aggregate should be +2) before trusting the sum-based formula.

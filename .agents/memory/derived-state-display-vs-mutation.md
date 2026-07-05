---
name: Derived-state display vs mutation split
description: Read-only state derivation must not auto-advance; separate "what's current for display" from "what happens on write" when state is computed from an append-only log.
---

When application state (e.g. "current inning", "current step", "current period") is derived on read from an append-only log rather than persisted, it's tempting to write one function that both computes the current state and auto-advances past a completed period. This is wrong.

**Why:** A GET/display endpoint that auto-advances hides the terminal state of the just-finished period the instant it's reached — e.g. a "3 outs, inning complete" summary that should be shown to the user disappears immediately because the same read also decided "outs are maxed, so show inning N+1 (0 outs) instead." The bug is subtle because the derived value is still "correct" in some sense (next inning does start at 0), it's just correct for the wrong moment (write-time, not read-time).

**How to apply:** Split into two functions:
1. A pure display/read function that reports the latest period's state as-is, including a `completed`/`done` flag when its terminal condition is met.
2. A resolve-for-write function, called only when creating a new record, that checks whether the latest period is already `completed` and advances to the next period number only in that codepath.

Never let a GET-style read trigger the advance; only writes should advance.

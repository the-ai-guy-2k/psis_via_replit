---
name: Session-boundary reset pattern
description: How to implement a "reset the live view but keep history" feature without deleting or mutating stored records.
---

When a feature needs to "reset" a UI's live/current-session view (e.g. a "New Game" or "Start Over" button) while a separate aggregate/history view must keep showing everything ever recorded, don't delete or mutate stored rows to achieve the reset.

Instead, introduce a lightweight boundary id (e.g. `gameId`, `sessionId`) that is:
- persisted separately from the records themselves (its own small state file/table, not a column migration on old rows),
- bumped by the "reset" action,
- treated as optional on existing/legacy records, with a default value (e.g. `1`) so pre-existing data keeps behaving as "the current session" until the first reset,
- used as a filter predicate in every "current state" computation (current inning, current game, etc.), while the separate season/aggregate view intentionally ignores it and reads everything.

**Why:** deleting or in-place-mutating rows to "reset" a view destroys data needed by an aggregate/history view that must never reset (e.g. season-to-date dashboards), and retrofitting a required field onto historical rows breaks backward compatibility. A boundary id sidesteps both problems with one small, additive concept.

**How to apply:** any time a request says "reset X but don't lose the data" or "start fresh without affecting the season/history/dashboard," reach for this pattern before considering a destructive reset or a schema migration.
